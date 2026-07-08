# TruckFlow Web

Painel web multi-papel para transportadoras. Consome a API Laravel (`truckflow-api`).

**Papéis:** Super Admin · Admin · Gestor · Motorista

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
./vendor/bin/sail artisan storage:link

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
| Super Admin | `super@truckflow.com` | `password` |
| Admin | `admin@alpha.com` | `password` |
| Gestor | `gerente@alpha.com` | `password` |
| Motorista | `motorista@alpha.com` | `password` |

## Funcionalidades

### Super Admin
- [x] Lista global de empresas com métricas
- [x] Entrar no contexto de um tenant (`X-Tenant-Id`)
- [x] Logs do sistema (erros + auditoria)

### Admin / Gestor
- [x] Login, registro e criar empresa
- [x] Dashboard com visão geral e análise (relatórios integrados)
- [x] CRUD de fretes com CEP, tipo de carga e resumo de rota
- [x] Filtros avançados em fretes e motoristas
- [x] Detalhe do frete com mapa da rota e waypoints
- [x] Tracking ao vivo via Reverb (posição GPS + trail no mapa)
- [x] Workflow gestor (aprovar doping, liberar viagem)
- [x] Cadastro de motoristas em modal + foto
- [x] Logo da empresa
- [x] Frota (caminhões e reboques, CRLV, status)
- [x] Notificações no header (sino)
- [x] Suporte (tickets)

### Motorista
- [x] Portal com resumo operacional (fretes ativos, pendências, CNH)
- [x] Lista de fretes em cards com badges de ação
- [x] Workflow completo: aceitar/recusar, doping, checklist, iniciar e finalizar
- [x] Perfil (foto, disponibilidade, CNH)
- [x] Visualização da frota vinculada

### Próximas iterações
- [x] Tracking ao vivo (Reverb/Echo) no detalhe do frete em trânsito
- [ ] Export PDF/XLSX de relatórios
- [ ] Viewer de doping para gestor
- [ ] Gestão de usuários

## Scripts

```bash
npm run dev      # desenvolvimento
npm run build    # build produção
npm run preview  # preview do build
```

### Tracking ao vivo (Reverb)

O mapa em tempo real no detalhe do frete (`in_transit`) usa Laravel Echo + Reverb.

1. Na API, suba Reverb e a fila: `./vendor/bin/sail up -d` (serviços `reverb` e `queue`)
2. Confirme `BROADCAST_CONNECTION=reverb` no `.env` da API
3. No web, copie as variáveis `VITE_REVERB_*` do `.env.example` (chave padrão: `truckflow-key`)
4. Sem Reverb, o painel faz polling a cada 30s como fallback

## Referências

- [Brief completo](../truckflow-api/docs/FRONTEND-WEB-BRIEF.md)
- OpenAPI: http://localhost/docs/api
