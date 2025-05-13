---
title: "Licensing"
description: "Fred's architecture combines open and inner source components. This page clarifies what’s public and what’s private."
summary: "Understand which parts of Fred are open source, which are internal, and how to extend both through agents and processors."
date: 2023-09-07T16:13:18+02:00
lastmod: 2025-05-13T09:00:00+02:00
draft: false
weight: 910
toc: true
seo:
  title: "Fred Licensing and Architecture Boundaries"
  description: "Learn how Fred blends open source and inner source components: from agents to document processors, and how you can extend them."
  canonical: "https://fredk8.dev/guidance/licensing"
  robots: "index, follow"
---

Check out the new [architecture blog post](/blog/introducing-the-new-fred-architecture-modular-agentic-and-knowledge-aware/) for a full overview of Fred’s modular design. This page focuses on **licensing boundaries** and the distinction between *open source* and *inner source* components.

Fred is an open source initiative that fosters multi-agent experimentation and development.

While not originally intended for production use, Fred can be deployed and extended to serve real-world needs — especially in secure, regulated environments. Its modularity allows you to plug in your own **agents** and **document processors**, many of which are use-case specific and remain internal — what we call *inner source*.

This model powers contributions both within and outside of Thales Services Numériques.

---

## Architecture Overview

The diagrams below summarize the architecture and clarify what’s open vs inner source.

{{< mermaiddiagram >}}
flowchart TD
    subgraph OpenSource["Open Source"]
        FE[Frontend - React]
        BE[Agentic Backend - fred]
        KFlow[Knowledge Flow Backend]
    end

    subgraph InnerSource["Inner Source"]
        KAST[Kast Agent]
        AGENT1[Business Agent 1]
        AGENT2[Business Agent 2]
        PROCESSOR1[Processor A]
        PROCESSOR2[Processor B]
        PROCESSORN[Processor N]
    end

    FE -->|REST / WS| BE
    BE -->|Fetch Data| KFlow
    FE -->|Direct Upload| KFlow
    KFlow -->|Triggers| PROCESSOR1
    KFlow -->|Triggers| PROCESSOR2
    KFlow -->|Triggers| PROCESSORN
    BE --> KAST

    classDef opensource fill:#d0e1ff,stroke:#333,stroke-width:1.5px;
    classDef innersource fill:#fff5cc,stroke:#333,stroke-width:1.5px;
    class FE,BE,KFlow opensource;
    class KAST,AGENT1,AGENT2,PROCESSOR1,PROCESSOR2,PROCESSORN innersource;
{{< /mermaiddiagram >}}


---

## Open Source vs Inner Source

### Open Source (Apache 2.0)

The following components are fully open and available under the `fred-agent` GitHub organization:

- **Frontend**: A React-based chat UI
- **Fred Backend**:
  - FastAPI service for session, streaming, and agent orchestration
  - LangGraph-based agents (e.g. `Leader`, `Dominic`)
- **Knowledge Flow**:
  - Document upload, ingestion, processing, and vector search APIs
  - Includes basic document processors (e.g. text extract, vectorize)
  - Easily extensible to custom pipelines

These form a complete, usable system out of the box — ideal for research, prototyping, and educational use.

---

### Inner Source

Certain agents and processors are specific to Thales or domain-specific deployments. These remain internal:

- **Custom Agents**
  - e.g. `Kast Agent`: specialized for the [Kast Kubernetes distribution](https://thalesgroup.com), with built-in assumptions and integrations for secure workloads
  - Other domain-specific agents for infrastructure, threat analysis, etc.

- **Domain-Specific Document Processors**
  - Pipelines that extract and transform sensitive or highly structured documents
  - Typically save data to custom SQL schemas or internal systems
  - Built with Python and integrated into `knowledge-flow` as plugins

---

## What Are Document Processors?

Document processors are asynchronous modules triggered by the Knowledge Flow backend. They handle:

- 🧾 Content extraction (PDFs, Excel, Word, etc.)
- 🧠 Semantic vectorization (for retrieval)
- 🗄 Structured storage (SQL/NoSQL)

They are:
- Plugin-based
- Triggered automatically by upload
- Defined per use case (e.g. legal docs, architecture specs, contracts)

The open source processors offer generic extraction and embedding.
Inner source processors include richer, domain-tuned pipelines.

---

## What Can You Do With Fred?

### With Open Source Only

You can:
- Run a working local system with UI + agents + document ingestion
- Upload documents and chat with agents like `Leader` or `Dominic`
- Extend the system with your own:
  - 🧠 Agents or Leaders
  - 📄 Document processors
- Use it as a base for research, demos, or internal tooling

### With Inner Source or Extensions

You can:
- Deploy in secure environments (e.g. Kast/Kubernetes)
- Use preconfigured pipelines, processors, and agents
- Scale across teams or production clusters
- Integrate with internal services (S3, PostgreSQL, monitoring, etc.)

---

Fred gives you the foundation to build what you need — whether you’re a research team, product group, or infrastructure developer.

💡 Curious how to get started?  
Check out the [documentation](/guidance/overview) or explore the [source on GitHub](https://github.com/fred-agent).
