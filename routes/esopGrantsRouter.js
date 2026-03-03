const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const {createGrantsController,getGrantDetailsController} = require('../controllers/esopGrantsController')


router.use(middleware);
router.get('/createGrants',createGrantsController)
router.get('/getGrantDetails:id',getGrantDetailsController)

module.exports = router;