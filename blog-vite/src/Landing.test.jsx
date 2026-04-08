import { render } from "@testing-library/react";
import { vi } from "vitest";
import Landing from "./Pages/Landing.jsx";

// ✅ Mock react-router-dom before importing Landing
vi.mock("react-router-dom", () => {
  return {
    useNavigate: () => mockNavigate,
  };
});

// create the mock function
const mockNavigate = vi.fn();

describe("Landing Page", () => {
  beforeEach(() => {
    mockNavigate.mockClear(); // reset calls before each test
  });

  test("redirects to /blog on mount", () => {
    render(<Landing />);
    expect(mockNavigate).toHaveBeenCalledWith("/blog");
  });
});
