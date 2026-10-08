const API = "https://mzntgjyecymcpzciklfk.supabase.co/functions/v1/public-content";
const esc = v => String(v ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const fmt = v => v ? new Intl.DateTimeFormat("en-IN",{dateStyle:"short",timeStyle:"short",hour12:true}).format(new Date(v)) : "-";
const names = {"latest-jobs":"Latest Jobs","admit-card":"Admit Card","answer-key":"Answer Key","result":"Result","exam-date":"Exam Date","latest-news":"Latest News","sarkari-yojana":"Sarkari Yojana","expired-jobs":"Expired Jobs"};

export async function onRequestGet(context) {
  const slug = String(context.params.slug||"").trim();
  if (!names[slug]) return context.next();
  try {
    const r = await fetch(API+"?v=3",{headers:{accept:"application/json"}});
    if (!r.ok) return context.next();
    const data = await r.json();
    const cat = (data.categories||[]).find(c=>c.slug===slug);
    if (!cat) return context.next();
    const posts = (data.posts||[]).filter(p=>p.category_id===cat.id).sort((a,b)=>new Date(b.published_at||0)-new Date(a.published_at||0));
    const desc = "YOCEWOR "+names[slug]+" updates.";
    const items = posts.map(p=>'<article class="cat-item"><h2><a href="/'+encodeURIComponent(p.slug)+'/">'+esc(p.title)+'</a></h2><div class="meta">Published: '+fmt(p.published_at)+'</div></article>').join("") || '<p>अभी इस category में कोई प्रकाशित अपडेट उपलब्ध नहीं है।</p>';
    const html = `<!doctype html><html lang="hi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow"><meta name="description" content="${esc(desc)}"><title>${esc(names[slug])} — YOCEWOR</title><link rel="canonical" href="https://yocewor.in/category/${slug}/"><link rel="stylesheet" href="/styles.css"><script async src="https://www.googletagmanager.com/gtag/js?id=G-8PVG5XNL3H"></script><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2660794738235284" crossorigin="anonymous"></script></head><body><header><div class="wrap head"><a class="brand" href="/"><img class="brand-logo" src="/images/yocewor-logo.svg" alt="YOCEWOR logo"><span class="brand-copy"><span class="brand-name">YOCEWOR</span><span class="tagline">Your Voice. Your World.</span></span></a><nav><a href="/">Home</a><a href="/category/latest-jobs/">Latest Jobs</a><a href="/category/admit-card/">Admit Card</a><a href="/category/answer-key/">Answer Key</a><a href="/category/result/">Result</a><a href="/category/exam-date/">Exam Date</a><a href="/category/latest-news/">Latest News</a><a href="/category/sarkari-yojana/">Sarkari Yojana</a><a href="/candidate-guide.html">Candidate Guide</a></nav></div></header><main class="site-wrap article"><p><a href="/">Home</a> &gt; ${esc(names[slug])}</p><h1>${esc(names[slug])}</h1><p>${esc(desc)}</p><div class="category-posts">${items}</div></main><footer class="site-footer"><div class="site-wrap footer-inner"><div>© ${new Date().getFullYear()} YOCEWOR</div><div class="footer-links"><a href="/about.html">About</a><a href="/contact.html">Contact</a><a href="/privacy-policy.html">Privacy Policy</a><a href="/disclaimer.html">Disclaimer</a><a href="/terms.html">Terms &amp; Conditions</a><a href="/editorial-policy.html">Editorial Policy</a></div></div></footer></body></html>`;
    return new Response(html,{headers:{"content-type":"text/html; charset=UTF-8","cache-control":"public, max-age=30, s-maxage=30, stale-while-revalidate=60"}});
  } catch(e){ console.error("YOCEWOR live category render failed",e); return context.next(); }
}

// syntax-fixed deployment trigger
