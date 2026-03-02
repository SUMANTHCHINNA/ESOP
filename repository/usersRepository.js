const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Fetches the company associated with the admin user
const checkAdminCompanyDetails = async (adminId) => {
    const sql = 'SELECT * FROM companies WHERE admin_user_id = $1';
    const result = await pool.query(sql, [adminId]);
    return result.rows;
};

// Fetches all users belonging to a specific company
const getAllEmployeesOfAnCompany = async (companyId) => {
    const sql = `
        SELECT id, full_name, user_email, employee_id, department, 
               position, pan, hire_date, employment_type, is_active 
        FROM users 
        WHERE company_id = $1
    `;
    try {
        const result = await pool.query(sql, [companyId]);
        return result.rows;
    } catch (dbError) {
        console.error('Database execution error:', dbError.message);
        throw dbError;
    }
};

const terminateUserById = async (userId) => {
    const sql = `
        UPDATE users 
        SET is_active = FALSE, 
            termination_date = CURRENT_DATE 
        WHERE id = $1 
        RETURNING id, full_name, user_email, is_active, termination_date;
    `;
    
    try {
        return await pool.query(sql, [userId]);
    } catch (dbError) {
        console.error('Database execution error:', dbError.message);
        throw dbError;
    }
};

module.exports = {
    getAllEmployeesOfAnCompany,
    checkAdminCompanyDetails,
    terminateUserById
}