// YOCEWOR homepage jobs fallback v2
(function(){
  'use strict';
  const SUPABASE_URL='https://mzntgjyecymcpzciklfk.supabase.co';
  const SUPABASE_KEY='sb_publishable_AAXGC4EmiD4ELszpchz9Dw_Eryr6Usn';
  const isAnswerKey=j=>String(j&&j.type||'').toLowerCase().replace(/[-\s]+/g,'_')==='answer_key';
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function target(){return document.getElementById('jobList')||document.getElementById('jobsList')||document.querySelector('[data-home-jobs]');}
  function render(rows){
    const box=target(); if(!box) return false;
    if(box.children.length) return true;
    const jobs=(rows||[]).filter(j=>!isAnswerKey(j));
    if(!jobs.length){box.innerHTML='<div class="empty">अभी कोई published recruitment नहीं है।</div>';return true;}
    box.innerHTML=jobs.slice(0,12).map(j=>{
      const title=esc(j.title||'Government Recruitment');
      const detail='job-details.html?id='+encodeURIComponent(j.id||'');
      return '<article class="item"><div class="item-title">'+title+'</div><div class="meta">Department: '+esc(j.department||'—')+' • Start Date: '+esc(j.start_date||'—')+' • Last Date: '+esc(j.last_date||'—')+' • Vacancy: '+esc(j.vacancies==null?'—':j.vacancies)+' • Qualification: '+esc(j.qualification||'—')+'</div><div class="item-actions"><a class="btn" href="'+detail+'">पूर्ण विवरण</a>'+(j.apply_url?'<a class="btn green" href="'+esc(j.apply_url)+'" target="_blank" rel="noopener">Apply ↗</a>':'')+(j.notification_url?'<a class="btn orange" href="'+esc(j.notification_url)+'" target="_blank" rel="noopener">Notification ↗</a>':'')+'</div></article>';
    }).join('');
    return true;
  }
  function loadClient(){
    if(window.supabase && typeof window.supabase.createClient==='function') return Promise.resolve(window.supabase);
    return new Promise(function(resolve,reject){
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      s.onload=function(){resolve(window.supabase);};
      s.onerror=reject;
      document.head.appendChild(s);
    });
  }
  async function run(){
    const box=target(); if(!box||box.children.length) return;
    try{
      const clientLib=await loadClient();
      if(!clientLib||typeof clientLib.createClient!=='function') throw new Error('Supabase client unavailable');
      const db=clientLib.createClient(SUPABASE_URL,SUPABASE_KEY);
      const {data,error}=await db.from('jobs').select('id,title,type,department,start_date,last_date,vacancies,qualification,age,salary,description,apply_url,notification_url,created_at,updated_at,publish_date,published_at,published').eq('published',true).order('updated_at',{ascending:false}).order('created_at',{ascending:false}).limit(1000);
      if(error) throw error;
      render(data||[]);
    }catch(e){console.error('YOCEWOR home jobs fallback:',e);}
  }
  function start(){setTimeout(run,800);setTimeout(run,2500);setTimeout(run,5000);}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
