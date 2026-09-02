---
name: update-features
description: Add newly shipped capabilities to static/docs/features.html, matching the page's existing structure, badges, and reference-doc voice. Consumes a content-digest artifact (or a manually supplied list of shipped items). Stops for review before any commit.
user-invocable: true
argument-hint: "[path to a content-digest-*.md file — defaults to the newest one]"
---

# Update Features Skill

`static/docs/features.html` is Fred's public feature reference: a raw static HTML page (no Hugo
templating), organized by product area, with a mix of prose overview cards, service tables, and
tag/format lists. This skill adds **already-shipped** capabilities to it. It never touches
`roadmap.html` — that is `update-roadmap`'s job, and the two must not disagree about what's live.

## Hard rules

- **Shipped only.** Every item you add must come from the digest's "Shipped" section, or be
  something you independently verified is merged to `swift` and not behind a default-off flag. If
  you're not sure, leave it out — `update-roadmap` can carry it as in-progress instead.
- **No new visual language.** Every addition must reuse an existing CSS class from the page
  (`overview-card`/`ov-title`/`ov-body`, `badge bc|br|bx`, `tag tag-*`, the section/table
  patterns) — do not invent new classes or inline styles. Read the section you're editing in full
  before writing into it, so the new entry reads as if the original author wrote it.
- **Check for near-duplicates first.** Grep the existing page for related terms before adding —
  many "new" features are extensions of something already documented (e.g. a new capability type
  next to an existing capability list). Extend the existing entry in place rather than creating a
  second, overlapping one.
- **Nav and content move together.** If a new item needs its own anchor, add both the `<li><a
  href="#id">` in the matching `nav-section` of the sidebar and the `id="..."` on the section/h3 it
  points to — a page with a dead nav link or an orphaned anchor is worse than not adding the nav
  entry.
- **Never commit or push.** Edit the working tree, then stop and hand the diff to the developer.

## Step 1 — load the candidates

Read the digest file (arg, or the newest `.claude/content-digest-*.md`). List its "Shipped" items.
If a developer message named specific items instead of pointing at a digest, use those.

## Step 2 — read before you write

Read `static/docs/features.html` in full — it's long, but partial reads produce inconsistent
edits. Note the sidebar's `nav-section` groups (Platform, Ingestion, Execution, Agents, Chat UI,
Governance, APIs & SDK, Operations) and which existing section each candidate belongs under. A
candidate that doesn't fit any current section is a signal to propose a new `nav-section` — ask the
developer rather than guessing at a new taxonomy.

## Step 3 — place each item

- A **major, user-facing capability** (the kind that would earn a card in "What Fred does") goes
  into the `overview-grid` at the top *only if it's foundational* — most new items are not; they
  belong inside their topical section instead.
  - New agent capability packages (e.g. a new built-in capability) → the relevant `Agents` or
    `Governance` subsection, matching how existing capabilities are listed there.
  - New ingestion format or processor → the `formats` section's tag lists, or a new `<h3>` if it's
    a new category.
  - New API/SDK surface → `APIs & SDK` section, matching the existing service-table pattern.
- Write the description in the page's existing register: terse, factual, no adjectives that aren't
  earned ("read-only SQL over the platform database", not "powerful new SQL capability").

## Step 4 — present and stop

Show the diff. Call out anything you were unsure how to classify or place. Wait for developer
confirmation before this goes further (a commit, if the developer asks for one, is a separate,
explicit step — this skill does not do it).
