package com.comic.comicreader.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.comic.comicreader.model.ComicPage;

public interface ComicPageRepository
        extends JpaRepository<ComicPage, Long> {

    List<ComicPage>
    findByComicIdOrderByPageNumberAsc(
            Long comicId
    );

    void deleteByComicId(Long comicId);
}