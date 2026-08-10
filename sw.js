const CACHE='yocewor-v2';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 if(u.origin===location.origin && u.pathname.endsWith('/yocewor-v2.html')){
  e.respondWith(fetch(e.request).then(async r=>{const text=await r.text();const injected=text.replace('</body>','<script src="features.js"></script></body>');return new Response(injected,{status:r.status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})}).catch(()=>caches.match(e.request)));
 }else e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});