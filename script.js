
const mobileMenu=document.getElementById('mobileMenu');
const menu=document.getElementById('menu');
mobileMenu?.addEventListener('click',()=>{
  const open=menu.classList.toggle('open');
  mobileMenu.setAttribute('aria-expanded',open);
});
menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.classList.remove('open')));

const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
},{threshold:.10});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

document.getElementById('year').textContent=new Date().getFullYear();

const waButton=document.getElementById('waButton');
const waMenu=document.getElementById('waMenu');
waButton?.addEventListener('click',()=>waMenu.classList.toggle('open'));
document.addEventListener('click',e=>{
  if(!e.target.closest('.whatsapp-float')) waMenu?.classList.remove('open');
});

const filters=[...document.querySelectorAll('.filter')];
const galleryItems=[...document.querySelectorAll('.gallery-item')];
filters.forEach(btn=>btn.addEventListener('click',()=>{
  filters.forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const category=btn.dataset.filter;
  galleryItems.forEach(item=>{
    item.classList.toggle('hidden',category!=='all' && item.dataset.category!==category);
  });
}));

const dialog=document.getElementById('lightbox');
const lbImage=document.getElementById('lightboxImage');
const visibleItems=()=>galleryItems.filter(i=>!i.classList.contains('hidden'));
let currentIndex=0;

function openLightbox(item){
  const items=visibleItems();
  currentIndex=Math.max(0,items.indexOf(item));
  lbImage.src=item.dataset.full;
  lbImage.alt=item.querySelector('img').alt;
  dialog.showModal();
}
function moveLightbox(step){
  const items=visibleItems();
  if(!items.length)return;
  currentIndex=(currentIndex+step+items.length)%items.length;
  lbImage.src=items[currentIndex].dataset.full;
  lbImage.alt=items[currentIndex].querySelector('img').alt;
}
galleryItems.forEach(item=>item.addEventListener('click',()=>openLightbox(item)));
document.querySelector('.lb-close')?.addEventListener('click',()=>dialog.close());
document.querySelector('.lb-prev')?.addEventListener('click',()=>moveLightbox(-1));
document.querySelector('.lb-next')?.addEventListener('click',()=>moveLightbox(1));
dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
document.addEventListener('keydown',e=>{
  if(!dialog?.open)return;
  if(e.key==='ArrowRight')moveLightbox(1);
  if(e.key==='ArrowLeft')moveLightbox(-1);
  if(e.key==='Escape')dialog.close();
});


// Slider principal da galeria
const slider=document.getElementById('gallery');
const sliderPrev=document.getElementById('sliderPrev');
const sliderNext=document.getElementById('sliderNext');
const sliderDots=document.getElementById('sliderDots');

function currentSlides(){return galleryItems.filter(i=>!i.classList.contains('hidden'))}
function slideStep(){
  const first=currentSlides()[0];
  return first ? first.getBoundingClientRect().width + 18 : 350;
}
sliderPrev?.addEventListener('click',()=>slider.scrollBy({left:-slideStep(),behavior:'smooth'}));
sliderNext?.addEventListener('click',()=>slider.scrollBy({left:slideStep(),behavior:'smooth'}));

function rebuildDots(){
  if(!sliderDots)return;
  sliderDots.innerHTML='';
  currentSlides().forEach((item,i)=>{
    const dot=document.createElement('button');
    dot.type='button';
    dot.setAttribute('aria-label',`Ir para foto ${i+1}`);
    if(i===0)dot.classList.add('active');
    dot.addEventListener('click',()=>item.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'}));
    sliderDots.appendChild(dot);
  });
}
function updateDots(){
  const slides=currentSlides();
  if(!slides.length)return;
  const center=slider.scrollLeft+slider.clientWidth/2;
  let best=0,dist=Infinity;
  slides.forEach((s,i)=>{
    const c=s.offsetLeft+s.offsetWidth/2;
    const d=Math.abs(c-center);
    if(d<dist){dist=d;best=i}
  });
  [...sliderDots.children].forEach((d,i)=>d.classList.toggle('active',i===best));
}
slider?.addEventListener('scroll',()=>requestAnimationFrame(updateDots));
filters.forEach(btn=>btn.addEventListener('click',()=>{
  setTimeout(()=>{rebuildDots(); slider.scrollTo({left:0,behavior:'smooth'});},20);
}));
rebuildDots();

// avanço automático suave; pausa quando o mouse está sobre a galeria
let sliderTimer=setInterval(()=>sliderNext?.click(),5000);
slider?.addEventListener('mouseenter',()=>clearInterval(sliderTimer));
slider?.addEventListener('mouseleave',()=>{clearInterval(sliderTimer);sliderTimer=setInterval(()=>sliderNext?.click(),5000)});


// Lightbox para os dois destaques militares
document.querySelectorAll('.military-card').forEach(card=>{
  card.addEventListener('click',()=>{
    const src=card.dataset.full;
    if(!src || !dialog || !lbImage) return;
    lbImage.src=src;
    lbImage.alt=card.querySelector('img')?.alt || 'Foto ampliada';
    dialog.showModal();
  });
});

function updatePortugalClock(){
  const now=new Date(), clock=document.getElementById('portugalClock'), dateEl=document.getElementById('portugalDate');
  if(clock) clock.textContent=new Intl.DateTimeFormat('pt-PT',{timeZone:'Europe/Lisbon',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now);
  if(dateEl) dateEl.textContent=new Intl.DateTimeFormat('pt-PT',{timeZone:'Europe/Lisbon',weekday:'short',day:'2-digit',month:'short'}).format(now).toUpperCase();
}
updatePortugalClock(); setInterval(updatePortugalClock,1000);

async function updateBragancaWeather(){
  const el=document.getElementById('bragancaTemp'); if(!el)return;
  try{
    const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=41.806&longitude=-6.757&current=temperature_2m&timezone=Europe%2FLisbon',{cache:'no-store'});
    if(!r.ok) throw new Error();
    const d=await r.json(), t=d?.current?.temperature_2m;
    el.textContent=Number.isFinite(t)?Math.round(t):'--';
  }catch(e){el.textContent='--';}
}
updateBragancaWeather(); setInterval(updateBragancaWeather,900000);

document.getElementById('contactForm')?.addEventListener('submit',e=>{
  e.preventDefault();
  const n=document.getElementById('contactName').value.trim();
  const em=document.getElementById('contactEmail').value.trim();
  const s=document.getElementById('contactSubject').value.trim();
  const m=document.getElementById('contactMessage').value.trim();
  const body=`Nome: ${n}\nE-mail: ${em}\n\n${m}`;
  location.href=`mailto:professor.ildebrando@gmail.com?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(body)}`;
});
