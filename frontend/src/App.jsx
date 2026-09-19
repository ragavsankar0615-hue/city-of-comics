import React, { useEffect, useState } from "react";
import "./App.css";

import ComicReader from "./pages/ComicReader";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import UploadComic from "./pages/UploadComic";
import EditComic from "./pages/EditComic";

import { API_BASE_URL } from "./config";

export default function App() {
    const [page, setPage] = useState("home");
    const [user, setUser] = useState(null);
    const [editingComic, setEditingComic] = useState(null);
    const [loadingSession, setLoadingSession] = useState(true);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/auth/me`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            if (response.ok) {
                const data = await response.json();

                setUser({
                    userId: data.userId,
                    email: data.email,
                    role: data.role
                });
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Session check failed:", error);
            setUser(null);
        } finally {
            setLoadingSession(false);
        }
    };

    const handleLogin = (userData) => {
        setUser({
            userId: userData.userId,
            email: userData.email,
            role: userData.role
        });

        setPage("library");
    };

    const handleLogout = async () => {
        try {
            await fetch(
                `${API_BASE_URL}/api/auth/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );
        } catch (error) {
            console.error("Logout error:", error);
        }

        setUser(null);
        setEditingComic(null);
        setPage("home");
    };

    const openHome = () => {
        setPage("home");
    };

    const openSignIn = () => {
        setPage("signin");
    };

    const openRegister = () => {
        setPage("register");
    };

    const openLibrary = () => {
        setPage("library");
    };

    const openUpload = () => {
        if (!user) {
            setPage("signin");
            return;
        }

        if (user.role !== "HOST") {
            alert("Only HOST can upload comics.");
            return;
        }

        setPage("upload");
    };

    const openEdit = (comic) => {
        if (!user) {
            setPage("signin");
            return;
        }

        if (user.role !== "HOST") {
            alert("Only HOST can edit comics.");
            return;
        }

        setEditingComic(comic);
        setPage("edit");
    };

    const handleRegisterSuccess = () => {
        setPage("signin");
    };

    const handleUploadComplete = () => {
        setPage("library");
    };

    const handleEditComplete = () => {
        setEditingComic(null);
        setPage("library");
    };

    if (loadingSession) {
        return (
            <div className="app-loading">
                <div className="loading-logo">
                    CITY OF COMICS
                </div>

                <div className="loading-line"></div>

                <div className="loading-text">
                    ENTERING THE UNIVERSE...
                </div>
            </div>
        );
    }

    if (page === "signin") {
        return (
            <SignIn
                onLogin={handleLogin}
                onRegister={openRegister}
                onBack={openHome}
            />
        );
    }

    if (page === "register") {
        return (
            <Register
                onRegisterSuccess={handleRegisterSuccess}
                onSignIn={openSignIn}
                onBack={openHome}
            />
        );
    }

    if (page === "upload") {
        return (
            <UploadComic
                user={user}
                onBack={openLibrary}
                onUploaded={handleUploadComplete}
            />
        );
    }

    if (page === "edit" && editingComic) {
        return (
            <EditComic
                comic={editingComic}
                user={user}
                onBack={openLibrary}
                onUpdated={handleEditComplete}
            />
        );
    }

    if (page === "library") {
        return (
            <ComicReader
                user={user}
                onSignIn={openSignIn}
                onSignOut={handleLogout}
                onBack={openHome}
                onUpload={openUpload}
                onEdit={openEdit}
            />
        );
    }

    return (
        <div className="home-page">

            <header className="home-header">

                <button
                    className="brand"
                    onClick={openHome}
                    type="button"
                >
                    <div className="brand-mark">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <span>
                        CITY OF COMICS
                    </span>
                </button>

                <nav className="home-nav">

                    <button
                        className="nav-button"
                        onClick={openLibrary}
                        type="button"
                    >
                        Library
                    </button>

                    {user ? (
                        <>
                            <span className="home-user">
                                {user.email}
                            </span>

                            {user.role === "HOST" && (
                                <button
                                    className="nav-button nav-primary"
                                    onClick={openUpload}
                                    type="button"
                                >
                                    Upload Comic
                                </button>
                            )}

                            <button
                                className="nav-button"
                                onClick={handleLogout}
                                type="button"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="nav-button"
                                onClick={openSignIn}
                                type="button"
                            >
                                Sign In
                            </button>

                            <button
                                className="nav-button nav-primary"
                                onClick={openRegister}
                                type="button"
                            >
                                Create Account
                            </button>
                        </>
                    )}

                </nav>

            </header>

            <main className="home-main">

                <div className="home-content">

                    <div className="home-label">
                        DIGITAL COMIC READER
                    </div>

                    <h1>
                        CITY
                        <br />
                        OF COMICS
                    </h1>

                    <p>
                        Discover stories.
                        <br />
                        Turn the page.
                        <br />
                        Enter another world.
                    </p>

                    <div className="home-buttons">

                        <button
                            className="read-button"
                            onClick={openLibrary}
                            type="button"
                        >
                            READ COMICS
                            <span>→</span>
                        </button>

                        {!user && (
                            <button
                                className="create-button"
                                onClick={openRegister}
                                type="button"
                            >
                                CREATE ACCOUNT
                            </button>
                        )}

                        {user && (
                            <button
                                className="create-button"
                                onClick={openLibrary}
                                type="button"
                            >
                                OPEN LIBRARY
                            </button>
                        )}

                    </div>

                </div>

                <div className="home-decoration">

                    <div className="decoration-orbit orbit-one"></div>
                    <div className="decoration-orbit orbit-two"></div>

                    <div className="decoration-circle">
                        <div className="decoration-circle-inner">
                            ★
                        </div>
                    </div>

                    <div className="decoration-text">
                        STORIES
                        <br />
                        BEYOND
                        <br />
                        REALITY
                    </div>

                    <div className="decoration-number">
                        01
                    </div>

                </div>

            </main>

            <footer className="home-footer">

                <span>
                    READ • DISCOVER • EXPERIENCE
                </span>

                <span>
                    © CITY OF COMICS
                </span>

            </footer>

        </div>
    );
}