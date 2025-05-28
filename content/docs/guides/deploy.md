
---
title: "Backend Deployment Guide"
description: "How to deploy Fred Backend"
summary: "Learn how to deploy Fred for local development, Docker Compose, or Kubernetes environments."
date: 2023-09-07T16:04:48+02:00
lastmod: 2025-04-08T10:00:00+02:00
draft: false
weight: 810
toc: true
seo:
  title: "Fred Backend Deployment Guide"
  description: "Step-by-step guide for deploying Fred locally, with Docker Compose, or on Kubernetes with Helm."
  canonical: ""
  robots: ""
---

# Deployment Guide

Fred can be deployed in multiple ways depending on your needs:
- For **local development** on your laptop
- With **Docker Compose** for easier multi-container management
- On **Kubernetes** using Helm charts, recommended for production or advanced testing

No matter the deployment method, Fred requires two main configuration sources:
1. `config/configuration.yaml` — enables or disables Fred's internal services.
2. `.env` file — provides external connectors and credentials (OpenSearch, PostgreSQL/pgVector, Minio, Azure, Keycloak, etc.).

When working in development mode, you should maintain your own `.env` file locally and make sure it's ignored by Git (included in `.gitignore`) to avoid leaking secrets.

In Kubernetes environments, the `.env` file is converted into Kubernetes **Secrets** and mounted at runtime for security.

---

## Local Development

This method is ideal for developers working directly on the Fred codebase. After cloning the repository:

1. Copy the `.env.template` to create your local `.env`:
   ```bash
   cp config/.env.template config/.env
   ```

3. Edit `config/.env` to fill in your actual credentials.

4. Launch the backend locally:
   ```bash
   cd backend
   make run
   ```

5. The frontend can be launched separately (if applicable).

> **Tip:** your `.env` is never committed as specified in the repository `.gitignore`.

---

## Docker Compose

This method is great for testing multi-container setups locally without Kubernetes.

1. Copy the `.env.template` and configure it:

```bash
   cp config/.env.template config/.env
```
Build and run the Docker container using the Makefile:

```bash
make docker-build
make docker-run
```
Docker will orchestrate Fred inside a container, and you can test integrations with services like Postgres, Minio, OpenSearch, etc.

Check the `deploy`folder. A docker compose file is available that will start the various components required by Fred.

---

## Kubernetes with Helm

Helm charts are provided for easier deployment to Kubernetes.

Use this method for production environments or advanced integrations where Fred relies on external services like 
vector databases, S3-compatible storage, etc.

1. Prepare your values and secrets:
   - Use the `.env.template` to prepare your secrets.
   - Encrypt your `.env` as a Kubernetes Secret.

2. Use kastctl to provision that faile as an encrypted Kubenetes secret.

3. Fred will be deployed along with its dependencies (if defined in your Helm chart).

---

## Configuration Overview

### `./config/configuration.yaml`

This file defines which internal services of Fred are active. Particularly important is the `ai`section where you can
define your agents team.

