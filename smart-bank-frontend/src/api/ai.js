import { api } from "./client";

// ai-rag-service depends on Ollama running locally. If Ollama isn't
// installed/running, this call will fail — the UI shows that clearly
// instead of pretending the assistant is always available.
// username is passed as a real parameter (not baked into the question
// text) so the backend can scope live account data to this user only —
// see AiSearchService.askWithRag on the server for why that matters.
export function askRag(question, username) {
  return api.get("/ai/rag", { query: { question, username } });
}

export function askChat(question) {
  return api.get("/ai/chat", { query: { question } });
}
