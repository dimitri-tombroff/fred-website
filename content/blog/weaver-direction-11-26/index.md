---
title: "Where Fred Is Heading: Business Workflows and a Leaner Runtime"
slug: "fred-weaver-direction"
description: "How Fred's Weaver direction relates to OpenAI, Anthropic, Microsoft and Salesforce: clear orchestration responsibilities and a deployment footprint shaped by Rust."
summary: "Two directions for Weaver: compose prompts, skills, tools and agents around governed business work, and use Rust to make Fred's deployment more compact without closing its extension model."
date: 2026-11-08T10:00:00+01:00
lastmod: 2026-11-09T10:00:00+01:00
draft: false
weight: 50
categories: [platform, architecture]
tags: [weaver, agents, skills, governance, rust]
contributors:
- Dimitri Tombroff
pinned: false
homepage: false
seo:
  title: "Where Fred Is Heading: Business Workflows and a Leaner Runtime"
  description: "Fred's position in the agent ecosystem, and two directions for Weaver: governed business workflows and a leaner runtime with Rust."
---

To understand Fred's trajectory with the **Weaver** release, it is essential to clear up a common misconception in the current agentic landscape.

Fred is **not** just another Python agent SDK, nor is it a visual drag-and-drop node graph (like n8n or Flowise) aimed at stitching together simple API triggers. 

