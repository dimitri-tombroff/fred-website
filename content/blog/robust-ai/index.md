---
title: "Durable AI Agents: Orchestrating the Future with Fred and Temporal"
description: "How Fred leverages Temporal.io to provide durable execution for long-running agents, ensuring reliability and scalability in production."
summary: "Fred extends its existing agentic backend with a Temporal-powered execution path for long-running tasks. Workflows remain resilient through retries, heartbeats, and durable state, while agent contracts and tool boundaries stay explicit and portable."
date: 2026-02-04T10:00:00+02:00
lastmod: 2026-02-04T10:00:00+02:00
draft: false
weight: 50
categories: [architecture, ai]
tags:
  - temporal
  - orchestration
  - ai-agents
  - kubernetes
  - reliability
contributors: [Dimitri Tombroff, Simon Cariou]
pinned: true
homepage: true
seo:
  title: "Durable AI Agents with Temporal and Fred"
  description: "Learn how Fred uses Temporal.io to manage long-running AI workflows and deep agents with zero state loss."
  canonical: ""
  robots: "index, follow"
---

## Durable AI Agents with Fred and Temporal

Large Language Model (LLM) agents are increasingly used for tasks that go far beyond simple question–answer flows: operational audits, cross-system analysis, document processing pipelines, or validation campaigns that can take minutes—or hours.

Yet most agent implementations remain fundamentally **synchronous**. They assume short-lived execution, stable network connections, and best-effort retries. In production, those assumptions break down quickly.

Fred addresses this gap by combining **LangGraph-based agents** with **Temporal-powered durable execution**, enabling long-running, observable, and restart-safe agent workflows, with optional human-in-the-loop (HITL) checkpoints.

{{< mermaiddiagram >}}
flowchart TD
  User["👤 User Interface"]
  IAM["🤖 Interactive Agent Manager"]
  TM["⏳ Temporal (Workflow Manager)"]
  DA["🧠 Deep Agent (Worker)"]
  LLM["☁️ LLM Provider (OpenAI/Mistral)"]

  User -- "Starts Complex Task" --> IAM
  IAM -- "Schedules Workflow" --> TM
  TM -- "Commands" --> DA
  DA -- "Inference" --> LLM
  DA -- "Checkpoints State" --> TM
  TM -- "Signals Completion" --> IAM
  IAM -- "Updates UI" --> User

  style TM fill:#f0f4ff,stroke:#0052cc,stroke-width:2px
  style DA fill:#fff7e6,stroke:#7A4A21
{{< /mermaiddiagram >}}

This article explains the architecture, the design choices, and how to run it yourself.

---

## Reminder: What Fred Is

Fred is a fully open source agentic platform delivered as a complete, deployable stack. It is not an agentic service hosted by a vendor, but a Kubernetes-native package that users deploy and operate themselves.

Some teams use Fred to expose agentic services internally or externally, but Fred itself remains the open source foundation: it includes the agentic backend, the knowledge backend, the frontend, and the required integration points to run everything coherently on Kubernetes.

It focuses on a continuation of its architecture: extending an already production-grade platform with Temporal-backed execution for agents that must run longer, survive failures, or pause for human validation, while keeping agent logic portable and decoupled from the scheduler.

---

## Why Long-Running Agents Need Durable Execution

Traditional LLM agents struggle with:

- Timeouts (HTTP, WebSocket, reverse proxies).
- Partial execution with no durable progress.
- Poor retry semantics (restart from scratch).
- No clean way to wait for human input.
- Limited operational visibility.

Temporal solves these problems by providing:

- Durable state persistence.
- Automatic retries and backoff.
- Heartbeats and cancellation.
- Clear visibility into execution state.

Fred integrates Temporal without turning it into an “agent framework.” Instead, Temporal is used strictly as an **execution substrate**.

---

## Long-Running Agents via Temporal in Fred

### Interactive Agent: BusinessAgent

The entry point is an interactive LangGraph agent located at:

    agentic_backend/academy/08_business_workflow/business_agent.py

`BusinessAgent` handles the user interaction but does **not** execute long tasks directly. Instead, it delegates using two tools:

- temporal_submit  
- temporal_status  

From the agent’s perspective, these are just tools. There is no Temporal import, no workflow logic, and no retry handling in the agent itself.

This keeps agents portable, testable, and framework-agnostic.

---

### Worker Agents Executed by Temporal

The actual long-running work is performed by worker agents running inside Temporal activities:

- business_ops_worker.py  
- business_sales_worker.py  

These workers listen on the Temporal task queue:

    agents

Each worker runs a LangGraph execution inside a **single long-running Activity**. This pattern is intentional:

- The agent graph is dynamic and tool-driven.
- Retrying the whole graph is acceptable and safe.
- Temporal provides durability, retries, and cancellation.
- LangGraph remains the internal orchestrator.

