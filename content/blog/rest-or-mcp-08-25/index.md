---
title: "MCP vs REST for RAG in Fred: Why We Run Both"
description: "Fred ships two families of Retrieval-Augmented Generation (RAG) agents: REST-first (Rico, Rico Pro) and tool-first via MCP (Dominic). Here’s what each approach buys you and how we compare them."
summary: "Fred uses REST for graph-driven RAG (Rico, Rico Pro) and MCP for tool-driven RAG (Dominic). Running both lets us measure latency, reliability, governance, and developer ergonomics—without changing our UI or schemas."
date: 2025-08-17T10:00:00+02:00
lastmod: 2025-08-17T10:00:00+02:00
draft: false
weight: 42
categories: [architecture, agents, rag]
tags:
  - rag
  - mcp
  - rest
  - langgraph
  - tools
  - governance
  - vector-search
contributors: [Thomas Hedan, Simon Cariou, Alban Capitant, Dimitri Tombroff]
pinned: false
homepage: false
seo:
  title: "MCP vs REST for RAG in Fred"
  description: "Fred compares tool-first MCP against graph-first REST for RAG agents, using a shared VectorSearchHit schema to evaluate trade-offs."
  canonical: "https://fredk8.dev/blog/mcp-vs-rest-rag"
  robots: "index, follow"
---

As part of the [Fred](https://fredk8.dev) platform, we’re exploring **two integration styles** for Retrieval-Augmented Generation (RAG):

- **REST-first** agents — **Rico** and **Rico Pro** orchestrate retrieval directly in their graphs using a tiny HTTP client.  
- **Tool-first (MCP)** agent — **Dominic** binds the MCP tool and lets the model decide when to call it.

Both paths return the **same Pydantic schema** — `VectorSearchHit` — so our UI, citations, and analytics stay consistent while we experiment.

---

## The Core Setup

We standardized on a single hit model:

```python
# fred_core/vector_search.py
class VectorSearchHit(BaseModel):
    content: str
    page: int | None = None
    section: str | None = None
    uid: str
    title: str
    # ... (author, created, modified, file_name, tags, score, rank, etc.)
```

Everything that does retrieval — HTTP clients, MCP tools, or services — **returns `VectorSearchHit[]`**. That’s what makes A/B comparisons honest.

---

## Two Paths, One Schema

### Graph-First (REST): Rico & Rico Pro

- The graph decides **when** to retrieve, rephrase, grade, or stop.  
- Retrieval is a direct HTTP call via a small client (`VectorSearchClient`).  
- The agent attaches `[hit.model_dump(), …]` to `response_metadata["sources"]` for the UI.

**Strengths**

- Lowest latency, minimal moving parts.  
- Fully deterministic orchestration (retries, rerank, grader thresholds).  
- Easy to unit test (pure Python, no tool runtime).

**Trade-offs**

- Agents must ship credentials/config for each API.  
- Adding a new tool means updating code & deployment.

---

### Tool-First (MCP): Dominic

- The model is bound to an MCP tool (`search_documents_using_vectorization`).  
- The model decides if/when to call the tool; the toolkit injects runtime context (e.g., tag filters).  
- Return type is still `VectorSearchHit[]`, validated and attached to metadata.

**Strengths**

- **Discovery & governance**: tools are listed, typed, and centrally authorized.  
- **Provider-agnostic**: any MCP-aware model can call the same tool contract.  
- **Credential hygiene**: secrets live on the server, not in agents.

**Trade-offs**

- Extra hop and tool-calling roundtrip can add latency.  
- Less deterministic than explicit graph control; requires good tool prompts.

---

## Why We Run Both

We want evidence, not vibes. Running both in production-like scenarios lets us compare:

| Dimension          | REST (Rico/Rico Pro)               | MCP (Dominic)                            |
|-------------------:|------------------------------------|------------------------------------------|
| Latency            | 🟢 Usually lower                   | 🟡 Slightly higher (tool call overhead)  |
| Determinism        | 🟢 Full graph control              | 🟡 Model decides when/what to call       |
| Governance         | 🟡 App-level                       | 🟢 Centralized in MCP server             |
| Credential Scope   | 🟡 Distributed in agents           | 🟢 Centralized & rotated server-side     |
| Evolvability       | 🟡 Code deploy to add a tool       | 🟢 Tool discovery/versioning via MCP     |
| Testing Simplicity | 🟢 Pure Python unit tests          | 🟡 Needs MCP client/mocks                |

Because both emit `VectorSearchHit`, the **UI, citations, and analytics** are identical. That lowers the cost of experimentation.

---

## Minimal Code Sketches

### REST retrieval (Rico/Rico Pro)

```python
hits = search_client.search(query=question, top_k=5, tags=tags)
answer = await model.ainvoke([HumanMessage(content=prompt_from(hits))])
answer.response_metadata["sources"] = [h.model_dump() for h in hits]
```

### MCP retrieval (Dominic)

```python
response = model.invoke([base_prompt] + state["messages"])
for msg in state["messages"]:
    if isinstance(msg, ToolMessage) and msg.name == "search_documents_using_vectorization":
        data = msg.content if isinstance(msg.content, (list, dict)) else json.loads(msg.content)
        hits = hits_adapter.validate_python(data)  # -> List[VectorSearchHit]
        response.response_metadata["sources"] = (response.response_metadata.get("sources", []) +
                                                 [h.model_dump() for h in hits])
```

Same output shape, different control surface.

---

## How We’ll Evaluate

- **P50/P95 latency** from “user message” → “final answer”  
- **Hit quality** (human spot checks + grader pass rates)  
- **Failure modes** (timeouts, empty hits, schema errors)  
- **Ops ergonomics** (credential rotation, rollout, observability)  
- **Dev velocity** (time to wire a new tool vs update a service)

We’ll publish our notes and any sample configs as we go.

---

## Takeaways (So Far)

- Use **REST** when you want *tight, testable control* and the lowest possible latency.  
- Use **MCP** when you need *governed, discoverable tools* and want to decouple agent code from infrastructure specifics.  
- Keep a **shared schema** (`VectorSearchHit`) so switching paths doesn’t ripple into your UI or analytics.

Running both approaches in parallel is the point: Fred is a lab for building serious, evaluable agent systems.

---

## Want to Try?

- Check out Rico/Rico Pro (REST) and Dominic (MCP) in the repository.  
- Swap agents without touching the UI — they both return `VectorSearchHit`.  
- Send us your data: latency, failure logs, and anecdotes help tune defaults.

Let’s keep the experiments honest and the abstractions thin.
