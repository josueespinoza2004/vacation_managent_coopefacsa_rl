"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<any>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim()) return setError('El email es requerido')
    if (!password) return setError('La contraseña es requerida')
    setLoading(true)
    try {
      // Intentamos llamar al endpoint de login rápido (si existe)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json?.error || `Error ${res.status}`)
        setResult(null)
      } else {
        setResult(json)
        // store token for subsequent requests
        try {
          if (json?.token) {
            localStorage.setItem('token', json.token)
          }
        } catch (e) {
          // ignore storage errors
        }
        // redirect based on role
        const role = json?.user?.role
        if (role === 'admin') {
          router.push('/admin/panel')
        } else {
          router.push('/employee')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error en la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-10">
      <div className="w-full max-w-lg px-6">
        <div className="bg-white border rounded-xl shadow p-6">
          <div className="text-center mb-4">
            <div className="mx-auto mb-3 w-28 h-28 relative">
              <Image src="/images/logo.png" alt="Logo" fill style={{ objectFit: 'contain' }} />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold">Gestión de Vacaciones</h1>
            <p className="text-sm text-muted-foreground mt-1">Cooperativa San Antonio - COOPEFACSA R.L</p>
          </div>

          <h2 className="text-xl font-semibold mb-2">Iniciar Sesión</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-destructive">{error}</div>}
            <div>
              <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
              <Input value={email} onChange={(e) => setEmail((e.target as HTMLInputElement).value)} placeholder="tu.nombre@coopefacsa.coop.ni" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium">Contraseña</label>
                <Link href="#" className="text-sm text-sky-600">¿Olvidaste tu contraseña?</Link>
              </div>
              <Input type="password" value={password} onChange={(e) => setPassword((e.target as HTMLInputElement).value)} />
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Iniciando...' : 'Iniciar Sesión'}</Button>
            </div>
          </form>
        </div>
        {result && (
          <div className="mt-6 p-4 border rounded bg-muted">
            <h3 className="font-medium">Respuesta del servidor</h3>
            <pre className="text-xs mt-2">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
