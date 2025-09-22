---
title: "Reference Architectures"
description: "A collection of architecture diagrams that illustrate how Fred components interact in different scenarios."
summary: "Explore key reference architectures of Fred — from the essential three-tier view (UI, agentic backend, knowledge backend) to modular MCP-enabled patterns."
date: 2025-09-21T10:00:00+02:00
lastmod: 2025-09-21T10:00:00+02:00
draft: false
weight: 60
categories: [architecture, reference, diagrams]
tags:
  - agents
  - mcp
  - langgraph
  - knowledge-flow
  - k8s
contributors: [Dimitri Tombroff]
pinned: false
homepage: false
seo:
  title: "Fred Reference Architecture Diagrams"
  description: "Visualize how Fred connects UI, agents, and knowledge components — from the simplest view to advanced MCP orchestration."
  canonical: "https://fredk8.dev/docs/reference-architectures"
  robots: "index, follow"
---

Fred is best understood visually.  
This page collects **reference diagrams** that show how its components fit together — from the most essential three-block view to multi-agent MCP orchestration.

---

## 1. The Essential View

### 1.1 Fred Components

Fred’s architecture is built around three tightly connected layers. At the top, the Fred UI offers both a conversational interface and access to document and prompt libraries. These interact with the agentic backend, powered by LangGraph, where orchestrator agents manage dialogue and delegate tasks to specialized components. 

{{< mermaiddiagram >}}
flowchart TD
    subgraph UI [🧑‍💻 Fred UI]
        ChatUI["💬 Chat Interface"]
        LibraryUI["📚 Document/Prompt Library"]
    end

    subgraph Backends [Application Backends]
        subgraph Agentic [🧠 Agentic Backend]
            Agents["🤖 LangGraph Agents"]
        end

        subgraph Knowledge [📚 Knowledge-Flow Backend]
            Ingestion["📥 Ingestion & Storage"]
            VectorSearch["🔍 Vector Search"]
            MCPEndpoints["🔗 MCP Endpoints (Monitoring, Reports, DBs)"]
        end
    end

    ChatUI -->|WebSocket/REST| Agents
    LibraryUI -->|API| Knowledge

    Agents -->|MCP/REST| VectorSearch
    Agents -->|MCP/REST| MCPEndpoints

    style ChatUI fill:#c6f6d5,stroke:#333,stroke-width:1.5px
    style LibraryUI fill:#c6f6d5,stroke:#333,stroke-width:1.5px
    style Agents fill:#ffe5cc,stroke:#333,stroke-width:1.5px
    style Ingestion fill:#e2e2ff,stroke:#333,stroke-width:1.5px
    style VectorSearch fill:#e2e2ff,stroke:#333,stroke-width:1.5px
    style MCPEndpoints fill:#e2e2ff,stroke:#333,stroke-width:1.5px
{{< /mermaiddiagram >}}

### 1.2 Broad Architecture view


The backend communicates with the knowledge-flow system, which handles ingestion, indexing, and vector search, while also exposing MCP endpoints for broader integration. External ecosystem services complete the picture: IAM provides identity and role validation for both users and service accounts, a vector database and content store manage embeddings and raw files, and optional SQL stores extend structured access. Together, this design ensures Fred remains modular, secure, and adaptable to enterprise environments.

{{< mermaiddiagram >}}
flowchart LR
    %% --- External Ecosystem ---
    subgraph Ecosystem ["🌐 External Ecosystem Services"]
        IAM["🔑 IAM (Keycloak)"]
        VectorDB["💾 Vector DB (OpenSearch | Qdrant)"]
        ContentStore["🗄️ Content Store (S3 | MinIO)"]
        SQLDB["📊 External SQL Store (Postgres | MySQL)"]
    end

    %% --- Fred Core System ---
    subgraph FredSystem ["FRED — The Core RAG Application"]
        subgraph UI ["🧑‍💻 Fred UI"]
            ChatUI["💬 Chat Interface"]
            LibraryUI["📚 Document — Prompt Library"]
        end

        subgraph Agentic ["🧠 Agentic Backend — LangGraph"]
            Agents["🤖 LangGraph Agents"]
        end

        subgraph Knowledge ["📚 Knowledge-Flow Backend"]
            Ingestion["📥 Ingestion & Storage"]
            VectorSearch["🔍 Vector Search"]
            MCPEndpoints["🔗 MCP Endpoints"]
        end
    end

    %% --- Connections to External Services ---
    UI -- "Auth Request" --> IAM
    Agentic -- "Auth Policy" --> IAM
    Ingestion -- "Read/Write Docs" --> ContentStore
    Ingestion -- "Read/Write Vectors" --> VectorDB
    VectorSearch -- "Read Vectors" --> VectorDB

    %% --- Internal Fred Connections ---
    ChatUI -- "WebSocket | REST" --> Agents
    LibraryUI -- "API" --> Knowledge
    Agents -- "MCP | REST" --> VectorSearch
    Agents -- "MCP | REST" --> MCPEndpoints

    %% --- Knowledge Flow connections ---
    MCPEndpoints -- "SQL Access" --> SQLDB
    Knowledge -- "Auth Validation (Service & User Roles)" --> IAM

    %% --- Styling ---
    style ChatUI fill:#c6f6d5,stroke:#333,stroke-width:1.5px
    style LibraryUI fill:#c6f6d5,stroke:#333,stroke-width:1.5px
    style Agents fill:#ffe5cc,stroke:#333,stroke-width:1.5px
    style Ingestion fill:#e2e2ff,stroke:#333,stroke-width:1.5px
    style VectorSearch fill:#e2e2ff,stroke:#333,stroke-width:1.5px
    style MCPEndpoints fill:#e2e2ff,stroke:#333,stroke-width:1.5px

    style IAM fill:#f0c0f0,stroke:#333,stroke-width:1.5px
    style VectorDB fill:#c0f0f0,stroke:#333,stroke-width:1.5px
    style ContentStore fill:#c0f0f0,stroke:#333,stroke-width:1.5px
    style SQLDB fill:#c0f0f0,stroke:#333,stroke-width:1.5px

    style Ecosystem stroke-dasharray: 5 5;
    style FredSystem stroke-width:3px, fill:#f9f9f9

