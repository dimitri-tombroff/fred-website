---
title: "Document Ingestion Is Not a Side Effect"
date: 2026-02-14T10:00:00+02:00
summary: "Document ingestion is a first-class architectural concern in agentic platforms, and fast attachment is not the same as durable corpus ingestion."
draft: false
weight: 50
pinned: true
homepage: true
tags:
  - RAG
  - Document Processing
  - Architecture
  - Temporal
  - Agentic Systems
contributors:
  - Fred Team
---

# Document Ingestion Is Not a Side Effect

Building an agentic platform inevitably means becoming a document system, whether you planned for it or not. PDFs, DOCX files, slide decks, scanned reports, internal exports, and semi-corrupted archives all end up on the critical path.

At first glance, document ingestion looks like plumbing, something that should "just work" in the background. In practice, it becomes one of the most structurally complex parts of the platform.

This article is a return on experience from building that layer in Fred.

---

## The Illusion of Simple RAG

In notebooks, RAG is often presented as a clean sequence: load a document, split it, embed it, retrieve from it. That sequence is useful, but in production the first verb hides most of the difficulty.

Real documents arrive with broken encodings, inconsistent layouts, image-only pages, partial OCR layers, malformed PDF instructions, and tables that do not map cleanly to text. The problem is not simply "extract text"; it is reconstructing enough structure to make that text usable later.

That is why parser choice quickly becomes an architectural question rather than a utility choice. Libraries such as `unstructured`, `docling`, `pdfminer`, `PyMuPDF`, `pandoc`, and `markitdown` all make real trade-offs. Some are fast but brittle. Some are powerful but heavy. Some silently trigger OCR. Some fail softly and return much less than expected.

This is not a Fred-specific problem. It is a structural property of document processing.

---

## The Key Realization

We progressively converged on a simple conclusion: document ingestion is not a utility. It is an architectural layer.

If ingestion is treated as a side effect, the RAG pipeline becomes fragile in ways that are hard to observe and even harder to debug. If it is explicit, observable, and mode-driven, the system becomes much more predictable.

---

## Three Ingestion Modes in Fred

In the Fred UI and backends, ingestion now exposes three modes: Fast, Medium, and Rich. This is not a cosmetic UI choice. It encodes architectural intent. In the backend, this is reflected explicitly in profile-aware processing configuration (`fast` / `medium` / `rich`) with different processor selections and PDF options.

### Fast

Fast mode exists for interactive flows: file attachments inside conversations, quick previews, and immediate agent interactions. It relies on lightweight parsers, avoids OCR and layout reconstruction, and applies strict truncation so runtime remains deterministic.

This is also visible in the API surface: Fred exposes dedicated fast endpoints for compact extraction and attachment-oriented ingest paths, separate from the heavier corpus processing workflows.

The point of Fast mode is not maximum fidelity. It is low latency and operational stability. A file attachment that helps an agent answer a question in the next few seconds is not the same thing as ingesting that document into a durable knowledge corpus, and Fred treats those as different operations on purpose.

---

### Medium

Medium mode is for documents that need better segmentation, more controlled parsing, and improved structural handling, but still within bounded runtime expectations. In practice, this is often a profile-level shift (parser options, backend settings, and processing budget) rather than a full move to the heaviest extraction path for every format.

In practice, Medium mode is where Fred trades some speed for better structure while still preserving a usable operational envelope.

---

### Rich

Rich mode is designed for high-value corpora, complex PDFs, and documents where layout fidelity materially affects retrieval quality. It can involve heavier parsers, OCR, and full layout reconstruction, which means processing may take minutes rather than seconds.

Rich mode is therefore not an interactive path. It is a delegated path.

---

## Temporal as a Structural Boundary

A key architectural decision in Fred is the use of a scheduler boundary for corpus ingestion, with Temporal as the durable backend in production-oriented deployments. In that model, Medium and Rich processing are delegated to Temporal workers rather than executed in the interactive request path.

This changes the shape of the problem in useful ways. Long-running extraction no longer blocks user flows. Failures become durable and retryable instead of disappearing into request timeouts. Ingestion becomes observable, and processing time becomes an explicit operational cost rather than a hidden latency spike.

Temporal forces a more honest model: ingestion is a workflow, not a function call. That distinction changes a surprising amount of platform design.

