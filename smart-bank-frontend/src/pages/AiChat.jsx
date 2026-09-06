import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, AlertTriangle } from "lucide-react";
import { askRag } from "../api/ai";
import { useAuth } from "../context/AuthContext";

export default function AiChat() {
  const { username } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your FinnovaAI assistant. Ask me about your accounts, balances, or transfers.",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [serviceDown, setServiceDown] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const q = question.trim();
    if (!q || sending) return;

    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setSending(true);

    try {
      // username is sent as a real parameter, not baked into the visible
      // question text — the backend uses it to scope account data so one
      // user's balance can never leak into another user's chat.
      const answer = await askRag(q, username);
      setServiceDown(false);
      setMessages((prev) => [...prev, { role: "assistant", text: String(answer) }]);
    } catch (err) {
      // ai-rag-service needs Ollama running locally. If it's down, say so
      // plainly instead of pretending the assistant answered.
      setServiceDown(true);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            err.status === 0
              ? "I can't reach the AI service right now — check that the API Gateway and ai-rag-service are running."
              : `The AI assistant couldn't answer that: ${err.message}. (It needs Ollama running locally.)`,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page chat-page">
      <div className="page-header">
        <h1>AI Assistant</h1>
      </div>

      {serviceDown && (
        <div className="status-banner status-error">
          <AlertTriangle size={16} style={{ marginRight: 6 }} />
          AI service appears unavailable. Make sure ai-rag-service and Ollama are running.
        </div>
      )}

      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble-row ${m.role}`}>
            <div className="chat-avatar">{m.role === "user" ? <User size={16} /> : <Bot size={16} />}</div>
            <div className="chat-bubble">{m.text}</div>
          </div>
        ))}
        {sending && (
          <div className="chat-bubble-row assistant">
            <div className="chat-avatar">
              <Bot size={16} />
            </div>
            <div className="chat-bubble typing">Thinking...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-row" onSubmit={handleSend}>
        <input
          className="text-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about your banking..."
        />
        <button className="primary-btn" type="submit" disabled={sending}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
