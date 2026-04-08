# GraphQL Federation Demo API

## Gateway Endpoint

### `POST /graphql`
The single entry point for all federated queries. The Apollo Gateway routes requests to the appropriate subgraph services.

**Headers:**
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | For mutations | `Bearer <JWT>` |
| `Content-Type` | yes | `application/json` |

## Queries

### `user(id: ID!): User`
Fetch a user by ID. Fields are resolved from the Users subgraph; nested `reviews` are resolved from the Reviews subgraph.

```graphql
query {
  user(id: "u1") { id name email reviews { rating comment product { name } } }
}
```

### `product(id: ID!): Product`
Fetch a single product. `averageRating` and `reviews` are stitched in from the Reviews subgraph.

```graphql
query {
  product(id: "p1") { id name price averageRating reviews { rating comment } }
}
```

### `products(limit: Int, offset: Int, category: String): ProductConnection`
Paginated product listing with optional category filter.

**Response shape:** `{ items: [Product], total: Int }`

### `orders(userId: ID!): [Order]`
List orders for a user. Requires authentication.

## Mutations

### `createReview(input: CreateReviewInput!): Review`
Create a product review. Input fields: `userId`, `productId`, `rating` (1-5), `comment`.

### `updateProduct(id: ID!, input: UpdateProductInput!): Product`
Update product fields (admin only). Input fields: `name`, `price`, `description`, `stock`.

### `deleteReview(id: ID!): Boolean`
Delete a review by ID. Only the review author or an admin can perform this action.

## Subgraph Services

| Service | Port | Entities | Description |
|---------|------|----------|-------------|
| Users | 4001 | `User` | User profiles and authentication |
| Products | 4002 | `Product` | Product catalog and inventory |
| Reviews | 4003 | `Review` | Ratings and reviews, extends `User` and `Product` |

## Introspection
Schema introspection is enabled in development. In production, use `apollo schema:download` or the Apollo Studio explorer to browse the federated schema.

## Error Handling
All errors follow the standard GraphQL error format with `extensions.code` set to `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, or `BAD_USER_INPUT`.
