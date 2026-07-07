import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { FreightDetailPage } from '@/features/freights/pages/FreightDetailPage'
import { FreightsPage } from '@/features/freights/pages/FreightsPage'
import { CreateTenantPage } from '@/features/tenant/pages/CreateTenantPage'
import { AppShell } from '@/shared/components/layout/AppShell'
import { GuestRoute, ProtectedRoute } from '@/shared/components/routing/ProtectedRoute'
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

          <Route element={<TenantRequiredRoute />}>
            <Route element={<AppShell />}>
              <Route path={ROUTES.dashboard} element={<DashboardPage />} />
              <Route path={ROUTES.freights} element={<FreightsPage />} />
              <Route path="/fretes/:id" element={<FreightDetailPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
