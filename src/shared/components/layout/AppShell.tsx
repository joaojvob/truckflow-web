import { NavLink, Outlet } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components/ui/Button'

const navItems = [
  { to: ROUTES.dashboard, label: 'Dashboard' },
  { to: ROUTES.freights, label: 'Fretes' },
]

export function AppShell() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-text">TruckFlow</span>
            <nav className="hidden gap-1 sm:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === ROUTES.dashboard}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive ? 'bg-blue-50 text-primary' : 'text-muted hover:bg-slate-100 hover:text-text',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-text">{user?.name}</p>
              <p className="text-xs text-muted">{user?.tenant?.name ?? 'Sem empresa'}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => void logout()}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
