---
title: "Security"
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


Remember Fred is only a great starting example. Should you use it to design your own solution; 
here is a recap of its current security architecture. 

| Security Feature            | Implementation |
|-----------------------------|---------------|
| **Authentication**         | Keycloak (OIDC) |
| **User Roles**             | Admin, Editor, Viewer |
| **RBAC Enforcement**       | Backend API checks user roles |
| **WebSocket Security**     | Token authentication per session |
| **Document Store Access**  | Only admins can upload/delete |
| **Audit Logging**          | Tracks key actions |
| **Session Isolation**      | Users cannot see each other’s conversations |

## Authentication with Keycloak (OIDC)

Fred’s UI is built with TypeScript (React) and includes Keycloak authentication to manage user identities.

🔹 How It Works

1. The UI redirects users to Keycloak for authentication.
2. After login, Keycloak issues an **OIDC access token** (JWT).
3. The UI stores the token securely and includes it in API requests.
4. The Python backend verifies the token before processing any request.
5. User roles are extracted from the token to enforce access control.

🔹 User Roles
Keycloak assigns roles to users based on their permissions. If you use the default docker compose setup, you will have three users with:
- **Admin**: Full access, can **upload/delete documents**, manage chat sessions, and configure agents.
- **Editor**: Can modify some settings but **cannot delete critical data**.
- **Viewer**: Can **only read** data and interact with chatbots but **cannot modify or delete anything**.

## Backend

The backend is protected using OIDC-based authentication. Every request to the API must include a valid Keycloak token.

* **Token Verification**: Each request is validated against Keycloak.
* **Role-Based Access Control (RBAC)**: Users can only perform actions allowed by their roles.
* **Session Isolation**: Users cannot access chatbot conversations from other users.
* **Audit Logging**: Important actions (e.g., document uploads, chatbot queries) are logged.