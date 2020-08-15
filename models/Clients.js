const mongoose = require('mongoose');

const ClientsSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    cellphone: {
        type: String,
        trim: true
    },
    company:{
        type: String,
        trim: true,
        required: true
    },
    seller:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    }
})

module.exports = mongoose.model('Clients', ClientsSchema)