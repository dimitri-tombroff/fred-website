---
title: "Beyond Agent Framework Wars: Fred and the Infrastructure Layer"
date: 2026-02-21T10:00:00+02:00
summary: "Fred does not compete in the agent framework wars; it focuses on the production infrastructure layer for governed agent execution."
draft: false
weight: 50
pinned: true
homepage: true
tags:
  - Agentic Systems
  - Governance
  - Architecture
  - LangGraph
  - Infrastructure
contributors:
  - Dimitri Tombroff
---

# Beyond Agent Framework Wars: Fred and the Infrastructure Layer

The agent ecosystem is entering the phase where every serious team can feel both excitement and fatigue at the same time. New frameworks appear continuously, each with a compelling angle: cleaner tool-calling APIs, better graph orchestration, multi-agent coordination, more structured outputs, more memory abstractions. Most of them are useful. Some are genuinely excellent.

That is precisely why the current debate around “agent framework wars” is both interesting and, in my view, slightly misframed.

The most important question is not simply how an agent reasons. It is how an agent runs once reasoning leaves the notebook and enters a production system. That shift in perspective is increasingly shaping the design trajectory of Fred.

---

## The Question That Dominates Too Early

Most framework comparisons are built around a familiar set of concerns: how the model selects tools, how prompts are structured, how loops are implemented, how planning is represented, whether reflection is included, and how multi-agent coordination is expressed. These are valid engineering questions, and in many cases they make a real difference when building an agent for the first time.

But in deployed systems, those concerns quickly stop being the only ones that matter. A different family of questions starts to dominate: is the action allowed, should a human approve it, can it be audited, can the workflow resume safely after interruption, can long-running work be delegated, and can capabilities be exposed without collapsing governance into prompts. Those are not prompt-engineering questions. They are infrastructure questions.

That does not make framework work unimportant. It simply means the center of gravity moves.

---

## What the “Framework Wars” Framing Gets Right

The recent “agent framework container wars” argument is useful because it points at the underlying economic and architectural dynamic, not just feature checklists. Frameworks are becoming easier to replicate, hyperscalers can subsidize SDKs while monetizing runtimes, models are getting better at native tool use, and interoperability protocols such as MCP (and increasingly A2A patterns) are becoming more strategically important.

For Fred, the takeaway is not that frameworks no longer matter. The takeaway is that they should not become the deepest dependency in the platform. A platform can build on excellent frameworks and still be designed so that governance, capability modeling, runtime resolution, and observability remain durable even if the orchestration layer changes over time.

That is why Fred is converging toward a design centered on capabilities, shared governance, durable orchestration primitives, and transport/protocol abstraction, rather than betting the entire architecture on a single reasoning loop or one framework-specific agent idiom.

---

## Framework Layer vs Infrastructure Layer

It helps to draw a line between two layers that often get mixed in practice.

At the framework layer, the focus is on reasoning strategies, tool-calling abstractions, orchestration patterns, and memory handling. This is where LangChain, LangGraph, and many newer SDKs provide a lot of value, and Fred benefits from that ecosystem.

At the infrastructure layer, the problems are different. This is where capability modeling, policy enforcement, HITL integration, execution isolation (when required), durable workflows, deployment topology, and observability live. Fred is designed to operate in this layer. It builds on frameworks; it does not attempt to replace them.

This distinction matters because it clarifies what Fred is trying to optimize. It is not trying to “win” by proposing a better reasoning loop. It is trying to make governed agent execution practical.

---

## What Fred Provides Today and Where It Is Going

Fred is not a thin wrapper around an LLM, and it is also not yet the final form of the architecture it points toward. The most accurate way to describe it is as a platform with several strong implementation pieces already in place, plus a clear direction for how those pieces should be composed over time.

