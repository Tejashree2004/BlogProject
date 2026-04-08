import axios from "axios";

// ================= AXIOS INSTANCE ================= //
const axiosInstance = axios.create({
  baseURL: "http://localhost:5111/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000, // 🔥 increased from 10000 → avoids OTP/email timeout crash
});

// ================= REQUEST INTERCEPTOR ================= //
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");

    console.log("Token being sent:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR ================= //
axiosInstance.interceptors.response.use(
  (response) => response,

  (error) => {
    console.error("🔥 FULL ERROR OBJECT:", error);

    // ================= TIMEOUT HANDLING ================= //
    if (error.code === "ECONNABORTED") {
      console.error("⏰ Request timeout - backend slow or email service stuck");
      return Promise.reject({
        status: 408,
        message: "Request timeout. Please try again.",
        originalError: error,
      });
    }

    const status = error.response?.status;

    const message =
      error.response?.data?.message ||
      error.response?.data?.title ||
      error.response?.data ||
      error.message ||
      "Something went wrong";

    console.error("🚨 API Error:", status, message);

    // ================= ERROR HANDLING ================= //

    if (status === 401) {
      console.warn("Unauthorized - token expired");
      localStorage.clear();

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    else if (status === 403) {
      alert("Access denied.");
    }

    else if (status === 404) {
      console.error("API not found:", error.config?.url);
    }

    else if (status === 400) {
      console.error("Bad Request:", message);
    }

    else if (status >= 500) {
      console.error("Server error:", message);
    }

    return Promise.reject({
      status: status || 500,
      message,
      originalError: error,
    });
  }
);

export default axiosInstance;