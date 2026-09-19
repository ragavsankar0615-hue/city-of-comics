package com.comic.comicreader.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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

    public Path createComicFolder(Long comicId)
            throws IOException {

        Path comicFolder =
                uploadDir.resolve(
                        String.valueOf(comicId)
                );

        Files.createDirectories(comicFolder);

        return comicFolder;
    }

    public void deleteComicFolder(Long comicId)
            throws IOException {

        Path comicFolder =
                uploadDir.resolve(
                        String.valueOf(comicId)
                );

        if (!Files.exists(comicFolder)) {
            return;
        }

        try (Stream<Path> paths =
                     Files.walk(comicFolder)) {

            paths.sorted(
                    Comparator.reverseOrder()
            ).forEach(path -> {

                try {
                    Files.deleteIfExists(path);
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }

            });
        }
    }
}