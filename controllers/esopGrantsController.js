const { createGrantService, getGrantDetailsService } = require('../services/esopGrantsService')

const createGrantController = async (req, res) => {
    try {
        const grantData = req.body;
        
        // Ensure critical foreign keys are present
        if (!grantData.company_id || !grantData.employee_id || !grantData.esop_plan_id) {
            return res.status(400).json({ error: "Required IDs missing: company_id, employee_id, or esop_plan_id" });
        }

        const newGrant = await createGrantService(grantData);

        return res.status(201).json({
            message: 'Grant successfully assigned and initialized',
            data: newGrant
        });
    } catch (err) {
        console.error('Grant Creation Error:', err.message);
        return res.status(500).json({ error: err.message });
    }
};

const getGrantDetailsController = async (req, res) => {
    await getGrantDetailsService(req.body);
}

module.exports = {
    createGrantController,
    getGrantDetailsController
}