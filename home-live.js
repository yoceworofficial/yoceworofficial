/* YOCEWOR HOME LIVE — final working homepage layer
   Keeps the reference homepage design, removes non-useful education/community items,
   and makes every public recruitment/category link point to the real YOCEWOR pages. */
(function(){
  'use strict';
  const U='https://mzntgjyecymcpzciklfk.supabase.co';
  const K='sb_publishable_AAXGC4EmiD4ELszpchz9Dw_Eryr6Usn';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=v=>String(v??'').toLowerCase().trim().replace(/[-\s]+/g,'_');
  const today=()=>new Date().toISOString().slice(0,10);
  const expired=j=>j.last_date&&String(j.last_date).slice(0,10)<today();
  const type=j=>norm(j.type);
  const isAnswer=j=>type(j)==='answer_key';
  const isJob=j=>['job','recruitment','latest_jobs','state_government_jobs','central_government_jobs','government_jobs'].includes(type(j)) || !type(j);
  const has=j=>['admit_card','admitcard','admit'].includes(type(j));
  const result=j=>['result','results','exam_result'].includes(type(j));
  const syllabus=j=>['syllabus','course_syllabus'].includes(type(j));
  const admission=j=>['admission','university_admission','college_admission'].includes(type(j));
  const answer=j=>['answer_key','answerkey'].includes(type(j));
  const detail=j=>j.slug?'job.html?slug='+encodeURIComponent(j.slug):'job.html?id='+encodeURIComponent(j.id||'');
  const hrefType=j=>isAnswer(j)?'answer-key-detail.html?'+(j.slug?'slug='+encodeURIComponent(j.slug):'id='+encodeURIComponent(j.id||'')):detail(j);

  function cleanHeader(){
    const top=document.querySelector('.top-right');
    if(top) top.innerHTML='<span class="lang" id="langBtn" onclick="toggleLang()">English⌄</span>';
    const account=document.querySelector('.account');
    if(account) account.innerHTML='<a href="about.html"><span aria-hidden="true">☰</span> More</a>';
    const nav=document.querySelector('.nav');
    if(nav){
      const items=[['index.html','home','Home'],['latest-jobs.html','briefcase','Latest Jobs'],['admit-card.html','idcard','Admit Card'],['result.html','file','Results'],['answer-key.html','key','Answer Key'],['syllabus.html','book','Syllabus'],['admission.html','university','Admission'],['important-notice.html','megaphone','Important'],['about.html',null,'More']];
      nav.innerHTML=items.map((x,i)=>'<a '+(i===0?'class="active" ':'')+'href="'+x[0]+'">'+(x[1]?'<svg><use href="#'+x[1]+'"/></svg>':'')+x[2]+'</a>').join('');
    }
    const heroLinks=document.querySelector('.hero-links');
    if(heroLinks) heroLinks.innerHTML=[['latest-jobs.html','Get Latest Jobs'],['result.html','Exam Results'],['admit-card.html','Admit Card'],['answer-key.html','Answer Key'],['syllabus.html','Syllabus'],['admission.html','Admission']].map(x=>'<a href="'+x[0]+'">'+x[1]+'</a>').join('');
    const join=document.querySelector('.join');
    if(join){join.textContent='Explore Jobs  →';join.onclick=()=>location.href='latest-jobs.html'}
    const sub=document.querySelector('.join-sub');if(sub)sub.textContent='Latest Government Jobs';
    const quick=document.querySelector('.quick');
    if(quick){
      const cards=[['q-blue','briefcase','Latest Jobs','Government Recruitment','latest-jobs.html'],['q-purple','idcard','Admit Card','Download & Exam Notice','admit-card.html'],['q-pink','file','Results','Exam Results & Merit','result.html'],['q-green','book','Syllabus','Exam Syllabus Updates','syllabus.html'],['q-orange','key','Answer Key','Official Answer Keys','answer-key.html'],['q-cyan','university','Admission','UG / PG Admission','admission.html']];
      quick.innerHTML=cards.map(c=>'<a class="quick-card '+c[0]+'" href="'+c[4]+'"><span class="qicon"><svg><use href="#'+c[1]+'"/></svg></span><span><h3>'+c[2]+'</h3><p>'+c[3]+'</p></span><svg style="margin-left:auto;width:20px"><use href="#arrow"/></svg></a>').join('');
    }
    const cols=document.querySelectorAll('.columns .column');
    const specs=[['briefcase','Latest Jobs','head-blue','jobsCol1','latest-jobs.html'],['idcard','Admit Card','head-purple','admitCol','admit-card.html'],['file','Results','head-pink','resultCol','result.html'],['book','Syllabus','head-green','syllabusCol','syllabus.html'],['key','Answer Key','head-orange','answerCol','answer-key.html'],['university','Admission','head-purple','admissionCol','admission.html']];
    cols.forEach((col,i)=>{const s=specs[i];if(!s)return;const h=col.querySelector('.column-head'),list=col.querySelector('.job-list'),btn=col.querySelector('.viewmore');if(h)h.innerHTML='<svg><use href="#'+s[0]+'"/></svg>'+s[1]+(i===0?' <span style="background:#f23d69;border-radius:10px;padding:2px 6px;font-size:9px">LIVE</span>':'');if(list)list.id=s[3];if(btn){btn.textContent='View More  →';btn.onclick=()=>location.href=s[4]}});
  }
  function fill(id,list){const box=document.getElementById(id);if(!box)return;box.innerHTML=list.length?list.slice(0,10).map(j=>'<li><a href="'+hrefType(j)+'">'+esc(j.title||'Untitled Update')+'</a></li>').join(''):'<li class="empty-mini">अभी कोई update उपलब्ध नहीं है।</li>';}
  function updateTicker(rows){const box=document.getElementById('tickerItems');if(!box)return;const ordered=rows.filter(j=>!expired(j)&&!isAnswer(j)).slice(0,8);box.innerHTML=ordered.length?ordered.map(j=>'<a href="'+detail(j)+'">'+esc(j.title||'Latest Update')+(j.last_date?' • Last Date: '+esc(j.last_date):'')+'</a>').join(''):'<a href="latest-jobs.html">Latest Jobs Updates</a>';}
  async function load(){
    try{
      const fields='id,title,slug,type,department,start_date,last_date,qualification,vacancies,age,salary,description,apply_url,notification_url,created_at,updated_at,publish_date,published_at,published';
      const url=U+'/rest/v1/jobs?select='+encodeURIComponent(fields)+'&published=eq.true&order=updated_at.desc,created_at.desc&limit=1000';
      const r=await fetch(url,{headers:{apikey:K,Accept:'application/json'},cache:'no-store',credentials:'omit'});if(!r.ok)throw new Error('Supabase HTTP '+r.status);
      const rows=await r.json();if(!Array.isArray(rows))throw new Error('Invalid jobs response');
      const active=rows.filter(j=>!expired(j));
      fill('jobsCol1',active.filter(isJob));fill('admitCol',active.filter(has));fill('resultCol',active.filter(result));fill('syllabusCol',active.filter(syllabus));fill('answerCol',active.filter(answer));fill('admissionCol',active.filter(admission));updateTicker(rows);
      const latest=document.querySelector('.latest-title');if(latest)latest.innerHTML='<svg><use href="#fire"/></svg>Latest Updates';
      const view=document.querySelector('.viewall');if(view){view.href='latest-jobs.html';view.textContent='View All Jobs  →'}
    }catch(e){console.error('YOCEWOR homepage loader:',e);['jobsCol1','admitCol','resultCol','syllabusCol','answerCol','admissionCol'].forEach(id=>{const b=document.getElementById(id);if(b&&/loading/i.test(b.textContent))b.innerHTML='<li class="empty-mini">Update अभी load नहीं हो सका। Refresh करें।</li>'});}
  }
  function addWorkingSearch(){const form=document.querySelector('form.search');if(!form)return;form.onsubmit=function(){const q=(document.getElementById('searchInput')?.value||'').trim();location.href=q?'latest-jobs.html?q='+encodeURIComponent(q):'latest-jobs.html';return false};}
  function infoCenter(){
    if(document.getElementById('yocewor-info-center'))return;const footer=document.querySelector('.footer');if(!footer)return;
    const el=document.createElement('section');el.id='yocewor-info-center';el.className='yo-info-center';
    el.innerHTML='<div class="wrap"><section class="yo-info-intro"><div><span class="yo-kicker">🇮🇳 YOCEWOR INFORMATION CENTER</span><h2>YOCEWOR — सही जानकारी, सही समय पर</h2><p>सरकारी नौकरी, भर्ती, एडमिट कार्ड, रिजल्ट, Answer Key, Syllabus और Admission updates को category-wise एक जगह उपलब्ध कराने का प्रयास।</p></div><div class="yo-trust-badge"><b>🛡️ Official Source First</b><span>आवेदन या परीक्षा से पहले संबंधित विभाग की official notification जरूर देखें।</span></div></section><div class="yo-info-grid"><section class="yo-info-card"><h3>📌 Useful Sections</h3><div class="yo-mini-links"><a href="latest-jobs.html">💼 Latest Jobs</a><a href="admit-card.html">🎫 Admit Card</a><a href="result.html">📊 Results</a><a href="answer-key.html">🔑 Answer Key</a><a href="syllabus.html">📚 Syllabus</a><a href="admission.html">🎓 Admission</a></div></section><section class="yo-info-card"><h3>✅ Verification Guide</h3><ul><li>Vacancy और eligibility official notification से मिलाएँ।</li><li>Apply करने के लिए official department link को प्राथमिकता दें।</li><li>Fee, dates, documents और selection process verify करें।</li><li>Answer Key और Result के लिए official source check करें।</li></ul></section><section class="yo-info-card"><h3>📰 YOCEWOR क्या देता है?</h3><p>Compact category-wise navigation, recruitment summaries, official links और exam-related updates ताकि जरूरी जानकारी जल्दी मिले।</p></section></div><section class="yo-faq"><div class="yo-faq-head"><div><span class="yo-kicker">HELP & FAQ</span><h2>अक्सर पूछे जाने वाले सवाल</h2></div><span>Useful answers</span></div><div class="yo-faq-grid"><details><summary>क्या YOCEWOR सरकारी वेबसाइट है?</summary><p>नहीं। YOCEWOR एक स्वतंत्र information portal है। Final authority संबंधित सरकारी विभाग या परीक्षा संस्था की official notification है।</p></details><details><summary>Latest Jobs में क्या दिखता है?</summary><p>Latest Jobs में केवल published job/recruitment records दिखाए जाते हैं। Answer Key, Result और अन्य categories अलग रखी जाती हैं।</p></details><details><summary>Answer Key कहाँ मिलेगी?</summary><p>Answer Key का अलग section है और उसे Latest Jobs में नहीं मिलाया जाता।</p></details><details><summary>Vacancy और eligibility कहाँ verify करें?</summary><p>YOCEWOR summary के साथ संबंधित department की official notification जरूर देखें।</p></details><details><summary>क्या YOCEWOR आवेदन जमा करता है?</summary><p>नहीं। Application संबंधित संस्था की official website पर होता है। YOCEWOR उपलब्ध official links तक पहुंच आसान करता है।</p></details><details><summary>गलत जानकारी मिले तो?</summary><p>Contact page से correction/feedback भेजें ताकि content review किया जा सके।</p></details></div></section></div>';
    footer.parentNode.insertBefore(el,footer);
  }
  function boot(){cleanHeader();addWorkingSearch();infoCenter();load();setInterval(load,30000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();