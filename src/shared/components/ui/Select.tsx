import { type SelectHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean
}

export function Select({ className, hasError = false, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary-soft',
        hasError ? 'border-danger' : 'border-border',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
