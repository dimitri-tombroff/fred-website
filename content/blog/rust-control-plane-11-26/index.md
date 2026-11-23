---
title: "Why Fred's Control Plane Is Written in Rust"
slug: "rust-control-plane"
description: "Why Fred v5 uses Rust and PostgreSQL for governance: explicit contracts, transactional integrity and bounded work, with performance and operating cost still to be measured."
summary: "The Control Plane owns Fred's catalogue and authorization policy. We explain the Rust and PostgreSQL choice, the limits of their guarantees, and how the planned Wiki will test this design against correctness, latency and cost."
date: 2026-11-22T12:00:00+01:00
lastmod: 2026-11-22T12:00:00+01:00
draft: true
weight: 50
categories: [architecture, engineering]
tags: [rust, postgresql, control-plane, integrity, frugality]
contributors:
- Dimitri Tombroff
pinned: false
homepage: false
seo:
  title: "Why Fred's Control Plane Is Written in Rust"
  description: "Rust and PostgreSQL for Fred's governance core: bounded work, transactional integrity, explicit tradeoffs and a measurement plan."
---

Fred's Control Plane owns the catalogue and authorization policy: where resources
belong, who can use them, what becomes shared knowledge and how data is retired.
In Fred v5, this core is written in Rust and stores its durable catalogue in
PostgreSQL. The choice serves a concrete goal: predictable governance under
concurrent use, with a maintained surface small enough for the team to understand.

## 1. A focused governance core

The Control Plane governs execution without carrying every computation. Agent
turns and document processing use their own components; durable bytes live in
object storage. Request admission establishes the trusted execution context, while
resource access remains subject to its own checks. This does not require routing
every model call or tool request through the Control Plane
([Fred architecture](https://github.com/ThalesGroup/fred/blob/weaver/docs/architecture/README.md)).

Replicas must not depend on process-local state for durable correctness. Catalogue
transactions and existing durable job mechanisms provide coordination. Rust's
ownership and type system help make local state and failure handling explicit;
PostgreSQL supplies the shared transactional boundary.

## 2. Keep synchronous work short and bounded

**Model calls stay outside the governance core.** There is a second condition:
deterministic work must also be bounded. Parsing one size-limited page and
publishing its projection are different workloads from rebuilding a whole index.
Bulk work needs batches and the existing durable execution mechanisms, rather
than a long request or transaction.

The [native Wiki plan](/papers/knowledge-management/) illustrates the intended split.
A pure format library would parse and validate page headers; a PostgreSQL adapter
would update the search projection in the same short transaction as publication.
Both writes would succeed or fail together, using the database's ordinary
[transaction semantics](https://www.postgresql.org/docs/current/tutorial-transactions.html).
The catalogue would remain the authority for visibility and current revisions.

This is planned behavior. PostgreSQL already provides
[full-text indexing and search](https://www.postgresql.org/docs/current/textsearch.html),
but that availability does not demonstrate Fred's relevance, latency or capacity.
Those properties depend on the corpus, queries, indexes and concurrent workload.

## 3. Integrity has several owners

PostgreSQL constraints and triggers protect structural rules independently of the
ordinary application write path. In the Wiki, these include immutable published
revisions and conversation-bound agent proposals. The Control Plane still owns
policy decisions; transactions coordinate related changes. A constraint only
protects the rule it actually encodes.

Rust adds a different kind of protection. Safe Rust prevents classes of memory
errors, while `Option`, enums and `Result` help express absence, states and
recoverable failures. The compiler can enforce the distinctions represented in
those types; it cannot prove that an authorization rule or query matches the
business requirement. Explicit error handling still needs implementation and
review ([The Rust Book](https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html)).

Neither layer replaces integration checks or end-to-end acceptance. In particular,
the Rust language alone does not validate SQL statements at compile time. Fred's
documentation distinguishes code contracts from deployed journey validation.

## 4. What this choice costs

The team maintains a Rust governance core alongside Python agent and processing
components. That requires skills in both languages and discipline at their API
boundaries. Generated clients and contract checks reduce drift, but do not remove
the integration work.

Ralph, the embedded Rust agent, is a temporary exception to the component boundary:
it currently lives in the Control Plane. Moving model execution out remains the
intended direction; this Wiki increment does not undertake that move.

Rust gives us tools for controlling allocation and execution, but low operating
cost is an objective to demonstrate. Database access, model use, network waits
and deployment choices also affect the footprint. A language benchmark cannot
establish Fred's energy consumption or production capacity.

## 5. What we will measure

The planned Wiki gives us a bounded workload on which to test these choices:

- Publication and search latency, including p50 and p99, at stated corpus sizes
  and concurrency; transaction duration and contention alongside response time.
- CPU and memory per replica, with the database work identified separately.
- Search evidence quality, answer quality and agent token use, so that faster
  responses do not conceal poorer retrieval.

Any comparison with Fred v3 must use equivalent functionality, hardware and load.
We will publish the workload and measurements with the results. Until then, the
case for Rust and PostgreSQL rests on explicit responsibilities and enforceable
contracts, with expected performance benefits still to be verified.
