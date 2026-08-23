# MVP architecture

## Product boundaries

The consumer experience is native-first. Business and chamber workflows share a responsive Next.js dashboard application. `mytownapp` is the only brand; a town is a content and access context, never a white-label tenant.

## Authorization model

One Supabase Auth user may hold several memberships. Platform roles are global; business and chamber roles are scoped through membership records. Authorization is enforced in Postgres RLS, not inferred from editable profile metadata or hidden navigation.

## Data model

- Towns contain businesses, chambers, events, announcements, and consumer town selections.
- A business may appear in one town and belong to many account members.
- Offers support draft, scheduled, live, and archived states. The MVP UI emphasizes one live offer per business while the schema preserves history and scheduling.
- Events store individual occurrences plus a recurrence rule on the parent event. This keeps calendar queries simple and permits a worker to materialize future occurrences later.
- Saves, favorites, and redemptions are immutable or narrowly mutable engagement facts used for dashboard aggregates.

## Runtime decisions

- Web reads use Server Components; mutations will use Server Actions. Mobile talks to Supabase directly under RLS.
- The checked-in migration is the schema source of truth. It is reviewed locally before any remote application.
- Publishable keys are safe in clients under RLS. Secret/service-role keys are never shipped to either app.
- Demo data is a deliberate visual fallback until local environment variables are configured.

## Next slices

1. Auth screens, invitation acceptance, and protected dashboard routes.
2. CRUD for business profiles, offers, events, and chamber announcements.
3. Image storage policies and upload flows.
4. Redemption confirmation and abuse controls.
5. Generated database types and analytics views after the migration is applied.
