import { fetchAuthSession } from "aws-amplify/auth";
// src/context/AuthContext.tsx - updated with email/password authentication
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import {
  getCurrentUser,
  signInWithRedirect,
  signOut,
  signIn,
  signUp,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  type SignUpInput,
} from "@aws-amplify/auth";
import { Hub } from "@aws-amplify/core";
import { useNavigate, useLocation } from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerUser: (
    username: string,
    email: string,
    password: string
  ) => Promise<string | undefined>;
  confirmRegistration: (username: string, code: string) => Promise<void>;
  forgotPassword: (username: string) => Promise<void>;
  confirmForgotPassword: (
    username: string,
    code: string,
    newPassword: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Add this utility function to calculate SECRET_HASH
  async function calculateSecretHash(
    username: any,
    clientId: any,
    clientSecret: any
  ) {
    try {
      const encoder = new TextEncoder();
      const message = encoder.encode(username + clientId);
      const keyData = encoder.encode(clientSecret);

      const key = await window.crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const signature = await window.crypto.subtle.sign("HMAC", key, message);
      return btoa(String.fromCharCode(...new Uint8Array(signature)));
    } catch (error) {
      console.error("Error calculating SECRET_HASH:", error);
      throw error;
    }
  }

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
      if (
        location.pathname !== "/" &&
        location.pathname !== "/confirm-registration" &&
        location.pathname !== "/forgot-password" &&
        location.pathname !== "/reset-password"
      ) {
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
        location.pathname !== "/register" &&
        location.pathname !== "/auth/callback" &&
        location.pathname !== "/confirm-registration" &&
        location.pathname !== "/forgot-password" &&
        location.pathname !== "/reset-password"
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

  // Google Sign-In
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
    } finally {
      const session = await fetchAuthSession();
      console.log(session, "session");
    }
  }

  // Handle authentication after redirect
  // async function handlePostAuthRedirect() {
  //   try {
  //     console.log("🔄 Checking authentication status...");

  //     // Try to get the current authenticated user
  //     const user = await getCurrentUser();

  //     if (user) {
  //       console.log("✅ User is authenticated");

  //       // Get the session which contains tokens
  //       const session = await fetchAuthSession();

  //       // Get the access token
  //       const accessToken = session.tokens?.accessToken?.toString();

  //       if (accessToken) {
  //         console.log("🔑 Access token obtained");

  //         // Send the token to the bridge URL
  //         await sendTokenToBridge(accessToken);
  //       } else {
  //         console.error("❌ No access token found in the session");
  //       }
  //     } else {
  //       console.log("ℹ️ User not authenticated");
  //     }
  //   } catch (error) {
  //     console.error("❌ Error handling authentication:", error);
  //   }
  // }

  // Function to send the token to the bridge
  // async function sendTokenToBridge(token) {
  //   const bridgeUrl = "http://localhost:3000/_oauth/bridge2ps";

  //   try {
  //     console.log("📤 Sending token to bridge URL...");
  //     const response = await fetch(bridgeUrl, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ token }),
  //     });

  //     if (response.ok) {
  //       console.log("✅ Token successfully sent to bridge");
  //       return await response.json();
  //     } else {
  //       console.error("❌ Failed to send token to bridge:", await response.text());
  //       throw new Error(`Failed to send token: ${response.status} ${response.statusText}`);
  //     }
  //   } catch (error) {
  //     console.error("❌ Error sending token to bridge:", error);
  //     throw error;
  //   }
  // }

  // // Call this function when the page loads to handle authentication after redirect
  // document.addEventListener("DOMContentLoaded", handlePostAuthRedirect);

  // Email/Password Sign-In
  async function signInWithEmail(email: string, password: string) {
    try {
      console.log("🔑 Signing in with email and password...");
      const secretHash = await calculateSecretHash(
        email,
        "15uj23gg14qthp49qvovu23d42",
        "1ek6i4t2ejl9cj00ic0ua474a5tm33l8tafh3mjlfc1pl7qapbie"
      );
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password,
        options: {
          SECRET_HASH: secretHash,
          authFlowType: "USER_PASSWORD_AUTH",
          authParameters: {
            SECRET_HASH: secretHash,
          },
          clientMetadata: {
            SECRET_HASH: secretHash,
          },
        },
      });

      if (isSignedIn) {
        console.log("✅ Sign-in successful");
        await checkAuthState();
      } else if (nextStep) {
        console.log("⏭️ Additional steps required:", nextStep);
        // Handle various next steps like confirming sign-up or changing password
        if (nextStep.signInStep === "CONFIRM_SIGN_UP") {
          navigate("/confirm-registration", {
            state: { username: email },
            replace: true,
          });
        }
      }
    } catch (error: any) {
      console.error("❌ Email sign-in error:", error);
      // Handle specific error types
      if (error.name === "UserNotConfirmedException") {
        navigate("/confirm-registration", {
          state: { username: email },
          replace: true,
        });
        throw new Error(
          "Please confirm your account with the code sent to your email."
        );
      }

      throw error;
    }
  }

  // User Registration
  async function registerUser(
    username: string,
    email: string,
    password: string
  ) {
    try {
      console.log("📝 Registering new user...");

      const signUpInput: SignUpInput = {
        username: username,
        password,
        options: {
          userAttributes: {
            email,
            preferred_username: username,
          },
          autoSignIn: false,
        },
      };

      const { isSignUpComplete, userId, nextStep } = await signUp(signUpInput);

      console.log("✅ Registration submitted:", { isSignUpComplete, userId });

      if (!isSignUpComplete) {
        console.log("⏭️ Next steps required:", nextStep);

        if (nextStep?.signUpStep === "CONFIRM_SIGN_UP") {
          navigate("/confirm-registration", {
            state: { username: username },
            replace: true,
          });
        }
      }

      return userId;
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      throw error;
    }
  }

  // Confirm Registration with Verification Code
  async function confirmRegistration(username: string, code: string) {
    try {
      console.log("🔎 Confirming registration...");
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username,
        confirmationCode: code,
      });

      console.log("✅ Confirmation status:", { isSignUpComplete, nextStep });

      if (isSignUpComplete) {
        navigate("/login", { replace: true });
      }
    } catch (error: any) {
      console.error("❌ Confirmation error:", error);
      throw error;
    }
  }

  // Forgot Password
  async function forgotPassword(username: string) {
    try {
      console.log("🔄 Initiating password reset...");
      const { nextStep } = await resetPassword({ username });

      console.log("✅ Password reset initiated:", nextStep);

      if (nextStep?.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE") {
        navigate("/reset-password", {
          state: { username },
          replace: true,
        });
      }
    } catch (error: any) {
      console.error("❌ Password reset error:", error);
      throw error;
    }
  }

  // Confirm Forgot Password
  async function confirmForgotPassword(
    username: string,
    code: string,
    newPassword: string
  ) {
    try {
      console.log("🔄 Confirming password reset...");
      await confirmResetPassword({
        username,
        confirmationCode: code,
        newPassword,
      });

      console.log("✅ Password has been reset successfully");
      navigate("/login", { replace: true });
    } catch (error: any) {
      console.error("❌ Password reset confirmation error:", error);
      throw error;
    }
  }

  // Sign Out
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
        signInWithEmail,
        registerUser,
        confirmRegistration,
        forgotPassword,
        confirmForgotPassword,
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
