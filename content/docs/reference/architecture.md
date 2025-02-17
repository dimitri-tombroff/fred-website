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

## Web Socket interactions

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
   ``



| Feature              | REST API | WebSocket |
|----------------------|---------|-----------|
| Fetch experts list  | ✅      | ❌        |
| Fetch chat history  | ✅      | ❌        |
| Delete session      | ✅      | ❌        |
| Live chat session   | ❌      | ✅        |
| Multi-step interaction | ❌ | ✅ |


## **3️⃣ Why This Architecture?**

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