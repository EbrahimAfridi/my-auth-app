// src/App.tsx - updated with new routes
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { configureAmplify } from "./config/amplify";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ConfirmRegistration } from "./pages/ConfirmRegistration";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Home } from "./pages/Home";
import { AuthCallback } from "./components/AuthCallback";
import { Hub } from "@aws-amplify/core";

// Global error and auth event handling
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
});

// Centralized Hub listener for debugging
Hub.listen("auth", (data) => {
  console.log("🌐 Global Auth Event:", data.payload.event, data.payload);
});

// Prevent multiple initializations
let isConfigured = false;

// Create a wrapper component that initializes Amplify
function AmplifyInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!isConfigured) {
      configureAmplify();
      isConfigured = true;
    }
  }, []);

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/confirm-registration" element={<ConfirmRegistration />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        {/* Add other protected routes here */}
      </Route>

      {/* Redirect any unknown routes to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AmplifyInitializer>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </AmplifyInitializer>
    </BrowserRouter>
  );
}

export default App;
