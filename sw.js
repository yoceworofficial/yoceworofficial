const CACHE='yocewor-v3';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 if(u.origin===location.origin && (u.pathname.endsWith('/index.html')||u.pathname.endsWith('/yocewor-v3.html'))){
  e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));
 }else e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});