const {
  exitSummaryService,
  getExitSummaryService,
} = require("../services/exitSummaryService");

const createExitSummaryController = async (req, res) => {
  try {
    const id = req.params.id; 
    const adminId = req.userId || req.user.id;
    const { termination_date, termination_type } = req.body;

    if (!termination_date) {
      return res.status(400).json({
        status : false,
        message: "termination_date is required.",
      });
    }

    // Defaulting type if not provided in body
    const finalType = termination_type || "resignation";

    const result = await exitSummaryService.processEmployeeExit(
      id,
      adminId,
      termination_date,
      finalType
    );

    res.status(200).json({
      status : true,
      message:
        "User termination updated and exit summary created successfully.",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const getExitSummaryController = async (req, res) => {
  try {
    const id = req.params.id;

    const summary = await getExitSummaryService.getExitSummary(id);

    res.status(200).json({
      status : true,
      data: summary,
    });
  } catch (error) {
    // Distinguish between "Not Found" and server errors
    const statusCode = error.message.includes("No exit summary") ? 404 : 500;
    res.status(statusCode).json({
      status : false,
      message: error.message,
      data: null,
    });
  }
};

const updateExitSummaryController = async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body; // Contains the fields to be updated

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ status: false, message: "No update data provided" });
    }

    const updatedSummary = await getExitSummaryService.updateExitSummaryService(id, updateData);

    res.status(200).json({
      status: true,
      message: "Exit summary updated successfully",
      data: updatedSummary,
    });
  } catch (error) {
    const statusCode = error.message.includes("No exit summary") ? 404 : 500;
    res.status(statusCode).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};

const deleteExitSummaryController = async (req, res) => {
  try {
    const id = req.params.id;
    await getExitSummaryService.deleteExitSummaryService(id);

    // Return a success response so the frontend can update its UI
    res.status(200).json({
      status: true,
      message: "Exit summary deleted successfully"
    });
  } catch (error) {
    const statusCode = error.message.includes("No exit summary") ? 404 : 500;
    res.status(statusCode).json({
      status: false,
      message: error.message
    });
  }
};

module.exports = {
  createExitSummaryController, // from previous task
  getExitSummaryController,
  deleteExitSummaryController
};

module.exports = { createExitSummaryController, getExitSummaryController,updateExitSummaryController ,deleteExitSummaryController};
