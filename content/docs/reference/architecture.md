---
title: "Architecture"
description: "Architecture and runtime design of Fred."
summary: "Fred is built around tool-first agents and a policy-first governance plane across models, tools, prompts, agents, and data."
date: 2023-09-07T16:13:18+02:00
lastmod: 2026-03-05T12:30:00+02:00
draft: false
weight: 910
toc: true
seo:
  title: "Fred Architecture"
  description: "Runtime architecture of Fred across UI, backend, policy governance, model routing, tools, and knowledge-flow."
  canonical: "" # custom canonical URL (optional)
  robots: "" # custom robot tags (optional)
---

Check the high-level [architecture blog post](/blog/fred-design-and-architecture) for background and design drivers.

Fred supports both REST and WebSocket interactions:

- REST for metadata and administration endpoints.
- WebSocket for stateful, streaming chat sessions.

## Architecture Overview


{{< mermaiddiagram >}}
flowchart TD
    UI["User Interface (React)"]
    Keycloak["Keycloak (Authentication)"]
    Backend["Agentic Backend (FastAPI)"]
    Catalogs["YAML catalogs: agents + models"]
    Runtime["Selected agent runtime (ReAct/Graph)"]
    Governance["Governance policies<br/>models · tools · prompts · agents · data"]
    Routing["Model routing resolver"]
    LLM["LLM provider (OpenAI / Azure / Ollama / Vertex...)"]
    ToolPorts["Tool ports (builtin + MCP + custom)"]
    KF["Knowledge Flow backend"]
    DB["PostgreSQL (sessions/history/config stores)"]
    Temporal["Temporal (ingestion workflows)"]

    UI -->|"Login / token"| Keycloak
    UI -->|"REST + WebSocket"| Backend
    Backend -->|"JWT validation"| Keycloak
    Backend --> Catalogs
    Backend --> Governance
    Backend --> Runtime
    Runtime --> Governance
    Runtime --> Routing
    Routing --> LLM
    Runtime --> ToolPorts
    ToolPorts --> KF
    Backend --> DB
    KF --> Temporal

    classDef core fill:#f5f7ff,stroke:#333,stroke-width:2px;
    class Backend,Runtime,Routing,Governance core;

    classDef storage fill:#e8f7e8,stroke:#333;
    class DB,Catalogs storage;

    classDef external fill:#f4f4f4,stroke:#999;
    class UI,Keycloak,LLM,KF,Temporal external;
{{< /mermaiddiagram >}}

## Core runtime flow

1. The UI authenticates with Keycloak and calls Agentic backend.
2. The backend loads agent and model catalogs.
3. A single agent is selected for the conversation turn.
4. Runtime policies are evaluated (model, tool, prompt, agent, and data constraints).
5. Model routing resolves the effective model profile for the capability/operation.
6. The agent executes with explicit tools (builtin, MCP, or custom).
7. Outputs are streamed to the UI, and conversation state is persisted.

## Web Socket interactions

WebSocket is used for real-time conversation streaming, while REST remains the control plane.

| Feature | REST API | WebSocket |
|---------|----------|-----------|
| Agent list / metadata | ✅ | ❌ |
| Session history | ✅ | ❌ |
| Session delete | ✅ | ❌ |
| Real-time chat stream | ❌ | ✅ |

## Why this architecture

- Simpler behavior model: one selected agent, explicit tool calls.
- Better observability: policy, model, and tool decisions are easier to trace.
- Clear boundaries: UI, Agentic backend, and Knowledge Flow stay independently evolvable.
- Safer rollout path: YAML catalogs remain source of truth while runtime evolves.

## Governance Plane

Fred's architectural differentiator is a **shared governance plane** applied consistently across:

- **Models**: policy-based routing by capability/purpose/operation.
- **Tools and MCP**: explicit tool contracts, approval policies, and runtime gating.
- **Prompts**: versioned assets and controlled rollout workflows.
- **Agents**: catalog-based definitions and runtime contract checks.
- **Data**: scoped retrieval and access policies (session/corpus/knowledge boundaries).

This keeps the runtime deterministic enough for production operations while preserving flexibility for agent development.
