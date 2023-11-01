
const dotenv = require('dotenv');


dotenv.config();

const app = express();



// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
  if (req.originalUrl === process.env.STRIPE_WEBHOOK_PATH) {
    next();
  } else {
    express.json()(req, res, next);
  }
});


const connectDB = require('./db')

connectDB()

app.use('', require('./routes/auth'));

// Start your Express server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
