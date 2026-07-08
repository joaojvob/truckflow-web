import { type TextareaHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
}

export function Textarea({ className, hasError = false, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary-soft',
        hasError ? 'border-danger' : 'border-border',
        className,
      )}
      {...props}
    />
  )
}
