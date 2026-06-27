-- Zimco Enterprise Cooperative Portal - Database Schema (PostgreSQL)
-- Optimized with integrity constraints, indices, and database triggers for automated validation.

-- Enable UUID extension for unique resource keys if preferred
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for migration ease)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS deduction_records CASCADE;
DROP TABLE IF EXISTS loan_applications CASCADE;
DROP TABLE IF EXISTS savings_balances CASCADE;
DROP TABLE IF EXISTS members CASCADE;

-- 1. MEMBERS TABLE
CREATE TABLE members (
    id VARCHAR(25) PRIMARY KEY, -- standard 'ZIM-YYYY-XXX' structure or similar
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    dob DATE NOT NULL,
    department VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'Member' CHECK (role IN ('Member', 'Bursary Ingestion Officer', 'Loan Credit Officer', 'Super Admin', 'Audit Inspector')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for quick auth lookup and reporting
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_role ON members(role);

-- 2. SAVINGS BALANCES / CORPORATE POOLS
CREATE TABLE savings_balances (
    member_id VARCHAR(25) PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
    ordinary_savings NUMERIC(15, 2) DEFAULT 0.00 CHECK (ordinary_savings >= 0),
    special_savings NUMERIC(15, 2) DEFAULT 0.00 CHECK (special_savings >= 0),
    investment_pool NUMERIC(15, 2) DEFAULT 0.00 CHECK (investment_pool >= 0),
    outstanding_loans NUMERIC(15, 2) DEFAULT 0.00 CHECK (outstanding_loans >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. LOAN APPLICATIONS
CREATE TABLE loan_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id VARCHAR(25) NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    duration_months INT NOT NULL CHECK (duration_months > 0 AND duration_months <= 60),
    interest_rate NUMERIC(5, 2) DEFAULT 6.00, -- e.g. 6% cooperative interest
    monthly_repayment NUMERIC(15, 2) NOT NULL CHECK (monthly_repayment > 0),
    purpose TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Active', 'Settled')),
    review_comments TEXT,
    reviewed_by VARCHAR(25) REFERENCES members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loans_member ON loan_applications(member_id);
CREATE INDEX idx_loans_status ON loan_applications(status);

-- 4. BURSARY / DEDUCTIONS WORKBOOK RECORDS
CREATE TABLE deduction_records (
    id SERIAL PRIMARY KEY,
    cycle_period VARCHAR(20) NOT NULL, -- e.g., 'June 2026', 'July 2026'
    member_id VARCHAR(25) NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    ordinary_savings_allocated NUMERIC(15, 2) DEFAULT 0.00 CHECK (ordinary_savings_allocated >= 0),
    special_savings_allocated NUMERIC(15, 2) DEFAULT 0.00 CHECK (special_savings_allocated >= 0),
    investment_allocated NUMERIC(15, 2) DEFAULT 0.00 CHECK (investment_allocated >= 0),
    commodity_purchase_deduction NUMERIC(15, 2) DEFAULT 0.00 CHECK (commodity_purchase_deduction >= 0),
    loan_repayment_deduction NUMERIC(15, 2) DEFAULT 0.00 CHECK (loan_repayment_deduction >= 0),
    calculated_total NUMERIC(15, 2) NOT NULL CHECK (calculated_total >= 0),
    reconciliation_status VARCHAR(20) DEFAULT 'Pending' CHECK (reconciliation_status IN ('Pending', 'Reconciled', 'Error')),
    error_log TEXT,
    uploaded_by VARCHAR(25) REFERENCES members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique member contribution records per payroll cycle period
    UNIQUE(cycle_period, member_id)
);

CREATE INDEX idx_deductions_cycle ON deduction_records(cycle_period);
CREATE INDEX idx_deductions_member ON deduction_records(member_id);

-- 5. AUDIT LOGS FOR ACCREDITED COMPLIANCE
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    member_id VARCHAR(25) REFERENCES members(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL, -- e.g. 'AUTH_LOGIN', 'LOAN_APPLY', 'DEDUCTION_EDIT'
    description TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- =========================================================
-- TRIGGER TO AUTOMATICALLY CALCULATE DEDUCTION TOTALS
-- =========================================================
CREATE OR REPLACE FUNCTION calculate_deduction_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.calculated_total := COALESCE(NEW.ordinary_savings_allocated, 0) + 
                            COALESCE(NEW.special_savings_allocated, 0) + 
                            COALESCE(NEW.investment_allocated, 0) + 
                            COALESCE(NEW.commodity_purchase_deduction, 0) + 
                            COALESCE(NEW.loan_repayment_deduction, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_total
BEFORE INSERT OR UPDATE ON deduction_records
FOR EACH ROW
EXECUTE FUNCTION calculate_deduction_total();


-- =========================================================
-- INITIAL SEED DATA FOR TESTING INGESTION
-- =========================================================
-- Standard passwords are pre-hashed for 'password123'
INSERT INTO members (id, full_name, email, phone, dob, department, password_hash, role) VALUES
('ZIM-2026-001', 'Amao Abdulhameed', 'amao@zimco.org', '08012345678', '1990-05-15', 'Information Technology', '$2a$12$6K6xWbQj4D1b0Vre4CstV.UonX6rS7I9C5G/i2C9YFfD79m1D6O1m', 'Member'),
('ZIM-2026-002', 'Olawale Johnson', 'olawale@zimco.org', '08023456789', '1988-03-22', 'Finance & Accounts', '$2a$12$6K6xWbQj4D1b0Vre4CstV.UonX6rS7I9C5G/i2C9YFfD79m1D6O1m', 'Bursary Ingestion Officer'),
('ZIM-2026-003', 'Sarah Williams', 'sarah@zimco.org', '08034567890', '1992-07-30', 'Human Resources', '$2a$12$6K6xWbQj4D1b0Vre4CstV.UonX6rS7I9C5G/i2C9YFfD79m1D6O1m', 'Loan Credit Officer'),
('ZIM-2026-005', 'Chinelo Obi', 'chinelo@zimco.org', '08056789012', '1985-11-12', 'Administration', '$2a$12$6K6xWbQj4D1b0Vre4CstV.UonX6rS7I9C5G/i2C9YFfD79m1D6O1m', 'Super Admin');

-- Populate starting savings accounts
INSERT INTO savings_balances (member_id, ordinary_savings, special_savings, investment_pool, outstanding_loans) VALUES
('ZIM-2026-001', 350000.00, 120000.00, 1500000.00, 240000.00),
('ZIM-2026-002', 850000.00, 240000.00, 4500000.00, 0.00),
('ZIM-2026-003', 120000.00, 60000.00, 500000.00, 110000.00),
('ZIM-2026-005', 1800000.00, 950000.00, 12000000.00, 450000.00);

-- Populate starting payroll deductions for June 2026 Cycle
INSERT INTO deduction_records (cycle_period, member_id, ordinary_savings_allocated, special_savings_allocated, investment_allocated, commodity_purchase_deduction, loan_repayment_deduction, reconciliation_status, uploaded_by) VALUES
('June 2026', 'ZIM-2026-001', 25000.00, 10000.00, 50000.00, 15000.00, 35000.00, 'Reconciled', 'ZIM-2026-002'),
('June 2026', 'ZIM-2026-002', 15000.00, 5000.00, 20000.00, 0.00, 45000.00, 'Reconciled', 'ZIM-2026-002'),
('June 2026', 'ZIM-2026-003', 30000.00, 15000.00, 100000.00, 25000.00, 0.00, 'Reconciled', 'ZIM-2026-002');
