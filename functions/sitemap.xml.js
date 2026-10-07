const API = "https://mzntgjyecymcpzciklfk.supabase.co/functions/v1/public-content";
const staticUrls = ["/","/category/latest-jobs/","/category/admit-card/","/category/answer-key/","/category/result/","/category/exam-date/","/category/latest-news/","/category/sarkari-yojana/","/category/expired-jobs/","/candidate-guide.html","/about.html","/contact.html","/editorial-policy.html","/privacy-policy.html","/disclaimer.html","/terms.html","/author/yocewor-editorial-desk.html","/education.html","/news.html"];
const xml = v => String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
export async function onRequestGet(context){
  try{
    const r=await fetch(API+"?v=3",{headers:{accept:"application/json"}});
    if(!r.ok) throw new Error("public-content "+r.status);
    const data=await r.json();
    const posts=(data.posts||[]).filter(p=>/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(p.slug||"").trim()));
    const entries=staticUrls.map(loc=>"<url><loc>https://yocewor.in"+loc+"</loc></url>").concat(posts.map(p=>"<url><loc>https://yocewor.in/"+encodeURIComponent(p.slug)+"/</loc>"+(p.published_at||p.updated_at?"<lastmod>"+xml(String(p.published_at||p.updated_at).slice(0,10))+"</lastmod>":"")+"</url>"));
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+entries.join("")+"</urlset>",{headers:{"content-type":"application/xml; charset=UTF-8","cache-control":"public, max-age=60, s-maxage=60"}});
  }catch(e){console.error("YOCEWOR live sitemap failed",e); return context.next();}
}
