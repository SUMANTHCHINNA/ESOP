const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const auditFreezeRepository = {
    setFreeze: async (companyId, adminId, date, notes) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Deactivate existing active freezes for this company
            await client.query(
                `UPDATE audit_freeze SET is_active = FALSE WHERE company_id = $1 AND is_active = TRUE`,
                [companyId]
            );

            // 2. Insert new freeze record
            const sql = `
                INSERT INTO audit_freeze (company_id, freeze_date, is_active, frozen_by, notes)
                VALUES ($1, $2, TRUE, $3, $4)
                RETURNING *`;

            const result = await client.query(sql, [companyId, date, adminId, notes]);

            await client.query('COMMIT');
            return result.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },

    updateStatus: async (id, status) => {
        const sql = `UPDATE audit_freeze SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
        const result = await pool.query(sql, [status, id]);
        return result.rows[0];
    },

    fetchActive: async (companyId) => {
        const sql = `SELECT * FROM audit_freeze WHERE company_id = $1 AND is_active = TRUE LIMIT 1`;
        const result = await pool.query(sql, [companyId]);
        return result.rows[0];
    }
};

module.exports = {
    auditFreezeRepository
}