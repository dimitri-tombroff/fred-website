---
title: "Excel, but Agent-Ready: How Fred Turns Spreadsheets into Queryable Knowledge"
description: "Why Fred doesn't send your Excel files to a vision model, and how a deterministic extractor plus a document-centric tabular MCP let an agent understand a whole workbook and query it precisely — in one shot."
summary: "Excel is not a document — it's a data source wearing a document's clothes. Here is how Fred rebuilds the structure of a workbook deterministically, hands the agent a global map plus queryable tables, and adds a server-side value locator that collapses a dozen blind queries into a single targeted one."
date: 2026-07-24T08:00:00+02:00
lastmod: 2026-07-24T08:00:00+02:00
draft: false
weight: 50
categories: [data, agents, architecture]
tags:
  - excel
  - xlsx
  - tabular
  - duckdb
  - mcp
  - data-analysis
contributors:
  - Timothé Le Chatelier
pinned: false
homepage: false
seo:
  title: "Excel, but Agent-Ready: Deterministic Extraction and a Tabular MCP in Fred"
  description: "How Fred ingests Excel workbooks with a deterministic reconstruction pipeline instead of a vision model, exposes them through a document-centric tabular MCP, and locates values server-side to save round trips."
  canonical: "https://fredk8.dev/blog/excel-but-agent-ready"
  robots: "index, follow"
---

*Why Fred doesn't hand your Excel files to a vision model, and how a deterministic extractor plus a document-centric tabular MCP let an agent understand a whole workbook — then query it precisely, in one shot.*

{{< context >}}
This article builds on [From CSV to Agent: Tabular Data Gets Smart in Fred](https://fredk8.dev/blog/smart-tabular-data-agent/), which introduced Fred's DuckDB-backed tabular store and the Tessa agent. That post handled clean CSV files. This one is about the harder, messier reality: real Excel workbooks — with merged headers, subtotals, hidden sheets, and three tables stacked on one sheet — and how we make them agent-ready.
{{< /context >}}

---

## An Excel file is not a document

Everyone treats a spreadsheet as "a file you read." It isn't. A single workbook can hold, at the same time:

- clean data tables — the easy part;
- management reports with hierarchical headers, merged cells and subtotals;
- isolated notes, labels and KPIs floating in a corner;
- formulas that carry business logic as valuable as the numbers themselves;
- formatting — colours, indents, outline levels — that means something a raw text dump can't recover.

Feed that to a generic RAG pipeline that chunks-and-embeds everything, and you shred the one thing that made the file useful: its structure. A column and its header end up in different chunks; a subtotal reads like just another number. The market's usual answers — *dump the sheet as text into the prompt*, *chunk it like a PDF*, or *flatten it to one CSV* — all quietly destroy the table.

So before writing a line of code, we asked a blunt question: **what is the right way to exploit an Excel file for an agent?** We identified three candidate strategies.

---

## Three strategies on the table

{{< mermaiddiagram >}}
%%{init: {'theme':'neutral','flowchart':{'curve':'basis','htmlLabels':true,'wrappingWidth':360,'padding':16,'nodeSpacing':55,'rankSpacing':60}}}%%
flowchart LR
    XLS[["📊 Excel workbook"]]

    XLS --> A["<b>A · Deterministic reconstruction</b><br/>Parse with openpyxl,<br/>rebuild tables by rule"]
    XLS --> B["<b>B · Multimodal LLM (vision)</b><br/>Render each sheet as an image,<br/>let a model read it"]
    XLS --> C["<b>C · Excel agent with Skills</b><br/>Give an agent tools to<br/>navigate the workbook live"]

    A --> A1["✅ Reproducible · traceable · no LLM cost<br/>❌ Very atypical layouts defeat the rules"]
    B --> B1["✅ Captures visual meaning<br/>❌ Hallucinates on sparse tables · costly · non-deterministic"]
    C --> C1["✅ Maximally flexible<br/>❌ Unknown scaling · token blow-up · silent wrong answers"]

    classDef src fill:#1f2937,stroke:#111827,color:#ffffff;
    classDef good fill:#e8f6ee,stroke:#2f9e5b,color:#14532d,stroke-width:2px;
    classDef warn fill:#fdf5e0,stroke:#d69e2e,color:#7c5500;
    classDef risk fill:#fbe9e9,stroke:#d16565,color:#7a2020;
    classDef goodSoft fill:#f0faf3,stroke:#7fc9a0,color:#14532d;
    classDef warnSoft fill:#fdfaf0,stroke:#e6cd8f,color:#7c5500;
    classDef riskSoft fill:#fdf2f2,stroke:#e6a9a9,color:#7a2020;

    class XLS src;
    class A good;
    class B warn;
    class C risk;
    class A1 goodSoft;
    class B1 warnSoft;
    class C1 riskSoft;
{{< /mermaiddiagram >}}

**Strategy A — Deterministic reconstruction.** Parse the workbook programmatically, find the tables, rebuild their headers, propagate merged cells, normalise the types. It's reproducible, it costs nothing in tokens, and every decision it makes is logged and auditable. Its weakness: a genuinely bizarre layout can defeat the heuristics.

**Strategy B — Multimodal LLM (vision).** Render each sheet as an image and let a vision model extract the content. It captures visual cues a parser can't. But it hallucinates badly on sparse tables (a schedule that's 95% empty cells makes a model *invent* values to fill the gaps), it's expensive and slow on dense workbooks, and it's non-deterministic — two runs on the same sheet can disagree.

