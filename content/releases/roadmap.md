---
title: "Roadmap"
description: "Where Fred is going — the path from Kea to Swift and beyond."
summary: "Swift golive on 31 July 2026, Swift 2.0 GA on 30 September 2026, and the milestones in between."
date: 2026-05-02T00:00:00+02:00
lastmod: 2026-07-10T00:00:00+02:00
draft: false
weight: 40
toc: true
seo:
  title: "Roadmap — Fred"
  description: "Fred roadmap: Kea 1.5 in production today, Swift golive 31 July 2026, Swift 2.0 GA 30 September 2026, and the milestones in between."
---

## Where things stand

{{< bird-timeline >}}

## Now — Kea 1.5 in production

Kea 1.5 is the current stable release. Teams deploy it today.

Active development continues on Kea with patch releases for fixes and incremental improvements. The latest patch is **1.5.x**.

Recent additions:
- Streaming enabled for all agent types
- SQL agent improvements and language detection fix
- Default search policy changed to hybrid
- Aegis agent

---

## Now — Swift 2.0 developer preview

The Swift packages are live on PyPI:

```bash
pip install fred-sdk fred-runtime
```

Swift 2.0 is being built around nine capabilities. Each one is described below with its current status.

### 1 · HTTP SSE execution transport

**Status: shipped**

Every conversation in Swift flows through a standard HTTP streaming connection (`POST /agents/execute/stream`) served directly by the runtime pod. There is no WebSocket, no persistent connection to negotiate, and no dependency on `agentic-backend` in the browser-to-runtime path.

The transport is secured end-to-end, without the control plane ever minting a signed capability: the browser first calls the control plane to resolve which runtime pod and URL to use, then opens the SSE stream directly against that pod, presenting its own Keycloak bearer token. The pod authenticates that token and authorizes the request itself with a per-request ReBAC (OpenFGA) check — no callback to the control plane. An earlier design had the control plane issue a short-lived signed `ExecutionGrant` instead; it was withdrawn because it made the control plane a proprietary cryptographic root of trust, an unnecessary burden for a platform pursuing C3-grade homologation. The frontend still constructs no runtime URLs from cluster topology — it receives a prepared, ingress-relative URL from the control plane and calls it.

This makes Swift compatible with standard HTTP infrastructure: CDNs, API gateways, load balancers, and OpenAPI tooling all work without special configuration.

### 2 · Team-scoped managed agents

**Status: shipped**

In Swift, every agent execution is performed on behalf of a user within a team. The frontend selects a **managed agent instance** — a team-enrolled, DB-backed object with a stable identity — rather than a raw agent name. The control plane is the sole authority for agent enrollment, team membership, permissions, and the mapping between instances and runtime pods.

Operators enroll agent templates from the running pod catalog through the UI or the control-plane CLI. Each enrolled instance can be configured with an active MCP toolset, a custom system prompt, and per-instance behavior settings. The control plane validates choices against the live catalog and surfaces a drift warning when the pod catalog changes after enrollment.

This clean separation — control plane decides, runtime executes — makes it possible to manage agents, update toolsets, and inspect running instances without touching deployment configuration.

### 3 · Python SDK and developer CLI

**Status: shipped**

`fred-sdk` gives agent authors a typed Python contract for writing agents: `AgentDefinition`, `ConversationalState`, `FieldSpec`, `PortableContext`, and the full execution event model. Agents written against `fred-sdk` are installable Python packages — they have their own release cycle and can be registered with any running `fred-runtime` pod.

`fred-agents-cli` (`fred-runtime` package) provides a full terminal workflow without a browser:

- Streaming chat against any managed agent instance
- HITL (Human in the Loop) flows with pause and resume
- Session management: create, switch, delete, purge history
- Per-turn KPI inspection (`/kpi`): model, tokens, latency, tool calls
- Security audit log (`/audit`): every authorization boundary event
- Agent introspection (`/inspect`): template field specs, MCP toolset, tuning surface
- Inline tuning overrides (`/tune key=value`) for session-local experiments
- Scenario runner (`/run <scenario>`) for automated validation without an LLM

