---
title: "Governed Knowledge for People and Agents: Keeping Authority Separate from Retrieval"
slug: "knowledge-management"
description: "Why authority over shared knowledge belongs in an explicit governance layer, why retrieval engines should be rebuildable projections of it, and how Fred applies this design."
summary: "Indexing an organization's files makes them searchable; it does not make their content authoritative. We argue that decisions about access, publication, evidence and review belong in an explicit governance layer, and that full-text, vector, graph and wiki engines should be rebuildable projections of it. We review the database, search and agent-memory work behind this design, discuss Open Knowledge Format as an exchange format, propose an evaluation method, and describe the current state of Fred."
date: 2026-11-22T05:00:00+01:00
lastmod: 2026-11-23T07:00:00+01:00
draft: false
paper:
  status: "Working draft"
  version: "0.3"
weight: 50
categories: [architecture, research]
tags: [knowledge-management, governance, access-control, retrieval, provenance, okf, graphrag, llm-wiki]
contributors:
- Maxime Daragon
- Dimitri Tombroff
- Fred Team
pinned: false
homepage: false
seo:
  title: "Governed Knowledge for People and Agents: Keeping Authority Separate from Retrieval"
  description: "Authority over shared knowledge belongs in a governance layer; retrieval engines should be rebuildable projections of it. Evidence, an exchange format, an evaluation method and Fred's current state."
---

Most enterprise knowledge lives in files: PDFs, spreadsheets, slide decks and office
documents, written by different people for different purposes. Indexing these files
makes them searchable. It does not tell a reader, or an agent, which of them is current,
which one the organization stands behind, or what evidence supports a statement.

