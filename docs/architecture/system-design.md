# System Architecture -- GraphQL Federation Demo

## Overview
This project demonstrates Apollo Federation v2, where a single GraphQL gateway composes a unified schema from multiple independently deployed subgraph services. Clients send all queries to the gateway, which plans execution across subgraphs and assembles the result.

## Components

### 1. Apollo Gateway
- Runs as a standalone Node.js service on port 4000.
- Loads subgraph schemas at startup via the service list or managed federation (Apollo Studio).
- Uses the query planner to decompose incoming operations into sub-requests to the relevant subgraphs.
- Handles response merging, error propagation, and `__typename` resolution.

### 2. Users Subgraph (port 4001)
- Owns the `User` entity with `@key(fields: "id")`.
- Exposes `user(id)` query and `__resolveReference` for federation lookups.
- Backed by a PostgreSQL database.

### 3. Products Subgraph (port 4002)
- Owns the `Product` entity with `@key(fields: "id")`.
- Exposes `product(id)`, `products(limit, offset, category)` queries, and `updateProduct` mutation.
- Backed by a PostgreSQL database with full-text search indexes.

### 4. Reviews Subgraph (port 4003)
- Owns the `Review` entity and extends `User` and `Product` with a `reviews` field.
- Computes `averageRating` for products by aggregating review scores.
- Exposes `createReview` and `deleteReview` mutations.
- Backed by MongoDB for flexible review documents.

## Federation Flow
```
Client --> [Apollo Gateway :4000]
              |--- query plan --->  [Users :4001]
              |--- query plan --->  [Products :4002]
              |--- query plan --->  [Reviews :4003]
              |
           [Response Merge]
              |
           <-- unified response --
```

1. Client sends a query: `{ user(id: "u1") { name reviews { product { name } } } }`.
2. Gateway query planner identifies that `name` comes from Users, `reviews` from Reviews, and `product.name` from Products.
3. Gateway fetches the user from Users subgraph.
4. Gateway sends the user reference to Reviews to resolve `reviews`.
5. For each review, Gateway sends product references to Products to resolve `product.name`.
6. Gateway merges all responses into a single JSON result.

## Schema Composition
- Each subgraph defines its schema using `@key`, `@external`, `@requires`, and `@provides` directives.
- The gateway composes these into a supergraph schema at startup.
- Schema changes are validated using `rover subgraph check` in CI before deployment to prevent composition errors.

## Authentication
- JWTs issued by the Users service are validated at the gateway layer.
- The gateway forwards the decoded user context to subgraphs via the `x-user-id` header.
- Subgraphs use this header for authorization checks on mutations.

## Deployment
- Each subgraph is a separate Docker container deployed to Kubernetes.
- The gateway runs as a Deployment with 2 replicas behind an Ingress.
- Health checks use the Apollo health endpoint (`/.well-known/apollo/server-health`).
- Schema updates trigger a gateway restart via a rolling deployment.
