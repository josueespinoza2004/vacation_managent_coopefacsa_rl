"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { useState, useEffect } from "react"

interface AttendanceRecord {
  id: string
  name: string
  position: string
  status: "present" | "absent" | "vacation" | "leave"
  checkIn?: string
  checkOut?: string
}

// attendance will be derived from employees/attendance API — start empty and fetch

export default function PresenciaPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [employees, setEmployees] = useState<Array<{ id: string; name: string; position?: string }>>([])

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch('/api/employees', { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        if (!res.ok) return;
        const rows = await res.json();
        setEmployees(rows);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [])

  const getStatusBadge = (status: AttendanceRecord["status"]) => {
    const variants = {
      present: { label: "Presente", className: "bg-success text-success-foreground" },
      absent: { label: "Ausente", className: "bg-danger text-danger-foreground" },
      vacation: { label: "Vacaciones", className: "bg-accent text-accent-foreground" },
      leave: { label: "Permiso", className: "bg-warning text-warning-foreground" },
    }
    const variant = variants[status]
    return <Badge className={variant.className}>{variant.label}</Badge>
  }

  // For now we mark all loaded employees as 'present' in the list —
  // this removes the static mocks and connects to the live employee API.
  const presentCount = employees.length
  const totalCount = employees.length

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar userRole="admin" />
      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Presencia</h1>
            <p className="mt-2 text-muted-foreground">Control de asistencia del personal</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Calendario</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
              </CardContent>
            </Card>

            {/* Attendance List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Asistencia de Hoy</CardTitle>
                  <Badge variant="outline">
                    {presentCount}/{totalCount} Presentes
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees.map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div>
                        <p className="font-medium text-foreground">{emp.name}</p>
                        <p className="text-sm text-muted-foreground">{emp.position}</p>
                      </div>
                      {getStatusBadge('present')}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
