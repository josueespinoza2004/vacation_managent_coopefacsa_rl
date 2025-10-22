"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "lucide-react"

interface VacationRequestFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accumulatedDays: number
  onSubmit: (data: { startDate: string; endDate: string; days: number }) => void
}

export function VacationRequestForm({ open, onOpenChange, accumulatedDays, onSubmit }: VacationRequestFormProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [requestedDays, setRequestedDays] = useState(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ startDate, endDate, days: requestedDays })
    onOpenChange(false)
    // Reset form
    setStartDate("")
    setEndDate("")
    setRequestedDays(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Solicitud de Vacaciones</DialogTitle>
          <DialogDescription>Completa el formulario para solicitar tus días de vacaciones</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de fin</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days">Días solicitados</Label>
              <Input
                id="days"
                type="number"
                min={0.5}
                max={accumulatedDays}
                step={0.5}
                value={requestedDays}
                onChange={(e) => setRequestedDays(Number.parseFloat(e.target.value))}
                required
              />
              <p className="text-xs text-muted-foreground">Días disponibles: {accumulatedDays}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Calendar className="mr-2 h-4 w-4" />
              Enviar Solicitud
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
