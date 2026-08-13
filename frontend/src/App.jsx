import React, { useState } from "react";

import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import ComicReader from "./pages/ComicReader";
import UploadComic from "./pages/UploadComic";

import "./App.css";

function App() {

    const [page, setPage] = useState("home");
    const [user, setUser] = useState(null);

    // =========================
    // LOGIN
    // =========================

    const handleLogin = (userData) => {

        setUser(userData);

        setPage("reader");
    };


    // =========================
    // REGISTER
    // =========================

    const handleRegisterSuccess = (userData) => {

        setUser(userData);

        setPage("reader");
    };


    // =========================
    // SIGN OUT
    // =========================

    const handleSignOut = () => {

        setUser(null);

        setPage("home");
    };


    // =========================
    // SIGN IN PAGE
    // =========================

    if (page === "signin") {

        return (
            <SignIn
                onBack={() => setPage("home")}

                onRegister={() =>
                    setPage("register")
                }

                onLogin={handleLogin}
            />
        );
    }


    // =========================
    // REGISTER PAGE
    // =========================

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


    // =========================
    // UPLOAD COMIC PAGE
    // =========================

    if (page === "upload") {

        return (
            <UploadComic
                onBack={() =>
                    setPage("reader")
                }

                onSuccess={() =>
                    setPage("reader")
                }
            />
        );
    }


    // =========================
    // COMIC READER PAGE
    // =========================

    if (page === "reader") {

        return (
            <ComicReader
                user={user}

                onSignOut={
                    handleSignOut
                }

                onBack={() =>
                    setPage("home")
                }

                onUpload={() =>
                    setPage("upload")
                }
            />
        );
    }


    // =========================
    // HOME PAGE
    // =========================

    return (

        <div className="app">

            <header className="main-header">

                {/* LOGO */}

                <div className="brand">

                    <div className="brand-logo">

                        <span></span>
                        <span></span>
                        <span></span>

                    </div>

                    <span>
                        City of Comics
                    </span>

                </div>


                {/* HEADER ACTIONS */}

                <div className="header-actions">

                    <button
                        className="read-button"
                        onClick={() =>
                            setPage("reader")
                        }
                    >
                        📖 Read Comics
                    </button>


                    {user ? (

                        <>
                            <span className="user-email">
                                {user.email}
                            </span>

                            <button
                                className="signout-button"
                                onClick={
                                    handleSignOut
                                }
                            >
                                SIGN OUT
                            </button>
                        </>

                    ) : (

                        <button
                            className="signin-header-button"
                            onClick={() =>
                                setPage("signin")
                            }
                        >
                            SIGN IN
                        </button>

                    )}

                </div>

            </header>


            {/* HOME */}

            <main className="home-page">

                <div className="hero">

                    <div className="hero-logo">

                        <div className="hero-stack">

                            <span></span>
                            <span></span>
                            <span></span>

                        </div>

                    </div>


                    <h1>
                        City of Comics
                    </h1>


                    <p>
                        Discover, read and enjoy
                        your favorite comics.
                    </p>


                    <div className="hero-buttons">

                        <button
                            className="hero-primary"
                            onClick={() =>
                                setPage("reader")
                            }
                        >
                            START READING →
                        </button>


                        {!user && (

                            <button
                                className="hero-secondary"
                                onClick={() =>
                                    setPage("register")
                                }
                            >
                                CREATE ACCOUNT
                            </button>

                        )}

                    </div>

                </div>

            </main>

        </div>
    );
}

export default App;