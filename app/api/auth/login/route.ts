import { NextResponse } from 'next/server'
import { compare } from 'bcrypt'
import jwt from 'jsonwebtoken'
import { getUserByEmail } from '@/lib/db'

const SECRET = process.env.APP_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret'

export async function POST(req: Request) {
  try {
    const body = await req.json()
  const { email, password } = body || {}
    if (!email || !password) return NextResponse.json({ error: 'email and password required' }, { status: 400 })

  const user = await getUserByEmail(email)
    if (!user) return NextResponse.json({ error: 'invalid credentials' }, { status: 401 })

  const ok = await compare(password, user.password_hash)
    if (!ok) return NextResponse.json({ error: 'invalid credentials' }, { status: 401 })

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '8h' })

    return NextResponse.json({ token, user: { id: user.id, email: user.email, role: user.role } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 })
  }
}
