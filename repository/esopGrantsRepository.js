const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const createGrantRepository = async (grantData) => {
    const sql = `
        INSERT INTO esop_grants (
            company_id, employee_id, esop_plan_id, grant_name, 
            grant_date, total_shares, exercise_price, vesting_start_date, 
            vesting_end_date, vesting_period_months, cliff_months, 
            vesting_method, vesting_percentages, status, notes,
            vested_shares, exercised_shares, lapsed_shares
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) 
        RETURNING *;
    `;

    const values = [
        grantData.company_id, grantData.employee_id, grantData.esop_plan_id, grantData.grant_name,
        grantData.grant_date, grantData.total_shares, grantData.exercise_price, grantData.vesting_start_date,
        grantData.vesting_end_date, grantData.vesting_period_months, grantData.cliff_months,
        grantData.vesting_method, grantData.vesting_percentages, grantData.status || 'active', grantData.notes,
        grantData.vested_shares || 0, // Default to 0 if not provided
        grantData.exercised_shares || 0,
        grantData.lapsed_shares || 0
    ];

    try {
        const result = await pool.query(sql, values);
        return result.rows[0];
    } catch (dbError) {
        console.error('DB Error creating grant:', dbError.message);
        throw dbError;
    }
};

const getGrantDetailsOfAnCompanyRepository = async (companyId) => {
    const sql = 'SELECT * FROM esop_grants WHERE company_id = $1';

    try {
        const result = await pool.query(sql, [companyId]);
        return result.rows;
    } catch (dbError) {
        console.error('Database execution error:', dbError.message);
        throw dbError;
    }
}

const getEmployeeGrantsRepository = async (empId, companyId) => {
     const sql = 'SELECT * FROM esop_grants WHERE employee_id = $1 AND company_id = $2';
    try {
        const result = await pool.query(sql, [empId,companyId]);
        console.log(result);
        return result.rows;
    }
    catch (DbError) {
        console.error('Database execution error:', dbError.message);
        throw dbError;
    }
}

module.exports = {
    createGrantRepository,
    getGrantDetailsOfAnCompanyRepository,
    getEmployeeGrantsRepository
}