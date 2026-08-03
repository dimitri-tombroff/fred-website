---
title: "Integrating External A2A Agents into Fred’s Backend"
description: "How Fred’s agentic backend now bridges A2A-standard agents—written in Java, Rust, Go, or Python—into the UI, security model, and streaming experience."
summary: "Fred now supports A2A agents alongside MCP agents. Developers can deploy standalone, language-agnostic agents and register them in Fred as first-class citizens. A new agentic bridge handles protocol translation, streaming adaptation, UI rendering, and security integration—unlocking industrial-grade agent development."
date: 2025-12-12T10:00:00+02:00
lastmod: 2025-12-12T10:00:00+02:00
draft: false
weight: 50
categories: [platform, architecture]
tags:
  - agents
  - a2a
  - mcp
  - security
  - architecture
contributors: ["Nicolas Payneau, Dimitri Tombroff"]
pinned: false
homepage: false
seo:
  title: "Integrating External A2A Agents into Fred’s Backend"
  description: "Fred now bridges A2A-standard agents into its agentic backend—enabling language-agnostic, secure, and scalable agent development beyond Python-only stacks."
  canonical: ""
  robots: "index, follow"
---

Fred started as an opinionated, production-ready agentic platform: UI, orchestration, security, observability, and a strong knowledge backbone out of the box. But until recently, agents themselves mostly lived *inside* the Fred backend, written in Python and wired through MCP.

That model works well for experimentation—but it limits how far teams can go when agents become business-critical, real-time, or regulated.

This release changes that boundary. Fred now supports **A2A-standard agents as first-class citizens**, enabling teams to build agents in Java, Rust, Go, Python—or anything else, deploy them independently, and plug them into Fred with no loss of UI, streaming, or security guarantees.

{{< mermaiddiagram >}}
%%{init: {"themeVariables": {"fontSize": "16px"}}}%%
flowchart LR
  %% =========================
  %% DEMO LA POSTE - vue simple
  %% =========================

  subgraph UI["🧑 Frontend React (Fred UI)"]
    UChat["Chat de démonstration"]
    UAdmin["Agent Hub (config + graphe agent)"]
  end

  subgraph AG["🧠 Fred Agentic Backend"]
    Api["API Chat / WebSocket"]
    Fred["Fred Orchestrateur"]
    Agent["Agent La Poste<br/>(TrackingAgent ou BasicReAct)"]
    UiParts["Réponses UI structurées<br/>(GeoPart, HITL, Mermaid)"]
  end

  subgraph MCP["🔌 Serveurs MCP métier (La Poste)"]
    MCPTrack["MCP Suivi & Incidents Colis<br/>(tracking, événements, snapshot IoT, géométrie route)"]
    MCPOps["MCP Actions de Livraison<br/>(points relais, reroutage, replanification, notification client)"]
  end

  subgraph KF["📚 Knowledge Flow"]
    KFApi["API RAG / Recherche"]
    Corpus["Corpus privé La Poste<br/>(tarifs, procédures, objets interdits, scripts de démo)"]
  end

  UChat -->|"WebSocket + REST"| Api
  UAdmin -->|"CRUD agent"| AG
  UAdmin -->|"GET /agents/{id}/graph"| AG

  Api --> Fred
  Fred -->|"délègue"| Agent
  Agent -->|"tool calls"| MCPTrack
  Agent -->|"tool calls"| MCPOps
  Agent -->|"RAG (si besoin)"| KFApi
  KFApi --> Corpus
  Agent --> UiParts
  UiParts --> UChat

  %% Styles
  style UI fill:#EAF2FF,stroke:#3B4A6B,stroke-width:1.2px
  style AG fill:#FFEFE0,stroke:#7A4A21,stroke-width:1.2px
  style MCP fill:#FFF7E6,stroke:#7A4A21,stroke-width:1.2px
  style KF fill:#E9FFE9,stroke:#2E6B2E,stroke-width:1.2px

  style Fred fill:#FFD9B3,stroke:#7A4A21,stroke-width:1.4px
  style Agent fill:#FFF2CC,stroke:#6B5A1F,stroke-width:1.4px
  style UiParts fill:#F5F0FF,stroke:#5B4A99,stroke-dasharray: 4 3

  style MCPTrack fill:#E6F7FF,stroke:#1C6B8A,stroke-width:1.2px
  style MCPOps fill:#E6F7FF,stroke:#1C6B8A,stroke-width:1.2px
  style KFApi fill:#DFF6DF,stroke:#2E6B2E,stroke-width:1.2px
  style Corpus fill:#F4FFF4,stroke:#2E6B2E,stroke-dasharray: 5 4
{{< /mermaiddiagram >}}

