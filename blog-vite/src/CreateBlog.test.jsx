import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

// ✅ Mock react-router-dom BEFORE importing the component
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import CreateBlog from "./Pages/CreateBlog"; // import after mocking

describe("CreateBlog Page", () => {
  let mockAddBlog;

  beforeEach(() => {
    mockAddBlog = vi.fn();
    mockNavigate.mockClear(); // reset call count before each test
  });

  test("renders heading, inputs, and attach section", () => {
    render(<CreateBlog addBlog={mockAddBlog} />);

    expect(screen.getByText(/Create a New Blog/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Blog Title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Description/i)).toBeInTheDocument();
    expect(screen.getByText(/Attach file/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create/i })).toBeInTheDocument();
  });

  test("submits form and calls addBlog and navigate", () => {
    render(<CreateBlog addBlog={mockAddBlog} />);

    const titleInput = screen.getByPlaceholderText(/Blog Title/i);
    const descInput = screen.getByPlaceholderText(/Description/i);
    const form = screen.getByText(/Create a New Blog/i).closest("form");

    fireEvent.change(titleInput, { target: { value: "My Blog" } });
    fireEvent.change(descInput, { target: { value: "This is a test blog" } });
    fireEvent.submit(form);

    expect(mockAddBlog).toHaveBeenCalledTimes(1);
    expect(mockAddBlog).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "My Blog",
        desc: "This is a test blog",
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith("/landing");
  });

  test("file attach and remove works", () => {
    render(<CreateBlog addBlog={mockAddBlog} />);

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(["dummy"], "test.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(screen.getByText(/test.png/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Remove File/i));
    expect(screen.queryByText(/test.png/i)).not.toBeInTheDocument();
  });
});
