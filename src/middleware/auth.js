
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    //const token = req.headers['x-access-token']
    const token = req.headers.authorization.split(' ')[1];
    const jwtSecret = process.env.SECRET_KEY;

    if (token) {
        try {
                const decoded = jwt.verify(token, jwtSecret);
                req.user = decoded; // Make the user data accessible in subsequent route handlers
                next(); // Continue to the protected route
            } catch (err) {
                next(err);
        }
       // next()
    }else {
        return res.status(401).send({
            message: 'Missing token',
            success: false
        })
    } 
}

module.exports = authMiddleware;
