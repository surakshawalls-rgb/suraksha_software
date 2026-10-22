import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const allowedTypes = new Set([
  'Website development', 'Custom software', 'Mobile app development', 'E-commerce',
  'Branding and digital marketing', 'SEO and SMO', 'Bulk SMS',
  'Hosting and deployment', 'Training and courses', 'Other'
]);
const corsHeadersBase = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin'
};

Deno.serve(async (request) => {
  const origin = request.headers.get('origin') ?? '';
  const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',').map(value => value.trim()).filter(Boolean);
  if (!allowedOrigins.length) {
    return Response.json({ error: 'Enquiry service origin allowlist is not configured.' }, { status: 503 });
  }
  if (!allowedOrigins.includes(origin)) {
    return Response.json({ error: 'Origin not allowed.' }, { status: 403 });
  }
  const corsHeaders = { ...corsHeadersBase, 'Access-Control-Allow-Origin': origin };
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405, headers: corsHeaders });
  }

  let raw: Record<string, unknown>;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > 12000) throw new Error('Request too large');
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('Request body must be an object');
    }
    raw = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400, headers: corsHeaders });
  }
  const honeypot = typeof raw.website === 'string' ? raw.website : '';
  if (honeypot.trim()) {
    return Response.json({ error: 'Submission rejected.' }, { status: 400, headers: corsHeaders });
  }
  const clean = (key: string, max: number) =>
    typeof raw[key] === 'string' ? (raw[key] as string).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '';
  const payload = {
    name: clean('name', 120),
    email: clean('email', 254).toLowerCase(),
    phone: clean('phone', 32),
    company: clean('company', 160),
    enquiry_type: clean('enquiry_type', 80),
    service_interest: clean('service_interest', 120),
    budget_range: clean('budget_range', 80),
    expected_timeline: clean('expected_timeline', 80),
    message: clean('message', 4000),
    privacy_consent: raw.privacy_consent === true,
    source_page: clean('source_page', 255)
  };
  if (payload.name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) ||
    payload.message.length < 10 || !payload.privacy_consent || !allowedTypes.has(payload.enquiry_type)) {
    return Response.json({ error: 'Please check the required enquiry fields.' }, { status: 400, headers: corsHeaders });
  }

  const forwarded = request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim();
  const clientIp = request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') || forwarded || 'unknown';
  const rateSecret = Deno.env.get('RATE_LIMIT_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');
  if (!rateSecret || !supabaseUrl || !serviceRoleKey) {
    return Response.json({ error: 'Enquiry service is not configured.' }, { status: 503, headers: corsHeaders });
  }
  const hmacKey = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(rateSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const digest = await crypto.subtle.sign('HMAC', hmacKey, new TextEncoder().encode(clientIp));
  const fingerprint = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { error } = await supabase.rpc('submit_website_enquiry', {
    p_payload: payload,
    p_fingerprint: fingerprint
  });
  if (error) {
    const limited = error.message.includes('rate limit');
    return Response.json(
      { error: limited ? 'Too many enquiries. Please try again later.' : 'We could not submit your enquiry. Please try again later.' },
      { status: limited ? 429 : 400, headers: corsHeaders }
    );
  }
  return Response.json({ accepted: true }, { status: 201, headers: corsHeaders });
});
