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
## DEMO
<img width="917" height="477" alt="Screenshot 2026-07-20 071609" src="https://github.com/user-attachments/assets/637d8a93-6097-4d91-bc2d-8b0d8e289bb1" />
<img width="910" height="475" alt="Screenshot 2026-07-20 071625" src="https://github.com/user-attachments/assets/c2eaa845-ba4f-4939-a4e6-48a82ab1c1c7" />
<img width="916" height="430" alt="Screenshot 2026-07-20 071640" src="https://github.com/user-attachments/assets/92e78b68-eb82-45d0-83cd-be19e738eeb6" />
<img width="898" height="472" alt="Screenshot 2026-07-20 071654" src="https://github.com/user-attachments/assets/f749bf5f-9e13-4945-b390-69022b232e57" />
<img width="908" height="377" alt="Screenshot 2026-07-20 071725" src="https://github.com/user-attachments/assets/813e1425-a15a-4b37-a8dd-dd3a6780794a" />
<img width="898" height="479" alt="Screenshot 2026-07-20 071714" src="https://github.com/user-attachments/assets/21574365-3ccc-49d8-9b7f-438c0fd2ce3c" />
<img width="908" height="476" alt="Screenshot 2026-07-20 071801" src="https://github.com/user-attachments/assets/b29469b9-82ea-435e-b58e-91afeff49537" />
<img width="875" height="459" alt="Screenshot 2026-07-20 072350" src="https://github.com/user-attachments/assets/3a230865-8372-4c5a-9c55-e4136bc5cfeb" />
<img width="893" height="475" alt="Screenshot 2026-07-20 071809" src="https://github.com/user-attachments/assets/e15c553b-50b1-4971-9e2d-9e16f65f7611" />
<img width="874" height="469" alt="Screenshot 2026-07-20 072256" src="https://github.com/user-attachments/assets/25bab931-a906-4631-aed6-967cf19ec877" />





