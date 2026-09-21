package com.comic.comicreader.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.UUID;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ComicFileService {

    private final Path uploadDir;

    public ComicFileService(
            @Value("${comic.upload-dir:uploads}")
            String uploadDirectory) {

        this.uploadDir = Paths
                .get(uploadDirectory)
                .toAbsolutePath()
                .normalize();
    }

    public Path createComicFolder(Long comicId) throws IOException {
        Path comicFolder = uploadDir.resolve(String.valueOf(comicId));
        Files.createDirectories(comicFolder);
        return comicFolder;
    }

    public String saveImage(Long comicId, MultipartFile file, String prefix)
            throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IOException("Uploaded image is empty.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new IOException("Only image files are allowed.");
        }

        Path comicFolder = createComicFolder(comicId);
        String extension = getExtension(file.getOriginalFilename(), contentType);
        String safePrefix = prefix.replaceAll("[^a-zA-Z0-9_-]", "_");
        String filename = safePrefix + "-" + UUID.randomUUID() + extension;
        Path destination = comicFolder.resolve(filename).normalize();

        if (!destination.getParent().equals(comicFolder)) {
            throw new IOException("Invalid upload filename.");
        }

        file.transferTo(destination);
        return "/uploads/" + comicId + "/" + filename;
    }

    private String getExtension(String originalFilename, String contentType) {
        if (originalFilename != null) {
            int dot = originalFilename.lastIndexOf('.');
            if (dot >= 0 && dot < originalFilename.length() - 1) {
                String extension = originalFilename.substring(dot).toLowerCase();
                if (extension.matches("\\.(jpg|jpeg|png|gif|webp)")) {
                    return extension;
                }
            }
        }

        return switch (contentType.toLowerCase()) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/gif" -> ".gif";
            case "image/webp" -> ".webp";
            default -> ".img";
        };
    }

    public void deleteComicFolder(Long comicId) throws IOException {
        Path comicFolder = uploadDir
                .resolve(String.valueOf(comicId))
                .normalize();

        if (!Files.exists(comicFolder)) {
            return;
        }

        if (!comicFolder.getParent().equals(uploadDir)) {
            throw new IOException("Invalid comic upload path.");
        }

        try (Stream<Path> paths = Files.walk(comicFolder)) {
            paths.sorted(Comparator.reverseOrder()).forEach(path -> {
                try {
                    Files.deleteIfExists(path);
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            });
        } catch (RuntimeException e) {
            if (e.getCause() instanceof IOException ioException) {
                throw ioException;
            }
            throw e;
        }
    }
}
