const cats = ["latest-jobs","admit-card","answer-key","result","exam-date","latest-news","sarkari-yojana"];
const API = "https://mzntgjyecymcpzciklfk.supabase.co/functions/v1/public-content";
const REST = "https://mzntgjyecymcpzciklfk.supabase.co/rest/v1";
const KEY = window.YOCEWOR_CONFIG?.supabasePublishableKey || "";
const esc = v => String(v ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

function show(id, rows, error = false) {
  const el = document.getElementById(id);
  if (!el) return;
  if (error && !rows?.length) { el.innerHTML = "<p>Content is temporarily unavailable. Please refresh.</p>"; return; }
  if (!rows?.length) { el.innerHTML = "<p>No updates available.</p>"; return; }
  el.innerHTML = '<ul class="post-list">' + rows.map(x =>
    '<li><a href="/post.html?slug=' + encodeURIComponent(x.slug) + '">' + esc(x.title) + '</a>' +
    (x.published_at ? '<small>' + new Date(x.published_at).toLocaleDateString("en-IN") + '</small>' : '') +
    '</li>'
  ).join("") + "</ul>";
}

async function fetchJson(url, options = {}, timeout = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const r = await fetch(url, {...options, signal: controller.signal, cache:"no-store"});
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } finally { clearTimeout(timer); }
}

async function load() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  let payload = null;
  try {
    payload = await fetchJson(API + "?v=2");
  } catch (apiError) {
    console.warn("YOCEWOR content API failed; using REST fallback.", apiError);
    try {
      const headers = {apikey: KEY, Authorization: "Bearer " + KEY};
      const [categories, posts] = await Promise.all([
        fetchJson(REST + "/categories?select=id,slug&is_active=eq.true&order=sort_order", {headers}),
        fetchJson(REST + "/posts?select=title,slug,published_at,category_id&status=eq.published&order=published_at.desc&limit=100", {headers})
      ]);
      payload = {categories, posts};
    } catch (restError) {
      console.warn("YOCEWOR REST fallback failed.", restError);
    }
  }

  if (payload) {
    const categoryMap = Object.fromEntries((payload.categories || []).map(c => [c.slug, c.id]));
    const posts = payload.posts || [];
    cats.forEach(slug => {
      const id = categoryMap[slug];
      show(slug, id ? posts.filter(p => p.category_id === id).slice(0, 10) : []);
    });
    return;
  }

  cats.forEach(slug => show(slug, [], true));
}

const form = document.getElementById("search");
if (form) form.onsubmit = e => {
  e.preventDefault();
  const q = document.getElementById("q")?.value.trim();
  if (q) location.href = "/search.html?q=" + encodeURIComponent(q);
};
load();