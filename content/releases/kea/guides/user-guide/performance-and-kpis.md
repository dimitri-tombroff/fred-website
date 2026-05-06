---
title: "Performance and KPIs"
description: "How to read the KPI dashboard and use LogGenius to diagnose conversations."
summary: "Covers the KPI dashboard (usage, latency, success rates) and how to launch the LogGenius agent from any conversation for incident or performance diagnosis."
date: 2026-05-01T00:00:00+02:00
lastmod: 2026-05-01T00:00:00+02:00
draft: false
weight: 820
toc: true
seo:
  title: "Performance and KPIs — Fred User Guide"
  description: "Read the Fred KPI dashboard and use the LogGenius agent to diagnose errors and performance issues in your conversations."
---

> **Requires Fred ≥ 1.5.** The KPI dashboard and LogGenius agent described here were introduced in the 1.5 release line.

---

## The KPI dashboard

The **KPI** page (accessible from the main navigation) shows aggregated metrics for your activity on Fred. It gives you a quick read on how the platform is behaving for your workload.

### What the dashboard shows

| Panel | What it measures |
|---|---|
| **Token usage** | Total tokens consumed by your conversations over the selected period |
| **Latency (p50 / p95 / p99)** | Response time distribution for agent calls |
| **Status counts** | Successful vs. failed requests, broken down by status code |
| **Activity over time** | Heat-strip view of activity and error patterns |

### Selecting a time range

Use the date range controls at the top of the page to zoom in or out. The dashboard automatically adjusts its aggregation precision (minute / hour / day) based on the selected range — you do not need to set this manually.

### Admin view

If you have administrator rights, a toggle lets you switch between **your own metrics** and a **global view** covering all users on the platform. The global view is useful when investigating a platform-wide incident versus a user-specific anomaly.

---

## LogGenius: conversational diagnostics

**LogGenius** is a built-in diagnostic agent that you can launch directly from any conversation. It does not answer domain questions — it investigates what happened inside Fred during that conversation.

### Opening LogGenius

Inside a conversation, click the **wrench / troubleshoot icon** (⚙️) in the conversation toolbar. A panel appears with two diagnostic modes.

### Incident diagnosis

Choose **Incident diagnosis** when you suspect an error — the agent responded incorrectly, a tool failed, or a query returned nothing unexpected.

LogGenius will:
1. Query recent application logs filtered to your conversation's time window.
2. Identify errors, warnings, and anomalies.
3. Return a concise diagnosis with:
   - A root-cause summary (one paragraph).
   - 1–3 concrete next steps.
   - Evidence citations with timestamps.

**Common patterns it recognises:**
- Permission or authorization errors (missing ReBAC grants).
- Downstream connectivity failures (timeouts, connection resets).
- Empty-result patterns (no documents matched, knowledge base empty).

### Performance diagnosis

Choose **Performance diagnosis** when the conversation completed but felt slow, or when you want to understand which part of the agent's reasoning took the longest.

LogGenius will:
1. Retrieve the Langfuse traces for the conversation.
2. Map the node execution path: routing → planning → tool calls → model calls.
3. Return a bottleneck report with per-node timings and a prioritised list of optimisation actions.

**Typical findings:**
- A specific tool call accounting for most of the latency.
- Model routing overhead.
- High step count indicating unnecessary reasoning loops.

### What LogGenius does not do

LogGenius only has access to logs and traces for your own conversations (or all conversations if you are an administrator). It cannot modify configuration, restart services, or take any action — it is read-only and advisory.

---

## Interpreting results together

A useful workflow when a conversation behaves unexpectedly:

1. Run **Incident diagnosis** first to rule out errors.
2. If no errors are found, run **Performance diagnosis** to identify latency contributors.
3. If the diagnosis points to configuration (e.g. wrong model, knowledge base not scoped correctly), bring the findings to your platform operator. See [Performance Metrics — Configuration Guide]({{< ref "/releases/kea/guides/configuration/performance-and-kpis" >}}) for the operator reference.
