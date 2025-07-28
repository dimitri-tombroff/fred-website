---
title: "How to use Fred"
description: "Understanding how to configure and interact with Fred and its expert agents."
summary: "Use Fred as a multi-agent coordinator or interact directly with specialized experts. Learn how to configure, extend, and explore Fred."
date: 2023-09-07T16:04:48+02:00
lastmod: 2025-07-27T16:04:48+02:00
draft: false
weight: 810
toc: true
seo:
  title: "How to use Fred"
  description: "How to configure, extend, and interact with Fred's multi-agent orchestration system."
  canonical: ""
  robots: ""
---

## 🤖 Who is Fred?

Fred is an open-source, agentic flow chatbot designed to coordinate a **team of expert agents**. It supports complex user queries by dynamically planning and routing tasks to specialized sub-agents.

You can:

- Ask **Fred directly** (he’ll act as a team coordinator).
- Or interact with a **single expert** for focused, domain-specific questions.

---

## When to Use Fred vs. Experts

| Use Fred (the leader) when... | Use a direct expert when... |
|-------------------------------|------------------------------|
| Questions require multi-step planning | You know what domain you need (e.g., tabular) |
| Multiple skills may be needed | You want a fast answer |
| You want a single, synthesized reply | You don’t need orchestration |

---

## How Fred is Configured

The agentic part of Fred is configured via a YAML file (typically `config/configuration.yaml`). This file lists the available agents, their roles, and their model/tool configurations.

A simplified example:

```yaml
ai:
  default_model:
    provider: openai
    name: gpt-4o

  agents:
    - name: Fred
      class_path: app.agents.leader.leader.Leader
      type: leader
      enabled: true

    - name: GeneralistExpert
      class_path: app.agents.generalist.generalist_expert.GeneralistExpert
      enabled: true

    - name: TabularExpert
      class_path: app.agents.tabular.tabular_expert.TabularExpert
      enabled: true
      mcp_servers:
        - name: knowledge-flow-mcp-server
          url: http://localhost:8111/mcp_tabular
          transport: sse

    - name: DocumentsExpert
      class_path: app.agents.documents.documents_expert.DocumentsExpert
      enabled: true
      mcp_servers:
        - name: knowledge-flow-mcp-server
          url: http://localhost:8111/mcp_text
          transport: sse
```
👉 **Tip:** Refer to the live configuration file in [fred/backend/configuration.yaml](https://github.com/ThalesGroup/fred/blob/main/agentic_backend/config/configuration.yaml).

---

## 🚀 Trying Fred

1. **Enable experts** in the YAML config.
2. **Set your API key** (`OPENAI_API_KEY=...` in `.env`).
3. **Run backend + frontend** using `make run`.
4. Optionally, run **Knowledge Flow** for RAG/document support.
5. Start the UI

See the [Getting Started guide](https://github.com/ThalesGroup/fred#readme) for a live walkthrough.

---

## 🧪 Experiment & Extend

- Try asking Fred complex questions to observe multi-agent collaboration.
- Ask experts like `TabularExpert` or `DocumentsExpert` directly for focused queries.
- Watch logs to understand reasoning steps, expert selection, and tool usage.

---

## 🧱 Want to Create Your Own Expert?

- Create a class extending `AgentFlow`.
- Implement `async_init()` with:
  - Your model (`get_model(...)`)
  - Tool loading if needed
  - Prompt + graph definition
- Register the agent in your YAML config (or via API).
- ✅ Done!

For details about the agent architecture, see the [`agentic_backend` README](https://github.com/ThalesGroup/fred/tree/main/agentic_backend).


---

## 🤝 Contribute

Fred is an open, extensible platform. Feel free to open issues, suggest improvements, or build your own agents and share them with the community!
