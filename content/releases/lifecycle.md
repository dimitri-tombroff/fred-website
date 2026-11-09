---
title: "Release Lifecycle"
description: "How Fred versions work — branch model, release cadence, and support windows."
summary: "One production version at a time. Two branches. Hotfixes from main. This page makes the model explicit for contributors, operators, and the core team."
date: 2026-05-02T00:00:00+02:00
lastmod: 2026-11-09T00:00:00+01:00
draft: false
weight: 30
toc: true
seo:
  title: "Release Lifecycle — Fred"
  description: "Fred's release model: one production version, two branches, support windows, and the hotfix workflow."
---

## The core rule

**Fred releases one production version at a time.**

There is no long-running parallel maintenance of multiple major versions. Swift 3.x is the current production release. Kea 1.5 is obsolete; Weaver 5.x is available to developers but remains incomplete.

## Branch model

```
main     ← always the live, deployed production state
develop  ← where the next version is being built
```

That is the complete branch topology for the Fred website, and for the Fred platform itself.

### Hotfixes

When a bug is found in production:

1. Branch from `main` — `hotfix/short-description`
2. Fix and merge back to `main`
3. Cherry-pick the same fix to `develop` immediately

Step 3 is mandatory. A fix that does not land on `develop` will reappear in the next release.

### When a new major version ships

1. `develop` is merged to `main` — the new version is live
2. A `v{major}.{minor}-{codename}` tag is cut from the pre-merge state of `main` as a frozen snapshot
3. The previous release enters the support window (hotfixes only, no new features)

## Release naming

Fred releases carry bird codenames:

| Codename | Version | Status |
|---|---|---|
| **[Kea](/releases/kea/)** | 1.5.x | Obsolete |
| **[Swift](/releases/swift/)** | 3.x | Production — stable |
| **[Weaver](/releases/weaver/)** | 5.x | Developer preview — incomplete |

The name is chosen to reflect a character of the release, not just a label.

## Support windows

| Event | Support status |
|---|---|
| New major GA | Previous release enters support window |
| Support window | Hotfixes and security patches only |
| End of window | No further patches; operators should have migrated |

See the [release overview](/releases/) for the current status of each generation.

## For contributors

Target `develop` for all new work. Do not open pull requests against `main` except for hotfixes.

If you are unsure whether something is a hotfix or a feature, open it against `develop`. The maintainers will backport it to `main` if urgency requires.
