# CHANGES.md — Full Fix & Rebuild Log

Everything below was found by reading the actual extracted source code, not
assumed from the original task description. Where the original plan
document was wrong, that's called out explicitly.

## Corrections to the original plan document

- `ai-rag-service`'s `server.port=8086` was **already set** — not missing.
- There is **no `finovaai-frontend`** anywhere in the project. Only
  `smart-bank-frontend` exists, and it contained a broken, half-migrated
  duplicate copy nested inside itself (`smart-bank-frontend/smart-bank-frontend/`)
  that imported `react-router-dom` — a package not even listed in its
  `package.json` — and referenced `./pages/Login` while the actual file on
  disk was `login.jsx` (case mismatch). That duplicate folder has been
  deleted; the real frontend now lives at `smart-bank-frontend/`.

## Backend fixes

### api-gateway
- **Added the missing `/auth/**` route** (`application.properties`) — this
  was the confirmed root cause of the frontend never being able to reach
  `/auth/login` or `/auth/register`.
- **Added `config/CorsConfig.java`** — a single, global CORS filter for the
  gateway (allowed origins configurable via `app.cors.allowed-origins`).
  This is the only place CORS is configured; no other service needed it
  since the frontend never calls them directly.
- **`JwtAuthenticationFilter`**: now lets `OPTIONS` preflight requests
  through before checking for a JWT. Without this, every cross-origin
  browser preflight to a protected route would get a 401 and the CORS
  headers would never even be returned.

### auth-service
- **Passwords were stored and compared in plain text.** Added a
  `PasswordEncoder` (`BCryptPasswordEncoder`) bean and used it for both
  register and login.
- **Registration never created a bank account.** Added a Feign client
  (`AccountClient`) and `@EnableFeignClients`; `register()` now provisions a
  real zero-balance account in `core-banking-service` for every new user.
  If `core-banking-service` happens to be down, registration still
  succeeds (the failure is logged, not thrown) rather than blocking signup.
  Added `spring-cloud-starter-openfeign` to `build.gradle` for this.
- Register/login now return proper JSON (`{ "token": ..., "username": ... }`
  / `{ "message": ... }` on error) with correct HTTP status codes (400/401/409)
  instead of plain strings like `"User not found"` with a 200 status.

### core-banking-service
- **`Account` had no link to a user at all.** There was no `username` (or
  any other owner) field, so there was no way to ever answer "which
  accounts belong to the person who just logged in" without hardcoding or
  showing everyone's accounts. Added a `username` field, a
  `findByUsername` repository method, and a `GET /accounts/user/{username}`
  endpoint — this is what the dashboard now actually uses.
- **`withdraw()`/`deposit()` silently returned `null` on failure** (e.g.
  insufficient balance, bad account id) instead of signaling an error. Both
  now throw `ResponseStatusException` (404/400) instead.
- `createAccount()` now auto-generates an account number when the caller
  doesn't supply one (used by auth-service's auto-provisioning).

### fund-transfer-service / utility-payment-service
- **Real money-integrity bug**: the return value of `accountClient.withdraw()`
  was ignored. Since `core-banking-service` used to fail silently (see
  above), a transfer or bill payment was recorded as successful **even when
  the debit never happened**. Now that `core-banking-service` throws on
  failure, both services catch the resulting `FeignException` and:
  - return a proper `400` with a clear message instead of a generic `500`
  - for transfers specifically: if the debit succeeded but the credit to
    the destination account fails, the source account is automatically
    refunded so money is never silently lost mid-transfer.
- Added basic input validation (same account for both sides, missing ids).

### Scripts
- `start-all.bat` was missing `auth-service` and `ai-rag-service` entirely
  — two of the eight services could never be started by this script. Both
  are now included, and the gateway is started last (after everything it
  routes to).
- `create-databases.bat` was missing the `auth_service` database.
- `stop-all.bat` updated to also close the two added service windows.

## Frontend — complete rebuild

The old `smart-bank-frontend` had all data hardcoded (fake `accounts`,
`transactions`, `user` objects in `App.jsx`), non-functional
login/register, and an AI chat call that bypassed the gateway and never
sent a JWT. It has been replaced with a genuinely dynamic app:

