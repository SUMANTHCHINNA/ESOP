const express = require('express');
const router = express.Router();
const { createUserController,userLoginController,logoutController } = require('../controllers/authController');
const dotenv = require('dotenv');
dotenv.config();

router.post('/createUser',createUserController);   
router.post('/login', userLoginController); 
router.post('/logout' , logoutController);

module.exports = router;