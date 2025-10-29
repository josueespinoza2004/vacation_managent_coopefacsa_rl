import { NextResponse } from 'next/server'
import { hash } from 'bcrypt'
import { getUserByEmail, updateEmployee } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { employeeId, email,  password, role = 'user', name = null } = body
    if (!employeeId || !email || !password) return NextResponse.json({ error: 'employeeId, email and password are required' }, { status: 400 })

    // check if email already exists on another employee
    const exists = await getUserByEmail(email)
    if (exists && String(exists.id) !== String(employeeId)) return NextResponse.json({ error: 'Email already in use' }, { status: 400 })

    // hash password and update existing employee record with account fields
    const hashed = await hash(password, 10)
    const updated = await updateEmployee(employeeId, { email, password_hash: hashed, role, name })

    return NextResponse.json({ ok: true, user: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 })
  }
}
