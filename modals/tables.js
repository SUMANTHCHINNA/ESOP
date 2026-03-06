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

const createEnums = async () => {
    const query = `
        DO $$ 
        BEGIN 
            -- Grant Status
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'grant_status_enum') THEN
                CREATE TYPE grant_status_enum AS ENUM ('active', 'lapsed', 'cancelled', 'fully_exercised');
            END IF;

            -- Exercise Status (Updated with 'submitted')
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exercise_status_enum') THEN
                CREATE TYPE exercise_status_enum AS ENUM ('submitted', 'pending', 'approved', 'rejected', 'completed', 'cancelled');
            ELSE
                -- Safety: Add 'submitted' if the enum exists but lacks it
                BEGIN
                    ALTER TYPE exercise_status_enum ADD VALUE 'submitted';
                EXCEPTION
                    WHEN duplicate_object THEN null; -- Value already exists
                END;
            END IF;

            -- Payment Method
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
                CREATE TYPE payment_method_enum AS ENUM ('cash', 'cashless', 'check', 'wire_transfer', 'other');
            END IF;

            -- Employment Type
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_type_enum') THEN
                CREATE TYPE employment_type_enum AS ENUM ('admin', 'employee', 'employer');
            END IF;
        END $$;
    `;
    try {
        await pool.query(query);
        console.log('All ESOP Enums initialized successfully');
    } catch (err) {
        console.error('Error creating Enums:', err.message);
    }
};

const createCompaniesTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS companies (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            admin_user_id UUID, 
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
        await pool.query(query);
        console.log('Companies table initialized successfully');
    } catch (err) {
        console.error('Error creating companies table:', err);
    }
};

const createUsersTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_email VARCHAR(100) UNIQUE NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            user_pass VARCHAR(255) NOT NULL,
            company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
            employee_id VARCHAR(50) UNIQUE,
            department VARCHAR(100),
            position VARCHAR(100),
            pan VARCHAR(10) UNIQUE,
            hire_date DATE,
            termination_date DATE,
            employment_type employment_type_enum DEFAULT 'employer',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
    `;
    try {
        await pool.query(query);
        console.log('Users table initialized successfully');
    } catch (err) {
        console.error('Error creating users table:', err);
    }
};

const createEsopPlanTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS esop_plans (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            plan_name TEXT NOT NULL,
            total_shares_reserved BIGINT NOT NULL,
            shares_allocated BIGINT DEFAULT 0,
            effective_date DATE NOT NULL,
            expiry_date DATE NOT NULL,
            plan_type TEXT NOT NULL,
            currency VARCHAR(3) NOT NULL,
            vesting_start_reference TEXT NOT NULL,
            default_vesting_period_years INTEGER NOT NULL,
            default_vesting_frequency TEXT NOT NULL,
            default_cliff_months INTEGER DEFAULT 0,
            vesting_method TEXT NOT NULL,
            vesting_percentages JSONB DEFAULT NULL,
            strike_price_type TEXT NOT NULL,
            default_strike_price DECIMAL(19, 4) NOT NULL,
            allow_strike_price_override BOOLEAN DEFAULT FALSE,
            post_termination_exercise_days INTEGER DEFAULT 90,
            unvested_lapse_on_termination BOOLEAN DEFAULT TRUE,
            vested_lapse_after_window BOOLEAN DEFAULT TRUE,
            acceleration_on_change_of_control BOOLEAN DEFAULT FALSE,
            acceleration_on_termination_without_cause BOOLEAN DEFAULT FALSE,
            eligible_participants TEXT[] DEFAULT '{}',
            is_active BOOLEAN DEFAULT TRUE,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_esop_plans_company ON esop_plans(company_id);
    `;
    try {
        await pool.query(query);
        console.log('ESOP Plans table initialized successfully');
    } catch (err) {
        console.error('Error creating ESOP Plans table:', err);
    }
};

const createEsopGrantsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS esop_grants (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            esop_plan_id UUID NOT NULL REFERENCES esop_plans(id) ON DELETE CASCADE,
            grant_name VARCHAR(255) NOT NULL,
            grant_date DATE NOT NULL DEFAULT CURRENT_DATE,
            total_shares DECIMAL(15, 2) NOT NULL CHECK (total_shares > 0),
            exercise_price DECIMAL(15, 2) NOT NULL,
            vesting_start_date DATE NOT NULL,
            vesting_end_date DATE NOT NULL,
            vesting_period_months INT NOT NULL,
            cliff_months INT DEFAULT 0,
            vesting_method VARCHAR(50) NOT NULL, 
            vesting_percentages JSONB DEFAULT NULL, 
            vested_shares DECIMAL(15, 2) DEFAULT 0,
            exercised_shares DECIMAL(15, 2) DEFAULT 0,
            lapsed_shares DECIMAL(15, 2) DEFAULT 0,
            status grant_status_enum DEFAULT 'active',
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_grants_company ON esop_grants(company_id);
        CREATE INDEX IF NOT EXISTS idx_grants_employee ON esop_grants(employee_id);
        CREATE INDEX IF NOT EXISTS idx_grants_status ON esop_grants(status);
    `;
    try {
        await pool.query(query);
        console.log('ESOP Grants table initialized successfully');
    } catch (err) {
        console.error('Error creating grants table:', err);
    }
};

const createExercisesTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS exercises (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            grant_id UUID NOT NULL REFERENCES esop_grants(id) ON DELETE CASCADE,
            
            -- Transaction Data
            shares_exercised NUMERIC(15, 2) NOT NULL, 
            exercise_date DATE NOT NULL DEFAULT CURRENT_DATE, 
            exercise_price NUMERIC(15, 2) NOT NULL,
            
            -- Status & Workflow (using the Enum we created)
            status exercise_status_enum DEFAULT 'submitted', 
            
            -- Payment & Compliance
            payment_method payment_method_enum DEFAULT 'cashless',
            tax_withheld NUMERIC(15, 2) DEFAULT 0.00,
            
            -- Admin Review Fields
            notes TEXT,
            rejection_reason TEXT,
            reviewed_by UUID REFERENCES users(id),
            reviewed_at TIMESTAMP WITH TIME ZONE,
            
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_exercise_grant ON exercises(grant_id);
        CREATE INDEX IF NOT EXISTS idx_exercise_employee ON exercises(employee_id);
        CREATE INDEX IF NOT EXISTS idx_exercise_status ON exercises(status);
    `;
    try {
        await pool.query(query);
        console.log('Exercises table initialized successfully');
    } catch (err) {
        console.error('Error creating Exercises table:', err);
    }
};