**Strategy C — Excel agent with Skills.** Give an LLM agent a toolbox to read cells, filter, sort and navigate the workbook itself. Maximally expressive — and maximally risky: nobody knows how it scales to a 50-sheet workbook, the token budget can explode, and an agent that can't find an answer tends to invent a plausible one rather than fail.

We chose **Strategy A** as the primary path — and this is where the interesting engineering lives.

---

## Why deterministic, when the industry reaches for the LLM

The fashionable move in 2026 is to throw everything at a large multimodal model. We deliberately went the other way, and the reasoning is worth stating plainly.

- **An LLM at ingestion time is a tax you pay on every file, forever.** A deterministic parser is written once and runs for free. For a workbook with twenty dense sheets, the vision route is hundreds of thousands of tokens per upload — the deterministic route is zero.
- **Ingestion must be reproducible.** If re-ingesting the same file can produce a different table, you can't trust anything downstream. Determinism isn't a nice-to-have here; it's the contract.
- **A wrong number is worse than a missing one.** A parser that can't understand a block *says so* and records it as an unextracted residual, with a coverage rate. A vision model fills the gap with a confident guess. In a data tool, silence beats a plausible lie.

The genuinely bold choice, though, isn't "parser over model." It's this: **Fred never vectorizes a spreadsheet.** Where a normal RAG stack embeds everything it can reach, Fred pulls Excel out of the document-embedding path entirely and routes it into a *SQL-indexed* path. A spreadsheet becomes queryable data, not searchable prose. That single decision is what makes precise, verifiable answers possible — and it's the opposite of what most RAG systems do with a tabular file.

---

## Part 1 — A custom extractor that rebuilds the workbook

The heart of the system is a purpose-built extractor. Its job: read a workbook the way a human sees it, find every table, and turn the whole thing into two complementary outputs — **one Markdown summary** that describes everything, and **one Parquet (or CSV) file per table** for precise querying.

{{< mermaiddiagram >}}
%%{init: {'theme':'neutral','flowchart':{'curve':'basis','htmlLabels':true,'wrappingWidth':360,'padding':16,'nodeSpacing':55,'rankSpacing':60}}}%%
flowchart TD
    XLS[["📊 workbook.xlsx"]] --> P

    subgraph P["🔧 The extractor"]
        direction TB
        A1["<b>Inventory</b> — list sheets, size, merges, hidden flags"]
        A2["<b>Read as displayed</b> — freeze formulas to values,<br/>hide what Excel hides, recalc via LibreOffice if stale"]
        A3["<b>Find the tables</b> — detect ‘islands’ of<br/>connected non-empty cells"]
        A4["<b>Split & label</b> — separate stacked tables,<br/>lift titles and label columns into context"]
        B1["<b>Orient & structure</b> — normal / transposed / cross-tab,<br/>propagate merged headers, name columns"]
        B2["<b>Clean & tag</b> — parse dates, trim values,<br/>attach provenance (file, sheet, cell range, title)"]
        A1 --> A2 --> A3 --> A4 --> B1 --> B2
    end

    P --> MD["📄 <b>output.md</b><br/>global map + SQL catalog<br/>+ coverage rate + residuals"]
    P --> PQ["🗂️ <b>one Parquet per table</b><br/>typed, queryable"]

    classDef src fill:#1f2937,stroke:#111827,color:#ffffff;
    classDef step fill:#eef2fb,stroke:#7c9fd6,color:#1c3d66;
    classDef map fill:#fdf5e0,stroke:#d69e2e,color:#7c5500,stroke-width:2px;
    classDef data fill:#e8f6ee,stroke:#2f9e5b,color:#14532d,stroke-width:2px;

    class XLS src;
    class A1,A2,A3,A4,B1,B2 step;
    class MD map;
    class PQ data;
    style P fill:#f7f9fd,stroke:#c3d2ea,color:#1c3d66;
{{< /mermaiddiagram >}}

