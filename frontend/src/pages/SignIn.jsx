import React, { useState } from "react";
import { API_BASE_URL } from "../config";

export default function SignIn({ onLogin, onRegister, onBack }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!email.trim() || !password) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email: email.trim(),
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Invalid email or password."
                );
            }

            onLogin({
                userId: data.userId,
                email: data.email,
                role: data.role
            });

        } catch (err) {
            setError(
                err.message || "Unable to connect to server."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="coc-login">

            <div className="coc-login-bg">
                <div className="coc-glow coc-glow-1"></div>
                <div className="coc-glow coc-glow-2"></div>
                <div className="coc-glow coc-glow-3"></div>

                <div className="coc-rays"></div>
                <div className="coc-dots"></div>
            </div>

            <button
                className="coc-back"
                onClick={onBack}
                type="button"
            >
                ← BACK
            </button>

            <div className="coc-logo">
                <small>CITY</small>
                <strong>OF COMICS</strong>
            </div>

            <div className="coc-login-layout">

                <div className="coc-login-art">

                    <div className="coc-art-number">
                        01 / LOGIN
                    </div>

                    <div className="coc-art-content">

                        <span>
                            ENTER THE UNIVERSE
                        </span>

                        <h1>
                            ENTER
                            <br />

                            <i>THE</i>

                            <br />

                            WORLD.
                        </h1>

                        <p>
                            Every page opens another universe.
                            <br />
                            Your next story is waiting.
                        </p>

                    </div>

                    <div className="coc-hero">

                        <div className="coc-hero-glow"></div>

                        <div className="coc-hero-body">

                            <div className="coc-hero-head"></div>

                            <div className="coc-hero-torso">

                                <div className="coc-hero-star">
                                    ★
                                </div>

                            </div>

                            <div className="coc-hero-arm coc-arm-left"></div>
                            <div className="coc-hero-arm coc-arm-right"></div>

                        </div>

                    </div>

                    <div className="coc-art-footer">
                        <span>READ</span>
                        <span>DISCOVER</span>
                        <span>EXPERIENCE</span>
                    </div>

                </div>

                <div className="coc-login-space">

                    <div className="coc-glass-layer coc-glass-back"></div>

                    <div className="coc-glass-layer coc-glass-middle"></div>

                    <div className="coc-login-card">

                        <div className="coc-card-light"></div>

                        <div className="coc-card-header">

                            <div>
                                <span>
                                    CITY OF COMICS
                                </span>

                                <small>
                                    MEMBER ACCESS
                                </small>
                            </div>

                            <div className="coc-card-symbol">
                                ✦
                            </div>

                        </div>

                        <div className="coc-card-title">

                            <span>
                                WELCOME BACK
                            </span>

                            <h2>
                                Continue
                                <br />
                                <em>your story.</em>
                            </h2>

                            <p>
                                Sign in to enter your comic universe.
                            </p>

                        </div>

                        {error && (
                            <div className="coc-error">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>

                            <div className="coc-field">

                                <label>
                                    EMAIL ADDRESS
                                </label>

                                <div className="coc-input">

                                    <span>@</span>

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        required
                                    />

                                </div>

                            </div>

                            <div className="coc-field">

                                <label>
                                    PASSWORD
                                </label>

                                <div className="coc-input">

                                    <span>●</span>

                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        required
                                    />

                                </div>

                            </div>

                            <div className="coc-options">

                                <label>
                                    <input type="checkbox" />
                                    <span>
                                        Remember me
                                    </span>
                                </label>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setError(
                                            "Password reset is not configured yet."
                                        )
                                    }
                                >
                                    Forgot password?
                                </button>

                            </div>

                            <button
                                type="submit"
                                className="coc-enter"
                                disabled={loading}
                            >

                                <span>
                                    {loading
                                        ? "ENTERING..."
                                        : "ENTER THE WORLD"}
                                </span>

                                <strong>
                                    →
                                </strong>

                            </button>

                        </form>

                        <div className="coc-divider">

                            <span></span>

                            OR

                            <span></span>

                        </div>

                        <div className="coc-register">

                            <span>
                                New to City of Comics?
                            </span>

                            <button
                                type="button"
                                onClick={onRegister}
                            >
                                CREATE ACCOUNT
                                <strong>→</strong>
                            </button>

                        </div>

                        <div className="coc-card-footer">

                            <span>
                                SECURE ACCESS
                            </span>

                            <span>
                                COC / 2026
                            </span>

                        </div>

                    </div>

                </div>

            </div>

            <div className="coc-footer">

                <span>
                    CITY OF COMICS © 2026
                </span>

                <span>
                    READ • DISCOVER • EXPERIENCE
                </span>

            </div>

        </div>
    );
}