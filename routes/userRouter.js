const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const {getUserDetailsController,getUserDetailsOfAnCompanyController,terminateUserByIdController,getUserRoleController,updateUserDetailsController,updatePasswordController} = require('../controllers/userController');


router.get('/getUserRole/:id',getUserRoleController)

router.use(middleware); 

router.get('/getUserDetails',getUserDetailsController);   
router.get('/listAllEmployees',getUserDetailsOfAnCompanyController);
router.patch('/terminateUserById/:id',terminateUserByIdController); // New route for terminating an employee by admin
router.patch('/updateUserDetails/:id',updateUserDetailsController);
router.patch('/updatePassword',updatePasswordController)
     
module.exports = router;