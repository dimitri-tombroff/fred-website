---
title: "User Interface"
description: "Frontend reference for Fred UI architecture, authentication, and role-based user experience."
summary: "Fred UI is React/TypeScript + Redux, integrates with OIDC (Keycloak by default), and adapts features by user role."
date: 2023-09-07T16:13:18+02:00
lastmod: 2026-03-05T12:00:00+01:00
draft: false
weight: 916
toc: true
seo:
  title: "Fred User Interface"
  description: "Reference for Fred UI stack, OIDC integration, and role-based UX."
  canonical: ""
  robots: ""
---

This page is intentionally short and stable.
It describes the core UI architecture and its security/runtime integration points.

## UI Stack

- React + TypeScript + Vite
- Redux Toolkit / RTK Query for API state
- Material UI for component system and theming

## Authentication Model

- Fred UI integrates with standard OIDC/OAuth2 identity flows.
- Keycloak is the default and documented provider, but the model is standards-based.
- The UI receives user tokens and uses them to call backend APIs (REST and WebSocket).

## Role-Based Experience

- UI capabilities are adapted by role.
- Typical roles are `admin`, `contributor` (editor-equivalent), and `viewer`.
- Server-side authorization remains the source of truth for access control.

## Runtime Integration

- The UI targets the Python backends (`agentic-backend` and related services) directly through configured endpoints.
- The current reference architecture does not rely on a dedicated Golang UI proxy.

## Scope

For broader platform context, see:

- [Architecture](/docs/reference/architecture/)
- [Security](/docs/reference/security/)
- [Deployment](/docs/reference/deployment/)

## Source Of Truth (GitHub)

- [frontend/README.md](https://github.com/ThalesGroup/fred/blob/main/frontend/README.md)
- [docs/KEYCLOAK.md](https://github.com/ThalesGroup/fred/blob/main/docs/KEYCLOAK.md)
- [docs/SECURITY.md](https://github.com/ThalesGroup/fred/blob/main/docs/SECURITY.md)
