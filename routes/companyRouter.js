const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const {createCompanyController,getCompanyController,updateCompanyController} = require('../controllers/companyController');

router.use(middleware); 
router.post('/createCompany',createCompanyController); 
router.get('/getCompanyDetails',getCompanyController);
router.put('/updateCompanyDetails/:id',updateCompanyController);  

     
module.exports = router;


    