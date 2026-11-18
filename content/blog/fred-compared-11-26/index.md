---
title: "Data Has a Lifecycle: Where Fred Stands Among AI Assistant Platforms"
slug: "fred-compared"
description: "Most AI assistants treat data as temporary context. Fred gives data an owner, a state and a lifecycle. A plain comparison with Open WebUI, IBM Bob and Coday/AgentOS."
summary: "Most AI assistants treat data as temporary context. We built Fred around a different premise: data has an owner, a state and a lifecycle. Here is how that sets Fred apart from Open WebUI, IBM Bob and Coday/AgentOS, with a side-by-side table."
date: 2026-11-18T07:00:00+01:00
lastmod: 2026-11-18T07:00:00+01:00
draft: false
weight: 50
categories: [platform, architecture]
tags: [fred, comparison, open-webui, ibm-bob, coday, data-lifecycle]
contributors:
- Dimitri Tombroff
- Fred Team
pinned: false
homepage: false
seo:
  title: "How Is Fred Different? Open WebUI, IBM Bob and Coday Compared"
  description: "Fred compared with Open WebUI, IBM Bob and Coday/AgentOS: scope, users, agents, knowledge, data lifecycle, deployment and license."
---

We are often asked a simple question: *how is Fred different from Open WebUI?* Sometimes the name is IBM Bob, sometimes Coday or its AgentOS service. The question is fair. All of these tools put AI assistants in front of people, all of them can use several models, and all of them talk about agents.

These three were not picked at random. Each represents a family of tools that people naturally compare Fred with: the open-source chat interface, the established vendor and the open-source developer initiative. Together with our [earlier comparison](/blog/fred-weaver-direction/) with OpenAI, Anthropic, Microsoft and Salesforce, they give a fair picture of where Fred stands.

The short answer is that they solve different problems. Comparing feature lists hides that. This article starts from the question each tool answers, then gives a side-by-side table, and ends with what makes Fred distinctive.

Most AI assistants treat data as temporary context. We built Fred around a different premise: **data has an owner, a state and a lifecycle**, recorded in a governed data catalogue at the platform's core.

## Four tools, four questions

| Tool | Family | The question it answers |
| --- | --- | --- |
| **Open WebUI** | Open-source chat interface | *How do I give my users a rich, self-hosted chat interface to any model?* |
| **IBM Bob** | Established vendor | *How do I help an enterprise development team build, modernize and ship software with AI?* |
| **Coday / AgentOS** | Open-source developer initiative | *How do I, as a developer, work with agents on my codebase, or embed agent orchestration in my product?* |
| **Fred** | Open-source governed platform | *How do teams, their documents, their agents and the data those agents produce share one governed lifecycle on our own infrastructure?* |

Two of these tools serve software developers. Open WebUI and Fred serve people working with knowledge. Even there, the emphasis differs: Open WebUI centres on the conversation, Fred on the space where a team's resources and data live.

## The common ground: open source and cloud native

Fred is released under the Apache 2.0 license and runs on Kubernetes, with Helm charts, PostgreSQL, object storage, a search index and Temporal for durable processing. People sign in through the organization's own OpenID Connect provider; Keycloak is supported but optional. Every component can run on your own cluster, including disconnected environments, with the models your organization approves. The models used to process documents, for OCR, reranking and audio transcription, run inside Fred and send no document to an external provider.

That alone is not a differentiator. Open WebUI is self-hosted and has Helm charts. Coday is MIT-licensed. IBM Bob now offers self-hosted and air-gapped deployment. Being open and deployable is the baseline. The real differences are in what each tool considers its core.

## Side by side

Information about other tools comes from their public documentation, consulted on November 18, 2026 (see the references). Tools evolve quickly; corrections are welcome.

