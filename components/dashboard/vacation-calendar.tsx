"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

interface VacationEvent {
  id: string
  employeeName: string
  startDate: Date
  endDate: Date
  days: number
}

const mockEvents: VacationEvent[] = [
  {
    id: "1",
    employeeName: "Juan Pérez",
    startDate: new Date(2025, 9, 10),
    endDate: new Date(2025, 9, 20),
    days: 10,
  },
  {
    id: "2",
    employeeName: "María González",
    startDate: new Date(2025, 9, 15),
    endDate: new Date(2025, 9, 18),
    days: 3,
  },
]

export function VacationCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1)) // October 2025

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const monthNames = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ]

  const dayNames = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"]

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const hasVacation = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return mockEvents.some((event) => date >= event.startDate && date <= event.endDate)
  }

  const getVacationEvent = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return mockEvents.find((event) => date >= event.startDate && date <= event.endDate)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-xs font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="p-2" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const vacation = hasVacation(day)
            const event = getVacationEvent(day)
            return (
              <div
                key={day}
                className={`relative min-h-[60px] rounded-lg border p-2 transition-colors ${
                  vacation ? "border-accent bg-accent/10" : "border-border hover:bg-muted"
                }`}
              >
                <span className="text-sm font-medium">{day}</span>
                {vacation && event && (
                  <div className="mt-1 rounded bg-accent px-1 py-0.5 text-[10px] font-medium text-accent-foreground">
                    {event.employeeName.split(" ")[0]}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