const createFvmValuationsTable = async () => {
    const query = `
                CREATE TABLE IF NOT EXISTS fmv_valuations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            
            -- Price Data
            share_price NUMERIC(15, 2) NOT NULL CHECK (share_price >= 0),
            currency VARCHAR(3) DEFAULT 'INR', 
            
            -- Validity Period
            valuation_date DATE NOT NULL,
            effective_from DATE NOT NULL,
            effective_to DATE, -- NULL means currently active
            is_active BOOLEAN DEFAULT TRUE,

            -- Compliance Audit Trail
            valuation_firm VARCHAR(255),
            valuation_method VARCHAR(100), -- DCF, Market Multiples, Net Asset, etc.
            approved_by VARCHAR(255),
            report_url TEXT,
            
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create the index only if it doesn't already exist
        CREATE INDEX IF NOT EXISTS idx_fmv_active 
        ON fmv_valuations(company_id) 
        WHERE is_active = TRUE;
    `;
    try {
        await pool.query(query);
        console.log('Fvm_Valuations table initialized successfully');
    }
    catch (err) {
        console.error('Error creating Exercises table:', err);
    }
}

const createDocumentTemplateTable = async () => {
    const query = `
                CREATE TABLE IF NOT EXISTS document_templates (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            
            -- Template Identity
            template_name VARCHAR(255) NOT NULL, -- e.g., 'Grant Letter', 'Exercise Agreement'
            template_type VARCHAR(50) NOT NULL, -- e.g., 'OFFER_LETTER', 'GRANT_CERTIFICATE'
            version VARCHAR(20) DEFAULT '1.0.0',
            
            -- Content
            content TEXT NOT NULL, -- The template body with placeholders
            placeholders JSONB, -- List of expected keys like ["name", "shares", "price"]
            
            -- Metadata
            is_default BOOLEAN DEFAULT TRUE,
            created_by UUID REFERENCES users(id), -- Admin who created it
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Index for fast lookup by type
        CREATE INDEX IF NOT EXISTS idx_template_lookup ON document_templates(company_id, template_type) WHERE is_default = TRUE;
    `;
    try {
        await pool.query(query);
        console.log('DocumentTemplate table initialized successfully');
    }
    catch (err) {
        console.error('Error  createDocumentTemplateTable table:', err);
    }
}

const auditFreezeTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS audit_freeze (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            freeze_date DATE NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            frozen_by UUID NOT NULL REFERENCES users(id),
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Use IF NOT EXISTS here to prevent errors on server restart
        CREATE INDEX IF NOT EXISTS idx_audit_freeze_company_active 
        ON audit_freeze (company_id) 
        WHERE is_active = TRUE;
    `;
    try {
        await pool.query(query);
        console.log('Audit Freeze table and index initialized successfully');
    }
    catch (err) {
        console.error('Error initializing Audit Freeze table:', err.message);
    }
}

const createExitSummariesTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS esop_exit_summaries (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            
            -- Snapshot Employee Data
            employee_name VARCHAR(100) NOT NULL,
            employee_code VARCHAR(50),
            department VARCHAR(100),
            position VARCHAR(100),
            hire_date DATE,
            termination_date DATE NOT NULL,
            termination_type VARCHAR(50), -- resignation, termination, etc.
            
            -- Stock Option Summary (Snapshot)
            grant_details JSONB NOT NULL, -- Array of grant objects
            total_options_granted DECIMAL(15, 2) DEFAULT 0,
            total_options_vested DECIMAL(15, 2) DEFAULT 0,
            total_options_exercised DECIMAL(15, 2) DEFAULT 0,
            total_options_unvested DECIMAL(15, 2) DEFAULT 0,
            total_options_lapsed DECIMAL(15, 2) DEFAULT 0,
            total_options_exercisable DECIMAL(15, 2) DEFAULT 0,
            
            -- Exercise Rules
            post_termination_exercise_days INTEGER DEFAULT 90,
            exercise_window_end_date DATE,
            
            generated_by UUID REFERENCES users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_exit_summary_employee ON esop_exit_summaries(employee_id);
        CREATE INDEX IF NOT EXISTS idx_exit_summary_company ON esop_exit_summaries(company_id);
    `;
    try {
        await pool.query(query);
        console.log('ESOP Exit Summaries table initialized successfully');
    } catch (err) {
        console.error('Error creating Exit Summaries table:', err.message);
    }
};

module.exports = {
    pool,
    createEnums,
    createCompaniesTable,
    createUsersTable,
    createEsopPlanTable,
    createEsopGrantsTable,
    createExercisesTable,
    createFvmValuationsTable,
    createDocumentTemplateTable,
    auditFreezeTable,
    createExitSummariesTable
};