---
title: "Personality You Can Edit, Guarantees You Can't: Fred's Platform Prompt Layer"
slug: "platform-prompt-layer"
description: "Fred is adding a platform-wide instruction layer that sits ahead of every agent's own prompt — paired with a second, fixed layer of baseline behavior no admin can accidentally break. Along the way, a look at how much of every prompt call was duplicated text nobody needed to pay for."
summary: "A platform-wide instruction layer now sits ahead of every agent's own prompt in Fred, paired with a fixed layer of baseline behavior no admin can break. The same effort also found that a chunk of every model call was duplicated text — here's the design, and the token bill it quietly used to hide."
date: 2026-09-02T10:00:00+02:00
lastmod: 2026-09-02T10:00:00+02:00
draft: true
weight: 50
categories: [architecture, platform]
tags:
  - system-prompt
  - platform-admin
  - token-efficiency
  - prompt-engineering
  - architecture
contributors: []
pinned: false
homepage: false
seo:
  title: "Personality You Can Edit, Guarantees You Can't: Fred's Platform Prompt Layer"
  description: "How Fred splits platform-wide prompt guidance into an admin-editable layer and a fixed safety-rail layer, and the token-efficiency work that came out of the same effort."
  canonical: ""
  robots: "index, follow"
---

# Personality You Can Edit, Guarantees You Can't: Fred's Platform Prompt Layer

Say you run a Fred deployment for a legal team, and compliance asks for one thing: every agent,
whatever it does, should open sensitive answers with a standing disclaimer. Simple request. Except
today, doing it means finding every agent instance across every team and editing each one's prompt
by hand — and hoping nobody adds a ninth agent next month without remembering to do the same.

That gap is what Fred's platform prompt layer closes.

---

## The one thing that used to sit above every agent

Before this, exactly one piece of text sat above an agent's own instructions in every Fred
deployment: a fixed, non-editable contract for how to format Mermaid diagrams. Useful, but narrow.
There was no way for the person actually operating a deployment — as opposed to the person
authoring an individual agent — to add anything of their own above that line. Tone, organizational
context, a standing disclaimer: none of it had a home. A team could shape its own agents' prompts
freely, but an operator speaking to the *whole* deployment at once had no lever to pull at all.

## Two layers, split on purpose

The fix adds two blocks to the front of every composed system prompt, not one:

- **The platform prompt** — free text, editable by a platform admin through a new admin page,
  backed by its own table and a small pair of endpoints to read and write it.
- **Platform instructions** — a second block right next to it, fixed, and not editable by anyone.
  It carries the handful of tool-usage rules Fred depends on to behave reliably: never claim a tool
  call that didn't happen, never paste a raw tool error back as the final answer, and a few others
  in the same spirit.

The split is the actual design decision here, not the text field. Personality and organizational
voice are exactly the kind of thing an operator should be free to set and change. The rules that
keep an agent from lying about what it did are exactly the kind of thing that shouldn't be one
careless edit away from disappearing. Bundling both into a single editable field would have made
the second guarantee only as strong as everyone's editing discipline — which is to say, not
strong at all. Keeping them as two separate blocks means the safety rail survives no matter what an
admin types into the personality field, including an empty string.

That third state matters more than it sounds: the platform prompt is explicitly three-valued —
never set (falls back to a sensible pod default), set to real text, or deliberately cleared to
empty — and each behaves differently. An admin can choose "say nothing extra" on purpose, and that
choice is distinct from simply never having visited the settings page.

## The token bill that was hiding in plain sight

Building this meant tracing exactly what gets assembled into a system prompt on every single call,
and that turned up a second problem worth fixing at the same time: a lot of it was duplicated. Tool
descriptions were being repeated across overlapping specifications. A Mermaid-output contract that
could say what it needed to in a fraction of the space was saying it at full length, every time.
Response-format instructions were restated in places that already had them.

The cleanup that came out of tracing this: tool listings are now grouped by the MCP server they
come from, so a model sees "tools for tabular access" as one group instead of one long undifferentiated
list; each agent's own instructions moved to the end of the composed prompt, both because that
reads as more relevant to a model reasoning about *this specific turn* and because it plays nicer
with prompt caching; and redundant schema text was cut wherever an MCP tool description was already
saying the same thing a nearby instruction repeated. Concretely, on a pod exposing the affected
tool servers, roughly 19.5 thousand tokens disappeared from every model call — most of it text a
model was reading and discarding on every single turn, without ever having been asked to.

## What's actually new here

None of the individual pieces — an editable system prompt, deduplicating tool descriptions — is
exotic on its own. What's worth naming is treating "the operator's voice" and "the platform's
non-negotiable behavior" as two structurally separate things, rather than one prompt field an admin
edits and hopes not to break. It turns a safety property into something enforced by where a
sentence gets stored, instead of something that depends on someone remembering not to delete it.

## What's still open

This is real, tested code — not a proposal — but it hasn't landed on Fred's integration branch
yet. It still needs a rebase to catch up with everything else that's shipped in the meantime, and
the work doesn't have its own tracking issue open yet, which is usually the last thing to happen
before something like this merges. Treat this as "built and being finished," not "available today."

---

## References

- [Fred Roadmap — Platform-wide guidance, without breaking the platform](/docs/roadmap.html#platform-guidance)
- [Beyond Agent Framework Wars: Fred and the Infrastructure Layer](/blog/beyond-agent-framework-wars-fred-and-the-infrastructure-layer/)