{{< mermaiddiagram >}}
%%{init: {"themeVariables": {"fontSize": "15px"}}}%%
flowchart TB
  %% =========================
  %% DEMO LA POSTE - vue étendue / infra cible
  %% =========================

  subgraph UI["🧑 Frontend React (Fred UI)"]
    Chat["Chat + cartes HITL + GeoMap"]
    Hub["Agent Hub (édition + graphe)"]
    KfPages["Pages Knowledge Flow (gestion corpus)"]
  end

  subgraph SEC["🔐 IAM"]
    KC["Keycloak (OIDC / JWT)"]
  end

  subgraph AG["🧠 Agentic Backend (Fred)"]
    AGApi["API Chat / WS / Agents"]
    Orch["Orchestrateur Fred"]
    PostalAgent["Agent La Poste<br/>(custom ou BasicReAct)"]
    AGPg["PostgreSQL Agentic<br/>(sessions, history, config agents)"]
    Temporal["Temporal<br/>(workflows / tâches async)"]
  end

  subgraph MCP["🔌 MCP métier (La Poste / démo)"]
    Mcp1["MCP Suivi & Incidents Colis"]
    Mcp2["MCP Actions Livraison & Relation Client"]
  end

  subgraph KF["📚 Knowledge Flow"]
    KFApi["API RAG / ingestion / recherche"]
    KFPg["PostgreSQL KF<br/>(métadonnées, index logique)"]
    Vec["Vector Store<br/>(embeddings / similarité)"]
    S3["Object Store / S3<br/>(documents sources)"]
    Corpus["Corpus privé La Poste<br/>(docs internes de démo)"]
  end

  %% Auth
  Chat -->|"login OIDC"| KC
  Hub -->|"login OIDC"| KC
  KfPages -->|"login OIDC"| KC

  Chat -->|"JWT + WS/REST"| AGApi
  Hub -->|"JWT + REST"| AGApi
  KfPages -->|"JWT + REST"| KFApi

  %% Agentic internals
  AGApi --> Orch
  Orch --> PostalAgent
  AGApi --> AGPg
  Orch --> Temporal

  %% Tooling & knowledge
  PostalAgent -->|"tool calls"| Mcp1
  PostalAgent -->|"tool calls"| Mcp2
  PostalAgent -->|"RAG queries"| KFApi

  %% Knowledge Flow storage
  KFApi --> KFPg
  KFApi --> Vec
  KFApi --> S3
  Corpus --> S3

  %% Styles
  style UI fill:#EAF2FF,stroke:#3B4A6B,stroke-width:1.2px
  style SEC fill:#F5F5F5,stroke:#666,stroke-width:1.2px
  style AG fill:#FFEFE0,stroke:#7A4A21,stroke-width:1.2px
  style MCP fill:#FFF7E6,stroke:#7A4A21,stroke-width:1.2px
  style KF fill:#E9FFE9,stroke:#2E6B2E,stroke-width:1.2px

  style PostalAgent fill:#FFF2CC,stroke:#6B5A1F,stroke-width:1.4px
  style Orch fill:#FFD9B3,stroke:#7A4A21,stroke-width:1.4px
  style KC fill:#EFEFEF,stroke:#555,stroke-width:1.2px

  style Mcp1 fill:#E6F7FF,stroke:#1C6B8A,stroke-width:1.2px
  style Mcp2 fill:#E6F7FF,stroke:#1C6B8A,stroke-width:1.2px
  style KFApi fill:#DFF6DF,stroke:#2E6B2E,stroke-width:1.2px
  style Vec fill:#F4FFF4,stroke:#2E6B2E,stroke-dasharray: 5 4
  style S3 fill:#F4FFF4,stroke:#2E6B2E,stroke-dasharray: 5 4
  style KFPg fill:#F4FFF4,stroke:#2E6B2E,stroke-dasharray: 5 4
{{< /mermaiddiagram >}}

