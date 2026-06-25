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

For developer setup (local tokens, model selection) see the [Developer Guide]({{< ref "/releases/swift/guides/developer-guide" >}}).
For the end-user perspective, see the [User Guide]({{< ref "/releases/swift/guides/user-guide" >}}).

## Deploying on GKE

A curated overview of a complete Fred deployment on Google Kubernetes Engine — the components, the stores, and the executable completeness checklist that tells you it is correct, not just running — is in the [Deploying Fred on GKE](/docs/deploy-gke.html) page. The environment-specific runbook (ordered commands, secrets, the completeness checker) ships with the Helm chart in the deployment repository.

## Key differences from Kea operations

Swift 2.0 uses a simpler service topology than Kea. `fred-agents` is a standalone Python pod — there is no separate agentic backend. The same two-file model configuration pattern applies (`configuration.yaml` + `models_catalog.yaml`), but there is no Knowledge Flow dependency for agents that do not use RAG tools.

> Operations pages are being added as Swift 2.0 reaches general availability.

## Migration runbook

Migrating an existing kea deployment to swift — including data transfer, schema transforms, validation checklists, and rollback procedures — is covered in the [kea → swift migration runbook](/docs/migration-kea-to-swift.html).
