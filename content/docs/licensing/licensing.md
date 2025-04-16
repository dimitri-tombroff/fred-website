---
title: "Licensing"
description: "Architecture and design of the Fred Python backend"
summary: ""
date: 2023-09-07T16:13:18+02:00
lastmod: 2023-09-07T16:13:18+02:00
draft: false
weight: 910
toc: true
seo:
  title: ""
  description: ""
  canonical: ""
  robots: ""
---

Checkout the high-level [architecture blog post](/blog/fred-design-and-architecture) for an overview of Fred's technical foundation. This page focuses on licensing boundaries and the distinction between *open source* and *inner source* components within Fred's architecture.

Fred is an open source initiative that fosters multi-agent experimentation and development.  
While not originally intended for production use, Fred can be easily deployed and industrialized for real-world environments such as Kubernetes clusters.
More importantly, Fred is designed to help you *build and integrate your own agents*. In practice, this means that many real-world use cases will involve components that are not part of the open source core, but are developed internally — what we call *inner source*.

This is exactly the case at Thales Services Numériques. While we contribute to Fred’s open source backbone, we also build inner source components that transform Fred into a full-featured, production-ready framework tailored for business needs.

## Architecture Overview

The diagram below summarizes the architecture and clearly separates open source from inner source components:

{{< mermaiddiagram >}}
flowchart TD
    subgraph OpenSource["Open Source"]
        FE[Frontend]
        BE[Agentic Backend]
        Kubernetes[Kubernetes Agent]
    end

    subgraph InnerSource["Inner Source"]
        DOC[Document Store]
        KAST[Kast Agent]
        CLEAR1[Document Extractor 1]
        CLEAR2[Document Extractor 2]
        CLEAR3[Document Extractor n]
    end

    FE -->|REST API| BE
    BE -->|REST/Local API| Kubernetes
    BE -->|REST/Local API| KAST
    FE -->|REST API| DOC
    DOC -->|Triggers| CLEAR1
    DOC -->|Triggers| CLEAR2
    DOC -->|Triggers| CLEAR3

    classDef opensource fill:#d0e1ff,stroke:#333,stroke-width:1.5px;
    classDef innersource fill:#fff5cc,stroke:#333,stroke-width:1.5px;
    class FE,BE,Kubernetes opensource;
    class DOC,KAST,CLEAR1,CLEAR2,CLEAR3 innersource;
{{< /mermaiddiagram >}}

## Open Source vs Inner Source

- **Open source** (Apache 2.0 licensed) components are publicly available and include:
  - The **frontend** (React/TypeScript)
  - The **multi-agent backend** (Python FastAPI)
  - A Kubernetes-aware agent interface: Fred includes a generic agent capable of discovering, describing, and analyzing any Kubernetes application. This agent provides a foundational layer to help other agents understand:
    - The structure of Kubernetes resources (Deployments, Services, StatefulSets, etc.)
    - The configuration and behavior of workloads
    - Common patterns and misconfigurations

- **Inner source** components are **only available to Thales teams**, or externally through licensing agreements. These include:
  - The **document store backend**
  - Specialized **custom agents** (e.g., Kast Agent)
    - Kast is a Kubernetes distribution maintained by Thales Services Numériques, tailored for secure, data-centric applications. It includes opinionated defaults and pre-integrated components for authentication, data flow, monitoring, and storage.
  - A family of **Document Extractors**, tailored to use-case-specific needs

Kast is a Kubernetes distribution maintained by Thales Services Numériques, tailored for secure, data-centric applications. It includes opinionated defaults and pre-integrated components for authentication, data flow, monitoring, and storage.
The Kast Agent is a specialized extension of the generic Kubernetes agent. It understands the specific architecture and conventions of Kast environments.

## What Are Document Extractors?

The "Document Extractors" shown in the diagram are **use case-specific extensions**, designed to process domain-relevant documents (PDF, Excel, DOCX, etc.) that are uploaded to the system.

They are:

- Typically **implemented in Python**
- Packaged as part of **asynchronous pipelines**
- Automatically triggered whenever a new document is uploaded to the **Document Store**

Their role is to:

- Extract relevant content
- Structure it
- Inject it into the **OpenSearch vector store**
- Make it available for **RAG-based** (Retrieval-Augmented Generation) workflows

These extractors are **not generic** and cannot be provided as part of the open source foundation — because they depend on:

- The target business domain
- The type of documents
- The structure of the information you want to extract

The Fred framework, however, **makes it easy to plug them in**, configure them, and trigger them based on document uploads — allowing rapid customization.

## What Can You Do with Open versus Inner Source

✅ With Open Source Only
Fred’s open source foundation gives you everything you need to get started:

- Launch a complete demo using the frontend and multi-agent backend
- Add your own agents — build and integrate new capabilities with minimal effort
- Explore multi-agent orchestration, delegation, and communication
- Create your own MVP for agent-based applications, using Fred as a lightweight and modular base

Fred is especially useful for innovation teams and researchers who want to prototype quickly, experiment with agent workflows, and validate ideas without building infrastructure from scratch.

🔒 With Open + Inner Source

If you're within Thales or have access to the inner source components, Fred becomes a ready-to-deploy platform for secure, intelligent, data-centric applications:

- Enable document ingestion and processing, with custom extractors and RAG pipelines
- Leverage Kast-specific capabilities, including secure defaults and integration with trusted components
- Deploy fully to Kubernetes using Helm charts and preconfigured pipelines
- Build complete, production-grade applications that combine chat agents, LLMs, Kubernetes insights, and secure document handling