{{< mermaiddiagram >}}
%%{init: {"themeVariables": {"fontSize": "16px"}}}%%
flowchart LR
  %% =========================
  %% DEMO LA POSTE - vue simple
  %% =========================

  subgraph UI["🧑 Frontend React (Fred UI)"]
    UChat["Chat de démonstration"]
    UAdmin["Agent Hub (config + graphe agent)"]
  end

  subgraph AG["🧠 Fred Agentic Backend"]
    Api["API Chat / WebSocket"]
    Fred["Fred Orchestrateur"]
    Agent["Agent La Poste<br/>(TrackingAgent ou BasicReAct)"]
    UiParts["Réponses UI structurées<br/>(GeoPart, HITL, Mermaid)"]
  end

  subgraph MCP["🔌 Serveurs MCP métier (La Poste)"]
    MCPTrack["MCP Suivi & Incidents Colis<br/>(tracking, événements, snapshot IoT, géométrie route)"]
    MCPOps["MCP Actions de Livraison<br/>(points relais, reroutage, replanification, notification client)"]
  end

  subgraph KF["📚 Knowledge Flow"]
    KFApi["API RAG / Recherche"]
    Corpus["Corpus privé La Poste<br/>(tarifs, procédures, objets interdits, scripts de démo)"]
  end

  UChat -->|"WebSocket + REST"| Api
  UAdmin -->|"CRUD agent"| AG
  UAdmin -->|"GET /agents/{id}/graph"| AG

  Api --> Fred
  Fred -->|"délègue"| Agent
  Agent -->|"tool calls"| MCPTrack
  Agent -->|"tool calls"| MCPOps
  Agent -->|"RAG (si besoin)"| KFApi
  KFApi --> Corpus
  Agent --> UiParts
  UiParts --> UChat

  %% Styles
  style UI fill:#EAF2FF,stroke:#3B4A6B,stroke-width:1.2px
  style AG fill:#FFEFE0,stroke:#7A4A21,stroke-width:1.2px
  style MCP fill:#FFF7E6,stroke:#7A4A21,stroke-width:1.2px
  style KF fill:#E9FFE9,stroke:#2E6B2E,stroke-width:1.2px

  style Fred fill:#FFD9B3,stroke:#7A4A21,stroke-width:1.4px
  style Agent fill:#FFF2CC,stroke:#6B5A1F,stroke-width:1.4px
  style UiParts fill:#F5F0FF,stroke:#5B4A99,stroke-dasharray: 4 3

  style MCPTrack fill:#E6F7FF,stroke:#1C6B8A,stroke-width:1.2px
  style MCPOps fill:#E6F7FF,stroke:#1C6B8A,stroke-width:1.2px
  style KFApi fill:#DFF6DF,stroke:#2E6B2E,stroke-width:1.2px
  style Corpus fill:#F4FFF4,stroke:#2E6B2E,stroke-dasharray: 5 4
{{< /mermaiddiagram >}}

---

## The Problem: Agents Are Outgrowing the Sandbox

Agent frameworks have matured quickly, but most remain optimized for Python-only development, single-process execution, and experimental or exploratory use cases. That is adequate for research, but less so when latency, memory determinism, and security isolation matter, or when teams need to use established stacks such as Spring Boot, Rust async runtimes, and Go services. In short, industrial agents need industrial architecture. 

Fred’s agentic backend is a Python-centric application leveraging LangChain/LangGraph. It already does its best with async execution and scales horizontally, but it is expected to scale even better with A2A agents running as standalone services. Here is a look at its current architecture:

