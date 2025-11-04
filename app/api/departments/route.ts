import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAllDepartments, createDepartment } from '@/lib/db';

export async function GET() {
  try {
    const rows = await getAllDepartments();
    // return array of { id, name } objects; client can add 'Todos'/'Sin asignar' options
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching departments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const schema = z.object({ name: z.string().min(1) });
  const parse = schema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: parse.error.format() }, { status: 400 });
  const created = await createDepartment(parse.data.name);
  return NextResponse.json(created, { status: 201 });
}
