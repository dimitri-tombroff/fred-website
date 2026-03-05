---
title: "Roadmap"
description: "Fred platform priorities for March to May 2026."
summary: "Governance-first roadmap across MCP, models, prompts, agents, and data, with observability and runtime hardening."
slug: "roadmap"
aliases:
  - "/docs/roadmap-next-3-months/"
date: 2026-03-04T10:00:00+01:00
lastmod: 2026-03-05T12:30:00+01:00
draft: false
weight: 840
toc: true
seo:
  title: "Fred Roadmap - March to May 2026"
  description: "Roadmap for Fred: governance across MCP/models/prompts/agents/data, observability, runtime evolution, and validation."
  canonical: ""
  robots: "index, follow"
---

## Purpose

This roadmap focuses on one goal: make Fred a state-of-the-art yet simple agentic platform for production teams.

Scope: **March 2026 to May 2026**.

The strategic differentiator is explicit: **governance as a first-class platform capability**.
Many open-source stacks provide agent loops. Fred focuses on policy-driven control across:

- MCP and tool access
- model routing and profile lifecycle
- prompt lifecycle and rollout safety
- agent catalog governance
- data scope and retrieval boundaries

For terminology used below (Temporal, ClickHouse, KPI, MCP, and more), see the [Glossary](/docs/reference/glossary/).

---

## Strategic Priorities

1. **Unified governance plane (core differentiator)**
   Consolidate governance contracts and enforcement across MCP/tools, models, prompts, agents, and data scopes.

2. **Benchmarking and observability first**
   Keep improving the benchmark tool and KPI coverage to make performance and quality visible by default.

3. **Platform evolution with Temporal and ClickHouse**
   Build on the current production usage of Temporal (already used for ingestion pipelines) and extend it to deep-agent and long-running business workflows. In parallel, adopt ClickHouse as a high-speed analytics store for benchmark and KPI-heavy workloads.

4. **ReAct and Graph runtime improvements**
   Continue improving both execution models while converging, when practical, toward shared contracts aligned with the Thales `genai_sdk`.

5. **Configuration management as a core capability**
   Strengthen catalog-based configuration so multimodal agents can be managed cleanly across environments.

6. **MCP gateways and validation apps**
   Prototype gateway-based MCP integration (obot-like approach) and enable team admins to deploy validation apps for model drift and embedding quality monitoring.

7. **UI revamp and collaboration UX**
   Deliver a major UI revamp to reduce technical debt and, more importantly, revisit the full team experience across libraries, corpus usage, agents, and prompts.

---

## Timeline

### Month 1 - March 2026

### Focus
- Governance baseline and policy contracts
- Observability and benchmark foundations
- Configuration baseline hardening
- UI revamp foundations

### Planned outcomes
- Governance baseline:
  - Define shared policy vocabulary and scope across `mcp`, `models`, `prompts`, `agents`, and `data`.
  - Stabilize model routing contracts (`capability`, `purpose`, `operation`) and baseline phase policies.
  - Define prompt asset lifecycle baseline (ownership, versioning, promotion gates).
- Benchmark tool: expand repeatable scenarios (latency, throughput, tool-call heavy flows).
- KPI layer: improve metric consistency (runtime, model, tool, storage, and queue dimensions).
- Dashboard baseline: define a small "must-watch" operational view for daily tracking.
- Configuration: stabilize catalog patterns (`agents`, `models`, `mcp`) and validate schema strictness for future multimodal support.
- UI revamp: launch the first redesign wave to improve UX for team collaboration across libraries, corpus, agents, and prompts while reducing frontend technical debt.

### Success criteria
- Teams can run the same benchmark suite and compare results across builds.
- Core KPIs are queryable and explain performance regressions.
- Governance domains and ownership are explicit and documented.

---

### Month 2 - April 2026

### Focus
- Governance enforcement in runtime paths
- Runtime platform upgrade
- ReAct/Graph convergence work

### Planned outcomes
- Governance execution:
  - Wire deterministic policy checks deeper in runtime paths (model selection, tool/MCP gating, data scope constraints).
  - Define first admin-oriented management flows for governed catalogs (`agents`, `models`, `mcp`, prompt assets).
- Temporal: keep ingestion workflows stable in production and extend durable execution to deep-agent and long-running business tasks.
- ClickHouse: introduce or expand analytics storage for KPIs and benchmark traces, with a path to handle large historical growth and data-oriented workloads.
- ReAct + Graph: implement targeted runtime improvements and shared abstractions where it reduces duplication.
- `genai_sdk` convergence: align contracts best-effort (model/runtime/tool interfaces) without blocking delivery.
- Multimodal config: define first config extensions required for multimodal agents.

### Success criteria
- More execution paths are durable/restart-safe under Temporal.
- KPI and benchmark analytics scale better and are easier to query.
- Policy decisions are observable and explainable in core execution paths.

---

### Month 3 - May 2026

### Focus
- Governance operationalization and auditability
- Validation and production-readiness loop
- Admin tooling and gateway prototype validation

### Planned outcomes
- Validation apps: allow team administrators to deploy validation workflows on Fred.
  - Model drift monitoring
  - Embedding quality monitoring
- MCP gateways: deliver a concrete prototype and document operational patterns.
- End-to-end quality pass: benchmark + KPI + runtime stability review before next release cycle.
- Prompt management: deliver a cleaner governance-ready model with reusable prompt assets, versioning, and safe validation before rollout.
- Governance operationalization:
  - Expose consistent governance controls in admin UX across MCP/models/prompts/agents/data.
  - Provide audit-oriented visibility for policy outcomes and configuration changes.

### Success criteria
- Admin teams can run periodic validation checks without custom scripts.
- Gateway prototype is usable for real integration testing.
- Release decisions are backed by measurable benchmark and quality signals.
- Teams can govern prompt changes with traceable versions and validation gates.
- Governance controls are usable end-to-end across the five domains.

---

## Notes

- This roadmap is intentionally execution-oriented and may be reprioritized based on field feedback.
- The objective is continuous, practical improvement rather than one large rewrite.
