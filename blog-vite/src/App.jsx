import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "./api/axiosInstance"; // JWT safe instance
import PrivateRoute from "./components/PrivateRoute";

// Pages
import Blog from "./Pages/Blog";
import CreateBlog from "./Pages/CreateBlog";
import EditBlogPage from "./components/EditBlogPage";
import Landing from "./Pages/Landing";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import VerifyEmail from "./Pages/VerifyEmail";

// API
import { deleteBlogApi } from "./api/api";

function App() {
  const [blogs, setBlogs] = useState([]);
  const [savedBlogIds, setSavedBlogIds] = useState([]);

  const token = localStorage.getItem("jwtToken");

  // ===================== FETCH BLOGS ===================== //
  const fetchBlogs = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/blogs");
      setBlogs(res.data);
    } catch (err) {
      console.error("Error fetching blogs:", err);
    }
  }, []);

  // ===================== FETCH SAVED BLOGS ===================== //
  const fetchSavedBlogs = useCallback(async () => {
    if (!token) return;

    try {
      const res = await axiosInstance.get("/blogs/saved");
      // Backend should return list of saved blogs for current user
      const ids = res.data.map((b) => b.id);
      setSavedBlogIds(ids);
    } catch (err) {
      console.error("Error fetching saved blogs:", err);
    }
  }, [token]);

  // ===================== INITIAL LOAD ===================== //
  useEffect(() => {
    fetchBlogs();
    fetchSavedBlogs();
  }, [fetchBlogs, fetchSavedBlogs]);

  // ===================== DELETE BLOG ===================== //
  const deleteBlog = async (id) => {
    try {
      await deleteBlogApi(id);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
      setSavedBlogIds((prev) => prev.filter((bid) => bid !== id));
    } catch (err) {
      console.error("Error deleting blog:", err);
    }
  };

  // ===================== SAVE BLOG ===================== //
  const saveBlog = async (blogId) => {
    if (!token) return alert("Login required!");

    try {
      await axiosInstance.post(`/blogs/save/${blogId}`);
      setSavedBlogIds((prev) =>
        prev.includes(blogId) ? prev : [...prev, blogId]
      );
    } catch (err) {
      console.error("Error saving blog:", err);
    }
  };

  // ===================== UNSAVE BLOG ===================== //
  const unsaveBlog = async (blogId) => {
    if (!token) return;

    try {
      await axiosInstance.delete(`/blogs/save/${blogId}`);
      setSavedBlogIds((prev) => prev.filter((id) => id !== blogId));
    } catch (err) {
      console.error("Error unsaving blog:", err);
    }
  };

  return (
    <Routes>
      {/* Default Route */}
      <Route
        path="/"
        element={
          token ? <Navigate to="/landing" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Public Blog Views */}
      <Route
        path="/landing"
        element={
          <Landing
            blogs={blogs}
            deleteBlog={deleteBlog}
            savedBlogIds={savedBlogIds}
            saveBlog={saveBlog}
            unsaveBlog={unsaveBlog}
          />
        }
      />
      <Route
        path="/blog"
        element={
          <Blog
            blogs={blogs}
            deleteBlog={deleteBlog}
            savedBlogIds={savedBlogIds}
            saveBlog={saveBlog}
            unsaveBlog={unsaveBlog}
          />
        }
      />

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route
          path="/create-blog"
          element={<CreateBlog fetchBlogs={fetchBlogs} />}
        />
        <Route
          path="/edit-blog/:id"
          element={<EditBlogPage fetchBlogs={fetchBlogs} />}
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;