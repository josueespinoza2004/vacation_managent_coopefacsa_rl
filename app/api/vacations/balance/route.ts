import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getVacationBalance } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employee_id');
    const schema = z.string().uuid();
    const p = schema.safeParse(employeeId);
    if (!p.success) return NextResponse.json({ error: 'employee_id required' }, { status: 400 });
    const bal = await getVacationBalance(employeeId as string);
    if (!bal) return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 });
    return NextResponse.json(bal);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error calculating balance' }, { status: 500 });
  }
}
