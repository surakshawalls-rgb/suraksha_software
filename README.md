# Suraksha Software

Independent Angular 21 corporate website and technical training catalogue.

## Local development

Requirements: Node.js 20.19+ (or 22.12+) and npm.

```powershell
npm install --legacy-peer-deps
npm start
```

Open `http://localhost:4200`. Without Supabase settings, the enquiry form reports that submission is not configured; it never pretends a request succeeded.

Enable local enquiry submissions by providing a Supabase project URL and its **public anon/publishable key**:

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

For future Vercel deployment, set the build command to `npm run build:vercel`, output directory to `dist/suraksha-software/browser`, and configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and the approved `PUBLIC_SITE_URL` as build-time environment variables. The `vercel.json` SPA rewrite supports direct refresh of Angular routes; the build script emits an absolute sitemap when the approved site origin is configured.

## Supabase setup

This application directory contained no existing Supabase project configuration. Create/select the separate project and:

1. Apply `supabase/migrations/20261016000000_website_enquiries.sql`.
2. Configure Edge Function secrets `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RATE_LIMIT_SECRET` (a randomly generated secret of at least 32 bytes), and `ALLOWED_ORIGINS` (comma-separated exact origins).
3. Deploy `supabase/functions/submit-enquiry` using the linked Supabase project.
4. Configure only the project URL and public anon key for the web build.
5. Test accepted submissions and confirm anonymous/authenticated roles cannot read, update or delete enquiry rows.

The browser calls a public Edge Function; it does not insert rows directly. The function checks origin, validates and length-limits fields, rejects a honeypot, then invokes a narrowly granted database function. A database-backed limit allows at most five submissions per hashed client IP in 15 minutes. The service-role key stays on the Edge Function. No CAPTCHA provider has been configured.

`website_enquiry_rate_limits` stores keyed IP hashes and rolling-window counters. Establish a retention schedule before collecting production data, restrict operational database access, and delete or anonymize enquiries when they are no longer needed. Review backup and hosting-region settings as part of the privacy review.

## Launch checklist

- Set the approved `PUBLIC_SITE_URL` before a production build so the sitemap contains absolute URLs; domain configuration remains deferred.
- Have the draft privacy notice and terms reviewed; add verified business contact details and retention commitments.
- Verify course fees, durations, batches and trainer information before publishing any of them.
- Confirm internal project status and approve any public links or screenshots before adding those.
- Set exact production/preview origins in the Edge Function and run a real submission smoke test.
- Configure GitHub, Vercel, production Supabase, domain and SSL later; this project has not been deployed.
