package com.comic.comicreader.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.comic.comicreader.dto.LoginRequest;
import com.comic.comicreader.model.User;
import com.comic.comicreader.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository) {

        this.userRepository = userRepository;
        this.passwordEncoder =
                new BCryptPasswordEncoder();
    }

    public User login(LoginRequest request) {

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Invalid email or password."
                                )
                        );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException(
                    "Invalid email or password."
            );
        }

        if (!user.isEmailVerified()) {

            throw new RuntimeException(
                    "Please verify your email first."
            );
        }

        return user;
    }
}