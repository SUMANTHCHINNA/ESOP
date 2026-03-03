const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const { createGrantController, getGrantDetailsOfAnCompanyController,getEmployeeGrantsController } = require('../controllers/esopGrantsController')


router.use(middleware);
router.post('/createGrants', createGrantController)
router.get('/getGrantDetailsOfAnCompany', getGrantDetailsOfAnCompanyController)
router.get('/EmployeeGrants', getEmployeeGrantsController);

module.exports = router;