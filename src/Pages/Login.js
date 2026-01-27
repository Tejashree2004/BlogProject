import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 Clear fields when page opens
  useEffect(() => {
    setUsername("");
    setPassword("");
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please fill all fields");
      return;
    }

    navigate("/blog");

    setUsername("");
    setPassword("");
  };

  return (
    <div className="login-container">
      <form
        onSubmit={handleLogin}
        autoComplete="off"
        style={{ width: "100%" }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Login
        </h2>

       {/* Username */}
        <input
          type="text"
          name="username"
          placeholder="Username"
          autoComplete="off"
          value={username}
          readOnly
          onFocus={(e) => e.target.removeAttribute("readonly")}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoComplete="new-password"
          value={password}
          readOnly
          onFocus={(e) => e.target.removeAttribute("readonly")}
          onChange={(e) => setPassword(e.target.value)}
        />


        <button className="auth-btn" type="submit">
          Login
        </button>

        <p style={{ marginTop: "12px", textAlign: "center", fontSize: "14px" }}>
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





