/* YOCEWOR Task 4 — dynamic article template adapter */
(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean=s=>String(s??'').trim();
  const safeUrl=u=>{try{const x=new URL(String(u));return /^https?:$/.test(x.protocol)?x.href:''}catch(e){return ''}};
  const params=new URLSearchParams(location.search), id=params.get('id'), slug=params.get('slug')||location.pathname.split('/').filter(Boolean).pop();
  async function apply(){
    if(!window.supabase||!window.db) return false;
    const key=clean(id), cleanSlug=clean(slug); let q=window.db.from('jobs').select('*').eq('published',true);
    q=key?q.eq('id',key):q.eq('slug',decodeURIComponent(cleanSlug));
    const {data:j,error}=await q.maybeSingle(); if(error||!j) return false;
    const app=document.getElementById('app'); if(!app||app.querySelector('[data-task4="1"]')) return true;
    const facts=app.querySelector('.facts');
    if(facts){
      const rows=[['Department',j.department],['Last Date',j.last_date],['Total Posts',j.vacancies],['Application Fee',j.fee]];
      facts.outerHTML='<div class="quick-info" data-task4="1"><div class="quick-title">Quick Info</div><table class="quick-table"><tbody>'+rows.map(r=>'<tr><th>'+esc(r[0])+'</th><td>'+esc(r[1]||'Not specified')+'</td></tr>').join('')+'</tbody></table></div>';
    }
    const sections=[...app.querySelectorAll('.section')];
    const eligibility=sections.find(s=>/शैक्षणिक योग्यता|eligibility/i.test(s.querySelector('h2')?.textContent||''));
    if(eligibility){
      eligibility.querySelector('h2').textContent='Eligibility & Age Limit';
      const body=eligibility.querySelector('.section-body');
      body.innerHTML='<div class="elig-grid"><div><b>Educational Qualification</b><div>'+esc(j.qualification||'Not specified')+'</div></div><div><b>Age Limit</b><div>'+esc(j.age||'Not specified')+'</div></div></div>';
    }
    const links=sections.find(s=>/महत्वपूर्ण आधिकारिक लिंक|important links/i.test(s.querySelector('h2')?.textContent||''));
    if(links){
      links.querySelector('h2').textContent='Important Links';
      const body=links.querySelector('.section-body');
      const a=safeUrl(j.apply_url), n=safeUrl(j.notification_url);
      body.innerHTML='<div class="important-links-box">'+(a?'<a class="task4-apply" href="'+esc(a)+'" target="_blank" rel="noopener noreferrer">Apply Online ↗</a>':'')+(n?'<a class="task4-notice" href="'+esc(n)+'" target="_blank" rel="noopener noreferrer">Download Notification PDF ↗</a>':'')+(!a&&!n?'<div class="empty">Official links not available.</div>':'')+'</div>';
    }
    return true;
  }
  function start(){
    const timer=setInterval(async()=>{try{if(await apply())clearInterval(timer)}catch(e){}},300);
    setTimeout(()=>clearInterval(timer),15000);
  }
  start();
})();
