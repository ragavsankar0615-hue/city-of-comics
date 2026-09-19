import React, { useEffect, useState } from "react";

import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import ComicReader from "./pages/ComicReader";
import UploadComic from "./pages/UploadComic";
import EditComic from "./pages/EditComic";

import "./App.css";

const API_BASE_URL =
    "http://localhost:8080";

function App() {

    const [page, setPage] = useState("home");
    const [user, setUser] = useState(null);
    const [editingComic, setEditingComic] =
        useState(null);
    const [loading, setLoading] =
        useState(true);

    useEffect(() => {

        const checkSession = async () => {

            try {

                const response = await fetch(
                    `${API_BASE_URL}/api/auth/me`,
                    {
                        credentials: "include"
                    }
                );

                if (response.ok) {

                    const data =
                        await response.json();

                    setUser({
                        userId: data.userId,
                        email: data.email,
                        role: data.role
                    });
                }

            } catch (error) {

                console.log(
                    "No active session."
                );

            } finally {

                setLoading(false);
            }
        };

        checkSession();

    }, []);

    const handleLogin = (userData) => {

        setUser(userData);
        setPage("home");
    };

    const handleRegisterSuccess = () => {

        setPage("signin");
    };

    const handleSignOut = async () => {

        try {

            await fetch(
                `${API_BASE_URL}/api/auth/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );

        } catch (error) {

            console.error(error);
        }

        setUser(null);
        setEditingComic(null);
        setPage("home");
    };

    const handleEditComic = (comic) => {

        if (user?.role !== "HOST") {
            return;
        }

        setEditingComic(comic);
        setPage("edit");
    };

    const handleDeleteComic = async (comic) => {

        if (user?.role !== "HOST") {
            return;
        }

        const confirmed =
            window.confirm(
                `Are you sure you want to delete "${comic.title}"?`
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

            const message =
                await response.text();

            if (!response.ok) {
                throw new Error(
                    message ||
                    "Failed to delete comic."
                );
            }

            alert(
                "Comic deleted successfully."
            );

            setPage("read");

            window.dispatchEvent(
                new Event("comicDeleted")
            );

        } catch (error) {

            alert(
                error.message ||
                "Unable to delete comic."
            );
        }
    };

    if (loading) {

        return (
            <div className="loading-screen">
                Loading City of Comics...
            </div>
        );
    }

    if (page === "signin") {

        return (
            <SignIn
                onBack={() =>
                    setPage("home")
                }
                onRegister={() =>
                    setPage("register")
                }
                onLogin={handleLogin}
            />
        );
    }

    if (page === "register") {

        return (
            <Register
                onBack={() =>
                    setPage("home")
                }
                onSignIn={() =>
                    setPage("signin")
                }
                onRegister={
                    handleRegisterSuccess
                }
            />
        );
    }

    if (page === "read") {

        return (
            <ComicReader
                user={user}
                onSignOut={handleSignOut}
                onBack={() =>
                    setPage("home")
                }
                onUpload={() => {

                    if (
                        user?.role === "HOST"
                    ) {
                        setPage("upload");
                    }

                }}
                onEdit={handleEditComic}
                onDelete={handleDeleteComic}
            />
        );
    }

    if (page === "upload") {

        if (user?.role !== "HOST") {

            return (
                <div className="loading-screen">
                    Access denied
                </div>
            );
        }

        return (
            <UploadComic
                user={user}
                onBack={() =>
                    setPage("read")
                }
            />
        );
    }

    if (page === "edit") {

        if (
            user?.role !== "HOST" ||
            !editingComic
        ) {

            return (
                <div className="loading-screen">
                    Access denied
                </div>
            );
        }

        return (
            <EditComic
                comic={editingComic}
                onBack={() => {
                    setEditingComic(null);
                    setPage("read");
                }}
                onUpdated={() => {
                    setEditingComic(null);
                    setPage("read");
                }}
            />
        );
    }

    return (
        <div className="app">

            <header className="top-header">

                <div className="logo">

                    <span className="logo-icon">
                        🟩🟪
                    </span>

                    City of Comics

                </div>

                <div className="search-box">

                    <input
                        type="text"
                        placeholder="Enter comics to search"
                    />

                    <span>🔍</span>

                </div>

                <nav className="nav-actions">

                    {user ? (
                        <>

                            <span className="user-email">
                                {user.email}
                            </span>

                            {user.role === "HOST" && (
                                <span className="host-badge">
                                    👑 HOST
                                </span>
                            )}

                            <button
                                onClick={() =>
                                    setPage("read")
                                }
                            >
                                📖 Read Comics
                            </button>

                            {user.role === "HOST" && (
                                <button
                                    onClick={() =>
                                        setPage("upload")
                                    }
                                >
                                    ➕ Add Comic
                                </button>
                            )}

                            <button
                                className="sign-out"
                                onClick={
                                    handleSignOut
                                }
                            >
                                SIGN OUT
                            </button>

                        </>
                    ) : (
                        <>

                            <button
                                onClick={() =>
                                    setPage("signin")
                                }
                            >
                                SIGN IN
                            </button>

                            <button
                                onClick={() =>
                                    setPage("register")
                                }
                            >
                                REGISTER
                            </button>

                        </>
                    )}

                </nav>

            </header>

            <main className="home-page">

                <section className="hero-section">

                    <div className="hero-content">

                        <span className="hero-label">
                            CITY OF COMICS
                        </span>

                        <h1>
                            Your World of
                            <br />
                            <span>Comics</span>
                        </h1>

                        <p>
                            Discover, read and explore
                            your favorite comic stories
                            in one place.
                        </p>

                        <div className="hero-buttons">

                            <button
                                onClick={() =>
                                    setPage("read")
                                }
                            >
                                📖 Read Comics
                            </button>

                            {!user && (
                                <button
                                    onClick={() =>
                                        setPage(
                                            "register"
                                        )
                                    }
                                >
                                    Get Started
                                </button>
                            )}

                            {user?.role === "HOST" && (
                                <button
                                    onClick={() =>
                                        setPage(
                                            "upload"
                                        )
                                    }
                                >
                                    ➕ Add Comic
                                </button>
                            )}

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default App;