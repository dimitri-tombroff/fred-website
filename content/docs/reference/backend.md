---
title: "Python Backend"
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

Fred backend is an API server that exposes a number of REST endpoints that can be used to understand, optimize and monitor a
Kubernetes application,
with a focus on maintainability and optimization.

Fred is meant to let you add your own routes, and contribute to the knowledge that will be accumulated and
summarized to ultimately provide you with a very powerful AI assistant that will be aware not only
of the technical details of your applications, but also about its usage and external environmental or context
information.

As of today, the following REST endpoints are implemented:

- [rift/footprint/carbon](rift/footprint/carbon): to get the carbon consumption estimates of your Kubernetes
  application. It requires some probes to be installed in your K8 application.
- [rift/footprint/energy](rift/footprint/energy): to get energy consumption estimates of your Kubernetes application and
  to get the energy mix.
- [rift/footprint/finops](rift/footprint/finops) : to get the cost of a cloud cluster from its billing APIs. It requires
  access to your hosting cloud Finops APIs.
- [rift/kube](rift/kube) : to get Kubernetes resources information. It requires a .kubeconfig to get in touch with one
  or several K8 clusters.
- [rift/ai](rift/ai) : rift AI services + REST APIs to manage the AI produced resources. This requires some access to a
  llm providers.
- [rift/ui_service](rift/ui_service) : a few high-level APIs to serve UIs implemented on top of rift-API.

## Architecture

Rift-api is designed to be robust, industrial yet lightweight and developer friendly.
The way it works is to rely on a filesystem (or S3) based cache.
This cache will store the information collected from the various external components
(K8 clusters, openai services, electricity map online service, etc...).

This design has several benefits:

- It is laptop-friendly. It is common to use fred as a local service running on top of a laptop and make it connect to your working K8 clusters. The typical  user is a system administrator in charge of monitoring its K8 clusters.
- It avoids regenerating costly (llm) data at each request. This is crucial to not recompute the same data over and over again.
- It makes the UI fast and responsive.
- It allows offline working.
- It provides an important import / export feature.
- Last, it permits a development mode for developers. Zip simulated data can be exchanged easily among developers to develop UIs or additional services.

## Using the Simulation mode

We start by explaining the so-called development mode.
Type in

```sh
make run
```

This launches an empty instance. It expects a valid OPENAI token in the `OPENAI_API_TOKEN` environment variable, and a kubeconfig.
Your kubeconfig can point to any kubernetes cluster including k3d, kind, minikube.
A great starting point is to try it out with kooker.

From there, rift-api will start collecting and generating data and save it under
'~/.frugalit/rift-api' (as set in the resource/configuration-dev.yaml file).

If you do not want at all to interact with a remote or development K8 cluster nor perform some openai requests,
get in touch with contributors to get a ready-to-use zip archive that you can simply unzip in '~/.frugalit/'.
You will then work in offline mode.

## Getting Started

This repository requires:

- `make`
- Docker if you want to run the application in Docker
- Python 3.12.1 for local development

To list all the available commands, run :

```sh
make help
```

First type in

```sh
make dev
```

That creates a local virtualenv environment.
To start it using Python, type in:

```sh
python rift/main.py --server.configurationPath ./resources/configuration.yaml --server.baseUrlPath /rift-api
```

or equivalently

```sh
make run
```

## Visual Code

To debug in VisualCode, ask copilot to generate a .vscode/launch.json file. Choose in it the startup configuration you
need.

```json
{
  "configurations": [
    {
      "type": "debugpy",
      "request": "launch",
      "name": "Launch Rift API",
      "program": "${workspaceFolder}/rift/main.py",
      "args": [
        "--server.configurationPath",
        "${workspaceFolder}/resources/configuration.yaml",
        "--server.baseUrlPath",
        "/rift-api"
      ]
    }
  ]
}
```

## Logging

You can use the LOG_LEVEL environment variable.

```sh
LOG_LEVEL=DEBUG python -m unittest rift.kube.test_kube_simulation_service
```

## API documentation and tests

The Swagger UI is accessible at `http://<host>:<port>/docs`. **Follow the host and port of your configuration file**.
You will have the documentation of the APIs and buttons to test it (`Try it out`).

## Development

To list the available commands, run:

```sh
make help
```

To run the application locally :

```sh
make dev # install the dependencies using venv and poetry
make run
```

To run the application in Docker :

```sh
make docker-build # build the Docker image
make docker-run
```

## Usage

Type in:

```sh
python rift/main.py -h
```

```text
usage: main.py [-h] [--server.address SERVER_ADDRESS] [--server.port SERVER_PORT] [--server.baseUrlPath SERVER_BASE_URL_PATH] [--server.configurationPath SERVER_CONFIGURATION_PATH]
               [--server.logLevel SERVER_LOG_LEVEL]

Rift microservice

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
