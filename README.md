# Smart AI Banking System

Microservices-based Internet Banking project with an AI assistant (RAG over Ollama).

## Services

| Service                 | Port | Needs MySQL DB    |
|--------------------------|-----:|--------------------|
| Eureka Service Registry  | 8761 | no                |
| Auth Service             | 8084 | `auth_service`    |
| Core Banking Service     | 8080 | `core_banking`    |
| User Service             | 8081 | `user_service`    |
| Fund Transfer Service    | 8082 | `fund_transfer`   |
| Utility Payment Service  | 8083 | `utility_payment` |
| AI RAG Service           | 8086 | no (needs Ollama) |
| API Gateway              | 8085 | no (entry point)  |
| Frontend (Vite + React)  | 5173 | -                 |

The frontend only ever calls the **API Gateway** (`http://localhost:8085`). Every
other service is internal.

## API Gateway routes

- `/auth/**` -> Auth Service
- `/users/**` -> User Service
- `/accounts/**` -> Core Banking Service
- `/transfers/**` -> Fund Transfer Service
- `/payments/**` -> Utility Payment Service
- `/ai/**` -> AI RAG Service

CORS for the frontend origin is handled centrally in the gateway
(`api-gateway/.../config/CorsConfig.java`) — no other service needs it.

## Running it

1. Start MySQL, then run `create-databases.bat` (creates all 5 databases,
   including `auth_service`).
2. (Optional, for the AI assistant) install and run [Ollama](https://ollama.com)
   locally with the `qwen3:1.7b` and `nomic-embed-text` models pulled. Every
   other feature works without this.
3. Run `start-all.bat`. It starts Eureka first, waits, then starts every
   other backend service, then the gateway last.
4. `cd smart-bank-frontend && npm install && npm run dev` — opens on
   `http://localhost:5173`.
5. Register a new user in the UI. This creates a real login **and** a real
   zero-balance bank account for them (see `AuthController.register`) —
   nothing in the frontend is hardcoded or mocked.

See `CHANGES.md` for a full list of what was fixed and why, and
`VERIFICATION.md` for exactly what was tested versus what still needs a
local run.
