---
title: "How to use Fred"
description: "Build your own agent and run it standalone or deploy it to a Fred platform instance."
summary: "Fred agents are self-contained Python services. Build one in minutes, chat with it locally, then deploy it to any running Fred instance — no code change required."
date: 2023-09-07T16:04:48+02:00
lastmod: 2026-04-13T10:00:00+02:00
draft: false
weight: 810
toc: true
seo:
  title: "How to use Fred"
  description: "Build a Fred agent pod from scratch, run it locally, and deploy it to a Fred platform instance."
  canonical: ""
  robots: ""
---

## The model in one sentence

You write a Python class that defines your agent. Fred turns it into a running HTTP service. That service works standalone on your laptop, and plugs into any Fred platform instance without changes.

---

## Two modes, one codebase

| Mode | How it works | Who talks to the agent |
|------|-------------|----------------------|
| **Standalone** | Run the pod locally with `make run` | `fred-agent-chat` CLI from your terminal |
| **Platform** | Deploy the pod to a Fred instance | Fred UI — any user on the platform |

The pod is the same binary in both cases. Deployment to a Fred instance is a configuration step, not a code change.

---

## Build your first agent

### 1. Define the agent

An agent is a Python class that extends `ReActAgentDefinition` from `fred-sdk`.
The only thing you must provide is a system prompt.

```python
# my_agent/chef.py
from fred_sdk.contracts.models import ReActAgentDefinition, ReActPolicy


class ChefAgent(ReActAgentDefinition):
    agent_id: str = "chef"
    role: str = "Culinary assistant"
    description: str = "Answers cooking questions and suggests recipes."
    tags: tuple[str, ...] = ("cooking",)
    system_prompt_template: str = """\
You are a friendly and knowledgeable culinary assistant.
Help users with recipes, techniques, ingredient substitutions, and kitchen tips.
Keep your answers practical and concise.
"""

    def policy(self) -> ReActPolicy:
        return ReActPolicy(system_prompt_template=self.system_prompt_template)


CHEF_AGENT = ChefAgent()
```

### 2. Register it

```python
# my_agent/registry.py
from fred_sdk.contracts.models import ReActAgentDefinition
from my_agent.chef import CHEF_AGENT

REGISTRY: dict[str, ReActAgentDefinition] = {
    CHEF_AGENT.agent_id: CHEF_AGENT,
}
```

### 3. Wire the pod

```python
# my_agent/main.py
from fastapi import FastAPI
from fred_runtime.app import AgentPodConfig, create_agent_app, load_agent_pod_config
from my_agent.registry import REGISTRY


def create_app(config: AgentPodConfig | None = None) -> FastAPI:
    resolved_config = config if config is not None else load_agent_pod_config()
    return create_agent_app(registry=REGISTRY, config=resolved_config)


app = create_app()
```

```python
# my_agent/__main__.py
import uvicorn
from fred_runtime.app import load_agent_pod_config


def main() -> None:
    config = load_agent_pod_config()
    uvicorn.run("my_agent.main:app", host="127.0.0.1", port=config.app.port, reload=True)


if __name__ == "__main__":
    main()
```

### 4. Configure

`config/configuration.yaml` — declares the pod HTTP settings, security mode, and storage:

```yaml
app:
  name: "My agent"
  base_url: "/my-agent/v1"
  port: 8000
  log_level: "info"

security:
  m2m:
    enabled: false
    realm_url: "http://localhost:8080/realms/fred"
    client_id: "my-agent-m2m"
  user:
    enabled: false
    realm_url: "http://localhost:8080/realms/fred"
    client_id: "my-agent"
  authorized_origins: []

observability:
  tracer: logging   # null | logging | langfuse
  metrics: logging  # null | logging

storage:
  postgres:
    sqlite_path: "~/.fred/my-agent/sessions.sqlite3"

scheduler:
  enabled: false
```

> **Observability.** The `observability` section selects backends by name. Non-secret settings (host, paths)
> live in the YAML; credentials (API keys, tokens) stay in the `.env` file.
> Switch to Langfuse by setting `tracer: langfuse` and adding a `langfuse.host` sub-section.

