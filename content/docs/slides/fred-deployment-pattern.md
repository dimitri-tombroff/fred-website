---
title: "Deploying Fred: A Kubernetes-Native Agentic Platform"
description: "How Fred is deployed and extended: a complete agentic application packaged as one Helm chart on standard infrastructure, the three ways to extend it (agent pods, Knowledge Bases, applications) and when to choose each, and the whole platform running on a local k3d cluster from published releases."
toc: false
draft: false
weight: 815
---

Fred is a complete agentic application, packaged like any cloud-native product: one Helm chart and published images on top of standard infrastructure (PostgreSQL, OpenSearch, Keycloak, OpenFGA, Temporal, object storage), configured with the operator's values and Secrets. The deck covers it in three parts: what Fred provides on Kubernetes; how to extend it without forking it, with agent pods, Knowledge Bases or applications, and when to choose each; and, in action, the infrastructure, Fred and the evaluation application deployed on a local k3d cluster with fred-deployment-factory, from their published releases.

<div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:8px; box-shadow:0 2px 12px rgba(0,0,0,.15); margin: 1.5rem 0;">
  <iframe
    src="/slides/fred_deployment_pattern.html"
    style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"
    allowfullscreen
    loading="lazy"
    title="Deploying Fred: A Kubernetes-Native Agentic Platform">
  </iframe>
</div>

[Open in full screen](/slides/fred_deployment_pattern.html)
