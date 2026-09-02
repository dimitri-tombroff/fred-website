# Deployment notes (fred-website)

Written 2026-08-03 after a live migration from a broken corporate pipeline to
Netlify. This file exists so nothing here has to be re-discovered from
scratch. No passwords/secrets are in here — only what's needed to understand
and operate the setup.

## TL;DR — current state

- **Live site**: https://site.fredlab.dev (Netlify, on your own GCP-adjacent
  domain, free tier).
- **Old domain** `https://fredk8.dev` is **dead** — its GitLab CI → GCS
  deploy pipeline is broken (see "The old pipeline" below) and nobody here
  has the access to fix it. The site content there is frozen since
  2026-07-23.
- **To ship a change**: push to the `swift` branch of the `personal` remote
  (see "Remotes" below). Netlify auto-builds on push — production branch is
  already set to `swift`.

## Remotes — which one actually matters

```
git remote -v
```

| Remote     | URL                                                    | Role |
| ---------- | ------------------------------------------------------- | ---- |
| `personal` | `https://github.com/dimitri-tombroff/fred-website.git`  | **The one Netlify watches.** Push here to deploy. Default branch is now `swift`. |
| `github`   | `https://github.com/fred-agent/fred-website.git`         | Org mirror, kept in sync for visibility. Not watched by anything. |
| `origin`   | `https://gitlab.thalesdigital.io/...fred-website.git`     | Original corporate repo. Still has the broken GitLab CI pipeline (see below). Push here to keep it in sync / for MR history, but it doesn't deploy anywhere usable right now. |

**Habit going forward:** push every real branch to all three (`personal`,
`github`, `origin`) so nothing drifts, e.g.:

```bash
git push personal swift
git push github swift
git push origin swift
```

## Netlify

- Project name: `magnificent-semifreddo-a39319` (Netlify's random name — you
  can rename it in Project configuration if you want a nicer slug, that's
  cosmetic only and won't break anything already set up).
- Default Netlify subdomain (always works, no DNS needed):
  `https://magnificent-semifreddo-a39319.netlify.app`
- Custom domain: `site.fredlab.dev` (see DNS section).
- Build command comes from `netlify.toml` (`npm run build` → `hugo --minify --gc`).
- **`HUGO_VERSION` is pinned in `netlify.toml` to `0.142.0`.** It was
  previously `0.125.1` and silently built only 218 pages instead of 389 with
  *no error shown* — if the page count in a Netlify build log ever looks low
  again, check this first.
- Netlify's project visibility must be **"Public"** (not the default
  "Private") or every URL 401s behind Netlify's own login gate — this is
  under Project overview → "Make public".

### Netlify production branch (resolved 2026-09-02)

Production branch is set to `swift` — confirmed via the Deploys tab, which shows
a continuous run of `Production: swift@<hash>` builds tracking real commits,
each auto-deployed within ~20s of push. A push to `personal`'s `swift` branch
triggers an automatic build with no manual step needed.

### Netlify domain UI gotcha (so you don't repeat the loop)

Typing `www.<domain>` in "Add a domain" makes Netlify auto-claim the bare
apex domain as "primary" and treat `www` as a redirecting alias — which then
tries to provision a cert for the apex too and gets stuck if the apex isn't
pointed at Netlify (ours isn't, on purpose — the apex `fredlab.dev` has
existing MX records for email and other subdomains, untouched). Any
subdomain that does **not** start with `www` (we used `site`) avoids this —
it only asks for a one-time TXT ownership-verification record at the domain
root, then a normal CNAME for the subdomain itself. Apex A/MX records are
never touched.

## DNS (fredlab.dev)

Managed via **Squarespace** (Domains → fredlab.dev → DNS → DNS Settings →
Custom records), not Google Cloud DNS — even though the nameservers are
`ns-cloud-*.googledomains.com` (a Squarespace/former-Google-Domains
artifact, not an actual Cloud DNS zone you can reach via `gcloud dns`).

Current custom record added for this site:

```
Type: CNAME
Name: site
Data: magnificent-semifreddo-a39319.netlify.app
```

This coexists fine with everything else already in that zone (MX for email,
the `*.playground.fredlab.dev` A records for the GKE cluster) — it's purely
additive.

## Hugo config

- `baseURL` is now `https://site.fredlab.dev/`, set in **three** places that
  all need to agree:
  - `config/_default/hugo.toml` (was `http://localhost/`)
  - `config/production/hugo.toml` (was `/` — this is the one that actually
    silently won every real build, since `hugo --minify --gc` with no
    `--environment` flag defaults to the `production` environment)
  - `config/next/hugo.toml` (was also `/`)
- Before this fix, canonical URLs and `sitemap.xml` were **relative-only**
  (e.g. `/blog/foo/` instead of `https://site.fredlab.dev/blog/foo/`) because
  of the production override above — not because of anything Netlify did.
- 21 blog posts had a hand-typed `seo.canonical: "https://fredk8.dev/..."` in
  front matter. These are now blanked (`canonical: ""`), which makes the SEO
  partial (`@thulite/seo`) fall back to Hugo's own `.Permalink` automatically
  — don't hand-type a canonical URL in new posts unless it genuinely needs to
  differ from the page's real URL.

## Two docs systems (not fixed, just documented)

The site mixes two unrelated ways of producing "docs" pages:

1. **Proper Hugo content** — `content/docs/**/*.md`, gets the real theme
   chrome (nav, dark/light toggle, site search, sidebar with the curated
   "Key Topics" menu from `config/_default/menus/menus.en.toml`
   `[[docs_highlights]]`).
2. **Standalone static HTML** — `static/docs/*.html`, self-styled with
   embedded `<style>` blocks, its own hand-rolled mini nav, no site chrome,
   no search indexing. The top nav's "Docs" link goes straight to one of
   these (`getting-started.html`), bypassing the Hugo-rendered docs section
   entirely.

This is a known inconsistency (broken links and a CSP bug this session both
came from this split), not something fixed today — see the conversation
history / ask before touching it, the working idea on the table was: keep
Hugo/Thulite for the blog only (it earns its keep: pagination, tags,
contributor pages, RSS), and standardize the static pages on one shared
boilerplate instead of each reinventing its own design tokens.

**CSP note**: `netlify.toml`'s `Content-Security-Policy` header has
`style-src 'self' 'unsafe-inline'` specifically because the static docs
pages need inline `<style>` to render at all. If those pages ever move to
external stylesheets, this could be tightened back to `style-src 'self'`.

## The old pipeline (fredk8.dev via GitLab CI → GCS) — broken, not fixed

`.gitlab-ci.yml` still builds and tries to `gcloud storage rsync` to
`gs://fred-website` (a bucket in the corporate GCP project
`prj-dil-sfrd-punch-sbx-4811`), fronted by the `fredk8.dev` domain. It fails
at the `gcloud auth activate-service-account` step:

```
ERROR: invalid_grant: Invalid grant: account not found
(bot-ci-cd-hub@prj-dil-sfrd-punch-sbx-4811.iam.gserviceaccount.com)
```

This means the service account behind the `GCP_SA_KEY` GitLab CI/CD variable
was deleted or disabled on the GCP side. Fixing it needs someone with:

1. GitLab project admin access (Settings → CI/CD → Variables) to update
   `GCP_SA_KEY`, and
2. GCP IAM access on `prj-dil-sfrd-punch-sbx-4811` to regenerate/recreate
   that service account's key.

Neither of us had that access today, which is why we moved to Netlify
instead of fixing this. If someone fixes it later, `fredk8.dev` would come
back to life independently of the Netlify setup — they're unrelated targets
building from the same repo.
