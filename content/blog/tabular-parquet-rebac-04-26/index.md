---
title: "Tabular Data in Fred: ReBAC-Scoped Parquet, S3, and DuckDB"
description: "How Fred handles tabular data with a document-scoped runtime built on Parquet artifacts, object storage, DuckDB, and ReBAC-aware dataset mounting."
summary: "Fred now treats tabular data like the rest of the corpus: document-scoped, team-aware, and authorization-first. This post explains why the old SQL-store model was limiting, how the new Parquet plus DuckDB runtime works, and what this changes for security, performance, and operations."
date: 2026-04-16T12:00:00+02:00
lastmod: 2026-04-16T12:00:00+02:00
draft: false
weight: 50
categories: [SQL, architecture]
tags:
  - parquet
  - duckdb
  - rebac
  - s3
  - minio
  - SQL
  - knowledge-flow
  - fred
contributors: [Simon Cariou]
pinned: false
homepage: false
seo:
  title: "Fred Tabular Runtime: S3, Parquet, DuckDB, and ReBAC by Design"
  description: "Discover how Fred now handles CSV and tabular data through document-scoped Parquet artifacts, object storage, DuckDB query sessions, and authorization-first dataset mounting."
  canonical: ""
  robots: "index, follow"
---

This new feature looks like a tabular refactor at first glance, but it actually reshapes a broader part of the platform.

Behind the implementation details, the improvement does something more important: it aligns tabular data with Fred's main architectural principles.

In other words, CSV and spreadsheet-like datasets are no longer handled as a special case living beside the rest of the system. They are now treated like first-class Fred resources: document-scoped, team-aware, ReBAC-controlled, and served through the same object-storage-oriented runtime used elsewhere in the platform.

---

## The Problem With The Old Model

Tabular support is deceptively hard in a multi-user AI platform.

At first, loading CSV files into a shared SQL database feels natural. It gives agents a place to run queries and gives developers a familiar abstraction. But in a system like Fred, that model creates several tensions very quickly:

- document permissions live at the resource level, not at the database level
- team and personal scopes need to stay aligned with the rest of the corpus
- datasets evolve with document versions
- object storage is already the natural home for ingested artifacts
- a permanent shared SQL catalog becomes an awkward security boundary

That mismatch is exactly what this improvement addresses.

The new design, documented in `docs/design/tabular_data_store/PARQUET_OBJECT_STORE_DUCKDB.md`, makes a strong architectural choice: **one Parquet artifact per document, stored in `content_storage`, queried on demand with DuckDB**.

This matters because the control plane moves back to metadata and authorization, instead of being hidden inside a long-lived SQL database.

---

## The New Runtime In One Sentence

Fred now uses a **dataset-centric tabular runtime**:

1. a CSV-like document is ingested
2. Knowledge Flow converts it into a **document-scoped Parquet artifact**
3. the artifact descriptor is stored in document metadata as `tabular_v1`
4. at query time, Fred resolves which datasets the user is allowed to read
5. DuckDB mounts only those datasets in a fresh session
6. the read-only SQL query runs against that temporary authorized surface

This is a clean shift in philosophy.

The runtime is no longer "put everything in one database, then try to filter access later." It becomes "select the authorized datasets first, then make only those datasets exist for the query."

That is a much better fit for Fred.

---

## Why ReBAC Changes The Design

The most important part of this improvement is not DuckDB. It is **authorization order**.

Fred already uses ReBAC to express who can read what, who owns a team resource, and how private versus shared resources behave. The new tabular runtime finally makes tabular access follow the same rule.

Before a dataset is listed, previewed, or queried, Knowledge Flow resolves:

- the current authenticated user
- the readable documents for that user through ReBAC
- the active scope such as personal, team, or library filtering
- the subset of those documents that actually carry a `tabular_v1` artifact

Only then are SQL aliases generated and exposed.

This is why the design doc insists on a subtle but critical point: **DuckDB is not the security boundary**. The real security boundary is the dataset selection step that happens before query execution by the ReBAC engine.

That distinction is excellent architecture. It avoids turning SQL parsing alone into the whole defense model, and it keeps tabular access aligned with the same resource graph as documents and libraries.

---

## What Happens During Ingestion

The improvement also modernizes the ingestion path itself.

Instead of reading the full CSV into pandas first and then pushing it into a tabular backend, the new `TabularProcessor` uses a more scalable path:

- inspect delimiter and encoding once
- let DuckDB read the CSV directly
- sanitize and stabilize column names
- write a Parquet artifact
- upload that artifact to the shared content store
- derive row counts and schema from the generated Parquet file
- persist the typed descriptor in metadata

That change brings two advantages at once.

