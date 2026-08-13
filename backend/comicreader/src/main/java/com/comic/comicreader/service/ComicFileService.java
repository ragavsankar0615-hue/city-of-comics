package com.comic.comicreader.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ComicFileService {

    private final Path uploadDirectory;

    public ComicFileService(
            @Value("${comic.upload-dir}") String uploadDir
    ) throws IOException {

        uploadDirectory = Paths
                .get(uploadDir)
                .toAbsolutePath()
                .normalize();

        Files.createDirectories(uploadDirectory);
    }

    public Path createComicFolder(Long comicId) throws IOException {

        Path folder = uploadDirectory
                .resolve(String.valueOf(comicId))
                .normalize();

        if (!folder.startsWith(uploadDirectory)) {
            throw new IOException("Invalid comic folder");
        }

        Files.createDirectories(folder);

        return folder;
    }

    public String saveFile(
            MultipartFile file,
            Path folder,
            String fileName
    ) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IOException("File is empty");
        }

        Path destination = folder
                .resolve(fileName)
                .normalize();

        if (!destination.startsWith(folder)) {
            throw new IOException("Invalid file path");
        }

        Files.copy(
                file.getInputStream(),
                destination
        );

        return destination.toString();
    }

    public void deleteComicFolder(Long comicId) {

        try {

            Path folder = uploadDirectory
                    .resolve(String.valueOf(comicId))
                    .normalize();

            if (!folder.startsWith(uploadDirectory)) {
                return;
            }

            if (!Files.exists(folder)) {
                return;
            }

            try (var stream = Files.walk(folder)) {

                stream
                        .sorted((a, b) -> b.compareTo(a))
                        .forEach(path -> {
                            try {
                                Files.deleteIfExists(path);
                            } catch (IOException ignored) {
                            }
                        });
            }

        } catch (IOException ignored) {
        }
    }
}