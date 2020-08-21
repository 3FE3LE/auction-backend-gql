const { gql } = require('apollo-server');

// Schema
const typeDefs = gql`

    # Types

    type User {
        id: ID
        name: String
        lastName: String
        email: String
        created_at: String
    }
    type Client {
        id: ID
        name:String
        lastName: String
        email: String
        password: String
        company: String
        cellphone: String
        seller: ID
    }

    type Product {
        id: ID
        name: String
        cant: Int
        price: Float
        created_at: String
    }

    type Order {
        id: ID
        order: [OrderGroup]
        total: Float
        client: ID
        seller: ID
        date: String
        status: OrderStatus
    }

    type OrderGroup {
        id: ID
        cant: Int
    }

    type TopClient {
        total: Float
        client: [Client]
    }

    type TopSeller {
        total: Float
        seller: [User]
    }

    type Token {
        token:String
    }

    # Inputs

    input UserInput {
        name:String!
        lastName: String!
        email: String!
        password: String!
    }
    input ClientInput {
        name:String!
        lastName: String!
        email: String!
        company: String!
        cellphone: String
    }

    input ProductInput {
        name: String!
        cant: Int!
        price: Float!
    }

    input AuthInput {
        email: String!
        password: String!
    }

    input OrderProductInput {
        id: ID
        cant: Int
    }

    input OrderInput {
        order: [OrderProductInput]!
        total: Float!
        client: ID! 
        status: OrderStatus
    }

    enum OrderStatus {
        PENDING
        COMPLETE
        CANCELED
    }

    # Queries

    type Query {
        # Users
        getUser: User
        # Products
        getProducts: [Product]
        getProductById (id:ID!): Product
        # Clients
        getClients: [Client]
        getClientsByUser: [Client]
        getClientById(id: ID!): Client
        # Orders
        getOrders: [Order]
        getOrdersBySeller: [Order] 
        getOrderById(id: ID!): Order
        getOrdersByStatus(status: OrderStatus): [Order]
        # Advance Search
        getBestClients: [TopClient]
        getBestSellers: [TopSeller]
        searchProduct(text: String!):[Product]
    }

    # Mutations

    type Mutation {
        # Users
        newUser(input: UserInput): User
        authUser(input: AuthInput): Token
        # Products
        newProduct(input: ProductInput): Product
        updateProduct(id: ID!, input: ProductInput): Product
        deleteProduct(id: ID!): Product
        # Clients
        newClient(input: ClientInput): Client
        updateClient(id: ID!, input: ClientInput): Client
        deleteClient(id: ID): Client
        # Orders
        newOrder(input: OrderInput!): Order
        updateOrder(id:ID!, input: OrderInput): Order
        deleteOrder(id: ID!): Order
    }
`;

module.exports = typeDefs;