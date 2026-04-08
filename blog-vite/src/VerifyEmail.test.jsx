import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import VerifyEmail from "./Pages/VerifyEmail.jsx";

// mock useNavigate
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("VerifyEmail Page", () => {
  beforeEach(() => {
    mockNavigate.mockClear(); // reset before each test
  });

  test("renders Verify your email heading and input", () => {
    render(
      <MemoryRouter>
        <VerifyEmail />
      </MemoryRouter>
    );

    expect(screen.getByText(/Verify your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter OTP/i)).toBeInTheDocument();
    expect(screen.getByText(/Verify and Continue/i)).toBeInTheDocument();
  });

  test("shows error for incorrect OTP", () => {
    render(
      <MemoryRouter>
        <VerifyEmail />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Enter OTP/i);
    const button = screen.getByText(/Verify and Continue/i);

    fireEvent.change(input, { target: { value: "000000" } });
    fireEvent.click(button);

    expect(screen.getByText(/Incorrect OTP/i)).toBeInTheDocument();
  });

  test("calls navigate on correct OTP", () => {
    render(
      <MemoryRouter>
        <VerifyEmail />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Enter OTP/i);
    const button = screen.getByText(/Verify and Continue/i);

    fireEvent.change(input, { target: { value: "123456" } });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
