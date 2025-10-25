// lib/db.ts
// @ts-ignore: pg types not installed in workspace; we provide a minimal declaration in types/global.d.ts
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL no está definida en el entorno');
}

let pool: Pool;

if (!globalThis.__pgPool) {
  pool = new Pool({ connectionString });
  // @ts-ignore - attach to global to avoid creating pool on hot reload
  globalThis.__pgPool = pool;
} else {
  // @ts-ignore
  pool = globalThis.__pgPool;
}

export async function query<T = any>(text: string, params?: any[]) {
  const res = await pool.query<T>(text, params);
  return res;
}

// convenience helpers
export async function getAllEmployees(department?: string) {
  // select employee columns and include department name from departments table
  let sql = `SELECT e.*, d.name AS department_name FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id`;
  const params: any[] = [];
  if (department && department !== 'Todos') {
    // allow filtering by department name or show unassigned
    if (department === 'Sin asignar') {
      sql += ' WHERE e.department_id IS NULL';
    } else {
      sql += ' WHERE d.name = $1';
      params.push(department);
    }
  }
  sql += ' ORDER BY e.name LIMIT 100';
  const { rows } = await query(sql, params.length ? params : undefined);
  return rows.map((r: any) => normalizeEmployeeRow(r));
}

export async function getEmployeeById(id: string) {
  const sql = `SELECT e.*, d.name AS department_name FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE e.id = $1`;
  const { rows } = await query(sql, [id]);
  return rows[0] ? normalizeEmployeeRow(rows[0]) : null;
}

export async function createEmployee(data: {
  id?: string;
  name: string;
  position?: string;
  department?: string;
  department_id?: string | null;
  accumulated_days?: number;
  used_days?: number;
  pending_days?: number;
  monthly_rate?: number;
}) {
  const { name, position, department, accumulated_days = 0, used_days = 0, pending_days = 0, monthly_rate = 0 } = data;
  // Insert only department_id reference (don't maintain separate department text)
  const cols = ['name','position','accumulated_days','used_days','pending_days','monthly_rate'];
  const vals: any[] = [name, position, accumulated_days, used_days, pending_days, monthly_rate];
  if (data.department_id) {
    cols.push('department_id');
    vals.push(data.department_id);
  }
  const placeholders = vals.map((_, i) => `$${i+1}`).join(',');
  const text = `INSERT INTO employees (${cols.join(',')}) VALUES (${placeholders}) RETURNING *`;
  const { rows } = await query(text, vals);
  return rows[0] ? normalizeEmployeeRow(rows[0]) : null;
}

function normalizeEmployeeRow(r: any) {
  return {
    id: r.id,
    name: r.name,
    position: r.position,
    department: r.department_name ?? r.department ?? null,
    departmentId: r.department_id ?? null,
    // default status to 'active' for consistency
    status: r.status ?? 'active',
    accumulatedDays: r.accumulated_days !== null && r.accumulated_days !== undefined ? Number(r.accumulated_days) : r.accumulated_days,
    usedDays: r.used_days !== null && r.used_days !== undefined ? Number(r.used_days) : r.used_days,
    pendingDays: r.pending_days !== null && r.pending_days !== undefined ? Number(r.pending_days) : r.pending_days,
    monthlyRate: r.monthly_rate !== null && r.monthly_rate !== undefined ? Number(r.monthly_rate) : r.monthly_rate,
    createdAt: r.created_at,
  };
}

