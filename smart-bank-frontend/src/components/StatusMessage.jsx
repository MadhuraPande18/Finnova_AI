export default function StatusMessage({ type = "error", children }) {
  if (!children) return null;
  return <div className={`status-banner status-${type}`}>{children}</div>;
}
