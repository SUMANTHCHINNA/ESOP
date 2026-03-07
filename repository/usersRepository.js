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

const getCompanyId = async (email) => {
    console.log(email);
    const sql = `select * from users where user_email = $1`
    try {
        const result = await pool.query(sql, [email]);
        console.log(`Result : ${result.rows[0].company_id}`);
        return result.rows.length > 0 ? result.rows[0].company_id : null;
    }
    catch (dbError) {
        console.error('Database execution error:', dbError.message);
        throw dbError;
    }
}

const getUserRoleRepository = async (userId) => {
    try {
        // Querying direct column from users table
        const sql = `SELECT employment_type FROM users WHERE id = $1 LIMIT 1`;

        const result = await pool.query(sql, [userId]);

        // Return the string value if found, otherwise null
        return result.rows[0] ? result.rows[0].employment_type : null;
    } catch (DbError) {
        console.error('Database Error in getUserRoleRepository:', DbError.message);
        throw DbError; // Strictly throw to trigger the catch blocks above
    }
};

const updateUserDetailsRepository = async (userId, data) => {
    const keys = Object.keys(data);
    if (keys.length === 0) return null;

    // Dynamically build the SET part of the query: column1=$1, column2=$2...
    const setClause = keys
        .map((key, index) => `"${key}" = $${index + 1}`)
        .join(', ');

    const values = Object.values(data);
    values.push(userId); // The last placeholder is for the WHERE clause

    const sql = `
        UPDATE users 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${values.length}
        RETURNING *`;

    try {
        const result = await pool.query(sql, values);

        if (result.rows.length === 0) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        return result.rows[0];
    } catch (DbError) {
        console.error('Database Error in updateUserDetailsRepository:', DbError.message);
        throw DbError; // Throwing ensure the service/controller catch it
    }
};


const updatePasswordRepository = async (userId, hashedPassword) => {
    try {
        const sql = `
            UPDATE users 
            SET user_pass = $1, 
                updated_at = CURRENT_TIMESTAMP,
                password_changed = TRUE 
            WHERE id = $2
            RETURNING id`;

        const values = [hashedPassword, userId];
        const result = await pool.query(sql, values);

        if (result.rows.length === 0) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        return result.rows[0];
    } catch (DbError) {
        console.error('Database Error in updatePasswordRepository:', DbError.message);
        throw DbError;
    }
};

const IspasswordChangedRepository = async (userId) => {
    const sql = `SELECT password_changed FROM users WHERE id = $1`;
    try {
        const values = [userId];
        const result = await pool.query(sql, values);
        
        if (result.rows.length === 0) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }

        // Return the row containing the boolean
        return result.rows[0]; 
    } catch (DbError) {
        console.error('Database Error in IspasswordChangedRepository:', DbError.message);
        throw DbError;
    }
};

module.exports = {
    getAllEmployeesOfAnCompany,
    checkAdminCompanyDetails,
    terminateUserById,
    getCompanyId,
    getUserRoleRepository,
    updateUserDetailsRepository,
    updatePasswordRepository,
    IspasswordChangedRepository
}