---
title: "Add your expert"
description: "Architecture, patterns, and ready-to-paste examples for building Fred experts"
summary: "How to create a basic expert and a tool-using Sentinel-style expert with resilient MCP integration."
date: 2025-08-27T12:00:00+02:00
lastmod: 2025-08-27T12:00:00+02:00
draft: false
weight: 910
toc: true
seo:
  title: "Add your expert"
  description: "Create simple and tool-using experts in Fred, including resilient MCP integration and auth refresh."
---

## TL;DR — what changed (and why you’ll like it)

We’ve made building tool-using experts (agents) much simpler and more reliable:

- Centralized MCP runtime: `MCPRuntime` owns connect/refresh/close, so agents don’t.
- Drop-in resilience: `make_resilient_tools_node(...)` auto-recovers from timeouts/401s and still emits ToolMessages so your graph stays valid (no “dangling tool_calls” 400s).
- Context-aware tools: `McpToolkit` wraps raw MCP tools and injects runtime context (e.g., library/project filters) automatically.
- Consistent logging: Snapshots show which client/toolkit/tools are bound before/after refreshes—debuggable at a glance.

Use the Generalist template for chat-only agents, and the Sentinel template when you need MCP tools (OpenSearch/KPIs/etc.).

---

## Quickstart: a minimal generalist expert

This expert just chats—no tools. It shows the smallest, “good citizen” AgentFlow pattern.

```python
    # app/agents/generalist/generalist.py
    import logging
    from datetime import datetime
    from langgraph.constants import START
    from langgraph.graph import MessagesState, StateGraph

    from app.core.agents.flow import AgentFlow
    from app.core.model.model_factory import get_model
    from app.common.structures import AgentSettings

    logger = logging.getLogger(__name__)

    class GeneralistExpert(AgentFlow):
        name: str
        role: str
        nickname: str
        description: str
        icon: str = "assistant"
        categories: list[str] = []
        tag: str = "general"

        def __init__(self, agent_settings: AgentSettings):
            self.agent_settings = agent_settings
            self.name = agent_settings.name
            self.nickname = agent_settings.nickname or agent_settings.name
            self.role = agent_settings.role
            self.description = agent_settings.description
            self.categories = agent_settings.categories or ["general"]
            self.tag = agent_settings.tag or "general"

            self.current_date = datetime.now().strftime("%Y-%m-%d")
            self.base_prompt = (
                "You are a thoughtful, concise assistant. "
                f"Current date: {self.current_date}."
            )

            self.model = None
            self._graph = None

        async def async_init(self):
            # 1) choose model
            self.model = get_model(self.agent_settings.model)

            # 2) build a tiny graph: START -> reasoner
            builder = StateGraph(MessagesState)
            builder.add_node("reasoner", self.reasoner)
            builder.add_edge(START, "reasoner")
            self._graph = builder.compile()

            # 3) register with AgentFlow base
            super().__init__(
                name=self.name,
                role=self.role,
                nickname=self.nickname,
                description=self.description,
                icon=self.icon,
                graph=self._graph,
                base_prompt=self.base_prompt,
                categories=self.categories,
                tag=self.tag,
                toolkit=None,  # no tools for this expert
            )

        async def reasoner(self, state: MessagesState):
            # prepend base prompt and let the model answer
            resp = self.model.invoke([self.base_prompt] + state["messages"])
            return {"messages": [resp]}
```

---

## Tool-using experts (MCP): Sentinel template

A production-ready pattern for experts that call MCP tools (OpenSearch, KPI, etc.). The key parts are:

- MCPRuntime: connect/refresh/close tools outside your agent logic.
- McpToolkit: wraps tools with runtime context.
- make_resilient_tools_node(...): retries + emits fallback ToolMessages when a tool call failed or timed out—so your graph doesn’t break.