A few of the moves that make it robust, in plain terms:

- **It sees what you see.** Formulas are frozen to their displayed values; cells hidden by number formatting, zeros hidden by a sheet setting, and error cells (`#N/A`, `#REF!`) are all treated as empty. If a workbook has stale formula values, the extractor quietly recalculates it with a headless LibreOffice before reading — which is also how legacy `.xls` files get supported.
- **It finds tables by geometry, not guesswork.** Treating the sheet as a grid of empty/non-empty cells, it groups adjacent filled cells into rectangular "islands." Empty rows and columns are natural fences. Three tables stacked on one sheet, separated by a full-width title bar? It splits them, promotes each title, and keeps going.
- **It records what it *couldn't* extract.** Every sheet gets a **coverage rate** (extracted cells ÷ non-empty cells) and a list of leftover blocks. A workbook that comes back at 30% coverage is a flag, not a silent failure.

The result is two things that serve two very different needs — and the split between them is the whole point.

---

## Part 2 — The Markdown map: giving the agent the big picture

The `output.md` file is not a data dump. It's a **catalog**: for every sheet, the tables it contains, each table's title, the surrounding context (the labels and notes that gave it meaning), its cell range, its column names, its row count, its coverage — and, crucially, the exact **SQL name** by which that table can be queried.

Here's a taste of what the agent reads:

```
# Extraction summary

## Sheet: Ventes 2026  (visible, coverage=94%)

Tables (2):
- "ventes_2026.t1"  query_alias="d_12345678_ventes_2026_t1"
    range=A3:F58  data_range=A4:F58  state=ok  rows=54
    title="Chiffre d'affaires par région"  context="Montants en k€ | HT"
    column_name: "Région" | "T1" | "T2" | "T3" | "T4"
- "ventes_2026.t2"  query_alias="d_12345678_ventes_2026_t2" ...

Unextracted residuals (1):
- range="A61"  type=note  value="Chiffres provisoires — révisés en mars"
```

This is the map an agent consults **first**. In one read, it knows what the whole workbook contains — how many tables, what they're about, what units, even the footnote warning that the figures are provisional — *without loading a single row of data*. It's the difference between handing someone a filing cabinet and handing them the index card that says exactly which drawer to open.

The Parquet tables, meanwhile, hold the actual rows — typed, clean, and ready to be queried by name.

---

## Part 3 — The tabular MCP, in plain terms

An **MCP** (Model Context Protocol) is simply the standardised way Fred hands an agent a toolbox it can call. The **tabular MCP** is the toolbox for *data*: **five read-only tools** sitting on top of an in-memory analytical engine (DuckDB) that mounts each Parquet table as a queryable view. It is deliberately **document-centric** — the agent reasons about *documents*, and the plumbing that one Excel workbook is really N tables stays hidden.

Here are the five tools, named exactly as a technical reader will find them in the code:

| Tool | What it does |
| --- | --- |
| `list_tabular_documents` | Lists the tabular sources the agent is allowed to see — one entry per document, with its tables. |
| `get_tabular_document_markdown` | Hands back the `output.md` map — the global picture of a workbook (Part 2). |
| `get_tabular_documents_schemas` | Returns the columns and types of one or several documents' tables. |
| `read_query` | Runs one read-only SQL query against the mounted tables. |
| `search_tabular_values` | Locates a value across every table at once (Part 4). |

