const mongoose = require('mongoose');

require('dotenv').config({path: '.env'});

const connect = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECTION,{
            useNewUrlParser: true,
            useUnifiedTopology:true,
            useFindAndModify:false,
            useCreateIndex: true
        })
        console.log('database connected')
    } catch (error) {
        console.log('database no connected');
        console.log(err);
        process.exit(1);
    }
}

module.exports = connect; 