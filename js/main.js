const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const load=u=>fetch(u).then(r=>{if(!r.ok)throw 0;return r.json()});
// minuscules + sans accents, pour que "ete" trouve "Été"
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

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
const sq=$('#sq');let S=[];
load('data/students.json').then(list=>{
  S=list;list.forEach((s,i)=>s.i=i);
  const by={};list.forEach(s=>(by[s.class||'—']??=[]).push(s));
  $('#students').innerHTML=Object.keys(by).sort().map(c=>`<details><summary>${esc(c)} · ${by[c].length}</summary><ul>`+
    by[c].sort((a,b)=>(a.surname+a.name).localeCompare(b.surname+b.name,'fr')).map(s=>
      `<li data-k="${esc(norm(s.name+' '+s.surname+' '+(s.class||'')))}"><button class="nm" data-i="${s.i}">${esc(s.surname)} ${esc(s.name)}</button></li>`).join('')+'</ul></details>').join('');
}).catch(()=>$('#students').textContent='Liste indisponible pour le moment.');

// Recherche d'un élève : on masque les noms qui ne correspondent pas
sq.oninput=()=>{
  const w=norm(sq.value).split(/\s+/).filter(Boolean);let total=0;
  document.querySelectorAll('#students details').forEach(d=>{
    let n=0;
    d.querySelectorAll('li').forEach(li=>{const ok=w.every(x=>li.dataset.k.includes(x));li.hidden=!ok;if(ok)n++});
    d.hidden=!n;d.open=!!w.length&&n>0;total+=n;
  });
  $('#snone').hidden=!w.length||total>0;
};
sq.onkeydown=e=>{if(e.key==='Enter')sq.blur()};

// Timeline : data/events.json
load('data/events.json').then(ev=>{
  $('#events').innerHTML=ev.map(e=>`<li><h3>${esc(e.month)}</h3><p><strong>${esc(e.title)}</strong>${e.text?'<br>'+esc(e.text):''}</p></li>`).join('');
}).catch(()=>$('#events').textContent='Timeline indisponible pour le moment.');

// Galerie : data/photos.json (généré automatiquement)
const grid=$('#grid'),more=$('#more'),dlg=$('#lb'),box=$('#q'),N=60;
let P=[],list=[],cat='',words=[],person=null,keep=false,shown=0,cur=0;
const label=p=>p.title||'Souvenir · '+p.cat;
const fmt=d=>new Date(d).toLocaleDateString('fr-BE',{day:'numeric',month:'long',year:'numeric'});

function showWho(){
  const w=$('#who');w.hidden=!person;
  if(person)w.innerHTML=`<span>Photos de <strong>${esc(person.label)}</strong></span><button id="nowho">× Tout afficher</button>`;
}
function pressCat(c){cat=c;[...$('#filters').children].forEach(x=>x.setAttribute('aria-pressed',(x.dataset.c||'')===c))}

function render(reset){
  if(reset){
    grid.innerHTML='';shown=0;
    list=P.filter(p=>(!cat||p.cat===cat)&&(!person||p.t.some(t=>person.keys.includes(t)))&&words.every(w=>p.k.includes(w)));
    const n=list.length;
    $('#empty').textContent=person?'Aucune photo de cette personne pour le moment.':words.length?'Aucune photo ne correspond à cette recherche.':'Aucune photo pour le moment.';
    $('#empty').hidden=n>0;
    $('#found').textContent=(words.length||person)&&n?`${n} photo${n>1?'s':''} trouvée${n>1?'s':''}`:'';
  }
  grid.insertAdjacentHTML('beforeend',list.slice(shown,shown+N).map((p,i)=>
    `<button class="ph" data-i="${shown+i}"><img src="thumbs/${p.id}.webp" width="${p.w}" height="${p.h}" alt="${esc(label(p))}" loading="lazy" decoding="async"></button>`).join(''));
  shown=Math.min(shown+N,list.length);more.hidden=shown>=list.length;
}
more.onclick=()=>render();
grid.addEventListener('error',e=>e.target.closest('.ph')?.remove(),true); // image manquante : on l'ignore
grid.onclick=e=>{const b=e.target.closest('.ph');if(b)open(+b.dataset.i)};

// Recherche : chaque mot tapé doit se trouver dans le titre ou dans les étiquettes
box.oninput=()=>{words=norm(box.value).split(/\s+/).filter(Boolean);if(P.length)render(true)};
box.onkeydown=e=>{if(e.key==='Enter')box.blur()}; // referme le clavier du téléphone

// Clic sur un élève (onglet Classes) : on affiche toutes ses photos
$('#students').onclick=e=>{
  const b=e.target.closest('.nm');if(!b)return;
  const s=S[+b.dataset.i];
  person={label:s.name+' '+s.surname,keys:[norm(s.name),norm(s.name+' '+s.surname),norm(s.surname+' '+s.name)]};
  box.value='';words=[];pressCat('');showWho();if(P.length)render(true);
  keep=true;location.hash='memories';
};
$('#who').onclick=e=>{if(e.target.closest('#nowho')){person=null;showWho();render(true)}};
// Quand on quitte Memories, le filtre « élève » est retiré
addEventListener('hashchange',()=>{if(keep)keep=false;else if(person){person=null;showWho();if(P.length)render(true)}});

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
  P=d.photos;P.forEach(p=>{p.t=(p.tags||[]).map(norm);p.k=norm(p.title+' '+(p.tags||[]).join(' '))});
  $('#filters').innerHTML=['Tous',...d.categories].map((c,i)=>`<button aria-pressed="${!i}" data-c="${i?esc(c):''}">${esc(c)}</button>`).join('');
  $('#filters').onclick=e=>{const b=e.target.closest('button');if(!b)return;pressCat(b.dataset.c);render(true)};
  render(true);
}).catch(()=>{$('#empty').textContent='Galerie indisponible pour le moment.';$('#empty').hidden=false});
