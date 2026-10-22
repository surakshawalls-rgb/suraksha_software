# Suraksha Software

Independent Angular 21 corporate website and technical training catalogue.

## Local development

Requirements: Node.js 20.19+ (or 22.12+) and npm.

```powershell
npm install --legacy-peer-deps
npm start
```

Open `http://localhost:4200`. The website is configured to use the Supabase project associated with this site. The browser uses only the public anon key; submissions go through the protected `submit-enquiry` Edge Function.

To override the project's Supabase URL and **public anon/publishable key** for local development:

```powershell
$env:SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co'
$env:SUPABASE_ANON_KEY = 'YOUR_PUBLIC_ANON_KEY'
npm start
```

Never place a service-role key in browser code or Vercel browser environment variables.

## Build and tests

```powershell
npm run build
npm test -- --watch=false
```

For Vercel deployment, set the build command to `npm run build:vercel` and output directory to `dist/suraksha-software/browser`. Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and the approved `PUBLIC_SITE_URL` as build-time environment variables to override the checked-in public project configuration. The `vercel.json` SPA rewrite supports direct refresh of Angular routes; the build script emits an absolute sitemap when the approved site origin is configured.

## Supabase setup

The enquiry table is `public.website_enquiries`. The SQL dump may show the tables without showing the database function the Edge Function calls. Ensure the migration below has been run so that `submit_website_enquiry` exists:

1. If the migration has not been applied, run `supabase/migrations/20261016000000_website_enquiries.sql` in the Supabase SQL Editor. It is safe to run when the tables already exist and creates the required RPC function and permissions.
2. Configure Edge Function secrets `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RATE_LIMIT_SECRET` (a randomly generated secret of at least 32 bytes), and `ALLOWED_ORIGINS` (comma-separated exact origins, including `http://localhost:4200` for local testing and your production origin).
3. Deploy `supabase/functions/submit-enquiry` to the project using the Supabase CLI or Dashboard. For the CLI, run `npx supabase functions deploy submit-enquiry --project-ref oeracmaaotknncjwmvgo` from the repository root.
4. Use only the project URL and public anon key in the web build. Never expose the service-role key in browser code or Vercel build variables.
5. Submit a test enquiry and confirm it appears in `public.website_enquiries`; anonymous/authenticated roles must not be able to read, update or delete enquiry rows.

The browser calls a public Edge Function; it does not insert rows directly. The function checks origin, validates and length-limits fields, rejects a honeypot, then invokes a narrowly granted database function. A database-backed limit allows at most five submissions per hashed client IP in 15 minutes. The service-role key stays on the Edge Function. No CAPTCHA provider has been configured.

`website_enquiry_rate_limits` stores keyed IP hashes and rolling-window counters. Establish a retention schedule before collecting production data, restrict operational database access, and delete or anonymize enquiries when they are no longer needed. Review backup and hosting-region settings as part of the privacy review.

## Launch checklist

- Set the approved `PUBLIC_SITE_URL` before a production build so the sitemap contains absolute URLs; domain configuration remains deferred.
- Have the draft privacy notice and terms reviewed; add verified business contact details and retention commitments.
- Verify course fees, durations, batches and trainer information before publishing any of them.
- Confirm internal project status and approve any public links or screenshots before adding those.
- Set exact production/preview origins in the Edge Function and run a real submission smoke test.
- Configure GitHub, Vercel, production Supabase, domain and SSL later; this project has not been deployed.
