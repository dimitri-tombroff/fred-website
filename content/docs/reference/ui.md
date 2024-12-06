---
title: "User Interface"
description: "architecture and design of the fred UI"
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




Fred UI is a React application that uses Material, Redux and Typescript. It is designed
to be easily customized and extended. It was updated with Vite.js and React Flow.

It comes with a lightweight (golang) backend ithat acts as a proxy server that, in turn, serves the UI and forwards
the requests to the Fred python API servers. It also provides facilities to interact directly with a Kubernetes cluster.

Fred UI provides you with:

- [x] Keycloak integration
- [x] Cookie and Jwt token management
- [x] Kubernetes integration
- [x] Material, Redux, Typescript
- [x] Docker file and helm chart for deployment
- [x] Makefile for easy build and run
- [x] Kooker integration
- [x] Vite.js

## Design

When you deploy Fred UI to kubernetes, you actually start a (docker) container that runs the golan backend. That backend is in charge of two roles:

1. serve the UI static content. That is the one your browser will invoke.
2. handle the UI rest API calls to the various backend services. The golang server acts here as a proxy forwarder.

In the UI code, all (redux) API slices inherit from a common base path '/api'. Check out the 'src/slices/api.tsx' file.
If you have a look at one of the slice that interact with a backend you will see url like this:

```tsx
getClusterScores: builder.mutation<ClusterScore, { cluster: string }>({
            query: ({cluster}: { cluster: string }) => ({
                url: `/rift-api/ui/scores?cluster_name=${cluster}`,
                method: 'GET',
            }),
        }),
```

The browser will actually send a request to '/api/v1/artifacts/...'.
In turn the golang backend receives that request on its localhost:8081 port and will handle it according to its API gateway configuration.

This looks like a complex design. But it has many advantages: modularity, separation of concerns, CORS.

## Getting started

Make sure you have a recent node:

```sh
nvm list
nvm use v22.8.0
```

To start the ui:

```sh
cd ui;
npm install
npm run dev
```

or simply:

```sh
make ui-run
```

To start the server

```sh
make server-run
```

To build the docker image type in

```sh
make docker-build
```

This will build the server and the ui, and create a docker image.
Check the Makefile targets for more options.

```sh
make help
```

To go production, you will need to pass the configuration
to the helm chart.
Checkout the [values.yaml](helm/punch-board/values.yaml) file for an example.
This allows you to deploy the punch board using helm, or better using Kast
[kastctl](https://kast-portal.dpsc-thales.fr/static/files/kast-documentation/lts/fleche-6.1.0/kastctl.html) tool.

## Contributing

### Developer guide

Dependency management is, as usual, the most important and delicate part of the project.
Prefer using only the Makefile to build and run the project.

Normally, the ui/package-lock.json file, committed as part of the project, should never be changed.
If you really need to add a new dependency, ensure you review with Fred's team what you bring in.
Fred's team is there to ensure that the dependencies work well together, and that the project remains
lightweight and easy to build.

There is only one branch '0.1' branch. It
is the current stable release.
Do not be afraid to submit merge requests we team will be happy to review them.

### Style and Colors

We use material ui. Refer to the theme.tsx file.

### Requirements

`make`,  `curl`, `gcc`, `node`, `nvm`, `golang` and  `docker` are required to build project in your laptop.

```sh
# make
sudo apt install make curl gcc

# node and yarn (using nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm install v22.8.0
npm install --global yarn
nvm use v22.8.0
```

Install GoEnv, then use it to install `golang 1.21` read [installation guide](https://github.com/syndbg/goenv/blob/master/INSTALL.md)
For `docker` read [installation guide for Ubuntu](<https://docs.docker.com/engine/install/ubuntu/>, <https://docs.docker.com/engine/install/linux-postinstall/>)

### Run locally

```shell
# Build the server and ui
make build
```

```shell
# Run the server
make server-run
```

In another terminal.

```shell
# Run the ui
make ui-run
```

Which is equivalent to:

```shell
cd ui
npm run dev
```

Go to the indicated localhost url and use the UI (credentials board/board)!
