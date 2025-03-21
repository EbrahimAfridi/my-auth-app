// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getCurrentUser, signInWithRedirect, signOut } from "@aws-amplify/auth";
import { Hub } from "@aws-amplify/core";

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

  useEffect(() => {
    // Check auth state immediately
    checkAuthState();

    // Set up a listener for auth events
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      console.log("Auth event in context:", payload.event);

      switch (payload.event) {
        case "signInWithRedirect":
        case "signedIn":
        case "tokenRefresh":
          // When any sign-in event happens, refresh the auth state
          checkAuthState();
          break;
        case "signedOut":
          // When signed out, update state immediately
          setIsAuthenticated(false);
          setUser(null);
          break;
      }
    });

    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []);

  async function checkAuthState() {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      console.log("Current user:", currentUser);
      setIsAuthenticated(true);
      setUser(currentUser);
    } catch (error) {
      console.log("No current user found");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function signInWithGoogle() {
    try {
      console.log("Attempting to sign in with Google...");
      await signInWithRedirect({
        provider: "Google",
        options: {
          preferPrivateSession: false,
        },
      });
      console.log("Redirect initiated");
    } catch (error: Error | any) {
      console.error("Error initiating Google sign-in:", error);
      alert(`Auth error: ${error.message || error}`);
    }
  }

  async function logout() {
    try {
      await signOut({
        global: true,
        oauth: {
          redirectUrl: "http://localhost:5173/login",
        },
      });

      // We'll let the Hub listener handle state updates
      // But add a fallback in case the event doesn't fire
      setTimeout(() => {
        setIsAuthenticated(false);
        setUser(null);
      }, 1000);
    } catch (error) {
      console.error("Error signing out:", error);
      // Still sign out locally even if there's an error with Cognito
      setIsAuthenticated(false);
      setUser(null);
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
