---
title: "Using AI to Enforce Code Quality in Fred"
description: "Fred uses OpenAI not only for chat and document features — but also internally to review Python pull requests and enforce code guidelines."
summary: "We use GPT-4 internally to automate Python code reviews and ensure compliance with Fred's backend development standards. Learn how our AI review tool works and why it matters."
date: 2025-06-21T18:00:00+02:00
lastmod: 2025-06-21T18:00:00+02:00
draft: false
weight: 45
categories: [tooling, backend, quality]
tags:
  - openai
  - code-quality
  - agentic
  - fastapi
  - devtools
  - fred
  - backend
contributors: [Dimitri Tombroff]
pinned: false
homepage: false
seo:
  title: "How Fred Uses GPT-4 to Enforce Python Code Quality"
  description: "Explore how the Fred project uses OpenAI internally to review backend Python code and enforce strict architectural standards using a custom CLI tool."
  canonical: "https://fredk8.dev/blog/ai-review-enforcing-code-guidelines"
  robots: "index, follow"
---

As part of the [Fred](https://fredk8.dev) open source platform, we rely on GPT-4 not just to answer questions — but to **review our own Python code**.

Our backend follows strict architectural guidelines to ensure clean layering, robust error handling, and maintainability across controllers, services, and utilities. To reduce reviewer workload and onboard new contributors faster, we built a CLI tool that uses OpenAI's API to enforce our development guide automatically.

---

## 🎯 Why We Did It

The `fred` and `knowledge-flow` backends both adhere to a strong architectural discipline:

- All business logic belongs in `services/`, never in controllers  
- All exceptions must subclass `BusinessException`  
- Controllers are thin: only route handling, no logic  
- File operations must use shared utilities  
- Inputs and outputs must use Pydantic models  
- All functions should be documented and tested  

Without automation, reviewing these rules across many contributions would be tedious. So we built an internal AI reviewer.

---

## 🧠 How It Works

We created a small tool: `ai_review_pull_request.py`.

It uses the OpenAI API (`gpt-4`) to check modified Python files and provide an opinionated review based on our internal coding guide.

### Sample invocation:

```bash
python developer_tools/ai_review_pull_request.py --mode all
```

- Supports `--mode committed`, `--mode uncommitted`, or `--mode all`  
- Auto-loads our `.env` to get the OpenAI API key  
- Warns if other providers like Ollama or Azure are configured  
- Excludes the review script itself from the analysis  

---

### Sample Output

Here’s what the output looks like in the terminal:

```text
INFO     2025-06-21 17:51:33 - INFO - Reviewing the following files:
INFO     2025-06-21 17:51:33 - INFO -  - knowledge_flow_app/controllers/wrong_controller.py

╭──────────────────────────────────────────────────────────────────────────── 🧠 AI Review ─────────────────────────────────────────────────────────────────────────────╮
│ The code provided violates several principles outlined in the Fred Backend Python Development Guide.                                                                  │
│                                                                                                                                                                       │
│ 1. **Violation of Structure**: Business logic appears directly in the controller.                                                                                     │
│ 2. **Bad Exception Handling**: HTTPExceptions are raised where domain-specific exceptions should be used.                                                            │
│ 3. **Missing Docstrings and Tests**: All functions must be documented and tested.                                                                                     │
│ 4. **Pydantic Models Not Used Consistently**                                                                                                                          │
│ 5. **Dangerous Methods**: e.g., `nuke_profiles()` clears all data without confirmation.                                                                               │
╰───────────────────────────────────────────────────────────────────── Code quality and compliance ─────────────────────────────────────────────────────────────────────╯
```

---

## 🚫 Bad Controller Example (Just for Testing!)

To trigger the reviewer, we added this test file:

```python
@router.post("/create")
async def create_profile(req: CreateProfileRequest):
    profile_id = f"{req.title.lower()}-{datetime.now().timestamp()}"
    profiles[profile_id] = {"title": req.title}
    return {"profile_id": profile_id}
```

Issues:
- No delegation to a service  
- Uses raw timestamps  
- Returns raw dicts instead of Pydantic models  
- No error abstraction  

The AI flagged every one of them.

---

## ✅ Review Highlights

We used `rich` to display the AI feedback in a readable, color-coded format. You’ll instantly see:

- Which files are reviewed  
- What violations are found  
- How to improve your code  

This tool runs fast, works offline with your Git state, and helps contributors learn our architecture the right way.

---

## 👩‍💻 Developers Love It

This is part of a broader philosophy: **use AI for serious engineering, not just chat.**

Fred supports agent orchestration, document-aware reasoning, and now — clean, consistent engineering.

Want to integrate something similar in your stack?  
Head to [https://fredk8.dev](https://fredk8.dev) and check out our agentic dev tools.

---

## 📦 Where to Find It

You can find the script in:

```bash
fred/knowledge-flow/developer_tools/ai_review_pull_request.py
```

It’s self-contained, requires only the `openai` and `dotenv` packages, and follows the same quality standards it enforces.

---

## 💬 Want to Help?

- Try the tool on your own branch  
- Contribute improvements (e.g. GitHub integration, pre-commit hook)  
- Share your feedback!  

We're open-source and always improving — let’s build clean agentic systems together!
