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
  // onSubmit should return a Promise that resolves truthy on success, falsy on failure
  onSubmit: (data: { startDate: string; endDate: string; days: number }) => Promise<boolean | void>
}

export function VacationRequestForm({ open, onOpenChange, accumulatedDays, onSubmit }: VacationRequestFormProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  // requestedDays can be a number or empty string while editing to avoid passing NaN to the input value
  const [requestedDays, setRequestedDays] = useState<number | ''>(1)

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // validate requestedDays before submitting
    if (requestedDays === '' || Number.isNaN(requestedDays) || Number(requestedDays) <= 0) {
      // simple UI feedback; you can replace with better UI handling
      alert('Ingresa una cantidad válida de días solicitados')
      return
    }

    setSubmitting(true)
    try {
      const result = await onSubmit({ startDate, endDate, days: Number(requestedDays) })
      // only close the dialog and reset if handler indicates success (truthy) or undefined (assume success)
      if (result === false) {
        // keep dialog open for user to fix
        return
      }
      onOpenChange(false)
      // Reset form
      setStartDate("")
      setEndDate("")
      setRequestedDays(1)
    } finally {
      setSubmitting(false)
    }
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
              {/** Always render the input so user can see/enter days. Client-side validate against available days
               * and disable submit when not enough days. The server also enforces the guard.
               */}
              <Input
                id="days"
                type="number"
                min={Number(accumulatedDays) >= 0.5 ? 0.5 : 0}
                step={0.5}
                // pass a safe value to the input: convert '' to '' and numbers to string/number
                value={requestedDays === '' ? '' : (requestedDays as any)}
                onChange={(e) => {
                  const v = (e.target as HTMLInputElement).value
                  setRequestedDays(v === '' ? '' : Number.parseFloat(v))
                }}
                required
              />

              <p className="text-xs text-muted-foreground">Días disponibles: {accumulatedDays}</p>

              {/* Client-side balance validation */}
              {Number.isFinite(Number(accumulatedDays)) && Number(accumulatedDays) <= 0 && (
                <div className="text-sm text-red-600">No tienes días disponibles para solicitar.</div>
              )}
              {/* debug info removed */}
            </div>
          </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={submitting}>
                <Calendar className="mr-2 h-4 w-4" />
                {submitting ? 'Enviando...' : 'Enviar Solicitud'}
              </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
