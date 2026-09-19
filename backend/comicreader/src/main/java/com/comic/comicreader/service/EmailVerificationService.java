package com.comic.comicreader.service;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.comic.comicreader.model.EmailVerificationCode;
import com.comic.comicreader.model.User;
import com.comic.comicreader.repository.EmailVerificationCodeRepository;
import com.comic.comicreader.repository.UserRepository;

@Service
public class EmailVerificationService {

    private final EmailVerificationCodeRepository verificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final BCryptPasswordEncoder passwordEncoder;

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.otp.expiry-minutes:10}")
    private long expiryMinutes;

    @Value("${app.otp.resend-seconds:60}")
    private long resendSeconds;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.otp.pepper}")
    private String otpPepper;

    public EmailVerificationService(
            EmailVerificationCodeRepository verificationRepository,
            UserRepository userRepository,
            EmailService emailService) {

        this.verificationRepository = verificationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public void startRegistration(
            String email,
            String password) {

        email = normalizeEmail(email);

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already registered");
        }

        LocalDateTime now = LocalDateTime.now();

        EmailVerificationCode existing =
                verificationRepository.findByEmail(email).orElse(null);

        if (existing != null &&
                existing.getLastSentAt() != null &&
                existing.getLastSentAt()
                        .plusSeconds(resendSeconds)
                        .isAfter(now)) {

            throw new RuntimeException(
                    "Please wait before requesting another OTP"
            );
        }

        String otp = generateOtp();

        EmailVerificationCode verification =
                existing != null
                        ? existing
                        : new EmailVerificationCode();

        verification.setEmail(email);
        verification.setPasswordHash(passwordEncoder.encode(password));
        verification.setOtpHash(hashOtp(otp));
        verification.setExpiresAt(
                now.plusMinutes(expiryMinutes)
        );
        verification.setAttempts(0);
        verification.setLastSentAt(now);

        if (verification.getCreatedAt() == null) {
            verification.setCreatedAt(now);
        }

        verificationRepository.save(verification);

        emailService.sendVerificationOtp(email, otp);
    }

    public User verifyRegistration(
            String email,
            String otp) {

        email = normalizeEmail(email);

        EmailVerificationCode verification =
                verificationRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "OTP not found. Please request a new OTP."
                                ));

        if (verification.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            verificationRepository.delete(verification);

            throw new RuntimeException(
                    "OTP has expired. Please request a new OTP."
            );
        }

        if (verification.getAttempts() >= maxAttempts) {

            verificationRepository.delete(verification);

            throw new RuntimeException(
                    "Too many incorrect attempts. Please request a new OTP."
            );
        }

        String suppliedHash = hashOtp(otp);

        if (!constantTimeEquals(
                suppliedHash,
                verification.getOtpHash())) {

            verification.setAttempts(
                    verification.getAttempts() + 1
            );

            verificationRepository.save(verification);

            throw new RuntimeException("Invalid OTP");
        }

        if (userRepository.existsByEmail(email)) {

            verificationRepository.delete(verification);

            throw new RuntimeException(
                    "Email is already registered"
            );
        }

        User user = new User();

        user.setEmail(email);
        user.setPassword(verification.getPasswordHash());
        user.setRole("USER");
        user.setEmailVerified(true);

        User savedUser = userRepository.save(user);

        verificationRepository.delete(verification);

        return savedUser;
    }

    public void resendOtp(String email) {

        email = normalizeEmail(email);

        EmailVerificationCode verification =
                verificationRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Registration session not found."
                                ));

        LocalDateTime now = LocalDateTime.now();

        if (verification.getLastSentAt()
                .plusSeconds(resendSeconds)
                .isAfter(now)) {

            throw new RuntimeException(
                    "Please wait before requesting another OTP."
            );
        }

        String otp = generateOtp();

        verification.setOtpHash(hashOtp(otp));
        verification.setExpiresAt(
                now.plusMinutes(expiryMinutes)
        );
        verification.setAttempts(0);
        verification.setLastSentAt(now);

        verificationRepository.save(verification);

        emailService.sendVerificationOtp(email, otp);
    }

    private String generateOtp() {

        int otp = secureRandom.nextInt(1_000_000);

        return String.format("%06d", otp);
    }

    private String normalizeEmail(String email) {

        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }

        return email.trim().toLowerCase();
    }

    private String hashOtp(String otp) {

        try {

            Mac mac = Mac.getInstance("HmacSHA256");

            SecretKeySpec key =
                    new SecretKeySpec(
                            otpPepper.getBytes(StandardCharsets.UTF_8),
                            "HmacSHA256"
                    );

            mac.init(key);

            byte[] hash =
                    mac.doFinal(
                            otp.getBytes(StandardCharsets.UTF_8)
                    );

            return HexFormat.of().formatHex(hash);

        } catch (java.security.NoSuchAlgorithmException |
                 java.security.InvalidKeyException e) {

            throw new RuntimeException(
                    "Unable to process OTP",
                    e
            );
        }
    }

    private boolean constantTimeEquals(
            String first,
            String second) {

        if (first == null || second == null) {
            return false;
        }

        return java.security.MessageDigest.isEqual(
                first.getBytes(StandardCharsets.UTF_8),
                second.getBytes(StandardCharsets.UTF_8)
        );
    }
}