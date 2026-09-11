/* YOCEWOR HOME LIVE — stable homepage renderer v3 */
(function(){
'use strict';
const U='https://mzntgjyecymcpzciklfk.supabase.co';
const K='sb_publishable_AAXGC4EmiD4ELszpchz9Dw_Eryr6Usn';
const F='id,title,type,slug,department,last_date,vacancies,apply_url,published,updated_at,created_at,date_posted,publish_date,published_at';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=t=>String(t||'').toLowerCase().trim().replace(/[-\s]+/g,'_');
const isAnswer=j=>norm(j.type)==='answer_key';
const isJob=j=>['job','recruitment','latest_jobs','state_government_jobs','central_government_jobs','government_jobs'].includes(norm(j.type));
const typeText=j=>norm(j.type)+' '+String(j.title||'').toLowerCase();
const hasType=(j,words)=>words.some(w=>typeText(j).includes(w));
const date=d=>{if(!d)return'—';const a=String(d).split('-');return a.length===3?`${a[2]}-${a[1]}-${a[0]}`:esc(d)};
const detail=j=>j.slug?'/'+encodeURIComponent(j.slug)+'/':'job-details.html?id='+encodeURIComponent(j.id||'');
function jobCard(j,label='पूरी जानकारी →'){
 const apply=j.apply_url?'<a class="btn green home-apply" href="'+esc(j.apply_url)+'" target="_blank" rel="noopener">Official Apply ↗</a>':'';
 return '<article class="item home-job"><div class="item-main"><div class="item-title">'+esc(j.title||'Government Update')+'</div><div class="job-mini"><span>📌 '+esc(j.department||'YOCEWOR')+'</span><span>👥 '+esc(j.vacancies??'—')+' Posts</span><span>📅 '+date(j.last_date)+'</span></div></div><div class="item-actions"><a class="btn home-details" href="'+detail(j)+'">'+esc(label)+'</a>'+apply+'</div></article>';
}
function renderList(id,rows,label,emptyText){
 const box=document.getElementById(id);if(!box)return;
 box.innerHTML=rows.length?rows.slice(0,8).map(j=>jobCard(j,label)).join(''):'<div class="empty">'+esc(emptyText)+'</div>';
}
function setSection(id,rows){
 const section=document.getElementById(id);if(!section)return;
 const visible=rows.length>0;
 section.hidden=!visible;
 const link=document.querySelector('[href="#'+id+'"]');if(link)link.closest('a')?.setAttribute('aria-hidden',visible?'false':'true');
}
function social(){document.querySelectorAll('.social a').forEach(a=>{if(a.dataset.yoceworHomeIcon)return;const t=(a.textContent||'').toLowerCase();const type=t.includes('telegram')?'tg':t.includes('instagram')?'ig':'wa';const label=t.includes('whatsapp')?(t.includes('channel')?'WhatsApp Channel':'WhatsApp Group'):type==='tg'?'Telegram':'Instagram';const icon=type==='tg'?'➤':type==='ig'?'◎':'◉';a.innerHTML='<span aria-hidden="true">'+icon+'</span><span>'+label+'</span>';a.dataset.yoceworHomeIcon='1';});}
function css(){if(document.getElementById('yocewor-home-live-v3-style'))return;const s=document.createElement('style');s.id='yocewor-home-live-v3-style';s.textContent=`
.home-job{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;gap:8px!important;padding:10px!important}.home-job .item-title{font-size:12px!important;line-height:1.45!important}.home-job .job-mini{display:flex!important;flex-wrap:wrap!important;gap:3px 12px!important;margin-top:3px!important;font-size:9px!important;color:#657d8e!important}.home-job .item-actions{display:flex!important;gap:5px!important;flex-wrap:wrap!important;margin:0!important}.home-job .item-actions .btn{font-size:9px!important;padding:7px 9px!important;border-radius:7px!important;white-space:nowrap!important}.home-details{background:#087fbd!important;color:#fff!important}.home-apply{background:#07945f!important;color:#fff!important}.home-job .new,.home-job .orange{display:none!important}
[hidden]{display:none!important}@media(max-width:560px){.home-job{grid-template-columns:1fr!important}.home-job .item-actions{margin-top:5px!important}.home-job .item-title{font-size:11px!important}.home-job .job-mini{font-size:8px!important;gap:2px 7px!important}}
`;document.head.appendChild(s)}
async function load(){
 try{
  const r=await fetch(U+'/rest/v1/jobs?select='+encodeURIComponent(F)+'&published=eq.true&order=updated_at.desc,created_at.desc&limit=1000',{headers:{apikey:K,Authorization:'Bearer '+K,Accept:'application/json'},cache:'no-store'});
  if(!r.ok)throw Error('Supabase HTTP '+r.status);
  const rows=await r.json();
  const all=Array.isArray(rows)?rows:[];
  const jobs=all.filter(isJob);
  const active=jobs.filter(j=>!j.last_date||new Date(j.last_date+'T23:59:59')>=new Date());
  const showJobs=(active.length?active:jobs).slice(0,8);
  const updates=all.filter(j=>!isAnswer(j)).slice(0,8);
  const admit=all.filter(j=>hasType(j,['admit_card','admit','hall','प्रवेश']));
  const result=all.filter(j=>hasType(j,['result','रिजल्ट']));
  const syllabus=all.filter(j=>hasType(j,['syllabus','सिलेबस']));
  const admission=all.filter(j=>hasType(j,['admission']));
  renderList('jobList',showJobs,'पूरी जानकारी →','अभी कोई प्रकाशित भर्ती उपलब्ध नहीं है।');
  renderList('updateList',updates,'Update देखें →','अभी कोई नवीनतम update उपलब्ध नहीं है।');
  renderList('admitList',admit,'Admit Card →','अभी कोई Admit Card update उपलब्ध नहीं है।');
  renderList('resultList',result,'Result देखें →','अभी कोई Result update उपलब्ध नहीं है।');
  renderList('syllabusList',syllabus,'Syllabus →','अभी कोई Syllabus update उपलब्ध नहीं है।');
  renderList('admissionList',admission,'Admission →','अभी कोई Admission update उपलब्ध नहीं है।');
  setSection('admit',admit);setSection('result',result);setSection('syllabus',syllabus);setSection('admission',admission);
  const track=document.getElementById('tickerTrack');
  if(track){const t=updates.slice(0,8).map(j=>'<a href="'+detail(j)+'">🔥 '+esc(j.title||'Latest Update')+' • '+date(j.last_date)+'</a>').join('');track.innerHTML=t||'<span>YOCEWOR पर नवीनतम अपडेट देखें।</span>';track.classList.toggle('live-scroll',!!t);}
  social();css();
 }catch(e){
  console.error('YOCEWOR home live v3:',e);social();css();
  ['jobList','updateList','admitList','resultList','syllabusList','admissionList'].forEach(id=>{const b=document.getElementById(id);if(b)b.innerHTML='<div class="empty">Live updates अभी उपलब्ध नहीं हो सके। कृपया थोड़ी देर बाद फिर देखें।</div>';});
 }
}
function init(){load();setInterval(load,20000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();