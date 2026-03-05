---
title: "Policy-based LLM Routing"
description: "How Fred v2 resolves model selection from capabilities, routing rules, and runtime context."
summary: "Reference for model profiles, rule matching, deterministic precedence, and ReAct phase routing."
date: 2026-03-04T12:00:00+02:00
lastmod: 2026-03-05T12:30:00+02:00
draft: false
weight: 915
toc: true
seo:
  title: "LLM Routing & Policies"
  description: "Configure model profiles, capabilities, and routing rules in Fred."
---

## Overview

Fred v2 uses a **policy-based routing layer** to select models.
Agents do not hardcode providers or model names. They execute with a capability and runtime context, and the platform resolves the effective model profile.

Model routing is one domain of Fred's broader governance plane (models, tools/MCP, prompts, agents, data). This page focuses specifically on the model domain.

This gives:

- consistent governance
- centralized model lifecycle management
- deterministic, auditable behavior
- lower coupling between agent code and model infrastructure

## Concepts

- **Capability**: technical interface required by runtime (`chat`, `language`, `embedding`, `image`).
- **Purpose**: optional business intent discriminator (for example `rag`, `chatbot`).
- **Operation**: pipeline phase (`routing`, `planning`, `analysis`, `generate_draft`, `self_check`, ...).  
  This is the primary routing dimension for multi-step agents.
- **Model Profile**: named, reusable model configuration (`provider`, `name`, `settings`).

## Source of Truth

Routing policy is loaded from `config/models_catalog.yaml` (or override env path).

Main sections:

1. `common_model_settings`: global defaults merged into profiles
2. `default_profile_by_capability`: fallback profile per capability
3. `profiles`: concrete model profiles
4. `rules`: routing overrides

Settings merge order is deterministic:
1. `common_model_settings`
2. `common_model_settings_by_capability[capability]` (if defined)
3. `profile.model.settings`

## Rule Shape

Preferred rule format (flat):

```yaml
rules:
  - rule_id: react.phase.routing.fast
    capability: chat
    operation: routing
    target_profile_id: chat.openai.gpt5mini

  - rule_id: react.phase.planning.quality
    capability: chat
    operation: planning
    target_profile_id: chat.openai.gpt5
```

Optional criteria can be added at rule root: `purpose`, `agent_id`, `team_id`, `user_id`.
Legacy `match: { ... }` format is still accepted for backward compatibility.

## Resolution Algorithm

For one model selection request, Fred applies:

1. Keep rules with same `capability` as request.
2. Keep rules whose criteria all match request context (`purpose`, `agent_id`, `team_id`, `user_id`, `operation`).
3. Select winner by:
   - highest specificity (number of defined criteria),
   - then first declared rule (stable tie-break).
4. If no rule matches, use `default_profile_by_capability[capability]`.

This behavior is deterministic and testable.

## Runtime Behavior in v2 Agents

- **ReAct v2 (LangChain path)**: model can be selected per call using operation inference:
  - `routing` after user message
  - `planning` after tool result
- **ReAct v2 (HITL path)**: same operation-based resolution is applied in custom loop.
- **Graph v2**: routing is available; today selection is generally performed during runtime/model build unless agent logic adds per-operation calls.

## Observability

Routing decisions are logged with prefix:

`[V2][MODEL_ROUTING]`

Typical fields include:
- `source=rule` or `source=default`
- `rule=...`
- `profile=...`
- `model=provider/name`
- context (`team`, `user`, `agent`)

## Scope and Governance Position

Current production posture is **policy-first**:
- routing managed from catalog/policies
- no end-user model picker as routing authority

This keeps enterprise behavior predictable and aligned with team governance rules.

For the broader governance architecture and roadmap positioning, see:
- `docs/reference/architecture`
- `docs/guides/roadmap`
