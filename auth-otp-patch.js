(function(){
  'use strict';
  function fixResetUi(){
    var link=document.getElementById('link');
    var rotp=document.getElementById('rotp');
    if(link){
      link.style.display='none';
      link.setAttribute('aria-hidden','true');
    }
    if(rotp){
      rotp.textContent='Send OTP';
      rotp.classList.add('primary');
    }
  }
  function fix(){
    fixResetUi();
    var form=document.getElementById('form');
    if(form && !form.dataset.ywOtpWatch){
      form.dataset.ywOtpWatch='1';
      new MutationObserver(fixResetUi).observe(form,{childList:true,subtree:true});
    }
  }
  new MutationObserver(fix).observe(document.body,{childList:true,subtree:true});
  setTimeout(fix,50);
})();
