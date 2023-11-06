// routes/auth.js
//const checkAuth = require('../middlewares/auth.middleware');
const userControllers = require('../controllers/user/user.controller');

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

//router.get('/me', checkAuth, adminControllers.getMe);
router.post('/login', userControllers.login);
router.post('/payment', userControllers.payment);

//upload image in bunny
module.exports = router

