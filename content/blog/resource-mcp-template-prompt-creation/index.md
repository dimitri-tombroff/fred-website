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

## Why It Matters

Traditionally, building technical templates involves complex **UI forms**, endless validation rules, and plenty of opportunities for user frustration. Brontë changes the game:

- It offers an **interactive conversational interface** that guides the user step by step.
- It ensures resources follow the **mandatory YAML + body format** with `---` separators.
- It validates key rules like variable usage for templates, unique identifiers, and library association.
- Users can **iterate via chat** to refine prompts and templates, improving them progressively.
- Once approved, Brontë persists the resource in Fred’s knowledge base using **a LangGraph MCP tool**.

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

Here’s a high-level diagram of the workflow:

{{< mermaiddiagram >}}
flowchart TD
    subgraph UI["🧑 User Interface (React Chat UI)"]
        User[User]
        ChatUI[Chat UI]
        User --> ChatUI
    end

    subgraph AgenticBackend["🧠 Agentic Backend"]
        subgraph Bronte["Brontë - Content Generator Expert"]
            Reasoner[LangGraph Reasoner]
            Toolkit[Content Generator Toolkit]
            MCP[Conditional MCP Tool]
            Reasoner --> Toolkit --> MCP
        end
    end

    subgraph KnowledgeFlow["📚 Knowledge Flow Backend"]
        note1["Manages resources (prompts & templates)"]
        Controller["ResourceController"]
        Service["ResourceService"]
        Store[("(Knowledge Base: Resources)")]

        Controller --> Service --> Store

        Schema["GET /resources/schema"]
        CreateRes["POST /resources"]
        UpdateRes["PUT /resources/{id}"]
        GetRes["GET /resources/{id}"]
        ListRes["GET /resources"]
        DeleteRes["DELETE /resources/{id}"]

        Controller -.-> Schema
        Controller -.-> CreateRes
        Controller -.-> UpdateRes
        Controller -.-> GetRes
        Controller -.-> ListRes
        Controller -.-> DeleteRes
    end

    ChatUI -->|Conversational prompts & iterative editing| Reasoner
    MCP -->|Calls Knowledge Flow endpoints when needed| Controller

    %% Styles
    style UI fill:#cce5ff,stroke:#339,stroke-width:1.5px
    style AgenticBackend fill:#ffddb3,stroke:#b35400,stroke-width:1.5px
    style KnowledgeFlow fill:#d8f8d8,stroke:#2d7a2d,stroke-width:1.5px
    style Store fill:#f0f0f0,stroke:#888,stroke-dasharray: 5,5
    style note1 fill:#e6ffe6,stroke:#2d7a2d,stroke-width:1px,font-style:italic
    style Schema fill:#ffffff,stroke:#888,stroke-dasharray: 3,3
    style CreateRes fill:#ffffff,stroke:#888,stroke-dasharray: 3,3
    style UpdateRes fill:#ffffff,stroke:#888,stroke-dasharray: 3,3
    style GetRes fill:#ffffff,stroke:#888,stroke-dasharray: 3,3
    style ListRes fill:#ffffff,stroke:#888,stroke-dasharray: 3,3
    style DeleteRes fill:#ffffff,stroke:#888,stroke-dasharray: 3,3
{{< /mermaiddiagram >}}

**Step-by-step flow:**
1. The **user** chats with Brontë through the React Chat UI.  
2. The **LangGraph Reasoner** interprets the request and decides whether tools are needed.  
3. The **Content Generator Toolkit** proposes validated templates/prompts.  
4. The **conditional MCP tool** is invoked only when a backend call is necessary.  
5. The **ResourceController** in Knowledge Flow validates and processes the request.  
6. The resource (template or prompt) is persisted in Fred’s **Knowledge Base**.  

---

## Why It’s Astonishing

Instead of **burdening users with static forms**, Brontë delivers a **fluid, conversational experience**:
- Users can ask for examples, corrections, or variations.
- Iterative chat allows **progressive improvement of prompts and templates**.
- The agent ensures compliance without requiring the user to memorize format rules.
- The end result is **higher productivity and fewer errors**, with a UI that feels natural instead of bureaucratic.

---

👉 With Brontë, Fred demonstrates how **agentic UIs** can replace traditional, rigid form-driven workflows. It’s a leap forward in usability, turning complexity into guided collaboration.
