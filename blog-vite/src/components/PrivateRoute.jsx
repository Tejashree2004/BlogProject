import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

function PrivateRoute() {
  const token = localStorage.getItem("jwtToken");
  const username = localStorage.getItem("username");
  let userType = localStorage.getItem("userType");

  const location = useLocation(); // for potential redirect after login

  // Assign guest automatically if nothing exists
  if (!token && !username && !userType) {
    const guestId = "guest_" + Date.now();
    localStorage.setItem("userId", guestId);
    localStorage.setItem("userType", "guest");
    userType = "guest";
  }

  // 🔹 Only logged-in users with JWT can access protected routes
  if (token && username) {
    return <Outlet />;
  }

  // Guests or non-logged-in users trying to access protected route
  // Redirect to login page
  return <Navigate to="/login" state={{ from: location }} replace />;
}

export default PrivateRoute;