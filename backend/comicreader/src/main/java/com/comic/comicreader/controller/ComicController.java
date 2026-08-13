package com.comic.comicreader.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.comic.comicreader.model.Comic;
import com.comic.comicreader.model.ComicPage;
import com.comic.comicreader.repository.ComicPageRepository;
import com.comic.comicreader.repository.ComicRepository;

@RestController
@RequestMapping("/api/comics")
@CrossOrigin(origins = "http://localhost:5173")
public class ComicController {

    private final ComicRepository comicRepository;

    private final ComicPageRepository comicPageRepository;

    public ComicController(
            ComicRepository comicRepository,
            ComicPageRepository comicPageRepository
    ) {
        this.comicRepository = comicRepository;
        this.comicPageRepository = comicPageRepository;
    }

    // Get all comics
    @GetMapping
    public List<Comic> getAllComics() {

        return comicRepository.findAll();
    }

    // Add a comic manually
    @PostMapping
    public ResponseEntity<Comic> createComic(
            @RequestBody Comic comic
    ) {

        Comic savedComic =
                comicRepository.save(comic);

        return ResponseEntity.ok(savedComic);
    }

    // Get one comic
    @GetMapping("/{id}")
    public ResponseEntity<Comic> getComic(
            @PathVariable Long id
    ) {

        return comicRepository
                .findById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }

    // Get comic panels/pages
    @GetMapping("/{id}/pages")
    public ResponseEntity<List<ComicPage>> getComicPages(
            @PathVariable Long id
    ) {

        if (!comicRepository.existsById(id)) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        List<ComicPage> pages =
                comicPageRepository
                        .findByComicIdOrderByPageNumberAsc(id);

        return ResponseEntity.ok(pages);
    }

    // Delete comic
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteComic(
            @PathVariable Long id
    ) {

        if (!comicRepository.existsById(id)) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        // Delete comic pages first
        comicPageRepository.deleteByComicId(id);

        // Delete comic
        comicRepository.deleteById(id);

        return ResponseEntity.ok(
                "Comic deleted successfully"
        );
    }
}