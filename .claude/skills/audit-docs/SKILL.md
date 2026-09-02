---
name: audit-docs
description: Check the static/docs/*.html reference pages for factual drift against the actual fred repo — stale claims, removed permissions/fields, renamed components, contradictions between pages. Review-only by default; fixes are a deliberate, separate follow-up.
user-invocable: true
argument-hint: "[specific page(s) to audit — defaults to every static/docs/*.html page not already covered by a recent content-digest run]"
---

# Audit Docs Skill

`static/docs/*.html` pages describe how Fred actually works, source-verified at the time they were
written. Nothing keeps them in sync with the product repo afterward — this skill is that check. It
found 8 real, independently-confirmed issues the first time it ran (a phantom component in a
diagram, a page that contradicted itself, a routing model that had been fully replaced, a deleted
permission still listed, a dead RFC citation, missing metric labels) across 9 pages last touched
three weeks earlier. It's worth running periodically, not just when something is already suspected.

## Hard rules

- **Review-only.** This skill reports findings; it does not edit files. Fixing what it finds is a
  separate, explicit follow-up (see "Applying fixes" below) — never fold the two together
  unasked, and never commit as part of either.
- **Every finding must trace to code you read**, not to a commit subject or a guess. Use
  `git log`/`git show`/`git diff` against `origin/swift` in `~/Fred/fred` read-only — never check
  out a branch there, the working tree may hold someone else's in-progress work.
- **Don't invent findings.** If a page checks out, say so. If a claim can't be verified either way
  (infrastructure/config outside this repo, a separate repo like fred-samples), say that explicitly
  rather than flagging it as stale.
- **A contradiction between two pages on this site is as much a finding as a contradiction with
  code.** `durable-execution.html` once claimed agent execution was Temporal-backed while
  `architecture.html`, on the same site, correctly scoped Temporal to ingestion/evaluation only —
  catch that class of drift too, not just page-vs-code.

## Step 1 — scope

Default to every page under `static/docs/*.html`. If a `content-digest` run from this or a recent
session named a window of fred-repo changes, prioritize pages whose subject matter overlaps that
window — but don't skip the rest solely because nothing in the digest mentioned them; several of
the 8 issues found on the first run predated the most recent digest window entirely (stale since
the page was written, not since the last refresh).

Quick triage before deep reading: `git log -1 --format='%ad' --date=short -- <page>` per page to
see how long it's been since content last changed, and a grep for known-risk terms if a recent
digest flagged a specific area (e.g. role/permission renames, a routing or config refactor).

## Step 2 — split and verify

For more than 2-3 pages, split the set across parallel agents by topic cluster (e.g. "access,
bootstrap, observability" / "architecture, execution, deployment" / "routing, agent authoring,
erasure") rather than one page per agent — related pages cross-reference each other's claims and a
topic cluster catches contradictions a single-page read would miss. Each agent reads its pages in
full, then independently verifies every concrete technical claim — names, endpoints, config keys,
defaults, diagrams — against current `~/Fred/fred` source, not against what the page already says.

## Step 3 — report

One finding per issue: `page → claim as written → what's actually true now → source evidence
(file/commit)`. Group by page. Rank by severity — a claim that actively misleads (contradicts
itself, describes a replaced system, references something deleted) ranks above an omission (a new
concept the page doesn't mention yet). Note pages that came back clean; a page with nothing wrong
is a real, useful result, not a non-finding.

## Applying fixes (only when asked)

When the developer asks to fix findings — all of them, or a named severity/subset — edit with the
same rigor: verify against source, keep the fix at the page's existing voice and detail level
(these are reference pages, not marketing copy — precise and complete, but skip anything a reader
can already get from the fred repo or its code, like exact class names or line numbers that don't
serve the reader's understanding). Match each page's existing structure and CSS classes; don't
invent new visual language. Never commit — stop and hand the diff back for review, same as
`update-features`/`update-roadmap`.
