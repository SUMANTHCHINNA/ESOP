const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const createExerciseRepository = async (body, employeeId, companyId, exercise_price) => {
    console.log(body,employeeId,companyId,exercise_price)
    const sql = `
        INSERT INTO exercises (
            company_id, 
            employee_id, 
            grant_id, 
            shares_exercised, 
            exercise_price, 
            payment_method, 
            tax_withheld, 
            notes
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;

    // 3. Map values from body and arguments
    const values = [
        companyId,
        employeeId,
        body.grant_id,
        body.shares_exercised,
        exercise_price,
        body.payment_method || 'cashless',
        body.withheld || 0, 
        body.notes || null
    ];

    try {
        const result = await pool.query(sql, values);
        return result.rows[0];
    } catch (dbError) {
        console.error('Database Error in createExerciseRepository:', dbError.message);
        throw dbError; 
    }
};

module.exports = {
    createExerciseRepository
}