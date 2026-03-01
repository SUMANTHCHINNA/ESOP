const express = require('express');
const router = express.Router();
const { createUserController,userLoginController,logoutController,createUserByAdminController } = require('../controllers/authController');
const auth = require('../Middlewares/auth');

router.post('/createUser',createUserController);
router.post('/login', userLoginController); 
router.post('/logout' , logoutController);

router.use(auth);
router.post('/AddEmployee',createUserByAdminController); // Reusing the same controller for both user and employee creation, can be differentiated based on request body

module.exports = router;