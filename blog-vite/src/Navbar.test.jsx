import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "./components/Navbar"; // ✅ correct path
import { MemoryRouter, useNavigate } from "react-router-dom";
import { vi } from "vitest";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Navbar Component", () => {
  let setSearchMock, setShowSavedMock;

  beforeEach(() => {
    setSearchMock = vi.fn();
    setShowSavedMock = vi.fn();
    mockNavigate.mockReset();
  });

  test("renders logo, search input, and buttons", () => {
    render(
      <MemoryRouter>
        <Navbar
          search=""
          setSearch={setSearchMock}
          setShowSaved={setShowSavedMock}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/MyBlogs/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search blogs/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Blog/i)).toBeInTheDocument();
    expect(screen.getByText(/☰/i)).toBeInTheDocument();
  });

  test("typing in search calls setSearch", () => {
    render(
      <MemoryRouter>
        <Navbar
          search=""
          setSearch={setSearchMock}
          setShowSaved={setShowSavedMock}
        />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Search blogs/i);
    fireEvent.change(input, { target: { value: "test" } });
    expect(setSearchMock).toHaveBeenCalledWith("test");
  });

  test("clicking logo navigates to /blog and resets search/showSaved", () => {
    render(
      <MemoryRouter>
        <Navbar
          search="something"
          setSearch={setSearchMock}
          setShowSaved={setShowSavedMock}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/MyBlogs/i));
    expect(setShowSavedMock).toHaveBeenCalledWith(false);
    expect(setSearchMock).toHaveBeenCalledWith("");
    expect(mockNavigate).toHaveBeenCalledWith("/blog");
  });

  test("clicking Create Blog navigates to /create-blog", () => {
    render(
      <MemoryRouter>
        <Navbar
          search=""
          setSearch={setSearchMock}
          setShowSaved={setShowSavedMock}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/Create Blog/i));
    expect(setShowSavedMock).toHaveBeenCalledWith(false);
    expect(setSearchMock).toHaveBeenCalledWith("");
    expect(mockNavigate).toHaveBeenCalledWith("/create-blog");
  });

  test("more menu opens and closes correctly", () => {
    render(
      <MemoryRouter>
        <Navbar
          search=""
          setSearch={setSearchMock}
          setShowSaved={setShowSavedMock}
        />
      </MemoryRouter>
    );

    const menuIcon = screen.getByText(/☰/i);
    fireEvent.click(menuIcon);

    expect(screen.getByText(/My Saved Blogs/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign Out/i)).toBeInTheDocument();

    // Clicking outside should close menu
    fireEvent.mouseDown(document);
    expect(screen.queryByText(/My Saved Blogs/i)).toBeNull();
  });

  test("clicking My Saved Blogs sets showSaved to true and closes menu", () => {
    render(
      <MemoryRouter>
        <Navbar
          search=""
          setSearch={setSearchMock}
          setShowSaved={setShowSavedMock}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/☰/i));
    fireEvent.click(screen.getByText(/My Saved Blogs/i));

    expect(setShowSavedMock).toHaveBeenCalledWith(true);
    expect(screen.queryByText(/My Saved Blogs/i)).toBeNull();
  });

  test("clicking Sign Out navigates to / and resets search/showSaved", () => {
    render(
      <MemoryRouter>
        <Navbar
          search="query"
          setSearch={setSearchMock}
          setShowSaved={setShowSavedMock}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/☰/i));
    fireEvent.click(screen.getByText(/Sign Out/i));

    expect(setShowSavedMock).toHaveBeenCalledWith(false);
    expect(setSearchMock).toHaveBeenCalledWith("");
    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(screen.queryByText(/Sign Out/i)).toBeNull();
  });
});
