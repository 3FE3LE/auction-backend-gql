const { gql } = require('apollo-server');

// Schema
const typeDefs = gql`
    type User {
        name: String
        lastNAme: String
        email: String
        password: String
        created_at: String
    }

    type Product {
        name: String
        code: String
        category: String
    }

    input UserInput {
        email : String
    }

    type Query {
        getUsers (input: UserInput!): [User]
        getProducts: [Product]
    }
`;

module.exports = typeDefs;