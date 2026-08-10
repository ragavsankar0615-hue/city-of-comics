import React, { useState } from "react";

function SignIn({ onBack, onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();

        setError("");

        const cleanEmail = email.trim();

        if (!cleanEmail) {
            setError("Please enter your email address.");
            return;
        }

        if (!cleanEmail.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }

        if (!password) {
            setError("Please enter your password.");
            return;
        }

        if (password.length < 4) {
            setError("Password must contain at least 4 characters.");
            return;
        }

        const loggedUser = {
            email: cleanEmail
        };

        if (onLogin) {
            onLogin(loggedUser);
        }
    };

    return (
        <main className="signin-page">

            <div className="signin-card">

                <div className="signin-icon">
                    📚
                </div>

                <h1>Sign In</h1>

                <p className="signin-subtitle">
                    Welcome back to City of Comics
                </p>

                <form
                    className="signin-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="Enter your email"
                            autoComplete="email"
                        />

                    </div>

                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <div className="password-wrapper">

                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />

                            <button
                                type="button"
                                className="show-password"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>

                        </div>

                    </div>

                    {error && (
                        <div className="signin-error">
                            ⚠ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="signin-submit"
                    >
                        SIGN IN
                    </button>

                </form>

                <div className="signin-divider">
                    <span>OR</span>
                </div>

                <button
                    type="button"
                    className="google-login"
                    onClick={() =>
                        setError(
                            "Google login will be connected later."
                        )
                    }
                >
                    <span>G</span>
                    Continue with Google
                </button>

                <p className="signup-text">
                    Don't have an account?

                    <button
                        type="button"
                        className="signup-button"
                        onClick={() =>
                            setError(
                                "Registration will be added later."
                            )
                        }
                    >
                        Create account
                    </button>
                </p>

                <button
                    type="button"
                    className="back-login"
                    onClick={onBack}
                >
                    ← Back to Comics
                </button>

            </div>

        </main>
    );
}

export default SignIn;