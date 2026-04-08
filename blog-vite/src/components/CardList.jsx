import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CardList({
  items = [],
  search = "",
  showSaved = false,
  deleteBlog,
  savedBlogIds = [],
  saveBlog,
  unsaveBlog,
}) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [savedIds, setSavedIds] = useState(savedBlogIds || []);
  const [copyMessage, setCopyMessage] = useState("");
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const currentUser =
    localStorage.getItem("username") ||
    localStorage.getItem("guestId");

  const navigate = useNavigate();

  useEffect(() => {
    setSavedIds(savedBlogIds || []);
  }, [savedBlogIds]);

  const copyData = (item, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(
      `Title: ${item?.title || ""}\nDescription: ${item?.desc || ""}`
    );
    setCopyMessage("Copied successfully ✓");
    setTimeout(() => setCopyMessage(""), 2000);
  };

  const toggleSave = (item, e) => {
    e.stopPropagation();
    if (!currentUser) {
      alert("You must login or continue as guest!");
      return;
    }
    if (savedIds.includes(item.id)) {
      setSavedIds((prev) => prev.filter((id) => id !== item.id));
      unsaveBlog && unsaveBlog(item.id);
    } else {
      setSavedIds((prev) => [...prev, item.id]);
      saveBlog && saveBlog(item.id);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!item) return false;
    if (showSaved && !savedIds.includes(item.id)) return false;
    if (search && !item.title?.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });


// 🔥 ONLY THIS FUNCTION UPDATED
const getImageSrc = (item) => {
  if (!item?.image) return "https://picsum.photos/300/200?random";

  if (item.image.startsWith("http")) return item.image;

  return `http://localhost:5111${item.image}`;
};
  const renderCards = (data) =>
    data.map((item) => {
      const isSaved = savedIds.includes(item.id);
      return (
        <div
          key={item.id}
          className="card"
          onClick={() => setSelectedCard(item)}
          style={{ position: "relative" }}
        >
          <svg
            onClick={(e) => toggleSave(item, e)}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="22"
            height="22"
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              cursor: "pointer",
              fill: isSaved ? "#ffffff" : "none",
              stroke: "#ffffff",
              strokeWidth: "2",
              zIndex: 10,
            }}
          >
            <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
          </svg>

          <img src={getImageSrc(item)} alt={item.title} />

          <div className="card-content">
            <div className="text-copy-wrapper">
              <div className="text-wrapper">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>

              <span className="copy-icon" onClick={(e) => copyData(item, e)}>
                🗍
              </span>
            </div>
          </div>
        </div>
      );
    });

  // ✅ Yes click: blog delete, popup stays open
  const handleYes = () => {
    if (!selectedCard || !deleteBlog) return;
    deleteBlog(selectedCard.id);
    console.log("Yes clicked: blog deleted");
    // popup remains open
  };

  // ✅ No click: action perform, popup stays open
  const handleNo = () => {
    console.log("No clicked: blog not deleted");
    // popup remains open
  };

  // ✅ Close icon: popup close
  const handleClosePopup = () => {
    setShowDeletePopup(false);
    setSelectedCard(null);
  };

  if (selectedCard) {
    const canDelete =
      selectedCard?.author &&
      currentUser &&
      selectedCard.author.toLowerCase() === currentUser.toLowerCase();

    return (
      <>
        <div className="fullpage-card">
          <button className="go-back-btn" onClick={() => setSelectedCard(null)}>
            ⮌
          </button>

          <div className="fullpage-content">
            <h2>{selectedCard.title}</h2>
            <img src={getImageSrc(selectedCard)} alt={selectedCard.title} />
            <p>{selectedCard.desc}</p>

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
  }}
>
  <div style={{ display: "flex", gap: "8px" }}>
    
    <button
      style={{
        padding: "4px 10px",
        borderRadius: "6px",
        border: "1px solid #374151",
        background: canDelete ? "#1f2933" : "#374151",
        color: canDelete ? "#60a5fa" : "#9ca3af",
        cursor: canDelete ? "pointer" : "not-allowed",
        fontSize: "12px",
      }}
      onClick={() => {
        if (!canDelete) return;
        navigate(`/edit-blog/${selectedCard.id}`, {
          state: { blog: selectedCard },
        });
      }}
      disabled={!canDelete}
    >
      Edit
    </button>
    <button
      style={{
        padding: "4px 10px",
        borderRadius: "6px",
        border: "1px solid #374151",
        background: canDelete ? "#1f2933" : "#374151",
        color: canDelete ? "#f87171" : "#9ca3af",
        cursor: canDelete ? "pointer" : "not-allowed",
        fontSize: "12px",
      }}
      onClick={() => {
        if (!canDelete) {
          alert("You can delete only your own blog");
          return;
        }
        setShowDeletePopup(true);
      }}
      disabled={!canDelete}
    >
      Delete
    </button>

  </div>

  <span className="copy-icon" onClick={() => copyData(selectedCard)}>
    🗍
  </span>
</div>
          </div>
        </div>

        {/* DELETE POPUP */}
        {showDeletePopup && (
          <div className="popup-overlay">
            <div className="popup-box">
              <button className="popup-close" onClick={handleClosePopup}>
                ×
              </button>

              <h3>Are you sure you want to delete?</h3>
              <div className="popup-actions">
                <button onClick={handleYes} className="yes">
                  Yes
                </button>
                <button onClick={handleNo} className="no">
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {copyMessage && <div className="copy-toast">{copyMessage}</div>}

        <style>{`
          .popup-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
          }

          .popup-box {
            background: #1f2933;
            padding: 20px;
            border-radius: 10px;
            color: white;
            text-align: center;
            width: 280px;
            position: relative;
          }

          .popup-close {
            position: absolute;
            top: 5px;
            right: 8px;
            background: transparent;
            border: none;
            font-size: 20px;
            color: lightblue;
            cursor: pointer;
          }

          .popup-actions {
            margin-top: 15px;
            display: flex;
            justify-content: space-around;
          }

          .yes {
            background: blue;
            color: white;
            padding: 6px 12px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }

          .no {
            background: gray;
            color: white;
            padding: 6px 12px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="card-container">
        {filteredItems.length > 0 ? (
          renderCards(filteredItems)
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              minHeight: "200px",
            }}
          >
            <p style={{ color: "#9ca3af", fontSize: "16px" }}>
              No blogs found.
            </p>
          </div>
        )}
      </div>

      {copyMessage && <div className="copy-toast">{copyMessage}</div>}
    </>
  );
}

export default CardList;