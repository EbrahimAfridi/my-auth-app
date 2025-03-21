// src/pages/Home.tsx
import { useAuth } from "../context/AuthContext";

export function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="home-container">
      <h1>Welcome to the Dashboard</h1>
      <p>You are logged in as: {user?.username || "User"}</p>

      <button onClick={logout} className="logout-button">
        Sign Out
      </button>
    </div>
  );
}
