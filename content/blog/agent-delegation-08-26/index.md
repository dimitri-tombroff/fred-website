---
title: "Calling In a Specialist: Scoped Delegation Between Agents in Fred"
slug: "calling-in-a-specialist"
description: "Why letting one agent call another isn't the hard part — the hard part is making sure the specialist only ever sees what the caller was already allowed to see. How Fred's invoke_agent and InvocationScope solve this today, and the resolver role that's still missing."
summary: "When one Fred agent calls another for expert help, the interesting engineering problem isn't the call itself — it's making sure the specialist only ever sees what the caller was already entitled to see. Here's how invoke_agent and InvocationScope handle that today, and what's still missing."
date: 2026-08-05T10:00:00+02:00
lastmod: 2026-08-05T10:00:00+02:00
draft: true
weight: 50
categories: [architecture, agents]
tags:
  - multi-agent
  - delegation
  - access-control
  - agent-sdk
  - architecture
contributors:
  - Dimitri Tombroff
pinned: false
homepage: false
seo:
  title: "Calling In a Specialist: Scoped Delegation Between Agents in Fred"
  description: "How Fred's invoke_agent and InvocationScope let one agent safely delegate to a specialist agent, and the resolver primitive still missing from the pattern."
  canonical: ""
  robots: "index, follow"
---

# Calling In a Specialist: Scoped Delegation Between Agents in Fred

Imagine a lawyer at a mid-sized firm. A client walks in with a question outside the lawyer's own specialty — the tax implications of a cross-border acquisition, say. The lawyer doesn't try to become a tax expert overnight. They walk down the hall and ask the firm's tax specialist.

That works because two things are true at once. First, the specialist genuinely knows tax law better than the generalist ever will — that is the entire point of asking. Second, the specialist does not get to open every client file in the building to answer the question. They see exactly one file: the one the lawyer brought them, under the same confidentiality the lawyer themselves is bound by. A different client's file, however relevant it might look, is not on the table.

The second property is easy to take for granted in a real firm, because a human — a clerk, a records manager, plain professional habit — enforces it without anyone writing it down. It is not automatic at all when the "lawyer" and the "specialist" are two AI agents. And it is precisely the part most multi-agent designs skip.

---

## The part everyone gets right: agents can call agents

Letting one agent delegate to another is, by now, a solved problem in the abstract. Every serious agent framework has some notion of it — a hand-off, a sub-graph call, a routed message to a teammate.

Fred's version of this is `invoke_agent`, available to any graph node or ReAct tool through the runtime context:

```python
async def invoke_agent(
    self,
    agent_id: str,
    message: str,
    *,
    prior_turns: tuple[ConversationTurn, ...] = (),
    output_schema: type[BaseModel] | None = None,
    scope: InvocationScope | None = None,
) -> AgentInvocationResult:
```

Two design choices are worth pausing on. First, this is a **bounded function call, not a hand-off**: the caller keeps control of its own turn and gets a typed result back, rather than transferring the conversation to the callee. Second, `output_schema` is optional — a caller can ask the specialist for free text, or for a validated Pydantic object it can act on programmatically without re-parsing prose.

None of that is the hard part, though. Any framework can wire a function call between two agents. The hard part is the fourth parameter.

---

## The part almost nobody gets right: what the specialist is allowed to see

Go back to the analogy. Handing the tax specialist a case file by name — "the Acme acquisition" — is not enough on its own. If the specialist's own search tool can reach the firm's entire document store, they can technically find things about other clients while looking for something about Acme. The fact that they *shouldn't* is a matter of training and professional discipline, not something the building's architecture prevents.

An AI specialist agent has no professional discipline. If you give it a retrieval tool with access to the firm's entire corpus and ask it a question, it will search the entire corpus, because that is what the tool lets it do. The delegation call itself carries no memory of *why* the caller was allowed to ask in the first place.

This is what `scope` is for:

```python
class InvocationScope(FrozenModel):
    document_uids: list[str] | None = None
    library_ids: list[str] | None = None
    search_policy: Literal["strict", "hybrid", "semantic"] | None = None
```