First, it is a better fit for larger files because the pipeline avoids unnecessary full DataFrame materialization in the main conversion path. Second, it makes the Parquet artifact itself the durable source of truth for later queries, previews, and schema inspection.

The result is simpler and more coherent: the physical data lives in object storage, while the metadata record tells Fred how to expose it safely.

---

## Why Parquet Plus DuckDB Is A Strong Combination

This improvement is also a good example of choosing tools for their real strengths instead of forcing everything through one storage layer.

**Parquet** gives Fred a portable, compact, columnar representation of each dataset.  
**Object storage** gives Fred a deployment-friendly persistence layer that already fits MinIO and S3-compatible infrastructures.  
**DuckDB** gives Fred fast SQL over files without needing a permanently running tabular database.

That combination is especially compelling in an agentic platform:

- agents need SQL when they need it, not a dedicated database all the time
- deployments often already include MinIO or S3-compatible storage
- dataset versions naturally map to immutable file artifacts
- short-lived query sessions reduce cross-team leakage risk

The implementation even supports remote object access through **presigned URLs** and DuckDB `httpfs`, which makes the runtime practical in containerized and Kubernetes-style deployments.

This is a strong operational story: object-store friendly, cloud-friendly, and still lightweight at query time.

---

## Security Is Not Just "Read-Only SQL"

Another valuable part of this is how much stricter query validation becomes.

The old style of query validation often relies on keyword deny-lists. That helps, but it is brittle. Here, the new tabular utilities move toward a much better model: parse the SQL with DuckDB itself, ensure there is exactly one read-only statement, and verify that the referenced relations belong to the authorized dataset aliases for the current request.

This means the protection is no longer just:

- "please do not write SQL with dangerous words"

It becomes:

- one statement only
- `SELECT` or `WITH` only
- no writes or DDL
- no references to relations outside the authorized mounted datasets

That is the right level of rigor for LLM-generated SQL in production.

It also pairs nicely with the runtime model: even if a query tries to escape its intended scope, the session only contains the datasets Fred deliberately mounted for that user.

---

## A Simpler Story For Deployments

This improvement also improves the platform story for operators.

The docs and configuration now converge on one recommended runtime instead of several competing tabular paths. The new guidance consistently points teams toward:

- shared `content_storage`
- `storage.tabular_store` for artifact layout and query limits
- MinIO or S3-compatible object storage when running beyond local development
- no dedicated tabular SQL database for the recommended mode

That simplification matters.

One of the recurring costs in platform engineering is not just maintaining features, but maintaining multiple mental models for the same feature. This improvement reduces that cost. It gives tabular data a single preferred architecture, which is explained in great details in the README, configuration docs, deployment guide, developer guide, and Helm values to reflect that decision.

That is often the difference between a feature that technically exists and a feature that a team can confidently operate.

---

## Why This Improvement Matters

What makes this improvement worth highlighting is that it solves several problems with one coherent move.

It improves:

- **security**, by aligning tabular access with ReBAC and scope-aware dataset selection
- **architecture**, by treating datasets as document-scoped artifacts rather than rows inside a global shared database
- **performance**, by leaning on DuckDB and Parquet instead of unnecessary in-memory conversions
- **operations**, by embracing MinIO and S3-compatible storage as the natural persistence layer
- **agent usability**, by exposing a cleaner and safer dataset-centric SQL surface

Most importantly, it makes tabular data feel native inside Fred.

That is the real achievement of this feature: not merely adding Parquet, not merely using presigned URLs, and not merely tightening SQL validation, but making structured data obey the same platform rules as the rest of the knowledge corpus.

For an AI system that wants to mix documents, agents, permissions, and analytics without losing control of scope, that is exactly the kind of refactor that matters.

---

## Sources

- [`docs/design/tabular_data_store/PARQUET_OBJECT_STORE_DUCKDB.md`](https://github.com/ThalesGroup/fred/blob/develop/docs/design/tabular_data_store/PARQUET_OBJECT_STORE_DUCKDB.md)
- [`docs/platform/REBAC.md`](https://github.com/ThalesGroup/fred/blob/develop/docs/platform/REBAC.md)
- [`docs/platform/DEPLOYMENT_GUIDE.md`](https://github.com/ThalesGroup/fred/blob/develop/docs/platform/DEPLOYMENT_GUIDE.md)
- [`knowledge-flow-backend/README.md`](https://github.com/ThalesGroup/fred/blob/develop/knowledge-flow-backend/README.md)
- [`knowledge-flow-backend/config/README.md`](https://github.com/ThalesGroup/fred/blob/develop/knowledge-flow-backend/config/README.md)
- [`knowledge-flow-backend/docs/DEVELOPER_GUIDE.md`](https://github.com/ThalesGroup/fred/blob/develop/knowledge-flow-backend/docs/DEVELOPER_GUIDE.md)
