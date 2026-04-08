import { render, screen } from "@testing-library/react";
import Blog from "./Pages/Blog"; // make sure path is correct
import { MemoryRouter } from "react-router-dom";

describe("Blog Page", () => {
  const blogs = [
    { id: 1, title: "Blog 1", desc: "Desc 1", category: "blog", isUserCreated: true },
    { id: 2, title: "Blog 2", desc: "Desc 2", category: "blog", isUserCreated: true },
  ];

  test("renders Navbar and CardList with correct props", () => {
    render(
      <MemoryRouter>
        <Blog blogs={blogs} deleteBlog={() => {}} />
      </MemoryRouter>
    );

    // check blog titles are displayed
    expect(screen.getByText(/Blog 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Blog 2/i)).toBeInTheDocument();

    // check Navbar elements
    expect(screen.getByText(/MyBlogs/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search blogs/i)).toBeInTheDocument();
  });
});
