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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !author) {
            setMessage("Please enter title and author.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const formData = new FormData();

            formData.append("title", title);
            formData.append("author", author);
            formData.append("description", description);

            if (cover) {
                formData.append("cover", cover);
            }

            pages.forEach((page) => {
                formData.append("pages", page);
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

            setMessage("Comic added successfully!");

            setTitle("");
            setAuthor("");
            setDescription("");
            setCover(null);
            setPages([]);

            if (onSuccess) {
                onSuccess();
            }

        } catch (error) {
            console.error(error);
            setMessage(error.message);
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

                    <h1>Add New Comic</h1>

                    <p>
                        Add a comic and its reading panels
                        to your collection.
                    </p>
                </div>

                <form
                    className="upload-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">
                        <label>Comic Title</label>

                        <input
                            type="text"
                            placeholder="Enter comic title"
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label>Author</label>

                        <input
                            type="text"
                            placeholder="Enter author name"
                            value={author}
                            onChange={(e) =>
                                setAuthor(e.target.value)
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>

                        <textarea
                            placeholder="Enter comic description"
                            value={description}
                            onChange={(e) =>
                                setDescription(e.target.value)
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label>Cover Image</label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setCover(
                                    e.target.files[0]
                                )
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label>Comic Panels</label>

                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) =>
                                setPages(
                                    Array.from(
                                        e.target.files
                                    )
                                )
                            }
                        />

                        <small>
                            Select panels in reading order.
                        </small>
                    </div>

                    {message && (
                        <div className="upload-message">
                            {message}
                        </div>
                    )}

                    <div className="upload-buttons">

                        <button
                            type="button"
                            className="back-button"
                            onClick={onBack}
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