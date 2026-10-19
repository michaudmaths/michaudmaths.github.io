(function(){
const INF=Infinity,R=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[Math.floor(Math.random()*a.length)];
const sgn=Math.sign;
const typeset=el=>{try{if(window.MathJax&&MathJax.typesetPromise)return MathJax.typesetPromise([el]).catch(()=>{});if(window.MathJax&&MathJax.Hub)MathJax.Hub.Queue(['Typeset',MathJax.Hub,el])}catch(e){}return Promise.resolve()};
/* ---- TeX helpers ---- */
function fmtT(v){if(v===INF)return'+\\infty';if(v===-INF)return'-\\infty';if(Number.isInteger(v))return String(v);
for(let d=2;d<=12;d++){const n=v*d;if(Math.abs(n-Math.round(n))<1e-9){const m=Math.round(n);return(m<0?'-':'')+`\\frac{${Math.abs(m)}}{${d}}`}}
return v.toFixed(3)}
const fmtV=o=>o.t?o.t:o.v===0&&o.s?`0^{${o.s>0?'+':'-'}}`:fmtT(o.v);
function polyT(co,A){let s='';for(let d=co.length-1;d>=0;d--){const c=co[d];if(!c)continue;const m=Math.abs(c);
const t=d===0?String(m):(m===1?'':m)+A+(d>1?`^{${d}}`:'');
s+=s===''?(c<0?'-':'')+t:(c<0?' - ':' + ')+t}return s||'0'}
const ptT=p=>p==='+inf'?'+\\infty':p==='-inf'?'-\\infty':p==='0+'?'0^{+}':p==='0-'?'0^{-}':String(p);
const limT_=(p,f)=>`\\[\\displaystyle\\lim_{x\\to ${ptT(p)}} ${f}\\]`;

/* ---------- Famille A : compositions de 1 à 3 fonctions ---------- */
function render(n){switch(n.k){case'x':return'x';case'raw':return n.tex;
case'poly':{const r=render(n.a);return polyT(n.co,r==='x'?'x':`\\left(${r}\\right)`)}
case'exp':return`e^{${render(n.a)}}`;
case'ln':{const r=render(n.a);return r==='x'?'\\ln x':`\\ln\\left(${r}\\right)`}
case'sqrt':return`\\sqrt{${render(n.a)}}`;
case'inv':return`\\frac{1}{${render(n.a)}}`}}
function apply(kind,{v,s},last,aff){
if(kind==='poly'){const d=(aff||(s!==0&&Number.isFinite(v)))?1:pick([1,2,2,3]),co=[];for(let j=0;j<d;j++)co.push(R(-4,4));
let l=R(1,3)*pick([-1,1]);co.push(l);
if(v===INF||v===-INF){return{co,v:sgn(l)*(d%2===0?1:sgn(v))*INF,s:0}}
let val=0,der=0;for(let j=0;j<=d;j++){val+=co[j]*v**j;if(j)der+=j*co[j]*v**(j-1)}
if(s!==0){if(der===0)return null;return{co,v:val,s:sgn(der)*s}}return{co,v:val,s:0}}
if(kind==='exp'){if(v===INF)return{v:INF,s:0};if(v===-INF)return{v:0,s:1};if(v===0)return{v:1,s};if(last&&Number.isInteger(v)&&Math.abs(v)<=9)return{v:Math.exp(v),s,t:`e^{${v}}`};return null}
if(kind==='ln'){if(v===INF)return{v:INF,s:0};if(v===0&&s===1)return{v:-INF,s:0};if(v===1)return{v:0,s};if(last&&Number.isInteger(v)&&v>1&&v<=20)return{v:Math.log(v),s,t:`\\ln ${v}`};return null}
if(kind==='sqrt'){if(v===INF)return{v:INF,s:0};if(v===0&&s===1)return{v:0,s:1};
if(v>0&&v!==INF&&Number.isInteger(Math.sqrt(v)))return{v:Math.sqrt(v),s};if(last&&Number.isInteger(v)&&v>0&&v<=20)return{v:Math.sqrt(v),s,t:`\\sqrt{${v}}`};return null}
if(kind==='inv'){if(v===INF||v===-INF)return{v:0,s:sgn(v)};if(v===0&&s!==0)return{v:s*INF,s:0};
if(v!==0&&Number.isInteger(v)&&Math.abs(v)<=4)return{v:1/v,s:-s};return null}}
function genA(){
const pt=pick(['+inf','+inf','-inf','0+','0-',pick([-2,-1,1,2,3])]);
let val=pt==='+inf'?{v:INF,s:0}:pt==='-inf'?{v:-INF,s:0}:pt==='0+'?{v:0,s:1}:pt==='0-'?{v:0,s:-1}:{v:pt,s:0};
const n=pick([1,2,2,3,3]);let node={k:'x'},prev='',steps=[];
for(let i=0;i<n;i++){const kind=pick(['poly','poly','exp','ln','sqrt','inv']);
if(kind===prev)return null;
if(n===1&&Number.isFinite(val.v)&&(kind==='poly'||val.v!==0))return null;
const r=apply(kind,val,i===n-1);if(!r)return null;
node=r.co?{k:kind,co:r.co,a:node}:{k:kind,a:node};val={v:r.v,s:r.s,t:r.t};prev=kind;
steps.push(`\\(\\lim_{x\\to ${ptT(pt)}} ${render(node)} = ${fmtV(val)}\\)`)}
return{pt,tex:render(node),ans:val.v,ansT:val.t,
why:'On progresse de l’intérieur vers l’extérieur (limite d’une composée) :',steps}}

/* ---------- Famille B : croissances comparées ---------- */
function mkAtom(kind,mono){if(kind==='poly'){const d=pick([1,2,3]),co=[];
for(let j=0;j<d;j++)co.push(mono?0:R(-3,3));co.push(R(1,3)*(mono?1:pick([-1,1])));return{kind,co}}
if(kind==='exp')return{kind,k:pick([-3,-2,-1,1,2,3])};return{kind}}
function vec(a,pt){if(a.kind==='poly'){if(pt==='0+'){const j=a.co.findIndex(c=>c);return[a.co[j],0,j,0]}return[a.co[a.co.length-1],0,a.co.length-1,0]}
if(a.kind==='const')return[1,0,0,0];if(a.kind==='sqrt')return[1,0,.5,0];if(a.kind==='ln')return[1,0,0,1];return[1,a.k,0,0]}
function conv([c,r,p,q],pt){if(pt==='-inf')return[c*(-1)**p,-r,p,q];if(pt==='0+')return[c*(-1)**q,r,-p,q];return[c,r,p,q]}
function limT([c,r,p,q]){const u=(x,w)=>x>0?sgn(c)*INF:0;
if(r)return{v:u(r),w:'exp'};if(p)return{v:u(p),w:'pow'};if(q)return{v:u(q),w:'ln'};return{v:c,w:'const'}}
function atomT(a,pt,wrap){if(a.kind==='poly'){const h=polyT(a.co,'x');return wrap&&a.co.filter(c=>c).length>1?`\\left(${h}\\right)`:h}
if(a.kind==='sqrt')return'\\sqrt{x}';if(a.kind==='ln')return'\\ln x';
const k=a.k;
if(pt==='0+')return`e^{${k<0?'-':''}\\frac{${Math.abs(k)}}{x}}`;
return`e^{${k===1?'x':k===-1?'-x':k+'x'}}`}
const sufT=pt=>pt==='0+'?' (on pose \\(t=1/x\\))':pt==='-inf'?' (on pose \\(t=-x\\))':'';
function genB(){
const pt=pick(['+inf','+inf','-inf','0+']);const av=pt==='-inf'?['poly','exp']:['poly','sqrt','ln','exp'];
const rr=Math.random();
if(rr<.55)return genF(pt,av);
if(rr<.8){ // produit / quotient
const m=pick([2,2,3]);const at=[],kinds=[];
for(let i=0;i<m;i++){const kind=pick(av);if(kind!=='poly'&&kinds.includes(kind))return null;kinds.push(kind);
at.push({a:mkAtom(kind,false),e:pick([1,-1])})}
if(at.every(x=>x.e<0))at[0].e=1;
let t=[1,0,0,0];for(const{a,e}of at){const v=vec(a,pt);t=[t[0]*v[0]**e,t[1]+e*v[1],t[2]+e*v[2],t[3]+e*v[3]]}
const L=limT(conv(t,pt));
const num=at.filter(x=>x.e>0),den=at.filter(x=>x.e<0);
const hs=g=>g.map(x=>atomT(x.a,pt,g.length>1)).join('\\,');
const tex=den.length?`\\frac{${hs(num)}}{${hs(den)}}`:hs(num);
const why={exp:'Croissances comparées : l’exponentielle l’emporte sur les puissances et sur le logarithme.',
pow:'Croissances comparées : une puissance de \\(x\\) l’emporte sur \\(\\ln x\\) ; sinon on compare les exposants.',
ln:'Seules des puissances de \\(\\ln x\\) subsistent : on compare leurs exposants.',
const:'Les termes de plus haut degré (plus bas degré en \\(0^{+}\\)) se simplifient : la limite est le rapport de leurs coefficients.'}[L.w]+sufT(pt);
return{pt,tex,ans:L.v,why,steps:[]}}
// somme / différence
const m=pick([2,2,3]),kinds=[],terms=[];
for(let i=0;i<m;i++){const kind=pick(av);if(kinds.includes(kind))return null;kinds.push(kind);
const a=mkAtom(kind,true),k=R(1,3),sg=pick([-1,1]),v=vec(a,pt);v[0]*=k*sg;
terms.push({a,k,sg,c:conv(v,pt)})}
const cmp=(x,y)=>{for(let i=1;i<4;i++){if(x[i]!==y[i])return x[i]-y[i]}return 0};
const s=terms.slice().sort((x,y)=>cmp(y.c,x.c));
if(cmp(s[0].c,s[1].c)===0)return null;
const b=t=>(t.k>1?t.k:'')+atomT(t.a,pt,false);
const tex=terms.map((t,i)=>i===0?(t.sg<0?'-':'')+b(t):(t.sg<0?' - ':' + ')+b(t)).join('');
const d=s[0],L=limT(d.c);
return{pt,tex,ans:L.v,why:`Terme dominant : \\(${(d.sg<0?'-':'')+b(d)}\\). Il l’emporte sur les autres par croissances comparées${sufT(pt)}.`,steps:[]}}

/* ---------- Famille C : ln, exp, racine, inverse d'une fraction ---------- */
function genC(){
const pt=pick(['+inf','+inf','-inf','0+']);const av=pt==='-inf'?['poly','exp']:['poly','sqrt','ln','exp'];
const F=genF(pt,av,true);if(!F)return null;
let val=F.val,node={k:'raw',tex:F.tex},prev='';
const steps=[`\\(\\lim_{x\\to ${ptT(pt)}} ${F.tex} = ${fmtV(val)}\\)`];
const n=pick([1,1,2]);
for(let i=0;i<n;i++){const kind=pick(['exp','ln','ln','sqrt','inv','poly']);
if(kind===prev)return null;
const r=apply(kind,val,i===n-1,true);if(!r)return null;
node=r.co?{k:kind,co:r.co,a:node}:{k:kind,a:node};val={v:r.v,s:r.s,t:r.t};prev=kind;
steps.push(`\\(\\lim_{x\\to ${ptT(pt)}} ${render(node)} = ${fmtV(val)}\\)`)}
return{pt,tex:render(node),ans:val.v,ansT:val.t,why:'On calcule d’abord la limite de l’expression intérieure, puis on compose :',steps}}

/* ---------- Fractions : (somme de termes) / (somme de termes) ---------- */
function genF(pt,av,inner){
const cmp=(x,y)=>{for(let i=1;i<4;i++){if(x[i]!==y[i])return x[i]-y[i]}return 0};
const side=()=>{const m=pick([1,2,2]),kinds=[],terms=[];
for(let i=0;i<m;i++){const kind=pick(Math.random()<.4?['const',...av]:av);if(kinds.includes(kind))return null;kinds.push(kind);
const a=mkAtom(kind,true),k=R(1,3),sg=pick([-1,1]),v=vec(a,pt);v[0]*=k*sg;
terms.push({a,k,sg,c:conv(v,pt)})}
const s=terms.slice().sort((x,y)=>cmp(y.c,x.c));
if(s.length>1&&cmp(s[0].c,s[1].c)===0)return null;
const b=t=>t.a.kind==='const'?String(t.k):(t.k>1?t.k:'')+atomT(t.a,pt,false);
return{kinds,n:m,safe:m===1||kinds.includes('const'),c:s[0].c,dom:(s[0].sg<0?'-':'')+b(s[0]),
tex:terms.map((t,i)=>i===0?(t.sg<0?'-':'')+b(t):(t.sg<0?' - ':' + ')+b(t)).join('')}};
const N=side(),D=side();if(!N||!D)return null;
if(N.kinds.concat(D.kinds).every(k=>k==='const'))return null;
if(!inner&&![...N.kinds,...D.kinds].some(k=>k==='exp'||k==='ln'))return null;
if(limT(D.c).v===0&&D.n>1)return null;
if(N.tex===D.tex)return null;
const t=[N.c[0]/D.c[0],N.c[1]-D.c[1],N.c[2]-D.c[2],N.c[3]-D.c[3]];
const L=limT(t);if(inner)return{pt,tex:`\\frac{${N.tex}}{${D.tex}}`,val:{v:L.v,s:L.v===0&&N.safe&&D.safe?sgn(t[0]):0}};
return{pt,tex:`\\frac{${N.tex}}{${D.tex}}`,ans:L.v,
why:`Terme dominant au numérateur : \\(${N.dom}\\) ; au dénominateur : \\(${D.dom}\\). On factorise par ces termes : les croissances comparées donnent la limite${sufT(pt)}.`,steps:[]}}

/* ---------- Analyse des réponses saisies (sans eval) ---------- */
function parseA(str){try{
const s=str.replace(/\s+/g,'').replace(/[−–]/g,'-').replace(/,/g,'.').replace(/√/g,'sqrt').replace(/[×·]/g,'*').replace(/÷/g,'/').replace(/π/g,'pi').replace(/[{[]/g,'(').replace(/[}\]]/g,')').toLowerCase();
if(!s)return NaN;let i=0;const pk=()=>s[i];
const expr=()=>{let v=term();while(pk()==='+'||pk()==='-'){const o=s[i++],t=term();v=o==='+'?v+t:v-t}return v};
const term=()=>{let v=un();for(;;){const c=pk();if(c==='*'||c==='/'){i++;const t=un();v=c==='*'?v*t:v/t}else if(c&&/[0-9.(a-z]/.test(c))v*=un();else break}return v};
const un=()=>{if(pk()==='-'){i++;return-un()}if(pk()==='+'){i++;return un()}return pw()};
const pw=()=>{const b=at();if(pk()==='^'){i++;return Math.pow(b,un())}return b};
const at=()=>{if(pk()==='('){i++;const v=expr();if(pk()!==')')throw 0;i++;return v}
let m=s.slice(i).match(/^(\d+\.?\d*|\.\d+)/);if(m){i+=m[0].length;return parseFloat(m[0])}
m=s.slice(i).match(/^[a-z]+/);if(!m)throw 0;const id=m[0];i+=id.length;
if(id==='e')return Math.E;if(id==='pi')return Math.PI;
const F={ln:Math.log,exp:Math.exp,sqrt:Math.sqrt};if(!F[id])throw 0;
return F[id](pk()==='('?at():pw())};
const v=expr();return i===s.length&&Number.isFinite(v)?v:NaN}catch(e){return NaN}}

/* ---------- Interface ---------- */
const $=id=>document.getElementById(id);
const choiceIds=['pinf','minf','zero'];
const savedKey='michaudmaths.limites.saved.v1';
const pack=v=>JSON.stringify(v,(k,x)=>x===INF?'__INF__':x===-INF?'__NINF__':x);
const unpack=s=>JSON.parse(s,(k,x)=>x==='__INF__'?INF:x==='__NINF__'?-INF:x);
function loadSaved(){try{const a=unpack(localStorage.getItem(savedKey)||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}}
function storeSaved(){try{localStorage.setItem(savedKey,pack(saved));return true}catch(e){return false}}
const questionKey=q=>q?`${q.pt}|${q.tex}`:'';
let saved=loadSaved();
let cur=null,done=false,choice=null,tot=0,good=0,streak=0;
function clearChoice(){choice=null;choiceIds.forEach(id=>{$(id).classList.remove('sel');$(id).setAttribute('aria-pressed','false')})}
function selectChoice(val,id){if(done)return;$('inp').value='';$('inp').style.borderColor='';clearChoice();choice=val;$(id).classList.add('sel');$(id).setAttribute('aria-pressed','true')}
function updateSavedUI(){const hit=cur&&saved.some(x=>questionKey(x.q)===questionKey(cur));$('lim-save').disabled=!cur||hit;$('lim-save').classList.toggle('saved',!!hit);$('lim-save').textContent=hit?'Enregistrée':'Enregistrer';$('lim-saved-toggle').textContent=`Questions enregistrées (${saved.length})`}
function showQ(f){cur=f;done=false;$('q').textContent=limT_(f.pt,f.tex);typeset($('q'));
$('inp').value='';clearChoice();['inp','ok','pinf','minf','zero'].forEach(i=>$(i).disabled=false);
$('fb').className='';$('fb').innerHTML='';$('next').style.display='none';updateSavedUI();$('inp').focus()}
function newQ(){const mode=$('mode').value;let f=null;
for(let i=0;i<2000&&!f;i++){f=mode==='A'?(Math.random()<.5?genA():genC()):mode==='B'?genB():(()=>{const r=Math.random();return r<.2?genA():r<.45?genC():genB()})()}
showQ(f)}
function renderSaved(){const list=$('lim-saved-list');list.replaceChildren();if(!saved.length){const p=document.createElement('p');p.textContent='Aucune question enregistrée.';list.append(p);return}
saved.forEach(item=>{const box=document.createElement('div');box.className='saved-item';const formula=document.createElement('div');formula.className='q';formula.textContent=limT_(item.q.pt,item.q.tex);const acts=document.createElement('div');acts.className='saved-actions';const open=document.createElement('button');open.type='button';open.textContent='Ouvrir';open.onclick=()=>{showQ(unpack(pack(item.q)));list.hidden=true};const del=document.createElement('button');del.type='button';del.textContent='Supprimer';del.onclick=()=>{saved=saved.filter(x=>x.id!==item.id);storeSaved();renderSaved();updateSavedUI()};acts.append(open,del);box.append(formula,acts);list.append(box)});typeset(list)}
function saveCurrent(){if(!cur||saved.some(x=>questionKey(x.q)===questionKey(cur)))return;const item={id:`${Date.now()}-${Math.random()}`,q:unpack(pack(cur))};saved.unshift(item);if(!storeSaved()){saved.shift();return}updateSavedUI();if(!$('lim-saved-list').hidden)renderSaved()}
function parse(s){s=s.trim().replace('−','-').replace(',','.');
const m=s.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);if(m)return+m[1]/+m[2];
return s===''?NaN:Number(s)}
function submit(val){if(done)return;
if(val===null){val=choice===null?parseA($('inp').value):choice;if(Number.isNaN(val)){$('inp').focus();$('inp').style.borderColor='var(--ko)';return}}
$('inp').style.borderColor='';
const ok=Number.isFinite(cur.ans)?(Number.isFinite(val)&&Math.abs(val-cur.ans)<Math.max(.011,1e-4*Math.abs(cur.ans))):val===cur.ans;
done=true;tot++;if(ok){good++;streak++}else streak=0;
['inp','ok','pinf','minf','zero'].forEach(i=>$(i).disabled=true);
$('fb').className=ok?'ok':'ko';
$('fb').innerHTML=`<b>${ok?'Correct !':'Pas tout à fait.'} La limite vaut \\(${cur.ansT||fmtT(cur.ans)}\\).</b>${cur.why}`+(cur.steps.length?`<ul>${cur.steps.map(s=>`<li>${s}</li>`).join('')}</ul>`:'');
typeset($('fb'));
$('score').textContent=`Score : ${good}/${tot} · série : ${streak}`;
$('next').style.display='inline-block';$('next').focus()}
$('ok').onclick=()=>submit(null);
$('pinf').onclick=()=>selectChoice(INF,'pinf');
$('minf').onclick=()=>selectChoice(-INF,'minf');
$('zero').onclick=()=>selectChoice(0,'zero');
$('next').onclick=newQ;
$('lim-save').onclick=saveCurrent;
$('lim-saved-toggle').onclick=()=>{const list=$('lim-saved-list'),open=list.hidden;if(open)renderSaved();list.hidden=!open};
$('inp').addEventListener('input',()=>{if(!done)clearChoice()});
$('inp').addEventListener('keydown',e=>{if(e.key==='Enter')submit(null)});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&done&&(document.activeElement===document.body||$('limites').contains(document.activeElement)))newQ()});
$('score').textContent='Score : 0/0';
updateSavedUI();
/* Utilise le MathJax déjà présent sur le site s'il existe, sinon charge le sien. */
function startMath(cb){
const go=()=>{if(window.MathJax&&MathJax.startup&&MathJax.startup.promise)MathJax.startup.promise.then(cb,cb);else cb()};
if(window.MathJax){go();return}
window.MathJax={svg:{fontCache:'none'},startup:{typeset:false}};
const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js';s.onload=go;s.onerror=cb;document.head.appendChild(s)}
window.addEventListener('load',()=>startMath(newQ));

})();
