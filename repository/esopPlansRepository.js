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
        planData.company_id, planData.plan_name, planData.total_shares_reserved, planData.shares_allocated, 
        planData.effective_date, planData.expiry_date, planData.plan_type, planData.currency, 
        planData.vesting_start_reference, planData.default_vesting_period_years, planData.default_vesting_frequency,
        planData.default_cliff_months, planData.vesting_method, planData.vesting_percentages, 
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

module.exports = {
    createEsopPlanByEmployeer
}