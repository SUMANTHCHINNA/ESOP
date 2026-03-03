const express = require('express');
const router = express.Router();
const middleware = require('../Middlewares/auth');
const { createEsopPlanController, getEsopPlansController, updateEsopPlanController, deleteEsopPlan, getEsopPoolStatusController } = require('../controllers/esopPlansController');


router.use(middleware);
router.post('/createEsopPlan', createEsopPlanController);
router.get('/getEsopPlans', getEsopPlansController);
router.put('/updateEsopPlan/:id', updateEsopPlanController);
// router.delete('/deleteEsopPlan/:id', deleteEsopPlan);

module.exports = router;