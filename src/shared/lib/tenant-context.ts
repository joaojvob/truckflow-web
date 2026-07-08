const TENANT_CONTEXT_KEY = 'truckflow_tenant_context'

export interface TenantContextState {
  tenantId: number
  tenantName: string
}

export function getTenantContext(): TenantContextState | null {
  const raw = localStorage.getItem(TENANT_CONTEXT_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as TenantContextState
  } catch {
    return null
  }
}

export function setTenantContext(context: TenantContextState): void {
  localStorage.setItem(TENANT_CONTEXT_KEY, JSON.stringify(context))
  window.dispatchEvent(new Event('truckflow:tenant-context'))
}

export function clearTenantContext(): void {
  localStorage.removeItem(TENANT_CONTEXT_KEY)
  window.dispatchEvent(new Event('truckflow:tenant-context'))
}
