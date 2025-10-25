-- Full reset: drop existing tables, recreate schema, and seed demo data.
-- WARNING: This file destroys existing data. Run only if you want a fresh database.
-- Ensure gen_random_uuid() is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS vacation_requests CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Employees (keep department text for backward compatibility)
CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text,
  department text,
  accumulated_days numeric DEFAULT 0,
  used_days numeric DEFAULT 0,
  pending_days numeric DEFAULT 0,
  monthly_rate numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Departments table
CREATE TABLE departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Users table (accounts)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text,
  name text,
  role text NOT NULL DEFAULT 'user',
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

-- Seed demo employees and requests
INSERT INTO employees (id, name, position, department, accumulated_days, used_days, pending_days, monthly_rate)
VALUES
('11111111-1111-1111-1111-111111111111','Juan Francisco Moreno','Oficial de Crédito','Créditos',12.5,7.5,5.0,2.5),
('22222222-2222-2222-2222-222222222222','María González','Analista','Operaciones',9.83,5.5,4.33,2.5),
('33333333-3333-3333-3333-333333333333','Prueba Usuario','Analista',NULL,4.5,0,4.5,2.5);

-- Create departments from employees (if any department text exists)
INSERT INTO departments (name)
SELECT DISTINCT department FROM employees WHERE department IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- Add department_id column and populate it by name (nullable)
ALTER TABLE employees ADD COLUMN IF NOT EXISTS department_id uuid NULL;
UPDATE employees e
SET department_id = d.id
FROM departments d
WHERE e.department IS NOT NULL AND e.department = d.name;

-- Add foreign key constraint linking employees.department_id -> departments.id
ALTER TABLE employees
  ADD CONSTRAINT IF NOT EXISTS fk_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- Add optional user_id to employees and link to users
ALTER TABLE employees ADD COLUMN IF NOT EXISTS user_id uuid NULL;
ALTER TABLE employees
  ADD CONSTRAINT IF NOT EXISTS fk_employee_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_employees_user_id ON employees(user_id) WHERE user_id IS NOT NULL;

-- Seed demo vacation requests
INSERT INTO vacation_requests (employee_id, start_date, end_date, days, status, reason)
VALUES
('11111111-1111-1111-1111-111111111111','2025-10-10','2025-10-15',5,'approved','Vacaciones programadas'),
('22222222-2222-2222-2222-222222222222','2025-11-01','2025-11-05',5,'pending','Viaje familiar');
