// Every request goes through the API Gateway (port 8085) — the frontend
// never talks to an individual microservice's port directly. That's what
// makes CORS, auth, and routing only need to be handled in one place.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8085";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function getToken() {
  return localStorage.getItem("smartbank_token");
}

async function request(path, { method = "GET", body, auth = true, query } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (!token) {
      throw new ApiError("Not logged in", 401);
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  let url = `${API_BASE_URL}${path}`;
  if (query) {
    const params = new URLSearchParams(query);
    url += `?${params.toString()}`;
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      `Could not reach the API Gateway at ${API_BASE_URL}. Is it running?`,
      0
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && payload.message) ||
      (typeof payload === "string" && payload) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return payload;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  del: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};

export { API_BASE_URL };
