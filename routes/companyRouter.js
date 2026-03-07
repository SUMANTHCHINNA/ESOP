const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const {createCompanyController,getCompanyController,updateCompanyController} = require('../controllers/companyController');

router.get('/getCompanyDetails/:id',getCompanyController);


router.use(middleware); 
router.post('/createCompany',createCompanyController); 
router.put('/updateCompanyDetails/:id',updateCompanyController);  

     
module.exports = router;


    