import React, { useState } from "react";
import Navbar from "../components/Navbar";
import CardList from "../components/CardList";

const initialBlogs = [
  { id: 1, title: "AI in 2026", desc: "Future of artificial intelligence.", image: "https://picsum.photos/300/200?1", category: "blog" },
  { id: 2, title: "React UI Design", desc: "Build modern UI using React.", image: "https://picsum.photos/300/200?2", category: "blog" },
  { id: 3, title: "JavaScript Tips", desc: "Improve your JS skills.", image: "https://picsum.photos/300/200?3", category: "blog" },
  { id: 4, title: "Web Development", desc: "Frontend and backend roadmap.", image: "https://picsum.photos/300/200?4", category: "blog" },
  { id: 5, title: "CSS Mastery", desc: "Advanced CSS techniques.", image: "https://picsum.photos/300/200?5", category: "blog" },
  { id: 6, title: "MongoDB Guide", desc: "NoSQL database basics.", image: "https://picsum.photos/300/200?6", category: "feed" },
  { id: 7, title: "React Libraries", desc: "Best libraries for React.", image: "https://picsum.photos/300/200?7", category: "feed" },
  { id: 8, title: "UI Inspiration", desc: "Modern UI ideas.", image: "https://picsum.photos/300/200?8", category: "feed" },
  { id: 9, title: "Interview Questions", desc: "Frontend interview prep.", image: "https://picsum.photos/300/200?9", category: "feed" },
  { id: 10, title: "Developer Tools", desc: "Boost productivity.", image: "https://picsum.photos/300/200?10", category: "feed" },
];

function Blog() {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [search, setSearch] = useState("");

  const addBlog = (newBlog) => {
    setBlogs([newBlog, ...blogs]);
  };

  // Split blogs and feeds
  const blogItems = blogs.filter(b => b.category === "blog");
  const feedItems = blogs.filter(b => b.category === "feed");

  return (
    <div className="page-wrapper">
      <Navbar setSearch={setSearch} addBlog={addBlog} />

      {/* Blogs Section */}
      <CardList items={blogItems} search={search} sectionTitle="My Blogs" />

      {/* Feed Section */}
      <CardList items={feedItems} search={search} sectionTitle="My Feed" />
    </div>
  );
}

export default Blog;
