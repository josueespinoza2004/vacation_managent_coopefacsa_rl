import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getEmployeeById } from '@/lib/db';

const SECRET = process.env.APP_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret';

export async function GET(req: Request) {
  try {
    const auth = req.headers.get('authorization') || '';
    const m = auth.match(/^Bearer (.+)$/);
    if (!m) return NextResponse.json({ employee: null }, { status: 401 });
    const token = m[1];
    const payload: any = jwt.verify(token, SECRET);
  const employee = await getEmployeeById(payload.id);
    if (!employee) return NextResponse.json({ employee: null }, { status: 404 });
    return NextResponse.json({ employee });
  } catch (err: any) {
    return NextResponse.json({ employee: null }, { status: 401 });
  }
}
