const { getCompanyId } = require('../repository/usersRepository');
const { createValuationService, getActiveValuationService,deleteValuationService, getValuationHistoryService, getValuationByDateService,updateValuationService } = require('../services/fmvValuationService')

const createValuationController = async (req, res) => {
    try {
        const valuationData = {
            ...req.body,
            company_id: req.body.company_id
        };

        const result = await createValuationService(valuationData);

        return res.status(201).json({
            status: true,
            message: "New FMV Valuation created and activated successfully.",
            data: result
        });
    } catch (err) {
        console.error('Error in createValuationController:', err.message);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            status: false,
            message: err.message || 'Failed to create valuation'
        });
    }
};

const getActiveValuationController = async (req, res) => {
    try {
        const companyId = await getCompanyId(req.user.user_email)
        const result = await getActiveValuationService(companyId);

        return res.status(200).json({
            status: true,
            data: result
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ status: false, message: err.message });
    }
};

const getValuationHistoryController = async (req, res) => {
    try {
        const companyId = req.params.id
        const result = await getValuationHistoryService(companyId);

        return res.status(200).json({
            status: true,
            count: result.length,
            data: result
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ status: false, message: err.message });
    }
};

const getValuationByDateController = async (req, res) => {
    try {
        const companyId = req.params.id;
        const { date } = req.query; // Expecting format YYYY-MM-DD

        // Default to current date if no specific date is passed
        const targetDate = date || new Date().toISOString().split('T')[0];

        const result = await getValuationByDateService(companyId, targetDate);

        return res.status(200).json({
            status: true,
            query_date: targetDate,
            data: result
        });
    } catch (err) {
        console.error('Controller Error:', err.message);
        return res.status(err.statusCode || 500).json({
            status: false,
            message: err.message
        });
    }
};

const updateValuationController = async (req, res) => {
    try {
        const valuationId = req.params.id; // The UUID of the specific valuation
        const updateFields = req.body;     // All fields to be updated

        const result = await updateValuationService(valuationId, updateFields);
        
        return res.status(200).json({
            status: true,
            message: "Valuation updated successfully",
            data: result
        });
    }
    catch (err) {
        console.error('Controller Error:', err.message);
        return res.status(err.statusCode || 500).json({
            status: false,
            message: err.message
        });
    }
}

const deleteValuationController = async(req,res)=>{
    try{
         const valuationId = req.params.id; // The UUID of the specific valuation
        

        const result = await deleteValuationService(valuationId);
        
        return res.status(200).json({
            status: true,
            message: "Valuation deleted successfully",
            data: result
        });
    }
    catch(err){
         console.error('Controller Error:', err.message);
        return res.status(err.statusCode || 500).json({
            status: false,
            message: err.message
        });
    }
}

module.exports = {
    createValuationController,
    getActiveValuationController,
    getValuationHistoryController,
    getValuationByDateController,
    updateValuationController,
    deleteValuationController
}