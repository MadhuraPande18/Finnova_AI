import { api } from "./client";

export function register(username, password) {
  return api.post("/auth/register", { username, password }, { auth: false });
}

export function login(username, password) {
  return api.post("/auth/login", { username, password }, { auth: false });
}
