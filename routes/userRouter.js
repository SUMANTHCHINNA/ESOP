const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const {getUserDetailsController} = require('../controllers/userController');

router.use(middleware); 
router.get('/getUserDetails',getUserDetailsController);   

     
module.exports = router;