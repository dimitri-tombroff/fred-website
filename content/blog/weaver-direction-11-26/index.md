---
title: "Where Fred Is Heading: Governed Business Workflows"
slug: "fred-weaver-direction"
description: "Weaver consolidates Fred's approach to governed business work. A comparison with OpenAI, Anthropic, Microsoft and Salesforce shows where these trajectories converge and differ."
summary: "Fred is exploring how teams combine data, tools and AI assistance in governed spaces. Weaver consolidates that trajectory alongside wider industry developments in skills, agents and business workflows."
date: 2026-11-08T10:00:00+01:00
lastmod: 2026-11-09T10:00:00+01:00
draft: false
weight: 50
categories: [platform, architecture]
tags: [weaver, agents, skills, governance]
contributors:
- Dimitri Tombroff
pinned: false
homepage: false
seo:
  title: "Where Fred Is Heading: Governed Business Workflows"
  description: "Fred's position in the agent ecosystem: governed business workflows with clear roles for prompts, skills, capabilities and agents."
---

**Fred is exploring how teams can bring data, tools and AI assistance together in governed business workflows. Weaver consolidates that direction.** The starting point is practical: people need to work with documents, use services, share results and make decisions without carrying the whole process in their heads.

Fred's foundation is an **open-source environment deployed on enterprise infrastructure**, with documents, assistants and reusable resources organized in governed spaces. Capabilities and business applications provide the extension path for domain-specific tools and experiences. The work ahead is to make that composition more useful while keeping responsibilities clear.

Across the industry, major platforms are addressing many of the same questions: how to combine reusable expertise, agent execution, explicit business processes and human decisions. **These converging trajectories help us assess Fred's choices and identify what to explore next.** They do not establish feature parity, but they place the questions driving Weaver within a broader architectural evolution.

## A shared set of questions, different starting points

The following comparison looks at selected mechanisms from four actors. It is an architectural perspective, not an exhaustive comparison of their products. Each highlights a different part of the problem Fred is working on.

### OpenAI (Agents SDK): The Agent Lifecycle as the Execution Engine

OpenAI approaches the problem by focusing on the agent's internal execution machinery. In their Agents SDK, emphasis is placed on the primitives that allow an agent to loop, decide, and interact with its immediate environment:

- **Tool execution:** The SDK encapsulates the execution loop, managing local function calls and integration with remote servers via MCP (Model Context Protocol).
- **Handoffs:** Transfer of control to a specialist, with conversation context. Calling an agent as a tool offers another pattern, where the caller retains control.
- **Conversation continuity:** Context and memory persistence are structured directly around the agent's session and message thread.
- **Resumable approval pauses:** Human-in-the-loop validation operates at a micro level: the agent loop pauses before executing a sensitive tool, serializes its state, and waits for explicit approval to resume.

**Where Fred converges and differs:** Fred also needs reliable tool execution and continuity across agent interactions. Its starting point is the shared working environment: the space, its resources and the people authorized to use them. Weaver explores how several independent executions can contribute to a business process whose progress and decisions remain meaningful beyond any one agent run.

### Anthropic (Agent Skills): Reusable Expertise

Anthropic's work on Agent Skills addresses how knowledge and operational procedures can be packaged and delivered to an assistant:

- **Modular Agent Skills:** Instead of multiplying autonomous agents for every new sub-task, Anthropic packages domain expertise, guidelines, and supporting resources (including scripts) into modular, reusable **Skills**.
- **Just-in-time procedural loading:** The assistant inspects available skills and loads the precise procedural knowledge it needs at runtime, keeping the main system prompt clean and focused.
- **Knowledge encapsulation:** Operational expertise is decoupled from agent code, turning procedures into versionable, portable units of domain knowledge.

**Where Fred converges and differs:** Reusable expertise fits Fred's direction of letting teams extend a common foundation with their own resources and capabilities. Agent Skills provides a shared format for that expertise. Weaver's concern is also collective: where those resources belong, who may maintain and use them, and how they work with tools governed independently of their instructions.

### Microsoft (Copilot Studio): Hybrid Workflows and Process Determinism

Microsoft approaches agentic systems by bridging explicit enterprise processes with adaptive AI reasoning. In Copilot Studio, generative agents operate alongside structured business flows:

- **Hybrid flow architecture:** Combines deterministic, rule-based workflows (for strict business logic and compliance) with generative orchestration (for open-ended reasoning and intent handling).
- **Explicit process handoffs:** Agents can call structured workflows, and flows can include agent calls and human approvals. This provides a way to keep selected business steps under explicit process control.
- **Governed integration layer:** Integration with Dataverse, connectors and identity services connects these operations to the organization's data and configured access controls.

**Where Fred converges and differs:** Fred shares this separation between predictable process structure and adaptive assistance. The application owns business rules and decisions; an agent contributes where reasoning is useful. Fred's extension model aims to support that separation with the customer's existing services or a dedicated business application, while keeping the common platform focused.

