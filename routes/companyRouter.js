const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const {createComapany,getComapany,updateComapany} = require('../controllers/companyController');

router.use(middleware); 
router.post('/createCompany',createComapany); 
router.get('/getCompanyDetails',getComapany);
router.put('/updateCompanyDetails',updateComapany);  

     
module.exports = router;