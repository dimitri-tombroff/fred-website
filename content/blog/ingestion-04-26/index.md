---
title: "Comparing Graph-Centric and Reflective RAG Agents in Fred"
description: "Richard (GraphRAG) and Rico (reflective RAG) compared in Fred’s agentic backend, including faithfulness and relevancy results."
summary: "A comparison of Fred’s graph-centric RAG agent (Richard) and reflective RAG agent (Rico), including architecture and evaluation metrics."
date: 2026-04-13T12:07:05+01:00
draft: false
weight: 1
categories: [agents, architecture]
tags:
  - rag
  - graphrag
  - graph
  - langgraph
  - agentic
contributors: [Odelia Cohen]
pinned: false
homepage: false
seo:
  title: "Comparing Graph-Centric and Reflective RAG Agents in Fred"
  description: "Richard (GraphRAG) and Rico (reflective RAG) compared in Fred’s agentic backend, including faithfulness and relevancy results."
  canonical: "https://fredk8.dev/blog/richard-vs-rico-agentic-duel"
  robots: "index, follow"
---

Extending Beyond Text: Why Rich Mode Was Needed
In a RAG system, a fundamental constraint quickly emerges: everything must ultimately be reduced to text.

Retrieval relies on textual representations, vectorization indexes text, and language models primarily reason over text. This means that even when documents contain rich visual elements — slides, diagrams, screenshots — those elements must be transformed into text (via OCR, captions, or descriptions) to become usable.

Medium mode was designed to address this limitation. By introducing a vision layer during ingestion, it improves the quality of extracted content and enriches the textual representation of documents. In practice, this leads to better structure, better segmentation, and more informative chunks.

However, this approach remains fundamentally constrained.

No matter how advanced the vision enrichment becomes, the system still operates within a text-first paradigm. Visual information is translated, compressed, and approximated into text before being used. This introduces an unavoidable loss of fidelity.

This is the limit we wanted to challenge.

To better understand its impact, we conducted an internal benchmark comparing two approaches:

a direct multimodal pipeline (image → multimodal model)
a two-step pipeline (image → vision model → text → LLM)
The results were unambiguous.

The direct multimodal pipeline consistently outperformed the caption-based approach:

higher accuracy (0.90 vs 0.60)
better grounding in the image (1.93 vs 1.47)
higher visual fidelity (1.77 vs 1.13)
lower latency (4.35s vs 5.05s)
Beyond the numbers, the qualitative analysis revealed the core issue: transforming an image into text introduces interpretation bias. Even when correct, the intermediate description tends to enrich or reinterpret the image, injecting information that is not strictly present. This bias propagates into the final answer and degrades its fidelity.

In other words, improving the text is not enough if the problem comes from reducing the image to text in the first place.

This observation led to a shift in approach.

Rather than continuing to refine the transformation of images into text, Rich mode introduces a different paradigm: reintroducing the image itself at inference time.

Instead of relying solely on a textual approximation, the system preserves visual assets during ingestion, links them to textual chunks, and propagates this information through the retrieval pipeline. When relevant, these images can then be re-injected into the multimodal model during answer generation.

This allows the system to combine two complementary strengths:

the scalability and efficiency of text-based retrieval
the fidelity and grounding of direct visual understanding
Rich mode does not replace the existing RAG pipeline. It extends it.

It acknowledges a structural limitation of text-based systems and introduces a controlled way to bypass it, using images as high-fidelity evidence when needed.

In that sense, Rich mode is not just a more advanced ingestion strategy. It is a shift in how information is preserved, retrieved, and ultimately used by the system.