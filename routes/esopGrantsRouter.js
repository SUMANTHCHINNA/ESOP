const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const {createGrantController,getGrantDetailsController} = require('../controllers/esopGrantsController')


router.use(middleware);
router.post('/createGrants',createGrantController)
router.get('/getGrantDetails:id',getGrantDetailsController)

module.exports = router;