---
title: "Releases"
description: "Fred release generations — what's stable, what's coming, and how to move between them."
summary: "Kea 1.5 is the current production release. Swift 2.0 is the next generation, available as a developer preview today."
date: 2026-05-02T00:00:00+02:00
lastmod: 2026-05-02T00:00:00+02:00
draft: false
weight: 840
layout: single
toc: false
pager: false
sidebar:
  collapsed: false
seo:
  title: "Releases — Fred"
  description: "Fred release generations: Kea 1.5 stable, Swift 2.0 preview, lifecycle policy and roadmap."
---

Fred releases one production version at a time. Here is where things stand.

| | [Swift 2.0](/releases/swift/) | [Kea 1.5](/releases/kea/) |
|---|---|---|
| **Status** | Developer preview — **next** | Production — stable |
| **Runtime** | `fred-runtime` + `fred-sdk` | `agentic-backend` |
| **Available** | PyPI today · GA summer 2026 | Now |
| **What to do** | Try the SDK, write your agents now | Nothing — keep running |

---

**For end users** — nothing changes when Swift ships. The same interface, the same agents, a cleaner runtime underneath.

**For operators** — a Helm migration guide will be published before the Swift GA date. Kea deployments remain supported through the migration window.

**For developers** — `fred-sdk` and `fred-runtime` are on PyPI today. Write your agents against the new SDK now and they will be ready when Swift ships.

---

- [Swift 2.0](/releases/swift/) — developer preview, GA summer 2026
- [Kea 1.5](/releases/kea/) — current stable release
- [Release lifecycle](/releases/lifecycle/) — how Fred versions work, branch model, support windows
- [Roadmap](/releases/roadmap/) — what's coming and when
