import React, { useState } from "react";
import "./EditComic.css";

function EditComic({
    comic,
    onBack,
    onUpdated
}) {

    const [title, setTitle] =
        useState(comic.title || "");

    const [author, setAuthor] =
        useState(comic.author || "");

    const [description, setDescription] =
        useState(comic.description || "");

    const [cover, setCover] =
        useState(null);

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

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

        const formData =
            new FormData();

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

        if (cover) {
            formData.append(
                "cover",
                cover
            );
        }

        setLoading(true);

        try {

            const response =
                await fetch(
                    `http://localhost:8080/api/comics/${comic.id}`,
                    {
                        method: "PUT",
                        credentials: "include",
                        body: formData
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    typeof data === "string"
                        ? data
                        : "Failed to update comic."
                );
            }

            alert(
                "Comic updated successfully."
            );

            window.dispatchEvent(
                new Event("comicUpdated")
            );

            onUpdated();

        } catch (error) {

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
                    ← Back
                </button>

                <div className="edit-heading">

                    <span>
                        HOST MANAGEMENT
                    </span>

                    <h1>
                        Edit Comic
                    </h1>

                    <p>
                        Update the comic information.
                    </p>

                </div>

                {error && (
                    <div className="edit-error">
                        {error}
                    </div>
                )}

                <form
                    className="edit-form"
                    onSubmit={handleSubmit}
                >

                    <label>
                        Comic Title
                    </label>

                    <input
                        type="text"
                        value={title}
                        onChange={(e) =>
                            setTitle(
                                e.target.value
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
                        onChange={(e) =>
                            setAuthor(
                                e.target.value
                            )
                        }
                        required
                    />

                    <label>
                        Description
                    </label>

                    <textarea
                        value={description}
                        onChange={(e) =>
                            setDescription(
                                e.target.value
                            )
                        }
                        rows="6"
                    />

                    <label>
                        Replace Cover
                    </label>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            setCover(
                                e.target.files[0] ||
                                null
                            )
                        }
                    />

                    {comic.imageUrl && (
                        <div className="current-cover">

                            <span>
                                Current Cover
                            </span>

                            <img
                                src={
                                    comic.imageUrl.startsWith(
                                        "http"
                                    )
                                        ? comic.imageUrl
                                        : `http://localhost:8080${comic.imageUrl}`
                                }
                                alt={comic.title}
                            />

                        </div>
                    )}

                    <div className="edit-actions">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onBack}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="save-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default EditComic;