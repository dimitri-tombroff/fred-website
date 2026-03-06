---
title: "Access Model"
description: "Current role and permission model in Fred: identity from Keycloak, global RBAC, and object-level ReBAC."
summary: "Reference matrix for roles, actions, resources, and API enforcement in Agentic and Knowledge Flow."
date: 2026-03-05T12:00:00+02:00
lastmod: 2026-03-05T12:00:00+02:00
draft: false
weight: 917
toc: true
seo:
  title: "Fred Access Model"
  description: "Understand identity, RBAC, ReBAC, and endpoint enforcement in Fred."
---

## Scope

This page documents the **current implementation** of access control in Fred across:

- `agentic-backend`
- `knowledge-flow-backend`
- `fred-core` security modules

It is a reference for platform administrators, security teams, and maintainers.

## Identity and Claims Mapping

| Input in token | Fred field | Usage |
| --- | --- | --- |
| `sub` | `KeycloakUser.uid` | User identity key |
| `preferred_username` | `KeycloakUser.username` | Display and tracing |
| `email` | `KeycloakUser.email` | User profile |
| `resource_access[client_id].roles` | `KeycloakUser.roles` | Global RBAC |
| `groups` | `KeycloakUser.groups` | Team membership for ReBAC contextual relations |

Implementation reference:

- `fred-core/fred_core/security/oidc.py`

## RBAC (Global)

### Actions

- `create` (`C`)
- `read` (`R`)
- `update` (`U`)
- `delete` (`D`)
- `read:global` (`G`)
- `process` (`P`)

### Roles

| Role | Effective rule |
| --- | --- |
| `admin` | All actions on all resources |
| `editor` | Allowlist by resource (see table below) |
| `viewer` | Baseline `R` on all resources, with explicit overrides |
| `service_agent` | Narrow read-only subset for service use |

### Resource matrix (RBAC)

| Resource | admin | editor | viewer | service_agent |
| --- | --- | --- | --- | --- |
| `tag` | all | C,R,U,D | R | R |
| `document` | all | C,R,U | R | R |
| `documents_source` | all | R | R | - |
| `resource` | all | C,R,U,D | R | - |
| `table` | all | C,R,U,D | R | R |
| `tables_database` | all | C,R,U,D | R | R |
| `kpi` | all | R | R | - |
| `opensearch` | all | R | R | R |
| `neo4j` | all | - | R | - |
| `logs` | all | - | R | - |
| `files` | all | C,R,U,D | C,R,U,D | - |
| `feedback` | all | C | C | - |
| `prompt_completions` | all | C | C | - |
| `metrics` | all | R | R | - |
| `agents` | all | R | R | - |
| `agent` | all | - | R | - |
| `sessions` | all | C,R,U,D | C,R,U,D | - |
| `message_attachments` | all | C,R | C,R,U,D | - |
| `mcp_servers` | all | C,R,U | R | - |
| `user` | all | R | R | - |
| `team` | all | - | R | - |
| `organization` | all | - | R | - |

Implementation reference:

- `fred-core/fred_core/security/rbac.py`
- `fred-core/fred_core/security/models.py`

## ReBAC (Object-level)

Fred uses OpenFGA schema relations and permissions for fine-grained control.

### Core model

| Object | Main permissions | Rule summary |
| --- | --- | --- |
| `organization` | `can_edit_agent_class_path`, `can_create_team`, `can_create_agent` | Derived from organization roles (`admin`, `editor`, `viewer`) |
| `team` | `can_read`, `can_update_info`, `can_update_agents`, `can_update_resources`, member admin perms | Owner/manager/member hierarchy + optional `public` visibility |
| `agent` | `read`, `update`, `delete` | Owner or delegated through owner team permissions |
| `tag` | `read`, `update`, `delete`, `share` | Direct role, inherited parent relation, or owner-team derived permission |
| `document` | `read`, `update`, `delete`, `process` | Derived from parent tag permissions |
| `resource` | `read`, `update`, `delete`, `share` | Derived from parent tag permissions |

Implementation reference:

- `fred-core/fred_core/security/rebac/schema.fga`
- `fred-core/fred_core/security/rebac/rebac_engine.py`

## Endpoint Enforcement Snapshot

| Area | AuthN | RBAC | ReBAC | Current behavior |
| --- | --- | --- | --- | --- |
| Agentic `/agents*` | yes | partial | yes | Agent CRUD/list constrained mainly by ReBAC checks in service layer |
| Agentic chat sessions/history/attachments | yes | yes | no | RBAC + strict ownership check (`session.user_id == user.uid`) |
| Agentic `/config/model-routing/teams/{team_id}` | yes | fallback `admin` only when ReBAC disabled | yes | Team-level preview guarded by `TeamPermission.CAN_UPDATE_AGENTS` |
| Agentic MCP servers (create/update/delete/restore) | yes | yes | no | RBAC-enforced in service |
| Agentic MCP servers list | yes | no | no | Auth-only endpoint |
| Knowledge Flow `/teams*` | yes | no | yes | Team operations controlled by ReBAC team permissions |
| Knowledge Flow `/users` | yes | yes | no | Requires `user:read` |
| Knowledge Flow tags/resources/metadata | yes | yes | yes | Combined RBAC + object-level ReBAC |
| Knowledge Flow content preview/download | yes | yes | no | RBAC `document:read`, no explicit object-level check in content service |
| Knowledge Flow models (`/models/umap/*`) | yes | no | partial | Some paths indirectly constrained through metadata calls |
| Knowledge Flow statistic/benchmark/reports | yes | no | no | Auth-only functional endpoints |
| Knowledge Flow KPI query | yes | yes | no | `kpi:read` or `kpi:read:global` |
| Health/readiness endpoints | no | no | no | Public liveness/readiness |

## ReBAC Disabled Mode

When ReBAC is disabled (Noop engine):

- `has_permission(...)` returns `True`
- lookup APIs return `RebacDisabledResult`
- services that rely on lookup filtering generally skip object-level filtering

In that mode, behavior becomes mostly **RBAC-only** (plus explicit ownership checks where implemented).

Implementation reference:

- `fred-core/fred_core/security/rebac/rebac_factory.py`
- `fred-core/fred_core/security/rebac/noop_engine.py`
