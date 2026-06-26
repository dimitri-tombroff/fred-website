---
title: "Deploying Fred: A GitOps Deployment Pattern"
description: "The reference deployment design for Fred — a two-layer split (frozen stateful infrastructure vs. a GitOps-managed application layer) plus an out-of-band secrets layer. How the four apps are operated reproducibly, and the path from playground to a corporate, sovereign-grade standard."
toc: false
draft: false
weight: 813
---

A platform-engineering walkthrough of how Fred is deployed and operated: the clean split between a frozen, stateful infrastructure layer and a GitOps-managed (ArgoCD) application layer, the boundary contract between them, and the honest roadmap from the current playground to a corporate-grade standard.

<div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:8px; box-shadow:0 2px 12px rgba(0,0,0,.15); margin: 1.5rem 0;">
  <iframe
    src="/slides/fred_deployment_pattern.html"
    style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"
    allowfullscreen
    loading="lazy"
    title="Deploying Fred: A GitOps Deployment Pattern">
  </iframe>
</div>

[Open in full screen](/slides/fred_deployment_pattern.html)
