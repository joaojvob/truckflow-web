import { type InputHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export function Input({ className, hasError = false, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary-soft',
        hasError ? 'border-danger' : 'border-border',
        className,
      )}
      {...props}
    />
  )
}