```python
    # app/agents/sentinel/sentinel.py
    import json
    import logging
    from datetime import datetime
    from typing import Any, Dict

    from langchain_core.messages import ToolMessage
    from langgraph.constants import START
    from langgraph.graph import MessagesState, StateGraph
    from langgraph.prebuilt import tools_condition

    from app.core.agents.flow import AgentFlow
    from app.core.model.model_factory import get_model
    from app.common.structures import AgentSettings

    from app.common.mcp_runtime import MCPRuntime
    from app.common.resilient_tool_node import make_resilient_tools_node

    logger = logging.getLogger(__name__)

    class SentinelExpert(AgentFlow):
        name: str
        role: str
        nickname: str
        description: str
        icon: str = "ops_agent"
        categories: list[str] = []
        tag: str = "ops"

        def __init__(self, agent_settings: AgentSettings):
            self.agent_settings = agent_settings
            self.name = agent_settings.name
            self.nickname = agent_settings.nickname or agent_settings.name
            self.role = agent_settings.role
            self.description = agent_settings.description
            self.categories = agent_settings.categories or ["ops", "monitoring"]
            self.tag = agent_settings.tag or "ops"

            self.current_date = datetime.now().strftime("%Y-%m-%d")
            self.base_prompt = (
                "You are Sentinel, an operations/monitoring expert for Fred.\n"
                "- Use os.* tools for OpenSearch health, shards, indices, mappings, diagnostics.\n"
                "- Use kpi.* tools for usage, latency, error rates.\n"
                "Return concise, actionable summaries with next steps. "
                f"Current date: {self.current_date}."
            )

            self.model = None
            self._graph = None

            # NEW: shared runtime for MCP
            self.mcp = MCPRuntime(
                agent_settings=self.agent_settings,
                context_provider=lambda: self.get_runtime_context(),  # optional
            )

        async def async_init(self):
            # 1) model
            self.model = get_model(self.agent_settings.model)

            # 2) connect MCP once
            await self.mcp.init()

            # 3) bind tools on the model
            self.model = self.model.bind_tools(self.mcp.get_tools())

            # 4) graph: START -> reasoner -> (if tools) tools -> reasoner
            builder = StateGraph(MessagesState)
            builder.add_node("reasoner", self.reasoner)

            # resilient ToolNode: retries/timeouts/401 and yields ToolMessages fallback
            tools_node = make_resilient_tools_node(
                get_tools=lambda: self.mcp.get_tools(),
                refresh_cb=self.mcp.refresh,  # atomically refresh client+toolkit
            )
            builder.add_node("tools", tools_node)
            builder.add_edge(START, "reasoner")
            builder.add_conditional_edges("reasoner", tools_condition)
            builder.add_edge("tools", "reasoner")
            self._graph = builder.compile()

            # 5) register with AgentFlow
            super().__init__(
                name=self.name,
                role=self.role,
                nickname=self.nickname,
                description=self.description,
                icon=self.icon,
                graph=self._graph,
                base_prompt=self.base_prompt,
                categories=self.categories,
                tag=self.tag,
                toolkit=None,  # toolkit is owned inside MCPRuntime
            )

        async def reasoner(self, state: MessagesState):
            """
            One LLM step; may call tools. After tools run, collect ToolMessages so
            the UI can display the raw tool payloads if useful.
            """
            resp = self.model.invoke([self.base_prompt] + state["messages"])

            # Collect tool outputs by tool name (last win)
            tool_payloads: Dict[str, Any] = {}
            for msg in state["messages"]:
                if isinstance(msg, ToolMessage) and getattr(msg, "name", ""):
                    raw = msg.content
                    try:
                        tool_payloads[msg.name] = json.loads(raw) if isinstance(raw, str) else raw
                    except Exception:
                        tool_payloads[msg.name] = raw

            meta = resp.response_metadata.get("tools", {})
            meta.update(tool_payloads)
            resp.response_metadata["tools"] = meta

            return {"messages": [resp]}
```

### Why this pattern?

- No more “dangling tool_calls”: If the first tool request hits a timeout/401, the resilient node yields a ToolMessage per tool_call (with a short note). The graph stays valid; the model can respond and ask the user to retry.
- Safe auth refresh: MCPRuntime.refresh() swaps the client+toolkit under a lock, then you re-bind tools (done inside the runtime for you).
- Debuggable: MCP runtime logs snapshots before/after refresh—client IDs, toolkit IDs, tool names—so you can see exactly what is bound.

---

## Using MCPRuntime & McpToolkit (under the hood)

- MCPRuntime.init(): connects to all servers in your agent’s MCP config (supports sse, streamable_http, websocket, stdio), injects outbound auth headers/env, and creates a McpToolkit.
- McpToolkit: wraps each MCP tool with a context-aware shim so your agent’s runtime context (like current library/tenant) is automatically passed.
- MCPRuntime.refresh(): atomically reconnects and replaces the toolkit; the old client is closed quietly (async if available, else sync, else AsyncExitStack).
- MCPRuntime.refresh_and_bind(model): convenience to refresh and return a model already rebound with fresh tools.

You don’t need to call these directly inside your node—make_resilient_tools_node will trigger refresh_cb when needed.

---

## Checklist to add a new MCP expert

1. Define your agent class (subclass AgentFlow).
2. Create an MCPRuntime in __init__, pass a context_provider if you need contextual tool params.
3. await self.mcp.init() in async_init, then bind the tools: self.model = self.model.bind_tools(self.mcp.get_tools()).
4. Build the graph with:
   - reasoner LLM node
   - tools node from make_resilient_tools_node(get_tools=self.mcp.get_tools, refresh_cb=self.mcp.refresh)
   - Edges: START → reasoner, reasoner → (tools_condition), tools → reasoner
5. (Optional) In reasoner, harvest ToolMessages into response.response_metadata["tools"] to surface raw payloads in your UI.

That’s it—your expert is robust to transient MCP issues and easy to maintain.

---

## Testing tips

- Start the expert, ask a tool-invoking question, then simulate a 401 (expire or revoke the token). You should see:
  - A timeout/401 in logs → the tools node refreshes, emits fallback ToolMessages, and your model still replies.
  - The next user retry succeeds without restarting the agent.
- Check logs for “[MCP][Snapshot]” lines before/after refresh—they confirm client/toolkit changes and bound tools.

---

## Related files (for reference)

- app/common/mcp_runtime.py — owns MCP client lifecycle and tool (re)binding
- app/common/mcp_toolkit.py — wraps MCP tools with runtime context
- app/common/resilient_tool_node.py — resilient ToolNode factory (timeouts/401s → fallback ToolMessages + refresh)
- app/core/agents/flow.py — base AgentFlow with graph plumbing
- app/core/model/model_factory.py — model creation (e.g., gpt-4o)

Build fast. Stay resilient. Happy shipping 🚀