The control-plane CLI (`control-plane-backend` package) covers the operator side: template discovery, instance enrollment and deletion, runtime binding, execution preparation, session and policy inspection.

### 4 · Multi-agent conversational memory

**Status: core shipped — hardening in progress**

Swift's `TeamAgent` is a graph-based orchestrator that routes questions to a crew of specialist sub-agents. In Kea, context reset between turns meant the coordinator had no knowledge of prior questions and sub-agents received no conversation history. Swift fixes this with a general SDK primitive: `ConversationalState`.

Each turn, the runtime appends a typed `ConversationTurn` (question, assistant response, tool calls) to the state and forwards the full prior-turn history to both the coordinator prompt and each sub-agent invocation. The result is a multi-agent conversation that behaves like a single coherent session.

`ConversationalState` is a public SDK contract, not a `TeamAgent`-specific patch. Any agent family (ReAct, Graph, Deep) can use it. Agent-scoped checkpoint isolation and a hard cap on forwarded history are the remaining hardening items before this capability is considered fully closed.

### 5 · Structured observability

**Status: shipped**

Every agent turn in Swift emits a structured KPI event carrying model name, token counts, latency, tool call counts, and the full execution identity (`user_id`, `team_id`, `agent_instance_id`). These events go to two sinks simultaneously: Prometheus metrics with bounded cardinality (no session or user dimensions), for platform-level monitoring, and a direct write to OpenSearch, which is how Fred exposes KPIs and logs to applicative roles. On many managed-Kubernetes platforms, Prometheus is operated by the platform team and out of reach for application teams; the OpenSearch sink is what lets a team's own Admin or Analyst role see its usage without depending on cloud-ops-level monitoring access.

Every authorization boundary — grant validation, grant failure, user mismatch — is written to a dedicated `fred.security.audit` logger and a bounded in-pod ring buffer. The CLI `/audit` command shows these events in real time with colour coding, giving operators an audit console without Grafana.

Langfuse tracing is available as an optional developer tool for teams that want per-turn LLM traces while building and debugging agents: `exchange_id` is attached to each span via context baggage. It is a development aid, not part of Fred's production observability path.

### 6 · Session lifecycle management

**Status: in progress — completing before GA**

In Swift, a session is a first-class object with a stable `session_id` owned by the runtime and referenced by the control plane. The runtime already writes `team_id` and `agent_instance_id` alongside every turn, enabling proper scoping.

The remaining items completing before GA:
- **Activity-ordered sidebar** — sessions sorted by last activity, not creation time, with `updated_at` kept current by the control plane
- **Session title** — editable conversation label persisted in the control plane
- **Admin session list** — operators can list all sessions for a team, filterable by agent instance; individual session purge removes history and checkpoint state atomically
- **Runtime → control-plane notification** — runtime notifies the control plane when a turn persists, so session metadata stays consistent across services without a polling loop

### 7 · Audit, security, and operational log separation

**Status: foundation shipped — strict separation completing before GA**

Fred already maintains two distinct log channels: an operational log stream for debugging and performance, and a dedicated `fred.security.audit` channel that captures every authorization boundary event — grant validation, grant failure, user mismatch, and access denial. These events are written to both the structured log pipeline and an in-pod ring buffer queryable via the CLI `/audit` command.

What remains before GA is making that separation strict and the output easy to hand off to whatever an operator already runs downstream. The planned work:
- **Strict channel separation** — audit events never appear in the operational log stream and vice versa; each goes to its own named logger and its own log file or stream target
- **Structured format** — every audit record carries a fixed schema: `event_type`, `actor` (`user_id`, `team_id`), `resource` (`agent_instance_id`, `session_id`), `outcome` (`granted` / `denied`), `timestamp` (UTC ISO 8601), and `correlation_id` for cross-service tracing
- **Forwarding-ready output** — audit logs are emitted as newline-delimited JSON to stdout in a dedicated container stream, so any log shipper an operator already runs can pick it up without a Fred-specific plugin

