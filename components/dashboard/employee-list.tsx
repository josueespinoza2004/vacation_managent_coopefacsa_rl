"use client"

import React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import EmployeeCreateForm from '@/components/employee/employee-create-form'

interface Employee {
  id: string
  name: string
  position?: string
  status?: "active" | "vacation" | "absent"
  accumulatedDays?: number
  usedDays?: number
  pendingDays?: number
  profilePhoto?: string | null
}


export function EmployeeList() {
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [query, setQuery] = React.useState('')
  const [department, setDepartment] = React.useState<string>('Todos')
  const [departments, setDepartments] = React.useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingEmployee, setEditingEmployee] = React.useState<any | null>(null)

  const fetchEmployees = React.useCallback(async (dept?: string) => {
    let mounted = true
    try {
      setLoading(true)
      const q = dept && dept !== 'Todos' ? `?department=${encodeURIComponent(dept)}` : ''
      const res = await fetch(`/api/employees${q}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (mounted) setEmployees(data)
    } catch (err: any) {
      if (mounted) setError(err.message || 'Error fetching employees')
    } finally {
      if (mounted) setLoading(false)
    }
    return () => {
      mounted = false
    }
  }, [])

  React.useEffect(() => {
    fetchEmployees(department)
  }, [department, fetchEmployees])

  // fetch departments for dropdown
  React.useEffect(() => {
    let mounted = true
    async function loadDeps() {
      try {
        const res = await fetch('/api/departments')
        if (!res.ok) return
        const data = await res.json()
        if (mounted) setDepartments(data)
      } catch (e) {
        // ignore
      }
    }
    loadDeps()
    return () => {
      mounted = false
    }
  }, [])

  const getStatusBadge = (status?: Employee["status"]) => {
    const variants: Record<string, { label: string; className: string }> = {
      active: { label: "Activo", className: "bg-success text-success-foreground" },
      vacation: { label: "Vacaciones", className: "bg-warning text-warning-foreground" },
      absent: { label: "Ausente", className: "bg-danger text-danger-foreground" },
    }
    const variant = variants[status ?? 'active'] ?? variants['active']
    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const filtered = employees.filter((e) => e.name?.toLowerCase().includes(query.toLowerCase()))

  return (
  <Card className="w-full max-w-full">
      <CardHeader>
        <CardTitle className="text-xl">Equipo</CardTitle>
        <div className="flex gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por usuario..." className="pl-10" value={query} onChange={(e) => setQuery((e.target as HTMLInputElement).value)} />
          </div>
          <div className="w-48">
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full rounded border border-border bg-background px-3 py-2">
              <option value="Todos">Todos</option>
              <option value="Sin asignar">Sin asignar</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
  <CardAction className="pr-4">
          <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setEditingEmployee(null); } setDialogOpen(open) }}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm" onClick={() => { setEditingEmployee(null); setDialogOpen(true); }}>Agregar Colaborador</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>{editingEmployee ? 'Editar Colaborador' : 'Agregar Colaborador'}</DialogTitle>
              <EmployeeCreateForm employeeId={editingEmployee?.id} initialData={editingEmployee} onSuccess={(created) => {
                setDialogOpen(false)
                setEditingEmployee(null)
                // refresh list
                fetchEmployees(department)
              }} />
              <DialogFooter />
            </DialogContent>
          </Dialog>
  </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading && (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-slate-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-40 rounded bg-slate-200" />
                      <div className="h-3 w-28 rounded bg-slate-200" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-16 rounded bg-slate-200" />
                    <div className="h-6 w-24 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </>
          )}
          {error && <div className="text-destructive">{error}</div>}
          {!loading && !error && filtered.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary group overflow-hidden">
                  {employee.profilePhoto ? (
                    <AvatarImage src={employee.profilePhoto} alt={employee.name} className="object-cover size-full transition-transform duration-200 transform group-hover:scale-110" />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(employee.name)}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{employee.name}</p>
                  <p className="text-sm text-muted-foreground">{employee.position}</p>
                </div>
              </div>
                  <div className="flex items-center gap-4">
                    {/* metrics: show accumulated, used and pending side-by-side on sm+ */}
                    <div className="hidden sm:flex sm:items-center sm:gap-6 self-center ml-6">
                      <div className="flex flex-col items-center justify-center bg-muted/10 border border-border px-3 py-1 rounded-md">
                        <p className="text-sm font-semibold text-foreground leading-none">{employee.accumulatedDays ?? 0}días</p>
                        <p className="text-xs text-muted-foreground">Acumulados</p>
                      </div>

                      <div className="flex flex-col items-center justify-center bg-muted/10 border border-border px-3 py-1 rounded-md">
                        <p className="text-sm font-semibold text-foreground leading-none">{employee.usedDays ?? 0}días</p>
                        <p className="text-xs text-muted-foreground">Usados</p>
                      </div>

                      <div className="flex flex-col items-center justify-center bg-muted/10 border border-border px-3 py-1 rounded-md">
                        <p className="text-sm font-semibold text-foreground leading-none">{employee.pendingDays ?? 0}días</p>
                        <p className="text-xs text-muted-foreground">Pendientes</p>
                      </div>
                    </div>

                    {/* fallback for very small screens: show accumulated only */}
                    <div className="sm:hidden flex flex-col items-center justify-center text-center">
                      <div className="bg-muted/10 border border-border px-3 py-1 rounded-md">
                        <p className="text-sm font-semibold text-foreground">{employee.accumulatedDays ?? 0}d</p>
                        <p className="text-xs text-muted-foreground">Acumulados</p>
                      </div>
                    </div>

                    {getStatusBadge(employee.status)}

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="default" className="bg-warning text-warning-foreground hover:bg-warning/90" onClick={() => { setEditingEmployee(employee); setDialogOpen(true); }}>Editar</Button>
                      <Button size="sm" variant="destructive" onClick={async () => {
                        if (!confirm('¿Eliminar este colaborador?')) return
                        try {
                          const res = await fetch(`/api/employees/${employee.id}`, { method: 'DELETE' })
                          if (!res.ok) throw new Error(`HTTP ${res.status}`)
                          // refresh
                          fetchEmployees(department)
                        } catch (e) {
                          console.error(e)
                          alert('Error al eliminar')
                        }
                      }}>Eliminar</Button>
                    </div>
                  </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
