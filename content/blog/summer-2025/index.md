---
title: "Expanding Fred with MCP: A Playground for Next-Gen Agentic Architectures"
description: "Fred and knowledge-flow now support Model Context Protocol (MCP) interactions. Learn how this elevates modular AI orchestration, and why Fred is the ideal lab for building and testing state-of-the-art LLM agents."
summary: "Fred is now capable of serving and consuming components over the Model Context Protocol (MCP). Discover how this unlocks new architectures and makes Fred a live testbed for building interoperable AI agents."
date: 2025-08-27T12:00:00+02:00
lastmod: 2025-08-27T12:00:00+02:00
draft: false
weight: 29
categories: [architecture, mcp, open-source]
tags:
  - agents
  - mcp
  - knowledge-flow
  - langgraph
  - langchain
  - vector-search
  - k8s
  - open-source
contributors: [Simon Cariou, Alban Capitant, Dimitri Tombroff]
pinned: false
homepage: false
seo:
  title: "Fred x MCP: The Open Playground for Agentic AI"
  description: "Fred and knowledge-flow now talk MCP — exposing and consuming modular agent components over the Model Context Protocol. See how we're exploring real-world agent orchestration at scale."
  canonical: "https://fredk8.dev/blog/fred-mcp-architecture"
  robots: "index, follow"
---

The Fred project has always aimed to stay ahead of the curve in agentic design — and this summer, we've added several building blocks to our architecture: **native support for the Model Context Protocol (MCP)**, a **SentinelExpert** that monitors Fred in real-time, and **first-class KPIs** for costs and performance. All of this is now **running on Azure AKS**, thanks to our colleagues at the **Thales Digital Platform**.

In this post, you’ll find:

- What MCP is and why it matters  
- How Fred and knowledge-flow now use MCP  
- What we shipped this summer: SentinelExpert, KPIs, secure service-to-service auth  
- Real architectures we’ve tested on Kubernetes  
- Why Fred is a **living laboratory** for next-gen agentic systems

---

## What is MCP?

The **Model Context Protocol (MCP)** is a standard for communication between independent agentic services. It lets components — retrieval systems, planners, tools, reasoning engines — **talk to each other over HTTP or other transports** using a shared message contract (requests, streaming responses, tool schemas).

In short: MCP turns agent systems into **composable LEGO bricks** you can wire across processes, machines, and teams.

---

## Fred and Knowledge-Flow Now Speak MCP

We made two core changes:

1) **`knowledge-flow` exposes an MCP server** so its document and vector APIs can be consumed by any MCP-aware client (including Fred agents).  
   - Retrieval and analytics are now **cleanly decoupled** from agent logic.  
   - Agents query knowledge-flow over MCP instead of hardcoded SDK calls.

2) **Fred’s agentic backend acts as an MCP client** with robust outbound auth and retry.  
   - HTTP transports add `Authorization: Bearer <token>` automatically.  
   - On `401`, we refresh once and retry — without breaking the chat turn.

### Architecture: Fred and MCP-Aware Components

{{< mermaiddiagram >}}
flowchart TD
  subgraph UI [🧑‍💻 User Interface]
    ChatUI["💬 Chat UI"]
    KnowledgeUI["📚 Knowledge Flow UI"]
  end

  subgraph FredBackend [🧠 Fred Agentic Backend]
    subgraph LangGraph [🤖 LangGraph Agents]
      subgraph Coordinator [🥭 Coordinator Agent]
        LeaderAgent["🥭 Leader Agent"]
      end
      subgraph Specialized [🎯 Specialized Agents]
        DocumentExpert["📄 Document Expert"]
        K8SExpert["📦 K8s Expert"]
        GeneralistExpert["🧠 Generalist Expert"]
      end
      Coordinator --> Specialized
    end
  end

  subgraph KnowledgeFlowMCP ["📚 Knowledge Flow MCP Server"]
    DocAPI["🗂️ Vector & Document API"]
  end

  subgraph ExternalMCP [☁️ External MCP Server]
    K8Server["🔧 K8s Cluster"]
  end

  ChatUI -->|"🔌 multi-agent"| LeaderAgent
  ChatUI -->|"🔌 mono-agent"| DocumentExpert
  ChatUI -->|"🔌 mono-agent"| K8SExpert
  ChatUI -->|"🔌 mono-agent"| GeneralistExpert
  KnowledgeUI -->|"🔍 Ingestion"| DocAPI
  DocumentExpert -->|"🔍 Vector Search (MCP)"| KnowledgeFlowMCP
  K8SExpert -->|"🛁 Analysis Request (MCP)"| ExternalMCP
{{< /mermaiddiagram >}}

