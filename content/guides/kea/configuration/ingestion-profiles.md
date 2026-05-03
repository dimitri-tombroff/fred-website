---
title: "Ingestion Profiles"
description: "How to configure FAST, MEDIUM, and RICH ingestion profiles in Fred."
summary: "Operator reference for ingestion profile settings: PDF backends, OCR options, image description, and the key trade-offs for each option."
date: 2026-04-30T00:00:00+02:00
lastmod: 2026-04-30T00:00:00+02:00
draft: false
weight: 810
toc: true
seo:
  title: "Ingestion Profiles — Fred Configuration Guide"
  description: "Configure FAST, MEDIUM, and RICH ingestion profiles in Fred: PDF backends, OCR, force_full_page_ocr, and vision model wiring."
---

> **User perspective:** what users observe with each profile →
> [Ingestion Profiles — User Guide]({{< ref "/guides/kea/user-guide/ingestion-profiles" >}})

## Overview

Ingestion profiles are defined under `processing.profiles` in the Knowledge Flow backend configuration. Each profile controls how documents are converted to Markdown before indexing.

The three built-in profiles are `fast`, `medium`, and `rich`. The active default is set by `processing.default_profile`.

Profiles apply to both the **Knowledge Flow API** (which receives upload requests) and the **Knowledge Flow worker** (which executes the Temporal activities). Both must have the same profile configuration — in a Helm deployment, this means updating both `knowledge-flow-backend` and `knowledge-flow-worker` sections of your values file.

---

## Profile: fast

Uses `LitePdfMarkdownProcessor` for PDFs — a lightweight extractor built on `markitdown` and `PyMuPDF`. No AI model involved.

```yaml
processing:
  default_profile: fast
  profiles:
    fast:
      use_gpu: false
      process_images: false
      pdf:
        backend: pypdfium2
        do_ocr: false
        do_table_structure: false
```

**When it works well:** born-digital PDFs with embedded text (exports from Word, generated reports).

**When it fails silently:** scanned documents, PDFs where content is in images. Output will be empty or near-empty without any error.

---

## Profile: medium

Uses `PdfMarkdownProcessor` backed by [Docling](https://github.com/DS4SD/docling) with OCR and table structure analysis.

```yaml
profiles:
  medium:
    use_gpu: false
    process_images: false
    pdf:
      backend: docling_parse
      images_scale: 1.5
      do_table_structure: true
      do_ocr: true
      ocr_backend: openvino
      force_full_page_ocr: false   # see note below
```

### The `force_full_page_ocr` option

This is the most impactful option for text quality on born-digital PDFs.

| Value | Behavior | Use when |
|---|---|---|
| `false` (recommended) | OCR activates only on detected image regions. Native text is read directly from the PDF text layer. | Most documents — PDFs with embedded text |
| `true` | OCR re-reads every page in full, overriding the embedded text layer. | Purely scanned documents with no text layer at all |

**Why `true` causes problems on born-digital PDFs:** the OCR engine re-processes text that was already clean, introducing word-merging artifacts (`readacrossarow`, `WebAccessSymbol`) and broken list structures. Set to `false` unless your document corpus is entirely scanned.

### OCR backend

`openvino` runs on CPU using Intel's inference engine. It does not require a GPU and is the correct default for most deployments. The OCR models (PaddleOCR v4, three ONNX files) are bundled in the Docker image and loaded into memory on first use.

---

## Profile: rich

Extends MEDIUM with image description via a vision language model.

```yaml
profiles:
  rich:
    use_gpu: false
    process_images: true       # enables vision model calls per image
    pdf:
      backend: docling_parse
      images_scale: 2.0        # higher resolution for image extraction
      generate_picture_images: true   # Docling extracts pictures as assets
      do_table_structure: true
      do_ocr: true
      ocr_backend: openvino
      force_full_page_ocr: false
```

### Wiring the vision model

`process_images: true` alone is not enough. The `vision_model` at the top level of the configuration must point to a **vision-capable endpoint**.

```yaml
vision_model:
  provider: openai
  name: pixtral-12b-2409      # must be a multimodal model
  settings:
    base_url: https://your-vision-endpoint/v1
```

**Common misconfiguration:** pointing `vision_model` to a text-only chat model (e.g. Mistral Medium). The API call will either fail silently or return a response that ignores the image. Users will see empty placeholders (`%%ANNOTATION%%`) in extracted text instead of image descriptions — with no error visible in the UI.

Vision-capable models in the Mistral family: `pixtral-12b-2409`, `mistral-small-3.1`. GPT-4o and GPT-4o-mini are vision-capable on the OpenAI side.

### Image description in practice

For each picture detected by Docling, Fred sends the image to the vision model and replaces the placeholder with the returned description. This adds latency proportional to the number of images in the document — budget several seconds per image depending on the model.

If a document has no images, RICH and MEDIUM produce identical output.

---

## Helm deployment

In a Helm-based deployment, profiles are configured as overrides in your `values.yaml`. Only the fields you specify are merged — all other fields inherit from the chart defaults.

**Important:** the chart base currently defaults to `force_full_page_ocr: true` for MEDIUM and RICH. You must explicitly override it:

```yaml
# In both knowledge-flow-backend and knowledge-flow-worker sections:
configuration:
  processing:
    profiles:
      medium:
        use_gpu: false
        pdf:
          force_full_page_ocr: false
      rich:
        use_gpu: false
        pdf:
          force_full_page_ocr: false
```

Note that `input_processors` lists are **fully replaced** during Helm merge, not appended. If you override `input_processors` for a profile, include the complete list.

---

## Choosing a default profile

`processing.default_profile` sets the profile used when no profile is specified at upload time.

- `fast` is the right default for most general-purpose deployments. It is fast and reliable on clean documents.
- `medium` as default is appropriate when your document corpus is heterogeneous (scanned + digital mixed) or when table extraction quality matters for all uploads.
- `rich` as default is expensive — only suitable if image description adds value for the majority of your documents.

Per-library or per-upload profile selection is exposed through the API and UI where the feature is enabled.
