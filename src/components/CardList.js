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
    setSelectedCard(null);
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
            >
              ⧉
            </span>
          </div>
        </div>
      </div>
    ));

  return (
    <>
      {/* MY BLOGS */}
      {blogs.length > 0 && (
        <>
          <h2 className="section-title">My Blogs</h2>
          <div className="card-container">{renderCards(blogs)}</div>
        </>
      )}

      {/* MY FEED */}
      {feeds.length > 0 && (
        <>
          <h2 className="section-title">My Feed</h2>
          <div className="card-container">{renderCards(feeds)}</div>
        </>
      )}

      {/* FULL-PAGE CARD VIEW */}
      {selectedCard && (
        <div className="fullpage-card">
          <button
            className="close-btn"
            onClick={() => setSelectedCard(null)}
          >
            ×
          </button>

          <div className="fullpage-content">
            <h2>{selectedCard.title}</h2>
            <img src={selectedCard.image} alt={selectedCard.title} />
            <p>{selectedCard.desc}</p>

            <div className="actions">
              {/* Delete button left */}
              <button
                className="delete-btn"
                onClick={() => deleteCard(selectedCard.id)}
              >
                Delete
              </button>

              {/* Copy icon right */}
              <span
                className="copy-icon"
                onClick={(e) => copyData(selectedCard, e)}
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
