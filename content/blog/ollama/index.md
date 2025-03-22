---
title: "Playing with Ollama"
description: "How to run Fred using Ollama"
summary: "Running Fred with a local Ollama server"
date: 2025-03-07T16:27:22+02:00
lastmod: 2025-03-07T16:27:22+02:00
draft: false
weight: 50
categories: [guidance]
tags: []
contributors: [Emanuel-Todor Hascau Dumitrelea, Dimitri Tombroff]
pinned: false
homepage: false
seo:
  title: ""
  description: ""
  canonical: ""
  robots: ""
---

This short post shows how to run **Fred** and its agents on a local [Ollama](https://ollama.com) server. Ollama makes it easy to run large language models like `llama2`, `mistral`, or `gemma` locally — without needing any API key.

It’s straightforward and great for testing or offline setups.

## 🛠️ Step 1: Install and Run Ollama

On macOS, simply run:

```sh
brew install ollama
```

Start the Ollama server:

```sh
ollama serve
```

Or install it as a background service:

```sh
brew services start ollama
```

Then run a model (e.g., `llama2`):

```sh
ollama run llama2
```

You can verify that the Ollama server is listening:

```sh
lsof -i :11434
```

You should see output like:

```sh
COMMAND   PID USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
ollama  56805 dimi    3u  IPv4 0xa591e9eac9b75a54      0t0  TCP localhost:11434 (LISTEN)
```

The steps are very similar on Linux desktops.

## 🧠 Step 2: Configure Fred to Use Ollama

Fred supports multiple backends per agent. To make an agent (like the `GeneralistExpert`) use your local Ollama model, simply update the config:

```yaml
ai:
  timeout:
    connect: 5  # Time to wait for a connection in seconds
    read: 15    # Time to wait for a response in seconds

  agents:
    GeneralistExpert:
      enabled: true
      model:
        model_type: "ollama"
        model: "llama2"
        temperature: 0
```

> ✅ No credentials are needed when using Ollama locally — it's fast and self-contained.

## 🚀 Step 3: Restart Fred and Enjoy

Once configured, just restart Fred. Your agent is now using a local LLM to process prompts!

You can now experiment with prompts, test offline setups, or even try different local models — all without relying on external APIs.
