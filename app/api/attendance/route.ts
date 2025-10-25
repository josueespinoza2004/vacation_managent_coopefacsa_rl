import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAttendanceByEmployee, createAttendance, updateAttendance } from '@/lib/db';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const employeeId = url.searchParams.get('employee_id');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  try {
    if (!employeeId) return NextResponse.json({ error: 'employee_id required' }, { status: 400 });
    const rows = await getAttendanceByEmployee(employeeId, from || undefined, to || undefined);
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching attendance' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const schema = z.object({ employee_id: z.string().uuid(), date: z.string(), status: z.string(), note: z.string().optional() });
    const p = schema.safeParse(body);
    if (!p.success) return NextResponse.json({ error: p.error.format() }, { status: 400 });
    const created = await createAttendance(p.data);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating attendance' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const schema = z.object({ id: z.string().uuid(), status: z.string(), note: z.string().optional() });
    const p = schema.safeParse(body);
    if (!p.success) return NextResponse.json({ error: p.error.format() }, { status: 400 });
    const updated = await updateAttendance(p.data.id, p.data.status, p.data.note);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating attendance' }, { status: 500 });
  }
}