Instead, Fred is an **open-source, cloud-native execution environment**—deployable directly onto enterprise infrastructure (e.g., via our [Helm package on Artifact Hub](https://artifacthub.io/packages/helm/fred/fred))—designed to host governed AI capabilities and run real business applications.

## 1. Compose business work, with clear roles for agents

The major platforms approach this from different starting points. Their documented mechanisms offer useful reference points, rather than a single architecture to copy.

### OpenAI (Agents SDK): The Agent Lifecycle as the Execution Engine

OpenAI approaches the problem by focusing on the agent's internal execution machinery. In their Agents SDK, emphasis is placed on the primitives that allow an agent to loop, decide, and interact with its immediate environment:

- **Tool execution:** The SDK encapsulates the execution loop, managing local function calls and integration with remote servers via MCP (Model Context Protocol).
- **Handoffs:** Direct peer-to-peer delegation where an agent can pass the conversation and its history to a specialized sub-agent.
- **Conversation continuity:** Context and memory persistence are structured directly around the agent's session and message thread.
- **Resumable approval pauses:** Human-in-the-loop validation operates at a micro level: the agent loop pauses before executing a sensitive tool, serializes its state, and waits for explicit approval to resume.

**What this approach suggests:** OpenAI provides a highly capable execution engine for managing reactive agent behavior. However, human approval and state persistence remain tightly coupled to the lifecycle of the individual agent run.

### Anthropic (Agent Skills): Reusable Expertise over Agent Swarms

Anthropic approaches agentic workflows by focusing on how knowledge and operational procedures are structured and delivered to an assistant, rather than building complex multi-agent orchestration swarms:

- **Modular Agent Skills:** Instead of multiplying autonomous agents for every new sub-task, Anthropic packages domain expertise, guidelines, and supporting resources (including scripts) into modular, reusable **Skills**.
- **Just-in-time procedural loading:** The assistant inspects available skills and loads the precise procedural knowledge it needs at runtime, keeping the main system prompt clean and focused.
- **Knowledge encapsulation:** Operational expertise is decoupled from agent code, turning procedures into versionable, portable units of domain knowledge.

**What this approach suggests:** Specializing an assistant does not require a constellation of separate agents passing the baton back and forth. Instead, a capable assistant can be dynamically specialized simply by providing it with the right procedural skills and supporting context at the right moment.

### Microsoft (Copilot Studio): Hybrid Workflows and Process Determinism

Microsoft approaches agentic systems by bridging explicit enterprise processes with adaptive AI reasoning. In Copilot Studio, generative agents operate alongside structured business flows:

- **Hybrid flow architecture:** Combines deterministic, rule-based workflows (for strict business logic and compliance) with generative orchestration (for open-ended reasoning and intent handling).
- **Explicit process handoffs:** Agents call structured workflows to handle system-of-record updates, policy validations, and multi-step approvals, preventing critical business paths from relying on probabilistic model decisions.
- **Governed integration layer:** Deep integration with enterprise infrastructure (Dataverse, connector APIs, Entra ID) ensures execution stays bound to existing organizational security and audit rules.

**What this approach suggests:** Predictable process structure and AI assistance can—and should—coexist. Where a business operation requires determinism, the application workflow maintains control, leveraging the agent for dynamic assistance rather than full process autonomy.

### Salesforce (Agentforce): Service Action Binding and Platform Delegation

Salesforce approaches agentic systems by anchoring execution directly into the enterprise system of record and existing platform workflows. In Agentforce, agent decisions map directly onto structured enterprise services:

- **Action and flow binding:** Agents do not execute unconstrained external code; instead, they trigger pre-defined Salesforce Actions, Flow builder workflows, and Apex logic.
- **Asynchronous service execution:** Complex or transactional operations (such as generating a quote or updating billing records) are handed off to background services and platform workflows rather than processed inside the real-time LLM reasoning loop.
- **Platform-level trust and permissioning:** Security enforcement relies on established organizational controls—such as object/field-level access and user permission sets—ensuring the agent operates strictly within pre-existing business authorization limits.

**What this approach suggests:** Agent execution should remain tightly bound to underlying business services. The responsibility for executing and completing a business operation belongs to the application service, not the agent.

---

### The Fred Stance: Composition and Governance First

Our reading of these approaches is that **composition matters far more than the number of agents**. Fred's position is an open-source environment in which teams can assemble data, services, and assistance under common governance, while retaining their own business systems.

The vocabulary should make this composition understandable:

- A **prompt** expresses instructions.
- A **skill** packages a reusable procedure with supporting resources, potentially including scripts, as described by the [Agent Skills specification](https://agentskills.io/specification).
- A **capability** exposes an operation through tools.
- An **agent** uses instructions and tools to carry out a task.
- The **business application** owns the process rules, shared progress, and decisions.

These responsibilities can cooperate without becoming one large agent or an unmanageable swarm.

#### Approval of a Tool Call ≠ Approval of a Business Milestone

Consider a bid team as a concrete example:
- Agents might review requirements or help prepare a cost analysis.
- The application records which gate has been approved and which deliverables are ready.

Approving a tool call (an interruption inside an agent run) and approving a bid milestone (a business decision) are fundamentally different decisions. A **durable shared dossier** is a Weaver direction we are exploring; it is a persistent, governed state owned by the workspace rather than buried inside an agent session.

#### Determinism Where Possible, AI Where Valuable

Skills and code execution expand how work can be performed. They do not replace access controls, tested business services, or explicit validation. Where a fixed workflow suffices, it should remain fixed. Model-driven planning earns its place where it adds enough value to justify its cost and variability.

## 2. Make the form factor fit the deployment

A shared enterprise platform for finance teams and a compact deployment assisting technical operators need different sets of services. Both need clear permissions, dependable behavior, and an interface that makes the work easy to follow. Supporting both is our design ambition.

**Rust is a concrete part of that direction.** Weaver's Control Plane is implemented in Rust. The development code also includes an embedded Rust agent runtime, allowing a bounded assistant to execute inside the Control Plane process without a separate agent server. Its feature coverage is currently narrower than the Python runtime; it is not a replacement for every Agent Pod.

This creates room for a smaller deployment topology while preserving separate Python Agent Pods for capabilities that need them. Sharing a process does not require merging responsibilities: governance still decides access, and the agent runtime performs the admitted task.

The objective is fewer moving parts where possible, controlled resource use, and a polished experience. Rust alone does not make model outputs deterministic or establish a memory or latency advantage. Those gains must be measured across the deployed system, including inference and document processing.

For [Weaver](/releases/weaver/), these two directions belong together: keep the business process explicit, make AI useful within it, and deploy only the machinery the work requires.

## References & Further Reading

The summaries below are paraphrases, not verbatim quotations. Documentation consulted on November 9, 2026.

- **OpenAI (Agents SDK & Human-in-the-Loop):** The SDK provides an execution loop with tools and handoffs, conversation continuity, and approval interruptions that can be resumed from saved state. See [Running agents](https://developers.openai.com/api/docs/guides/agents/running-agents), [Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration), and [Guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals).

- **Anthropic (Agent Skills & Architecture):** Skills package instructions, scripts and supporting resources that agents can load as needed. Anthropic also recommends starting with simple solutions and adding agentic complexity only when needed. See [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/research/equipping-agents-for-the-real-world-with-agent-skills) (October 16, 2025; open-standard update December 18, 2025), [Building effective agents](https://www.anthropic.com/research/building-effective-agents) (December 19, 2024), and the [Agent Skills specification](https://agentskills.io/specification).

- **Microsoft (Copilot Studio & Hybrid Flows):** Copilot Studio combines rule-based flows with generative orchestration that selects tools, topics, knowledge and agents dynamically. Flows can include agent calls and human approvals. See [Agent flows overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/flows-overview) and [Orchestrate agent behavior with generative AI](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-generative-actions). Keeping critical business rules and authoritative record updates in explicit services or workflows is our architectural takeaway from these mechanisms.

- **Salesforce (Agentforce & Platform Architecture):** Agentforce integrates agents with enterprise data and business actions, including Flow and asynchronous processing patterns. Access depends on the execution identity and configured permissions; custom actions must preserve the relevant security checks. See [Agentic Integration Patterns](https://architect.salesforce.com/docs/architect/fundamentals/guide/agentic-integration-patterns) and [Configure Service Agent Access](https://help.salesforce.com/s/articleView?id=ai.agent_user.htm&language=en_US&type=5).

For an independent perspective, see **Carlos E. Perez**, [Structuring Agents, Skills, and MCPs: Best Practices from Anthropic](https://medium.com/intuitionmachine/structuring-agents-skills-and-mcps-best-practices-from-anthropic-9312849ccea6) (May 6, 2026). This is commentary, not an official Anthropic publication.