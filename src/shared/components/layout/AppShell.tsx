import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'
import { getNavItemsForRole } from '@/shared/constants/navigation'
import { ROUTES } from '@/shared/constants/routes'
import { useTenantContext } from '@/shared/hooks/useTenantContext'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/Button'
import { getDefaultRouteForRole } from '@/shared/lib/role-routing'

export function AppShell() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const { context: tenantContext, clear: clearTenantContext } = useTenantContext()

  const isSuperAdmin = user?.role === 'super_admin'
  const hasTenantContext = isSuperAdmin ? Boolean(tenantContext) : true
  const navItems = user ? getNavItemsForRole(user.role, hasTenantContext) : []
  const homeRoute =
    user?.role === 'super_admin'
      ? hasTenantContext
        ? ROUTES.dashboard
        : ROUTES.adminTenants
      : user
        ? getDefaultRouteForRole(user.role)
        : '/'
  const displayTenantName = isSuperAdmin ? tenantContext?.tenantName : user?.tenant?.name

  const handleExitTenant = () => {
    clearTenantContext()
    navigate(ROUTES.adminTenants)
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-white lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          {user?.tenant?.logo_url ? (
            <img
              src={user.tenant.logo_url}
              alt={user.tenant.name}
              className="h-9 w-9 rounded-xl object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
              TF
            </span>
          )}
          <span className="text-lg font-bold text-text">{user?.tenant?.name ?? 'TruckFlow'}</span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-soft text-primary'
                    : 'text-muted hover:bg-slate-50 hover:text-text',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-3">
            <p className="truncate text-sm font-medium text-text">{user?.name}</p>
            <p className="truncate text-xs text-muted">{displayTenantName ?? 'Sem empresa'}</p>
            <p className="mt-0.5 text-xs text-primary">{user?.role_label ?? user?.role}</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full" onClick={() => void logout()}>
            Sair
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-border bg-white px-4 py-3 lg:hidden">
          <NavLink className="flex items-center gap-2" to={homeRoute}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
              TF
            </span>
            <span className="font-bold text-text">TruckFlow</span>
          </NavLink>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Button variant="ghost" size="sm" onClick={() => void logout()}>
              Sair
            </Button>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-white px-3 py-2 lg:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive ? 'bg-primary-soft text-primary' : 'text-muted',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <header className="hidden items-center justify-end gap-3 border-b border-border bg-white px-6 py-3 lg:flex">
          <NotificationBell />
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {isSuperAdmin && tenantContext ? (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary-soft px-4 py-3 text-sm">
              <span>
                Visualizando: <strong>{tenantContext.tenantName}</strong>
              </span>
              <Button variant="ghost" size="sm" onClick={handleExitTenant}>
                Sair da empresa
              </Button>
            </div>
          ) : null}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
