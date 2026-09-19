package com.comic.comicreader.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class ComicController {

    private final ComicRepository comicRepository;
    private final ComicPageRepository comicPageRepository;
    private final ComicFileService fileService;

    public ComicController(
            ComicRepository comicRepository,
            ComicPageRepository comicPageRepository,
            ComicFileService fileService
    ) {
        this.comicRepository = comicRepository;
        this.comicPageRepository = comicPageRepository;
        this.fileService = fileService;
    }

    @GetMapping
    public List<Comic> getAllComics() {
        return comicRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comic> getComic(
            @PathVariable Long id
    ) {

        return comicRepository
                .findById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }

    @GetMapping("/{id}/pages")
    public ResponseEntity<List<ComicPage>> getComicPages(
            @PathVariable Long id
    ) {

        if (!comicRepository.existsById(id)) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(
                comicPageRepository
                        .findByComicIdOrderByPageNumberAsc(id)
        );
    }

    @PostMapping(
            value = "/upload",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> uploadComic(

            @RequestParam("title")
            String title,

            @RequestParam("author")
            String author,

            @RequestParam(
                    value = "description",
                    required = false
            )
            String description,

            @RequestParam(
                    value = "cover",
                    required = false
            )
            MultipartFile cover,

            @RequestParam(
                    value = "panels",
                    required = false
            )
            MultipartFile[] panels,

            HttpSession session
    ) {

        if (!isHost(session)) {
            return ResponseEntity
                    .status(403)
                    .body(
                            "Only the HOST can upload comics."
                    );
        }

        try {

            if (title == null ||
                    title.trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Comic title is required."
                        );
            }

            if (author == null ||
                    author.trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Author is required."
                        );
            }

            if (panels == null ||
                    panels.length == 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Please select at least one comic panel."
                        );
            }

            Comic comic = new Comic();

            comic.setTitle(title.trim());
            comic.setAuthor(author.trim());

            comic.setDescription(
                    description == null
                            ? ""
                            : description.trim()
            );

            Comic savedComic =
                    comicRepository.save(comic);

            Long comicId =
                    savedComic.getId();

            Path comicFolder =
                    fileService.createComicFolder(
                            comicId
                    );

            if (cover != null &&
                    !cover.isEmpty()) {

                String coverName =
                        "cover" +
                        getExtension(
                                cover.getOriginalFilename()
                        );

                fileService.saveFile(
                        cover,
                        comicFolder,
                        coverName
                );

                savedComic.setImageUrl(
                        "/uploads/"
                                + comicId
                                + "/"
                                + coverName
                );
            }

            int validPages = 0;

            for (int i = 0;
                    i < panels.length;
                    i++) {

                MultipartFile panel =
                        panels[i];

                if (panel == null ||
                        panel.isEmpty()) {

                    continue;
                }

                validPages++;

                String panelName =
                        "page-" +
                        (i + 1) +
                        getExtension(
                                panel.getOriginalFilename()
                        );

                fileService.saveFile(
                        panel,
                        comicFolder,
                        panelName
                );

                ComicPage comicPage =
                        new ComicPage();

                comicPage.setComicId(
                        comicId
                );

                comicPage.setPageNumber(
                        i + 1
                );

                comicPage.setImageUrl(
                        "/uploads/"
                                + comicId
                                + "/"
                                + panelName
                );

                comicPageRepository.save(
                        comicPage
                );
            }

            savedComic.setTotalPages(
                    validPages
            );

            savedComic =
                    comicRepository.save(
                            savedComic
                    );

            return ResponseEntity.ok(
                    savedComic
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Failed to upload comic: "
                                    + e.getMessage()
                    );
        }
    }

    @PutMapping(
            value = "/{id}",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<?> editComic(

            @PathVariable Long id,

            @RequestParam("title")
            String title,

            @RequestParam("author")
            String author,

            @RequestParam(
                    value = "description",
                    required = false
            )
            String description,

            @RequestParam(
                    value = "cover",
                    required = false
            )
            MultipartFile cover,

            HttpSession session
    ) {

        if (!isHost(session)) {
            return ResponseEntity
                    .status(403)
                    .body(
                            "Only the HOST can edit comics."
                    );
        }

        try {

            Comic comic =
                    comicRepository
                            .findById(id)
                            .orElse(null);

            if (comic == null) {
                return ResponseEntity
                        .notFound()
                        .build();
            }

            if (title == null ||
                    title.trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Comic title is required."
                        );
            }

            if (author == null ||
                    author.trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Author is required."
                        );
            }

            comic.setTitle(title.trim());
            comic.setAuthor(author.trim());

            comic.setDescription(
                    description == null
                            ? ""
                            : description.trim()
            );

            if (cover != null &&
                    !cover.isEmpty()) {

                Path comicFolder =
                        fileService
                                .createComicFolder(id);

                String oldImageUrl =
                        comic.getImageUrl();

                if (oldImageUrl != null &&
                        !oldImageUrl.isBlank()) {

                    String oldFileName =
                            oldImageUrl.substring(
                                    oldImageUrl
                                            .lastIndexOf("/")
                                            + 1
                            );

                    Path oldFile =
                            comicFolder
                                    .resolve(
                                            oldFileName
                                    )
                                    .normalize();

                    if (oldFile.startsWith(
                            comicFolder
                    )) {

                        Files.deleteIfExists(
                                oldFile
                        );
                    }
                }

                String newCoverName =
                        "cover" +
                        getExtension(
                                cover.getOriginalFilename()
                        );

                fileService.saveFile(
                        cover,
                        comicFolder,
                        newCoverName
                );

                comic.setImageUrl(
                        "/uploads/"
                                + id
                                + "/"
                                + newCoverName
                );
            }

            Comic updatedComic =
                    comicRepository.save(
                            comic
                    );

            return ResponseEntity.ok(
                    updatedComic
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Failed to edit comic: "
                                    + e.getMessage()
                    );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteComic(

            @PathVariable Long id,

            HttpSession session
    ) {

        if (!isHost(session)) {
            return ResponseEntity
                    .status(403)
                    .body(
                            "Only the HOST can delete comics."
                    );
        }

        if (!comicRepository.existsById(id)) {
            return ResponseEntity
                    .notFound()
                    .build();
        }

        comicPageRepository.deleteByComicId(id);

        comicRepository.deleteById(id);

        fileService.deleteComicFolder(id);

        return ResponseEntity.ok(
                "Comic deleted successfully"
        );
    }

    private boolean isHost(
            HttpSession session
    ) {

        return "HOST".equals(
                session.getAttribute("role")
        );
    }

    private String getExtension(
            String fileName
    ) {

        if (fileName == null ||
                fileName.isBlank()) {

            return ".jpg";
        }

        int dot =
                fileName.lastIndexOf(".");

        if (dot == -1) {
            return ".jpg";
        }

        return fileName.substring(dot);
    }
}