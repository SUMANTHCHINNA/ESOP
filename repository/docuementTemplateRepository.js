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

const getDefaultTemplateRepository = async (companyId) => {
    try {
        // This query matches your partial index: WHERE is_default = TRUE
        const sql = `
            SELECT 
                id, 
                template_name, 
                template_type, 
                content, 
                placeholders, 
                version 
            FROM document_templates 
            WHERE company_id = $1 
              AND is_default = TRUE 
            LIMIT 1;
        `;

        const result = await pool.query(sql, [companyId]);
        
        return result.rows[0] || null;
    } catch (DbError) {
        console.error("Database Error in getDefaultTemplateRepository:", DbError.message);
        throw new Error("Failed to fetch default template from database.");
    }
};

const deleteDocumentTemplateRepository = async (id) => {
    try {
        const query = `
            DELETE FROM document_templates 
            WHERE id = $1
        `;
        
        const result = await pool.query(query, [id]);
        
        // Returns true if 1 row was deleted, false if 0 rows were affected
        return result.rowCount > 0;
    }
    catch (DbError) {
        console.error("Database Error in deleteDocumentTemplateRepository:", DbError.message);
        throw new Error("Failed to delete document template from database.");
    }
}

const updateDocumentTemplateRepository = async (id, updateData) => {
    try {
        const fields = [];
        const values = [];
        let index = 1;

        for (const [key, value] of Object.entries(updateData)) {
            fields.push(`${key} = $${index}`);
            values.push(value);
            index++;
        }

        // Add the ID as the last parameter
        values.push(id);
        const idParamIndex = index;

        const query = `
            UPDATE document_templates 
            SET ${fields.join(", ")}
            WHERE id = $${idParamIndex}
            RETURNING *;
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }
    catch (DbError) {
        console.error("Database Error in updateDocumentTemplateRepository:", DbError.message);
        throw new Error("Database update failed.");
    }
}


const getDocumentTemplateByTypeRepository = async (companyId, type) => {
    try {
        const sql = `
            SELECT 
                id, 
                template_name, 
                template_type, 
                content, 
                placeholders, 
                version,
                is_default
            FROM document_templates 
            WHERE company_id = $1 
              AND template_type = $2
            ORDER BY created_at DESC
            LIMIT 1;
        `;

        const result = await pool.query(sql, [companyId, type]);
        
        return result.rows[0] || null;
    }
    catch (DbError) {
        console.error("Database Error in getDocumentTemplateByTypeRepository:", DbError.message);
        throw new Error("Failed to fetch template by type from database.");
    }
};

module.exports = {
    createDocumentTemplateRepository,
    getDefaultTemplateRepository,
    deleteDocumentTemplateRepository,
    updateDocumentTemplateRepository,
    getDocumentTemplateByTypeRepository
};