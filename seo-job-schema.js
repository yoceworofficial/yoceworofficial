/* YOCEWOR SEO / Google Job Search helper
   - Adds JobPosting only to genuine single-job pages.
   - Adds canonical/title/description metadata from the published record.
   - Never adds JobPosting to Admit Card, Result, Answer Key, Scheme or News pages.
   - Also upgrades suitable recruitment details into responsive YOCEWOR tables.
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

  /* ---------- YOCEWOR structured tables ---------- */
  let tableStyleAdded=false;
  function addTableStyles(){
    if(tableStyleAdded)return;
    tableStyleAdded=true;
    const s=document.createElement('style');
    s.id='yocewor-structured-tables-v1';
    s.textContent=`
      .yo-table-wrap{width:100%;overflow-x:auto;border:1px solid #d9e5ef;border-radius:12px;background:#fff;box-shadow:0 4px 14px #173b5d0a}
      .yo-table{width:100%;min-width:560px;border-collapse:collapse;font-size:14px}
      .yo-table th{background:linear-gradient(135deg,#083b66,#1267a6);color:#fff;text-align:left;padding:11px 12px;font-weight:800;white-space:nowrap}
      .yo-table td{border-top:1px solid #e2e9ef;padding:10px 12px;vertical-align:top;color:#34495b}
      .yo-table tr:nth-child(even) td{background:#f8fbfd}
      .yo-table td strong{color:#082f55}
      .yo-table .total td{background:#fff8e7;font-weight:800;color:#082f55}
      .yo-table-note{margin-top:9px;color:#657482;font-size:12px;line-height:1.6}
      @media(max-width:560px){.yo-table{min-width:520px;font-size:12px}.yo-table th,.yo-table td{padding:8px 9px}}
    `;
    document.head.appendChild(s);
  }
  function table(headers,rows,note=''){
    addTableStyles();
    const head='<thead><tr>'+headers.map(h=>'<th>'+escHtml(h)+'</th>').join('')+'</tr></thead>';
    const body='<tbody>'+rows.map(r=>'<tr'+(r.__total?' class="total"':'')+'>'+r.cells.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join('')+'</tbody>';
    return '<div class="yo-table-wrap"><table class="yo-table">'+head+body+'</table></div>'+(note?'<div class="yo-table-note">'+escHtml(note)+'</div>':'');
  }
  const c=v=>escHtml(v);
  const bold=v=>'<strong>'+c(v)+'</strong>';
  function total(cells){return {cells,__total:true};}

  function tableForHeading(h,j){
    const key=clean(h).toLowerCase();
    if(key.includes('delhi police vacancy') && key.includes('पुरुष')){
      return table(['श्रेणी','Open','ESM Other','ESM Special','कुल'],[
        {cells:['UR','77','5','5',bold('87')]},{cells:['OBC','49','3','2',bold('54')]},{cells:['SC','27','2','1',bold('30')]},{cells:['ST','13','1','0',bold('14')]},{cells:['EWS','18','1','1',bold('20')]},total(['','184','12','9',bold('205')])
      ],'Delhi Police पुरुष SI में कुल 205 पद हैं।');
    }
    if(key.includes('delhi police महिला')){
      return table(['श्रेणी','पद'],[
        {cells:['UR','47']},{cells:['OBC','30']},{cells:['SC','16']},{cells:['ST','8']},{cells:['EWS','11']},total(['कुल','112'])
      ]);
    }
    if(key.includes('capfs si vacancy')){
      return table(['CAPF','पुरुष','महिला','कुल'],[
        {cells:['CRPF','225','29',bold('254')]},{cells:['BSF','435','22',bold('457')]},{cells:['ITBP','159','28',bold('187')]},{cells:['CISF','200','50',bold('250')]},{cells:['SSB','154','18',bold('172')]},total(['कुल','1173','147',bold('1320')])
      ],'CAPFs में 132 पद Ex-Servicemen के लिए आरक्षित बताए गए हैं।');
    }
    if(key.includes('cisf si fire vacancy')){
      return table(['श्रेणी','पद'],[
        {cells:['UR','74']},{cells:['OBC','75']},{cells:['SC','52']},{cells:['ST','16']},{cells:['EWS','17']},{cells:['Ex-Servicemen (ESM)','18']},total(['कुल','234'])
      ],'यह पद केवल पुरुष अभ्यर्थियों के लिए है। ESM संख्या आरक्षण/पद-विवरण के अनुसार दी गई है।');
    }
    if(key.includes('आवेदन शुल्क')){
      return table(['अभ्यर्थी / स्थिति','शुल्क'],[
        {cells:['General / OBC / EWS पुरुष',bold('₹100')]},{cells:['सभी महिला उम्मीदवार','निःशुल्क']},{cells:['SC / ST','निःशुल्क']},{cells:['पात्र Ex-Servicemen','निःशुल्क']},{cells:['पहली Correction','₹200']},{cells:['दूसरी Correction','₹500']}
      ],'Correction fee सभी श्रेणियों पर लागू है। आवेदन शुल्क BHIM UPI, Net Banking या Visa/MasterCard/Maestro/RuPay debit card से जमा किया जा सकता है।');
    }
    if(key.includes('आयु सीमा')){
      return table(['श्रेणी / पद','आयु सीमा / छूट'],[
        {cells:['Delhi Police / CAPFs SI','20–25 वर्ष']},{cells:['CISF SI Fire','18–30 वर्ष']},{cells:['SC / ST','अधिकतम आयु में 5 वर्ष की छूट']},{cells:['OBC','अधिकतम आयु में 3 वर्ष की छूट']},{cells:['Ex-Servicemen','सैन्य सेवा घटाने के बाद 3 वर्ष']},{cells:['Delhi Police महिला (Widow/Divorced/Judicially Separated)','अधिकतम 35 वर्ष; SC/ST महिला 40 वर्ष']},{cells:['Delhi Police Departmental','UR/EWS 30, OBC 33, SC/ST 35 वर्ष; अंतिम तिथि तक कम से कम 3 वर्ष नियमित सेवा']}
      ]);
    }
    if(key.includes('शैक्षणिक योग्यता')){
      return table(['पद','आवश्यक योग्यता','अतिरिक्त शर्त'],[
        {cells:['Delhi Police SI','मान्यता प्राप्त विश्वविद्यालय से Graduation / Equivalent','30 सितंबर 2026 तक योग्यता; पुरुष SI के लिए PST/PET की निर्धारित तिथि तक motorcycle और car का valid driving licence']},{cells:['CAPFs SI','मान्यता प्राप्त विश्वविद्यालय से Graduation / Equivalent','30 सितंबर 2026 तक']},{cells:['CISF SI Fire','Physics, Chemistry, Mathematics के साथ Science Graduation अथवा निर्दिष्ट 3-वर्षीय Engineering Diploma / Equivalent','मूल diploma/विषय संबंधी notification conditions लागू']}
      ]);
    }
    if(key.includes('selection process')){
      return table(['क्रम','चरण','स्थिति'],[
        {cells:['1','Paper-I CBT','लिखित परीक्षा']},{cells:['2','PST / PET','Qualifying']},{cells:['3','Paper-II CBT','लिखित परीक्षा']},{cells:['4','Detailed / Review Medical Examination','चिकित्सीय जांच']},{cells:['5','Document Verification','दस्तावेज सत्यापन']}
      ],'Final selection Paper-II marks, NCC bonus और post/force preference के आधार पर होगा। PST/PET qualifying हैं।');
    }
    if(key.includes('paper-i exam pattern')){
      return table(['विषय','प्रश्न','अंक','समय'],[
        {cells:['General Intelligence & Reasoning','25','25','15 मिनट']},{cells:['General Knowledge & General Awareness','25','25','15 मिनट']},{cells:['Quantitative Aptitude','25','25','15 मिनट']},{cells:['English Comprehension','25','25','15 मिनट']},total(['कुल','100','100','1 घंटा'])
      ],'प्रत्येक गलत उत्तर पर 0.25 अंक की negative marking है और sectional timer लागू है।');
    }
    if(key.includes('paper-ii exam pattern')){
      return table(['विषय','प्रश्न','अंक','समय'],[
        {cells:['General Intelligence & Reasoning','20','40','20 मिनट']},{cells:['General Knowledge & General Awareness','20','40','20 मिनट']},{cells:['Quantitative Aptitude','20','40','20 मिनट']},{cells:['English Comprehension','100','200','1 घंटा']},total(['कुल','160','320','2 घंटे'])
      ],'पहले तीन भागों में 20-20 मिनट sectional timer है। प्रत्येक गलत उत्तर पर 0.50 अंक की negative marking है।');
    }
    if(key.includes('minimum qualifying')){
      return table(['श्रेणी','न्यूनतम अंक'],[
        {cells:['UR','30%']},{cells:['OBC / EWS','25%']},{cells:['अन्य सभी श्रेणियां','20%']}
      ],'यह न्यूनतम qualifying marks हैं; NCC bonus अलग से लागू हो सकता है।');
    }
    if(key.includes('ncc bonus')){
      return table(['NCC Certificate','Bonus'],[
        {cells:['C Certificate','5%']},{cells:['B Certificate','3%']},{cells:['A Certificate','2%']}
      ],'Bonus प्रत्येक पेपर के maximum marks के आधार पर है।');
    }
    if(key.includes('physical test — पुरुष') || key.includes('physical test - पुरुष')){
      return table(['इवेंट','मानक','अवसर'],[
        {cells:['100m दौड़','16 सेकंड','—']},{cells:['1.6 km दौड़','6.5 मिनट','—']},{cells:['Long Jump','3.65 m','अधिकतम 3']},{cells:['High Jump','1.2 m','अधिकतम 3']},{cells:['Shot Put (16 lb)','4.5 m','अधिकतम 3']}
      ]);
    }
    if(key.includes('physical test — महिला') || key.includes('physical test - महिला')){
      return table(['इवेंट','मानक','अवसर'],[
        {cells:['100m दौड़','18 सेकंड','—']},{cells:['800m दौड़','4 मिनट','—']},{cells:['Long Jump','2.7 m','अधिकतम 3']},{cells:['High Jump','0.9 m','अधिकतम 3']}
      ],'Ex-Servicemen को PET से छूट है, लेकिन written, PST और medical standards पूरे करने होंगे।');
    }
    if(key.includes('physical standards')){
      return table(['उम्मीदवार / श्रेणी','Height','Chest'],[
        {cells:['सामान्य पुरुष','170 cm','80–85 cm']},{cells:['निर्धारित पहाड़ी क्षेत्र पुरुष','165 cm','80–85 cm']},{cells:['ST पुरुष','162.5 cm','77–82 cm']},{cells:['सामान्य महिला','157 cm','—']},{cells:['पहाड़ी क्षेत्र महिला','155 cm','—']},{cells:['ST महिला','154 cm','—']},{cells:['CISF SI Fire सामान्य पुरुष','170 cm','81–86 cm']}
      ],'CAPFs में Gorkha और North-East ST के लिए अलग physical standards लागू हो सकते हैं। वजन height के अनुपात में होना चाहिए।');
    }
    if(key.includes('medical standards')){
      return table(['जांच','मानक'],[
        {cells:['Near Vision','बेहतर आंख N6, दूसरी N9']},{cells:['Distance Vision','बिना चश्मे/सर्जरी बेहतर आंख 6/6, दूसरी 6/9']},{cells:['शारीरिक स्थिति','Knock Knee, Flat Foot, Varicose Vein और Squint नहीं']},{cells:['अन्य','उच्च रंग दृष्टि तथा अच्छा शारीरिक/मानसिक स्वास्थ्य आवश्यक']}
      ]);
    }
    if(key.includes('salary')){
      return table(['पद / Force','Pay Level','वेतनमान'],[
        {cells:['Delhi Police SI','Level-6','₹35,400 – ₹1,12,400']},{cells:['CAPFs SI (GD)','Level-6','₹35,400 – ₹1,12,400']},{cells:['CISF SI Fire','Level-6','₹35,400 – ₹1,12,400']}
      ]);
    }
    return '';
  }

  function enhanceTables(j){
    let done=false;
    const scan=()=>{
      const sectionHeads=[...document.querySelectorAll('.section-head h2')];
      const detailSection=sectionHeads.find(x=>clean(x.textContent).includes('भर्ती की पूरी जानकारी'))?.closest('.section');
      if(!detailSection)return false;
      const blocks=detailSection.querySelectorAll('.detail-block');
      blocks.forEach(block=>{
        if(block.dataset.yoTableDone==='1')return;
        const h=block.querySelector('h3');
        if(!h)return;
        const html=tableForHeading(h.textContent,j);
        if(!html)return;
        const holder=h.parentElement;
        const old=[...holder.childNodes].filter(n=>n!==h);
        old.forEach(n=>n.remove());
        const wrap=document.createElement('div');wrap.innerHTML=html;
        while(wrap.firstChild)holder.appendChild(wrap.firstChild);
        block.dataset.yoTableDone='1';
        done=true;
      });
      return done;
    };
    if(scan())return;
    const observer=new MutationObserver(()=>{if(scan())observer.disconnect();});
    observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),10000);
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
      enhanceTables(j);

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
