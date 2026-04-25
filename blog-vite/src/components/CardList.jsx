import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
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
  const [showLoginPopup, setShowLoginPopup] = useState(false);
const [pendingAction, setPendingAction] = useState(null);
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

    const isGuest = localStorage.getItem("userType") === "guest";

    if (!currentUser || isGuest) {
      setShowLoginPopup(true);
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

  const filteredItems = (items || []).filter((item) => {
    if (!item) return false;
    if (showSaved && !savedIds.includes(item.id)) return false;

    if (
      search &&
      !(
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.desc?.toLowerCase().includes(search.toLowerCase())
      )
    )
      return false;

    return true;
  });

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
          {/* SAVE ICON */}
          <div
            onClick={(e) => toggleSave(item, e)}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 20,
              cursor: "pointer",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="22"
              height="22"
              style={{
                pointerEvents: "none",
                fill: isSaved ? "#ffffff" : "none",
                stroke: "#ffffff",
                strokeWidth: "2",
              }}
            >
              <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
            </svg>
          </div>

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

const handleYes = () => {
  setPendingAction("delete");
};

const handleNo = () => {
  setPendingAction("cancel");
};

const handleClosePopup = () => {
  // DELETE
  if (pendingAction === "delete" && selectedCard && deleteBlog) {
    deleteBlog(selectedCard.id);
  }

  // LOGIN
  if (pendingAction === "login") {
    navigate("/login");
  }

 

  // RESET
  setPendingAction(null);
  setShowDeletePopup(false);
  setShowLoginPopup(false);
  setSelectedCard(null);
};

  const handleGoLogin = () => {
    setShowLoginPopup(false);
    navigate("/login");
  };

  const handleBackLoginPopup = () => {
    setShowLoginPopup(false);
  };

  // 🔥 FULL PAGE VIEW
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
                marginTop: "20px",
              }}
            >
              <div style={{ display: "flex", gap: "8px" }}>
<button
  className="edit-btn"
  disabled={!canDelete}
  onClick={() => {
    if (!canDelete) return;
    navigate(`/edit-blog/${selectedCard.id}`, {
      state: { blog: selectedCard },
    });
  }}
>
  Edit
</button>

<button
  className="delete-btn"
  disabled={!canDelete}
  onClick={() => {
    if (!canDelete) return;
    setShowDeletePopup(true);
  }}
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
      </>
    );
  }
return (
  <>
    {/* LOGIN POPUP */}
    {showLoginPopup && (
      <div className="popup-overlay">
        <div className="popup-box">
         <button className="popup-close" onClick={handleClosePopup}>
            ×
          </button>

          <h3>Please log in to continue this action</h3>

          <div className="popup-actions">
            <button
  onClick={() => setPendingAction("login")}
  className="yes"
>
  Go
</button>

<button
  onClick={() => setPendingAction("backLogin")}
  className="no"
>
  Back
</button>
          </div>
        </div>
      </div>
    )}

    <div className="card-container">
      {filteredItems.length > 0 ? (
        renderCards(filteredItems)
      ) : (
        <p>No blogs found.</p>
      )}
    </div>

    {copyMessage && <div className="copy-toast">{copyMessage}</div>}

    

  </>
);
}

export default CardList;