"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { StatCard } from "@/components/dashboard/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, FileText, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { VacationRequestForm } from "@/components/employee/vacation-request-form"

export default function EmployeeDashboard() {
  const [requestFormOpen, setRequestFormOpen] = useState(false)

  const employeeData = {
    name: "Juan Francisco Moreno",
    position: "Oficial de Crédito",
    accumulatedDays: 12.5,
    usedDays: 7.5,
    pendingRequests: 1,
    monthlyAccumulation: 2.5,
  }

  const recentRequests = [
    {
      id: "1",
      startDate: "10/05/2025",
      endDate: "14/05/2025",
      days: 5,
      status: "pending" as const,
    },
    {
      id: "2",
      startDate: "01/04/2025",
      endDate: "03/04/2025",
      days: 2.5,
      status: "approved" as const,
    },
  ]

  const getStatusBadge = (status: "pending" | "approved" | "rejected") => {
    const variants = {
      pending: { label: "Pendiente", className: "bg-warning text-warning-foreground" },
      approved: { label: "Aprobada", className: "bg-success text-success-foreground" },
      rejected: { label: "Rechazada", className: "bg-danger text-danger-foreground" },
    }
    const variant = variants[status]
    return (
      <Badge className={variant.className} variant="secondary">
        {variant.label}
      </Badge>
    )
  }

  const handleSubmitRequest = (data: { startDate: string; endDate: string; days: number }) => {
    console.log("[v0] Nueva solicitud:", data)
    // Here you would send the request to your backend
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar userRole="employee" />
      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Bienvenido, {employeeData.name.split(" ")[0]}</h1>
            <p className="mt-2 text-muted-foreground">{employeeData.position}</p>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <StatCard
              title="Días Acumulados"
              value={employeeData.accumulatedDays}
              subtitle={`+${employeeData.monthlyAccumulation} días/mes`}
              icon={Calendar}
              variant="success"
            />
            <StatCard
              title="Días Utilizados"
              value={employeeData.usedDays}
              subtitle="Este año"
              icon={Clock}
              variant="default"
            />
            <StatCard
              title="Solicitudes Pendientes"
              value={employeeData.pendingRequests}
              subtitle="En revisión"
              icon={FileText}
              variant="warning"
            />
          </div>

          <Card className="mb-8 border-l-4 border-l-accent bg-gradient-to-r from-accent/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">¿Necesitas tomar vacaciones?</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tienes {employeeData.accumulatedDays} días disponibles para solicitar
                  </p>
                </div>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => setRequestFormOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Solicitud
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Requests */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Mis Solicitudes Recientes</CardTitle>
                <Link href="/employee/solicitudes">
                  <Button variant="ghost" size="sm">
                    Ver todas
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {request.startDate} - {request.endDate}
                        </p>
                        <p className="text-sm text-muted-foreground">{request.days} días solicitados</p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <VacationRequestForm
        open={requestFormOpen}
        onOpenChange={setRequestFormOpen}
        accumulatedDays={employeeData.accumulatedDays}
        onSubmit={handleSubmitRequest}
      />
    </div>
  )
}
