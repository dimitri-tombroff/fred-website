---
title: "Add your agent"
description: "Current v2 patterns and examples for building a Fred agent."
summary: "How to author, register, and validate a v2 Fred agent using ReAct definitions and explicit tools."
date: 2025-08-27T12:00:00+02:00
lastmod: 2026-03-04T10:00:00+02:00
draft: false
weight: 910
toc: true
seo:
  title: "Add your agent (v2)"
  description: "Create a v2 Fred agent with ReAct authoring helpers, Python tools, and YAML registration."
---

## Scope

This page documents the **current v2 way** to build an agent in Fred.

It focuses on:

- ReAct v2 authoring helpers
- local Python tools
- YAML registration in `agents_catalog.yaml`

## The baseline pattern

A v2 agent is a class-based definition, usually built from:

- `ReActAgent` for common tool-first agents
- `@tool` for local Python tools
- YAML catalog entry for runtime discovery

Start from the maintained sample:

- `agentic_backend/agentic_backend/agents/v2/samples/tutorial_tools/agent.py`

## Minimal v2 agent example

```python
from __future__ import annotations

from pydantic import Field

from agentic_backend.core.agents.v2.authoring import (
    ReActAgent,
    ToolContext,
    ToolOutput,
    tool,
)


@tool(tool_ref="sample.math.add", description="Add two numbers.")
def add_numbers(ctx: ToolContext, left: float, right: float) -> ToolOutput:
    total = left + right
    return ctx.json({"left": left, "right": right, "total": total}, text=f"{total}")


class Definition(ReActAgent):
    agent_id: str = "sample.tutorial.tools.v2"
    role: str = "Tutorial Tools Sample"
    description: str = "Simple v2 sample agent with tiny Python tools."
    tools = (add_numbers,)
    system_prompt_template: str = Field(
        default="You are a concise tutorial assistant. Use tools when useful.",
        min_length=1,
    )
```

## Register the agent in YAML

For a project-local custom agent, register the class path directly:

```yaml
# agentic-backend/config/agents_catalog.yaml
version: v1
agents:
  - id: "MyTutorialV2"
    name: "MyTutorialV2"
    type: "agent"
    class_path: "agentic_backend.agents.v2.samples.tutorial_tools.Definition"
    enabled: true
```

For built-in stable definitions, use `definition_ref` (for example `v2.react.basic`).

## Pick the model from the model catalog

The runtime resolves models through `models_catalog.yaml`:

- `default_profile_by_capability` defines baseline profiles
- `profiles` defines concrete providers/models/settings
- `rules` optionally route by team/user/agent/operation

Keep this separation:

- agent catalog = **who runs**
- model catalog = **which model is used**

## Tool choices

You can mix:

- local Python tools via `@tool`
- built-in tool refs exposed by Fred runtime
- MCP-backed tools for external systems

Prefer simple local tools first, then add MCP only when needed.

## Validation checklist

1. Agent loads from `agents_catalog.yaml` without import errors.
2. Agent appears in UI/API list.
3. A chat turn executes with the expected model profile.
4. Tool calls are visible in logs/traces.
5. Session deletion and resource cleanup still work.

## Promotion path

Recommended lifecycle for new work:

1. Start in `agents/v2/samples/`.
2. Move to `agents/v2/candidate/<agent_name>/`.
3. Promote to `agents/v2/production/<agent_name>/` when stable.
4. Add or update `definition_ref` only for stable published definitions.
