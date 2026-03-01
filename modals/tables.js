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

const createCompaniesTable = async () => {
    // Method 1: Primary organization table with metadata
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
            logo_url TEXT,
            company_email VARCHAR(255),
            phone VARCHAR(20),
            share_price DECIMAL(15, 2),
            total_pool_shares BIGINT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        // Initialize companies before users to avoid foreign key errors
        await pool.query(query);
        console.log('Companies table initialized successfully');
    } catch (err) {
        console.error('Error creating companies table:', err);
    }
};

const createUsersTable = async () => {
    // Method 1: Combined auth and employee profile schema
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            -- Primary Identity & Auth
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_email VARCHAR(100) UNIQUE NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            user_pass VARCHAR(255) NOT NULL,
            
            -- Organization & Employee Links
            company_id UUID,
            employee_id VARCHAR(50) UNIQUE,
            department VARCHAR(100),
            position VARCHAR(100),
            pan VARCHAR(10) UNIQUE,
            hire_date DATE,
            termination_date DATE,
            
            -- Metadata & Status
            employment_type VARCHAR(50) DEFAULT 'Admin',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            -- Constraints
            CONSTRAINT fk_company 
                FOREIGN KEY(company_id) 
                REFERENCES companies(id) 
                ON DELETE CASCADE
        );
    `;

    /* // Method 2: Minimalist user schema (commented out)
    const query = `CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY, user_email VARCHAR(100));`;
    */

    try {
        // execute table creation logic for users
        await pool.query(query);
        console.log('Users table initialized successfully');
    } catch (err) {
        // handle database connection or syntax errors
        console.error('Error creating users table:', err);
    }
};

module.exports = {
    pool,
    createUsersTable,
    createCompaniesTable
};