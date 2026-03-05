const { getCompanyId } = require('../repository/usersRepository');
const {createValuationService} = require('../services/fmvValuationService')

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

module.exports = {
    createValuationController
}