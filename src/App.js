import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Blog from "./Pages/Blog";
import CreateBlog from "./Pages/CreateBlog";

function App() {
  const [blogs, setBlogs] = useState([]);

  const addBlog = (newBlog) => {
    setBlogs((prev) => [newBlog, ...prev]);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/blog"
          element={<Blog blogs={blogs} />}
        />

        <Route
          path="/create-blog"
          element={<CreateBlog addBlog={addBlog} />}
        />

        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
