import { api } from "./client";

export function makePayment(accountId, billerName, billNumber, amount) {
  return api.post("/payments", { accountId, billerName, billNumber, amount });
}

export function getAllPayments() {
  return api.get("/payments");
}
