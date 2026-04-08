import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import CardList from "../components/CardList.jsx";
import axiosInstance from "../api/axiosInstance";

function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [savedBlogIds, setSavedBlogIds] = useState([]);
  const [search, setSearch] = useState("");
  const [showSaved, setShowSaved] = useState(false);

  // 🔐 Current user
  const currentUser =
    localStorage.getItem("username") ||
    localStorage.getItem("guestId");

  // 📥 Fetch blogs
  const fetchBlogs = async () => {
    try {
      const res = await axiosInstance.get("/blogs");
      setBlogs(res.data || []);
    } catch (err) {
      console.error("Fetch blogs error:", err.response?.data || err.message);
    }
  };

  // 📥 Fetch saved blogs
  const fetchSavedBlogs = async () => {
    if (!currentUser) return;

    try {
      const res = await axiosInstance.get(`/savedblogs/${currentUser}`);
      const ids = (res.data || []).map((id) => Number(id));
      setSavedBlogIds(ids);
    } catch (err) {
      console.error("Fetch saved blogs error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchSavedBlogs();
  }, []);

  // ❤️ Save
  const saveBlog = async (blogId) => {
    if (!currentUser) {
      alert("Login to save blogs");
      return;
    }

    try {
      await axiosInstance.post("/savedblogs/save", {
        userId: currentUser,
        blogId,
      });

      setSavedBlogIds((prev) => [...new Set([...prev, Number(blogId)])]);
    } catch (err) {
      console.error("Save blog error:", err.response?.data || err.message);
    }
  };

  // 💔 Unsave
  const unsaveBlog = async (blogId) => {
    if (!currentUser) return;

    try {
      await axiosInstance.post("/savedblogs/unsave", {
        userId: currentUser,
        blogId,
      });

      setSavedBlogIds((prev) =>
        prev.filter((id) => id !== Number(blogId))
      );
    } catch (err) {
      console.error("Unsave blog error:", err.response?.data || err.message);
    }
  };

  // 🗑️ DELETE BLOG
  const deleteBlog = async (blogId) => {
    try {
      await axiosInstance.delete(`/blogs/${blogId}`);

      // UI update
      setBlogs((prev) => prev.filter((b) => b.id !== blogId));

      console.log("Blog deleted:", blogId);
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
    }
  };

  // 🧠 Filter blogs
  const myBlogs = blogs.filter(
    (b) =>
      b.isUserCreated &&
      b.author?.toLowerCase() === currentUser?.toLowerCase()
  );

  const myFeed = blogs.filter(
    (b) =>
      !b.isUserCreated ||
      (b.isUserCreated &&
        b.author?.toLowerCase() !== currentUser?.toLowerCase())
  );

  const mySavedBlogs = blogs.filter((b) =>
    savedBlogIds.includes(Number(b.id))
  );

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
          <section style={{ marginTop: "30px" }}>
            <h2 className="section-title">My Blogs</h2>
            <CardList
              items={myBlogs}
              search={search}
              savedBlogIds={savedBlogIds}
              saveBlog={saveBlog}
              unsaveBlog={unsaveBlog}
              deleteBlog={deleteBlog}
              currentUser={currentUser} // 🔑 pass current user
            />
          </section>

          {/* 🌍 My Feed */}
          <section style={{ marginTop: "50px" }}>
            <h2 className="section-title">My Feed</h2>
            <CardList
              items={myFeed}
              search={search}
              savedBlogIds={savedBlogIds}
              saveBlog={saveBlog}
              unsaveBlog={unsaveBlog}
              deleteBlog={deleteBlog}
              currentUser={currentUser} // 🔑 pass current user
            />
          </section>
        </>
      ) : (
        /* ❤️ Saved Blogs */
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
            currentUser={currentUser} // 🔑 pass current user
          />
        </section>
      )}
    </div>
  );
}

export default Blog;