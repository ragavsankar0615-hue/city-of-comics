package com.comic.comicreader.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final Object mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public EmailService(Object mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationOtp(String email, String otp) {
        try {
            Class<?> messageType = Class.forName("org.springframework.mail.SimpleMailMessage");
            Object message = messageType.getConstructor().newInstance();

            messageType.getMethod("setFrom", String.class).invoke(message, fromEmail);
            messageType.getMethod("setTo", String.class).invoke(message, email);
            messageType.getMethod("setSubject", String.class).invoke(
                message, "City of Comics - Email Verification OTP");
            messageType.getMethod("setText", String.class).invoke(message,
                """
                Welcome to City of Comics!

                Your email verification OTP is:

                %s

                This OTP is valid for 10 minutes.

                For your security, do not share this OTP with anyone.

                If you did not request this, you can safely ignore this email.

                City of Comics""".formatted(otp));

            mailSender.getClass().getMethod("send", messageType).invoke(mailSender, message);
        } catch (ReflectiveOperationException exception) {
            throw new IllegalStateException("Unable to send email", exception);
        }
    }
}