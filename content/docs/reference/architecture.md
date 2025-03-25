---
title: "Architecture"
description: "architecture and design of the fred python backend"
summary: ""
date: 2023-09-07T16:13:18+02:00
lastmod: 2023-09-07T16:13:18+02:00
draft: false
weight: 910
toc: true
seo:
  title: "" # custom title (optional)
  description: "" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  robots: "" # custom robot tags (optional)
---

Checkout the high level [architecture blog post](/blog/fred-design-and-architecture). This blog discusses the few important 
design drivers and implementation choice. 

Fred is designed as a stateful multi-agent chatbot that supports both REST API calls and a WebSocket-based session mechanism. This architecture enables:

* Stateless interactions (simple API calls for fetching expert lists, deleting sessions, etc.).
* Stateful conversations (maintaining ongoing chat sessions with real-time responses).

## Architecture Overview


{{< mermaiddiagram >}}
flowchart TD
    UI["User Interface (React)"]
    Keycloak["Keycloak (Authentication)"]
    Backend["Python Backend API"]
    FredCore["Fred Core (Leader Agent)"]
    Agent1["Monitoring Expert (Agent)"]
    Agent2["Another Specialized Agent"]
    Agent3["Technical K8s Expert (Discovery Agent)"]
    LLM1["LLM: OpenAI / Mistral / Ollama"]
    DB1["PostgreSQL"]
    DB2["Elasticsearch"]
    K8Cluster["Target Kubernetes Cluster(s)"]

    UI -->|"User login / request"| Keycloak
    UI -->|"Authenticated requests"| Backend
    Backend -->|"Authenticated by token"| Keycloak
    Backend --> FredCore

    FredCore -->|"Delegates tasks"| Agent1
    FredCore --> Agent2
    FredCore --> Agent3

    Agent1 -->|"Reads/Writes"| DB1
    Agent1 -->|"Reads/Writes"| DB2
    Agent1 -->|"Invokes LLM"| LLM1

    Agent2 -->|"Uses LLM"| LLM1
    Agent2 -->|"DB Access"| DB1

    Agent3 -->|"Queries & explains"| K8Cluster
    Agent3 -->|"Uses LLM"| LLM1

    classDef core fill:#f9f,stroke:#333,stroke-width:2px;
    class FredCore core;

    classDef agent fill:#bbf,stroke:#333;
    class Agent1,Agent2,Agent3 agent;

    classDef db fill:#cfc,stroke:#333;
    class DB1,DB2 db;

    classDef external fill:#eee,stroke:#999;
    class UI,Keycloak,LLM1,K8Cluster external;
{{< /mermaiddiagram >}}

The diagram above illustrates the modular architecture of Fred, a multi-agent AI assistant designed to work with Kubernetes environments. Each component has a well-defined role:

* User Interface (React): Provides a clean and interactive front end for users to interact with Fred.
* Keycloak: Handles user authentication and ensures secure access to backend services.
* Fred Core (Leader Agent): Acts as the central coordinator, dispatching tasks to specialized agents.
* Specialized Agents (e.g., Monitoring Expert): Each agent can independently connect to the LLM (OpenAI, Mistral, Ollama) and the database (PostgreSQL, Elasticsearch) that best suits its purpose.
* Backend API: Facilitates secure, modular communication between the UI, Fred Core, and agents.

The benefits of this Architecture are:
* Modularity: Each agent can be developed, tested, and extended independently, promoting rapid innovation.
* Flexibility: Agents and Fred Core can use different LLMs and databases based on specific needs or environments.
* Scalability: New agents can be added without impacting existing ones, making the system future-proof.
* Security: Centralized authentication using Keycloak ensures that only authorized users can access sensitive operations.
* Extensibility: Easy to plug in new tools, APIs, or models thanks to a clean separation of responsibilities.

## Web Socket interactions

This topis is under great improvments. Here are the current implementation. 

1️⃣ **The UI connects to the WebSocket** (`/chatbot/query`).

2️⃣ **The client sends a structured JSON request:**
   ```json
   {
     "configuration": {
       "session_id": "12345",
       "agentic_flow": {
         "name": "Fred",
         "experts": ["GeneralistExpert"]
       },
       "cluster_name": "minikube"
     },
     "messages": [
       {
         "type": "human",
         "content": "How can I optimize my cluster?",
         "additional_kwargs": {}
       }
     ]
   }
   ```


| Feature              | REST API | WebSocket |
|----------------------|---------|-----------|
| Fetch experts list  | ✅      | ❌        |
| Fetch chat history  | ✅      | ❌        |
| Delete session      | ✅      | ❌        |
| Live chat session   | ❌      | ✅        |
| Multi-step interaction | ❌ | ✅ |


## Why This Architecture ?

✅ **WebSockets for Real-Time Chat**
   - Keeps a **persistent connection** for stateful conversations.
   - Avoids **repeated REST API calls**.

✅ **REST API for Managing Sessions**
   - Fetches chat history without needing an active WebSocket.
   - Manages available experts dynamically.

✅ **Modular & Scalable Design**
   - New **experts can be added** without modifying core logic.
   - Supports **Kubernetes integration** via `KubeService`.
   - **Fred supervises multi-agent collaboration** when needed.