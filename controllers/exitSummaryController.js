const { exitSummaryService,getExitSummaryService } = require('../services/exitSummaryService');

const createExitSummaryController = async (req, res) => {
    try {
        const id = req.params.id; // Preferred format
        const adminId = req.userId || req.user.id;
        const { termination_date, termination_type } = req.body;

        if (!termination_date) {
            return res.status(400).json({ 
                success: false, 
                message: "termination_date is required." 
            });
        }

        // Defaulting type if not provided in body
        const finalType = termination_type || 'resignation';

        const result = await exitSummaryService.processEmployeeExit(
            id, 
            adminId, 
            termination_date, 
            finalType
        );

        res.status(200).json({
            success: true,
            message: "User termination updated and exit summary created successfully.",
            data: result
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getExitSummaryController = async (req, res) => {
    try {
        const id = req.params.id;

        const summary = await getExitSummaryService.getExitSummary(id);

        res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        // Distinguish between "Not Found" and server errors
        const statusCode = error.message.includes("No exit summary") ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createExitSummaryController, // from previous task
    getExitSummaryController
};

module.exports = { createExitSummaryController,getExitSummaryController };