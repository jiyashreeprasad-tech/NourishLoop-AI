# NourishLoop AI

An AI-assisted command center for reducing institutional food waste and coordinating safe surplus redistribution.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/nourishloop-ai/src/` — React web app, routes, shared UI, and theme.
- `artifacts/api-server/src/routes/nourishloop.ts` — seeded in-memory demo API and simulation actions.
- `lib/api-spec/openapi.yaml` — source of truth for generated frontend API hooks and Zod contracts.
- `lib/api-client-react/src/generated/` — generated React Query client.

## Architecture decisions

- The first prototype uses a seeded in-memory API so the hackathon demo works without external credentials or setup.
- All user-facing API contracts are defined in OpenAPI first and generated into shared hooks and schemas.
- Forecasting, quality risk, partner matching, and impact numbers are explainable deterministic algorithms rather than opaque AI calls.
- The web app is rooted at `/` so the command center opens directly in preview and production.

## Product

- Operations overview with demand, waste, risk, activity, and recommendations.
- Demand forecasting, inventory quality monitoring, surplus matching, route planning, processing-line monitoring, sustainability analytics, alerts, and demo controls.
- The primary demo flow supports creating or accepting surplus, planning a route, completing delivery, and seeing impact metrics update.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
