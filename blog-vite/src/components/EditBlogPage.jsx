import React, { useState, useRef, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate, useLocation, useParams } from "react-router-dom";
const BASE_URL = "http://localhost:5111";

function EditBlogPage({ fetchBlogs }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Get blog either from state (CardList) or fetch by id if directly accessed
  const [blogData, setBlogData] = useState(location.state?.blog || null);

  const [title, setTitle] = useState(blogData?.title || "");
  const [desc, setDesc] = useState(blogData?.desc || "");
 
  const [file, setFile] = useState({
  name: blogData?.image?.split("/").pop() || "",
});
  const [preview, setPreview] = useState(
  blogData?.image
    ? blogData.image.startsWith("http")
      ? blogData.image
      : `${BASE_URL}${blogData.image}`
    : null
);

  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  const fileRef = useRef(null);

  // 🔹 Fetch blog if direct navigation
  useEffect(() => {
    if (!blogData && params.id) {
      const fetchBlog = async () => {
        try {
          const res = await axiosInstance.get(`/blogs/${params.id}`);
          setBlogData(res.data);
          setTitle(res.data.title);
          setDesc(res.data.desc);
          setPreview(
  res.data.image
    ? res.data.image.startsWith("http")
      ? res.data.image
      : `${BASE_URL}${res.data.image}`
    : null
);
        } catch (err) {
          console.error("Error fetching blog:", err);
          setPopup({
            show: true,
            message: "Failed to load blog.",
            type: "error",
          });
        }
      };
      fetchBlog();
    }
  }, [blogData, params.id]);

  const handleGoBack = () => navigate("/blog");

  const openFilePicker = () => fileRef.current?.click();

  const clearFile = () => {
    setFile(null);
    setPreview(blogData?.image || null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (preview && file) URL.revokeObjectURL(preview);
    };
  }, [preview, file]);

  const closePopup = () => {
    setPopup({ show: false, message: "", type: "" });
    if (popup.type === "success") navigate("/blog");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!blogData) {
      setPopup({ show: true, message: "Blog not loaded.", type: "error" });
      return;
    }

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setPopup({ show: true, message: "Login required!", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim() || "Default Title");
    formData.append("desc", desc.trim() || "Default Description");
    formData.append("category", "blog");
    formData.append("isActive", true);
    formData.append("isUserCreated", true);
    if (file) formData.append("image", file);

    try {
      await axiosInstance.put(`/blogs/${blogData.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setPopup({
        show: true,
        message: "Your blog has been updated successfully!",
        type: "success",
      });

      if (fetchBlogs) fetchBlogs();
    } catch (err) {
      console.error("Error updating blog:", err.response?.data || err);
      setPopup({
        show: true,
        message:
          JSON.stringify(err.response?.data?.errors || "Update failed"),
        type: "error",
      });
    }
  };

  if (!blogData) return <p style={{ color: "white" }}>Loading blog...</p>;

  return (
    <div className="create-page" style={{ position: "relative" }}>
      <button className="go-back-btn" onClick={handleGoBack}>
        ⮌
      </button>

      <form className="create-blog-form" onSubmit={handleSubmit}>
        <h2 className="create-title">Edit Blog</h2>

        <input
          type="text"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* File Upload */}
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
              color: "white",
            }}
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT95rKJldDyjAtvUJXQ4RpytJGo5QT8yooACQ&s"
              alt="attach"
              style={{ width: "18px", height: "18px", filter: "invert(1)", opacity: 0.6 }}
            />
            <span style={{ opacity: file ? 1 : 0.6 }}>
              {file ? file.name : "Attach file"}
            </span>
          </div>

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
                border: "1px solid #1e293b",
              }}
            >
              Remove File
            </button>
          )}

          {preview && (
            <div
              style={{
                marginTop: "15px",
                padding: "10px",
                border: "2px solid #3b82f6",
                borderRadius: "8px",
                background: "#020617",
              }}
            >
              <p style={{ color: "#9ca3af", fontSize: "13px" }}>Image Preview:</p>
              <img
                src={preview}
                alt="preview"
                style={{
                  width: "100%",
                  maxHeight: "60px",
                  objectFit: "contain",
                  borderRadius: "8px",
                  marginTop: "8px",
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
            Update
          </button>
        </div>
      </form>

      {/* Popup */}
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
      zIndex: 999,
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
        overflow: "hidden",
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
          gap: "8px",
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
              fontWeight: "bold",
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
              fontWeight: "bold",
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
            fontSize: "16px",
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
          fontSize: "14px",
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

export default EditBlogPage;