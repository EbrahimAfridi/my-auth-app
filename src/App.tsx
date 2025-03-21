// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { configureAmplify } from "./config/amplify";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { AuthCallback } from "./components/AuthCallback";

// In your main App.tsx or index.tsx
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
});

// Listen for auth events globally
import { Hub } from "@aws-amplify/core";
Hub.listen("auth", (data) => {
  console.log("Auth event:", data.payload.event, data.payload);
});

function App() {
  useEffect(() => {
    // Initialize Amplify when the app loads
    configureAmplify();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            {/* Add other protected routes here */}
          </Route>

          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
