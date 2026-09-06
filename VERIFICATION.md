# VERIFICATION.md — What Was Actually Tested

Being upfront about the sandbox this work was done in: it has **no access
to Maven Central / the Gradle plugin portal, no MySQL server, and no
Ollama**. That means the 8 Spring Boot services could not be compiled or
run end-to-end in the sandbox itself. Everything below states plainly what
was verified where, and by whom.

## Verified by an actual run on the target machine (Windows, real MySQL)

This project has since been compiled and run for real, and the following
is confirmed working as of this package:

- `gradlew.bat compileJava` succeeds on all 5 edited backend services.
- `create-databases.bat` creates all 5 databases including `auth_service`.
- `start-all.bat` starts all 8 services; 6 of 7 client services (everything
  except `ai-rag-service`, which needs Ollama — see below) register with
  Eureka and show `UP` at `http://localhost:8761`.
- Registration and login work end-to-end, including the auto-provisioned
  zero-balance account (this specifically proves the
  `auth-service -> core-banking-service` Feign call works).
- The "Add Money" deposit feature works from the Accounts page.
- Pay Bills / Transfer correctly **reject** payments/transfers against
  insufficient balance with a real, readable error message (not a silent
  success, not a generic unlabeled 400).
- `ai-rag-service` does not register with Eureka without Ollama running
  locally — confirmed expected, not a bug; every other feature is
  unaffected.

## Verified in the original build sandbox (no live backend available there)

- Every backend file was read in full before editing — the fixes are based
  on the real code, not the task description.
- Frontend: `npm install`, `npm run build` (Vite), and `npx oxlint` all
  pass with 0 errors on every round of changes, including after the
  "Add Money" feature was added. The production bundle was served and its
  JS checked for valid syntax.

## Still to verify on your machine

- **Full transfer happy path with real funds**: deposit into one account,
  transfer to a second registered user's account, confirm both balances
  update correctly on refresh.
- **AI Assistant**, if you set up Ollama (`ollama pull qwen3:1.7b` and
  `ollama pull nomic-embed-text`, then restart just the AI RAG service and
  recheck Eureka for `AI-RAG-SERVICE`).
- **Users page** CRUD (add/edit/delete) — straightforward, but not yet
  explicitly confirmed in a real run.

If anything in "still to verify" doesn't behave as described, send the
exact error message or terminal output and it'll get fixed against that,
not guessed at.

