import { useState } from "react";
import { Landmark } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import StatusMessage from "../components/StatusMessage";

export default function Register({ onNavigate }) {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim() || !password) {
      setError("Enter both username and password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await register(username.trim(), password);
      setSuccess("Account created! A bank account was set up for you. You can log in now.");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Registration failed.");
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
        <p className="auth-subtitle">Create your account</p>

        <StatusMessage type="error">{error}</StatusMessage>
        <StatusMessage type="success">{success}</StatusMessage>

        <label className="field-label">Username</label>
        <input
          className="text-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="choose a username"
          autoFocus
        />

        <label className="field-label">Password</label>
        <input
          className="text-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="at least 6 characters"
        />

        <label className="field-label">Confirm Password</label>
        <input
          className="text-input"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="repeat password"
        />

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="auth-switch">
          Already have an account?{" "}
          <button type="button" className="link-btn" onClick={() => onNavigate("login")}>
            Sign in
          </button>
        </p>

        <div className="app-credit">Created by Madhura Pande</div>
      </form>
    </div>
  );
}
