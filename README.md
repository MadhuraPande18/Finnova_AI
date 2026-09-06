# FinnovaAI

A secure, AI-powered internet banking platform built on a real
Spring Boot microservices backend with a React frontend and a
locally-hosted LLM assistant (RAG over Ollama).

Created by **Madhura Pande**.

---

## Overview

FinnovaAI is a full-stack banking system made up of **8 independent
Spring Boot microservices** behind an API Gateway, backed by MySQL, with
service discovery via Eureka and an AI assistant powered by Spring AI +
Ollama. The frontend is a React (Vite) single-page app that talks to the
backend exclusively through the gateway.

Every account, balance, transfer, payment, and AI response in this app is
real and dynamic — nothing is hardcoded or mocked. Registering a user
creates a real login **and** provisions a real zero-balance bank account
for them automatically.

## Features

- **Authentication** — registration and login with BCrypt-hashed
  passwords and JWT-based session tokens
- **Accounts** — live per-user account balances, with an in-app "Add
  Money" action
- **Transfers** — send money between any two accounts in the system,
  picked from a live dropdown (no manual account lookup needed)
- **Bill payments** — pay a biller from any of your accounts, with full
  payment history
- **Money-integrity guarantees** — a transfer or payment can never
  silently succeed against insufficient funds; a failed second leg of a
  transfer automatically refunds the first
- **AI Assistant** — a RAG-based chat assistant (via Spring AI + Ollama)
  that answers questions about your own account only, using a live data
  snapshot fetched fresh on every question — never another user's data,
  and never a stale answer

## Architecture

| # | Service | Port | Depends on |
|---|---------|-----:|------------|
| 1 | Eureka Service Registry | 8761 | — |
| 2 | Auth Service | 8084 | MySQL (`auth_service`), Eureka |
| 3 | Core Banking Service | 8080 | MySQL (`core_banking`), Eureka |
| 4 | User Service | 8081 | MySQL (`user_service`), Eureka |
| 5 | Fund Transfer Service | 8082 | MySQL (`fund_transfer`), Eureka, Core Banking |
| 6 | Utility Payment Service | 8083 | MySQL (`utility_payment`), Eureka, Core Banking |
| 7 | AI RAG Service | 8086 | Eureka, Core Banking, Ollama |
| 8 | API Gateway | 8085 | Eureka |
| — | Frontend (React + Vite) | 5173 | API Gateway only |

The frontend **only ever calls the API Gateway** (`http://localhost:8085`).
No other service is ever called directly from the browser — CORS, auth,
and routing are all handled centrally in the gateway.

### API Gateway routes

| Path | Routed to |
|------|-----------|
| `/auth/**` | Auth Service |
| `/users/**` | User Service |
| `/accounts/**` | Core Banking Service |
| `/transfers/**` | Fund Transfer Service |
| `/payments/**` | Utility Payment Service |
| `/ai/**` | AI RAG Service |

## Tech stack

**Backend:** Java 21, Spring Boot 4, Spring Cloud (Eureka, Gateway,
OpenFeign), Spring Security, Spring Data JPA, Spring AI, JWT (JJWT),
BCrypt, Gradle

**AI:** Ollama running `qwen3:1.7b` (chat) and `nomic-embed-text`
(embeddings), Spring AI's vector store for RAG

