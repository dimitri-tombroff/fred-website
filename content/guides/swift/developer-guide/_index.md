---
title: "Swift Developer Guide"
description: "Local setup, model configuration, and agent development for Fred Swift 2.0."
summary: "For agent authors using the Swift 2.0 SDK: environment setup, API tokens, model provider selection, the models_catalog.yaml contract, and running agents with the CLI."
date: 2026-05-04T00:00:00+02:00
lastmod: 2026-05-04T00:00:00+02:00
draft: false
weight: 830
toc: false
sidebar:
  collapsed: false
seo:
  title: "Swift Developer Guide — Fred"
  description: "Set up a local Swift 2.0 environment, configure API tokens, and select model providers via models_catalog.yaml."
---

This section is for **agent authors** — developers who write, configure, or test agents using `fred-sdk` and `fred-runtime` (Swift 2.0).

Each page answers a concrete setup or configuration question. When a setting requires a production deployment decision, the page points to the [Operations Guide]({{< ref "/guides/swift/operations" >}}).

## In this section

- **[Model configuration](/guides/swift/developer-guide/models/)** — which env var holds your API token, how to select a provider, how `models_catalog.yaml` controls default model selection, how to switch between dev and prod configurations, and how to point `fred-samples` at local SDK builds.
