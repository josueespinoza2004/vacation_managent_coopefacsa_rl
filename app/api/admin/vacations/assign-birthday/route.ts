import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createVacationRequest, getEmployeeById } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const schema = z.object({ employee_id: z.string().uuid(), admin_id: z.string().uuid().optional() , date: z.string().optional() });
    const p = schema.safeParse(body);
    if (!p.success) return NextResponse.json({ error: p.error.format() }, { status: 400 });

    const { employee_id, admin_id, date } = p.data;

    let theDate = date ?? null;
    if (!theDate) {
      // try to use birth_date from employee profile
      const emp = await getEmployeeById(employee_id);
      if (emp && emp.birthDate) {
        // emp.birthDate is a date string (YYYY-MM-DD) or Date object; normalize
        const d = new Date(emp.birthDate);
        // use this year's birthday
        const now = new Date();
        d.setFullYear(now.getFullYear());
        theDate = d.toISOString().slice(0,10);
      }
    }
    const today = theDate ?? new Date().toISOString().slice(0,10);

    // create an approved 1-day vacation of type 'birthday'
    const created = await createVacationRequest({ employee_id, start_date: today, end_date: today, days: 1, status: 'approved', type: 'birthday', requested_by: admin_id ?? null });
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error assigning birthday leave' }, { status: 500 });
  }
}
