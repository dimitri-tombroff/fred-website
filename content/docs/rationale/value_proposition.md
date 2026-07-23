---
title: "Value Proposition"
description: "Why Fred matters: an open, production-oriented agentic platform that organizations can adopt and scale."
summary: "Fred is the open-source foundation for agentic and RAG systems, designed for governance, extensibility, and real deployment."
date: 2025-07-25T19:00:00+02:00
lastmod: 2026-03-05T10:00:00+02:00
draft: false
weight: 960
toc: true
seo:
  title: "Fred Value Proposition"
  description: "Fred is an open-source, production-ready agentic platform enabling robust deployment and governance."
  canonical: ""
  robots: "index, follow"
---

## Executive Summary

Fred is a fully open-source agentic + RAG platform.

It is designed to bridge the gap between:

- experimentation with LLMs,
- and production-grade AI systems with governance, security, and operational constraints.

## What Fred Is

Fred is the open-source technical foundation:

- `agentic-backend` for agents, sessions, streaming, model routing, and orchestration
- `knowledge-flow-backend` for ingestion, metadata, retrieval, and content lifecycle
- React frontend for user-facing and admin-facing interactions
- policy-based governance primitives (models/rules, RBAC/ReBAC, observability)

Fred is designed to be:

- tool-first
- production-oriented
- modular and extensible
- deployable on-prem or cloud

## Open Assets Available to Everyone

Anyone can take and use:

- `fred` repository (core platform)
- `fred-deployment-factory` repository (deployment examples and templates)

These assets already provide strong value.
For real deployments, teams still need to provision and operate surrounding services (for example OpenSearch, MinIO, Keycloak, databases, monitoring, and platform run operations).

## Why Fred Enables Scalable Delivery

Fred supports a clear operating model with separated responsibilities:

| Responsibility | Platform Team | Delivery & Operations Teams | Business/Product Teams |
| --- | --- | --- | --- |
| Core platform engineering and reusable enablers | Primary owner | Consumer | Contributor (optional) |
| Platform roadmap and governance patterns | Primary owner | Input + adoption | Input from use cases |
| Release management and platform quality gates | Primary owner | Consumer | Consumer |
| Deployment blueprint and runbooks | Co-owner | Co-owner | Consumer |
| Deploying a concrete instance | Support | Primary owner | Consumer |
| Operating and maintaining each deployed instance | Support | Primary owner | Consumer |
| Security accreditation execution for each environment | Guidance + artifacts | Primary owner | Consumer |
| Building domain prompts/agents/corpus configurations | Framework and best practices | Platform support | Primary owner |
| Developing domain-specific agents and workflows | Framework and reviews | Platform support | Primary owner |

This model keeps the platform team focused on reusable capabilities while allowing delivery teams to scale concrete deployments and business teams to focus on domain outcomes.

## Typical Adoption Pattern

1. Start from Fred and deployment assets.
2. Establish a platform ownership model (governance, release, architecture).
3. Deploy one or more instances with delivery/run teams.
4. Let business teams configure and build domain assistants.
5. Feed reusable improvements back into the platform.

Each deployed instance starts the same way regardless of who runs it: zero admins and nothing
enabled, until a one-shot, secret-gated bootstrap creates the first platform admin, who then
deliberately turns on the tools and agent templates that instance is allowed to run before any
team is created around them. See [Bootstrap, capabilities & teams](/docs/nothing-enabled-by-default.html)
for the full sequence — it's the mechanism that makes step 3 safe for sovereign and air-gapped deployments.

## Why This Matters

Without a platform-centered model, organizations often mix:

- platform engineering,
- deployment operations,
- and business solution delivery.

Fred helps establish this separation with an open, modular, and governance-ready foundation.

## References

- [Fred on GitHub](https://github.com/ThalesGroup/fred)
- [Deployment Factory on GitHub](https://github.com/ThalesGroup/fred-deployment-factory)
- [Architecture](/docs/architecture.html)
- [Deploying on GCP / GKE](/docs/deploy-gke.html)
- [Bootstrap, capabilities & teams](/docs/nothing-enabled-by-default.html)
- [Security](/docs/reference/security/)