```yaml
# In development mode it is handy to work with data files instead of connecting to remote databases.
database:
  type: csv
  csv_files:
    # Can be absolute paths or relative paths to the main
    energy_mix: './services/cluster_consumption/data/simulated_energy_mix.csv'
    carbon_footprint: './services/cluster_consumption/data/simulated_cluster_consumption_gco2_sep_to_feb.csv'
    energy_footprint: './services/cluster_consumption/data/simulated_cluster_consumption_wh_sep_to_feb.csv'
    financial_footprint: './services/cluster_consumption/data/simulated_cluster_consumption_usd_sep_to_feb.csv'

kubernetes:
  kube_config: '~/.kube/config'
  aws_config: '~/.aws/config' # Optional, needed for aws EKS clusters.
  # Timeout settings for the client
  timeout:
    connect: 5  # Time to wait for a connection in seconds
    read: 15    # Time to wait for a response in seconds

ai:
  # Timeout settings for the client
  timeout:
    connect: 5  # Time to wait for a connection in seconds
    read: 15    # Time to wait for a response in seconds
  default_model:
    #provider: "ollama"
    #name: "llama2"
    provider: "openai"
    name: "gpt-4o"
    #provider: "azure"
    #name: "fred-gpt-4o"
    api_version: "2024-05-01-preview"
    temperature: 0.0
  leader:
    name: "Fred"
    class_path: "leader.leader.Leader"
    enabled: true
    model: {}
  services:
    - name: "kubernetes"
      enabled: true
      model: {}
  agents:
    - name: K8SOperatorExpert
      class_path: "agents.kubernetes_monitoring.k8s_operator_expert.K8SOperatorExpert"
      enabled: true
      mcp_servers:
        - name: k8s-mcp-server
          transport: sse
          url: http://localhost:8081/sse
          sse_read_timeout: 600 # 10 minutes. It is 5 minutes by default but it is too short.
      model: {}
    - name: "GeneralistExpert"
      class_path: "agents.generalist.generalist_expert.GeneralistExpert"
      enabled: true
      model: {}
    - name: "DocumentsExpert"
      class_path: "agents.documents.documents_expert.DocumentsExpert"
      enabled: true
      categories:
        - "eco-conception"
      settings:
        chunk_size: 512
        chunk_overlap: 64
        knowledge_flow_url: "http://localhost:8111/knowledge/v1" 
      model: {}
      
# Where to save fred produced resources like Essentials or Score
# and external resources like Kubernetes Workload descriptions
dao:
  type: "file"  # Currently the only one supported
  base_path: "~/.fred/dao-cache"
  max_cached_delay_seconds: 300  # Cache delay in seconds. Use 0 for no cache or a negative value for limitless cache.

# Where to store user feedback
feedback:
   type: postgres
#  db_host: fred-postgres
#  db_port: 5432
#  db_name: fred_db
#  user: admin
#  password: Azerty123_

# Enable or disable the security layer
security:
  enabled: false
  keycloak_url: "http://fred-keycloak:8080/realms/fred"

# KEYCLOAK
keycloak:
  server_url: "https://localhost:8080"
  realm_name: "fred"
  client_id: "fred"

# CONTEXT STORAGE CONFIGURATION
context_storage:
  type: "local"
  options:
    path: "~/.fred/context-store"
```

Adjust according to your needs.

### `.env` file

This file provides connection details to external services.

Fred requires access to:
- **Azure** for AI services
- **Keycloak** for authentication
- **OpenSearch** for metadata, vector search, and chat memory
- **Minio** for S3-compatible storage
- **Postgres/pgVector** if applicable

Here is the `.env.template` provided in the repository:

```
# AZURE
AZURE_TENANT_ID=""
AZURE_CLIENT_ID=""
AZURE_CLIENT_SECRET=""
AZURE_CLIENT_SCOPE=""
AZURE_APIM_KEY=""
AZURE_API_VERSION=""
AZURE_DEPLOYMENT_LLM=""
AZURE_DEPLOYMENT_EMBEDDING=""

# KEYCLOAK
KEYCLOAK_SERVER_URL="https://localhost:8080"
KEYCLOAK_REALM_NAME="fred"
KEYCLOAK_CLIENT_ID="fred"

# OPENSEARCH
OPENSEARCH_HOST="https://localhost:9200"
OPENSEARCH_USER="admin"
OPENSEARCH_PASSWORD="Azerty123_"
OPENSEARCH_SECURE=true
OPENSEARCH_METADATA_INDEX="bidgpt-dev-metadata"
OPENSEARCH_VECTOR_INDEX="bidgpt-dev-embeddings"
OPENSEARCH_CHAT_MEMORY_INDEX="bidgpt-dev-chat-memory"
OPENSEARCH_VERIFY_CERTS=false

# MINIO
MINIO_ENDPOINT="localhost:9000"
MINIO_ACCESS_KEY="admin"
MINIO_SECRET_KEY="Azerty123_"
MINIO_BUCKET_NAME="bidgpt-dev-content"
MINIO_SECURE=false
```

---

## Contact Fred'team

Fred is an open source project that serves as basis for production grade application. We maintain 
CI/CD to deploy Fred instances on GCP, on Azure, or on internal Kubernetes clusters. Get in touch with us.

---
