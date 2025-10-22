"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"

interface VacationEvent {
  id: string
  startDate: Date
  endDate: Date
  days: number
  status: "approved" | "pending"
}

const mockEvents: VacationEvent[] = [
  {
    id: "1",
    startDate: new Date(2025, 4, 10),
    endDate: new Date(2025, 4, 14),
    days: 5,
    status: "pending",
  },
  {
    id: "2",
    startDate: new Date(2025, 3, 1),
    endDate: new Date(2025, 3, 3),
    days: 2.5,
    status: "approved",
  },
]

export default function CalendarioPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

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
                  {mockEvents.map((event) => (
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
                        {event.startDate.toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                        })}{" "}
                        -{" "}
                        {event.endDate.toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                        })}
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
