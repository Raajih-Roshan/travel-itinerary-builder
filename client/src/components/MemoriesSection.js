import { useState, useEffect } from "react";
import axios from "axios";

export default function MemoriesSection({ tripId, token, isCompleted }) {
  const [memories, setMemories]         = useState([]);
  const [caption, setCaption]           = useState("");
  const [uploading, setUploading]       = useState(false);
  const [progress, setProgress]         = useState(0);
  const [error, setError]               = useState("");
  const [preview, setPreview]           = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [lightbox, setLightbox]         = useState(null); // currently open memory
  const [lightboxIndex, setLightboxIndex] = useState(0); // for prev/next

  const headers = { Authorization: "Bearer " + token };

  useEffect(() => {
    axios.get("http://localhost:5000/api/memories/" + tripId, { headers })
      .then(res => setMemories(res.data))
      .catch(() => {});
  }, [tripId, token]);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (!lightbox) return;
      if (e.key === "Escape")     closeLightbox();
      if (e.key === "ArrowRight") nextMemory();
      if (e.key === "ArrowLeft")  prevMemory();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightbox, lightboxIndex, memories]);

  // Prevent body scroll when lightbox open
  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  const openLightbox = (memory, index) => {
    setLightbox(memory);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightbox(null);
  };

  const nextMemory = () => {
    const next = (lightboxIndex + 1) % memories.length;
    setLightbox(memories[next]);
    setLightboxIndex(next);
  };

  const prevMemory = () => {
    const prev = (lightboxIndex - 1 + memories.length) % memories.length;
    setLightbox(memories[prev]);
    setLightboxIndex(prev);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return setError("Please select a file");

    setUploading(true);
    setProgress(0);
    setError("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("caption", caption);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/memories/" + tripId,
        formData,
        {
          headers: { ...headers, "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const pct = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(pct);
          }
        }
      );
      setMemories([res.data, ...memories]);
      setCaption("");
      setSelectedFile(null);
      setPreview(null);
      setProgress(0);
      document.getElementById("memory-file-input").value = "";
    } catch (err) {
      setError(err.response?.data?.msg || "Upload failed — try again");
    } finally {
      setUploading(false);
    }
  };

  const deleteMemory = async (id) => {
    if (!window.confirm("Delete this memory permanently?")) return;
    try {
      await axios.delete(
        "http://localhost:5000/api/memories/" + id, { headers }
      );
      setMemories(memories.filter(m => m._id !== id));
      if (lightbox?._id === id) closeLightbox();
    } catch {
      setError("Failed to delete memory");
    }
  };

  return (
    <div className="memories-section">

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          onClick={closeLightbox}
          style={{
            position: "fixed", top: 0, left: 0,
            width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.92)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 0.2s ease"
          }}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            style={{
              position: "absolute", top: "20px", right: "24px",
              background: "rgba(255,255,255,0.15)",
              border: "none", color: "white",
              width: "44px", height: "44px",
              borderRadius: "50%", cursor: "pointer",
              fontSize: "20px", fontWeight: "700",
              display: "flex", alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
              zIndex: 10000
            }}
            onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.3)"}
            onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.15)"}
          >
            ✕
          </button>

          {/* Counter */}
          <div style={{
            position: "absolute", top: "24px", left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,255,255,0.15)",
            color: "white", padding: "6px 16px",
            borderRadius: "20px", fontSize: "13px",
            fontWeight: "600"
          }}>
            {lightboxIndex + 1} / {memories.length}
          </div>

          {/* Prev button */}
          {memories.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevMemory(); }}
              style={{
                position: "absolute", left: "20px",
                background: "rgba(255,255,255,0.15)",
                border: "none", color: "white",
                width: "48px", height: "48px",
                borderRadius: "50%", cursor: "pointer",
                fontSize: "22px",
                display: "flex", alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
                zIndex: 10000
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            >
              ‹
            </button>
          )}

          {/* Next button */}
          {memories.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextMemory(); }}
              style={{
                position: "absolute", right: "20px",
                background: "rgba(255,255,255,0.15)",
                border: "none", color: "white",
                width: "48px", height: "48px",
                borderRadius: "50%", cursor: "pointer",
                fontSize: "22px",
                display: "flex", alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
                zIndex: 10000
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            >
              ›
            </button>
          )}

          {/* Media */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw", maxHeight: "80vh",
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: "16px"
            }}
          >
            {lightbox.fileType === "video" ? (
              <video
                src={lightbox.url}
                controls
                autoPlay
                style={{
                  maxWidth: "90vw", maxHeight: "70vh",
                  borderRadius: "12px",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
                }}
              />
            ) : (
              <img
                src={lightbox.url}
                alt={lightbox.caption || "Memory"}
                style={{
                  maxWidth: "90vw", maxHeight: "70vh",
                  borderRadius: "12px",
                  objectFit: "contain",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
                }}
              />
            )}

            {/* Caption and info */}
            <div style={{
              textAlign: "center",
              color: "white"
            }}>
              {lightbox.caption && (
                <p style={{
                  fontSize: "16px", fontWeight: "600",
                  marginBottom: "6px"
                }}>
                  {lightbox.caption}
                </p>
              )}
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                📷 {lightbox.uploadedBy?.name || "Unknown"} · {new Date(lightbox.createdAt).toDateString()}
              </p>

              {/* Delete from lightbox */}
              <button
                onClick={() => deleteMemory(lightbox._id)}
                style={{
                  marginTop: "12px",
                  background: "rgba(229,62,62,0.2)",
                  border: "1px solid rgba(229,62,62,0.4)",
                  color: "#fc8181", padding: "8px 20px",
                  borderRadius: "8px", cursor: "pointer",
                  fontSize: "13px", fontWeight: "600",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(229,62,62,0.4)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(229,62,62,0.2)"}
              >
                🗑️ Delete Memory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center",
        gap: "10px", marginBottom: "20px"
      }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a2e" }}>
          📸 Trip Memories
        </h3>
        {memories.length > 0 && (
          <span style={{
            background: "#ede9fe", color: "#4f46e5",
            padding: "2px 10px", borderRadius: "20px",
            fontSize: "12px", fontWeight: "700"
          }}>
            {memories.length}
          </span>
        )}
      </div>

      {/* ── Upload Form ── */}
      {isCompleted ? (
        <div className="memory-upload-card">
          <h4 style={{
            marginBottom: "14px", color: "#1a1a2e",
            fontSize: "14px", fontWeight: "700"
          }}>
            ➕ Add a Memory
          </h4>

          {error && <div className="error-msg">{error}</div>}

          {/* Preview */}
          {preview && (
            <div style={{ marginBottom: "14px", position: "relative" }}>
              {selectedFile?.type.startsWith("video") ? (
                <video
                  src={preview} controls
                  style={{
                    width: "100%", maxHeight: "200px",
                    borderRadius: "10px", objectFit: "cover"
                  }}
                />
              ) : (
                <img
                  src={preview} alt="preview"
                  style={{
                    width: "100%", maxHeight: "200px",
                    borderRadius: "10px", objectFit: "cover"
                  }}
                />
              )}
              <button
                onClick={() => { setPreview(null); setSelectedFile(null); }}
                style={{
                  position: "absolute", top: "8px", right: "8px",
                  background: "rgba(0,0,0,0.6)", color: "white",
                  border: "none", borderRadius: "50%",
                  width: "28px", height: "28px",
                  cursor: "pointer", fontSize: "14px"
                }}
              >✕</button>
            </div>
          )}

          <form onSubmit={handleUpload}>
            <label style={{
              display: "block", padding: "16px",
              border: "2px dashed #c4b5fd", borderRadius: "12px",
              textAlign: "center", cursor: "pointer",
              background: "#faf8ff", marginBottom: "10px"
            }}>
              <input
                id="memory-file-input"
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <span style={{ fontSize: "28px", display: "block", marginBottom: "6px" }}>
                📁
              </span>
              <span style={{ fontSize: "13px", color: "#4f46e5", fontWeight: "600" }}>
                {selectedFile ? selectedFile.name : "Click to select photo or video"}
              </span>
              <span style={{ fontSize: "11px", color: "#aaa", display: "block", marginTop: "4px" }}>
                JPG, PNG, GIF, MP4, MOV — Max 50MB
              </span>
            </label>

            <input
              placeholder="Add a caption (optional)"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              style={{ marginBottom: "10px" }}
            />

            {/* Progress Bar */}
            {uploading && (
              <div style={{ marginBottom: "10px" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  marginBottom: "4px"
                }}>
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    Uploading to Cloudinary...
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#4f46e5" }}>
                    {progress}%
                  </span>
                </div>
                <div style={{
                  height: "6px", background: "#f0f0f0",
                  borderRadius: "10px", overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%", width: progress + "%",
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    borderRadius: "10px", transition: "width 0.3s ease"
                  }}/>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={uploading || !selectedFile}
              style={{ opacity: (!selectedFile || uploading) ? 0.6 : 1 }}
            >
              {uploading ? `Uploading... ${progress}%` : "📤 Upload Memory"}
            </button>
          </form>
        </div>
      ) : (
        <div style={{
          padding: "16px", background: "#f8f8ff",
          borderRadius: "12px", marginBottom: "20px",
          border: "1px dashed #c4b5fd", textAlign: "center"
        }}>
          <p style={{ color: "#888", fontSize: "13px" }}>
            📸 Memories can only be added to{" "}
            <strong>Completed</strong> trips.
            <br />Set an end date in the past to mark trip as completed.
          </p>
        </div>
      )}

      {/* ── Memories Gallery ── */}
      {memories.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "40px 20px",
          color: "#aaa", background: "#fafafa",
          borderRadius: "12px", border: "2px dashed #e0e0e0"
        }}>
          <p style={{ fontSize: "36px", marginBottom: "10px" }}>📷</p>
          <p style={{ fontSize: "14px", fontWeight: "600" }}>No memories yet</p>
          {isCompleted && (
            <p style={{ fontSize: "12px", marginTop: "6px", color: "#bbb" }}>
              Upload your first photo or video above!
            </p>
          )}
        </div>
      ) : (
        <>
          <p style={{
            fontSize: "12px", color: "#888",
            marginBottom: "12px", fontWeight: "600"
          }}>
            {memories.length} memor{memories.length !== 1 ? "ies" : "y"} uploaded
            · click any photo to open
          </p>

          <div className="memories-grid">
            {memories.map((memory, index) => (
              <div
                key={memory._id}
                className="memory-item"
                style={{ cursor: "pointer" }}
              >
                {/* Media — clickable */}
                <div
                  onClick={() => openLightbox(memory, index)}
                  style={{ position: "relative", overflow: "hidden" }}
                >
                  {memory.fileType === "video" ? (
                    <video
                      src={memory.url}
                      className="memory-media"
                      style={{ pointerEvents: "none" }}
                    />
                  ) : (
                    <img
                      src={memory.url}
                      alt={memory.caption || "Memory"}
                      className="memory-media"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x180?text=Image+Not+Found";
                      }}
                    />
                  )}

                  {/* Hover overlay */}
                  <div style={{
                    position: "absolute", top: 0, left: 0,
                    width: "100%", height: "100%",
                    background: "rgba(79,70,229,0)",
                    display: "flex", alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    fontSize: "28px",
                    opacity: 0
                  }}
                  className="memory-hover-overlay"
                  >
                    🔍
                  </div>
                </div>

                {/* Info */}
                <div className="memory-info">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {memory.caption && (
                      <p style={{
                        fontSize: "13px", fontWeight: "600",
                        color: "#1a1a2e", marginBottom: "3px",
                        overflow: "hidden", textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {memory.caption}
                      </p>
                    )}
                    <p style={{ fontSize: "11px", color: "#888" }}>
                      {memory.uploadedBy?.name || "Unknown"}
                    </p>
                    <p style={{ fontSize: "11px", color: "#aaa" }}>
                      {new Date(memory.createdAt).toDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMemory(memory._id)}
                    title="Delete memory"
                    style={{
                      background: "transparent", border: "none",
                      color: "#e53e3e", cursor: "pointer",
                      fontSize: "14px", padding: "2px 4px",
                      flexShrink: 0, borderRadius: "4px",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={e => e.target.style.background = "#fff5f5"}
                    onMouseLeave={e => e.target.style.background = "transparent"}
                  >✕</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}