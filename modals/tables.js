const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const createUsersTable = async () => {
    const query = ` 

CREATE TABLE IF NOT EXISTS users (
       id UUID PRIMARY KEY,
       full_name VARCHAR(100),
       user_email VARCHAR(100) UNIQUE,
       user_pass VARCHAR(255)
   )    `;
    try {
        await pool.query(query);
        console.log('Users table created successfully');
    } catch (err) {
        console.error('Error creating users table:', err);
    }
};

module.exports = {
    createUsersTable,
};