Wiring that stream into a specific security-operations pipeline is deployment-specific, not something Fred ships an integration for — this work is about keeping the data clean and easy to forward, not about being SOC-ready out of the box.

Operational logs remain separate and are not subject to the stricter schema or forwarding requirements.

### 8 · COTS component updates

**Status: planned for GA**

Swift's stack depends on five externally-maintained components: **MinIO** (object storage), **OpenSearch** (vector and full-text search), **PostgreSQL** (control-plane and session state), **Keycloak** (identity and RBAC), and **Temporal** (durable workflow execution for ingestion). Each carries its own CVE surface.

Before Swift GA, all five are updated to their current stable release and CVE-scanned. The Helm chart bundles explicit version pins for each component. Going forward, the release process includes a dependency review against published CVE feeds for each patch release — no Fred patch ships against a component with an unresolved high or critical CVE.

This is not a one-time update. The version pins, the scan step, and the remediation SLA become part of the standard release process so future operators inherit a verifiable security posture from day one.

### 9 · Encryption at rest for stored documents

**Status: under study**

Documents ingested into Fred's knowledge base are stored in MinIO (S3-compatible object storage) and indexed in OpenSearch. In regulated environments, both stores may need to carry data that must be encrypted at rest — either by policy or by compliance requirement.

The current approach relies on the underlying infrastructure: MinIO supports server-side encryption (SSE-S3 with a managed key, or SSE-KMS with an external key management service), and OpenSearch supports index-level encryption. Neither requires Fred application code to change.

What is being studied:
- **SSE-KMS integration** — using an external KMS (HashiCorp Vault, AWS KMS, or equivalent) so that encryption keys are never co-located with the data; MinIO acts as an envelope encryptor only
- **Per-team key isolation** — whether each team's documents should be encrypted under a distinct key, enabling revocation of one team's access without affecting others
- **Client-side encryption** — whether documents should be encrypted by the ingestion pipeline before reaching MinIO, making the bucket contents opaque even to infrastructure operators; this would require Fred application changes and a key distribution model

A decision and implementation plan will be published here once the study is complete. Operators who need encryption at rest today can enable MinIO SSE-S3 at the infrastructure level without any Fred-side configuration. In the meantime, Swift 2.0 GA ships a lighter-weight, complementary measure: a capacity that warns at ingestion time when a document looks confidential or carries copyright risk — see below.

---

## 31 July 2026 — Swift golive

Swift replaces `agentic-backend` with `fred-runtime` and `fred-sdk`. This first production milestone is a security- and completeness-focused release: it brings Swift to feature parity with Kea and validates it for deployment in a first reviewed, secured environment.

### Consolidated role model

**Status: shipping 31 July 2026**

<figure>
  <a href="/images/swift-role-model.svg" target="_blank">
    <img src="/images/swift-role-model.svg" alt="Diagram separating Team and App applicative roles (Admin, Editor, Analyst, User, Observer) from the Platform Cloud Ops role, and showing how each maps to the GKE-hosted Fred services versus GCP infrastructure services." style="max-width: 100%; height: auto;" />
  </a>
  <figcaption>Applicative roles (team and app) govern what a business team can do with Fred; the platform role governs the infrastructure Fred runs on. Authorization runs on Keycloak identity and OpenFGA (ReBAC) — no bespoke role logic scattered through the codebase.</figcaption>
</figure>

Fred separates cloud-operations roles from application roles as a first-class part of the platform. The **Platform** role (Cloud Ops) manages the infrastructure Fred runs on. **Applicative** roles — scoped per team (Admin, Editor, Analyst, User) and per agent instance (Admin, Observer) — govern what a business team can do with Fred itself.

This split matters beyond isolating access: it's what lets a team run its own oversight loop on top of Fred. The Analyst role exists specifically so a team can review how its own agents are used, and every role now gets KPIs scoped to what it's responsible for — an operator sees infrastructure health, a team admin sees their team's usage. Security separation is the foundation; visibility per role is what makes it operable day to day.

