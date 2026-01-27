import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar({ setSearch }) {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <div
        className="logo"
        onClick={() => navigate("/blog")}
        style={{ cursor: "pointer" }}
      >
        MyBlogs
      </div>

      <input
        type="text"
        placeholder="Search blogs..."
        className="search"
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="nav-right">
        <button className="signout" onClick={() => navigate("/create-blog")}>
          Create Blog
        </button>
        <button className="signout" onClick={() => navigate("/")}>
          Sign Out
        </button>
        <div className="hamburger">☰</div>
      </div>
    </div>
  );
}

export default Navbar;
