package com.comic.comicreader.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.comic.comicreader.model.Comic;

public interface ComicRepository extends JpaRepository<Comic, Long> {
}