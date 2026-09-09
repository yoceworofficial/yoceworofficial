// YOCEWOR homepage jobs fallback v4
(function(){
  'use strict';
  const SUPABASE_URL='https://mzntgjyecymcpzciklfk.supabase.co';
  const SUPABASE_KEY='sb_publishable_AAXGC4EmiD4ELszpchz9Dw_Eryr6Usn';
  const isAnswerKey=j=>String(j&&j.type||'').toLowerCase().replace(/[-\s]+/g,'_')==='answer_key';
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function target(){return document.getElementById('jobList')||document.getElementById('jobsList')||document.querySelector('[data-home-jobs]');}
  function hasRenderedJobs(box){return !!(box&&box.querySelector('.item-title')&&box.querySelector('.item-actions'));}
  function render(rows){
    const box=target(); if(!box) return false;
    const jobs=(rows||[]).filter(j=>!isAnswerKey(j));
    if(!jobs.length){box.innerHTML='<div class="empty">अभी कोई published recruitment नहीं है।</div>';return true;}
    box.innerHTML=jobs.slice(0,12).map(j=>{
      const title=esc(j.title||'Government Recruitment');
      const detail='job-details.html?id='+encodeURIComponent(j.id||'');
      return '<article class="item"><div class="item-title">'+title+'</div><div class="meta">Department: '+esc(j.department||'—')+' • Start Date: '+esc(j.start_date||'—')+' • Last Date: '+esc(j.last_date||'—')+' • Vacancy: '+esc(j.vacancies==null?'—':j.vacancies)+' • Qualification: '+esc(j.qualification||'—')+'</div><div class="item-actions"><a class="btn" href="'+detail+'">पूर्ण विवरण</a>'+(j.apply_url?'<a class="btn green" href="'+esc(j.apply_url)+'" target="_blank" rel="noopener">Apply ↗</a>':'')+(j.notification_url?'<a class="btn orange" href="'+esc(j.notification_url)+'" target="_blank" rel="noopener">Notification ↗</a>':'')+'</div></article>';
    }).join('');
    return true;
  }
  async function run(){
    const box=target(); if(!box||hasRenderedJobs(box)) return;
    try{
      const fields='id,title,type,department,start_date,last_date,vacancies,qualification,age,salary,description,apply_url,notification_url,created_at,updated_at,publish_date,published_at,published';
      const url=SUPABASE_URL+'/rest/v1/jobs?select='+encodeURIComponent(fields)+'&published=eq.true&order=updated_at.desc,created_at.desc&limit=1000';
      const r=await fetch(url,{method:'GET',headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY,Accept:'application/json'},cache:'no-store'});
      if(!r.ok) throw new Error('Supabase REST HTTP '+r.status);
      const rows=await r.json();
      render(Array.isArray(rows)?rows:[]);
    }catch(e){console.error('YOCEWOR home jobs fallback v4:',e);}
  }
  function start(){setTimeout(run,500);setTimeout(run,1500);setTimeout(run,3000);setTimeout(run,6000);setTimeout(run,10000);}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
