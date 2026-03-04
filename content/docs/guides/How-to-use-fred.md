---
title: "How to use Fred"
description: "How to configure and run Fred with tool-first agents."
summary: "Fred now follows a tool-first model: one selected agent, one strong model, and explicit tools. This guide explains the practical setup."
date: 2023-09-07T16:04:48+02:00
lastmod: 2026-03-04T10:00:00+02:00
draft: false
weight: 810
toc: true
seo:
  title: "How to use Fred"
  description: "How to configure, extend, and run Fred with the current tool-first agent model."
  canonical: ""
  robots: ""
---

## Current operating model

Fred no longer assumes a built-in "leader agent" coordinating a crew.

The default pattern is:

- one selected agent per conversation
- one strong model profile for that agent step
- explicit tool calls for retrieval, actions, or external systems

This gives simpler behavior, clearer observability, and easier production hardening.

## Which agent should you choose?

- Choose a **general ReAct agent** for broad conversations with optional tools.
- Choose a **domain agent** (for example tracking, tabular, or reporting) when you need specialized prompts and tools.
- Prefer **tool design** over agent-to-agent delegation for most use cases.

## Where configuration lives

Fred uses YAML catalogs as source of truth:

- `agentic-backend/config/configuration.yaml`: platform/runtime settings (security, storage, endpoints)
- `agentic-backend/config/agents_catalog.yaml`: agent list, enablement, and class or `definition_ref`
- `agentic-backend/config/models_catalog.yaml`: model profiles, defaults, and routing rules

## Minimal v2 catalog example

```yaml
# agents_catalog.yaml
version: v1
agents:
  - id: "ReActV2"
    name: "ReActV2"
    type: "agent"
    definition_ref: "v2.react.basic"
    enabled: true
```

```yaml
# models_catalog.yaml
version: v1
default_profile_by_capability:
  chat: default.chat.openai.prod
profiles:
  - profile_id: default.chat.openai.prod
    capability: chat
    model:
      provider: openai
      name: gpt-5.1
rules: []
```

## Run and verify

1. Configure secrets in `.env` (`OPENAI_API_KEY` or your provider credentials).
2. Start the stack with `make run`.
3. Open the UI, start a conversation, and select a v2 agent.
4. Check backend logs to confirm selected model profile and tool calls.

Use the main repository quick start for the latest commands: [https://github.com/ThalesGroup/fred#readme](https://github.com/ThalesGroup/fred#readme).

## Extend with your own agent

For a practical step-by-step guide using current v2 authoring (`ReActAgent`, `@tool`, YAML registration), see [Add your agent](/docs/reference/add_your_expert/).

The backend implementation lives in [`agentic-backend`](https://github.com/ThalesGroup/fred/tree/main/agentic-backend).