{{< mermaiddiagram >}}
%%{init: {"themeVariables": {"fontSize": "16px"}}}%%
flowchart LR
  %% =========================
  %% BEFORE: Agents are inside the Agentic Backend (Python-bound)
  %% =========================

  subgraph UI["🧑 React UI"]
    UChat["Chat UI"]
    UAdmin["Agent Hub (Create/Edit)"]
  end

  subgraph AB["🧠 Fred Agentic Backend"]
    Fred["Fred Orchestrator"]
    PyAgents["Python Agents\n"]
    Tools["Tool Access\n(MCP + REST)"]
  end

  subgraph KF["📚 Knowledge Flow"]
    KFApi["Docs/Data APIs"]
    Stores["Vector + Tabular Stores"]
    MCP["MCP Server"]
  end

  MCP3P["3rd-Party MCP Servers"]

  UChat -->|"WebSocket + REST"| Fred
  UAdmin -->|"Agent config (internal only)"| PyAgents
  Fred -->|"delegates"| PyAgents
  PyAgents -->|"tool calls"| Tools
  Tools --> MCP
  Tools --> MCP3P
  Tools --> KFApi
  KFApi --> Stores

  %% Visual emphasis
  style UI fill:#EAF2FF,stroke:#3B4A6B,stroke-width:1.2px
  style AB fill:#FFEFE0,stroke:#7A4A21,stroke-width:1.2px
  style KF fill:#E9FFE9,stroke:#2E6B2E,stroke-width:1.2px

  style Fred fill:#FFD9B3,stroke:#7A4A21,stroke-width:1.4px
  style PyAgents fill:#FFF2CC,stroke:#6B5A1F,stroke-width:1.4px
  style Tools fill:#FFF7E6,stroke:#7A4A21,stroke-dasharray: 4 3

  style MCP fill:#E6F7FF,stroke:#1C6B8A,stroke-width:1.2px
  style MCP3P fill:#E6F7FF,stroke:#1C6B8A,stroke-width:1.2px,stroke-dasharray: 5 3
  style KFApi fill:#DFF6DF,stroke:#2E6B2E,stroke-width:1.2px
  style Stores fill:#F4FFF4,stroke:#2E6B2E,stroke-dasharray: 5 4
{{< /mermaiddiagram >}}

The introduction of A2A agents is already a major step toward a more robust architecture, as the following diagram shows.
 
---

## A2A as a Boundary, Not a Feature

Agent-to-Agent (A2A) is treated in Fred as a **protocol boundary**, not a convenience API. An A2A agent is a standalone service deployed independently (often as its own Kubernetes pod), implemented in any language, and exposing a standard A2A interface (agent card, message send, streaming). Fred does not embed that agent. Instead, it connects to it.

{{< mermaiddiagram >}}
flowchart LR
  %% =========================
  %% AFTER: A2A agents are external services, first-class in Fred
  %% =========================

  subgraph UI["🧑 React UI"]
    UChat["Chat UI\n(streaming + rich rendering)"]
    UAdmin["Agent Hub\n(register external A2A agents)"]
  end

  subgraph AB["🧠 Fred Agentic Backend"]
    Fred["Fred Orchestrator"]
    Registry["A2A Agent Registry\n(URL + auth)"]
  end

  subgraph A2A["🧩 External A2A Agents\n"]
    AgentJava["Java / Spring Boot\nAgent"]
    AgentRust["Rust\nAgent"]
    AgentGo["Go\nAgent"]
    AgentPy["Python\nAgent  "]
  end

  %% User interactions
  UChat -->|"WebSocket + REST"| Fred
  UAdmin -->|"register A2A agent"| Registry
  Registry -->|"available agents"| Fred

  %% A2A connectivity
  Fred -->|"A2A"| AgentJava
  Fred -->|"A2A"| AgentRust
  Fred -->|"A2A"| AgentGo
  Fred -->|"A2A"| AgentPy

  %% Visual emphasis
  style UI fill:#EAF2FF,stroke:#3B4A6B,stroke-width:1.2px
  style AB fill:#FFEFE0,stroke:#7A4A21,stroke-width:1.2px
  style A2A fill:#F2ECFF,stroke:#4B3B7A,stroke-width:1.2px

  style Fred fill:#FFD9B3,stroke:#7A4A21,stroke-width:1.4px
  style Registry fill:#FFE1BF,stroke:#7A4A21,stroke-width:1.3px

  style AgentJava fill:#EFE6FF,stroke:#4B3B7A,stroke-width:1.2px
  style AgentRust fill:#EFE6FF,stroke:#4B3B7A,stroke-width:1.2px
  style AgentGo fill:#EFE6FF,stroke:#4B3B7A,stroke-width:1.2px
  style AgentPy fill:#EFE6FF,stroke:#4B3B7A,stroke-width:1.2px
{{< /mermaiddiagram >}}

