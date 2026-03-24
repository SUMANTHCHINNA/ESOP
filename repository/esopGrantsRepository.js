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
  // We join 'users' to get the employee name and 'esop_plans' to get the plan name
  const sql = `
    SELECT 
        g.*,
        -- Maps u.full_name from your 'users' table to 'employee_name' for the UI
        json_build_object(
            'id', u.id,
            'employee_name', u.full_name,
            'status', u.status
        ) AS employees,
        -- Maps p.plan_name from 'esop_plans' for the UI
        json_build_object(
            'id', p.id,
            'plan_name', p.plan_name
        ) AS esop_plans
    FROM esop_grants g
    LEFT JOIN users u ON g.employee_id = u.id
    LEFT JOIN esop_plans p ON g.esop_plan_id = p.id
    WHERE g.company_id = $1
    OR g.employee_id = $1
    OR g.id = $1
    ORDER BY g.grant_date DESC;
  `;

  try {
    const result = await pool.query(sql, [companyId]);
    return result.rows;
  } catch (dbError) {
    console.error("Database execution error in getGrantDetailsOfAnCompanyRepository:", dbError.message);
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

  // 1. Build the SET clause dynamically
  const setClause = keys
    .map((key, index) => {
      // If the field is one of the share counters, we increment it (+ =)
      // Otherwise, we overwrite it (=)
      if (
        key === "exercised_shares" ||
        key === "vested_shares" ||
        key === "lapsed_shares"
      ) {
        return `${key} = COALESCE(${key}, 0) + $${index + 1}`;
      }
      return `${key} = $${index + 1}`;
    })
    .join(", ");

  // 2. Prepare the SQL
  // We use a subquery/CTE or explicit logic to ensure the 'status' 
  // transition happens based on the values AFTER the increment.
  const sql = `
        UPDATE esop_grants 
        SET 
            ${setClause}, 
            updated_at = NOW()
        WHERE id = $${keys.length + 1}
        RETURNING *;
    `;

  // 3. Status Transition Logic
  // Since you want 'fully_exercised' to be automatic, we can run 
  // a second check or handle it in a single query using a CTE (Common Table Expression)
  // to be 100% safe with the math.

  const finalSql = `
    WITH updated AS (
        ${sql}
    )
    UPDATE esop_grants
    SET status = CASE 
        WHEN (exercised_shares + lapsed_shares) >= total_shares 
        THEN 'fully_exercised'::grant_status_enum
        ELSE status
    END
    FROM updated
    WHERE esop_grants.id = updated.id
    RETURNING esop_grants.*;
  `;

  const values = [...Object.values(updateFields), grantId];

  try {
    const result = await pool.query(finalSql, values);
    return result.rows[0];
  } catch (dbError) {
    console.error("Database Error in updateGrantsRepository:", dbError.message);
    throw dbError;
  }
};

const getEsopPlanAndEmployeeDetailsByGrantIdRepository = async (grantId) => {
  const sql = `
    SELECT 
        g.*,
        -- Nesting plan details into a JSON object
        json_build_object(
            'id', p.id,
            'plan_name', p.plan_name,
            'plan_type', p.plan_type,
            'strike_price_type', p.strike_price_type,
            'default_strike_price', p.default_strike_price
        ) AS esop_plan,
        -- Nesting user details into a JSON object
        json_build_object(
            'id', u.id,
            'full_name', u.full_name,
            'user_email', u.user_email,
            'employee_id', u.employee_id,
            'department', u.department
        ) AS user_details
    FROM esop_grants g
    JOIN esop_plans p ON g.esop_plan_id = p.id
    JOIN users u ON g.employee_id = u.id
    WHERE g.id = $1 OR g.company_id = $1;
  `;

  try {
    const result = await pool.query(sql, [grantId]);
    
    // Return the single object (equivalent to Supabase .single())
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (dbError) {
    console.error(
      "Database Error in getEsopPlanAndEmployeeDetailsByGrantIdRepository:",
      dbError.message
    );
    throw dbError;
  }
};


module.exports = {
  createGrantRepository,
  getGrantDetailsOfAnCompanyRepository,
  getEmployeeGrantsRepository,
  getEmployeeGrantDetailsRepository,
  updateGrantsRepository,
  getEsopPlanAndEmployeeDetailsByGrantIdRepository
};
