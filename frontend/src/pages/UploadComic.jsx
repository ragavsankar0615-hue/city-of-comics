import React, { useState } from "react";
import "./UploadComic.css";

function UploadComic({ onBack, onSuccess }) {

    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [description, setDescription] = useState("");

    const [cover, setCover] = useState(null);
    const [pages, setPages] = useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setMessageType("");

        if (!title.trim()) {
            setMessage("Please enter comic title.");
            setMessageType("error");
            return;
        }

        if (!author.trim()) {
            setMessage("Please enter author.");
            setMessageType("error");
            return;
        }

        if (pages.length === 0) {
            setMessage("Please select at least one comic panel.");
            setMessageType("error");
            return;
        }

        setLoading(true);

        try {

            const formData = new FormData();

            formData.append(
                "title",
                title.trim()
            );

            formData.append(
                "author",
                author.trim()
            );

            formData.append(
                "description",
                description.trim()
            );

            // Cover
            if (cover) {

                formData.append(
                    "cover",
                    cover
                );
            }

            // IMPORTANT:
            // Backend expects "panels"
            pages.forEach((page) => {

                formData.append(
                    "panels",
                    page
                );

            });

            const response = await fetch(
                "http://localhost:8080/api/comics/upload",
                {
                    method: "POST",
                    body: formData
                }
            );

            const result = await response.text();

            if (!response.ok) {

                throw new Error(
                    result || "Comic upload failed."
                );
            }

            console.log(
                "Comic uploaded:",
                result
            );

            setMessage(
                "Comic added successfully!"
            );

            setMessageType("success");

            // Clear form
            setTitle("");
            setAuthor("");
            setDescription("");
            setCover(null);
            setPages([]);

            // Reset file inputs
            const fileInputs =
                document.querySelectorAll(
                    'input[type="file"]'
                );

            fileInputs.forEach(
                (input) => {
                    input.value = "";
                }
            );

            // Refresh comic collection
            if (onSuccess) {
                onSuccess();
            }

        } catch (error) {

            console.error(
                "Comic upload error:",
                error
            );

            setMessage(
                error.message ||
                "Unable to upload comic."
            );

            setMessageType("error");

        } finally {

            setLoading(false);
        }
    };

    return (

        <main className="upload-page">

            <div className="upload-container">

                <div className="upload-header">

                    <span className="upload-label">
                        CITY OF COMICS
                    </span>

                    <h1>
                        Add New Comic
                    </h1>

                    <p>
                        Add a comic and its reading
                        panels to your collection.
                    </p>

                </div>

                <form
                    className="upload-form"
                    onSubmit={handleSubmit}
                >

                    {/* TITLE */}

                    <div className="form-group">

                        <label>
                            Comic Title
                        </label>

                        <input
                            type="text"
                            placeholder="Enter comic title"
                            value={title}
                            onChange={(e) =>
                                setTitle(
                                    e.target.value
                                )
                            }
                            disabled={loading}
                        />

                    </div>

                    {/* AUTHOR */}

                    <div className="form-group">

                        <label>
                            Author
                        </label>

                        <input
                            type="text"
                            placeholder="Enter author name"
                            value={author}
                            onChange={(e) =>
                                setAuthor(
                                    e.target.value
                                )
                            }
                            disabled={loading}
                        />

                    </div>

                    {/* DESCRIPTION */}

                    <div className="form-group">

                        <label>
                            Description
                        </label>

                        <textarea
                            placeholder="Enter comic description"
                            value={description}
                            onChange={(e) =>
                                setDescription(
                                    e.target.value
                                )
                            }
                            disabled={loading}
                        />

                    </div>

                    {/* COVER */}

                    <div className="form-group">

                        <label>
                            Cover Image
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {

                                setCover(
                                    e.target.files &&
                                    e.target.files[0]
                                        ? e.target.files[0]
                                        : null
                                );

                            }}
                            disabled={loading}
                        />

                    </div>

                    {/* PANELS */}

                    <div className="form-group">

                        <label>
                            Comic Panels
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {

                                setPages(
                                    Array.from(
                                        e.target.files
                                    )
                                );

                            }}
                            disabled={loading}
                        />

                        <small>
                            Select panels in reading
                            order.
                        </small>

                        {pages.length > 0 && (

                            <small>
                                {pages.length} panel
                                {pages.length > 1
                                    ? "s"
                                    : ""} selected.
                            </small>

                        )}

                    </div>

                    {/* MESSAGE */}

                    {message && (

                        <div
                            className={
                                messageType === "success"
                                    ? "upload-message success"
                                    : "upload-message error"
                            }
                        >
                            {message}
                        </div>

                    )}

                    {/* BUTTONS */}

                    <div className="upload-buttons">

                        <button
                            type="button"
                            className="back-button"
                            onClick={onBack}
                            disabled={loading}
                        >
                            ← Back
                        </button>

                        <button
                            type="submit"
                            className="upload-button"
                            disabled={loading}
                        >

                            {loading
                                ? "ADDING COMIC..."
                                : "ADD COMIC →"}

                        </button>

                    </div>

                </form>

            </div>

        </main>
    );
}

export default UploadComic;