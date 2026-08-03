---
title: "RAG That Pulls Its Weight: How Fred’s Retrieval Stack Leveled Up"
description: "A deep dive into how Fred’s document backbone now pairs OpenSearch 2.19+, vector semantics, and UI controls to deliver grounded answers."
summary: "Fred’s latest release strengthens retrieval: Lucene HNSW with cosine, semantic/hybrid/strict modes, corpus/global scope controls, chunk visibility, and attachment summaries injected into context. This post explains the why and the how."
date: 2025-12-11T17:00:00+02:00
lastmod: 2025-12-11T17:00:00+02:00
draft: false
weight: 50
categories: [platform, update]
tags:
  - rag
  - vector-search
  - opensearch
contributors: ["Romain Perennes", "Dimitri Tombroff", "Simon Cariou"]
pinned: false
homepage: false
seo:
  title: "RAG That Pulls Its Weight: How Fred’s Retrieval Stack Leveled Up"
  description: "See how Fred’s upgraded document backbone—OpenSearch 2.19+, semantic/hybrid/strict modes, scope controls, chunk visibility, and attachment summarization—delivers more trustworthy answers."
  canonical: ""
  robots: "index, follow"
---

Fred has always been about trustworthy, grounded answers. In the last month we pushed a set of retrieval upgrades that make the document backbone faster, clearer, and more controllable for anyone who simply wants answers with receipts.

Most of our users run Fred on-premise because their documents are sensitive, regulated, or simply too valuable to entrust to public-cloud LLM APIs. That makes retrieval quality and control non-negotiable: corporate corpora are complex, access-scoped, and often enormous. This post explains how the new stack serves those realities while staying approachable to teams that just want reliable answers from their own data.

---

## RAG Core Architecture: What We Built and Why

Retrieval-augmented generation (RAG) stands on three pillars: vectors that accurately capture meaning, controls that let you widen or narrow the search surface, and enough visibility that users trust the answers they see. If semantic similarity drifts, you start from the wrong evidence. If scope is fixed, you can’t serve both “corpus-only” compliance and “bring in more context” exploration. And if users can’t see or steer what’s happening, confidence erodes. The work in this release reinforces all three pillars so that grounding is both precise and observable.

---

## Vectors, Plainly Explained

Every document chunk is turned into a vector: a long list of numbers that captures meaning. Similar texts have vectors that “point” in similar directions. When you search, your question is also embedded into a vector. Vector search then finds the closest vectors—semantically similar chunks—rather than just keyword matches.

Fred supports multiple stores (Chroma for lightweight/dev, OpenSearch for production scale). The recent work focused on OpenSearch because it’s distributed, battle-tested, and now offers Lucene-native HNSW with cosine similarity out of the box.

---

## What Happens on a Search (Step by Step)

1. **Embed the query** into a vector.
2. **Pick the mode**:
   - _Semantic_: pure vector similarity.
   - _Hybrid_: combine BM25 keywords with vectors.
   - _Strict/Corpus-only_: limit to selected libraries; if nothing matches, we say so instead of guessing.
3. **Apply filters**: OpenSearch and LangChain let us push filters down to the index (e.g., library IDs) before vector scoring. After retrieval, optional score thresholds can prune low-confidence semantic hits—but we now apply that only in semantic mode to avoid dropping useful keyword results.
4. **Rank and format**: Chunks are sorted, ranked, and shown to the model with citations.
5. **Answer with sources**: The agent replies and cites the chunks; if nothing is found in strict mode, it explicitly explains the lack of evidence.

This is why OpenSearch matters here: it lets us mix lexical and vector legs, fuse scores, and enforce filters at query time so the model only sees the right slices of your corpus.

---

## Under the Hood: OpenSearch 2.19+ and Lucene HNSW with Cosine

We upgraded to OpenSearch 2.19+, enabling Lucene-native HNSW with cosine similarity. That brings tighter score distributions, better recall, and more stable latency. We also validate index compatibility (dimension/engine/space/method) on startup, so misconfigured indices fail fast instead of failing silently.

Hybrid mode now uses OpenSearch’s hybrid query plus a post-processing pipeline to normalize and blend BM25 and vector scores. This keeps “exact word matches” and “semantic matches” in the same ranked list without one starving the other.

---

## How the UI Maps to the Core (Contracts and Controls)

The UI isn’t a thin veneer; it exposes the same controls the backend enforces. Scope toggles (corpus-only, global, hybrid) feed directly into the agent runtime so the chosen policy is honored end-to-end. Score filtering is semantic-only by design, with a default of 0.0 to avoid dropping low-but-relevant hits; it is transparent and opt-in. Top-k and pipeline selection are surfaced so teams can tune breadth versus latency and pick processing paths without redeploying. Chunk visibility shows how many snippets per document are in play, turning retrieval from a black box into something users can inspect and trust. Together these contracts keep the UI honest and the core predictable.

---

## Switching Gears: Lightweight Attachment Summaries (Chat Context vs. RAG)

Not every file a user drops into chat should be sent through the full RAG ingestion flow—indexing every ad-hoc upload would be slow, costly, and often unnecessary. Yet it’s useful for a user to say “consider this PDF I just shared” and have the agent stay grounded on that content during the conversation.

Fred addresses this with lightweight attachment processing pipelines instead of immediate full-corpus indexing. When users drop files into chat, we run a summarizer that produces compact “agentic RAM” snippets and injects them into the conversation context. The benefits:
- The summary keeps prompts lean while still grounding the dialog in the newly shared material.
- The snippet is stored with the conversation, so it persists across turns without re-uploading.
- Teams can choose different pipelines (e.g., extractive summary, safety pass, PII scrubbing) to suit policy and performance needs.

If a document later proves valuable for broader reuse, it can be promoted into the full RAG corpus via the heavier ingestion path. Until then, chat-time summaries give users immediate grounding without paying the indexing cost.


---

## Guardrails and Observability

When a provider safety filter triggers, backend logs now clearly label guardrail/refusal states with type, status, request ID, and details. Operators can tell if a response was blocked by policy versus an actual failure. Users get a clear fallback that explains the block without guessing.

---

## Why This Matters

The value is practical: strict and corpus-only modes keep answers honest when evidence is thin, while hybrid mode blends precision and recall without guesswork. Operational guardrails—index health checks, explicit policies, and richer logs—cut down on on-call surprises. The UI mirrors backend controls, so even non-experts can see and steer what’s being retrieved. And because the stack runs on Lucene HNSW with cosine and applies filtering only where it makes sense, you get relevance and speed without silently dropping useful results.

---

## Looking Ahead

- Per-library weighting and relevance tuning.
- Retrieval quality analytics surfaced in the UI.
- Incremental ingestion with automatic embedding/model compatibility checks.

Fred’s agents, UI, and security continue to evolve, but the retrieval backbone is already stronger, clearer, and more controllable. If you want grounded answers with real levers for control, give the new stack a spin.

---

## References

- OpenSearch Lucene-based k-NN: [https://opensearch.org/docs/latest/search-plugins/knn/knn-index/](https://opensearch.org/docs/latest/search-plugins/knn/knn-index/)
- Lucene HNSW and vector search overview: [https://lucene.apache.org/core/](https://lucene.apache.org/core/)
- Hybrid search in OpenSearch: [https://opensearch.org/docs/latest/search-plugins/hybrid-search/](https://opensearch.org/docs/latest/search-plugins/hybrid-search/)
- LangChain vector search concepts: [https://python.langchain.com/docs/integrations/vectorstores/](https://python.langchain.com/docs/integrations/vectorstores/)
