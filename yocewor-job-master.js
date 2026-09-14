(()=>{'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=s=>String(s??'').replace(/\\r/g,'').replace(/\\n/g,'\n').trim();
const text=x=>clean(x?.textContent||'');
const norm=s=>text(s).toLowerCase().replace(/\s+/g,' ');
function findSection(root,terms){return [...root.querySelectorAll('.section')].find(s=>{const h=s.querySelector('h2,h3');const t=norm(h);return terms.some(k=>t.includes(k))})}
function sectionBody(s){if(!s)return '';const h=s.querySelector('h2,h3');const clone=s.cloneNode(true);clone.querySelectorAll('h2,h3').forEach(x=>x.remove());return clone.innerHTML.trim()}
function findText(root,terms){const s=findSection(root,terms);return s?sectionBody(s):''}
function firstValue(root,terms){const s=findSection(root,terms);if(!s)return '';const nodes=[...s.querySelectorAll('td,li,p,.info-box')].filter(x=>text(x));return nodes.length?nodes.map(text).join('\n'):sectionBody(s)}
function links(root){return [...root.querySelectorAll('a[href]')].filter(a=>/^https?:/i.test(a.href)).map(a=>({label:text(a),href:a.href})).filter((x,i,a)=>a.findIndex(y=>y.href===x.href)===i)}
function pickLink(ls,terms){return ls.find(x=>terms.some(k=>x.label.toLowerCase().includes(k)))||null}
function master(){if(!/job\.html$/.test(location.pathname))return;const app=document.getElementById('app');if(!app||app.dataset.masterBuilt==='1')return;const h1=app.querySelector('.doc-title h1,h1');if(!h1||/loading/i.test(text(h1)))return;const title=text(h1);const all=app.cloneNode(true);const summary=all.querySelector('.doc-title p')?.innerHTML||'';const sections=[...all.querySelectorAll('.section')];const department=(sections[0]?.querySelector('h2')?.textContent||'YOCEWOR Government Job Notification').trim().replace(/^📌\s*/,'');
const dates=findText(all,['important dates','important date','exam date','application date']);
const fee=findText(all,['application fee','application fees','exam fee']);
const age=findText(all,['age limit','age-limit','आयु सीमा']);
const vacancySec=findSection(all,['vacancy details','total vacancy','vacancy']);
const eligibility=findText(all,['eligibility','qualification','educational qualification','योग्यता']);
let vacancy=vacancySec?sectionBody(vacancySec):'';
if(vacancySec){const hs=[...vacancySec.querySelectorAll('h3')];if(hs.length){vacancy=hs.map(x=>'<p><b>'+esc(text(x))+'</b></p>').join('')+hs.map(x=>{let n=x.nextElementSibling,s='';while(n&&n.tagName!=='H3'&&n.tagName!=='H2'){s+=n.outerHTML;n=n.nextElementSibling}return s}).join('')}}
const ls=links(all);const apply=pickLink(ls,['apply online','apply now','online apply']);const notification=pickLink(ls,['notification','download notification','advertisement']);const official=pickLink(ls,['official website','official site','website']);
const total=(vacancySec?.querySelector('.summary')?.textContent.match(/total\s*(?:post|vacancy)?\s*[:\-]?\s*([\d,]+)/i)?.[1])||'';
const postText=vacancySec?[...vacancySec.querySelectorAll('tr')].map(tr=>text(tr)).filter(Boolean).slice(0,12).join('<br>'):'';
const post=postText||'See vacancy details below';
const appMain=app.closest('.page')||app.parentElement;appMain.className='wrap';appMain.innerHTML='';const wrap=document.createElement('div');wrap.className='yo-job-master';wrap.innerHTML='<div class="yo-job-title"><h1>'+esc(title)+'</h1>'+(summary?'<p><b>Short Information:</b> '+summary+'</p>':'')+'</div><table class="yo-master-table"><tr><td colspan="2" class="yo-dept">'+esc(department)+'</td></tr><tr><td class="yo-head" style="width:50%">Important Dates</td><td class="yo-head" style="width:50%">Application Fee</td></tr><tr class="yo-two-col"><td>'+ (dates||'<p>See official notification for important dates.</p>')+'</td><td>'+ (fee||'<p>See official notification for application fee.</p>')+'</td></tr><tr><td colspan="2" class="yo-head">Age Limit</td></tr><tr><td colspan="2" style="text-align:center">'+(age||'<p>See official notification for age limit and relaxation.</p>')+'</td></tr><tr><td colspan="2" class="yo-blue-head">Vacancy Details'+(total?' (Total Post: '+esc(total)+')':'')+'</td></tr><tr><td class="yo-subhead">Post Name / Total Post</td><td class="yo-subhead">Eligibility / Qualification</td></tr><tr class="yo-two-col"><td style="text-align:center;font-weight:700">'+post+'</td><td>'+(eligibility||'<p>See official notification for eligibility and qualification.</p>')+'</td></tr><tr><td colspan="2" class="yo-blue-head">Interested Candidates Can Read the Full Notification Before Apply Online</td></tr><tr><td colspan="2" class="yo-head">Important Direct Links</td></tr>'+linkRow('Apply Online',apply)+linkRow('Download Notification',notification)+linkRow('Official Website',official)+'</table>';
appMain.appendChild(wrap);app.dataset.masterBuilt='1';
function linkRow(label,item){return '<tr><td class="yo-direct-link">'+label+'</td><td class="yo-direct-link">'+(item?'<a href="'+esc(item.href)+'" target="_blank" rel="noopener">Click Here</a>':'<span>Not available</span>')+'</td></tr>'}
}
function run(){master()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{run();setTimeout(run,500);setTimeout(run,1200);setTimeout(run,2200);setTimeout(run,4000)});else{run();setTimeout(run,500);setTimeout(run,1200);setTimeout(run,2200);setTimeout(run,4000)}})();
