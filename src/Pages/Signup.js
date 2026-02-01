import React from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault(); // prevent refresh
    navigate("/verify-email"); // ✅ ONLY CHANGE
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSignup} style={{ width: "100%" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Signup
        </h2>

        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />

        <button className="auth-btn" type="submit">
          Signup
        </button>

        <p style={{ marginTop: "12px", textAlign: "center", fontSize: "14px" }}>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/")}
            style={{ color: "#3b82f6", cursor: "pointer" }}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default Signup;
