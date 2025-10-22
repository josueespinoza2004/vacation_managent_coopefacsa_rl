"use client"

import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  variant?: "default" | "warning" | "success" | "danger"
  onClick?: () => void
}

export function StatCard({ title, value, subtitle, icon: Icon, variant = "default", onClick }: StatCardProps) {
  const variantStyles = {
    default: "border-l-4 border-l-primary",
    warning: "border-l-4 border-l-warning",
    success: "border-l-4 border-l-success",
    danger: "border-l-4 border-l-danger",
  }

  const iconColors = {
    default: "text-primary",
    warning: "text-warning",
    success: "text-success",
    danger: "text-danger",
  }

  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-md",
        variantStyles[variant],
        onClick && "cursor-pointer hover:scale-[1.02] transition-transform",
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
            {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={cn("rounded-lg bg-muted p-3", iconColors[variant])}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
