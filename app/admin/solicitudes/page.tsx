"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { RequestCard } from "@/components/requests/request-card"
import { ApproveDialog } from "@/components/admin/approve-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface VacationRequest {
  id: string
  employeeName: string
  position: string
  requestedDays: number
  startDate: string
  endDate: string
  status: "pending" | "approved" | "rejected"
  accumulatedDays: number
  approvedDays?: number
}

const mockRequests: VacationRequest[] = [
  {
    id: "1",
    employeeName: "Juan Francisco Moreno",
    position: "Oficial de Crédito",
    requestedDays: 5,
    startDate: "10/05/2025",
    endDate: "14/05/2025",
    status: "pending",
    accumulatedDays: 12.5,
  },
  {
    id: "2",
    employeeName: "Norgen Antonio Polanco",
    position: "Oficial de Crédito",
    requestedDays: 3,
    startDate: "20/05/2025",
    endDate: "22/05/2025",
    status: "pending",
    accumulatedDays: 9.83,
  },
  {
    id: "3",
    employeeName: "Esther Vizcaíno",
    position: "Directora RRHH",
    requestedDays: 7,
    startDate: "01/06/2025",
    endDate: "07/06/2025",
    status: "approved",
    accumulatedDays: 15.0,
    approvedDays: 7,
  },
  {
    id: "4",
    employeeName: "Pedro Damián Salgado",
    position: "Analista Financiero",
    requestedDays: 4,
    startDate: "15/05/2025",
    endDate: "18/05/2025",
    status: "rejected",
    accumulatedDays: 8.0,
  },
]

export default function SolicitudesPage() {
  const [requests, setRequests] = useState(mockRequests)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<VacationRequest | null>(null)

  const handleApprove = (id: string) => {
    const request = requests.find((r) => r.id === id)
    if (request) {
      setSelectedRequest(request)
      setApproveDialogOpen(true)
    }
  }

  const handleConfirmApprove = (days: number) => {
    if (selectedRequest) {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest.id ? { ...req, status: "approved" as const, approvedDays: days } : req,
        ),
      )
    }
  }

  const handleReject = (id: string) => {
    setRequests((prev) => prev.map((req) => (req.id === id ? { ...req, status: "rejected" as const } : req)))
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const approvedRequests = requests.filter((r) => r.status === "approved")
  const rejectedRequests = requests.filter((r) => r.status === "rejected")

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar userRole="admin" />
      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Solicitudes de Vacaciones</h1>
            <p className="mt-2 text-muted-foreground">Gestiona las solicitudes de vacaciones del personal</p>
          </div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pendientes ({pendingRequests.length})</TabsTrigger>
              <TabsTrigger value="approved">Aprobadas ({approvedRequests.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rechazadas ({rejectedRequests.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6 space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-12 text-center">
                  <p className="text-muted-foreground">No hay solicitudes pendientes</p>
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <RequestCard key={request.id} {...request} onApprove={handleApprove} onReject={handleReject} />
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="mt-6 space-y-4">
              {approvedRequests.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-12 text-center">
                  <p className="text-muted-foreground">No hay solicitudes aprobadas</p>
                </div>
              ) : (
                approvedRequests.map((request) => <RequestCard key={request.id} {...request} showActions={false} />)
              )}
            </TabsContent>

            <TabsContent value="rejected" className="mt-6 space-y-4">
              {rejectedRequests.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-12 text-center">
                  <p className="text-muted-foreground">No hay solicitudes rechazadas</p>
                </div>
              ) : (
                rejectedRequests.map((request) => <RequestCard key={request.id} {...request} showActions={false} />)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {selectedRequest && (
        <ApproveDialog
          open={approveDialogOpen}
          onOpenChange={setApproveDialogOpen}
          requestedDays={selectedRequest.requestedDays}
          accumulatedDays={selectedRequest.accumulatedDays}
          employeeName={selectedRequest.employeeName}
          onConfirm={handleConfirmApprove}
        />
      )}
    </div>
  )
}
