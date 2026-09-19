package com.comic.comicreader.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "comic_pages")
public class ComicPage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer pageNumber;

    @Column(nullable = false)
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "comic_id", nullable = false)
    private Comic comic;

    public ComicPage() {
    }

    public Long getId() {
        return id;
    }

    public Integer getPageNumber() {
        return pageNumber;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Comic getComic() {
        return comic;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setPageNumber(Integer pageNumber) {
        this.pageNumber = pageNumber;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setComic(Comic comic) {
        this.comic = comic;
    }
}