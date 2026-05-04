---
title: "Operations Guide"
description: "How to deploy and configure Fred Kea 1.5 in production."
summary: "Reference for operators and DevOps teams: secrets injection, configuration profiles, ingestion setup, and performance monitoring."
date: 2026-05-04T00:00:00+02:00
lastmod: 2026-05-04T00:00:00+02:00
draft: false
weight: 860
toc: false
sidebar:
  collapsed: false
seo:
  title: "Kea Operations Guide — Fred"
  description: "Operator reference for Fred Kea 1.5: secrets, configuration profiles, ingestion, and observability."
---

This section is for **operators and DevOps teams** who deploy, configure, and maintain Fred Kea 1.5 instances.

Each page maps a deployment concern to the exact configuration that controls it, with the reasoning behind each option.

For the developer perspective (local setup, token config, model selection) see the [Developer Guide]({{< ref "/guides/kea/developer-guide" >}}).
For the end-user perspective on these features, see the [User Guide]({{< ref "/guides/kea/user-guide" >}}).

## In this section

- **[Ingestion Profiles](/guides/kea/operations/ingestion-profiles/)** — configure FAST, MEDIUM, and RICH profiles; OCR backends; vision model wiring; Helm deployment notes.
- **[Performance Metrics and KPIs](/guides/kea/operations/performance-and-kpis/)** — Prometheus endpoints, metric reference, breaking changes in 1.5, and LogGenius internals.
