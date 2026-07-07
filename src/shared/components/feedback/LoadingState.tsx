export function LoadingState({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center text-sm text-muted">
      {message}
    </div>
  )
}
