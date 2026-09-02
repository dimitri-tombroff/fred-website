---
name: write-news-post
description: Draft a new dated post under content/blog/<slug>/index.md — Fred's news surface — in the site's existing essay voice, from a content-digest artifact or a developer-specified topic. Always drafts with draft:true; publishing is a separate, explicit developer decision.
user-invocable: true
argument-hint: "[path to a content-digest-*.md file, or a specific topic/theme to write about]"
---

# Write News Post Skill

`content/blog/` is Hugo, and it's the site's only remaining Hugo-authored surface besides release
notes — everything else has moved to raw HTML (see `static/docs/`). Fred's blog posts are not
changelog entries: each is a substantial essay built around one real engineering idea, usually
opened with a concrete analogy or scenario, honest about what's still missing, and closed with a
`## References` list linking related posts or docs pages. Read 2-3 recent posts under
`content/blog/` before writing if you have not already — the voice matters more here than on any
other page on the site.

## Hard rules

- **One coherent theme per post, not a digest dump.** If the input is a content-digest file with
  several shipped items, do not summarize all of them in one post. Either pick the single most
  substantial, interesting-to-an-external-reader item and go deep, or ask the developer which
  theme to lead with. A post that lists five features in one paragraph each reads like a changelog,
  which is exactly what this page is not.
- **`draft: true` always, unless the developer explicitly says to publish.** Flipping a post live
  is a publishing action with real visibility — this skill never does it unasked. State clearly in
  your summary that the post is a draft and needs a developer decision to publish.
- **Never write marketing adjectives the code doesn't earn.** Match the reference tone: precise
  claims, explicit "this is not novel" / "this is the interesting part" distinctions (see any
  existing post's "Why this is not the industry default"-style section), and an honest accounting
  of what's still missing or unresolved — that honesty is the site's credibility, not a weakness to
  edit out.
- **Never describe in-progress work as shipped.** If the digest marked the item in-progress, the
  post must say so plainly (e.g. "not yet merged," "behind a flag," "the design is still open on
  X") — do not round up to "now available."
- **Match the frontmatter schema exactly** (see Step 2) — a missing or malformed field breaks the
  Hugo build.
- **Never commit or push.**

## Step 1 — pick the topic

If given a content-digest file: read its "Shipped" (primarily) and "In progress" sections, pick
the theme with the most public interest and story (not necessarily the biggest diff), and confirm
the choice with the developer if more than one candidate looks equally strong. If given a topic
directly, use that.

## Step 2 — frontmatter

Copy this shape (see `content/blog/_index.md` for the canonical field list, and any recent post
for real values):

```yaml
---
title: "<title>"
slug: "<short-kebab-slug, distinct from the directory name convention below>"
description: "<1-2 sentences, what this covers and why it matters — used in link previews>"
summary: "<similar to description, may repeat it; shown in blog listing>"
date: <today, ISO with +02:00 offset, matching recent posts>
lastmod: <same as date>
draft: true
weight: 50
categories: [<pick from existing posts' categories, e.g. architecture, agents, platform>]
tags:
  - <specific tags, lowercase-hyphenated, matching the granularity of existing posts>
contributors:
  - <ask the developer for the author name if not already known>
pinned: false
homepage: false
seo:
  title: "<usually same as title>"
  description: "<usually same as description>"
  canonical: ""
  robots: "index, follow"
---
```

The directory name follows the site's `<topic-slug>-<MM-YY>` convention (month/year of the post's
*publication*, not the underlying work) — e.g. `content/blog/prompt-marketplace-09-26/index.md`.

## Step 3 — write the body

Structure: an opening hook (a scenario, an analogy, or a direct statement of the problem — look at
how existing posts open, they rarely start with "Fred now has..."), then `##` sections building the
argument, code snippets where they clarify a real mechanism (not decorative), a section that
honestly places the work against what's novel vs. not, and what's still open or missing. Close with
`## References` linking to 1-3 related existing posts or `static/docs/*.html` pages.

## Step 4 — present and stop

Report the file path, restate that `draft: true` is set, and summarize in 2-3 sentences what a
developer should check before deciding to publish (accuracy of any technical claim, whether the
underlying feature has since shipped/changed, tone).
