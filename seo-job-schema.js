/* YOCEWOR SEO / Google Job Search helper
   - Adds JobPosting only to genuine single-job pages.
   - Adds canonical/title/description metadata from the published record.
   - Never adds JobPosting to Admit Card, Result, Answer Key, Scheme or News pages.
*/
(function(){
  const SUPABASE_URL='https://mzntgjyecymcpzciklfk.supabase.co';
  const SUPABASE_KEY='sb_publishable_AAXGC4EmiD4ELszpchz9Dw_Eryr6Usn';
  const db=window.supabase?.createClient(SUPABASE_URL,SUPABASE_KEY);
  if(!db)return;

  const params=new URLSearchParams(location.search);
  const id=String(params.get('id')||'').trim();
  const pathParts=location.pathname.split('/').filter(Boolean);
  const slug=String(params.get('slug')||pathParts[pathParts.length-1]||'').trim();

  const jobTypes=new Set([
    'job','recruitment','latest_jobs','state_government_jobs',
    'central_government_jobs','government_jobs'
  ]);

  const clean=s=>String(s??'').replace(/undefinedn/g,'\n').replace(/\\n/g,'\n').replace(/\r/g,'').trim();
  const escHtml=s=>String(s??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  const safeUrl=u=>{try{const x=new URL(String(u));return /^https?:$/.test(x.protocol)?x.href:''}catch(e){return ''}};
  const isoDate=v=>{const s=String(v||'').trim();return /^\d{4}-\d{2}-\d{2}/.test(s)?s.slice(0,10):''};

  function setMeta(name,content){
    if(!content)return;
    let el=document.querySelector('meta[name="'+name+'"]');
    if(!el){el=document.createElement('meta');el.name=name;document.head.appendChild(el);}
    el.content=content;
  }
  function setCanonical(url){
    if(!url)return;
    let el=document.querySelector('link[rel="canonical"]');
    if(!el){el=document.createElement('link');el.rel='canonical';document.head.appendChild(el);}
    el.href=url;
  }
  function textDescription(j){
    const chunks=[];
    [j.main_content,j.description,j.short_description,j.qualification,j.age,j.location,j.how_to_apply]
      .forEach(v=>{if(v&&String(v).trim())chunks.push(String(v));});
    (Array.isArray(j.detailed_sections)?j.detailed_sections:[]).forEach(v=>{
      const c=v?.content||v?.description||v?.[1];
      if(c)chunks.push(String(c));
    });
    return chunks.join('\n').replace(/\n{3,}/g,'\n\n').trim();
  }
  function htmlDescription(j){
    const parts=[];
    const add=v=>{const t=clean(v);if(t)parts.push('<p>'+escHtml(t).replace(/\n/g,'<br>')+'</p>');};
    add(j.main_content||j.description||j.short_description);
    add(j.qualification);
    add(j.age);
    (Array.isArray(j.detailed_sections)?j.detailed_sections:[]).forEach(v=>{
      const c=v?.content||v?.description||v?.[1];
      add(c);
    });
    add(j.how_to_apply);
    return parts.join('');
  }
  function isJob(j){
    const t=String(j.type||'').toLowerCase().replace(/[-\s]+/g,'_');
    return jobTypes.has(t);
  }

  async function run(){
    try{
      let q=db.from('jobs').select('*').eq('published',true);
      q=id?q.eq('id',id):q.eq('slug',decodeURIComponent(slug));
      const {data:j,error}=await q.maybeSingle();
      if(error||!j)return;

      const canonical=location.origin+'/'+encodeURIComponent(String(j.slug||slug)).replace(/%2F/g,'/')+'/';
      setCanonical(canonical);
      const desc=textDescription(j);
      if(j.title)document.title=String(j.title)+' — YOCEWOR';
      setMeta('description',desc.slice(0,155));

      if(!isJob(j))return;
      if(!j.title || !j.date_posted || !j.department || !j.apply_url)return;
      if(desc.length<200)return;

      const job={
        '@context':'https://schema.org',
        '@type':'JobPosting',
        'title':String(j.title).replace(/\s+—.*$/,'').trim(),
        'description':htmlDescription(j),
        'datePosted':isoDate(j.date_posted),
        'hiringOrganization':{
          '@type':'Organization',
          'name':String(j.department).trim(),
          'sameAs':safeUrl(j.notification_url||j.apply_url)||location.origin
        },
        'jobLocation':{
          '@type':'Place',
          'address':{
            '@type':'PostalAddress',
            'addressLocality':String(j.location||'India').trim(),
            'addressCountry':'IN'
          }
        },
        'directApply':false,
        'url':canonical
      };
      const validThrough=isoDate(j.last_date);
      if(validThrough)job.validThrough=validThrough+'T23:59:59+05:30';

      const old=document.getElementById('yocewor-jobposting-jsonld');
      if(old)old.remove();
      const script=document.createElement('script');
      script.id='yocewor-jobposting-jsonld';
      script.type='application/ld+json';
      script.textContent=JSON.stringify(job);
      document.head.appendChild(script);
    }catch(e){
      console.warn('YOCEWOR SEO schema skipped',e);
    }
  }
  run();
})();
