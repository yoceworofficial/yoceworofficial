// YOCEWOR homepage live layer v8 — reliable public recruitment loader + final polish
(function(){
  'use strict';
  const SUPABASE_URL='https://mzntgjyecymcpzciklfk.supabase.co';
  const SUPABASE_KEY='sb_publishable_AAXGC4EmiD4ELszpchz9Dw_Eryr6Usn';
  const esc=s=>String(s==null?'':s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
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
    if(!shown.length){box.innerHTML='<div class=\"empty\">अभी कोई published recruitment उपलब्ध नहीं है।</div>';return true;}
    box.innerHTML=shown.map((j,i)=>{
      const title=esc(j.title||'Government Recruitment');
      const detail=j.slug?'job.html?slug='+encodeURIComponent(j.slug):'job.html?id='+encodeURIComponent(j.id||'');
      const apply=j.apply_url?'<a class=\"btn green home-apply\" href=\"'+esc(j.apply_url)+'\" target=\"_blank\" rel=\"noopener\">Apply ↗</a>':'';
      const vacancy=esc(j.vacancies==null?'—':j.vacancies);
      const last=esc(j.last_date||'—');
      const dept=esc(j.department||'Recruitment');
      return '<article class=\"item\"><div class=\"item-main\"><div class=\"item-title\"><span class=\"job-rank\">'+(i+1)+'</span>'+title+(i===0?'<span class=\"new\">LIVE</span>':'')+'</div><div class=\"job-mini\"><span>📌 '+dept+'</span><span>👥 '+vacancy+' Posts</span><span>📅 '+last+'</span></div></div><div class=\"item-actions\"><a class=\"btn home-details\" href=\"'+detail+'\">पूरी जानकारी</a>'+apply+'</div></article>';
    }).join('');
    return true;
  }
  function updateTicker(rows){
    const track=document.getElementById('tickerTrack'); if(!track)return;
    const jobs=(Array.isArray(rows)?rows:[]).filter(j=>!isAnswerKey(j)).slice(0,8);
    if(!jobs.length)return;
    const items=jobs.map(j=>{const detail=j.slug?'job.html?slug='+encodeURIComponent(j.slug):'job.html?id='+encodeURIComponent(j.id||'');return '<a href=\"'+detail+'\">🔥 '+esc(j.title||'Latest Recruitment')+' • Last Date: '+esc(j.last_date||'—')+'</a>';}).join('');
    track.innerHTML=items+items;track.classList.add('live-scroll');
  }
  function updateHero(rows){
    const hero=document.querySelector('.hero-grid>div'); if(!hero||hero.querySelector('.hero-stats'))return;
    const count=(Array.isArray(rows)?rows:[]).filter(j=>!isAnswerKey(j)&&isJob(j)).length;
    hero.insertAdjacentHTML('beforeend','<div class=\"hero-stats\"><div class=\"hero-stat\"><i>💼</i><div><strong>'+count+'</strong><span>Published Jobs</span></div></div><div class=\"hero-stat\"><i>⚡</i><div><strong>LIVE</strong><span>Fresh Updates</span></div></div><div class=\"hero-stat\"><i>🛡️</i><div><strong>OFFICIAL</strong><span>Source First</span></div></div></div>');
  }
  function polishSocial(){document.querySelectorAll('.social a').forEach(a=>{if(a.dataset.yoceworIcon)return;const t=(a.textContent||'').toLowerCase();a.dataset.yoceworIcon='1';a.setAttribute('aria-label',t.includes('telegram')?'Telegram':t.includes('instagram')?'Instagram':t.includes('channel')?'WhatsApp Channel':'WhatsApp Group');});}
  function seoAndMobileFixes(){
    let m=document.querySelector('meta[name=\"description\"]');
    if(!m){m=document.createElement('meta');m.name='description';document.head.appendChild(m)}
    m.setAttribute('content',\"YOCEWOR is India's education and opportunities platform for the latest government jobs, recruitment, exams, results, admit cards, syllabus, scholarships and admissions.\");
    let icon=document.querySelector('link[rel=\"icon\"]');
    if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.appendChild(icon)}
    icon.href='/yocewor-logo.svg?v=20260913';
    icon.type='image/svg+xml';
    let apple=document.querySelector('link[rel=\"apple-touch-icon\"]');
    if(!apple){apple=document.createElement('link');apple.rel='apple-touch-icon';document.head.appendChild(apple)}
    apple.href='/yocewor-logo.svg?v=20260913';
    let schema=document.getElementById('yoceworHomeOrganizationSchema');
    if(!schema){schema=document.createElement('script');schema.id='yoceworHomeOrganizationSchema';schema.type='application/ld+json';schema.textContent=JSON.stringify({\"@context\":\"https://schema.org\",\"@type\":\"Organization\",\"name\":\"YOCEWOR\",\"url\":\"https://yocewor.in/\",\"logo\":\"https://yocewor.in/yocewor-logo.svg\",\"description\":\"India's Education & Opportunities Platform\"});document.head.appendChild(schema)}
    if(document.getElementById('yocewor-final-mobile-fix'))return;
    const s=document.createElement('style');s.id='yocewor-final-mobile-fix';s.textContent=`
      .brand-logo,.hero-logo,.foot-brand img{display:block!important;visibility:visible!important;opacity:1!important;object-fit:contain!important}
      /* Header cleanup: remove Create Account, Notifications, Messages and Profile; keep More. */
      .top-right a[href=\"#create\"],.top-right a[href=\"#login\"]{display:none!important}
      .account{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:6px!important}
      .account a:nth-child(-n+3){display:none!important}
      .account a:nth-child(4){display:flex!important}
      @media(max-width:900px){
        .wrap{width:94%!important;max-width:none!important}
        .head{display:grid!important;grid-template-columns:180px minmax(0,1fr) 150px!important;align-items:center!important;gap:7px!important;min-height:78px!important;padding:5px 0!important}
        .brand{display:flex!important;flex-wrap:nowrap!important;align-items:center!important;gap:7px!important;min-width:0!important;padding:4px 0!important}
        .brand-logo{width:58px!important;height:58px!important;flex:0 0 58px!important}
        .brand h1{font-size:22px!important;line-height:1!important;white-space:nowrap!important;margin:0!important}
        .brand p{font-size:8px!important;line-height:1.1!important;white-space:nowrap!important;margin:3px 0 0!important}
        .search{height:40px!important;min-width:0!important;width:100%!important}
        .search input{font-size:10px!important;min-width:0!important}
        .search button{min-width:58px!important;font-size:9px!important;padding:0 8px!important}
        .account{display:flex!important;justify-content:flex-end!important;align-items:center!important;gap:6px!important;min-width:0!important;overflow:hidden!important}
        .account a{font-size:9px!important;white-space:nowrap!important;display:flex!important;align-items:center!important;gap:2px!important}
        .account a svg{width:17px!important;height:17px!important;margin:0!important;flex:none!important}
        .hero{height:110px!important;min-height:110px!important}
        .hero-inner{height:100%!important;padding:7px 10px!important;gap:7px!important;display:flex!important;align-items:center!important}
        .hero-logo{width:62px!important;height:62px!important;flex:0 0 62px!important}
        .hero-copy{min-width:0!important;flex:1 1 auto!important}
        .hero-copy h2{font-size:16px!important;line-height:1.05!important;white-space:nowrap!important;margin:0!important}
        .hero-copy b{font-size:8px!important;line-height:1.1!important;white-space:nowrap!important}
        .hero-links{font-size:7px!important;gap:4px!important;margin-top:4px!important;white-space:nowrap!important;overflow:hidden!important}
        .hero-links a:after{margin-left:4px!important}
        .hero-slogan{display:block!important;visibility:visible!important;opacity:1!important;flex:0 0 92px!important;min-width:92px!important;max-width:92px!important;margin-left:auto!important;font-size:0!important;line-height:1.05!important;text-align:center!important;overflow:visible!important}
        .hero-slogan::before{content:'Better Opportunities';display:block!important;font-size:12px!important;font-family:cursive!important;font-style:italic!important}
        .hero-slogan::after{content:'Brighter Future';display:block!important;font-size:12px!important;font-family:cursive!important;font-style:italic!important;text-decoration:underline!important;text-decoration-color:#176fe2!important;text-underline-offset:3px!important}
        .hero-slogan div{height:2px!important;margin-top:3px!important;background:#176fe2!important;transform:skew(-25deg)!important}
        .join{display:block!important;min-width:60px!important;padding:7px!important;font-size:8px!important;margin-left:3px!important}
        .join-sub{display:block!important;font-size:5px!important;margin-top:3px!important;white-space:nowrap!important}
        .quick{grid-template-columns:repeat(3,1fr)!important;gap:6px!important}
        .quick-card{height:62px!important;padding:6px!important;gap:5px!important;min-width:0!important}
        .quick-card h3{font-size:10px!important;white-space:nowrap!important}
        .quick-card p{font-size:6px!important;white-space:nowrap!important;overflow:hidden!important}
        .qicon{width:27px!important;height:27px!important;flex:0 0 27px!important}.qicon svg{width:23px!important;height:23px!important}
        .columns{grid-template-columns:repeat(3,1fr)!important;gap:5px!important;padding:5px!important}
        .column-head{height:37px!important;font-size:10px!important;padding:0 7px!important;gap:5px!important;white-space:nowrap!important}.column-head svg{width:16px!important;flex:none!important}
        .column-body{min-height:255px!important;padding:6px!important}.job-list{padding-left:14px!important}.job-list li{font-size:7.5px!important;line-height:1.35!important;padding:2px 0!important}
        .footer-row{grid-template-columns:1fr!important;gap:10px!important}.foot-links{justify-content:flex-start!important}.social{justify-content:flex-start!important}.tagline{text-align:left!important}
      }
      @media(max-width:430px){.head{grid-template-columns:160px minmax(0,1fr) 112px!important;gap:4px!important}.brand-logo{width:52px!important;height:52px!important;flex-basis:52px!important}.brand h1{font-size:18px!important}.brand p{font-size:7px!important}.account{gap:3px!important}.account a{font-size:0!important}.account a svg{width:16px!important;height:16px!important}.search{height:38px!important}.search input{font-size:9px!important}.search button{min-width:52px!important;font-size:8px!important}.hero-slogan{flex-basis:78px!important;min-width:78px!important}.hero-slogan::before,.hero-slogan::after{font-size:10px!important}.join{min-width:52px!important;font-size:7px!important;padding:6px 4px!important}.columns{grid-template-columns:repeat(3,1fr)!important}.job-list li{font-size:7px!important}}
      @media(max-width:760px){.account{display:flex!important}.account a:nth-child(-n+3){display:none!important}.account a:nth-child(4){display:flex!important;font-size:0!important}}
    `;document.head.appendChild(s);
  }
  function style(){
    if(document.getElementById('yocewor-home-v8-style'))return;
    const s=document.createElement('style');s.id='yocewor-home-v8-style';s.textContent=`
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
    try{const rows=await fetchRows();if(!hasFullDetails(box))render(rows);updateTicker(rows);updateHero(rows);polishSocial();style();seoAndMobileFixes();box.dataset.liveLoaded='true';}
    catch(e){console.error('YOCEWOR public recruitment loader:',e);style();polishSocial();seoAndMobileFixes();if(!box.dataset.liveLoaded&&!box.querySelector('.job,.item'))box.innerHTML='<div class=\"empty\">Recruitment data अभी load नहीं हो सका। कृपया refresh करें।</div>';}
  }
  function start(){style();seoAndMobileFixes();[0,500,1500,3500].forEach(t=>setTimeout(run,t));setInterval(run,20000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
