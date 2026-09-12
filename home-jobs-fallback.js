// YOCEWOR homepage live layer v7 — reliable public recruitment loader
(function(){
  'use strict';
  const SUPABASE_URL='https://mzntgjyecymcpzciklfk.supabase.co';
  const SUPABASE_KEY='sb_publishable_AAXGC4EmiD4ELszpchz9Dw_Eryr6Usn';
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=t=>String(t||'').trim().toLowerCase().replace(/[-\s]+/g,'_');
  const isAnswerKey=j=>norm(j&&j.type)==='answer_key';
  const isJob=j=>['job','recruitment','latest_jobs','state_government_jobs','central_government_jobs','government_jobs'].includes(norm(j&&j.type));
  const target=()=>document.getElementById('jobList')||document.getElementById('jobsList')||document.querySelector('[data-home-jobs]');
  const hasFullDetails=box=>!!(box&&box.querySelector('.item-title')&&box.querySelector('.item-actions .home-details'));
  function render(rows){
    const box=target(); if(!box)return false;
    const all=Array.isArray(rows)?rows:[];
    const jobs=all.filter(j=>!isAnswerKey(j)&&isJob(j));
    const today=new Date(); today.setHours(23,59,59,999);
    const active=jobs.filter(j=>!j.last_date||new Date(String(j.last_date)+'T23:59:59')>=today);
    const shown=(active.length?active:jobs).slice(0,10);
    if(!shown.length){box.innerHTML='<div class="empty">अभी कोई published recruitment उपलब्ध नहीं है।</div>';return true;}
    box.innerHTML=shown.map((j,i)=>{
      const title=esc(j.title||'Government Recruitment');
      const detail=j.slug?'job.html?slug='+encodeURIComponent(j.slug):'job.html?id='+encodeURIComponent(j.id||'');
      const apply=j.apply_url?'<a class="btn green home-apply" href="'+esc(j.apply_url)+'" target="_blank" rel="noopener">Apply ↗</a>':'';
      const vacancy=esc(j.vacancies==null?'—':j.vacancies);
      const last=esc(j.last_date||'—');
      const dept=esc(j.department||'Recruitment');
      return '<article class="item"><div class="item-main"><div class="item-title"><span class="job-rank">'+(i+1)+'</span>'+title+(i===0?'<span class="new">LIVE</span>':'')+'</div><div class="job-mini"><span>📌 '+dept+'</span><span>👥 '+vacancy+' Posts</span><span>📅 '+last+'</span></div></div><div class="item-actions"><a class="btn home-details" href="'+detail+'">पूरी जानकारी</a>'+apply+'</div></article>';
    }).join('');
    return true;
  }
  function updateTicker(rows){
    const track=document.getElementById('tickerTrack'); if(!track)return;
    const jobs=(Array.isArray(rows)?rows:[]).filter(j=>!isAnswerKey(j)).slice(0,8);
    if(!jobs.length)return;
    const items=jobs.map(j=>{
      const detail=j.slug?'job.html?slug='+encodeURIComponent(j.slug):'job.html?id='+encodeURIComponent(j.id||'');
      return '<a href="'+detail+'">🔥 '+esc(j.title||'Latest Recruitment')+' • Last Date: '+esc(j.last_date||'—')+'</a>';
    }).join('');
    track.innerHTML=items+items;track.classList.add('live-scroll');
  }
  function updateHero(rows){
    const hero=document.querySelector('.hero-grid>div'); if(!hero||hero.querySelector('.hero-stats'))return;
    const count=(Array.isArray(rows)?rows:[]).filter(j=>!isAnswerKey(j)&&isJob(j)).length;
    hero.insertAdjacentHTML('beforeend','<div class="hero-stats"><div class="hero-stat"><i>💼</i><div><strong>'+count+'</strong><span>Published Jobs</span></div></div><div class="hero-stat"><i>⚡</i><div><strong>LIVE</strong><span>Fresh Updates</span></div></div><div class="hero-stat"><i>🛡️</i><div><strong>OFFICIAL</strong><span>Source First</span></div></div></div>');
  }
  function polishSocial(){
    document.querySelectorAll('.social a').forEach(a=>{
      if(a.dataset.yoceworIcon)return;
      const t=(a.textContent||'').toLowerCase();
      a.dataset.yoceworIcon='1';
      a.setAttribute('aria-label',t.includes('telegram')?'Telegram':t.includes('instagram')?'Instagram':t.includes('channel')?'WhatsApp Channel':'WhatsApp Group');
    });
  }
  function style(){
    if(document.getElementById('yocewor-home-v7-style'))return;
    const s=document.createElement('style');s.id='yocewor-home-v7-style';s.textContent=`
      .social a{display:inline-flex!important;align-items:center;gap:6px!important}
      .job-rank{display:inline-grid;place-items:center;width:23px;height:23px;border-radius:50%;background:linear-gradient(135deg,#0b83ca,#063b68);color:#fff;font-size:10px;margin-right:8px;vertical-align:1px}
      .item-main{min-width:0}.job-mini{display:flex;flex-wrap:wrap;gap:5px 12px;margin:5px 0 0;padding-left:31px;color:#60798b;font-size:9.5px;line-height:1.4}.job-mini span{white-space:nowrap}
      .home-details{background:linear-gradient(135deg,#087fc4,#063b68)!important;border-color:#087fc4!important}.home-apply{background:linear-gradient(135deg,#079a69,#087653)!important}
      .new{float:right;background:#07935f;color:#fff;border-radius:10px;padding:3px 7px;font-size:8px}.hero-stats{position:relative;z-index:2;display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:9px!important;margin-top:15px!important}.hero-stat{display:flex!important;align-items:center!important;gap:8px!important;min-height:50px!important;padding:8px 10px!important;border-radius:11px!important;border:1px solid #ffffff42!important;background:#ffffff14!important}.hero-stat i{font-style:normal!important;font-size:21px!important}.hero-stat strong{font-size:17px!important;color:#fff!important;display:block!important}.hero-stat span{font-size:9px!important;color:#e7f6ff!important;display:block!important}
      @media(max-width:560px){.job-mini{padding-left:30px;font-size:8.5px;gap:3px 8px}.hero-stats{gap:5px!important}.hero-stat{padding:6px 5px!important;min-height:43px!important}.hero-stat strong{font-size:12px!important}.hero-stat span{font-size:7px!important}.hero-stat i{font-size:14px!important}}
    `;document.head.appendChild(s);
  }
  async function fetchRows(){
    const fields='id,title,type,slug,department,start_date,last_date,vacancies,qualification,age,salary,description,apply_url,notification_url,created_at,updated_at,publish_date,published_at,published';
    const url=SUPABASE_URL+'/rest/v1/jobs?select='+encodeURIComponent(fields)+'&published=eq.true&order=updated_at.desc,created_at.desc&limit=1000';
    const r=await fetch(url,{method:'GET',headers:{apikey:SUPABASE_KEY,Accept:'application/json'},cache:'no-store',credentials:'omit'});
    if(!r.ok)throw new Error('Supabase REST HTTP '+r.status);
    const data=await r.json();
    if(!Array.isArray(data))throw new Error('Invalid jobs response');
    return data;
  }
  async function run(){
    const box=target();if(!box)return;
    try{
      const rows=await fetchRows();
      if(!hasFullDetails(box))render(rows);
      updateTicker(rows);updateHero(rows);polishSocial();style();
      box.dataset.liveLoaded='true';
    }catch(e){
      console.error('YOCEWOR public recruitment loader:',e);
      style();polishSocial();
      if(!box.dataset.liveLoaded && !box.querySelector('.job,.item')){
        box.innerHTML='<div class="empty">Recruitment data अभी load नहीं हो सका। कृपया refresh करें।</div>';
      }
    }
  }
  function start(){style();[0,500,1500,3500].forEach(t=>setTimeout(run,t));setInterval(run,20000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
