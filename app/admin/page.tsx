"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { StatCard } from "@/components/dashboard/stat-card"
import { VacationCalendar } from "@/components/dashboard/vacation-calendar"
import { BirthdayCard } from "@/components/admin/birthday-card"
import { NotificationBadge } from "@/components/admin/notification-badge"
import { Calendar, FileText, Users, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()

  const [birthdays, setBirthdays] = useState([
    { id: "1", name: "Juan Francisco Moreno", position: "Oficial de Crédito", date: "15 Oct", hasLeaveAssigned: false },
    { id: "2", name: "María González", position: "Analista", date: "22 Oct", hasLeaveAssigned: true },
  ])

  const [notifications, setNotifications] = useState([
    { id: "1", message: "Juan Francisco Moreno solicitó 5 días de vacaciones", time: "Hace 10 min", read: false },
    { id: "2", message: "Norgen Antonio Polanco solicitó 3 días de vacaciones", time: "Hace 1 hora", read: false },
    { id: "3", message: "Solicitud de Esther Vizcaíno fue aprobada", time: "Hace 2 horas", read: true },
  ])

  const handleAssignLeave = (id: string) => {
    // call API to assign birthday leave; optimistic update
    (async () => {
      try {
        const res = await fetch('/api/admin/vacations/assign-birthday', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ employee_id: id })
        });
        if (res.ok) {
          setBirthdays((prev) => prev.map((b) => (b.id === id ? { ...b, hasLeaveAssigned: true } : b)))
        } else {
          console.error('Error assigning birthday leave', await res.text())
        }
      } catch (err) {
        console.error('Error assigning birthday leave', err)
      }
    })();
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar userRole="admin" />
      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
              <p className="mt-2 text-muted-foreground">Gestión de vacaciones y presencia del personal</p>
            </div>
            <NotificationBadge notifications={notifications} onMarkAsRead={handleMarkAsRead} />
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Solicitudes Pendientes"
              value="7"
              subtitle="Requieren atención"
              icon={FileText}
              variant="warning"
              onClick={() => router.push("/admin/solicitudes")}
            />
            <StatCard title="Vacaciones Aprobadas" value="12" subtitle="Este mes" icon={Calendar} variant="success" />
            <StatCard title="Personal Activo" value="45" subtitle="Colaboradores" icon={Users} variant="default" />
            <StatCard
              title="Días Promedio"
              value="8.5"
              subtitle="Acumulados por persona"
              icon={Clock}
              variant="default"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3 mb-6">
            <div className="lg:col-span-1">
              <BirthdayCard birthdays={birthdays} onAssignLeave={handleAssignLeave} />
            </div>
            <div className="lg:col-span-2">
              <VacationCalendar />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
