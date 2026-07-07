# TruckFlow Web

Painel web para **Admin** e **Gestor** da transportadora. Consome a API Laravel (`truckflow-api`).

## Stack

- React 19 + TypeScript + Vite
- React Router, TanStack Query, Zustand
- React Hook Form + Zod
- Tailwind CSS 4

## Estrutura (clean / componentizada)

```
src/
├── app/                 # bootstrap, providers, router
├── features/            # módulos por domínio (auth, freights, dashboard…)
│   └── <feature>/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       └── types/
└── shared/              # UI, layout, lib, constants
    ├── components/
    ├── constants/
    ├── lib/
    └── types/
```

## Desenvolvimento local

```bash
# 1. Subir API
cd ../truckflow-api
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate:fresh --seed

# 2. Frontend
cd ../truckflow-web
cp .env.example .env
npm install
npm run dev
```

| Serviço | URL |
|---------|-----|
| Web | http://localhost:5173 |
| API (proxy Vite) | `/api/v1` → `http://localhost` |

### Contas de teste

| Papel | E-mail | Senha |
|-------|--------|-------|
| Admin | `admin@alpha.com` | `password` |
| Gestor | `gerente@alpha.com` | `password` |

## MVP atual (visual simples)

- [x] Login / registro / criar empresa
- [x] Dashboard (`/reports/dashboard`)
- [x] Lista de fretes + detalhe
- [ ] Criar/editar frete (próxima iteração)
- [ ] Mapa e workflow avançado
- [ ] WebSocket tracking

## Scripts

```bash
npm run dev      # desenvolvimento
npm run build    # build produção
npm run preview  # preview do build
```

## Referências

- [Brief completo](../truckflow-api/docs/FRONTEND-WEB-BRIEF.md)
- OpenAPI: http://localhost/docs/api
