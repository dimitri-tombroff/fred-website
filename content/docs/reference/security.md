---
title: "Security"
description: "Security architecture and practices in the Fred Python backend"
weight: 1000
date: 2025-08-27T12:00:00+02:00
lastmod: 2025-08-27T12:00:00+02:00
draft: false
toc: true
seo:
  title: "" # custom title (optional)
  description: "" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  robots: "" # custom robot tags (optional)
---

> Fred is a reference implementation. Treat it as a **security-conscious starter** you can adapt to your needs.

# Security Overview

This page documents how authentication and authorization flow through the **Agentic** and **Knowledge Flow** services, how our **MCP** integrations are secured, and what operational controls we ship by default.

---

## At a glance

| Security Feature | What it covers | How we do it |
|---|---|---|
| **Authentication (UI → Backend)** | User identity & session | Keycloak (OIDC). UI obtains a bearer; backend verifies JWT per request. |
| **RBAC** | Who can do what | Route-level role checks (Admin/Editor/Viewer planned). Claims read from `resource_access`. |
| **WebSocket Security** | Real-time chat sessions | Token required on connect; session bound to user; periodic validation (configurable). |
| **Session Isolation** | Data boundaries | Users can access **only their own** conversations/artifacts. |
| **Audit Logging** | Traceability | Key actions (uploads, deletions, tool calls, errors) logged with user context. |
| **Service-to-Service Auth** | Agentic → Knowledge Flow | Keycloak **client-credentials** (service accounts). Short-lived tokens minted on demand. |
| **MCP Tool Auth** | Agent ↔ MCP servers (HTTP/stdio) | Outbound bearer injection (HTTP `Authorization` or stdio env). **Auto-refresh** on 401. |
| **Transports** | HTTP(S) & stdio | Only `streamable_http`, `sse`, `websocket`, and `stdio` are allowed. |
| **Resilience** | Transient failures | Timeouts/401s trigger MCP refresh; graph remains valid via fallback ToolMessages. |
| **Secrets Handling** | No hardcoding | Env vars / K8s Secrets; no secrets in code or logs. |
| **TLS** | In-cluster & external | HTTPS recommended everywhere; dev can relax verification, prod should verify CA. |

---

## Identity & Clients (Keycloak)

We use **three distinct clients** to separate concerns:

1. **agentic** — *caller identity for the Agentic backend*  
   - confidential; **Service accounts: ON**  
   - Mints **client-credentials** tokens used to call Knowledge Flow.

2. **knowledge-flow** — *API identity for the Knowledge Flow backend*  
   - confidential; **Service accounts: ON** (so KF can call other services / itself if needed)  
   - Used to validate incoming tokens; also usable as KF’s own service identity for internal calls.

3. **\<your-app-frontend\>** — *end-user application (web / SPA / mobile)*  
   - public (SPA + PKCE) or confidential (server-side)  
   - Used for **user** login; not used for Agentic → KF calls.

**Realm/Issuer example** (the `iss` claim should start with this URL):

    https://auth-<env>.<your-domain>/auth/realms/fred

---

## What’s implemented today

- **JWT validation** in backends:
  - Signature via JWKS (PyJWKClient cache).
  - `exp` enforced; optional clock skew (`FRED_JWT_CLOCK_SKEW`).
  - **Soft** checks for issuer/audience with opt-in strictness (see toggles below).
  - Safe diagnostics (no raw tokens in logs).

- **Service-to-service calls**:
  - **Agentic → Knowledge Flow** uses the `agentic` client (client-credentials grant).
  - Knowledge Flow can also mint a service token when it needs to call out.

- **MCP runtime**:
  - Outbound auth injected automatically:
    - HTTP-like transports → `Authorization: Bearer <token>`.
    - `stdio` → `MCP_AUTHORIZATION` / `AUTHORIZATION` env vars.
  - **401 detection** → token refresh → single retry.
  - **Resilient ToolNode** guarantees a ToolMessage for each tool call (prevents “dangling tool_calls” errors).

- **WebSocket handshake**:
  - Bearer required on connect; session tied to the authenticated user.

---

## Planned hardening (near term)

- **Audience enforcement**: add an **Audience mapper** so Agentic tokens include `knowledge-flow` in `aud`, then set `FRED_STRICT_AUDIENCE=true`.
- **RBAC**: enforce route-level roles from `resource_access['knowledge-flow'].roles` (Admin/Editor/Viewer).
- **Issuer strictness**: set `FRED_STRICT_ISSUER=true` once all environments use the same realm URL shape.

---

## Configuration (env)

### Knowledge Flow (the API being called)

    # JWT validation
    KEYCLOAK_SERVER_URL=https://auth-<env>.<your-domain>
    KEYCLOAK_REALM_NAME=fred
    KEYCLOAK_CLIENT_ID=knowledge-flow

    # Diagnostics & strictness (defaults are permissive to ease rollout)
    FRED_AUTH_VERBOSE=false       # set true temporarily to debug auth issues
    FRED_STRICT_ISSUER=false
    FRED_STRICT_AUDIENCE=false
    FRED_JWT_CLOCK_SKEW=0         # seconds of leeway for exp/nbf

    # Optional: if KF calls other services
    KEYCLOAK_KNOWLEDGE_FLOW_CLIENT_SECRET=<secret of 'knowledge-flow' client>