- **`src/api/`** — one file per backend resource (`auth`, `accounts`,
  `transfers`, `payments`, `users`, `ai`), all going through the gateway at
  `VITE_API_BASE_URL` (defaults to `http://localhost:8085`, overridable via
  `.env`). A shared `client.js` attaches the JWT `Authorization` header and
  normalizes error messages from the backend's actual JSON error shape.
- **`src/context/AuthContext.jsx`** — real login/register/logout backed by
  `/auth/login` and `/auth/register`; token + username persisted in
  `localStorage` so a refresh doesn't log you out.
- **Pages**, each backed by a real endpoint and nothing else:
  - `Login` / `Register`
  - `Dashboard` — total balance and account list from
    `GET /accounts/user/{username}`; recent activity computed from
    `GET /transfers` + `GET /payments`, filtered client-side to the
    accounts the logged-in user actually owns (no per-user filter endpoint
    exists in fund-transfer/utility-payment services, so this is done
    correctly on real data rather than inventing a backend endpoint that
    wasn't asked for)
  - `Accounts` — full account list/detail
  - `Transfer` — `POST /transfers`, source account dropdown built from the
    user's real accounts
  - `PayBills` — `POST /payments` + real payment history
  - `AiChat` — `GET /ai/rag`, with an honest fallback message (not a fake
    canned response) if the AI service or Ollama isn't reachable
  - `Users` — full CRUD against `user-service`
  - `Settings` — shows the actual logged-in username and gateway URL
- **State-based routing** (a `page` string in `App.jsx`, no router
  library) — deliberately avoids the `react-router-dom` dependency problem
  found in the old duplicate folder.
- Removed the duplicate `smart-bank-frontend/smart-bank-frontend/` folder.

No arrays of fake accounts/transactions/users remain anywhere in the
frontend — everything rendered comes from a `fetch` to a real endpoint.

## Round 2 — fixes found by actually running the system

These were found only after the system was compiled and run for real on a
Windows machine (this environment still cannot run the backend, so none of
these would have been caught without that real run — recorded here for
transparency):

- **`start-all.bat`**: the final summary line used a literal `<--` inside
  a plain `echo` statement. `cmd.exe` parses `<` as input redirection even
  inside `echo`, producing a spurious "The system cannot find the file
  specified." message. Purely cosmetic (the gateway had already started by
  that point in the script) but confusing — replaced `<--` with plain
  parentheses.

- **`auth-service` `SecurityConfig`**: registration was failing with a bare
  `403 Forbidden` despite `/auth/register` being explicitly listed in
  `permitAll()`. Root cause: the trailing `.anyRequest().authenticated()`
  rule, combined with Spring Security's default `Http403ForbiddenEntryPoint`
  (no custom entry point was configured), caused a 403 instead of a 401 —
  and in this app's actual filter evaluation, it was catching requests that
  should have hit the `permitAll()` rule first. Since `auth-service` has
  exactly two endpoints and both must be public (the JWT itself is verified
  downstream by the gateway, not here), the fix was to simplify to
  `.anyRequest().permitAll()` entirely rather than trying to out-guess the
  authorization DSL.

- **Hidden error messages on `core-banking-service`, `fund-transfer-service`,
  `utility-payment-service`**: these throw `ResponseStatusException` with a
  specific, useful message (e.g. "Insufficient balance in account 5"), but
  Spring Boot strips the `message` field from the JSON error body by default
  unless `server.error.include-message=always` is set. Without it, the
  frontend could only ever show a generic "Request failed with status 400"
  — technically correct, but useless for telling insufficient-balance apart
  from any other 400. Added `server.error.include-message=always` to all
  three services' `application.properties`.

- **Frontend: added a real "Add Money" feature.** The backend always had
  `PUT /accounts/{id}/deposit`, but nothing in the UI called it — the only
  way to fund an account was a manual `curl` command. Added an inline
  "Add Money" control per account row on the Accounts page
  (`depositToAccount` in `src/api/accounts.js`).

- **Confirmed via a real Eureka dashboard check**: `ai-rag-service` depends
  on Ollama running locally with `qwen3:1.7b` and `nomic-embed-text`
  pulled. Without Ollama, it fails to start and never registers with
  Eureka, so gateway calls to `/ai/**` return `503` (no instance to route
  to) — this is expected, not a bug, and every other feature is unaffected.
