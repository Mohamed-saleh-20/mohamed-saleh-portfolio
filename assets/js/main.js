/* Navigation and mobile menu */
function initNavigation(){
  const menu=document.getElementById('nav-menu'),toggle=document.getElementById('nav-burger');
  if(!menu||!toggle)return;
  const close=()=>{menu.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open')};
  toggle.addEventListener('click',()=>{const open=!menu.classList.contains('is-open');menu.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open)});
  menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',close));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
}
/* Theme selection */
function initTheme(){
  const button=document.getElementById('theme-toggle'),icon=button?.querySelector('i');
  const update=()=>{const light=document.documentElement.dataset.theme==='light';if(icon)icon.className=light?'ri-moon-line':'ri-sun-line';button?.setAttribute('aria-pressed',String(light));document.querySelector('meta[name="theme-color"]')?.setAttribute('content',light?'#f5f5f7':'#000000')};
  update();button?.addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='light'?'dark':'light';document.documentElement.dataset.theme=next;try{localStorage.setItem('theme',next)}catch{}update()});
}
/* Scroll reveal and count up */
function initScrollEffects(){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal=document.querySelectorAll('.reveal');
  if(reduced||!('IntersectionObserver'in window)){reveal.forEach(el=>el.classList.add('is-visible'))}else{
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.12});reveal.forEach(el=>observer.observe(el));
  }
  document.querySelectorAll('[data-count]').forEach(el=>{const target=Number(el.dataset.count)||0;if(reduced){el.textContent=target;return}let done=false;const observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting&&!done){done=true;const start=performance.now(),duration=900;const step=now=>{const p=Math.min((now-start)/duration,1);el.textContent=Math.round(target*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step);observer.disconnect()}},{threshold:.7});observer.observe(el)});
}
/* Word by word About highlight */
function initAboutHighlight(){
  const paragraph=document.querySelector('[data-words]');if(!paragraph)return;
  const words=paragraph.textContent.trim().split(/\s+/);paragraph.textContent='';words.forEach((word,index)=>{const span=document.createElement('span');span.className='word';span.textContent=word+(index<words.length-1?' ':'');paragraph.append(span)});
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){paragraph.querySelectorAll('.word').forEach(w=>w.classList.add('is-lit'));return}
  const spans=[...paragraph.querySelectorAll('.word')];const paint=()=>{const rect=paragraph.getBoundingClientRect(),line=Math.min(innerHeight*.68,rect.bottom);spans.forEach((word,i)=>{const threshold=innerHeight*.78+i/words.length*innerHeight*.2;if(line>threshold)word.classList.add('is-lit')})};addEventListener('scroll',paint,{passive:true});paint();
}
/* Back to top and footer year */
function initPageUtilities(){
  const top=document.getElementById('to-top');const update=()=>top?.classList.toggle('is-visible',scrollY>500);addEventListener('scroll',update,{passive:true});update();top?.addEventListener('click',()=>scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
  const year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();
}
/* Scroll progress and gentle hero parallax */
function initScrollStory(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const root=document.documentElement,hero=document.querySelector('.hero'),visual=document.querySelector('.hero__visual'),glow=document.querySelector('.hero__glow');let pending=false;
  const update=()=>{
    pending=false;const max=document.documentElement.scrollHeight-innerHeight;const progress=max>0?Math.min(1,Math.max(0,scrollY/max)):0;
    root.style.setProperty('--scroll-progress',`${progress*100}%`);
    if(hero&&visual){const bounds=hero.getBoundingClientRect();const travel=Math.max(0,Math.min(1,-bounds.top/Math.max(1,hero.offsetHeight)));visual.style.setProperty('--hero-shift',`${-34*travel}px`);visual.style.setProperty('--hero-scale',`${1-.045*travel}`);glow?.style.setProperty('--glow-shift',`${28*travel}px`)}
  };
  const requestUpdate=()=>{if(!pending){pending=true;requestAnimationFrame(update)}};addEventListener('scroll',requestUpdate,{passive:true});addEventListener('resize',requestUpdate);update();
}
/* Contact form feedback (connect EmailJS credentials to enable delivery) */
function initContactForm(){
  const form=document.getElementById('contact-form'),status=document.getElementById('form-status');if(!form||!status)return;
  form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;status.textContent='Thanks for your message. Please email me directly at the address listed on my original site.';form.reset()});
}
document.addEventListener('DOMContentLoaded',()=>{initNavigation();initTheme();initScrollEffects();initAboutHighlight();initPageUtilities();initScrollStory();initContactForm()});