### Salesforce (Agentforce): Service Action Binding and Platform Delegation

Salesforce approaches agentic systems by anchoring execution directly into the enterprise system of record and existing platform workflows. In Agentforce, agent decisions map directly onto structured enterprise services:

- **Action and flow binding:** Agents can invoke defined actions backed by Salesforce Flow, Apex logic and connected services.
- **Asynchronous service execution:** Asynchronous integration patterns let an agent dispatch work to a downstream service that takes responsibility for execution independently of the agent session.
- **Platform-level trust and permissioning:** Access depends on the execution identity, object and field permissions, and sharing rules. The invoked actions must preserve the relevant security checks.

**Where Fred converges and differs:** Fred likewise treats capabilities as access to operations owned by services. Its ambition is to connect those services within governed spaces, while letting the systems of record retain their business responsibilities. The contribution we are pursuing is a coherent working environment across those boundaries.

---

## What Weaver is consolidating

For Fred, **composition and governance are the organizing choices**: connect people, data and services in a usable environment, and make each responsibility explicit. The industry comparison reinforces the relevance of this direction while leaving concrete questions for Weaver to resolve.

The vocabulary should make this composition understandable:

- A **prompt** expresses instructions.
- A **skill** packages a reusable procedure with supporting resources, potentially including scripts, as described by the [Agent Skills specification](https://agentskills.io/specification).
- A **capability** exposes an operation through tools.
- An **agent** uses instructions and tools to carry out a task.
- The **business application** owns the process rules, shared progress, and decisions.

This separation lets a team change how a task is performed while preserving the rules and continuity of its business process.

### Approval of a Tool Call ≠ Approval of a Business Milestone

Consider a bid team as a concrete example:

- Agents might review requirements or help prepare a cost analysis.
- The application records which gate has been approved and which deliverables are ready.

Approving a tool call (an interruption inside an agent run) and approving a bid milestone (a business decision) are fundamentally different decisions. A **durable shared dossier** is a Weaver direction we are exploring; it is a persistent, governed state owned by the workspace rather than buried inside an agent session.

### Determinism Where Possible, AI Where Valuable

Skills and code execution expand how work can be performed. They do not replace access controls, tested business services, or explicit validation. Where a fixed workflow suffices, it should remain fixed. Model-driven planning earns its place where it adds enough value to justify its cost and variability.

[Weaver](/releases/weaver/) continues Fred's exploration of this combination: a shared working environment, governed access to data and services, and business applications that can use AI without depending on it for every step. Its value will be demonstrated by how reliably and simply teams can carry out their work.

## References & Further Reading

The summaries below are paraphrases, not verbatim quotations. Documentation consulted on November 9, 2026.

- **OpenAI (Agents SDK & Human-in-the-Loop):** The SDK provides an execution loop with tools and handoffs, conversation continuity, and approval interruptions that can be resumed from saved state. See [Running agents](https://developers.openai.com/api/docs/guides/agents/running-agents), [Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration), and [Guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals).

- **Anthropic (Agent Skills & Architecture):** Skills package instructions, scripts and supporting resources that agents can load as needed. Anthropic also recommends starting with simple solutions and adding agentic complexity only when needed. See [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/research/equipping-agents-for-the-real-world-with-agent-skills) (October 16, 2025; open-standard update December 18, 2025), [Building effective agents](https://www.anthropic.com/research/building-effective-agents) (December 19, 2024), and the [Agent Skills specification](https://agentskills.io/specification).

- **Microsoft (Copilot Studio & Hybrid Flows):** Copilot Studio combines rule-based flows with generative orchestration that selects tools, topics, knowledge and agents dynamically. Flows can include agent calls and human approvals. See [Agent flows overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/flows-overview) and [Orchestrate agent behavior with generative AI](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-generative-actions). Keeping critical business rules and authoritative record updates in explicit services or workflows is our architectural takeaway from these mechanisms.

- **Salesforce (Agentforce & Platform Architecture):** Agentforce integrates agents with enterprise data and business actions, including Flow and asynchronous processing patterns. Access depends on the execution identity and configured permissions; custom actions must preserve the relevant security checks. See [Agentic Integration Patterns](https://architect.salesforce.com/docs/architect/fundamentals/guide/agentic-integration-patterns) and [Configure Service Agent Access](https://help.salesforce.com/s/articleView?id=ai.agent_user.htm&language=en_US&type=5).

For an independent perspective, see **Carlos E. Perez**, [Structuring Agents, Skills, and MCPs: Best Practices from Anthropic](https://medium.com/intuitionmachine/structuring-agents-skills-and-mcps-best-practices-from-anthropic-9312849ccea6) (May 6, 2026). This is commentary, not an official Anthropic publication.