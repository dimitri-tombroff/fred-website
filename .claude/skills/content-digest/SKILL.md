---
name: content-digest
description: Pull what's landed (and what's in flight but unmerged) in the fred repo since the site's last content refresh, and classify each item as shipped / in-progress / internal-only — the raw material for update-features, update-roadmap, and write-news-post. Read-only.
user-invocable: true
argument-hint: "[since date, e.g. 2026-08-05 — defaults to the newest blog post's date] [extra branch names to check for unmerged work]"
---

# Content Digest Skill

This is the first step of a site content refresh. It does **not** edit any website
file. It produces one scratch artifact — a classified list of candidate content —
that `update-features`, `update-roadmap`, and `write-news-post` read.

The fred product repo lives at `~/Fred/fred` (a sibling of this repo, `~/Fred/fred-website-new`).
If your local layout differs, adjust the path below accordingly.

## Hard rules

- **Read-only against `~/Fred/fred`.** `git fetch` only. No commits, no branch switches, no `gh`
  mutations.
- **Never call something "shipped" unless it is merged to `swift` and not behind a feature flag
  that defaults off.** Anything else — open PR, unmerged feature branch, RFC still in draft, an
  `enable*` flag defaulting to false — is `in-progress`, no matter how complete the code looks.
  This distinction is the entire point of the skill: `update-roadmap` writes in-progress items as
  forward-looking direction, never as delivered fact, and a wrong classification here is a false
  public claim two skills downstream.
- **Public-surface filter.** This site describes what a user, evaluator, or platform operator can
  see or do. Skip pure `chore`, `refactor`, `test`, `docs`(internal), `deps` bumps, and CI/devops
  changes with no user-visible effect — they are noise here even though they mattered to the team.
  A `fix` only counts if it changed visible behavior (not an internal correctness patch).
- **No invented capabilities.** Every classification must trace to an actual commit, PR, or RFC
  you read — not to a commit subject you assumed the meaning of. When a subject is ambiguous, read
  the commit body or the PR before classifying it.

## Step 1 — find the window

```bash
cd ~/Fred/fred-website-new
NEWEST_POST_DATE=$(for f in content/blog/*/index.md; do grep -m1 '^date:' "$f"; done \
  | sed -E 's/date: *([0-9-]+).*/\1/' | sort -r | head -1)
echo "Newest blog post: $NEWEST_POST_DATE"
```

Use the date the developer passed as `$1`; if none was given, use `$NEWEST_POST_DATE` — the site
was last refreshed with content up to that date, so that is the correct window start.

## Step 2 — merged work (shipped candidates)

```bash
cd ~/Fred/fred-website-new/../fred
git fetch --all --prune --tags
SINCE="<window start from step 1>"
git log --first-parent origin/swift --since="$SINCE" --date=short \
        --pretty=format:'%h|%ad|%an|%s' | cat
```

For every `feat` (and any user-visible `fix`), read enough to describe the change in plain,
external language — no internal names, no issue numbers, no code identifiers unless a developer
would recognize them from the public docs. When a subject is terse or a squashed PR likely bundles
sub-changes, read the body:

```bash
git show -s --format='%s%n%n%b' <sha>
```

## Step 3 — unmerged work (in-progress candidates)

Two sources:

1. **Explicitly named branches** — any branch names passed as extra arguments, plus the current
   branch of the `fred` working tree if it looks like a feature branch (not `swift`/`main`).
2. **Open PRs against `swift`**, via `gh pr list --state open --base swift --json number,title,headRefName`.

For each: `git log origin/swift..<branch> --oneline` and `git diff origin/swift...<branch> --stat`
to see the shape, then check for a governing RFC:

```bash
grep -rl "<topic keyword>" docs/swift/rfc/
```

Read the RFC's `**Status:**` line — this is the single most important fact for classification.
"Draft, pending sign-off" or similar means in-progress even if every line of code is written and
tested. Cross-check against `docs/swift/design/RUNTIME-EXECUTION-CONTRACT.md` and
`CONTROL-PLANE-PRODUCT-CONTRACT.md` too: an entry marked "✅ done" there describes implementation
status, not public-launch status — a feature can be fully implemented and still gated off by
default, unmerged, or missing its GitHub issue. State the gap explicitly if you find one.

## Step 4 — classify and write the digest

Write `.claude/content-digest-<today>.md` (in this repo, gitignored scratch — do not commit it)
with this shape:

```markdown
# Content digest — <window start> → <today>

## Shipped (candidates for update-features)
- **<plain-language name>** — <one or two sentences, external voice, no jargon>. (fred#<issue>, merged <date>)

## In progress (candidates for update-roadmap only)
- **<plain-language name>** — <what it does, for whom>. Status: <RFC status / flag default / what's
  still open>. Do not describe as shipped. (fred#<issue>, branch `<name>`)

## Skipped as internal-only
- <one line each, or "~N chore/deps/refactor commits, no public-surface impact">

## Notes for the next skills
- <anything a human reviewing this digest should sanity-check before it becomes public copy>
```

Report the file path back to the developer and stop — do not proceed to editing site content in
this skill.
