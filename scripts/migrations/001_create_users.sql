-- Migration: Create users table and add user_id to employees

-- Requires pgcrypto extension for gen_random_uuid() (adjust if not available)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add nullable user_id to employees and FK
ALTER TABLE IF EXISTS employees
  ADD COLUMN IF NOT EXISTS user_id UUID NULL;

ALTER TABLE IF EXISTS employees
  ADD CONSTRAINT IF NOT EXISTS fk_employees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Ensure a user maps to at most one employee
CREATE UNIQUE INDEX IF NOT EXISTS ux_employees_user_id ON employees(user_id) WHERE user_id IS NOT NULL;
