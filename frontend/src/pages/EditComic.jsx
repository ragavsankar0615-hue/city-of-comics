import React, { useState } from "react";
import "./EditComic.css";

import { API_BASE_URL } from "../config";

function EditComic({
    comic,
    onBack,
    onSuccess
}) {
    const [title, setTitle] =
        useState(comic.title || "");

    const [author, setAuthor] =
        useState(comic.author || "");

    const [description, setDescription] =
        useState(comic.description || "");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");

        if (!title.trim()) {
            setError(
                "Comic title is required."
            );
            return;
        }

        if (!author.trim()) {
            setError(
                "Author is required."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/comics/${comic.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        title: title.trim(),
                        author: author.trim(),
                        description:
                            description.trim(),
                        imageUrl:
                            comic.imageUrl || ""
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to update comic."
                );
            }

            setMessage(
                "Comic updated successfully!"
            );

            setTimeout(() => {
                onSuccess();
            }, 700);

        } catch (error) {
            console.error(
                "Edit error:",
                error
            );

            setError(
                error.message ||
                "Unable to update comic."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-page">

            <div className="edit-card">

                <button
                    className="edit-back"
                    onClick={onBack}
                >
                    ← Back to Collection
                </button>

                <h1>
                    Edit Comic
                </h1>

                <p className="edit-subtitle">
                    Update the comic information
                </p>

                <form
                    onSubmit={handleSubmit}
                >

                    <label>
                        Comic Title
                    </label>

                    <input
                        type="text"
                        value={title}
                        onChange={(event) =>
                            setTitle(
                                event.target.value
                            )
                        }
                        required
                    />

                    <label>
                        Author
                    </label>

                    <input
                        type="text"
                        value={author}
                        onChange={(event) =>
                            setAuthor(
                                event.target.value
                            )
                        }
                        required
                    />

                    <label>
                        Description
                    </label>

                    <textarea
                        value={description}
                        onChange={(event) =>
                            setDescription(
                                event.target.value
                            )
                        }
                        rows="6"
                    />

                    {error && (
                        <div className="edit-error">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="edit-success">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="save-edit-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : "Save Changes"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default EditComic;