---

## A2A Bridge Overview

Fred initially supported MCP agents that are dynamically assembled, tool-driven, and hosted inside Fred. The backend now also includes an A2A bridge that allows users to create external, standalone, protocol-driven agents in the UI. When a user creates an A2A agent, Fred registers the remote A2A endpoint, instantiates an internal proxy agent, and routes user interactions through that proxy. From the UI’s perspective, this agent behaves like any other.

---

### Streaming and Message Translation

A design constraint was that A2A agents should not degrade the Fred UI experience. The bridge receives A2A streaming messages, incremental outputs, final responses, and structured artifacts, and translates them into Fred’s internal message model. This preserves live streaming, message grouping, structured rendering, source blocks with metadata, and consistent history replay.

---

### Security, SSO, and Trust Domains

External A2A agents run in separate processes and can be deployed in their own Kubernetes namespaces. Each agent can join SSO independently (for example via Keycloak) and enforce its own authorization rules; Fred does not impersonate the agent and instead integrates with it. This supports clear trust boundaries, least-privilege access, auditable cross-agent calls, and independent lifecycle management, which are important in regulated environments.

---

### Implications for Agent Development

The A2A bridge removes a single-runtime constraint and allows teams to implement agents in different languages and ecosystems based on operational needs. For example, Rust can be used for low-latency workflows, Java or Spring Boot for integration with existing enterprise systems, Go for network-heavy or concurrent services, and Python where iteration speed is important. Regardless of implementation, these agents can consume Fred’s Knowledge Flow APIs (documents, vectors, SQL-like tabular access), expose results through A2A, and appear in the Fred UI as first-class agents.

---

## Knowledge Flow as a Shared Backbone

Knowledge Flow predates A2A and remains an independent set of services for documents, vectors, tabular data, and content delivery. It exposes these capabilities through REST and MCP APIs, so any A2A agent can use standard REST or MCP libraries to access them. This allows external agents to benefit from Knowledge Flow services without requiring a shared runtime. Two common examples are retrieval-augmented generation and content delivery: an agent can use Knowledge Flow to retrieve documents for a report, and then publish the report so the user can download it later. These patterns are useful but nontrivial to implement consistently without platform support.

