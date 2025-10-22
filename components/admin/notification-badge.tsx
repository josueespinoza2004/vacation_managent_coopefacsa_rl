"use client"

import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Notification {
  id: string
  message: string
  time: string
  read: boolean
}

interface NotificationBadgeProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
}

export function NotificationBadge({ notifications, onMarkAsRead }: NotificationBadgeProps) {
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-danger p-0 text-[10px] text-danger-foreground flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <h3 className="font-semibold text-sm mb-2">Notificaciones</h3>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No hay notificaciones</p>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`cursor-pointer ${!notification.read ? "bg-accent/50" : ""}`}
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <div className="flex flex-col gap-1 w-full">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
