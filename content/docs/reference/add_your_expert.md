---
title: "Add your expert"
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

## Overview

Fred is designed to be simple and user-friendly. It provides two ways for users to interact with AI-based experts:

* Directly selecting an expert for quick, straightforward advice.
* Using Fred as a supervisor to manage a structured multi-step process with multiple experts.

This flexibility makes Fred a bridge between simple AI interactions and state-of-the-art multi-agent architectures—without unnecessary complexity.

If a user knows exactly what they need, they can directly ask an expert.
For example:

* "I need help understanding Kubernetes logs" → Select the LogsExpert
* "Can you summarize this document?" → Select the DocumentsExpert

💡 This is just like talking to a single AI assistant for a specialized topic. No extra steps.

## Implementing a New Expert

To implement a new expert:

1. Create a subclass of AgentFlow. This ensures that the agent adheres to Fred’s architecture and can participate in the expert-based conversation flow.
2. Define its name, role, and description.
3. Implement the processing logic, retrieval mechanisms, and response generation.

Here is a sample code snippet. This code is complete and implements a simple generalist expert that basically will forward all its queries to the configured
model. 

```python
from datetime import datetime
from langchain_core.messages import SystemMessage
from langgraph.graph import END, START, MessagesState, StateGraph
from common.structure import AgentSettings, Configuration
from flow import AgentFlow
from fred.application_context import get_agent_settings, get_model_for_agent

class GeneralistExpert(AgentFlow):
    """
    Generalist Expert provides guidance on a wide range of topics 
    without deep specialization. It is useful for answering general 
    questions in a Kubernetes context.
    """

    # Class-level attributes for metadata
    name: str = "GeneralistExpert"
    role: str = "Generalist Expert"
    nickname: str = "Georges"
    description: str = "Provides guidance on a wide range of topics without deep specialization."
    icon: str = "generalist_agent"
    categories: list[str] = []
    tag: str = ""  # Tag défini directement ici
    
    def __init__(self, cluster_fullname: str):
        """
        Initializes the Generalist Expert agent.

        Args:
            cluster_fullname (str): The full name of the Kubernetes cluster 
                                    in the current context.
        """
        # Set basic properties
        self.cluster_fullname = cluster_fullname
        self.current_date = datetime.now().strftime("%Y-%m-%d")
        
        # Get agent settings
        agent_settings = get_agent_settings(self.name)
        
        # Extract categories
        self.categories = agent_settings.categories if agent_settings.categories else ["General"]
        
        # Initialize parent class
        super().__init__(
            name=self.name,
            role=self.role,
            nickname=self.nickname,
            description=self.description,
            icon=self.icon,
            graph=self.get_graph(),
            base_prompt=self._generate_prompt(),
            categories=self.categories,
            tag=self.tag
        )

    def _generate_prompt(self) -> str:
        """
        Generates the base prompt for the agent.

        Returns:
            str: A formatted string containing the agent's instructions.
        """
        return (
            "You are a friendly generalist expert, "
            "skilled at providing guidance on a wide range of topics without deep specialization.\n"
            f"Your current context involves a Kubernetes cluster named {self.cluster_fullname}.\n"
            "Your role is to respond with clarity, "
            "providing accurate and reliable information.\n"
            "When appropriate, highlight elements that could be particularly relevant.\n"
            f"The current date is {self.current_date}.\n"
            "In case of graphical representation, render mermaid diagrams code.\n\n"
        )

    async def expert(self, state: MessagesState):
        """
        Processes user messages and interacts with the model.

        Args:
            state (MessagesState): The current state of the conversation.

        Returns:
            dict: The updated state with the expert's response.
        """
        model = get_model_for_agent(self.name)
        prompt = SystemMessage(content=self.base_prompt)
        response = await model.ainvoke([prompt] + state["messages"])
        return {"messages": [response]}

    def set_cluster_name(self, cluster_name: str):
        """
        Sets the name of the Kubernetes cluster in the current context.

        Args:
            cluster_name (str): The name of the Kubernetes cluster.
        """
        self.cluster_fullname = cluster_name
        
    def get_graph(self) -> StateGraph:
        """
        Defines the agentic flow graph for the expert.

        Returns:
            StateGraph: The constructed state graph.
        """
        builder = StateGraph(MessagesState)
        builder.add_node("expert", self.expert)
        builder.add_edge(START, "expert")
        builder.add_edge("expert", END)
        return builder

```

To insert your new expert into Fred's team is straightforward, on simply need to add yours somewhere (the 'agent' folder is of course the right place).
Then simply edit the `fred/decision.py` class and add there your new class. As of now it looks like this:

