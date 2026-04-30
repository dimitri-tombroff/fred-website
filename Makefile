.DEFAULT_GOAL := help

.PHONY: help serve build preview

# Allow overriding the npm binary, e.g. `make serve NPM=pnpm`
NPM ?= npm

help:
	@awk 'BEGIN { FS=":.*##"; printf "Usage:\n  make \033[36m<target>\033[0m\n\nTargets:\n" } \
		/^[a-zA-Z0-9_-]+:.*##/ { printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

serve: ## Run dev server (npm run dev)
	$(NPM) run dev

build: ## Build the site (npm run build)
	$(NPM) run build

preview: build ## Build and serve the built site (npm run build && npm run preview)
	$(NPM) run preview
