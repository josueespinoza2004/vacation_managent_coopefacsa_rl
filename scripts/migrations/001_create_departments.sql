-- 1) Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2) Populate departments from existing employees.department
INSERT INTO departments (name)
SELECT DISTINCT department FROM employees WHERE department IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- 3) Add department_id column to employees (nullable)
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS department_id uuid NULL;

-- 4) Update employees.department_id by joining departments.name
UPDATE employees e
SET department_id = d.id
FROM departments d
WHERE e.department IS NOT NULL AND e.department = d.name;

-- Note: we keep the existing employees.department text column for backward compatibility.
-- Optional: after verifying, you can drop the old column and add a foreign key constraint:
-- ALTER TABLE employees DROP COLUMN department;
-- ALTER TABLE employees ADD CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES departments(id);
