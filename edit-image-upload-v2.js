(function(){
  const DB_URL='https://mzntgjyecymcpzciklfk.supabase.co';
  const DB_KEY='sb_publishable_AAXGC4EmiD4ELszpchz9Dw_Eryr4Usn';
  function start(){
    const url=document.getElementById('imageUrl');
    if(!url || document.getElementById('imageUploadBoxV2')) return;
    const builder=url.closest('.builder');
    if(!builder) return;
    const box=document.createElement('div');
    box.id='imageUploadBoxV2';
    box.style.cssText='margin-top:10px;padding:12px;border:1px solid #dce4ec;border-radius:10px;background:#f8fafc';
    box.innerHTML='<label style="display:block;font-weight:800;margin-bottom:6px">🖼️ Image Upload <span style="font-weight:500;color:#68778b">(फोन से फोटो चुनें)</span></label><input id="imageFileV2" type="file" accept="image/jpeg,image/png,image/webp,image/gif" style="width:100%;padding:8px;border:1px solid #cbd6e2;border-radius:8px;background:#fff"><div id="imageUploadStatusV2" style="margin-top:7px;font-size:13px;color:#68778b"></div><img id="imagePreviewV2" alt="Image preview" style="display:none;width:100%;max-height:240px;object-fit:contain;margin-top:9px;border-radius:8px;border:1px solid #dde5ed;background:#fff">';
    builder.appendChild(box);
    const file=document.getElementById('imageFileV2'),status=document.getElementById('imageUploadStatusV2'),preview=document.getElementById('imagePreviewV2');
    const show=src=>{if(src){preview.src=src;preview.style.display='block'}else{preview.removeAttribute('src');preview.style.display='none'}};
    show(url.value.trim());
    url.addEventListener('input',()=>show(url.value.trim()));
    file.addEventListener('change',async()=>{
      const f=file.files&&file.files[0]; if(!f)return;
      if(f.size>8*1024*1024){status.textContent='❌ Image 8 MB से छोटी रखें।';file.value='';return}
      status.textContent='⏳ Image upload हो रही है…';
      try{
        const sup=window.supabase.createClient(DB_URL,DB_KEY);
        const user=await sup.auth.getUser();
        if(user.error||!user.data.user)throw new Error('Login session not available.');
        const ext=(f.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
        const id=(document.getElementById('editId')?.value||'new');
        const path='featured/'+id+'/'+Date.now()+'.'+ext;
        const up=await sup.storage.from('content-images').upload(path,f,{contentType:f.type||'image/jpeg',upsert:false,cacheControl:'31536000'});
        if(up.error)throw up.error;
        const publicUrl=sup.storage.from('content-images').getPublicUrl(path).data.publicUrl;
        url.value=publicUrl;
        show(publicUrl);
        status.textContent='✅ Image uploaded. अब Publish / Update या Save Draft दबाएँ।';
      }catch(e){status.textContent='❌ Upload failed: '+(e.message||e);}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
