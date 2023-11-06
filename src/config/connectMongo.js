const mongoose = require('mongoose')
mongoose.set('strictQuery', false);

const mongoUrl = process.env.MONGODB_URI

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUrl)
    } catch (error) {
        console.log("Connect failed " + error.message )
    }
}

module.exports = connectDB