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

Fred backend expects a valid OPENAI token in the `OPENAI_API_TOKEN` environment variable, and a kubeconfig. Your kubeconfig can point to any kubernetes cluster including k3d, kind, minikube.

A great starting point is to try it out with kooker, or simply with a local minikube.

From there, Fred will start collecting and generating data and save it under
'~/.fred/fred-backend-cache' (as set in the resource/configuration-dev.yaml file).

If you do not want at all to interact with a remote or development K8 cluster nor perform some openai requests,
get in touch with contributors to get a ready-to-use zip archive that you can simply unzip in '~/.fred/'. You will then work in offline mode.

You can use the LOG_LEVEL environment variable.

```sh
LOG_LEVEL=DEBUG python -m unittest rift.kube.test_kube_simulation_service
```

The Swagger UI is accessible at `http://<host>:<port>/docs`. **Follow the host and port of your configuration file**.
You will have the documentation of the APIs and buttons to test it (`Try it out`).

You will see something like:

```sh
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
