---
title: "Bring Your Own Knowledge: Writing a Fred Knowledge Base"
slug: "knowledge-bases"
description: "A Fred Knowledge Base is a small program of yours that fetches documents from somewhere else and keeps a team's library in sync. This post walks through a minimal one and a serious one, with complete code and every import shown."
summary: "How to write a Fred Knowledge Base: one declaration, one handler, two commands. A minimal Markdown-folder example, an incremental Git one, and everything the SDK gives you for free — scheduling, multi-team instances, identity, metrics and logs."
date: 2026-10-07T10:00:00+02:00
lastmod: 2026-10-07T10:00:00+02:00
draft: true
weight: 50
categories: [platform, sdk]
tags:
  - knowledge-base
  - fred-sdk
  - ingestion
  - observability
  - prometheus
  - beta
contributors:
  - Dimitri Tombroff
  - Fred team
pinned: false
homepage: false
seo:
  title: "Bring Your Own Knowledge: Writing a Fred Knowledge Base"
  description: "A practical guide to Fred Knowledge Bases: a minimal Markdown-folder example, an incremental Git example, and the metrics and logs every pod gets without writing any monitoring code."
  canonical: ""
  robots: "index, follow"
---

# Bring Your Own Knowledge: Writing a Fred Knowledge Base

{{% callout context="warning" title="Beta" %}}
The Knowledge Base SDK is in beta: pin your `fred-sdk` version, as the surface
may still move between beta releases. The metrics and log contract described
near the end ships with `fred-sdk` 4.4.2.
{{% /callout %}}

Most of what a team knows already lives somewhere: a shared drive, a WebDAV
share, a Git repository full of docs, a wiki, a ticketing system. Asking people
to upload it all into Fred, and to keep re-uploading it as it changes, does not
work for long.

A **Knowledge Base** solves that from the other side. It is a small program of
yours, deployed next to Fred, that fetches documents from a source and keeps a
Fred library in sync with it. You write the part only you know — how to read
your source. Fred does the rest: when to run, for which team, with which
settings, and turning documents into something agents can search.

This post shows two of them, end to end, with every import spelled out: a
minimal one you can read in a minute, and a serious one that synchronizes a Git
branch incrementally.

## How it fits together

Three moving parts: your **pod**, Fred's **Control Plane** (which owns
definitions, instances and schedules), and **Knowledge Flow** (which ingests
documents into libraries). A workflow engine sits between them so that runs
survive restarts.

{{< mermaiddiagram >}}
%%{init: {'theme':'neutral'}}%%
sequenceDiagram
    autonumber
    participant Pod as Your KB pod
    participant CP as Fred Control Plane
    participant WF as Workflow engine
    participant KF as Knowledge Flow
    Pod->>CP: publish (deploy time): "I exist, here is my form"
    Note over CP: A team creates an instance:<br/>fills the form, picks a cadence,<br/>gets a library
    CP->>WF: schedule a run (hourly / daily / weekly)
    Pod->>WF: poll for work (no inbound port)
    WF-->>Pod: run for instance X
    Pod->>CP: fetch this run's configuration
    Pod->>KF: publish / retract documents in X's library
    Pod-->>WF: run outcome
{{< /mermaiddiagram >}}

Two things in that picture matter more than they look:

- **The pod pulls.** It serves no user and opens no business port. It asks the
  workflow engine for work, the way a CI runner does. Nothing has to route
  traffic to it.
- **One pod, many teams.** A Knowledge Base is declared once. Every team that
  wants it creates its own *instance* — its own settings, its own library. The
  same handler serves all of them, and never has to tell them apart itself:
  each run arrives with its own configuration and its own target library.

## The smallest useful Knowledge Base

Here is a complete Knowledge Base that keeps a library in sync with a folder of
Markdown files. It is the whole package:

```text
markdown_folder_kb/
├── __init__.py
├── __main__.py          # the image's entry point
└── knowledge_base.py    # the declaration and the handler
config/
└── configuration.yaml   # how this pod reaches Fred
```

### The declaration and the handler