The first four cover the everyday path — *understand, then query*. The fifth is a shortcut for a specific problem we'll get to in a moment. A typical question flows through the toolbox like this:

{{< mermaiddiagram >}}
%%{init: {'theme':'neutral','flowchart':{'curve':'basis','htmlLabels':true,'wrappingWidth':360,'padding':16,'nodeSpacing':55,'rankSpacing':60}}}%%
flowchart TD
    Q(["🧑 “Which region beat its Q3 target,<br/>and by how much?”"])

    Q --> L["<b>1 · List</b><br/>list_tabular_documents"]
    L --> U["<b>2 · Understand</b><br/>get_tabular_document_markdown<br/>+ get_tabular_documents_schemas"]
    U --> R["<b>3 · Query</b><br/>read_query — one targeted SQL"]
    R --> ANS(["✅ Data-backed answer<br/>no invented columns, no invented values"])

    U -. "‘where is value X?’" .-> S["🔎 search_tabular_values<br/><i>the locator — Part 4</i>"]
    S -. "then one targeted" .-> R

    classDef start fill:#e9f1fb,stroke:#3f7cc4,color:#1c3d66,stroke-width:2px;
    classDef tool fill:#eceafb,stroke:#6b5bd1,color:#2f2668;
    classDef locator fill:#fdf5e0,stroke:#d69e2e,color:#7c5500,stroke-width:2px;
    classDef done fill:#e8f6ee,stroke:#2f9e5b,color:#14532d,stroke-width:2px;

    class Q start;
    class L,U,R tool;
    class S locator;
    class ANS done;
{{< /mermaiddiagram >}}

1. **List** (`list_tabular_documents`) — what tabular sources am I allowed to see?
2. **Understand** (`get_tabular_document_markdown` + `get_tabular_documents_schemas`) — read the map and the schemas to learn what each table holds and what it's called.
3. **Query** (`read_query`) — run *one* read-only SQL query against the right table, addressed by its stable alias.

The fifth tool, `search_tabular_values`, slots in between *understand* and *query* whenever the question is really "*where* is this value?" — that's the whole of Part 4.

Because the query engine mounts a fresh, read-only connection per request over the Parquet files, the agent can compute — sums, filters, joins, averages — but can never mutate anything, and never sees data it isn't authorised to. Authorisation is checked once at the document level; the expansion into individual tables happens safely behind it.

The agent never guesses a column name or invents a value, because it read the schema first. That's the same trust loop that made Tessa reliable on CSVs — now extended to the full mess of real workbooks.

---

## Part 4 — Finding a value without a dozen blind queries

Here's a problem the map alone doesn't solve. Suppose you ask: *"Which sheet mentions supplier reference `FR-40871`?"* or *"Where does the amount `1 234,56 €` appear?"*

The catalog tells the agent what *columns* exist — but not which cell holds a specific *value*. On a workbook with twenty tables, a naive agent has only one option: brute-force it. Query table 1, look. Query table 2, look. Query table 3… Each attempt is a full round trip through the model — a whole reasoning turn spent, token budget burned — and it often ends without an answer.

That fan-out is exactly the wrong work to do inside the agent loop. So we pushed it down into the engine, as a dedicated tool: **`search_tabular_values`**.

{{< mermaiddiagram >}}
%%{init: {'theme':'neutral','flowchart':{'curve':'basis','htmlLabels':true,'wrappingWidth':360,'padding':16,'nodeSpacing':55,'rankSpacing':60}}}%%
flowchart TD
    subgraph OLD["❌ Without the locator — N model turns"]
        direction TB
        o0(["Find “FR-40871”"]) --> o1["query table 1 → miss"]
        o1 --> o2["query table 2 → miss"]
        o2 --> o3["query table 3 → miss"]
        o3 --> o4["… table N → maybe"]
    end

    subgraph NEW["✅ With search_tabular_values — 1 turn"]
        direction TB
        n0(["Find “FR-40871”"]) --> n1["<b>1 server-side scan</b><br/>all tables, all columns at once"]
        n1 --> n2["→ found in table 7,<br/>column “Réf. fournisseur”"]
        n2 --> n3["<b>1 targeted query</b> on table 7"]
    end

    classDef q fill:#f3f4f6,stroke:#9aa3af,color:#374151;
    classDef miss fill:#fbe9e9,stroke:#d16565,color:#7a2020;
    classDef hit fill:#e8f6ee,stroke:#2f9e5b,color:#14532d;

    class o0,n0 q;
    class o1,o2,o3,o4 miss;
    class n1,n2,n3 hit;
    style OLD fill:#fdf2f2,stroke:#e6a9a9,color:#7a2020;
    style NEW fill:#f0faf3,stroke:#7fc9a0,color:#14532d;
{{< /mermaiddiagram >}}

