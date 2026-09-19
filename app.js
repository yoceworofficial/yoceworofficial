const { createClient } = supabase;
const db = createClient(YOCEWOR_CONFIG.supabaseUrl, YOCEWOR_CONFIG.supabasePublishableKey);

const cats = ["latest-jobs","admit-card","answer-key","result","exam-date","latest-news","sarkari-yojana"];
const esc = v => String(v ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

function show(id, rows, error) {
  const el = document.getElementById(id);
  if (!el) return;
  if (error) {
    console.error("YOCEWOR section load error:", id, error);
    el.innerHTML = "<p>Updates could not be loaded right now.</p>";
    return;
  }
  if (!rows?.length) {
    el.innerHTML = "<p>No updates available.</p>";
    return;
  }
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
    const { data: categories, error: catError } = await db
      .from("categories")
      .select("id,slug")
      .in("slug", cats)
      .eq("is_active", true);

    if (catError) {
      console.error("YOCEWOR categories load error:", catError);
      cats.forEach(slug => show(slug, [], true));
      return;
    }

    const categoryMap = Object.fromEntries((categories || []).map(c => [c.slug, c.id]));

    await Promise.all(cats.map(async slug => {
      const categoryId = categoryMap[slug];
      if (!categoryId) {
        show(slug, []);
        return;
      }

      const { data, error } = await db
        .from("posts")
        .select("title,slug,published_at")
        .eq("status", "published")
        .eq("category_id", categoryId)
        .order("published_at", { ascending: false })
        .limit(10);

      show(slug, data || [], error);
    }));
  } catch (error) {
    console.error("YOCEWOR homepage load error:", error);
    cats.forEach(slug => show(slug, [], true));
  }
}

const form = document.getElementById("search");
if (form) {
  form.onsubmit = e => {
    e.preventDefault();
    const q = document.getElementById("q")?.value.trim();
    if (q) location.href = "/search.html?q=" + encodeURIComponent(q);
  };
}

load();