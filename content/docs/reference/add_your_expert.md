---
title: "Add your expert"
description: "architecture and design of the fred python backend"
summary: ""
date: 2023-09-07T16:13:18+02:00
lastmod: 2023-09-07T16:13:18+02:00
draft: false
weight: 910
toc: true
seo:
  title: "" # custom title (optional)
  description: "" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  robots: "" # custom robot tags (optional)
---

## Add Your Expert to Fred

Fred makes it easy to create custom AI agents (called “experts”) that respond to user questions, use tools, or collaborate in multi-step processes.

You can build:

- Simple agents that respond to user prompts
- Tool-using agents that call external services (e.g., via MCP)
- Complex agents that participate in a LangGraph-powered multi-agent workflow

---

## Example: A Simple Expert

You can create a new expert by subclassing `AgentFlow`. Here’s an example of a minimal generalist agent:

```python
class GeneralistExpert(AgentFlow):
    name = "GeneralistExpert"
    role = "Generalist Expert"
    nickname = "Georges"
    ...

    async def async_init(self):
        self.model = get_model(self.agent_settings.model)
        self.base_prompt = "You are a helpful expert."
        self._graph = self._build_graph()
        super().__init__(...)
```

That's it — the agent is ready to respond!

---

## Tool-Using Agents

Fred also supports agents that use tools via [MCP servers](https://github.com/ThalesGroup/fred/blob/main/agentic_backend/docs/AGENTS.md#-toolkits-and-tool-binding). You can bind tools dynamically and build graphs that choose when to invoke them.

---

## Static vs. Dynamic

Agents can be registered statically (via config) or created dynamically at runtime via API. The same architecture applies in both cases.

---

## Want to Go Deeper?

See the [Fred GitHub repository](https://github.com/ThalesGroup/fred) for:

- Design principles for agents
- Toolkits and MCP integration
- Examples: `GeneralistExpert`, `DocumentsExpert`, `TabularExpert`
- How to register and use agents

Start from the [README – Agent Design](https://github.com/ThalesGroup/fred/blob/main/agentic_backend/docs/AGENTS.md) section.

---

## Ready to Build?

Fred gives you full control with minimal boilerplate. Build fast. Deploy securely. Compose smart.


