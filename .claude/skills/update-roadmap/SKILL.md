---
name: update-roadmap
description: Fold in-progress work into static/docs/roadmap.html as forward-looking direction — never as a delivery promise — and retire entries that have since shipped (pointing at update-features instead of duplicating). Consumes a content-digest artifact. Stops for review before any commit.
user-invocable: true
argument-hint: "[path to a content-digest-*.md file — defaults to the newest one]"
---

# Update Roadmap Skill

`static/docs/roadmap.html` was deliberately rewritten to be **"a direction statement, not a
delivery calendar"** (see its own `callout.info` box under "Our vision for the next three
months"). This skill's entire job is to keep adding to that page without breaking that promise.

## Hard rules

- **Never state a date, a quarter, or "will ship."** Every sentence describes a *priority* and
  *why it matters*, not *when*. If the digest item includes a target date from an issue or RFC,
  drop the date and keep the reasoning.
- **Never claim something is done.** An in-progress item stays in-progress language even if the
  code is fully written — "we're extending X to Y" not "X now supports Y." If the digest flagged a
  caveat (RFC draft/pending sign-off, feature flag off by default, a known open gap), that caveat
  must survive into the roadmap prose, briefly — it's what keeps the page honest, not hedge-y
  filler to cut.
- **Prose, not a feature list.** This page reads as a small number of substantial paragraphs under
  named themes (`journey`, `extensible`, `distributed`, …), each explaining the *problem* and the
  *direction*, in the voice of the existing sections — not a bullet list of shipped-sounding
  capabilities. If you're producing a bullet list, you're writing for `update-features` instead.
- **Retire, don't duplicate.** If an existing roadmap entry has, per the digest, now shipped: remove
  or rewrite that entry (it no longer belongs on a forward-looking page) and note in your summary
  to the developer that it's now a candidate for `update-features` — do not describe it as both
  "coming" here and "available" there.
- **Nav and content move together**, same as `update-features`: a new `h3` needs a sidebar anchor
  in the matching `nav-section`, and vice versa.
- **Never commit or push.**

## Step 1 — load the candidates

Read the digest file (arg, or newest `.claude/content-digest-*.md`)'s "In progress" section, plus
any "Shipped" items that match something currently *on* the roadmap (retirement candidates).

## Step 2 — read the whole page first

Read `static/docs/roadmap.html` in full. Note the existing sections: `today` (what Fred already
does — an `overview-grid`, only touched when a *foundational* capability newly ships, which is
rare), the "Next three months" theme sections (`journey`, `extensible`, `distributed` today — this
list will change over time), `direction` (architectural primitives), `success`, and `related`.

## Step 3 — place each item

For each in-progress candidate, decide:

- **Does it extend an existing theme?** (e.g. new work on cross-runtime agent delegation extends
  `distributed`.) Add a paragraph or a sentence to that `<h3>` section, matching its argument
  structure — problem, why it's being tackled this way, what it unlocks.
- **Is it a genuinely new theme?** Add a new `<h3 id="...">` under "Next three months" (or under
  `direction` if it's architectural rather than time-boxed), plus its sidebar anchor. Don't force a
  new item into an ill-fitting existing theme just to avoid adding a section.
- Use a `callout.warn` or `callout.info` block (the page's existing pattern) only when a caveat
  needs visual emphasis — e.g. a capability that exists in code but is off by default and not yet
  safe to enable. Don't overuse callouts; the page uses them sparingly on purpose.

## Step 4 — present and stop

Show the diff, including any retirements and why. Flag any item you weren't sure was truly
in-progress vs. already shippable — better to ask than to under- or over-state status on a public
page. Wait for developer confirmation.
