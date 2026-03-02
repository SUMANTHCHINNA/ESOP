const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const createUser = async (fullName, email, password) => {
    const sql = `
        INSERT INTO users (full_name, user_email, user_pass) 
        VALUES ($1, $2, $3) 
        RETURNING *
    `;

    try {
        console.log(`--- Attempting to insert user: ${email} ---`);
        const result = await pool.query(sql, [fullName, email, password]);
        return result;
    } catch (dbError) {
        console.error('Database execution error:', dbError.message);
        throw dbError;
    }
};

const createUserByAdmin = async (
    employeeName, email, password, companyId, employeeId,
    department, position, pan, hireDate, employmentType
) => {
    const sql = `
        INSERT INTO users (
            full_name, user_email, user_pass, company_id, 
            employee_id, department, position, pan, 
            hire_date, employment_type
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING id, full_name, user_email, employee_id, department, position, created_at;
    `;

    try {
        console.log(`--- DB: Inserting employee ${email} for Company ${companyId} ---`);
        return await pool.query(sql, [
            employeeName, email, password, companyId,
            employeeId, department, position, pan,
            hireDate, employmentType
        ]);
    } catch (dbError) {
        console.error('Database execution error:', dbError.message);
        throw dbError;
    }
};

const checkUserAlreadyExistInDBAndGetData = async (email) => {
    const sql = 'SELECT * FROM users WHERE user_email = $1';
    try {
        const result = await pool.query(sql, [email]);
        return result.rows;
    } catch (dbError) {
        console.error('Database execution error:', dbError.message);
        throw dbError;
    }
};

module.exports = {
    createUser,
    checkUserAlreadyExistInDBAndGetData,
    createUserByAdmin
}