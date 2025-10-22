"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Plus } from "lucide-react"
import { useState } from "react"
import { VacationRequestForm } from "@/components/employee/vacation-request-form"

interface Request {
  id: string
  startDate: string
  endDate: string
  days: number
  status: "pending" | "approved" | "rejected"
  requestDate: string
  approvedDays?: number
}

const mockRequests: Request[] = [
  {
    id: "1",
    startDate: "10/05/2025",
    endDate: "14/05/2025",
    days: 5,
    status: "pending",
    requestDate: "01/05/2025",
  },
  {
    id: "2",
    startDate: "01/04/2025",
    endDate: "03/04/2025",
    days: 2.5,
    status: "approved",
    requestDate: "20/03/2025",
    approvedDays: 2.5,
  },
  {
    id: "3",
    startDate: "15/03/2025",
    endDate: "18/03/2025",
    days: 4,
    status: "approved",
    requestDate: "01/03/2025",
    approvedDays: 3,
  },
  {
    id: "4",
    startDate: "10/02/2025",
    endDate: "12/02/2025",
    days: 3,
    status: "rejected",
    requestDate: "25/01/2025",
  },
]

export default function SolicitudesPage() {
  const [requestFormOpen, setRequestFormOpen] = useState(false)

  const getStatusBadge = (status: Request["status"]) => {
    const variants = {
      pending: { label: "Pendiente", className: "bg-warning text-warning-foreground" },
      approved: { label: "Aprobada", className: "bg-success text-success-foreground" },
      rejected: { label: "Rechazada", className: "bg-danger text-danger-foreground" },
    }
    const variant = variants[status]
    return <Badge className={variant.className}>{variant.label}</Badge>
  }

  const handleSubmitRequest = (data: { startDate: string; endDate: string; days: number }) => {
    console.log("[v0] Nueva solicitud:", data)
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar userRole="employee" />
      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mis Solicitudes</h1>
              <p className="mt-2 text-muted-foreground">Historial completo de solicitudes de vacaciones</p>
            </div>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => setRequestFormOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Solicitud
            </Button>
          </div>

          <div className="space-y-4">
            {mockRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-lg font-semibold text-foreground">
                            {request.startDate} - {request.endDate}
                          </p>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Solicitado el {request.requestDate}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Días solicitados: <span className="font-medium text-foreground">{request.days}</span>
                          </span>
                          {request.approvedDays && (
                            <span className="text-muted-foreground">
                              Días aprobados: <span className="font-medium text-success">{request.approvedDays}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <VacationRequestForm
        open={requestFormOpen}
        onOpenChange={setRequestFormOpen}
        accumulatedDays={12.5}
        onSubmit={handleSubmitRequest}
      />
    </div>
  )
}
