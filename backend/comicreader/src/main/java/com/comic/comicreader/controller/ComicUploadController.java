package com.comic.comicreader.controller;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.comic.comicreader.model.Comic;
import com.comic.comicreader.model.ComicPage;
import com.comic.comicreader.repository.ComicPageRepository;
import com.comic.comicreader.repository.ComicRepository;

@RestController
@RequestMapping("/api/comics")
@CrossOrigin(origins = "http://localhost:5173")
public class ComicUploadController {

    private final ComicRepository comicRepository;
    private final ComicPageRepository comicPageRepository;

    public ComicUploadController(
            ComicRepository comicRepository,
            ComicPageRepository comicPageRepository) {

        this.comicRepository = comicRepository;
        this.comicPageRepository = comicPageRepository;
    }

    @PostMapping("/upload-cbz")
    public ResponseEntity<?> uploadComic(

            @RequestParam("title") String title,

            @RequestParam("author") String author,

            @RequestParam(value = "description", required = false)
            String description,

            @RequestParam(value = "coverImage", required = false)
            String coverImage,

            @RequestParam("file")
            MultipartFile file) {

        Comic savedComic = null;

        try {

            // ==========================================
            // 1. Validate CBZ file
            // ==========================================

            if (file == null || file.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Please select a CBZ file.");
            }

            String originalName = file.getOriginalFilename();

            if (originalName == null
                    || !originalName.toLowerCase().endsWith(".cbz")) {

                return ResponseEntity
                        .badRequest()
                        .body("Only .cbz files are supported.");
            }

            // ==========================================
            // 2. Create Comic
            // ==========================================

            Comic comic = new Comic();

            comic.setTitle(title);
            comic.setAuthor(author);

            comic.setDescription(
                    description == null ? "" : description
            );

            // Optional cover image
            // First CBZ page will replace this automatically.
            if (coverImage != null
                    && !coverImage.trim().isEmpty()
                    && !coverImage.contains("google.com/imgres")) {

                comic.setImageUrl(coverImage);
            }

            savedComic = comicRepository.save(comic);

            Long comicId = savedComic.getId();

            // ==========================================
            // 3. Create comic upload directory
            // ==========================================

            Path comicFolder = Paths.get(
                    "uploads",
                    "comics",
                    String.valueOf(comicId)
            );

            Files.createDirectories(comicFolder);

            // ==========================================
            // 4. Extract CBZ pages
            // ==========================================

            int pageNumber = 1;

            try (
                    InputStream inputStream = file.getInputStream();

                    ZipInputStream zipInputStream =
                            new ZipInputStream(inputStream)
            ) {

                ZipEntry entry;

                while (
                        (entry = zipInputStream.getNextEntry()) != null
                ) {

                    // Skip directories
                    if (entry.isDirectory()) {

                        zipInputStream.closeEntry();

                        continue;
                    }

                    String fileName = entry.getName();

                    String lowerName =
                            fileName.toLowerCase();

                    // ======================================
                    // Only allow comic image files
                    // ======================================

                    if (!lowerName.endsWith(".jpg")
                            && !lowerName.endsWith(".jpeg")
                            && !lowerName.endsWith(".png")
                            && !lowerName.endsWith(".webp")) {

                        zipInputStream.closeEntry();

                        continue;
                    }

                    // ======================================
                    // Determine image extension
                    // ======================================

                    String extension = ".jpg";

                    if (lowerName.endsWith(".jpeg")) {

                        extension = ".jpeg";

                    } else if (lowerName.endsWith(".png")) {

                        extension = ".png";

                    } else if (lowerName.endsWith(".webp")) {

                        extension = ".webp";
                    }

                    // ======================================
                    // Create new page filename
                    // ======================================

                    String newFileName =
                            "page-" + pageNumber + extension;

                    Path outputPath =
                            comicFolder.resolve(newFileName);

                    // ======================================
                    // Extract image from CBZ
                    // ======================================

                    Files.copy(
                            zipInputStream,
                            outputPath,
                            StandardCopyOption.REPLACE_EXISTING
                    );

                    // ======================================
                    // URL used by frontend
                    // ======================================

                    String imageUrl =
                            "/uploads/comics/"
                                    + comicId
                                    + "/"
                                    + newFileName;

                    // ======================================
                    // First page becomes comic cover
                    // ======================================

                    if (pageNumber == 1) {

                        savedComic.setImageUrl(imageUrl);

                        savedComic =
                                comicRepository.save(savedComic);
                    }

                    // ======================================
                    // Save ComicPage in database
                    // ======================================

                    ComicPage page = new ComicPage();

                    page.setPageNumber(pageNumber);

                    page.setImageUrl(imageUrl);

                    page.setComic(savedComic);

                    comicPageRepository.save(page);

                    pageNumber++;

                    zipInputStream.closeEntry();
                }
            }

            // ==========================================
            // 5. Check whether pages were found
            // ==========================================

            if (pageNumber == 1) {

                comicRepository.delete(savedComic);

                return ResponseEntity
                        .badRequest()
                        .body(
                                "No image pages were found inside the CBZ file."
                        );
            }

            // ==========================================
            // 6. Return success response
            // ==========================================

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "message",
                    "Comic uploaded successfully!"
            );

            response.put(
                    "comicId",
                    savedComic.getId()
            );

            response.put(
                    "title",
                    savedComic.getTitle()
            );

            response.put(
                    "pages",
                    pageNumber - 1
            );

            response.put(
                    "cover",
                    savedComic.getImageUrl()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            // ==========================================
            // Cleanup database if upload fails
            // ==========================================

            if (savedComic != null) {

                try {

                    comicPageRepository.deleteByComicId(
                            savedComic.getId()
                    );

                    comicRepository.delete(savedComic);

                } catch (Exception ignored) {
                }
            }

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Upload failed: " + e.getMessage()
                    );
        }
    }
}