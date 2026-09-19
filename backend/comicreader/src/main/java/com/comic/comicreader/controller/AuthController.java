package com.comic.comicreader.controller;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.comic.comicreader.dto.LoginRequest;
import com.comic.comicreader.dto.RegisterRequest;
import com.comic.comicreader.model.User;
import com.comic.comicreader.service.AuthService;
import com.comic.comicreader.service.EmailVerificationService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;

    public AuthController(
            AuthService authService,
            EmailVerificationService emailVerificationService) {

        this.authService = authService;
        this.emailVerificationService = emailVerificationService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request) {

        try {

            emailVerificationService.startRegistration(
                    request.getEmail(),
                    request.getPassword()
            );

            Instant expiresAt =
                    Instant.now().plusSeconds(10 * 60);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "OTP sent successfully.",
                            "expiresAt",
                            expiresAt
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }

    @PostMapping("/register/verify-otp")
    public ResponseEntity<?> verifyRegistrationOtp(
            @RequestBody Map<String, String> request) {

        try {

            String email = request.get("email");
            String otp = request.get("otp");

            if (email == null
                    || email.isBlank()
                    || otp == null
                    || !otp.matches("\\d{6}")) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Enter a valid 6-digit OTP."
                                )
                        );
            }

            User user =
                    emailVerificationService.verifyRegistration(
                            email,
                            otp
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            Map.of(
                                    "message",
                                    "Registration successful.",
                                    "userId",
                                    user.getId(),
                                    "email",
                                    user.getEmail()
                            )
                    );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }

    @PostMapping("/register/resend-otp")
    public ResponseEntity<?> resendOtp(
            @RequestBody Map<String, String> request) {

        try {

            String email = request.get("email");

            if (email == null || email.isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Email is required."
                                )
                        );
            }

            emailVerificationService.resendOtp(email);

            Instant expiresAt =
                    Instant.now().plusSeconds(10 * 60);

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "A new OTP has been sent.",
                            "expiresAt",
                            expiresAt
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request,
            HttpSession session) {

        try {

            User user = authService.login(request);

            session.setAttribute(
                    "userId",
                    user.getId()
            );

            session.setAttribute(
                    "email",
                    user.getEmail()
            );

            session.setAttribute(
                    "role",
                    user.getRole()
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Login successful",
                            "userId",
                            user.getId(),
                            "email",
                            user.getEmail(),
                            "role",
                            user.getRole()
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpSession session) {

        session.invalidate();

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Logged out successfully"
                )
        );
    }

    @GetMapping("/me")
    public ResponseEntity<?> currentUser(
            HttpSession session) {

        Object userId =
                session.getAttribute("userId");

        if (userId == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "message",
                                    "Not logged in"
                            )
                    );
        }

        return ResponseEntity.ok(
                Map.of(
                        "userId",
                        userId,
                        "email",
                        session.getAttribute("email"),
                        "role",
                        session.getAttribute("role")
                )
        );
    }
}