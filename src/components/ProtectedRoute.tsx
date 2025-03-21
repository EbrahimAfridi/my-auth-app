// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  console.log(
    `🛡️ ProtectedRoute check - Authenticated: ${isAuthenticated}, Loading: ${isLoading}`
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <h2>Loading</h2>
        <p>Verifying your authentication...</p>
      </div>
    );
  }

  // Let the component decide routing solely based on auth state
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
