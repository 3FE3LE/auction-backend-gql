const { ApolloServer} = require('apollo-server');

const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const connect = require('./config/db')

// DB connection
connect();

// server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    engine: {    
        reportSchema: true
      }

});
// start server
server.listen({ port: process.env.PORT || 4000 }).then( ({url}) => {
    console.log(`Server on ${url}`);
})