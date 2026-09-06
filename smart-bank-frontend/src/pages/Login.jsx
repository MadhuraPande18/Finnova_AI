import { useState } from "react";
import { Landmark, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import StatusMessage from "../components/StatusMessage";

export default function Login({ onNavigate }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      // AuthContext flips isAuthenticated -> App.jsx swaps to the dashboard.
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <Landmark size={28} />
          <h1>FinnovaAI</h1>
        </div>
        <p className="auth-subtitle">Sign in to your account</p>

        <StatusMessage type="error">{error}</StatusMessage>

        <label className="field-label">Username</label>
        <input
          className="text-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="your.username"
          autoFocus
        />

        <label className="field-label">Password</label>
        <div className="password-field">
          <input
            className="text-input"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <button
            type="button"
            className="icon-toggle"
            onClick={() => setShowPassword((s) => !s)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="auth-switch">
          Don&apos;t have an account?{" "}
          <button type="button" className="link-btn" onClick={() => onNavigate("register")}>
            Register
          </button>
        </p>

        <div className="app-credit">Created by Madhura Pande</div>
      </form>
    </div>
  );
}
