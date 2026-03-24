const express = require("express");
const router = express.Router();
const middleware = require("../Middlewares/auth");
const {
  createEsopPlanController,
  getEsopPlansController,
  updateEsopPlanController,
  deleteEsopPlan,
  getEsopPoolStatusController,
} = require("../controllers/esopPlansController");

router.post("/createEsopPlan", createEsopPlanController);
router.get("/getEsopPlans/:id", getEsopPlansController);
router.patch("/updateEsopPlan/:id", updateEsopPlanController);
// router.delete('/deleteEsopPlan/:id', deleteEsopPlan);

router.use(middleware);

module.exports = router;
