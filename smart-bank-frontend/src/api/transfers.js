import { api } from "./client";

export function createTransfer(fromAccountId, toAccountId, amount) {
  return api.post("/transfers", { fromAccountId, toAccountId, amount });
}

export function getAllTransfers() {
  return api.get("/transfers");
}
