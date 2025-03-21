// src/components/AuthCallback.tsx
import { useEffect, useState } from "react";
import { fetchAuthSession } from "@aws-amplify/auth";

export function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Handle the authentication callback
    async function handleAuthCallback() {
      try {
        setIsProcessing(true);
        console.log("🔄 Processing auth callback...");

        // This will exchange the authorization code for tokens
        await fetchAuthSession();
        console.log("✅ Auth session established");

        // Don't navigate here - let the AuthContext handle navigation
        // The Hub event will trigger a state check in AuthContext
      } catch (err) {
        console.error("❌ Authentication error:", err);
        setError("Authentication failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }

    handleAuthCallback();
  }, []);

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  if (isProcessing) {
    return (
      <div className="auth-callback-container">
        <h2>Completing your sign-in</h2>
        <p>Please wait while we finalize your authentication...</p>
      </div>
    );
  }

  return <div>Authentication complete! Redirecting...</div>;
}
