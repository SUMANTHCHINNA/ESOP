const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const { createGrantController, getGrantDetailsOfAnCompanyController,getEmployeeGrantsController,updateGrantsController } = require('../controllers/esopGrantsController')


router.use(middleware);
router.post('/createGrants', createGrantController)
router.get('/getGrantDetailsOfAnCompany', getGrantDetailsOfAnCompanyController)
router.get('/EmployeeGrants', getEmployeeGrantsController);
router.put('/updateGrants/:id',updateGrantsController)

module.exports = router;