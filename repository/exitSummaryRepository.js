const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const exitSummaryRepository = {
    fetchEmployeeExitData: async (employeeId) => {
        const sql = `
            SELECT 
                u.company_id, u.id as employee_id, u.full_name as employee_name,
                u.employee_id as employee_code, u.department, u.position, u.hire_date,
                COALESCE(jsonb_agg(jsonb_build_object(
                    'grant_id', g.id, 'grant_name', g.grant_name, 'total_shares', g.total_shares,
                    'vested_shares', g.vested_shares, 'exercised_shares', g.exercised_shares,
                    'lapsed_shares', g.lapsed_shares, 'unvested_shares', (g.total_shares - g.vested_shares)
                )) FILTER (WHERE g.id IS NOT NULL), '[]') as grant_details,
                SUM(g.total_shares) as total_options_granted,
                SUM(g.vested_shares) as total_options_vested,
                SUM(g.exercised_shares) as total_options_exercised,
                (SELECT post_termination_exercise_days FROM esop_plans ep 
                 JOIN esop_grants eg ON ep.id = eg.esop_plan_id 
                 WHERE eg.employee_id = u.id LIMIT 1) as pted
            FROM users u
            LEFT JOIN esop_grants g ON u.id = g.employee_id
            WHERE u.id = $1
            GROUP BY u.id;
        `;
        const result = await pool.query(sql, [employeeId]);
        return result.rows[0];
    },

    executeExitTransaction: async (employeeId, terminationDate, summary) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Update users table with termination date
            const userSql = `
                UPDATE users 
                SET termination_date = $1, is_active = FALSE, updated_at = NOW() 
                WHERE id = $2`;
            await client.query(userSql, [terminationDate, employeeId]);

            // 2. Insert into exit summary table
            const keys = Object.keys(summary);
            const values = Object.values(summary);
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            
            const summarySql = `
                INSERT INTO esop_exit_summaries (${keys.join(', ')}) 
                VALUES (${placeholders}) RETURNING *`;
            
            const result = await client.query(summarySql, values);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
};

const getExitSummaryRepository = {
    // ... existing POST methods ...

    getSummaryByEmployeeId: async (employeeId) => {
        const sql = `
            SELECT * FROM esop_exit_summaries 
            WHERE employee_id = $1 
            ORDER BY created_at DESC 
            LIMIT 1
        `;
        const result = await pool.query(sql, [employeeId]);
        return result.rows[0];
    }
};

module.exports = { exitSummaryRepository,getExitSummaryRepository };