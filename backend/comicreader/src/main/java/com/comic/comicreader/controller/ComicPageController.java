package com.comic.comicreader.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.comic.comicreader.model.ComicPage;
import com.comic.comicreader.repository.ComicPageRepository;

@RestController
@RequestMapping("/api/comics")
public class ComicPageController {

    private final ComicPageRepository comicPageRepository;

    public ComicPageController(
            ComicPageRepository comicPageRepository) {

        this.comicPageRepository =
                comicPageRepository;
    }

    @GetMapping("/{comicId}/pages")
    public List<ComicPage> getComicPages(
            @PathVariable Long comicId) {

        return comicPageRepository
                .findByComicIdOrderByPageNumberAsc(
                        comicId
                );
    }
}