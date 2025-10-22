"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"

interface AttendanceRecord {
  id: string
  name: string
  position: string
  status: "present" | "absent" | "vacation" | "leave"
  checkIn?: string
  checkOut?: string
}

const mockAttendance: AttendanceRecord[] = [
  {
    id: "1",
    name: "Diego Jovial",
    position: "Desarrollador",
    status: "present",
    checkIn: "08:15 AM",
    checkOut: "05:30 PM",
  },
  {
    id: "2",
    name: "Diego García García",
    position: "Analista",
    status: "present",
    checkIn: "08:00 AM",
  },
  {
    id: "3",
    name: "Fran Herrera Díaz",
    position: "Gerente",
    status: "vacation",
  },
  {
    id: "4",
    name: "Samuel Fernández",
    position: "Contador",
    status: "present",
    checkIn: "08:30 AM",
  },
]

export default function PresenciaPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

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

  const presentCount = mockAttendance.filter((a) => a.status === "present").length
  const totalCount = mockAttendance.length

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
                  {mockAttendance.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div>
                        <p className="font-medium text-foreground">{record.name}</p>
                        <p className="text-sm text-muted-foreground">{record.position}</p>
                        {record.checkIn && (
                          <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                            <span>Entrada: {record.checkIn}</span>
                            {record.checkOut && <span>Salida: {record.checkOut}</span>}
                          </div>
                        )}
                      </div>
                      {getStatusBadge(record.status)}
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
