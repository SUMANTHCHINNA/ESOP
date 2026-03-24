const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createCompanyByAdmin = async (companyData) => {
  // 1. Define the SQL for inserting the company
  const insertCompanySql = `
        INSERT INTO companies (
            name, admin_user_id, cin, pan_number, gstin, 
            address_line1, city, state, pincode, 
            company_email, phone, share_price, total_pool_shares,address_line2
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
        RETURNING id;
    `;

  // 2. Define the SQL for updating the admin user
  const updateUserSql = `
        UPDATE users SET company_id = $1 WHERE id = $2;
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
    companyData.total_pool_shares,
    companyData.address_line2
  ];

  const client = await pool.connect(); // Get a client from the pool for a transaction

  try {
    await client.query("BEGIN"); // Start Transaction

    console.log(
      `--- DB: Attempting to insert company: ${companyData.name} ---`
    );

    // Step 1: Insert Company
    const companyRes = await client.query(insertCompanySql, values);
    const newCompanyId = companyRes.rows[0].id;

    // Step 2: Update User's company_id
    console.log(
      `--- DB: Updating Admin User ${companyData.admin_user_id} with new Company ID ---`
    );
    await client.query(updateUserSql, [
      newCompanyId,
      companyData.admin_user_id,
    ]);

    await client.query("COMMIT"); // Save changes

    return companyRes; // Returning the company result as requested
  } catch (dbError) {
    await client.query("ROLLBACK"); // Undo changes if something fails
    console.error("Database execution error:", dbError.message);
    throw dbError;
  } finally {
    client.release(); // Return client to pool
  }
};

const getCompanyDetailsByAdminUserId = async (adminUserId) => {
  const sql = `
  SELECT * FROM companies
  WHERE admin_user_id = $1 OR id = $1 
  ORDER BY created_at DESC
  LIMIT 1
`;

  try {
    const result = await pool.query(sql, [adminUserId]);
    return result.rows;
  } catch (dbError) {
    console.error("Database execution error:", dbError.message);
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
  if (updateData.address_line2) {
    fields.push(`address_line2 = $${fields.length + 1}`);
    values.push(updateData.address_line2);
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
        SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${whereIdIndex}
        RETURNING *
    `;

  return await pool.query(sql, values);
};

const getCompanyAdminDetailsRepository = async (companyId) => {
  const sql = "SELECT admin_user_id FROM companies WHERE id = $1";
  try {
    const result = await pool.query(sql, [companyId]);
    console.log(result.rows);
    return result.rows;
  } catch (DbError) {
    console.error("Database execution error:", DbError.message);
    throw DbError;
  }
};

module.exports = {
  createCompanyByAdmin,
  getCompanyDetailsByAdminUserId,
  updateCompanyByAdmin,
  getCompanyAdminDetailsRepository,
};
