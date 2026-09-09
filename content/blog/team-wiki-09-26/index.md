---
title: "A Notebook the Whole Team Trusts, Agents Included: Fred's Team Wiki"
slug: "team-wiki"
description: "Every team accumulates knowledge no document really holds — conventions, glossary, the reasons behind a decision. Fred's team wiki, shipping in beta, gives agents full read access to that knowledge and a way to help keep it current, without ever letting them silently rewrite what the team treats as ground truth."
summary: "Fred's new team wiki — shipping in beta, for early feedback — lets every agent read a team's shared knowledge in full, and propose changes to it, but never write to it directly. A human always reviews and approves before anything an agent drafted becomes the team's ground truth."
date: 2026-09-09T10:00:00+02:00
lastmod: 2026-09-09T10:00:00+02:00
draft: true
weight: 50
categories: [platform, agents]
tags:
  - team-wiki
  - knowledge-base
  - human-in-the-loop
  - agent-capabilities
  - governance
  - beta
contributors:
  - Maxime Daragon
  - Fred team
pinned: false
homepage: false
seo:
  title: "A Notebook the Whole Team Trusts, Agents Included: Fred's Team Wiki"
  description: "How Fred's team wiki gives agents full read access to a team's shared knowledge and a proposal-only path to help maintain it, with every change reviewed by a human before it becomes ground truth."
  canonical: ""
  robots: "index, follow"
---

# A Notebook the Whole Team Trusts, Agents Included: Fred's Team Wiki

{{% callout context="warning" title="Beta" %}}
Shipping now, deliberately as a beta: we want real usage before committing to a
broader rollout. Expect it enabled for a subset of teams or deployments rather
than everywhere at once, and some of what's described below to still move.
{{% /callout %}}

Every team has a new-hire problem it never quite solves. Somewhere between the onboarding
slides and the actual work, a new colleague learns that "the Q3 numbers" always means fiscal
Q3, that a certain client is never to be called by its old name in writing, that the deploy
checklist has a step nobody wrote down because everyone who does it just knows. Some of that
eventually gets written into a wiki page. A lot of it doesn't, and the page that does exist is
trusted precisely because a person the team knows wrote it, or at least reviewed it.

Now put an agent in that team. It can be extremely good at the task in front of it and still
get the client's name wrong, because nothing told it not to use the old one. The obvious fix —
give the agent the wiki as a tool — runs straight into the property that made the wiki
trustworthy in the first place: a human wrote it, or reviewed it. Wire an agent up to write to
that page directly, and the first thing that happens is the team stops being sure the page still
means what it used to. The second thing that happens, if the mistake is subtle enough, is
nobody notices until it's cited back to a client.

Fred's team wiki is built around that tension: an agent gets full read access to everything
the team knows, and a real way to help keep it current — but never a way to change it without
a human saying yes first.

---

## What the wiki actually is

Structurally, it's ordinary: a tree of pages per team, each with a title, a slug that survives
a rename, and a full version history. One page is special — a "rules" page every agent with
wiki access reads before it answers anything, the closest thing a team has to writing its own
operating instructions for its agents. Everything else is just knowledge: onboarding notes, a
glossary, the reasoning behind a decision that would otherwise get re-litigated every quarter.

The interesting part isn't the tree. It's who is allowed to change it, and how.

## Two ways in, one gate between them

A human with editor rights writes and edits pages directly, the way anyone would expect a
wiki to work — save, and it's live, with a diff-based conflict check if two people happened to
edit the same page at once.

An agent's path is deliberately narrower. It can read every page, in full — `wiki_read_page`
walks a page to its end, not a truncated preview, because a partial read is worse than no read
when the answer is going to be treated as fact. It can list the whole tree. What it cannot do
is call anything that changes a page. The closest it gets is `wiki_propose_page` (a new page)
or `wiki_propose_page_text` (new text for one that exists) — both of which do exactly one
thing: store a suggestion. Nothing about the wiki changes yet.

Turning that suggestion into the team's actual knowledge takes a separate, human step. The
agent can ask for approval — `wiki_publish_proposal` submits the proposal and shows the human
what would change — but the human decides. Approve, and the new text is published, still
flagged for review until someone explicitly clears that flag. Decline, or simply never get
back to it, and the proposal expires on its own after a configurable window, so it can't be
resurrected and published later by an unrelated retry that happens to reuse its id.

## Why the boundary is a wall, not a policy

It would be easy to build a softer version of this: let the agent write, log every change, and
trust review to catch problems after the fact. Fred doesn't, on purpose. A wiki page an agent
can write to directly is a wiki page whose trustworthiness now depends on someone actually
reading the audit log — which is exactly the kind of discipline that erodes under deadline
pressure, quietly, until the page is wrong and nobody noticed when.

Making the boundary structural instead — an agent's write tools *can only* create a proposal,
never a page — means the guarantee doesn't depend on anyone remembering to check anything. It
holds even on the day nobody has time to review the audit log, because there's no code path
where an unapproved proposal was ever live in the first place.

This is the same instinct behind other access boundaries in Fred — an agent delegating to a
specialist can only narrow what the specialist sees, never widen it (see the reference below);
here, an agent can widen the team's *proposed* knowledge freely, but never its *actual*
knowledge, without a human in that specific loop.

## What's still missing

There's no dedicated inbox for pending proposals yet — an editor finds out about one because
the agent's answer says so, or by opening the page and seeing its review flag, not from a
queue of "things waiting on you." That's a real gap for a team getting a lot of agent-authored
suggestions at once, and it's an intentional deferral, not an oversight: building a review
queue before knowing how teams actually triage proposals in practice risks solving the wrong
version of that problem.

The wiki is also ReAct-only for now. The rules page reaches the model through a prompt
fragment that the ReAct loop supports and Fred's Graph-agent composer doesn't yet — a team
running a Graph agent doesn't get this capability today.

And there's no synchronous signal when a human declines a proposal. Fred's HITL mechanism
resumes execution on approval; on decline, the graph simply replans without ever running the
publish step, so nothing writes down "declined" in the moment. The proposal isn't lost — it
still expires on its own retention timer — but an agent that wants to know *why* something was
turned down doesn't get an answer today.

---

## References

- [Fred Feature Reference — Team wiki](/docs/features.html#wiki)
- [Calling In a Specialist: Scoped Delegation Between Agents in Fred](/blog/calling-in-a-specialist/)
