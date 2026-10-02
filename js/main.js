const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const load=u=>fetch(u).then(r=>{if(!r.ok)throw 0;return r.json()});

// Navigation : une section affichée à la fois (#memories, #classes…)
const secs=[...document.querySelectorAll('main>section')];
function route(){
  const id=location.hash.slice(1),cur=secs.some(s=>s.id===id)?id:'home';
  secs.forEach(s=>s.hidden=s.id!==cur);
  document.body.classList.toggle('home',cur==='home');
  document.querySelectorAll('.top nav a').forEach(a=>a.hash==='#'+cur?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
  scrollTo(0,0);
}
addEventListener('hashchange',route);route();

// Classes : data/students.json
load('data/students.json').then(list=>{
  const by={};list.forEach(s=>(by[s.class||'—']??=[]).push(s));
  $('#students').innerHTML=Object.keys(by).sort().map(c=>`<details><summary>${esc(c)} · ${by[c].length}</summary><ul>`+
    by[c].sort((a,b)=>(a.surname+a.name).localeCompare(b.surname+b.name,'fr')).map(s=>`<li>${esc(s.surname)} ${esc(s.name)}</li>`).join('')+'</ul></details>').join('');
}).catch(()=>$('#students').textContent='Liste indisponible pour le moment.');

// Timeline : data/events.json
load('data/events.json').then(ev=>{
  $('#events').innerHTML=ev.map(e=>`<li><h3>${esc(e.month)}</h3><p><strong>${esc(e.title)}</strong>${e.text?'<br>'+esc(e.text):''}</p></li>`).join('');
}).catch(()=>$('#events').textContent='Timeline indisponible pour le moment.');

// Galerie : data/photos.json (généré automatiquement)
const grid=$('#grid'),more=$('#more'),dlg=$('#lb'),N=60;
let P=[],list=[],cat='',shown=0,cur=0;
const label=p=>p.title||'Souvenir · '+p.cat;
const fmt=d=>new Date(d).toLocaleDateString('fr-BE',{day:'numeric',month:'long',year:'numeric'});

function render(reset){
  if(reset){grid.innerHTML='';shown=0;list=P.filter(p=>!cat||p.cat===cat);$('#empty').hidden=list.length>0}
  grid.insertAdjacentHTML('beforeend',list.slice(shown,shown+N).map((p,i)=>
    `<button class="ph" data-i="${shown+i}"><img src="thumbs/${p.id}.webp" width="${p.w}" height="${p.h}" alt="${esc(label(p))}" loading="lazy" decoding="async"></button>`).join(''));
  shown=Math.min(shown+N,list.length);more.hidden=shown>=list.length;
}
more.onclick=()=>render();
grid.addEventListener('error',e=>e.target.closest('.ph')?.remove(),true); // image manquante : on l'ignore
grid.onclick=e=>{const b=e.target.closest('.ph');if(b)open(+b.dataset.i)};

function open(i){
  cur=(i+list.length)%list.length;const p=list[cur],im=$('img',dlg),cap=$('figcaption',dlg);
  im.alt=label(p);im.src=`photos/${p.id}.webp`;
  cap.textContent=[p.title,p.cat,p.date&&fmt(p.date)].filter(Boolean).join(' · ');
  im.onerror=()=>cap.textContent='Image indisponible.';
  if(!dlg.open)dlg.showModal();
}
$('#x').onclick=()=>dlg.close();
$('#prev').onclick=()=>open(cur-1);
$('#next').onclick=()=>open(cur+1);
dlg.onclick=e=>{if(e.target===dlg)dlg.close()};
dlg.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')open(cur-1);if(e.key==='ArrowRight')open(cur+1)});
let x0;dlg.ontouchstart=e=>x0=e.touches[0].clientX;
dlg.ontouchend=e=>{const d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>50)open(cur+(d<0?1:-1))};

load('data/photos.json').then(d=>{
  P=d.photos;
  $('#filters').innerHTML=['Tous',...d.categories].map((c,i)=>`<button aria-pressed="${!i}" data-c="${i?esc(c):''}">${esc(c)}</button>`).join('');
  $('#filters').onclick=e=>{const b=e.target.closest('button');if(!b)return;cat=b.dataset.c;
    [...$('#filters').children].forEach(x=>x.setAttribute('aria-pressed',x===b));render(true)};
  render(true);
}).catch(()=>{$('#empty').textContent='Galerie indisponible pour le moment.';$('#empty').hidden=false});
