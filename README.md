# mytownapp

One global brand connecting residents, local businesses, and chambers across towns.

## Workspace

- `apps/web` — Next.js dashboards for businesses and chambers
- `apps/native` — Expo consumer app
- `packages/core` — shared business rules and demo data
- `packages/types` — shared domain contracts
- `packages/design` — shared brand tokens
- `supabase` — reviewed migrations and local configuration
- `docs` — architecture and product decisions

## Run locally

1. Copy `.env.example` to `.env.local` and add the project URL and publishable key.
2. Run `npm install`.
3. Run `npm run dev:web` or `npm run dev:native`.

The dashboards and native shell intentionally fall back to typed demo data when environment variables are absent, so visual work can continue without weakening auth or shipping secrets.
