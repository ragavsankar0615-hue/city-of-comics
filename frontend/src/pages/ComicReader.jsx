import React, { useEffect, useState } from "react";
import "./ComicReader.css";

function ComicReader({
    user,
    onSignOut,
    onBack,
    onUpload,
    onEdit,
    onDelete
}) {

    const [comics, setComics] = useState([]);
    const [selectedComic, setSelectedComic] =
        useState(null);

    const [pages, setPages] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [pageLoading, setPageLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [searchTerm, setSearchTerm] =
        useState("");

    const API_BASE_URL =
        "http://localhost:8080";

    const getImageUrl = (url) => {

        if (!url) {
            return "";
        }

        if (
            url.startsWith("http://") ||
            url.startsWith("https://")
        ) {
            return url;
        }

        if (url.startsWith("/")) {
            return `${API_BASE_URL}${url}`;
        }

        return `${API_BASE_URL}/${url}`;
    };

    const loadComics = async () => {

        setLoading(true);
        setError("");

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/comics`
                );

            if (!response.ok) {
                throw new Error(
                    "Unable to load comics."
                );
            }

            const data =
                await response.json();

            setComics(data);

        } catch (error) {

            console.error(error);

            setError(
                "Unable to connect to the comic server."
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        loadComics();

        const refresh =
            () => loadComics();

        window.addEventListener(
            "comicDeleted",
            refresh
        );

        window.addEventListener(
            "comicUpdated",
            refresh
        );

        window.addEventListener(
            "comicUploaded",
            refresh
        );

        return () => {

            window.removeEventListener(
                "comicDeleted",
                refresh
            );

            window.removeEventListener(
                "comicUpdated",
                refresh
            );

            window.removeEventListener(
                "comicUploaded",
                refresh
            );
        };

    }, []);

    const openComic = async (comic) => {

        setSelectedComic(comic);
        setPages([]);
        setPageLoading(true);
        setError("");

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/comics/${comic.id}/pages`
                );

            if (!response.ok) {
                throw new Error(
                    "Unable to load comic pages."
                );
            }

            const data =
                await response.json();

            setPages(data);

        } catch (error) {

            console.error(error);

            setError(
                "Unable to load the comic pages."
            );

        } finally {

            setPageLoading(false);
        }
    };

    const closeReader = () => {

        setSelectedComic(null);
        setPages([]);
        setError("");
    };

    const filteredComics =
        comics.filter((comic) => {

            const value =
                searchTerm
                    .trim()
                    .toLowerCase();

            if (!value) {
                return true;
            }

            return (
                comic.title
                    ?.toLowerCase()
                    .includes(value) ||
                comic.author
                    ?.toLowerCase()
                    .includes(value)
            );
        });

    if (selectedComic) {

        return (
            <div className="comic-reader-page">

                <header className="reader-header">

                    <button
                        className="reader-back"
                        onClick={closeReader}
                    >
                        ← Back to Collection
                    </button>

                    <div className="reader-title">
                        {selectedComic.title}
                    </div>

                    {user && (
                        <button
                            className="reader-signout"
                            onClick={onSignOut}
                        >
                            SIGN OUT
                        </button>
                    )}

                </header>

                <main className="panel-reader">

                    <div className="panel-heading">

                        <span>
                            {selectedComic.title}
                        </span>

                        <small>
                            {pages.length} Panels
                        </small>

                    </div>

                    {pageLoading && (
                        <div className="reader-message">
                            Loading panels...
                        </div>
                    )}

                    {!pageLoading &&
                        pages.length === 0 && (
                            <div className="reader-message">
                                No comic panels have been added yet.
                            </div>
                        )}

                    {error && (
                        <div className="collection-error">
                            {error}
                        </div>
                    )}

                    <div className="comic-panels">

                        {pages.map(
                            (page, index) => (

                                <div
                                    className="comic-panel"
                                    key={
                                        page.id ||
                                        page.pageNumber ||
                                        index
                                    }
                                >

                                    {page.imageUrl ? (

                                        <img
                                            src={getImageUrl(
                                                page.imageUrl
                                            )}
                                            alt={`${selectedComic.title} panel ${
                                                page.pageNumber ||
                                                index + 1
                                            }`}
                                            loading="lazy"
                                        />

                                    ) : (

                                        <div className="panel-placeholder">
                                            Panel{" "}
                                            {page.pageNumber ||
                                                index + 1}
                                        </div>

                                    )}

                                </div>

                            )
                        )}

                    </div>

                </main>

            </div>
        );
    }

    return (
        <div className="comic-reader-page">

            <header className="reader-header">

                <button
                    className="reader-brand"
                    onClick={onBack}
                >

                    <div className="small-logo">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <span>
                        City of Comics
                    </span>

                </button>

                <div className="reader-search">

                    <input
                        type="text"
                        value={searchTerm}
                        placeholder="Enter comics to search"
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                    />

                    <span>🔍</span>

                </div>

                <div className="reader-actions">

                    {user && (
                        <span className="reader-email">
                            {user.email}
                        </span>
                    )}

                    {user?.role === "HOST" && (
                        <span className="host-badge">
                            👑 HOST
                        </span>
                    )}

                    <button
                        className="reader-read-button"
                        onClick={() =>
                            setSelectedComic(null)
                        }
                    >
                        📖 Read Comics
                    </button>

                    {user?.role === "HOST" && (
                        <button
                            className="upload-button"
                            onClick={onUpload}
                        >
                            + Add Comic
                        </button>
                    )}

                    {user && (
                        <button
                            className="reader-signout"
                            onClick={onSignOut}
                        >
                            SIGN OUT
                        </button>
                    )}

                </div>

            </header>

            <main className="collection">

                <div className="collection-heading">

                    <span>
                        COLLECTION
                    </span>

                    <h1>
                        Read Comics
                    </h1>

                    <p>
                        Explore our collection and discover
                        your next story.
                    </p>

                </div>

                {loading && (
                    <div className="collection-message">
                        Loading comics...
                    </div>
                )}

                {error && (
                    <div className="collection-error">
                        {error}
                    </div>
                )}

                {!loading &&
                    !error &&
                    filteredComics.length === 0 && (

                        <div className="empty-collection">

                            <h2>
                                No comics found
                            </h2>

                            <p>
                                Try another search.
                            </p>

                            {user?.role === "HOST" && (
                                <button
                                    onClick={onUpload}
                                >
                                    + Add Comic
                                </button>
                            )}

                        </div>
                    )}

                <div className="comic-grid">

                    {filteredComics.map(
                        (comic) => (

                            <article
                                className="comic-card"
                                key={comic.id}
                            >

                                <div className="comic-image">

                                    {comic.imageUrl ? (

                                        <img
                                            src={getImageUrl(
                                                comic.imageUrl
                                            )}
                                            alt={comic.title}
                                            loading="lazy"
                                        />

                                    ) : (

                                        <div className="comic-image-placeholder">
                                            <span>
                                                📚
                                            </span>
                                        </div>

                                    )}

                                </div>

                                <div className="comic-info">

                                    <h2>
                                        {comic.title}
                                    </h2>

                                    <h4>
                                        By {comic.author}
                                    </h4>

                                    <p>
                                        {comic.description ||
                                            "Discover this comic and start reading."}
                                    </p>

                                    <button
                                        onClick={() =>
                                            openComic(
                                                comic
                                            )
                                        }
                                    >
                                        Read Comic →
                                    </button>

                                    {user?.role ===
                                        "HOST" && (
                                        <div className="comic-management">

                                            <button
                                                className="edit-comic-button"
                                                onClick={() =>
                                                    onEdit(
                                                        comic
                                                    )
                                                }
                                            >
                                                ✏️ Edit
                                            </button>

                                            <button
                                                className="delete-comic-button"
                                                onClick={() =>
                                                    onDelete(
                                                        comic
                                                    )
                                                }
                                            >
                                                🗑️ Delete
                                            </button>

                                        </div>
                                    )}

                                </div>

                            </article>

                        )
                    )}

                </div>

            </main>

        </div>
    );
}

export default ComicReader;