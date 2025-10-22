"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Employee {
  id: string
  name: string
  position: string
  status: "active" | "vacation" | "absent"
  accumulatedDays: number
}

const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "Diego Jovial",
    position: "Oficial de Crédito",
    status: "active",
    accumulatedDays: 12.5,
  },
  {
    id: "2",
    name: "Diego García García",
    position: "Gerente de Operaciones",
    status: "active",
    accumulatedDays: 8.0,
  },
  {
    id: "3",
    name: "Fran Herrera Díaz",
    position: "Analista Financiero",
    status: "vacation",
    accumulatedDays: 5.5,
  },
  {
    id: "4",
    name: "Samuel Fernández",
    position: "Asistente Administrativo",
    status: "active",
    accumulatedDays: 15.0,
  },
]

export function EmployeeList() {
  const getStatusBadge = (status: Employee["status"]) => {
    const variants = {
      active: { label: "Activo", className: "bg-success text-success-foreground" },
      vacation: { label: "Vacaciones", className: "bg-warning text-warning-foreground" },
      absent: { label: "Ausente", className: "bg-danger text-danger-foreground" },
    }
    const variant = variants[status]
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Equipo</CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por usuario..." className="pl-10" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockEmployees.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(employee.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{employee.name}</p>
                  <p className="text-sm text-muted-foreground">{employee.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{employee.accumulatedDays} días</p>
                  <p className="text-xs text-muted-foreground">Acumulados</p>
                </div>
                {getStatusBadge(employee.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
