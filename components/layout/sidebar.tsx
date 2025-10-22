"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, FileText, Clock, Users, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface SidebarProps {
  userRole: "admin" | "employee"
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const adminLinks = [
    { href: "/admin", label: "Inicio", icon: Home },
    { href: "/admin/panel", label: "Panel de Vacaciones", icon: Calendar },
    { href: "/admin/solicitudes", label: "Solicitudes", icon: FileText },
    { href: "/admin/presencia", label: "Presencia", icon: Clock },
    { href: "/admin/equipo", label: "Equipo", icon: Users },
  ]

  const employeeLinks = [
    { href: "/employee", label: "Inicio", icon: Home },
    { href: "/employee/calendario", label: "Calendario", icon: Calendar },
    { href: "/employee/solicitudes", label: "Mis Solicitudes", icon: FileText },
  ]

  const links = userRole === "admin" ? adminLinks : employeeLinks

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
      <div className="flex h-full flex-col">
        {/* Logo and Title */}
        <div className="border-b border-border p-6">
          <div className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Coopefacsa Logo" width={48} height={48} className="rounded-lg" />
            <div>
              <h1 className="text-lg font-semibold text-primary">Gestión de Vacaciones</h1>
              <p className="text-xs text-muted-foreground">Coopefacsa R.L</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 p-4">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
                style={
                  isActive
                    ? { backgroundColor: 'var(--color-success)', color: 'var(--color-success-foreground)' }
                    : undefined
                }
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-border p-4">
          <div className="mb-3 rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">{userRole === "admin" ? "Recursos Humanos" : "Personal"}</p>
            <p className="text-sm font-medium">Hamil Hayala</p>
          </div>
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10">
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>
  )
}
