import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { isAdmin } from "../utils/apiHelpers";

// Route guard: replaces the original Header effect that redirected on mount
// (which ran once, so it never reacted to login/logout afterwards).
const RequireAuth = ({ adminOnly = false, children }) => {
  const userInfo = useSelector((state) => state.login.userInfo);

  if (!userInfo) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin(userInfo)) return <Navigate to="/" replace />;
  return children;
};

export default RequireAuth;
