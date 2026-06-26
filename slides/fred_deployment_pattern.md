---
marp: true
theme: default
header: '<span class="brand">Fred</span> | A GitOps Deployment Pattern'
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
  .ok { color: #1a8a44; font-weight: bold; }
  .assume { color: #b8860b; font-weight: bold; }

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

  /* ── Code blocks (for the layered diagram) ────────────────────────── */
  pre {
    font-size: 16px;
    background: #f6f9fc;
    border: 1px solid #dce6f0;
    border-radius: 8px;
    padding: 14px 18px;
    margin: 16px auto;
    width: 92%;
  }

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
  section.section-divider li strong { color: #ffffff; }

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

  /* ── Layer diagram (the core-idea slide) ──────────────────────────── */
  .arch { width: 90%; margin: 12px auto 2px auto; }
  .layer {
    border-radius: 14px;
    padding: 12px 22px;
    box-shadow: 0 5px 16px rgba(0,0,0,0.10);
    border: 1px solid #dce6f0;
  }
  .layer .lhead { display: flex; align-items: baseline; gap: 14px; margin-bottom: 12px; }
  .layer .lname { font-weight: 800; font-size: 24px; letter-spacing: 0.4px; }
  .layer .ltag  { font-size: 15px; color: #6b7a88; }
  .layer .lpill {
    margin-left: auto; font-size: 13px; font-weight: 700;
    padding: 3px 12px; border-radius: 999px;
  }
  .chips { display: flex; flex-wrap: wrap; gap: 10px; }
  .chip {
    font-size: 16px; padding: 7px 14px; border-radius: 9px;
    background: #fff; border: 1px solid #cfe0f0; color: #2b4a63; font-weight: 600;
  }
  .chip i { font-style: normal; color: #8aa1b5; font-weight: 500; }
  .layer-apps { background: linear-gradient(180deg,#f4f9ff,#eaf4ff); border-color: #cfe3f7; }
  .layer-apps .lname { color: #007acc; }
  .layer-apps .lpill { background: #d8ecff; color: #007acc; }
  .layer-foundation { background: linear-gradient(180deg,#eef2f6,#e4ebf1); border-color: #d3dde6; }
  .layer-foundation .lname { color: #34506b; }
  .layer-foundation .lpill { background: #d7e2ea; color: #34506b; }
  .layer-foundation .chip { border-color: #d3dde6; color: #34506b; }
  .lsub { font-size: 15px; color: #6b7a88; margin-top: 10px; }
  .arch-link { text-align: center; color: #6b7a88; font-size: 15px; margin: 9px 0; }
  .arch-link b { color: #007acc; }
  .arch-link .ar { color: #007acc; font-weight: 800; font-size: 18px; }
  .secrets {
    margin: 10px auto 0 auto; width: 90%; text-align: center; font-size: 14px;
    color: #8a6d1a; background: #fff8e6; border: 1px dashed #e6c34d;
    border-radius: 9px; padding: 7px 12px; letter-spacing: 0.3px;
  }

  /* ── Loop / flow diagram (the Apps slide) ─────────────────────────── */
  .flow { display: flex; align-items: stretch; justify-content: center;
          gap: 0; margin: 22px auto 8px auto; width: 98%; }
  .node { flex: 1; background: linear-gradient(180deg,#f4f9ff,#eaf4ff);
          border: 1px solid #cfe3f7; border-radius: 13px; padding: 14px 10px;
          text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
  .node .ntitle { font-weight: 800; color: #007acc; font-size: 18px; letter-spacing: .3px; }
  .node .ndesc { font-size: 14px; color: #46586a; margin-top: 6px; line-height: 1.3; }
  .node.you { background: #fff8e6; border-color: #e6c34d; }
  .node.you .ntitle { color: #b8860b; }
  .node.cluster { background: linear-gradient(180deg,#eef2f6,#e4ebf1); border-color: #d3dde6; }
  .node.cluster .ntitle { color: #34506b; }
  .farrow { align-self: center; color: #7fa8c9; font-weight: 800; font-size: 28px;
            padding: 0 8px; line-height: 1; }
  .farrow small { display: block; font-size: 11px; color: #9bb3c7; font-weight: 700;
                  text-align: center; margin-top: 3px; letter-spacing: .2px; }
  .flow-cap { text-align: center; color: #6b7a88; font-size: 15px; font-style: italic; margin-top: 4px; }

  /* ── Dense slide (table-heavy, e.g. classification knobs) ─────────── */
  section.dense { padding-top: 58px; }
  section.dense h1 { font-size: 1.4em; }
  section.dense ul { margin-left: 50px; }
  section.dense li { font-size: 20px; margin-bottom: 6px; }
  section.dense table { font-size: 16px; margin: 10px auto 8px auto; }
  section.dense th, section.dense td { padding: 5px 12px; }

  /* ── Global schema (two streams meeting at the cluster) ───────────── */
  .schema { display: flex; align-items: center; justify-content: center; gap: 12px; width: 99%; margin: 18px auto 6px; }
  .lanes { display: flex; flex-direction: column; gap: 16px; flex: 1; }
  .lane { display: flex; align-items: center; gap: 5px; }
  .lanelbl { flex: 0 0 60px; width: 60px; text-align: right; text-transform: uppercase;
             font-size: 11px; font-weight: 800; letter-spacing: .4px; color: #9bb3c7; }
  .snode { flex: 1; background: #fff; border: 1px solid #cfe0f0; border-radius: 10px;
           padding: 9px 10px; text-align: center; box-shadow: 0 3px 9px rgba(0,0,0,0.07); }
  .snode .st { font-weight: 800; color: #007acc; font-size: 15px; }
  .snode .sd { font-size: 12px; color: #5a6b7a; margin-top: 3px; line-height: 1.25; }
  .snode.reg { background: #f4f9ff; }
  .snode.clusterbig { flex: 0 0 210px; padding: 16px 14px;
                      background: linear-gradient(180deg,#eef2f6,#e4ebf1); border-color: #d3dde6; }
  .snode.clusterbig .st { color: #34506b; font-size: 17px; }
  .sarrow { color: #7fa8c9; font-weight: 800; font-size: 20px; line-height: 1; white-space: nowrap; }
  .sarrow small { display: block; font-size: 10px; color: #9bb3c7; font-weight: 700; margin-top: 2px; }
  .smerge { color: #7fa8c9; font-weight: 800; font-size: 30px; padding: 0 2px; }
  .tag { color: #b8860b; font-weight: 800; }
  .schema-cap { text-align: center; color: #6b7a88; font-size: 14px; font-style: italic; margin-top: 4px; }
---

<!-- _class: title -->
<!-- _paginate: false -->
<!-- _header: '' -->

# Deploying Fred

## A GitOps Deployment Pattern for the Enterprise

### Reproducible · governed · portable — from first install to sovereign cloud

<small>A reference design for operating the Fred platform — and a template for any corporate deployment</small>

---

# The question this pattern answers

## "How do we run a multi-app product reliably — and repeat it everywhere?"

- Fred is **four cooperating apps** plus a stateful backbone — not a single container.
- Getting it *running once* is easy. Getting it **reproducible, auditable and safe to change** is the real work.
- A deployment must answer: *where does state live? who can break what? how do we roll back? how do we do it again in the next environment?*

> The wall is never the demo. The wall is **operating it, repeatably, under governance.**

---

# Two repositories, one clean split

## Separate *what the product is* from *how & where it runs*

| `fred` monorepo — **the product** | `fred-deployment-factory` — **the operator** |
| --- | --- |
| Source of the four apps + their images | Runs those images on a concrete target |
| Reference Helm chart (`deploy/charts/fred`) — portable guidance | Environment truth: cluster topology, DNS, secrets |
| Answers **WHAT** | Answers **HOW & WHERE** |

> The product team ships images and a reference chart. The platform team owns the environment. Neither leaks into the other.

---

# The product: four apps + a backbone

## What actually gets deployed

- **A control / API service** — sessions, lifecycle, governance, metrics: the platform's API surface.
- **A knowledge service** — ingestion, retrieval and content lifecycle (RAG): an API **plus an async worker**.
- **An agent runtime** — runs the tool-using agents.
- **A web UI** — for end users *and* operators.

> Four **stateless** services. Every one depends on a **stateful backbone** they do not own: Postgres, OpenSearch, Keycloak, OpenFGA, Temporal.

---

# The core idea: two layers + secrets

## Match the deployment mechanism to the risk and the change-rate

<div class="arch">
  <div class="layer layer-apps">
    <div class="lhead">
      <span class="lname">APPS</span>
      <span class="ltag">GitOps · reconciled · changes often</span>
      <span class="lpill">stateless</span>
    </div>
    <div class="chips">
      <span class="chip">control / API service</span>
      <span class="chip">knowledge service <i>+ worker</i></span>
      <span class="chip">agent runtime</span>
      <span class="chip">web UI</span>
    </div>
  </div>

  <div class="arch-link"><span class="ar">↓</span>&nbsp; reference <b>by name</b> (DNS + the Secret) &nbsp;·&nbsp; dependency points down only</div>

  <div class="layer layer-foundation">
    <div class="lhead">
      <span class="lname">FOUNDATION</span>
      <span class="ltag">imperative · "frozen" · rare change</span>
      <span class="lpill">stateful</span>
    </div>
    <div class="chips">
      <span class="chip">Postgres</span>
      <span class="chip">OpenSearch</span>
      <span class="chip">Keycloak</span>
      <span class="chip">OpenFGA</span>
      <span class="chip">Temporal</span>
    </div>
    <div class="lsub">+ shared Ingress · TLS certificates · the one Secret</div>
  </div>

  <div class="secrets">SECRETS &amp; IDENTITY — injected at deploy, never in git</div>
</div>

> One product, two governance models. The split is the whole pattern.

---

# Foundation — the part you protect

## It holds your data and your identity, so you change it rarely and on purpose

- **It remembers** — your data, your accounts and your permissions live here. Lose it and the loss is real.
- **Everything leans on it** — every app depends on it; it is shared, and it must stay stable.
- **You change it deliberately** — rare, reviewed changes — never as a side effect of shipping an app.
- **You set it up once, then leave it alone** — it's the stable base every app, and every future install, relies on.

> A new account system, a new database, a new public address is a *foundation decision* — made on purpose, not by accident.

---

# Apps — shipping a change means writing it down

## The deployment is a decision recorded in git, not a manual operation

<div class="flow">
  <div class="node you"><div class="ntitle">You</div><div class="ndesc">change one line<br>(which version runs)</div></div>
  <div class="farrow">&rarr;<small>save / push</small></div>
  <div class="node"><div class="ntitle">Git</div><div class="ndesc">the wish —<br>versioned, reviewable</div></div>
  <div class="farrow">&rarr;<small>reads</small></div>
  <div class="node"><div class="ntitle">GitOps controller</div><div class="ndesc">compares wish vs reality,<br>then makes them match</div></div>
  <div class="farrow">&hArr;<small>checks &amp; applies</small></div>
  <div class="node cluster"><div class="ntitle">Cluster</div><div class="ndesc">what is actually<br>running</div></div>
</div>
<div class="flow-cap">Nothing moves until the wish in git changes — then reality is brought back in line with it.</div>

- **Git holds the wish** — one line says which version of each app should run.
- **The controller keeps reality matched to the wish** — and flags any gap on its own.
- **To ship, change one line; to undo, restore the previous one** — always recorded, always reversible.

> Write the change down and the system makes it real. *This can run fully automatically; for now each change is approved on purpose.*

---

# The boundary — built to install anywhere

## Soon Fred runs on a customer's own infrastructure, so the apps must not depend on ours

- **The apps don't know which platform they run on** — they reach the Foundation (database, login, and the rest) by fixed names, never by a specific machine or cloud. On a customer's platform those same names are all that must exist; the apps are untouched.
- **Apps use the Foundation; they never build it** — creating the database, the accounts and the public web address is the platform owner's job. On the customer's infrastructure their team provides the Foundation, and the apps plug straight in.
- **The dependence runs one way** — apps need the Foundation, never the reverse — so you set up the Foundation first, then place the apps on top.
- **The payoff** — putting Fred on new infrastructure is a *re-install*, not a rebuild: recreate the Foundation, point the apps at it, done.

> Same apps, any infrastructure — because they never depend on a particular one.

---

<!-- _class: dense -->

# Secrets & identity — sane by default, hardened by classification

- **Secrets never enter version control** — injected at deploy as one protected secret apps read **by name**; they never hold it or create it.
- **Identity is centralized** — Keycloak decides **who you are**, OpenFGA **what you may do**; every app defers to it.

<small>What runs today is the <b>C1</b> column — the shape is identical at every level; only these knobs tighten:</small>

| Knob | C1 — sample · public cloud | C2 — restricted | C3 — sovereign · S3NS |
| --- | --- | --- | --- |
| **Secrets source** | protected file → one in-cluster secret | encrypted, or a secret manager, via CI | external **vault**; no human handles it |
| **Network** | one path; admin + user behind login | admin on its own entrypoint + policies | **admin plane a user cannot reach** |
| **Hosting** | public cloud | private / restricted cloud | **sovereign cloud (S3NS)** |

> The architecture doesn't change with classification — only how tightly these three knobs are turned.

---

<!-- _class: dense -->

# The whole picture — one product, many instances

<div class="schema">
  <div class="lanes">
    <div class="lane">
      <span class="lanelbl">artifact</span>
      <div class="snode"><div class="st">fred</div><div class="sd">code + Dockerfiles</div></div>
      <span class="sarrow">&rarr;<small>build</small></span>
      <div class="snode reg"><div class="st">image registry</div><div class="sd">app : <span class="tag">TAG</span> · immutable</div></div>
    </div>
    <div class="lane">
      <span class="lanelbl">intent</span>
      <div class="snode"><div class="st">deployment-factory</div><div class="sd">git: run app : <span class="tag">TAG</span></div></div>
      <span class="sarrow">&rarr;<small>watches</small></span>
      <div class="snode"><div class="st">GitOps controller</div><div class="sd">makes reality match</div></div>
    </div>
  </div>
  <span class="smerge">&rarr;</span>
  <div class="snode clusterbig"><div class="st">Cluster — one instance</div><div class="sd">Foundation + Apps<br>pulls app : <span class="tag">TAG</span></div></div>
</div>
<div class="schema-cap">The <span class="tag">TAG</span> is the only link between the two streams.</div>

- **Artifact stream** — `fred` is built **once** into an immutable image in a registry.
- **Intent stream** — a **deployment-factory (one per instance)** declares which tag runs; the controller applies it.

> One product feeds every instance — internal, C1 GKE, C3 S3NS. Only the cluster underneath changes.

---

# Why this is the corporate pattern

## Five properties every regulated deployment needs

- **Blast-radius isolation** — an app deploy *cannot* touch the database. The dangerous, stateful layer is small and rarely touched.
- **Velocity with safety** — apps iterate via GitOps; infra moves slowly and deliberately.
- **Clear ownership** — the platform team owns the Foundation; app teams own the Apps.
- **Disaster recovery** — wipe and re-sync the whole Apps layer from git in minutes; back up only the Foundation.
- **Portability** — a new environment is a new values overlay + secret source, not a new design.

> Same code, same pattern — from a sample instance to sovereign cloud.

---

# The road to corporate-grade

## The same pattern, turned up for each environment and classification

| Theme | Next step |
| --- | --- |
| Multi-environment | Per-environment overlays, fanned out per cluster |
| Secrets | **External secret store** (Vault / SOPS), sourced from CI |
| Trust the loop | Turn on **automatic sync + drift-repair** |
| Release | Extend release tooling to **all four apps**, CI-driven |
| Chart hygiene | **Converge to one canonical chart** (single source) |
| Migrations | A governed **pre-deploy migration step** |

> A concrete backlog already exists for the team — see the deployment-factory RFC.

---

<!-- _class: section-divider -->

# One pattern, every environment

## Strong where it counts, honest where it isn't — and ready to standardize

- **The split is the asset** — a stateful, frozen Foundation vs stateless, GitOps Apps.
- **The boundary is the discipline** — reference by name; dependencies point one way.
- **The path is already mapped** — from a first instance to corporate, with no redesign.

> Adopt the pattern now; harden it on your terms.
