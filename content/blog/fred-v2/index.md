---
title: "Introducing the New Fred Architecture: Modular, Agentic, and Knowledge-Aware"
description: "Fred has evolved into a modular, agentic, and knowledge-aware system. This post introduces the new architecture and its components."
summary: "Fred is now composed of three modular components: a React UI, an agentic backend using LangGraph, and a knowledge-centric backend for document processing. Learn how it all fits together."
date: 2025-05-07T16:27:22+02:00
lastmod: 2025-05-07T16:27:22+02:00
draft: false
weight: 50
categories: [architecture, announcement]
tags:
  - langgraph
  - agents
  - knowledge-flow
  - react
  - backend
  - vector-search
  - open-source
  - fred
contributors: [Kevin Denis, Dorian Finel-Bacha, Julien Ornat, Fabien Le-Solliec, Dimitri Tombroff]
pinned: false
homepage: false
seo:
  title: "Fred Architecture 2.0 — Modular, Agentic, and Knowledge-Aware"
  description: "Explore the new architecture of the Fred project, featuring a modular agentic backend, a powerful knowledge-flow service, and a modern React UI. Designed for multi-agent orchestration and document-aware LLMs."
  canonical: "https://fredk8.dev/blog/introducing-the-new-fred-architecture"
  robots: "index, follow"
---


The Fred project has reached an exciting new milestone.

What began as a single backend chatbot system has now evolved into a modular, agentic, and knowledge-aware 
architecture that separates concerns, simplifies extension, and empowers contributors to build powerful AI experiences on top of open infrastructure.

In this post, we’re excited to introduce the new design of Fred, highlight the core building blocks, and explain how you can get involved.

---

## What Changed?

Previously, Fred was a monolithic system that handled chatbot logic, agent behavior, and some starting document storage all in one place. 
As the project matured, this design became limiting — both in terms of extensibility and collaboration.

Now, Fred has been restructured into **three distinct components**:

- A **modular agentic backend** (`fred`)
- A **knowledge-centric backend** (`knowledge-flow`)
- A **real-time React UI** for user interaction

{{< mermaiddiagram >}}
flowchart TD
    subgraph UserInterface["🧑 User Interface (React UI)"]
        UI[Chat UI]
    end

    subgraph AgenticBackend["🧠 Fred Agentic Backend"]
        Fred[LangGraph Orchestrator]
    end

    subgraph KnowledgeFlow["📚 Knowledge Flow Backend"]
        KFlow[Document & Data API]
        Vectors[Vectorization / SQL Pipeline]
        KFlow -->|Triggers| Vectors
    end

    UI -->|WebSocket + REST| Fred
    UI -->|REST| KFlow
    Fred -->|Vector search / Retrieval| KFlow

    style UI fill:#d0e1ff,stroke:#333,stroke-width:1.5px
    style Fred fill:#ffe5cc,stroke:#333,stroke-width:1.5px
    style KFlow fill:#e2ffe2,stroke:#333,stroke-width:1.5px
    style Vectors fill:#f8f8f8,stroke:#888,stroke-dasharray: 5,5
{{< /mermaiddiagram >}}


---

### Core Components

#### 1. **Fred Agentic Backend**

The `fred` backend is the **brain** of the system. It manages chat sessions, agent behaviors, and message streaming.

- Built around [LangGraph](https://github.com/langchain-ai/langgraph) to model agent workflows
- Supports multi-agent delegation (e.g. `Leader`, `Dominic`, or others)
- Exposes WebSocket and REST APIs for chatbot sessions
- Integrates with external knowledge backends to perform document-aware reasoning

#### 2. **Knowledge-Flow Backend**

The `knowledge-flow` app is responsible for all things related to **documents and structured data**.

- Handles file upload, content extraction, and semantic vectorization
- Supports flexible pipelines — from PDF ingestion to SQL export
- Enables agents like `Dominic` to retrieve documents or search by vector
- Exposes its own standalone API that is used both by the UI and by agents

### 3. **React Frontend (Chat UI)**

The React UI provides a clean, interactive chat experience.

- Connects to both the `fred` and `knowledge-flow` backends
- Supports streaming responses via WebSocket and streaming REST endpoints
- Allows users to select agents and interact in real time
- Provides file/audio upload and message history

---

## How They Work Together

Here’s a typical flow in the new architecture:

1. A user uploads a document via the UI → it's sent to `knowledge-flow`
2. The user starts a chat with an agent like `Dominic` → the request is routed to `fred`
3. `fred` streams the response while optionally querying `knowledge-flow` behind the scenes (e.g. for semantic search)
4. The user sees a live, intelligent conversation based on private or public documents

Each component does one job well, and together they form a robust RAG (retrieval-augmented generation) framework.

{{< mermaiddiagram >}}
flowchart TD
    subgraph UI["React UI"]
        User["🧑 User"]
        Chat["💬 Chat Interface"]
        Upload["📄 Document Upload"]
    end

    subgraph Fred["Agentic Backend (fred)"]
        WebSocket["🔌 WebSocket / REST API"]
        SessionMgr["🧠 Session & Agent Manager"]
        Agents["👥 Agents (Leader, Dominic, etc.)"]
    end

    subgraph Knowledge["Knowledge Flow Backend"]
        API["📡 API: Upload / Query"]
        Vector["🧠 Vector Store"]
        SQL["🗃️ Structured Data (SQL)"]
        Processors["⚙️ Document Processors"]
    end

    User --> Chat
    Chat --> WebSocket
    Upload --> API

    WebSocket --> SessionMgr
    SessionMgr --> Agents
    Agents -->|Fetch vectors or structured data| API

    API --> Vector
    API --> SQL
    API --> Processors

    Processors --> Vector
    Processors --> SQL

    classDef ui fill:#d0e1ff,stroke:#333,stroke-width:1.5px;
    classDef backend fill:#fff5cc,stroke:#333,stroke-width:1.5px;
    classDef storage fill:#e2ffe2,stroke:#333,stroke-width:1.5px;

    class Chat,Upload ui;
    class WebSocket,SessionMgr,Agents backend;
    class API,Vector,SQL,Processors backend;
{{< /mermaiddiagram >}}

---

## Why This Matters

This architecture enables:

- ✅ Clear separation of concerns
- ✅ Easier contribution to individual parts (agents, UI, retrieval)
- ✅ Scalable and composable agent workflows
- ✅ Real-world use cases like private search, document analysis, and structured Q&A

---

## Get Involved

We’re actively building and welcoming contributors!

- **Check out the code:**
  - [fred-agent/fred](https://github.com/fred-agent/fred)
  - [fred-agent/knowledge-flow](https://github.com/fred-agent/knowledge-flow)

- **Read the docs:** [https://fredk8.dev](https://fredk8.dev)

- **Open issues, suggest ideas, or build your own expert agent!**

Stay tuned for upcoming deep dives on:
- How to write your own LangGraph agent
- How to extend `knowledge-flow` for domain-specific processing
- And more!

