import React, {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";
import "./ComicReader.css";
import { API_BASE_URL } from "../config";

export default function ComicReader({
    user,
    onSignIn,
    onSignOut,
    onBack,
    onUpload,
    onEdit
}) {
    const [comics, setComics] = useState([]);
    const [filteredComics, setFilteredComics] = useState([]);
    const [search, setSearch] = useState("");

    const [selectedComic, setSelectedComic] = useState(null);
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);

    const [loading, setLoading] = useState(true);
    const [loadingPages, setLoadingPages] = useState(false);
    const [loadingImage, setLoadingImage] = useState(false);

    const [error, setError] = useState("");
    const [isFullscreen, setIsFullscreen] = useState(false);

    const readerRef = useRef(null);

    const preloadedImagesRef = useRef(new Set());
    const loadingImagesRef = useRef(new Set());

    useEffect(() => {
        loadComics();
    }, []);

    useEffect(() => {
        const value = search.trim().toLowerCase();

        if (!value) {
            setFilteredComics(comics);
            return;
        }

        setFilteredComics(
            comics.filter(comic =>
                comic.title
                    ?.toLowerCase()
                    .includes(value) ||
                comic.author
                    ?.toLowerCase()
                    .includes(value)
            )
        );
    }, [search, comics]);

    const getImageUrl = useCallback(url => {
        if (!url) {
            return "";
        }

        if (
            url.startsWith("http://") ||
            url.startsWith("https://")
        ) {
            return url;
        }

        return `${API_BASE_URL}${url}`;
    }, []);

    const preloadPage = useCallback(
        page => {
            if (!page?.imageUrl) {
                return;
            }

            const imageUrl = getImageUrl(page.imageUrl);

            if (!imageUrl) {
                return;
            }

            if (
                preloadedImagesRef.current.has(
                    imageUrl
                )
            ) {
                return;
            }

            if (
                loadingImagesRef.current.has(
                    imageUrl
                )
            ) {
                return;
            }

            loadingImagesRef.current.add(
                imageUrl
            );

            const image = new Image();

            image.decoding = "async";

            image.onload = () => {
                loadingImagesRef.current.delete(
                    imageUrl
                );

                preloadedImagesRef.current.add(
                    imageUrl
                );
            };

            image.onerror = () => {
                loadingImagesRef.current.delete(
                    imageUrl
                );
            };

            image.src = imageUrl;
        },
        [getImageUrl]
    );

    const preloadAroundPage = useCallback(
        pageIndex => {
            if (!pages.length) {
                return;
            }

            const indexes = [
                pageIndex - 1,
                pageIndex + 1,
                pageIndex + 2
            ];

            indexes.forEach(index => {
                if (
                    index >= 0 &&
                    index < pages.length
                ) {
                    preloadPage(pages[index]);
                }
            });
        },
        [pages, preloadPage]
    );

    const loadComics = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/api/comics`,
                {
                    method: "GET",
                    cache: "default"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to load comics"
                );
            }

            const data = await response.json();

            setComics(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (err) {
            console.error(err);
            setError(
                "Unable to connect to the comic library."
            );
        } finally {
            setLoading(false);
        }
    };

    const openComic = async comic => {
        try {
            setSelectedComic(comic);
            setPages([]);
            setCurrentPage(0);

            setLoadingPages(true);
            setLoadingImage(true);
            setError("");

            preloadedImagesRef.current.clear();
            loadingImagesRef.current.clear();

            const response = await fetch(
                `${API_BASE_URL}/api/comics/${comic.id}/pages`,
                {
                    method: "GET",
                    cache: "default"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to load comic pages"
                );
            }

            const data = await response.json();

            const comicPages =
                Array.isArray(data)
                    ? data
                    : [];

            setPages(comicPages);
            setLoadingPages(false);

            if (comicPages.length > 0) {
                preloadPage(comicPages[0]);

                if (comicPages[1]) {
                    preloadPage(
                        comicPages[1]
                    );
                }

                if (comicPages[2]) {
                    preloadPage(
                        comicPages[2]
                    );
                }
            } else {
                setLoadingImage(false);
            }
        } catch (err) {
            console.error(err);

            setError(
                "Unable to load comic pages."
            );

            setLoadingPages(false);
            setLoadingImage(false);
        }
    };

    const closeReader = () => {
        setSelectedComic(null);
        setPages([]);
        setCurrentPage(0);
        setLoadingImage(false);

        preloadedImagesRef.current.clear();
        loadingImagesRef.current.clear();

        if (document.fullscreenElement) {
            document
                .exitFullscreen()
                .catch(() => {});
        }
    };

    const nextPage = useCallback(() => {
        setCurrentPage(current => {
            if (
                current >=
                pages.length - 1
            ) {
                return current;
            }

            const next = current + 1;

            if (pages[next]) {
                preloadPage(
                    pages[next]
                );
            }

            if (pages[next + 1]) {
                preloadPage(
                    pages[next + 1]
                );
            }

            if (pages[next + 2]) {
                preloadPage(
                    pages[next + 2]
                );
            }

            return next;
        });
    }, [pages, preloadPage]);

    const previousPage = useCallback(() => {
        setCurrentPage(current => {
            if (current <= 0) {
                return current;
            }

            const previous =
                current - 1;

            if (pages[previous]) {
                preloadPage(
                    pages[previous]
                );
            }

            if (pages[previous - 1]) {
                preloadPage(
                    pages[previous - 1]
                );
            }

            return previous;
        });
    }, [pages, preloadPage]);

    const toggleFullscreen = useCallback(
        async () => {
            try {
                if (
                    !document.fullscreenElement
                ) {
                    if (
                        readerRef.current
                    ) {
                        await readerRef.current.requestFullscreen();
                    }
                } else {
                    await document.exitFullscreen();
                }
            } catch (err) {
                console.error(
                    "Fullscreen error:",
                    err
                );
            }
        },
        []
    );

    useEffect(() => {
        const handleKeyDown = event => {
            if (!selectedComic) {
                return;
            }

            if (
                event.target.tagName ===
                    "INPUT" ||
                event.target.tagName ===
                    "TEXTAREA"
            ) {
                return;
            }

            if (
                event.key ===
                "ArrowRight"
            ) {
                event.preventDefault();
                nextPage();
            }

            if (
                event.key ===
                "ArrowLeft"
            ) {
                event.preventDefault();
                previousPage();
            }

            if (
                event.key.toLowerCase() ===
                "f"
            ) {
                event.preventDefault();
                toggleFullscreen();
            }

            if (
                event.key === "Escape" &&
                document.fullscreenElement
            ) {
                document.exitFullscreen();
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        selectedComic,
        nextPage,
        previousPage,
        toggleFullscreen
    ]);

    useEffect(() => {
        const fullscreenChanged = () => {
            setIsFullscreen(
                document.fullscreenElement !==
                    null
            );
        };

        document.addEventListener(
            "fullscreenchange",
            fullscreenChanged
        );

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                fullscreenChanged
            );
        };
    }, []);

    useEffect(() => {
        if (
            selectedComic &&
            pages.length > 0
        ) {
            preloadAroundPage(
                currentPage
            );
        }
    }, [
        selectedComic,
        pages,
        currentPage,
        preloadAroundPage
    ]);

    const handleReaderClick = event => {
        if (!pages.length) {
            return;
        }

        const width = window.innerWidth;
        const x = event.clientX;

        if (x < width * 0.28) {
            previousPage();
        } else if (
            x > width * 0.72
        ) {
            nextPage();
        }
    };

    const deleteComic = async comic => {
        if (
            !user ||
            user.role !== "HOST"
        ) {
            return;
        }

        const confirmed =
            window.confirm(
                `Delete "${comic.title}"? This cannot be undone.`
            );

        if (!confirmed) {
            return;
        }

        try {
            const response =
                await fetch(
                    `${API_BASE_URL}/api/comics/${comic.id}`,
                    {
                        method: "DELETE",
                        credentials:
                            "include"
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Delete failed"
                );
            }

            setComics(prev =>
                prev.filter(
                    item =>
                        item.id !==
                        comic.id
                )
            );

            if (
                selectedComic?.id ===
                comic.id
            ) {
                closeReader();
            }
        } catch (err) {
            alert(
                err.message ||
                    "Unable to delete comic."
            );
        }
    };

    if (selectedComic) {
        const currentImageUrl =
            pages[currentPage]
                ? getImageUrl(
                      pages[currentPage]
                          .imageUrl
                  )
                : "";

        return (
            <div
                ref={readerRef}
                className="comic-reader"
            >
                <div className="reader-topbar">
                    <button
                        className="reader-back"
                        onClick={
                            closeReader
                        }
                    >
                        ←
                        <span>
                            Library
                        </span>
                    </button>

                    <div className="reader-center-title">
                        <small>
                            NOW READING
                        </small>

                        <strong>
                            {
                                selectedComic.title
                            }
                        </strong>
                    </div>

                    <button
                        className="fullscreen-button"
                        onClick={
                            toggleFullscreen
                        }
                    >
                        {isFullscreen
                            ? "EXIT"
                            : "FULLSCREEN"}
                    </button>
                </div>

                <div
                    className="reader-stage"
                    onClick={
                        handleReaderClick
                    }
                >
                    <div className="reader-glow"></div>

                    <button
                        className="reader-arrow reader-arrow-left"
                        onClick={event => {
                            event.stopPropagation();
                            previousPage();
                        }}
                        disabled={
                            currentPage ===
                            0
                        }
                    >
                        ‹
                    </button>

                    {loadingPages ? (
                        <div className="reader-loading">
                            <div className="loading-ring"></div>

                            <span>
                                Opening comic...
                            </span>
                        </div>
                    ) : pages.length ===
                      0 ? (
                        <div className="reader-loading">
                            <span>
                                No pages found.
                            </span>
                        </div>
                    ) : (
                        <>
                            <div className="comic-page-frame">
                                {loadingImage && (
                                    <div className="reader-image-loading">
                                        <div className="loading-ring"></div>

                                        <span>
                                            Loading page{" "}
                                            {currentPage +
                                                1}
                                            ...
                                        </span>
                                    </div>
                                )}

                                <img
                                    key={
                                        currentImageUrl
                                    }
                                    src={
                                        currentImageUrl
                                    }
                                    alt={`Page ${
                                        currentPage +
                                        1
                                    }`}
                                    className={`reader-page ${
                                        loadingImage
                                            ? "page-loading"
                                            : "page-loaded"
                                    }`}
                                    loading="eager"
                                    decoding="async"
                                    fetchPriority="high"
                                    onLoad={() => {
                                        setLoadingImage(
                                            false
                                        );
                                    }}
                                    onError={() => {
                                        setLoadingImage(
                                            false
                                        );
                                        setError(
                                            "Unable to load this comic page."
                                        );
                                    }}
                                />
                            </div>

                            <div className="reader-page-number">
                                {String(
                                    currentPage +
                                        1
                                ).padStart(
                                    2,
                                    "0"
                                )}
                            </div>
                        </>
                    )}

                    <button
                        className="reader-arrow reader-arrow-right"
                        onClick={event => {
                            event.stopPropagation();
                            nextPage();
                        }}
                        disabled={
                            pages.length ===
                                0 ||
                            currentPage ===
                                pages.length -
                                    1
                        }
                    >
                        ›
                    </button>

                    <div className="reader-hint">
                        <span>
                            ←
                        </span>

                        CLICK TO TURN

                        <span>
                            →
                        </span>
                    </div>
                </div>

                <div className="reader-bottom">
                    <button
                        onClick={
                            previousPage
                        }
                        disabled={
                            currentPage ===
                            0
                        }
                    >
                        ← PREVIOUS
                    </button>

                    <div className="reader-progress">
                        <div className="progress-text">
                            <strong>
                                {pages.length
                                    ? currentPage +
                                      1
                                    : 0}
                            </strong>

                            <span>
                                /
                                {pages.length ||
                                    0}
                            </span>
                        </div>

                        <div className="progress-track">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${
                                        pages.length
                                            ? ((currentPage +
                                                  1) /
                                                  pages.length) *
                                              100
                                            : 0
                                    }%`
                                }}
                            ></div>
                        </div>
                    </div>

                    <button
                        onClick={
                            nextPage
                        }
                        disabled={
                            pages.length ===
                                0 ||
                            currentPage ===
                                pages.length -
                                    1
                        }
                    >
                        NEXT →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="library-page">
            <header className="library-header">
                <button
                    className="brand"
                    onClick={onBack}
                >
                    <span>
                        CITY
                    </span>

                    <strong>
                        OF COMICS
                    </strong>
                </button>

                <div className="header-actions">
                    <button
                        className="header-link"
                        onClick={onBack}
                    >
                        HOME
                    </button>

                    {user ? (
                        <>
                            {user.role ===
                                "HOST" && (
                                <button
                                    className="header-special"
                                    onClick={
                                        onUpload
                                    }
                                >
                                    + UPLOAD COMIC
                                </button>
                            )}

                            <span className="user-email">
                                {
                                    user.email
                                }
                            </span>

                            <button
                                className="header-link"
                                onClick={
                                    onSignOut
                                }
                            >
                                SIGN OUT
                            </button>
                        </>
                    ) : (
                        <button
                            className="header-special"
                            onClick={
                                onSignIn
                            }
                        >
                            SIGN IN
                        </button>
                    )}
                </div>
            </header>

            <main>
                <section className="library-hero">
                    <div className="hero-art hero-art-one"></div>
                    <div className="hero-art hero-art-two"></div>

                    <div className="hero-content">
                        <div className="hero-label">
                            <span></span>
                            THE DIGITAL COMIC UNIVERSE
                        </div>

                        <h1>
                            READ
                            <br />
                            <em>
                                ANOTHER
                            </em>
                            <br />
                            WORLD.
                        </h1>

                        <p>
                            Stories drawn
                            in ink.
                            <br />
                            Worlds waiting
                            to be discovered.
                        </p>

                        <div className="hero-line"></div>
                    </div>

                    <div className="hero-number">
                        01
                    </div>
                </section>

                <section className="collection-section">
                    <div className="collection-top">
                        <div>
                            <p className="eyebrow">
                                YOUR UNIVERSE
                            </p>

                            <h2>
                                Comic Collection
                            </h2>

                            <p className="collection-subtitle">
                                Choose a
                                story and
                                start
                                reading.
                            </p>
                        </div>

                        <div className="search-box">
                            <span>
                                ⌕
                            </span>

                            <input
                                type="text"
                                placeholder="Search title or author"
                                value={
                                    search
                                }
                                onChange={e =>
                                    setSearch(
                                        e.target
                                            .value
                                    )
                                }
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="empty-state">
                            <div className="loading-ring"></div>

                            <span>
                                Loading
                                collection...
                            </span>
                        </div>
                    ) : error ? (
                        <div className="empty-state error">
                            {
                                error
                            }
                        </div>
                    ) : filteredComics.length ===
                      0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                ◇
                            </div>

                            <h3>
                                No comics
                                found
                            </h3>

                            <p>
                                Your next
                                adventure
                                hasn't
                                arrived
                                yet.
                            </p>
                        </div>
                    ) : (
                        <div className="comic-grid">
                            {filteredComics.map(
                                (
                                    comic,
                                    index
                                ) => (
                                    <article
                                        className="comic-card"
                                        key={
                                            comic.id
                                        }
                                    >
                                        <div
                                            className="cover-wrapper"
                                            onClick={() =>
                                                openComic(
                                                    comic
                                                )
                                            }
                                        >
                                            <div className="card-number">
                                                {String(
                                                    index +
                                                        1
                                                ).padStart(
                                                    2,
                                                    "0"
                                                )}
                                            </div>

                                            {comic.imageUrl ? (
                                                <img
                                                    src={getImageUrl(
                                                        comic.imageUrl
                                                    )}
                                                    alt={
                                                        comic.title
                                                    }
                                                    className="comic-cover"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            ) : (
                                                <div className="cover-placeholder">
                                                    <span>
                                                        CITY
                                                    </span>

                                                    <strong>
                                                        OF COMICS
                                                    </strong>
                                                </div>
                                            )}

                                            <div className="cover-overlay">
                                                <div className="read-circle">
                                                    →
                                                </div>

                                                <span>
                                                    OPEN STORY
                                                </span>
                                            </div>
                                        </div>

                                        <div className="comic-info">
                                            <div>
                                                <h3>
                                                    {
                                                        comic.title
                                                    }
                                                </h3>

                                                <p>
                                                    {comic.author ||
                                                        "Unknown Author"}
                                                </p>
                                            </div>

                                            <span className="page-count">
                                                {comic.totalPages ||
                                                    0}{" "}
                                                PAGES
                                            </span>
                                        </div>

                                        {user?.role ===
                                            "HOST" && (
                                            <div className="comic-actions">
                                                <button
                                                    onClick={() =>
                                                        onEdit(
                                                            comic
                                                        )
                                                    }
                                                >
                                                    EDIT
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        deleteComic(
                                                            comic
                                                        )
                                                    }
                                                >
                                                    DELETE
                                                </button>
                                            </div>
                                        )}
                                    </article>
                                )
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}