const express = require("express");
const router = express.Router();
const middleware = require("../Middlewares/auth");
const {
  getUserDetailsController,
  getUserDetailsOfAnCompanyController,
  terminateUserByIdController,
  getUserRoleController,
  updateUserDetailsController,
  updatePasswordController,
  IspasswordChangedController,
} = require("../controllers/userController");

router.get("/getUserRole/:id", getUserRoleController);
router.get("/IspasswordChanged/:id", IspasswordChangedController);
router.get("/getUserDetails/:id", getUserDetailsController);
router.get("/listAllEmployees/:id", getUserDetailsOfAnCompanyController);


router.use(middleware);

router.patch("/terminateUserById/:id", terminateUserByIdController); // New route for terminating an employee by admin
router.patch("/updateUserDetails/:id", updateUserDetailsController);
router.patch("/updatePassword/:id", updatePasswordController);

module.exports = router;