> **Storage.** All conversation state — sessions, multi-turn history, checkpoints — is managed by the
> LangGraph SQL checkpointer via `storage.postgres`.
> In local development this is a SQLite file; in production it is PostgreSQL.
> There are no separate session or history tables.

`config/models_catalog.yaml` — tells the runtime which LLM to call:

```yaml
version: v1

default_profile_by_capability:
  chat: default.chat
  language: default.language

profiles:
  - profile_id: default.chat
    capability: chat
    description: "Default chat model."
    model:
      provider: openai
      name: gpt-4.1-mini
      settings: {}

  - profile_id: default.language
    capability: language
    description: "Default language model."
    model:
      provider: openai
      name: gpt-4.1-mini
      settings: {}

rules: []
```

`config/.env` — secrets and config pointer:

```bash
CONFIG_FILE="./config/configuration.yaml"
OPENAI_API_KEY="sk-..."
```

---

## Run it standalone

```bash
make run      # starts the pod on port 8000
make chat     # opens the interactive terminal in a second window
```

The chat client reads `config/.env` and `config/configuration.yaml` automatically — no extra flags needed.

```
Connected to http://127.0.0.1:8000/my-agent/v1
Current agent: chef

chef> What can I make with leftover risotto?
```

The pod also exposes a plain HTTP API you can call directly:

```bash
curl http://127.0.0.1:8000/my-agent/v1/agents
# ["chef"]
```

---

## Deploy to a Fred platform instance

When you are ready to share the agent with your team, deploy the same pod to a running Fred instance. No code changes are required.

### What changes

| Standalone | Platform deployment |
|------------|-------------------|
| `security.user.enabled: false` | `security.user.enabled: true` — JWT validated against the platform Keycloak |
| SQLite local storage | Postgres shared with the platform |
| `fred-agent-chat` CLI | Fred web UI |

### How it connects

Fred exposes a **control plane** that acts as a registry for agent pods. When your pod starts, it registers itself — declaring its `agent_id`, `base_url`, and capabilities. The Fred UI then routes conversations to it transparently.

From the user's perspective the agent simply appears in the agent selector alongside any other agent on the platform.

### Configuration for platform mode

Switch to a production config file (`config/configuration_prod.yaml`) that points at the platform services:

```yaml
app:
  name: "My agent"
  base_url: "/my-agent/v1"
  port: 8000

security:
  user:
    enabled: true
    realm_url: "https://<keycloak-host>/realms/<realm>"
    client_id: "<your-client-id>"
  m2m:
    enabled: true
    realm_url: "https://<keycloak-host>/realms/<realm>"
    client_id: "<your-m2m-client-id>"
  authorized_origins:
    - "https://<fred-ui-host>"

storage:
  postgres:
    host: "<postgres-host>"
    port: 5432
    database: "<database>"
    username: "<user>"
  session_store:
    type: "postgres"
    table: "my_agent_session"
  history_store:
    type: "postgres"
    table: "my_agent_history"
  kpi_store:
    type: "log"
    level: "INFO"

platform:
  control_plane_url: "https://<fred-control-plane>/control-plane/v1"

scheduler:
  enabled: false
```

Point your `.env` at this file:

```bash
CONFIG_FILE="./config/configuration_prod.yaml"
```

The rest of the codebase — the agent class, registry, `main.py`, `__main__.py` — is untouched.

---

## What's next

**Add tools.** Declare Python functions on your agent definition and the ReAct runtime will call them during reasoning. Fred also supports MCP servers for external integrations.

**Add a second agent.** Add another class to `registry.py`. Both agents become available in `fred-agent-chat` and in the Fred UI.

**Full bootstrap walkthrough.** See the [step-by-step guide](https://github.com/ThalesGroup/fred/blob/main/docs/authoring/BOOTSTRAP.md) in the repository for the complete project layout with `pyproject.toml`, Makefile, and directory structure.
