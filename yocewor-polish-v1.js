(()=>{
'use strict';
const ICONS={
 home:'<svg viewBox="0 0 24 24"><path d="M3 10.8 12 3l9 7.8V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
 explore:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m16.2 16.2 4.3 4.3M11 7v4l3 2"/></svg>',
 reels:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m9 4 3 4m3-4 3 4M9 12l6 4-6 4z"/></svg>',
 messages:'<svg viewBox="0 0 24 24"><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.5 8.5 0 0 1-4-.9L4 20l1.8-3.4A7.4 7.4 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/></svg>',
 notifications:'<svg viewBox="0 0 24 24"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/></svg>',
 profile:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/></svg>',
 settings:'<svg viewBox="0 0 24 24"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="m19 13 2-1-2-1-.4-1.5 1.1-1.8-1.8-1.8-1.8 1.1-1.5-.4-1-2-1 2-1.5.4-1.8-1.1-1.8 1.8 1.1 1.8L5 10l-2 1 2 1 .4 1.5-1.1 1.8 1.8 1.8 1.8-1.1 1.5.4 1 2 1-2 1.5-.4 1.8 1.1 1.8-1.8-1.1-1.8Z"/></svg>',
 plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
 search:'<svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>',
 bell:'<svg viewBox="0 0 24 24"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/></svg>',
 moon:'<svg viewBox="0 0 24 24"><path d="M20 15.2A8.2 8.2 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z"/></svg>',
 check:'<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>',
 arrow:'<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
};
const css=`
:root{--yo-bg:#070910;--yo-surface:#0d111b;--yo-surface2:#121827;--yo-line:#252d3d;--yo-text:#f7f8fb;--yo-muted:#8e99ad;--yo-accent:#ff4f8b;--yo-accent2:#7c5cff;--yo-cyan:#35c8ff;--yo-radius:18px}
html,body{background:radial-gradient(900px 500px at 80% -10%,#3b176055,transparent 65%),radial-gradient(700px 500px at -10% 20%,#163c5950,transparent 65%),var(--yo-bg)!important;color:var(--yo-text)!important}
body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
.top{height:72px!important;background:#070910d9!important;border-bottom:1px solid #20283a!important;backdrop-filter:blur(22px)!important}
.card{background:linear-gradient(180deg,#101624f2,#0b1019f2)!important;border-color:var(--yo-line)!important;border-radius:var(--yo-radius)!important;box-shadow:0 18px 60px #0006!important}
.btn{border-radius:12px!important;border-color:#2a3448!important;background:#121a29!important;transition:.18s!important}.btn:hover{transform:translateY(-1px);border-color:#45526c!important}.btn.primary{background:linear-gradient(100deg,#ff477f,#7b5cff)!important;box-shadow:0 10px 28px #ff477f25!important}
.icon{border-radius:12px!important;background:#101725!important;color:#aeb8ca!important}.icon:hover{background:#182236!important;color:#fff!important}.icon svg,.nav svg,.action svg,.bottom svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.brand{letter-spacing:-.3px!important}.brand img{border-radius:13px!important}
.nav{padding:11px 12px!important;border-radius:12px!important;color:#929db1!important;gap:12px!important}.nav:hover,.nav.active{background:#141c2b!important;color:#fff!important}.nav b{width:24px;display:grid;place-items:center}.nav span{font-size:14px!important}
.composer{border-radius:18px!important}.field,.select{background:#0d1421!important;border-color:#283347!important;border-radius:12px!important}
.action{border-radius:10px!important}.action:hover{background:#141d2d!important}
.tabs{scrollbar-width:none}.tab{background:#0d1421!important;border-color:#263248!important}.tab.active{background:#fff!important;color:#080b12!important}
.reel{border:1px solid #222c3d!important}.reelcap{background:#070b12bf!important}
.storyring{background:linear-gradient(135deg,#ff477f,#7b5cff,#35c8ff)!important}
.bottom{background:#0c121df2!important;border-color:#263146!important;box-shadow:0 10px 40px #0008!important}.bottom button{color:#758198!important}.bottom button.active{color:#fff!important}
.toast{background:#f7f8fb!important;color:#080b12!important}
.splash{background:radial-gradient(circle at 50% 30%,#251a4a 0,transparent 42%),#05070c!important}
.splashLogo{filter:drop-shadow(0 16px 45px #000)!important}
/* premium navigation labels: icons are consistent inline SVGs, never emoji */
.yo-nav-icon{width:24px;height:24px;display:grid;place-items:center;flex:none}.yo-nav-icon svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.yo-section-title{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#657087;font-weight:800;margin:20px 12px 8px}
.yo-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 8px;border-radius:999px;background:#18243a;color:#aebed8;font-size:11px;font-weight:800}.yo-badge svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2}
`;
function install(){if(document.getElementById('yocewor-polish-style'))return;const s=document.createElement('style');s.id='yocewor-polish-style';s.textContent=css;document.head.appendChild(s);upgradeNav();upgradeActions();document.documentElement.dataset.yoceworPolished='true';}
function upgradeNav(){document.querySelectorAll('.nav').forEach((el)=>{if(el.dataset.yoIcon)return;const text=el.querySelector('span')?.textContent?.trim().toLowerCase()||el.textContent.trim().toLowerCase();let key=text.includes('home')||text.includes('होम')?'home':text.includes('explore')||text.includes('एक्सप्लोर')?'explore':text.includes('reel')||text.includes('रील')?'reels':text.includes('message')||text.includes('मैसेज')?'messages':text.includes('notification')||text.includes('नोटिफ')?'notifications':text.includes('profile')||text.includes('प्रोफ')?'profile':text.includes('setting')||text.includes('सेटिंग')?'settings':null;if(key&&ICONS[key]){const old=el.querySelector('b');if(old)old.innerHTML=ICONS[key];else{const i=document.createElement('b');i.className='yo-nav-icon';i.innerHTML=ICONS[key];el.prepend(i)}}el.dataset.yoIcon='1';});}
function upgradeActions(){document.querySelectorAll('.action,.bottom button').forEach(el=>{if(el.dataset.yoPolish)return;const t=(el.textContent||'').trim().toLowerCase();if(t==='search'||t.includes('search'))el.innerHTML=ICONS.search+'<span>'+el.textContent+'</span>';el.dataset.yoPolish='1';});}
const obs=new MutationObserver(()=>{upgradeNav();upgradeActions();});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();obs.observe(document.documentElement,{childList:true,subtree:true});
})();
