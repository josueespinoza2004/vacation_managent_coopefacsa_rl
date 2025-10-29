"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Props = {
  onSuccess?: (created: any) => void
  initialData?: any
  employeeId?: string
}

export default function EmployeeCreateForm({ onSuccess, initialData, employeeId }: Props) {
  const [name, setName] = React.useState('')
  const [position, setPosition] = React.useState('')
  const [departmentId, setDepartmentId] = React.useState<string | null>(null)
  const [accumulatedDays, setAccumulatedDays] = React.useState<number | ''>('')
  const [usedDays, setUsedDays] = React.useState<number | ''>('')
  const [pendingDays, setPendingDays] = React.useState<number | ''>('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [role, setRole] = React.useState<'user' | 'admin'>('user')
  // monthlyRate removed — not needed
  const [departments, setDepartments] = React.useState<Array<{ id: string; name: string }>>([])
  const [birthDate, setBirthDate] = React.useState<string | null>(null)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/departments')
        if (!res.ok) return
        const data = await res.json()
        if (mounted) setDepartments(data)
      } catch (e) {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // populate initial data when editing
  React.useEffect(() => {
    if (!initialData) return
    setName(initialData.name || '')
    setPosition(initialData.position || '')
    setDepartmentId(initialData.departmentId || null)
    setAccumulatedDays(initialData.accumulatedDays ?? '')
    setUsedDays(initialData.usedDays ?? '')
    setPendingDays(initialData.pendingDays ?? '')
    setBirthDate(initialData.birthDate ?? null)
    setPreviewUrl(initialData.profilePhoto ?? null)
  }, [initialData])

  // revoke preview on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) return setError('El nombre es requerido')
    if (!departmentId) return setError('Selecciona un área')
    setLoading(true)
    try {
      let uploadedUrl: string | undefined = undefined
      // if a file is selected, upload it first
      if (selectedFile) {
        const form = new FormData()
        form.append('file', selectedFile)
        const upRes = await fetch('/api/upload', { method: 'POST', body: form })
        if (!upRes.ok) {
          const ue = await upRes.json().catch(() => ({}))
          throw new Error(ue?.error || `Error subiendo imagen (${upRes.status})`)
        }
        const upj = await upRes.json()
        uploadedUrl = upj.url
      }

      const payload: any = {
        name: name.trim(),
        position: position || undefined,
        department_id: departmentId,
        birth_date: birthDate || undefined,
        profile_photo: uploadedUrl || previewUrl || undefined,
      }
      // If creating a new employee, ensure account fields are provided (mandatory)
      if (!employeeId) {
        if (!email.trim()) return setError('El email es requerido para crear la cuenta')
        if (!password) return setError('La contraseña es requerida para crear la cuenta')
      }
      if (accumulatedDays !== '') payload.accumulatedDays = Number(accumulatedDays)
      if (usedDays !== '') payload.usedDays = Number(usedDays)
      if (pendingDays !== '') payload.pendingDays = Number(pendingDays)
  // monthlyRate intentionally omitted

      const url = employeeId ? `/api/employees/${employeeId}` : '/api/employees'
      const method = employeeId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `HTTP ${res.status}`)
      }
  const created = await res.json()
      // create linked user account for newly created employee
      if (!employeeId) {
        try {
          // note: validations already performed above
          const userRes = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId: created.id, email, password, role, name: name.trim() }),
          })
          if (!userRes.ok) {
            const ue = await userRes.json().catch(() => ({}))
            throw new Error(ue?.error || `Error creando usuario (${userRes.status})`)
          }
        } catch (uErr: any) {
          // if user creation fails, surface error but keep the employee created
          setError(uErr.message || 'Error creando cuenta de usuario')
        }
      }
      if (onSuccess) onSuccess(created)
      // clear form
      setName('')
      setPosition('')
      setDepartmentId(null)
      setAccumulatedDays('')
      setUsedDays('')
      setPendingDays('')
    setBirthDate(null)
    setSelectedFile(null)
    setPreviewUrl(null)
  // clear account fields
  setEmail('')
  setPassword('')
  setRole('user')
  // monthlyRate cleared (field removed)
    } catch (err: any) {
      setError(err.message || 'Error creando colaborador')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="text-destructive">{error}</div>}
      <div>
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <Input value={name} onChange={(e) => setName((e.target as HTMLInputElement).value)} placeholder="Nombre completo" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Cargo</label>
        <Input value={position} onChange={(e) => setPosition((e.target as HTMLInputElement).value)} placeholder="Ej: Analista" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Área</label>
        <select value={departmentId ?? ''} onChange={(e) => setDepartmentId(e.target.value || null)} className="w-full rounded border border-border bg-background px-3 py-2">
          <option value="">Selecciona un área</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Acumulados</label>
          <Input type="number" value={accumulatedDays as any} onChange={(e) => setAccumulatedDays(e.target.value === '' ? '' : Number((e.target as HTMLInputElement).value))} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Usados</label>
          <Input type="number" value={usedDays as any} onChange={(e) => setUsedDays(e.target.value === '' ? '' : Number((e.target as HTMLInputElement).value))} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pendientes</label>
          <Input type="number" value={pendingDays as any} onChange={(e) => setPendingDays(e.target.value === '' ? '' : Number((e.target as HTMLInputElement).value))} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Fecha de nacimiento</label>
        <input type="date" value={birthDate ?? ''} onChange={(e) => setBirthDate((e.target as HTMLInputElement).value || null)} className="w-full rounded border border-border bg-background px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Foto de perfil</label>
        <input type="file" accept="image/*" onChange={(e) => {
          const f = (e.target as HTMLInputElement).files?.[0] ?? null
          setSelectedFile(f)
          if (f) {
            const u = URL.createObjectURL(f)
            setPreviewUrl(u)
          }
        }} />
        {previewUrl && <div className="mt-2"><img src={previewUrl} alt="preview" className="h-20 w-20 object-cover rounded" /></div>}
      </div>
      {/* monthlyRate field removed */}
      <div className="flex justify-end gap-2">
        <div className="w-full">
          {/* Account fields are mandatory for new employees */}
          <div className="mt-3 space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
              <Input value={email} onChange={(e) => setEmail((e.target as HTMLInputElement).value)} placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contraseña</label>
              <Input type="password" value={password} onChange={(e) => setPassword((e.target as HTMLInputElement).value)} placeholder="Contraseña temporal" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rol</label>
              <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full rounded border border-border bg-background px-3 py-2">
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button type="submit" variant="secondary" disabled={loading}>
              {loading ? (employeeId ? 'Actualizando...' : 'Creando...') : (employeeId ? 'Actualizar Colaborador' : 'Crear Colaborador')}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
