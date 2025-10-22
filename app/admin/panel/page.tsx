"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, TrendingDown } from "lucide-react"
import { useState } from "react"

interface Employee {
  id: string
  name: string
  position: string
  department: string
  accumulatedDays: number
  usedDays: number
  pendingDays: number
  monthlyRate: number
}

const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "Juan Francisco Moreno",
    position: "Oficial de Crédito",
    department: "Créditos",
    accumulatedDays: 12.5,
    usedDays: 7.5,
    pendingDays: 5.0,
    monthlyRate: 2.5,
  },
  {
    id: "2",
    name: "Norgen Antonio Polanco",
    position: "Oficial de Crédito",
    department: "Créditos",
    accumulatedDays: 9.83,
    usedDays: 5.5,
    pendingDays: 4.33,
    monthlyRate: 2.5,
  },
  {
    id: "3",
    name: "Esther Vizcaíno",
    position: "Directora RRHH",
    department: "Recursos Humanos",
    accumulatedDays: 15.0,
    usedDays: 8.0,
    pendingDays: 7.0,
    monthlyRate: 2.5,
  },
  {
    id: "4",
    name: "Pedro Damián Salgado",
    position: "Analista Financiero",
    department: "Finanzas",
    accumulatedDays: 8.0,
    usedDays: 3.5,
    pendingDays: 4.5,
    monthlyRate: 2.5,
  },
  {
    id: "5",
    name: "Diego Jovial",
    position: "Desarrollador",
    department: "Tecnología",
    accumulatedDays: 11.0,
    usedDays: 6.0,
    pendingDays: 5.0,
    monthlyRate: 2.5,
  },
]

export default function PanelPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEmployees = mockEmployees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar userRole="admin" />
      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Panel de Vacaciones</h1>
            <p className="mt-2 text-muted-foreground">Vista completa de días acumulados por colaborador</p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, cargo o departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Employee Table */}
          <Card>
            <CardHeader>
              <CardTitle>Colaboradores ({filteredEmployees.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">Colaborador</th>
                      <th className="pb-3 text-left text-sm font-semibold text-foreground">Departamento</th>
                      <th className="pb-3 text-right text-sm font-semibold text-foreground">Acumulados</th>
                      <th className="pb-3 text-right text-sm font-semibold text-foreground">Utilizados</th>
                      <th className="pb-3 text-right text-sm font-semibold text-foreground">Pendientes</th>
                      <th className="pb-3 text-right text-sm font-semibold text-foreground">Tasa Mensual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="border-b border-border last:border-0">
                        <td className="py-4">
                          <div>
                            <p className="font-medium text-foreground">{employee.name}</p>
                            <p className="text-sm text-muted-foreground">{employee.position}</p>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge variant="outline">{employee.department}</Badge>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="font-semibold text-foreground">{employee.accumulatedDays}</span>
                            <TrendingUp className="h-3 w-3 text-success" />
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-muted-foreground">{employee.usedDays}</span>
                            <TrendingDown className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <Badge
                            className={
                              employee.pendingDays > 5
                                ? "bg-success text-success-foreground"
                                : "bg-warning text-warning-foreground"
                            }
                          >
                            {employee.pendingDays} días
                          </Badge>
                        </td>
                        <td className="py-4 text-right text-muted-foreground">+{employee.monthlyRate} días/mes</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
