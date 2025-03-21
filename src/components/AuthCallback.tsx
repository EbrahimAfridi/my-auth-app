// src/components/AuthCallback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hub } from "@aws-amplify/core";
import { fetchAuthSession } from "@aws-amplify/auth";

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle the authentication callback
    async function handleAuthCallback() {
      try {
        // This will exchange the authorization code for tokens
        await fetchAuthSession();
        navigate("/"); // Redirect to home page after successful authentication
      } catch (err) {
        console.error("Authentication error:", err);
        setError("Authentication failed. Please try again.");
        navigate("/login");
      }
    }

    // Listen for auth events with the correct Gen 2 event names
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      console.log("Auth event:", payload.event);

      switch (payload.event) {
        case "signInWithRedirect":
          // This fires when the redirect sign-in flow successfully completes
          navigate("/");
          break;
        case "signInWithRedirect_failure":
          // This fires when the redirect sign-in flow fails
          setError("Authentication failed. Please try again.");
          navigate("/login");
          break;
        case "signedIn":
          // This fires after a user is signed in
          navigate("/");
          break;
        case "signedOut":
          // This fires after a user is signed out
          navigate("/login");
          break;
      }
    });

    // Try to handle the auth callback when the component mounts
    handleAuthCallback();

    // Clean up the listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, [navigate]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Completing authentication, please wait...</div>;
}
