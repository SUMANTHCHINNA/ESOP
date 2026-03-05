const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const createDocumentTemplateRepository = async (data) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. If the new template is marked as default, unset previous default for this type
        if (data.is_default === true) {
            const unsetDefaultSql = `
                UPDATE document_templates 
                SET is_default = FALSE 
                WHERE company_id = $1 
                  AND template_type = $2 
                  AND is_default = TRUE`;

            await client.query(unsetDefaultSql, [data.company_id, data.template_type]);
        }

        // 2. Insert the new document template (removed is_active)
        const insertSql = `
            INSERT INTO document_templates (
                company_id, 
                template_name, 
                template_type, 
                content, 
                is_default, 
                created_by
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`;

        const values = [
            data.company_id,           // $1
            data.template_name,         // $2
            data.template_type,         // $3
            data.content,               // $4
            !!data.is_default,          // $5
            data.created_by             // $6
        ];

        const result = await client.query(insertSql, values);

        await client.query('COMMIT');
        return result.rows[0];

    } catch (dbError) {
        await client.query('ROLLBACK');
        console.error('Database Error in createDocumentTemplateRepository:', dbError.message);
        throw dbError;
    } finally {
        client.release();
    }
};

const getDefaultTemplateRepository = async (companyId, templateType) => {
    const sql = `
        SELECT * FROM document_templates 
        WHERE company_id = $1 
          AND template_type = $2 
          AND is_default = TRUE 
        LIMIT 1`;

    const result = await pool.query(sql, [companyId, templateType]);
    return result.rows[0];
};

module.exports = {
    createDocumentTemplateRepository,
    getDefaultTemplateRepository
};