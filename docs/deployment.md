# Deployment

## Dashboard project

- Platform: Vercel
- Repository: `sgilewski/mytownapp`
- Root directory: `apps/web`
- Framework preset: Next.js
- Install command: use the repository default
- Build command: `npm run build`

Configure these variables for Preview and Production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

After deployment, verify:

- `/demo/business` renders the business dashboard.
- `/demo/chamber` renders the chamber dashboard.
- `/auth/sign-in` renders the sign-in screen.
- No browser console errors occur on the public demo routes.

## Mobile browser preview

Export the Expo application from the repository root:

```sh
npm run export:web -w @mytownapp/native
```

The deployable static artifact is `apps/native/dist`. Configure the Expo public variables before export when connecting the preview to Supabase:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The app deliberately uses typed demo content when those variables are absent, allowing a safe public product preview without credentials.

Verify the Home, Search, Offers, and Events tabs at a mobile viewport. Confirm that searching for `coffee` filters the business list to Foundry Coffee.
