---
title: "Security"
description: "Security architecture and practices in the Fred Python backend"
summary: "End-to-end auth with Keycloak, RBAC, secure WebSockets, and resilient MCP over FastAPI."
date: 2025-08-27T13:25:00+02:00
lastmod: 2025-08-27T13:25:00+02:00
draft: false
weight: 910
toc: true
seo:
  title: "Security"
  description: "Keycloak OIDC, RBAC, WebSocket security, and secure MCP integration via FastAPI and service-to-service auth"
---

> Fred is a reference implementation. Treat it as a **security-conscious starter** you can adapt to your needs.

## At a glance

| Security Feature | What it covers | How we do it |
|---|---|---|
| **Authentication (UI → Backend)** | User identity & session | Keycloak (OIDC). UI obtains a bearer; backend verifies JWT per request. |
| **RBAC** | Who can do what | Role checks on every protected route (Admin / Editor / Viewer by default). |
| **WebSocket Security** | Real-time chat sessions | Token required on connect; sessions bound to user; server validates periodically. |
| **Session Isolation** | Data boundaries | Users can access **only their own** conversations / artifacts. |
| **Audit Logging** | Traceability | Key actions (uploads, deletions, tool calls, errors) are logged with user context. |
| **Service-to-Service Auth** | Agentic → Knowledge Flow | Keycloak client-credentials (service account). Short-lived tokens minted on demand. |
| **MCP Tool Auth** | Agent ↔ MCP servers (FastAPI/HTTP/stdio) | Outbound bearer injection (HTTP `Authorization` or stdio env). Auto-refresh on 401. |
| **Transport Types** | sse / streamable_http / websocket / stdio | Only these are allowed. Others are rejected at config-load time. |
| **Resilience** | Transient failures | Timeouts/401s trigger MCP refresh; graph remains valid via fallback ToolMessages. |
| **Secrets Handling** | No hardcoding | Secrets via env or K8s secrets; no secrets in code or logs. |
| **TLS** | In-cluster & external | HTTPS recommended everywhere; dev can relax verification, prod must verify CA. |

---

## Authentication with Keycloak (OIDC)

**Flow (UI → Backend):**

1. UI redirects the user to Keycloak.
2. On success, UI gets an **access token (JWT)**.
3. All API/WebSocket calls include `Authorization: Bearer <jwt>`.
4. Backend verifies signature & claims against the realm JWKS and extracts roles.

**Default roles (example):**

- **Admin** — full access (upload/delete docs, manage agents, settings)
- **Editor** — can modify content, cannot delete critical data
- **Viewer** — read-only; interact with chatbots, no destructive ops

> You can tune roles & permissions in your realm, and map them to Fred’s endpoints.

---

## Backend RBAC & Isolation

- Every protected route uses role checks.
- Per-user scoping for conversations/history.
- Audit logs include user ID, route, method, and outcome.
- Least privilege defaults: destructive actions are Admin-only.

---

## Secure WebSockets

- Clients must present a valid bearer at connect time.
- The connection is **bound to the authenticated user**.
- Server enforces per-session rate limits and size limits.
- Optionally re-checks token validity for long-lived sessions.

---

## Service-to-Service (Agentic → Knowledge Flow)

**Goal:** Allow the **Agentic backend** to call **Knowledge Flow** securely.

- Use **Keycloak client-credentials** (service account) for the *caller* client (e.g., `agentic`).
- Knowledge Flow validates incoming JWTs against the **same realm** (audience/clients as configured).
- Tokens are **short-lived** and minted on demand; **no static long-lived tokens in code**.

### In-process ASGI client (FastAPI → FastAPI)

The Knowledge Flow service exposes an **internal ASGI client** to call itself or other internal FastAPI apps without hitting the network:

- If a **user bearer** is available: **propagate** it (keeps end-user identity & audit).
- Otherwise: use a **service bearer** from a **token provider** (client-credentials grant).

This lives in an application-scoped helper (e.g., `application_state`):

- Builds a shared `httpx.AsyncClient` bound to the app via ASGI.
- Auth attached via a **B2B bearer auth** layer (token provider).
- Clean shutdown closes the shared client.

**Why this matters:**

- Avoids `401` loops on internal hops.
- Keeps consistent auth (user → service fallback).
- No ad-hoc `requests` sprinkled across the codebase.

---

## MCP security model (FastAPI servers)

Many MCP servers here are **FastAPI** apps (e.g., Knowledge Flow’s MCP endpoints). We secure them as normal HTTP APIs:

- **HTTP transports** (`sse`, `streamable_http`, `websocket`):
  - Outbound calls include `Authorization: Bearer <token>`.
  - Knowledge Flow validates JWT and applies RBAC.
- **stdio transport**:
  - No headers possible; we inject the bearer into the process **environment** as:
    - `MCP_AUTHORIZATION`
    - `AUTHORIZATION`

