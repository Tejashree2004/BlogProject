// src/CardList.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CardList from "./components/CardList";
import { vi } from "vitest";

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe("CardList Component", () => {
  const mockDeleteBlog = vi.fn();

  const blogs = [
    { id: 1, title: "Blog 1", desc: "Desc 1", image: "img1.jpg", category: "blog", isUserCreated: true },
    { id: 2, title: "Blog 2", desc: "Desc 2", image: "img2.jpg", category: "blog", isUserCreated: false },
    { id: 3, title: "Feed 1", desc: "Feed Desc", image: "img3.jpg", category: "feed", isUserCreated: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("full-page view opens on card click and closes on back button", () => {
    render(<CardList items={blogs} deleteBlog={mockDeleteBlog} />);
    const card = screen.getByText(/Blog 1/i).closest(".card");
    fireEvent.click(card);

    // Check full-page content is shown
    expect(screen.getByText(/Desc 1/i)).toBeInTheDocument();

    const backBtn = screen.getByText(/⮌/i);
    fireEvent.click(backBtn);

    // Instead of checking description, check full-page is gone
    expect(screen.queryByText(/⮌/i)).toBeNull();
  });

  test("renders saved blogs correctly", () => {
    render(<CardList items={blogs} showSaved={true} initialSavedIds={[1, 3]} />);
    
    expect(screen.getByText(/Blog 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Feed 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/Blog 2/i)).toBeNull();
  });
});
