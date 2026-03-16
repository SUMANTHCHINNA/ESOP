const express = require("express");
const router = express.Router();
const middleware = require("../Middlewares/auth");
const {
  createGrantController,
  getGrantDetailsOfAnCompanyController,
  getEmployeeGrantsController,
  updateGrantsController,
} = require("../controllers/esopGrantsController");

router.get("/EmployeeGrants/:id", getEmployeeGrantsController);

router.post("/createGrants", createGrantController);
router.get("/getGrantDetailsOfAnCompany", getGrantDetailsOfAnCompanyController);
router.put("/updateGrants/:id", updateGrantsController);
router.use(middleware);

module.exports = router;
