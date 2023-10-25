// mongoose.js
const mongoose = require('mongoose');
const mongoUrl = 'mongodb+srv://kotharikiran72:2ZA3AESEfrN8JThP@cluster0.qkrgpig.mongodb.net/?retryWrites=true&w=majority'

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });


