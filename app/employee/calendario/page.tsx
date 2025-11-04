"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { useState, useEffect } from "react"

interface VacationEvent {
  id: string
  startDate: Date
  endDate: Date
  days: number
  status: "approved" | "pending"
}

// events will be fetched for the logged user

export default function CalendarioPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [events, setEvents] = useState<Array<{ id: string; startDate: string; endDate: string; days: number; status: string }>>([])

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) return;
        // get linked employee
        const empRes = await fetch('/api/auth/employee', { headers: { Authorization: `Bearer ${token}` } });
        if (!empRes.ok) return;
        const empJson = await empRes.json();
        const emp = empJson?.employee;
        if (!emp) return;
        const reqRes = await fetch(`/api/vacation_requests?employee_id=${emp.id}`);
        if (!reqRes.ok) return;
        const rs = await reqRes.json();
        const mapped = rs.map((r: any) => ({ id: r.id, startDate: r.start_date, endDate: r.end_date, days: Number(r.days), status: r.status }));
        setEvents(mapped);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [])

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar userRole="employee" />
      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Mi Calendario</h1>
            <p className="mt-2 text-muted-foreground">Vista de tus vacaciones programadas y pendientes</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Calendario de Vacaciones</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximas Vacaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          className={
                            event.status === "approved"
                              ? "bg-success text-success-foreground"
                              : "bg-warning text-warning-foreground"
                          }
                        >
                          {event.status === "approved" ? "Aprobada" : "Pendiente"}
                        </Badge>
                        <span className="text-sm font-medium">{event.days} días</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.startDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })} - {new Date(event.endDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                      </p>
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
