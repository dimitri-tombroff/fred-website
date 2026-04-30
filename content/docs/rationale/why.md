---
title: "Why Fred - A Developer Manifesto"
description: "Fred is the missing layer between LangChain and real-world agentic applications. Learn why it's built for developers — not just demos."
summary: "Fred makes it practical to build tool-using agents with strong models, clean runtime boundaries, and production-grade operations."
date: 2025-05-22T18:00:00+02:00
lastmod: 2026-03-04T10:00:00+02:00
draft: false
weight: 910
toc: true
seo:
  title: "Why Fred – A Developer Manifesto"
  description: "Fred and knowledge-flow make agentic development clean, scalable, and fun again. Learn why developers choose Fred to build serious, production-grade agents."
  canonical: "https://fredk8.dev/why/"
  robots: "index, follow"
---

You want to build an agent that does more than answer questions.

You want it to:

- Use tools
- Stay predictable
- Run in production
- And avoid infrastructure glue code.

## Fred is for you.

Fred is an **agentic framework built by practitioners** to run real systems in production, not just demos.

---

## What Fred gives you

- LangGraph-powered agents with clear state and structured execution.
- Tool-first runtime: builtin tools, MCP tools, and custom Python tools.
- Catalog-driven model selection and routing (`models_catalog.yaml`).
- Production scaffolding: auth, observability, storage, deployment.
- End-to-end stack: frontend, agentic backend, knowledge-flow backend.

---

## Agents are easy to build

You can author a minimal v2 ReAct agent with local tools:

```python
from agentic_backend.core.agents.v2.authoring import ReActAgent, ToolContext, ToolOutput, tool

@tool(tool_ref="sample.math.add", description="Add two numbers.")
def add_numbers(ctx: ToolContext, left: float, right: float) -> ToolOutput:
    return ctx.json({"total": left + right}, text=f"{left} + {right} = {left + right}")

class Definition(ReActAgent):
    agent_id = "sample.tutorial.tools.v2"
    role = "Tutorial Tools Sample"
    tools = (add_numbers,)
```

This keeps business logic close to the agent code and avoids low-level runtime plumbing.

---

## Configuration that stays manageable

Fred supports:

- YAML agent catalog (`agents_catalog.yaml`)
- YAML model catalog (`models_catalog.yaml`)
- Rule-based model routing for capability and operation scopes

You can start local with YAML and later move to DB-backed configuration without rewriting runtime logic.

---

## TL;DR

Fred is the layer between LLM experiments and production agent systems.

It helps you ship tool-using agents with strong models, explicit runtime behavior, and operational discipline.

Try it.
