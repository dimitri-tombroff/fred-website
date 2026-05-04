---
title: "Swift Operations Guide"
description: "How to deploy and operate Fred Swift 2.0 in production."
summary: "Reference for operators and DevOps teams running Swift 2.0: secrets injection, configuration profiles, and fred-agents deployment."
date: 2026-05-04T00:00:00+02:00
lastmod: 2026-05-04T00:00:00+02:00
draft: false
weight: 860
toc: false
sidebar:
  collapsed: false
seo:
  title: "Swift Operations Guide — Fred"
  description: "Deploy and operate Fred Swift 2.0: secrets, configuration profiles, Helm, and fred-agents."
---

This section is for **operators and DevOps teams** who deploy and maintain Fred Swift 2.0 instances (`fred-agents`, `fred-runtime`).

For developer setup (local tokens, model selection) see the [Developer Guide]({{< ref "/guides/swift/developer-guide" >}}).
For the end-user perspective, see the [User Guide]({{< ref "/guides/swift/user-guide" >}}).

## Key differences from Kea operations

Swift 2.0 uses a simpler service topology than Kea. `fred-agents` is a standalone Python pod — there is no separate agentic backend. The same two-file model configuration pattern applies (`configuration.yaml` + `models_catalog.yaml`), but there is no Knowledge Flow dependency for agents that do not use RAG tools.

> Operations pages are being added as Swift 2.0 reaches general availability.
