---
title: "Site header fragment (internal — not a real page)"
url: "/partials/site-header.html"
layout: "site-header-fragment"
build:
  render: always
  list: never
sitemap:
  disable: true
---

Generated at build time so the standalone `static/docs/*.html` pages can load
the exact same header the Hugo-templated pages use — see
`static/docs/assets/site-header.js`. Never linked to from real navigation.
