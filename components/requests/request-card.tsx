"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Check, X, Calendar, Clock } from "lucide-react"

interface RequestCardProps {
  id: string
  employeeName: string
  position: string
  requestedDays: number
  startDate: string
  endDate: string
  status: "pending" | "approved" | "rejected"
  accumulatedDays: number
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  showActions?: boolean
}

export function RequestCard({
  id,
  employeeName,
  position,
  requestedDays,
  startDate,
  endDate,
  status,
  accumulatedDays,
  onApprove,
  onReject,
  showActions = true,
}: RequestCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusBadge = () => {
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

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(employeeName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{employeeName}</h3>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-muted-foreground">{position}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {startDate} - {endDate}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{requestedDays} días solicitados</span>
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Días acumulados: </span>
                <span className="font-semibold text-foreground">{accumulatedDays} días</span>
              </div>
            </div>
          </div>
        </div>
        {showActions && status === "pending" && (
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => onApprove?.(id)}
              className="flex-1 bg-success text-success-foreground hover:bg-success/90"
            >
              <Check className="mr-2 h-4 w-4" />
              Aprobar
            </Button>
            <Button
              onClick={() => onReject?.(id)}
              variant="outline"
              className="flex-1 border-danger text-danger hover:bg-danger/10"
            >
              <X className="mr-2 h-4 w-4" />
              Rechazar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
