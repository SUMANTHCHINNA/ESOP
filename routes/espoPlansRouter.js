const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const { createEsopPlan, getEsopPlans, updateEsopPlan, deleteEsopPlan } = require('../controllers/espoPlansController');


router.use(middleware); 
router.post('/createEsopPlan', createEsopPlan);
router.get('/getEsopPlans', getEsopPlans);
router.put('/updateEsopPlan/:id', updateEsopPlan);
// router.delete('/deleteEsopPlan/:id', deleteEsopPlan);
     
module.exports = router;