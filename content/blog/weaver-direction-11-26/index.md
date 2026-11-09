---
title: "Governed Agentic Systems: Fred Weaver in Context"
slug: "fred-weaver-direction"
description: "An architectural comparison of Fred Weaver, OpenAI, Anthropic, Microsoft and Salesforce: governed spaces, reusable skills, agent execution and business processes."
summary: "An analysis of governed spaces, reusable expertise and the separation between agent execution and business processes in Fred Weaver and four major platforms."
date: 2026-11-08T10:00:00+01:00
lastmod: 2026-11-09T10:00:00+01:00
draft: true
weight: 50
categories: [platform, architecture]
tags: [weaver, agents, skills, governance]
contributors:
- Dimitri Tombroff
pinned: false
homepage: false
seo:
  title: "Governed Agentic Systems: Fred Weaver in Context"
  description: "Fred Weaver in architectural context: spaces, skills, agents and explicit business processes, illustrated with diagrams from its architecture documentation."
---

Fred is an open-source environment for combining data, tools and AI assistance within governed business activities. The Weaver release consolidates this architecture around shared spaces, reusable resources and distinct responsibilities for governance, knowledge processing and agent execution.

This article examines that architecture alongside selected mechanisms from OpenAI, Anthropic, Microsoft and Salesforce. The comparison concerns architectural responsibilities, rather than feature coverage or measured performance. It identifies convergent design choices and the questions Fred is investigating.

## Spaces as the collaboration boundary

In Fred, organizations, teams and projects define where resources belong and who may use them. A common space model also covers personal resources. Access to a collective space does not expose another person's conversations, and roles do not automatically propagate to child spaces.

{{< mermaiddiagram >}}
flowchart TB
    subgraph organization["Organization"]
        direction TB
        common["Common knowledge<br/>Assistants and resources"]

        subgraph team["Team"]
            direction TB
            shared["Team knowledge<br/>Assistants and resources"]

            subgraph project["Project"]
                focused["Resources for<br/>a shared objective"]
            end
        end

        common -->|"According to access rights"| shared
        shared -->|"According to access rights"| focused
    end

    classDef neutral fill:#F1F5F9,stroke:#64748B,color:#0F172A
    class common,shared,focused,organization,team,project neutral
{{< /mermaiddiagram >}}

