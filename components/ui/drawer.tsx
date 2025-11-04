'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils'

type Direction = 'left' | 'right' | 'top' | 'bottom'

const DrawerContext = React.createContext<{
  open: boolean
  setOpen: (v: boolean) => void
} | null>(null)

function useDrawer() {
  const ctx = React.useContext(DrawerContext)
  if (!ctx) throw new Error('Drawer components must be used within a <Drawer />')
  return ctx
}

function Drawer({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen! : uncontrolledOpen

  const setOpen = React.useCallback(
    (v: boolean) => {
      if (!isControlled) setUncontrolledOpen(v)
      onOpenChange?.(v)
    },
    [isControlled, onOpenChange],
  )

  return (
    <DrawerContext.Provider value={{ open, setOpen }}>{children}</DrawerContext.Provider>
  )
}

function DrawerTrigger({ children }: { children: React.ReactNode }) {
  const { setOpen } = useDrawer()

  if (React.isValidElement(children)) {
    const child = children as React.ReactElement<any>
    return React.cloneElement(child, {
      onClick: (e: any) => {
        ;(child.props as any)?.onClick?.(e)
        setOpen(true)
      },
    } as any)
  }

  return (
    <button type="button" onClick={() => setOpen(true)}>
      {children}
    </button>
  )
}

function DrawerClose({ children }: { children: React.ReactNode }) {
  const { setOpen } = useDrawer()

  if (React.isValidElement(children)) {
    const child = children as React.ReactElement<any>
    return React.cloneElement(child, {
      onClick: (e: any) => {
        ;(child.props as any)?.onClick?.(e)
        setOpen(false)
      },
    } as any)
  }

  return (
    <button type="button" onClick={() => setOpen(false)}>
      {children}
    </button>
  )
}

function DrawerPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === 'undefined') return null
  return createPortal(children, document.body)
}

function DrawerOverlay({ className }: { className?: string }) {
  const { setOpen } = useDrawer()
  return (
    <div
      data-slot="drawer-overlay"
      onClick={() => setOpen(false)}
      className={cn(
        'fixed inset-0 z-40 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out',
        className,
      )}
    />
  )
}

function DrawerContent({
  children,
  className,
  direction = 'right',
}: {
  children: React.ReactNode
  className?: string
  direction?: Direction
}) {
  const { open } = useDrawer()

  if (!open) return null

  const directionClasses: Record<Direction, string> = {
    top: 'inset-x-0 top-0 mb-24 max-h-[80vh] rounded-b-lg border-b',
    bottom: 'inset-x-0 bottom-0 mt-24 max-h-[80vh] rounded-t-lg border-t',
    right: 'inset-y-0 right-0 w-3/4 border-l sm:max-w-sm',
    left: 'inset-y-0 left-0 w-3/4 border-r sm:max-w-sm',
  }

  return (
    <DrawerPortal>
      <DrawerOverlay />
      <div
        data-slot="drawer-content"
        data-drawer-direction={direction}
        className={cn(
          'group/drawer-content bg-background fixed z-50 flex h-auto flex-col',
          directionClasses[direction],
          className,
        )}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[drawer-direction=bottom]/drawer-content:block" />
        {children}
      </div>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        'flex flex-col gap-0.5 p-4 group-data-[drawer-direction=bottom]/drawer-content:text-center group-data-[drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left',
        className,
      )}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div data-slot="drawer-footer" className={cn('mt-auto flex flex-col gap-2 p-4', className)} {...props} />
  )
}

function DrawerTitle({ className, ...props }: React.ComponentPropsWithoutRef<'h3'>) {
  return (
    <h3 data-slot="drawer-title" className={cn('text-foreground font-semibold', className)} {...props} />
  )
}

function DrawerDescription({ className, ...props }: React.ComponentPropsWithoutRef<'p'>) {
  return (
    <p data-slot="drawer-description" className={cn('text-muted-foreground text-sm', className)} {...props} />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
