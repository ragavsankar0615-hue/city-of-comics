import React, { useState } from "react";
import "./Register.css";

function Register({
    onBack,
    onSignIn,
    onRegister
}) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleRegister = async (event) => {
        event.preventDefault();

        setError("");

        const cleanName = name.trim();
        const cleanEmail = email.trim();

        if (
            !cleanName ||
            !cleanEmail ||
            !password ||
            !confirmPassword
        ) {
            setError(
                "Please fill in all fields."
            );
            return;
        }

        if (password.length < 6) {
            setError(
                "Password must contain at least 6 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError(
                "Passwords do not match."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8080/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: cleanName,
                        email: cleanEmail,
                        password
                    })
                }
            );

            const message =
                await response.text();

            if (!response.ok) {
                throw new Error(
                    message ||
                    "Registration failed."
                );
            }

            onRegister({
                name: cleanName,
                email: cleanEmail
            });

        } catch (error) {
            console.error(error);

            if (
                error.name === "TypeError" ||
                error.message.includes(
                    "Failed to fetch"
                )
            ) {
                setError(
                    "Unable to connect to the backend."
                );
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="register-page">

            <section className="register-card">

                <div className="register-logo">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <h1>Create Account</h1>

                <p className="register-subtitle">
                    Join City of Comics and start reading.
                </p>

                {error && (
                    <div className="register-error">
                        ⚠️
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleRegister}>

                    <div className="register-group">

                        <label>Full name</label>

                        <input
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) =>
                                setName(
                                    e.target.value
                                )
                            }
                            disabled={loading}
                        />

                    </div>

                    <div className="register-group">

                        <label>Email address</label>

                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }
                            disabled={loading}
                        />

                    </div>

                    <div className="register-group">

                        <label>Password</label>

                        <div className="register-password">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                disabled={loading}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >
                                {showPassword
                                    ? "Hide"
                                    : "Show"}
                            </button>

                        </div>

                    </div>

                    <div className="register-group">

                        <label>
                            Confirm password
                        </label>

                        <input
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(
                                    e.target.value
                                )
                            }
                            disabled={loading}
                        />

                    </div>

                    <button
                        className="register-submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "CREATING ACCOUNT..."
                            : "CREATE ACCOUNT →"}
                    </button>

                </form>

                <div className="register-login">

                    <span>
                        Already have an account?
                    </span>

                    <button
                        onClick={onSignIn}
                    >
                        Sign in
                    </button>

                </div>

                <button
                    className="register-back"
                    onClick={onBack}
                >
                    ← Back to Comics
                </button>

            </section>

        </main>
    );
}

export default Register;