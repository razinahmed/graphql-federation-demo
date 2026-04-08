<div align="center">

<img src="https://placehold.co/900x250/0d1117/e535ab?text=GraphQL+Federation+Demo&font=montserrat" alt="GraphQL Federation Demo Banner" width="100%" />

# GraphQL Federation Demo

**Apollo GraphQL Federation gateway connecting multiple microservices — federated schema composition, distributed tracing, and service-to-service communication with type-safe resolvers**

[![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)](https://graphql.org/)
[![Apollo](https://img.shields.io/badge/Apollo-311C87?style=for-the-badge&logo=apollo-graphql&logoColor=white)](https://www.apollographql.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Project Structure](#-project-structure) · [API Reference](#-api-reference) · [Contributing](#-contributing) · [License](#-license)

</div>

---

## Overview

A complete reference implementation of Apollo GraphQL Federation v2 demonstrating how to compose a unified graph from multiple independent microservices. Each subgraph owns its domain schema while the gateway provides a single endpoint for clients, enabling teams to develop and deploy services independently.

## Features

| Feature | Description |
|---------|-------------|
| **Apollo Gateway** | Unified entry point composing multiple federated subgraphs |
| **Federated Schema** | Schema composition with `@key`, `@external`, and `@requires` directives |
| **Product Service** | Subgraph managing product catalog and inventory data |
| **User Service** | Subgraph handling user profiles, authentication, and preferences |
| **Service Discovery** | Dynamic subgraph registration and health monitoring |
| **Distributed Tracing** | End-to-end request tracing across all federated services |
| **Type-safe Resolvers** | Code-generated TypeScript types from GraphQL schema definitions |
| **Docker Compose** | One-command local development environment for all services |

## Tech Stack

<div align="center">

| Technology | Purpose |
|:----------:|:-------:|
| ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white) | Runtime |
| ![Apollo Server](https://img.shields.io/badge/Apollo_Server-311C87?style=flat-square&logo=apollo-graphql&logoColor=white) | GraphQL Server |
| ![GraphQL](https://img.shields.io/badge/GraphQL_Federation-E10098?style=flat-square&logo=graphql&logoColor=white) | Schema Federation |
| ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) | Containerization |

</div>

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18.0
- [Docker](https://docs.docker.com/get-docker/) >= 20.10
- [Docker Compose](https://docs.docker.com/compose/install/) >= 2.0

### Installation

```bash
# Clone the repository
git clone https://github.com/razinahmed/graphql-federation-demo.git
cd graphql-federation-demo

# Install dependencies for all services
npm install

# Start all services with Docker Compose
docker compose up -d
```

### Quickstart

```bash
# Start the full federation stack
docker compose up -d

# Gateway is available at
# http://localhost:4000/graphql

# Individual subgraph endpoints
# Product Service: http://localhost:4001/graphql
# User Service:    http://localhost:4002/graphql

# Run tests
npm test

# Generate TypeScript types from schema
npm run codegen
```

## Project Structure

```
graphql-federation-demo/
├── gateway/
│   ├── src/
│   │   ├── index.ts              # Apollo Gateway entry point
│   │   ├── config.ts             # Gateway configuration
│   │   └── tracing.ts            # Distributed tracing setup
│   ├── package.json
│   └── Dockerfile
├── services/
│   ├── products/
│   │   ├── src/
│   │   │   ├── schema.graphql    # Product subgraph schema
│   │   │   ├── resolvers.ts      # Product resolvers
│   │   │   ├── datasources/      # Data access layer
│   │   │   └── index.ts          # Service entry point
│   │   ├── package.json
│   │   └── Dockerfile
│   └── users/
│       ├── src/
│       │   ├── schema.graphql    # User subgraph schema
│       │   ├── resolvers.ts      # User resolvers
│       │   ├── datasources/      # Data access layer
│       │   └── index.ts          # Service entry point
│       ├── package.json
│       └── Dockerfile
├── tests/
│   ├── integration/              # Cross-service integration tests
│   └── unit/                     # Unit tests per service
├── codegen.yml                   # GraphQL Code Generator config
├── docker-compose.yml            # Full stack orchestration
└── README.md
```

## API Reference

### Query Examples

**Fetch products with seller information (federated query):**

```graphql
query GetProducts {
  products {
    id
    name
    price
    seller {
      id
      name
      email
    }
  }
}
```

**Fetch user with their product listings:**

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    products {
      id
      name
      price
    }
  }
}
```

### Mutation Examples

**Create a new product:**

```graphql
mutation CreateProduct($input: CreateProductInput!) {
  createProduct(input: $input) {
    id
    name
    price
    createdAt
  }
}
```

### Schema Federation Directives

```graphql
# Product subgraph — extends User entity
type User @key(fields: "id") {
  id: ID! @external
  products: [Product!]!
}

# User subgraph — owns User entity
type User @key(fields: "id") {
  id: ID!
  name: String!
  email: String!
}
```

## Architecture

```
                    ┌──────────────┐
                    │    Client    │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ Apollo       │
                    │ Gateway      │
                    │ :4000        │
                    └──┬───────┬───┘
                       │       │
              ┌────────▼──┐ ┌──▼────────┐
              │ Product   │ │ User      │
              │ Service   │ │ Service   │
              │ :4001     │ │ :4002     │
              └───────────┘ └───────────┘
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-subgraph`)
3. Commit your changes (`git commit -m 'feat: add new subgraph service'`)
4. Push to the branch (`git push origin feature/new-subgraph`)
5. Open a Pull Request

When adding a new subgraph, include schema definitions, resolvers, tests, and a Dockerfile.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with passion by [Razin Ahmed](https://github.com/razinahmed)**

`GraphQL` · `Apollo Federation` · `Microservices` · `API Gateway` · `Federated Schema` · `Node.js`

</div>
