-- Schema for coopefacsa vacation system
-- Tables: employees, vacation_requests, attendance

CREATE TABLE IF NOT EXISTS employees (
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

CREATE TABLE IF NOT EXISTS vacation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  days numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reason text,
  created_at timestamptz DEFAULT now()
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
