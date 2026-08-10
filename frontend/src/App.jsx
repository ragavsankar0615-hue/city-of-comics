import React, { useEffect, useState } from "react";
import "./App.css";

import ComicReader from "./pages/ComicReader";
import SignIn from "./pages/SignIn";

const API_URL = "http://localhost:8081";

function App() {
    const [comics, setComics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [currentPage, setCurrentPage] = useState("read");
    const [selectedComic, setSelectedComic] = useState(null);

    const [search, setSearch] = useState("");

    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("comicUser");

            return savedUser
                ? JSON.parse(savedUser)
                : null;
        } catch {
            return null;
        }
    });

    // =========================================
    // LOAD COMICS
    // =========================================

    const loadComics = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/api/comics`
            );

            if (!response.ok) {
                throw new Error(
                    `Server returned ${response.status}`
                );
            }

            const data = await response.json();

            if (Array.isArray(data)) {
                setComics(data);
            } else {
                setComics([]);
            }

        } catch (err) {
            console.error("Comic loading error:", err);

            setError(
                "Unable to connect to the comic server."
            );

        } finally {
            setLoading(false);
        }
    };

    // =========================================
    // LOAD COMICS WHEN APP STARTS
    // =========================================

    useEffect(() => {
        loadComics();
    }, []);

    // =========================================
    // OPEN READ PAGE
    // =========================================

    const openRead = () => {
        setSelectedComic(null);
        setCurrentPage("read");
    };

    // =========================================
    // OPEN SIGN IN
    // =========================================

    const openSignIn = () => {
        setSelectedComic(null);
        setCurrentPage("signin");
    };

    // =========================================
    // OPEN COMIC
    // =========================================

    const openComic = (comic) => {
        setSelectedComic(comic);
        setCurrentPage("reader");
    };

    // =========================================
    // LOGIN
    // =========================================

    const handleLogin = (loggedUser) => {
        setUser(loggedUser);

        localStorage.setItem(
            "comicUser",
            JSON.stringify(loggedUser)
        );

        setCurrentPage("read");
    };

    // =========================================
    // LOGOUT
    // =========================================

    const handleLogout = () => {
        localStorage.removeItem("comicUser");

        setUser(null);

        setCurrentPage("read");
    };

    // =========================================
    // FILTER COMICS
    // =========================================

    const filteredComics = comics.filter((comic) => {
        const searchText = search
            .toLowerCase()
            .trim();

        if (!searchText) {
            return true;
        }

        const title =
            comic.title?.toLowerCase() || "";

        const author =
            comic.author?.toLowerCase() || "";

        const description =
            comic.description?.toLowerCase() || "";

        return (
            title.includes(searchText) ||
            author.includes(searchText) ||
            description.includes(searchText)
        );
    });

    // =========================================
    // READER PAGE
    // =========================================

    if (
        currentPage === "reader" &&
        selectedComic
    ) {
        return (
            <div className="app">

                <Header
                    search={search}
                    setSearch={setSearch}
                    currentPage={currentPage}
                    openRead={openRead}
                    openSignIn={openSignIn}
                    user={user}
                    onLogout={handleLogout}
                />

                <ComicReader
                    comic={selectedComic}
                    onBack={openRead}
                />

            </div>
        );
    }

    // =========================================
    // SIGN IN PAGE
    // =========================================

    if (currentPage === "signin") {
        return (
            <div className="app">

                <Header
                    search={search}
                    setSearch={setSearch}
                    currentPage={currentPage}
                    openRead={openRead}
                    openSignIn={openSignIn}
                    user={user}
                    onLogout={handleLogout}
                />

                <SignIn
                    onBack={openRead}
                    onLogin={handleLogin}
                />

            </div>
        );
    }

    // =========================================
    // MAIN READ PAGE
    // =========================================

    return (
        <div className="app">

            <Header
                search={search}
                setSearch={setSearch}
                currentPage={currentPage}
                openRead={openRead}
                openSignIn={openSignIn}
                user={user}
                onLogout={handleLogout}
            />

            <main className="home-page">

                {/* HERO */}

                <section className="hero-section">

                    <div className="hero-badge">
                        📚 YOUR COMIC LIBRARY
                    </div>

                    <h1>
                        Read Comics
                    </h1>

                    <p>
                        Discover and read your favorite
                        comics
                    </p>

                </section>


                {/* COMIC LIBRARY */}

                <section className="library-section">

                    <div className="section-heading">

                        <div>
                            <h2>
                                Comic Library
                            </h2>

                            <p>
                                Browse your collection
                            </p>
                        </div>

                        <div className="comic-count">
                            {filteredComics.length} comics
                        </div>

                    </div>


                    {/* LOADING */}

                    {loading && (
                        <div className="status-message">
                            <div className="loading-spinner"></div>

                            <p>
                                Loading comics...
                            </p>
                        </div>
                    )}


                    {/* ERROR */}

                    {!loading && error && (
                        <div className="error-box">

                            <div className="error-icon">
                                ⚠️
                            </div>

                            <h3>
                                Server Connection Error
                            </h3>

                            <p>
                                {error}
                            </p>

                            <p className="error-help">
                                Make sure your Spring Boot
                                backend is running on
                                port 8081.
                            </p>

                            <button
                                className="retry-button"
                                onClick={loadComics}
                            >
                                Try Again
                            </button>

                        </div>
                    )}


                    {/* EMPTY */}

                    {!loading &&
                        !error &&
                        filteredComics.length === 0 && (
                            <div className="empty-library">

                                <div>
                                    📚
                                </div>

                                <h3>
                                    No Comics Found
                                </h3>

                                <p>
                                    There are no comics
                                    matching your search.
                                </p>

                            </div>
                        )}


                    {/* COMIC GRID */}

                    {!loading &&
                        !error &&
                        filteredComics.length > 0 && (

                            <div className="comic-grid">

                                {filteredComics.map(
                                    (comic) => (
                                        <ComicCard
                                            key={comic.id}
                                            comic={comic}
                                            onOpen={
                                                openComic
                                            }
                                        />
                                    )
                                )}

                            </div>
                        )}

                </section>

            </main>

        </div>
    );
}


// =====================================================
// HEADER
// =====================================================

function Header({
    search,
    setSearch,
    currentPage,
    openRead,
    openSignIn,
    user,
    onLogout
}) {
    return (
        <header className="top-header">

            <div className="header-container">

                {/* LOGO */}

                <button
                    className="logo"
                    onClick={openRead}
                >

                    <span className="logo-icon">
                        📚
                    </span>

                    <span className="logo-text">
                        City of Comics
                    </span>

                </button>


                {/* SEARCH */}

                <div className="search-container">

                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Enter comics to search"
                    />

                    <span className="search-icon">
                        🔍
                    </span>

                </div>


                {/* NAVIGATION */}

                <nav className="navigation">

                    <button
                        className={
                            currentPage === "read" ||
                            currentPage === "reader"
                                ? "nav-button active"
                                : "nav-button"
                        }
                        onClick={openRead}
                    >
                        📖 Read Comics
                    </button>


                    {user ? (
                        <div className="user-menu">

                            <span className="user-email">
                                {user.email}
                            </span>

                            <button
                                className="nav-button signout-button"
                                onClick={onLogout}
                            >
                                SIGN OUT
                            </button>

                        </div>
                    ) : (
                        <button
                            className={
                                currentPage === "signin"
                                    ? "nav-button active"
                                    : "nav-button"
                            }
                            onClick={openSignIn}
                        >
                            SIGN IN
                        </button>
                    )}

                </nav>

            </div>

        </header>
    );
}


// =====================================================
// COMIC CARD
// =====================================================

function ComicCard({
    comic,
    onOpen
}) {
    const imageUrl = comic.imageUrl
        ? `${API_URL}${comic.imageUrl}`
        : "";

    return (
        <article className="comic-card">

            <div className="comic-cover">

                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={comic.title}
                        onError={(e) => {
                            e.currentTarget.style.display =
                                "none";
                        }}
                    />
                ) : (
                    <div className="no-cover">
                        📚
                    </div>
                )}

            </div>


            <div className="comic-info">

                <h3>
                    {comic.title}
                </h3>

                <p className="comic-author">
                    By {comic.author}
                </p>

                <p className="comic-description">
                    {comic.description ||
                        "No description available."}
                </p>


                <button
                    className="read-button"
                    onClick={() => onOpen(comic)}
                >
                    Read Comic →
                </button>

            </div>

        </article>
    );
}


export default App;