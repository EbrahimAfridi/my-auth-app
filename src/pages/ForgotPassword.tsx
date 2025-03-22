// src/pages/ForgotPassword.tsx
import { useState, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

export function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!username) {
      setError("Email is required");
      return;
    }

    try {
      setIsLoading(true);
      await forgotPassword(username);
      setSuccessMessage("Password reset instructions sent to your email.");
    } catch (err: any) {
      setError(
        err.message || "Failed to initiate password reset. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h1>Reset Your Password</h1>
        <p>
          Enter your email address and we'll send you instructions to reset your
          password.
        </p>

        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Email</label>
            <input
              type="email"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="forgot-password-button"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Instructions"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Remember your password? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
