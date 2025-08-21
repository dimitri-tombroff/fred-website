---
title: "From SQL to Agent: Smart Database Access in Fred"
description: "Fred now connects directly to live SQL databases, enabling natural language queries, schema inspection, and even read-and-write operations through agentic workflows."
summary: "What started with CSV ingestion has grown into full SQL integration. With Fred’s new SQLTableStore, you can query, update, and enrich your databases naturally through agents like Tessa."
date: 2025-08-20T10:00:00+02:00
lastmod: 2025-08-20T10:00:00+02:00
draft: false
weight: 10
categories: [agents, data, sql]
tags:
  - sql
  - tabular
  - tessa
  - data-agent
  - fred
contributors: [Thomas Hedan]
pinned: false
homepage: false
seo:
  title: "From SQL to Agent: Smart Database Access in Fred"
  description: "Discover how Fred integrates with SQL databases via SQLAlchemy, enabling agents like Tessa to query, update, and enrich data through natural language."
  canonical: "https://fredk8.dev/blog/sql-agent-integration"
  robots: "index, follow"
---

## From CSV to SQL

Fred’s journey with tabular data began with simple CSV ingestion.  
With this release, we take a decisive step forward: **direct, agentic access to live SQL databases**.

Once connected, your SQL instance becomes more than a read-only viewer. Agents can run queries using state-of-the-art models, update or drop tables, and even enrich the database by uploading new CSVs — all through natural conversation.

This transforms the SQL backend into a dynamic, intelligent workspace for collaboration, rapid prototyping, and data exploration.

---

## What We Built

The foundation of this upgrade is a new backend layer powered by **SQLAlchemy**, a proven SQL toolkit for Python.  

Fred now includes a **SQLTableStore** interface that any agent can use to:

- List available databases  
- List and delete tables  
- Inspect schemas and column types  
- Execute both read and write SQL queries  

By combining SQLAlchemy with Fred’s agent orchestration, these features are exposed safely and flexibly. Your databases remain authoritative, and every query is grounded in the actual schema and data.

---

## How It Works

The SQL integration follows a clear flow:

1. Configure connection parameters.  
2. Instantiate the `SQLTableStore` backend.  
3. Test the connection for validity.  
4. When triggered by a tool or agent (like **Tessa**), connect to the database and execute the query.  
5. Return structured results back to the agent for reasoning and response.  

The process is transparent and verifiable:  
**list databases → inspect tables and schemas → formulate queries → execute → respond**.  

This ensures accuracy and keeps control in the hands of the user, while letting agents do the heavy lifting.

---

## Architecture

Here’s a high-level view of the SQL integration:

{{< mermaiddiagram >}}
---
config:
  layout: fixed
---
flowchart TD
subgraph UI["🧑 User Interface (React UI)"]
        ChatUI["Chat Interface"]
  end
subgraph AgenticBackend["🧠 Fred Agentic Backend"]
        Fred["Main Agent: Fred"]
        Prompting["Prompt Engineering and Tools"]
        Tessa["Tabular Expert: Tessa"]
  end
subgraph KnowledgeFlow["📚 Knowledge Flow Backend"]
        API["Document and Data API"]
        SQL["SQL Table Store"]
        MCP_tools["Tools MCP Exposure"]
  end
subgraph YourSQLDBMS["🗄️ Your SQL DBMS (Postgres, MySQL, …)"]
        DB["Database"]
  end
    Tessa --> Prompting
    Fred -- delegates tabular tasks --> Tessa
    API --> SQL
    SQL --> MCP_tools
    MCP_tools --> Prompting
    ChatUI -- REST --> API
    ChatUI -- WebSocket + REST --> Fred
    DB <--> SQL
    style ChatUI fill:#d0e1ff,stroke:#333,stroke-width:1.5px
    style Fred fill:#ffe5cc,stroke:#333,stroke-width:1.5px
    style Prompting fill:#ffd4aa,stroke:#333,stroke-dasharray:3
    style Tessa fill:#fff2cc,stroke:#333,stroke-width:1.5px
    style API fill:#e2ffe2,stroke:#333,stroke-width:1.5px
    style SQL fill:#ccf2cc,stroke:#333,stroke-width:1.5px
{{< /mermaiddiagram >}}

---

## Putting It in Context

The SQL integration is not an isolated feature. It sits alongside other modalities that Fred already supports:

- **CSV ingestion** for lightweight tabular data.  
- **Document libraries** for unstructured knowledge and RAG.  
- **Prompt libraries** for reusing and sharing conversational assets.  

Together, these create a consistent foundation where agents can move seamlessly between documents, structured tables, and live databases.  

For teams, this means a more integrated workspace. Instead of juggling multiple tools and interfaces, Fred provides one environment where knowledge can be explored, updated, and shared — whether it comes from a CSV, a prompt, or a running SQL server.

---

## Looking Ahead

With SQL integration, Fred opens the door to a new set of collaborations.  
Teams in IT, DevOps, and operations can now use agents not only to query data but also to understand, enrich, and act on it.  

This makes it easier to crunch monitoring or financial data, automate recurring database tasks, or provide colleagues with instant answers about complex systems.  

It also connects naturally with broader themes of frugality and automation: by letting agents explain and manipulate data directly, Fred helps reduce the overhead of specialized tooling while encouraging shared understanding across teams.  

