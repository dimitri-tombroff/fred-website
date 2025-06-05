---
title: "How to use Fred"
description: "How to use fred"
summary: ""
date: 2023-09-07T16:04:48+02:00
lastmod: 2023-09-07T16:04:48+02:00
draft: false
weight: 810
toc: true
seo:
  title: "" # custom title (optional)
  description: "" # custom description (recommended)
  canonical: "" # custom canonical URL (optional)
  robots: "" # custom robot tags (optional)
---

## Who is Fred ?

Fred is an open-source, agentic flow chatbot designed to manage a team of specialized experts and deliver insightful answers. This documentation is intended for both end users and developers. It explains how to configure Fred via a YAML configuration file, how to activate or customize each expert, and how to decide between interacting with Fred as a central coordinator or communicating directly with a single expert.

Fred acts as a **team leader** that supervises multiple expert agents:

- **Fred as a Coordinator:**  
  Fred analyzes your query, formulates a plan, and delegates subtasks to the most suitable experts. This is ideal for complex queries that benefit from multi-step reasoning and expert collaboration.
  
- **Direct Expert Interaction:**  
  For straightforward or domain-specific queries, you might choose to interact directly with a single expert (e.g., the GeneralistExpert or a TechnicalKubernetesExpert).

## Using Fred vs. Direct Expert Interaction

Fred is best used when:

* Complex Queries: Your question requires multi-step reasoning or the integration of multiple perspectives.
* Expert Coordination: Multiple experts might be needed to address different aspects of your query.
* Dynamic Planning: Fred’s planning and supervision dynamically adjust the response as new information is processed.

Direct expert interaction is preferable when:

* Domain-Specific Questions: The query clearly fits within a specific domain (e.g., document analysis or Kubernetes troubleshooting).
* Simplicity: The question is straightforward and does not need multi-step reasoning.
* Performance: Bypassing Fred’s multi-agent coordination can lead to faster responses for simple, focused queries.

## Configuration Overview

Fred’s behavior is controlled via a YAML configuration file. Below is an example snippet:

```yaml
ai:
  timeout:
    connect: 5  # Time to wait for a connection in seconds
    read: 15    # Time to wait for a response in seconds
  recursion:
    recursion_limit: 40
  leader:
    max_steps: 5
  agents:
    GeneralistExpert:
      enabled: true
      model:
        model_type: "openai"
        model: "gpt-4o"
        temperature: 0
        #model_type: "azure"
        #azure_deployment: "fred-gpt-4o"
        #api_version: "2024-05-01-preview"
        #temperature: 0
        #max_retries: 2
    DocumentsExpert:
      enabled: false
      categories:
        - "eco-conception"
      settings:
        document_directory: "./resources/knowledge/imported"
        chunk_size: 512
        chunk_overlap: 64
      model:
        model_type: "openai"
        model: "gpt-4o"
        temperature: 0
    TechnicalKubernetesExpert:
      enabled: false
      categories:
        - "kubernetes"
        - "namespaces"
        - "workloads"
        - "architecture"
        - "security"
        - "networking"
        - "storage"
        - "configuration"
        - "scaling"
        - "deployment"
      model:
        model_type: "openai"
        model: "gpt-4o"
        temperature: 0
        #model_type: "azure"
        #azure_deployment: "fred-gpt-4o"
        #api_version: "2024-05-01-preview"
        #temperature: 0
        #max_retries: 2
    MonitoringExpert:
      enabled: false
      categories:
        - "monitoring"
        - "observability"
        - "logging"
        - "metrics"
        - "tracing"
        - "alerting"
        - "dashboards"
        - "events"
        - "alarms"
        - "notifications"
      model:
        model_type: "openai"
        model: "gpt-4o"
        temperature: 0
```

Key Configuration Settings

* Timeout Settings:
  * connect: Maximum time to wait for a connection (in seconds).
  * read: Maximum time to wait for a response.
* Agents Section: Under agents, each expert is defined by its name. For each expert:
  * enabled: Set to true to activate or false to disable the expert.
  * model: Specifies the AI model type, model name, and parameters (e.g., temperature).
  * categories: (Optional) Lists the expert’s domain or areas of specialization.
  * settings: (For certain experts, such as DocumentsExpert) Includes additional parameters like document_directory, chunk_size, and chunk_overlap.
* Recursion Settings:
  * recursion_limit: Sets the maximum recursion depth in Python, to prevent stack overflows during agent initialization.
* Leader Settings:
  * max_steps: Limits how many steps the leader can execute before stopping and returning a final answer.

## Developer Guide

Fred is designed to be extended and customized. Here are some points for developers:

### State Management and Message Flow

Fred’s state object maintains the conversation context (plan, progress, objective). Developers can extend the state (for example, by adding an initial_objective field) to persist the user’s initial query across multiple planning iterations.

### Message Types:
Fred and its experts use several message types (HumanMessage, AIMessage, SystemMessage, etc.). To differentiate user inputs from internal messages, consider tagging user messages (e.g., by adding a "source": "user" flag in additional_kwargs).

### Reusing vs. Resetting the Graph

Fred reuses its internal graph to improve performance. However, ensure that when a new objective is detected, the state (including the plan and progress) is properly reset so that previous conversation context does not interfere with the new query.

Developers can customize the reset logic in the planning function (for example, by storing the initial objective in the state) to ensure a fresh start when a new question is received.

## Extending and Configuring Experts

To add a new expert, create a new class that inherits from AgentFlow and implement the required logic. Then, update the configuration file to enable and configure your new expert.

Each expert may have its own settings and categories. Adjust these parameters in the YAML file to match your domain requirements.
How to Try Fred

Edit the YAML configuration file to enable the experts you wish to use. For a simple start, you might enable only GeneralistExpert.
Ensure your API keys and model configurations are set correctly.


## Interact with the Chatbot:

Ask complex, multi-faceted questions to see Fred’s coordinated planning in action.
For simpler, domain-specific questions, try interacting directly with an expert if your interface supports that option.
Observe the responses and check logs for state management and expert selection details.

## Review Documentation and Logs

Use the logging and debugging information to understand how Fred is processing your queries, planning steps, and coordinating expert responses.

## Conclusion

Fred offers a flexible, open-source solution for multi-agent conversational AI. Whether you’re a user looking for nuanced, multi-step answers or a developer eager to extend and customize the system, this guide provides the essentials to get started. By understanding the configuration options and state management, you can tailor Fred’s behavior to suit a wide range of use cases.

Feel free to contribute to the project or open issues if you have suggestions or encounter challenges!

