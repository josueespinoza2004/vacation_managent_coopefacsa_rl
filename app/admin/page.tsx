"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { StatCard } from "@/components/dashboard/stat-card"
import { VacationCalendar } from "@/components/dashboard/vacation-calendar"
import { BirthdayCard } from "@/components/admin/birthday-card"
import { NotificationBadge } from "@/components/admin/notification-badge"
import { Calendar, FileText, Users, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()

  const [birthdays, setBirthdays] = useState<Array<any>>([])

  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; time: string; read: boolean }>>([])

  const [stats, setStats] = useState({ pending: 0, approvedThisMonth: 0, totalEmployees: 0, avgAccumulatedDays: 0 })

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

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

        // fetch requests and employees in parallel
        const [reqRes, empRes] = await Promise.all([
          fetch('/api/vacation_requests', { headers: token ? { Authorization: `Bearer ${token}` } : undefined }),
          fetch('/api/employees', { headers: token ? { Authorization: `Bearer ${token}` } : undefined }),
        ])

        if (!reqRes.ok || !empRes.ok) {
          console.error('Error fetching data for admin dashboard')
          return
        }

        const requests = await reqRes.json()
        const employees = await empRes.json()

        // compute pending count
        const pending = (requests || []).filter((r: any) => r.status === 'pending').length

        // approved this month
        const now = new Date()
        const thisMonth = (requests || []).filter((r: any) => {
          if (!r.start_date) return false
          const sd = new Date(r.start_date)
          return r.status === 'approved' && sd.getFullYear() === now.getFullYear() && sd.getMonth() === now.getMonth()
        }).length

        const totalEmployees = (employees || []).length
        const avgAccumulatedDays = totalEmployees > 0 ? ((employees || []).reduce((acc: number, e: any) => acc + (Number(e.accumulatedDays || e.accumulated_days || 0)), 0) / totalEmployees).toFixed(2) : '0'

        setStats({ pending, approvedThisMonth: thisMonth, totalEmployees, avgAccumulatedDays: Number(avgAccumulatedDays) })

        // build notifications from pending requests (top 6)
        const notifs = (requests || [])
          .filter((r: any) => r.status === 'pending')
          .slice(0, 6)
          .map((r: any) => ({ id: r.id, message: `${r.employee_name ?? 'Empleado'} solicitó ${r.days} días`, time: new Date(r.created_at).toLocaleString(), read: false }))

        setNotifications(notifs)

        // birthdays: fallback to employees whose created_at month === now month if no birth_date
        const bdays = (employees || [])
          .filter((e: any) => {
            try {
              if (!e.createdAt && !e.created_at) return false
              const d = new Date(e.createdAt || e.created_at)
              return d.getMonth() === now.getMonth()
            } catch {
              return false
            }
          })
          .slice(0, 6)
          .map((e: any, i: number) => ({ id: e.id || String(i), name: e.name, position: e.position || '', date: (e.createdAt || e.created_at) ? new Date(e.createdAt || e.created_at).toLocaleDateString() : '', hasLeaveAssigned: false }))

        setBirthdays(bdays)
      } catch (err) {
        console.error('Error loading admin dashboard', err)
      }
    })()
  }, [])

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
              value={stats.pending}
              subtitle="Requieren atención"
              icon={FileText}
              variant="warning"
              onClick={() => router.push("/admin/solicitudes")}
            />
            <StatCard title="Vacaciones Aprobadas" value={stats.approvedThisMonth} subtitle="Este mes" icon={Calendar} variant="success" />
            <StatCard title="Personal Activo" value={stats.totalEmployees} subtitle="Colaboradores" icon={Users} variant="default" />
            <StatCard
              title="Días Promedio"
              value={stats.avgAccumulatedDays}
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
