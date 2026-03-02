const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createUserController,userLoginController,logoutController,createUserByAdminController,bulkAddEmployeesController } = require('../controllers/authController');
const auth = require('../Middlewares/auth');

// Configure Multer to store files temporarily in 'uploads/' folder
const upload = multer({ dest: 'uploads/' ,limits: { fileSize: 10 * 1024 * 1024 }});

router.post('/createUser',createUserController);
router.post('/login', userLoginController); 
router.post('/logout' , logoutController);

router.use(auth);
router.post('/AddEmployee',createUserByAdminController); // Reusing the same controller for both user and employee creation, can be differentiated based on request body
router.post('/BulkAddEmployees',upload.single('file'), bulkAddEmployeesController); // New controller for bulk adding employees

module.exports = router;