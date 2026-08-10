package com.comic.comicreader.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.comic.comicreader.model.Comic;
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
            ComicPageRepository comicPageRepository) {

        this.comicRepository = comicRepository;
        this.comicPageRepository = comicPageRepository;
    }

    @GetMapping
    public List<Comic> getAllComics() {
        return comicRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comic> getComicById(
            @PathVariable Long id) {

        return comicRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Comic createComic(
            @RequestBody Comic comic) {

        return comicRepository.save(comic);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Comic> updateComic(
            @PathVariable Long id,
            @RequestBody Comic comicDetails) {

        return comicRepository.findById(id)
                .map(comic -> {

                    comic.setTitle(comicDetails.getTitle());
                    comic.setAuthor(comicDetails.getAuthor());
                    comic.setDescription(
                            comicDetails.getDescription()
                    );
                    comic.setImageUrl(
                            comicDetails.getImageUrl()
                    );

                    Comic updatedComic =
                            comicRepository.save(comic);

                    return ResponseEntity.ok(updatedComic);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteComic(
            @PathVariable Long id) {

        if (!comicRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        comicPageRepository.deleteByComicId(id);

        comicRepository.deleteById(id);

        return ResponseEntity.ok(
                "Comic and all pages deleted successfully"
        );
    }
}