### Outbound auth injection

The agent runtime sets auth from a single place:

- A token provider mints short-lived tokens (Keycloak client-credentials).
- `MCPRuntime` and `get_mcp_client_for_agent(...)` **inject headers/env** automatically based on transport.
- On **401**, we **refresh** once and retry.
- If still failing, the tools node **yields fallback ToolMessages** so the graph remains valid (no “dangling tool_calls” 400).

**Supported transports (enforced):** `sse`, `streamable_http`, `websocket`, `stdio`.

Unsupported transports are **rejected at load time** to avoid silent misconfigurations.

---

## Resilience: why tool calls don’t break your graph

We use a **resilient tools node** in the LangGraph:

- If a call **times out** or returns **401**, we:
  - Log the failure with context (URL, tool name, status).
  - **Refresh** the MCP client+toolkit atomically.
  - **Emit a ToolMessage per pending tool_call** with a short note like `[tool_unavailable] refreshed; please retry`.
- The LLM can then **reply normally** (no 400 “assistant tool_calls without tool responses”).
- On the user’s **next turn**, tools are already **freshly bound**, and calls succeed.

---

## Secrets & tokens

- **Never** hardcode secrets in code. Use **env vars** or K8s **Secrets** (mounted).
- Prefer **client-credentials** (**client ID + secret**) to mint **short-lived** tokens at runtime.
- If you must use a **static bearer** in dev, isolate via `*_STATIC_BEARER` and gate behind `ENV=dev`.
- Don’t log full tokens. If you must log, show a short prefix (e.g., `present:Bearer abcd1234…`).

---

## TLS and HTTP hardening

- Use HTTPS for all inter-service calls (even in-cluster if possible).
- Provide CA bundles for internal certs; avoid blanket `verify=False` outside dev.
- Enforce CORS rules for UI domains.
- Apply request size limits and rate limits where appropriate.

---

## Operational checks (what to verify)

- **Curl test** (Agentic → Knowledge Flow) using a minted client-credentials token returns **200**; without bearer returns **401**.
- WebSocket connects are rejected without a valid bearer.
- MCP calls to Knowledge Flow endpoints fail with **401** if bearer missing/invalid.
- **401** during a tool call triggers a **refresh** and fallback ToolMessages (no dropped conversations).
- Logs show **MCP snapshots** before/after refresh with **tool bindings**.

---

## Configuration cheat sheet (example)

> Actual names may vary in your deployment; keep secrets in K8s Secrets or `.env` (dev only).

| Variable | Purpose |
|---|---|
| `KEYCLOAK_REALM_URL` | Realm base URL (e.g., `https://keycloak/realms/app`). |
| `KEYCLOAK_AGENTIC_CLIENT_ID` | Confidential client ID for the *caller* (e.g., `agentic`). |
| `KEYCLOAK_AGENTIC_CLIENT_SECRET` | Secret for client-credentials (mint service tokens). |
| `KEYCLOAK_AUDIENCE` | Optional audience settings if you validate `aud`. |
| `ENV` | `dev` / `staging` / `prod` for behavior toggles (e.g., static bearer allowed only in `dev`). |

> For Knowledge Flow itself, you typically **don’t** need a client secret; it validates incoming JWTs using the realm JWKS. Only the **caller** (Agentic) needs a secret to mint tokens.

---

## Developer ergonomics

- **Single place to manage MCP auth**: `get_mcp_client_for_agent(...)` + `MCPRuntime` handle tokens/headers/env.
- **Resilient by default**: `make_resilient_tools_node(...)` keeps the graph healthy.
- **Context-aware tools**: `McpToolkit` injects runtime context automatically (e.g., tenant/library).
- **Clean logging**: snapshots print client/toolkit IDs and bound tool names.

---

## FAQ

**Why am I seeing `401 Unauthorized` on the first tool call after being idle?**  
Tokens expire. The tools node refreshes and yields ToolMessages. Ask again—fresh bindings will be used.

**Can I use static tokens from Keycloak admin UI?**  
Only for **dev**. For **prod**, always use **client-credentials** (short-lived tokens), supplied via a provider that reads `KEYCLOAK_AGENTIC_CLIENT_ID/SECRET`.

**Do I need a “knowledge” client secret?**  
No. Knowledge Flow validates **incoming** tokens. The **caller** (Agentic) mints them using its secret.

---

## Summary

Fred ships with a **defense-in-depth** stance:

- Strong identity via Keycloak (UI + service-to-service).
- RBAC on every sensitive route.
- Secure WebSockets.
- **MCP over FastAPI** with proper bearer injection and automatic refresh.
- Resilient tool execution that keeps the chat graph intact.
- No secrets in code; TLS by default in prod.

This makes the “secure by default” path the **easy** path—so you can focus on building great experts.
