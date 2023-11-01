const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/user.model');
const UserPayment = require('../models/payment.model');
const router = express.Router();

router.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// API endpoint to store data
router.post('/api/users', async (req, res) => {
  console.log('body',req.body)
  const { name, email, phone } = req.body;

  const newItem = new User({ name, email, phone });

  try {
    const savedItem = await newItem.save();
    res.json(savedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Define a route for receiving webhook events
router.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
   let event = request.body;
   const signature = request.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log(event.type)
      	if(event.type == 'payment_intent.succeeded'){
	      if(data.metadata.user_id){
	         const user_payment = new UserPayment({
	            user_reference:data.metadata.user_id,
	            amount:data.amount,
	            user_email:data.receipt_email,
	            stripe_transaction_id:data.id,
	            stripe_response:payload.data.object 
	        });
	        await user_payment.save();
	      }else{
	        console.log('user id not found')
	      }
	    }
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }
});

module.exports = router;