```python
from __future__ import annotations

import hashlib
from pathlib import Path

from fred_sdk.knowledge_base import (
    DocumentPublisher,
    FieldSpec,
    KnowledgeBase,
    KnowledgeBaseIssue,
    KnowledgeBaseReconciliation,
    KnowledgeBaseRunContext,
    KnowledgeBaseRunOutcome,
    KnowledgeBaseSyncResult,
)

kb = KnowledgeBase(
    id="acme.kb.markdown-folder",  # under a prefix your team owns
    version="1.0.0",
    name="Markdown folder",
    description="Keep a library in sync with a folder of Markdown files.",
    configuration_fields=[
        FieldSpec(
            key="root_path",
            type="string",
            title="Folder",
            description="Absolute path of the folder to synchronize.",
            required=True,
        ),
    ],
)


@kb.synchronize
async def synchronize(context: KnowledgeBaseRunContext) -> KnowledgeBaseSyncResult:
    root = Path(str(context.configuration["root_path"]))
    if not root.is_dir():
        return KnowledgeBaseSyncResult(
            outcome=KnowledgeBaseRunOutcome.failed,
            reconciliation=KnowledgeBaseReconciliation.partial,  # we saw nothing, so we prove nothing
            errors=[KnowledgeBaseIssue(code="root_missing", message=str(root))],
        )

    files = {p.relative_to(root).as_posix(): p for p in sorted(root.rglob("*.md"))}
    created = updated = unchanged = removed = 0
    warnings: list[KnowledgeBaseIssue] = []

    async with DocumentPublisher.for_run(context) as library:  # this run's library, as this pod
        held = await library.documents()  # {source_key: version} already in Fred

        for key, path in files.items():
            content = path.read_bytes()
            version = hashlib.sha256(content).hexdigest()
            if held.get(key) == version:
                unchanged += 1
                continue
            try:
                await library.publish(relative_path=key, content=content, version=version)
            except Exception as error:
                warnings.append(
                    KnowledgeBaseIssue(code="publish_failed", message=str(error), subject=key)
                )
                continue
            if key in held:
                updated += 1
            else:
                created += 1

        # We listed the whole folder, so whatever Fred holds and the folder
        # no longer has was really deleted.
        for key in held.keys() - files.keys():
            await library.retract(relative_path=key)
            removed += 1

    return KnowledgeBaseSyncResult(
        outcome=KnowledgeBaseRunOutcome.succeeded,
        reconciliation=KnowledgeBaseReconciliation.complete,  # we listed the whole folder
        discovered=len(files),
        created=created,
        updated=updated,
        removed=removed,
        unchanged=unchanged,
        warnings=warnings,
    )
```

What each import is:

| Import | What it is |
|---|---|
| `FieldSpec` | One field of the form a team fills in to create an instance. The same vocabulary agents use for their settings (also importable from `fred_sdk.contracts.models`). |
| `KnowledgeBase` | The declaration: a dotted id under a prefix you own, a version, and the form. `@kb.synchronize` registers the handler. |
| `KnowledgeBaseRunContext` | What one run is told: its `instance_id`, `team_id`, `run_id`, the `library_id` to write into, and the team's `configuration`. Never a credential. |
| `KnowledgeBaseSyncResult`, `KnowledgeBaseRunOutcome`, `KnowledgeBaseReconciliation`, `KnowledgeBaseIssue` | What the run reports back: an outcome, how much of the source it reconciled (`complete`, `partial` or `up_to_date`), honest counters, and warnings or errors with stable codes. |
| `DocumentPublisher` | The only way documents reach Fred: `documents()`, `publish()`, `retract()`, `wait()`, plus a per-library cursor. `DocumentPublisher.for_run(context)` opens the run's own library, as the pod, with the configuration the pod started with — nothing to load, no library id to repeat. |

Three details carry most of the correctness:

- **The source key is the path.** Publishing `guides/install.md` twice updates
  one document; it never creates a duplicate. Nothing Fred assigns has to be
  remembered by the pod.
- **The version is yours.** Here it is a content hash. Fred stores it and hands
  it back through `documents()`, which is how the second run knows that nothing
  changed and publishes nothing — with no local state in the pod at all.
- **Deletion is earned.** The handler only retracts what Fred holds and the
  folder no longer has *because it listed the whole folder*, and says so with
  `reconciliation=complete`. A run that could not see its source reports
  `partial` and must never take anything out on the strength of an absence.

### The entry point

```python
from fred_sdk.knowledge_base import knowledge_base_main

from markdown_folder_kb.knowledge_base import kb

raise SystemExit(knowledge_base_main(kb))
```

That one call gives the image two commands:

```bash
python -m markdown_folder_kb publish   # deploy hook: declare this KB to Fred, then exit
python -m markdown_folder_kb run       # serve runs until stopped
```

Publishing is never a side effect of running: two replicas starting during a
rolling upgrade must not race each other to rewrite the declaration.

### The pod's configuration

The same keys every Fred component reads, with secrets in the environment only:

