(function(){
  const SUPABASE_URL='https://mzntgjyecymcpzciklfk.supabase.co';
  const SUPABASE_KEY='sb_publishable_AAXGC4EmiD4ELszpchz9Dw_Eyr4Usn';
  const FUNCTION_URL=SUPABASE_URL+'/functions/v1/team-management';
  const STORAGE_KEY='sb-mzntgjyecymcpzciklfk-auth-token';
  let client=null, refreshInFlight=null;

  function getClient(){
    if(client)return client;
    if(!window.supabase||!window.supabase.createClient)throw new Error('Authentication service is unavailable.');
    client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,storageKey:STORAGE_KEY,detectSessionInUrl:true}});
    return client;
  }

  function localSession(){
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      if(!raw)return null;
      const x=JSON.parse(raw);
      return x?.currentSession||x?.session||x||null;
    }catch(e){return null}
  }

  async function getSession(){
    const c=getClient();
    try{
      const r=await c.auth.getSession();
      if(r?.data?.session?.access_token)return r.data.session;
    }catch(e){}
    const local=localSession();
    if(local?.access_token)return local;
    return null;
  }

  async function refreshSession(){
    if(refreshInFlight)return refreshInFlight;
    refreshInFlight=(async()=>{
      try{
        const c=getClient();
        const r=await c.auth.refreshSession();
        if(r?.data?.session?.access_token)return r.data.session;
      }catch(e){}
      return null;
    })().finally(()=>{refreshInFlight=null});
    return refreshInFlight;
  }

  async function request(action,extra={},timeout=10000){
    let session=await getSession();
    if(!session?.access_token)session=await refreshSession();
    if(!session?.access_token)throw new Error('Login session missing. Please login again.');

    const call=async(s)=>{
      const controller=new AbortController();
      const timer=setTimeout(()=>controller.abort(),timeout);
      try{
        const r=await fetch(FUNCTION_URL,{method:'POST',headers:{Authorization:'Bearer '+s.access_token,apikey:SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({action,...extra}),signal:controller.signal});
        const text=await r.text();
        let data={};
        try{data=JSON.parse(text||'{}')}catch(e){throw new Error('Invalid authentication service response.')}
        return {r,data};
      }catch(e){
        if(e.name==='AbortError')throw new Error('Access verification timed out.');
        throw e;
      }finally{clearTimeout(timer)}
    };

    let out=await call(session);
    if(out.r.status===401||out.r.status===403){
      const fresh=await refreshSession();
      if(fresh)out=await call(fresh);
    }
    if(!out.r.ok||out.data?.error)throw new Error(out.data?.error||('Access verification failed (HTTP '+out.r.status+').'));
    return out.data;
  }

  async function requireRole(roles){
    const allowed=(Array.isArray(roles)?roles:[roles]).map(x=>String(x).toLowerCase());
    const me=await request('me');
    const role=String(me?.role||'').toLowerCase();
    if(!allowed.includes(role))throw new Error('You do not have permission to access this page.');
    return me;
  }

  async function signOut(){
    try{await getClient().auth.signOut({scope:'global'})}catch(e){}
    try{localStorage.removeItem(STORAGE_KEY);localStorage.removeItem('yocewor_team_session')}catch(e){}
  }

  window.YOCEWOR_AUTH={request,requireRole,getSession,readStoredSession:localSession,SUPABASE_URL,SUPABASE_KEY,signOut};

  function ensureOwnerNav(){
    if(window.__YOCEWOR_OWNER_NAV_LOCKED)return;
    window.__YOCEWOR_OWNER_NAV_LOCKED=true;
    const style=document.createElement('style');
    style.id='yocewor-owner-nav-lock-v6';
    style.textContent='.nav{position:sticky!important;top:0!important;z-index:9999!important;display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:6px!important;white-space:normal!important;overflow:visible!important;width:100%!important;box-sizing:border-box!important}.nav>a,.nav>button{flex:0 0 auto!important;white-space:nowrap!important;display:inline-flex!important;align-items:center!important;visibility:visible!important}';
    (document.head||document.documentElement).appendChild(style);
    if(location.pathname==='/gm-manage-users.html')return;
    if(location.pathname.includes('gm-'))return;
    const html='<a href="/owner-dashboard.html">🏠 Home</a><a href="/dashboard.html">📊 Dashboard</a><a href="/team-management-live.html">👥 Team</a><a href="/content.html">📝 Content</a><a id="ownerEditContentNav" href="/content.html#edit">✏️ Edit Content</a><a href="/departments.html">🏢 Departments</a><a href="/important-notice.html">📢 Important Notice</a><a href="/live-notice.html">🔴 Live Notice</a><a href="/settings.html">⚙️ Settings</a><a href="/activity-audit.html">🧾 Activity / Audit</a><a href="/" id="yocewor-nav-logout">🚪 Logout</a>';
    document.querySelectorAll('.nav').forEach(nav=>{
      if(nav.dataset.yoceworLocked==='1')return;
      nav.dataset.yoceworLocked='1';
      nav.innerHTML=html;
      const current=location.pathname.replace(/\/$/,'')||'/owner-dashboard.html';
      nav.querySelectorAll('a').forEach(a=>{if(a.getAttribute('href')===current)a.classList.add('active')});
      const lo=nav.querySelector('#yocewor-nav-logout');
      if(lo)lo.onclick=async e=>{e.preventDefault();await signOut();location.href='/'};
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureOwnerNav,{once:true});else ensureOwnerNav();
})();