### Agentic backend (the caller)

    # Mint service tokens to call KF
    KEYCLOAK_SERVER_URL=https://auth-<env>.<your-domain>
    KEYCLOAK_REALM_NAME=fred
    KEYCLOAK_CLIENT_ID=agentic
    KEYCLOAK_AGENTIC_CLIENT_SECRET=<secret of 'agentic' client>

    # Where to reach KF (ingress base)
    KNOWLEDGE_FLOW_BASE=https://<public-host>/knowledge-flow/v1

### Frontend (end-user app)

    OIDC_ISSUER=https://auth-<env>.<your-domain>/auth/realms/fred
    OIDC_CLIENT_ID=<your-app-frontend>
    OIDC_REDIRECT_URI=https://<public-host>/callback
    OIDC_POST_LOGOUT_REDIRECT_URI=https://<public-host>/

---

## MCP security model

Our MCP servers are **FastAPI** apps secured like normal HTTP APIs.

- **HTTP transports** (`streamable_http`, `sse`, `websocket`):
  - Outbound requests include `Authorization: Bearer <token>`.
  - We also send `MCP-Version: 2025-03-26` and `Accept: application/json` for compatibility.
- **stdio transport**:
  - No headers available; we pass the bearer via env (`MCP_AUTHORIZATION`, `AUTHORIZATION`).

**Supported transports**: `streamable_http`, `sse`, `websocket`, `stdio` (others are rejected).

### Resilience: why tool calls don’t break your graph

- On **timeout** / **401** / **closed stream**, the Resilient ToolNode:
  1) Logs structured context (tool, URL, status).
  2) Refreshes the MCP client/toolkit.
  3) Emits **fallback ToolMessages** so the LLM turn remains valid.

This prevents the OpenAI 400 (“assistant message with tool_calls must be followed by tool messages”).

---

## Secure WebSockets

- Require `Authorization: Bearer <jwt>` at connect.
- Bind connection to user identity.
- Optional periodic token re-validation for long-lived sessions.
- Per-session rate/size limits (configurable).

---

## Secrets & TLS

- Secrets come from **env** / **K8s Secrets**; never hardcode.
- Prefer **short-lived** tokens minted with **client-credentials**.
- Don’t log tokens; at most log a small prefix for presence checks.
- Use **HTTPS** everywhere; verify CAs in prod; restrict CORS to known origins.

---

## Verify end-to-end

### 1) Mint a service token as `agentic`

    KC="https://auth-<env>.<your-domain>/auth/realms/fred/protocol/openid-connect/token"
    TOKEN=$(curl -s -X POST "$KC" \
      -d grant_type=client_credentials \
      -d client_id=agentic \
      -d client_secret='<AGENTIC_SECRET>' | jq -r .access_token)

### 2) Call Knowledge Flow (MCP base)

    BASE="https://<public-host>/knowledge-flow/v1/mcp-opensearch-ops"
    curl -v \
      -H "Authorization: Bearer $TOKEN" \
      -H "MCP-Version: 2025-03-26" \
      -H "Accept: application/json" \
      "$BASE"

**Expected:** HTTP 200 with an MCP description payload (you should see `Processing request of type ListToolsRequest` in KF logs).

---

## Operational toggles (summary)

- `FRED_AUTH_VERBOSE=true` — rich, safe diagnostics (JWT header/claims summary; no raw tokens).
- `FRED_STRICT_ISSUER=true` — reject tokens whose `iss` doesn’t match the configured realm URL.
- `FRED_STRICT_AUDIENCE=true` — enforce `aud` to include `knowledge-flow` (configure audience mapper first).
- `FRED_JWT_CLOCK_SKEW=<seconds>` — allow small leeway on `exp`/`nbf`.

---

## FAQ

**Why separate clients for Agentic and Knowledge Flow?**  
Clear audit and scope separation: Agentic **mints** tokens; Knowledge Flow **validates** them and may mint its own for outbound calls.

**Why allow `aud='account'` initially?**  
That’s Keycloak’s default for service tokens. We start permissive (with warnings), then enforce once the audience mapper is in place.

**Can I route via a unified public host?**  
Yes—ingress can route `/knowledge-flow` to the Knowledge Flow service. If you ever observe redirects that alter the host, prefer direct routing to avoid `Authorization` header drops.

---

## Credits

- Keycloak OIDC validation with JWKS cache and safe diagnostics.  
- MCP runtime with outbound auth injection and single-retry on 401.  
- Resilient ToolNode to keep conversations valid under failures.  
- Minimal, auditable surface area for secrets and TLS configuration.
