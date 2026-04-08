import React, { useState, useRef, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

function CreateBlog({ fetchBlogs }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: ""
  });

  const fileRef = useRef(null);
  const navigate = useNavigate();

  // 🔐 Auth check
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
      setPopup({
        show: true,
        message: "Login required to create a blog.",
        type: "error"
      });
      navigate("/login");
    }
  }, [navigate]);

  const handleGoBack = () => navigate("/blog");

  const openFilePicker = () => fileRef.current?.click();

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // 🔥 Cleanup preview URL
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const closePopup = () => {
    setPopup({ show: false, message: "", type: "" });

    if (popup.type === "success") {
      navigate("/blog");
    }
  };

  // 🔥 FILE CHANGE HANDLER (FIXED)
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    console.log("FILE:", selectedFile);

    if (!selectedFile) return;

    setFile(selectedFile);

    const objectUrl = URL.createObjectURL(selectedFile);
    console.log("PREVIEW:", objectUrl);

    setPreview(objectUrl);
  };

  // 🔥 ONLY THIS FUNCTION UPDATED
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("jwtToken");

    if (!token) {
      setPopup({
        show: true,
        message: "Login required!",
        type: "error"
      });
      return;
    }

    // ✅ FORM DATA (instead of JSON)
    const formData = new FormData();

    formData.append("title", title.trim() || "Default Title");
    formData.append("desc", desc.trim() || "Default Description");
    formData.append("category", "blog");
    formData.append("isActive", true);
    formData.append("isUserCreated", true);

    // 🔥 FILE ADD
    if (file) {
      formData.append("image", file);
    }

    try {
      await axiosInstance.post("/blogs", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setPopup({
        show: true,
        message: "Your blog has been created successfully!",
        type: "success"
      });

      setTitle("");
      setDesc("");
      clearFile();

      if (fetchBlogs) fetchBlogs();

    } catch (err) {
      console.log("🔥 FULL ERROR:", err.response?.data);
      console.log("❌ VALIDATION:", err.response?.data?.errors);

      setPopup({
        show: true,
        message: JSON.stringify(err.response?.data?.errors || "Error"),
        type: "error"
      });
    }
  };

  return (
    <div className="create-page" style={{ position: "relative" }}>

      {/* BACK BUTTON */}
      <button className="go-back-btn" onClick={handleGoBack}>
        ⮌
      </button>

      <form className="create-blog-form" onSubmit={handleSubmit}>
        <h2 className="create-title">Create a New Blog</h2>

        <input
          type="text"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* FILE UPLOAD */}
        <div style={{ marginTop: "20px" }}>
          <input
            type="file"
            ref={fileRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <div
            onClick={openFilePicker}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              padding: "12px",
              borderRadius: "6px",
              border: "1px dashed #3b82f6",
              cursor: "pointer",
              background: "transparent",
              color: "white"
            }}
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT95rKJldDyjAtvUJXQ4RpytJGo5QT8yooACQ&s"
              alt="attach"
              style={{
                width: "18px",
                height: "18px",
                filter: "invert(1)",
                opacity: "0.6"
              }}
            />
            <span style={{ opacity: file ? 1 : 0.6 }}>
              {file ? file.name : "Attach file"}
            </span>
          </div>

          {/* REMOVE BUTTON */}
          {file && (
            <button
              type="button"
              onClick={clearFile}
              style={{
                marginTop: "10px",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                background: "#0f172a",
                color: "#3b82f6",
                border: "1px solid #1e293b"
              }}
            >
              Remove File
            </button>
          )}

          {/* 🔥 PREVIEW */}
          {preview && (
            <div
              style={{
                marginTop: "15px",
                padding: "10px",
                border: "2px solid #3b82f6",
                borderRadius: "8px",
                background: "#020617"
              }}
            >
              <p style={{ color: "#9ca3af", fontSize: "13px" }}>
                Image Preview:
              </p>

              <img
                src={preview}
                alt="preview"
                style={{
                  width: "100%",
                  maxHeight: "60px",
                  objectFit: "contain",
                  borderRadius: "8px",
                  marginTop: "8px"
                }}
              />
            </div>
          )}
        </div>

        <textarea
          placeholder="Description"
          rows="6"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
          style={{ marginTop: "25px" }}
        />

        <div className="btn-center" style={{ marginTop: "25px" }}>
          <button type="submit" className="create-btn">
            Create
          </button>
        </div>
      </form>

     {popup.show && (
  <div
    onClick={closePopup}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.35)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "400px",
        background: "#111827",
        borderRadius: "12px",
        border: "1px solid #1f2937",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        overflow: "hidden"
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "16px",
          background: popup.type === "success" ? "#2563eb" : "#2563eb",
          color: "white",
          textAlign: "center",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px"
        }}
      >
        {popup.type === "success" ? "Success" : "Error"}

        {/* Symbol */}
        {popup.type === "success" ? (
          <span
            style={{
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "#22c55e",
              color: "white",
              fontSize: "14px",
              fontWeight: "bold"
            }}
          >
            ✓
          </span>
        ) : (
          <span
            style={{
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "#ef4444",
              color: "white",
              fontSize: "14px",
              fontWeight: "bold"
            }}
          >
            ✕
          </span>
        )}

        {/* CLOSE BUTTON */}
        <span
          onClick={closePopup}
          style={{
            position: "absolute",
            right: "15px",
            top: "10px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          ✕
        </span>
      </div>

      {/* BODY */}
      <div
        style={{
          padding: "25px",
          textAlign: "center",
          color: "#e5e7eb",
          fontSize: "14px"
        }}
      >
        {popup.message}
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default CreateBlog; 