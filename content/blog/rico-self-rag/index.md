---
title: "Rico Learns to Reflect: Smarter Document Q&A with Self-RAG Techniques"
description: "Our RagsExpert agent, Rico, just got an upgrade. Inspired by Self-RAG, Rico now grade documents, rephrase questions, and retry intelligently to produce better answers."
summary: "Rico, the document expert agent in Fred, now leverages Self-RAG-inspired strategies to assess document quality, retry with smarter queries, and generate more accurate answers. This post explains the improvements."
date: 2025-08-05T17:00:00+02:00
lastmod: 2025-08-03T17:00:00+02:00
draft: false
weight: 45
categories: [agents, update]
tags:
  - langgraph
  - selfrag
  - document-agent
  - rag
  - vector-search
  - fred
  - open-source
  - knowledge-flow
contributors: [Romain Perennes]
pinned: false
homepage: false
seo:
  title: "Rico Learns to Reflect: Smarter Document Q&A with Self-RAG Techniques"
  description: "Explore how we improved Rico, the document expert agent in Fred, with Self-RAG ideas like document grading and answer self-evaluation using LangGraph."
  canonical: "https://fredk8.dev/blog/rico-selfrag-upgrade"
  robots: "index, follow"
---

> ⚠️ **Draft Notice**: *This post is a work in progress. Content may change significantly before publication*.

Rico — our document expert agent in the Fred platform — aims to help users find the right answers from their documents. But inspired by the [Self-RAG](https://selfrag.github.io/) project, we have just given Rico a significant brain upgrade.

Rico is no longer just a retriever and answerer — he’s now a *reflective* and *self-evaluating* agent, capable of retrying, rewriting, and grading his own work.

---

## A Smarter, Self-Aware Workflow

We redesigned Rico’s inner workings using [LangGraph](https://github.com/langchain-ai/langgraph), giving him a modular flow that mirrors how a thoughtful human would approach a question:

1. **Retrieve** relevant documents.
2. **Grade** them to filter noise.
3. **Generate** a draft answer.
4. **Grade** the answer — is it good enough?
5. **If not**, rephrase the question and try again.
6. **Fail gracefully** if all else fails.


{{< mermaiddiagram >}}
graph TD
  A[🔍 Retrieve Documents] --> B[🧪 Grade Documents]
  B -->|❌ No relevant| C[✏️ Rephrase Query]
  C --> A
  B -->|✅ Relevant| D[🧠 Generate Answer]
  D --> E[🧾 Grade Answer]
  E -->|👍 Useful| F[🏁 Finalize Success]
  E -->|👎 Not Useful| C
  E -->|🚫 Abort| G[❌ Finalize Failure]
  B -->|🚫 Abort| G

  classDef retrieve fill:#d0e1ff,stroke:#333,stroke-width:1.5px;
  classDef grade fill:#fff3cd,stroke:#333,stroke-width:1.5px;
  classDef generate fill:#d4edda,stroke:#333,stroke-width:1.5px;
  classDef retry fill:#f8d7da,stroke:#333,stroke-width:1.5px;
  classDef finalize fill:#e2e3e5,stroke:#333,stroke-width:1.5px;

  class A retrieve;
  class B grade;
  class D generate;
  class C retry;
  class E grade;
  class F,G finalize;
{{< /mermaiddiagram >}}

This design echoes the principles of the ReAct framework, where agents iteratively reason and act based on observations — except Rico’s actions are internal: filtering documents, retrying queries, and improving his own responses.
---

## What’s New?

> Document Grading

Before generating any answer, Rico checks whether the retrieved documents are actually useful. An LLM grader gives each document a binary “yes” or “no” based on its relevance. This prevents garbage-in, garbage-out situations.

> Self-Evaluation of Answers

After generating a draft, Rico uses a second grader to determine whether the answer resolves the user’s question. If not, he retries with a better version of the query — up to a configurable limit.

> Query Rewriting

Rico rewrites underperforming questions to improve retrieval, using a prompt optimized for semantic meaning. The language is preserved, but the structure is optimized for your vector database.

---

## Engineering Principles

All of this is implemented as a clean LangGraph state machine, where:

- Each node (e.g. `retrieve`, `grade_documents`, `generate`, etc.) is a typed async function.
- Transitions are governed by simple decisions: should we generate, retry, or abort?
- Document and answer grading use LLM-structured output (e.g. `GradeDocumentsOutput`, `GradeAnswerOutput`).
- Rico's reasoning and retry loop is inspired by [ReAct](https://arxiv.org/abs/2210.03629), where agents observe and reflect before deciding to continue or stop.


This makes Rico easy to extend, explainable, and testable — a key goal of the Fred platform. LangGraph enables this by making agent flows declarative, modular, and observable — ideal for capturing the kind of structured reflection introduced in [Self-RAG](https://arxiv.org/abs/2308.03286).

Rico now:
- *Better answers*: Self-filtering removes noise and retries when needed.
- *is more reliable*: Less likely to hallucinate from irrelevant data.
- *is closer to human-like reasoning*: Not just responding, but thinking before answering.

This update brings Rico closer to the vision behind Self-RAG: building agents that reflect, not just retrieve. ---

---

## Want to Try?

Rico is about to be shipped as default included in every Fred deployment.

- Just spin up the [Fred platform](https://github.com/ThalesGroup/fred)
- Ingest a docx or pdf document from Fred UI 
- Start asking questions — Rico will do the rest (and retry if needed)

You can even use your own grader models or fine-tune the prompts to match your domain.

---

## What’s Next?

Coming soon:

- Confidence scores and user-facing answer ratings
- Explainability metadata (why did Rico rephrase?)
- Integration with structured datasets, not just documents

Curious to build your own Self-RAG-inspired agent? Join us at [fredk8.dev](https://fredk8.dev).

---

## References

1. Shinn, N., Wang, J., Sanh, V., & Rush, A. M. (2023). Self-RAG: Learning to Retrieve, Generate, and Evaluate from Scratch. [arXiv:2308.03286](https://arxiv.org/abs/2308.03286)
2. Yao, S., Zhao, J., et al. (2022). ReAct: Synergizing reasoning and acting in language models. [arXiv:2210.03629](https://arxiv.org/abs/2210.03629)
3. LangGraph: A state-machine library for multi-step LLM flows. [GitHub](https://github.com/langchain-ai/langgraph)