{{< /mermaiddiagram >}}

### 1.3 Kubernetes Deployment

Fred runs as a set of Kubernetes pods, fronted by standard ingress and services. The UI, agentic backend, and knowledge-flow backend are deployed in the fred-app namespace, with configs and secrets managed natively. Storage and identity can either run inside the cluster (e.g., OpenSearch, MinIO, Keycloak) or, as shown here, be consumed as managed services such as S3, OpenSearch/Qdrant, or external IAM. This flexibility allows Fred to adapt seamlessly across Tanzu, KaaS/AKS, S3NS, or GKE.

{{< mermaiddiagram >}}
flowchart TB
    %% === Kubernetes Cluster (minimal) ===
    subgraph Cluster["☸️ Kubernetes Cluster"]
        Ingress["🌐 Ingress (HTTP/S)"]

        %% App namespace
        subgraph AppNS["📦 ns: fred-app"]
            SvcUI["svc/fred-ui"] --> PodUI["pod/fred-ui (React)"]
            SvcAgent["svc/agentic"] --> PodAgent["pod/agentic-backend (LangGraph)"]
            SvcKF["svc/knowledge-flow"] --> PodKF["pod/knowledge-flow (API+MCP)"]

            Secrets["Secrets"]:::cfg
            Config["ConfigMaps"]:::cfg
        end
    end

    %% === Managed services (outside) ===
    subgraph Managed["🌐 Managed Services"]
        IAM["🔑 IAM (Keycloak)"]
        VDB["🔎 Vector DB (OpenSearch | Qdrant)"]
        OBJ["🗃️ Object Storage (S3)"]
    end

    %% === Traffic ===
    Ingress --> SvcUI
    Ingress --> SvcAgent
    Ingress --> SvcKF

    %% App internals
    PodUI -->|WebSocket/REST| PodAgent
    PodAgent -->|MCP/REST| PodKF

    %% KF storage + auth
    PodKF -. "Read/Write Vectors" .-> VDB
    PodKF -. "Read/Write Docs" .-> OBJ
    PodKF -->|Auth Validation| IAM

    %% UI & Agent auth
    PodUI -->|User Auth| IAM
    PodAgent -->|Service Auth| IAM

    %% === Styles ===
    classDef svc fill:#fff3cd,stroke:#7a5b1c,rx:8,ry:8;
    classDef pod fill:#e2ffe2,stroke:#2f6b2f,rx:10,ry:10;
    classDef cfg fill:#f0e1ff,stroke:#4d3a7d,rx:8,ry:8;
    classDef cluster fill:#f9f9f9,stroke:#333,stroke-width:1.5px,rx:12,ry:12;
    classDef managed fill:#f5f5f5,stroke:#666,stroke-dasharray:4 4,rx:12,ry:12;

    class Cluster,AppNS cluster;
    class Managed managed;
    class SvcUI,SvcAgent,SvcKF svc;
    class PodUI,PodAgent,PodKF pod;

{{< /mermaiddiagram >}}


---

## 2. Multi-Agent Orchestration

In Fred, agents can be used in two main ways depending on the complexity of the task.

In the direct invocation mode (2.1), the UI establishes a mono-agent session with one specialized expert. Each expert combines a core LLM endpoint with domain-specific tools such as SQL access, document parsers, or monitoring APIs. This mode keeps interactions simple and efficient: the user selects the right agent for the job, and the agent responds autonomously with its built-in capabilities.

