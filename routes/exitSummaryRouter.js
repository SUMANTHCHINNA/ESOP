const express = require("express");
const router = express.Router();
const middleware = require("../Middlewares/auth");
const {
  createExitSummaryController,
  getExitSummaryController,
  updateExitSummaryController,
  deleteExitSummaryController
} = require("../controllers/exitSummaryController");

router.get("/getExitSummary/:id", getExitSummaryController);

router.use(middleware);
router.post("/createExitSummary", createExitSummaryController);
router.patch("/updateExitSummary/:id",updateExitSummaryController)
router.delete("/deleteExitSummary/:id",deleteExitSummaryController)


module.exports = router;