*Figure 1. Collective spaces and access to resources. Reproduced from the Weaver [architecture introduction](https://github.com/ThalesGroup/fred/blob/weaver/docs/architecture/00-introduction.md#organizations-teams-and-projects).*

This model gives Fred a starting point for collective work that is independent of any particular agent or conversation.

## Architectural comparison

### OpenAI: execution and continuation

The Agents SDK provides tool execution, specialist handoffs, conversation continuity and resumable approval interruptions. Specialists can take over execution through handoffs or contribute as tools while a coordinating agent retains control.

Fred addresses these execution concerns within a wider scope: several people and agent runs may contribute to the same business activity. Persisting an agent run provides execution continuity; the application's shared progress and decisions require their own representation.

### Anthropic: reusable procedural knowledge

Agent Skills packages instructions, scripts and supporting resources that an assistant can discover and load as needed. This separates reusable expertise from the implementation of a particular agent. Anthropic's guidance on effective agents also distinguishes predefined workflows from model-directed execution.

This approach is consistent with Fred's use of reusable resources and capabilities. Weaver's additional concern is their placement and governance: which space owns a resource, who may maintain it, and which tools the executing agent is authorized to use. A skill's instructions do not themselves confer access rights.

### Microsoft: explicit flows and generative orchestration

Copilot Studio supports rule-based flows alongside generative orchestration. Agents can select tools and invoke flows; flows can include agent calls and human approvals. A predictable control structure can therefore contain tasks whose outputs remain probabilistic.

Fred adopts the same separation of responsibilities as a design principle for business applications: process rules belong to the application, while agents assist with selected tasks. Those applications may integrate existing customer services or supply domain-specific extensions.

### Salesforce: business actions and service ownership

Agentforce connects agents to actions implemented through Flow, Apex and connected services. Asynchronous integration patterns allow downstream services to own execution independently of an agent session. Access depends on the running identity and configured permissions; custom actions must preserve the relevant checks.

Fred similarly exposes service operations through capabilities. Its architectural objective is to connect those services within governed spaces while retaining their ownership of business transactions and records.

## Separation of responsibilities in Fred

The Weaver architecture assigns access decisions and resource placement to the **Control Plane**, assistant execution and capability libraries to **Agent Pods**, and document processing and retrieval to **Knowledge Flow**. The following diagram shows the Agent Pod execution path; it is a responsibility view, not a complete deployment topology.

{{< mermaiddiagram >}}
flowchart TB
    ui["Frontend<br/>Work in a selected space"]
    cp["Control Plane<br/>Rights, placement and lifecycle"]
    pod["Agent Pod<br/>Agents and capability libraries"]
    kf["Knowledge Flow<br/>Document processing and retrieval"]
    ui -->|"Manage resources"| cp
    ui <-->|"Chat"| pod
    pod -->|"Resolve authorized context"| cp
    pod -->|"Search authorized documents"| kf
    cp -.->|"Processing via Temporal"| kf

    classDef fred fill:#DBEAFE,stroke:#2563EB,color:#172554
    class ui,cp,pod,kf fred
{{< /mermaiddiagram >}}

*Figure 2. Components serving a space. Reproduced from the Weaver [system overview](https://github.com/ThalesGroup/fred/blob/weaver/docs/architecture/01-system-overview.md#11-components-serving-the-space). Blue denotes Fred components.*

These component boundaries support a corresponding distinction in business applications:

| Concept | Responsibility |
| --- | --- |
| Prompt | Express instructions. |
| Skill | Package a reusable procedure and supporting resources. |
| Capability | Expose operations through tools. |
| Agent | Use instructions and tools to perform a task. |
| Business application | Maintain process rules, shared progress and decisions. |

For a bid team, agents may review requirements or prepare a cost analysis while the application records approved gates and accepted deliverables. Approval of a tool call concerns an execution; approval of a gate concerns the collective business process.

A **durable shared dossier** is a Weaver direction under investigation. It would retain current progress, references to contributions and human decisions independently of individual conversations. This extends Fred's existing space model; it is not presented here as a completed workflow feature.

The comparison places Fred within a broader convergence toward reusable expertise, explicit processes and governed execution. Fred's contribution lies in their composition within an open-source working environment. The remaining design question is how little additional machinery is needed to support collective business progress reliably. [Weaver's release compass](/releases/weaver/) records that direction.

## References & Further Reading

The summaries below are paraphrases, not verbatim quotations. Documentation consulted on November 9, 2026.

- **OpenAI (Agents SDK & Human-in-the-Loop):** The SDK provides an execution loop with tools and handoffs, conversation continuity, and approval interruptions that can be resumed from saved state. See [Running agents](https://developers.openai.com/api/docs/guides/agents/running-agents), [Orchestration and handoffs](https://developers.openai.com/api/docs/guides/agents/orchestration), and [Guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals).

- **Anthropic (Agent Skills & Architecture):** Skills package instructions, scripts and supporting resources that agents can load as needed. Anthropic also recommends starting with simple solutions and adding agentic complexity only when needed. See [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/research/equipping-agents-for-the-real-world-with-agent-skills) (October 16, 2025; open-standard update December 18, 2025), [Building effective agents](https://www.anthropic.com/research/building-effective-agents) (December 19, 2024), and the [Agent Skills specification](https://agentskills.io/specification).

- **Microsoft (Copilot Studio & Hybrid Flows):** Copilot Studio combines rule-based flows with generative orchestration that selects tools, topics, knowledge and agents dynamically. Flows can include agent calls and human approvals. See [Agent flows overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/flows-overview) and [Orchestrate agent behavior with generative AI](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-generative-actions). Keeping critical business rules and authoritative record updates in explicit services or workflows is our architectural takeaway from these mechanisms.

- **Salesforce (Agentforce & Platform Architecture):** Agentforce integrates agents with enterprise data and business actions, including Flow and asynchronous processing patterns. Access depends on the execution identity and configured permissions; custom actions must preserve the relevant security checks. See [Agentic Integration Patterns](https://architect.salesforce.com/docs/architect/fundamentals/guide/agentic-integration-patterns) and [Configure Service Agent Access](https://help.salesforce.com/s/articleView?id=ai.agent_user.htm&language=en_US&type=5).

For an independent perspective, see **Carlos E. Perez**, [Structuring Agents, Skills, and MCPs: Best Practices from Anthropic](https://medium.com/intuitionmachine/structuring-agents-skills-and-mcps-best-practices-from-anthropic-9312849ccea6) (May 6, 2026). This is commentary, not an official Anthropic publication.