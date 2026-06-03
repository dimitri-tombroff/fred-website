---
title: "Architecture"
description: "High-level architecture of Fred for platform, security, and operations teams."
summary: "Short reference of Fred control/data planes, Temporal-based processing, governance, and deployment boundaries."
date: 2023-09-07T16:13:18+02:00
lastmod: 2026-03-05T12:00:00+01:00
draft: false
weight: 910
toc: true
seo:
  title: "Fred Architecture"
  description: "Fred architecture across UI, runtimes, governance, Temporal processing, and storage."
  canonical: ""
  robots: ""
---

This page is intentionally short and stable.
It explains the architecture boundaries so platform teams, DSI, RSSI, and run teams can align quickly.

For implementation details and fast-moving parameters, rely on the GitHub references listed at the end.

> **Full interactive version available** — For the complete annotated platform map with component tables, mental models, and a guided reading path, open the [interactive architecture document](/docs/architecture.html).

## System Overview

{{< mermaiddiagram >}}
flowchart TD
    UI["User Interface (React)"]
    Keycloak["Keycloak / OIDC"]
    Agentic["Agentic backend (FastAPI)"]
    Runtime["Agent runtime (ReAct / Graph)"]
    Policies["Governance policies\nmodels · tools/MCP · prompts · agents · data"]
    Routing["Model routing resolver"]
    LLM["LLM providers\nOpenAI / Azure / Ollama / ..."]
    Tools["Tool layer\nbuiltin + MCP + custom"]
    KF["Knowledge Flow backend"]
    Temporal["Temporal server"]
    Workers["Temporal workers"]
    Stores["PostgreSQL / ClickHouse / object storage"]

    UI -->|"Bearer token"| Agentic
    UI -->|"Login"| Keycloak
    Agentic -->|"JWT validation"| Keycloak
    Agentic --> Runtime
    Runtime --> Policies
    Runtime --> Routing
    Routing --> LLM
    Runtime --> Tools
    Tools --> KF
    KF --> Temporal
    Temporal --> Workers
    Agentic --> Stores
    KF --> Stores

    classDef core fill:#f5f7ff,stroke:#333,stroke-width:2px;
    class Agentic,Runtime,Policies,Routing core;

    classDef external fill:#f4f4f4,stroke:#999;
    class UI,Keycloak,LLM,Temporal,Workers external;
{{< /mermaiddiagram >}}

## Core Flows

### Conversation flow

1. User authenticates through OIDC.
2. UI calls Agentic backend (REST + WebSocket).
3. Runtime executes agent logic (ReAct or Graph).
4. Governance and routing policies select effective model/tool behavior.
5. Output and traces are persisted according to deployment settings.

### Processing flow

- Knowledge Flow processing is executed through Temporal workflows.
- Workflows run in one or several workers depending on target scale.
- This gives durable execution, retries, and operational observability.

## Current Release Positioning

- Temporal is now a first-class processing backbone in Knowledge Flow.
- ClickHouse can be integrated as a store option (notably for data-heavy/vector/config profiles depending on platform design).
- Governance remains policy-first across models, tools/MCP, prompts, agents, and data.

## Why This Architecture

- Decouples interaction runtime from long-running processing.
- Supports enterprise governance and auditable behavior.
- Enables customer fork operation models without hardcoding deployment assumptions.

## Related References

- [Deployment](/docs/reference/deployment/)
- [Security](/docs/reference/security/)
- [Policy-based LLM Routing](/docs/reference/llm_routing/)

## Source Of Truth (GitHub)

- [docs/DEPLOYMENT_GUIDE.md](https://github.com/ThalesGroup/fred/blob/main/docs/DEPLOYMENT_GUIDE.md)
- [docs/SECURITY.md](https://github.com/ThalesGroup/fred/blob/main/docs/SECURITY.md)
- [docs/KEYCLOAK.md](https://github.com/ThalesGroup/fred/blob/main/docs/KEYCLOAK.md)
- [docs/VERSIONING.md](https://github.com/ThalesGroup/fred/blob/main/docs/VERSIONING.md)
