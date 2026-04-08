import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyEmailOtp } from "../api/api";

function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ POPUP STATE (NEW)
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: ""
  });

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email?.trim().toLowerCase() || "";

  // ✅ CLOSE POPUP
  const closePopup = () => {
    setPopup({ show: false, message: "", type: "" });

    if (popup.type === "success") {
      navigate("/login");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email not found. Please signup again.");
      return;
    }

    const trimmedOtp = otp.trim();

    if (!trimmedOtp) {
      setError("Please enter the OTP sent to your email.");
      return;
    }

    try {
      setLoading(true);

      const res = await verifyEmailOtp({
        email: email,
        otp: trimmedOtp,
      });

      console.log("VERIFY RESPONSE:", res);

      // ✅ SUCCESS POPUP (REPLACED ALERT)
      if (res?.message) {
        setPopup({
          show: true,
          message: res.message || "Email verified successfully!",
          type: "success"
        });
      } else {
        setError("OTP verification failed: Invalid response");
      }
    } catch (err) {
      console.error("OTP verification error:", err);

      setPopup({
        show: true,
        message:
          err.response?.data?.message ||
          "OTP verification failed. Try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleVerify} autoComplete="off">
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Verify your email
        </h2>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          disabled={loading}
          required
        />

        {error && (
          <p
            style={{
              color: "#f87171",
              textAlign: "center",
              fontSize: "14px",
              marginTop: "10px",
            }}
          >
            {error}
          </p>
        )}

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify and Continue"}
        </button>
      </form>

      {/* ================= POPUP (SAME AS CREATE BLOG) ================= */}
      {popup.show && (
  <div
    onClick={closePopup}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.35)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "400px",
        background: "#111827",
        borderRadius: "12px",
        border: "1px solid #1f2937",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        overflow: "hidden"
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "16px",
          background: popup.type === "success" ? "#2563eb" : "#2563eb",
          color: "white",
          textAlign: "center",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px"
        }}
      >
        {popup.type === "success" ? "Success" : "Error"}

        {/* Symbol */}
        {popup.type === "success" ? (
          <span
            style={{
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "#22c55e",
              color: "white",
              fontSize: "14px",
              fontWeight: "bold"
            }}
          >
            ✓
          </span>
        ) : (
          <span
            style={{
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "#ef4444",
              color: "white",
              fontSize: "14px",
              fontWeight: "bold"
            }}
          >
            ✕
          </span>
        )}

        {/* CLOSE BUTTON */}
        <span
          onClick={closePopup}
          style={{
            position: "absolute",
            right: "15px",
            top: "10px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          ✕
        </span>
      </div>

      {/* BODY */}
      <div
        style={{
          padding: "25px",
          textAlign: "center",
          color: "#e5e7eb",
          fontSize: "14px"
        }}
      >
        {popup.message}
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default VerifyEmail;