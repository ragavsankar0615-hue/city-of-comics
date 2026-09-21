package com.comic.comicreader.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.comic.comicreader.model.Comic;
import com.comic.comicreader.model.ComicPage;
import com.comic.comicreader.repository.ComicPageRepository;
import com.comic.comicreader.repository.ComicRepository;
import com.comic.comicreader.service.ComicFileService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/comics")
public class ComicController {

    private static final long MAX_COVER_SIZE = 10L * 1024 * 1024;
    private static final long MAX_PAGE_SIZE = 20L * 1024 * 1024;

    private final ComicRepository comicRepository;
    private final ComicPageRepository comicPageRepository;
    private final ComicFileService comicFileService;

    public ComicController(
            ComicRepository comicRepository,
            ComicPageRepository comicPageRepository,
            ComicFileService comicFileService) {

        this.comicRepository = comicRepository;
        this.comicPageRepository = comicPageRepository;
        this.comicFileService = comicFileService;
    }

    private boolean isHost(HttpSession session) {
        Object role = session.getAttribute("role");
        return role != null && "HOST".equalsIgnoreCase(role.toString());
    }

    @GetMapping
    public List<Comic> getAllComics() {
        return comicRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getComic(@PathVariable Long id) {
        Comic comic = comicRepository.findById(id).orElse(null);

        if (comic == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(comic);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadComic(
            @RequestParam String title,
            @RequestParam String author,
            @RequestParam(required = false, defaultValue = "") String description,
            @RequestParam(required = false) MultipartFile cover,
            @RequestParam("panels") MultipartFile[] panels,
            HttpSession session) {

        if (!isHost(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                    Map.of("message", "Only HOST can upload comics."));
        }

        String cleanTitle = title == null ? "" : title.trim();
        String cleanAuthor = author == null ? "" : author.trim();

        if (cleanTitle.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Comic title is required."));
        }

        if (cleanAuthor.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Author is required."));
        }

        if (panels == null || panels.length == 0) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "At least one comic panel is required."));
        }

        if (cover != null && !cover.isEmpty() && cover.getSize() > MAX_COVER_SIZE) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Cover image must be 10 MB or smaller."));
        }

        for (MultipartFile panel : panels) {
            if (panel == null || panel.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Comic panels cannot be empty."));
            }
            if (panel.getSize() > MAX_PAGE_SIZE) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Each comic panel must be 20 MB or smaller."));
            }
        }

        Comic comic = new Comic();
        comic.setTitle(cleanTitle);
        comic.setAuthor(cleanAuthor);
        comic.setDescription(description == null ? "" : description.trim());
        comic.setTotalPages(panels.length);

        List<String> savedFiles = new ArrayList<>();

        try {
            comic = comicRepository.save(comic);
            Long comicId = comic.getId();

            if (cover != null && !cover.isEmpty()) {
                String coverUrl = comicFileService.saveImage(
                        comicId, cover, "cover");
                comic.setImageUrl(coverUrl);
                savedFiles.add(coverUrl);
            }

            for (int i = 0; i < panels.length; i++) {
                String pageUrl = comicFileService.saveImage(
                        comicId, panels[i], "page-" + (i + 1));

                ComicPage page = new ComicPage();
                page.setComic(comic);
                page.setPageNumber(i + 1);
                page.setImageUrl(pageUrl);
                comicPageRepository.save(page);
                savedFiles.add(pageUrl);
            }

            Comic savedComic = comicRepository.save(comic);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedComic);

        } catch (Exception e) {
            if (comic.getId() != null) {
                try {
                    comicPageRepository.deleteByComicId(comic.getId());
                    comicRepository.deleteById(comic.getId());
                    comicFileService.deleteComicFolder(comic.getId());
                } catch (Exception cleanupException) {
                    cleanupException.printStackTrace();
                }
            }

            String message = e.getMessage();
            if (message == null || message.isBlank()) {
                message = "Unable to upload comic.";
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("message", message));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateComic(
            @PathVariable Long id,
            @RequestBody Comic details,
            HttpSession session) {

        if (!isHost(session)) {
            return ResponseEntity.status(403).body(
                    Map.of("message", "Only HOST can edit comics."));
        }

        Comic comic = comicRepository.findById(id).orElse(null);

        if (comic == null) {
            return ResponseEntity.status(404).body(
                    Map.of("message", "Comic not found."));
        }

        if (details.getTitle() != null && !details.getTitle().trim().isEmpty()) {
            comic.setTitle(details.getTitle().trim());
        }

        if (details.getAuthor() != null && !details.getAuthor().trim().isEmpty()) {
            comic.setAuthor(details.getAuthor().trim());
        }

        comic.setDescription(details.getDescription());

        Comic updated = comicRepository.save(comic);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComic(
            @PathVariable Long id,
            HttpSession session) {

        if (!isHost(session)) {
            return ResponseEntity.status(403).body(
                    Map.of("message", "Only HOST can delete comics."));
        }

        Comic comic = comicRepository.findById(id).orElse(null);

        if (comic == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            comicPageRepository.deleteByComicId(id);
            comicRepository.delete(comic);
            comicFileService.deleteComicFolder(id);

            return ResponseEntity.ok(
                    Map.of("message", "Comic deleted successfully."));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(
                    Map.of("message", "Comic was deleted, but its files could not be removed."));
        }
    }
}
