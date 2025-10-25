// app/api/employees/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAllEmployees, createEmployee, getDepartmentById } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const department = url.searchParams.get('department') || undefined;
    const rows = await getAllEmployees(department);
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching employees' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  // validar body mínimamente (p. ej. name requerido)
  const schema = z.object({
    name: z.string().min(1),
    position: z.string().optional(),
    department_id: z.string().uuid(),
    accumulatedDays: z.number().optional(),
    usedDays: z.number().optional(),
    pendingDays: z.number().optional(),
    monthlyRate: z.number().optional(),
  });

  const parse = schema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.format() }, { status: 400 });
  }

  const b = parse.data;
  // validate department_id exists
  const dept = await getDepartmentById(b.department_id);
  if (!dept) {
    return NextResponse.json({ error: 'department_id no existe' }, { status: 400 });
  }
  // map camelCase input to snake_case DB columns
  const payload = {
    name: b.name,
    position: b.position,
    department_id: b.department_id,
    accumulated_days: b.accumulatedDays,
    used_days: b.usedDays,
    pending_days: b.pendingDays,
    monthly_rate: b.monthlyRate,
  };
  const created = await createEmployee(payload as any);
  return NextResponse.json(created, { status: 201 });
}