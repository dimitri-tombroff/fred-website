---
title: "Fred vs. Spring AI"
description: "Understanding the Spring AI versus Fred offers"
summary: "Understanding the Spring AI versus Fred offers"
date: 2025-05-22T18:00:00+02:00
lastmod: 2026-03-04T10:00:00+02:00
draft: false
weight: 910
toc: true
seo:
  title: "Fred + knowledge-flow: Value Proposition"
  description: "Fred and knowledge-flow are a modular, enterprise-grade, open-source agentic platform. Learn why it’s more than just a chatbot UI."
  canonical: ""
  robots: "index, follow"
---

# Fred Knowledge Flow vs. Spring AI

## Overview

Fred is an open-source platform for deploying intelligent assistants that **use tools**, **cite sources**, and **run with observable runtime behavior** — powered by modular knowledge flows and an agentic backend.

In contrast, [Spring AI](https://spring.io/projects/spring-ai) is a developer-focused Java library designed to simplify access to LLMs and AI tooling in Spring Boot applications.

Both are modern solutions for building LLM-enhanced applications, but they target different use cases and design philosophies.

---

## What is Spring AI?

Spring AI is a rapidly evolving library that provides:
- Easy integration with LLMs (OpenAI, Ollama, etc.)
- Embedding and vector store support
- Declarative chat templates, tool use, and memory
- **Model Context Protocol (MCP)** integrations for tool connectivity

It is ideal for **Java developers building AI-enhanced backend services**.

---

## Fred's Value Proposition

Fred provides a **higher-level agentic architecture** designed for both developers **and end users**. It’s composed of:

### 1. Tool-first agent runtime

Fred uses:
- LangGraph for structured, stateful agent flows
- Explicit tool invocation with typed payloads
- Model routing policies for selecting model profiles per capability/operation

> Fred focuses on runtime clarity for agent execution, while Spring AI focuses on framework integration inside Java services.

---

### 2. Modular Knowledge Flow Layer

Fred includes a separate `knowledge-flow-backend` with:
- Document ingestion and metadata management
- Markdown previews and file attribution
- Vectorization, storage, and retrieval decoupled from agent logic

> 🟡 Spring AI supports `EmbeddingRetriever` and basic RAG flows, but **lacks modular ingestion pipelines and preview-capable document stores**.

---

### 3. End-User-Facing Platform

Fred includes a full-featured frontend:
- Chat UI with session history, markdown rendering, and source previews. This UI is a powerful start point to design your own custom UI integrating a mix of interactive chat and custom pages leveraging backend services powered by generative AI.
- File upload support and inline citations
- WebSocket and REST streaming with structured message formats and subtypes

> 🔴 Spring AI is **developer-facing only** — no frontend, no session management, no UI support.

---

### 4. Built for LangGraph and Python

Fred is Python-native and built around:
- LangGraph for stateful, graph-based flows
- FastAPI for async backend APIs
- Typed Pydantic schemas for structured agent communication

> 🟡 Spring AI is **Java-native**, leveraging Spring Boot conventions. Great for Java shops, but requires verbose configuration and has fewer agent-oriented abstractions.

---

## Comparison Table

| Feature | **Fred (Knowledge Flow + Agentic Backend)** | **Spring AI** |
|--------|----------------------------------------------|----------------|
| Purpose | Deploy intelligent assistants | Integrate LLMs in Java apps |
| Agents | LangGraph runtime + tool use + model routing | Framework APIs for model/tool integration |
| Knowledge ingestion | Modular: metadata, vectorization, markdown preview | Basic RAG (EmbeddingRetriever) |
| Target audience | Product teams, end users, AI builders | Java backend developers |
| Stack | Python (LangGraph, FastAPI, React) | Java (Spring Boot) |
| UI support | Full chat frontend | None |
| Message streaming | Yes (WebSocket, structured) | No |
| Flexibility | High: deeply customizable flows and tools | Medium: evolving config-based design |
| Structured metadata | Yes: full traceability (`subtype`, `task`, etc.) | Limited |
| Planning + validation loop | Yes | Partial (via step graphs, no built-in planner) |

---

## Summary

**Fred** is best suited for building full-featured, explainable AI assistants where planning, source attribution, tool reasoning, and traceability matter. It emphasizes structured flows, deep customization, and tight integration with frontend and backend components.

**Spring AI**, especially with MCP, is an excellent orchestration framework for Java developers. It is fast-evolving, convention-based, and well-suited for integrating LLMs into microservices — but lacks many higher-order agentic capabilities Fred provides today.