| | **Fred** | **Open WebUI** | **IBM Bob** | **Coday / AgentOS** |
| --- | --- | --- | --- | --- |
| **Core** | Governed spaces with their resources and data | Chat interface to models | AI partner for the software lifecycle | Agent framework for developers; agent orchestration service |
| **Interface** | Organized by place of work: each space gathers its agents, resources, Wiki, applications and members | Organized by object type: models, knowledge, prompts, tools | IDE and the Bob Shell command line | Web chat on a project (Coday); REST API (AgentOS) |
| **Primary users** | Organizations and their teams | Individuals and teams of an instance | Enterprise developers | Developers; product teams embedding agents |
| **Unit of collaboration** | Organization, team, project and personal *spaces*, with roles per space | Users, groups and per-resource permissions | Repository and development workflow | Project directory (Coday); namespaces and cases (AgentOS) |
| **Agents** | Agent Pods in Python or Rust, your own pods, external MCP tools, scoped delegation | Model presets with instructions, tools and knowledge | Built-in modes (Code, Plan, Orchestrator…), multi-agent workflows | Agents declared in YAML or Kotlin plugins, MCP tools |
| **Documents and knowledge** | Space drives, durable processing, Knowledge Base mirrors of external sources, team Wiki | Knowledge collections from uploaded files, hybrid search | Source code and enterprise systems | Project files and persistent context |
| **Data produced by agents** | Catalogued: working files, published deliverables, Wiki proposals that a human approves, with provenance | Chat history, notes and memory | Code changes reviewed through human checkpoints | Conversation and file exchange per case |
| **Model governance** | Per organization, decided for every turn by the Control Plane; credentials never reach the browser | Administrator chooses connections and model access | Multi-model routing managed by Bob | Provider keys configured per installation |
| **Business applications** | Hosted applications embedded in a team's space | Functions and pipelines extend the chat | Specialized modernization workflows | AgentOS embedded in a host product (Whoz) |
| **Deployment** | Kubernetes, Helm, self-hosted | Docker, pip, Helm | IBM SaaS or self-hosted | Local `npx` web server; Docker for AgentOS |
| **License** | Apache 2.0 | Open WebUI License: BSD-3 plus a branding clause above 50 users; not OSI-approved | Proprietary | MIT |

The table shows complementary rather than overlapping tools. A team can code with Bob or Coday and use Fred to manage the knowledge its business relies on. Open WebUI is the closest comparison, and the one where the difference in approach matters most.

## What makes Fred different: data has a lifecycle

Most assistants treat data as context: files are uploaded, indexed and offered to the model. In Fred, data is a resource with an owner, a state and a history. Fred's **Control Plane** keeps that history in PostgreSQL: where every document belongs, which processing attempts ran, which results were produced, which were published, and what was deleted and when. File bytes live in object storage; the catalogue records their placement and state.

{{< mermaiddiagram >}}
flowchart TB
    subgraph space["A team's space"]
        direction TB
        upload["Uploaded document<br/>Original preserved"]
        mirror["Knowledge Base mirror<br/>Synchronized from an external source"]
        process["Processing attempt<br/>Extract and index"]
        published["Published result<br/>Searchable by authorized agents"]
        work["Agent working files<br/>Private to the conversation"]
        proposal["Wiki proposal<br/>Drafted by an agent"]
        wiki["Team Wiki page<br/>Approved, with provenance"]
    end
    catalogue[("Control Plane catalogue<br/>PostgreSQL")]
    upload --> process
    mirror --> process
    process -->|"Accepted"| published
    work -->|"Human approval"| proposal
    proposal --> wiki
    catalogue -.->|"Placement, state, provenance"| space

    classDef fred fill:#DBEAFE,stroke:#2563EB,color:#172554
    classDef cots fill:#FEF3C7,stroke:#B45309,color:#451A03
    class upload,mirror,process,published,work,proposal,wiki fred
    class catalogue cots
{{< /mermaiddiagram >}}

