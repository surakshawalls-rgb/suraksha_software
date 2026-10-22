import { writeFile } from 'node:fs/promises';

const url = process.env.SUPABASE_URL?.trim();
const key = process.env.SUPABASE_ANON_KEY?.trim();

if (Boolean(url) !== Boolean(key)) {
  throw new Error('Set both SUPABASE_URL and SUPABASE_ANON_KEY, or leave both unset.');
}
if (url && !/^https:\/\/[a-z0-9.-]+$/i.test(url)) {
  throw new Error('SUPABASE_URL must be an HTTPS Supabase project URL.');
}

if (url && key) {
  const contents = `globalThis.__SUPABASE_URL__ = ${JSON.stringify(url)};\n` +
    `globalThis.__SUPABASE_ANON_KEY__ = ${JSON.stringify(key)};\n`;
  await writeFile(new URL('../public/runtime-config.js', import.meta.url), contents);
}

const siteUrl = process.env.PUBLIC_SITE_URL?.trim();
const parsed = siteUrl ? new URL(siteUrl) : undefined;
if (parsed) {
  if (parsed.protocol !== 'https:' || parsed.pathname !== '/' || parsed.search || parsed.hash) {
    throw new Error('PUBLIC_SITE_URL must be an HTTPS origin without a path, query or fragment.');
  }
}
const paths = [
  '/', '/services', '/services/web-development', '/services/software-development',
  '/services/mobile-app-development', '/services/ecommerce',
  '/services/branding-digital-marketing', '/services/seo-smo', '/services/bulk-sms',
  '/services/domain-hosting', '/portfolio', '/about', '/process', '/technology', '/training',
  '/training/frontend-ui-engineering', '/training/java-full-stack-development',
  '/training/spring-ecosystem-data', '/training/python-ai-productivity',
  '/training/dev-workflow-delivery', '/training/c-cpp-programming',
  '/training/go-cloud-backend', '/training/react-frontend-frameworks',
  '/contact', '/privacy-policy', '/terms-and-conditions'
];
const urls = paths.map(path => `  <url><loc>${parsed ? parsed.origin : ''}${path}</loc></url>`).join('\n');
await writeFile(
  new URL('../public/sitemap.xml', import.meta.url),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);
