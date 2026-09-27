import React, { useEffect, useMemo, useState } from "react";
import "./HostDashboard.css";
import { API_BASE_URL } from "../config";

export default function HostDashboard({
    user,
    onBack,
    onUpload,
    onEdit,
    onOpenComic,
    onSignOut
}) {
    const [comics, setComics] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadComics();
    }, []);

    const loadComics = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/api/comics`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            if (!response.ok) {
                throw new Error("Unable to load comics.");
            }

            const data = await response.json();

            setComics(
                Array.isArray(data) ? data : []
            );
        } catch (err) {
            console.error(err);
            setError(
                "Unable to load your comic library."
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredComics = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) {
            return comics;
        }

        return comics.filter(comic =>
            comic.title
                ?.toLowerCase()
                .includes(value) ||
            comic.author
                ?.toLowerCase()
                .includes(value)
        );
    }, [comics, search]);

    const totalPages = useMemo(() => {
        return comics.reduce(
            (total, comic) =>
                total + (Number(comic.totalPages) || 0),
            0
        );
    }, [comics]);

    const recentComics = useMemo(() => {
        return [...comics].slice(0, 5);
    }, [comics]);

    const getImageUrl = url => {
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
    };

    const deleteComic = async comic => {
        const confirmed = window.confirm(
            `Delete "${comic.title}"? This cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/comics/${comic.id}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Delete failed."
                );
            }

            setComics(prev =>
                prev.filter(
                    item => item.id !== comic.id
                )
            );
        } catch (err) {
            alert(
                err.message ||
                "Unable to delete comic."
            );
        }
    };

    if (!user || user.role !== "HOST") {
        return (
            <div className="dashboard-denied">
                <div className="dashboard-denied-card">
                    <span>403</span>
                    <h1>Access Restricted</h1>
                    <p>
                        Only HOST accounts can access
                        the dashboard.
                    </p>

                    <button
                        onClick={onBack}
                        type="button"
                    >
                        BACK TO LIBRARY
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="host-dashboard">

            <header className="dashboard-header">

                <button
                    className="dashboard-brand"
                    onClick={onBack}
                    type="button"
                >
                    <span className="brand-symbol">
                        C
                    </span>

                    <span>
                        CITY OF COMICS
                    </span>
                </button>

                <div className="dashboard-header-right">

                    <div className="host-profile">
                        <div className="host-avatar">
                            {user.email
                                ?.charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>
                            <strong>HOST</strong>
                            <span>{user.email}</span>
                        </div>
                    </div>

                    <button
                        className="dashboard-signout"
                        onClick={onSignOut}
                        type="button"
                    >
                        SIGN OUT
                    </button>

                </div>

            </header>

            <main className="dashboard-main">

                <section className="dashboard-heading">

                    <div>
                        <p className="dashboard-eyebrow">
                            HOST CONTROL CENTER
                        </p>

                        <h1>
                            Welcome back.
                            <br />
                            <em>Manage your universe.</em>
                        </h1>

                        <p className="dashboard-description">
                            Manage your comics, monitor
                            your collection, and publish
                            new stories.
                        </p>
                    </div>

                    <button
                        className="dashboard-upload"
                        onClick={onUpload}
                        type="button"
                    >
                        <span>+</span>
                        UPLOAD COMIC
                    </button>

                </section>

                <section className="dashboard-stats">

                    <div className="stat-card">
                        <span className="stat-icon">
                            ◈
                        </span>

                        <div>
                            <p>TOTAL COMICS</p>
                            <strong>
                                {loading
                                    ? "—"
                                    : comics.length}
                            </strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <span className="stat-icon">
                            ▤
                        </span>

                        <div>
                            <p>TOTAL PAGES</p>
                            <strong>
                                {loading
                                    ? "—"
                                    : totalPages}
                            </strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <span className="stat-icon">
                            ✦
                        </span>

                        <div>
                            <p>ROLE</p>
                            <strong>HOST</strong>
                        </div>
                    </div>

                    <div className="stat-card stat-action">

                        <button
                            onClick={onBack}
                            type="button"
                        >
                            <span>←</span>
                            OPEN LIBRARY
                        </button>

                    </div>

                </section>

                <section className="dashboard-content">

                    <div className="dashboard-section-header">

                        <div>
                            <p className="dashboard-eyebrow">
                                CONTENT MANAGEMENT
                            </p>

                            <h2>My Comics</h2>
                        </div>

                        <div className="dashboard-search">
                            <span>⌕</span>

                            <input
                                type="text"
                                placeholder="Search comics..."
                                value={search}
                                onChange={event =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                    </div>

                    {loading ? (
                        <div className="dashboard-state">
                            <div className="dashboard-loader"></div>
                            <p>
                                Loading your comics...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="dashboard-state dashboard-error">
                            <h3>Something went wrong</h3>
                            <p>{error}</p>

                            <button
                                onClick={loadComics}
                                type="button"
                            >
                                TRY AGAIN
                            </button>
                        </div>
                    ) : filteredComics.length === 0 ? (
                        <div className="dashboard-empty">

                            <div className="empty-symbol">
                                ◇
                            </div>

                            <h3>
                                No comics found
                            </h3>

                            <p>
                                {search
                                    ? "Try another search."
                                    : "Your comic collection is empty."}
                            </p>

                            {!search && (
                                <button
                                    onClick={onUpload}
                                    type="button"
                                >
                                    UPLOAD YOUR FIRST COMIC
                                </button>
                            )}

                        </div>
                    ) : (
                        <div className="comic-management-list">

                            {filteredComics.map(
                                (comic, index) => (
                                    <article
                                        className="management-card"
                                        key={comic.id}
                                    >

                                        <div className="management-number">
                                            {String(
                                                index + 1
                                            ).padStart(2, "0")}
                                        </div>

                                        <div
                                            className="management-cover"
                                            onClick={() =>
                                                onOpenComic(
                                                    comic
                                                )
                                            }
                                        >
                                            {comic.imageUrl ? (
                                                <img
                                                    src={getImageUrl(
                                                        comic.imageUrl
                                                    )}
                                                    alt={
                                                        comic.title
                                                    }
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div>
                                                    CITY
                                                    <strong>
                                                        OF COMICS
                                                    </strong>
                                                </div>
                                            )}
                                        </div>

                                        <div className="management-info">

                                            <h3>
                                                {comic.title}
                                            </h3>

                                            <p>
                                                {comic.author ||
                                                    "Unknown Author"}
                                            </p>

                                            <span>
                                                {comic.totalPages ||
                                                    0}{" "}
                                                PAGES
                                            </span>

                                        </div>

                                        <div className="management-actions">

                                            <button
                                                className="view-action"
                                                onClick={() =>
                                                    onOpenComic(
                                                        comic
                                                    )
                                                }
                                                type="button"
                                            >
                                                READ
                                            </button>

                                            <button
                                                onClick={() =>
                                                    onEdit(
                                                        comic
                                                    )
                                                }
                                                type="button"
                                            >
                                                EDIT
                                            </button>

                                            <button
                                                className="danger-action"
                                                onClick={() =>
                                                    deleteComic(
                                                        comic
                                                    )
                                                }
                                                type="button"
                                            >
                                                DELETE
                                            </button>

                                        </div>

                                    </article>
                                )
                            )}

                        </div>
                    )}

                </section>

                <section className="recent-section">

                    <div className="dashboard-section-header">

                        <div>
                            <p className="dashboard-eyebrow">
                                QUICK OVERVIEW
                            </p>

                            <h2>Recent Comics</h2>
                        </div>

                    </div>

                    <div className="recent-grid">

                        {recentComics.map(comic => (
                            <button
                                className="recent-card"
                                key={comic.id}
                                onClick={() =>
                                    onOpenComic(comic)
                                }
                                type="button"
                            >

                                <div className="recent-cover">

                                    {comic.imageUrl ? (
                                        <img
                                            src={getImageUrl(
                                                comic.imageUrl
                                            )}
                                            alt={
                                                comic.title
                                            }
                                        />
                                    ) : (
                                        <span>
                                            CITY
                                        </span>
                                    )}

                                </div>

                                <div className="recent-info">

                                    <strong>
                                        {comic.title}
                                    </strong>

                                    <span>
                                        {comic.totalPages ||
                                            0}{" "}
                                        pages
                                    </span>

                                </div>

                            </button>
                        ))}

                    </div>

                </section>

            </main>

            <footer className="dashboard-footer">

                <span>
                    CITY OF COMICS
                </span>

                <span>
                    HOST CONTROL CENTER
                </span>

            </footer>

        </div>
    );
}