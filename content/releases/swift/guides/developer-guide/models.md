---
title: "Model Configuration"
description: "How to configure API tokens, choose a model provider, and control model selection in Fred Swift 2.0."
summary: "Covers the two files that control model configuration in Swift 2.0, which env var holds each provider's token, how to select dev vs prod configuration, and how models_catalog.yaml drives default model selection. Includes a fred-samples local setup note."
date: 2026-05-04T00:00:00+02:00
lastmod: 2026-05-04T00:00:00+02:00
weight: 810
toc: true
seo:
  title: "Model Configuration — Swift Developer Guide"
  description: "Configure API tokens, providers, and model selection in Fred Swift 2.0 via .env and models_catalog.yaml."
---

## The mental model: two files, one env var per provider

Everything that controls model behaviour in a Swift agent pod lives in exactly two YAML files and one env var per provider:

| What | File / Variable | Override |
|---|---|---|
| App settings (security, storage, URLs) | `config/configuration.yaml` | `CONFIG_FILE` env var |
| Model provider and selection | `config/models_catalog.yaml` | `FRED_MODELS_CATALOG_FILE` env var |
| Provider API token | depends on `provider:` in the catalog | set in `config/.env` |

Both files ship with working defaults for local development. For most tasks you only need to edit `.env` and — once — `models_catalog.yaml`.

---

## Step 1 — Put your token in `.env`

`config/.env` is loaded automatically at startup. It is gitignored and never committed.

The env var you need depends on which `provider:` value you use in the catalog:

| `provider:` in catalog | Required env var | Notes |
|---|---|---|
| `openai` | `OPENAI_API_KEY` | Also used for Mistral — see below |
| `azure-openai` | `AZURE_OPENAI_API_KEY` | |
| `azure-apim` | `AZURE_APIM_SUBSCRIPTION_KEY` and `AZURE_AD_CLIENT_SECRET` | |
| `ollama` | _(none)_ | Local, no token required |
| `vertex-ai` | GCP application default credentials | Set via `GOOGLE_APPLICATION_CREDENTIALS` |

### Using Mistral (recommended default)

Mistral exposes an OpenAI-compatible API. In the catalog you use `provider: openai` and point `base_url` at Mistral's endpoint. The token still goes in `OPENAI_API_KEY` — even though it is a Mistral key:

```bash
# config/.env
OPENAI_API_KEY=your-mistral-api-key-here
```

The `base_url: https://api.mistral.ai/v1` entry in the catalog profile tells the client where to send the request. `OPENAI_API_KEY` provides the bearer token.

This is the out-of-the-box default for `fred-agents` and `fred-samples`. No other env var is needed for Mistral.

### Minimal `.env` for local dev

```bash
OPENAI_API_KEY=<your-mistral-or-openai-key>
```

Leave `CONFIG_FILE` unset — it defaults to `./config/configuration.yaml`.

---

## Step 2 — Select your model in `models_catalog.yaml`

`config/models_catalog.yaml` is the single source of truth for model selection. Agents declare a capability (`chat`, `language`, `embedding`, `image`) and the platform resolves the profile — no model names are hardcoded in agent code.

### Default layout

```yaml
version: v1

common_model_settings:      # merged into every profile
  temperature: 0.0
  timeout:
    connect: 10.0
    read: 120.0

default_profile_by_capability:   # which profile wins when no rule matches
  chat: default.chat.mistral
  language: default.language.mistral

profiles:
  - profile_id: default.chat.mistral
    capability: chat
    model:
      provider: openai                          # OpenAI-compatible API
      name: mistral-medium-2508
      settings:
        base_url: https://api.mistral.ai/v1
        max_retries: 2

  - profile_id: default.language.mistral
    capability: language
    model:
      provider: openai
      name: mistral-medium-2508
      settings:
        base_url: https://api.mistral.ai/v1
        max_retries: 2

rules: []
```

### Switching providers

To use a local Ollama instance instead, add a profile and update `default_profile_by_capability`:

```yaml
default_profile_by_capability:
  chat: local.chat.ollama
  language: local.chat.ollama

profiles:
  - profile_id: local.chat.ollama
    capability: chat
    model:
      provider: ollama
      name: mistral:latest
      settings:
        base_url: http://localhost:11434
```

No token needed for Ollama. You can leave `OPENAI_API_KEY` unset.

### Keeping mock profiles for offline testing

The default catalog ships with `mock.chat` and `mock.language` profiles that point to a local mock server (`http://localhost:8383/v1`). Keep them available and flip `default_profile_by_capability` to switch between real and mock without changing any other file:

```yaml
default_profile_by_capability:
  chat: mock.chat       # ← switch here for offline tests
  language: mock.language
```

---

## Step 3 — Choose your configuration file

The runtime reads `config/configuration.yaml` by default. Override with `CONFIG_FILE`:

```bash
# config/.env
CONFIG_FILE=./config/configuration_prod.yaml
```

### Dev vs prod at a glance

| Setting | `configuration.yaml` (dev) | `configuration_prod.yaml` (prod-like) |
|---|---|---|
| Security | disabled | Keycloak M2M enabled |
| Storage | SQLite | PostgreSQL |
| Scheduler | disabled | enabled |
| Platform URL | `localhost:8222` | production control-plane URL |

For local development and testing, the default `configuration.yaml` with security disabled is correct. You do not need Keycloak or PostgreSQL running.

---

## Working with `fred-samples` and local SDK builds

`fred-samples` is a standalone open-source project that normally installs `fred-sdk` and `fred-runtime` from PyPI. During development, you can point it at your local clones instead using `uv`'s source override mechanism:

Add to `fred-samples/agents/pyproject.toml`:

```toml
[tool.uv.sources]
fred-sdk = { path = "../../fred/libs/fred-sdk", editable = true }
fred-runtime = { path = "../../fred/libs/fred-runtime", editable = true }
```

Then sync:

```bash
cd fred-samples/agents
uv sync
```

`uv` installs the local versions in editable mode. Changes you make in `fred/libs/fred-sdk` or `fred/libs/fred-runtime` are immediately reflected without reinstalling. Remove the `[tool.uv.sources]` block to go back to PyPI.

`fred-samples` uses the same `config/models_catalog.yaml` and `config/.env` pattern — the model configuration steps above apply directly.

---

## Quick-start checklist

- [ ] Create `config/.env` and set `OPENAI_API_KEY` to your Mistral (or OpenAI) key
- [ ] Confirm `default_profile_by_capability` in `models_catalog.yaml` points to the profile you want
- [ ] Leave `CONFIG_FILE` unset for local dev
- [ ] Run the agent pod — startup logs will confirm the resolved model: `[MODEL][OPENAI] Constructing ChatOpenAI model=mistral-medium-2508`

---

> **For operators:** how to inject these values in Kubernetes (Secrets, Helm values) →
> [Operations Guide]({{< ref "/releases/swift/guides/operations" >}})
>
> **For routing rules and the full resolution algorithm** →
> [LLM Routing reference](/docs/llm-routing.html)