In the current codebase, Fred already provides a unified runtime that can resolve both remote MCP tools and local in-process capabilities, shared helpers for governance (including tool-approval HITL and localized HITL payload generation), deterministic workflow agents built with explicit LangGraph state machines, interrupt/resume orchestration as a platform primitive, integration patterns for long-running execution, and a UI/API surface increasingly shaped by platform concerns rather than prompt-only concerns.

There is also a second dimension that matters enormously in practice, especially in on-premise environments: the knowledge layer itself. In Fred, corpus management, document ingestion, and RAG preparation are treated as infrastructure concerns (with explicit trade-offs around latency, fidelity, delegation, and observability), not as incidental helpers attached to an agent prompt. This point matters because many agent platforms remain convincing at the reasoning layer while staying fragile at the document layer. Fred is unusual precisely because it addresses both. (I discuss this in more detail in [Document Ingestion Is Not a Side Effect](/blog/document-ingestion-is-not-a-side-effect/).)

At the same time, Fred is still in a transitional phase in a few places, and that is an important part of the story. For example, the catalog UI is still conceptually framed as an “MCP” catalog, even though it can now expose both remote MCP connectors and local in-process providers. Similarly, the architectural decomposition Planner -> Policy -> Executor is already visible in the design and in some building blocks, but the full platform-wide composition is still being consolidated.

That combination (real implementation plus explicit direction) is not a weakness. It is what a platform looks like when it is moving from prototype-friendly patterns toward reusable infrastructure.

---

## Concrete Signals in the Current Codebase

One reason I am confident in this direction is that the code already contains the right kinds of abstractions, even where naming has not fully caught up yet.

For instance, the connector configuration model now supports both a transport and a local provider key (via `MCPServerConfiguration` with `transport` and `provider`). In practice, this means the same catalog mechanism can represent a remote MCP endpoint or a local capability exposed in-process. It is still encoded in the “MCP” configuration namespace today, but the runtime behavior already points beyond a purely transport-first model.

The runtime itself reinforces this. Fred’s `MCPRuntime` can resolve remote tools and local in-process tools and return a single LangChain-friendly tool list (`list[BaseTool]`). That may sound like a small implementation detail, but it is a decisive architectural choice: agents consume a stable tool shape, while transport and provider differences stay in runtime plumbing instead of leaking into agent logic.

The same pattern appears in governance. Tool-level approval rules are no longer embedded ad hoc in prompts or repeated per agent. Fred now has a shared deterministic policy helper (see `tool_approval.py`) that classifies calls as read-only vs mutating (with exact-name overrides for sensitive business tools), and a shared HITL i18n helper that makes approval payloads follow the runtime language. In other words, governance behavior is becoming code-level infrastructure, not a prose convention.

Finally, the platform has a reusable gated tool loop (`build_tool_loop(...)`) that already captures a useful subset of the target model: model reasoning, optional HITL gating, and controlled tool execution inside a LangGraph graph. It is not yet the final “universal governed execution subgraph,” but it is exactly the kind of reusable primitive you would expect on the path toward one.

You can see this architecture directly in the current backend code. In `BasicReActAgent`, the generic tool-agent path wires a reusable tool loop with optional HITL gating via `interrupt(...)`:

```python
async def hitl_callback(tool_name: str, args: dict[str, Any]) -> dict[str, Any]:
    decision = interrupt({**payload, "free_text": True, "metadata": {...}})
    if (decision.get("choice_id") or decision.get("answer")) == "cancel":
        return {"cancel": True}
    return {}

return build_tool_loop(
    model=bound_model,
    tools=tools,
    system_builder=system_builder,
    requires_hitl=requires_hitl,
    hitl_callback=hitl_callback,
)
```

The Temporal execution path also reflects the same runtime model: a LangGraph agent runs inside a Temporal activity, and the scheduler-side runner resumes with `Command(resume=...)` when human input is provided, then inspects the graph state for pending interrupts to return a durable `BLOCKED` result instead of losing control flow:

