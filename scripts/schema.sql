-- Schema for coopefacsa vacation system
-- Tables: employees, vacation_requests, attendance
-- Ensure pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Schema for coopefacsa vacation system
-- Tables: employees, departments, vacation_requests, attendance

CREATE TABLE IF NOT EXISTS employees (
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
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Populate departments from existing employees.department (no-op if none)
INSERT INTO departments (name)
SELECT DISTINCT department FROM employees WHERE department IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- Add department_id column to employees if missing and populate it by joining departments
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS department_id uuid NULL;

UPDATE employees e
SET department_id = d.id
FROM departments d
WHERE e.department IS NOT NULL AND e.department = d.name;

-- Add foreign key constraint linking employees.department_id -> departments.id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_department'
  ) THEN
    ALTER TABLE employees
      ADD CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS vacation_requests (
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

CREATE TABLE IF NOT EXISTS attendance (
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

-- Users table and link from employees (optional user accounts)
-- No separate `users` table: accounts are stored in `employees` (email/password_hash/role).
-- If you previously relied on a `users` table, please migrate any references to `employees`.

-- Index for email uniqueness (only when email present)
CREATE UNIQUE INDEX IF NOT EXISTS ux_employees_email ON employees(email) WHERE email IS NOT NULL;
