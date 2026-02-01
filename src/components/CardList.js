import React, { useState } from "react";

function CardList({ items = [], search = "" }) {
  const [cards, setCards] = useState(items);
  const [selectedCard, setSelectedCard] = useState(null);

  const query = search.toLowerCase();

  const copyData = (item, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `Title: ${item.title}\nDescription: ${item.desc}`
    );
    alert("Copied!");
  };

  const deleteCard = (id) => {
    setCards((prev) => prev.filter((item) => item.id !== id));
    setSelectedCard(null); // go back after delete
  };

  const filterByCategory = (category) =>
    cards.filter(
      (item) =>
        item.category === category &&
        (item.title.toLowerCase().includes(query) ||
          item.desc.toLowerCase().includes(query))
    );

  const blogs = filterByCategory("blog");
  const feeds = filterByCategory("feed");

  const renderCards = (data) =>
    data.map((item) => (
      <div
        key={item.id}
        className="card"
        onClick={() => setSelectedCard(item)}
      >
        <img src={item.image} alt={item.title} />

        <div className="card-content">
          <div className="text-copy-wrapper">
            <div className="text-wrapper">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>

            <span
              className="copy-icon"
              onClick={(e) => copyData(item, e)}
              style={{ color: "white" }}
            >
              ⧉
            </span>
          </div>
        </div>
      </div>
    ));

  return (
    <>
      {/* LIST VIEW */}
      {!selectedCard && (
        <>
          {blogs.length > 0 && (
            <>
              <h2 className="section-title">My Blogs</h2>
              <div className="card-container">{renderCards(blogs)}</div>
            </>
          )}

          {feeds.length > 0 && (
            <>
              <h2 className="section-title">My Feed</h2>
              <div className="card-container">{renderCards(feeds)}</div>
            </>
          )}
        </>
      )}

      {/* FULL PAGE VIEW */}
      {selectedCard && (
        <div className="fullpage-card">
          {/* ✅ GO BACK – CARD च्या बाहेर */}
          <button
            className="go-back-btn"
            onClick={() => setSelectedCard(null)}
          >
           ⮌
          </button>

          <div className="fullpage-content">
            <h2>{selectedCard.title}</h2>
            <img src={selectedCard.image} alt={selectedCard.title} />
            <p>{selectedCard.desc}</p>

            <div
              className="actions"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "20px",
              }}
            >
              {/* SMALL DELETE BUTTON */}
              <button
                onClick={() => deleteCard(selectedCard.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: "#1f2933",
                  border: "1px solid #374151",
                  color: "#f87171",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>

              {/* WHITE COPY ICON */}
              <span
                onClick={(e) => copyData(selectedCard, e)}
                style={{
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                ⧉
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CardList;
