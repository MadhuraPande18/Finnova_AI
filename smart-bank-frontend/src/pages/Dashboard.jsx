import { useEffect, useState, useCallback } from "react";
import { Eye, EyeOff, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMyAccounts } from "../api/accounts";
import { getAllTransfers } from "../api/transfers";
import { getAllPayments } from "../api/payments";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusMessage from "../components/StatusMessage";

export default function Dashboard() {
  const { username } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const myAccounts = await getMyAccounts(username);
      setAccounts(myAccounts);

      const accountIds = new Set(myAccounts.map((a) => a.id));

      // fund-transfer-service and utility-payment-service don't expose a
      // "give me only this user's activity" endpoint, so we fetch the full
      // lists and filter down to accounts this user actually owns. It's
      // real data either way, not a hardcoded sample.
      const [transfers, payments] = await Promise.all([
        getAllTransfers().catch(() => []),
        getAllPayments().catch(() => []),
      ]);

      const relevantTransfers = transfers
        .filter((t) => accountIds.has(t.fromAccountId) || accountIds.has(t.toAccountId))
        .map((t) => ({
          id: `transfer-${t.id}`,
          title: accountIds.has(t.fromAccountId)
            ? `Transfer to account #${t.toAccountId}`
            : `Transfer from account #${t.fromAccountId}`,
          amount: t.amount,
          direction: accountIds.has(t.fromAccountId) ? "debit" : "credit",
        }));

      const relevantPayments = payments
        .filter((p) => accountIds.has(p.accountId))
        .map((p) => ({
          id: `payment-${p.id}`,
          title: `${p.billerName} bill (${p.status})`,
          amount: p.amount,
          direction: "debit",
        }));

      setActivity([...relevantTransfers, ...relevantPayments]);
    } catch (err) {
      setError(err.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const formatMoney = (amount) =>
    amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (loading) return <LoadingSpinner label="Loading your dashboard..." />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome back, {username}</h1>
        <button className="icon-btn" onClick={load} title="Refresh">
          <RefreshCw size={18} />
        </button>
      </div>

      <StatusMessage type="error">{error}</StatusMessage>

      <div className="balance-card">
        <div className="balance-card-top">
          <span>Total Balance</span>
          <button className="icon-toggle" onClick={() => setShowBalance((s) => !s)}>
            {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
        <div className="balance-amount">
          {showBalance ? `₹ ${formatMoney(totalBalance)}` : "₹ ••••••"}
        </div>
        <div className="balance-sub">
          across {accounts.length} account{accounts.length === 1 ? "" : "s"}
        </div>
      </div>

      <h2 className="section-title">Your Accounts</h2>
      {accounts.length === 0 ? (
        <p className="empty-state">
          No accounts yet. If you just registered, this can take a moment — try refreshing.
        </p>
      ) : (
        <div className="account-grid">
          {accounts.map((acc) => (
            <div key={acc.id} className="account-card">
              <div className="account-card-number">{acc.accountNumber}</div>
              <div className="account-card-holder">{acc.accountHolderName}</div>
              <div className="account-card-balance">
                {showBalance ? `₹ ${formatMoney(acc.balance)}` : "₹ ••••••"}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title">Recent Activity</h2>
      {activity.length === 0 ? (
        <p className="empty-state">No transfers or payments yet.</p>
      ) : (
        <div className="activity-list">
          {activity.slice(0, 8).map((item) => (
            <div key={item.id} className="activity-row">
              <div className={`activity-icon ${item.direction}`}>
                {item.direction === "credit" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
              <div className="activity-title">{item.title}</div>
              <div className={`activity-amount ${item.direction}`}>
                {item.direction === "credit" ? "+" : "-"} ₹ {formatMoney(item.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
