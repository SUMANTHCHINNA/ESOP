const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createGrantRepository = async (grantData) => {
  const sql = `
        INSERT INTO esop_grants (
            company_id, employee_id, esop_plan_id, grant_name, 
            grant_date, total_shares, exercise_price, vesting_start_date, 
            vesting_end_date, vesting_period_months, cliff_months, 
            vesting_method, vesting_percentages, status, notes,
            vested_shares, exercised_shares, lapsed_shares
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) 
        RETURNING *;
    `;

  const values = [
    grantData.company_id,
    grantData.employee_id,
    grantData.esop_plan_id,
    grantData.grant_name,
    grantData.grant_date,
    grantData.total_shares,
    grantData.exercise_price,
    grantData.vesting_start_date,
    grantData.vesting_end_date,
    grantData.vesting_period_months,
    grantData.cliff_months,
    grantData.vesting_method,
    grantData.vesting_percentages,
    grantData.status || "active",
    grantData.notes,
    grantData.vested_shares || 0, // Default to 0 if not provided
    grantData.exercised_shares || 0,
    grantData.lapsed_shares || 0,
  ];

  try {
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (dbError) {
    console.error("DB Error creating grant:", dbError.message);
    throw dbError;
  }
};

const getGrantDetailsOfAnCompanyRepository = async (companyId) => {
  const sql = "SELECT * FROM esop_grants WHERE company_id = $1";

  try {
    const result = await pool.query(sql, [companyId]);
    return result.rows;
  } catch (dbError) {
    console.error("Database execution error:", dbError.message);
    throw dbError;
  }
};

const getEmployeeGrantsRepository = async (empId) => {
  const sql =
    "SELECT * FROM esop_grants WHERE employee_id = $1 ORDER BY grant_date DESC";
  try {
    const result = await pool.query(sql, [empId]);
    console.log(result.rows);
    return result.rows;
  } catch (DbError) {
    console.error("Database execution error:", dbError.message);
    throw dbError;
  }
};

const getEmployeeGrantDetailsRepository = async (grantId) => {
  const sql = "SELECT * FROM esop_grants WHERE id = $1";
  try {
    const result = await pool.query(sql, [grantId]);
    return result.rows[0];
  } catch (DbErr) {
    return DbErr;
  }
};

const updateGrantsRepository = async (grantId, updateFields) => {
  const keys = Object.keys(updateFields);
  if (keys.length === 0) return null;

  const setClause = keys
    .map((key, index) => {
      if (
        key === "exercised_shares" ||
        key === "vested_shares" ||
        key === "lapsed_shares"
      ) {
        return `${key} = ${key} + $${index + 1}`;
      }
      return `${key} = $${index + 1}`;
    })
    .join(", ");

  const sql = `
        UPDATE esop_grants 
        SET 
            ${setClause}, 
            status = CASE 
                WHEN (exercised_shares + lapsed_shares) >= total_shares 
                THEN 'fully_exercised'::grant_status_enum
                ELSE status::grant_status_enum  -- Added explicit cast here
            END,
            updated_at = NOW()
        WHERE id = $${keys.length + 1}
        RETURNING *;
    `;

  const values = [...Object.values(updateFields), grantId];

  try {
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (dbError) {
    console.error("Database Error in updateGrantsRepository:", dbError.message);
    throw dbError;
  }
};

module.exports = {
  createGrantRepository,
  getGrantDetailsOfAnCompanyRepository,
  getEmployeeGrantsRepository,
  getEmployeeGrantDetailsRepository,
  updateGrantsRepository,
};
