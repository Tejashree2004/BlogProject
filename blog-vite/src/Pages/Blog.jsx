import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import CardList from "../components/CardList.jsx";
import axiosInstance from "../api/axiosInstance";
import "../index.css";

function Blog() {
  const [myBlogs, setMyBlogs] = useState([]);
  const [feedBlogs, setFeedBlogs] = useState([]);
  const [savedBlogIds, setSavedBlogIds] = useState([]);

  const [search, setSearch] = useState("");
  const [showSaved, setShowSaved] = useState(false);

  // 🔥 Pagination states
  const [myBlogsPage, setMyBlogsPage] = useState(1);
  const [feedPage, setFeedPage] = useState(1);

  const [myBlogsTotal, setMyBlogsTotal] = useState(0);
  const [feedTotal, setFeedTotal] = useState(0);

  const pageSize = 10;

  const currentUser =
    localStorage.getItem("username") ||
    localStorage.getItem("guestId");

  const isGuest = localStorage.getItem("userType") === "guest";

  // ================= FETCH ================= //

  const fetchMyBlogs = async () => {
    if (isGuest) return; // 🔥 guest skip

    try {
      const res = await axiosInstance.get(
        `/blogs/myblogs?pageNumber=${myBlogsPage}&pageSize=${pageSize}`
      );

      setMyBlogs(res.data?.data || []);
      setMyBlogsTotal(res.data?.totalCount || 0);
    } catch (err) {
      console.error("My blogs error:", err.message);
    }
  };

  const fetchFeed = async () => {
    try {
      // ✅ Guest + User dono ke liye chalega
      const res = await axiosInstance.get(
        `/blogs/feed?pageNumber=${feedPage}&pageSize=${pageSize}`
      );

      setFeedBlogs(res.data?.data || []);
      setFeedTotal(res.data?.totalCount || 0);
    } catch (err) {
      console.error("Feed error:", err.message);
    }
  };

  const fetchSavedBlogs = async () => {
    if (!currentUser || isGuest) return; // 🔥 guest skip

    try {
      const res = await axiosInstance.get(`/savedblogs/${currentUser}`);
      const ids = (res.data || []).map((id) => Number(id));
      setSavedBlogIds(ids);
    } catch (err) {
      console.error("Saved blogs error:", err.message);
    }
  };

  // ================= USE EFFECT ================= //

  useEffect(() => {
    fetchMyBlogs();
  }, [myBlogsPage, isGuest]);

  useEffect(() => {
    fetchFeed();
  }, [feedPage, isGuest]);

  useEffect(() => {
    fetchSavedBlogs();
  }, [isGuest]);

  // ================= SAVE / UNSAVE ================= //

  const saveBlog = async (blogId) => {
    if (!currentUser || isGuest) {
      alert("Login required to save blogs");
      return;
    }

    try {
      await axiosInstance.post("/savedblogs/save", {
        userId: currentUser,
        blogId,
      });

      setSavedBlogIds((prev) => [...new Set([...prev, Number(blogId)])]);
    } catch (err) {
      console.error("Save error:", err.message);
    }
  };

  const unsaveBlog = async (blogId) => {
    if (isGuest) return;

    try {
      await axiosInstance.post("/savedblogs/unsave", {
        userId: currentUser,
        blogId,
      });

      setSavedBlogIds((prev) =>
        prev.filter((id) => id !== Number(blogId))
      );
    } catch (err) {
      console.error("Unsave error:", err.message);
    }
  };

  // ================= DELETE ================= //

  const deleteBlog = async (blogId) => {
    if (isGuest) return;

    try {
      await axiosInstance.delete(`/blogs/${blogId}`);

      setMyBlogs((prev) => prev.filter((b) => b.id !== blogId));
      setFeedBlogs((prev) => prev.filter((b) => b.id !== blogId));
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  };

  // ================= FILTER ================= //

  const mySavedBlogs = [...myBlogs, ...feedBlogs].filter((b) =>
    savedBlogIds.includes(Number(b.id))
  );

  // ================= PAGINATION ================= //

  const myBlogsTotalPages = Math.ceil(myBlogsTotal / pageSize);
  const feedTotalPages = Math.ceil(feedTotal / pageSize);

  return (
    <div className="page-wrapper">
      <Navbar
        search={search}
        setSearch={setSearch}
        setShowSaved={setShowSaved}
      />

      {!showSaved ? (
        <>
          {/* 🧑 My Blogs */}
          {!isGuest && (
            <section style={{ marginTop: "30px" }}>
              <h2 className="section-title">My Blogs</h2>

              <CardList
                items={myBlogs}
                search={search}
                savedBlogIds={savedBlogIds}
                saveBlog={saveBlog}
                unsaveBlog={unsaveBlog}
                deleteBlog={deleteBlog}
                currentUser={currentUser}
              />

              <div className="pagination-container">
                <button
                  className="pagination-btn"
                  disabled={myBlogsPage === 1}
                  onClick={() => setMyBlogsPage(myBlogsPage - 1)}
                >
                  ◀ Previous
                </button>

                <span className="pagination-info">
                  Page {myBlogsPage} / {myBlogsTotalPages || 1}
                </span>

                <button
                  className="pagination-btn"
                  disabled={myBlogsPage === myBlogsTotalPages}
                  onClick={() => setMyBlogsPage(myBlogsPage + 1)}
                >
                  Next ▶
                </button>
              </div>
            </section>
          )}

          {/* 🌍 Feed */}
          <section style={{ marginTop: "50px" }}>
            <h2 className="section-title">My Feed</h2>

            

            <CardList
              items={feedBlogs}
              search={search}
              savedBlogIds={savedBlogIds}
              saveBlog={saveBlog}
              unsaveBlog={unsaveBlog}
              deleteBlog={deleteBlog}
              currentUser={currentUser}
            />

            {/* ✅ FIX: Pagination guest ke liye bhi visible */}
            <div className="pagination-container">
              <button
                className="pagination-btn"
                disabled={feedPage === 1}
                onClick={() => setFeedPage(feedPage - 1)}
              >
                ◀ Previous
              </button>

              <span className="pagination-info">
                Page {feedPage} / {feedTotalPages || 1}
              </span>

              <button
                className="pagination-btn"
                disabled={feedPage === feedTotalPages}
                onClick={() => setFeedPage(feedPage + 1)}
              >
                Next ▶
              </button>
            </div>
          </section>
        </>
      ) : (
        <section style={{ marginTop: "30px" }}>
          <h2 className="section-title">My Saved Blogs</h2>

          <CardList
            items={mySavedBlogs}
            search={search}
            showSaved={true}
            savedBlogIds={savedBlogIds}
            saveBlog={saveBlog}
            unsaveBlog={unsaveBlog}
            deleteBlog={deleteBlog}
            currentUser={currentUser}
          />
        </section>
      )}
    </div>
  );
}

export default Blog;