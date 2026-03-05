const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const createValuationRepository = async (data) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Deactivate the current active valuation for this company
        // We set the old valuation's 'effective_to' to the day before the new one starts
        const deactivateSql = `
            UPDATE fmv_valuations 
            SET is_active = FALSE, 
                effective_to = ($1::DATE - INTERVAL '1 day'),
                updated_at = NOW()
            WHERE company_id = $2 AND is_active = TRUE`;
        
        await client.query(deactivateSql, [data.effective_from, data.company_id]);

        // 2. Insert the new active valuation
        const insertSql = `
            INSERT INTO fmv_valuations (
                company_id, share_price, currency, valuation_date, 
                effective_from, effective_to, is_active, 
                valuation_firm, valuation_method, approved_by, report_url, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *`;

        const values = [
            data.company_id,
            data.share_price,
            data.currency || 'INR',
            data.valuation_date,
            data.effective_from,
            null, // effective_to is null because it is the current one
            true, // is_active
            data.valuation_firm,
            data.valuation_method,
            data.approved_by,
            data.report_url,
            data.notes
        ];

        const result = await client.query(insertSql, values);

        await client.query('COMMIT');
        return result.rows[0];

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Database Error in createValuationRepository:', err.message);
        throw err;
    } finally {
        client.release();
    }
};

module.exports = {
    createValuationRepository
}