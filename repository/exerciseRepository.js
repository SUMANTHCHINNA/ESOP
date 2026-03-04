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

const getExerciseHistoryOfGrantRepository = async (grantId) => {
    // Sort by exercise_date descending to show the latest transactions first
    const sql = `
        SELECT * FROM exercises 
        WHERE grant_id = $1 
        ORDER BY exercise_date DESC, created_at DESC;
    `;
    try {
        const result = await pool.query(sql, [grantId]);
        return result.rows; 
    } catch (dbError) {
        console.error('Database Error in getExerciseHistoryRepository:', dbError.message);
        throw dbError; 
    }
};

const getExercisesUponStatusRepository = async (status) => {
    const sql = `
        SELECT e.*, u.full_name, g.grant_name 
        FROM exercises e
        JOIN users u ON e.employee_id = u.id
        JOIN esop_grants g ON e.grant_id = g.id
        WHERE e.status = $1::exercise_status_enum
        ORDER BY e.created_at DESC;
    `;
    try {
        const result = await pool.query(sql, [status]);
        return result.rows;
    } catch (dbError) {
        console.error('Database Error:', dbError.message);
        throw dbError;
    }
};

module.exports = {
    createExerciseRepository,
    getExerciseHistoryOfGrantRepository,
    getExercisesUponStatusRepository
}