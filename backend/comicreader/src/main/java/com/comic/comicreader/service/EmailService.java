package com.comic.comicreader.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final String resendApiKey;
    private final String fromEmail;

    public EmailService(
            @Value("${resend.api-key:}") String resendApiKey,
            @Value("${resend.from:}") String fromEmail) {

        this.resendApiKey = resendApiKey;
        this.fromEmail = fromEmail;
    }

    public void sendVerificationOtp(String email, String otp) {

        if (resendApiKey == null || resendApiKey.isBlank()) {
            throw new RuntimeException("Resend API key is not configured.");
        }

        if (fromEmail == null || fromEmail.isBlank()) {
            throw new RuntimeException("Resend sender email is not configured.");
        }

        Resend resend = new Resend(resendApiKey);

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(email)
                .subject("City of Comics - Email Verification")
                .html(
                        "<div style=\"font-family:Arial,sans-serif;max-width:600px;margin:auto\">"
                        + "<h1>City of Comics</h1>"
                        + "<p>Welcome to City of Comics!</p>"
                        + "<p>Your email verification OTP is:</p>"
                        + "<h2 style=\"font-size:32px;letter-spacing:8px\">" + otp + "</h2>"
                        + "<p>This OTP is valid for 10 minutes.</p>"
                        + "<p>You have a maximum of 5 verification attempts.</p>"
                        + "<p>If you did not request this registration, you can safely ignore this email.</p>"
                        + "<p>City of Comics</p>"
                        + "</div>"
                )
                .build();

        try {
            resend.emails().send(params);
        } catch (ResendException e) {
            throw new RuntimeException("Unable to send OTP email.", e);
        }
    }

    public void sendRegistrationOtp(String email, String otp) {
        sendVerificationOtp(email, otp);
    }
}