---
title: "Swift 2.0"
description: "Swift is the next generation of Fred — a clean architectural upgrade arriving summer 2026."
summary: "Fred Swift 2.0 replaces agentic-backend with fred-runtime and fred-sdk. Available as a developer preview on PyPI today."
date: 2026-05-02T00:00:00+02:00
lastmod: 2026-05-02T00:00:00+02:00
draft: false
weight: 20
toc: true
seo:
  title: "Swift 2.0 — Fred"
  description: "Fred Swift 2.0: the next generation runtime. Available as a developer preview on PyPI. GA summer 2026."
---

{{< bird-card image="/images/swift_vintage_optimized.webp" name="Swift" version="2.0.x" status="Developer preview · GA summer 2026" hint="Speed is nothing without direction." >}}

## Status

**Swift 2.0 is a developer preview.** The PyPI packages are published and stable enough to build against. The GA release is targeted for summer 2026.

Kea 1.5 remains the production release until then.

## What changes in Swift

Swift replaces `agentic-backend` with two focused, installable packages:

| Component | Kea | Swift |
|---|---|---|
| Execution runtime | `agentic-backend` | `fred-runtime` |
| Agent SDK | — | `fred-sdk` |
| Transport | WebSocket | HTTP SSE |
| Agent packaging | In-repo classes | Installable Python packages |
| CLI | — | `fred-agents-cli` |

The user experience does not change. The same agents, the same interface, a cleaner runtime underneath.

## Try it today

The Swift packages are on PyPI:

```bash
pip install fred-sdk fred-runtime
```

Use the CLI to run and test agents locally:

```bash
fred-agents-cli --help
```

Agents written against `fred-sdk` today will work on a Swift deployment on day one.

## What Swift means for operators

- A Helm migration guide will be published before GA
- The migration is a controlled upgrade, not a rebuild
- Kea deployments are supported through the full migration window

## What Swift means for end users

Nothing changes. Same interface, same agents, same conversations.

## Architecture

Swift is built around three principles:

**Agents are packages.** Each agent lives in its own repository, has its own release cycle, and is installed independently. The Fred core becomes a clean runtime that discovers and loads agents through a well-defined plugin contract.

**Execution is team-scoped.** Every agent run is authorized against a team context issued by the control plane. Runtime pods execute — they do not own tenancy or authorization.

**The control plane is the authority.** Agent enrollment, permissions, team membership, and managed agent instances all flow through `control-plane-backend`. The runtime asks; the control plane decides.

## Guides

Swift guides are being written now. See [Swift Guides](/guides/swift/) as they are published.
