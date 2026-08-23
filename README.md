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

## Deploy

The web dashboards are ready for Vercel with `apps/web` as the project root. The Expo app can be exported as a browser preview with `npm run export:web -w @mytownapp/native`; its static output is written to `apps/native/dist`.

See [`docs/deployment.md`](docs/deployment.md) for the exact project settings, environment variables, and verification checklist.
