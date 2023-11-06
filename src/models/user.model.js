// models/User.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new Schema({
  username: { type: String, unique: true }, // Ensure unique usernames
  email: { type: String, unique: true },
  auth_id:String,
  password: String,
  age:Number,
  gender:String,
  country:String,
  balance:Number,
  registrationDate:{
    type: Date,
    default: Date.now // You can set a default value if needed
  },
  profilePicture:String,
  roles: {
    type: [String], // An array of strings
    default: ['user'], // Default value if roles are not provided
  },
  preferences: Object,
   friends: [
    {
      type: mongoose.Schema.Types.ObjectId, // Define the type as ObjectId
      ref: 'User', // Reference to the User model
    }
  ],
});


userSchema.plugin(uniqueValidator); // Apply the unique validator plugin

module.exports = mongoose.model('User', userSchema);
