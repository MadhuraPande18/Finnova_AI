import { useState } from "react";
import { UserCircle, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../api/client";

export default function Settings() {
  const { username, logout } = useAuth();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-card">
        <div className="settings-avatar">
          <UserCircle size={48} />
        </div>
        <div>
          <div className="settings-username">{username}</div>
          <div className="settings-meta">Connected to API Gateway: {API_BASE_URL}</div>
        </div>
      </div>

      <div className="settings-card">
        <div>
          <div className="settings-username">Session</div>
          <div className="settings-meta">Signing out will clear your saved session token.</div>
        </div>
        {confirming ? (
          <div className="row-actions">
            <button className="danger-btn" onClick={logout}>
              Confirm Log Out
            </button>
            <button className="secondary-btn" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="secondary-btn" onClick={() => setConfirming(true)}>
            <LogOut size={16} /> Log Out
          </button>
        )}
      </div>
    </div>
  );
}
