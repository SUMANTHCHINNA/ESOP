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

const createBulkUsersByAdmin = async (usersList) => {
    if (!usersList || usersList.length === 0) return { rows: [], rowCount: 0 };

    const values = [];
    const placeholders = usersList.map((user, index) => {
        const offset = index * 10; 
        
        // These keys MUST match the object returned in the Service .map()
        values.push(
            user.employeeName, 
            user.email, 
            user.password, 
            user.companyId,
            user.employeeId, 
            user.department, 
            user.position, 
            user.pan, 
            user.hireDate, 
            user.employmentType
        );
        
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10})`;
    }).join(', ');

    const sql = `
        INSERT INTO users (
            full_name, user_email, user_pass, company_id, 
            employee_id, department, position, pan, 
            hire_date, employment_type
        ) 
        VALUES ${placeholders} 
        RETURNING id, full_name, user_email, employee_id;
    `;

    return await pool.query(sql, values);
};

module.exports = {
    createUser,
    checkUserAlreadyExistInDBAndGetData,
    createUserByAdmin,
    createBulkUsersByAdmin
}