In the leader orchestration mode (2.2), the UI talks to Fred as an orchestrator agent. The leader first validates the request, then plans which steps are needed, and finally delegates to the appropriate experts. This architecture is useful when tasks span multiple domains, or when workflows require coordination between agents. The leader does not replace experts but leverages them, consolidating their outputs into a single, coherent response for the user.

Together, these two modes illustrate Fred’s flexibility: from lightweight, focused expert sessions to multi-agent orchestrations that mirror real-world collaboration.

### 2.1 Direct Invocation

{{< mermaiddiagram >}}
flowchart LR
%% UI
subgraph UI ["🧑‍💻 Fred UI"]
Chat["💬 Chat Interface"]
end

%% Agents registry
subgraph Agents ["🧭 Registered Agents"]
  %% Tessa
  subgraph Tessa ["🧮 Tessa — SQL / Tabular Expert"]
    TessaLLM["🤖 LLM Endpoint"]
    TessaSQL["🔧 SQL Tooling"]
    TessaMCP["🔗 MCP (Tabular/CSV)"]
    TessaREST["🌐 REST Integrations"]
  end

  %% Rico
  subgraph Rico ["📄 Rico — Document / RAG Expert"]
    RicoLLM["🤖 LLM Endpoint"]
    RicoMCP["🔗 MCP (Knowledge-Flow)"]
    RicoVec["🔍 Vector Search Tool"]
    RicoParse["🧰 Document Parsers"]
  end

  %% Sammy
  subgraph Sammy ["📈 Sammy — Monitoring / Ops Expert"]
    SamLLM["🤖 LLM Endpoint"]
    SamMCP["🔗 MCP (Metrics)"]
    SamProm["📊 Prometheus API"]
    SamAlert["🚨 Alerting API"]
  end

  %% Georges
  subgraph Georges ["🧠 Georges — Generalist"]
    GeoLLM["🤖 LLM Endpoint"]
  end
end

%% Invocation paths
Chat -- "mono-agent session" --> Tessa
Chat -- "mono-agent session" --> Rico
Chat -- "mono-agent session" --> Sammy
Chat -- "mono-agent session" --> Georges

%% Styles
classDef ui fill:#c6f6d5,stroke:#333,stroke-width:1.5px,rx:10,ry:10;
classDef group fill:#f9f9f9,stroke:#333,stroke-width:1.5px,rx:12,ry:12;
classDef agent fill:#ffe5cc,stroke:#333,stroke-width:1.5px,rx:12,ry:12;
classDef cap fill:#fffaf0,stroke:#c28a2f,stroke-width:1px,rx:10,ry:10;

class UI ui;
class Agents group;
class Tessa,Rico,Sammy,Georges agent;
class TessaLLM,TessaSQL,TessaMCP,TessaREST,RicoLLM,RicoMCP,RicoVec,RicoParse,SamLLM,SamMCP,SamProm,SamAlert,GeoLLM cap;
{{< /mermaiddiagram >}}

### 2.2 Leader Invocation

Fred can orchestrate **specialized agents** that call different MCP endpoints.

{{< mermaiddiagram >}}
flowchart TB
%% UI
subgraph UI ["🧑‍💻 Fred UI"]
  Chat["💬 Chat Interface"]
end

%% Leader with inner functions
subgraph Leader ["🥭 Fred — Orchestrator Agent"]
    Validate["✅ Validation"]
    Plan["🗂️ Planning"]
    Delegate["📡 Delegation"]
    Validate --> Plan --> Delegate
end

%% Agents registry (light version)
subgraph Agents ["🧭 Registered Experts"]
  Tessa["🧮 Tessa — SQL Expert\n🤖 LLM Endpoint"]
  Rico["📄 Rico — Document Expert\n🤖 LLM Endpoint"]
  Sammy["📈 Sammy — Monitoring Expert\n🤖 LLM Endpoint"]
  Georges["🧠 Georges — Generalist\n🤖 LLM Endpoint"]
end

%% Invocation paths
Chat --> Leader
Leader --> Tessa
Leader --> Rico
Leader --> Sammy
Leader --> Georges

%% Styles
classDef ui fill:#c6f6d5,stroke:#333,stroke-width:1.5px,rx:10,ry:10;
classDef leader fill:#ffd9b3,stroke:#333,stroke-width:1.5px,rx:12,ry:12;
classDef func fill:#fffaf0,stroke:#c28a2f,stroke-width:1px,rx:8,ry:8;
classDef group fill:#f9f9f9,stroke:#333,stroke-width:1.5px,rx:12,ry:12;
classDef agent fill:#ffe5cc,stroke:#333,stroke-width:1.5px,rx:12,ry:12;

class UI ui;
class Leader leader;
class Validate,Plan,Delegate func;
class Agents group;
class Tessa,Rico,Sammy,Georges agent;
{{< /mermaiddiagram >}}



---

