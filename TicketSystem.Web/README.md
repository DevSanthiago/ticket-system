# Ticket System — Web

Frontend do **Ticket System**: SPA em React + TypeScript (Vite) com Chakra UI. Consome a API ASP.NET Core e entrega o fluxo de abertura, acompanhamento e resolução de chamados.

> Visão geral, arquitetura e instruções completas no [README do monorepo](../README.md).

## Stack

- React + Vite + TypeScript
- Chakra UI v2 (design system, dark/light)
- Framer Motion (animações e microinterações)
- Axios (cliente HTTP com interceptores de auth)
- React Router v6 · SweetAlert2 · Lucide React

## Organização (`src/`)

- `pages/` — telas de rota (Dashboard, Login, formulários e listas de chamados, Cockpit admin, Checklist)
- `components/` — UI reutilizável (Layout, Sidebar, cards, modais do Cockpit, ícones animados)
- `hooks/` — lógica reutilizável (`useAuth`, `useDepartmentTheme`, `useIconAnimation`, `useColorModeValue`)
- `services/` — `api.ts` (Axios + interceptores) e `alertService.ts`
- `constants/` — endpoints, chaves de storage, configs de linha
- `types/` — interfaces, enums e tipos globais

## Rodar localmente

```bash
cp .env.example .env          # VITE_API_BASE_URL=https://localhost:7106/api
npm install
npm run dev                   # http://localhost:5173
```

Scripts: `npm run dev` (dev server) · `npm run build` (build de produção) · `npm run preview` · `npm run lint`.
