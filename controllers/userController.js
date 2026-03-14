const {
  getUserDetailsService,
  getCompanyAndEmployeesService,
  terminateUserService,
  getUserRoleService,
  updateUserDetailsService,
  updatePasswordService,
  IspasswordChangedService,
} = require("../services/userService");

const getUserDetailsController = async (req, res) => {
  try {
    const userId = req.params.id;

    // Call the service
    const userDetails = await getUserDetailsService(userId);

    // Success Response
    return res.status(200).json({
      success: true,
      message: "User details retrieved successfully",
      data: userDetails,
    });
  } catch (err) {
    console.error("Error In getUserDetailsController:", err.message);

    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      message: err.message || "Internal server error",
    });
  }
};

const getUserDetailsOfAnCompanyController = async (req, res) => {
  try {
    // adminId is extracted from the auth middleware (JWT)
    const adminId = req.params.id;

    // Call the service to get both company and employee data
    const { company, employees } = await getCompanyAndEmployeesService(adminId);

    return res.status(200).json({
      message: "Company details and employee list retrieved successfully",
      company,
      employees,
    });
  } catch (err) {
    console.error("Error In getUserDetailsOfAnCompanyController:", err.message);

    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      message: err.message || "Internal server error",
    });
  }
};

const terminateUserByIdController = async (req, res) => {
  try {
    const userId = req.params.id;

    // Call the service
    const terminatedUser = await terminateUserService(userId);

    // Success Response
    return res.status(200).json({
      message: "User terminated successfully",
      user: terminatedUser,
    });
  } catch (err) {
    console.error("Error In terminateUserByIdController:", err.message);

    // Use the status code from the error, defaulting to 500
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
      message: err.message || "Internal server error",
    });
  }
};

const getUserRoleController = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No User ID" });
    }

    const role = await getUserRoleService(userId);

    return res.status(200).json({
      success: true,
      message: "Employment type fetched successfully",
      role: role,
    });
  } catch (err) {
    console.error("Controller Error:", err.message);

    // If the table 'users' doesn't exist, it will fall here with a 500
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

const updateUserDetailsController = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const result = await updateUserDetailsService(userId, req.body);

    return res.status(200).json({
      success: true,
      message: "User details updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in updateUserDetailsController:", error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

const updatePasswordController = async (req, res) => {
  try {
    // userId should come from your auth middleware (req.user or req.userId)
    const userId = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "New password is required." });
    }

    await updatePasswordService(userId, newPassword);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (err) {
    console.error("Error in updatePasswordController:", err.message);
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
    });
  }
};

const IspasswordChangedController = async (req, res) => {
  try {
    const userId = req.params.id;

    // Capture the returned object { password_changed: boolean }
    const result = await IspasswordChangedService(userId);

    return res.status(200).json({
      success: true,
      message: "Password status fetched successfully.",
      password_changed: result.password_changed,
    });
  } catch (err) {
    console.error("Error in IspasswordChangedController:", err.message);
    return res.status(err.statusCode || 500).json({
      success: false,
      error: err.message,
    });
  }
};

module.exports = {
  getUserDetailsController,
  getUserDetailsOfAnCompanyController,
  terminateUserByIdController,
  getUserRoleController,
  updateUserDetailsController,
  updatePasswordController,
  IspasswordChangedController,
};