```yaml
# config/configuration.yaml — mounted from a ConfigMap, found through $CONFIG_FILE
app:
  # This pod's identity in metrics and logs. Chosen by whoever deploys it.
  runtime_id: "markdown-folder-kb"

knowledge_base:
  prefix: "acme.kb"                      # the prefix this image owns
  control_plane_url: "http://control-plane-backend:8222/control-plane/v1"
  knowledge_flow_url: "http://knowledge-flow-backend:8000/knowledge-flow/v1"

security:
  m2m:
    realm_url: "https://keycloak.example.com/realms/app"
    client_id: "kb-acme.kb"
    secret_env_var: "ACME_KB_CLIENT_SECRET"  # the variable's name, never its value

scheduler:
  temporal:
    host: "temporal-frontend:7233"
    namespace: "default"
```

The `prefix` is how ownership works. Fred binds it to your Keycloak client on
the first publication; from then on nobody else can publish a Knowledge Base
under `acme.kb.*`, and nobody has to keep a registry of names.

## What you did not write

Look back at the handler. There is no scheduling, no retry loop, no HTTP
server, no token handling, no team or permission logic, and no monitoring code.
Those are the SDK's and Fred's job:

- **Scheduling and durability.** Runs are dispatched by Fred through the
  workflow engine. A pod killed mid-run does not lose the run.
- **Identity.** The pod authenticates as a workload with its own client; the
  publisher attaches the token to every call.
- **Protection.** A library filled by a Knowledge Base is marked as
  machine-written, so people cannot edit documents the next run would silently
  overwrite.
- **Metrics and logs.** Every pod is measured exactly like a native Fred
  component, with zero lines from you.

That last one deserves a closer look, because an opaque program running in
production is only acceptable if it can be operated.

### Metrics, for free

The `run` command serves Prometheus-format metrics on `127.0.0.1:9000`
(bind it outward in your deployment to have it scraped). This is what a freshly
started pod exposes:

```text
$ curl -s localhost:9000/metrics | grep -E '^fred_kb_info|^# TYPE'
# TYPE fred_kb_info gauge
fred_kb_info{knowledge_base="fred.samples.webdav",sdk="fred-sdk-python",sdk_version="4.4.2",service="webdav-kb",version="1.0.0"} 1.0
# TYPE fred_kb_runs_in_progress gauge
# TYPE fred_kb_runs_total counter
# TYPE fred_kb_run_duration_seconds histogram
# TYPE fred_kb_last_run_timestamp_seconds gauge
# TYPE fred_kb_run_errors_total counter
# TYPE fred_kb_items_total counter
# TYPE fred_kb_issues_total counter
# TYPE fred_kb_requests_total counter
# TYPE fred_kb_request_duration_seconds histogram
# TYPE fred_kb_ingestion_wait_seconds histogram
```

Every series carries two labels: `service` — the `app.runtime_id` chosen at
deployment — and `knowledge_base`, the definition. Never a team, an instance, a
library or a document: operational metrics are read by everyone with Grafana,
and who-did-what belongs inside Fred, behind its own access control.

The questions an operator actually asks become one-liners:

```promql
# Is a pod failing runs?
sum by (service, outcome) (rate(fred_kb_runs_total{outcome=~"failed|error"}[15m]))

# Documents handed to Fred per second
sum by (service) (rate(fred_kb_requests_total{target="knowledge_flow",operation="publish",status="2xx"}[5m]))

# Ingestion latency, p95
histogram_quantile(0.95, sum by (le, service) (rate(fred_kb_ingestion_wait_seconds_bucket{state="succeeded"}[15m])))

# Has it stopped synchronizing?
time() - max by (service) (fred_kb_last_run_timestamp_seconds{outcome="succeeded"})
```

A second endpoint on port 9001 exports the workflow engine's own series
(pollers, task latencies), tagged with the same two labels.

### Logs that join their metrics

Standard output is one JSON object per line, and `service` is the same value as
on the metrics — so a spike on a graph leads straight to the lines that explain
it (`jsonPayload.service="webdav-kb"` in Cloud Logging, `{service="webdav-kb"}`
in Loki):

```json
{"ts": 1791348731.33, "level": "INFO", "logger": "fred_sdk.knowledge_base.worker", "service": "webdav-kb", "knowledge_base": "fred.samples.webdav", "msg": "Workflow engine metrics served at 127.0.0.1:9001"}
```

Set `observability.logs.format: text` when a person is reading a terminal.

### Counting your own things

If your source has something worth measuring — shares scanned, API quota left —
use `prometheus_client` the ordinary way. The same endpoint serves it; there is
no Fred-specific metrics API to learn:

```python
from prometheus_client import Counter

SHARES_SCANNED = Counter("acme_webdav_shares_scanned", "Shares a run walked.")

SHARES_SCANNED.inc()
```

