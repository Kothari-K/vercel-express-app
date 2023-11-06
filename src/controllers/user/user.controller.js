const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/user.model');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const UserPayment = require('../../models/payment.model');
const axios = require('axios');
const fs = require('fs');
const apiKey = process.env.BUNNY_API_KEY;
const storageZoneName = process.env.BUNNY_STORE_ZONE;   
const sendgridMail = require('@sendgrid/mail');
const sendgridConfig = require('../../config/sendgridConfig');
sendgridMail.setApiKey(sendgridConfig.apiKey);
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');


const uploadImage = async (req, res, next) => {
   const image = req.file;
   console.log(image)
   const userId = req.user.userId;
   const imagename = `${userId}-${image.originalname}`;
   const url = `${process.env.BUNNY_UPLOAD_URL}/${storageZoneName}/${imagename}`
  const imageBuffer = image.buffer;
  try {
    const response = await axios({
      method: 'put',
      url: url,
      headers: {
        'AccessKey': apiKey,
        'Content-Type': 'application/octet-stream',
      },
      data: imageBuffer,
    });

    // Handle the response, and you can store the file URL in your database.
    console.log('Uploaded file:', response.data);
    //fs.unlinkSync(image.path);
    next();
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
};

//Delete File form bunny storage
async function deleteFile(filename) {
  console.log(filename)
  const url = `${process.env.BUNNY_UPLOAD_URL}/${storageZoneName}/${filename}`
  try {
    await axios.delete(url, {
      headers: {
        'AccessKey': apiKey,
      },
    });
    console.log(`File ${filename} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting file ${filename}:`, error);
  }
}

// Login route
const login =  async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log(username)
    const user = await User.findOne({ username });
    console.log(user)
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Password invalid' });
    }

    const secret = process.env.SECRET_KEY;
    const token = jwt.sign(
      { userId: user._id, username: user.username },
        secret, // Replace with your secret key
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// Payment route
const payment =  async (req, res) => {
   try {
          if (!req.body.user_reference || !req.body.amount || !req.body.user_email || !req.body.stripe_transaction_id || !req.body.stripe_response)
          {
            return res.status(400).json({ message: 'All required fields must be provided' });
          }
        const referenceId = new ObjectId(req.body.user_reference);
        const { amount,user_email,stripe_transaction_id,stripe_response } = req.body;
     
        const user_payment = new UserPayment({
          user_reference:referenceId,
          amount,
          user_email,
          stripe_transaction_id,
          stripe_response:JSON.parse(stripe_response) 
      });
    console.log("user_payment",user_payment)
    await user_payment.save();
    res.status(200).json({ message: 'Payment created successfully' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error });
  }
 
};

/*
//Update user details
router.put('/update', verifyToken, uploadImage , async (req, res) => {
  const userId = req.user.userId;
   try {
      const { username, email,password,age,gender,country,balance } = req.body;
      // Fetch user data from your database (e.g., MongoDB) using 'decoded.id'
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'user not found' });
      }

      if (username) user.username = username;
      if (email) user.email = email;
      if (age) user.age = age;
      if (gender) user.gender = gender;
      if (country) user.country = country;
      if (balance) user.balance = balance;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }
      
      if (req.body.friends !== undefined ) {
          const friendIds = JSON.parse(req.body.friends)
          user.friends = friendIds.map(id => new ObjectId(id));
      }
      if (req.body.roles !== undefined) {
          user.roles = JSON.parse(req.body.roles)
      }
       if (req.body.preferences !== undefined) {
          user.roles = JSON.parse(req.body.preferences)
      }
      if (req.file !== undefined) {

        if (user.profilePicture) {
          if(user.profilePicture != `${userId}-${req.file.originalname}`)
          {
            deleteFile(user.profilePicture);
          }
        }
        user.profilePicture = `${userId}-${req.file.originalname}`;
      }
      await user.save();
      res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error });
    }
});



router.post('/new-signup',async (req, res) => {
  const { username, email,password,auth_id } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({
      username,
      email,
      password: hashedPassword,
      auth_id
    });
    await user.save() 
            .then((user) => {
              console.log('User saved successfully');
            })
            .catch((error) => {
              console.log(error)
              res.status(403).json({ message: "Username or email is not unique"});  
            });
    const secret = process.env.SECRET_KEY;

    const token = jwt.sign(
                { userId: user._id, username: user.username },
                  secret, // Replace with your secret key
                { expiresIn: '1h' }
              );
 
    const msg = {
            to: `${process.env.MAIL_FROM_ADDRESS}`,
            from: email, // Replace with your sender email address
            subject: 'Welcome to Your App - Confirm Your Email',
            text: 'Thank you for signing up. Please confirm your email by clicking on the link below:',
            html: `<a href="${process.env.VERCEL_URL}/api/confirm-email/${token}">Confirm Email</a>`,
          };
    //sending mail
    sendgridMail
              .send(msg)
              .then(() => {
                console.log('Email sent');
                res.status(200).json({ message: 'Email sent successfully' });
              })
              .catch((error) => {
                console.error('Error sending email:', error);
                res.status(500).json({ message: 'Failed to send email' });
              });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Signup failed' });
  }
});

router.post('/stripe/webhook', express.raw({type: 'application/json'}), async(req, res) => {
 
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    // Handle the verified event here
    const payload = JSON.parse(req.body);
    const data = payload.data.object
   
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
    res.status(200).end();
  } catch (err) {
    console.log(err.message)
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

router.get('/confirm-email/:token',async (req, res) => {
  const token = req.params.token;
  const jwtSecret = process.env.SECRET_KEY;
  if (!token) {
    return res.status(401).json({ error: 'Token is missing' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // Make the user data accessible in subsequent route handlers
  } catch (err) {
    res.send(401).json({ error: 'Invalid token' });
  }
  res.send('successfully verify');

})*/

module.exports = {
	login,
  payment
};

