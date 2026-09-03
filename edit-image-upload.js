(function(){
  const DB_URL='https://mzntgjyecymcpzciklfk.supabase.co';
  const DB_KEY='sb_publishable_AAXGC4EmiD4ELszpchz9Dw_Eryr4Usn';
  function start(){
    const url=document.getElementById('imageUrl');
    if(!url || document.getElementById('imageUploadBox')) return;
    const field=url.closest('.field'); if(!field) return;
    const box=document.createElement('div');
    box.id='imageUploadBox';
    box.style.cssText='margin-top:10px;padding:12px;border:1px solid #dce4ec;border-radius:10px;background:#f8fafc';
    box.innerHTML='<label style="display:block;font-weight:800;margin-bottom:6px">🖼️ Image Upload <span style="font-weight:500;color:#68778b">(फोन से फोटो चुनें)</span></label><input id="imageFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" style="width:100%;padding:8px;border:1px solid #cbd6e2;border-radius:8px;background:#fff"><div id="imageUploadStatus" style="margin-top:7px;font-size:13px;color:#68778b"></div><img id="imagePreview" alt="Image preview" style="display:none;width:100%;max-height:220px;object-fit:contain;margin-top:9px;border-radius:8px;border:1px solid #dde5ed;background:#fff">';
    field.appendChild(box);
    const file=document.getElementById('imageFile'),status=document.getElementById('imageUploadStatus'),preview=document.getElementById('imagePreview');
    function showPreview(src){if(src){preview.src=src;preview.style.display='block'}else{preview.removeAttribute('src');preview.style.display='none'}}
    if(url.value) showPreview(url.value);
    url.addEventListener('change',()=>showPreview(url.value.trim()));
    file.addEventListener('change',async()=>{
      const f=file.files&&file.files[0]; if(!f) return;
      if(f.size>8*1024*1024){status.textContent='❌ Image 8 MB से छोटी रखें।';file.value='';return}
      status.textContent='Uploading image…';
      try{
        const s=window.YOCEWOR_AUTH?.readStoredSession?.();
        if(!s?.access_token) throw new Error('Login session not available.');
        const sup=window.supabase.createClient(DB_URL,DB_KEY);
        await sup.auth.setSession({access_token:s.access_token,refresh_token:s.refresh_token});
        const ext=(f.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
        const id=(window.current&&window.current.id)||('job-'+Date.now());
        const path='featured/'+id+'/'+Date.now()+'.'+ext;
        const up=await sup.storage.from('content-images').upload(path,f,{contentType:f.type||'image/jpeg',upsert:false,cacheControl:'31536000'});
        if(up.error) throw up.error;
        const pub=sup.storage.from('content-images').getPublicUrl(path);
        url.value=pub.data.publicUrl;
        url.dispatchEvent(new Event('change',{bubbles:true}));
        showPreview(pub.data.publicUrl);
        status.textContent='✅ Image uploaded. Save Changes दबाकर इसे भर्ती में save करें।';
      }catch(e){status.textContent='❌ Upload failed: '+(e.message||e);}
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
