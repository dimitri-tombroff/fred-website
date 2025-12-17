---
title: "Richard vs Rico — Agentic Duel in Fred"
description: "Richard (GraphRAG) and Rico (reflective RAG) compared in Fred’s agentic backend, including faithfulness and relevancy results."
summary: "A comparison of Richard’s graph-centric RAG and Rico’s reflective RAG in Fred, including architecture and evaluation metrics."
date: 2025-12-17T12:07:05+01:00
lastmod: 2025-12-17T12:07:05+01:00
draft: false
weight: 6
categories: [agents, architecture]
tags:
  - rag
  - graphrag
  - graph
  - langgraph
  - agentic
contributors: [Thomas Hedan]
pinned: false
homepage: false
seo:
  title: "Richard vs Rico — Agentic Duel in Fred"
  description: "Richard (GraphRAG) and Rico (reflective RAG) compared in Fred’s agentic backend, including faithfulness and relevancy results."
  canonical: "https://fredk8.dev/blog/richard-vs-rico-agentic-duel"
  robots: "index, follow"
---

In Fred, the agentic-backend is the core of the AI capabilities. It is a Python server orchestrating intelligent agents using FastAPI and LangGraph, capable of reasoning, interacting with documents, and generating answers from external knowledge.

Among these agents, there are classic RAG (Retrieval-Augmented Generation) mechanisms — such as Rico — as well as more advanced concepts explored with Richard, combining graphiti / graphrag and OpenAI.

## Contextualizing RAG in Fred: what does agentic RAG mean ?

In Fred, a RAG agent is not just a rigid pipeline query → retrieval → generation as in traditional RAG systems. Instead, it is an agentic workflow in which:

- The agent decides when to trigger information retrieval.
- It can evaluate the quality of its results (both documents and answers).
- It can rewrite queries, rerank results, or re-launch retrieval if results are not satisfactory.
- Each step is orchestrated as a state graph using LangGraph.

This approach is inspired by Agentic RAG, a paradigm in which the agent actively makes decisions throughout the RAG process, rather than relying on a static RAG pipeline.

## Rico: the reflective and pragmatic RAG agent

Rico is Fred’s document expert agent. In simple terms:

- Objective: answer precise questions using documents from the Knowledge Flow.
- Approach: first retrieves relevant documents, then grades and reranks them, generates an answer, and finally performs self-evaluation.

It implements a loop inspired by Self-RAG, where, if the answer is deemed insufficient, the query is rewritten and the process is retried.

The internal architecture of a RAG agent in Fred (i.e., retrieval → grading → generation → answer grading → retry) is expressed with LangGraph, making Rico modular, declarative, and observable.

What Rico does particularly well:

- Pre-filtering and reranking documents to reduce noise.
- Self-evaluation of answers, capable of triggering multiple cycles until a satisfactory response is produced.
- Decision traceability (useful for auditability and metrics).

## Richard: the graph-based agent (GraphRAG / Graphiti + OpenAI)

Richard explores another dimension of RAG:

Instead of considering only text snippets, Richard structures knowledge as semantic graphs.

This graph links entities, concepts, and passages, and can be exploited for logical multi-hop reasoning (e.g., “How is X related to Y through Z?”).

This type of pipeline corresponds to what is commonly referred to as GraphRAG or graph-centric RAG, where structured relationships enrich both retrieval and generation.

The core idea behind graphrag is to use graph structures to go beyond simple vector search, capture complex relationships between entities and concepts, improve contextual relevance, and reduce hallucinations.

## Architecture: library-level graph ingestion in Fred

The knowledge flow processes items one by one, but GraphRAG needs a complete corpus to build a coherent graph. In Fred terms, that corpus is a library. To support this, the author designed a library-level output processor that runs on an entire library, uses graphiti to extract entities and relations, and loads them into Neo4j. This ingestion step is packaged as a separate application rather than embedded in Knowledge Flow, keeping the architecture modular and avoiding dependency conflicts. It also makes it easy to launch the ingestion as an on-demand Kubernetes job when a library needs to be processed. Once the graph is built, a dedicated controller exposes an MCP interface that Richard uses for graph-aware retrieval.

