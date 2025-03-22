// src/pages/ConfirmRegistration.tsx
import { useState, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, Link, Navigate } from "react-router-dom";
import "./ConfirmRegistration.css";

export function ConfirmRegistration() {
  const { confirmRegistration } = useAuth();
  const location = useLocation();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Get username from location state
  const username = location.state?.username;

  if (!username) {
    return <Navigate to="/register" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code) {
      setError("Verification code is required");
      return;
    }

    try {
      setIsLoading(true);
      await confirmRegistration(username, code);
      setIsConfirmed(true);
    } catch (err: any) {
      setError(
        err.message || "Failed to confirm registration. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isConfirmed) {
    return (
      <div className="confirm-container">
        <div className="confirm-card">
          <h1>Account Confirmed!</h1>
          <p>Your account has been successfully verified.</p>
          <Link to="/login" className="confirm-button">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="confirm-container">
      <div className="confirm-card">
        <h1>Verify Your Account</h1>
        <p>
          We've sent a verification code to <strong>{username}</strong>. Please
          enter the code below to confirm your account.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code">Verification Code</label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter verification code"
              disabled={isLoading}
              autoFocus
            />
          </div>

          <button type="submit" className="confirm-button" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify Account"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Didn't receive the code?{" "}
            <button
              onClick={() => alert("Resend code functionality would go here")}
              className="resend-link"
            >
              Resend code
            </button>
          </p>
          <p>
            <Link to="/login">Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
