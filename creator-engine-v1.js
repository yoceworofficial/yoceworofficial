(function(){'use strict';
function addCreatorEntry(){
  if(document.getElementById('yoceworCreatorEntry')) return true;
  const candidates=[...document.querySelectorAll('button,a')];
  const anchor=candidates.find(x=>/create|creator|studio|post/i.test((x.textContent||'').trim()));
  const el=document.createElement('button');
  el.id='yoceworCreatorEntry';
  el.type='button';
  el.textContent='🎬 Creator Studio';
  el.style.cssText='position:fixed;right:16px;bottom:18px;z-index:99999;border:0;border-radius:14px;padding:12px 16px;font:800 14px system-ui;color:#fff;background:linear-gradient(100deg,#ff6a00,#ff2f7e);box-shadow:0 12px 35px rgba(0,0,0,.35);cursor:pointer';
  el.onclick=function(){location.href='creator-engine.html?v=20260815-1'};
  if(anchor&&anchor.parentElement){anchor.parentElement.appendChild(el)}else document.body.appendChild(el);
  return true;
}
let tries=0;const timer=setInterval(()=>{if(addCreatorEntry()||++tries>30)clearInterval(timer)},500);
})();
