---
title: "Brontë: A New Content Generator Agent in Fred"
description: "Meet Brontë, the Content Generator Expert agent in Fred, designed to simplify the creation of technical templates and prompts through an interactive AI-driven UI."
summary: "Instead of relying on traditional form-based UIs, Brontë guides users step by step in designing complex templates and prompts, ensuring correct formats and properties, and saving them directly to Fred’s knowledge base using MCP."
date: 2025-08-18T10:00:00+02:00
lastmod: 2025-08-18T10:00:00+02:00
draft: false
weight: 30
categories: [agents, content, automation]
tags:
  - brontë
  - content-generator
  - mcp
  - fred
contributors: [Simon Cariou]
pinned: false
homepage: false
seo:
  title: "Brontë, the Content Generator Agent in Fred"
  description: "Discover how Brontë, a new Fred agent, makes template and prompt creation conversational, guiding users step by step and saving resources directly to the knowledge base with MCP."
  canonical: "https://fredk8.dev/blog/bronte-content-generator"
  robots: "index, follow"
---

## Introducing Brontë, the Content Generator Expert

Fred now includes a new agent: **Brontë**, the **Content Generator Expert**.  
Brontë is designed to help users create and manage structured resources such as **templates** and **prompts**, which follow a precise format and must be validated before being accepted by the Knowledge Flow backend.

---

## Impact for Users

Traditionally, building technical templates involves complex **UI forms**, endless validation rules, and plenty of opportunities for user frustration. Brontë changes the game. It offers an interactive conversational interface that guides the user step by step, validates key rules like variable usage, unique identifiers, and library association, and allows users to refine prompts and templates progressively through chat. Once approved, Brontë saves the resource directly into Fred’s knowledge base using a LangGraph MCP tool.  

This is more than a simplification: it shows how an agent can act as a **co-designer of knowledge assets**, turning what used to be a technical chore into a collaborative experience.

---

## How It Works

Brontë relies on a synergy of orchestration, toolkits, and conditional MCP calls:

- **LangGraph orchestration** to combine reasoning and tool use.  
- A **Content Generator Toolkit** that contains tools for creating and validating prompts/templates.  
- A **conditional MCP tool** that Brontë invokes only when it needs to call the Knowledge Flow backend.  
- A **base system prompt** that enforces strict content rules.  

Through conversation, the user explains what they want. Brontë then:  
1. Suggests a correctly formatted template or prompt.  
2. Verifies details like `id`, `kind`, and placeholders.  
3. Seeks user approval before finalizing.  
4. Executes the **MCP tool**, which calls the appropriate Knowledge Flow backend endpoints to persist or update the resource.  

---

### High-level Workflow

The first diagram shows the overall flow from the user, through Brontë, to the Knowledge Flow backend:

<div style="text-align:center;">
{{< mermaiddiagram >}}
flowchart TB
  %% --- UI ---
  subgraph UI["🧑 User Interface (React Chat UI)"]
    User[User]
    ChatUI[Chat UI]
    User --> ChatUI
  end

  %% --- Agentic Backend ---
  subgraph AgenticBackend["🧠 Agentic Backend"]
    subgraph Bronte["Brontë – Content Generator Expert"]
      Reasoner[LangGraph Reasoner]
      Toolkit[Content Generator Toolkit]
      MCP[Conditional MCP Tool]
      Reasoner --> Toolkit --> MCP
    end
  end

  %% --- Knowledge Flow (abstract) ---
  subgraph KnowledgeFlow["📚 Knowledge Flow Backend"]
    ResourceAPI["Resources API"]
    KB[("(Knowledge Base)")]
    ResourceAPI --> KB
  end

  ChatUI -->|Conversational prompts| Reasoner
  MCP -->|Persist / Update| ResourceAPI

  %% --- Styles (Standard Pro palette) ---
  style UI fill:#e3f2fd,stroke:#1565c0,stroke-width:1.5px,color:#000
  style AgenticBackend fill:#fff3e0,stroke:#ef6c00,stroke-width:1.5px,color:#000
  style Bronte fill:#90caf9,stroke:#1565c0,stroke-width:1.5px,color:#000
  style KnowledgeFlow fill:#e8f5e9,stroke:#2e7d32,stroke-width:1.5px,color:#000
  style KB fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray: 5,5,color:#000
  style ResourceAPI fill:#ffffff,stroke:#2e7d32,stroke-dasharray: 3,3,color:#000
{{< /mermaiddiagram >}}
</div>

---

### Backend Details

The second diagram focuses specifically on the **Knowledge Flow backend** and the API surface it provides to Brontë:

{{< mermaiddiagram >}}
flowchart TB
  subgraph KnowledgeFlow["📚 Knowledge Flow Backend"]
    Controller["ResourceController"]
    Service["ResourceService"]
    Store[("(Knowledge Base: Resources)")]
    Controller --> Service --> Store

    API["Resources API
    ───────────────
    • GET /resources/schema
    • POST /resources
    • PUT /resources/{id}
    • GET /resources/{id}
    • GET /resources
    • DELETE /resources/{id}"]

    Controller -. interacts with .-> API
  end

  %% --- Styles (Standard Pro palette) ---
  style KnowledgeFlow fill:#e8f5e9,stroke:#2e7d32,stroke-width:1.5px,color:#000
  style Controller fill:#e3f2fd,stroke:#1565c0,stroke-width:1.5px,color:#000
  style Service fill:#fff3e0,stroke:#ef6c00,stroke-width:1.5px,color:#000
  style Store fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray: 5,5,color:#000
  style API fill:#ffffff,stroke:#2e7d32,stroke-dasharray: 3,3,color:#000
{{< /mermaiddiagram >}}

**Step-by-step flow:**  
1. The **user** chats with Brontë through the React Chat UI.  
2. The **LangGraph Reasoner** interprets the request and decides whether tools are needed.  
3. The **Content Generator Toolkit** proposes validated templates/prompts.  
4. The **conditional MCP tool** is invoked only when a backend call is necessary.  
5. The **ResourceController** in Knowledge Flow validates and processes the request.  
6. The resource (template or prompt) is persisted in Fred’s **Knowledge Base**.  

---

## The Impact

Brontë shifts the way users interact with complex resources. Instead of wrestling with rigid forms and validation rules, they can refine prompts and templates through a natural conversation. Examples, corrections, and variations emerge step by step until the resource is ready to be stored. The process is lighter, less error-prone, and feels more like collaboration than bureaucracy.  

It is also a tangible example of Fred’s architecture at work: open source, packaged under Apache 2.0, and deployable on a laptop, a single server with Docker Compose, or Kubernetes. Brontë shows what can be built by a small team focusing on transparency and practicality, and why openness matters. By running on-premise as easily as in the cloud, Fred makes space for experimentation, adaptation, and innovation without locking anyone in.  

Brontë is not about grand claims. It is about showing that agentic UIs can already bring real value today, in a way that is accessible, reproducible, and collaborative.
