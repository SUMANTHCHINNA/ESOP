const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const createUser = async (userId, fullName, email, password) => {
    const sql = `
        INSERT INTO users (id, full_name, user_email, user_pass) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
    `;

    try {
        console.log(`--- Attempting to insert user: ${email} ---`);
        const result = await pool.query(sql, [userId, fullName, email, password]);
        return result;
    } catch (dbError) {
        // Humanized logging for easier troubleshooting in Docker
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

const createCompany = async (name, adminUserId, cin, panNumber, gstin, addressLine1, city, state, pincode, companyEmail, phone, sharePrice, totalPoolShares) => {
    const sql = `
        INSERT INTO companies (
            name, admin_user_id, cin, pan_number, gstin, 
            address_line1, city, state, pincode, 
            company_email, phone, share_price, total_pool_shares
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
        RETURNING *
    `;

    try {
        // Log the operation for tracking purposes
        console.log(`--- Attempting to insert company: ${name} ---`);

        // Execute the query using the pool instance
        const queryResponse = await pool.query(sql, [
            name,           // $1
            adminUserId,    // $2
            cin,            // $3
            panNumber,      // $4
            gstin,          // $5
            addressLine1,   // $6
            city,           // $7
            state,          // $8
            pincode,        // $9
            companyEmail,   // $10
            phone,          // $11
            sharePrice,     // $12
            totalPoolShares // $13
        ]);

        return queryResponse;
    } catch (dbError) {
        console.error('Database execution error:', dbError.message);
        throw dbError;
    }
};

const getCompanyDetailsByAdminUserId = async (adminUserId) => {
    const sql = 'SELECT * FROM companies WHERE admin_user_id = $1';
    try {
        const result = await pool.query(sql, [adminUserId]);
        return result.rows;
    } catch (dbError) {
        console.error('Database execution error:', dbError.message);
        throw dbError;
    }
}


module.exports = {
    createUser,
    checkUserAlreadyExistInDBAndGetData,
    createCompany,
    getCompanyDetailsByAdminUserId
};