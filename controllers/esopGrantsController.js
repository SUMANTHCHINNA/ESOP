const {
  createGrantService,
  getGrantDetailsOfAnCompanyService,
  getEmployeeGrantsService,
  updateGrantsService,
} = require("../services/esopGrantsService");
const { getCompanyId } = require("../repository/usersRepository");

const createGrantController = async (req, res) => {
  try {
    const grantData = req.body;

    // Ensure critical foreign keys are present
    if (
      !grantData.company_id ||
      !grantData.employee_id ||
      !grantData.esop_plan_id
    ) {
      return res.status(400).json({
        error: "Required IDs missing: company_id, employee_id, or esop_plan_id",
      });
    }

    const newGrant = await createGrantService(grantData);

    return res.status(201).json({
      message: "Grant successfully assigned and initialized",
      data: newGrant,
    });
  } catch (err) {
    console.error("Grant Creation Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

const getGrantDetailsOfAnCompanyController = async (req, res) => {
  try {
    let email = req.user.user_email;
    const companyId = await getCompanyId(email);
    const grantDetailsOfAnCompany = await getGrantDetailsOfAnCompanyService(
      companyId
    );
    return res.status(201).json({
      message: "Grant Details of an company Fetched Successfully",
      data: grantDetailsOfAnCompany,
    });
  } catch (error) {
    console.error(
      "Error in getGrantDetailsOfAnCompanyController :",
      err.message
    );
    return res.status(500).json({ error: err.message });
  }
};

const getEmployeeGrantsController = async (req, res) => {
  try {
    let employeeId = req.params.id;
    // let companyId = await getCompanyId(req.user.user_email);
    const grantDetails = await getEmployeeGrantsService(employeeId);
    return res.status(201).json({
      message: "Grants of an Employee Fetched Successfully",
      data: grantDetails,
    });
  } catch (error) {
    console.error("Error in getEmployeeGrantsController :", error.message);
    return res.status(500).json({ error: error.message });
  }
};

const updateGrantsController = async (req, res) => {
  try {
    const grantId = req.params.id;

    // Pass req.body to the service
    const updatedGrantDetails = await updateGrantsService(grantId, req.body);

    return res.status(200).json({
      message: "Grant updated successfully",
      data: updatedGrantDetails,
    });
  } catch (err) {
    console.error("Error in updateGrantsController:", err.message);
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ error: err.message });
  }
};

module.exports = {
  createGrantController,
  getGrantDetailsOfAnCompanyController,
  getEmployeeGrantsController,
  updateGrantsController,
};
