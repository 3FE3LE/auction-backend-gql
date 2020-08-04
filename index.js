const { ApolloServer} = require('apollo-server');

const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const connect = require('./config/db')

// DB connection
connect();

// server
const server = new ApolloServer({
    typeDefs,
    resolvers

});
// start server
server.listen().then( ({url}) => {
    console.log(`Server on ${url}`);
})