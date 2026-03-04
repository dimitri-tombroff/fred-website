---
title: "Glossary"
description: "Quick definitions of key platform terms used in Fred documentation."
summary: "Temporal, ClickHouse, KPI, MCP, model drift, embedding quality, and other recurring technical terms."
date: 2026-03-04T10:15:00+01:00
lastmod: 2026-03-04T10:15:00+01:00
draft: false
weight: 930
toc: true
seo:
  title: "Fred Glossary"
  description: "Short, practical definitions of key Fred platform terms and why they matter."
  canonical: ""
  robots: "index, follow"
---

## Purpose

This glossary explains recurring technical terms in practical terms: what they are, and why they matter for Fred.

## Terms

### Temporal

**What it is**  
A durable workflow orchestration engine for long-running and stateful tasks, with retries, recovery, and resumability.

**Why it matters for Fred**  
Temporal is already in production for ingestion pipelines. The roadmap extends this foundation to deep-agent execution and long-running business tasks so workflows stay robust across restarts, transient failures, and human approval pauses.

### ClickHouse

**What it is**  
A high-performance analytical database optimized for large-scale, low-latency queries over time-series and event-like data.

**Why it matters for Fred**  
ClickHouse gives Fred a fast analytics store for benchmark, KPI, and data-oriented use cases. It also provides a roadmap path to replace parts currently backed by OpenSearch for high-growth historical data (for example session history and KPIs) when scale requires it.

### OpenSearch

**What it is**  
A search and analytics engine used in Fred for retrieval and operational storage paths.

**Why it matters for Fred**  
OpenSearch remains important today, especially for search use cases. The roadmap evaluates where ClickHouse is a better fit for heavy analytics and long-retention operational datasets.

### KPI

**What it is**  
Key Performance Indicators: operational metrics such as latency, throughput, error rate, and resource usage.

**Why it matters for Fred**  
KPI visibility is required to detect regressions early, compare builds, and guide platform optimization decisions.

### Benchmarking

**What it is**  
Repeatable performance and quality test scenarios executed across versions or environments.

**Why it matters for Fred**  
Benchmarking turns performance claims into measurable evidence and helps teams prioritize real bottlenecks.

### MCP (Model Context Protocol)

**What it is**  
A protocol used to expose tools and capabilities to agents in a consistent way.

**Why it matters for Fred**  
MCP is the integration backbone for external capabilities. Gateway-based MCP patterns are being prototyped to simplify operations and make integrations easier to scale.

### Model Drift

**What it is**  
A change over time in model behavior (quality, style, reliability, latency, or cost) compared to a known baseline.

**Why it matters for Fred**  
Model drift monitoring helps teams detect silent regressions after model/provider changes.

### Embedding Quality

**What it is**  
How well embedding vectors preserve semantic meaning for retrieval and ranking tasks.

**Why it matters for Fred**  
Embedding quality directly affects relevance of RAG answers, source precision, and user trust.

### Multimodal Agent

**What it is**  
An agent able to handle multiple modalities (text, documents, images, tabular data, and potentially others).

**Why it matters for Fred**  
Multimodal support requires strong configuration contracts, because model/tool compatibility and routing rules become more complex.