### Evaluation campaigns

**Status: shipping 31 July 2026**

[fred-agent-evaluator](https://github.com/fred-agent/fred-agent-evaluator) brings recurring evaluation campaigns to Fred: rather than a one-off test run, it re-checks that a team's agents keep behaving the way they're expected to, on a schedule, in production, not just at launch. Combined with per-role KPIs and the Analyst role above, this is what lets a team run its own ongoing usage review, on its own terms.

### The first capacities: PPT Filler and Document Edit

**Status: shipping 31 July 2026**

Alongside the role model, Swift ships its first two **capacities** — self-contained, installable feature packages built on a new `fred-sdk` pattern (more on this in the GA section below). **PPT Filler** lets an agent populate a PowerPoint template from a conversation; **Document Edit** lets a user and an agent jointly edit a document inside the chat itself. Both features existed on Kea, built the old way — scattered across the codebase. Reimplemented on Swift, they are the first proof that a real, non-trivial feature can be built as a single, portable module instead.

A detailed write-up of the capacity pattern is coming soon on this site, with reference documentation published by end of August.

---

## 30 September 2026 — Swift 2.0 GA

Swift 2.0 general availability — the release the Fred team supports for production customers.

### From agents to agentic apps

<figure>
  <a href="/images/swift-worker-architecture.png" target="_blank">
    <img src="/images/swift-worker-architecture.png" alt="Diagram of Fred's components: Frontend calling Agents, Knowledge Flow, Evaluator, and Control Plane, each with a synchronous API layer and a Temporal-backed worker for asynchronous batch work, all but Control Plane reaching into LLMs APIs and LLM Providers." style="max-width: 100%; height: auto;" />
  </a>
  <figcaption>Every Fred service pairs a synchronous API layer with a Temporal-backed worker for batch and long-running work. Agents Worker is marked WIP (targeted for this GA); Evaluator is marked OS — it's <a href="https://github.com/fred-agent/fred-agent-evaluator">fred-agent-evaluator</a>, an open-source contribution to the platform.</figcaption>
</figure>

Fred already runs dedicated background workers for the heavy, asynchronous parts of the platform: a control-plane worker for lifecycle actions (such as user deletion and erasure), a knowledge-flow worker for ingestion, and an evaluator worker that runs evaluation campaigns against business agents. GA extends this with an **agents worker** for agents that run deep or long-running tasks, and generalizes the capacity pattern introduced at golive into the platform's core extension mechanism.

A capacity bundles everything a feature needs — tools, chat-time options, custom chat rendering, side panels, its own storage — into one module a team can install without touching Fred's core code. The practical effect: Fred stops being just an agent framework and becomes a platform for building complete agentic *applications* on top of agents, where independent teams ship capacities the way they would ship a plugin.

**Status: targeted for GA**

### Ingestion-time content warnings

**Status: targeted for GA**

The first capacity aimed squarely at data governance: a warning surfaced at ingestion time when a document looks confidential or carries copyright risk, so a team catches a risky upload before it becomes part of an agent's knowledge base rather than after.

### Professional services around an Apache 2.0 stack

Swift 2.0 GA is the release the Fred team stands behind for production customers, with professional services and support available for organizations that want help operationalizing all of this rather than integrating it alone. The full stack — runtime, SDK, and every capacity described above — stays Apache 2.0, top to bottom.

## After Swift GA — Kea support window

Kea 1.5 enters a six-month support window after Swift 2.0 GA (30 September 2026). During this period:
- Security patches and critical bug fixes are backported to the Kea tag
- No new features are added to Kea
- The migration guide remains the primary support resource

## Further ahead

The Swift architecture is designed so that Fred core becomes a clean runtime. After Swift GA, the roadmap shifts toward:

- Agent marketplace — discover and install community agents
- Richer HITL (Human in the Loop) patterns
- Extended observability — per-agent cost, latency, and quality dashboards
- Multi-agent orchestration patterns built on the Graph agent foundation

Details will be added here as plans solidify.
