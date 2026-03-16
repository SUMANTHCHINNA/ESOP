const express = require("express");
const router = express.Router();
const middleware = require("../Middlewares/auth");
const {
  createExerciseController,
  getExerciseHistroyOfGrantController,
  getExercisesUponStatusController,
  approveOrRejectExerciseController,
} = require("../controllers/exerciseController");

router.post("/createExercise", createExerciseController);
router.get(
  "/getExerciseHistoryOfGrant/:id",
  getExerciseHistroyOfGrantController
);
router.get("/getExercisesUponStatus", getExercisesUponStatusController);
router.patch("/ApproveOrRejectExercise/:id", approveOrRejectExerciseController);

router.use(middleware);

module.exports = router;
