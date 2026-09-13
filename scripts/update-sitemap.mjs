import fs from 'node:fs';

const SUPABASE_URL = 'https://mzntgjyecymcpzciklfk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_AAXGC4EmiD4ELszpchz9Dw_Eryr6Usn';
const API = `${SUPABASE_URL}/rest/v1/jobs?select=id,slug,updated_at,date_posted,published,type&published=eq.true&order=updated_at.desc&limit=5000`;

const esc = (s) => String(s ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const normalizeType = (value) => String(value ?? '').toLowerCase().trim().replace(/[-\s]+/g, '_');

const response = await fetch(API, {
  headers: {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  },
});
if (!response.ok) throw new Error(`Supabase sitemap query failed: ${response.status}`);
const jobs = await response.json();

// Only publish real, crawlable public entry points. Do not put GitHub Pages
// pretty-slug URLs in the sitemap because those URLs are served through
// 404.html and therefore return an HTTP 404 to Googlebot.
const staticUrls = [
  'https://yocewor.in/',
  'https://yocewor.in/latest-jobs.html',
  'https://yocewor.in/updates.html',
  'https://yocewor.in/admit-card.html',
  'https://yocewor.in/result.html',
  'https://yocewor.in/answer-key.html',
  'https://yocewor.in/syllabus.html',
  'https://yocewor.in/admission.html',
  'https://yocewor.in/important-notice.html',
  'https://yocewor.in/about.html',
  'https://yocewor.in/contact.html',
  'https://yocewor.in/disclaimer.html',
  'https://yocewor.in/privacy.html',
  'https://yocewor.in/terms.html',
];

const rows = staticUrls.map((url) => `  <url><loc>${url}</loc></url>`);
const seen = new Set(staticUrls);

for (const job of jobs) {
  const id = String(job.id || '').trim();
  const slug = String(job.slug || '').trim();
  if (!id && !slug) continue;

  const lastmod = String(job.updated_at || job.date_posted || '').slice(0, 10);
  const type = normalizeType(job.type);
  let url;

  if (type === 'answer_key') {
    url = slug
      ? `https://yocewor.in/answer-key-detail.html?slug=${encodeURIComponent(slug)}`
      : `https://yocewor.in/answer-key-detail.html?id=${encodeURIComponent(id)}`;
  } else {
    url = slug
      ? `https://yocewor.in/job.html?slug=${encodeURIComponent(slug)}`
      : `https://yocewor.in/job.html?id=${encodeURIComponent(id)}`;
  }

  if (seen.has(url)) continue;
  seen.add(url);
  rows.push(`  <url><loc>${esc(url)}</loc>${lastmod ? `<lastmod>${esc(lastmod)}</lastmod>` : ''}</url>`);
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</urlset>\n`;
fs.writeFileSync('sitemap.xml', xml, 'utf8');
console.log(`Sitemap updated: ${rows.length} crawlable URLs from ${jobs.length} published records.`);
