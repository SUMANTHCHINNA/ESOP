const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createExerciseRepository = async (
  body,
  employeeId,
  companyId,
  exercise_price
) => {
  console.log(body, employeeId, companyId, exercise_price);
  const sql = `
        INSERT INTO exercises (
            company_id, 
            employee_id, 
            grant_id, 
            shares_exercised, 
            exercise_price, 
            payment_method, 
            tax_withheld, 
            notes
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;

  // 3. Map values from body and arguments
  const values = [
    companyId,
    employeeId,
    body.grant_id,
    body.shares_exercised,
    exercise_price,
    body.payment_method || "cashless",
    body.withheld || 0,
    body.notes || null,
  ];

  try {
    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (dbError) {
    console.error(
      "Database Error in createExerciseRepository:",
      dbError.message
    );
    throw dbError;
  }
};

const getExerciseHistoryOfGrantRepository = async (grantId) => {
  // Sort by exercise_date descending to show the latest transactions first
  const sql = `
        SELECT * FROM exercises 
        WHERE grant_id = $1 OR employee_id = $1
        ORDER BY exercise_date DESC, created_at DESC;
    `;
  try {
    const result = await pool.query(sql, [grantId]);
    return result.rows;
  } catch (dbError) {
    console.error(
      "Database Error in getExerciseHistoryRepository:",
      dbError.message
    );
    throw dbError;
  }
};
const getExercisesUponStatusRepository = async (empId, status) => {
  // If status is 'all', we set it to null so the SQL logic handles it
  const statusFilter = (status === 'all' || !status) ? null : status;

  const sql = `
        SELECT 
            e.*, 
            u.full_name, 
            g.grant_name 
        FROM exercises e
        JOIN users u ON e.employee_id = u.id
        JOIN esop_grants g ON e.grant_id = g.id
        WHERE e.employee_id = $1 OR e.company_id = $1
        AND ($2::exercise_status_enum IS NULL OR e.status = $2::exercise_status_enum)
        ORDER BY e.created_at DESC;
    `;

  try {
    const result = await pool.query(sql, [empId, statusFilter]);
    return result.rows;
  } catch (dbError) {
    console.error("Database Error:", dbError.message);
    throw dbError;
  }
};

const approveOrRejectExerciseRepository = async (
  exerciseId,
  action,
  adminUserId,
  rejectionReason
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Fetch current record and lock row
    const findSql = `SELECT grant_id, shares_exercised, status FROM exercises WHERE id = $1 FOR UPDATE`;
    const exerciseResult = await client.query(findSql, [exerciseId]);

    if (exerciseResult.rows.length === 0) {
      throw new Error("Exercise record not found");
    }

    const { grant_id, shares_exercised, status } = exerciseResult.rows[0];

    if (status !== "submitted") {
      throw new Error(`Exercise is already ${status}`);
    }

    // Map 'approve' to 'approved' and 'reject' to 'rejected'
    const finalStatusValue = action === "approve" ? "approved" : "rejected";

    // 2. Update Exercises Table
    const updateExerciseSql = `
            UPDATE exercises 
            SET 
                status = $1::exercise_status_enum, 
                rejection_reason = $2, 
                reviewed_by = $3, 
                reviewed_at = NOW(),
                updated_at = NOW() 
            WHERE id = $4 
            RETURNING *`;

    const updatedExercise = await client.query(updateExerciseSql, [
      finalStatusValue,
      action === "reject" ? rejectionReason : null,
      adminUserId,
      exerciseId,
    ]);

    // 3. Update Esop_Grant Table (The Fixed Query)
    if (action === "approve") {
      const updateGrantSql = `
                UPDATE esop_grants 
                SET 
                    exercised_shares = exercised_shares + $1,
                    updated_at = NOW(),
                    status = (CASE 
                        WHEN (exercised_shares + $1 + lapsed_shares) >= total_shares 
                        THEN 'fully_exercised'
                        ELSE status::text 
                    END)::grant_status_enum
                WHERE id = $2`;

      await client.query(updateGrantSql, [shares_exercised, grant_id]);
    }

    await client.query("COMMIT");
    return updatedExercise.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Database Transaction Error:", err.message);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  createExerciseRepository,
  getExerciseHistoryOfGrantRepository,
  getExercisesUponStatusRepository,
  approveOrRejectExerciseRepository,
};
