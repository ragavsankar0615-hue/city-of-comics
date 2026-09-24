package com.comic.comicreader.service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ComicFileService {

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key:}")
    private String serviceRoleKey;

    @Value("${supabase.bucket:comics}")
    private String bucket;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean isCloudStorageEnabled() {
        return supabaseUrl != null
                && !supabaseUrl.isBlank()
                && serviceRoleKey != null
                && !serviceRoleKey.isBlank();
    }

    public SignedUpload createSignedUpload(
            Long comicId,
            String originalFilename,
            String contentType) {

        if (!isCloudStorageEnabled()) {
            throw new RuntimeException("Supabase storage is not configured.");
        }

        String extension = getExtension(originalFilename);

        String path = "comics/"
                + comicId
                + "/"
                + UUID.randomUUID()
                + extension;

        String encodedPath = encodePath(path);

        String endpoint = supabaseUrl
                + "/storage/v1/object/upload/sign/"
                + encodeSegment(bucket)
                + "/"
                + encodedPath;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Authorization", "Bearer " + serviceRoleKey)
                .header("apikey", serviceRoleKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("{}"))
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
                        "Unable to create Supabase upload URL."
                );
            }

            JsonNode node = objectMapper.readTree(response.body());

            String signedPath = node.path("url").asText();

            if (signedPath == null || signedPath.isBlank()) {
                throw new RuntimeException(
                        "Supabase did not return a signed upload URL."
                );
            }

            String signedUrl;

            if (signedPath.startsWith("http://")
                    || signedPath.startsWith("https://")) {
                signedUrl = signedPath;
            } else {
                signedUrl = supabaseUrl
                        + "/storage/v1"
                        + signedPath;
            }

            return new SignedUpload(
                    path,
                    signedUrl,
                    publicUrl(path)
            );

        } catch (InterruptedException e) {

            Thread.currentThread().interrupt();

            throw new RuntimeException(
                    "Unable to create Supabase upload URL.",
                    e
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "Unable to communicate with Supabase.",
                    e
            );
        }
    }

    public String publicUrl(String path) {

        return supabaseUrl
                + "/storage/v1/object/public/"
                + encodeSegment(bucket)
                + "/"
                + encodePath(path);
    }

    public boolean isOwnedPath(Long comicId, String path) {

        if (comicId == null || path == null) {
            return false;
        }

        String prefix = "comics/" + comicId + "/";

        return path.startsWith(prefix)
                && !path.contains("..");
    }

    public void deleteObjects(List<String> paths) {

        if (!isCloudStorageEnabled()
                || paths == null
                || paths.isEmpty()) {
            return;
        }

        List<String> validPaths = new ArrayList<>();

        for (String path : paths) {
            if (path != null && !path.isBlank()) {
                validPaths.add(path);
            }
        }

        if (validPaths.isEmpty()) {
            return;
        }

        try {

            String json = objectMapper.writeValueAsString(
                    new DeleteRequest(validPaths)
            );

            String endpoint = supabaseUrl
                    + "/storage/v1/object/"
                    + encodeSegment(bucket);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Authorization", "Bearer " + serviceRoleKey)
                    .header("apikey", serviceRoleKey)
                    .header("Content-Type", "application/json")
                    .method(
                            "DELETE",
                            HttpRequest.BodyPublishers.ofString(json)
                    )
                    .build();

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            if (response.statusCode() < 200
                    || response.statusCode() >= 300) {

                throw new RuntimeException(
                        "Unable to delete Supabase files."
                );
            }

        } catch (InterruptedException e) {

            Thread.currentThread().interrupt();

            throw new RuntimeException(
                    "Unable to delete Supabase files.",
                    e
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to delete Supabase files.",
                    e
            );
        }
    }

    private String getExtension(String filename) {

        if (filename == null || filename.isBlank()) {
            throw new RuntimeException("Invalid filename.");
        }

        String lower = filename.toLowerCase();

        if (lower.endsWith(".jpg")) {
            return ".jpg";
        }

        if (lower.endsWith(".jpeg")) {
            return ".jpeg";
        }

        if (lower.endsWith(".png")) {
            return ".png";
        }

        if (lower.endsWith(".gif")) {
            return ".gif";
        }

        if (lower.endsWith(".webp")) {
            return ".webp";
        }

        throw new RuntimeException(
                "Only JPG, JPEG, PNG, GIF and WEBP images are allowed."
        );
    }

    private String encodePath(String path) {

        String[] parts = path.split("/");

        StringBuilder result = new StringBuilder();

        for (int i = 0; i < parts.length; i++) {

            if (i > 0) {
                result.append("/");
            }

            result.append(encodeSegment(parts[i]));
        }

        return result.toString();
    }

    private String encodeSegment(String value) {

        return URLEncoder
                .encode(value, StandardCharsets.UTF_8)
                .replace("+", "%20")
                .replace("%2F", "/");
    }

    public record SignedUpload(
            String path,
            String signedUrl,
            String publicUrl
    ) {
    }

    private record DeleteRequest(
            List<String> prefixes
    ) {
    }
}