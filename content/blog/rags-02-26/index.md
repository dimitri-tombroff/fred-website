---
title: "Document Ingestion Is Not a Side Effect"
date: 2026-02-14T10:00:00+02:00
summary: "Why an agentic platform must treat document ingestion as a first-class architectural concern — and why fast attachment is not the same as durable corpus ingestion."
draft: false
weight: 5
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

Building an agentic platform inevitably means dealing with documents.  
PDFs, DOCX files, slide decks, scanned reports, internal exports, semi-corrupted archives.

At first glance, document ingestion looks like plumbing — something that should “just work”. In practice, it becomes one of the most structurally complex parts of the system.

This article is a return on experience. 

---

## The Illusion of Simple RAG

In notebooks, RAG looks straightforward:

1. Load document  
2. Split text  
3. Embed  
4. Retrieve  

In production, the first step is where everything begins to fracture.

Real-world documents:

- Contain broken encodings  
- Use inconsistent layouts  
- Embed images instead of text  
- Mix vector graphics and partial OCR layers  
- Include malformed PDF instructions  
- Contain tables that do not map cleanly to text  

Libraries such as:

- `unstructured`
- `docling`
- `pdfminer`
- `PyMuPDF`
- `pandoc`
- `markitdown`

all make trade-offs. Some are fast but brittle. Some are powerful but heavy. Some silently fall back to OCR. Some return empty results without failing loudly.

This is not a Fred-specific problem. It is a structural property of document processing.

---

## The Key Realization

We progressively understood something fundamental: Document ingestion is not a utility. It is an architectural layer.

If ingestion is treated as a side effect, the entire RAG pipeline becomes fragile.
If ingestion is explicit, observable, and mode-driven, the system becomes predictable.

---

## Three Ingestion Modes in Fred

In the Fred UI and backends, ingestion now exposes three modes: Fast, Medium and Rich. This is not cosmetic. It encodes architectural intent.

### Fast

The Fast mode is used for:

- File attachments inside conversations
- Quick previews
- Immediate agent interactions

Characteristics:

- Lightweight custom parsers
- No OCR
- No layout reconstruction
- Strict truncation
- Deterministic runtime

Fast mode prioritizes latency and stability. It accepts reduced fidelity.
Attaching a file in a conversation is not equivalent to ingesting it into a long-lived knowledge corpus.

This distinction matters.

---

### Medium

Used for:

- Structured documents requiring better segmentation
- Controlled layout parsing
- Improved table handling

Characteristics:

- More advanced parsing libraries
- Still bounded runtime
- Partial layout awareness

Medium mode trades time for improved structure.

---

### Rich

Used for:

- High-value corpora
- Complex PDFs
- Documents where layout fidelity matters

Characteristics:

- Heavy parsers
- Possible OCR
- Full layout reconstruction
- Potential minutes of processing

Rich mode is not interactive. It is delegated.

---

## Temporal as a Structural Boundary

A key architectural decision in Fred is the use of Temporal. Medium and Rich ingestion are executed by Temporal workers.

This has several implications:

- Long-running extraction does not block user flows.
- Failures are durable and retryable.
- Ingestion becomes observable.
- Processing time becomes an explicit cost.

Temporal forces us to acknowledge that ingestion is a workflow, not a function call. That distinction changes everything.

---

## The Human Factor

One of the hardest aspects is user expectation.

Users intuitively assume: Uploading a document → instant usable knowledge.

But the reality is:

- Fast mode provides quick access.
- Rich ingestion may take minutes.
- Some documents will partially fail.
- Some will require normalization.
- Some are simply malformed.

Part of our responsibility is educational. Users must understand than attaching a file in a conversation is not the same as building a durable semantic corpus.

Pretending otherwise creates frustration. Explaining the trade-off builds trust.

---

## We Are Not Alone

These challenges are widely discussed in:

- unstructured issue trackers
- docling discussions
- pdfminer and PyMuPDF bug reports
- RAG-in-production talks (2024–2026)
- LangChain document loader debates

A common pattern appears across teams: The hardest part of RAG is not retrieval.  
It is ingestion.

The community increasingly recognizes that reliable document processing requires multi-tier architectures, asynchronous workflows, and explicit cost models.