{{< mermaiddiagram >}}
flowchart LR
  A2A["A2A Agent"]

  subgraph KF["Knowledge Flow Services"]
    Vectors["Vectors"]
    SQL["SQL"]
    Content["Content"]
    Tags["Tags"]
    Graph["Graph"]
    Supervision["Supervision"]
    Connectors["Connectors"]
  end

  subgraph Enterprise["Enterprise Services"]
    ERP["ERP / CRM"]
    Data["Data Warehouses"]
    IdP["Internal APIs"]
  end

  subgraph Public["Public Online Services"]
    SaaS["SaaS APIs"]
    Web["Public Web"]
  end

  A2A -->|"REST / MCP"| KF
  A2A -->|"REST / gRPC"| Enterprise
  A2A -->|"HTTPS"| Public

  %% Visual emphasis
  style A2A fill:#F2ECFF,stroke:#4B3B7A,stroke-width:1.2px
  style KF fill:#E9FFE9,stroke:#2E6B2E,stroke-width:1.2px
  style Enterprise fill:#EAF2FF,stroke:#3B4A6B,stroke-width:1.2px
  style Public fill:#FFF4E5,stroke:#8A5A2E,stroke-width:1.2px

  style Vectors fill:#F4FFF4,stroke:#2E6B2E,stroke-width:1px
  style SQL fill:#F4FFF4,stroke:#2E6B2E,stroke-width:1px
  style Content fill:#F4FFF4,stroke:#2E6B2E,stroke-width:1px
  style Tags fill:#F4FFF4,stroke:#2E6B2E,stroke-width:1px
  style Graph fill:#F4FFF4,stroke:#2E6B2E,stroke-width:1px
  style Supervision fill:#F4FFF4,stroke:#2E6B2E,stroke-width:1px
  style Connectors fill:#F4FFF4,stroke:#2E6B2E,stroke-width:1px

  style ERP fill:#F4F8FF,stroke:#3B4A6B,stroke-width:1px
  style Data fill:#F4F8FF,stroke:#3B4A6B,stroke-width:1px
  style IdP fill:#F4F8FF,stroke:#3B4A6B,stroke-width:1px

  style SaaS fill:#FFF8EF,stroke:#8A5A2E,stroke-width:1px
  style Web fill:#FFF8EF,stroke:#8A5A2E,stroke-width:1px
{{< /mermaiddiagram >}}

---

# A minimal Spring AI example

This section provides a short example to make the bridge concrete and to support the accompanying demo. The goal is to expose an agent card, handle the JSON-RPC `message/send` call, and connect it to Spring AI for model responses.

## A2A in practice

An A2A agent publishes a small JSON agent card at `/.well-known/agent-card.json` that describes the agent and its endpoint. The primary JSON-RPC method is `message/send` for a single response, with optional streaming via `message/stream`. The endpoints are standard HTTP, so the structure resembles other service-to-service APIs in Spring Boot.

## A minimal Spring AI A2A agent

Below is a minimal slice from a Spring Boot app. It returns the agent card and routes `message/send` requests to Spring AI. The intent is to show the integration without additional abstraction.

```java
@RestController
class A2aController {
  private final AgentService agentService;

  A2aController(AgentService agentService) {
    this.agentService = agentService;
  }

  @GetMapping(path = "/.well-known/agent-card.json")
  AgentCard agentCard() {
    return new AgentCard(
        "0.3.0",
        "Java A2A OpenAI Agent",
        "http://localhost:9999/",
        "JSONRPC"
    );
  }

  @PostMapping(path = "/", consumes = "application/json", produces = "application/json")
  Mono<JsonRpc.Response> messageSend(@RequestBody JsonRpc.Request req) {
    String answer = agentService.ask(extractText(req));
    return Mono.just(JsonRpc.Response.ok(req.id(), answer));
  }
}
```

And the service is essentially a one-liner around Spring AI's `ChatClient`:

```java
@Service
class AgentService {
  private final ChatClient chat;

  AgentService(ChatClient.Builder builder) {
    this.chat = builder.build();
  }

  String ask(String userText) {
    return chat.prompt().user(userText).call().content();
  }
}
```

This illustrates the core wiring: A2A provides the interoperable contract, and Spring AI handles the model call through the standard Spring programming model.

## Benefits

For teams that already use Spring, the example relies on familiar controllers, dependency injection, and configuration. Existing production practices for security, tracing, and deployment can remain in place. Spring AI also abstracts the model client so the implementation is not tied to a single provider.

## Summary

This post shows how adding A2A alongside MCP opens a wider design space: agents can be orchestrated across runtimes, security boundaries can be tested in realistic deployments, and streaming UX remains consistent. With a fully deployable, open-source stack, Fred makes it practical to explore these topics end-to-end on cloud or on-premises infrastructure, and to do so collaboratively with the community.

## References

- [Model Context Protocol (MCP) GitHub](https://github.com/langchain-ai/mcp)
- [Cohorte: Comparing MCP vs A2A](https://www.cohorte.co/blog/comparing-anthropics-model-context-protocol-mcp-vs-googles-agent-to-agent-a2a-for-ai-agents-in-business-automation)
- [Spring AI Documentation](https://docs.spring.io/spring-ai/reference/)
