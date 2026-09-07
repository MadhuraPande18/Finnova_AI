# FinnovaAI

A secure, AI-powered internet banking platform built on a real Spring
Boot microservices backend, a React frontend, and a locally-hosted LLM
assistant (RAG over Ollama).

![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4-brightgreen)
![Spring Cloud](https://img.shields.io/badge/Spring%20Cloud-Eureka%20%7C%20Gateway-brightgreen)
![React](https://img.shields.io/badge/React-19-61DAFB)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)
![Ollama](https://img.shields.io/badge/AI-Spring%20AI%20%2B%20Ollama-purple)

Created by **Madhura Pande**.

🔗 **Live demo:** _add your deployed URL here_
💻 **Repo:** https://github.com/MadhuraPande18/Finnova_AI

---

## Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Features](#features)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick start (Windows)](#quick-start-windows)
- [Quick start (Docker)](#quick-start-docker--cross-platform-alternative)
- [Deploying it yourself](#deploying-it-yourself)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Documentation index](#documentation-index)

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

## Screenshots

> _Add screenshots here — dashboard, transfer flow, and the AI assistant
> answering a live balance question all make good ones._

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
(embeddings), Spring AI's vector store for RAG, with live account data
fetched fresh on every question rather than relying on the vector
store's startup snapshot

**Database:** MySQL 8 (Postgres also supported — see
[Environment variables](#environment-variables))

**Frontend:** React 19, Vite, plain CSS (no UI framework), state-based
routing (no router dependency)

**Deployment:** Docker (every service containerized), Docker Compose for
local orchestration, Caddy for automatic HTTPS on a VPS deployment

## Prerequisites

Install these before running anything natively (skip all of this if
you're using the [Docker path](#quick-start-docker--cross-platform-alternative) instead):

| Requirement | Version | Needed for |
|---|---|---|
| **JDK** | 21 | All 8 backend services (each has its own Gradle wrapper — no separate Gradle install needed) |
| **MySQL** | 8.x | All services except Eureka, API Gateway, and AI RAG |
| **Node.js** | 20+ (22 LTS recommended) | Frontend |
| **Ollama** | latest | *Optional* — only the AI Assistant feature needs this; everything else works without it |

## Quick start (Windows)

 **Run everything with one command:**
   ```
   start-all.bat
 
Open **http://localhost:5173**.

## Deploying it yourself

This repo includes everything needed to actually put FinnovaAI online:

- **`docker-compose.prod.yml` + `Caddyfile`** — the recommended path: a
  single VPS (a free Oracle Cloud instance works), Docker Compose, and
  Caddy in front for automatic free HTTPS via a domain of your choice
  (a free [DuckDNS](https://www.duckdns.org) subdomain works fine). Full
  walkthrough in **`DEPLOYMENT-VPS.md`**.
- **`render.yaml`** — a Render Blueprint, kept for reference. Not
  recommended for this project specifically: Render's free tier can't
  run this architecture at all (services can't receive private-network
  traffic on free tier), and the paid tier costs real money across 8+
  billed services. See `DEPLOYMENT.md` for details either way.

## Environment variables

Every service falls back to its original local defaults if these aren't
set, so none of this is required for local development — it exists for
container/cloud deployment.

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
├── docker-compose.prod.yml      Production variant for a real VPS (Caddy, no exposed DB/AI ports)
├── Caddyfile                    Single-domain HTTPS routing for the VPS deployment
├── render.yaml                  Render Blueprint (reference only - see Deploying it yourself)
├── start-all.bat / stop-all.bat Windows one-command run scripts
├── create-databases.bat         One-time MySQL database setup
├── CHANGES.md                   Full history of fixes made and why
├── VERIFICATION.md              What's been tested vs. what hasn't
├── DEPLOYMENT.md                Containerization & Render/Vercel notes
└── DEPLOYMENT-VPS.md            Step-by-step VPS + Caddy deployment guide
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
**##Images**

<img width="1857" height="912" alt="Screenshot 2026-09-07 005430" src="https://github.com/user-attachments/assets/d63274e5-75d9-4bc3-9768-69702c34ef83" />

<img width="1916" height="1030" alt="Screenshot 2026-09-07 005951" src="https://github.com/user-attachments/assets/970f5475-21a1-4d01-9c10-881a0e523adf" />

<img width="1066" height="913" alt="Screenshot 2026-09-07 005112" src="https://github.com/user-attachments/assets/df44a986-6c00-4e59-a4be-00d9433f6616" />
<img width="1892" height="905" alt="Screenshot 2026-09-07 005639" src="https://github.com/user-attachments/assets/f9086096-9ab7-4bd6-ad68-cbee654f0044" />

<img width="796" height="555" alt="Screenshot 2026-09-07 003001" src="https://github.com/user-attachments/assets/9f206386-ee22-4a2c-8686-03ec9c25a0fd" />

<img width="847" height="897" alt="Screenshot 2026-09-07 004932" src="https://github.com/user-attachments/assets/c20de487-d37c-451f-9882-cabae924d5f1" />

<img width="755" height="830" alt="Screenshot 2026-09-07 004727" src="https://github.com/user-attachments/assets/12d37bcc-430a-44b8-9ac9-2a30d04af849" />



## Documentation index

| File | What it covers |
|---|---|
| `CHANGES.md` | Every bug found and fixed, with the reasoning behind each |
| `VERIFICATION.md` | What's been tested end-to-end vs. what hasn't |
| `DEPLOYMENT.md` | Docker containerization details + the Render/Vercel exploration |
| `DEPLOYMENT-VPS.md` | The recommended deployment path: VPS + Docker Compose + Caddy |

## Author

**Madhura Pande**

_Built with [Claude](https://claude.com) as an AI pair-programmer —
architecture decisions, debugging, and every fix were driven and
reviewed by me; Claude helped me move faster and understand failures
more deeply than I would have working alone._
