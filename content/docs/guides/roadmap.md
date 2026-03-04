---
title: "Roadmap"
description: "Fred platform priorities for March to May 2026."
summary: "Benchmarking and observability, UI revamp, Temporal + ClickHouse adoption, ReAct/Graph runtime convergence, multimodal config management, MCP gateway prototyping, validation apps, and prompt governance."
slug: "roadmap"
aliases:
  - "/docs/roadmap-next-3-months/"
date: 2026-03-04T10:00:00+01:00
lastmod: 2026-03-04T10:00:00+01:00
draft: false
weight: 840
toc: true
seo:
  title: "Fred Roadmap - March to May 2026"
  description: "Roadmap for Fred: observability, UI revamp, runtime evolution, configuration and prompt governance, MCP gateways, and model quality validation."
  canonical: ""
  robots: "index, follow"
---

## Purpose

This roadmap focuses on one goal: make Fred a state-of-the-art yet simple agentic platform for production teams.

Scope: **March 2026 to May 2026**.

For terminology used below (Temporal, ClickHouse, KPI, MCP, and more), see the [Glossary](/docs/reference/glossary/).

---

## Strategic Priorities

1. **Benchmarking and observability first**
   Keep improving the benchmark tool and KPI coverage to make performance and quality visible by default.

2. **Platform evolution with Temporal and ClickHouse**
   Build on the current production usage of Temporal (already used for ingestion pipelines) and extend it to deep-agent and long-running business workflows. In parallel, adopt ClickHouse as a high-speed analytics store for benchmark and KPI-heavy workloads.

3. **ReAct and Graph runtime improvements**
   Continue improving both execution models while converging, when practical, toward shared contracts aligned with the Thales `genai_sdk`.

4. **Configuration management as a core capability**
   Strengthen catalog-based configuration so multimodal agents can be managed cleanly across environments.

5. **MCP gateways and validation apps**
   Prototype gateway-based MCP integration (obot-like approach) and enable team admins to deploy validation apps for model drift and embedding quality monitoring.

6. **UI revamp and collaboration UX**
   Deliver a major UI revamp to reduce technical debt and, more importantly, revisit the full team experience across libraries, corpus usage, agents, and prompts.

7. **Prompt management governance**
   Build cleaner prompt management to support safe governance, reuse, versioning, and validation workflows.

---

## Timeline

### Month 1 - March 2026

### Focus
- Observability and benchmark foundations
- Configuration baseline hardening
- UI revamp foundations

### Planned outcomes
- Benchmark tool: expand repeatable scenarios (latency, throughput, tool-call heavy flows).
- KPI layer: improve metric consistency (runtime, model, tool, storage, and queue dimensions).
- Dashboard baseline: define a small "must-watch" operational view for daily tracking.
- Configuration: stabilize catalog patterns (`agents`, `models`, `mcp`) and validate schema strictness for future multimodal support.
- UI revamp: launch the first redesign wave to improve UX for team collaboration across libraries, corpus, agents, and prompts while reducing frontend technical debt.

### Success criteria
- Teams can run the same benchmark suite and compare results across builds.
- Core KPIs are queryable and explain performance regressions.

---

### Month 2 - April 2026

### Focus
- Runtime platform upgrade
- ReAct/Graph convergence work

### Planned outcomes
- Temporal: keep ingestion workflows stable in production and extend durable execution to deep-agent and long-running business tasks.
- ClickHouse: introduce or expand analytics storage for KPIs and benchmark traces, with a path to handle large historical growth and data-oriented workloads.
- ReAct + Graph: implement targeted runtime improvements and shared abstractions where it reduces duplication.
- `genai_sdk` convergence: align contracts best-effort (model/runtime/tool interfaces) without blocking delivery.
- Multimodal config: define first config extensions required for multimodal agents.

### Success criteria
- More execution paths are durable/restart-safe under Temporal.
- KPI and benchmark analytics scale better and are easier to query.

---

### Month 3 - May 2026

### Focus
- Validation and production-readiness loop
- Admin tooling and gateway prototype validation
- Prompt governance completion

### Planned outcomes
- Validation apps: allow team administrators to deploy validation workflows on Fred.
  - Model drift monitoring
  - Embedding quality monitoring
- MCP gateways: deliver a concrete prototype and document operational patterns.
- End-to-end quality pass: benchmark + KPI + runtime stability review before next release cycle.
- Prompt management: deliver a cleaner governance-ready model with reusable prompt assets, versioning, and safe validation before rollout.

### Success criteria
- Admin teams can run periodic validation checks without custom scripts.
- Gateway prototype is usable for real integration testing.
- Release decisions are backed by measurable benchmark and quality signals.
- Teams can govern prompt changes with traceable versions and validation gates.

---

## Notes

- This roadmap is intentionally execution-oriented and may be reprioritized based on field feedback.
- The objective is continuous, practical improvement rather than one large rewrite.
