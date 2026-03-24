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

const getActiveValuationRepository = async (companyId) => {
    const sql = `
        SELECT * FROM fmv_valuations 
        WHERE company_id = $1 AND is_active = TRUE AND effective_to IS NULL
        LIMIT 1`;
    const result = await pool.query(sql, [companyId]);
    return result.rows[0];
};

const getValuationHistoryRepository = async (companyId) => {
    const sql = `
        SELECT * FROM fmv_valuations 
        WHERE company_id = $1 
        ORDER BY effective_from DESC, created_at DESC`;
    const result = await pool.query(sql, [companyId]);
    return result.rows;
};

const getValuationByDateRepository = async (companyId, targetDate) => {
    const sql = `
        SELECT * FROM fmv_valuations 
        WHERE company_id = $1 
        AND $2::DATE >= effective_from 
        AND ($2::DATE <= effective_to OR effective_to IS NULL)
        LIMIT 1`;

    const result = await pool.query(sql, [companyId, targetDate]);
    return result.rows[0];
};

const updateValuationRepository = async (valuationId, updateFields) => {
    const keys = Object.keys(updateFields);
    if (keys.length === 0) return null;

    // Map keys to "column_name = $index"
    const setClause = keys
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");

    const sql = `
        UPDATE fmv_valuations 
        SET 
            ${setClause}, 
            updated_at = NOW()
        WHERE id = $${keys.length + 1}
        RETURNING *;
    `;

    const values = [...Object.values(updateFields), valuationId];

    try {
        const result = await pool.query(sql, values);
        
        if (result.rowCount === 0) {
            const error = new Error("Valuation record not found");
            error.statusCode = 404;
            throw error;
        }

        return result.rows[0];
    }
    catch (DbError) {
        console.error("Database Error in updateValuationRepository:", DbError.message);
        throw DbError;
    }
}

const deleteValuationRepository = async (valuationId) => {
    try {
        // 1. DEFINE SQL QUERY
        // We use a parameterized query ($1) for security
        const query = `
            DELETE FROM fmv_valuations 
            WHERE id = $1
            RETURNING id;
        `;

        // 2. EXECUTE QUERY
        // Assuming 'db' is your database connection pool
        const result = await db.query(query, [valuationId]);

        // 3. CHECK IF RECORD WAS FOUND
        if (result.rowCount === 0) {
            return { status: false, message: "Valuation record not found" };
        }

        return { status: true, message: "Valuation deleted successfully", id: valuationId };

    } catch (DbError) {
        // Log the technical error for the server logs
        console.error('Database Error in deleteValuationRepository:', DbError);
        
        // Re-throw to be handled by the Controller/Service layer
        throw DbError;
    }
};

module.exports = {
    createValuationRepository,
    getActiveValuationRepository,
    getValuationHistoryRepository,
    getValuationByDateRepository,
    updateValuationRepository,
    deleteValuationRepository
}