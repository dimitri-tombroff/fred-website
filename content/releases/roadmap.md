---
title: "Roadmap"
description: "Where Fred is going — the path from Kea to Swift and beyond."
summary: "The timeline from Kea 1.5 production to Swift 2.0 GA, with milestones for developers and operators."
date: 2026-05-02T00:00:00+02:00
lastmod: 2026-05-02T00:00:00+02:00
draft: false
weight: 40
toc: true
seo:
  title: "Roadmap — Fred"
  description: "Fred roadmap: Kea 1.5 in production today, Swift 2.0 GA summer 2026, and the milestones in between."
---

## Where things stand

{{< bird-timeline >}}

## Now — Kea 1.5 in production

Kea 1.5 is the current stable release. Teams deploy it today.

Active development continues on Kea with patch releases for fixes and incremental improvements. The latest patch is **1.5.x**.

Recent additions:
- Streaming enabled for all agent types
- SQL agent improvements and language detection fix
- Default search policy changed to hybrid
- Aegis agent

## Now — Swift 2.0 developer preview

The Swift packages are live on PyPI:

```bash
pip install fred-sdk fred-runtime
```

Developers can write agents against the new SDK, run them with the CLI, and validate the new execution contract today — before Swift GA and before their production environment upgrades.

The `develop` branch of this repository tracks Swift progress.

## Summer 2026 — Swift 2.0 GA

Swift replaces `agentic-backend` with `fred-runtime` and `fred-sdk`. The migration from Kea to Swift is a controlled Helm upgrade, not a rebuild.

Key milestones before GA:

- [ ] Control plane migration complete — agent enrollment, permissions, and session management fully owned by `control-plane-backend`
- [ ] Frontend migrated from WebSocket to HTTP SSE
- [ ] Helm migration guide published
- [ ] Kea-to-Swift agent migration validated on internal deployments
- [ ] Swift GA tag cut, `main` updated

## After Swift GA — Kea support window

Kea 1.5 enters a six-month support window after Swift GA. During this period:
- Security patches and critical bug fixes are backported to the Kea tag
- No new features are added to Kea
- The migration guide remains the primary support resource

## Further ahead

The Swift architecture is designed so that Fred core becomes a clean runtime. After Swift GA, the roadmap shifts toward:

- Agent marketplace — discover and install community agents
- Richer HITL (Human in the Loop) patterns
- Extended observability — per-agent cost, latency, and quality dashboards
- Multi-agent orchestration patterns built on the Graph agent foundation

Details will be added here as plans solidify.
