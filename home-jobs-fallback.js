// YOCEWOR homepage live layer v6 — compact cards, real SVG social icons, live data
(function(){
  'use strict';
  const SUPABASE_URL='https://mzntgjyecymcpzciklfk.supabase.co';
  const SUPABASE_KEY='sb_publishable_AAXGC4EmiD4ELszpchz9Dw_Eryr6Usn';
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const isAnswerKey=j=>String(j&&j.type||'').toLowerCase().replace(/[-\s]+/g,'_')==='answer_key';
  const target=()=>document.getElementById('jobList')||document.getElementById('jobsList')||document.querySelector('[data-home-jobs]');
  const hasFullDetails=box=>!!(box&&box.querySelector('.item-title')&&box.querySelector('.item-actions .home-details'));
  const icon={
    wa:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.5 4.1 1.6 5.9L.2 24l6.5-1.7a11.8 11.8 0 0 0 5.4 1.3h.1c6.5 0 11.8-5.3 11.8-11.8 0-3.1-1.2-6.1-3.5-8.3Zm-8.4 18.1h-.1a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.9 1 1-3.8-.3-.4a9.8 9.8 0 1 1 8.7 4.8Zm5.4-7.3c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-1.5-.7-2.5-1.3-3.5-2.9-.3-.5.3-.5.8-1.7.1-.2 0-.4-.1-.5l-.6-1.6c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.7.7 2.3.8 3.1.7.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.1.1-1.2Z"/></svg>',
    tg:'<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.9 3.1 18.6 20c-.3 1.2-1 1.5-2 .9l-5.6-4.1-2.7 2.6c-.3.3-.5.5-1 .5l.4-5.7 10.3-9.3c.4-.4-.1-.6-.6-.2L4.7 12.9.1 11.5c-1-.3-1-1 .2-1.5L20.4 2.2c.9-.3 1.7.2 1.5.9Z"/></svg>',
    ig:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.4" cy="6.7" r="1.2" fill="currentColor"/></svg>'
  };
  function render(rows){
    const box=target(); if(!box) return false;
    const jobs=(rows||[]).filter(j=>!isAnswerKey(j));
    if(!jobs.length){box.innerHTML='<div class="empty">अभी कोई published recruitment नहीं है।</div>';return true;}
    box.innerHTML=jobs.slice(0,10).map((j,i)=>{
      const title=esc(j.title||'Government Recruitment');
      const detail='job-details.html?id='+encodeURIComponent(j.id||'');
      const apply=j.apply_url?'<a class="btn green home-apply" href="'+esc(j.apply_url)+'" target="_blank" rel="noopener">Apply ↗</a>':'';
      const vacancy=esc(j.vacancies==null?'—':j.vacancies);
      const last=esc(j.last_date||'—');
      const dept=esc(j.department||'');
      return '<article class="item"><div class="item-main"><div class="item-title"><span class="job-rank">'+(i+1)+'</span>'+title+(i===0?'<span class="new">LIVE</span>':'')+'</div><div class="job-mini"><span>📌 '+(dept||'Recruitment')+'</span><span>👥 '+vacancy+' Posts</span><span>📅 '+last+'</span></div></div><div class="item-actions"><a class="btn home-details" href="'+detail+'">पूरी जानकारी</a>'+apply+'</div></article>';
    }).join('');
    return true;
  }
  function updateTicker(rows){
    const track=document.getElementById('tickerTrack'); if(!track) return;
    const jobs=(rows||[]).filter(j=>!isAnswerKey(j)).slice(0,8);
    if(!jobs.length) return;
    const items=jobs.map(j=>'<a href="job-details.html?id='+encodeURIComponent(j.id||'')+'">🔥 '+esc(j.title||'Latest Recruitment')+' • Last Date: '+esc(j.last_date||'—')+'</a>').join('');
    track.innerHTML=items+items;track.classList.add('live-scroll');
  }
  function updateHero(rows){
    const hero=document.querySelector('.hero-grid>div'); if(!hero||hero.querySelector('.hero-stats')) return;
    const count=(rows||[]).filter(j=>!isAnswerKey(j)).length;
    hero.insertAdjacentHTML('beforeend','<div class="hero-stats"><div class="hero-stat"><i>💼</i><div><strong>'+count+'+</strong><span>Latest Jobs</span></div></div><div class="hero-stat"><i>⚡</i><div><strong>LIVE</strong><span>Fresh Updates</span></div></div><div class="hero-stat"><i>🛡️</i><div><strong>100%</strong><span>Trusted Info</span></div></div></div>');
  }
  function polishSocial(){
    document.querySelectorAll('.social a').forEach(a=>{
      if(a.dataset.yoceworIcon) return;
      const t=(a.textContent||'').toLowerCase();
      a.innerHTML=(t.includes('telegram')?icon.tg:t.includes('instagram')?icon.ig:icon.wa)+'<span>'+esc(t.includes('whatsapp')?(t.includes('channel')?'WhatsApp Channel':'WhatsApp Group'):t.includes('telegram')?'Telegram':'Instagram')+'</span>';
      a.dataset.yoceworIcon='1';
    });
  }
  function style(){
    if(document.getElementById('yocewor-home-v6-style')) return;
    const s=document.createElement('style');s.id='yocewor-home-v6-style';s.textContent=`
      .social a svg{width:17px;height:17px;display:block;flex:0 0 17px}.social a{display:inline-flex!important;align-items:center;gap:6px!important}
      .social a:before{display:none!important}.job-rank{display:inline-grid;place-items:center;width:23px;height:23px;border-radius:50%;background:linear-gradient(135deg,#0b83ca,#063b68);color:#fff;font-size:10px;margin-right:8px;vertical-align:1px}.item-main{min-width:0}.job-mini{display:flex;flex-wrap:wrap;gap:5px 12px;margin:5px 0 0;padding-left:31px;color:#60798b;font-size:9.5px;line-height:1.4}.job-mini span{white-space:nowrap}.home-details{background:linear-gradient(135deg,#087fc4,#063b68)!important;border-color:#087fc4!important}.home-apply{background:linear-gradient(135deg,#079a69,#087653)!important}.item-actions .btn.orange{display:none!important}#jobs .item-actions{gap:6px}.live-scroll a{flex:0 0 auto}.live-scroll{overflow:hidden!important}.new{float:right;background:#07935f;color:#fff;border-radius:10px;padding:3px 7px;font-size:8px}.hero-stats{position:relative;z-index:2;display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:9px!important;margin-top:15px!important}.hero-stat{display:flex!important;align-items:center!important;gap:8px!important;min-height:50px!important;padding:8px 10px!important;border-radius:11px!important;border:1px solid #ffffff42!important;background:#ffffff14!important}.hero-stat i{font-style:normal!important;font-size:21px!important}.hero-stat strong{font-size:17px!important;color:#fff!important;display:block!important}.hero-stat span{font-size:9px!important;color:#e7f6ff!important;display:block!important}.hero:before{background:linear-gradient(90deg,transparent 0 4%,#ffffff18 4% 5%,transparent 5% 10%,#ffffff18 10% 11%,transparent 11% 16%,#ffffff18 16% 17%,transparent 17% 22%,#ffffff18 22% 23%,transparent 23% 28%,#ffffff18 28% 29%,transparent 29% 34%,#ffffff18 34% 35%,transparent 35% 40%,#ffffff18 40% 41%,transparent 41% 46%,#ffffff18 46% 47%,transparent 47% 52%,#ffffff18 52% 53%,transparent 53% 58%,#ffffff18 58% 59%,transparent 59% 64%,#ffffff18 64% 65%,transparent 65% 70%,#ffffff18 70% 71%,transparent 71% 76%,#ffffff18 76% 77%,transparent 77% 82%,#ffffff18 82% 83%,transparent 83% 88%,#ffffff18 88% 89%,transparent 89%) ,linear-gradient(180deg,#ffffff00 0 15%,#ffffff14 15% 17%,#ffffff00 17% 24%,#ffffff12 24% 26%,#ffffff00 26% 33%,#ffffff10 33% 35%,#ffffff00 35% 100%)!important;clip-path:polygon(0 55%,8% 48%,16% 53%,24% 40%,32% 47%,40% 34%,48% 43%,56% 29%,64% 37%,72% 22%,80% 31%,88% 15%,100% 22%,100% 100%,0 100%)!important}
      @media(max-width:560px){.job-mini{padding-left:30px;font-size:8.5px;gap:3px 8px}.hero-stats{gap:5px!important}.hero-stat{padding:6px 5px!important;min-height:43px!important}.hero-stat strong{font-size:12px!important}.hero-stat span{font-size:7px!important}.hero-stat i{font-size:14px!important}.social a{font-size:8px!important;padding:6px 7px!important}}
    `;document.head.appendChild(s);
  }
  async function run(){
    const box=target(); if(!box) return;
    try{
      const fields='id,title,type,department,start_date,last_date,vacancies,qualification,age,salary,description,apply_url,notification_url,created_at,updated_at,publish_date,published_at,published';
      const url=SUPABASE_URL+'/rest/v1/jobs?select='+encodeURIComponent(fields)+'&published=eq.true&order=updated_at.desc,created_at.desc&limit=1000';
      const r=await fetch(url,{headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY,Accept:'application/json'},cache:'no-store'});
      if(!r.ok) throw new Error('Supabase REST HTTP '+r.status);
      const rows=await r.json();
      if(!hasFullDetails(box)) render(Array.isArray(rows)?rows:[]);
      updateTicker(Array.isArray(rows)?rows:[]);updateHero(Array.isArray(rows)?rows:[]);polishSocial();style();
    }catch(e){console.error('YOCEWOR home live layer v6:',e);style();polishSocial();}
  }
  function start(){[300,900,1800,3500,7000].forEach(t=>setTimeout(run,t));setInterval(run,20000);}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
