(() => {
  const cfg = window.YOCEWOR_CONFIG;
  const client = window.supabase?.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey);

  const categoryIds = {
    "latest-jobs": "latest-jobs",
    "admit-card": "admit-card",
    "answer-key": "answer-key",
    "result": "result",
    "exam-date": "exam-date",
    "latest-news": "latest-news",
    "sarkari-yojana": "sarkari-yojana"
  };

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
        escapeHtml(row.title) + '</a>' + (date ? ' <span class="muted">(' + date + ')</span>' : '') + '</p>';
    }).join("");
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
  }

  async function loadCategory(slug, target, limit = 8) {
    if (!client) return;
    const { data: category } = await client.from("categories").select("id").eq("slug", slug).eq("is_active", true).maybeSingle();
    if (!category) return renderList(target, []);
    const { data, error } = await client.from("posts")
      .select("title,slug,published_at")
      .eq("category_id", category.id)
      .eq("status","published")
      .order("published_at",{ascending:false})
      .limit(limit);
    if (error) {
      console.error(error);
      return renderList(target, []);
    }
    renderList(target, data);
  }

  async function searchSite(term) {
    const q = term.trim();
    if (!q) return;
    window.location.href = "/search.html?q=" + encodeURIComponent(q);
  }

  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("search-button")?.addEventListener("click", () => searchSite(document.getElementById("site-search").value));
  document.getElementById("site-search")?.addEventListener("keydown", e => { if (e.key === "Enter") searchSite(e.target.value); });

  if (client) {
    Object.entries(categoryIds).forEach(([slug]) => loadCategory(slug, slug));
  }
})();