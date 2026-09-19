package com.comic.comicreader.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.comic.comicreader.dto.LoginRequest;
import com.comic.comicreader.dto.RegisterRequest;
import com.comic.comicreader.model.User;
import com.comic.comicreader.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String register(RegisterRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException(
                    "Email is already registered"
            );
        }

        String encryptedPassword =
                passwordEncoder.encode(
                        request.getPassword()
                );

        User user = new User();

        user.setEmail(email);
        user.setPassword(encryptedPassword);

        // Every new account is a normal USER
        user.setRole("USER");

        userRepository.save(user);

        return "Registration successful";
    }

    public User login(LoginRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Invalid email or password"
                        )
                );

        boolean matches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if (!matches) {
            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        return user;
    }
}