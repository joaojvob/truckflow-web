interface EmptyStateProps {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-white px-6 py-10 text-center">
      <h3 className="text-base font-medium text-text">{title}</h3>
      {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
    </div>
  )
}
