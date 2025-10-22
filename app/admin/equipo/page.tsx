"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Calendar } from "lucide-react"

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

const mockTeam: TeamMember[] = [
  {
    id: "1",
    name: "Diego Jovial",
    position: "Desarrollador Senior",
    department: "Tecnología",
    email: "diego.jovial@coopefacsa.com",
    phone: "+1 809-555-0101",
    startDate: "15/01/2020",
    status: "active",
  },
  {
    id: "2",
    name: "Diego García García",
    position: "Analista de Sistemas",
    department: "Tecnología",
    email: "diego.garcia@coopefacsa.com",
    phone: "+1 809-555-0102",
    startDate: "20/03/2021",
    status: "active",
  },
  {
    id: "3",
    name: "Fran Herrera Díaz",
    position: "Gerente de Operaciones",
    department: "Operaciones",
    email: "fran.herrera@coopefacsa.com",
    phone: "+1 809-555-0103",
    startDate: "10/06/2019",
    status: "vacation",
  },
  {
    id: "4",
    name: "Samuel Fernández",
    position: "Contador",
    department: "Finanzas",
    email: "samuel.fernandez@coopefacsa.com",
    phone: "+1 809-555-0104",
    startDate: "05/09/2022",
    status: "active",
  },
]

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
            {mockTeam.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 bg-primary text-primary-foreground">
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{member.position}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{member.department}</Badge>
                    {getStatusBadge(member.status)}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Desde {member.startDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
