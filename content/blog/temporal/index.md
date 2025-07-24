---
title: " Ingest Smarter, Not Harder — Fred Gets a Temporal Brain"
description: "Fred now uses Temporal to power robust, observable document ingestion pipelines, enabling batch processing, custom workflows, and precise debugging."
summary: "Thanks to Temporal, Fred makes document ingestion as reliable as microservices — with automatic retries, fine-grained observability, and custom pipelines for push or pull ingestion. A true game-changer for AI apps."
date: 2025-07-20T19:00:00+02:00
lastmod: 2025-07-20T19:00:00+02:00
draft: false
weight: 4
categories: [architecture, ops, orchestration]
tags:
  - temporal
  - workflow
  - ingestion
  - vectorization
  - AI-pipeline
contributors: [Alban Capitant, Simon Cariou, Florian Muller, Dimitri Tombroff]
pinned: false
homepage: false
seo:
  title: "How Fred Uses Temporal to Orchestrate Reliable Document Pipelines"
  description: "Fred now uses Temporal to run ingestion pipelines for push or pull files, with retries, visibility, and customization for developers and AI engineers."
  canonical: "https://fredk8.dev/blog/temporal-ingestion-pipeline"
  robots: "index, follow"
---

Ingesting documents sounds simple — until you need to do it **at scale**, reliably, and with visibility.

What if you could:
- Process hundreds of documents in parallel
- Easily see which one failed and why
- Retry failed steps individually
- Customize the pipeline for your own use case

