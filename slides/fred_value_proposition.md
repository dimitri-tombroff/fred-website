---
marp: true
theme: default
header: '<span class="brand">Fred</span> | The Open Agentic Platform'
footer: '© 2026 · Fred — open-source agentic platform'
paginate: true
style: |
  /* ── General Slide Layout ─────────────────────────────────────────── */
  section {
    font-size: 26px;
    padding-top: 100px;
    padding-left: 70px;
    padding-right: 70px;
    background-color: #fff;
    color: #333;
  }

  /* ── Professional Header/Banner ───────────────────────────────────── */
  header {
    width: 90%;
    left: 5%;
    font-size: 18px;
    color: #888;
    border-bottom: 1px solid #007acc;
    text-align: left;
  }
  header .brand {
    color: #007acc;
    font-weight: bold;
  }

  /* ── Footer / Page Numbers ────────────────────────────────────────── */
  footer {
    font-size: 14px;
    color: #aaa;
  }

  /* ── Typography Hierarchy ─────────────────────────────────────────── */
  h1 {
    color: #007acc;
    font-size: 1.6em;
    margin-left: 0px;
    border-left: 8px solid #007acc;
    padding-left: 20px;
  }
  h2 {
    margin-left: 40px;
    font-size: 1.2em;
    color: #444;
  }
  h3 {
    margin-left: 80px;
    font-size: 1.0em;
    color: #666;
    font-style: italic;
  }

  /* ── List Styling ─────────────────────────────────────────────────── */
  ul, ol {
    margin-left: 60px;
  }
  li {
    font-size: 22px;
    margin-bottom: 10px;
  }
  li strong {
    color: #007acc;
  }

  /* ── Image Centering ──────────────────────────────────────────────── */
  img[alt~="center"] {
    display: block;
    margin: 30px auto;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }

  /* ── Formatting Helpers ───────────────────────────────────────────── */
  small { font-size: 0.7em; color: #777; vertical-align: middle; }
  .highlight { background: #e6f7ff; padding: 2px 5px; border-radius: 4px; color: #007acc; font-weight: bold; }

  /* ── Tables ───────────────────────────────────────────────────────── */
  table {
    font-size: 18px;
    margin: 16px auto;
    border-collapse: collapse;
    width: 95%;
  }
  th {
    background-color: #007acc;
    color: white;
    padding: 8px 14px;
    text-align: left;
  }
  td {
    padding: 6px 14px;
    border: 1px solid #ddd;
  }
  tr:nth-child(even) { background-color: #f5f9ff; }

  /* ── Blockquotes ──────────────────────────────────────────────────── */
  blockquote {
    border-left: 4px solid #007acc;
    background: #f0f7ff;
    padding: 10px 20px;
    margin: 16px 0;
    border-radius: 0 6px 6px 0;
    font-style: italic;
    color: #444;
  }
  blockquote p { margin: 0; }

  /* ── Section Divider Slides ───────────────────────────────────────── */
  section.section-divider {
    background-color: #007acc;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-top: 60px;
  }
  section.section-divider h1 {
    color: white;
    border-left: 8px solid rgba(255,255,255,0.6);
    font-size: 2em;
  }
  section.section-divider h2 {
    color: #cce8ff;
    font-size: 1.3em;
    margin-left: 50px;
  }
  section.section-divider header {
    color: rgba(255,255,255,0.6);
    border-bottom-color: rgba(255,255,255,0.3);
  }
  section.section-divider header .brand { color: white; }
  section.section-divider footer { color: rgba(255,255,255,0.5); }

  /* ── Title Slide ──────────────────────────────────────────────────── */
  section.title {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    padding-top: 40px;
  }
  section.title h1 {
    border-left: none;
    border-bottom: 4px solid #007acc;
    padding-left: 0;
    padding-bottom: 16px;
    text-align: center;
    font-size: 1.9em;
  }
  section.title h2 {
    margin-left: 0;
    color: #555;
    font-size: 1.3em;
  }
  section.title h3 {
    margin-left: 0;
    color: #888;
    font-size: 1.0em;
  }

  /* ── Product-tour (screenshot) Slides ─────────────────────────────── */
  /* Compact header, height-bounded image (never clipped), caption that
     always fits above the footer. Image is sized via `h:` in the alt text. */
  section.tour {
    padding-top: 54px;
    padding-bottom: 64px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  section.tour h1 {
    font-size: 1.3em;
    margin-bottom: 4px;
  }
  section.tour img {
    display: block;
    margin: 14px auto 8px auto;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.12);
  }
  section.tour blockquote {
    font-size: 0.74em;
    width: 92%;
    margin: 4px auto 0 auto;
  }
---

<!-- _class: title -->
<!-- _paginate: false -->
<!-- _header: '' -->

# Fred

## The Open Agentic Platform for the Enterprise

### Sovereign · production-grade · deployable anywhere

<small>An innovation first-contact: what we do — and where it meets your needs</small>

---

# Every large organization is asking the same question

## "How do we move agentic AI from demos into real operations?"

- Teams everywhere are **experimenting**: copilots, RAG prototypes, LLM scripts.
- Almost all of them stall at the same wall: **demo to production**.
- Security, governance, sovereignty and operations are left unsolved.
- Off-the-shelf SaaS rarely fits **regulated, on-prem or sovereign** constraints.

> The appetite is everywhere. The industrial foundation is what's missing.

---

# What Fred is

## Design agents · Ingest knowledge · Deploy anywhere

- **Agentic backend** — tool-using agents, sessions, streaming, model routing, orchestration.
- **Knowledge-flow backend** — ingestion, metadata, retrieval, content lifecycle (RAG).
- **Web frontend** — for end users *and* admins.
- **Governance primitives** — policy, RBAC/ReBAC, observability, model catalog.

> One open, modular foundation — from the LLM experiment to the operated system.

---

# Why Fred is different

## An open platform you own — not a vendor's black box

- **Sovereign by construction** — open source, on-prem or sovereign cloud, **no lock-in**.
- **Production-grade, not demoware** — auth, security, ops and deployment are built in.
- **Modular & extensible** — bring your own tools, models, agents and corpora.
- **Practitioner-driven** — shaped by teams running real systems, not slideware.

> You keep control of the models, the data, and the infrastructure.

---

# It already runs on sovereign infrastructure

## Not a lab project — deployed and operated for real

- ✅ Deployed on a **Tanzu** Kubernetes platform, at a **regulated security level**.
- 🎯 **Targeting a sovereign-cloud deployment (S3NS)** this summer.
- 🔁 Same platform, same code — from on-prem to sovereign cloud.

> The hard question — *"can this actually run in our environment?"* — is already answered.

---

<!-- _class: tour -->

# A platform your developers build on

![h:400 center](diagrams/ui-create-agents.png)

> **ReAct or graph · samples, shared, or your own.** Simple assistants, RAG, deterministic workflows, multi-agent routers — designed in code and shipped as agentic apps to a Fred instance.

---

# What you can build on Fred

## Three convergence areas, common to every sector

- **AI for operations** — assistants over procedures, incident & anomaly investigation, decision support.
- **AI for internal business** — requirements traceability, document & process automation, compliance.
- **AI for your core business** — domain agents tailored to your products and your expertise.

> The same platform; you configure your own agents, corpora and prompts.

---

<!-- _class: tour -->

# Knowledge, organized and governed

![h:400 center](diagrams/ui-files.png)

> An indexed corpus, private drafts, and team-shared deliverables — every file with its state and its permissions.

---

<!-- _class: tour -->

# Agents that produce — not just chat

![h:400 center](diagrams/ui-mindmap.png)

> From a raw document to an interactive mindmap of steps, decisions and action items: agents deliver artifacts, not just answers.

---

# Governed and secure by design

## Built for regulated and sensitive environments

- **Identity & access** — Keycloak, RBAC and fine-grained **ReBAC**.
- **Policy, not config** — model and routing rules expressed as governed policy.
- **Observability** — tracing, metrics and KPIs from day one.
- **Deploy where you must** — on-prem, private Kubernetes, or sovereign cloud.

> Security and governance are platform features — not afterthoughts.

---

# Adopt it on your terms

## Open, pragmatic, fast-moving — you stay in control

- **Start small** — one use case, one team, a focused proof of value.
- **No lock-in** — open source; your data, your models, your infrastructure.
- **Move fast** — a challenger's pace, without enterprise glue-code overhead.
- **Reuse, don't rebuild** — improvements compound across your use cases.

> You are never captive. You adopt as far and as fast as the value justifies.

---

# Where Fred stands today

## Open, proven, and gaining momentum

- **Open ecosystem** — `fred` + `fred-deployment-factory`, public on GitHub.
- **Proven path** — running on-prem at a regulated security level; sovereign cloud next.
- **Growing adoption** — increasingly a reference for teams industrializing agentic AI.
- **Practitioner-driven** — built by people shipping real systems.

> Not a research project. A platform you can adopt now.

---

<!-- _class: section-divider -->

# Let's start with one use case

## A focused proof of value — in weeks, not quarters

- **You pick** the operation, process or product where AI would help most.
- **We deliver** a working agent on that use case — on your infrastructure.
- **You judge** the value on something real, before committing further.

> Small, concrete, low-risk. The fastest way to see what Fred does for *you*.
