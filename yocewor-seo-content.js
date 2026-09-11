/* YOCEWOR — information-rich homepage/footer layer */
(function(){
'use strict';
if(document.getElementById('yocewor-seo-layer')) return;
function esc(s){return String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
function add(){
 if(document.getElementById('yocewor-seo-layer')) return;
 const style=document.createElement('style');
 style.id='yocewor-seo-style';
 style.textContent=`
#yocewor-seo-layer{margin:20px 0 0}
.yo-seo-panel{background:#fff;border:1px solid #dce4ea;border-radius:10px;overflow:hidden;margin:0 0 18px;box-shadow:0 6px 20px rgba(9,38,63,.06)}
.yo-seo-head{background:#071f3a;color:#fff;border-bottom:3px solid #f0b323;padding:12px 15px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.yo-seo-head h3{margin:0;font-size:15px;line-height:1.4}.yo-seo-head span{font-size:10px;color:#d9e6ef}
.yo-seo-body{padding:15px}.yo-seo-intro{margin:0;color:#435b6b;font-size:12px;line-height:1.85}
.yo-seo-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px}
.yo-seo-grid a{display:block;padding:10px 11px;border:1px solid #dce4ea;border-radius:7px;background:#f8fafc;color:#0d4675;text-decoration:none;font-size:11px;font-weight:800;line-height:1.45}.yo-seo-grid a:hover{border-color:#f0b323;background:#fff}
.yo-faq{border:1px solid #e0e7ec;border-radius:7px;margin:8px 0 0;background:#fff}.yo-faq summary{cursor:pointer;padding:11px 12px;color:#071f3a;font-size:12px;font-weight:850;list-style-position:inside}.yo-faq p{margin:0;padding:0 12px 12px;color:#526977;font-size:11px;line-height:1.75}.yo-faq:first-child{margin-top:0}
.yo-disclaimer{background:#f7fafc;border:1px solid #dce4ea;border-left:4px solid #f0b323;border-radius:7px;padding:12px;color:#536976;font-size:10px;line-height:1.75;margin-top:12px}.yo-disclaimer strong{color:#071f3a}
.yo-footer-extra{border-top:1px solid #ffffff18;margin-top:18px;padding-top:18px}.yo-footer-cols{display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr;gap:22px}.yo-footer-extra h5{margin:0 0 8px;color:#fff;font-size:12px}.yo-footer-extra a{color:#c8d7e2!important;font-size:10px!important;margin:4px 0!important}.yo-footer-extra p{color:#c8d7e2;font-size:10px;line-height:1.7;margin:0}
@media(max-width:900px){.yo-seo-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.yo-footer-cols{grid-template-columns:1fr 1fr}}
@media(max-width:600px){.yo-seo-body{padding:12px}.yo-seo-grid{grid-template-columns:1fr 1fr;gap:6px}.yo-seo-grid a{font-size:10px;padding:9px}.yo-seo-head{padding:11px 12px}.yo-seo-head h3{font-size:14px}.yo-footer-cols{grid-template-columns:1fr}}
`;
 document.head.appendChild(style);
 const wrap=document.createElement('div');
 wrap.id='yocewor-seo-layer';
 wrap.className='wrap';
 wrap.innerHTML=`
<section class="yo-seo-panel" aria-labelledby="yo-about-title">
 <div class="yo-seo-head"><h3 id="yo-about-title">🇮🇳 About YOCEWOR</h3><span>Government Jobs & Exam Information Portal</span></div>
 <div class="yo-seo-body">
  <p class="yo-seo-intro"><strong>YOCEWOR</strong> एक independent information portal है जहाँ सरकारी नौकरी, recruitment, vacancy, admit card, answer key, result, syllabus, admission और महत्वपूर्ण परीक्षा updates को आसान और व्यवस्थित तरीके से उपलब्ध कराया जाता है। हमारा उद्देश्य उम्मीदवारों को जरूरी जानकारी सही समय पर एक जगह देना है, ताकि उन्हें संबंधित भर्ती या परीक्षा की जानकारी खोजने में सुविधा हो। आवेदन, शुल्क, eligibility, exam date, answer key और result के लिए संबंधित विभाग की <strong>Official Notification</strong> और official website को अंतिम एवं प्रामाणिक स्रोत मानें।</p>
  <div class="yo-seo-grid" aria-label="YOCEWOR categories">
   <a href="latest-jobs.html">💼 Latest Jobs</a><a href="answer-key.html">🔑 Answer Key</a><a href="#admit">🎫 Admit Card</a><a href="#result">📊 Results</a>
   <a href="#syllabus">📚 Syllabus</a><a href="#admission">🎓 Admission</a><a href="#updates">📰 Latest Updates</a><a href="#important">⚠️ Important Information</a>
  </div>
 </div>
</section>
<section class="yo-seo-panel" aria-labelledby="yo-faq-title">
 <div class="yo-seo-head"><h3 id="yo-faq-title">❓ Frequently Asked Questions</h3><span>YOCEWOR Help</span></div>
 <div class="yo-seo-body">
  <details class="yo-faq"><summary>YOCEWOR पर सरकारी नौकरी की जानकारी कैसे देखें?</summary><p>Latest Jobs section में भर्ती का नाम चुनें। वहाँ vacancy, qualification, age limit, important dates और उपलब्ध official links जैसी जानकारी देखें। आवेदन करने से पहले official notification जरूर पढ़ें।</p></details>
  <details class="yo-faq"><summary>YOCEWOR से Admit Card कैसे डाउनलोड करें?</summary><p>Admit Card section में अपनी परीक्षा या भर्ती खोजें और उपलब्ध official link खोलें। Admit Card संबंधित परीक्षा आयोजित करने वाली संस्था की official website से डाउनलोड किया जाता है।</p></details>
  <details class="yo-faq"><summary>YOCEWOR पर Result कैसे check करें?</summary><p>Results section में संबंधित परीक्षा का update खोलें और उपलब्ध official result link का उपयोग करें। Result की अंतिम जानकारी संबंधित परीक्षा संस्था की official website पर verify करें।</p></details>
  <details class="yo-faq"><summary>क्या YOCEWOR पर जानकारी देखने के लिए registration या subscription जरूरी है?</summary><p>YOCEWOR पर प्रकाशित सामान्य job और exam information को देखने के लिए कोई paid subscription आवश्यक नहीं है। जहाँ किसी बाहरी सरकारी portal पर registration या fee जरूरी हो, वह प्रक्रिया संबंधित official website पर होती है।</p></details>
  <details class="yo-faq"><summary>क्या YOCEWOR सरकारी परीक्षा आयोजित करता है?</summary><p>नहीं। YOCEWOR स्वयं कोई सरकारी परीक्षा आयोजित नहीं करता। यह सरकारी भर्ती और परीक्षा से संबंधित सार्वजनिक एवं official-source information को व्यवस्थित रूप में प्रस्तुत करने वाला independent information portal है।</p></details>
  <details class="yo-faq"><summary>क्या YOCEWOR से सरकारी नौकरी के लिए आवेदन किया जा सकता है?</summary><p>आवेदन संबंधित भर्ती authority की official website पर किया जाता है। YOCEWOR उपलब्ध होने पर official Apply link और recruitment information तक पहुँचने में मदद करता है।</p></details>
  <details class="yo-faq"><summary>YOCEWOR पर कौन-कौन से updates मिलते हैं?</summary><p>Latest Government Jobs, Recruitment, Admit Card, Answer Key, Results, Syllabus, Exam Date, Admission और अन्य महत्वपूर्ण education/exam updates अलग-अलग sections में उपलब्ध कराए जाते हैं।</p></details>
  <details class="yo-faq"><summary>क्या YOCEWOR की जानकारी verified है?</summary><p>YOCEWOR जानकारी को official sources और उपलब्ध official notifications के आधार पर व्यवस्थित करने का प्रयास करता है। फिर भी उम्मीदवार को आवेदन या कोई महत्वपूर्ण निर्णय लेने से पहले संबंधित authority की latest official notification से details verify करनी चाहिए।</p></details>
  <details class="yo-faq"><summary>YOCEWOR पर जानकारी कितनी बार update होती है?</summary><p>नए updates उपलब्ध होने पर published information को नियमित रूप से update किया जाता है। Dates, vacancies, links या notices बदलने की स्थिति में उम्मीदवार को latest official notification भी देखनी चाहिए।</p></details>
  <details class="yo-faq"><summary>क्या YOCEWOR किसी सरकारी विभाग से affiliated है?</summary><p>YOCEWOR एक independent information portal है और किसी सरकारी विभाग, recruitment board या examination authority का official हिस्सा नहीं है, जब तक किसी page पर स्पष्ट रूप से किसी official source का reference न दिया गया हो।</p></details>
  <div class="yo-disclaimer"><strong>Important Disclaimer:</strong> YOCEWOR पर उपलब्ध जानकारी सुविधा और reference के लिए है। भर्ती की eligibility, vacancy, fee, dates, exam schedule, answer key, result और अन्य अंतिम विवरण संबंधित विभाग/संस्था की official notification और official website से ही verify करें।</div>
 </div>
</section>`;
 const footer=document.querySelector('footer.footer');
 if(footer && footer.parentNode){footer.parentNode.insertBefore(wrap,footer);const extra=document.createElement('div');extra.className='yo-footer-extra';extra.innerHTML=`<div class="yo-footer-cols"><div><h5>YOCEWOR</h5><p>Your Voice. Your World.<br>सरकारी नौकरी और परीक्षा की जानकारी का independent information portal.</p></div><div><h5>Job & Exam Pages</h5><a href="latest-jobs.html">Latest Jobs</a><a href="answer-key.html">Answer Key</a><a href="#admit">Admit Card</a><a href="#result">Results</a><a href="#syllabus">Syllabus</a></div><div><h5>Information</h5><a href="about.html">About YOCEWOR</a><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms & Conditions</a><a href="contact.html">Contact Us</a><a href="disclaimer.html">Disclaimer</a></div><div><h5>Connect</h5><a href="https://www.instagram.com/yocewor" target="_blank" rel="noopener">Instagram</a><a href="https://t.me/YOCEWOR" target="_blank" rel="noopener">Telegram</a><a href="https://whatsapp.com/channel/0029VaNA3EBJf05WBdLb1y2n" target="_blank" rel="noopener">WhatsApp Channel</a></div></div>`;footer.querySelector('.wrap')?.insertBefore(extra,footer.querySelector('.copy')||null)}
 const ld=document.createElement('script');ld.type='application/ld+json';ld.textContent=JSON.stringify({"@context":"https://schema.org","@type":"WebSite","name":"YOCEWOR","url":"https://yocewor.in/","description":"Hindi-first government jobs, recruitment and exam information portal."});document.head.appendChild(ld);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
})();
