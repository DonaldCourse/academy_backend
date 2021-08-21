const mongoose = require('mongoose');

const connectDBMongo = async () => {

    try {
        const connect = await mongoose.connect(process.env.MONGODB_URL, {
            auth: {
                user:'',
                password:''
            },
            authSource:"",
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })

        console.log(`MongoDb Connected: ${connect.connection.host}`);

    } catch (error) {
        console.log(`Error MongoDb DisConnected: ${error}`);

    }

};

module.exports = connectDBMongo;
