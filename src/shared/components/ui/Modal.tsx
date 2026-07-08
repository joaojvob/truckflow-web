import { type ReactNode, useEffect } from 'react'
import { cn } from '@/shared/lib/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({ open, onClose, title, description, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 max-h-[90vh] w-full overflow-auto rounded-2xl bg-surface-elevated p-6 shadow-xl',
          sizeClasses[size],
        )}
      >
        {title ? (
          <div className="mb-4">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold text-text">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-muted transition-colors hover:bg-slate-100 hover:text-text"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  )
}
