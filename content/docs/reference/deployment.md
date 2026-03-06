---
title: "Deployment"
description: "Deployment operating model for platform teams, DSI, and run teams."
summary: "Short deployment reference: release promotion model, fork operations, Kubernetes/Helm entry points, Temporal workers, and Day-0/Day-2 checklist."
date: 2026-03-05T12:00:00+01:00
lastmod: 2026-03-05T12:00:00+01:00
draft: false
weight: 912
toc: true
seo:
  title: "Fred Deployment Model"
  description: "How teams deploy and operate Fred with develop/main promotion, tags, Helm, Temporal workers, and Keycloak bootstrap."
  canonical: ""
  robots: ""
---

This page is a compact deployment reference for operators.
It is designed for teams that must brief DSI/RSSI and run production environments.

## Audience

- platform and DevOps teams deploying Fred,
- security/compliance stakeholders reviewing controls,
- run teams operating customer platforms.

## Delivery And Promotion Model

Typical lifecycle:

1. Features are merged on `develop`.
2. `develop` is deployed to integration.
3. Validated changes are promoted to `main`.
4. `main` is tagged (code/chart release tags).
5. Production is deployed from artifacts built from `main`.

This operating model also applies to customer forks with their own CI/CD.

## Fork Operating Model

For customer platforms:

- the customer forks Fred repositories,
- tracks upstream changes by controlled sync,
- keeps environment overlays (values, secrets integration, infra specifics) in customer repositories,
- promotes releases with the same governance (integration on `develop`, production on tagged `main`).

## Deployment Building Blocks

A typical production setup includes:

- frontend,
- agentic-backend,
- knowledge-flow-backend,
- identity provider (Keycloak/OIDC),
- storage services (PostgreSQL, optional ClickHouse/object storage),
- Temporal server and one or several workers.

## Temporal Position

Knowledge Flow processing is executed through Temporal workflows.
Worker count is a scaling lever and should be part of capacity planning.

## Platform Responsibilities

Before go-live, platform teams usually provide:

1. Kubernetes namespaces, ingress, certificates, DNS.
2. Data services and backup policy.
3. Temporal deployment and scaling baseline.
4. Keycloak realm/clients/groups/roles bootstrap.
5. Secret management and rotation pipeline.
6. Observability baseline (logs, metrics, traces, alerts).

## Day-2 Operations

1. Track release/tag promotions.
2. Monitor queue health and worker saturation.
3. Review security posture and credential rotation.
4. Review storage growth and retention.
5. Keep overlays aligned with upstream changes.

## Related References

- [Architecture](/docs/reference/architecture/)
- [Security](/docs/reference/security/)
- [Policy-based LLM Routing](/docs/reference/llm_routing/)

## Source Of Truth (GitHub)

- [docs/DEPLOYMENT_GUIDE.md](https://github.com/ThalesGroup/fred/blob/main/docs/DEPLOYMENT_GUIDE.md)
- [docs/DEPLOYMENT_GUIDE_OPENSEARCH.md](https://github.com/ThalesGroup/fred/blob/main/docs/DEPLOYMENT_GUIDE_OPENSEARCH.md)
- [docs/KEYCLOAK.md](https://github.com/ThalesGroup/fred/blob/main/docs/KEYCLOAK.md)
- [docs/SECURITY.md](https://github.com/ThalesGroup/fred/blob/main/docs/SECURITY.md)
- [docs/VERSIONING.md](https://github.com/ThalesGroup/fred/blob/main/docs/VERSIONING.md)
