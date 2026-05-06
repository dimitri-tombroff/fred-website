---
title: "Roadmap"
description: "Where Fred is going — the path from Kea to Swift and beyond."
summary: "The timeline from Kea 1.5 production to Swift 2.0 GA, with milestones for developers and operators."
date: 2026-05-02T00:00:00+02:00
lastmod: 2026-05-06T00:00:00+02:00
draft: false
weight: 40
toc: true
seo:
  title: "Roadmap — Fred"
  description: "Fred roadmap: Kea 1.5 in production today, Swift 2.0 GA summer 2026, and the milestones in between."
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

The transport is secured end-to-end: the browser sends its bearer token together with a short-lived `ExecutionGrant` issued by the control plane. The runtime pod validates both before executing a single token. The frontend constructs no runtime URLs from cluster topology — it receives a prepared URL from the control plane and calls it.

This makes Swift compatible with standard HTTP infrastructure: CDNs, API gateways, load balancers, and OpenAPI tooling all work without special configuration.

### 2 · Team-scoped managed agents

**Status: shipped**

In Swift, every agent execution is performed on behalf of a user within a team. The frontend selects a **managed agent instance** — a team-enrolled, DB-backed object with a stable identity — rather than a raw agent name. The control plane is the sole authority for agent enrollment, team membership, permissions, and the mapping between instances and runtime pods.

Operators enroll agent templates from the running pod catalog through the UI or the control-plane CLI. Each enrolled instance can be configured with an active MCP toolset, a custom system prompt, and per-instance behavior settings. The control plane validates choices against the live catalog and surfaces a drift warning when the pod catalog changes after enrollment.

This clean separation — control plane decides, runtime executes — makes it possible to manage agents, update toolsets, and inspect running instances without touching deployment configuration.

### 3 · Python SDK and developer CLI

**Status: shipped**

`fred-sdk` gives agent authors a typed Python contract for writing agents: `AgentDefinition`, `ConversationalState`, `FieldSpec`, `ExecutionGrant`, and the full execution event model. Agents written against `fred-sdk` are installable Python packages — they have their own release cycle and can be registered with any running `fred-runtime` pod.

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

Every agent turn in Swift emits a structured KPI event carrying model name, token counts, latency, tool call details, and the full execution identity (`user_id`, `team_id`, `agent_instance_id`). These events go to two sinks simultaneously: a Prometheus counter with bounded cardinality (no session or user dimensions), and a structured JSON log destined for OpenSearch or Loki via fluentbit.

Every authorization boundary — grant validation, grant failure, user mismatch — is written to a dedicated `fred.security.audit` logger and a bounded in-pod ring buffer. The CLI `/audit` command shows these events in real time with colour coding, giving operators an audit console without Grafana.

Langfuse tracing is supported for teams that want per-turn LLM traces: `exchange_id` is propagated through all agent hops via context baggage and attached to each Langfuse span.

### 6 · Session lifecycle management

**Status: in progress — completing before GA**

In Swift, a session is a first-class object with a stable `session_id` owned by the runtime and referenced by the control plane. The runtime already writes `team_id` and `agent_instance_id` alongside every turn, enabling proper scoping.

The remaining items completing before GA:
- **Activity-ordered sidebar** — sessions sorted by last activity, not creation time, with `updated_at` kept current by the control plane
- **Session title** — editable conversation label persisted in the control plane
- **Admin session list** — operators can list all sessions for a team, filterable by agent instance; individual session purge removes history and checkpoint state atomically
- **Runtime → control-plane notification** — runtime notifies the control plane when a turn persists, so session metadata stays consistent across services without a polling loop

### 7 · Audit log separation and SOC-ready traceability

**Status: foundation shipped — structured forwarding planned for GA**

Fred already maintains two distinct log channels: an operational log stream for debugging and performance, and a dedicated `fred.security.audit` channel that captures every authorization boundary event — grant validation, grant failure, user mismatch, and access denial. These events are written to both the structured log pipeline and an in-pod ring buffer queryable via the CLI `/audit` command.

What remains before GA is making this audit stream reliably consumable by a Security Operations Centre. The planned work:
- **Strict channel separation** — audit events never appear in the operational log stream and vice versa; each goes to its own named logger and its own log file or stream target
- **Structured format** — every audit record carries a fixed schema: `event_type`, `actor` (`user_id`, `team_id`), `resource` (`agent_instance_id`, `session_id`), `outcome` (`granted` / `denied`), `timestamp` (UTC ISO 8601), and `correlation_id` for cross-service tracing
- **Forwarding-ready output** — audit logs are emitted as newline-delimited JSON to stdout in a dedicated container stream, ready for a fluentbit or Logstash sidecar to forward to a SIEM or SOC ingestion pipeline without any Fred-specific plugin

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

A decision and implementation plan will be published here once the study is complete. Operators who need encryption at rest today can enable MinIO SSE-S3 at the infrastructure level without any Fred-side configuration.

---

## Summer 2026 — Swift 2.0 GA

Swift replaces `agentic-backend` with `fred-runtime` and `fred-sdk`. The migration from Kea to Swift is a controlled Helm upgrade, not a rebuild.

Target: **summer 2026**.

## After Swift GA — Kea support window

Kea 1.5 enters a six-month support window after Swift GA. During this period:
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
