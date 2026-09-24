package com.comic.comicreader.service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.comic.comicreader.model.EmailVerificationCode;
import com.comic.comicreader.model.User;
import com.comic.comicreader.repository.EmailVerificationCodeRepository;
import com.comic.comicreader.repository.UserRepository;

@Service
public class EmailVerificationService {

    private static final int OTP_VALIDITY_MINUTES = 10;
    private static final int RESEND_COOLDOWN_SECONDS = 60;
    private static final int MAX_ATTEMPTS = 5;

    private final EmailVerificationCodeRepository verificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom;

    public EmailVerificationService(
            EmailVerificationCodeRepository verificationRepository,
            UserRepository userRepository,
            EmailService emailService) {

        this.verificationRepository = verificationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = new BCryptPasswordEncoder();
        this.secureRandom = new SecureRandom();
    }

    public Instant sendRegistrationOtp(
            String email,
            String password) {

        email = email.trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException(
                    "Email is already registered."
            );
        }

        Instant now = Instant.now();

        EmailVerificationCode verification =
                verificationRepository
                        .findByEmail(email)
                        .orElse(null);

        if (verification != null) {

            long elapsed =
                    Duration.between(
                            verification.getLastSentAt(),
                            now
                    ).getSeconds();

            if (elapsed < RESEND_COOLDOWN_SECONDS) {

                long remaining =
                        RESEND_COOLDOWN_SECONDS - elapsed;

                throw new RuntimeException(
                        "Please wait "
                                + remaining
                                + " seconds before requesting another OTP."
                );
            }
        } else {
            verification = new EmailVerificationCode();
        }

        String otp = String.format(
                "%06d",
                secureRandom.nextInt(1_000_000)
        );

        verification.setEmail(email);

        verification.setPasswordHash(
                passwordEncoder.encode(password)
        );

        verification.setOtpHash(
                passwordEncoder.encode(otp)
        );

        verification.setExpiresAt(
                now.plus(
                        Duration.ofMinutes(
                                OTP_VALIDITY_MINUTES
                        )
                )
        );

        verification.setLastSentAt(now);
        verification.setAttempts(0);
        verification.setCreatedAt(now);

        verificationRepository.save(verification);

        emailService.sendRegistrationOtp(
                email,
                otp
        );

        return verification.getExpiresAt();
    }

    public User verifyRegistrationOtp(
            String email,
            String otp) {

        email = email.trim().toLowerCase();

        EmailVerificationCode verification =
                verificationRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "OTP expired or not requested."
                                )
                        );

        Instant now = Instant.now();

        if (now.isAfter(
                verification.getExpiresAt())) {

            verificationRepository.delete(
                    verification
            );

            throw new RuntimeException(
                    "OTP has expired. Please request a new OTP."
            );
        }

        if (verification.getAttempts()
                >= MAX_ATTEMPTS) {

            verificationRepository.delete(
                    verification
            );

            throw new RuntimeException(
                    "Too many incorrect attempts. Please request a new OTP."
            );
        }

        if (!passwordEncoder.matches(
                otp,
                verification.getOtpHash())) {

            verification.setAttempts(
                    verification.getAttempts() + 1
            );

            verificationRepository.save(
                    verification
            );

            int remaining =
                    MAX_ATTEMPTS
                    - verification.getAttempts();

            throw new RuntimeException(
                    "Invalid OTP. "
                    + remaining
                    + " attempt(s) remaining."
            );
        }

        if (userRepository.existsByEmail(email)) {

            verificationRepository.delete(
                    verification
            );

            throw new RuntimeException(
                    "Email is already registered."
            );
        }

        User user = new User();

        user.setEmail(email);

        user.setPassword(
                verification.getPasswordHash()
        );

        user.setRole("USER");

        user.setEmailVerified(true);

        User savedUser =
                userRepository.save(user);

        verificationRepository.delete(
                verification
        );

        return savedUser;
    }
}