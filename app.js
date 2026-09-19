(() => {
  const cfg = window.YOCEWOR_CONFIG;
  if (!cfg || !window.supabase) return;
  const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey);
  const categories = ["latest-jobs","admit-card","answer-key","result","exam-date","latest-news","sarkari-yojana"];

  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));

  function renderList(target, rows) {
    const el = document.getElementById(target);
    if (!el) return;
    if (!rows?.length) {
      el.innerHTML = '<p class="muted">अभी कोई प्रकाशित अपडेट उपलब्ध नहीं है।</p>';
      return;
    }
    el.innerHTML = rows.map(row => {
      const date = row.published_at ? new Date(row.published_at).toLocaleDateString("en-IN") : "";
      return '<p class="post-item"><a href="/post.html?slug=' + encodeURIComponent(row.slug) + '">' +
        esc(row.title) + '</a>' + (date ? ' <span class="muted">(' + date + ')</span>' : '') + '</p>';
    }).join("");
  }

  async function loadCategory(slug, target, limit = 8) {
    const el = document.getElementById(target);
    if (!el) return;
    const { data: category, error: categoryError } = await client.from("categories")
      .select("id").eq("slug", slug).eq("is_active", true).maybeSingle();
    if (categoryError || !category) return renderList(target, []);
    const { data, error } = await client.from("posts")
      .select("title,slug,published_at")
      .eq("category_id", category.id).eq("status","published")
      .order("published_at",{ascending:false}).limit(limit);
    if (error) {
      console.error("YOCEWOR category load:", error);
      return renderList(target, []);
    }
    renderList(target, data);
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const input = document.getElementById("site-search");
  const button = document.getElementById("search-button");
  const search = () => {
    const term = input?.value.trim();
    if (term) location.href = "/search.html?q=" + encodeURIComponent(term);
  };
  button?.addEventListener("click", search);
  input?.addEventListener("keydown", e => { if (e.key === "Enter") search(); });

  categories.forEach(slug => loadCategory(slug, slug));
})();