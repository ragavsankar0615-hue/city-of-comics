package com.comic.comicreader.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final Object mailSender;
    private final String mailUsername;

    public EmailService(
            ApplicationContext applicationContext,
            @Value("${spring.mail.username:}") String mailUsername) {
        try {
            this.mailSender = applicationContext.getBean(
                    Class.forName("org.springframework.mail.javamail.JavaMailSender"));
        } catch (ClassNotFoundException e) {
            throw new IllegalStateException("Spring Mail is not available", e);
        }
        this.mailUsername = mailUsername;
    }

    public void sendVerificationOtp(String email, String otp) {

        try {
            Class<?> messageType = Class.forName("org.springframework.mail.SimpleMailMessage");
            Object message = messageType.getDeclaredConstructor().newInstance();

            if (mailUsername != null && !mailUsername.isBlank()) {
                messageType.getMethod("setFrom", String.class).invoke(message, mailUsername);
            }

            messageType.getMethod("setTo", String.class).invoke(message, email);
            messageType.getMethod("setSubject", String.class)
                    .invoke(message, "City of Comics - Email Verification");

            messageType.getMethod("setText", String.class).invoke(message,
                    "Welcome to City of Comics!\n\n"
                    + "Your email verification OTP is:\n\n" + otp + "\n\n"
                    + "This OTP is valid for 10 minutes.\n"
                    + "You have a maximum of 5 verification attempts.\n\n"
                    + "If you did not request this registration, you can safely ignore this email.\n\n"
                    + "City of Comics");
            mailSender.getClass().getMethod("send", messageType).invoke(mailSender, message);
        } catch (Exception e) {
            logger.error("Failed to send email verification OTP to {}", email, e);
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    public void sendRegistrationOtp(String email, String otp) {
        sendVerificationOtp(email, otp);
    }
}