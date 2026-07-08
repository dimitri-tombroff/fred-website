---
title: "AI as an Engineering Partner — and How We Stay in Control"
description: "How we equipped a real, complex cloud-native project so AI assistants help us think, plan, and build — without ever taking the wheel."
summary: "Fred is a full cloud-native agentic platform: speed and batch layers, Temporal workflows, identity propagation, ReBAC authorization, observability. We use AI assistants everywhere — for code, but also for backlogs, RFCs, and PMO tracking. This post is an honest account of the guardrails we built into the repository so that the humans, not the assistants, stay in control of a robust, industrial, maintainable application."
date: 2026-07-08T00:00:00+02:00
lastmod: 2026-07-08T00:00:00+02:00
draft: true
weight: 50
categories: [engineering, ai]
tags: [ai, claude, codex, engineering-practices, governance, product-management, devops]
contributors: [Dimitri Tombroff, Simon Cariou, Yahya Zaim Mounajed]
pinned: false
homepage: false
seo:
  title: "AI as an Engineering Partner — Staying in Control of a Real, Complex Project"
  description: "An honest account of how the Fred team governs AI assistants on a full cloud-native agentic platform: RFC-first workflow, task registries, frozen contracts, and AI-reviewing-AI."
  canonical: ""
  robots: ""
---

<style>
  .ep-score,
  .ep-todo {
    --ep-rule: #e2e4e0;
    --ep-card: #ffffff;
    --ep-accent: #1f6f8b;
    --ep-draft: #a8650b;
    --ep-draft-soft: rgba(168, 101, 11, 0.08);
    border-radius: 6px;
    padding: 1.1rem 1.3rem 1.2rem;
    margin: 1.4rem 0 1.8rem;
  }
  [data-bs-theme=dark] .ep-score,
  [data-bs-theme=dark] .ep-todo {
    --ep-rule: #2a2f35;
    --ep-card: #1c2025;
    --ep-accent: #5ca8c4;
    --ep-draft: #d69344;
    --ep-draft-soft: rgba(214, 147, 68, 0.1);
  }
  .ep-score {
    border: 1px solid var(--ep-rule);
    background: var(--ep-card);
  }
  .ep-score .ep-head {
    display: block;
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    margin-bottom: 0.7rem;
  }
  .ep-score.ep-plus .ep-head { color: var(--ep-accent); }
  .ep-score.ep-minus .ep-head { color: var(--ep-draft); }
  .ep-score ul {
    margin: 0;
    padding-left: 1.3rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.97em;
  }
  .ep-score.ep-plus li::marker { color: var(--ep-accent); }
  .ep-score.ep-minus li::marker { color: var(--ep-draft); }
  .ep-todo {
    border: 1px dashed var(--ep-draft);
    background: var(--ep-draft-soft);
    font-size: 0.97em;
  }
  .ep-todo .ep-tag {
    display: block;
    font-weight: 700;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--ep-draft);
    margin-bottom: 0.35rem;
  }
</style>

> *Co-authored by Dimitri Tombroff and Simon Cariou (Fred / Swift team) and Yahya Zaim Mounajed — two teams that independently converged on the same conviction: AI assistants have outgrown the code editor, and that is precisely why they need governance.*

---

## A Real Project, Not a Demo

Most "AI-assisted development" stories are told on greenfield demos. Ours is not. Fred is a complete cloud-native platform: several FastAPI backends and a React frontend, a speed layer for interactive chat and a batch layer built on **Temporal** workflows, agentic execution in isolated pods, **end-to-end user identity propagation** with service-account patterns for asynchronous workers, **ReBAC authorization** with OpenFGA, observability and KPIs, Helm charts and ArgoCD deployments on Kubernetes.

At that scale, the question is no longer *"can the AI write this function?"* — it can. The question is: **who is in control of the architecture, the contracts, and the roadmap?** If the answer drifts toward "the assistant, implicitly", you will ship something fast that nobody can maintain.

This post describes how we equipped the repository itself so that the answer stays: **us**.

## The Failure Mode We Were Avoiding

An unconstrained assistant on a large codebase is not malicious — it is *eager*. Left alone, it will happily:

- reinvent a type that already exists three folders away,
- add a parallel endpoint family instead of extending the documented one,
- "fix" a design decision it never saw the rationale for,
- and produce a beautiful pile of code the team no longer fully understands.

The result is entropy: duplicated abstractions, contract drift between backend and frontend, documentation that describes a system that no longer exists. On an industrial application with security and compliance requirements, that is disqualifying.

So we inverted the setup. Instead of asking the assistant to code everything, we made the repository the boss — and the assistant its most disciplined employee.

## Equip the Repository, Not the Prompt

Everything the assistant must know and obey is versioned in the repository, next to the code it governs. Four mechanisms carry most of the weight.

### 1. An operational contract for assistants

Our `CLAUDE.md` (mirrored for other assistants) is not a "context file" — it is an operational contract. Its prime directive: **extend, do not duplicate**. Before writing anything, the assistant must run a reuse audit: does a task ID already exist? A backlog item? A contract field? An RFC covering this area?

