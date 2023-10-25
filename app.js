const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();


const mongoUrl = 'mongodb+srv://kotharikiran72:2ZA3AESEfrN8JThP@cluster0.qkrgpig.mongodb.net/?retryWrites=true&w=majority'
// process.env.MONGODB_URI
console.log(mongoUrl)
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}) .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });

// Use bodyParser middleware for parsing JSON requests
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const Item = mongoose.model('user', new mongoose.Schema({
  name: String,
  email:String,
  phone:String,
}));

app.get('/users', async (req, res) => {
  const users = await Item.find();
  res.json(users);
});

// API endpoint to store data
app.post('/api/users', async (req, res) => {
  console.log('body',req.body)
  const { name, email, phone } = req.body;

  const newItem = new Item({ name, email, phone });

  try {
    const savedItem = await newItem.save();
    res.json(savedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
