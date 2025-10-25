import { NextResponse } from 'next/server'
import { hash } from 'bcrypt'
import { createUser, getUserByEmail, linkEmployeeToUser } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { employeeId, email,  password, role = 'user', name = null } = body
    if (!employeeId || !email || !password) return NextResponse.json({ error: 'employeeId, email and password are required' }, { status: 400 })

    // check if email already exists
    const exists = await getUserByEmail(email)
    if (exists) return NextResponse.json({ error: 'Email already in use' }, { status: 400 })

    // hash password
    const hashed = await hash(password, 10)
    const user = await createUser({ email, password_hash: hashed, role, name })

    // link employee
    await linkEmployeeToUser(employeeId, user.id)

    return NextResponse.json({ ok: true, user })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 })
  }
}
