---
title: "Performance Metrics and KPIs"
description: "Prometheus metrics, KPI dimensions, and LogGenius internals for Fred operators."
summary: "Operator reference for Fred's Prometheus metrics: metric names, label dimensions, v1.5 changes, and how the LogGenius diagnostic agent queries logs and traces."
date: 2026-05-01T00:00:00+02:00
lastmod: 2026-05-01T00:00:00+02:00
draft: false
weight: 820
toc: true
seo:
  title: "Performance Metrics and KPIs — Kea Operations Guide"
  description: "Fred Prometheus metrics, KPI label conventions, and LogGenius internals for platform operators. Covers changes introduced in Fred 1.5."
---

> **Requires Fred ≥ 1.5.** Several metrics were renamed or restructured in the 1.5 release line. See [What changed in 1.5](#what-changed-in-15) before upgrading dashboards or alerts.

---

## Architecture overview

Fred exposes two observability surfaces:

- **Prometheus-compatible HTTP API** — served by the Knowledge Flow backend at `/prometheus/*`. Metrics are stored in OpenSearch and queryable with standard PromQL-like syntax.
- **Langfuse traces** — detailed per-conversation execution trees used by the LogGenius agent and available to operators directly in Langfuse.

The KPI dashboard in the Fred UI queries the Prometheus API under the hood. All endpoints require `Action.READ` on `Resource.METRICS`. The global (cross-user) view additionally requires `Action.READ_GLOBAL`.

### Prometheus API endpoints

| Endpoint | Purpose |
|---|---|
| `GET /prometheus/query` | Instant query |
| `GET /prometheus/query_range` | Range query (for time-series charts) |
| `GET /prometheus/series` | Series enumeration |
| `GET /prometheus/metrics` | Raw metric scrape |
| `GET /prometheus/metrics_catalog` | Human-readable metric listing |
| `GET /prometheus/labels` | Label name enumeration |
| `GET /prometheus/metadata` | Metric metadata |
| `GET /prometheus/targets` | Scrape target status |

---

## Metric reference

### LLM call latency — `llm.call_latency_ms`

**Introduced in Fred 1.5.** Measures the wall-clock time of individual model calls made by v2 ReAct agents.

| Label | Values | Notes |
|---|---|---|
| `agent_id` | human-readable agent name | e.g. `sql-agent`, `fred-assistant`. Never a UUID since 1.5. |
| `operation` | `routing`, `planning` | Distinguishes the two model-call types in a ReAct loop |
| `model_name` | model identifier | e.g. `gpt-4o`, `claude-3-5-sonnet` — populated when known |
| `status` | `success`, `error`, `cancelled` | Captured automatically on exit |

This metric replaces the overloaded `app.phase_latency_ms` for model-call timing. Use `app.phase_latency_ms` only for non-LLM pipeline phases.

**Example: p95 LLM latency per agent and operation**
```
histogram_quantile(0.95,
  sum by (agent_id, operation, le) (
    rate(llm_call_latency_ms_bucket[5m])
  )
)
```

### Token usage — `total_tokens`

Cumulative token count per agent call. Dimensions include `agent_id`. Use this to track token consumption trends and detect runaway prompts.

### Ingestion pipeline metrics

These metrics are emitted by the Temporal ingestion workers:

| Metric | Type | What it measures |
|---|---|---|
| Activity queue wait | Histogram | Time between Temporal scheduling and worker pickup |
| Activity duration | Histogram | Wall-clock time per ingestion phase (`metadata`, `input`, `processing`, etc.) |
| Documents ingested | Counter | Total documents processed; dimensions: `status`, `error_code`, `file_type`, `source_type`, `source_tag` |
| Workflows completed | Counter | Total ingestion workflows; dimensions: `status`, `workflow_type` |

Use the documents counter with `status=error` to detect silent ingestion failures — these do not surface in the UI.

---

## What changed in 1.5

The following breaking changes affect dashboards and alerts built against pre-1.5 metrics:

| Change | Impact |
|---|---|
| `llm.call_latency_ms` added; LLM timing removed from `app.phase_latency_ms` | Recreate LLM latency panels using the new metric |
| All `agent_id` labels are now human-readable names, not UUIDs | Label matchers using UUIDs must be updated |
| `agent_id` label key is now consistent across all metrics (was `agent` on some) | Update any alert that used `agent=` |
| `groups` label removed from all KPI actors | Remove `groups` from aggregations — it no longer exists |
| `user_id` removed from cache metrics | Cache is shared; per-user queries on cache metrics will return no data |
| Langfuse latency field corrected from ms to seconds | `tool_total_ms` and `model_total_ms` in LogGenius reports are now accurate |

---

## LogGenius internals

LogGenius is a v2 ReAct agent (profile: `log_genius`) available as an internal agent in every conversation. It does not answer domain questions — it is a diagnostic tool.

### Tools

LogGenius has access to exactly two tools:

**`logs_query`**
Queries recent application logs and returns a structured triage digest. The agent filters logs to the time window of the conversation under investigation. LogGenius interprets patterns in the digest (auth errors, connectivity failures, empty results) and maps them to root causes and remediation steps.

**`traces_summarize_conversation`**
Fetches the Langfuse traces for a specific conversation and produces a structured summary: node execution path, per-step timings, and bottleneck identification. The agent uses this to answer performance questions ("why was this slow?").

### Diagnostic modes (UI)

The UI exposes LogGenius through two pre-filled entry points:

- **Incident diagnosis** — sends a prompt asking LogGenius to investigate errors and produce a diagnosis. LogGenius calls `logs_query` first.
- **Performance diagnosis** — sends a prompt asking LogGenius to analyse bottlenecks. LogGenius calls `traces_summarize_conversation` first.

In both modes, LogGenius includes up to the last three conversation turns (capped at 4 000 characters) as context, so it can correlate what the user observed with what the logs and traces show.

### Access control

LogGenius can only query logs and traces for the authenticated user's conversations. An administrator using the global view can diagnose any conversation. No tool in LogGenius can modify state or trigger side effects.

### Deploying LogGenius

LogGenius is a built-in internal agent — it does not need to be created or published in the marketplace. It is available in every Fred deployment from version 1.5 onwards. No additional configuration is required unless you want to restrict access via ReBAC policies on the `METRICS` and `TRACES` resources.

---

> **User perspective:** see [Performance and KPIs — User Guide]({{< ref "/guides/kea/user-guide/performance-and-kpis" >}}) for how end-users interact with the dashboard and LogGenius.
