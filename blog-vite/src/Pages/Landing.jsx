import React from "react";
import { useNavigate } from "react-router-dom";
import Blog from "./Blog.jsx";

function Landing({ blogs, deleteBlog, savedBlogIds, saveBlog, unsaveBlog }) {
  const navigate = useNavigate();

  // 🔐 Current user
  const currentUser =
    localStorage.getItem("username") ||
    localStorage.getItem("guestId");

  const handleCreateBlog = () => {
    navigate("/create-blog");
  };

  return (
    <div className="page-wrapper">
    

      <Blog
        blogs={blogs}
        deleteBlog={deleteBlog}
        savedBlogIds={savedBlogIds}
        saveBlog={saveBlog}
        unsaveBlog={unsaveBlog}
        currentUser={currentUser} // 🔑 Pass currentUser
      />
    </div>
  );
}

export default Landing;