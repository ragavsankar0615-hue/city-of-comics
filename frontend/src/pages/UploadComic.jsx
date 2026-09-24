import React, { useState } from "react";
import "./UploadComic.css";
import { API_BASE_URL } from "../config";

const MAX_COVER_SIZE = 10 * 1024 * 1024;
const MAX_PAGE_SIZE = 20 * 1024 * 1024;
const MAX_PANELS = 200;

function UploadComic({ user, onBack, onUploaded }) {
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [description, setDescription] = useState("");
    const [cover, setCover] = useState(null);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const resetForm = () => {
        setTitle("");
        setAuthor("");
        setDescription("");
        setCover(null);
        setPages([]);
        setProgress(0);

        document
            .querySelectorAll('input[type="file"]')
            .forEach(input => {
                input.value = "";
            });
    };

    const uploadToSignedUrl = (file, signedUrl, onProgress) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open("PUT", signedUrl, true);
            xhr.setRequestHeader(
                "Content-Type",
                file.type || "application/octet-stream"
            );
            xhr.setRequestHeader("x-upsert", "false");

            xhr.upload.onprogress = event => {
                if (event.lengthComputable) {
                    onProgress(event.loaded);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    onProgress(file.size);
                    resolve();
                    return;
                }

                reject(
                    new Error(
                        `Storage upload failed (${xhr.status}).`
                    )
                );
            };

            xhr.onerror = () => {
                reject(new Error("Network error while uploading an image."));
            };

            xhr.onabort = () => {
                reject(new Error("Upload was cancelled."));
            };

            xhr.send(file);
        });
    };

    const uploadFilesWithConcurrency = async items => {
        let completedBytes = 0;
        const totalBytes = items.reduce(
            (total, item) => total + item.file.size,
            0
        );

        const loadedBytes = new Array(items.length).fill(0);
        const updateProgress = index => {
            loadedBytes[index] = Math.min(
                items[index].file.size,
                loadedBytes[index]
            );

            const currentBytes =
                completedBytes +
                loadedBytes.reduce((sum, value) => sum + value, 0);

            const percent = totalBytes
                ? Math.min(100, Math.round((currentBytes / totalBytes) * 100))
                : 100;

            setProgress(percent);
        };

        let nextIndex = 0;

        const worker = async () => {
            while (true) {
                const index = nextIndex++;

                if (index >= items.length) {
                    return;
                }

                const item = items[index];

                await uploadToSignedUrl(
                    item.file,
                    item.signedUrl,
                    loaded => {
                        loadedBytes[index] = loaded;
                        updateProgress(index);
                    }
                );

                completedBytes += item.file.size;
                loadedBytes[index] = 0;
                updateProgress(index);
            }
        };

        const workerCount = Math.min(4, items.length);
        await Promise.all(
            Array.from({ length: workerCount }, () => worker())
        );

        setProgress(100);
    };

    const handleSubmit = async event => {
        event.preventDefault();

        setMessage("");
        setMessageType("");
        setProgress(0);

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

        if (pages.length > MAX_PANELS) {
            setMessage(`You can upload a maximum of ${MAX_PANELS} panels.`);
            setMessageType("error");
            return;
        }

        if (cover && cover.size > MAX_COVER_SIZE) {
            setMessage("Cover image must be 10 MB or smaller.");
            setMessageType("error");
            return;
        }

        const invalidPage = pages.find(
            page => page.size <= 0 || page.size > MAX_PAGE_SIZE
        );

        if (invalidPage) {
            setMessage("Each comic panel must be larger than 0 and 20 MB or smaller.");
            setMessageType("error");
            return;
        }

        setLoading(true);
        setMessage("Preparing secure storage upload...");
        setMessageType("success");

        let initData = null;
        let uploadItems = [];

        const abortUpload = async () => {
            if (!initData?.comicId || uploadItems.length === 0) {
                return;
            }

            try {
                await fetch(
                    `${API_BASE_URL}/api/comics/${initData.comicId}/upload-abort`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            paths: uploadItems.map(item => item.path)
                        })
                    }
                );
            } catch (abortError) {
                console.error("Upload cleanup failed:", abortError);
            }
        };

        try {
            if (!user) {
                throw new Error("Please sign in before uploading.");
            }

            if (user.role !== "HOST") {
                throw new Error("Only HOST can upload comics.");
            }

            const initResponse = await fetch(
                `${API_BASE_URL}/api/comics/upload/init`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title: title.trim(),
                        author: author.trim(),
                        description: description.trim(),
                        cover: cover
                            ? {
                                  name: cover.name,
                                  contentType: cover.type,
                                  size: cover.size
                              }
                            : null,
                        panels: pages.map(page => ({
                            name: page.name,
                            contentType: page.type,
                            size: page.size
                        }))
                    })
                }
            );

            const initText = await initResponse.text();

            try {
                initData = initText ? JSON.parse(initText) : {};
            } catch {
                initData = {};
            }

            if (!initResponse.ok) {
                throw new Error(
                    initData.message ||
                    "Unable to prepare comic upload."
                );
            }

            uploadItems = [];

            if (cover && initData.cover) {
                uploadItems.push({
                    file: cover,
                    signedUrl: initData.cover.signedUrl,
                    path: initData.cover.path,
                    type: "cover"
                });
            }

            pages.forEach((page, index) => {
                const signed = initData.panels?.[index];

                if (!signed) {
                    throw new Error(
                        `Missing upload URL for panel ${index + 1}.`
                    );
                }

                uploadItems.push({
                    file: page,
                    signedUrl: signed.signedUrl,
                    path: signed.path,
                    type: "panel"
                });
            });

            if (uploadItems.length === 0) {
                throw new Error("No files were prepared for upload.");
            }

            setMessage("Uploading comic files directly to Supabase...");

            await uploadFilesWithConcurrency(uploadItems);

            const coverItem = uploadItems.find(
                item => item.type === "cover"
            );

            const panelPaths = uploadItems
                .filter(item => item.type === "panel")
                .map(item => item.path);

            setMessage("Saving comic details...");

            const completeResponse = await fetch(
                `${API_BASE_URL}/api/comics/${initData.comicId}/upload-complete`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        coverPath: coverItem?.path || null,
                        panels: panelPaths
                    })
                }
            );

            const completeText = await completeResponse.text();
            let completeData = {};

            try {
                completeData = completeText
                    ? JSON.parse(completeText)
                    : {};
            } catch {
                completeData = {};
            }

            if (!completeResponse.ok) {
                throw new Error(
                    completeData.message ||
                    "Comic upload could not be completed."
                );
            }

            setMessage("Comic added successfully!");
            setMessageType("success");

            resetForm();

            if (onUploaded) {
                onUploaded();
            }
        } catch (error) {
            await abortUpload();

            console.error("Comic upload error:", error);

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

                    <h1>Add New Comic</h1>

                    <p>
                        Add a comic and its reading panels to your collection.
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
                            onChange={e => setTitle(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Author</label>
                        <input
                            type="text"
                            placeholder="Enter author name"
                            value={author}
                            onChange={e => setAuthor(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            placeholder="Enter comic description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Cover Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e =>
                                setCover(
                                    e.target.files?.[0] || null
                                )
                            }
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Comic Panels</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={e =>
                                setPages(
                                    Array.from(e.target.files || [])
                                )
                            }
                            disabled={loading}
                        />

                        <small>
                            Select panels in reading order.
                        </small>

                        {pages.length > 0 && (
                            <small>
                                {pages.length} panel
                                {pages.length > 1 ? "s" : ""} selected.
                            </small>
                        )}
                    </div>

                    {loading && (
                        <div className="form-group">
                            <small>
                                Upload progress: {progress}%
                            </small>
                            <div
                                style={{
                                    width: "100%",
                                    height: "6px",
                                    background: "rgba(255,255,255,0.12)",
                                    borderRadius: "999px",
                                    overflow: "hidden",
                                    marginTop: "8px"
                                }}
                            >
                                <div
                                    style={{
                                        width: `${progress}%`,
                                        height: "100%",
                                        background: "currentColor",
                                        transition: "width 0.15s ease"
                                    }}
                                />
                            </div>
                        </div>
                    )}

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
                                ? `UPLOADING ${progress}%...`
                                : "ADD COMIC →"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

export default UploadComic;
