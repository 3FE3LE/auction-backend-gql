const { ApolloServer } = require('apollo-server');
const jwt = require('jsonwebtoken')

require('dotenv').config({path: '.env'});

const resolvers = require('./db/resolvers');
const typeDefs = require('./db/schema');
const connect = require('./config/db')

// DB connection
connect();

// server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    engine: {
        reportSchema: true
    },
    context: ({ req }) => {
        const token = req.headers['authorization']
        console.log(token)
        if (token) {
            try {
                const user = jwt.verify(token, process.env.KEY_WORD)

                return {
                    user
                }
            } catch (error) {
                console.log(error)
            }
        }
    }

});
// start server
server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`Server on ${url}`);
})