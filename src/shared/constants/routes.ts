export const ROUTES = {
  login: '/login',
  register: '/register',
  createTenant: '/criar-empresa',
  dashboard: '/',
  freights: '/fretes',
  freightDetail: (id: number | string) => `/fretes/${id}`,
} as const
