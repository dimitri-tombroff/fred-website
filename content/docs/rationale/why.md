---
title: "Why Fred - A Developer Manifesto"
description: "Fred is the missing layer between LangChain and real-world agentic applications. Learn why it's built for developers — not just demos."
summary: "Fred makes it easy to build, test, and run tool-using, multi-agent systems. If you're a developer tired of redoing orchestration, async, or tool plumbing — start here."
date: 2025-05-22T18:00:00+02:00
lastmod: 2025-05-19T18:00:00+02:00
draft: false
weight: 910
toc: true
seo:
  title: "Why Fred – A Developer Manifesto"
  description: "Fred and knowledge-flow make agentic development clean, scalable, and fun again. Learn why developers choose Fred to build serious, production-grade agents."
  canonical: "https://fredk8.dev/why/"
  robots: "index, follow"
---

You want to build an agent that does more than answer questions.

You want it to:
- Use tools
- Coordinate with others
- Run in production
- And not fight with lifecycle, async bugs, or YAML spaghetti.

## Fred is for you.

Fred is an **agentic framework built by practitioners**, not just to demo ideas — but to run real agents, securely and repeatedly.

---

## 🔍 What Fred gives you (that’s surprisingly rare)

- ✅ **LangGraph-powered agents**, with multi-step flows, conditionals, and state.
- ✅ **Tools + Experts** — like `TabularExpert`, `DocumentsExpert`, `RagsExpert` — that actually work out of the box.
- ✅ **Leader agents** that plan, delegate, and summarize results across experts.
- ✅ **Built-in support** for OpenAI, Azure, Ollama, and real backend integration (RAG, vector search, SQL).
- ✅ **Full lifecycle support**: from dev notebooks to Docker to Kubernetes.

---

## 🚀 Agents are easy to build

Define a new agent in seconds:

```python
class MyAgent(AgentFlow):
    def __init__(self, settings: AgentSettings):
        self.model = get_model(settings.model)
        self._graph = self._build_graph()
        super().__init__(..., model=self.model, graph=self._graph)

    def _build_graph(self): ...
```

Need tools? Add `toolkit`, bind tools, and use `ToolNode`.  
Need async? Just implement `async_init()` — it's all wired for you.

Fred abstracts the *hard parts* — async FastAPI, stateful memory, WebSocket streaming — so you can focus on logic.

---

## 🧩 Static or Dynamic

Fred supports:
- ✅ Declarative YAML-based agent loading
- ✅ Dynamic runtime creation (via API or code)
- ✅ Integration with MCP services (toolchains, databases, clusters, etc.)

Everything is typed, clean, and minimal.

---

## What takes time without Fred

- Getting async + tool + graph orchestration to *not break*
- Reusing models and toolkits across sessions without bugs
- Hooking LangGraph + WebSockets + FastAPI the right way
- Explaining to others what’s happening

You’ll spend hours or days debugging what Fred gives you in minutes.

---

## For data scientists too

Want to test your toolchain in a notebook? Easy.

```python
agent = TabularExpert(agent_settings)
await agent.async_init()
await agent.compiled_graph.ainvoke({"messages": [HumanMessage(...)]})
```

Fred works with LangChain and LangGraph directly.  
No lock-in. No code generation. Just Python.

---

## TL;DR

Fred is the **missing layer** between LangChain experiments and real agentic applications.  
It’s built to help you create serious, tool-using, multi-agent systems **without getting lost in infra**.

Try it.
