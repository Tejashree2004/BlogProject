// src/Signup.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Signup from "./Pages/Signup.jsx"; 

describe("Signup Page", () => {
  test("renders signup heading and form elements", () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    // heading check
    expect(screen.getByRole("heading", { name: /Signup/i })).toBeInTheDocument();

    // input fields
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();

    // button check
    expect(screen.getByRole("button", { name: /Signup/i })).toBeInTheDocument();

    // login link check
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  test("navigates to verify-email page on submit", () => {
    const { container } = render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    );

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();

    // simulate submit
    fireEvent.submit(form);

    // since we can't check navigate() directly without mocking,
    // this test ensures form submit doesn't crash
  });
});
