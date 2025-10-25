import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDepartmentById, updateDepartment, deleteDepartment } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json();
  const schema = z.object({ name: z.string().min(1) });
  const parse = schema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: parse.error.format() }, { status: 400 });
  const existing = await getDepartmentById(id);
  if (!existing) return NextResponse.json({ error: 'Department not found' }, { status: 404 });
  const updated = await updateDepartment(id, parse.data.name);
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const existing = await getDepartmentById(id);
  if (!existing) return NextResponse.json({ error: 'Department not found' }, { status: 404 });
  const deleted = await deleteDepartment(id);
  return NextResponse.json(deleted);
}