Keep the same discipline as the SDK: no team, instance or document in a label.

## A more serious one: incremental Git

The folder example compares every file on every run. That is fine for a
thousand files and wasteful for a large repository whose branch moves twice a
day. A real Knowledge Base usually wants to be **incremental**: do work
proportional to what changed, not to what exists.

The pattern is a **cursor**. `DocumentPublisher` keeps one opaque string per
library for you — `source_version()` reads it, `record_source_version()`
writes it. For Git, it is the last revision that fully landed in Fred:

- **No cursor** (first run, or it was lost): a *full pass*. List every file,
  compare with `documents()`, publish what differs, retract what is gone.
- **A cursor**: an *incremental pass*. Ask Git what changed between the cursor
  and the branch head, and apply exactly that.
- **Cursor equals head**: the branch has not moved. Return immediately with
  `reconciliation=up_to_date` — on a schedule, that is most runs, and operators
  see them as *nothing to do* rather than as partial passes. The SDK refuses
  `up_to_date` next to any write or error, so the label cannot lie.

The Git side is your own Fred-agnostic code (here `acme_git_kb.repository`,
with `head()`, `every_file()`, `changed_since()` and `read()`); the handler is
where the two vocabularies meet:

```python
from __future__ import annotations

from fred_sdk.knowledge_base import (
    DocumentPublisher,
    DocumentWaitTimeout,
    FieldSpec,
    KnowledgeBase,
    KnowledgeBaseIssue,
    KnowledgeBaseReconciliation,
    KnowledgeBaseRunContext,
    KnowledgeBaseRunOutcome,
    KnowledgeBaseSyncResult,
    UIHints,
)

from acme_git_kb.repository import Change, Repository  # your code, Fred-agnostic

kb = KnowledgeBase(
    id="acme.kb.git-docs",
    version="1.0.0",
    name="Git documentation",
    description="Keep a library in sync with the docs of a Git branch.",
    configuration_fields=[
        FieldSpec(
            key="provider",
            type="select",
            title="Provider",
            enum=["github", "gitlab"],
            default="github",
            required=True,
        ),
        FieldSpec(
            key="repository",
            type="string",
            title="Repository",
            required=True,
            ui=UIHints(placeholder="ThalesGroup/fred"),
        ),
        FieldSpec(key="branch", type="string", title="Branch"),
        FieldSpec(
            key="token",
            type="secret",  # never shown back in the form once saved
            title="Access token",
            description="Read-only. Only needed for a private repository.",
        ),
    ],
)


@kb.synchronize
async def synchronize(context: KnowledgeBaseRunContext) -> KnowledgeBaseSyncResult:
    repo = Repository.from_configuration(context.configuration)
    async with DocumentPublisher.for_run(context) as library:  # this run's library, as this pod
        cursor = await library.source_version()  # last revision fully landed in Fred
        head = await repo.head()
        if cursor == head:
            return KnowledgeBaseSyncResult(
                outcome=KnowledgeBaseRunOutcome.succeeded,
                reconciliation=KnowledgeBaseReconciliation.up_to_date,  # nothing to do, and we know it
                summary=f"up to date at {head[:8]}",
            )

        if cursor is None:
            # First run, or the cursor was lost: compare everything with Fred.
            changes = await repo.every_file(head)
            listed = {change.path for change in changes}
            held = await library.documents()
            changes += [Change(path=k, blob="", deleted=True) for k in held.keys() - listed]
            full_pass = True
        else:
            # The diff names deletions explicitly, so they are safe to act on
            # even though this pass does not look at the rest of the branch.
            changes = await repo.changed_since(cursor, head)
            full_pass = False

        created = updated = removed = 0
        errors: list[KnowledgeBaseIssue] = []
        for change in changes:
            try:
                if change.deleted:
                    await library.retract(relative_path=change.path)
                    removed += 1
                    continue
                handle = await library.publish(
                    relative_path=change.path,
                    content=await repo.read(head, change.path),
                    version=change.blob,
                    profile="fast",
                )
                outcome = await library.wait(handle.task_id, timeout=300)
                if not outcome.succeeded:
                    raise RuntimeError(f"ingestion {outcome.state}: {outcome.error}")
                if handle.created:  # Fred says whether this key is new to the library
                    created += 1
                else:
                    updated += 1
            except DocumentWaitTimeout:
                # Accepted and still ingesting: not lost, just not confirmed yet.
                errors.append(KnowledgeBaseIssue(code="still_ingesting", subject=change.path))
            except Exception as error:
                errors.append(
                    KnowledgeBaseIssue(code="write_failed", message=str(error), subject=change.path)
                )

        if not errors:
            # Only move the cursor once every change has landed: a failed file
            # is retried by the next run instead of being skipped forever.
            await library.record_source_version(head)

    return KnowledgeBaseSyncResult(
        outcome=KnowledgeBaseRunOutcome.failed if errors else KnowledgeBaseRunOutcome.succeeded,
        reconciliation=(
            KnowledgeBaseReconciliation.complete if full_pass and not errors else KnowledgeBaseReconciliation.partial
        ),
        summary=f"{'full' if full_pass else 'incremental'} pass to {head[:8]}",
        discovered=len(changes),
        created=created,
        updated=updated,
        removed=removed,
        errors=errors,
        metrics={"revision": head, "pass": "full" if full_pass else "incremental"},
    )
```

