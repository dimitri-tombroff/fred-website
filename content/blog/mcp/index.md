---
title: "Expanding Fred with MCP: A Playground for Next-Gen Agentic Architectures"
description: "Fred and knowledge-flow now support Model Context Protocol (MCP) interactions. Learn how this elevates modular AI orchestration, and why Fred is the ideal lab for building and testing state-of-the-art LLM agents."
summary: "Fred is now capable of serving and consuming components over the Model Context Protocol (MCP). Discover how this unlocks new architectures and makes Fred a live testbed for building interoperable AI agents."
date: 2025-05-19T12:00:00+02:00
lastmod: 2025-05-19T12:00:00+02:00
draft: false
weight: 40
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

The Fred project has always aimed to stay ahead of the curve in agentic design — and this week, we've added another key building block to our architecture: **support for the Model Context Protocol (MCP)**.

In this post, we’ll walk through:

- What MCP is and why it matters  
- How Fred and knowledge-flow now use MCP  
- Real architectures we’ve tested with open-source agents and Kubernetes integrations  
- Why Fred is a **living laboratory** for experimenting with next-gen AI systems

---

## What is MCP?

The **Model Context Protocol (MCP)** is a standard for communication between independent agentic services. It allows different components — like retrieval systems, planners, tools, or reasoning engines — to **talk to each other over HTTP or other transports**, while respecting a common contract (message-passing, streaming, etc.).

In simpler terms: MCP lets you wire up agent brains and tools like LEGO bricks, even across different codebases or servers.

To better understand how this works, let’s look at a first diagram showing a basic interaction between the Fred backend, knowledge-flow, and a Kubernetes tool — all communicating through MCP.

### Architecture: Fred and MCP-Aware Components

The diagram below illustrates a typical flow where the Fred agentic backend connects to multiple MCP-enabled services. The React UI communicates with the Fred backend via WebSocket or REST, and Fred, in turn, reaches out to components like `knowledge-flow` and a Kubernetes MCP server using MCP.

{{< mermaiddiagram >}}
    flowchart TD
    %% Section: User Interface
    subgraph UI [🧑‍💻 User Interface]
        ChatUI["💬 Chat UI"]
    end

    %% Section: Fred Agentic Backend
    subgraph FredBackend [🧠 Fred Agentic Backend]
        subgraph LangGraph [🤖 LangGraph Agents]
            DocumentExpert["📄 Document Expert"]
            K8SExpert["📦 K8s Expert"]
        end
    end

    %% Section: Knowledge Flow (Internal)
    subgraph KnowledgeFlowMCP ["📚 Knowledge Flow MCP Server"]
        DocAPI["🗂️ Vector & Document API"]
    end

    %% Section: External Infrastructure (External MCP)
    subgraph ExternalMCP [☁️ External MCP Server]
        K8Server["🔧 K8s Cluster"]
    end

    %% Interactions
    ChatUI -->|🔌 WebSocket / REST| FredBackend
    DocumentExpert -->|"🔍 Vector Search (MCP)"| KnowledgeFlowMCP
    K8SExpert -->|"📡 Analysis Request (MCP)"| ExternalMCP

    %% Styles
    style ChatUI fill:#d0e1ff,stroke:#333,stroke-width:1.5px
    style LangGraph fill:#fff0cc,stroke:#333,stroke-width:1.5px
    style DocAPI fill:#dcffe4,stroke:#333,stroke-width:1.5px
    style K8Server fill:#f4e2ff,stroke:#333,stroke-width:1.5px
    style FredBackend stroke:#333,stroke-width:2px
    style KnowledgeFlowMCP stroke:#333,stroke-width:2px
    style ExternalMCP stroke:#333,stroke-width:2px
    style KnowledgeFlowMCP font-size:14px
{{< /mermaiddiagram >}}

This layout showcases the **decoupling** of logic: the core agents can talk to external tools over MCP, enabling scalability and composability.

---

## Fred and Knowledge-Flow Now Speak MCP

This week, we made two big strides:

1. **`knowledge-flow-app` now exposes an MCP server endpoint**, making its document and vector APIs accessible to any external MCP client (like agents).  
   - This makes it a **modular, standalone retrieval system** in the ecosystem.  
   - The "Document expert" agent (a.k.a. `Dominic`), for example, now queries `knowledge-flow` via MCP — cleanly separating agent logic from data logic.

2. **We integrated with an open-source Kubernetes MCP server**, and updated our expert Kubernetes agent to use it.  
   - This allowed us to **plug in a live Kubernetes explainability component**, fully decoupled from the core Fred backend.  
   - It demonstrates how domain-specific tools (like K8 analyzers or forecasting engines) can be **plugged in** as peers — not hardcoded logic.

---

## Multi-Agent Delegation via MCP

