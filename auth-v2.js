(function(){'use strict';
function q(s){return document.querySelector(s)}
function msg(x){if(typeof toast==='function')toast(x);else console.log(x)}
function addAuthMethods(){
  try{
    if(typeof db==='undefined')return;
    const root=document.body;
    const email=root.querySelector('input[type="email"]');
    if(!email||root.querySelector('#yoceworAuthMethods'))return;
    const password=root.querySelector('input[type="password"]');
    const host=password?.parentElement||email.parentElement;if(!host)return;
    const box=document.createElement('div');box.id='yoceworAuthMethods';box.style.cssText='margin-top:14px;padding-top:14px;border-top:1px solid var(--line,#2b3047)';
    box.innerHTML='<div style="font-size:12px;color:#a7acc1;margin-bottom:9px">YOCEWOR login options</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button type="button" class="btn" id="ywEmailOtp">Email OTP</button><button type="button" class="btn" id="ywPhoneOtp">Phone OTP</button><button type="button" class="btn" id="ywGoogle">Google</button><button type="button" class="btn" id="ywFacebook">Facebook</button></div><div id="ywAuthStatus" class="tiny muted" style="margin-top:9px"></div>';
    host.appendChild(box);
    const status=x=>{const n=q('#ywAuthStatus');if(n)n.textContent=x};
    async function otp(kind){
      const value=kind==='phone'?prompt('Mobile number with country code, e.g. +919876543210'):email.value.trim();
      if(!value)return;
      status('Sending OTP…');
      const r=kind==='phone'?await db.auth.signInWithOtp({phone:value,options:{shouldCreateUser:true}}):await db.auth.signInWithOtp({email:value,options:{shouldCreateUser:true}});
      if(r.error){status(r.error.message);return msg(r.error.message)}
      const code=prompt('OTP sent. Enter the OTP:');if(!code)return;
      const v=kind==='phone'?await db.auth.verifyOtp({phone:value,token:code,type:'sms'}):await db.auth.verifyOtp({email:value,token:code,type:'email'});
      if(v.error){status(v.error.message);return msg(v.error.message)}
      status('Verified. Loading…');if(typeof boot==='function')boot();
    }
    q('#ywEmailOtp').onclick=()=>otp('email');q('#ywPhoneOtp').onclick=()=>otp('phone');
    q('#ywGoogle').onclick=async()=>{const r=await db.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.href}});if(r.error)msg(r.error.message)};
    q('#ywFacebook').onclick=async()=>{const r=await db.auth.signInWithOAuth({provider:'facebook',options:{redirectTo:location.href}});if(r.error)msg(r.error.message)};
  }catch(e){console.error('YOCEWOR auth methods',e)}
}
new MutationObserver(addAuthMethods).observe(document.body,{childList:true,subtree:true});setTimeout(addAuthMethods,700);
})();
