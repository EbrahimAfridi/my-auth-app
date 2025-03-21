// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Show a loading spinner or message while checking auth state
    return <div>Loading authentication status...</div>;
  }

  // Redirect to login if not authenticated, otherwise render the protected content
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}
