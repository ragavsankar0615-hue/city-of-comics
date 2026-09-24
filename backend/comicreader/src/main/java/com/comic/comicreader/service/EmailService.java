package com.comic.comicreader.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final String apiKey;
    private final String fromEmail;
    private final String fromName;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public EmailService(
            @Value("${brevo.api-key:}") String apiKey,
            @Value("${brevo.from:}") String fromEmail,
            @Value("${brevo.from-name:City of Comics}") String fromName) {

        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
    }

    public void sendVerificationOtp(String email, String otp) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("Brevo API key is not configured.");
        }

        if (fromEmail == null || fromEmail.isBlank()) {
            throw new RuntimeException("Brevo sender email is not configured.");
        }

        String html = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px">
                    <h1 style="color:#7c3aed">City of Comics</h1>

                    <p>Welcome to City of Comics!</p>

                    <p>Your email verification OTP is:</p>

                    <div style="font-size:36px;font-weight:bold;
                                letter-spacing:10px;
                                margin:25px 0;
                                color:#7c3aed">
                        %s
                    </div>

                    <p>This OTP is valid for <strong>10 minutes</strong>.</p>

                    <p>You have a maximum of <strong>5 verification attempts</strong>.</p>

                    <p>
                        If you did not request this registration,
                        you can safely ignore this email.
                    </p>

                    <p>City of Comics</p>
                </div>
                """.formatted(otp);

        String json = """
                {
                    "sender": {
                        "name": "%s",
                        "email": "%s"
                    },
                    "to": [
                        {
                            "email": "%s"
                        }
                    ],
                    "subject": "City of Comics - Email Verification",
                    "htmlContent": "%s"
                }
                """.formatted(
                escapeJson(fromName),
                escapeJson(fromEmail),
                escapeJson(email),
                escapeJson(html)
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                .header("accept", "application/json")
                .header("api-key", apiKey)
                .header("content-type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        try {

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            if (response.statusCode() < 200 ||
                    response.statusCode() >= 300) {

                throw new RuntimeException(
                        "Unable to send OTP email through Brevo."
                );
            }

        } catch (InterruptedException e) {

            Thread.currentThread().interrupt();

            throw new RuntimeException(
                    "Unable to send OTP email through Brevo.",
                    e
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to send OTP email through Brevo.",
                    e
            );
        }
    }

    public void sendRegistrationOtp(String email, String otp) {
        sendVerificationOtp(email, otp);
    }

    private String escapeJson(String value) {

        if (value == null) {
            return "";
        }

        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "\\r")
                .replace("\n", "\\n")
                .replace("\t", "\\t");
    }
}