It then enforces a task lifecycle that cannot be skipped or reordered: **RFC first → backlog entry → explicit developer confirmation → GitHub issue → implementation → verification → documentation convergence.** The assistant writes the RFC and the backlog entry, then *stops* until a human says go. One sentence of approval is enough — but it must exist.

### 2. A machine-readable project registry

Prose status reports rot. So the project's ground truth is structured data the assistant reads and is required to keep in sync:

- `id-legend.yaml` — the canonical registry of every tracked unit of work: **108 IDs today across 16 domains** (`RUNTIME`, `AUTHZ`, `MEMORY`, `EVAL`, `MIGR`, …), each with an owner, a status, a backlog reference and an RFC reference.
- Layered backlogs — a dozen files, append-only, one per major track.
- `STATUS.md` and a **PMO board** — the human-facing mirrors, updated *in the same change* whenever a tracked field moves.

Every commit subject carries a task ID. When an assistant (or a human) asks "what is `AUTHZ-05` and who owns it?", the answer comes from data, not from someone's memory.

### 3. Frozen contracts and generated clients

The execution surface and the product API surface are described in two **frozen contract documents** that change only through a dated amendment. The frontend never hand-writes a type that mirrors a backend model: all clients are **generated from the OpenAPI specs**, and touching a backend controller without regenerating the client is a rule violation. This one rule eliminated an entire class of silent drift that no amount of AI code review would reliably catch.

### 4. AI reviewing AI — with humans arbitrating

We wrote our own review skills, versioned in the repository: a **contract reviewer** (does this change keep backend, generated client, and UI consistent?), a **minimality reviewer** (is this adding a parallel code path instead of simplifying?), a **design-system reviewer**, an **async-progress reviewer**, plus pre-PR audits for dead code and test gaps. We also cross review: a branch produced with Claude gets reviewed by Codex, and vice versa. Different models fail differently — the disagreements are where the insight is.

## Does It Work? An Honest Scorecard

<div class="ep-score ep-plus">
  <span class="ep-head">What worked better than expected</span>
  <ul>
    <li><strong>The process caught an architecture-level mistake before merge.</strong> A signed execution-grant design was fully implemented, then challenged during security review and <em>entirely removed</em> — replaced by pod-side ReBAC checks with Keycloak resource servers. The PR was closed, not merged. Without the RFC-and-review discipline, that design would be in production today.</li>
    <li><strong>Cross-assistant review finds real bugs.</strong> One security-hardening branch went through a Codex review that raised seven findings — all seven were valid, and all seven were fixed before the PR.</li>
    <li><strong>AI-built self-tests found platform bugs humans had missed</strong>, including a global RAG misconfiguration (wrong vector index bound to an embedding model) and a regression where user context prompts silently never reached the model.</li>
    <li><strong>Documentation stays alive.</strong> Because updating the backlog, the status board, and the design docs is part of the assistant's definition of done — verified by a convergence check — our docs describe the system we actually have. That has never been true on any previous project we've worked on.</li>
    <li><strong>The upstream work is where the leverage is.</strong> Roadmap grooming, RFC drafting, backlog convergence, PMO reporting: the assistant handles the coordination overhead that usually eats senior engineers' time.</li>
  </ul>
</div>

<div class="ep-score ep-minus">
  <span class="ep-head">What is genuinely hard</span>
  <ul>
    <li><strong>The scaffolding is heavy and must be defended.</strong> Assistants drift. They forget rules under long contexts, produce redundant documents, and occasionally try to "helpfully" reopen decided questions. The reuse audit exists because we got burned.</li>
    <li><strong>Humans must still read everything.</strong> The bottleneck moved from writing to reviewing — deliberately. That is the point of the setup, but it is real work, and it does not compress.</li>
    <li><strong>It costs tokens and time.</strong> RFC-first means slower starts. We consider it the price of an application we will still understand in two years.</li>
    <li><strong>Process without conviction decays.</strong> The guardrails hold because the team believes in them, checks the convergence, and fixes divergence immediately. Tooling alone would not survive a sprint.</li>
  </ul>
</div>

## Two Teams, One Conclusion

<div class="ep-todo">
  <span class="ep-tag">To do — Yahya</span>
  Your project's perspective — leaner scope, different team size, same practice: the assistant holds context, drafts specs, flags contradictions, and the humans keep the decisions. What did you keep, what did you drop?
</div>

What strikes us is that our two teams, on very different projects, converged on the same shape: **the assistant proposes, the repository constrains, the human decides.** Not because a methodology told us to, but because every alternative we tried produced code we did not want to own.

## Takeaways

1. **Put the governance in the repository, not in the prompt.** Versioned, reviewable, shared by every assistant and every human.
2. **Make the assistant stop.** RFC-first with mandatory human confirmation is the single highest-value rule we have.
3. **Registries beat prose.** Task IDs, machine-readable status, one source of truth per fact.
4. **Generate, never mirror.** Contracts and generated clients kill silent drift.
5. **Use AI to check AI — and different AIs against each other** — but keep a human as the arbiter.
6. **Accept the cost.** Staying in control is slower per task and faster per project.

---

*Feedback welcome — open an issue on [the Fred repository](https://github.com/ThalesGroup/fred) or reach out directly.*
