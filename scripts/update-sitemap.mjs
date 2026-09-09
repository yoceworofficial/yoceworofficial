import fs from 'node:fs';

const SUPABASE_URL = 'https://mzntgjyecymcpzciklfk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_AAXGC4EmiD4ELszpchz9Dw_Eryr6Usn';
const API = `${SUPABASE_URL}/rest/v1/jobs?select=slug,updated_at,date_posted&published=eq.true&slug=not.is.null&order=updated_at.desc&limit=5000`;

const esc = (s) => String(s ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const response = await fetch(API, {
  headers: {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  },
});
if (!response.ok) throw new Error(`Supabase sitemap query failed: ${response.status}`);
const jobs = await response.json();

const staticUrls = [
  'https://yocewor.in/',
  'https://yocewor.in/latest-jobs.html',
  'https://yocewor.in/updates.html',
  'https://yocewor.in/important-notice.html',
  'https://yocewor.in/privacy.html',
  'https://yocewor.in/terms.html',
  'https://yocewor.in/advertise.html',
];

const rows = staticUrls.map((url) => `  <url><loc>${url}</loc></url>`);
for (const job of jobs) {
  const slug = String(job.slug || '').trim();
  if (!slug) continue;
  const lastmod = String(job.updated_at || job.date_posted || '').slice(0, 10);
  rows.push(`  <url><loc>https://yocewor.in/${encodeURIComponent(slug).replaceAll('%2F', '/')}/</loc>${lastmod ? `<lastmod>${esc(lastmod)}</lastmod>` : ''}</url>`);
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</urlset>\n`;
fs.writeFileSync('sitemap.xml', xml, 'utf8');
console.log(`Sitemap updated: ${jobs.length} published records included.`);