*Figure 1. One catalogue for documents, synchronized sources and agent contributions. Simplified from the Fred [architecture documentation](https://github.com/ThalesGroup/fred/blob/weaver/docs/architecture/05-documents.md).*

This catalogue is what makes a few simple rules enforceable:

- **Producing is not publishing.** A processing job or an agent can write a result; it becomes visible only once the Control Plane accepts it. An upload, or vectors in an index, does not make a document available to agents.
- **Sharing a space does not share conversations.** A team member can use the team's documents and assistants without seeing anyone else's conversations.
- **Administering is not reading.** A technical administrator or a space owner manages people and settings, but reads no documents or conversations without an explicit content role. Every role change leaves an audit event.
- **The search index grants nothing.** Each passage an agent finds is checked against the person's current rights before the model sees it.
- **Agents propose, people decide.** An agent can draft a change to the team Wiki; a person approves it. The published page keeps its provenance, even after the original conversation is deleted.
- **Deletion is real.** Deleting removes access at once; cleanup runs in the background and leaves a durable receipt.
- **One corpus, one embedding model.** An organization's documents are indexed with a single embedding model, locked at first use, so search never mixes incompatible vectors.

Many of these rules are checked by the database itself, through constraints and triggers, not only by application code. This is the part of Fred we consider most original. A chat interface cannot easily retrofit it: it must be designed into the platform from the start.

## Knowledge is infrastructure

An agent platform without a serious knowledge stack does not go far. Dedicated projects such as [Onyx](https://github.com/onyx-dot-app/onyx), [Dify](https://dify.ai/blog/introducing-knowledge-pipeline) and [RAGFlow](https://github.com/infiniflow/ragflow) show that the industry agrees. Fred ships one by default: **Knowledge Flow** processes documents, combines semantic and keyword search, and answers SQL queries over tables stored as Parquet files in object storage. Text and tables follow the same access rules.

Knowledge Flow holds no authority of its own. The Control Plane decides access and publication; search indexes are projections of the catalogue. This is what makes the knowledge layer open to others:

- **Knowledge Bases bring knowledge in.** A Knowledge Base is a small program built with the SDK. At its simplest, it synchronizes an external source, such as a Git repository or a WebDAV share, into a space. It can also transform what it collects before publishing it. It works within a mandate admitted for one space and never handles tenants or roles itself.
- **Other engines can follow.** Richer engines, for example graph-based ones with their own storage, are a direction we are investigating. The [roadmap](/docs/roadmap.html#knowledge) describes how they would plug into the same governance.

Documents are only the starting point. Fred already turns them into forms suited to AI, Markdown text and Parquet tables. Increasingly, knowledge will be produced directly in such forms, by people and by agents.

## Agents are guests in a space

In Open WebUI, an agent is mainly a model preset: a model, a prompt, some tools and some knowledge. In Fred, an agent runs in an **Agent Pod**, a separate workload that is admitted for every turn. The Control Plane decides which model it may use, which documents it may search and which tools it may call, from the space and the person on whose behalf it acts.

This separation has practical consequences:

- **Several runtimes, one set of rules.** Fred supplies a Python pod and an embedded Rust agent, Ralph, which runs inside the Control Plane. Developers can bring their own pods with the SDK. All of them follow the same admission rules.
- **Applications own their business rules.** A hosted application, such as a quiz generator or an agent evaluator, appears inside a team's space. Fred controls who may open it; the application keeps its own business records.

Consumption follows the same discipline. Agents report the tokens they use to the Control Plane, which records each report once, in SQL, against the person, space, agent and model. People and team leads follow their usage with cost, energy and CO2e estimates: frugality becomes something you can measure.

The result is a platform where the organization defines the rules, and agents, applications and connectors work within them.

## Capabilities are products, not scripts

Because data, models and tools are governed, what agents deliver can be governed too: their deliverables become reliable, auditable objects rather than files produced on the fly.

Generating a PowerPoint file is no longer remarkable. In Open WebUI, a model can write Python code with python-pptx in a sandbox, and community tools fill corporate templates. That approach is flexible; the result depends on the model and on the tool chosen.

Fred takes the opposite approach: a few capabilities, each with a contract on its result. The presentation builder is the clearest example:

- **The template is prepared once.** It is analysed in the background and an administrator reviews the detected slides. It then becomes governed, reusable configuration, while each presentation belongs to its conversation and disappears with it.
- **The agent composes with the template.** For each slide, it chooses the template slide that best fits the content, and turns numbers into editable charts in the template's colours.
- **The result is accountable.** The agent can submit its plan for approval before building. A report shows what was shortened, left out or moved. The speaker notes cite the source of each piece of content, and figures are never invented unless requested, in which case the chart says so.
- **Revisions are precise.** A user asks to change slide 4 or to give slide 6 the layout of slide 3; the other slides remain unchanged.

The same discipline applies to the documents an agent writes beside the conversation and to the web pages it produces. Web pages are rendered without JavaScript, a deliberate security choice. What a model alone cannot guarantee, respect for the template, provenance and a reliable revision process, is what Fred's capabilities provide.

## Where this leads: agents that collaborate through data

Most multi-agent systems today coordinate through messages: one agent hands a task to another, asks a question, and waits for an answer. Fred already supports this, with [scoped delegation](/blog/calling-in-a-specialist/) that ensures a specialist sees only what the caller was allowed to see.

Messages, however, are short-lived. Once the conversation ends, the reasoning and the intermediate results are often lost. We are now exploring a different form of collaboration, built on the data catalogue: agents contribute durable, governed data that other agents and people can find, verify and reuse.

{{< mermaiddiagram >}}
flowchart TB
    subgraph messages["Coordination by messages"]
        direction TB
        a1["Agent A"] -->|"Asks"| b1["Agent B"]
        b1 -->|"Answers"| a1
    end
    subgraph data["Collaboration through data"]
        direction TB
        a2["Agent A"] -->|"Contributes"| d["Catalogued result<br/>Owner, state, provenance"]
        d -->|"Reused within rights"| b2["Agent B"]
        d -->|"Reviewed"| p["Team members"]
    end

    classDef neutral fill:#F1F5F9,stroke:#64748B,color:#0F172A
    classDef fred fill:#DBEAFE,stroke:#2563EB,color:#172554
    class a1,b1,a2,b2,p neutral
    class d fred
{{< /mermaiddiagram >}}

*Figure 2. The direction we are exploring: a result produced by one agent becomes a governed resource for the rest of the team.*

The building blocks exist: published deliverables with stable identities, Wiki proposals approved by people, and provenance preserved in the catalogue. The question we want Fred to answer is how knowledge produced in a conversation becomes knowledge the team, then the organization, can rely on. Our working hypothesis is a governed **promotion** cycle: an immutable copy, with its provenance, is promoted from a conversation to a team collection, then to the organization, by a person with the right role or by a space policy. An agent reuses what has been promoted to the level where it works. The [roadmap](/docs/roadmap.html#knowledge) details this direction; future articles will follow its progress.

## Which one should you choose?

- Choose **Open WebUI** for a polished, self-hosted chat interface to many models, quickly, for individuals or teams within one instance.
- Choose **IBM Bob** to equip an enterprise development team with an AI partner across the software lifecycle, including mainframe and IBM i modernization.
- Choose **Coday** for a lightweight, open-source agent on your own codebase, or **AgentOS** to add agent orchestration to an existing product as a separate Spring Boot service, as Whoz does.
- Choose **Fred** when several teams need to share knowledge, assistants and applications under clear rules, and when the data those assistants use and produce must have an owner, a state and a history, on infrastructure you control.

## An open invitation

The questions ahead are among the most interesting in this field, and among the hardest. How should knowledge produced with an agent earn the trust of a team, then of an organization? What should a governed collection contain, and what should stay inside the engines that build it? How can agents build on each other's work without exchanging more than they are entitled to see? How do we keep all of this frugal enough to run anywhere, from a large cluster to a small embedded deployment?

We do not have all the answers, and we would rather find them with others. Fred is built in the open, and the [architecture documentation](https://github.com/ThalesGroup/fred/blob/weaver/docs/architecture/README.md) explains each boundary described here. There are many ways to take part:

- **Bring a use case.** Real business problems, with real data and real constraints, are what shape Fred best.
- **Build on the SDK.** Write a Knowledge Base, an agent or an application, open source or proprietary, and tell us where the contracts help or get in the way.
- **Challenge the design.** The [roadmap](/docs/roadmap.html#knowledge) states our working hypotheses openly; contrary evidence is as valuable as support.
- **Share what you measure.** Evaluations, benchmarks and failures teach us as much as successes.

Researchers, students and industrial teams are all welcome. [Join us on GitHub](https://github.com/ThalesGroup/fred) to start the conversation.

## References

Documentation consulted on November 18, 2026. Summaries are paraphrases, not quotations.

- **Open WebUI:** [Features](https://docs.openwebui.com/features) describe knowledge collections with hybrid search, model presets, MCP and OpenAPI tools, notes, channels, groups and SCIM provisioning, and Kubernetes deployment. The [license page](https://docs.openwebui.com/license) explains that code from v0.6.6 onward adds a branding clause to BSD-3 and is not an OSI-approved open-source license. [Artifacts](https://docs.openwebui.com/features/chat-conversations/chat-features/code-execution/artifacts) render HTML and SVG beside the chat, and [Open Terminal](https://docs.openwebui.com/features/open-terminal/use-cases/creating-files) lets a model create Word and PowerPoint files with Python libraries.
- **Knowledge platforms:** [Onyx](https://github.com/onyx-dot-app/onyx) combines enterprise search, connectors and agents; [Dify's knowledge pipeline](https://dify.ai/blog/introducing-knowledge-pipeline) assembles parsing, chunking and embedding plugins; [RAGFlow](https://github.com/infiniflow/ragflow) focuses on deep document understanding.
- **IBM Bob:** IBM's [product page](https://www.ibm.com/products/ai-coding-agent) and [launch announcement](https://newsroom.ibm.com/2026-04-28-introducing-ibm-bob-ai-development-partner-that-takes-enterprises-from-ai-assisted-coding-to-production-ready-software) (April 28, 2026) present Bob as an AI development partner for the software lifecycle. IBM later [extended Bob to self-hosted environments](https://www.ibm.com/new/announcements/ibm-bob-expands-to-self-hosted-environments-for-sensitive-and-mission-critical-enterprise-software), including air-gapped deployments.
- **Coday and AgentOS:** The [Coday repository](https://github.com/whoz-oss/coday) describes an MIT-licensed, lightweight agentic framework for developers, run locally with a web interface. Its [AgentOS module](https://github.com/whoz-oss/coday/blob/master/agentos/AGENTOS.md) is a Spring Boot and Kotlin orchestration service with plugin agents, designed to be embedded in products such as Whoz.
- **Technologies named in this article:** [Kubernetes](https://kubernetes.io/), [Helm](https://helm.sh/), [PostgreSQL](https://www.postgresql.org/), [Temporal](https://temporal.io/), [OpenID Connect](https://openid.net/developers/how-connect-works/), [Keycloak](https://www.keycloak.org/), [Model Context Protocol (MCP)](https://modelcontextprotocol.io/), [Apache Parquet](https://parquet.apache.org/) and [python-pptx](https://github.com/scanny/python-pptx). Licenses: [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) and the [OSI-approved licenses](https://opensource.org/licenses). [Whoz](https://www.whoz.com/) is the product that embeds AgentOS.
- **Fred:** [Architecture documentation](https://github.com/ThalesGroup/fred/blob/weaver/docs/architecture/README.md), [system overview](https://github.com/ThalesGroup/fred/blob/weaver/docs/architecture/01-system-overview.md) and [documents and knowledge](https://github.com/ThalesGroup/fred/blob/weaver/docs/architecture/05-documents.md). Related articles: [team Wiki](/blog/team-wiki/), [Knowledge Bases](/blog/knowledge-bases/) and [Synthia](/blog/quiz-app/).
