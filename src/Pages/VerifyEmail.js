import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const DEMO_OTP = "123456";

  const handleVerify = (e) => {
    e.preventDefault();

    if (otp === DEMO_OTP) {
      navigate("/"); // login page
    } else {
      setError("Incorrect OTP");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleVerify} style={{ width: "100%" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Verify your email
        </h2>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        {error && (
          <p style={{ color: "#f87171", textAlign: "center", fontSize: "14px" }}>
            {error}
          </p>
        )}

        <button className="auth-btn" type="submit">
          Verify and Continue
        </button>
      </form>
    </div>
  );
}

export default VerifyEmail;
