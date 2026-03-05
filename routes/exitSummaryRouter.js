const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const {createExitSummaryController,getExitSummaryController} = require('../controllers/exitSummaryController')

router.use(middleware);
router.post('/createExitSummary/:id',createExitSummaryController)
router.get('/getExitSummary/:id', getExitSummaryController);


module.exports = router;