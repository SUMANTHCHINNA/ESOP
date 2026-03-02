const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const { createEsopPlanController, getEsopPlans, updateEsopPlan, deleteEsopPlan } = require('../controllers/esopPlansController');


router.use(middleware);
router.post('/createEsopPlan', createEsopPlanController);
router.get('/getEsopPlans', getEsopPlans);
router.put('/updateEsopPlan/:id', updateEsopPlan);
// router.delete('/deleteEsopPlan/:id', deleteEsopPlan);

module.exports = router;