---
title: "Swift 3.x"
description: "Swift 3.x is the current production release of Fred."
summary: "Fred Swift 3.x replaces agentic-backend with fred-runtime and fred-sdk. It is the current production release."
date: 2026-05-02T00:00:00+02:00
lastmod: 2026-11-09T00:00:00+01:00
draft: false
weight: 20
toc: true
seo:
  title: "Swift 3.x — Fred"
  description: "Fred Swift 3.x: the current production release, built on fred-runtime and fred-sdk."
---

{{< bird-card image="/images/swift_vintage_optimized.webp" name="Swift" version="3.x" status="Production — stable" hint="Speed is nothing without direction." >}}

## Status

**Swift 3.x is the current production release.** It supersedes Kea 1.5.

[Weaver 5.x](/releases/weaver/) is available as an incomplete developer preview.

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

Use `fred-sdk` to build agents for Swift deployments.

## What Swift means for operators

Swift is the version to use for production deployments. Moving from Kea replaces `agentic-backend` with `fred-runtime` and `fred-sdk`; the component changes are summarized above.

## What Swift means for end users

Nothing changes. Same interface, same agents, same conversations.

## Architecture

Swift is built around three principles:

**Agents are packages.** Each agent lives in its own repository, has its own release cycle, and is installed independently. The Fred core becomes a clean runtime that discovers and loads agents through a well-defined plugin contract.

**Execution is team-scoped.** Every agent run is authorized against a team context issued by the control plane. Runtime pods execute — they do not own tenancy or authorization.

**The control plane is the authority.** Agent enrollment, permissions, team membership, and managed agent instances all flow through `control-plane-backend`. The runtime asks; the control plane decides.

## Platform capabilities

For a complete inventory of what Swift supports — ingestion formats, SSE event contracts, APIs, agent templates, governance model, security posture — see the **[Feature Reference](/docs/features.html)**.