The tool takes a keyword and scans **every column of every table** of the selected documents in a single cheap pass over the already-mounted Parquet — then returns *where* the value lives: which table, which columns matched, and a small sample of matching rows. The agent then issues **one** precise query on the table it now knows is the right one.

The engineering care is in the matching. Every column is cast to text (so numeric columns are searchable too — you can hunt for an amount), and both the cell and the keyword go through the same normalisation: lowercased, accent-stripped, whitespace removed, decimal comma unified to a point. That's what lets `1234,56` match `1 234,56 €` and `1234.56` alike — the thousands separator and the French comma stop being obstacles.

**Why it matters:** it turns a value hunt from *O(number of tables)* model round trips into a **single tool call plus one targeted query**. Fewer read queries, fewer reasoning turns, less token spend, and — because the scan is exhaustive and reproducible — a far better chance of actually finding the value. The tool even flags when a keyword is too generic and matches too many tables, so the agent knows to refine rather than trust a truncated result.

---

## Where this pays off: cross-checking data across documents

Put the pieces together and a genuinely useful capability falls out: **comparing the data inside a spreadsheet against information living in other documents.**

Because an Excel workbook is now precise, queryable data — not a fuzzy blob of embedded text — an agent can line it up against a PDF report, a contract, or another workbook and reason about the difference. A few concrete shapes this takes:

- **Enrich.** A CSV lists product codes but no supplier names; a reference document has the mapping. The agent locates each code, pulls the matching name, and fills the gap.
- **Verify.** A summary slide claims "Q3 revenue: €4.2M." The agent queries the source workbook, sums the real figures, and confirms — or contradicts — the claim with the actual number.
- **Find the delta.** Two versions of the same budget, or a forecast versus actuals. The agent compares row by row and surfaces exactly what changed, and by how much.

None of this is reliable if the spreadsheet is a pile of shredded chunks. It works precisely because Fred treats the workbook as what it really is — a structured data source — gives the agent a global map to understand it, a SQL surface to query it exactly, and a locator to find any value fast.

---

## How we can go further

The extractor is deliberately scoped: it targets the **tabular data** in a workbook, and does it well. Three things it does **not** yet capture — and that a second phase will want to tackle to push Excel interaction further:

- **Formulas.** Today a formula is frozen to its last computed value; the logic itself (`=SUMIF(...)`, `=IF(C3>0;"OK";"KO")`) is dropped. But that logic is often as meaningful as the numbers — it explains *why* a cell holds what it holds. Preserving it (in metadata, alongside the table rather than inside the queryable body) would let an agent reason about the calculation, not just its result.
- **Macros (VBA).** Workbooks that embed automation in macros are read purely as data; the behaviour those macros encode is invisible to the agent. Surfacing it — even as a described summary — would unlock a whole class of "what does this workbook actually *do*?" questions.
- **Images and objects in cells.** Embedded pictures, charts, and in-cell drawings — increasingly common with Excel's "image in cell" feature — are not extracted. A product photo or a stamped signature sitting in a cell is currently lost.

None of these block today's use cases, which are about the tabular data itself. But each is a lever for a richer, more complete reading of Excel files — a natural next step now that the deterministic core has proven itself.

---

## The bigger picture

The through-line of this work is a refusal to take the easy, expensive shortcut. Excel is messy, and the tempting answer is to make it *someone else's* problem — hand it to a big model and hope. We did the harder thing: understand the structure, rebuild it deterministically, and give the agent tooling that's precise, auditable, and cheap to run.

The payoff is an agent that can read a whole workbook the way you'd skim it, then answer a pointed question with a real number — and tell you exactly which cell it came from.

As always, Fred is open source: [explore the code](https://github.com/ThalesGroup/fred) or [join the community](https://fredk8.dev). Your spreadsheets are smarter than your RAG pipeline gave them credit for.
