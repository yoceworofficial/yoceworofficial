/* YOCEWOR HOME LIVE — stable homepage renderer v2 */
(function(){
'use strict';
const U='https://mzntgjyecymcpzciklfk.supabase.co';
const K='sb_publishable_AAXGC4EmiD4ELszpchz9Dw_Eryr6Usn';
const F='id,title,type,slug,department,last_date,vacancies,apply_url,published,updated_at,created_at,date_posted,publish_date,published_at';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=t=>String(t||'').toLowerCase().trim().replace(/[-\s]+/g,'_');
const isAnswer=j=>norm(j.type)==='answer_key';
const isJob=j=>['job','recruitment','latest_jobs','state_government_jobs','central_government_jobs','government_jobs'].includes(norm(j.type));
const isType=(j,words)=>{const s=norm(j.type)+' '+String(j.title||'').toLowerCase();return words.some(w=>s.includes(w));};
const date=d=>{if(!d)return'—';const a=String(d).split('-');return a.length===3?`${a[2]}-${a[1]}-${a[0]}`:esc(d)};
const detail=j=>j.slug?'/'+encodeURIComponent(j.slug)+'/':'job-details.html?id='+encodeURIComponent(j.id||'');
function jobCard(j,label='पूरी जानकारी →'){
 const apply=j.apply_url?'<a class="btn green home-apply" href="'+esc(j.apply_url)+'" target="_blank" rel="noopener">Apply ↗</a>':'';
 return '<article class="item home-job"><div class="item-main"><div class="item-title">'+esc(j.title||'Government Update')+'</div><div class="job-mini"><span>📌 '+esc(j.department||'YOCEWOR')+'</span><span>👥 '+esc(j.vacancies??'—')+' Posts</span><span>📅 '+date(j.last_date)+'</span></div></div><div class="item-actions"><a class="btn home-details" href="'+detail(j)+'">'+esc(label)+'</a>'+apply+'</div></article>';
}
function renderList(id,rows,label){const box=document.getElementById(id);if(!box)return;box.innerHTML=rows.length?rows.slice(0,8).map(j=>jobCard(j,label)).join(''):'<div class="empty">अभी कोई प्रकाशित update उपलब्ध नहीं है।</div>';}
function social(){
 document.querySelectorAll('.social a').forEach(a=>{if(a.dataset.yoceworHomeIcon)return;const t=(a.textContent||'').toLowerCase();const type=t.includes('telegram')?'tg':t.includes('instagram')?'ig':'wa';const label=t.includes('whatsapp')?(t.includes('channel')?'WhatsApp Channel':'WhatsApp Group'):type==='tg'?'Telegram':'Instagram';const icon=type==='tg'?'➤':type==='ig'?'◎':'◉';a.innerHTML='<span aria-hidden="true">'+icon+'</span><span>'+label+'</span>';a.dataset.yoceworHomeIcon='1';});
}
function css(){if(document.getElementById('yocewor-home-live-v2-style'))return;const s=document.createElement('style');s.id='yocewor-home-live-v2-style';s.textContent=`
.social a{display:inline-flex!important;align-items:center!important;gap:6px!important}.social a>span:first-child{font-weight:900}.home-details{background:#087fbd!important;color:#fff!important}.home-apply{background:#07945f!important;color:#fff!important}.home-job{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;gap:8px!important;padding:9px 10px!important}.home-job .item-title{font-size:12px!important;line-height:1.4!important}.home-job .job-mini{display:flex!important;flex-wrap:wrap!important;gap:3px 12px!important;margin-top:3px!important;font-size:9px!important;color:#657d8e!important}.home-job .item-actions{display:flex!important;gap:5px!important;flex-wrap:nowrap!important;margin:0!important}.home-job .item-actions .btn{font-size:9px!important;padding:7px 9px!important;border-radius:7px!important;white-space:nowrap!important}.home-job .new,.home-job .orange{display:none!important}
@media(max-width:560px){.home-job{min-height:52px!important;padding:7px 8px!important}.home-job .item-title{font-size:10.5px!important}.home-job .job-mini{font-size:8px!important;gap:2px 7px!important}.home-job .item-actions .btn{font-size:8px!important;padding:6px 7px!important}}
`;document.head.appendChild(s)}
async function load(){
 try{
  const r=await fetch(U+'/rest/v1/jobs?select='+encodeURIComponent(F)+'&published=eq.true&order=updated_at.desc,created_at.desc&limit=1000',{headers:{apikey:K,Authorization:'Bearer '+K,Accept:'application/json'},cache:'no-store'});
  if(!r.ok)throw Error('Supabase HTTP '+r.status);
  const all=await r.json();
  const rows=Array.isArray(all)?all:[];
  const jobs=rows.filter(isJob);
  const active=jobs.filter(j=>!j.last_date||new Date(j.last_date+'T23:59:59')>=new Date());
  const showJobs=(active.length?active:jobs).slice(0,8);
  const updates=rows.filter(j=>!isAnswer(j)).slice(0,8);
  const admit=rows.filter(j=>isType(j,['admit_card','admit','hall','प्रवेश']));
  const result=rows.filter(j=>isType(j,['result','रिजल्ट']));
  const syllabus=rows.filter(j=>isType(j,['syllabus','सिलेबस']));
  const admission=rows.filter(j=>isType(j,['admission','प्रवेश_','admission']));
  renderList('jobList',showJobs,'पूरी जानकारी →');
  renderList('updateList',updates,'Update देखें →');
  renderList('admitList',admit,'Admit Card →');
  renderList('resultList',result,'Result देखें →');
  renderList('syllabusList',syllabus,'Syllabus →');
  renderList('admissionList',admission,'Admission →');
  const track=document.getElementById('tickerTrack');
  if(track){const t=updates.slice(0,8).map(j=>'<a href="'+detail(j)+'">🔥 '+esc(j.title||'Latest Update')+' • '+date(j.last_date)+'</a>').join('');track.innerHTML=t?t+t:'<span>YOCEWOR पर नवीनतम अपडेट जल्द दिखाई देंगे।</span>';track.classList.toggle('live-scroll',!!t)}
  const hs=document.querySelector('.hero-stats');if(hs){const n=jobs.length;const first=hs.querySelector('.hero-stat strong');if(first)first.textContent=n+'+';}
  social();css();
 }catch(e){console.error('YOCEWOR home live v2:',e);social();css();}
}
function init(){load();setInterval(load,20000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();