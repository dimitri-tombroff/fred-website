---
title: "Ingestion Profiles"
description: "What FAST, MEDIUM, and RICH mean for your documents — and what to expect from each."
summary: "Explains the three ingestion profiles from a user perspective: quality trade-offs, what changes in the output, and what to ask your operator."
date: 2026-04-30T00:00:00+02:00
lastmod: 2026-04-30T00:00:00+02:00
draft: false
weight: 810
toc: true
seo:
  title: "Ingestion Profiles — Fred User Guide"
  description: "Understand FAST, MEDIUM, and RICH ingestion profiles in Fred: what they extract, what they miss, and how to choose."
---

## What is an ingestion profile?

When you upload a document to Fred, it is converted to text before being indexed and made searchable. This conversion step is called **ingestion**. The ingestion profile controls how thorough that conversion is.

There are three profiles: **FAST**, **MEDIUM**, and **RICH**. Your platform operator decides which profiles are available and which one is used by default.

---

## FAST

**Best for:** born-digital documents (PDFs exported from Word, generated reports, presentations) that contain clean, selectable text.

FAST reads the text layer that is already embedded in the document. It is very quick (seconds per document) and produces clean output. It does not try to understand the document's structure.

**What you get:**
- Full text content
- Basic formatting preserved

**What you don't get:**
- Document structure (headings, sections) is not detected
- Tables are extracted as plain text, not as structured tables
- Images are ignored

**When it's not enough:** if your document is a scan, or if structure and tables matter for the answers you expect from the agent, FAST will produce incomplete results.

---

## MEDIUM

**Best for:** most real-world documents where structure and tables matter.

MEDIUM uses [Docling](https://github.com/DS4SD/docling) (IBM's document understanding library) with an OCR engine. It analyses the layout of each page and reconstructs the document's structure.

**What you get:**
- Correct heading hierarchy (the agent can reason about sections)
- Tables as structured Markdown (better for questions about tabular data)
- OCR on image regions (text embedded in figures or diagrams is extracted)
- Significantly better extraction on complex layouts (columns, sidebars)

**What you don't get:**
- Figures and photos are not described — they appear as placeholders in the extracted text

**Speed:** slower than FAST — typically several seconds to a minute per document depending on size and content. On a platform without GPU, the first document takes longer because the OCR models load into memory.

---

## RICH

**Best for:** documents where figures, charts, diagrams, or photographs carry meaningful information that users might ask about.

RICH does everything MEDIUM does, plus it passes each detected image to a **vision language model** that produces a textual description of the image. That description is embedded in the extracted text in place of the placeholder.

**What you get:** everything from MEDIUM, plus
- Each image replaced by a natural-language description (e.g. *"Bar chart showing response rates by screen reader: JAWS 49%, NVDA 14%..."*)
- Useful when documents contain diagrams, charts, schematics, or photos that contain information

**What you don't get:**
- RICH requires a vision-capable model to be configured on your platform. If it is not, images will appear as empty placeholders — the same as MEDIUM. Ask your platform operator whether RICH image description is active on your instance.

**Speed:** slower than MEDIUM because each image is sent to a vision model. On documents with many images, this can add significant time.

---

## Which profile should I use?

| My document is… | Recommended profile |
|---|---|
| A clean exported PDF or Word document, no complex layout | FAST |
| Has tables, sections, headers — content matters | MEDIUM |
| Has charts, diagrams, or photos that contain information | RICH |
| A scanned document (photographed pages) | MEDIUM or RICH |

If you cannot choose the profile yourself, the default set by your operator applies to all uploads. Ask your operator which profile is active and whether it can be changed per library.

---

## Why do two documents of the same type look different in the knowledge base?

If documents uploaded to the same library have inconsistent quality, the most likely cause is that they were ingested with different profiles — or that a profile was changed between uploads. Re-ingesting a document with a different profile will update its extracted content.

---

> **This behavior is controlled by your platform operator.**
> See [Ingestion Profiles — Operations Guide]({{< ref "/guides/kea/operations/ingestion-profiles" >}}) for the exact settings that control each profile.