What this one adds over the minimal example:

- **Richer forms.** `type="select"` with an `enum`, `type="secret"` for the
  token (never shown back once saved), and `UIHints` for placeholders.
  The form a team sees is drawn entirely from these fields.
- **Waiting for ingestion.** `publish()` returns as soon as Fred has
  *accepted* the document, with a `DocumentHandle` naming the ingestion task.
  `wait()` follows it to the end; a failed conversion is an *outcome*, not an
  exception. `DocumentWaitTimeout` means "still running", which is not the same
  as lost. `profile` picks how much processing Fred applies (`fast`, `medium`,
  `rich`).
- **The cursor only moves forward on success.** If a single file fails, the
  revision is not recorded, and the next run retries the same range. Advancing
  past a failure would skip that document forever.
- **Tombstones versus absences.** A full pass may delete what it did not see,
  because it saw everything. An incremental pass sees almost nothing — yet it
  can still delete, because Git *names* the deleted files. That is why it
  reports `partial` without being any less correct.
- **`metrics`** in the result carries source-specific facts (the revision, the
  kind of pass) next to the generic counters.

The complete, production-shaped version of this — mirrors, GitHub and GitLab,
include/exclude patterns, bounded concurrency — is
[`fred-samples/knowledge-bases/git-repository`](https://github.com/fred-agent/fred-samples/tree/swift/knowledge-bases/git-repository).

## The rules that keep a library honest

Both examples follow the same handful of rules. They are worth stating, because
the SDK cannot enforce all of them for you:

1. **Owe a result, not an exception.** A bad configuration or an unreachable
   source is a `failed` outcome with an issue code. Raising is for bugs.
2. **Delete only what you have proven gone** — a complete listing, or an
   explicit tombstone from the source. A timeout, a page limit or a filter
   proves nothing.
3. **Key by the source's own name.** The path, the URL, the ticket id. Then a
   retry is an update, never a duplicate.
4. **Let Fred remember.** Versions and the cursor live in Fred, next to the
   documents they describe. A pod with no local state can be rescheduled
   anywhere.
5. **Use stable issue codes.** `publish_failed`, `still_ingesting`: they are
   counted per code in `fred_kb_issues_total`, so a new failure mode shows up
   as a new line on a dashboard.

## Beyond pull

Both examples copy documents into Fred, which is the most common case and the
one this SDK is built around. It is not the only shape a Knowledge Base can
take. `knowledge_flow_url` is optional: a Knowledge Base that keeps its own
store — its own index, its own graph — simply leaves it out and writes nothing
into Fred's libraries. Letting such a Knowledge Base expose what it knows to
agents directly, as a capability, is the natural next step; it is not part of
this beta yet.

## Why the SDK stays small

Notice what the author's code depends on: a declaration, a context, a result
and a document client. Everything around them — the identity, the
configuration keys, the metrics names and labels, the log fields — is specified
as a **contract**, not as Python classes to inherit from. The metrics are plain
Prometheus exposition over HTTP; the logs are JSON lines; the configuration is
YAML.

That is deliberate. Python is where this SDK lives today, but a Knowledge Base
written in another language only has to honour the same contract to be
operated exactly like this one — the same dashboards, the same alerts, the same
log queries. A small SDK is one you can port.

## Try it

- Three working Knowledge Bases — a local folder, a Git repository and a WebDAV
  share — live in
  [fred-samples/knowledge-bases](https://github.com/fred-agent/fred-samples/tree/swift/knowledge-bases).
- Install `fred-sdk[knowledge-base]`; the authoring guide is the SDK's
  [README](https://github.com/ThalesGroup/fred/tree/swift/libs/fred-sdk).
- The design, including the metrics contract and the operator queries, is in
  [KNOWLEDGE-BASE.md](https://github.com/ThalesGroup/fred/blob/swift/docs/swift/design/KNOWLEDGE-BASE.md).
