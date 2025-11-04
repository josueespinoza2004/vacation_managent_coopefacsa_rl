import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getEmployeeById, updateEmployee, getDepartmentByName, getDepartmentById, createDepartment } from '@/lib/db';
import { deleteEmployee } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json();
  const schema = z.object({
    name: z.string().optional(),
    position: z.string().optional(),
    department: z.string().optional(),
    department_id: z.string().optional(),
    accumulatedDays: z.number().optional(),
    usedDays: z.number().optional(),
    pendingDays: z.number().optional(),
    monthlyRate: z.number().optional(),
    status: z.string().optional(),
  });
  const parse = schema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: parse.error.format() }, { status: 400 });

  const existing = await getEmployeeById(id);
  if (!existing) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });

  // resolve department -> department_id if provided by name
  let department_id: string | undefined = undefined;
  if (parse.data.department_id) {
    department_id = parse.data.department_id;
  } else if (parse.data.department) {
    // try to find by name; create if missing
    const found = await getDepartmentByName(parse.data.department);
    if (found) department_id = found.id;
    else {
      const created = await createDepartment(parse.data.department);
      department_id = created?.id;
    }
  }

  const payload: any = {};
  if (parse.data.name !== undefined) payload.name = parse.data.name;
  if (parse.data.position !== undefined) payload.position = parse.data.position;
  if (parse.data.department !== undefined) payload.department = parse.data.department;
  if (department_id !== undefined) payload.department_id = department_id;
  if (parse.data.accumulatedDays !== undefined) payload.accumulated_days = parse.data.accumulatedDays;
  if (parse.data.usedDays !== undefined) payload.used_days = parse.data.usedDays;
  if (parse.data.pendingDays !== undefined) payload.pending_days = parse.data.pendingDays;
  if (parse.data.monthlyRate !== undefined) payload.monthly_rate = parse.data.monthlyRate;
  if (parse.data.status !== undefined) payload.status = parse.data.status;

  const updated = await updateEmployee(id, payload);
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const existing = await getEmployeeById(id);
  if (!existing) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  const deleted = await deleteEmployee(id);
  return NextResponse.json({ success: true, deleted });
}
