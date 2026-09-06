import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Receipt,
  Bot,
  Settings,
  LogOut,
  Landmark,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "accounts", label: "Accounts", icon: Wallet },
  { key: "transfer", label: "Transfer", icon: ArrowLeftRight },
  { key: "paybills", label: "Pay Bills", icon: Receipt },
  { key: "aichat", label: "AI Assistant", icon: Bot },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function Layout({ page, onNavigate, children }) {
  const { username, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Landmark size={22} />
          <span>FinnovaAI</span>
        </div>

        <nav className="nav-list">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`nav-item ${page === key ? "active" : ""}`}
              onClick={() => onNavigate(key)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">{username ? username[0].toUpperCase() : "?"}</div>
            <span>{username}</span>
          </div>
          <button className="logout-btn" onClick={logout}>
            <LogOut size={16} />
            <span>Log out</span>
          </button>
          <div className="app-credit">Created by Madhura Pande</div>
        </div>
      </aside>

      <main className="content-area">{children}</main>
    </div>
  );
}
