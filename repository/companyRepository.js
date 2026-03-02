const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const createCompanyByAdmin = async (companyData) => {
    const sql = `
        INSERT INTO companies (
            name, admin_user_id, cin, pan_number, gstin, 
            address_line1, city, state, pincode, 
            company_email, phone, share_price, total_pool_shares
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
        RETURNING *
    `;

    const values = [
        companyData.name,
        companyData.admin_user_id,
        companyData.cin,
        companyData.pan_number,
        companyData.gstin,
        companyData.address_line1,
        companyData.city,
        companyData.state,
        companyData.pincode,
        companyData.company_email,
        companyData.phone,
        companyData.share_price,
        companyData.total_pool_shares
    ];

    try {
        console.log(`--- DB: Attempting to insert company: ${companyData.name} ---`);
        return await pool.query(sql, values);
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
};


const updateCompanyByAdmin = async (companyId, adminUserId, updateData) => {
    const fields = [];
    const values = [];

    // Manually pushing fields to ensure no loops are used
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

    // Add administrative tracking fields
    fields.push(`admin_user_id = $${fields.length + 1}`);
    values.push(adminUserId);

    // Final variable for the WHERE clause
    const whereIdIndex = fields.length + 1;
    values.push(companyId);

    const sql = `
        UPDATE companies 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${whereIdIndex}
        RETURNING *
    `;

    return await pool.query(sql, values);
};


module.exports = {
    createCompanyByAdmin,
    getCompanyDetailsByAdminUserId,
    updateCompanyByAdmin
}