In 1945, Vannevar Bush described a different model, the memex: records connected by
explicit trails that a person builds and can share with others
([Bush, 1945](https://www.theatlantic.com/magazine/archive/1945/07/as-we-may-think/303881/)).
Language models make it cheaper to draft and link such records. They do not make anyone
accountable for them. An organization still has to decide what is published, what
evidence supports it and when it must be reviewed. Even a fully reliable agent could not
take these decisions on the organization's behalf, and current agents are not fully
reliable. Durable knowledge therefore needs a medium that people and agents can both
read, in which people take the decisions and can trace them.

This paper argues for one design principle: **authority over shared knowledge should be
held by an explicit governance layer, and retrieval engines should be projections of
that layer.** The governance layer records who may read a piece of knowledge, who
published it, on what evidence, and until when it should be trusted. Full-text indexes,
vector indexes, knowledge graphs and compiled wikis then become interchangeable ways to
find that knowledge: each is rebuilt from the governance layer and compared with the
others on measured results.

The principle applies to knowledge whose content the governance layer holds. Some
knowledge bases are fed from an external source of record, for example a graph built
from a team's existing wiki. There the source, not the governance layer, remains the
authority over the content; the governance layer can still decide where such a knowledge
base is deployed, who may query it and when it is retired. This weaker form of
governance is work in progress, and we return to it briefly in Section 6.

Section 1 explains why retrieval alone does not establish authority. Section 2 shows
that separating an authoritative catalog from derived indexes is an established pattern
in databases and search engines. Section 3 reviews recent work on retrieval engines and
agent memory. Section 4 discusses Open Knowledge Format as a portable exchange format.
Section 5 proposes a way to evaluate a knowledge base. Section 6 describes how Fred, an
open-source agent platform, applies this design today.

## 1. Retrieval does not establish authority

An agent typically alternates reasoning steps with tool calls, such as a search or a
database query ([Yao et al., 2023](https://arxiv.org/abs/2210.03629)). The quality of
its answers depends on the model, on its tools and on the evidence those tools can
reach. Retrieval-augmented generation brings external documents into the model's context
before it answers ([Lewis et al., 2020](https://arxiv.org/abs/2005.11401)). It selects
documents by their relevance to the question. Relevance does not say whether a document
is current, whether it is the organization's reference, or whether this person may read
it.

Larger context windows do not remove the need to select. There is no fixed size at which
a knowledge base stops fitting: document length, model behavior, cost and the task all
matter. Loading relevant material on demand is a practical way to manage this tradeoff
([Anthropic, 2025](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents)).
Retrieval therefore stays in the path of most answers, and the question becomes what it
retrieves from.

Language models can also help maintain a knowledge base: summarizing documents,
proposing links, pointing out gaps. Their output still needs checking. The cost of
model-assisted curation includes generation, human review and later corrections. A
governance layer should record that work, so that a reader can see what was reviewed and
by whom.

## 2. Authority and indexes: an established separation

Controlling who may read what, while keeping search fast, is not a new problem.
Databases and search engines have addressed it for decades, and their designs share one
separation: a single authoritative record, and indexes derived from it.

Relational databases keep a catalog that describes the data, and treat indexes as access
paths that the system maintains from that data
([Hellerstein et al., 2007](https://dsf.berkeley.edu/papers/fntdb07-architecture.pdf)).
Enterprise search engines had to decide where to enforce document permissions. Copying
permissions into the index makes queries fast, but every change to an access rule then
requires an index update; when content, permissions and index are updated separately,
they drift apart ([Bailey et al., 2006](https://doi.org/10.1145/1183614.1183686);
[Kleppmann, 2015](https://martin.kleppmann.com/2015/05/27/logs-for-data-infrastructure.html)).
Filtering results after retrieval avoids that update but is unsafe: in a shared
full-text index, ranking statistics can reveal documents the user cannot open
([Büttcher & Clarke, 2005](https://www.usenix.org/conference/fast-05/security-model-full-text-file-system-search-multi-user-environments)).
In vector search, filtering after retrieval can also return too few results when the
filter is selective ([Patel et al., 2024](https://arxiv.org/abs/2403.04871)).

The common answer is to keep one authority and derive the rest. Large authorization
systems evaluate access decisions in a dedicated, consistent service, separate from the
applications that store content
([Pang et al., 2019](https://www.usenix.org/conference/atc19/presentation/pang)).
Indexes are derived data: they can be deleted and rebuilt from the system of record
([Kleppmann, 2017](https://oreilly.com/library/view/designing-data-intensive-applications/9781491903063/part03.html)).

Applied to shared knowledge, this gives a simple structure. A catalog, typically in a
relational database, records spaces (an organization, a team, a project), their members,
the pages each space owns and the review state of each page. A query first asks the
catalog which spaces the person may read, and only then searches. A change of membership
updates the catalog, not the indexes.

Two index layouts satisfy this rule, with different tradeoffs. With one index per space,
documents outside the person's spaces never take part in ranking; the cost is that a
query spanning several spaces must merge results from several indexes, whose scores are
not directly comparable. With one shared index, each entry carries its space and the
query is restricted to the authorized spaces. Results then merge naturally, but the two
risks above must be handled: the restriction must apply inside the search, not to its
results, and ranking must not depend on statistics computed over documents the person
cannot read. The second risk concerns full-text scores such as BM25, which use
collection statistics, more than vector similarity, which compares the query with each
entry alone.

## 3. What recent work says about retrieval engines

Retrieval engines differ in what they make easy to find, and recent work shows that none
of them is best in every case.

**Graphs help with some questions, not all.** GraphRAG extracts entities and
relationships from a collection and summarizes groups of related entities, to answer
questions about the collection as a whole
([Edge et al., 2024](https://arxiv.org/abs/2404.16130)). A comparative study finds that
graph-based retrieval does not consistently outperform standard retrieval; the outcome
depends on the questions and on the corpus
([Xiang et al., 2026](https://arxiv.org/abs/2506.05690)). Later GraphRAG work at
Microsoft Research evaluates both the retrieved evidence and the final answers,
including how well answers cover the topics of a collection
([Microsoft Research, 2026](https://www.microsoft.com/en-us/research/story/the-evolution-of-graphrag-advancing-systems-and-evaluation-together/)).

**Compiled wikis can complement search.** Anthropic reports an experiment in which it
built a linked wiki over internal company documents. On 25 questions, wiki and search
together performed better than either alone and reduced token use at query time
([Anthropic, 2026](https://www.anthropic.com/research/components-of-agent-memory)). This
is a small evaluation reported by the vendor. It supports trying the approach, and it
suggests keeping access to the source documents alongside the synthesized pages.

**Time and provenance need explicit treatment.** Zep's memory graph records when a fact
holds separately from when the system learned it
([Rasmussen et al., 2025](https://arxiv.org/abs/2501.13956)). Quipu explores admission
checks and governance of history in a bitemporal knowledge-graph store; its preprint
reports results on bounded benchmarks, not a guarantee for production use
([Brown, 2026](https://arxiv.org/abs/2608.16813)).

These results depend on the corpus, the questions and the evaluation. A governance layer
that does not depend on any engine lets an organization test several engines on the same
knowledge, under the same access rules, and keep the one that performs best on its own
questions. It also allows simple measures first: page revisions, source references and
review dates already capture part of what temporal models represent.

## 4. A portable format for governed knowledge

If engines are interchangeable, the knowledge itself needs a format that belongs to none
of them. Open Knowledge Format (OKF), introduced by Google Cloud, represents knowledge as
Markdown files with YAML front matter and ordinary links
([Open Knowledge Format, 2026](https://github.com/open-knowledge-format/open-knowledge-format/blob/527e81aff55992be21507e97004286789126f88c/SPEC.md)).
Version 0.3, announced in November 2026, came with a dedicated GitHub organization,
use-case guides and skills for producing and consuming bundles
([Google Cloud, 2026](https://cloud.google.com/blog/products/data-analytics/introducing-okf-v0-3)).

Adoption is early. Independent tools exist, such as the OKF v0.2 starter pack and
validation plugin documented by OpenKnowledge
([OpenKnowledge, n.d.](https://openknowledge.ai/docs/workflows/supporting-open-knowledge-format)),
and they support different versions. Before version 1.0, a minor release can change
semantics, so an implementation should state the version it supports.

A controlled study gives a useful counterpoint. On one regulatory document and 93
questions, the OKF representations it tested did not improve answer correctness over a
strong retrieval baseline ([Abhinav, 2026](https://doi.org/10.2139/ssrn.7227678)). The
study is a preprint; the bundles it tests reproduce the document's text rather than
curate it, and its answer keys have not yet been validated by blinded human reviewers.
It cannot settle the value of curated wikis. It does show that portability and retrieval
quality must be evaluated separately.

For governance, the meaning of trust fields matters more than the syntax. Publishing a
page records a decision to share it; it does not mean its content was checked. A
`verified` status should record an actual confirmation of the content against evidence,
and a review of the metadata alone should not mark the whole page as verified. A
`stale_after` date means the content needs another check, not that it is false. When
knowledge moves between systems, an imported `verified` flag records the other system's
decision; it should not become a local verification.

## 5. Evaluating a knowledge base

An added representation, whether a graph, a wiki or an embedding index, should earn its
place through measurements on the organization's own questions. We propose the following
method.

Questions are written independently of the pages and their summaries, so that they do
not reuse the wording of the answer. They include changes of terminology, more than one
language, evidence spread across several pages, decisions that were later superseded,
and questions the knowledge base cannot answer. Each engine is compared with current
behavior and with a plain lexical baseline, with the model and the context budget held
fixed.

Retrieval is measured separately from the answer: did the system find the right
evidence, is the answer correct, do its citations support it, and does it abstain when
it should? Latency and token use matter, as do the costs of creating, reviewing and
maintaining the pages.

Three questions remain open: how to detect knowledge that needs revision, how to route a
contradiction to the people who can resolve it, and when page-level provenance is not
precise enough. They may justify temporal models or specialized engines later. They do
not need to be solved before a simpler knowledge base proves useful.

## 6. Current state in Fred

Fred is an open-source agent platform under the Apache 2.0 license. Its current version,
Fred v5, applies the separation described in Section 2. People hold roles directly
in an organization, team, project or personal space; the hierarchy of spaces does not by
itself grant access to another space's content. The Control Plane makes authorization
decisions, PostgreSQL holds the catalog and protects its consistency, and search indexes
are never used to decide access
([Fred contributors, 2026a](https://github.com/ThalesGroup/fred/blob/weaver/docs/architecture/README.md)).

For documents, Fred v5 uses the shared layout of Section 2: one vector index for all
spaces, in which each entry carries its space. The spaces a person may read come from
the Control Plane, and the restriction is applied inside the nearest-neighbour search,
not to its results. Full-text and hybrid scores in this shared index still use
collection statistics, the residual risk noted in Section 2. The Wiki search described
below ranks with PostgreSQL's `ts_rank_cd`, which uses only the page and the query.

The Wiki publication flow separates proposals from shared content. An agent's proposal
requires confirmation by the person it works for; the space's editor then accepts or
refuses it. An editor's own proposal is accepted immediately. Accepted content keeps its
authorship and provenance when the conversation it came from is deleted
([Fred contributors, 2026b](https://github.com/ThalesGroup/fred/blob/weaver/docs/architecture/05-documents.md)).
This history records publication decisions; it does not prove that every statement was
checked.

{{< mermaiddiagram >}}
flowchart TB
    work["People and agents<br/>draft knowledge"]
    proposal["Proposal<br/>person confirms agent submissions"]
    review["Space editor<br/>accepts or refuses"]
    wiki["Shared Wiki<br/>content and provenance"]
    readers["People and agents<br/>read and reuse"]
    work --> proposal --> review --> wiki --> readers
    classDef neutral fill:#F1F5F9,stroke:#64748B,color:#0F172A
    classDef fred fill:#DBEAFE,stroke:#2563EB,color:#172554
    class work,readers neutral
    class proposal,review,wiki fred
{{< /mermaiddiagram >}}

*The Wiki publication flow in Fred. A planned verification status will record what was
checked, separately from the decision to publish.*

Work on a searchable Wiki, sized for several hundred pages per space, is under way on a
development branch. Each step is implemented, tested and reviewed on its own; none is in
a release yet.

**Implemented on the development branch:**

- **Page format.** A page can carry an
  [OKF v0.3](https://github.com/open-knowledge-format/open-knowledge-format/blob/527e81aff55992be21507e97004286789126f88c/SPEC.md)
  header: a type from a small native vocabulary (topic, procedure, decision, reference,
  source, hub), a one-line description, tags, source references and an optional review
  date. A small Rust library validates the header on every write, preserves fields it
  does not know and leaves the page body unchanged byte for byte. Pages that people
  write without a header remain valid.
- **Search.** One bounded search endpoint over published pages, in French and English,
  using PostgreSQL full-text search. Each result gives the page type, its description and
  an excerpt. The index is a projection of the catalog: it is written in the same short
  transaction as publication, rebuilt from the catalog when its format changes, and
  every hit is checked against the page's current revision before it is returned. On
  synthetic data, the database query takes about 24 ms at the 99th percentile for pages
  of 2,500 characters and 172 ms for pages of 50,000 characters; these figures exclude
  the rest of the request and are not end-to-end response times.
- **Agents.** Agents with access to the Wiki can search it, and are guided to search
  before reading pages, whether they only read or also propose changes. Their proposals still go through the confirmation
  described above.
- **Authoring.** People edit a page either as complete Markdown or in a visual editor,
  where the server validates the type, description and tags.

The page format has passed an end-to-end test on a local deployment; search, agents and
authoring are awaiting that test.

**Next steps, in this order:**

- **Evaluation**, following Section 5: about 300 realistic pages and questions written
  independently of them, compared with current behavior and a lexical baseline, before
  any further feature.
- **People:** search and page headers in the interface, and a content-verification
  status kept separate from the decision to publish.
- **Curation:** one list of untyped pages, missing descriptions, descriptions left
  unchanged after the body changed, and overdue reviews. Agents propose header changes
  without touching the body.
- **Links and backlinks**, resolved to pages so that renaming a page breaks no link.
- **Exchange:** OKF export and import. Imported pages arrive as proposals, and imported
  verification claims are kept as the other system's decision, not converted into Fred
  verification.

Vector indexes, engines with their own stores and automatic background curation are not
part of this work. They will be decided by an evaluation following Section 5.

Knowledge bases fed from an external source of record are a separate line of work,
still under discussion. In the design we are exploring, Fred would govern their
placement in a space, access to them and their retirement, but would not read their
content; agents would query them through their own tools, and the external source would
remain the authority over what they contain. These are reflections in progress, not
commitments.

We invite researchers and engineering teams to bring concrete use cases, challenge these
choices and contribute reproducible comparisons
[on GitHub](https://github.com/ThalesGroup/fred).

## References

- Abhinav, K. (2026). *Does Google's Open Knowledge Format Improve RAG? A Controlled
  Evaluation* [Preprint, not peer reviewed]. SSRN.
  [doi:10.2139/ssrn.7227678](https://doi.org/10.2139/ssrn.7227678). Code, data and model
  outputs: [okf-vs-rag-evaluation](https://github.com/Abhinav0905/okf-vs-rag-evaluation).
- Anthropic (Rajasekaran, P., Dixon, E., Ryan, C., & Hadfield, J.). (2025, September 29).
  *Effective context engineering for AI agents*. Anthropic Engineering.
  [anthropic.com](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents)
- Anthropic (Martin, L.). (2026, November 6). *The components of agent memory*.
  Anthropic Engineering. [anthropic.com](https://www.anthropic.com/research/components-of-agent-memory)
- Bailey, P., Hawking, D., & Matson, B. (2006). Secure search in enterprise webs: tradeoffs
  in efficient implementation for document level security. In *Proceedings of the 15th ACM
  International Conference on Information and Knowledge Management (CIKM '06)*. ACM.
  [doi:10.1145/1183614.1183686](https://doi.org/10.1145/1183614.1183686)
- Brown, S. (2026). *Quipu: A Governed Bitemporal Knowledge Graph Store* [Preprint].
  [arXiv:2608.16813](https://arxiv.org/abs/2608.16813).
- Bush, V. (1945, July). As We May Think. *The Atlantic*.
  [theatlantic.com](https://www.theatlantic.com/magazine/archive/1945/07/as-we-may-think/303881/)
- Büttcher, S., & Clarke, C. L. A. (2005). A Security Model for Full-Text File System
  Search in Multi-User Environments. In *Proceedings of the 4th USENIX Conference on File
  and Storage Technologies (FAST '05)* (pp. 169–182). USENIX.
  [usenix.org](https://www.usenix.org/conference/fast-05/security-model-full-text-file-system-search-multi-user-environments)
- Edge, D., Trinh, H., Cheng, N., Bradley, J., Chao, A., Mody, A., Truitt, S.,
  Metropolitansky, D., Ness, R. O., & Larson, J. (2024). *From Local to Global: A Graph
  RAG Approach to Query-Focused Summarization* [Preprint].
  [arXiv:2404.16130](https://arxiv.org/abs/2404.16130).
- Fred contributors. (2026a). *Fred architecture*. Fred documentation, Fred v5.
  [GitHub](https://github.com/ThalesGroup/fred/blob/weaver/docs/architecture/README.md)
- Fred contributors. (2026b). *Documents and knowledge*. Fred documentation, Fred v5.
  [GitHub](https://github.com/ThalesGroup/fred/blob/weaver/docs/architecture/05-documents.md)
- Google Cloud (McVeety, S., & Hormati, A.). (2026, November 19). *What's new in OKF v0.3:
  enterprise-ready knowledge, use cases, and skills*. Google Cloud Blog.
  [cloud.google.com](https://cloud.google.com/blog/products/data-analytics/introducing-okf-v0-3)
- Hellerstein, J. M., Stonebraker, M., & Hamilton, J. (2007). Architecture of a Database
  System. *Foundations and Trends in Databases*, 1(2), 141–259.
  [PDF](https://dsf.berkeley.edu/papers/fntdb07-architecture.pdf)
- Kleppmann, M. (2015, May 27). *Using logs to build a solid data infrastructure (or: why
  dual writes are a bad idea)*.
  [martin.kleppmann.com](https://martin.kleppmann.com/2015/05/27/logs-for-data-infrastructure.html)
- Kleppmann, M. (2017). *Designing Data-Intensive Applications*. O'Reilly Media. Part III,
  "Derived Data".
  [oreilly.com](https://oreilly.com/library/view/designing-data-intensive-applications/9781491903063/part03.html)
- Lewis, P., Perez, E., Piktus, A., Petroni, F., Karpukhin, V., Goyal, N., Küttler, H.,
  Lewis, M., Yih, W., Rocktäschel, T., Riedel, S., & Kiela, D. (2020). Retrieval-Augmented
  Generation for Knowledge-Intensive NLP Tasks. In *Advances in Neural Information
  Processing Systems 33 (NeurIPS 2020)*. [arXiv:2005.11401](https://arxiv.org/abs/2005.11401).
- Microsoft Research. (2026). *The evolution of GraphRAG: Advancing systems and evaluation
  together*. Microsoft Research Stories.
  [microsoft.com](https://www.microsoft.com/en-us/research/story/the-evolution-of-graphrag-advancing-systems-and-evaluation-together/)
- Open Knowledge Format. (2026). *Open Knowledge Format (OKF), Version 0.3* [Specification,
  commit 527e81a]. [GitHub](https://github.com/open-knowledge-format/open-knowledge-format/blob/527e81aff55992be21507e97004286789126f88c/SPEC.md)
- OpenKnowledge. (n.d.). *Supporting the Open Knowledge Format*. OpenKnowledge documentation.
  [openknowledge.ai](https://openknowledge.ai/docs/workflows/supporting-open-knowledge-format)
- Pang, R., et al. (2019). Zanzibar: Google's Consistent, Global Authorization System. In
  *Proceedings of the 2019 USENIX Annual Technical Conference (USENIX ATC '19)*
  (pp. 33–46). USENIX. [usenix.org](https://www.usenix.org/conference/atc19/presentation/pang)
- Patel, L., Kraft, P., Guestrin, C., & Zaharia, M. (2024). ACORN: Performant and
  Predicate-Agnostic Search Over Vector Embeddings and Structured Data. *Proceedings of
  the ACM on Management of Data (SIGMOD 2024)*, 2(3).
  [arXiv:2403.04871](https://arxiv.org/abs/2403.04871).
- Rasmussen, P., Paliychuk, P., Beauvais, T., Ryan, J., & Chalef, D. (2025). *Zep: A
  Temporal Knowledge Graph Architecture for Agent Memory* [Preprint].
  [arXiv:2501.13956](https://arxiv.org/abs/2501.13956).
- Xiang, Z., Wu, C., Zhang, Q., Chen, S., Hong, Z., Huang, X., & Su, J. (2026). *When to
  use Graphs in RAG: A Comprehensive Analysis for Graph Retrieval-Augmented Generation*
  (v3, February 22, 2026; first version June 2025) [Preprint].
  [arXiv:2506.05690](https://arxiv.org/abs/2506.05690).
- Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., & Cao, Y. (2023). ReAct:
  Synergizing Reasoning and Acting in Language Models. In *International Conference on
  Learning Representations (ICLR 2023)*. [arXiv:2210.03629](https://arxiv.org/abs/2210.03629).
