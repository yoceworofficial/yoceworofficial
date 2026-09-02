(function(){
  const SUPABASE_URL='https://mzntgjyecymcpzciklfk.supabase.co';
  const SUPABASE_KEY='sb_publishable_AAXGC4EmiD4ELszpchz9Dw_Eryr6Usn';
  const FUNCTION_URL=SUPABASE_URL+'/functions/v1/team-management';
  const STORAGE_KEYS=['sb-mzntgjyecymcpzciklfk-auth-token','yocewor_team_session'];
  let refreshInFlight=null;
  function parseStored(){for(const key of STORAGE_KEYS){try{const raw=localStorage.getItem(key);if(!raw)continue;const x=JSON.parse(raw);const s=x?.currentSession||x?.session||x;if(s?.access_token)return {key,wrapper:x,session:s}}catch(e){}}return null}
  function readStoredSession(){return parseStored()?.session||null}
  function saveSession(key,old,session){try{let out=session;if(old&&old.currentSession)out={...old,currentSession:session};else if(old&&old.session)out={...old,session:session};localStorage.setItem(key,JSON.stringify(out))}catch(e){}}
  async function refreshSession(){if(refreshInFlight)return refreshInFlight;refreshInFlight=(async()=>{const p=parseStored();if(!p?.session?.refresh_token)return null;try{const r=await fetch(SUPABASE_URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:p.session.refresh_token})});if(!r.ok)return null;const s=await r.json();if(!s?.access_token)return null;saveSession(p.key,p.wrapper,s);return s}catch(e){return null}finally{refreshInFlight=null}})();return refreshInFlight}
  async function request(action,extra={},timeout=10000){let session=readStoredSession();if(!session?.access_token)session=await refreshSession();if(!session?.access_token)throw new Error('Login session missing. Please login again.');const call=async(s)=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);try{const r=await fetch(FUNCTION_URL,{method:'POST',headers:{Authorization:'Bearer '+s.access_token,apikey:SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({action,...extra}),signal:controller.signal});const text=await r.text();let data={};try{data=JSON.parse(text||'{}')}catch(e){throw new Error('Invalid authentication service response.')}return {r,data}}catch(e){if(e.name==='AbortError')throw new Error('Access verification timed out.');throw e}finally{clearTimeout(timer)}};let out=await call(session);if(out.r.status===401||out.r.status===403){const current=readStoredSession();if(current?.access_token&&current.access_token!==session.access_token)out=await call(current);if(out.r.status===401||out.r.status===403){const fresh=await refreshSession();if(fresh)out=await call(fresh)}}if(!out.r.ok||out.data?.error)throw new Error(out.data?.error||('Access verification failed (HTTP '+out.r.status+').'));return out.data}
  async function requireRole(roles){const allowed=(Array.isArray(roles)?roles:[roles]).map(x=>String(x).toLowerCase());const me=await request('me');const role=String(me?.role||'').toLowerCase();if(!allowed.includes(role))throw new Error('You do not have permission to access this page.');return me}
  async function signOut(){try{const session=readStoredSession();if(session?.access_token)await fetch(SUPABASE_URL+'/auth/v1/logout',{method:'POST',headers:{Authorization:'Bearer '+session.access_token,apikey:SUPABASE_KEY}})}catch(e){}for(const k of STORAGE_KEYS)localStorage.removeItem(k)}
  function ensureEditContentNav(){try{
    const existing=document.querySelector('[data-yocewor-edit-nav]');
    if(existing){if(!existing.querySelector('a[href="/edit-content.html"]')){const a=document.createElement('a');a.href='/edit-content.html';a.textContent='✏️ Edit Content';existing.appendChild(a)}return}
    let host=document.querySelector('.topbar')||document.querySelector('.top .wrap')||document.querySelector('header')||document.body;
    if(!host)return;
    const nav=document.createElement('nav');nav.setAttribute('data-yocewor-edit-nav','1');nav.className='nav';
    nav.style.cssText='display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px;width:100%;';
    nav.innerHTML='<a href="/owner-dashboard.html">🏠 Home</a><a href="/dashboard.html">📊 Dashboard</a><a href="/team-management-live.html">👥 Team</a><a href="/content.html">📝 Content</a><a href="/edit-content.html">✏️ Edit Content</a><a href="/departments.html">🏢 Departments</a><a href="/important-notice.html">📢 Important Notice</a><a href="/live-notice.html">🔴 Live Notice</a><a href="/settings.html">⚙️ Settings</a><a href="/activity-audit.html">🧾 Activity / Audit</a>';
    host.appendChild(nav);
  }catch(e){}}
  window.YOCEWOR_AUTH={request,requireRole,readStoredSession,SUPABASE_URL,SUPABASE_KEY,signOut};
  const boot=()=>{ensureEditContentNav();const mo=new MutationObserver(()=>ensureEditContentNav());mo.observe(document.body,{childList:true,subtree:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();