-- Full reset: drop existing tables, recreate schema, and seed demo data.
-- WARNING: This file destroys existing data. Run only if you want a fresh database.
-- Ensure gen_random_uuid() is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop existing objects so the script creates a fresh, empty schema. You (the developer)
-- will run this when you want to fully recreate the local DB. This script creates
-- the tables only and intentionally does NOT insert demo data.

DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS vacation_requests CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- Unified employees table (contains both account/auth fields and profile/hr fields)
CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  password_hash text,
  role text NOT NULL DEFAULT 'user',
  name text NOT NULL,
  position text,
  department text,
  department_id uuid NULL,
  accumulated_days numeric DEFAULT 0,
  used_days numeric DEFAULT 0,
  pending_days numeric DEFAULT 0,
  monthly_rate numeric DEFAULT 0,
  birth_date date NULL,
  profile_photo text NULL,
  created_at timestamptz DEFAULT now()
);

-- Departments table (optional normalized table)
CREATE TABLE departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Vacation requests
CREATE TABLE vacation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  days numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  type text NOT NULL DEFAULT 'request', -- 'request' | 'birthday' | 'adjustment'
  reason text,
  requested_by uuid NULL,
  decided_by uuid NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
-- Attendance
CREATE TABLE attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL,
  note text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vacation_employee ON vacation_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);

-- Create departments table and indexes (no demo data)
INSERT INTO departments (name)
SELECT DISTINCT department FROM employees WHERE department IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- Add department_id column to employees (nullable) and populate if departments exist
ALTER TABLE employees ADD COLUMN IF NOT EXISTS department_id uuid NULL;
UPDATE employees e
SET department_id = d.id
FROM departments d
WHERE e.department IS NOT NULL AND e.department = d.name;

-- Add foreign key constraint linking employees.department_id -> departments.id
ALTER TABLE employees
  ADD CONSTRAINT IF NOT EXISTS fk_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS ux_employees_email ON employees(email) WHERE email IS NOT NULL;

-- No demo seeds: if you need demo data, create a separate `scripts/seeds_demo.sql` and run it manually.
