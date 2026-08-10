(function(){'use strict';
  const KEY='yocewor_device_id_v1';
  function deviceId(){let id=localStorage.getItem(KEY);if(!id){id=(crypto&&crypto.randomUUID)?crypto.randomUUID():('yw-'+Date.now()+'-'+Math.random().toString(36).slice(2));localStorage.setItem(KEY,id)}return id}
  async function bind(){
    try{
      if(typeof db==='undefined'||!db.auth)return;
      const {data:{session}}=await db.auth.getSession();
      if(!session?.user)return;
      const {data,error}=await db.rpc('bind_account_device',{p_device_id:deviceId()});
      if(error)throw error;
      if(data===false){
        await db.auth.signOut();
        const text='This YOCEWOR account is already linked to another device. For your security, only the registered device can use this account.';
        if(typeof toast==='function')toast(text);else alert(text);
        return;
      }
    }catch(e){console.error('YOCEWOR device binding',e)}
  }
  document.addEventListener('DOMContentLoaded',bind);
  setTimeout(bind,1200);
})();
