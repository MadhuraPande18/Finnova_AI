import { useEffect, useState, useCallback } from "react";
import { Receipt } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMyAccounts } from "../api/accounts";
import { makePayment, getAllPayments } from "../api/payments";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusMessage from "../components/StatusMessage";

export default function PayBills() {
  const { username } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [billerName, setBillerName] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const myAccounts = await getMyAccounts(username);
      setAccounts(myAccounts);
      if (myAccounts.length > 0) setAccountId(String(myAccounts[0].id));

      const accountIds = new Set(myAccounts.map((a) => a.id));
      const allPayments = await getAllPayments().catch(() => []);
      setHistory(allPayments.filter((p) => accountIds.has(p.accountId)));
    } catch (err) {
      setError(err.message || "Could not load account data.");
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
    if (!accountId || !billerName.trim() || !billNumber.trim()) {
      setError("Fill in the account, biller name, and bill number.");
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }

    setSubmitting(true);
    try {
      await makePayment(Number(accountId), billerName.trim(), billNumber.trim(), numericAmount);
      setSuccess(`Paid ₹${numericAmount.toFixed(2)} to ${billerName}.`);
      setBillerName("");
      setBillNumber("");
      setAmount("");
      await load();
    } catch (err) {
      setError(err.message || "Payment failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading..." />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Pay Bills</h1>
      </div>

      <StatusMessage type="error">{error}</StatusMessage>
      <StatusMessage type="success">{success}</StatusMessage>

      {accounts.length === 0 ? (
        <p className="empty-state">You need an account before you can pay a bill.</p>
      ) : (
        <form className="form-card" onSubmit={handleSubmit}>
          <label className="field-label">Pay From</label>
          <select className="text-input" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.accountNumber} — ₹{acc.balance.toFixed(2)}
              </option>
            ))}
          </select>

          <label className="field-label">Biller Name</label>
          <input
            className="text-input"
            value={billerName}
            onChange={(e) => setBillerName(e.target.value)}
            placeholder="e.g. State Electricity Board"
          />

          <label className="field-label">Bill / Consumer Number</label>
          <input
            className="text-input"
            value={billNumber}
            onChange={(e) => setBillNumber(e.target.value)}
            placeholder="Bill reference number"
          />

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
            <Receipt size={16} />
            {submitting ? "Paying..." : "Pay Bill"}
          </button>
        </form>
      )}

      <h2 className="section-title">Payment History</h2>
      {history.length === 0 ? (
        <p className="empty-state">No bill payments yet.</p>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Biller</th>
                <th>Bill Number</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((p) => (
                <tr key={p.id}>
                  <td>{p.billerName}</td>
                  <td>{p.billNumber}</td>
                  <td className="amount-cell">₹ {p.amount.toFixed(2)}</td>
                  <td>
                    <span className={`status-pill ${p.status === "SUCCESS" ? "ok" : "bad"}`}>
                      {p.status}
                    </span>
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