---

## What We Learned

1. No single library is sufficient.
2. “Fast” must be deterministic.
3. Heavy extraction must be delegated.
4. OCR should never be implicit.
5. Users must see the trade-off.
6. Ingestion deserves architectural status.

We try to make Fred honest about the problem.

---

## Conclusion

An agentic platform that treats document ingestion as a side effect will eventually suffer instability.

An agentic platform that treats document ingestion as a first-class architectural concern can make trade-offs explicit.

Fred chose the second path not because it is simpler but because it is more realistic.

## Related Work

The challenges described in this article are not specific to Fred. They reflect structural properties of document formats, PDF rendering models, and production-grade Retrieval-Augmented Generation (RAG) systems. The following projects, publications, and community discussions illustrate how widely shared these difficulties are.

### Document Parsing and Layout Reconstruction

**Unstructured-IO.**  
_Unstructured: Open-source document parsing for LLM pipelines._  
https://github.com/Unstructured-IO/unstructured  

Unstructured provides modular document partitioning strategies such as `fast`, `hi_res`, and `auto`. Public issue discussions frequently highlight edge cases including malformed PDFs, OCR fallback behavior, and empty extraction results under certain strategies.

**DS4SD.**  
_Docling: Document Layout Intelligence._  
https://github.com/DS4SD/docling  

Docling focuses on layout-aware document reconstruction. It demonstrates that higher structural fidelity often comes at the cost of increased computational complexity and processing time.

**PyMuPDF (Fitz).**  
https://github.com/pymupdf/PyMuPDF  

A fast and widely adopted PDF processing library. Its issue tracker documents common PDF irregularities, encoding inconsistencies, and rendering operator errors that complicate deterministic text extraction.

**pdfminer.six.**  
https://github.com/pdfminer/pdfminer.six  

A long-standing PDF parsing library in Python. Community discussions reveal challenges related to font encoding, malformed object streams, and ambiguous text ordering.

**Apache Tika.**  
https://tika.apache.org  

An enterprise-grade toolkit for multi-format document extraction. Its architectural complexity reflects the inherent difficulty of building reliable ingestion pipelines across heterogeneous formats.

**Pandoc.**  
https://pandoc.org  

A universal document converter frequently used for DOCX and PPTX to Markdown transformations. Discussions around format fidelity and structural inconsistencies illustrate the trade-offs involved in office document conversion.

---

### Retrieval-Augmented Generation and Ingestion Pipelines

**Asai et al. (2023).**  
_Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection._  
https://selfrag.github.io/  

This work demonstrates that retrieval performance depends strongly on document segmentation quality and structural integrity, indirectly reinforcing the importance of ingestion fidelity.

**LangChain.**  
https://github.com/langchain-ai/langchain  

Community discussions around document loaders reveal practical inconsistencies across formats and underline ingestion as a dominant source of instability in RAG systems.

**LlamaIndex.**  
https://github.com/run-llama/llama_index  

LlamaIndex emphasizes ingestion abstractions and preprocessing pipelines, reflecting an architectural recognition that document normalization must precede embedding and retrieval.

---

### PDF Format Pathology

Technical discussions across PDF libraries (2023–2026) repeatedly emphasize that:

- PDF is a rendering instruction format, not a semantic document format.
- Logical reading order is often implicit and must be reconstructed heuristically.
- Hybrid PDFs may contain both vector text layers and embedded image scans.
- Incremental updates and malformed object streams are common in enterprise documents.

These characteristics explain why deterministic and universally reliable PDF extraction remains structurally difficult.

---

### Durable Workflow Architectures

**Temporal Technologies.**  
https://temporal.io  

Durable workflow engines such as Temporal are increasingly used to isolate long-running or failure-prone processes including document ingestion, OCR, and large-scale re-indexing. The separation between interactive ingestion paths and delegated asynchronous workflows is becoming a recognized architectural pattern in production RAG systems.

---

Across these references, a consistent pattern emerges: document ingestion is heterogeneous, failure-prone, and dominated by trade-offs between latency, fidelity, and computational cost. The architectural stance described in this article aligns with this broader evolution in AI system design rather than representing an isolated or unconventional approach.
