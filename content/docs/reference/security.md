---
title: "Security"
description: "Security reference for Fred deployments (identity, authorization, service boundaries, secrets, and operational controls)."
summary: "Short security reference for DSI/RSSI, platform, and run teams."
date: 2026-03-05T12:00:00+01:00
lastmod: 2026-03-05T12:00:00+01:00
draft: false
weight: 914
toc: true
seo:
  title: "Fred Security Reference"
  description: "Security model and operator controls for Fred deployments."
  canonical: ""
  robots: ""
---

This page is intentionally concise and stable.
It summarizes the security model for architecture, DSI/RSSI review, and run operations.

For exact implementation details and fast-changing configuration keys, use the linked GitHub sources at the end.

## Security Scope

Fred security is organized around five domains:

- identity and access
- service-to-service trust
- runtime isolation
- data and secrets protection
- auditability and operational control

## Identity And Access

### End-user authentication

- User authentication is based on OIDC/OAuth2 (typically Keycloak).
- UI obtains a user token and calls backend APIs with bearer authentication.
- Backends validate token signature and standard claims.

### Authorization model

- RBAC is enforced on protected API surfaces.
- ReBAC policies can be enabled for team and resource-scoped access.
- Admin-only capabilities must stay restricted to administrator roles.
- Detailed role and permission matrix is documented in [Access Model](/docs/reference/access-model/).

## Service-To-Service Security

- Agentic and Knowledge Flow communicate with authenticated service identities.
- Client-credentials are used for service tokens where required.
- MCP integrations use authenticated outbound calls; transport/auth behavior is policy-controlled.

## Runtime And Data Boundaries

- User session boundaries are enforced at runtime.
- Long-running processing uses Temporal workers with explicit task boundaries and retries.
- Storage architecture is deployment-dependent (PostgreSQL and optional ClickHouse).
- Data governance decisions (models/tools/prompts/agents/data scopes) should be explicit at team level.

## Secrets, Keys, And Transport

- Secrets are managed outside source code (K8s secrets, vaults, CI/CD secrets).
- TLS is required for external endpoints and strongly recommended end-to-end.
- Token/key rotation procedures are part of platform runbooks.
- Logs and traces must avoid leaking credentials or full tokens.

## Operational Security Baseline

Before production go-live, teams should validate:

1. IdP configuration (realm, clients, roles/groups, token claims).
2. RBAC/ReBAC enforcement for admin actions.
3. Secret distribution and rotation process.
4. TLS and ingress hardening.
5. Audit log retention and incident response workflow.
6. Dependency and image vulnerability scanning in CI/CD.

## Governance Position

Fred is policy-first for enterprise usage:

- policies are the authority for model/tool/prompt/agent/data access decisions,
- runtime behavior is expected to be deterministic and auditable,
- end-user convenience must not bypass governance controls.

## Related References

- [Architecture](/docs/reference/architecture/)
- [Deployment](/docs/reference/deployment/)
- [Access Model](/docs/reference/access-model/)
- [Policy-based LLM Routing](/docs/reference/llm_routing/)

## Source Of Truth (GitHub)

- [docs/SECURITY.md](https://github.com/ThalesGroup/fred/blob/main/docs/SECURITY.md)
- [docs/KEYCLOAK.md](https://github.com/ThalesGroup/fred/blob/main/docs/KEYCLOAK.md)
- [docs/DEPLOYMENT_GUIDE.md](https://github.com/ThalesGroup/fred/blob/main/docs/DEPLOYMENT_GUIDE.md)
- [docs/CONTRIBUTING.md](https://github.com/ThalesGroup/fred/blob/main/docs/CONTRIBUTING.md)
- [docs/VERSIONING.md](https://github.com/ThalesGroup/fred/blob/main/docs/VERSIONING.md)
