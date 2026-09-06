import { useState } from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transfer from "./pages/Transfer";
import PayBills from "./pages/PayBills";
import AiChat from "./pages/AiChat";
import Settings from "./pages/Settings";

// State-based routing on purpose — no react-router dependency needed for
// an app this size, and it avoids the missing-dependency/case-mismatch
// problem the previous half-migrated frontend had.
function AuthenticatedApp() {
  const [page, setPage] = useState("dashboard");

  const pages = {
    dashboard: Dashboard,
    accounts: Accounts,
    transfer: Transfer,
    paybills: PayBills,
    aichat: AiChat,
    settings: Settings,
  };

  const PageComponent = pages[page] || Dashboard;

  return (
    <Layout page={page} onNavigate={setPage}>
      <PageComponent />
    </Layout>
  );
}

function UnauthenticatedApp() {
  const [screen, setScreen] = useState("login");
  return screen === "login" ? (
    <Login onNavigate={setScreen} />
  ) : (
    <Register onNavigate={setScreen} />
  );
}

function Root() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AuthenticatedApp /> : <UnauthenticatedApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
