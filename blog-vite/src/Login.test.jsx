import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import Login from "./Pages/Login.jsx";

import { MemoryRouter } from "react-router-dom";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("Login Component", () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
  });

  test("renders login form elements", () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByText("Continue as Guest")).toBeInTheDocument();
  });

  test("shows alert if fields are empty", () => {
    window.alert = vi.fn();
    render(<MemoryRouter><Login /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Login" }));
    expect(window.alert).toHaveBeenCalledWith("Please fill all fields");
  });

  test("continue as guest works correctly", () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    fireEvent.click(screen.getByText("Continue as Guest"));
    expect(localStorage.getItem("userType")).toBe("guest");
    expect(mockNavigate).toHaveBeenCalledWith("/blog");
  });
});
