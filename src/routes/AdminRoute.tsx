import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
// Permissions API removed: fallback to non-admin by default

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, userRole, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-center mt-10 text-white">Đang kiểm tra quyền truy cập...</div>;
  }

  if (isAuthenticated && userRole === "ADMIN") {
    return <>{children}</>;
  }

  return <Navigate to="/404" replace />;
};

export default AdminRoute;
