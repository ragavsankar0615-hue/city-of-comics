import React, { useEffect, useState } from "react";
import "./Register.css";
import { API_BASE_URL } from "../config";

export default function Register({
    onRegisterSuccess,
    onSignIn,
    onBack
}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [otp, setOtp] = useState("");
    const [otpMode, setOtpMode] = useState(false);

    const [expiresAt, setExpiresAt] = useState(null);
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [resendSeconds, setResendSeconds] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!expiresAt) {
            return;
        }

        const updateTimer = () => {
            const remaining = Math.max(
                0,
                Math.floor(
                    (
                        new Date(expiresAt).getTime() -
                        Date.now()
                    ) / 1000
                )
            );

            setRemainingSeconds(remaining);
        };

        updateTimer();

        const timer = setInterval(
            updateTimer,
            1000
        );

        return () => clearInterval(timer);
    }, [expiresAt]);

    useEffect(() => {
        if (resendSeconds <= 0) {
            return;
        }

        const timer = setInterval(() => {
            setResendSeconds(value =>
                Math.max(0, value - 1)
            );
        }, 1000);

        return () => clearInterval(timer);
    }, [resendSeconds]);

    const formatTime = seconds => {
        const minutes = Math.floor(seconds / 60);
        const remaining = seconds % 60;

        return (
            String(minutes).padStart(2, "0") +
            ":" +
            String(remaining).padStart(2, "0")
        );
    };

    const sendOtp = async event => {
        if (event) {
            event.preventDefault();
        }

        setError("");
        setSuccess("");

        if (!email.trim()) {
            setError("Email is required.");
            return;
        }

        if (password.length < 6) {
            setError(
                "Password must contain at least 6 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/auth/register`,
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
                    data.message ||
                    "Unable to send OTP."
                );
            }

            setOtpMode(true);
            setExpiresAt(data.expiresAt);
            setResendSeconds(60);

            setSuccess(
                "Verification code sent to your email."
            );

        } catch (err) {
            setError(
                err.message ||
                "Unable to send OTP."
            );
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async event => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (remainingSeconds <= 0) {
            setError(
                "OTP has expired. Please request a new OTP."
            );
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            setError("Enter the 6-digit OTP.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/auth/register/verify-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email: email.trim(),
                        otp
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Invalid OTP."
                );
            }

            setSuccess(
                "Account created successfully."
            );

            setTimeout(() => {
                if (onRegisterSuccess) {
                    onRegisterSuccess();
                }
            }, 800);

        } catch (err) {
            setError(
                err.message ||
                "Verification failed."
            );
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        if (resendSeconds > 0) {
            return;
        }

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/auth/register`,
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
                    data.message ||
                    "Unable to resend OTP."
                );
            }

            setExpiresAt(data.expiresAt);
            setResendSeconds(60);
            setOtp("");

            setSuccess(
                "A new OTP has been sent."
            );

        } catch (err) {
            setError(
                err.message ||
                "Unable to resend OTP."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="coc-register-page">

            <div className="coc-register-left">

                <button
                    className="coc-back-button"
                    onClick={onBack}
                    type="button"
                >
                    ← BACK
                </button>

                <div className="coc-register-brand">
                    <span>CITY</span>
                    <strong>OF COMICS</strong>
                </div>

                <div className="coc-register-copy">
                    <span>02 / CREATE ACCOUNT</span>

                    <h1>
                        ENTER
                        <br />
                        THE
                        <br />
                        WORLD.
                    </h1>

                    <p>
                        Every page opens another
                        universe.
                    </p>
                </div>

                <div className="coc-register-decoration">
                    <div className="register-orbit orbit-one"></div>
                    <div className="register-orbit orbit-two"></div>
                    <div className="register-orbit orbit-three"></div>
                    <div className="register-star">✦</div>
                </div>

            </div>

            <div className="coc-register-right">

                {!otpMode ? (

                    <>
                        <div className="coc-register-heading">

                            <span>JOIN THE UNIVERSE</span>

                            <h2>
                                Create
                                <br />
                                your account.
                            </h2>

                            <p>
                                Verify your email to enter
                                City of Comics.
                            </p>

                        </div>

                        <form
                            onSubmit={sendOtp}
                            className="coc-register-form"
                        >

                            <label>EMAIL ADDRESS</label>

                            <input
                                type="email"
                                value={email}
                                onChange={e =>
                                    setEmail(e.target.value)
                                }
                                autoComplete="email"
                                placeholder="you@example.com"
                                required
                            />

                            <label>PASSWORD</label>

                            <input
                                type="password"
                                value={password}
                                onChange={e =>
                                    setPassword(e.target.value)
                                }
                                autoComplete="new-password"
                                placeholder="Minimum 6 characters"
                                required
                            />

                            <label>CONFIRM PASSWORD</label>

                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e =>
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }
                                autoComplete="new-password"
                                placeholder="Confirm your password"
                                required
                            />

                            {error && (
                                <div className="coc-message error">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="coc-message success">
                                    {success}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="coc-register-submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "SENDING OTP..."
                                    : "CREATE ACCOUNT →"}
                            </button>

                        </form>

                        <div className="coc-register-login">
                            <span>
                                Already have an account?
                            </span>

                            <button
                                type="button"
                                onClick={onSignIn}
                            >
                                SIGN IN
                            </button>
                        </div>
                    </>

                ) : (

                    <>
                        <div className="coc-register-heading">

                            <span>EMAIL VERIFICATION</span>

                            <h2>
                                Verify
                                <br />
                                your email.
                            </h2>

                            <p>
                                We sent a 6-digit
                                verification code to
                                <br />
                                <strong>{email}</strong>
                            </p>

                        </div>

                        <form
                            onSubmit={verifyOtp}
                            className="coc-register-form"
                        >

                            <label>
                                VERIFICATION CODE
                            </label>

                            <input
                                className="coc-otp-input"
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={otp}
                                onChange={e =>
                                    setOtp(
                                        e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 6)
                                    )
                                }
                                placeholder="000000"
                                autoComplete="one-time-code"
                                required
                            />

                            <div className="coc-otp-timer">
                                {remainingSeconds > 0 ? (
                                    <>
                                        OTP expires in{" "}
                                        <strong>
                                            {formatTime(
                                                remainingSeconds
                                            )}
                                        </strong>
                                    </>
                                ) : (
                                    <strong>
                                        OTP EXPIRED
                                    </strong>
                                )}
                            </div>

                            {error && (
                                <div className="coc-message error">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="coc-message success">
                                    {success}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="coc-register-submit"
                                disabled={
                                    loading ||
                                    remainingSeconds <= 0
                                }
                            >
                                {loading
                                    ? "VERIFYING..."
                                    : "VERIFY OTP →"}
                            </button>

                        </form>

                        <div className="coc-resend">

                            {resendSeconds > 0 ? (
                                <span>
                                    Resend OTP in{" "}
                                    <strong>
                                        {formatTime(
                                            resendSeconds
                                        )}
                                    </strong>
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={resendOtp}
                                    disabled={loading}
                                >
                                    RESEND OTP
                                </button>
                            )}

                        </div>
                    </>
                )}

            </div>

        </div>
    );
}