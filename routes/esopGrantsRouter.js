const express = require("express");
const router = express.Router();
const middleware = require("../Middlewares/auth");
const {
  createGrantController,
  getGrantDetailsOfAnCompanyController,
  getEmployeeGrantsController,
  updateGrantsController,
  getEsopPlanAndEmployeeDetailsByGrantIdController
} = require("../controllers/esopGrantsController");

router.get("/EmployeeGrants/:id", getEmployeeGrantsController);

router.post("/createGrants", createGrantController);
router.get("/getGrantDetailsOfAnCompany/:id", getGrantDetailsOfAnCompanyController);
router.patch("/updateGrants/:id", updateGrantsController);
router.get("/getEsopPlanAndEmployeeDetailsByGrantId/:id",getEsopPlanAndEmployeeDetailsByGrantIdController)
router.use(middleware);

module.exports = router;
