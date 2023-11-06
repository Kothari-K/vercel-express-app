const express = require('express')
const multer = require('multer');

const app = express()

require('dotenv').config()

// const fs = require('fs');

// const uploadDir = 'uploads/';
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/'); // Specify the folder where uploaded files will be stored
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname); // Generate a unique filename
//   }
// });

const upload = multer({
 // storage: storage,
  limits: { fieldSize: 25 * 1024 * 1024 } // Adjust the file size limit as needed
});

app.use(upload.single('profilePicture')); // used to key "profilePicture"


// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
  if (req.originalUrl === process.env.STRIPE_WEBHOOK_PATH) {
    next();
  } else {
    express.json()(req, res, next);
  }
});


const connectDB = require('./src/config/connectMongo')

connectDB()
    
var usersRouter = require('./src/routes/user.router');

const authMiddleware = require('./src/middleware/auth');


app.use((req, res, next) => {
    console.log('request',req.path)
  if (req.path === '/api/login' || req.path === '/api/register') {
    // Do not use the "auth" middleware for "/login" and "/register" routes
    next();
  } else {
    // Use the "auth" middleware for all other routes
    authMiddleware(req, res, next);
  }
});

app.use((err, req, res, next) => {
    if (err) {
        res.status(401).json({
            error: 'Authentication error',
            success: false
        });
    } else {
        next(err);
    }
});

app.use('/api', usersRouter)


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT)
})