This avoids duplicating LangGraph logic inside Temporal workflows.

---

### Explicit Payload Contracts

All execution is driven by typed, versioned contracts defined in:

    agentic_backend/scheduler/agent_contracts.py

Key models include:

- AgentInputArgsV1  
- AgentResultV1  

These contracts are:

- Framework-agnostic (no LangChain or Temporal types).
- Serializable and versioned.
- Shared across UI, backend, scheduler, and workers.

This makes workflows auditable, testable, and evolvable.

---

### Temporal Workflow: AgentWorkflow

The Temporal workflow is intentionally minimal and lives in:

    agentic_backend/scheduler/temporal/workflow.py

Its responsibilities are limited to:

- Receiving an AgentInputArgsV1.
- Executing the run_langgraph_activity.
- Exposing status via queries.
- Supporting future HITL pause/resume.

The workflow performs **no I/O, no LLM calls, and no non-deterministic logic**. All such work is confined to Activities.

---

### Temporal Gateway and Tools Layer

Temporal access is encapsulated in a narrow adapter layer:

- integrations/temporal/gateway.py (TemporalGateway)  
- integrations/temporal/tools.py (TemporalTools)  

This provides:

- Clear architectural boundaries.
- Easier testing and mocking.
- Freedom to evolve Temporal usage without touching agents.

Agents interact with tools, not infrastructure.

---

## Sandbox and Worker Safety Considerations

Temporal’s Python sandbox is strict. Fred follows a few non-negotiable rules:

- Avoid heavy or dynamic imports in workflows.
- Keep workflows fully deterministic.
- Route logs to stdout.
- Use lightweight KPI stores in workers.

A typical worker configuration uses:

    log_store: stdout
    kpi_store: log

This avoids dependencies like OpenSearch during workflow execution and keeps workers sandbox-safe.

---

## Human-in-the-Loop (HITL)

### HITL with LangGraph Interrupts

Fred supports HITL using LangGraph interrupts, demonstrated in:

    academy/10_human_in_the_loop/hitl_agent.py

The HitlAgent includes:

- Explicit validation checkpoints.
- Interrupts during gather and analyze phases.
- Structured human input requests.

This works today in-process and provides a clean mental model for agent-driven validation.

---

### Delegating HITL Results to Temporal

Once validation is complete, HITL agents can delegate long-running work to Temporal using:

    scheduler/temporal/delegate_client.py

The TemporalAgentInvoker bridges HITL agents and durable execution.

---

### Current Status of Temporal + HITL

- HITL works reliably inside LangGraph.
- Delegation to Temporal is implemented.
- Temporal-native HITL resume (pause → signal → resume Activity) is partially implemented.

This is a known and deliberate next step.

---

## Configuration and Running Workers

Worker configuration is defined in:

    config/configuration_worker.yaml

It includes:

- Agent registration.
- Temporal host and task queue.
- Logging and KPI routing.
- Prometheus metrics exposure.

To start a worker, run:

    make run-worker

This launches a Temporal worker bound to the agents queue.

---

## Operational Notes

Key operational lessons:

- Use heartbeats for long-running activities.
- Prefer long activity timeouts over artificial splitting.
- Keep worker logs in stdout for sandbox safety.
- Avoid external stores unless strictly necessary.
- Wrap KPI stores so Prometheus scraping remains optional.

Temporal tells you where execution is blocked; Fred’s contracts explain why.

---

## Fred vs Managed Agent Platforms

Managed platforms (OpenAI, Anthropic) now offer hosted “Agents” and “Workflows.” They are convenient, but opinionated.

Fred differs by providing:

- Self-hosted execution.
- True durable workflows via Temporal.
- Explicit, versioned contracts.
- Clean HITL semantics.
- Full control over data, logs, and execution.

The trade-off is operational complexity. The benefit is determinism and visibility.

---

## End-to-End Flow

1. User sends a prompt:  
   “Lance une analyse opérationnelle longue avec BusinessOps”

2. BusinessAgent delegates using temporal_submit.

3. Temporal starts AgentWorkflow.

4. A worker executes the LangGraph-based agent inside an Activity.

5. Progress is queryable via temporal_status.

6. Optional HITL checkpoints pause execution.

7. The workflow resumes and completes durably.

---

## What’s Next

Upcoming work includes:

- Full Temporal-native HITL resume.
- Richer progress and artifact queries.
- Additional delegation tools.
- More flexible persistence backends.

---

## Conclusion

Fred does not try to make agents smarter.

It makes them **reliable, durable, and operable**—which is what production systems actually need.

---

## References & Further Reading

- Temporal.io Documentation: https://docs.temporal.io/
- Fred Open Source GitHub: https://github.com/ThalesGroup/fred
- Cloud Native Computing Foundation (CNCF): https://www.cncf.io/
