import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setUsername("");
    setPassword("");
  }, []);

  // ✅ LOGIN FUNCTION (FIXED)
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      return setError("Please fill all fields");
    }

    try {
      setLoading(true);

      const res = await loginUser({
        email: username,
        username,
        password,
      });

      console.log("🔥 LOGIN RESPONSE:", res);

      // ✅ IMPORTANT FIX
      if (!res || !res.token) {
        setError("Login failed: Token not received");
        return;
      }

      const { username: returnedUsername, email, token } = res;

      // ✅ SAVE TOKEN
      localStorage.setItem("jwtToken", token);

      // ✅ SAVE USER DATA
      localStorage.setItem("username", returnedUsername);
      localStorage.setItem("email", email);

      // remove guest flag
      localStorage.removeItem("userType");

      console.log("✅ Token saved:", token);

      navigate("/blog");
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);

      if (
        err.response?.data?.message ===
        "Invalid credentials or email not verified."
      ) {
        const proceed = window.confirm(
          "You haven't verified your email yet. Do you want to continue as Guest?"
        );

        if (proceed) {
          localStorage.setItem("userType", "guest");
          localStorage.removeItem("username");
          localStorage.removeItem("email");
          localStorage.removeItem("jwtToken");

          navigate("/blog");
        }
      } else {
        setError(err.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ GUEST LOGIN
  const handleGuest = () => {
    localStorage.setItem("userType", "guest");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("jwtToken");

    navigate("/blog");
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} autoComplete="off">
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Login
        </h2>

        {error && (
          <p
            style={{
              color: "#f87171",
              textAlign: "center",
              marginBottom: "10px",
            }}
          >
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
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
              color: "#6b7280",
            }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            marginTop: "10px",
          }}
        >
          Or{" "}
          <span
            onClick={handleGuest}
            style={{
              color: "#3b82f6",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Continue as Guest
          </span>
        </p>

        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            marginTop: "12px",
          }}
        >
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            style={{ color: "#3b82f6", cursor: "pointer" }}
          >
            Signup
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;