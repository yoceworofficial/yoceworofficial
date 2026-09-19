const cats = ["latest-jobs","admit-card","answer-key","result","exam-date","latest-news","sarkari-yojana"];
const PUBLIC_CONTENT_URL = "https://mzntgjyecymcpzciklfk.supabase.co/functions/v1/public-content";
const esc = v => String(v ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

function show(id, rows, error) {
  const el = document.getElementById(id);
  if (!el) return;
  if (error) { el.innerHTML = "<p>Updates could not be loaded right now.</p>"; return; }
  if (!rows?.length) { el.innerHTML = "<p>No updates available.</p>"; return; }
  el.innerHTML = '<ul class="post-list">' + rows.map(x =>
    '<li><a href="/post.html?slug=' + encodeURIComponent(x.slug) + '">' + esc(x.title) + '</a>' +
    (x.published_at ? '<small>' + new Date(x.published_at).toLocaleDateString("en-IN") + '</small>' : '') +
    '</li>'
  ).join("") + "</ul>";
}

async function load() {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
  try {
    const response = await fetch(PUBLIC_CONTENT_URL + "?v=1", {cache:"no-store"});
    if (!response.ok) throw new Error("Public content API " + response.status);
    const payload = await response.json();
    if (payload.error) throw new Error(payload.error);
    const categoryMap = Object.fromEntries((payload.categories || []).map(c => [c.slug, c.id]));
    const posts = payload.posts || [];
    cats.forEach(slug => {
      const id = categoryMap[slug];
      show(slug, id ? posts.filter(p => p.category_id === id).slice(0, 10) : []);
    });
  } catch (e) {
    console.error("YOCEWOR homepage load error:", e);
    cats.forEach(slug => show(slug, [], true));
  }
}

const form = document.getElementById("search");
if (form) form.onsubmit = e => {
  e.preventDefault();
  const q = document.getElementById("q")?.value.trim();
  if (q) location.href = "/search.html?q=" + encodeURIComponent(q);
};
load();