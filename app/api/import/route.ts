import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST /api/import
// body: { employees: [...], vacation_requests: [...] }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const employees = body.employees || [];
    const requests = body.vacation_requests || [];

    let empCount = 0;
    for (const e of employees) {
      // simple upsert by id if present, otherwise by name
      if (e.id) {
        await query(`INSERT INTO employees (id, name, position, department, accumulated_days, used_days, pending_days, monthly_rate, created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8, NOW())
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, position = EXCLUDED.position, department = EXCLUDED.department`, [
          e.id, e.name, e.position || null, e.department || null, e.accumulatedDays || 0, e.usedDays || 0, e.pendingDays || 0, e.monthlyRate || 0,
        ]);
      } else {
        await query(`INSERT INTO employees (name, position, department, accumulated_days, used_days, pending_days, monthly_rate, created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7, NOW())
          ON CONFLICT (name) DO UPDATE SET position = EXCLUDED.position, department = EXCLUDED.department`, [
          e.name, e.position || null, e.department || null, e.accumulatedDays || 0, e.usedDays || 0, e.pendingDays || 0, e.monthlyRate || 0,
        ]);
      }
      empCount++;
    }

    let reqCount = 0;
    for (const r of requests) {
      await query(`INSERT INTO vacation_requests (employee_id, start_date, end_date, days, status, reason, created_at)
        VALUES ($1,$2,$3,$4,$5,$6, NOW())`, [r.employee_id, r.start_date, r.end_date, r.days, r.status || 'pending', r.reason || null]);
      reqCount++;
    }

    return NextResponse.json({ imported: { employees: empCount, vacation_requests: reqCount } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Import failed' }, { status: 500 });
  }
}
