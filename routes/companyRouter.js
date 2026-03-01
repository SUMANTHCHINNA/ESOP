const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const {createCompany,getCompany,updateCompany} = require('../controllers/companyController');

router.use(middleware); 
router.post('/createCompany',createCompany); 
router.get('/getCompanyDetails',getCompany);
router.put('/updateCompanyDetails/:id',updateCompany);  

     
module.exports = router;