// --- Vacation requests helpers ---
export async function getAllVacationRequests() {
  const sql = `SELECT vr.*, e.name AS employee_name FROM vacation_requests vr
    LEFT JOIN employees e ON vr.employee_id = e.id
    ORDER BY vr.start_date DESC LIMIT 500`;
  const { rows } = await query(sql);
  // normalize types: days -> number
  return rows.map((r: any) => ({
    id: r.id,
    employee_id: r.employee_id,
    employee_name: r.employee_name,
    start_date: r.start_date,
    end_date: r.end_date,
    days: r.days !== null && r.days !== undefined ? Number(r.days) : r.days,
    status: r.status,
    type: r.type,
    reason: r.reason,
    requested_by: r.requested_by,
    decided_by: r.decided_by,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

export async function getVacationRequestsByEmployee(employeeId: string) {
  const sql = `SELECT vr.*, e.name AS employee_name FROM vacation_requests vr
    LEFT JOIN employees e ON vr.employee_id = e.id
    WHERE vr.employee_id = $1
    ORDER BY vr.start_date DESC`;
  const { rows } = await query(sql, [employeeId]);
  return rows.map((r: any) => ({
    id: r.id,
    employee_id: r.employee_id,
    employee_name: r.employee_name,
    start_date: r.start_date,
    end_date: r.end_date,
    days: r.days !== null && r.days !== undefined ? Number(r.days) : r.days,
    status: r.status,
    type: r.type,
    reason: r.reason,
    requested_by: r.requested_by,
    decided_by: r.decided_by,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

export async function createVacationRequest(data: {
  employee_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  days: number;
  status?: string;
  type?: string;
  reason?: string;
  requested_by?: string | null;
}) {
  const { employee_id, start_date, end_date, days, status = 'pending', type = 'request', reason = null, requested_by = null } = data;
  const text = `INSERT INTO vacation_requests (employee_id, start_date, end_date, days, status, type, reason, requested_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;
  const { rows } = await query(text, [employee_id, start_date, end_date, days, status, type, reason, requested_by]);

  // If request is created as pending, increment employee.pending_days
  if (status === 'pending') {
    await query('UPDATE employees SET pending_days = COALESCE(pending_days,0) + $1 WHERE id = $2', [days, employee_id]);
  }

  // If created already approved (e.g., birthday), adjust used_days
  if (status === 'approved') {
    await query('UPDATE employees SET used_days = COALESCE(used_days,0) + $1 WHERE id = $2', [days, employee_id]);
  }

  return rows[0];
}

export async function updateVacationRequestStatus(id: string, status: string, decided_by?: string | null) {
  // read current request to know days and current status
  const { rows: found } = await query('SELECT * FROM vacation_requests WHERE id = $1', [id]);
  const req = found[0];
  if (!req) return null;
  const employeeId = req.employee_id;
  const days = Number(req.days || 0);
  const currentStatus = req.status;

  // Update the request row
  const text = `UPDATE vacation_requests SET status = $1, decided_by = $2, updated_at = now() WHERE id = $3 RETURNING *`;
  const { rows } = await query(text, [status, decided_by || null, id]);

  // adjust employee counters depending on transition
  if (currentStatus === 'pending' && status === 'approved') {
    // pending -> approved: decrement pending, increment used
    await query('UPDATE employees SET pending_days = GREATEST(COALESCE(pending_days,0) - $1,0), used_days = COALESCE(used_days,0) + $1 WHERE id = $2', [days, employeeId]);
  } else if (currentStatus === 'pending' && status === 'rejected') {
    // pending -> rejected: decrement pending
    await query('UPDATE employees SET pending_days = GREATEST(COALESCE(pending_days,0) - $1,0) WHERE id = $2', [days, employeeId]);
  } else if (currentStatus === 'approved' && status !== 'approved') {
    // approved -> not approved: rollback used_days (edge case)
    await query('UPDATE employees SET used_days = GREATEST(COALESCE(used_days,0) - $1,0) WHERE id = $2', [days, employeeId]);
  }

  return rows[0] || null;
}

// --- Attendance helpers ---
export async function getAttendanceByEmployee(employeeId: string, fromDate?: string, toDate?: string) {
  let text = 'SELECT * FROM attendance WHERE employee_id = $1';
  const params: any[] = [employeeId];
  if (fromDate && toDate) {
    text += ' AND date BETWEEN $2 AND $3 ORDER BY date DESC';
    params.push(fromDate, toDate);
  } else {
    text += ' ORDER BY date DESC LIMIT 200';
  }
  const { rows } = await query(text, params);
  return rows;
}

export async function createAttendance(data: { employee_id: string; date: string; status: string; note?: string }) {
  const { employee_id, date, status, note = null } = data;
  const text = `INSERT INTO attendance (employee_id, date, status, note) VALUES ($1,$2,$3,$4) RETURNING *`;
  const { rows } = await query(text, [employee_id, date, status, note]);
  return rows[0];
}

export async function updateAttendance(id: string, status: string, note?: string) {
  const text = `UPDATE attendance SET status = $1, note = $2 WHERE id = $3 RETURNING *`;
  const { rows } = await query(text, [status, note || null, id]);
  return rows[0] || null;
}

export async function getAllDepartments() {
  // return canonical list from departments table (id + name)
  const sql = `SELECT id, name FROM departments ORDER BY name`;
  const { rows } = await query(sql);
  return rows.map((r: any) => ({ id: r.id, name: r.name }));
}

export async function createDepartment(name: string) {
  const text = `INSERT INTO departments (name) VALUES ($1) RETURNING *`;
  const { rows } = await query(text, [name]);
  return rows[0] || null;
}

export async function getDepartmentById(id: string) {
  const { rows } = await query('SELECT * FROM departments WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function getDepartmentByName(name: string) {
  const { rows } = await query('SELECT * FROM departments WHERE name = $1', [name]);
  return rows[0] || null;
}

export async function updateDepartment(id: string, name: string) {
  const text = `UPDATE departments SET name = $1 WHERE id = $2 RETURNING *`;
  const { rows } = await query(text, [name, id]);
  return rows[0] || null;
}

export async function deleteDepartment(id: string) {
  // clear department_id on employees referencing this department to avoid FK issues
  await query('UPDATE employees SET department_id = NULL WHERE department_id = $1', [id]);
  const { rows } = await query('DELETE FROM departments WHERE id = $1 RETURNING *', [id]);
  return rows[0] || null;
}

export async function updateEmployee(id: string, data: { name?: string; position?: string; department?: string; department_id?: string; accumulated_days?: number; used_days?: number; pending_days?: number; monthly_rate?: number; status?: string }) {
  const set: string[] = [];
  const params: any[] = [];
  let idx = 1;
  const push = (field: string, value: any) => {
    set.push(`${field} = $${idx++}`);
    params.push(value);
  };
  if (data.name !== undefined) push('name', data.name);
  if (data.position !== undefined) push('position', data.position);
  // if caller provided a department name, resolve it to department_id and store only the id
  if (data.department !== undefined) {
    if (data.department === null) {
      push('department_id', null);
    } else {
      const d = await getDepartmentByName(data.department);
      push('department_id', d ? d.id : null);
    }
  }
  if (data.department_id !== undefined) push('department_id', data.department_id);
  if (data.accumulated_days !== undefined) push('accumulated_days', data.accumulated_days);
  if (data.used_days !== undefined) push('used_days', data.used_days);
  if (data.pending_days !== undefined) push('pending_days', data.pending_days);
  if (data.monthly_rate !== undefined) push('monthly_rate', data.monthly_rate);
  if (data.status !== undefined) push('status', data.status);
  if (set.length === 0) return await getEmployeeById(id);
  const text = `UPDATE employees SET ${set.join(', ')} WHERE id = $${idx} RETURNING *`;
  params.push(id);
  const { rows } = await query(text, params);
  return rows[0] ? normalizeEmployeeRow(rows[0]) : null;
}

export async function deleteEmployee(id: string) {
  const { rows } = await query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);
  return rows[0] || null;
}

// --- Users / Auth helpers ---
export async function createUser(data: { email: string; password_hash?: string | null; role?: string; name?: string }) {
  const { email, password_hash = null, role = 'user', name = null } = data;
  const { rows } = await query(
    'INSERT INTO users (email, password_hash, role, name) VALUES ($1,$2,$3,$4) RETURNING *',
    [email, password_hash, role, name]
  );
  return rows[0] || null;
}

export async function getUserByEmail(email: string) {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

export async function getUserById(id: string) {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function linkEmployeeToUser(employeeId: string, userId: string) {
  await query('UPDATE employees SET user_id = $1 WHERE id = $2', [userId, employeeId]);
  return await getEmployeeById(employeeId);
}

export async function getEmployeeByUserId(userId: string) {
  const { rows } = await query('SELECT e.*, d.name AS department_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id WHERE e.user_id = $1', [userId]);
  return rows[0] ? normalizeEmployeeRow(rows[0]) : null;
}

// --- Vacation balance calculation ---
export async function getVacationBalance(employeeId: string) {
  const emp = await getEmployeeById(employeeId);
  if (!emp) return null;
  const monthlyRate = emp.monthlyRate !== null && emp.monthlyRate !== undefined ? Number(emp.monthlyRate) : 2.5;
  const createdAt = emp.createdAt ? new Date(emp.createdAt) : new Date();
  const now = new Date();
  // calculate full months elapsed from createdAt to now
  const years = now.getFullYear() - createdAt.getFullYear();
  const months = now.getMonth() - createdAt.getMonth();
  const monthsElapsed = Math.max(0, years * 12 + months);
  const accruedByTime = Number((monthsElapsed * monthlyRate).toFixed(2));

  const accumulated = emp.accumulatedDays !== null && emp.accumulatedDays !== undefined ? Number(emp.accumulatedDays) : 0;
  const used = emp.usedDays !== null && emp.usedDays !== undefined ? Number(emp.usedDays) : 0;
  const pending = emp.pendingDays !== null && emp.pendingDays !== undefined ? Number(emp.pendingDays) : 0;

  const totalAvailable = Number((accumulated + accruedByTime - used - pending).toFixed(2));

  return {
    employeeId: emp.id,
    accumulated,
    accruedByTime,
    used,
    pending,
    available: totalAvailable,
    monthlyRate,
    monthsElapsed,
  };
}