Another key strength of MCP is how it enables **multi-agent delegation**: one orchestrator agent (like `LeaderAgent`) can route tasks to various specialized agents, each connected to a different backend or domain.

### Architecture: Leader Agent Delegating to Expert Agents

In this diagram, `LeaderAgent` delegates work to a set of registered MCP-aware expert agents: `Dominic` (for document tasks), `Explainer` (for K8s analysis), and `FinanceBot` (for projections). Each of these experts communicates with its own backend via MCP.

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

    LeaderAgent -->|MCP call: search documents| Dominic
    LeaderAgent -->|MCP call: analyze K8s| Explainer
    LeaderAgent -->|MCP call: cashflow prediction| FinanceBot

    Dominic -->|Uses| KnowledgeFlow
    Explainer -->|Uses| K8sServer
    FinanceBot -->|Uses| FinanceService

    style LeaderAgent fill:#ffe5cc,stroke:#333,stroke-width:1.5px
    style Dominic fill:#e2ffe2,stroke:#333,stroke-width:1.5px
    style Explainer fill:#e2ffe2,stroke:#333,stroke-width:1.5px
    style FinanceBot fill:#e2ffe2,stroke:#333,stroke-width:1.5px
    style KnowledgeFlow fill:#f8f8f8,stroke:#888,stroke-dasharray: 5,5
    style K8sServer fill:#f8f8f8,stroke:#888,stroke-dasharray: 5,5
    style FinanceService fill:#f8f8f8,stroke:#888,stroke-dasharray: 5,5
{{< /mermaiddiagram >}}

This setup reflects a real-world orchestration pattern where Fred delegates specialized reasoning to the right expert, and each expert can evolve independently.

---

## Fred as a Testbed for Real MCP Architectures

Fred is not just a chatbot. It’s a **modular orchestration lab** for experimenting with:

- **Agent-to-agent delegation** (via LangGraph workflows)  
- **Document-aware reasoning** (with external retrieval systems)  
- **Component-level modularity** (via MCP)

You can explore and test architectures like:

### 1. LangGraph Agent + Remote MCP Retriever

{{< mermaiddiagram >}}
flowchart LR
    User[User] -->|Starts chat| Fred[LangGraph Agent]
    Fred -->|MCP call| KnowledgeFlow[Knowledge Flow]
    KnowledgeFlow -->|Returns result| Fred
    Fred -->|Streams response| User
{{< /mermaiddiagram >}}

- Clean separation of agent logic and document/data systems.  
- Ideal for private data RAG, secure APIs, and document gating.

---

### 2. LangGraph Agent + Remote Domain Tool

{{< mermaiddiagram >}}
flowchart LR
    user[user]
    fred[langgraph agent]
    analyzer[k8s analyzer - mcp tool]

    user -->|start chat| fred
    fred -->|mcp call| analyzer
    analyzer -->|result| fred
    fred -->|stream reply| user
{{< /mermaiddiagram >}}

- Useful for technical agents, DevOps copilots, or system audits.  
- Swappable tool endpoints based on task or cluster.

---

### 3. Orchestrator Agent → Sub-agents via MCP

{{< mermaiddiagram >}}
flowchart TB
    leader[leader agent - orchestrator]
    dominic[dominic - retrieval expert]
    explainer[explainer - k8s expert]
    cashflowbot[cashflowbot - finance expert]

    leader -->|mcp call| dominic
    leader -->|mcp call| explainer
    leader -->|mcp call| cashflowbot
{{< /mermaiddiagram >}}


- Modular team of experts, each MCP-enabled  
- Built for composability and reuse across projects

---

## Why It Matters

These changes push Fred further as a **reference architecture** for modular AI systems:

- **Interoperability**: Plug and play any MCP-enabled component.  
- **Real-world readiness**: Use real APIs, real clusters, real documents.  
- **Open experimentation**: Fork and modify any piece — backend, agent, or data layer.

Fred is not just an app — it’s a framework for **testing the future of LLM infrastructure**.

---

## 🔧 Try It or Build Your Own

- [💬 Try the UI](https://github.com/ThalesGroup/fred/frontend)  
- [🧠 Explore the Fred agentic backend](https://github.com/ThalesGroup/fred/backend)  
- [📚 Explore the knowledge-flow backend](https://github.com/ThalesGroup/knowledge-flow)  
- [🛠 Build your own MCP tool](https://github.com/langchain-ai/mcp)

Want to plug your own expert agent into the ecosystem? Come join the experiment.

---

## Coming Next

Stay tuned for:

- How to make LangGraph agents call remote MCP tools  
- Case studies on Kubernetes, finance, and security agents  

Fred is evolving fast — and it’s never been easier to jump in. Do not hesitate joining us.

---
