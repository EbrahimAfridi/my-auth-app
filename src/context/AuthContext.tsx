// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { getCurrentUser, signInWithRedirect, signOut } from "@aws-amplify/auth";
import { Hub } from "@aws-amplify/core";
import { useNavigate, useLocation } from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Use useCallback to prevent unnecessary re-renders
  const checkAuthState = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("🔍 Checking authentication state...");
      const currentUser = await getCurrentUser();
      console.log("✅ User authenticated:", currentUser);
      setIsAuthenticated(true);
      setUser(currentUser);

      // Critical addition: If we're not on the home page and we're authenticated, navigate
      if (location.pathname !== "/") {
        console.log("🧭 Navigation needed - redirecting to home");
        navigate("/", { replace: true });
      } else {
        console.log("🏠 Already on home page, no navigation needed");
      }

      return true;
    } catch (error) {
      console.log("❌ No current user found");
      setIsAuthenticated(false);
      setUser(null);

      // If we're not on the login page and we're not authenticated, redirect
      if (
        location.pathname !== "/login" &&
        location.pathname !== "/auth/callback"
      ) {
        console.log("🧭 Not authenticated - redirecting to login");
        navigate("/login", { replace: true });
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    // Initial auth check
    checkAuthState();

    // Set up a listener for auth events
    const unsubscribe = Hub.listen("auth", async ({ payload }) => {
      console.log("🔔 Auth event in context:", payload.event);

      switch (payload.event) {
        case "signInWithRedirect":
        case "signedIn":
        case "tokenRefresh":
          // Explicitly await the auth state check
          await checkAuthState();
          break;
        case "signedOut":
          // When signed out, update state immediately
          setIsAuthenticated(false);
          setUser(null);
          navigate("/login", { replace: true });
          break;
      }
    });

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, [checkAuthState, navigate]);

  async function signInWithGoogle() {
    try {
      console.log("🚀 Attempting to sign in with Google...");
      await signInWithRedirect({
        provider: "Google",
        options: {
          preferPrivateSession: false,
        },
      });
      console.log("↪️ Redirect initiated");
    } catch (error: any) {
      console.error("❌ Error initiating Google sign-in:", error);
      throw error;
    }
  }

  async function logout() {
    try {
      console.log("🚪 Starting sign-out process...");

      // Update local state first for immediate UI response
      setIsAuthenticated(false);
      setUser(null);

      // Then perform the sign-out API call
      await signOut({ global: true });

      // Directly navigate after sign-out
      navigate("/login", { replace: true });

      console.log("✅ Sign-out successful");
    } catch (error) {
      console.error("❌ Error signing out:", error);
      navigate("/login", { replace: true });
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
