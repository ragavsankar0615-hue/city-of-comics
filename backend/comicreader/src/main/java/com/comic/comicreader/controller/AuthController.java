package com.comic.comicreader.controller;

import com.comic.comicreader.dto.LoginRequest;
import com.comic.comicreader.dto.RegisterRequest;
import com.comic.comicreader.service.AuthService;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        try {
            Object result = authService.register(request);

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Registration failed"
                    ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpSession session) {

        try {

            var user = authService.login(request);

            session.setAttribute("userId", user.getId());
            session.setAttribute("email", user.getEmail());
            session.setAttribute("role", user.getRole());

            session.setMaxInactiveInterval(60 * 60 * 24);

            session.setAttribute("authenticated", true);

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "message",
                    "Login successful"
            );

            response.put(
                    "userId",
                    user.getId()
            );

            response.put(
                    "email",
                    user.getEmail()
            );

            response.put(
                    "role",
                    user.getRole()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            return ResponseEntity.status(401)
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Invalid email or password"
                    ));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(
            HttpSession session) {

        Object userId =
                session.getAttribute("userId");

        Object email =
                session.getAttribute("email");

        Object role =
                session.getAttribute("role");

        if (userId == null ||
                email == null ||
                role == null) {

            return ResponseEntity
                    .status(401)
                    .body(
                            Map.of(
                                    "message",
                                    "Not logged in"
                            )
                    );
        }

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "userId",
                userId
        );

        response.put(
                "email",
                email
        );

        response.put(
                "role",
                role
        );

        return ResponseEntity.ok(response);
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
}