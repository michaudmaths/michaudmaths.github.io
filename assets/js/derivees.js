/* Entraînement aux dérivées : aucune dépendance, utilise le MathJax du site s’il existe, sinon charge MathJax. */
(()=>{

const $=s=>document.querySelector(s),rnd=n=>Math.floor(Math.random()*n),pick=a=>a[rnd(a.length)],shuf=a=>a.map(v=>[Math.random(),v]).sort((p,q)=>p[0]-q[0]).map(p=>p[1]);
const FQ='f(x)',FP="f'(x)",UX='u(x) = ',UPX="u'(x)";
const NM={cos:'cos',sin:'sin',tan:'tan',ln:'ln',atan:'arctan'};
/* arbre : une ligne = tableau d’éléments ; élément = caractère (string) ou objet {t,r:[lignes],n} */
const mk=(t,r,n)=>({t,r,n}),fr=(a,b)=>mk('fr',[a,b]),pw=n=>mk('pw',[String(n).split('')]),sq=a=>mk('sq',[a]),fn=(n,a)=>mk('fn',[a],n),ex=a=>mk('ex',[a]),pa=a=>mk('pa',[a]);
const W=(u,p)=>u.length===1&&(typeof u[0]==='string'||!p)?u:[pa(u)];
const sum=T=>{const o=[];T.forEach(([c,b])=>{if(!c)return;const a=Math.abs(c);if(o.length)o.push(c<0?'-':'+');else if(c<0)o.push('-');if(!b.length||a!==1)o.push(...String(a).split(''));o.push(...b)});return o.length?o:['0']};
const hasSum=r=>r.some((t,j)=>j&&(t==='+'||t==='-'));
/* fonctions, dérivées, affichages, erreurs classiques */
const F={poly:(L,u)=>L.a*u**L.n+L.b,quad:(L,u)=>L.a*u*u+L.b*u+L.c,exp:(L,u)=>Math.exp(u),ln:(L,u)=>Math.log(u),sqrt:(L,u)=>Math.sqrt(u),cos:(L,u)=>Math.cos(u),sin:(L,u)=>Math.sin(u),tan:(L,u)=>Math.tan(u),atan:(L,u)=>Math.atan(u),inv:(L,u)=>1/u};
const D={poly:(L,u)=>L.a*L.n*u**(L.n-1),quad:(L,u)=>2*L.a*u+L.b,exp:(L,u)=>Math.exp(u),ln:(L,u)=>1/u,sqrt:(L,u)=>.5/Math.sqrt(u),cos:(L,u)=>-Math.sin(u),sin:(L,u)=>Math.cos(u),tan:(L,u)=>1/Math.cos(u)**2,atan:(L,u)=>1/(1+u*u),inv:(L,u)=>-1/(u*u)};
const SH={poly:(L,u)=>sum([[L.a,[...W(u,L.n>1),...(L.n>1?[pw(L.n)]:[])]],[L.b,[]]]),quad:L=>sum([[L.a,['x',pw(2)]],[L.b,['x']],[L.c,[]]]),exp:(L,u)=>[ex(u)],sqrt:(L,u)=>[sq(u)],inv:(L,u)=>[fr(['1'],u)]};
['cos','sin','tan','ln','atan'].forEach(k=>SH[k]=(L,u)=>[fn(k,u)]);
const DD={poly:(L,u)=>L.n>1?sum([[L.a*L.n,[...W(u,L.n>2),...(L.n>2?[pw(L.n-1)]:[])]]]):sum([[L.a,[]]]),quad:L=>sum([[2*L.a,['x']],[L.b,[]]]),exp:(L,u)=>[ex(u)],ln:(L,u)=>[fr(['1'],u)],sqrt:(L,u)=>[fr(['1'],['2',sq(u)])],cos:(L,u)=>['-',fn('sin',u)],sin:(L,u)=>[fn('cos',u)],tan:(L,u)=>[fr(['1'],[fn('cos',u),pw(2)])],atan:(L,u)=>[fr(['1'],['1','+',...W(u,1),pw(2)])],inv:(L,u)=>['-',fr(['1'],[...W(u,1),pw(2)])]};
const WD={poly:(L,u)=>L.n>1?sum([[L.a*L.n,[...W(u,1),pw(L.n)]]]):sum([[L.a,W(u,0)]]),quad:L=>sum([[L.a,['x']],[L.b,[]]]),exp:(L,u)=>[...W(u,0),ex([...u,'-','1'])],ln:(L,u)=>[fr(['1'],[...W(u,1),pw(2)])],sqrt:(L,u)=>[fr(['1'],[sq(u)])],cos:(L,u)=>[fn('sin',u)],sin:(L,u)=>['-',fn('cos',u)],tan:(L,u)=>[fr(['1'],[fn('sin',u),pw(2)])],atan:(L,u)=>[fr(['1'],['1','-',...W(u,1),pw(2)])],inv:(L,u)=>[fr(['1'],[...W(u,1),pw(2)])]};
const UP=['u','′'],UU=['u'];
const CH={poly:L=>L.n>1?sum([[L.a*L.n,[...UP,'u',...(L.n>2?[pw(L.n-1)]:[])]]]):sum([[L.a,UP]]),exp:()=>[...UP,ex(UU)],ln:()=>[fr(UP,UU)],sqrt:()=>[fr(UP,['2',sq(UU)])],cos:()=>['-',...UP,fn('sin',UU)],sin:()=>[...UP,fn('cos',UU)],tan:()=>[fr(UP,[fn('cos',UU),pw(2)])],atan:()=>[fr(UP,['1','+','u',pw(2)])],inv:()=>['-',fr(UP,['u',pw(2)])]};
const pr=(f,i,m)=>(m&&hasSum(f))||(i&&f[0]==='-');
const prod=fs=>{const f2=fs.length>1?fs.filter(f=>!(f.length===1&&f[0]==='1')):fs,m=f2.length>1,o=[];f2.forEach((f,i)=>{if(i)o.push('*');o.push(...(pr(f,i,m)?[pa(f)]:f))});return o.length?o:['1']};
const ng=r=>hasSum(r)?['-',pa(r)]:r[0]==='-'?r.slice(1):['-',...r];
/* lecture d’une ligne -> fonction JS */
const FN={cos:Math.cos,sin:Math.sin,tan:Math.tan,ln:Math.log,atan:Math.atan};
function parseRow(R){if(!R.length)throw 0;let p=0;
const pe=()=>R[p],dg=c=>typeof c==='string'&&/^[0-9.]$/.test(c),sf=c=>c!==undefined&&c.t!=='pw'&&!'+-*/'.includes(c);
const ad=()=>{let v=te();while(pe()==='+'||pe()==='-'){const o=R[p++],a=v,b=te();v=o==='+'?x=>a(x)+b(x):x=>a(x)-b(x)}return v};
const te=()=>{let v=un();for(;;){const c=pe();if(c==='*'||c==='/'){p++;const a=v,b=un();v=c==='*'?x=>a(x)*b(x):x=>a(x)/b(x)}else if(sf(c)){const a=v,b=po();v=x=>a(x)*b(x)}else return v}};
const un=()=>{if(pe()==='-'){p++;const a=un();return x=>-a(x)}if(pe()==='+'){p++;return un()}return po()};
const po=()=>{let v=at();while(pe()&&pe().t==='pw'){const e=parseRow(R[p++].r[0]),a=v;v=x=>Math.pow(a(x),e(x))}return v};
const at=()=>{const c=R[p++];if(c===undefined)throw 0;if(dg(c)){let s=c;while(dg(pe()))s+=R[p++];const n=parseFloat(s);if(isNaN(n))throw 0;return()=>n}if(c==='x')return x=>x;if(typeof c==='string')throw 0;const a=parseRow(c.r[0]);if(c.t==='fr'){const b=parseRow(c.r[1]);return x=>a(x)/b(x)}if(c.t==='sq')return x=>Math.sqrt(a(x));if(c.t==='fn'){const f=FN[c.n];return x=>f(a(x))}if(c.t==='ex')return x=>Math.exp(a(x));if(c.t==='pa')return a;throw 0};
const v=ad();if(p<R.length)throw 0;return v}
/* équivalence numérique sur des points aléatoires du domaine de la dérivée */
function eq(h,g){let n=0;for(let i=0;i<60;i++){const x=Math.random()*7-3.5,t=g(x);if(!isFinite(t)||Math.abs(t)>1e7)continue;const v=h(x);if(!isFinite(v)||Math.abs(v-t)>1e-6*Math.max(1,Math.abs(t)))return false;n++}return n>=5}
/* génération */
function mkL(t){if(t==='poly'){const n=pick([1,2,2,3,4]),a=pick([1,1,2,3,-1,-2]);let b=pick([0,0,1,-1,2,3,-2]);if(n===1&&a===1&&b===0)b=pick([1,2,-1]);return{k:t,n,a,b}}if(t==='quad')return{k:t,a:pick([1,1,2,-1]),b:pick([-3,-2,-1,0,1,2,3]),c:pick([-2,-1,0,1,3])};return{k:t}}
function pickLayers(k){const P=['poly','poly','exp','ln','sqrt','cos','sin','tan','atan','inv'],L=[];let pv='';for(let i=0;i<k;i++){const pool=i===k-1?[...P,'quad','quad']:P;let t,g=0;do{t=pick(pool);g++}while(g<50&&(t===pv||(pv==='ln'&&t==='exp')||(pv==='exp'&&t==='ln')||(t==='quad'&&pv==='poly')));pv=t;L.push(mkL(t))}return L}
function build(L){const k=L.length,A=Array(k);A[k-1]=['x'];for(let i=k-2;i>=0;i--)A[i]=SH[L[i+1].k](L[i+1],A[i+1]);
const f=x=>{let u=x;for(let i=k-1;i>=0;i--)u=F[L[i].k](L[i],u);return u};
const g=x=>{let u=x,p=1;for(let i=k-1;i>=0;i--){p*=D[L[i].k](L[i],u);u=F[L[i].k](L[i],u)}return p};
return{L,A,f,g,expr:SH[L[0].k](L[0],A[0]),fs:L.map((l,i)=>DD[l.k](l,A[i]))}}
function valid(q){let c=0;for(let x=-3.5;x<=3.51;x+=.1){const y=q.f(x),d=q.g(x);if(!isFinite(y)||!isFinite(d)||Math.abs(y)>1e6||Math.abs(d)>1e6)continue;const h=1e-5,n=(q.f(x+h)-q.f(x-h))/(2*h);if(Math.abs(d)<100&&isFinite(n)&&Math.abs(n-d)>1e-4*(1+Math.abs(d)))return false;c++}return c>=20}
function opts(q){const{L,A,fs}=q,cor=prod(fs),C=[ng(cor)];if(L.length>1)C.push(prod(fs.slice(0,-1)));
L.forEach((l,i)=>{const v=prod(fs.map((f,j)=>j===i?WD[l.k](l,A[i]):f));C.push(v,ng(v))});
const seen=new Set([JSON.stringify(cor)]),res=[];
for(const c of shuf(C)){const key=JSON.stringify(c);if(seen.has(key))continue;seen.add(key);try{if(eq(parseRow(c),q.g))continue}catch(e){continue}res.push(c);if(res.length===3)break}
if(res.length<3)return null;const l=shuf([cor,...res]);return{list:l,ci:l.indexOf(cor)}}
function gen(){for(;;){const M=$('#dv-nc').value,k=M==='m'?1+rnd(3):+M,q=build(pickLayers(k));if(!valid(q))continue;q.o=opts(q);if(q.o)return q}}
/* rendu TeX via MathJax (mêmes polices que le reste du site) */
const TD=s=>'{\\displaystyle '+s+'}',CUR='{\\color{#3b7bff}\\vert}',PHT='{\\color{#8a94a6}\\square}';
const TNM={cos:'\\cos',sin:'\\sin',tan:'\\tan',ln:'\\ln',atan:'\\arctan'};
function T(r,c,ph){let s='',pp=false;for(let j=0;j<=r.length;j++){if(c&&c.row===r&&c.i===j)s+=CUR;if(j<r.length){const t=r[j];let u;
if(typeof t==='string')u=t==='*'?'\\times ':t==='.'?'{.}':t==='′'?"'":t;
else{const a=i=>T(t.r[i],c,ph)||'{}';switch(t.t){case'fr':u=`\\frac{${a(0)}}{${a(1)}}`;break;case'pw':u=(pp?'{}':'')+`^{${a(0)}}`;break;case'sq':u=`\\sqrt{${a(0)}}`;break;case'fn':u=`${TNM[t.n]}\\left(${a(0)}\\right)`;break;case'ex':u=`{e^{${a(0)}}}`;break;default:u=`\\left(${a(0)}\\right)`}}
pp=typeof t==='object'&&t.t==='pw';s+=u}}if(ph&&!r.length)s+=PHT;return s}
const M=r=>'\\('+TD(T(r))+'\\)',MP=(p,r)=>'\\('+TD(p+T(r))+'\\)';
const typeset=el=>{try{if(window.MathJax&&MathJax.typesetPromise)return MathJax.typesetPromise([el]).catch(()=>{});if(window.MathJax&&MathJax.Hub)MathJax.Hub.Queue(['Typeset',MathJax.Hub,el])}catch(e){}return Promise.resolve()};
function startMath(cb){const go=()=>{if(window.MathJax&&MathJax.startup&&MathJax.startup.promise)MathJax.startup.promise.then(cb,cb);else cb()};if(window.MathJax){go();return}
window.MathJax={svg:{fontCache:'none'},startup:{typeset:false}};const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js';s.onload=go;s.onerror=cb;document.head.appendChild(s)}
/* champ de réponse : composé hors écran puis échangé, pour éviter tout clignotement */
function stage(tex,el){const my=el._s=(el._s||0)+1,st=document.createElement('div');st.style.cssText='position:absolute;visibility:hidden;left:0;top:0';st.textContent=tex;document.body.appendChild(st);
typeset(st).then(()=>{if(el._s===my&&el.isConnected)el.replaceChildren(...st.childNodes);try{MathJax.typesetClear([st])}catch(e){}st.remove()})}
function ed2(){const el=$('#dv-ed');if(el)stage('\\('+TD(FP+' = '+T(ed.root,{row:ed.row,i:ed.i},true))+'\\)',el)}
/* éditeur WYSIWYG */
let ed;const newEd=()=>{const r=[];ed={root:r,row:r,i:0}};
const lk=it=>it.r.forEach(r=>r.u=it);
function ins(it){const q=ed.row;q.splice(ed.i++,0,it);if(typeof it==='object'){it.p=q;lk(it)}}
const into=(it,k)=>{ed.row=it.r[k];ed.i=0};
function put(it,k=0){ins(it);into(it,k)}
function frac(){const q=ed.row;let j=ed.i;while(j>0&&!'+-*/'.includes(q[j-1]))j--;const num=q.splice(j,ed.i-j);ed.i=j;num.forEach(t=>{if(typeof t==='object')t.p=num});const it=fr(num,[]);ins(it);into(it,num.length?1:0)}
function left(){const q=ed.row;if(ed.i>0){const p=q[ed.i-1];if(typeof p==='object'){ed.row=p.r[p.r.length-1];ed.i=ed.row.length}else ed.i--}else if(q.u){const it=q.u,k=it.r.indexOf(q);if(k>0){ed.row=it.r[k-1];ed.i=ed.row.length}else{ed.row=it.p;ed.i=it.p.indexOf(it)}}}
function right(){const q=ed.row;if(ed.i<q.length){const n=q[ed.i];if(typeof n==='object'){ed.row=n.r[0];ed.i=0}else ed.i++}else if(q.u){const it=q.u,k=it.r.indexOf(q);if(k<it.r.length-1){ed.row=it.r[k+1];ed.i=0}else{ed.row=it.p;ed.i=it.p.indexOf(it)+1}}}
const ud=k=>{const it=ed.row.u;if(it&&it.t==='fr'){const n=it.r[k];if(n&&it.r.indexOf(ed.row)!==k){ed.row=n;ed.i=Math.min(ed.i,n.length)}}};
const up=()=>ud(0),down=()=>ud(1),clr=()=>newEd(),em=it=>it.r.every(r=>!r.length);
function bs(){const q=ed.row;if(ed.i>0){const p=q[ed.i-1];if(typeof p==='object'&&!em(p))left();else{q.splice(ed.i-1,1);ed.i--}}else if(q.u){const it=q.u;if(em(it)){const o=it.p,j=o.indexOf(it);o.splice(j,1);ed.row=o;ed.i=j}else left()}}
const t=c=>()=>ins(c);
const KEYS=[['7','n',t('7')],['8','n',t('8')],['9','n',t('9')],['<span class="fr"><span class="nu">▯</span><span class="de">▯</span></span>','',frac],['<i class="v">x</i>','f',t('x')],['⌫','',bs],
['4','n',t('4')],['5','n',t('5')],['6','n',t('6')],['×','',t('*')],['<i class="v">x</i><sup>▯</sup>','f',()=>put(pw(''))],['AC','',clr],
['1','n',t('1')],['2','n',t('2')],['3','n',t('3')],['−','',t('-')],['<i class="v">x</i><sup>2</sup>','f',()=>ins(pw(2))],['√','f',()=>put(sq([]))],
['0','n',t('0')],['.','n',t('.')],['( )','f',()=>put(pa([]))],['+','',t('+')],['e<sup><i class="v">x</i></sup>','f',()=>put(ex([]))],['ln','f',()=>put(fn('ln',[]))],
['cos','f',()=>put(fn('cos',[]))],['sin','f',()=>put(fn('sin',[]))],['tan','f',()=>put(fn('tan',[]))],['arctan','f',()=>put(fn('atan',[]))],['&#x25C0;&#xFE0E;','arr',left],['&#x25B6;&#xFE0E;','arr',right],
['&#x25B2;&#xFE0E;','arr',up],['&#x25BC;&#xFE0E;','arr',down]];
/* état de l’exercice */
const savedKey='michaudmaths.derivees.saved.v1',clone=v=>JSON.parse(JSON.stringify(v));
function loadSaved(){try{const a=JSON.parse(localStorage.getItem(savedKey)||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}}
function storeSaved(){try{localStorage.setItem(savedKey,JSON.stringify(saved));return true}catch(e){return false}}
const questionKey=x=>x?JSON.stringify(x.L):'';
let saved=loadSaved();
let q,mode='free',solved=false,counted=false,ms=null,pk=-1;const SC={ok:0,n:0,s:0};
function updateSavedUI(){const save=$('#dv-save'),toggle=$('#dv-saved-toggle');if(!save||!toggle)return;const hit=q&&saved.some(x=>JSON.stringify(x.L)===questionKey(q));save.disabled=!q||hit;save.classList.toggle('saved',!!hit);save.textContent=hit?'Enregistrée':'Enregistrer';toggle.textContent=`Questions enregistrées (${saved.length})`}
function showQuestion(question){q=question;newEd();solved=false;counted=false;ms=null;pk=-1;draw();updateSavedUI()}
function next(){showQuestion(gen())}
function renderSaved(){const list=$('#dv-saved-list');if(!list)return;list.replaceChildren();if(!saved.length){const p=document.createElement('p');p.textContent='Aucune question enregistrée.';list.append(p);return}
saved.forEach(item=>{let preview;try{preview=build(item.L)}catch(e){return}const box=document.createElement('div');box.className='saved-item';const formula=document.createElement('div');formula.className='m';formula.textContent=MP(FQ+' = ',preview.expr);const acts=document.createElement('div');acts.className='saved-actions';const open=document.createElement('button');open.type='button';open.className='b';open.textContent='Ouvrir';open.onclick=()=>{const restored=build(clone(item.L));restored.o=item.o?clone(item.o):opts(restored);showQuestion(restored);list.hidden=true};const del=document.createElement('button');del.type='button';del.className='b';del.textContent='Supprimer';del.onclick=()=>{saved=saved.filter(x=>x.id!==item.id);storeSaved();renderSaved();updateSavedUI()};acts.append(open,del);box.append(formula,acts);list.append(box)});typeset(list)}
function saveCurrent(){if(!q||saved.some(x=>JSON.stringify(x.L)===questionKey(q)))return;const item={id:`${Date.now()}-${Math.random()}`,L:clone(q.L),o:clone(q.o)};saved.unshift(item);if(!storeSaved()){saved.shift();return}updateSavedUI();const list=$('#dv-saved-list');if(list&&!list.hidden)renderSaved()}
function fin(good){if(!counted){counted=true;SC.n++;if(good){SC.ok++;SC.s++}else SC.s=0}solved=true;draw()}
function check(){if(solved||mode!=='free')return;let h;try{h=parseRow(ed.root)}catch(e){ms={t:'Expression incomplète ou invalide : remplis toutes les cases.',c:'ko'};draw();return}
if(eq(h,q.g)){ms={t:'Correct !',c:'ok'};fin(true)}else{if(!counted){counted=true;SC.n++;SC.s=0}ms={t:'Pas encore : ce n’est pas la bonne dérivée. Corrigez votre réponse ou affiche la solution.',c:'ko'};draw()}}
function draw(){$('#dv-sc').textContent=`Score : ${SC.ok} / ${SC.n} · série : ${SC.s}`;const free=mode==='free';
let h=`<div class="card"><div class="lb">Calcule la dérivée de</div><div class="m">${MP(FQ+' = ',q.expr)}</div></div>`;
if(free)h+=`<div class="card"><div class="lb">Votre réponse</div><div class="m"${solved?'':' id="dv-ed"'}>${solved?MP(FP+' = ',ed.root):''}</div></div>`;
else h+=q.o.list.map((r,j)=>`<button class="opt m${solved?(j===q.o.ci?' ok':j===pk?' ko':''):''}" data-j="${j}"><span class="mu">${'abcd'[j]})</span> ${M(r)}</button>`).join('');
if(ms)h+=`<div class="msg ${ms.c}">${ms.t}</div>`;
if(solved){h+=`<div class="card"><div class="lb">Solution</div><div class="m">${MP(FP+' = ',prod(q.fs))}</div><div class="lb" style="margin-top:8px">Détail, de l’extérieur vers l’intérieur (u désigne la fonction à l’intérieur)</div>`;
q.L.forEach((l,i)=>{const last=i===q.L.length-1,Ai=q.A[i],qd=l.k==='quad';
h+=`<div class="m st">${qd?M(SH.quad(l)):M(SH[l.k](l,UU))} <span class="mu">a pour dérivée</span> ${qd?M(DD.quad(l)):M(CH[l.k](l))}</div>`;
if(!qd)h+=`<div class="m st"><span class="mu">Ici on prend</span> ${MP(UX,Ai)}${last?'':`<span class="mu">, avec</span> ${MP(UPX+' = ',prod(q.fs.slice(i+1)))}`}<span class="mu">, donc</span> ${M(SH[l.k](l,Ai))} <span class="mu">a pour dérivée</span> ${M(prod(q.fs.slice(i)))}</div>`});
h+=`</div><div class="acts"><button class="b pri" data-a="next">Question suivante</button></div>`}
else if(free)h+=`<div class="acts"><button class="b pri" data-a="val">Valider</button><button class="b" data-a="sol">Voir la solution</button></div>`;
$('#dv-qa').innerHTML=h;typeset($('#dv-qa'));$('#dv-kp').hidden=!free||solved;ed2()}
/* interactions */
KEYS.forEach(([l,c,f])=>{const b=document.createElement('button');b.innerHTML=l;b.className=c;b.onclick=()=>{if(!solved){f();ed2()}};$('#dv-kp').append(b)});
$('#dv-qa').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.a==='next')next();else if(b.dataset.a==='val')check();else if(b.dataset.a==='sol'){ms=null;fin(false)}else if(b.dataset.j&&!solved){pk=+b.dataset.j;const g=pk===q.o.ci;ms={t:g?'Bonne réponse.':'Ce n’est pas la bonne réponse : compare avec la solution ci-dessous.',c:g?'ok':'ko'};fin(g)}};
document.querySelectorAll('#deriv .seg button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#deriv .seg button').forEach(x=>x.classList.toggle('on',x===b));mode=b.dataset.m;draw()});
const saveButton=$('#dv-save'),savedToggle=$('#dv-saved-toggle');
if(saveButton)saveButton.onclick=saveCurrent;
if(savedToggle)savedToggle.onclick=()=>{const list=$('#dv-saved-list');if(!list)return;const open=list.hidden;if(open)renderSaved();list.hidden=!open};
document.addEventListener('mousedown',e=>{if(e.target.closest('#deriv button'))e.preventDefault()});
document.addEventListener('keydown',e=>{if(mode!=='free'||e.ctrlKey||e.metaKey||e.altKey)return;const T=e.target.tagName,k=e.key;if(T==='SELECT'||T==='INPUT'||T==='TEXTAREA'||(T==='BUTTON'&&k==='Enter'))return;
if(solved){if(k==='Enter'){e.preventDefault();next()}return}
let h=1;if(/^[0-9.x+\-*]$/.test(k))ins(k);else if(k==='/')frac();else if(k==='^')put(pw(''));else if(k==='(')put(pa([]));
else if(k===')'){const it=ed.row.u;if(it&&it.t==='pa'){ed.row=it.p;ed.i=it.p.indexOf(it)+1}}
else if(k==='Enter')check();else if(k==='Backspace')bs();else if(k==='ArrowLeft')left();else if(k==='ArrowRight')right();else if(k==='ArrowUp')up();else if(k==='ArrowDown')down();else h=0;
if(h){e.preventDefault();if(k!=='Enter')ed2()}});
updateSavedUI();
window.addEventListener('load',()=>startMath(next));

})();
