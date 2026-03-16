const { getCompanyId } = require("../repository/usersRepository");
const {
  createExerciseService,
  getExerciseHistoryOfGrantService,
  getExercisesUponStatusService,
  approveOrRejectExerciseService,
} = require("../services/exerciseService");
const {
  getEmployeeGrantDetailsRepository,
} = require("../repository/esopGrantsRepository");

const createExerciseController = async (req, res) => {
  try {
    const employeeId = req.body.employee_id;
    const companyId = req.body.company_id;

    if (!req.body.grant_id) {
      return res.status(400).json({ message: "Grant ID is required" });
    }
    const grantDetails = await getEmployeeGrantDetailsRepository(
      req.body.grant_id
    );
    const grant = Array.isArray(grantDetails) ? grantDetails[0] : grantDetails;

    if (!grant) {
      return res.status(404).json({ message: "Grant not found" });
    }
    const exercisePrice = grant.exercise_price;
    const result = await createExerciseService(
      req.body,
      employeeId,
      companyId,
      exercisePrice
    );

    return res.status(201).json({
      message: "Exercise created successfully",
      exercise: result,
    });
  } catch (err) {
    console.error("Error In createExerciseController:", err.message);
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      message: err.message || "Failed to create Exercise",
    });
  }
};

const getExerciseHistroyOfGrantController = async (req, res) => {
  try {
    const grantId = req.params.id;

    // Await the service and capture the returned data
    const history = await getExerciseHistoryOfGrantService(grantId);

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (err) {
    console.error("Error In getExerciseHistroyOfGrantController:", err.message);

    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: err.message || "Failed to fetch Exercise History",
    });
  }
};

const getExercisesUponStatusController = async (req, res) => {
  try {
    // GET requests use req.query for ?status=value
    const { status } = req.query;

    const data = await getExercisesUponStatusService(status);

    return res.status(200).json({
      success: true,
      count: data.length,
      data: data,
    });
  } catch (err) {
    // Corrected variable from 'error' to 'err' to prevent reference errors
    console.error("Error In getExercisesUponStatusController:", err.message);

    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: err.message || "Failed to fetch Exercises",
    });
  }
};

const approveOrRejectExerciseController = async (req, res) => {
  try {
    const { action } = req.query; // 'approve' or 'reject'
    const { rejection_reason } = req.body;
    const exerciseId = req.params.id;
    const adminUserId = req.user.id;

    const result = await approveOrRejectExerciseService(
      exerciseId,
      action,
      adminUserId,
      rejection_reason
    );

    return res.status(200).json({
      success: true,
      message: `Exercise request has been ${action}ed successfully.`,
      data: result,
    });
  } catch (err) {
    console.error("Error In approveOrRejectExerciseController:", err.message);
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: err.message || "Failed to process Exercise request",
    });
  }
};

module.exports = {
  createExerciseController,
  getExerciseHistroyOfGrantController,
  getExercisesUponStatusController,
  approveOrRejectExerciseController,
};
