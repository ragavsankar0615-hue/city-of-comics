package com.comic.comicreader.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final String apiKey;
    private final String fromEmail;

    private final HttpClient httpClient;

    public EmailService(
            @Value("${brevo.api-key:}") String apiKey,
            @Value("${brevo.from:}") String fromEmail) {

        this.apiKey = apiKey;
        this.fromEmail = fromEmail;

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(20))
                .build();
    }

    public void sendVerificationOtp(String email, String otp) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("Brevo API key is not configured.");
        }

        if (fromEmail == null || fromEmail.isBlank()) {
            throw new RuntimeException("Brevo sender email is not configured.");
        }

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Recipient email is required.");
        }

        if (otp == null || otp.isBlank()) {
            throw new RuntimeException("OTP is required.");
        }

        String html = buildEmailHtml(otp);

        String json =
                "{"
                + "\"sender\":{"
                + "\"name\":\"City of Comics\","
                + "\"email\":\"" + escapeJson(fromEmail) + "\""
                + "},"
                + "\"to\":[{"
                + "\"email\":\"" + escapeJson(email) + "\""
                + "}],"
                + "\"subject\":\"City of Comics - Email Verification OTP\","
                + "\"htmlContent\":\"" + escapeJson(html) + "\","
                + "\"textContent\":\"Your City of Comics verification OTP is "
                + escapeJson(otp)
                + ". This OTP is valid for 10 minutes.\""
                + "}";

        try {

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .timeout(Duration.ofSeconds(30))
                    .header("accept", "application/json")
                    .header("api-key", apiKey)
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            int statusCode = response.statusCode();

            if (statusCode < 200 || statusCode >= 300) {

                String responseBody = response.body();

                throw new RuntimeException(
                        "Brevo email failed. HTTP "
                        + statusCode
                        + ". "
                        + responseBody
                );
            }

        } catch (InterruptedException e) {

            Thread.currentThread().interrupt();

            throw new RuntimeException(
                    "Email sending was interrupted.",
                    e
            );

        } catch (RuntimeException e) {

            throw e;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to send OTP email.",
                    e
            );
        }
    }

    public void sendRegistrationOtp(String email, String otp) {
        sendVerificationOtp(email, otp);
    }

    private String buildEmailHtml(String otp) {

        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<meta charset=\"UTF-8\">"
                + "<title>City of Comics Verification</title>"
                + "</head>"
                + "<body style=\""
                + "margin:0;"
                + "padding:0;"
                + "background:#f4f4f4;"
                + "font-family:Arial,sans-serif;"
                + "\">"

                + "<div style=\""
                + "max-width:600px;"
                + "margin:40px auto;"
                + "background:#ffffff;"
                + "padding:40px;"
                + "border-radius:12px;"
                + "text-align:center;"
                + "\">"

                + "<h1 style=\"margin-bottom:10px;\">"
                + "City of Comics"
                + "</h1>"

                + "<p style=\"font-size:16px;color:#555;\">"
                + "Welcome to City of Comics!"
                + "</p>"

                + "<p style=\"font-size:16px;color:#555;\">"
                + "Use the verification code below to complete your registration."
                + "</p>"

                + "<div style=\""
                + "margin:30px 0;"
                + "padding:20px;"
                + "background:#f0e8ff;"
                + "border-radius:10px;"
                + "\">"

                + "<div style=\""
                + "font-size:36px;"
                + "font-weight:bold;"
                + "letter-spacing:10px;"
                + "color:#6c2bd9;"
                + "\">"
                + escapeHtml(otp)
                + "</div>"

                + "</div>"

                + "<p style=\"font-size:14px;color:#666;\">"
                + "This OTP is valid for 10 minutes."
                + "</p>"

                + "<p style=\"font-size:14px;color:#666;\">"
                + "You have a maximum of 5 verification attempts."
                + "</p>"

                + "<p style=\"font-size:13px;color:#999;margin-top:30px;\">"
                + "If you did not request this registration, you can safely ignore this email."
                + "</p>"

                + "<p style=\"font-size:14px;color:#555;\">"
                + "City of Comics"
                + "</p>"

                + "</div>"
                + "</body>"
                + "</html>";
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

    private String escapeHtml(String value) {

        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}