{{< mermaiddiagram >}}
%%{init: {"themeVariables": {"fontSize": "16px"}}}%%
flowchart LR
  subgraph KF["Knowledge Flow"]
    KFLib["Library (full corpus)"]
  end

  subgraph GOP["Graph Output Processor App"]
    Graphiti["Graphiti extraction"]
    Neo4j["Neo4j graph store"]
  end

  subgraph MCP["Graph MCP Controller"]
    MCPApi["MCP Interface"]
  end

  subgraph AB["Fred Agentic Backend"]
    Richard["Richard (GraphRAG agent)"]
  end

  KFLib -->|"library-level output"| Graphiti
  Graphiti -->|"entities + relations"| Neo4j
  Neo4j -->|"graph queries"| MCPApi
  Richard -->|"graph retrieval"| MCPApi

  style KF fill:#E9FFE9,stroke:#2E6B2E,stroke-width:1.2px
  style GOP fill:#FFF7E6,stroke:#7A4A21,stroke-width:1.2px
  style MCP fill:#E6F7FF,stroke:#1C6B8A,stroke-width:1.2px
  style AB fill:#FFEFE0,stroke:#7A4A21,stroke-width:1.2px

  style KFLib fill:#F4FFF4,stroke:#2E6B2E,stroke-dasharray: 5 4
  style Graphiti fill:#FFF2CC,stroke:#6B5A1F,stroke-width:1.4px
  style Neo4j fill:#E2F0FF,stroke:#1C6B8A,stroke-width:1.2px
  style MCPApi fill:#E6F7FF,stroke:#1C6B8A,stroke-width:1.2px
  style Richard fill:#FFD9B3,stroke:#7A4A21,stroke-width:1.4px
{{< /mermaiddiagram >}}

## Conceptual comparison — Rico vs Richard

| Criterion | Rico (Reflective Self-RAG) | Richard (Graph-centric / GraphRAG) |
| ------------------------------ | ------------------------------------------------------- | --------------------------------------------------------------- |
| Type of RAG | Agentic RAG based on re-retrieval, reranking, grading | GraphRAG — RAG enriched with knowledge graphs |
| Agentic decision-making | Yes, autonomous reflective loop | Yes, with graph traversal for contextualization |
| Knowledge management | Vector store + grading + retrieval | Entity graphs with explicit relationships |
| Best suited for | Precise, robust factual answers | Multi-step reasoning / conceptual links |
| Explainability | Traceability of reranking and phases | Explicit graph structures linking concepts |
| Complexity | Moderate | High (graph construction and exploitation) |

In practice:

- Rico is more pragmatic and robust for questions grounded in large document collections (PDFs, internal guides, procedures, etc.).
- Richard is better suited for complex queries requiring a deep understanding of relationships between elements in the knowledge base.

## Empirical evaluation in Fred: Richard vs Rico

Beyond architectural differences, Richard (GraphRAG) and Rico (reflective RAG with reranking) were evaluated through a series of comparative tests, directly aligned with the use cases of Fred’s agentic backend.

Both agents were submitted to the same queries, on the same corpus, with evaluation based on two key metrics:

- **Faithfulness score**: measures how faithful the answer is to the retrieved sources.
- **Answer relevancy score**: measures the overall relevance of the answer with respect to the question.

Each test directly compares GraphRAG vs RAG, with a win / tie / loss verdict from the perspective of GraphRAG.

| Metric | GraphRAG (Richard) | RAG (Rico) |
| -------------------------- | ------------------ | ---------- |
| Faithfulness score | 0.7945 | 0.7419 |
| Answer relevancy score | 0.8781 | 0.8127 |

## Experimental results — GraphRAG vs RAG comparison

The performance of Richard (GraphRAG) and Rico (reflective RAG) was evaluated on a set of 47 comparative tests, conducted on the same corpus with identical queries.
The results are analyzed from the perspective of GraphRAG, using win / tie / loss verdicts.

| Metric | GraphRAG wins | Ties | Losses | Weighted win rate |
| -------------------------- | ------------------ | -------- | -------- | ---------------- |
| Faithfulness score | 20 | 14 | 13 | 57.4 % |
| Answer relevancy score | 17 | 21 | 9 | 58.5 % |

Across both evaluated metrics, GraphRAG achieves a win rate above 57%, indicating a systematic advantage over a classic RAG enriched with reranking and self-evaluation.

The faithfulness score shows that GraphRAG more frequently produces answers better grounded in the sources, suggesting reduced drift associated with purely text-based context aggregation.

The answer relevancy score confirms a better alignment between the generated answer and the intent of the question, particularly for queries involving multiple documents or implicit relationships.


## References

- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)
- [GraphRAG documentation](https://microsoft.github.io/graphrag/)
- [Self-RAG: Learning to Retrieve, Generate, and Critique](https://selfrag.github.io/)
