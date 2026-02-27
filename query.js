const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const createUser = async (userId, fullName, email, password) => {
    // Logic 1: Parameterized query (Secure & Industry Standard)
    const sql = `
        INSERT INTO users (id, full_name, user_email, user_pass) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
    `;

    try {
        console.log(`--- Attempting to insert user: ${email} ---`);
        const result = await pool.query(sql, [userId, fullName, email, password]);
        return result;
    } catch (dbError) {
        // Humanized logging for easier troubleshooting in Docker
        console.error('Database execution error:', dbError.message);
        throw dbError; 
    }
};

module.exports = {
    createUser
};