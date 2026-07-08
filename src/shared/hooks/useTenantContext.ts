import { useEffect, useState } from 'react'
import { clearTenantContext, getTenantContext } from '@/shared/lib/tenant-context'

export function useTenantContext() {
  const [context, setContext] = useState(getTenantContext)

  useEffect(() => {
    const refresh = () => setContext(getTenantContext())
    window.addEventListener('truckflow:tenant-context', refresh)
    return () => window.removeEventListener('truckflow:tenant-context', refresh)
  }, [])

  return {
    context,
    clear: () => {
      clearTenantContext()
      setContext(null)
    },
  }
}
