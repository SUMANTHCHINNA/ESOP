const express = require("express");
const router = express.Router();
const middleware = require("../Middlewares/auth");
const {
  createCompanyController,
  getCompanyController,
  updateCompanyController,
  getCompanyAdminDetailsController,
  getActiveEmployeeOfAnCompanyController
} = require("../controllers/companyController");

router.get("/getCompanyDetails/:id", getCompanyController);
router.post("/createCompany", createCompanyController);
router.get("/CompanyAdminDetails/:id", getCompanyAdminDetailsController);
router.get("/getActiveEmployeeOfAnCompany/:id",getActiveEmployeeOfAnCompanyController)

router.use(middleware);
router.patch("/updateCompanyDetails/:id", updateCompanyController);

module.exports = router;
