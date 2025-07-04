---
title: "Getting Started"
description: "The fastest path to a running Fred stack for local development."
toc: false
draft: false
weight: 810
---

## What You Need

| Tool | Why |
|------|-----|
| `make` | Drives common tasks |
| `Python 3.12.8` + [`uv`](https://github.com/astral-sh/uv) | Backend deps |
| `Node 22.13.0` + `npm`/`nvm` | Frontend deps |
| *(optional)* Docker + VS Code Dev-Containers | Zero-install workflow |

---

## 1 · Clone the repos

```bash
git clone https://github.com/ThalesGroup/fred.git
git clone https://github.com/ThalesGroup/knowledge-flow.git   # optional RAG backend
```

---

## 2 · Add your OpenAI key

```bash
# backend secrets
cd fred
cp config/env.template config/.env
echo 'OPENAI_API_KEY=sk-...' >> config/.env
```

*(Azure / Ollama keys follow the same pattern; see the linked READMEs.)*

---

## 3 · Run Fred locally

```bash
# terminal 1 – backend
cd fred/backend
make run
```

```bash
# terminal 2 – frontend
cd fred/frontend
make run
```

Open <http://localhost:5173> and log in with the mock `admin / admin` user.

Need document RAG? Start Knowledge-Flow in a third terminal:

```bash
cd knowledge-flow
make run         # Swagger: http://localhost:8111/knowledge/v1/docs
```

---

## 4 · Prefer Docker + VS Code?

Both repos include Dev-Container setups that launch the whole stack (Fred, Knowledge-Flow, OpenSearch, MinIO, etc.) in one click.  
See **fred/docs/DEV_CONTAINER.md** and **knowledge-flow/docs/DEV_CONTAINER.md** for details.

---

## More Detail

| Component | Deep-dive README |
|-----------|------------------|
| Fred backend | <https://github.com/ThalesGroup/fred/blob/main/backend/README.md> |
| Fred frontend | <https://github.com/ThalesGroup/fred/blob/main/frontend/README.md> |
| Knowledge-Flow backend | <https://github.com/ThalesGroup/knowledge-flow/blob/main/README.md> |

For production-grade deployment (Keycloak, OpenSearch, MinIO, Postgres) use **fred-deployment-factory**: <https://github.com/ThalesGroup/fred-deployment-factory>
