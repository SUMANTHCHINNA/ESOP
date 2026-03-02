const {createEsopPlanService} = require('../services/esopPlanService')

const createEsopPlanController = async (req, res) => {
    try {
        const esopPlan = await createEsopPlanService(req.body);

        return res.status(201).json({
            message: 'ESOP Plan created successfully',
            plan: esopPlan
        });
    } catch (err) {
        console.error('Error In createEsopPlanController:', err.message);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message || 'Failed to create ESOP Plan'
        });
    }
};

const getEsopPlans = async (req, res) => {
    try {
        const query = `
            SELECT * FROM esop_plans;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching ESOP Plans:', err);
        res.status(500).json({ error: 'Failed to fetch ESOP Plans' });
    }
};

const updateEsopPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { company_id, plan_name, total_shares_reserved } = req.body;
        const query = `
            UPDATE esop_plans
            SET company_id = $2,
                plan_name = $3,
                total_shares_reserved = $4,
                updated_at = NOW()
            WHERE id = $1
            RETURNING *;
        `;
        const result = await pool.query(query, [id, company_id, plan_name, total_shares_reserved]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'ESOP Plan not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating ESOP Plan:', err);
        res.status(500).json({ error: 'Failed to update ESOP Plan' });
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
    getEsopPlans,
    updateEsopPlan,
    // deleteEsopPlan 
}