// models/UserPayment.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
   user_reference: 
    {
      type: mongoose.Schema.Types.ObjectId, // Define the type as ObjectId
      ref: 'User', // Reference to the User model
    }
  ,
  amount:Number,
  user_email:String,
  stripe_transaction_id:String,
  stripe_response:Object
});

module.exports = mongoose.model('Payment', paymentSchema);
