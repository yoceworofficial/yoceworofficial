const CACHE='yocewor-v6-privacy-social';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 if(u.origin===location.origin && (u.pathname.endsWith('/index.html')||u.pathname.endsWith('/yocewor-v3.html'))){
  e.respondWith(fetch(e.request,{cache:'no-store'}).then(async r=>{
   const ct=r.headers.get('content-type')||'';
   if(!ct.includes('text/html'))return r;
   const text=await r.text();
   const injected=text.replace('</body>','<script src="privacy-controls.js?v=6" defer></script><script src="story-insights.js?v=6" defer></script><script src="follow-requests.js?v=6" defer></script></body>');
   return new Response(injected,{status:r.status,statusText:r.statusText,headers:{'Content-Type':'text/html; charset=UTF-8','Cache-Control':'no-store'}});
  }).catch(()=>caches.match(e.request)));
 }else e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});