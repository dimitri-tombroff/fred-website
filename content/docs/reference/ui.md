---
title: "User Interface"
description: "architecture and design of the fred UI"
summary: ""
date: 2023-09-07T16:13:18+02:00
lastmod: 2023-09-07T16:13:18+02:00
draft: false
weight: 910
toc: true
seo:
  title: "" # custom title (optional)
  description: "" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  robots: "" # custom robot tags (optional)
---

Fred UI is a React application that uses Material, Redux and Typescript. It is designed
to be easily customized and extended. It was updated with Vite.js and React Flow.

It comes with a lightweight (golang) backend ithat acts as a proxy server that, in turn, serves the UI and forwards
the requests to the Fred python API servers. It also provides facilities to interact directly with a Kubernetes cluster.

Fred UI provides you with:

- [x] Keycloak integration
- [x] Cookie and Jwt token management
- [x] Kubernetes integration
- [x] Material, Redux, Typescript
- [x] Docker file and helm chart for deployment
- [x] Makefile for easy build and run
- [x] Kooker integration
- [x] Vite.js

Checkout the development documention.

