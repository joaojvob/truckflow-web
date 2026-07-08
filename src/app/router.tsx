import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SuperAdminTenantsPage } from '@/features/admin/pages/SuperAdminTenantsPage'
import { SystemLogsPage } from '@/features/admin/pages/SystemLogsPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { CalendarPage } from '@/features/calendar/pages/CalendarPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { DriverProfilePage } from '@/features/driver/pages/DriverProfilePage'
import { DriversPage } from '@/features/drivers/pages/DriversPage'
import { FleetPage } from '@/features/fleet/pages/FleetPage'
import { FreightCreatePage } from '@/features/freights/pages/FreightCreatePage'
import { FreightDetailPage } from '@/features/freights/pages/FreightDetailPage'
import { FreightEditPage } from '@/features/freights/pages/FreightEditPage'
import { FreightsPage } from '@/features/freights/pages/FreightsPage'
import { SupportPage } from '@/features/support/pages/SupportPage'
import { SupportCreatePage, SupportDetailPage } from '@/features/support/pages/SupportTicketPages'
import { UsersPage } from '@/features/users/pages/UsersPage'
import { CreateTenantPage } from '@/features/tenant/pages/CreateTenantPage'
import { TenantSettingsPage } from '@/features/tenant/pages/TenantSettingsPage'
import { AppShell } from '@/shared/components/layout/AppShell'
import { GuestRoute, ProtectedRoute } from '@/shared/components/routing/ProtectedRoute'
import { RoleRoute } from '@/shared/components/routing/RoleRoute'
import { TenantRequiredRoute } from '@/shared/components/routing/TenantRequiredRoute'
import { ROUTES } from '@/shared/constants/routes'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.register} element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.createTenant} element={<CreateTenantPage />} />

          <Route element={<AppShell />}>
            {/* Super admin — lista global (sem tenant) */}
            <Route element={<RoleRoute allowedRoles={['super_admin']} />}>
              <Route path={ROUTES.adminTenants} element={<SuperAdminTenantsPage />} />
            </Route>

            <Route element={<TenantRequiredRoute />}>
              {/* Fretes — todos os papéis com tenant */}
              <Route element={<RoleRoute allowedRoles={['super_admin', 'admin', 'manager', 'driver']} />}>
                <Route path={ROUTES.freights} element={<FreightsPage />} />
                <Route path="/fretes/:id" element={<FreightDetailPage />} />
                <Route path={ROUTES.support} element={<SupportPage />} />
                <Route path="/suporte/novo" element={<SupportCreatePage />} />
                <Route path="/suporte/:id" element={<SupportDetailPage />} />
              </Route>

              {/* Gestor/Admin/Super */}
              <Route element={<RoleRoute allowedRoles={['super_admin', 'admin', 'manager']} />}>
                <Route path={ROUTES.dashboard} element={<DashboardPage />} />
                <Route path={ROUTES.freightCreate} element={<FreightCreatePage />} />
                <Route path="/fretes/:id/editar" element={<FreightEditPage />} />
                <Route path={ROUTES.drivers} element={<DriversPage />} />
                <Route path={ROUTES.users} element={<UsersPage />} />
                <Route path={ROUTES.tenant} element={<TenantSettingsPage />} />
                <Route path={ROUTES.calendar} element={<CalendarPage />} />
              </Route>

              {/* Logs do sistema — super admin e admin */}
              <Route element={<RoleRoute allowedRoles={['super_admin', 'admin']} />}>
                <Route path={ROUTES.adminLogs} element={<SystemLogsPage />} />
              </Route>

              {/* Redireciona rota antiga de relatórios para o dashboard (aba Análise) */}
              <Route path={ROUTES.reports} element={<Navigate to={ROUTES.dashboard} replace />} />

              {/* Frota — gestor/admin e motorista */}
              <Route element={<RoleRoute allowedRoles={['super_admin', 'admin', 'manager', 'driver']} />}>
                <Route path={ROUTES.fleet} element={<FleetPage />} />
              </Route>

              {/* Motorista */}
              <Route element={<RoleRoute allowedRoles={['driver']} />}>
                <Route path={ROUTES.driverProfile} element={<DriverProfilePage />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
