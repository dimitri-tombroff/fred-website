---
title: "Getting Started"
description: "Guides lead a user through a specific task they want to accomplish, often with a sequence of steps."
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

## Start the backend

You need :

- `make`
- Docker if you want to run the application in Docker
- Python 3.12.1 for local development

To try out Fred, you simply need to start the python backend:

```sh
cd backend
make run
```

The equivalent local command is:

```sh
python fred/main.py --server.configurationPath ./resources/configuration.yaml --server.baseUrlPath /fred
```

Fred backend expects a valid OPENAI token in the `OPENAI_API_TOKEN` environment variable, and a kubeconfig. Your kubeconfig can point to any kubernetes cluster including k3d, kind, minikube. Using OpenAi is not mandatory, you can use a local ollama server or AzureOpenAi as well. 

A great starting point is to try it out with kooker, or simply with a local minikube.

From there, Fred will start collecting and generating data and save it under
'~/.fred/fred-backend-cache' (as set in the resource/configuration-dev.yaml file).

If you do not want at all to interact with a remote or development K8 cluster nor perform some openai requests,
get in touch with contributors to get a ready-to-use zip archive that you can simply unzip in '~/.fred/'. You will then work in offline mode.

You can use the LOG_LEVEL environment variable.

```sh
LOG_LEVEL=DEBUG python fred/main.py --server.configurationPath ./resources/configuration.yaml --server.baseUrlPath /fred
```

The Swagger UI is accessible at `http://<host>:<port>/docs`. **Follow the host and port of your configuration file**.
You will have the documentation of the APIs and buttons to test it (`Try it out`).

You will see something like:

### Configuration File

Fred backend accepts a configuration file where you can fine-tune many of its internal services. 
Here is a self documented version:

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

    #type: elasticsearch
    #host: hostname
    #port: 80
    #scheme: http
    #username: elastic
    #password: elastic
    # Index prefix where to read the data
    #index_prefix:
      #energy_mix: 'energy_mix'
      #carbon_footprint: 'carbon_footprint'
      #energy_footprint: 'energy_footprint'
      #financial_footprint: 'financial_footprint'

# Tell Fred whow to connect to your Kubernetes clusters
kubernetes:
  kube_config: '~/.kube/config'
  aws_config: '~/.aws/config' # Optional, needed for aws EKS clusters.
  # Timeout settings for the client
  timeout:
    connect: 5  # Time to wait for a connection in seconds
    read: 15    # Time to wait for a response in seconds

# The AI section lets you select the agent(s) at play, provide some context information
# to make them better identified by the Fred leader. 
ai:
  # Timeout settings for the client
  timeout:
    connect: 5  # Time to wait for a connection in seconds
    read: 15    # Time to wait for a response in seconds
  # Most often the same model is used by all agents. You can however associate each agent with
  # a different model.
  default_model:
    #provider: "ollama"
    #model: "llama2"
    provider: "openai"
    name: "gpt-4o"
    temperature: 0
  leader:
      enabled: true
      model: {}
  agents:
    GeneralistExpert:
      enabled: true
      model: {}
    DocumentsExpert:
      enabled: true
      categories:
        - "eco-conception"
      settings:
        document_directory: "./resources/knowledge/imported"
        chunk_size: 512
        chunk_overlap: 64
      model: {}
    TechnicalKubernetesExpert:
      enabled: true
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
      model: {}
    MonitoringExpert:
      enabled: true
      categories:
        - "monitoring"
        - "observability"
        - "logging"
        - "metrics"
        - "electricity"
        - "resources"
        - "consumption"
      model: {}

# Where to save fred produced resources like Essentials or Score
# and external resources like Kubernetes Workload descriptions
dao:
  type: "file"  # Currently the only one supported
  base_path: "~/.fred/fred-backend-cache"
  max_cached_delay_seconds: 10  # Cache delay in seconds. Use 0 for no cache or a negative value for limitless cache.

# Where to store user feedback
feedback:
  type: postgres
  db_host: fred-postgres
  db_port: 5432
  db_name: fred_db
  user: admin
  password: Azerty123_

# Enable or disable the security layer
security:
  enabled: false
  keycloak_url: "http://fred-keycloak:8080/realms/fred"
```

### Online Parameter

```sh
usage: main.py [-h] [--server.address SERVER_ADDRESS] [--server.port SERVER_PORT] [--server.baseUrlPath SERVER_BASE_URL_PATH] [--server.configurationPath SERVER_CONFIGURATION_PATH]
               [--server.logLevel SERVER_LOG_LEVEL]

Fred microservice

options:
  -h, --help            show this help message and exit
  --server.address SERVER_ADDRESS
                        Specify the address of the server
  --server.port SERVER_PORT
                        Specify the port of the server
  --server.baseUrlPath SERVER_BASE_URL_PATH
                        Specify the base url for the API entrypoints
  --server.configurationPath SERVER_CONFIGURATION_PATH
                        Specify the path of the configuration used
  --server.logLevel SERVER_LOG_LEVEL
                        Specify the log level of the server
```

## Start the UI

### Requirements

`make`,  `curl`,  `node`, `nvm`, and  `docker` are required to build and run the  project on your laptop.

For `docker` read [installation guide for Ubuntu](<https://docs.docker.com/engine/install/ubuntu/>, <https://docs.docker.com/engine/install/linux-postinstall/>)


```shell
make run
```

Which is equivalent to:

```shell
npm run dev
```

Go to the indicated localhost url and use the UI with the credentials fred/fred.
