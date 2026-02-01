import React, { useState } from "react";
import Navbar from "../components/Navbar";
import CardList from "../components/CardList";

const initialBlogs = [
  {
    id: 1,
    title: "AI in 2026",
    desc: `Artificial Intelligence is growing rapidly in 2026.It is being used in healthcare, education, and finance.AI helps doctors diagnose diseases faster.In education, AI creates personalized learning paths.Many companies use AI for automation.Chatbots improve customer support.AI also plays a role in self-driving cars.Ethical concerns around AI are increasing.Data privacy is a major challenge.Overall, AI is shaping the future of technology.`,
    image: "https://picsum.photos/300/200?1",
    category: "blog",
  },

  {
    id: 2,
    title: "React UI Design",
    desc: `React helps developers build reusable UI components.
Component-based architecture improves maintainability.`,
    image: "https://picsum.photos/300/200?2",
    category: "blog",
  },

  {
    id: 3,
    title: "JavaScript Tips",
    desc: `JavaScript is the backbone of web development.`,
    image: "https://picsum.photos/300/200?3",
    category: "blog",
  },

  {
    id: 4,
    title: "Web Development",
    desc: `Web development includes frontend and backend.
Frontend focuses on UI and UX.
Backend handles logic and databases.
APIs connect frontend and backend.
Security is very important.
Performance optimization improves speed.
Frameworks reduce development time.
Testing ensures quality.
Deployment makes apps live.
Continuous learning is required.`,
    image: "https://picsum.photos/300/200?4",
    category: "blog",
  },

  {
    id: 5,
    title: "CSS Mastery",
    desc: `CSS controls the look of websites.
Flexbox helps with layouts.
Grid is powerful for complex designs.
Responsive design supports all devices.
Animations improve visuals.
Clean CSS improves performance.
Variables simplify theming.
Consistency matters in design.
Dark mode is popular.
CSS mastery takes practice.`,
    image: "https://picsum.photos/300/200?5",
    category: "blog",
  },

  {
    id: 6,
    title: "MongoDB Guide",
    desc: `MongoDB is a NoSQL database.
It stores data in JSON-like format.
Schemas are flexible.
It is scalable and fast.
Used in modern applications.
Works well with Node.js.
Indexes improve performance.
Aggregation handles complex queries.
Replication ensures availability.
MongoDB is beginner friendly.`,
    image: "https://picsum.photos/300/200?6",
    category: "feed",
  },

  {
    id: 7,
    title: "React Libraries",
    desc: `React has a rich ecosystem.
Libraries improve productivity.
React Router handles navigation.
Redux manages global state.
Axios handles API calls.
Material UI speeds UI design.
Framer Motion adds animations.
Testing libraries improve quality.
Choosing right library matters.
Keep dependencies minimal.`,
    image: "https://picsum.photos/300/200?7",
    category: "feed",
  },

  {
    id: 8,
    title: "UI Inspiration",
    desc: `Good UI improves user experience.
Minimal design is trending.
Color theory matters.
Typography improves readability.
Spacing makes UI clean.
Consistency builds trust.
Dark mode is popular.
Micro-interactions enhance feel.
User feedback is valuable.
UI evolves constantly.`,
    image: "https://picsum.photos/300/200?8",
    category: "feed",
  },

  {
    id: 9,
    title: "Interview Questions",
    desc: `Interviews test fundamentals.
DSA questions are common.
Projects matter a lot.
Communication skills are important.
Confidence helps performance.
Practice mock interviews.
Understand core concepts.
Explain your thinking.
Learn from rejections.
Preparation is key.`,
    image: "https://picsum.photos/300/200?9",
    category: "feed",
  },

  {
    id: 10,
    title: "Developer Tools",
    desc: `Developer tools improve efficiency.VS Code is very popular.Extensions boost productivity.\Git helps version control.Chrome DevTools aid debugging.Linters improve code quality.Package managers save time.Automation reduces errors.Shortcuts increase speed.Tools evolve regularly.`,
    image: "https://picsum.photos/300/200?10",
    category: "feed",
  },
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
