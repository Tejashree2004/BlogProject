import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../api/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase(); // 🔥 FIX
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedEmail || !trimmedPassword || !trimmedConfirm) {
      setError("Please fill all fields.");
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      console.log("Signup Data:", trimmedEmail, trimmedPassword);

      const response = await signupUser({
        email: trimmedEmail,
        password: trimmedPassword,
        username: trimmedEmail.split("@")[0],
      });

      console.log("Signup response:", response);

      // ✅ SUCCESS CASE
      if (response?.email) {
        navigate("/verify-email", { state: { email: response.email } });
      } else {
        setError("Signup failed: Invalid server response.");
      }

    } catch (err) {
      console.error("🔥 Signup error:", err);

      // 🔥 FIX: use new axios error format
      const msg = err.message || "Signup failed";

      // ✅ handle already exists
      if (msg.toLowerCase().includes("already exists")) {
        navigate("/verify-email", { state: { email: trimmedEmail } });
      } else {
        setError(msg);
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSignup} autoComplete="off">
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Signup</h2>

        {error && (
          <p style={{ color: "#f87171", textAlign: "center", marginBottom: "10px" }}>
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />

        <div style={{ position: "relative", marginTop: "10px" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            style={{ width: "100%", paddingRight: "40px" }}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div style={{ position: "relative", marginTop: "10px" }}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
            style={{ width: "100%", paddingRight: "40px" }}
          />
          <span
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Signup"}
        </button>

        <p style={{ textAlign: "center", fontSize: "14px", marginTop: "12px" }}>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
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