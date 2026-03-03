const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const createEsopPlanByEmployeer = async (planData) => {
    const sql = `
        INSERT INTO esop_plans (
            company_id, plan_name, total_shares_reserved, shares_allocated, effective_date, expiry_date,
            plan_type, currency, vesting_start_reference, default_vesting_period_years, default_vesting_frequency,
            default_cliff_months, vesting_method, vesting_percentages, strike_price_type, default_strike_price, 
            allow_strike_price_override, post_termination_exercise_days, unvested_lapse_on_termination, 
            vested_lapse_after_window, acceleration_on_change_of_control, acceleration_on_termination_without_cause,
            eligible_participants
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23) 
        RETURNING *
    `;

    const values = [
        planData.company_id, planData.plan_name, planData.total_shares_reserved, planData.shares_allocated || 0,
        planData.effective_date, planData.expiry_date, planData.plan_type, planData.currency,
        planData.vesting_start_reference, planData.default_vesting_period_years, planData.default_vesting_frequency,
        planData.default_cliff_months, planData.vesting_method,
        planData.vesting_percentages ? JSON.stringify(planData.vesting_percentages) : null, // Store as JSON string for JSONB column
        planData.strike_price_type, planData.default_strike_price, planData.allow_strike_price_override,
        planData.post_termination_exercise_days, planData.unvested_lapse_on_termination,
        planData.vested_lapse_after_window, planData.acceleration_on_change_of_control,
        planData.acceleration_on_termination_without_cause, planData.eligible_participants
    ];

    try {
        return await pool.query(sql, values);
    } catch (dbError) {
        console.error('Database execution error:', dbError.message);
        throw dbError;
    }
};



const getEsopPlansOfAnCompany = async (companyId) => {
    const sql = `SELECT * FROM esop_plans WHERE company_id = $1;`;
    
    try {
        const result = await pool.query(sql, [companyId]);
        
        // 1. Safety Check: Return null if no plans found
        if (result.rows.length === 0) return null;

        // 2. Map through plans to calculate status for each
        const plansWithStatus = result.rows.map(plan => {
            const total = parseFloat(plan.total_shares_reserved) || 0;
            const allocated = parseFloat(plan.shares_allocated) || 0;
            
            const available_shares = total - allocated;
            
            // 3. Prevent Division by Zero
            const utilization_percentage = total > 0 
                ? (allocated / total) * 100 
                : 0;

            return {
                ...plan, // Spread the original plan data
                available_shares,
                utilization_percentage: utilization_percentage.toFixed(2) // Keep it clean
            };
        });

        // Return the list of plans with their calculated statuses
        return plansWithStatus;

    } catch (dbError) {
        console.error('Database execution error:', dbError.message);
        throw dbError;
    }
}


const updateEsopPlanRepository = async (id, planData) => {
    const fields = Object.keys(planData);
    if (fields.length === 0) return null;

    // Dynamically create "column_name = $2, column_name = $3..."
    const setClause = fields
        .map((field, index) => `${field} = $${index + 2}`)
        .join(', ');

    const sql = `
        UPDATE esop_plans
        SET ${setClause}, updated_at = NOW()
        WHERE id = $1
        RETURNING *;
    `;

    const values = [id, ...Object.values(planData)];

    try {
        const result = await pool.query(sql, values);
        return result.rows[0];
    } catch (dbError) {
        console.error('Database Error:', dbError.message);
        throw dbError;
    }
};




module.exports = {
    createEsopPlanByEmployeer,
    getEsopPlansOfAnCompany,
    updateEsopPlanRepository
}