# BookBridge – Student Book Exchange Platform

A full-stack platform where college students buy, sell, donate, and exchange academic textbooks within their campus community.

## Run & Operate

- `pnpm --filter @workspace/bookbridge run dev` — run the frontend (auto-managed)
- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `SESSION_SECRET`

## Demo Accounts

- **Admin:** admin@bookbridge.com / secret
- **Student:** rahul@example.com / secret (and priya, arjun, neha, rohan @example.com)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Framer Motion, Recharts, Wouter, next-themes
- API: Express 5 + JWT auth (bcryptjs)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `artifacts/bookbridge/src/` — React frontend
- `artifacts/bookbridge/src/pages/` — all page components (home, books, admin, etc.)
- `artifacts/bookbridge/src/components/` — shared components (navbar, footer, auth-provider, book-card)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, books, categories, wishlist, exchanges, dashboard, admin, contact)
- `artifacts/api-server/src/lib/auth.ts` — JWT auth middleware
- `lib/api-spec/openapi.yaml` — single source of truth for API contracts
- `lib/db/src/schema/` — Drizzle ORM table definitions

## Features

- Auth: register, login, JWT session, role-based access (student / admin)
- Books: add, edit, delete, browse with live search + filters, book details
- Wishlist: add/remove books
- Exchange requests: send, accept, reject, complete
- Student dashboard: stats, recently viewed, recommended
- Admin dashboard: user management, book management, category management, Chart.js-style analytics (recharts)
- Contact form
- Dark mode toggle
- Responsive design (mobile, tablet, desktop)

## Architecture decisions

- JWT stored in localStorage under `bookbridge_token`; Authorization header injected by custom fetch
- bcryptjs used (pure JS, no native compilation) over bcrypt
- OpenAPI-first: all API contracts defined in `lib/api-spec/openapi.yaml`, frontend uses generated React Query hooks

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Demo passwords are `secret` (bcrypt hash pre-seeded)
- After schema changes: run `pnpm --filter @workspace/db run push` then rebuild api-server
- After OpenAPI spec changes: run codegen before touching frontend
