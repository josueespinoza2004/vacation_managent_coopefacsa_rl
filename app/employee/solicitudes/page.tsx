"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Plus } from "lucide-react"
import { useState, useEffect } from "react"
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

// initial empty list — will be loaded from the API for the current user

export default function SolicitudesPage() {
  const [requestFormOpen, setRequestFormOpen] = useState(false)
  const [employeeId, setEmployeeId] = useState<string | null>(null)
  const [availableDays, setAvailableDays] = useState<number>(12.5)
  const [requests, setRequests] = useState<Request[]>([])

  useEffect(() => {
    // fetch linked employee for current user and then load requests and balance
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) return;
        const empRes = await fetch('/api/auth/employee', { headers: { Authorization: `Bearer ${token}` } });
        if (!empRes.ok) return;
        const empJson = await empRes.json();
        const emp = empJson?.employee;
        if (!emp) return;
        setEmployeeId(emp.id);
        // load balance
        const balRes = await fetch(`/api/vacations/balance?employee_id=${emp.id}`);
        if (balRes.ok) {
          const b = await balRes.json();
          setAvailableDays(Number(b.available ?? 0));
        }
        // load requests
        const reqRes = await fetch(`/api/vacation_requests?employee_id=${emp.id}`);
        if (reqRes.ok) {
          const rs = await reqRes.json();
          // map to local Request shape
          const mapped: Request[] = rs.map((r: any) => ({
            id: r.id,
            startDate: r.start_date,
            endDate: r.end_date,
            days: Number(r.days),
            status: r.status,
            requestDate: r.created_at,
            approvedDays: r.status === 'approved' ? Number(r.days) : undefined,
          }));
          setRequests(mapped);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const getStatusBadge = (status: Request["status"]) => {
    const variants = {
      pending: { label: "Pendiente", className: "bg-warning text-warning-foreground" },
      approved: { label: "Aprobada", className: "bg-success text-success-foreground" },
      rejected: { label: "Rechazada", className: "bg-danger text-danger-foreground" },
    }
    const variant = variants[status]
    return <Badge className={variant.className}>{variant.label}</Badge>
  }

  const handleSubmitRequest = async (data: { startDate: string; endDate: string; days: number }) => {
    try {
      if (!employeeId) {
        console.error('Empleado no vinculado.');
        return false;
      }
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('/api/vacation_requests', {
        method: 'POST',
        headers: { 'content-type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ employee_id: employeeId, start_date: data.startDate, end_date: data.endDate, days: data.days }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        console.error('Error creando solicitud', text);
        return false;
      }
      const created = await res.json();
      // append to UI list
      setRequests((prev) => [
        {
          id: created.id,
          startDate: created.start_date,
          endDate: created.end_date,
          days: Number(created.days),
          status: created.status,
          requestDate: created.created_at,
        },
        ...prev,
      ]);
      // refresh balance
      const balRes = await fetch(`/api/vacations/balance?employee_id=${employeeId}`);
      if (balRes.ok) {
        const b = await balRes.json();
        setAvailableDays(Number(b.available ?? 0));
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
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
            {requests.map((request) => (
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
        accumulatedDays={availableDays}
        onSubmit={handleSubmitRequest}
      />
    </div>
  )
}
