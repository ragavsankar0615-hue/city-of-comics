package com.comic.comicreader.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.comic.comicreader.model.EmailVerificationCode;

public interface EmailVerificationCodeRepository
        extends JpaRepository<EmailVerificationCode, Long> {

    Optional<EmailVerificationCode> findByEmail(String email);

    void deleteByEmail(String email);
}