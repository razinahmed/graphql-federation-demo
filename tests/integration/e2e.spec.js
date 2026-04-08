const { createTestClient } = require('apollo-server-testing');
const { buildGateway } = require('../../src/gateway');

let gateway;
let query;
let mutate;

beforeAll(async () => {
  gateway = await buildGateway({ serviceList: [
    { name: 'users', url: 'http://localhost:4001/graphql' },
    { name: 'products', url: 'http://localhost:4002/graphql' },
    { name: 'reviews', url: 'http://localhost:4003/graphql' },
  ]});
  const client = createTestClient(gateway);
  query = client.query;
  mutate = client.mutate;
});

afterAll(async () => {
  await gateway.stop();
});

describe('Federated Query Resolution', () => {
  it('should resolve a user with their reviews across subgraphs', async () => {
    const res = await query({
      query: `query { user(id: "u1") { id name reviews { rating comment product { name } } } }`,
    });

    expect(res.errors).toBeUndefined();
    expect(res.data.user.id).toBe('u1');
    expect(res.data.user.name).toBeDefined();
    expect(Array.isArray(res.data.user.reviews)).toBe(true);
    if (res.data.user.reviews.length > 0) {
      expect(res.data.user.reviews[0].product.name).toBeDefined();
    }
  });

  it('should resolve a product with aggregated review score', async () => {
    const res = await query({
      query: `query { product(id: "p1") { id name price averageRating reviews { comment } } }`,
    });

    expect(res.errors).toBeUndefined();
    expect(res.data.product.price).toBeGreaterThan(0);
    expect(typeof res.data.product.averageRating).toBe('number');
  });

  it('should return an error for a non-existent entity', async () => {
    const res = await query({
      query: `query { user(id: "nonexistent") { id name } }`,
    });

    expect(res.data.user).toBeNull();
  });
});

describe('Schema Stitching and Mutations', () => {
  it('should create a review that references both user and product subgraphs', async () => {
    const res = await mutate({
      mutation: `mutation {
        createReview(input: { userId: "u1", productId: "p1", rating: 5, comment: "Excellent product" }) {
          id rating comment user { name } product { name }
        }
      }`,
    });

    expect(res.errors).toBeUndefined();
    expect(res.data.createReview.rating).toBe(5);
    expect(res.data.createReview.user.name).toBeDefined();
    expect(res.data.createReview.product.name).toBeDefined();
  });

  it('should handle __typename introspection across federated types', async () => {
    const res = await query({
      query: `query { user(id: "u1") { __typename id } }`,
    });

    expect(res.data.user.__typename).toBe('User');
  });

  it('should reject malformed queries with a descriptive error', async () => {
    const res = await query({
      query: `query { user(id: "u1") { nonExistentField } }`,
    });

    expect(res.errors).toBeDefined();
    expect(res.errors[0].message).toContain('nonExistentField');
  });
});
