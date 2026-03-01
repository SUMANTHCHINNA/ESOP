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

const createUserByAdmin = async (employeeName, email, password, companyId, employeeId, department, position, pan, hireDate, employmentType) => {
    const sql = `
        INSERT INTO users (full_name, user_email, user_pass, company_id, employee_id, department, position, pan, hire_date, employment_type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING *
    `;

    try {
        console.log(`--- Attempting to insert employee: ${email} for Company ID: ${companyId} ---`);
        const result = await pool.query(sql, [employeeName, email, password, companyId, employeeId, department, position, pan, hireDate, employmentType]);
        return result;
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

const createCompanyByAdmin = async (name, adminUserId, cin, panNumber, gstin, addressLine1, city, state, pincode, companyEmail, phone, sharePrice, totalPoolShares) => {
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

const updateCompanyByAdmin = async (companyId, adminUserId, updateData) => {
    const fields = [];
    const values = [];

    // Method 1: Conditional logic to build the SQL SET clause dynamically
    if (updateData.name) {
        fields.push(`name = $${fields.length + 1}`);
        values.push(updateData.name);
    }
    if (updateData.cin) {
        fields.push(`cin = $${fields.length + 1}`);
        values.push(updateData.cin);
    }
    if (updateData.pan_number) {
        fields.push(`pan_number = $${fields.length + 1}`);
        values.push(updateData.pan_number);
    }
    if (updateData.gstin) {
        fields.push(`gstin = $${fields.length + 1}`);
        values.push(updateData.gstin);
    }
    if (updateData.address_line1) {
        fields.push(`address_line1 = $${fields.length + 1}`);
        values.push(updateData.address_line1);
    }
    if (updateData.city) {
        fields.push(`city = $${fields.length + 1}`);
        values.push(updateData.city);
    }
    if (updateData.state) {
        fields.push(`state = $${fields.length + 1}`);
        values.push(updateData.state);
    }
    if (updateData.pincode) {
        fields.push(`pincode = $${fields.length + 1}`);
        values.push(updateData.pincode);
    }
    if (updateData.company_email) {
        fields.push(`company_email = $${fields.length + 1}`);
        values.push(updateData.company_email);
    }
    if (updateData.phone) {
        fields.push(`phone = $${fields.length + 1}`);
        values.push(updateData.phone);
    }
    if (updateData.share_price) {
        fields.push(`share_price = $${fields.length + 1}`);
        values.push(updateData.share_price);
    }
    if (updateData.total_pool_shares) {
        fields.push(`total_pool_shares = $${fields.length + 1}`);
        values.push(updateData.total_pool_shares);
    }

    // Capture which admin updated the record and refresh the timestamp
    fields.push(`admin_user_id = $${fields.length + 1}`);
    values.push(adminUserId);

    // Append the companyId for the WHERE clause
    values.push(companyId);

    const sql = `
        UPDATE companies 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${fields.length + 1}
        RETURNING *
    `;

    try {
        // standard log for tracking DB operations
        console.log(`--- Executing update for Company ID: ${companyId} ---`);

        const queryResponse = await pool.query(sql, values);
        return queryResponse;
    } catch (dbError) {
        console.error('Database execution error:', dbError.message);
        throw dbError;
    }
};

module.exports = {
    createUser,
    checkUserAlreadyExistInDBAndGetData,
    createCompanyByAdmin,
    getCompanyDetailsByAdminUserId,
    updateCompanyByAdmin,
    createUserByAdmin
};