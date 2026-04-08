const { ApolloServer } = require('apollo-server');
const { ApolloGateway } = require('@apollo/gateway');

const gateway = new ApolloGateway({
  serviceList: [
    { name: 'users', url: 'http://localhost:4001/graphql' },
    { name: 'products', url: 'http://localhost:4002/graphql' },
    { name: 'reviews', url: 'http://localhost:4003/graphql' }
  ]
});

const server = new ApolloServer({ gateway, subscriptions: false });
server.listen(4000).then(({ url }) => {
  console.log(`🚀 Gateway ready at ${url}`);
});