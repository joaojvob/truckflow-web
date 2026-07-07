import { type InputHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export function Input({ className, hasError = false, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-blue-100',
        hasError ? 'border-red-500' : 'border-border',
        className,
      )}
      {...props}
    />
  )
}