```python
from typing import Literal

from pydantic import BaseModel


class PlanDecision(BaseModel):
    """Decision after evaluation."""

    action: Literal["planning", "respond"]


class ExecuteDecision(BaseModel):
    """
    Decision before expert execution.
    """

    # Add your custom expert flows here to include them in Fred
    expert: Literal[
        "GeneralistExpert", 
        "DocumentsExpert",
        "TechnicalKubernetesExpert", 
        "TheoreticalKubernetesExpert", 
        "KedaExpert",
        "MonitoringExpert"]

```
This class is used to validate the multi-agent selection process and ensure the chosen expert is available and known. 

### Configure MCP Servers

MCP (Model Context Protocol) servers are used to enable real-time communication between Fred’s agents and external systems. These servers act as endpoints where agents can access tools.

#### Add your MCP servers to your agent via Fred Configuration

In your configuration file (e.g., `config/configuration.yaml`), MCP servers are **listed** under each agent that supports communication via MCP.
For example in an agent that can perform an analysis of a Kubernetes cluster using MCP server tools:

```yaml {hl_lines=["5-9"]}
agents:
  - name: K8SOperatorExpert
    class_path: "agents.kubernetes_monitoring.k8s_operator_expert.K8SOperatorExpert"
    enabled: true
    mcp_servers:
      - name: k8s-mcp-server
        transport: sse
        url: http://localhost:8081/sse
        sse_read_timeout: 600 # 5mins by default and can be overridden here (in this case 10min)
    model: {}
```

**Note:** `mcp_servers` is an Array so you can add multiple MCP servers to a single Agent.

#### Create an agent that uses the MCP servers

```python {hl_lines=["27-28"]}
from datetime import datetime

from flow import AgentFlow
from langgraph.graph import MessagesState, StateGraph
from langgraph.constants import START
from langgraph.prebuilt import ToolNode, tools_condition

from fred.application_context import get_agent_settings, get_model_for_agent, get_mcp_client_for_agent

class K8SOperatorExpert(AgentFlow):
    """
    Expert to execute actions on a Kubernetes cluster.
    """
    # Class-level attributes for metadata
    name: str = "K8SOperatorExpert"
    role: str = "Kubernetes Operator Expert"
    nickname: str = "Kimberley"
    description: str = (
        "A Kubernetes monitoring & operator expert that can perform various actions on a Kubernetes cluster "
        "to provide insights on cluster performance, state of the current installed resources, "
        "pod status, container information, logs, and many more. This expert performs the relevant "
        "kubectl and helm commands in order to fulfill its mission and generate meaningful "
        "and aggregated results for the user."
    )
    icon: str = "k8s_operator_agent"
    categories: list[str] = []
    tag: str = "k8s operator"
    
    def __init__(self, 
                 cluster_fullname: str
                 ):
        self.current_date = datetime.now().strftime("%Y-%m-%d")
        self.cluster_fullname = cluster_fullname
        self.agent_settings = get_agent_settings(self.name)
        self.model = get_model_for_agent(self.name)
        self.mcp_client = get_mcp_client_for_agent(self.name)
        self.model_with_tools = self.model.bind_tools(self.mcp_client.get_tools())
        self.llm = self.model_with_tools
        self.categories = self.agent_settings.categories if self.agent_settings.categories else ["Operator"]
        if self.agent_settings.tag:
            self.tag = self.agent_settings.tag

```

The MCP magic happens in the following lines:
```python
self.mcp_client = get_mcp_client_for_agent(self.name)
self.model_with_tools = self.model.bind_tools(self.mcp_client.get_tools())
```

Where we connect to the MCP server(s) from the `configuration.yaml` file and bind its/their tools to the Agent.

## Multi-Agent or not ?

Instead of directly picking an expert, users can choose Fred to supervise the process.

🔹 Why use Fred?
Fred doesn’t just act as another expert—it coordinates multiple agents in an optimal way. It follows a structured process of:

* Planning – Understanding the user's request.
* Supervision – Assigning the right experts at the right moment.
* Validation – Ensuring a high-quality, reviewed result.

🔹 Example Scenarios:

* "Can you audit my Kubernetes cluster?"
  
  → Fred determines the relevant experts (e.g., KubernetesExpert, SecurityExpert, FinOpsExpert)
  
  → It orchestrates the audit step by step to ensure nothing is missed.

* "How can I optimize my cloud costs?"
  
  → Fred plans a multi-expert approach, ensuring both technical (scalability, efficiency) and financial (FinOps) aspects are covered.
When an incoming event requires MyCustomExpert, the system will automatically instantiate and use it.

A great feature of Fred is that you expert can be queried directly or be part of several experts. Let us have a look at a simple 
expert. The generalist expert shown above is a great example. 


## Add you expert to Fred's team 

Last have a look at the configuration file. You can there enable or disable some expert, and set the model you want. As of today
Fred supports openai and azure open ai models. We will add more soon. 




