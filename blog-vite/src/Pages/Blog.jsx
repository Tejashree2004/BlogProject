import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import CardList from "../components/CardList.jsx";
import axiosInstance from "../api/axiosInstance";
import "../index.css";

function Blog() {
  const [myBlogs, setMyBlogs] = useState([]);
  const [feedBlogs, setFeedBlogs] = useState([]);
  const [savedBlogIds, setSavedBlogIds] = useState([]);

  const [savedBlogs, setSavedBlogs] = useState([]);
  const [savedTotal, setSavedTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [showSaved, setShowSaved] = useState(false);

  const [myBlogsPage, setMyBlogsPage] = useState(1);
  const [feedPage, setFeedPage] = useState(1);
  const [savedPage, setSavedPage] = useState(1);

  const [myBlogsTotal, setMyBlogsTotal] = useState(0);
  const [feedTotal, setFeedTotal] = useState(0);

  const pageSize = 10;

  const currentUser =
    localStorage.getItem("username") ||
    localStorage.getItem("guestId");

  const isGuest = localStorage.getItem("userType") === "guest";

  const fetchMyBlogs = async () => {
    if (isGuest) return;

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
      const res = await axiosInstance.get(
        `/blogs/feed?pageNumber=${feedPage}&pageSize=${pageSize}&search=${search}`
      );

      setFeedBlogs(res.data?.data || []);
      setFeedTotal(res.data?.totalCount || 0);
    } catch (err) {
      console.error("Feed error:", err.message);
    }
  };

  const fetchSavedBlogs = async () => {
    if (!currentUser || isGuest) return;

    try {
      const res = await axiosInstance.get(
        `/savedblogs?userId=${currentUser}&pageNumber=${savedPage}&pageSize=${pageSize}`
      );

      setSavedBlogs(res.data?.data || []);
      setSavedTotal(res.data?.totalCount || 0);

      const ids = (res.data?.data || []).map((b) => Number(b.id));
      setSavedBlogIds(ids);
    } catch (err) {
      console.error("Saved blogs error:", err.message);
    }
  };

  useEffect(() => {
    fetchMyBlogs();
  }, [myBlogsPage, isGuest]);

  // ✅ FIRST: reset page when search changes
useEffect(() => {
  setFeedPage(1);
  setFeedBlogs([]); // optional but recommended
}, [search]);

// ✅ SECOND: fetch data
useEffect(() => {
  fetchFeed();
}, [feedPage, isGuest, search]);

  useEffect(() => {
    if (showSaved) {
      fetchSavedBlogs();
    }
  }, [savedPage, showSaved]);

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

      fetchSavedBlogs();
    } catch (err) {
      console.error("Unsave error:", err.message);
    }
  };

  const deleteBlog = async (blogId) => {
    if (isGuest) return;

    try {
      await axiosInstance.delete(`/blogs/${blogId}`);

      setMyBlogs((prev) => prev.filter((b) => b.id !== blogId));
      setFeedBlogs((prev) => prev.filter((b) => b.id !== blogId));
      setSavedBlogs((prev) => prev.filter((b) => b.id !== blogId));
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  };

  const myBlogsTotalPages = Math.ceil(myBlogsTotal / pageSize);
  const feedTotalPages = Math.ceil(feedTotal / pageSize);
  const savedTotalPages = Math.ceil(savedTotal / pageSize);

  return (
    <div className="page-wrapper">
      <Navbar
        search={search}
        setSearch={setSearch}
        setShowSaved={setShowSaved}
      />

      {!showSaved ? (
        <>
          {!isGuest && (
            <section style={{ marginTop: "30px", marginBottom: "40px" }}>
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

              <div className="pagination-container" style={{ textAlign: "right" }}>
                <button
                  className="pagination-btn"
                  disabled={myBlogsPage === 1}
                  onClick={() => setMyBlogsPage(myBlogsPage - 1)}
                >
                  Previous
                </button>

                <span className="pagination-info" style={{ margin: "0 10px" }}>
                  Page {myBlogsPage} / {myBlogsTotalPages || 1}
                </span>

                <button
                  className="pagination-btn"
                  disabled={myBlogsPage === myBlogsTotalPages}
                  onClick={() => setMyBlogsPage(myBlogsPage + 1)}
                >
                  Next
                </button>
              </div>
            </section>
          )}

         <section style={{ marginTop: "50px", marginBottom: "40px" }}>
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

            <div className="pagination-container" style={{ textAlign: "right" }}>
              <button
                className="pagination-btn"
                disabled={feedPage === 1}
                onClick={() => setFeedPage(feedPage - 1)}
              >
                Previous
              </button>

              <span className="pagination-info" style={{ margin: "0 10px" }}>
                Page {feedPage} / {feedTotalPages || 1}
              </span>

              <button
                className="pagination-btn"
                disabled={feedPage === feedTotalPages}
                onClick={() => setFeedPage(feedPage + 1)}
              >
                Next
              </button>
            </div>
          </section>
        </>
      ) : (
    <section style={{ marginTop: "30px", marginBottom: "40px" }}>
          <h2 className="section-title">My Saved Blogs</h2>

          <CardList
            items={savedBlogs}
            search={search}
            showSaved={true}
            savedBlogIds={savedBlogIds}
            saveBlog={saveBlog}
            unsaveBlog={unsaveBlog}
            deleteBlog={deleteBlog}
            currentUser={currentUser}
          />

          <div className="pagination-container" style={{ textAlign: "right" }}>
            <button
              className="pagination-btn"
              disabled={savedPage === 1}
              onClick={() => setSavedPage(savedPage - 1)}
            >
              Previous
            </button>

            <span className="pagination-info" style={{ margin: "0 10px" }}>
              Page {savedPage} / {savedTotalPages || 1}
            </span>

            <button
              className="pagination-btn"
              disabled={savedPage === savedTotalPages}
              onClick={() => setSavedPage(savedPage + 1)}
            >
              Next
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default Blog;