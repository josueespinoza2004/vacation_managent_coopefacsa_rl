import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createVacationRequest } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const schema = z.object({ employee_id: z.string().uuid(), admin_id: z.string().uuid().optional() , date: z.string().optional() });
    const p = schema.safeParse(body);
    if (!p.success) return NextResponse.json({ error: p.error.format() }, { status: 400 });

    const { employee_id, admin_id, date } = p.data;
    const today = date ?? new Date().toISOString().slice(0,10);

    // create an approved 1-day vacation of type 'birthday'
    const created = await createVacationRequest({ employee_id, start_date: today, end_date: today, days: 1, status: 'approved', type: 'birthday', requested_by: admin_id ?? null });
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error assigning birthday leave' }, { status: 500 });
  }
}
