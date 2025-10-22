"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Cake, Gift } from "lucide-react"

interface Birthday {
  id: string
  name: string
  position: string
  date: string
  hasLeaveAssigned: boolean
}

interface BirthdayCardProps {
  birthdays: Birthday[]
  onAssignLeave: (id: string) => void
}

export function BirthdayCard({ birthdays, onAssignLeave }: BirthdayCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Cake className="h-5 w-5 text-warning" />
          <CardTitle className="text-xl">Cumpleaños del Mes</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {birthdays.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">No hay cumpleaños este mes</p>
          ) : (
            birthdays.map((birthday) => (
              <div
                key={birthday.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-warning/10 p-2">
                    <Gift className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{birthday.name}</p>
                    <p className="text-xs text-muted-foreground">{birthday.position}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {birthday.date}
                  </Badge>
                  {birthday.hasLeaveAssigned ? (
                    <Badge className="bg-success text-success-foreground text-xs">Asignado</Badge>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => onAssignLeave(birthday.id)} className="text-xs">
                      Asignar Libre
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
