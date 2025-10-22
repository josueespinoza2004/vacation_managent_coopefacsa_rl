"use client"

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

interface ApproveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestedDays: number
  accumulatedDays: number
  employeeName: string
  onConfirm: (days: number) => void
}

export function ApproveDialog({
  open,
  onOpenChange,
  requestedDays,
  accumulatedDays,
  employeeName,
  onConfirm,
}: ApproveDialogProps) {
  const [approvedDays, setApprovedDays] = useState(requestedDays)

  const handleConfirm = () => {
    onConfirm(approvedDays)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aprobar Solicitud de Vacaciones</DialogTitle>
          <DialogDescription>Define la cantidad de días a aprobar para {employeeName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="days">Días a aprobar</Label>
            <Input
              id="days"
              type="number"
              min={0.5}
              max={accumulatedDays}
              step={0.5}
              value={approvedDays}
              onChange={(e) => setApprovedDays(Number.parseFloat(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Días solicitados: {requestedDays} | Días acumulados: {accumulatedDays}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className="bg-success text-success-foreground hover:bg-success/90">
            Aprobar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
