const express = require("express");
const router = express.Router();
const middleware = require("../Middlewares/auth");
const {
  createExitSummaryController,
  getExitSummaryController,
} = require("../controllers/exitSummaryController");

router.get("/getExitSummary/:id", getExitSummaryController);

router.use(middleware);
router.post("/createExitSummary/:id", createExitSummaryController);

module.exports = router;
