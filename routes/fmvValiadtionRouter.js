const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const {createValuationController,getActiveValuationController,getValuationHistoryController,getValuationByDateController,updateValuationController,deleteValuationController} = require('../controllers/fmvValuationController')


router.post('/createValuation',createValuationController);
router.get('/getActiveValuation',getActiveValuationController)
router.get('/getValuationHistory/:id',getValuationHistoryController)
router.get('/getValuationByDate/:id',getValuationByDateController)
router.patch('/updateValuation/:id',updateValuationController)
router.delete('/deleteValuation/:id',deleteValuationController)

router.use(middleware);



module.exports = router;