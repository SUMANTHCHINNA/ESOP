const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const {createValuationController,getActiveValuationController,getValuationHistoryController,getValuationByDateController} = require('../controllers/fmvValuationController')

router.use(middleware);

router.post('/createValuation',createValuationController);
router.get('/getActiveValuation',getActiveValuationController)
router.get('/getValuationHistory',getValuationHistoryController)
router.get('/getValuationByDate',getValuationByDateController)


module.exports = router;