```python
if task_input.human_input:
    result = await compiled.ainvoke(Command(resume=task_input.human_input), config=config)
else:
    result = await compiled.ainvoke(initial_state, config=config)

state_snapshot = await compiled.aget_state(config)
if state_snapshot.tasks and any(task.interrupts for task in state_snapshot.tasks):
    return AgentResultV1(status=AgentResultStatus.BLOCKED, checkpoint_ref=session_id)
```

And importantly, explicit business workflow agents still use `interrupt(...)` for domain decisions (for example, action selection in the postal demo), which is precisely why Fred must distinguish generic tool-approval HITL from business-workflow HITL even when they share the same primitive.

---

## Why Capability-First Matters

A lot of confusion in agent platforms comes from modeling connections before modeling what is actually being made available to the agent.

If you start from transport-first thinking, the configuration question becomes: “Which MCP server is attached?” That is sometimes useful operationally, but it is the wrong abstraction for governance, UX, and policy. The more useful question is: “What capability does this agent have?” Is it a web-and-GitHub read-only inspection capability? A corpus search capability? A postal business operations capability? An IoT diagnostics capability?

Once capability becomes the primary abstraction, the rest can be attached as metadata: source/provider kind (for example, MCP vs local) and transport (for example, `streamable_http`, `stdio`, or `inprocess`). This leads to a cleaner UI, clearer policy assignment, and a more stable runtime model because the platform can reason about what the agent is allowed to do before it reasons about how to connect to it.

Fred is not fully there yet in naming, but it is clearly moving in that direction. The recent support for `transport = "inprocess"` inside the current catalog is a good example of a transitional move that improves the system immediately while also exposing the next abstraction that should eventually become first-class.

---

## Governance Is Not Middleware Glue

In many agent prototypes, governance is handled in the least durable possible place: inside prompts, in ad hoc heuristics, or in one-off conditions embedded directly in each agent. That works until the platform grows. Then behavior diverges, audits become difficult, and “safe” behavior starts depending on which agent happened to be written by whom.

Fred is taking a different route. Governance is being extracted into shared components: deterministic tool approval policy, localized HITL payload generation, reusable gated tool loops, and explicit interrupt-based approval flows. The important point here is not just reuse. It is the separation of concerns.

Fred already supports (and should continue to support) at least two different governance layers that happen to use the same interrupt primitive:

- a **generic tool-approval HITL**, useful in ReAct/tool-calling agents when a mutating tool is about to run, and
- a **business workflow HITL**, where the user is not simply approving a tool call but making a domain decision (for example, choosing a branch in a process).

Those two patterns should not be conflated. They share mechanics (`interrupt(...)`), but not meaning. Treating them as the same thing would flatten the distinction between platform governance and business workflow UX.

This is also where Martin Fowler's recent framing of LLMs as a form of nondeterministic computing becomes useful in practice. If the reasoning layer is probabilistic, production reliability cannot depend on the reasoning loop alone. It has to come from the surrounding architecture: explicit policy, approval boundaries, durable orchestration, and controlled execution paths. In that sense, Fred is less a bet on a single framework than a bet on a deterministic envelope around nondeterministic components.

This is where the Planner -> Policy -> Executor direction becomes important. In that model, HITL is not a prompt trick and not a framework quirk; it is a policy outcome.

---

## Generic Agents and Deterministic Workflows Are Both Necessary

One mistake platforms often make is trying to turn one successful agent pattern into the only supported pattern. Fred is taking a more realistic position.

Generic tool-driven agents remain extremely useful. A `BasicReActAgent`-style agent, especially when constrained by shared tool policies and HITL gating, is a strong choice for dynamic assistants, exploratory workflows, and rapid iteration. It lets teams move quickly without having to encode every path as a graph before they even know what the interaction should be.

At the same time, explicit business workflow agents remain essential for governed execution. When the process must be deterministic, when branch choices matter, when approvals are semantically meaningful, or when demo/production reliability is critical, explicit LangGraph state machines are the right tool. Fred’s domain workflow samples already demonstrate this pattern.