Fred now does exactly that. Thanks to **[Temporal](https://temporal.io)**, we’ve given our ingestion system a *durable*, *observable*, and *developer-friendly* architecture.

---

## The Ingestion Problem

When you build GenAI apps that process user documents, ingestion is always the first bottleneck.

You need to:
- Accept both *push* uploads and *pull* sources (like WebDAV or Git)
- Extract structured metadata
- Run parsing and transformation logic
- Vectorize the output for search
- Save everything reliably

And if any of this fails — especially in a batch — you want to know *which file*, *why*, and *how to fix it*.

Traditionally, teams solve this with brittle scripts, Celery queues, or one-off APIs. But that leads to poor observability, no retry logic, and painful debugging.

---

## Why Temporal?

Fred now uses **Temporal workflows** to define its ingestion pipeline in three reusable steps:

1. **Extract Metadata**  
   - Validate and parse the file (based on whether it's push or pull)
   - Save metadata early

2. **Input Process**  
   - Copy the file into a working directory
   - Extract structured content (e.g. markdown, tables, PDFs)

3. **Output Process**  
   - Vectorize the parsed content (unless using in-memory store)
   - Store output vectors and update metadata

Each step is a **Temporal activity** — which means:
- ✅ Retries are automatic
- ✅ Timeouts and logs are built-in
- ✅ You can see every file’s lifecycle in the UI

---

The architecture is quite simple and is illustrated next: 
{{< mermaiddiagram >}}
flowchart TD
    subgraph UI["🧑 User Interface"]
        User[Fred Web UI]
    end

    subgraph KnowledgeFlow["📚 Knowledge Flow Backend"]
        KnowledgeAPI[Ingestion API]
        TemporalClient[Temporal Client SDK]
    end

    subgraph Temporal["⏱️ Temporal Orchestration Layer"]
        TemporalServer[🧭 Temporal Server]
        Worker1[🔧 Knowledge Flow Worker 1]
        Worker2[🔧 Knowledge Flow Worker 2]
        ScaleHint[...auto-scale as needed...]
    end

    User -->|REST or Upload| KnowledgeAPI
    KnowledgeAPI -->|launch pipeline| TemporalClient
    TemporalClient --> TemporalServer
    TemporalServer --> Worker1
    TemporalServer --> Worker2

    subgraph Workers["📦 Ingestion Workers (Knowledge Flow Workers)"]
        Worker1
        Worker2
        ScaleHint
    end

    style User fill:#d0e1ff,stroke:#333,stroke-width:1.5px
    style KnowledgeAPI fill:#d7fada,stroke:#333,stroke-width:1.5px
    style TemporalClient fill:#bbf3ff,stroke:#333,stroke-dasharray: 3,3
    style TemporalServer fill:#ffd6e7,stroke:#333,stroke-width:1.5px
    style Worker1 fill:#f2f2f2,stroke:#333,stroke-width:1.5px
    style Worker2 fill:#f2f2f2,stroke:#333,stroke-width:1.5px
    style ScaleHint fill:#ffffff,stroke:#888,stroke-dasharray: 5,5
{{< /mermaiddiagram >}}

A closer look at the worker shows how its architecture is laser-focused on turning raw input — whether local or remote — into structured, searchable knowledge through a streamlined fetch → process → generate flow.
{{< mermaiddiagram >}}
flowchart TD

    subgraph Source["📦 Input Sources"]
        Push[🗃️ S3 Fred Store]
        Pull[🌍 Remote Source]
    end

    subgraph Worker["⚙️ Knowledge Flow Worker"]
        Step2[🧠 LLM: Metadata + Markdown]
        Step3[🔎 LLM: Embeddings]
        Step4[💾 Save Artifacts]
        Step2 --> Step3 --> Step4
    end

    subgraph Output["📤 Generated Artifacts"]
        Markdown[📄 Fred Previews]
        Embeddings[🧬 Fred Vectors]
        Archive[🗃️ S3 Fred Store]
    end

    Push --> Step2
    Pull --> Step2
    Step2 --> Markdown
    Step3 --> Embeddings
    Step4 --> Archive

    style Step2 fill:#e6f7ff,stroke:#333,stroke-width:1.5px
    style Step3 fill:#e6f7ff,stroke:#333,stroke-width:1.5px
    style Step4 fill:#f9f9f9,stroke:#333,stroke-width:1.5px

    style Push fill:#f2f2f2,stroke:#333,stroke-width:1.5px
    style Pull fill:#f2f2f2,stroke:#888,stroke-dasharray: 5,5
    style Markdown fill:#f0f8ff,stroke:#333,stroke-width:1.5px
    style Embeddings fill:#e2ffe2,stroke:#333,stroke-width:1.5px
    style Archive fill:#eeeeee,stroke:#333,stroke-width:1.5px
{{< /mermaiddiagram >}}





## Developers: What It Looks Like

Here’s how the full workflow looks in code:

```python
@workflow.defn
class Process:
    @workflow.run
    async def run(self, definition: PipelineDefinition) -> str:
        for file in definition.files:
            metadata = await workflow.execute_child_workflow(ExtractMetadata.run, args=[file])
            metadata = await workflow.execute_child_workflow(InputProcess.run, args=[file, metadata])
            await workflow.execute_child_workflow(OutputProcess.run, args=[file, metadata])
        return "success"
```

You can ingest 1 file or 1,000 — each goes through its own reliable workflow.

---

## Why It Matters

This design changes the game.

### For Operators
- **Temporal UI** shows every file’s progress and failures
- **Retries** are automatic and scoped to the right step
- **Logs and inputs** are attached to each file, in context

### For Developers
- You can **fork Fred and define your own pipelines** — add OCR, call external APIs, run classifiers
- Pipelines are just Python classes — no YAML spaghetti
- Temporal makes them **durable**, **monitorable**, and **safe to evolve**

### For Experimentation
We’re now prototyping pipelines that:
- Try different **embedding models** or **splitters**
- Ingest specialized **tabular data**
- Automate **data prep and evaluation** for model experiments

---

## How to Use It

If you run Fred locally start a temporal server (it will be shortly integrated into the devcontainers): 
```bash
# Download the CLI
curl -LO https://github.com/temporalio/cli/releases/download/v1.4.1/temporal_cli_1.4.1_linux_amd64.tar.gz
tar xvzf temporal_cli_1.4.1_linux_amd64.tar.gz
sudo cp temporal /usr/local/bin/

# Start the Temporal server locally (for testing)
temporal server start-dev
```

> You can also run it via Docker using `temporalio/auto-setup`:  
> https://hub.docker.com/r/temporalio/auto-setup

Then, make sure to:
- Open the `config/configuration.yaml` of the **Fred Knowledge Flow backend**
- Enable the scheduler `temporal` section
- Ensure that the ingestion API endpoints are activated

This allows the ingestion API to act as a Temporal client and dispatch workflows to your Temporal server.

To trigger an ingestion manually visit Fred UI and launch a `Process` on your files.


Once everything is running, you can:
- Batch-ingest files via the API
- Observe progress and retries in the **Temporal Web UI** (`http://localhost:8233`)
- Modify the workflow or activities to plug in your own logic

With just a few lines, you’ll have a full ingestion pipeline running — durable, observable, and ready for scale.

---

## Next Steps

Fred's ingestion system is now ready to support:
- **Batch ingestion UI**
- **Per-document audit trails**
- **Custom pipelines per customer or use case**

We're also exploring:
- Adding metrics via OpenTelemetry
- Handling giant file backpressure with dynamic task queues
- Exposing ingestion history in the Fred frontend

---

## Contribute or Try It

- Try [Fred on GitHub](https://github.com/ThalesGroup/fred)
- Explore the [Temporal UI](https://docs.temporal.io)
- Fork the ingestion workflow and plug in your own logic
- Or just batch-ingest some files and watch the magic happen

---

With Temporal in the picture, Fred’s ingestion story goes from *“hope it works”* to *“I can see exactly what happened.”* That's a huge step for reliable AI pipelines.
