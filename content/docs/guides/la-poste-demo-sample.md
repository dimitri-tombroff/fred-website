---
title: "A Sample Demo Architecture"
description: "Architecture reference extracted from the La Poste live demo."
summary: "A practical architecture sample showing how Fred, MCP services, and Knowledge Flow are combined in a real postal operations scenario."
slug: "la-poste-demo-sample"
aliases:
  - "/blog/demo-la-poste/"
date: 2026-02-23T10:00:00+02:00
lastmod: 2026-03-04T17:10:00+01:00
draft: false
weight: 845
toc: true
seo:
  title: "La Poste Demo Architecture Sample"
  description: "Reference architecture from the La Poste Fred demo: agent runtime, MCP services, Knowledge Flow, security, and data layer."
  canonical: ""
  robots: "index, follow"
---

## Context

This page is a documentation sample derived from a live demo session.

It describes a realistic integration pattern for Fred around a postal operations use case. Even if the original demo was custom, the architecture principles are reusable.

## Overview

This demo is based on a La Poste agent running in **Fred Agentic Backend** (custom `TrackingAgent` or `BasicReAct`) that orchestrates the conversation, calls business tools through MCP, and can enrich answers with content from **Knowledge Flow** (private demo documents).

The goal is to demonstrate an agent able to:
- understand customer requests (tracking, incident, resolution action),
- gather reliable operational context,
- propose concrete actions (rerouting, rescheduling, and so on),
- request human validation (HITL),
- and return rich responses (text, map, options).

### The two MCP servers used in this demo

The demo relies on **two complementary MCP servers**, each with a clearly separated business role.

#### 1. Parcel Operations & Customer Service MCP
This server covers **postal business actions**: parcel tracking, pickup-point lookup, rerouting to pickup point, delivery rescheduling, customer notification, compensation estimation, claim creation, and more.

In practice, this is what enables the agent to **propose and execute resolution actions** for delayed parcels or incidents.

#### 2. Telemetry & Logistics Simulation MCP
This server provides **real-time simulated operational context**: tracking snapshots, tracking events, hub status, vehicle position, route geometry, locker occupancy, and simulation progress.

In practice, this enables the agent to **reason on the current logistics state** (hub congestion, waiting vehicle, route progression, and so on) and feed map views in the demo.

### Why two MCP servers instead of one?

The split is intentional:
- one MCP for **business capabilities and customer actions**,
- one MCP for **operational context and telemetry**.

This architecture makes the demo easier to understand and better reflects real environments, where transactional business systems and operational tracking systems are often separated.

## Simplified View

{{< mermaiddiagram >}}
%%{init: {"themeVariables": {"fontSize": "16px"}}}%%
flowchart TB

  subgraph UI["🧑 UI"]
    direction TB
    UChat["Demo chat"]
    UAdmin["Agent Hub<br/>(config + agent graph)"]
  end

  subgraph AG["🧠 Fred Agentic Backend"]
    direction TB
    Api["API Chat / WebSocket"]
    Fred["Fred Orchestrator"]
    Agent["La Poste Agent<br/>(TrackingAgent or BasicReAct)"]
  end

  subgraph EXT["Business and Knowledge Services"]
    direction LR

    subgraph MCP["🔌 MCP La Poste"]
      direction TB
      MCPTrack["Parcel Tracking and Incidents"]
      MCPOps["Delivery Actions and Customer Service"]
    end

    subgraph KF["📚 Knowledge Flow"]
      direction TB
      KFApi["API RAG"]
      Corpus["Private corpus<br/>(procedures, pricing, scripts)"]
    end
  end

  UChat --> Api
  UAdmin --> Api

  Api --> Fred
  Fred --> Agent

  Agent --> MCPTrack
  Agent --> MCPOps
  Agent --> KFApi
  KFApi --> Corpus

  style UI fill:#EAF2FF,stroke:#3B4A6B,stroke-width:1.2px
  style AG fill:#FFEFE0,stroke:#7A4A21,stroke-width:1.2px
  style MCP fill:#FFF7E6,stroke:#7A4A21,stroke-width:1.2px
  style KF fill:#E9FFE9,stroke:#2E6B2E,stroke-width:1.2px

{{< /mermaiddiagram >}}

## Full Architecture View

{{< mermaiddiagram >}}
%%{init: {"themeVariables": {"fontSize": "15px"}}}%%
flowchart TB

  %% =========================
  %% IAM (top layer)
  %% =========================
  subgraph SEC["🔐 Identity & Access"]
    KC["Keycloak<br/>(OIDC / JWT / SSO)"]
    FGA["OpenFGA<br/>(fine-grained authorization / RBAC/ABAC)"]
  end

  %% =========================
  %% Frontend
  %% =========================
  subgraph UI["🧑 UI"]
    Chat["Chat + HITL cards + GeoMap"]
    Hub["Agent Hub<br/>(edit + graph)"]
    KfPages["Knowledge Flow UI<br/>(corpus management)"]
  end

  %% =========================
  %% Agentic Platform
  %% =========================
  subgraph AG["🧠 Agentic Platform (Fred)"]
    AGApi["API Chat / WS / Agents"]
    Orch["Fred Orchestrator"]
    PostalAgent["La Poste Agent<br/>(custom / ReAct)"]
    Temporal["Temporal<br/>(long-running / async workflows)"]
    AGPg["PostgreSQL<br/>(sessions, history, config)"]
  end

  %% =========================
  %% Business services
  %% =========================
  subgraph MCP["🔌 Business MCP Services"]
    Mcp1["Parcel Tracking and Incidents"]
    Mcp2["Delivery Actions / Customer Service"]
  end

  subgraph KF["📚 Knowledge Flow"]
    KFApi["RAG / Ingestion / Search API"]
  end

  %% =========================
  %% Storage / Data layer
  %% =========================
  subgraph DATA["💾 Data & Storage"]
    KFPg["PostgreSQL<br/>(metadata)"]
    Vec["Vector Store<br/>(embeddings / similarity)"]
    S3["Object Store / S3<br/>(documents)"]
  end

  %% =========================
  %% Flows
  %% =========================

  %% Auth
  Chat --> KC
  Hub --> KC
  KfPages --> KC

  KC --> AGApi
  KC --> KFApi

  AGApi --> FGA
  KFApi --> FGA

  %% Frontend to backend
  Chat --> AGApi
  Hub --> AGApi
  KfPages --> KFApi

  %% Agentic internals
  AGApi --> Orch
  Orch --> PostalAgent
  AGApi --> AGPg
  Orch --> Temporal

  %% Tools / Knowledge
  PostalAgent --> Mcp1
  PostalAgent --> Mcp2
  PostalAgent --> KFApi

  %% Knowledge storage
  KFApi --> KFPg
  KFApi --> Vec
  KFApi --> S3

  %% Styles
  style UI fill:#EAF2FF,stroke:#3B4A6B,stroke-width:1.2px
  style SEC fill:#F5F5F5,stroke:#666,stroke-width:1.2px
  style AG fill:#FFEFE0,stroke:#7A4A21,stroke-width:1.2px
  style MCP fill:#FFF7E6,stroke:#7A4A21,stroke-width:1.2px
  style KF fill:#E9FFE9,stroke:#2E6B2E,stroke-width:1.2px
  style DATA fill:#F9F9F9,stroke:#777,stroke-width:1.2px

  style PostalAgent fill:#FFF2CC,stroke:#6B5A1F,stroke-width:1.4px
  style Orch fill:#FFD9B3,stroke:#7A4A21,stroke-width:1.4px
{{< /mermaiddiagram >}}
