import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Wallet, PlusCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMyAccounts, depositToAccount } from "../api/accounts";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusMessage from "../components/StatusMessage";

export default function Accounts() {
  const { username } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Which account's "Add Money" row is currently open, and what amount is typed in it.
  const [depositingId, setDepositingId] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositBusy, setDepositBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setAccounts(await getMyAccounts(username));
    } catch (err) {
      setError(err.message || "Could not load accounts.");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  function openDeposit(id) {
    setDepositingId(id);
    setDepositAmount("");
    setError("");
    setSuccess("");
  }

  async function submitDeposit(id) {
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }

    setDepositBusy(true);
    setError("");
    setSuccess("");
    try {
      await depositToAccount(id, amount);
      setSuccess(`Added ₹${amount.toFixed(2)} to your account.`);
      setDepositingId(null);
      setDepositAmount("");
      await load();
    } catch (err) {
      setError(err.message || "Deposit failed.");
    } finally {
      setDepositBusy(false);
    }
  }

  const formatMoney = (amount) =>
    amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (loading) return <LoadingSpinner label="Loading accounts..." />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Accounts</h1>
        <button className="icon-btn" onClick={load} title="Refresh">
          <RefreshCw size={18} />
        </button>
      </div>

      <StatusMessage type="error">{error}</StatusMessage>
      <StatusMessage type="success">{success}</StatusMessage>

      {accounts.length === 0 ? (
        <p className="empty-state">No accounts found for {username}.</p>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Account Number</th>
                <th>Account ID</th>
                <th>Holder Name</th>
                <th>Balance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
                <tr key={acc.id}>
                  <td>
                    <span className="table-icon">
                      <Wallet size={14} />
                    </span>
                    {acc.accountNumber}
                  </td>
                  <td>
                    <code className="account-id-badge">{acc.id}</code>
                  </td>
                  <td>{acc.accountHolderName}</td>
                  <td className="amount-cell">₹ {formatMoney(acc.balance)}</td>
                  <td className="row-actions">
                    {depositingId === acc.id ? (
                      <div className="deposit-inline">
                        <input
                          className="text-input deposit-input"
                          type="number"
                          min="0"
                          step="0.01"
                          autoFocus
                          placeholder="Amount"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && submitDeposit(acc.id)}
                        />
                        <button
                          className="secondary-btn"
                          onClick={() => submitDeposit(acc.id)}
                          disabled={depositBusy}
                        >
                          {depositBusy ? "Adding..." : "Confirm"}
                        </button>
                        <button className="icon-btn" onClick={() => setDepositingId(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button className="secondary-btn" onClick={() => openDeposit(acc.id)}>
                        <PlusCircle size={15} /> Add Money
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
