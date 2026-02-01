import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function CreateBlog() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);

  const fileRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/blog");
  };

  const clearFile = () => {
    setFile(null);
    fileRef.current.value = "";
  };

  const openFilePicker = () => {
    fileRef.current.click();
  };

  return (
    <div className="create-page">
      <form className="create-blog-form" onSubmit={handleSubmit}>
        
        {/* ✅ Title INSIDE form */}
        <h2 className="create-title">Create a New Blog</h2>

        {/* Blog title */}
        <input
          type="text"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* File upload */}
        <div style={{ marginTop: "12px" }}>
          <input
            type="file"
            ref={fileRef}
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files[0])}
          />

          <input
            type="text"
            readOnly
            placeholder="Attached file"
            value={file ? file.name : ""}
            onClick={openFilePicker}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "6px",
              border: "1px dashed #3b82f6",
              cursor: "pointer",
              background: "transparent",
              color: "white",
            }}
          />

          {file && (
            <button
              type="button"
              onClick={clearFile}
              style={{
                marginTop: "6px",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                background: "#1e293b",
                color: "#f87171",
                border: "1px solid #374151",
              }}
            >
              Remove File
            </button>
          )}
        </div>

        {/* Description */}
        <textarea
          placeholder="Description"
          rows="6"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          required
        ></textarea>

       <div className="btn-center">
  <button type="submit" className="create-btn">Create</button>
</div>

      </form>
    </div>
  );
}

export default CreateBlog;
