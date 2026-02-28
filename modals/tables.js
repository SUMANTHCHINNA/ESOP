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
    // Method 1: standard schema with metadata and gen_random_uuid()
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            full_name VARCHAR(100) NOT NULL,
            user_email VARCHAR(100) UNIQUE NOT NULL,
            user_pass VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'Admin',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        // execute table creation logic for users
        await pool.query(query);
        _logger.LogInformation('Users table initialized successfully');
    } catch (err) {
        // handle database connection or syntax errors
        console.error('Error creating users table:', err);
    }
};

const createCompaniesTable = async () => {
    // Note: ON DELETE CASCADE ensures company is removed if the admin user is deleted
    const query = `
        CREATE TABLE IF NOT EXISTS companies (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            admin_user_id UUID NOT NULL,
            cin VARCHAR(21) UNIQUE,
            pan_number VARCHAR(10) UNIQUE,
            gstin VARCHAR(15) UNIQUE,
            address_line1 TEXT,
            city VARCHAR(100),
            state VARCHAR(100),
            pincode VARCHAR(10),
            company_email VARCHAR(255),
            phone VARCHAR(20),
            share_price DECIMAL(15, 2),
            total_pool_shares BIGINT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_admin 
                FOREIGN KEY(admin_user_id) 
                REFERENCES users(id) 
                ON DELETE CASCADE
        );
    `;

    try {
        // execute table creation logic for companies
        await pool.query(query);
        _logger.LogInformation('Companies table initialized successfully');
    } catch (err) {
        console.error('Error creating companies table:', err);
    }
};

module.exports = {
    pool,
    createUsersTable,
    createCompaniesTable
};