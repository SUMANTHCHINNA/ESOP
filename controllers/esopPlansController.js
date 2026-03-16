const {
  createEsopPlanService,
  getEsopPlanService,
  updateEsopPlanService,
  getEsopPlanPoolStatusService,
} = require("../services/esopPlanService");
const { getCompanyId } = require("../repository/usersRepository");

const createEsopPlanController = async (req, res) => {
  try {
    const esopPlan = await createEsopPlanService(req.body);

    return res.status(201).json({
      message: "ESOP Plan created successfully",
      plan: esopPlan,
    });
  } catch (err) {
    console.error("Error In createEsopPlanController:", err.message);
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      message: err.message || "Failed to create ESOP Plan",
    });
  }
};

const getEsopPlansController = async (req, res) => {
  try {
    let companyId = req.params.id;
    const esopPlan = await getEsopPlanService(companyId);

    return res.status(201).json({
      message: "ESOP Plans fetched successfully",
      data: esopPlan,
    });
  } catch (err) {
    console.error("Error In getEsopPlans:", err.message);
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      message: err.message || "Failed to create ESOP Plan",
    });
  }
};

const updateEsopPlanController = async (req, res) => {
  try {
    const { id } = req.params;
    const planData = req.body;
    const result = await updateEsopPlanService(id, planData);

    return res.status(200).json({
      message: "ESOP Plan updated successfully",
      data: result,
    });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message });
  }
};

// const deleteEsopPlan = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const query = `
//             DELETE FROM esop_plans
//             WHERE id = $1
//             RETURNING *;
//         `;
//         const result = await pool.query(query, [id]);
//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: 'ESOP Plan not found' });
//         }
//         res.json({ message: 'ESOP Plan deleted successfully', deletedPlan: result.rows[0] });
//     } catch (err) {
//         console.error('Error deleting ESOP Plan:', err);
//         res.status(500).json({ error: 'Failed to delete ESOP Plan' });
//     }
// };

module.exports = {
  createEsopPlanController,
  getEsopPlansController,
  updateEsopPlanController,
  // deleteEsopPlan
};
