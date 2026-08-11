(function(){
  'use strict';
  function goSettings(){
    try{
      if(typeof route==='function') route('settings');
    }catch(e){ console.error(e); }
  }
  function patchProfile(){
    var card=document.querySelector('#page .profile');
    if(!card) return;
    var first=card.querySelector(':scope > .row');
    if(!first) return;

    first.querySelectorAll('button').forEach(function(btn){
      var txt=(btn.textContent||'').trim();
      var label=(btn.getAttribute('aria-label')||'').toLowerCase();
      if(txt==='‹'||txt==='←'||txt==='↩'||label==='back'||label==='home') btn.remove();
    });

    var old=first.querySelector('#profileSettingsV1');
    if(old) return;

    var b=document.createElement('button');
    b.type='button';
    b.id='profileSettingsV1';
    b.className='icon';
    b.setAttribute('aria-label','Settings');
    b.title='Settings';
    b.textContent='⚙';
    b.style.marginLeft='auto';
    b.style.width='44px';
    b.style.height='44px';
    b.style.fontSize='20px';
    b.style.flex='0 0 44px';
    b.addEventListener('click',goSettings);
    first.appendChild(b);
  }
  function start(){
    patchProfile();
    var root=document.getElementById('root');
    if(root){
      new MutationObserver(function(){ patchProfile(); }).observe(root,{childList:true,subtree:true});
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
