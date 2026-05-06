---
title: "Kea 1.5"
description: "Kea is the current production release of Fred — stable, supported, and ready to deploy."
summary: "Fred Kea 1.5 is the production release. Built on agentic-backend, it is the version your teams run today."
date: 2026-05-02T00:00:00+02:00
lastmod: 2026-05-06T00:00:00+02:00
draft: false
weight: 10
legacy: true
toc: true
seo:
  title: "Kea 1.5 — Fred"
  description: "Fred Kea 1.5: the current stable production release. Features, release notes, and support status."
---

{{< legacy-banner release="Swift 2.0" url="/releases/swift/" >}}

{{< bird-card image="/images/kea_vintage_optimized.webp" name="Kea" version="1.5.x" status="Production — stable" hint="Understanding begins with curiosity." >}}

## Status

**Kea 1.5 is the current production release.** It is the version to deploy today.

Support continues through the Swift migration window — a minimum of six months after Swift GA.

## What Kea is

Kea is the codename for the Fred 1.x release line. It is the first full production generation of Fred, built around:

- `agentic-backend` as the execution runtime
- Knowledge Flow for document ingestion and retrieval
- A rich operator configuration model via Helm and YAML catalogs
- Full v2 ReAct and Graph agent support
- Temporal-backed ingestion and durable workloads

## Release notes

The full changelog is available inside the running application under **Release Notes**, or in the [repository](https://github.com/ThalesGroup/fred).

Current patch: **1.5.x** — see the in-app release notes for the latest changelog.

## Guides

- [Kea User Guide](/releases/kea/guides/user-guide/) — for daily users
- [Kea Developer Guide](/releases/kea/guides/developer-guide/) — for agent authors
- [Kea Operations Guide](/releases/kea/guides/operations/) — for operators and DevOps teams
- [Kea Configuration Guide](/releases/kea/guides/configuration/) — configuration reference

## Migration to Swift

When Swift GA arrives, a step-by-step migration guide will walk through every Helm and configuration change required. No changes are needed today.

See the [Swift 2.0 page](/releases/swift/) if you want to explore the new architecture ahead of the migration.
