import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getUserById } from '@/lib/db'

const SECRET = process.env.APP_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret'

export async function GET(req: Request) {
  try {
    const auth = req.headers.get('authorization') || ''
    const m = auth.match(/^Bearer (.+)$/)
    if (!m) return NextResponse.json({ user: null }, { status: 401 })
    const token = m[1]
    const payload: any = jwt.verify(token, SECRET)
    const user = await getUserById(payload.id)
    if (!user) return NextResponse.json({ user: null }, { status: 401 })
    return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } })
  } catch (err: any) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
