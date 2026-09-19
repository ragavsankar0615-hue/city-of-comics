package com.comic.comicreader.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.comic.comicreader.model.Comic;
import com.comic.comicreader.repository.ComicPageRepository;
import com.comic.comicreader.repository.ComicRepository;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/comics")
public class ComicController {

    private final ComicRepository comicRepository;
    private final ComicPageRepository comicPageRepository;
    public ComicController(
            ComicRepository comicRepository,
            ComicPageRepository comicPageRepository) {

        this.comicRepository = comicRepository;
        this.comicPageRepository = comicPageRepository;
    }

    private boolean isHost(HttpSession session) {

        Object role = session.getAttribute("role");

        return role != null &&
                "HOST".equalsIgnoreCase(role.toString());
    }

    @GetMapping
    public List<Comic> getAllComics() {

        return comicRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getComic(
            @PathVariable Long id) {

        Comic comic = comicRepository
                .findById(id)
                .orElse(null);

        if (comic == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(comic);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateComic(
            @PathVariable Long id,
            @RequestBody Comic details,
            HttpSession session) {

        if (!isHost(session)) {

            return ResponseEntity
                    .status(403)
                    .body(Map.of(
                            "message",
                            "Only HOST can edit comics."
                    ));
        }

        Comic comic = comicRepository
                .findById(id)
                .orElse(null);

        if (comic == null) {

            return ResponseEntity
                    .status(404)
                    .body(Map.of(
                            "message",
                            "Comic not found."
                    ));
        }

        if (details.getTitle() != null &&
                !details.getTitle().trim().isEmpty()) {

            comic.setTitle(details.getTitle().trim());
        }

        if (details.getAuthor() != null &&
                !details.getAuthor().trim().isEmpty()) {

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

            return ResponseEntity
                    .status(403)
                    .body(Map.of(
                            "message",
                            "Only HOST can delete comics."
                    ));
        }

        Comic comic = comicRepository
                .findById(id)
                .orElse(null);

        if (comic == null) {

            return ResponseEntity.notFound().build();
        }

        comicPageRepository.deleteByComicId(id);

        comicRepository.delete(comic);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Comic deleted successfully."
                )
        );
    }
}