The key design choice is not which of these wins. The key design choice is to support both under a unified runtime and shared governance primitives. That is a platform decision, not a framework preference.

---

## Planner -> Policy -> Executor as a Design Direction

The Planner -> Policy -> Executor decomposition is central to Fred’s design direction, but it is worth stating carefully to avoid turning it into a slogan.

This is the target platform decomposition. Fred already has several building blocks that map cleanly to it (shared approval policy, shared HITL i18n, reusable gated tool loops, explicit workflow agents), but the platform-wide shared composition is still being consolidated.

The planner is the layer that proposes actions based on context and capabilities. The policy layer is where deterministic decisions happen: whether an action is allowed, denied, requires clarification, requires approval, or should be routed to an asynchronous execution path. The executor is responsible for running only approved actions. Each layer has a different failure mode, a different observability profile, and a different governance requirement. That is precisely why they should be separated.

Today, LangGraph is Fred’s primary runtime for stateful orchestration, interrupts, and transitions. That is a strength, not a contradiction with the broader thesis. The important point is that Fred should remain able to evolve its orchestration choices without rewriting its capability model or governance model every time the framework landscape shifts.

---

## Why This Is Not “Anti-Framework”

Fred is not trying to win by inventing a new reasoning loop, and it is not dismissing frameworks. Fred builds on them where they add leverage, but it avoids treating framework convenience as platform architecture.

The most durable value in agent systems is increasingly found around the reasoning loop rather than inside it: capability modeling, governance enforcement, interrupt semantics, durable orchestration, observability, and production deployment patterns. Frameworks will keep evolving quickly. Some will become thinner as models improve; some will become more tightly coupled to hyperscaler runtimes; some will thrive in specific niches. Fred should be able to work with all of that.

Operationally, this means treating frameworks as pluggable runtimes and keeping platform governance and capability modeling as framework-independent as possible.

---

## A Strategic Bet

This is, fundamentally, a strategic bet about where durable value accumulates.

Many projects in the current wave optimize (understandably) for rapid experimentation, impressive demos, and clever prompting patterns. Fred is optimizing for something else: structured capabilities, centralized governance, deterministic workflows where needed, long-running orchestration, protocol-oriented integration (especially MCP today), deployable architecture, and production realism. That includes both the execution control plane for agents and the knowledge/corpus pipeline they depend on.

That is a slower path in some respects, but it is also a more durable one. Software history repeatedly shows that abstractions evolve quickly while infrastructure persists. If that pattern holds for agent systems as well, then the control plane for governed execution will matter more over time, not less.

---

## Conclusion

Fred does not compete at the reasoning layer. It is an open-source effort focused on the infrastructure layer that makes governed agent execution practical.

That means integrating frameworks rather than replacing them, centralizing governance instead of duplicating it, moving from transport-first catalogs toward capability-first modeling, and converging toward planning, policy, and execution as separate concerns. It also means accepting a practical reality: generic agents and deterministic workflow agents will coexist, and a serious platform should support both.

It also means treating the knowledge layer as part of the platform, not a side utility. In practice, governed agents and durable corpus ingestion belong to the same operational story.

Fred is built by a small team, and we are still learning by building, operating, and open-sourcing it. Some abstractions will evolve, and some assumptions may turn out to be wrong. But the direction we are betting on is clear: in a landscape crowded with agent frameworks, a major missing piece is often the control-plane layer that makes those frameworks safer, more governable, and more usable in production. Fred is our contribution to that layer.

---

## References

- [Agent Framework Container Wars](https://thenewstack.io/agent-framework-container-wars/)
- [Martin Fowler on Preparing for AI's Nondeterministic Computing](https://thenewstack.io/martin-fowler-on-preparing-for-ais-nondeterministic-computing/)
- [Document Ingestion Is Not a Side Effect](/blog/document-ingestion-is-not-a-side-effect/)