Martin Fowler's recent discussion of AI as a form of nondeterministic computing is also a useful lens here. Document ingestion is difficult not only because documents are messy, but because extraction itself depends on heuristics, parser trade-offs, and variable outcomes across formats and files. Fred's Fast / Medium / Rich modes can be read as tolerance classes: different levels of latency, fidelity, and operational cost for different product expectations. Making those tolerances explicit is not just a UX choice; it is an architectural response to nondeterminism ([Fowler via The New Stack](https://thenewstack.io/martin-fowler-on-preparing-for-ais-nondeterministic-computing/)).

---

## The Human Factor

One of the hardest parts of this topic is not technical. It is expectation management.

Most users intuitively map "uploading a document" to "instant usable knowledge." That expectation makes sense from a product perspective, but it hides the reality that Fast mode provides quick access, Rich ingestion may take minutes, some documents will partially fail, some will require normalization, and some are simply malformed.

Part of the platform's job is educational. Users need to understand that attaching a file in a conversation is not the same thing as building a durable semantic corpus. Pretending otherwise creates frustration; making the trade-off explicit builds trust.

---

## We Are Not Alone

These problems show up across the ecosystem, not just in Fred. They appear in `unstructured` issue trackers, `docling` discussions, `pdfminer` and `PyMuPDF` bug reports, RAG-in-production talks, and recurring debates around document loaders in frameworks such as LangChain and LlamaIndex.

A common pattern appears across teams: the hardest part of RAG is often not retrieval, but ingestion. More specifically, it is making ingestion reliable enough that retrieval quality means anything in the first place.

The community is increasingly converging on the same conclusion: robust document processing usually requires multi-tier architectures, asynchronous workflows, and explicit cost models.

---

## What We Learned

Several principles became non-negotiable for us. No single library is sufficient, "fast" has to remain deterministic, heavy extraction must be delegated, OCR should never be implicit, and users need visibility into the trade-offs the system is making on their behalf. Underneath all of that is the core point of this article: ingestion deserves architectural status.

That is the standard we are trying to hold in Fred. Not perfection, but honesty about the problem and explicit design around its trade-offs.

---

## Conclusion

An agentic platform that treats document ingestion as a side effect will eventually suffer instability.

An agentic platform that treats document ingestion as a first-class architectural concern can make trade-offs explicit.

Fred chose the second path not because it is simpler but because it is more realistic.

## Related Work

The challenges described in this article are not specific to Fred. They reflect structural properties of document formats, PDF rendering models, and production-grade Retrieval-Augmented Generation (RAG) systems. The projects and discussions below illustrate how widely shared these difficulties are.

### Document Parsing and Layout Reconstruction

Projects such as [Unstructured](https://github.com/Unstructured-IO/unstructured), [Docling](https://github.com/DS4SD/docling), [PyMuPDF](https://github.com/pymupdf/PyMuPDF), and [pdfminer.six](https://github.com/pdfminer/pdfminer.six) make different trade-offs between speed, structural fidelity, OCR behavior, and operational complexity. The same is true for broader extraction and conversion tools such as [Apache Tika](https://tika.apache.org) and [Pandoc](https://pandoc.org), which remain valuable precisely because heterogeneous documents require heterogeneous strategies.

---

### Retrieval-Augmented Generation and Ingestion Pipelines

Research and tooling around RAG also reinforce this point. [Self-RAG](https://selfrag.github.io/) highlights how retrieval quality depends on upstream document quality and segmentation. In practice-focused ecosystems such as [LangChain](https://github.com/langchain-ai/langchain) and [LlamaIndex](https://github.com/run-llama/llama_index), recurring discussions about loaders and preprocessing pipelines repeatedly surface ingestion as a major source of instability. Fowler's framing of LLM-era software as nondeterministic computing is also useful here because it pushes teams to think in terms of tolerances and operational boundaries rather than idealized one-shot extraction.

---

### PDF Format Pathology

Technical discussions across PDF libraries repeatedly emphasize a difficult but important fact: PDF is a rendering instruction format, not a semantic document format. Reading order is often implicit and must be reconstructed heuristically, hybrid PDFs may combine vector text layers and embedded scans, and malformed object streams are common in enterprise archives. These characteristics help explain why deterministic and universally reliable PDF extraction remains structurally difficult.

---

### Durable Workflow Architectures

[Temporal](https://temporal.io) and other durable workflow systems are increasingly used to isolate long-running or failure-prone processes such as document ingestion, OCR, and large-scale re-indexing. The separation between interactive ingestion paths and delegated asynchronous workflows is increasingly becoming a standard production pattern in serious RAG systems.

---

Across these references, a consistent pattern emerges: document ingestion is heterogeneous, failure-prone, and dominated by trade-offs between latency, fidelity, and computational cost. The architectural stance described in this article aligns with this broader evolution in AI system design rather than representing an isolated or unconventional approach.
