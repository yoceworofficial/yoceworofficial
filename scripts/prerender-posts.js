const fs = require('fs');
const path = require('path');

(async () => {
  const cfg = fs.readFileSync('config.js', 'utf8');
  const url = (cfg.match(/supabaseUrl:\s*["']([^"']+)/) || [])[1];
  const key = (cfg.match(/supabasePublishableKey:\s*["']([^"']+)/) || [])[1];
  if (!url || !key) throw new Error('Supabase public config not found');

  const headers = { apikey: key, Authorization: 'Bearer ' + key };
  const esc = v => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const get = async endpoint => {
    const r = await fetch(url + '/rest/v1/' + endpoint, {headers});
    if (!r.ok) throw new Error(endpoint + ': ' + r.status + ' ' + await r.text());
    return r.json();
  };

  const [posts,categories,jobs,sections,links] = await Promise.all([
    get('posts?select=id,category_id,title,slug,excerpt,content_intro,status,published_at,updated_at,seo_title,seo_description,canonical_url,featured_image_url&status=eq.published&order=updated_at.desc&limit=1000'),
    get('categories?select=id,name,slug&is_active=eq.true&order=sort_order'),
    get('jobs?select=*'),
    get('post_sections?select=*&order=sort_order.asc&limit=5000'),
    get('post_links?select=*&order=sort_order.asc&limit=5000')
  ]);

  const catById = new Map(categories.map(x => [x.id,x]));
  const jobByPost = new Map(jobs.map(x => [x.post_id,x]));
  const secByPost = new Map(), linkByPost = new Map();
  for (const x of sections) (secByPost.get(x.post_id) || (secByPost.set(x.post_id,[]),secByPost.get(x.post_id))).push(x);
  for (const x of links) (linkByPost.get(x.post_id) || (linkByPost.set(x.post_id,[]),linkByPost.get(x.post_id))).push(x);

  const text = v => esc(v).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
  const fmt = v => v ? new Date(v).toLocaleDateString('en-IN')+' | '+new Date(v).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true}) : '-';
  const safeUrl = v => { try { const u=new URL(String(v)); return /^https?:$/.test(u.protocol)?esc(u.href):''; } catch { return ''; } };
  const linkHtml = (label,url,bold=false,dark=false) => {
    const cls=(bold?' link-bold':'')+(dark?' link-dark':'');
    if(!url || url==='#' || label==='Coming Soon') return '<span class="link-label'+cls+'">'+esc(label)+'</span>';
    const safe=safeUrl(url);
    return safe?'<a class="link-label'+cls+'" href="'+safe+'" target="_blank" rel="noopener noreferrer">'+esc(label)+'</a>':'';
  };
  const sectionHtml = s => {
    const c=s.content||{}, items=Array.isArray(c)?c:(Array.isArray(c.items)?c.items:[]);
    if(s.section_type==='table'){
      const h=Array.isArray(c.headers)?c.headers:[], r=Array.isArray(c.rows)?c.rows:[];
      return '<table class="info-table'+(h.length>2?' responsive-wide':'')+'"><thead><tr>'+h.map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+
        r.map(row=>'<tr>'+row.map((x,i)=>'<td data-label="'+esc(h[i]||'')+'">'+text(x)+'</td>').join('')+'</tr>').join('')+
        '</tbody></table>';
    }
    if(s.section_type==='list') return '<ul>'+items.map(x=>'<li>'+text(x)+'</li>').join('')+'</ul>';
    if(s.section_type==='steps') return '<ol>'+items.map(x=>'<li>'+text(x)+'</li>').join('')+'</ol>';
    return '<p>'+text(typeof c==='string'?c:(c.text||''))+'</p>';
  };

  const categoryDescriptions = {
    'latest-jobs':'Government Jobs और Latest Recruitment की verified जानकारी, eligibility, dates और official links.',
    'admit-card':'Latest Admit Card और exam city updates के साथ official download information.',
    'answer-key':'Answer Key, response sheet और objection से जुड़ी verified updates.',
    'result':'Sarkari Result और exam result की official information, result links और next steps.',
    'exam-date':'Government exams की official exam dates, schedule और important date changes.',
    'latest-news':'Government और education से जुड़ी महत्वपूर्ण latest updates.',
    'sarkari-yojana':'Government Schemes, scholarship और public welfare updates की जानकारी.'
  };
  const categoryNav = [
    ['latest-jobs','Latest Jobs'],['admit-card','Admit Card'],['answer-key','Answer Key'],
    ['result','Result'],['exam-date','Exam Date'],['latest-news','Latest News'],['sarkari-yojana','Sarkari Yojana']
  ];
  for (const cat of categories) {
    const catPosts = posts.filter(p => p.category_id === cat.id).sort((a,b) => new Date(b.published_at||0)-new Date(a.published_at||0));
    const catSlug = String(cat.slug||'').trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(catSlug)) continue;
    const catTitle = cat.name || 'Updates';
    const catDesc = categoryDescriptions[catSlug] || ('YOCEWOR '+catTitle+' updates.');
    const nav = categoryNav.map(([s,n]) => '<a href="/category/'+s+'/">'+n+'</a>').join('');
    const items = catPosts.map(p => '<article class="cat-item"><h2><a href="/'+encodeURIComponent(p.slug)+'/">'+esc(p.title)+'</a></h2>'+(p.excerpt ? '<p>'+text(p.excerpt)+'</p>' : '')+'<div class="meta">प्रकाशित: '+fmt(p.published_at)+'</div></article>').join('') || '<p class="muted">अभी इस category में कोई प्रकाशित अपडेट उपलब्ध नहीं है।</p>';
    const catHtml = '<!doctype html><html lang="hi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow"><meta name="description" content="'+esc(catDesc)+'"><title>'+esc(catTitle)+' — YOCEWOR</title><link rel="canonical" href="https://yocewor.in/category/'+esc(catSlug)+'/"><link rel="stylesheet" href="/styles.css"></head><body><header><div class="wrap head"><a class="brand" href="/"><img class="brand-logo" src="/images/yocewor-logo.svg" alt="YOCEWOR logo"><span class="brand-copy"><span class="brand-name">YOCEWOR</span><span class="tagline">Your Voice. Your World.</span></span></a><nav><a href="/">Home</a>'+nav+'</nav></div></header><main class="site-wrap article"><p><a href="/">Home</a> &gt; '+esc(catTitle)+'</p><h1>'+esc(catTitle)+'</h1><p>'+esc(catDesc)+'</p><div class="category-posts">'+items+'</div></main><footer class="site-footer"><div class="site-wrap footer-inner"><div>© '+new Date().getFullYear()+' YOCEWOR</div><div class="footer-links"><a href="/about.html">About</a><a href="/contact.html">Contact</a><a href="/privacy-policy.html">Privacy Policy</a><a href="/disclaimer.html">Disclaimer</a><a href="/terms.html">Terms &amp; Conditions</a><a href="/editorial-policy.html">Editorial Policy</a></div></div></footer></body></html>';
    fs.mkdirSync(path.join('category',catSlug),{recursive:true});
    fs.writeFileSync(path.join('category',catSlug,'index.html'),catHtml);
  }

  const template=fs.readFileSync('post.html','utf8');
  for(const post of posts){
    const slug=String(post.slug||'').trim();
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) continue;
    const cat=catById.get(post.category_id), job=jobByPost.get(post.id), secs=secByPost.get(post.id)||[], ls=linkByPost.get(post.id)||[];
    const title=post.seo_title||post.title||'YOCEWOR', desc=post.seo_description||post.content_intro||post.title||'YOCEWOR government information update';
    const image=post.featured_image_url||'https://yocewor.in/images/default-share.svg';
    const canonical=post.canonical_url||'https://yocewor.in/'+encodeURIComponent(slug)+'/';

    let body='<p class="muted"><a href="/">Home</a> &gt; <a href="/category/'+encodeURIComponent(cat?.slug||'')+'/">'+esc(cat?.name||'Update')+'</a></p>';
    body+='<h1>'+esc(post.title)+'</h1><div class="meta">प्रकाशित: '+fmt(post.published_at)+' &nbsp; | &nbsp; प्रकाशितकर्ता: <a href="/author/yocewor-editorial-desk.html"><strong>YOCEWOR Editorial Desk</strong></a></div>';
    if(post.content_intro) body+='<p>'+text(post.content_intro)+'</p>';
    if(post.featured_image_url) body+='<div class="post-hero-image"><img src="'+esc(post.featured_image_url)+'" alt="'+esc(post.title)+'" loading="eager"></div>';
    if(job){
      const rows=[['भर्ती का नाम',job.recruitment_name],['संस्था',job.organization],['पद का नाम',job.post_name],['कुल पद',job.total_vacancy],['आवेदन माध्यम',job.application_mode],['कार्य स्थान',job.job_location]].filter(x=>x[1]!==null&&x[1]!==undefined&&x[1]!=='');
      if(rows.length) body+='<section class="article-section"><h2>संक्षिप्त जानकारी</h2><table class="info-table">'+rows.map(x=>'<tr><th>'+esc(x[0])+'</th><td>'+text(x[1])+'</td></tr>').join('')+'</table></section>';
    }
    for(const s of secs) {
      // Avoid repeating the same recruitment summary twice when the job table already
      // renders the compact "संक्षिप्त जानकारी" block above.
      const h=String(s.heading||'').toLowerCase();
      if(job && s.section_type==='table' && (h.includes('एक नजर में') || h.includes('overview') || h.includes('at a glance'))) continue;
      if(s.section_type!=='links') body+='<section class="article-section">'+(s.heading?'<h2>'+esc(s.heading)+'</h2>':'')+sectionHtml(s)+'</section>';
    }

    const all=ls.map(l=>({label:l.label||'Important Link',button:l.button_label||((l.label||'').includes('Coming Soon')?'Coming Soon':'Click Here'),url:l.url,bold:!!l.is_bold,dark:!!l.is_dark})).concat([
      {label:'More Job Updates',button:'yocewor.in',url:'https://yocewor.in/'},
      {label:'Join WhatsApp Channel',button:'Join Now',url:'https://whatsapp.com/channel/0029VaNA3EBJf05WBdLb1y2n'},
      {label:'Join Telegram Channel',button:'Join Now',url:'https://t.me/YOCEWOR'}
    ]);
    if(ls.length){ body+='<section class="article-section"><h2>स्रोत और आधिकारिक लिंक</h2><p class="muted">इस अपडेट में दिए गए महत्वपूर्ण स्रोत/लिंक नीचे उपलब्ध हैं। आवेदन, परिणाम या अंतिम नियम के लिए संबंधित official authority की जानकारी को प्राथमिकता दें।</p><div class="article-links-list">'+ls.slice(0,6).map(l=>'<p><strong>'+esc(l.label||'Source')+':</strong> '+linkHtml(l.button_label||'Open Link',l.url,!!l.is_bold,!!l.is_dark)+'</p>').join('')+'</div></section>'; }
    body+='<section class="article-section"><h2>महत्वपूर्ण लिंक</h2><div style="overflow-x:auto"><table class="article-links"><tbody>'+
      all.map(l=>'<tr><td>'+esc(l.label)+'</td><td class="link-open">'+linkHtml(l.button,l.url,l.bold,l.dark)+'</td></tr>').join('')+
      '</tbody></table></div></section>';
    body+='<section class="article-section"><h2>YOCEWOR से जुड़ें</h2><div class="article-links-list"><p><a href="https://www.instagram.com/yocewor" target="_blank" rel="noopener noreferrer">Instagram</a></p><p><a href="https://t.me/YOCEWOR" target="_blank" rel="noopener noreferrer">Telegram</a></p><p><a href="https://www.youtube.com/@YOCEWOR" target="_blank" rel="noopener noreferrer">YouTube</a></p><p><a href="https://whatsapp.com/channel/0029VaNA3EBJf05WBdLb1y2n" target="_blank" rel="noopener noreferrer">WhatsApp Channel</a></p></div></section>';
    body+='<p class="muted">अंतिम अपडेट: '+fmt(post.updated_at)+'</p>';

    const stop=new Set(['2026','2027','the','and','for','with','from','latest','recruitment','recruitment','2026-27','yocewor']); const tokens=t=>new Set(String(t||'').toLowerCase().split(/[^a-z0-9अ-ह]+/).filter(x=>x.length>2&&!stop.has(x))); const pt=tokens(post.title+' '+(post.content_intro||'')); const related=posts.filter(x=>x.id!==post.id).map(x=>{let score=0;for(const z of tokens(x.title+' '+(x.excerpt||'')))if(pt.has(z))score++;if(x.category_id===post.category_id)score+=1;return {x,score};}).filter(z=>z.score>0).sort((a,b)=>b.score-a.score||new Date(b.x.published_at||0)-new Date(a.x.published_at||0)).slice(0,6).map(z=>z.x);
    if(related.length) body+='<section class="article-section"><h2>संबंधित अपडेट</h2><ul class="related-list">'+related.map(x=>'<li><a href="/'+encodeURIComponent(x.slug)+'/">'+esc(x.title)+'</a></li>').join('')+'</ul></section>';

    const articleLd={'@context':'https://schema.org','@type':'Article','headline':post.title,'description':desc,'image':post.featured_image_url?[post.featured_image_url]:undefined,'datePublished':post.published_at,'dateModified':post.updated_at||post.published_at,'author':{'@type':'Organization','name':'YOCEWOR Editorial Desk','url':'https://yocewor.in/author/yocewor-editorial-desk.html'},'publisher':{'@type':'Organization','name':'YOCEWOR','url':'https://yocewor.in/'},'mainEntityOfPage':{'@type':'WebPage','@id':canonical}};
    const breadcrumbLd={'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':'https://yocewor.in/'},{'@type':'ListItem','position':2,'name':cat?.name||'Update','item':'https://yocewor.in/category/'+encodeURIComponent(cat?.slug||'')+'/'},{'@type':'ListItem','position':3,'name':post.title,'item':canonical}]};

    let html=template;
    html=html.replace(/<title>[^<]*<\/title>/i,'<title>'+esc(title)+'</title><link rel="canonical" href="'+esc(canonical)+'">');
    html=html.replace(/(<meta\s+name="description"\s+content=")[^"]*(")/i,'$1'+esc(desc)+'$2');
    html=html.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/i,'$1'+esc(title)+'$2');
    html=html.replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/i,'$1'+esc(desc)+'$2');
    html=html.replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/i,'$1'+esc(canonical)+'$2');
    html=html.replace(/(<meta\s+property="og:image"\s+content=")[^"]*(")/i,'$1'+esc(image)+'$2');
    html=html.replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/i,'$1'+esc(title)+'$2');
    html=html.replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/i,'$1'+esc(desc)+'$2');
    html=html.replace(/(<meta\s+name="twitter:image"\s+content=")[^"]*(")/i,'$1'+esc(image)+'$2');
    html=html.replace('</head>','<script type="application/ld+json">'+JSON.stringify(articleLd).replace(/</g,'\\u003c')+'</script><script type="application/ld+json">'+JSON.stringify(breadcrumbLd).replace(/</g,'\\u003c')+'</script></head>');
    html=html.replace(/<main class="site-wrap article" id="article">[\s\S]*?<\/main>/i,'<main class="site-wrap article" id="article">'+body+'</main>');
    // Generated article pages are fully server-rendered. Remove the legacy client renderer so it cannot overwrite content or break navigation.
    html=html.replace(/<script>\s*\(async\(\)=>\{[\s\S]*?\}\)\(\);\s*<\/script>\s*<\/body>/i,'</body>');
    html=html.replace(/<script src="\/config\.js[^>]*><\/script>/i,'');
    html=html.replace(/<span id="year"><\/span>/i,String(new Date().getFullYear()));
    fs.mkdirSync(slug,{recursive:true}); fs.writeFileSync(path.join(slug,'index.html'),html);
  }

  const staticUrls=['/','/category/latest-jobs/','/category/admit-card/','/category/answer-key/','/category/result/','/category/exam-date/','/category/latest-news/','/category/sarkari-yojana/','/about.html','/contact.html','/editorial-policy.html','/privacy-policy.html','/disclaimer.html','/terms.html','/author/yocewor-editorial-desk.html','/education.html','/news.html'];
  const xmlEsc=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
  const entries=staticUrls.map(loc=>({loc:'https://yocewor.in'+loc})).concat(posts.filter(p=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(p.slug||'').trim())).map(p=>({loc:'https://yocewor.in/'+encodeURIComponent(String(p.slug).trim())+'/',lastmod:p.updated_at||p.published_at||null})));
  fs.writeFileSync('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+entries.map(e=>'  <url><loc>'+xmlEsc(e.loc)+'</loc>'+(e.lastmod?'<lastmod>'+xmlEsc(String(e.lastmod).slice(0,10))+'</lastmod>':'')+'</url>').join('\n')+'\n</urlset>\n');
  console.log('Pre-rendered',posts.length,'published posts.');
})().catch(err=>{console.error(err);process.exit(1);});
