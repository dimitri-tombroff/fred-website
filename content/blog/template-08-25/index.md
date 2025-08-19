---
title: "Brontë: A New Content Generator Agent in Fred"
description: "Meet Brontë, the Content Generator Expert agent in Fred, designed to simplify the creation of technical templates and prompts through an interactive AI-driven UI."
summary: "Instead of relying on traditional form-based UIs, Brontë guides users step by step in designing complex templates and prompts, ensuring correct formats and properties, and saving them directly to Fred’s knowledge base using MCP."
date: 2025-08-18T10:00:00+02:00
lastmod: 2025-08-18T10:00:00+02:00
draft: true
weight: 30
categories: [agents, content, automation]
tags:
  - brontë
  - content-generator
  - mcp
  - fred
contributors: [Simon Cariou]
pinned: false
homepage: false
seo:
  title: "Brontë, the Content Generator Agent in Fred"
  description: "Discover how Brontë, a new Fred agent, makes template and prompt creation conversational, guiding users step by step and saving resources directly to the knowledge base with MCP."
  canonical: "https://fredk8.dev/blog/bronte-content-generator"
  robots: "index, follow"
---

## Introducing Brontë, the Content Generator Expert

Fred now includes a new agent: **Brontë**, the **Content Generator Expert**.  
Brontë is designed to help users create and manage structured resources such as **templates** and **prompts**, which follow a precise format and must be validated before being accepted by the MCP server.

---

## Why It Matters

Traditionally, building technical templates involves complex **UI forms**, endless validation rules, and plenty of opportunities for user frustration. Brontë changes the game:

- It offers an **interactive conversational interface** that guides the user step by step.
- It ensures resources follow the **mandatory YAML + body format** with `---` separators.
- It validates key rules like variable usage for templates, unique identifiers, and library association.
- At the end, Brontë proposes to **save the validated resource directly to Fred’s knowledge base** using an MCP command.

---

## How It Works

Brontë uses:
- **LangGraph orchestration** to combine reasoning and tool use.
- A **Content Generator Toolkit** connected to the MCP server.
- A **base system prompt** that enforces strict content rules.

Through conversation, the user explains what they want. Brontë:
1. Suggests a correctly formatted template or prompt.
2. Verifies details like `id`, `kind`, and placeholders.
3. Seeks user approval before finalizing.
4. Executes the MCP command to persist the resource.

---

## Why It’s Astonishing

Instead of **burdening users with static forms**, Brontë delivers a **fluid, conversational experience**:
- Users can ask for examples, corrections, or variations.
- The agent ensures compliance without requiring the user to memorize format rules.
- The end result is **higher productivity and fewer errors**, with a UI that feels natural instead of bureaucratic.

---

👉 With Brontë, Fred demonstrates how **agentic UIs** can replace traditional, rigid form-driven workflows. It’s a leap forward in usability, turning complexity into guided collaboration.
