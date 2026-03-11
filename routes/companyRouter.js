const express = require("express");
const router = express.Router();
const middleware = require("../Middlewares/auth");
const {
  createCompanyController,
  getCompanyController,
  updateCompanyController,
  getCompanyAdminDetailsController,
} = require("../controllers/companyController");

router.get("/getCompanyDetails/:id", getCompanyController);
router.post("/createCompany", createCompanyController);
router.get("/CompanyAdminDetails/:id", getCompanyAdminDetailsController);

router.use(middleware);
router.put("/updateCompanyDetails/:id", updateCompanyController);

module.exports = router;
