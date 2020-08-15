const Product = require('../models/Products')
const Client = require('../models/Clients')
const Order = require('../models/Orders');
const User = require('../models/Users')

require('dotenv').config({ path: '.env' });

const jwt = require('jsonwebtoken');
const bc = require('bcryptjs');
const Orders = require('../models/Orders');




const createJWT = (user, key, exp) => {
    // console.log(user);
    const { id, email, name, lastName } = user;

    return jwt.sign({ id, email, name, lastName }, key, { expiresIn: exp })

}

// Resolvers
const resolvers = {
    Query: {
        getUser: async (_, { token }) => {
            const userId = await jwt.verify(token, process.env.KEY_WORD)
            return userId;
        },
        getProducts: async () => {
            try {
                const products = await Product.find({})
                return products;
            } catch (error) {
                console.log(error)
            }
        },
        getProductById: async (_, { id }) => {
            // Id Validation

            const product = await Product.findById(id);
            if (!product) {
                throw new Error('This product not exist')
            }
            return product;
        },
        getClients: async () => {
            try {
                const clients = await Client.find({});
                return clients
            } catch (error) {
                console.log(error)
            }
        },
        getClientsByUser: async (_, { }, ctx) => {
            try {
                const clients = await Client.find({ seller: ctx.user.id.toString() });
                return clients
            } catch (error) {
                console.log(error)
            }
        },
        getClientById: async (_, { id }, ctx) => {
            const client = await Client.findById(id);

            if (!client) {
                throw new Error('Client no found');
            }
            if (client.seller.toString() !== ctx.user.id) {
                throw new Error('Bad credentials')
            }

            return client
        },
        getOrders: async () => {
            try {
                const orders = await Order.find({});
                return orders;
            } catch (error) {
                console.log(error)
            }
        },
        getOrdersBySeller: async (_, { }, ctx) => {
            console.log(ctx)
            const { id } = ctx.user;
            try {
                console.log(id)
                const orders = await Order.find({ seller: id });
                return orders;
            } catch (error) {
                console.log(error)
            }
        },
        getOrderById: async (_, { id }, ctx) => {
            const order = await Order.findById(id)
            if (!order) {
                throw new Error('This Order not found')
            }

            if (order.seller.toString() !== ctx.user.id) {
                throw new Error('Bad credentials')
            }

            return order;
        },
        getOrdersByStatus: async (_, { status }, ctx) => {
            const orders = await Order.find({ seller: ctx.user.id, status });
            return orders;
        },
        getBestClients: async () => {
            const clients = await Order.aggregate([
                { $match: { status: "COMPLETED" } },
                {
                    $group: {
                        _id: "$client",
                        total: { $sum: '$total' }
                    }
                },
                {
                    $lookup: {
                        from: 'clients',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'client'
                    }
                },
                {
                    $sort: { tola: -1 }
                }
            ]);
            return clients;
        },
        getBestSellers: async () => {
            const sellers = await Order.aggregate([
                { $match: { status: "COMPLETED" } },
                {
                    $group: {
                        _id: "$seller",
                        total: { $sum: "$total" }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'seller'
                    }
                },
                {
                    $limit: 3
                },
                {
                    $sort: { total: -1 }
                }
            ])
            return sellers
        },
        searchProduct: async (_,{text})=> {
            const products = await Product.find({$text:{$search: text}})

            return products;
        }

    },
    Mutation: {
        newUser: async (_, { input }) => {

            const { email, password } = input;
            // validation
            const existUser = await User.findOne({ email });
            if (existUser) {
                throw new Error('This user already exist');
            }

            // password hash
            const salt = await bc.genSalt(10);
            input.password = await bc.hash(password, salt);

            // save on database
            try {
                const user = new User(input);
                user.save();
                return user;
            } catch (error) {
                console.log(error);
            }
        },
        authUser: async (_, { input }) => {
            // Email Validation
            const { email, password } = input;

            const existUser = await User.findOne({ email });
            if (!existUser) {
                throw new Error('This user not exist')
            }
            // Password Validation
            const correctPassword = await bc.compare(password, existUser.password);
            if (!correctPassword) {
                throw new Error('Incorrect password');
            }

            return {
                token: createJWT(existUser, process.env.KEY_WORD, '24h')
            }
        },
        newProduct: async (_, { input }) => {
            try {
                const product = new Product(input);

                const result = await product.save();

                return result
            } catch (error) {
                console.log(error)
            }
        },
        updateProduct: async (_, { id, input }) => {
            let product = await Product.findById(id);
            if (!product) {
                throw new Error('This product not exist')
            }

            product = await Product.findByIdAndUpdate({ _id: id }, input, { new: true });

            return product;
        },
        deleteProduct: async (_, { id }) => {
            let product = await Product.findById(id);
            if (!product) {
                throw new Error('This product not exist')
            }
            product = await Product.findByIdAndDelete({ _id: id });

            return product
        },
        newClient: async (_, { input }, ctx) => {
            // Validations
            const { email } = input;

            const client = await Client.findOne({ email });

            if (client) {
                throw new Error('This client already exist');
            }

            // set Seller
            const newClient = new Client(input);
            newClient.seller = ctx.user.id;

            // save client
            try {
                const result = await newClient.save();
                return result;
            } catch (error) {
                console.log(error)
            }
        },
        updateClient: async (_, { id, input }, ctx) => {
            console.log(ctx)
            let client = await Client.findById(id);
            if (!client) {
                throw new Error('Client not found')
            }

            if (client.seller.toString() !== ctx.user.id) {
                throw new Error('Bad credentials')
            }

            client = await Client.findOneAndUpdate({ _id: id }, input, { new: true });
            return client;
        },
        deleteClient: async (_, { id }, ctx) => {
            let client = await Client.findById(id)

            if (!client) {
                throw new Error('Client not found');
            }

            if (client.seller.toString() !== ctx.user.id) {
                throw new Error('Bad credentials')
            }

            client = await Client.findOneAndDelete({ _id: id })
            return client;
        },
        newOrder: async (_, { input }, ctx) => {
            const { client } = input;

            let ExistClient = await Client.findById(client);
            if (!ExistClient) {
                throw new Error('Client not found');
            }

            if (ExistClient.seller.toString() !== ctx.user.id) {
                throw new Error('Bad credentials')
            }

            for await (const article of input.order) {
                const { id } = article;
                const product = await Product.findById(id);
                if (article.cant > product.cant) {
                    throw new Error(`The article: ${product.name} exceeds available quantity`);
                } else {
                    product.cant = product.cant - article.cant;
                    await product.save()
                }
            }

            const newOrder = new Order(input);

            newOrder.seller = ctx.user.id;

            const result = await newOrder.save()
            return result;

        },
        updateOrder: async (_, { id, input }, ctx) => {
            // Verify Order
            const orderExist = await Order.findById(id);
            if (!orderExist) {
                throw new Error('This order not found');
            }
            // Verify Client
            const clientExist = await Client.findById(input.client);
            if (!clientExist) {
                throw new Error('This client not found');
            }
            // Verify if user own this order
            if (orderExist.seller.toString() !== ctx.user.id) {
                throw new Error('Bad credentials to set this order');
            }
            // Verify if user own this client
            if (clientExist.seller.toString() !== ctx.user.id) {
                throw new Error('Bad credentials to set this client');
            }
            // Verify Stock
            for await (const article of input.order) {
                const { id } = article;
                const product = await Product.findById(id);
                if (article.cant > product.cant) {
                    throw new Error(`The article: ${product.name} exceeds available quantity`);
                } else {
                    product.cant = product.cant - article.cant;
                    await product.save()
                }
            }
            // Update Order
            const result = await Order.findOneAndUpdate({ _id: id }, input, { new: true });
            return result;
        },
        deleteOrder: async (_, { id }, ctx) => {
            const order = await Order.findById(id);
            if (!order) {
                throw new Error('This order not found')
            }
            console.log(order)

            if (order.seller.toString() !== ctx.user.id) {
                throw new Error('Bad credentials')
            }

            const result = await Order.findByIdAndDelete({ _id: id });
            return result;
        }
    }
}

module.exports = resolvers;