**Database:** MySQL 8 (Postgres also supported — see
[Environment variables](#environment-variables))

**Frontend:** React 19, Vite, plain CSS (no UI framework), state-based
routing (no router dependency)

**Containerization:** Docker + Docker Compose (see `DEPLOYMENT.md`)

## Prerequisites

Install these before running anything:

| Requirement | Version | Needed for |
|---|---|---|
| **JDK** | 21 | All 8 backend services (each has its own Gradle wrapper — no separate Gradle install needed) |
| **MySQL** | 8.x | All services except Eureka, API Gateway, and AI RAG |
| **Node.js** | 20+ (22 LTS recommended) | Frontend |
| **Ollama** | latest | *Optional* — only the AI Assistant feature needs this; everything else works without it |

Everything else (Gradle itself, all Java/npm dependencies) is fetched
automatically the first time each service builds.

## Quick start (Windows)

1. **Start MySQL**, then run:
   ```
   create-databases.bat
   ```
   This creates all 5 required databases (enter your MySQL root password
   when prompted).

2. **(Optional, for AI Assistant)** install [Ollama](https://ollama.com),
   then pull the two models this project uses:
   ```
   ollama pull qwen3:1.7b
   ollama pull nomic-embed-text
   ```

3. **Run everything with one command:**
   ```
   start-all.bat
   ```
   This launches all 8 backend services and the frontend, each in its own
   terminal window, in the correct dependency order:
   ```
   [1/9] Eureka Service Registry
   [2/9] Auth Service
   [3/9] Core Banking Service
   [4/9] User Service
   [5/9] Fund Transfer Service
   [6/9] Utility Payment Service
        (20s pause — lets core services finish registering with Eureka
         before AI RAG starts, to avoid a startup race)
   [7/9] AI RAG Service
        (10s pause)
   [8/9] API Gateway
   [9/9] Frontend (auto-runs `npm install` on first run only)
   ```

4. Open **http://localhost:5173** and register your first user.

To stop everything cleanly, run `stop-all.bat`.

## Quick start (Docker — cross-platform alternative)

If you're not on Windows, or would rather not run 9 terminal windows:

```
docker compose up --build
```

Then, first run only:
```
docker compose exec ollama ollama pull qwen3:1.7b
docker compose exec ollama ollama pull nomic-embed-text
```

Open **http://localhost:5173**. See `DEPLOYMENT.md` for details on what
this containerizes and how it differs from the native setup.

## Running services individually (manual / debugging)

Each backend service can be run on its own from its own directory:
```
cd <service-directory>
gradlew.bat bootRun
```
Start them in this order: `service-registry` → the 5 database-backed
services (any order) → `ai-rag-service/ai-rag-service` → `api-gateway`
last. For the frontend:
```
cd smart-bank-frontend
npm install
npm run dev
```

## Environment variables

Every service falls back to its original local defaults if these aren't
set, so none of this is required for local development — it exists for
container/cloud deployment (see `DEPLOYMENT.md`).

| Variable | Used by | Default |
|---|---|---|
| `SERVER_PORT` | every service | each service's fixed port above |
| `EUREKA_URL` | every service except Eureka itself | `http://localhost:8761/eureka/` |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | the 5 database-backed services | `jdbc:mysql://localhost:3306/<db_name>`, `root`, `root` |
| `DDL_AUTO`, `SHOW_SQL` | the 5 database-backed services | `update`, `true` |
| `OLLAMA_BASE_URL`, `OLLAMA_CHAT_MODEL`, `OLLAMA_EMBED_MODEL` | AI RAG Service | `http://localhost:11434`, `qwen3:1.7b`, `nomic-embed-text` |
| `CORS_ALLOWED_ORIGINS` | API Gateway | `http://localhost:5173,http://127.0.0.1:5173` |
| `VITE_API_BASE_URL` | Frontend (build-time only) | `http://localhost:8085` |

`DB_URL` accepts either a MySQL or Postgres connection string — both
JDBC drivers are included, and Spring Boot auto-detects which to use.

## Project structure

```
Smart-AI-Banking-System/
├── service-registry/            Eureka server
├── api-gateway/                 Single entry point, JWT check, CORS, routing
├── auth-service-fixed/
│   └── auth-service/            Registration, login, JWT issuing
├── core-banking-service/        Accounts (balances, deposits, withdrawals)
├── user-service/                Generic user directory
├── fund-transfer-service/       Account-to-account transfers
├── utility-payment-service/     Bill payments
├── ai-rag-service/
│   └── ai-rag-service/          RAG chat assistant (Spring AI + Ollama)
├── smart-bank-frontend/         React + Vite frontend
├── docker/mysql-init/           DB init script for the Docker setup
├── docker-compose.yml           Full stack, containerized, for local testing
├── start-all.bat / stop-all.bat Windows one-command run scripts
├── create-databases.bat         One-time MySQL database setup
├── CHANGES.md                   Full history of fixes made and why
├── VERIFICATION.md              What's been tested vs. what hasn't
└── DEPLOYMENT.md                Containerization & cloud deployment notes
```

## Troubleshooting

A few real issues that came up during development, in case they recur:

- **AI RAG service fails to start only via `start-all.bat`, but works
  fine run manually:** almost always a leftover process from a previous
  run still holding port 8086. Close all old terminal windows before
  starting fresh, or check with `netstat -ano | findstr :8086` (Windows)
  and end that process.
- **Registration/login returns a bare 403:** make sure
  `auth-service`'s `SecurityConfig` permits all requests
  (`.anyRequest().permitAll()`) — an overly-restrictive rule here trips
  Spring Security's default 403 entry point even for endpoints meant to
  be public.
- **A transfer/payment fails with a generic "Request failed with status
  400" instead of a real reason:** make sure
  `server.error.include-message=always` is set — without it, Spring Boot
  strips the actual error message from the response by default.
- **AI Assistant says it's unavailable:** confirm Ollama is running
  (`ollama list` should show both required models) and that
  `AI-RAG-SERVICE` appears in the Eureka dashboard at
  `http://localhost:8761`.

## Author

**Madhura Pande**
