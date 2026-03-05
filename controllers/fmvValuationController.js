const { getCompanyId } = require('../repository/usersRepository');
const { createValuationService,getActiveValuationService,getValuationHistoryService,getValuationByDateService } = require('../services/fmvValuationService')

const createValuationController = async (req, res) => {
    try {
        const valuationData = {
            ...req.body,
            company_id: await getCompanyId(req.user.user_email)
        };

        const result = await createValuationService(valuationData);

        return res.status(201).json({
            success: true,
            message: "New FMV Valuation created and activated successfully.",
            data: result
        });
    } catch (err) {
        console.error('Error in createValuationController:', err.message);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: err.message || 'Failed to create valuation'
        });
    }
};

const getActiveValuationController = async (req, res) => {
    try {
        const companyId  = await getCompanyId(req.user.user_email)
        const result = await getActiveValuationService(companyId);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};

const getValuationHistoryController = async (req, res) => {
    try {
        const companyId = await getCompanyId(req.user.user_email)
        const result = await getValuationHistoryService(companyId);
        
        return res.status(200).json({
            success: true,
            count: result.length,
            data: result
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};

const getValuationByDateController = async (req, res) => {
    try {
        const companyId  = getCompanyId(req.user.user_email);
        const { date } = req.query; // Expecting format YYYY-MM-DD

        // Default to current date if no specific date is passed
        const targetDate = date || new Date().toISOString().split('T')[0];

        const result = await getValuationByDateService(companyId, targetDate);
        
        return res.status(200).json({
            success: true,
            query_date: targetDate,
            data: result
        });
    } catch (err) {
        console.error('Controller Error:', err.message);
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = {
    createValuationController,
    getActiveValuationController,
    getValuationHistoryController,
    getValuationByDateController
}