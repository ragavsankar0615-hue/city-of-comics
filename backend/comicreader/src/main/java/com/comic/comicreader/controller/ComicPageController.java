package com.comic.comicreader.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.comic.comicreader.model.ComicPage;
import com.comic.comicreader.repository.ComicPageRepository;

@RestController
@RequestMapping("/api/comics/pages")
@CrossOrigin(origins = "http://localhost:5173")
public class ComicPageController {

    private final ComicPageRepository comicPageRepository;

    public ComicPageController(
            ComicPageRepository comicPageRepository) {

        this.comicPageRepository = comicPageRepository;
    }

    @GetMapping("/{comicId}")
    public List<ComicPage> getComicPages(
            @PathVariable Long comicId) {

        return comicPageRepository
                .findByComicIdOrderByPageNumberAsc(comicId);
    }
}