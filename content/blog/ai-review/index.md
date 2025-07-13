---
title: "Using AI to Enforce Code Quality in Fred"
description: "Fred uses OpenAI not only for chat and document features — but also internally to review Python pull requests and enforce code guidelines."
summary: "We use GPT-4 internally to automate Python code reviews and ensure compliance with Fred's backend development standards. Learn how our AI review tool works and why it matters."
date: 2025-06-20T16:27:22+02:00
lastmod: 2025-06-20T16:27:23+02:00
draft: false
weight: 5
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

As part of the [Fred](https://fredk8.dev) open source platform, we rely on GPT-4 not just to provide agentic services — but to **review our own Python code**.

Our backend follows strict architectural guidelines to ensure clean layering, robust error handling, and maintainability across controllers, services, and utilities. To reduce reviewer workload and onboard new contributors faster, we built a CLI tool that uses OpenAI's API to enforce our development guide automatically.

---

## Why We Did It

The `fred` and `knowledge-flow` backends both adhere to a strong architectural discipline. We defined rules (as many open source project do) in [contributing](https://github.com/ThalesGroup/knowledge-flow/blob/main/docs/CONTRIBUTING.md) and [coding](https://github.com/ThalesGroup/knowledge-flow/blob/main/docs/CODING_GUIDELINES.md) guides. Things like:



- All business logic belongs in `services/`, never in controllers  
- All exceptions must subclass `BusinessException`  
- Controllers are thin: only route handling, no logic  
- File operations must use shared utilities  
- Inputs and outputs must use Pydantic models  
- All functions should be documented and tested
- etc..  

Traditional approaches rely on linters, static analyzers, or custom pre-commit hooks, which often require careful configuration and can be tightly coupled to specific tools or IDEs. Our AI-based reviewer is complementary: it’s both simpler to set up and more powerful in practice, as it understands higher-level architectural intentions rather than just syntax or formatting rules. This makes it ideal for enforcing cross-cutting patterns without developer friction.

Without automation, reviewing these rules across many contributions would be tedious. In particular at time of pull request. So we built an internal AI reviewer.

---

## How It Works

We created a simple tool: [ai_review_pull_request.py](https://github.com/ThalesGroup/knowledge-flow/blob/main/developer_tools/ai_review_pull_request.py). It is extremally simple. 

It uses the OpenAI API (`gpt-4`) to check modified Python files and provide an opinionated review based on our internal coding guide. Let us see it in action.

---
## Bad Controller Example

To test our reviewer, we added this test file:

```python
# ❌ BadController.py — DO NOT COPY (for illustration only)

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import os
from datetime import datetime

# ❌ Violates layering — mixing business logic here
router = APIRouter()

profiles = {}

class CreateProfileRequest(BaseModel):
    title: str
    description: str

@router.post("/create")
async def create_profile(req: CreateProfileRequest):
    # ❌ No delegation to service
    profile_id = f"{req.title.lower()}-{datetime.now().timestamp()}"
    profiles[profile_id] = {
        "title": req.title,
        "description": req.description,
        "created_at": datetime.utcnow().isoformat(),
    }
    return {"profile_id": profile_id}

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # ❌ Business logic directly in controller
    content = await file.read()
    if len(content) > 1_000_000:
        # ❌ Raw HTTPException in business logic
        raise HTTPException(status_code=400, detail="File too large")

    out_path = f"/tmp/{file.filename}"
    with open(out_path, "wb") as f:
        f.write(content)

    return {"message": f"Saved to {out_path}"}

@router.get("/profiles/{profile_id}")
async def get_profile(profile_id: str):
    # ❌ No error handling abstraction
    if profile_id not in profiles:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profiles[profile_id]

@router.delete("/profiles")
async def nuke_profiles():
    # ❌ Dangerous logic, no confirmation
    profiles.clear()
    return {"message": "All gone 💥"}

```

---

### Sample Output

Here’s what our reviewer has to say about it:

```bash
WARNING  2025-06-21 19:22:30 - ai_review_pull_request.py -
         This script only supports OpenAI. Detected other configured providers:
         - AZURE_OPENAI_API_KEY is set
INFO     2025-06-21 19:22:31 - ai_review_pull_request.py -
         Reviewing the following files:
         - knowledge_flow_app/controllers/wrong_controller.py
INFO     2025-06-21 19:22:51 - _client.py -
         HTTP Request: POST https://api.openai.com/v1/chat/completions
         "HTTP/1.1 200 OK"

🧠 AI Review

The code provided has several issues that violate the guidelines in the Fred Backend
Python Development Guide. Below are the identified issues and suggested improvements:

1. Violation of Structure
   - Business logic is mixed with controller logic, violating separation of concerns.
   → Extract business logic into service classes (e.g. create, upload, delete profiles).

2. Bad Exception Handling
   - HTTPException is raised directly inside business logic.
   → Define exceptions extending BusinessException and raise from services.
     Controllers should catch and translate to HTTPException.

3. Missing Tests and Docstrings
   - Functions lack tests and documentation.
   → Add unit tests and docstrings explaining purpose, parameters, and return values.

4. Violations of Naming, Layering, and Pydantic Usage
   - Inconsistent naming; improper layering; missing Pydantic usage.
   → Follow naming conventions. Use Pydantic models for both input and output
     (e.g. return a ChatProfile model).

5. Dangerous Logic in `nuke_profiles`
   - Clears all profiles with no checks or confirmation.
   → Add a confirmation step and authorization logic.

6. File Handling in Controller
   - File I/O is done directly in the controller.
   → Move file handling to a service class. Use exceptions as needed.

7. Hardcoded Paths
   - File path is hardcoded (`/tmp/...`), which is fragile.
   → Use a configurable path from environment variables or app config.
```

As you can see, most issues (No delegation to a service, uses of raw timestamps, returns raw dicts instead of Pydantic models, no error abstraction ) were flagged.

---

## Why It Matters

This is part of a broader philosophy: use AI for serious engineering.

In practice, senior developers shouldn’t be spending their time policing architecture or teaching coding standards one-on-one. Yet newcomers do need clear guidance and consistent mentorship — especially in open source or fast-moving internal projects.

This is where AI truly shines: it scales best practices, reduces reviewer fatigue, and helps every contributor write code that aligns with the system’s design philosophy. Instead of endlessly configuring linters and IDE rules that vary across environments, this approach delivers a smart, adaptable, and context-aware reviewer — with almost no friction.

By automating the tedious yet essential parts of software discipline, we free up time to focus on real innovation.

---

## Want to Help?

Fred is designed for us all to learn, improve, evaluate new strategies to do our job and to design smAI powered applications. 

- Try the tool on your own branch  
- Contribute improvements (e.g. GitHub integration, pre-commit hook)  
- Share your feedback!  

We're open-source and always improving — let’s build clean agentic systems together!
