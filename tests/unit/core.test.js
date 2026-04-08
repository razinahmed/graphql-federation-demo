const { buildSubgraphSchema } = require('@apollo/subgraph');
const { UserResolver } = require('../../src/subgraphs/users/resolvers');
const { ProductResolver } = require('../../src/subgraphs/products/resolvers');
const { ReviewResolver } = require('../../src/subgraphs/reviews/resolvers');
const { mergeTypeDefs } = require('../../src/schema-utils');

describe('User Subgraph Resolvers', () => {
  it('should resolve a user by ID', async () => {
    const user = await UserResolver.Query.user(null, { id: 'u1' });
    expect(user).toEqual({ id: 'u1', name: 'Alice', email: 'alice@example.com' });
  });

  it('should resolve the __resolveReference for federation', async () => {
    const ref = await UserResolver.User.__resolveReference({ id: 'u1' });
    expect(ref.name).toBe('Alice');
  });

  it('should return null for a non-existent user', async () => {
    const user = await UserResolver.Query.user(null, { id: 'missing' });
    expect(user).toBeNull();
  });
});

describe('Product Subgraph Resolvers', () => {
  it('should resolve a product by ID with price', async () => {
    const product = await ProductResolver.Query.product(null, { id: 'p1' });
    expect(product.id).toBe('p1');
    expect(product.price).toBeGreaterThan(0);
    expect(product.name).toBeDefined();
  });

  it('should list products with pagination', async () => {
    const result = await ProductResolver.Query.products(null, { limit: 5, offset: 0 });
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items.length).toBeLessThanOrEqual(5);
    expect(result.total).toBeGreaterThan(0);
  });

  it('should resolve __resolveReference for product federation', async () => {
    const ref = await ProductResolver.Product.__resolveReference({ id: 'p1' });
    expect(ref.name).toBeDefined();
  });
});

describe('Review Subgraph Resolvers', () => {
  it('should resolve reviews for a product', async () => {
    const reviews = await ReviewResolver.Product.reviews({ id: 'p1' });
    expect(Array.isArray(reviews)).toBe(true);
    reviews.forEach((r) => {
      expect(r).toHaveProperty('rating');
      expect(r).toHaveProperty('comment');
      expect(r).toHaveProperty('userId');
    });
  });

  it('should compute averageRating across reviews', async () => {
    const avg = await ReviewResolver.Product.averageRating({ id: 'p1' });
    expect(typeof avg).toBe('number');
    expect(avg).toBeGreaterThanOrEqual(1);
    expect(avg).toBeLessThanOrEqual(5);
  });

  it('should create a new review', async () => {
    const review = await ReviewResolver.Mutation.createReview(null, {
      input: { userId: 'u1', productId: 'p1', rating: 4, comment: 'Great' },
    });
    expect(review.id).toBeDefined();
    expect(review.rating).toBe(4);
  });
});

describe('Schema Utilities', () => {
  it('should merge type definitions from multiple subgraphs without conflicts', () => {
    const merged = mergeTypeDefs(['users', 'products', 'reviews']);
    expect(merged).toContain('type User');
    expect(merged).toContain('type Product');
    expect(merged).toContain('type Review');
  });

  it('should preserve @key directives in merged schema', () => {
    const merged = mergeTypeDefs(['users', 'products']);
    expect(merged).toContain('@key(fields: "id")');
  });
});
