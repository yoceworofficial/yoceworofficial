(function(){
  const SUPABASE_URL='https://mzntgjyecymcpzciklfk.supabase.co';
  const SUPABASE_KEY='sb_publishable_AAXGC4EmiD4ELszpchz9Dw_Eryr6Usn';
  const FUNCTION_URL=SUPABASE_URL+'/functions/v1/team-management';
  function readStoredSession(){
    const keys=['sb-mzntgjyecymcpzciklfk-auth-token','yocewor_team_session'];
    for(const key of keys){
      try{
        const raw=localStorage.getItem(key); if(!raw) continue;
        const x=JSON.parse(raw);
        const s=x?.currentSession||x?.session||x;
        if(s?.access_token) return s;
      }catch(e){}
    }
    return null;
  }
  async function request(action,extra={},timeout=10000){
    const session=readStoredSession();
    if(!session?.access_token) throw new Error('Login session missing. Please login again.');
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeout);
    try{
      const r=await fetch(FUNCTION_URL,{method:'POST',headers:{'Authorization':'Bearer '+session.access_token,'apikey':SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({action,...extra}),signal:controller.signal});
      const text=await r.text();
      let data={}; try{data=JSON.parse(text||'{}')}catch(e){throw new Error('Invalid authentication service response.');}
      if(!r.ok||data.error) throw new Error(data.error||('Access verification failed (HTTP '+r.status+').'));
      return data;
    }catch(e){
      if(e.name==='AbortError') throw new Error('Access verification timed out.');
      throw e;
    }finally{clearTimeout(timer);}
  }
  async function requireRole(roles){
    const allowed=(Array.isArray(roles)?roles:[roles]).map(x=>String(x).toLowerCase());
    const me=await request('me');
    const role=String(me?.role||'').toLowerCase();
    if(!allowed.includes(role)) throw new Error('You do not have permission to access this page.');
    return me;
  }
  function ensureOwnerNav(){
    document.querySelectorAll('.nav').forEach(nav=>{
      if(!nav.querySelector('a[href="/content.html"]')){
        const a=document.createElement('a');
        a.href='/content.html';
        a.textContent='📝 Content';
        nav.appendChild(a);
      }
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ensureOwnerNav); else ensureOwnerNav();
  window.YOCEWOR_AUTH={request,requireRole,readStoredSession,SUPABASE_URL,SUPABASE_KEY};
})();