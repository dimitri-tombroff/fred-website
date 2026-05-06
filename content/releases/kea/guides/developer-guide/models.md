---
title: "Model Configuration"
description: "How to configure API tokens, choose a model provider, and control model selection in Fred Kea."
summary: "Covers the two files that control model configuration in Kea, which env var holds each provider's token, how to select dev vs prod configuration, and how models_catalog.yaml drives default model selection."
date: 2026-05-04T00:00:00+02:00
lastmod: 2026-05-04T00:00:00+02:00
draft: false
weight: 810
toc: true
seo:
  title: "Model Configuration — Kea Developer Guide"
  description: "Configure API tokens, providers, and model selection in Fred Kea via .env and models_catalog.yaml."
---

## The mental model: two files, one env var

Everything that controls model behaviour in Kea lives in exactly two YAML files and one env var per provider:

| What | File / Variable | Override |
|---|---|---|
| App settings (security, storage, URLs) | `config/configuration.yaml` | `CONFIG_FILE` env var |
| Model provider and selection | `config/models_catalog.yaml` | `FRED_MODELS_CATALOG_FILE` env var |
| Provider API token | depends on `provider:` in the catalog | set in `config/.env` |

Both files ship with working defaults for local development. For most tasks you only need to edit `.env` and `models_catalog.yaml`.

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

### Using Mistral

Mistral exposes an OpenAI-compatible API. In the catalog you set `provider: openai` and point `base_url` at Mistral's endpoint. The token still goes in `OPENAI_API_KEY` — even though it is a Mistral key:

```bash
# config/.env
OPENAI_API_KEY=your-mistral-api-key-here
```

This is the current default for both Kea and Swift. The value `https://api.mistral.ai/v1` in the catalog tells the client where to send the request; `OPENAI_API_KEY` provides the bearer token.

### Minimal `.env` for Mistral (local dev)

```bash
OPENAI_API_KEY=<your-mistral-key>
CONFIG_FILE=./config/configuration.yaml
```

---

## Step 2 — Select your model in `models_catalog.yaml`

`config/models_catalog.yaml` is the single source of truth for which model the platform uses. Agents do not hardcode providers or model names — they declare a capability (`chat`, `language`, `embedding`, `image`) and the platform resolves the profile.

### Structure

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
      provider: openai                          # "openai" = OpenAI-compatible API
      name: mistral-medium-2508                 # model name sent in the request
      settings:
        base_url: https://api.mistral.ai/v1    # Mistral endpoint
        max_retries: 2

rules: []   # optional routing overrides — see reference/llm_routing
```

### Switching providers

To switch from Mistral to a local Ollama instance, change the relevant profile (or add a new one and update `default_profile_by_capability`):

```yaml
profiles:
  - profile_id: default.chat.local
    capability: chat
    model:
      provider: ollama
      name: mistral:latest
      settings:
        base_url: http://localhost:11434
```

No token needed for Ollama — remove `OPENAI_API_KEY` from `.env` or leave it unset.

### Per-operation routing

For advanced use cases (e.g. a faster model for routing decisions, a stronger model for planning), add `rules:`. See the [LLM Routing reference]({{< ref "/docs/reference/llm_routing" >}}) for the full rule syntax and resolution algorithm.

---

## Step 3 — Choose your configuration file

The app reads `config/configuration.yaml` by default. Override with `CONFIG_FILE`:

```bash
# In config/.env
CONFIG_FILE=./config/configuration_prod.yaml
```

### Dev vs prod at a glance

| Setting | `configuration.yaml` (dev) | `configuration_prod.yaml` (prod) |
|---|---|---|
| Security (`m2m`, `user`) | `enabled: false` | `enabled: true` |
| Storage | SQLite (`~/.fred/...`) | PostgreSQL |
| Scheduler | may be disabled | Temporal enabled |
| Log level | `info` or `debug` | `info` |

For local development, the default `configuration.yaml` with security disabled is correct. You do not need Keycloak, PostgreSQL, or Temporal running.

For a full production-like local setup (testing auth flows, ReBAC, etc.), copy `configuration_prod.yaml` and supply the additional secrets it requires — see the [Operations Guide]({{< ref "/releases/kea/guides/operations" >}}).

---

## Quick-start checklist

- [ ] Create `config/.env` from `.env.template` (copy and fill in your token)
- [ ] Set `OPENAI_API_KEY` to your Mistral (or OpenAI) key
- [ ] Confirm `default_profile_by_capability` in `models_catalog.yaml` points to the profile you want
- [ ] Leave `CONFIG_FILE` unset (defaults to `configuration.yaml`) for local dev
- [ ] Start the backend — first request will log `[MODEL][OPENAI] Constructing ChatOpenAI model=...` confirming the profile resolved correctly

---

> **For operators:** how to inject these values in Kubernetes (Secrets, Helm values) →
> [Model Secrets — Operations Guide]({{< ref "/releases/kea/guides/operations" >}})
>
> **For routing rules and the full resolution algorithm** →
> [LLM Routing reference]({{< ref "/docs/reference/llm_routing" >}})
