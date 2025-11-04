"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Calendar } from "lucide-react"
import { EmployeeList } from "@/components/dashboard/employee-list"

interface TeamMember {
  id: string
  name: string
  position: string
  department: string
  email: string
  phone: string
  startDate: string
  status: "active" | "vacation" | "leave"
}

export default function EquipoPage() {
  const getStatusBadge = (status: TeamMember["status"]) => {
    const variants = {
      active: { label: "Activo", className: "bg-success text-success-foreground" },
      vacation: { label: "De Vacaciones", className: "bg-accent text-accent-foreground" },
      leave: { label: "Permiso", className: "bg-warning text-warning-foreground" },
    }
    const variant = variants[status]
    return <Badge className={variant.className}>{variant.label}</Badge>
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
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar userRole="admin" />
      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Equipo</h1>
            <p className="mt-2 text-muted-foreground">Directorio completo del personal de Coopefacsa R.L</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="md:col-span-2 lg:col-span-3">
              <EmployeeList />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
