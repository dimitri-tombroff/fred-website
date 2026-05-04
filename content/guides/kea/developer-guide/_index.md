---
title: "Kea Developer Guide"
description: "Local setup, model configuration, and agent development for Fred Kea 1.5."
summary: "For agent authors working with Kea 1.5: environment setup, API tokens, model provider selection, and the models_catalog.yaml contract."
date: 2026-05-04T00:00:00+02:00
lastmod: 2026-05-04T00:00:00+02:00
draft: false
weight: 830
toc: false
sidebar:
  collapsed: false
seo:
  title: "Kea Developer Guide — Fred"
  description: "Set up a local Fred Kea environment, configure API tokens, and select model providers via models_catalog.yaml."
---

This section is for **agent authors** — developers who write, configure, or test agents running on the Kea 1.5 platform.

Each page answers a concrete setup or configuration question. When a setting requires a production deployment decision, the page points to the [Operations Guide]({{< ref "/guides/kea/operations" >}}).

## In this section

- **[Model configuration](/guides/kea/developer-guide/models/)** — which env var holds your API token, how to select a provider, how `models_catalog.yaml` controls default model selection, and how to switch between dev and prod configurations.
