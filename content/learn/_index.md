---
title: "About"
description: "Why Fred exists, what it solves, and how it is built."
summary: "Rationale, value proposition, architecture, and comparisons."
date: 2026-04-30T00:00:00+02:00
lastmod: 2026-04-30T00:00:00+02:00
draft: false
weight: 820
layout: single
toc: true
pager: false
sidebar:
  collapsed: false
seo:
  title: "Learn — Fred"
  description: "Why Fred exists, what problems it solves, and how it compares to other agentic frameworks."
---

## What Fred Is

Fred is a fully open-source platform for deploying intelligent, tool-using AI assistants in production environments. It is designed for organizations that operate on Kubernetes and cloud-native infrastructure, where governance, observability, and operational discipline are as critical as model quality.

Fred is not a prototyping framework. It is a complete, integrated system — from the user interface to the document knowledge pipeline — built to run in real deployments, under real operational constraints.

---

## The Problem Fred Addresses

The landscape of agentic AI frameworks is expanding rapidly. Most available solutions — whether commercial or open source — excel at one dimension: developer experience, visual workflow design, or ecosystem breadth. Few are designed from the ground up for production operations in regulated, security-sensitive, or large-scale enterprise contexts.

Organizations deploying AI assistants at scale face a consistent set of challenges:

- **Model governance** — controlling which model is used, under which conditions, and by whom
- **Knowledge management** — ingesting, processing, and maintaining large, heterogeneous document corpora with full traceability
- **Operational transparency** — understanding what agents do, why they do it, and where failures occur
- **Security and access control** — enforcing boundaries at the platform level, not the application level

Fred was built to address these challenges as a platform, not as a collection of integrations.

---

## Architecture Overview

Fred is built around three platform applications, an independently deployable agent pod, and a publishable SDK stack — each with a well-defined API surface.

**Control Plane** owns teams, sessions, agent enrollment, permissions, and product/admin APIs — the platform's sole authority for who can do what, and which agents are reachable. **Knowledge Flow** manages the complete document lifecycle: ingestion, format conversion, OCR, vectorization, metadata enrichment, and semantic retrieval. The **frontend** provides a production-ready chat interface with SSE streaming, source citations, document libraries, and agent/team management — a functional starting point, not a demo.

Agent execution itself lives outside the platform core: **fred-agents** is Fred's first-party agent pod, built on **`fred-sdk`** (the typed agent-authoring contract — ReAct and graph agents, tools, human-in-the-loop) and **`fred-runtime`** (the pod factory — FastAPI, SSE streaming, checkpointing). Any team can ship its own agent pod the same way, register it with the control plane, and run it independently without forking the platform.

All components run as containerized services on Kubernetes. Temporal handles durable, fault-tolerant workflow execution for ingestion and other long-running work. Standard observability integrations (metrics, logs, traces) are included by design.

---

## Design Principles

Fred is built around a small number of consistent principles that distinguish it from lighter-weight alternatives.

**Tool-first agents.** Agents interact with the world through typed, auditable tool calls. Behavior is explicit and inspectable, not implicit in model outputs.

**Catalog-driven configuration.** Models, agents, and routing rules are declared in YAML catalogs. Runtime behavior is separated from application code, which makes configuration changes safe and reviewable.

**Governance as a platform capability.** Access control, model selection policies, and data scope boundaries are enforced at the platform level. Individual application teams do not need to re-implement these controls.

**Cloud-native by design.** Fred is built for Kubernetes from the start — not adapted to it. Deployment, scaling, and operational patterns follow cloud-native conventions.

**Fully open source.** Fred is released under Apache 2.0. There are no usage tiers, feature gates, or proprietary connectors. What you see is what you get.

---

## Who Should Consider Fred

**Development and platform teams** seeking a structured, extensible framework for building and operating AI agents in Python, on Kubernetes, without vendor lock-in.

**Infrastructure and security architects** evaluating open-source agentic infrastructure where governance, auditability, and operational maturity are primary selection criteria.

**Product and business stakeholders** who need a complete foundation that supports both early experimentation and long-term production deployment — with a clear path from prototype to scale.

**Organizations in regulated industries** where data sovereignty, access control, and audit trails are non-negotiable requirements.

---

## Go further

- [Getting started](/docs/getting-started.html) — deploy Fred locally in minutes
- [Configuration guide](/releases/kea/guides/configuration/ingestion-profiles/) — tune ingestion profiles for your documents
- [Architecture](/docs/architecture.html) — understand how the platform components fit together
- [Fred on GitHub](https://github.com/ThalesGroup/fred) — source code, issues, and contributions
