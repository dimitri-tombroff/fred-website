---
title: "Deployment Guide"
description: "How to deploy fred"
summary: ""
date: 2023-09-07T16:04:48+02:00
lastmod: 2023-09-07T16:04:48+02:00
draft: false
weight: 810
toc: true
seo:
  title: "" # custom title (optional)
  description: "" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  robots: "" # custom robot tags (optional)
---

## Kubernetes

Helm charts are provided for you to easily deploy fred to Kubernetes.
Deploying Fred to Kubernetes makes sense if some of its expert requires third-party components like vector databases, S3 storage etc..
