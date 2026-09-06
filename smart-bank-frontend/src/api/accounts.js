import { api } from "./client";

export function getMyAccounts(username) {
  return api.get(`/accounts/user/${encodeURIComponent(username)}`);
}

export function getAccount(id) {
  return api.get(`/accounts/${id}`);
}

export function getAllAccounts() {
  return api.get("/accounts");
}

// Matches core-banking-service's real PUT /accounts/{id}/deposit?amount=
// endpoint — amount is a query param there, not a JSON body.
export function depositToAccount(id, amount) {
  return api.put(`/accounts/${id}/deposit`, undefined, { query: { amount } });
}
