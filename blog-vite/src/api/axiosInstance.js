import axios from "axios";

// ================= AXIOS INSTANCE ================= //
const axiosInstance = axios.create({
  baseURL: "http://localhost:5111/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

// ================= REQUEST INTERCEPTOR ================= //
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      // 🔥 FIX: support multiple token keys (SAFE)
      const token =
        localStorage.getItem("jwtToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      console.log("Token being sent:", token);

      // ✅ Only attach if valid token exists
      if (token && token !== "null" && token !== "undefined") {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization; // prevent invalid header
      }
    } catch (err) {
      console.error("Token read error:", err);
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
      console.error("⏰ Request timeout");
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
      const isGuest = localStorage.getItem("userType") === "guest";

      console.warn("Unauthorized");

      // ✅ Don't redirect guest users
      if (!isGuest) {
        // 🔥 safer removal (remove all possible token keys)
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");

        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
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