This layout showcases the **decoupling** of logic: core agents talk to external tools over MCP, enabling scale, isolation, and reuse.

---

## New This Summer

### 1) SentinelExpert — an agent that watches Fred

We introduced **SentinelExpert**, a built-in agent that monitors your Fred instance using MCP tools:

- **OpenSearch ops**: cluster health, shards, indices, allocation explainers.  
- **Fred KPIs**: token usage, latency, ingestion throughput/errors.

It surfaces concise summaries and early warnings inside your chat and can power dashboards/alerts.

**Screenshot placeholder**  


### 2) KPIs — costs and performance you can act on

We now track **LLM metrics** (prompt/response tokens, cost, latency) and **ingestion metrics** (parse/vectorize/store timings, error codes). KPIs are stored in OpenSearch, queryable via the API and via MCP.

**Screenshot placeholder**  


**Data flow (KPIs & logs)**

{{< mermaiddiagram >}}
flowchart LR
  UI[UI/Agents] -->|calls| KF[Knowledge Flow API]
  KF -->|emit| KPI[(KPI Index)]
  KF -->|emit| Logs[(Audit Logs)]
  KPI --> Dash[Dashboards/Alerts]
  Logs --> Dash
{{< /mermaiddiagram >}}

### 3) Secure by default — Keycloak OIDC + service-to-service auth

- **Three clients, clear roles**:  
  - `agentic` (service account) → mints short-lived tokens to call Knowledge-Flow  
  - `knowledge-flow` (service account) → validates incoming tokens; can call out  
  - `<your-app-frontend>` → end-user login (OIDC)
- **Diagnostics without secrets**: logs surface issuer/audience/subject safely.
- **Resilient MCP**: one-time retry on 401; the graph remains valid (no dangling tool calls).

### 4) Cloud footprint — AKS with the Thales Digital Platform

Thanks to our colleagues at **TDP**, the stack runs smoothly on **Azure AKS**:
- Ingress routing (e.g., `/knowledge-flow`)  
- TLS, secrets, and repeatable manifests  
- Room to scale agents and MCP servers independently

**Screenshot placeholder**  


---

## Multi-Agent Delegation via MCP

MCP also unlocks **multi-agent delegation**: an orchestrator (LeaderAgent) routes work to domain experts, each backed by an MCP service.

{{< mermaiddiagram >}}
flowchart TD
  subgraph FredBackend [Fred Agentic Backend]
    LeaderAgent[Leader Agent]
  end

  subgraph AgentRegistry [Registered Agent Components]
    Dominic[Dominic - Document Expert]
    Explainer[Explainer - K8s Expert]
    FinanceBot[FinanceBot - Cashflow Expert]
  end

  subgraph MCPServers [External MCP Servers]
    KnowledgeFlow[KnowledgeFlow MCP Server]
    K8sServer[K8s MCP Server]
    FinanceService[Finance MCP Endpoint]
  end

  LeaderAgent -->|MCP: search documents| Dominic
  LeaderAgent -->|MCP: analyze K8s| Explainer
  LeaderAgent -->|MCP: cashflow| FinanceBot

  Dominic -->|uses| KnowledgeFlow
  Explainer -->|uses| K8sServer
  FinanceBot -->|uses| FinanceService
{{< /mermaiddiagram >}}

This reflects a production-grade pattern: **orchestrate**, **delegate**, and **compose** without coupling codebases.

---

## Fred as a Testbed for Real MCP Architectures

With MCP, Fred becomes a **modular orchestration lab**:

- **LangGraph agent + remote retriever** (knowledge-flow over MCP)  
- **LangGraph agent + domain tool** (K8s analyzer over MCP)  
- **Orchestrator → sub-agents** (specialists backed by independent services)

You can trial these layouts, swap components, and keep the system secure and observable.

---

## Try it or build your own

- UI, backend, and knowledge-flow are open: wire them together, or **plug in your own MCP tool**.  
- We’ll publish **screenshots and diagrams** alongside Helm snippets so you can reproduce the setup on AKS (or your cluster of choice).

If you’re running agents in production — or planning to — Fred aims to be your **open playground**. We’d love feedback, PRs, and ideas for new MCP experts.

---

## Acknowledgments

A big thank-you to our colleagues at the **Thales Digital Platform** for the managed Kubernetes environment and continued support. This work is a team effort — from secure auth and observability to the nuts and bolts of MCP connectivity.

---
