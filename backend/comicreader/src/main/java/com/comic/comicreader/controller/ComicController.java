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
import org.springframework.web.bind.annotation.RestController;

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
    private static final int MAX_PANELS = 200;

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

    @PostMapping("/upload/init")
    public ResponseEntity<?> initializeUpload(
            @RequestBody UploadInitRequest request,
            HttpSession session) {

        if (!isHost(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only HOST can upload comics."));
        }

        String title = request.title() == null ? "" : request.title().trim();
        String author = request.author() == null ? "" : request.author().trim();
        String description = request.description() == null ? "" : request.description().trim();

        if (title.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Comic title is required."));
        }
        if (author.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Author is required."));
        }
        if (request.panels() == null || request.panels().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "At least one comic panel is required."));
        }
        if (request.panels().size() > MAX_PANELS) {
            return ResponseEntity.badRequest().body(Map.of("message", "Maximum 200 panels are allowed."));
        }

        if (request.cover() != null && request.cover().size() > MAX_COVER_SIZE) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cover image must be 10 MB or smaller."));
        }

        for (FileInfo panel : request.panels()) {
            if (panel == null || panel.size() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Comic panels cannot be empty."));
            }
            if (panel.size() > MAX_PAGE_SIZE) {
                return ResponseEntity.badRequest().body(Map.of("message", "Each comic panel must be 20 MB or smaller."));
            }
            if (!isImage(panel.contentType())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Only image files are allowed."));
            }
        }

        if (request.cover() != null && request.cover().size() > 0
                && !isImage(request.cover().contentType())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cover must be an image."));
        }

        Comic comic = new Comic();
        comic.setTitle(title);
        comic.setAuthor(author);
        comic.setDescription(description);
        comic.setTotalPages(request.panels().size());

        try {
            comic = comicRepository.save(comic);

            Object cover = null;
            if (request.cover() != null && request.cover().size() > 0) {
                cover = comicFileService.createSignedUpload(
                        comic.getId(),
                        request.cover().name(),
                        request.cover().contentType());
            }

            List<Object> panels = new ArrayList<>();
            for (FileInfo panel : request.panels()) {
                panels.add(comicFileService.createSignedUpload(
                        comic.getId(),
                        panel.name(),
                        panel.contentType()));
            }

            return ResponseEntity.ok(new UploadInitResponse(
                    comic.getId(),
                    cover,
                    panels));

        } catch (Exception e) {
            cleanupComic(comic.getId());
            String message = e.getMessage();
            if (message == null || message.isBlank()) {
                message = "Unable to initialize comic upload.";
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", message));
        }
    }

    @PostMapping("/{id}/upload-complete")
    public ResponseEntity<?> completeUpload(
            @PathVariable Long id,
            @RequestBody UploadCompleteRequest request,
            HttpSession session) {

        if (!isHost(session)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only HOST can upload comics."));
        }

        Comic comic = comicRepository.findById(id).orElse(null);
        if (comic == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Comic not found."));
        }

        if (request.panels() == null || request.panels().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "No uploaded panels were provided."));
        }

        List<String> paths = new ArrayList<>();
        try {
            if (request.coverPath() != null && !request.coverPath().isBlank()) {
                if (!comicFileService.isOwnedPath(id, request.coverPath())) {
                    throw new IOException("Invalid cover storage path.");
                }
                comic.setImageUrl(comicFileService.publicUrl(request.coverPath()));
                paths.add(request.coverPath());
            }

            comicPageRepository.deleteByComicId(id);

            int pageNumber = 1;
            for (String path : request.panels()) {
                if (!comicFileService.isOwnedPath(id, path)) {
                    throw new IOException("Invalid comic panel storage path.");
                }

                ComicPage page = new ComicPage();
                page.setComic(comic);
                page.setPageNumber(pageNumber++);
                page.setImageUrl(comicFileService.publicUrl(path));
                comicPageRepository.save(page);
                paths.add(path);
            }

            comic.setTotalPages(request.panels().size());
            Comic saved = comicRepository.save(comic);

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (Exception e) {
            try {
                comicPageRepository.deleteByComicId(id);
                comicRepository.deleteById(id);
            } catch (Exception ignored) {
            }

            String message = e.getMessage();
            if (message == null || message.isBlank()) {
                message = "Unable to complete comic upload.";
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", message));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateComic(
            @PathVariable Long id,
            @RequestBody Comic details,
            HttpSession session) {

        if (!isHost(session)) {
            return ResponseEntity.status(403)
                    .body(Map.of("message", "Only HOST can edit comics."));
        }

        Comic comic = comicRepository.findById(id).orElse(null);
        if (comic == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Comic not found."));
        }

        if (details.getTitle() != null && !details.getTitle().trim().isEmpty()) {
            comic.setTitle(details.getTitle().trim());
        }
        if (details.getAuthor() != null && !details.getAuthor().trim().isEmpty()) {
            comic.setAuthor(details.getAuthor().trim());
        }
        comic.setDescription(details.getDescription());

        return ResponseEntity.ok(comicRepository.save(comic));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComic(
            @PathVariable Long id,
            HttpSession session) {

        if (!isHost(session)) {
            return ResponseEntity.status(403)
                    .body(Map.of("message", "Only HOST can delete comics."));
        }

        Comic comic = comicRepository.findById(id).orElse(null);
        if (comic == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            List<String> paths = new ArrayList<>();
            comicPageRepository.findByComicIdOrderByPageNumberAsc(id)
                    .forEach(page -> {
                        String url = page.getImageUrl();
                        String prefix = "/storage/v1/object/public/";
                        int index = url == null ? -1 : url.indexOf(prefix);
                        if (index >= 0) {
                            String path = url.substring(index + prefix.length());
                            int slash = path.indexOf('/');
                            if (slash >= 0) {
                                paths.add(path.substring(slash + 1));
                            }
                        }
                    });

            if (comic.getImageUrl() != null) {
                String prefix = "/storage/v1/object/public/";
                int index = comic.getImageUrl().indexOf(prefix);
                if (index >= 0) {
                    String path = comic.getImageUrl().substring(index + prefix.length());
                    int slash = path.indexOf('/');
                    if (slash >= 0) {
                        paths.add(path.substring(slash + 1));
                    }
                }
            }

            comicPageRepository.deleteByComicId(id);
            comicRepository.delete(comic);
            return ResponseEntity.ok(Map.of("message", "Comic deleted successfully."));

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Comic was deleted, but its files could not be removed."));
        }
    }

    private void cleanupComic(Long id) {
        if (id == null) {
            return;
        }
        try {
            comicPageRepository.deleteByComicId(id);
            comicRepository.deleteById(id);
        } catch (Exception ignored) {
        }
    }

    private boolean isImage(String contentType) {
        return contentType != null && contentType.toLowerCase().startsWith("image/");
    }

    public record FileInfo(String name, String contentType, long size) {}

    public record UploadInitRequest(
            String title,
            String author,
            String description,
            FileInfo cover,
            List<FileInfo> panels) {}

    public record UploadInitResponse(
            Long comicId,
            Object cover,
            List<Object> panels) {}

    public record UploadCompleteRequest(
            String coverPath,
            List<String> panels) {}
}
