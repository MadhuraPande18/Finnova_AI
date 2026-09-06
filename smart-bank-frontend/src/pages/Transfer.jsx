import { useEffect, useState, useCallback } from "react";
import { Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMyAccounts, getAllAccounts } from "../api/accounts";
import { createTransfer } from "../api/transfers";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusMessage from "../components/StatusMessage";

export default function Transfer() {
  const { username } = useAuth();
  const [myAccounts, setMyAccounts] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // "From" is restricted to accounts you actually own. "To" is picked
      // from every account in the system, so you never need a second
      // browser/login just to find someone's account ID.
      const [mine, everyone] = await Promise.all([getMyAccounts(username), getAllAccounts()]);
      setMyAccounts(mine);
      setAllAccounts(everyone);
      if (mine.length > 0) setFromAccountId(String(mine[0].id));
    } catch (err) {
      setError(err.message || "Could not load accounts.");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const numericAmount = Number(amount);
    if (!fromAccountId || !toAccountId) {
      setError("Choose a source account and a destination account.");
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }
    if (String(fromAccountId) === String(toAccountId)) {
      setError("Source and destination accounts must be different.");
      return;
    }

    setSubmitting(true);
    try {
      await createTransfer(Number(fromAccountId), Number(toAccountId), numericAmount);
      setSuccess(`Transferred ₹${numericAmount.toFixed(2)} successfully.`);
      setToAccountId("");
      setAmount("");
      await load(); // refresh balances
    } catch (err) {
      setError(err.message || "Transfer failed.");
    } finally {
      setSubmitting(false);
    }
  }

  // Don't let someone pick their own account as the recipient in the dropdown.
  const recipientOptions = allAccounts.filter((acc) => String(acc.id) !== String(fromAccountId));

  if (loading) return <LoadingSpinner label="Loading accounts..." />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Transfer Money</h1>
      </div>

      <StatusMessage type="error">{error}</StatusMessage>
      <StatusMessage type="success">{success}</StatusMessage>

      {myAccounts.length === 0 ? (
        <p className="empty-state">You need an account before you can transfer money.</p>
      ) : (
        <form className="form-card" onSubmit={handleSubmit}>
          <label className="field-label">From Account</label>
          <select
            className="text-input"
            value={fromAccountId}
            onChange={(e) => {
              setFromAccountId(e.target.value);
              if (e.target.value === toAccountId) setToAccountId("");
            }}
          >
            {myAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.accountNumber} — ₹{acc.balance.toFixed(2)}
              </option>
            ))}
          </select>

          <label className="field-label">To Account</label>
          {recipientOptions.length === 0 ? (
            <p className="field-hint">No other accounts exist yet to transfer to.</p>
          ) : (
            <select
              className="text-input"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
            >
              <option value="">Select a recipient...</option>
              {recipientOptions.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountNumber} — {acc.accountHolderName} (ID: {acc.id})
                </option>
              ))}
            </select>
          )}

          <label className="field-label">Amount (₹)</label>
          <input
            className="text-input"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />

          <button className="primary-btn" type="submit" disabled={submitting}>
            <Send size={16} />
            {submitting ? "Sending..." : "Send Transfer"}
          </button>
        </form>
      )}
    </div>
  );
}
