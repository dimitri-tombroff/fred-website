---
title: "Weaver 5.x"
description: "Weaver 5.x is feature complete and in validation. It rebuilds Fred around a Control Plane that governs spaces, resources and the lifecycle of data."
summary: "Feature complete and in validation: governed spaces, a data catalogue at the core, knowledge, agents, capabilities and applications under one set of rules."
date: 2026-11-08T00:00:00+01:00
lastmod: 2026-11-18T00:00:00+01:00
draft: false
weight: 25
toc: true
seo:
  title: "Weaver 5.x — Fred"
  description: "Fred Weaver 5.x: feature complete and in validation. Governed spaces, a data catalogue, knowledge, agents, capabilities and applications."
---

{{< bird-card image="/images/weaver_vintage_optimized.webp" name="Weaver" version="5.x" status="Feature complete — in validation" >}}

## Status

**Weaver 5.x is feature complete and in validation.** [Swift 3.x](/releases/swift/) remains the production release until that validation is complete.

The [Weaver branch](https://github.com/ThalesGroup/fred/tree/weaver) provides the implementation and its [architecture documentation](https://github.com/ThalesGroup/fred/blob/weaver/docs/architecture/README.md).

## What Weaver provides

Weaver rebuilds Fred's foundations around a single **Control Plane** that governs spaces, resources and the lifecycle of data. Everything else, from knowledge to agents and applications, works within its rules.

| Area | What Weaver provides |
|---|---|
| Spaces | Organizations, teams, projects and personal spaces, with roles granted per space. Sharing a space does not share conversations. |
| Data catalogue | Documents, processing attempts, published results, Wiki pages and agent deliverables, catalogued in PostgreSQL with their owner, state and provenance. |
| Knowledge | Knowledge Flow processes documents, provides semantic and keyword search, and runs SQL queries over tables stored as Parquet. Knowledge Bases, built with the SDK, synchronize external sources into a space. |
| Agents | A Python Agent Pod, Ralph, an embedded Rust agent, and your own pods built with the SDK. MCP connections are managed per organization. |
| Models | An organization policy defines the permitted models; the Control Plane decides the model for every turn. Credentials never reach the browser. |
| Capabilities | Presentations built on your company template, documents written beside the conversation, web pages, tabular analysis and the team Wiki. |
| Applications | Business applications hosted inside a team's space, such as a quiz generator or an agent evaluator. |
| Identity | Any OpenID Connect provider; Keycloak is supported but optional. |
| Consumption | Token usage recorded in SQL per person, space, agent and model, with cost, energy and CO2e estimates. |

## What Weaver means for operators

**Weaver is installed from scratch.** There is no in-place upgrade from Swift. Work is under way on a dedicated migration application, targeted for the end of November 2026.

Weaver runs on Kubernetes with Helm. It needs PostgreSQL, object storage, Temporal and a search index (OpenSearch or pgvector). The Control Plane is now written in Rust and replaces Swift's Python control plane backend. Authorization is decided by the Control Plane from roles stored in PostgreSQL; Weaver no longer uses OpenFGA.

## What Weaver means for end users

You work in a space: your team or your project gathers its agents, documents, Wiki, applications and members in one place. Your conversations stay private, even in a shared team. Agents produce richer results, from presentations on your company template to documents you edit together, and you can follow your own consumption.

## What Weaver means for developers

The SDK lets you build agents and Knowledge Bases that work within a space without handling tenants, roles or security themselves. Business applications plug into a team's space under the same access model. The Control Plane API is described by a generated OpenAPI contract.

## Architecture

Weaver is built around three principles:

**The space is the boundary.** Every resource belongs to a space, and every permission is granted in a space. Roles do not propagate to child spaces, and administering a space does not grant access to its content.

**The Control Plane governs data, not only access.** Producing a result does not publish it. The catalogue records what exists, who owns it, who may see it and when it is deleted, and many of these rules are enforced by the database itself.

**Agents, engines and applications are guests.** They are admitted for each operation with the authority of the person they act for, never with broader rights.

## Where Weaver is going

The question guiding our work is: **how can several people and agents contribute to the same project over time, then consolidate and validate their work?**

The [roadmap](/docs/roadmap.html#knowledge) describes the direction under investigation: knowledge governed by collections, and a promotion cycle from a conversation to the team and the organization. [Data Has a Lifecycle](/blog/fred-compared/) compares Fred with Open WebUI, IBM Bob and Coday/AgentOS.
