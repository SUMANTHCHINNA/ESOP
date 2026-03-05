const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const {createValuationController} = require('../controllers/fmvValuationController')

router.use(middleware);

router.post('/createValuation',createValuationController);


module.exports = router;