When agent A calls agent B with a scope, B's retrieval world is narrowed to exactly what A listed — for that one call, and no further. The invariant that makes this trustworthy rather than merely convenient is that **scope can only narrow, never widen**: the callee still executes under the caller's own identity, and every document permission check runs exactly as it would if the caller had done the search itself. A cannot use B to see something A wasn't already allowed to see, and B cannot accidentally see more than A chose to hand over.

That is the equivalent of the confidentiality wall in the law firm — except here it is not professional habit, it is enforced by the runtime on every call.

---

## Why this is not the industry default

It is worth being precise about what is and isn't novel here, because it is easy to either overclaim or underclaim.

Asking a sub-agent a question with a typed schema back is not novel — most serious agent frameworks support some version of it. What most of them do not have is a first-class notion of **narrowing what the callee can see, enforced independently of what the callee's own tools would otherwise let it reach.** A number of popular multi-agent frameworks let one agent delegate to another over free text or a shared conversation, with no equivalent access boundary at the delegation layer at all — access control, if it exists, lives entirely in application code the team has to write itself, call by call.

The closest cousin to `InvocationScope` in spirit is a pattern retrieval systems already know well: rather than letting a retriever search everything and hope the ranking sorts it out, a caller narrows the search to a specific filter — a set of document IDs, a folder, a tag — before the search runs. What Fred adds is turning that filter into a portable, typed object that survives crossing an agent boundary, with a security invariant (narrows, never widens) attached to it rather than left as a convention each team has to remember to apply.

---

## What is still missing: the records clerk

There is a role in the law firm we have not accounted for yet, and it is the one that makes the whole system usable in practice, not just safe in theory.

The lawyer does not know the tax specialist's internal filing reference for "the Acme acquisition." They know the client's name. Somewhere between "the lawyer's request" and "the specialist's narrowed file," someone resolves "Acme acquisition" into the actual set of documents that phrase refers to — and does so under the lawyer's own clearance, not the specialist's, so the resolution itself cannot leak anything the lawyer wasn't already allowed to see. In a real firm, that is a records clerk, and their job is specific enough that no one confuses it with either the lawyer's job or the specialist's.

`InvocationScope` today only accepts already-resolved identifiers: exact document UIDs, exact library IDs. A caller that knows *what it wants scoped to* only by description — "the reference library for this technology," "the case documents for this matter" — has to resolve that description into concrete IDs itself, before it can call the specialist at all. Today, every team building on Fred writes that resolution step by hand, inside the calling agent. That works, but it means the records-clerk role gets reinvented slightly differently by every team that needs it — and reinvented under time pressure is exactly the condition under which someone eventually resolves a scope using the wrong identity's permissions instead of the caller's, without anyone noticing at review time.

This is not specific to documents. The same shape of problem shows up anywhere an orchestrator wants to delegate over a slice of something addressed by a business name rather than a technical key — a CRM agent scoped to "this quarter's key accounts," a database agent scoped to "the tables for this project." The specialist and the narrowing both already exist. What is missing is a named, reusable place for the translation step to live — one that runs under the caller's identity by construction, not by convention, and leaves an auditable trace of what it resolved and why.

That is not built yet. It is worth naming precisely because the two harder problems — can one agent call another, and can the caller stop the callee from seeing too much — are already solved. What is left is comparatively narrow, and knowing exactly what shape it needs to take is most of the way to building it well.

---

## The point of the analogy

None of this is really about law firms, or about documents specifically. It is about a fact that gets lost the moment "agent calling agent" is treated as a solved problem because the function call itself works: a specialist is only safe to consult if someone made sure, first, that the file on the table is the right file — and only that file. Fred's answer so far is that the platform enforces the second half unconditionally. The next piece of work is making the first half — turning a name into the right file — as reliable as the guarantee that follows it.

---

## References

- [Beyond Agent Framework Wars: Fred and the Infrastructure Layer](/blog/beyond-agent-framework-wars-fred-and-the-infrastructure-layer/)
- [Relationship-Based Access Control in Fred with OpenFGA](/blog/relationship-based-access-control-in-fred-with-openfga/)
