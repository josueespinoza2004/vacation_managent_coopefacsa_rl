import { NextResponse } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { getAllVacationRequests, getVacationRequestsByEmployee, createVacationRequest, updateVacationRequestStatus } from '@/lib/db';

const SECRET = process.env.APP_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const employeeId = url.searchParams.get('employee_id');
  try {
    if (employeeId) {
      const rows = await getVacationRequestsByEmployee(employeeId);
      return NextResponse.json(rows);
    }
    const rows = await getAllVacationRequests();
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching requests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // debug log to help diagnose silent failures during development
    console.log('[api/vacation_requests] POST body:', JSON.stringify(body));
    const isoDate = (s: string) => !Number.isNaN(Date.parse(s));
    const schema = z.object({
      employee_id: z.string().uuid(),
      start_date: z.string().refine(isoDate, { message: 'start_date must be a valid ISO date string' }),
      end_date: z.string().refine(isoDate, { message: 'end_date must be a valid ISO date string' }),
      // allow fractional days (e.g., 0.5) for half-days; must be positive
      days: z.number().positive(),
      status: z.string().optional(),
      reason: z.string().optional(),
    });
    const p = schema.safeParse(body);
    if (!p.success) {
      console.error('[api/vacation_requests] validation error:', p.error.format());
      return NextResponse.json({ error: p.error.format() }, { status: 400 });
    }
    const created = await createVacationRequest(p.data);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error('[api/vacation_requests] server error:', err);
    return NextResponse.json({ error: err.message || 'Error creating request' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const schema = z.object({ id: z.string().uuid(), status: z.string() });
    const p = schema.safeParse(body);
    if (!p.success) return NextResponse.json({ error: p.error.format() }, { status: 400 });
    // try to infer deciding user from Authorization header
    const auth = request.headers.get('authorization') || '';
    const m = auth.match(/^Bearer (.+)$/);
    let decidedBy: string | undefined = undefined;
    if (m) {
      try {
        const payload: any = jwt.verify(m[1], SECRET);
        if (payload?.id) decidedBy = payload.id;
      } catch (e) {
        // ignore invalid token
      }
    }
    const updated = await updateVacationRequestStatus(p.data.id, p.data.status, decidedBy);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating request' }, { status: 500 });
  }
}
