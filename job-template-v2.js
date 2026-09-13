/* YOCEWOR Task 4 — dynamic article template adapter */
(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean=s=>String(s??'').trim();
  const safeUrl=u=>{try{const x=new URL(String(u));return /^https?:$/.test(x.protocol)?x.href:''}catch(e){return ''}};
  const params=new URLSearchParams(location.search), id=params.get('id'), slug=params.get('slug')||location.pathname.split('/').filter(Boolean).pop();
  const db2=window.supabase?.createClient?.('https://mzntgjyecymcpzciklfk.supabase.co','sb_publishable_AAXGC4EmiD4ELszpchz9Dw_Eryr6Usn');
  function style(){if(document.getElementById('yocewor-task4-css'))return;const s=document.createElement('style');s.id='yocewor-task4-css';s.textContent='.quick-info{margin-top:18px;border:1px solid #dbe3ea;border-radius:8px;overflow:hidden;background:#fff}.quick-title{background:#083b66;color:#fff;font-weight:900;padding:10px 13px;font-size:15px}.quick-table{width:100%;border-collapse:collapse}.quick-table th,.quick-table td{padding:10px 12px;border-bottom:1px solid #dbe3ea;text-align:left;font-size:14px}.quick-table th{width:38%;background:#f7fafc;color:#526575}.quick-table td{font-weight:800;color:#18374f}.quick-table tr:last-child th,.quick-table tr:last-child td{border-bottom:0}.elig-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.elig-grid>div{border:1px solid #dbe3ea;border-radius:7px;background:#f8fafc;padding:13px;color:#34495b}.elig-grid b{display:block;color:#083b66;margin-bottom:5px}.important-links-box{display:grid;gap:10px}.important-links-box a{display:flex;align-items:center;justify-content:center;padding:12px 14px;border-radius:7px;color:#fff;text-decoration:none;font-weight:900;font-size:14px}.task4-apply{background:#138a45}.task4-notice{background:#083b66}@media(max-width:560px){.quick-table th,.quick-table td{padding:9px;font-size:12px}.quick-table th{width:42%}.elig-grid{grid-template-columns:1fr}}';document.head.appendChild(s)}
  async function apply(){
    if(!db2) return false; style();
    const key=clean(id), cleanSlug=clean(slug); let q=db2.from('jobs').select('*').eq('published',true);
    q=key?q.eq('id',key):q.eq('slug',decodeURIComponent(cleanSlug));
    const {data:j,error}=await q.maybeSingle(); if(error||!j) return false;
    const app=document.getElementById('app'); if(!app) return false;
    const facts=app.querySelector('.facts');
    if(facts && !app.querySelector('.quick-info')){
      const rows=[['Department',j.department],['Last Date',j.last_date],['Total Posts',j.vacancies],['Application Fee',j.fee]];
      facts.outerHTML='<div class="quick-info" data-task4="1"><div class="quick-title">Quick Info</div><table class="quick-table"><tbody>'+rows.map(r=>'<tr><th>'+esc(r[0])+'</th><td>'+esc(r[1]||'Not specified')+'</td></tr>').join('')+'</tbody></table></div>';
    }
    const sections=[...app.querySelectorAll('.section')];
    const eligibility=sections.find(s=>/शैक्षणिक योग्यता|eligibility/i.test(s.querySelector('h2')?.textContent||''));
    if(eligibility && !eligibility.dataset.task4){
      eligibility.dataset.task4='1'; eligibility.querySelector('h2').textContent='Eligibility & Age Limit';
      const body=eligibility.querySelector('.section-body');
      body.innerHTML='<div class="elig-grid"><div><b>Educational Qualification</b><div>'+esc(j.qualification||'Not specified')+'</div></div><div><b>Age Limit</b><div>'+esc(j.age||'Not specified')+'</div></div></div>';
    }
    const links=sections.find(s=>/महत्वपूर्ण आधिकारिक लिंक|important links/i.test(s.querySelector('h2')?.textContent||''));
    if(links && !links.dataset.task4){
      links.dataset.task4='1'; links.querySelector('h2').textContent='Important Links';
      const body=links.querySelector('.section-body'), a=safeUrl(j.apply_url), n=safeUrl(j.notification_url);
      body.innerHTML='<div class="important-links-box">'+(a?'<a class="task4-apply" href="'+esc(a)+'" target="_blank" rel="noopener noreferrer">Apply Online ↗</a>':'')+(n?'<a class="task4-notice" href="'+esc(n)+'" target="_blank" rel="noopener noreferrer">Download Notification PDF ↗</a>':'')+(!a&&!n?'<div class="empty">Official links not available.</div>':'')+'</div>';
    }
    return true;
  }
  function start(){const timer=setInterval(async()=>{try{if(await apply())clearInterval(timer)}catch(e){}},300);setTimeout(()=>clearInterval(timer),15000)}
  start();
})();
