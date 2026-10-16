create table if not exists public.website_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (
    char_length(email) <= 254 and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  phone text check (phone is null or char_length(phone) <= 32),
  company text check (company is null or char_length(company) <= 160),
  enquiry_type text not null check (enquiry_type in (
    'Website development', 'Custom software', 'Mobile app development', 'E-commerce',
    'Branding and digital marketing', 'SEO and SMO', 'Bulk SMS',
    'Hosting and deployment', 'Training and courses', 'Other'
  )),
  service_interest text check (service_interest is null or char_length(service_interest) <= 120),
  budget_range text check (budget_range is null or char_length(budget_range) <= 80),
  expected_timeline text check (expected_timeline is null or char_length(expected_timeline) <= 80),
  message text not null check (char_length(message) between 10 and 4000),
  privacy_consent boolean not null check (privacy_consent),
  status text not null default 'new' check (status in ('new', 'reviewing', 'responded', 'closed')),
  source_page text check (source_page is null or char_length(source_page) <= 255),
  created_at timestamptz not null default now()
);

create index if not exists website_enquiries_created_at_idx
  on public.website_enquiries (created_at desc);
create index if not exists website_enquiries_status_created_at_idx
  on public.website_enquiries (status, created_at desc);

alter table public.website_enquiries enable row level security;
revoke all on public.website_enquiries from anon, authenticated;

create table if not exists public.website_enquiry_rate_limits (
  fingerprint text primary key,
  window_started_at timestamptz not null,
  submission_count integer not null check (submission_count >= 1)
);
alter table public.website_enquiry_rate_limits enable row level security;
revoke all on public.website_enquiry_rate_limits from anon, authenticated;

create or replace function public.submit_website_enquiry(p_payload jsonb, p_fingerprint text)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_started timestamptz;
  v_count integer;
begin
  if p_fingerprint is null or char_length(p_fingerprint) not between 32 and 128 then
    raise exception 'Invalid rate-limit fingerprint';
  end if;

  insert into public.website_enquiry_rate_limits (fingerprint, window_started_at, submission_count)
  values (p_fingerprint, now(), 1)
  on conflict (fingerprint) do update
  set window_started_at = case
        when public.website_enquiry_rate_limits.window_started_at < now() - interval '15 minutes' then now()
        else public.website_enquiry_rate_limits.window_started_at end,
      submission_count = case
        when public.website_enquiry_rate_limits.window_started_at < now() - interval '15 minutes' then 1
        else public.website_enquiry_rate_limits.submission_count + 1 end
  returning window_started_at, submission_count into v_started, v_count;

  if v_count > 5 then
    raise exception 'Submission rate limit exceeded';
  end if;

  if p_payload->>'privacy_consent' is distinct from 'true'
    or char_length(coalesce(p_payload->>'name', '')) not between 2 and 120
    or char_length(coalesce(p_payload->>'email', '')) > 254
    or (p_payload->>'email') !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or char_length(coalesce(p_payload->>'message', '')) not between 10 and 4000
    or coalesce(p_payload->>'enquiry_type', '') not in (
      'Website development', 'Custom software', 'Mobile app development', 'E-commerce',
      'Branding and digital marketing', 'SEO and SMO', 'Bulk SMS',
      'Hosting and deployment', 'Training and courses', 'Other'
    ) then
    raise exception 'Invalid enquiry';
  end if;

  insert into public.website_enquiries (
    name, email, phone, company, enquiry_type, service_interest, budget_range,
    expected_timeline, message, privacy_consent, source_page
  ) values (
    btrim(p_payload->>'name'), lower(btrim(p_payload->>'email')),
    nullif(btrim(p_payload->>'phone'), ''), nullif(btrim(p_payload->>'company'), ''),
    p_payload->>'enquiry_type', nullif(btrim(p_payload->>'service_interest'), ''),
    nullif(btrim(p_payload->>'budget_range'), ''), nullif(btrim(p_payload->>'expected_timeline'), ''),
    btrim(p_payload->>'message'), true, nullif(btrim(p_payload->>'source_page'), '')
  );
end;
$$;

revoke all on function public.submit_website_enquiry(jsonb, text) from public, anon, authenticated;
grant execute on function public.submit_website_enquiry(jsonb, text) to service_role;
