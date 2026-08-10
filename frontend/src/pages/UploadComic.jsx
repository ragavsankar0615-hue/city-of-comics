import React, { useState } from "react";

const API_URL = "http://localhost:8081";

function UploadComic({ onUploadSuccess }) {

    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [description, setDescription] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [file, setFile] = useState(null);

    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleFileChange = (event) => {

        const selectedFile =
            event.target.files[0];

        setError("");
        setMessage("");

        if (!selectedFile) {
            setFile(null);
            return;
        }

        if (
            !selectedFile.name
                .toLowerCase()
                .endsWith(".cbz")
        ) {

            setError(
                "Please select a .cbz file."
            );

            setFile(null);
            return;
        }

        setFile(selectedFile);
    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setMessage("");

        if (!title.trim()) {
            setError(
                "Please enter the comic title."
            );
            return;
        }

        if (!author.trim()) {
            setError(
                "Please enter the author name."
            );
            return;
        }

        if (!file) {
            setError(
                "Please select a CBZ file."
            );
            return;
        }

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

        formData.append(
            "coverImage",
            coverImage.trim()
        );

        formData.append(
            "file",
            file
        );

        try {

            setUploading(true);

            const response = await fetch(
                `${API_URL}/api/comics/upload-cbz`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const contentType =
                response.headers.get(
                    "content-type"
                );

            let result;

            if (
                contentType &&
                contentType.includes(
                    "application/json"
                )
            ) {

                result = await response.json();

            } else {

                result = await response.text();

            }

            if (!response.ok) {

                throw new Error(
                    typeof result === "string"
                        ? result
                        : result.message ||
                          "Upload failed."
                );
            }

            setMessage(
                "Comic uploaded successfully!"
            );

            setTitle("");
            setAuthor("");
            setDescription("");
            setCoverImage("");
            setFile(null);

            const fileInput =
                document.getElementById(
                    "comic-file"
                );

            if (fileInput) {
                fileInput.value = "";
            }

            if (onUploadSuccess) {

                setTimeout(() => {
                    onUploadSuccess();
                }, 800);
            }

        } catch (err) {

            console.error(
                "Comic upload error:",
                err
            );

            setError(
                err.message ||
                "Unable to upload comic."
            );

        } finally {

            setUploading(false);

        }
    };

    return (

        <section className="upload-card">

            <div className="upload-card-header">

                <div className="upload-icon">
                    📚
                </div>

                <div>
                    <h2>
                        Upload Comics
                    </h2>

                    <p>
                        Add a new comic to City of Comics
                    </p>
                </div>

            </div>

            <div className="upload-divider"></div>

            <form
                className="upload-form"
                onSubmit={handleSubmit}
            >

                {/* TITLE */}

                <div className="form-group">

                    <label htmlFor="comic-title">
                        Comic Title
                    </label>

                    <input
                        id="comic-title"
                        type="text"
                        value={title}
                        onChange={(event) =>
                            setTitle(
                                event.target.value
                            )
                        }
                        placeholder="Enter comic title"
                    />

                </div>

                {/* AUTHOR */}

                <div className="form-group">

                    <label htmlFor="comic-author">
                        Author
                    </label>

                    <input
                        id="comic-author"
                        type="text"
                        value={author}
                        onChange={(event) =>
                            setAuthor(
                                event.target.value
                            )
                        }
                        placeholder="Enter author name"
                    />

                </div>

                {/* DESCRIPTION */}

                <div className="form-group">

                    <label htmlFor="comic-description">
                        Description
                    </label>

                    <textarea
                        id="comic-description"
                        value={description}
                        onChange={(event) =>
                            setDescription(
                                event.target.value
                            )
                        }
                        placeholder="Enter comic description"
                        rows="5"
                    />

                </div>

                {/* COVER URL */}

                <div className="form-group">

                    <label htmlFor="cover-image">
                        Cover Image URL
                        <span>
                            Optional
                        </span>
                    </label>

                    <input
                        id="cover-image"
                        type="text"
                        value={coverImage}
                        onChange={(event) =>
                            setCoverImage(
                                event.target.value
                            )
                        }
                        placeholder="Optional — first CBZ page is used automatically"
                    />

                    <small>
                        Leave this empty to use
                        the first page of the CBZ
                        as the cover.
                    </small>

                </div>

                {/* FILE */}

                <div className="form-group">

                    <label htmlFor="comic-file">
                        Comic CBZ File
                    </label>

                    <div className="file-input-wrapper">

                        <input
                            id="comic-file"
                            type="file"
                            accept=".cbz"
                            onChange={
                                handleFileChange
                            }
                        />

                    </div>

                    {file && (

                        <div className="selected-file">
                            📦 {file.name}
                        </div>

                    )}

                </div>

                {/* REQUIREMENTS */}

                <div className="requirements">

                    <h3>
                        CBZ Requirements
                    </h3>

                    <ul>

                        <li>
                            Upload a .cbz file
                        </li>

                        <li>
                            Images should be JPG,
                            JPEG, PNG or WEBP
                        </li>

                        <li>
                            First image becomes
                            the comic cover
                        </li>

                    </ul>

                </div>

                {/* ERROR */}

                {error && (

                    <div className="upload-error">
                        ❌ {error}
                    </div>

                )}

                {/* SUCCESS */}

                {message && (

                    <div className="upload-success">
                        ✓ {message}
                    </div>

                )}

                {/* BUTTON */}

                <button
                    type="submit"
                    className="upload-submit"
                    disabled={uploading}
                >

                    {uploading
                        ? "Uploading..."
                        : "↑ Upload Comic"}

                </button>

            </form>

        </section>
    );
}

export default UploadComic;