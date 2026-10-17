/* ---------- menu, zoom do mapa e efeitos de habilidade ---------- */
(function(){
const KEY='ilha-rpg-save',OPT='ilha-rpg-opt',$$=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const ls={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}},del:k=>{try{localStorage.removeItem(k)}catch(e){}}};
let opt={zoom:1,mm:170};try{Object.assign(opt,JSON.parse(ls.get(OPT)||'{}'))}catch(e){}
window.autoTargetAfterKill=opt.autoTargetAfterKill!==false;
window.MMR=opt.mm;setZoom(opt.zoom);
const saveOpt=()=>ls.set(OPT,JSON.stringify(opt));
const zoom=z=>{setZoom(z);opt.zoom=ZM;saveOpt()},mmz=f=>{window.MMR=opt.mm=Math.max(90,Math.min(380,Math.round(opt.mm*f)));saveOpt()};
/* câmera e minimapa: roda do mouse, teclas e botões */
cv.addEventListener('wheel',e=>{e.preventDefault();zoom(ZM*(e.deltaY<0?1.1:1/1.1))},{passive:false});
$('mm').addEventListener('wheel',e=>{e.preventDefault();mmz(e.deltaY<0?.88:1.13)},{passive:false});
addEventListener('keydown',e=>{if(e.key=='+'||e.key=='=')zoom(ZM*1.1);else if(e.key=='-'||e.key=='_')zoom(ZM/1.1);else if(e.key=='Escape'){if(!(window.closePanels&&closePanels()))toggle()}});
const hb=$$('div');hb.id='hbtns';hb.innerHTML='<button class="ib" data-a="in" title="Aproximar (+)">+</button><button class="ib" data-a="out" title="Afastar (-)">−</button><button class="ib" data-a="menu" title="Menu (Esc)">☰</button>';
const mz=$$('div');mz.id='mmz';mz.innerHTML='<button class="ib" data-a="min" title="Aproximar minimapa">+</button><button class="ib" data-a="mout" title="Afastar minimapa">−</button>';
document.body.append(hb,mz);
const act={in:()=>zoom(ZM*1.15),out:()=>zoom(ZM/1.15),menu:()=>toggle(),min:()=>mmz(.8),mout:()=>mmz(1.25)};
[hb,mz].forEach(b=>b.addEventListener('click',e=>{const a=e.target.dataset&&e.target.dataset.a;if(a)act[a]()}));
/* ---------- menu ---------- */
let started=MODO.teste||!!sessionStorage.getItem('ilha-skip'),view='main',paused=MODO.motor||!started;sessionStorage.removeItem('ilha-skip');
const menu=$$('div');menu.id='menu';if(paused&&!MODO.motor)menu.className='open';document.body.appendChild(menu);
if(started&&window.saveGame)saveGame();
const upd0=upd;upd=function(dt){if(paused)return;upd0(dt)};
function toggle(){if(MODO.motor)return;if(paused&&!started)started=true;paused=!paused;view='main';menu.classList.toggle('open',paused);if(paused)show()}
const hasSave=()=>!!ls.get(KEY),slotKey=i=>'ilha-rpg-slot'+i;
const info=raw=>{try{const d=JSON.parse(raw);return 'Nv '+d.p.lvl+' · '+((CL[d.p.cls]||{}).n||d.p.cls)+' · '+(d.p.gold|0)+' ouro'}catch(e){return null}};
const slotData=i=>{try{return JSON.parse(ls.get(slotKey(i)))}catch(e){return null}};
const restart=raw=>{window._noSave=true;if(window.saveGame)window.saveGame=()=>{};if(raw==null)ls.del(KEY);else ls.set(KEY,raw);sessionStorage.setItem('ilha-skip','1');location.reload()};
const B=(t,fn,c)=>{const b=$$('button','mb '+(c||''),t);b.onclick=fn;return b};
function show(){const box=$$('div','mbox');menu.replaceChildren(box);
 const h=(t)=>{box.append($$('h1','',t||'Ilha do<br>Acampamento'),$$('div','sub','AVENTURA RPG'))},back=()=>box.append(B('← Voltar',()=>{view='main';show()}));
 if(view=='main'){h(started?'Pausa':null);
  box.append(started?B('▶ Voltar ao jogo',toggle):B(hasSave()?'▶ Continuar':'▶ Novo jogo',()=>{started=true;toggle();if(window.saveGame)saveGame()}));
  if(started)box.append(B('💾 Salvar jogo',()=>{view='save';show()}));
  box.append(B('📂 Carregar jogo',()=>{view='load';show()}));
  if(hasSave()||started)box.append(B('✦ Novo jogo',()=>{view='new';show()},'danger'));
  box.append(B('⚙ Opções',()=>{view='opt';show()}),B('❓ Controles',()=>{view='help';show()}));
  }
 else if(view=='new'){h('Novo jogo');box.append($$('p','mhelp','Isso apaga o progresso atual (os slots salvos são mantidos). Tem certeza?'),B('Sim, começar do zero',()=>restart(null),'danger'));back()}
 else if(view=='save'||view=='load'){h(view=='save'?'Salvar jogo':'Carregar jogo');
  const cur=ls.get(KEY);
  if(view=='load')box.append(row('Autosave',cur,()=>restart(cur),'Carregar'));
  for(let i=1;i<=3;i++){const d=slotData(i);
   box.append(row('Slot '+i,d&&d.raw,view=='save'?()=>{if(window.saveGame)saveGame();const r=ls.get(KEY);ls.set(slotKey(i),JSON.stringify({t:Date.now(),raw:r}));show()}:()=>restart(d.raw),view=='save'?'Salvar':'Carregar',d&&d.t,view=='load'&&!d))}
  back()}
 else if(view=='opt'){h('Opções');
  const r1=$$('div','mrow','<span>Zoom da câmera</span><input type=range min=.6 max=2.4 step=.05><b></b>'),r2=$$('div','mrow','<span>Alcance do minimapa</span><input type=range min=90 max=380 step=10><b></b>');
  const bind=(r,get,set,fmt)=>{const i=r.querySelector('input'),o=r.querySelector('b');i.value=get();o.textContent=fmt(get());i.oninput=()=>{set(+i.value);o.textContent=fmt(get())}};
  bind(r1,()=>ZM,v=>zoom(v),v=>Math.round(v*100)+'%');bind(r2,()=>opt.mm,v=>{window.MMR=opt.mm=v;saveOpt()},v=>v);
  const r3=$$('label','mrow','<span>Atacar outro inimigo automaticamente após derrotar o alvo</span><input type="checkbox">'),check=r3.querySelector('input');
  check.checked=window.autoTargetAfterKill;check.onchange=()=>{window.autoTargetAfterKill=opt.autoTargetAfterKill=check.checked;saveOpt()};
  box.append(r1,r2,r3);back()}
 else{h('Controles');box.append($$('div','mhelp','<kbd>Botão direito</kbd> mover / atacar; o personagem para quando o caminho fica bloqueado<br><kbd>Botão esquerdo</kbd> inspecionar / falar com NPC / abrir ou fechar o portão ao sul / abrir o menu do portal DG<br>A proteção e a paliçada seguem o mesmo perímetro quadrado do acampamento.<br>Aceite a madeira e a madeira mágica dos Brotos Vivos nos itens encontrados; elas ficam em Materiais na mochila.<br>Após construir a paliçada, fale com o carpinteiro e entregue 10 madeiras mágicas para construir o portal do acampamento. O menu tem a DG dos Goblins, ainda indisponível.<br>Monstros pedidos em missões recebem +20% no peso de spawn enquanto são necessários.<br><kbd>Q W E R T Y Z X</kbd> habilidades<br><kbd>1-6</kbd> itens da bolsa · <kbd>I</kbd> mochila<br><kbd>Enter</kbd> chat online · <kbd>/nome NovoNome</kbd> muda seu nome no online<br><kbd>Roda</kbd> ou <kbd>+ −</kbd> zoom da câmera<br><kbd>Esc</kbd> menu'));back()}}
function row(name,raw,fn,label,t,off){const r=$$('div','msl'),i=raw&&info(raw);r.innerHTML='<div style="flex:1"><b>'+name+'</b>'+(i?i+(t?'<br>'+new Date(t).toLocaleString('pt-BR'):''):'— vazio —')+'</div>';if(!off&&(label!='Carregar'||i))r.append(B(label,fn));return r}
show();
/* ---------- efeitos de habilidade ---------- */
const P=[],RG=[];let pt=0,pm=[];const R=(a,b)=>a+Math.random()*(b-a);
const part=(x,y,vx,vy,l,c,s=2,g=0)=>P.push({x,y,vx,vy,l,m:l,c,s,g}),ringFx=(x,y,r0,r1,l,c)=>RG.push({x,y,r0,r1,l,m:l,c});
const burst=(x,y,c,n=8,sp=40,l=.45)=>{for(let i=0;i<n;i++){const a=Math.random()*6.283,v=sp*R(.4,1);part(x,y,Math.cos(a)*v,Math.sin(a)*v,l*R(.6,1.2),c,R(1.5,3))}};
const cast0=cast;cast=function(s){const t0=s.t,px=p.x,py=p.y;cast0(s);if(!(s.t>t0))return;const c=s.vfxColor||'#9bd4ff',r=s.radius||40,x=p.x,y=p.y-6;
 if(s.effect=='nova'){burst(x,y,c,34,r*1.8,.6);ringFx(x,y,6,r,.5,c);ringFx(x,y,2,r*.7,.4,'#fff')}
 else if(s.effect=='heal'){for(let i=0;i<22;i++)part(x+R(-12,12),y+R(-4,8),R(-4,4),-R(14,36),R(.7,1.2),i%3?'#8fff8f':'#fff6b0',R(1.5,2.5));ringFx(x,y+6,4,26,.6,'#7f7')}
 else if(s.effect=='blink'){for(let i=0;i<26;i++){const k=i/25;part(px+(x-px)*k,py-6+(y+6-py)*k,R(-6,6),R(-6,6),R(.3,.6),i%2?c:'#fff',R(1.5,3))}burst(x,y,c,10,50,.4)}
 else if(s.effect=='guard'||s.effect=='buff'){for(let i=0;i<24;i++){const a=i/24*6.283;part(x+Math.cos(a)*14,y+Math.sin(a)*10,Math.cos(a)*10,-R(10,30),R(.6,1),c,2)}ringFx(x,y+6,6,34,.6,c)}
 else if(s.effect=='projectile'){burst(x,y,c,12,60,.3);ringFx(x,y,2,12,.25,c)}
 else burst(x,y,c,14,50,.4)};
if(typeof hurtE=='function'){const h0=hurtE;hurtE=function(e,d,m){const r=h0.apply(this,arguments);if(e)burst(e.x,e.y-8,m?'#9bd4ff':'#ffd9a0',7,45,.35);return r}}
if(typeof hurtP=='function'){const h1=hurtP;hurtP=function(d,m){const r=h1.apply(this,arguments);burst(p.x,p.y-8,'#ff6b6b',7,45,.35);return r}}
const draw0=draw;draw=function(){draw0();const dt=Math.min(.05,Math.max(0,time-pt));pt=time;
 ctx.setTransform(S,0,0,S,Math.round(cv.width/2-p.x*S),Math.round(cv.height/2-p.y*S));
 // sombras de nuvens
 for(let i=0;i<6;i++){const x=(i*431+time*7)%(W+500)-250,y=(i*263+40)%W,g=ctx.createRadialGradient(x,y,4,x,y,110);g.addColorStop(0,'rgba(6,16,30,.13)');g.addColorStop(1,'rgba(6,16,30,0)');ctx.fillStyle=g;ctx.fillRect(x-110,y-110,220,220)}
 // rastro de projéteis e meteoros
 proj.forEach(q=>part(q.x,q.y,R(-8,8),R(-8,8),.3,q.c||'#ff9a3a',R(1.5,3)));
 const cur=mets.slice();pm.forEach(m=>{if(!cur.includes(m)){burst(m.x,m.y,'#ff8a2a',40,95,.7);burst(m.x,m.y,'#ffe08a',18,60,.5);ringFx(m.x,m.y,4,40,.5,'#f93');ringFx(m.x,m.y,2,26,.4,'#fff')}});pm=cur;
 cur.forEach(m=>{const k=Math.max(0,m.t/.9),x=m.x+k*70,y=m.y-k*230;ctx.fillStyle='#ff5a1a';ctx.fillRect(Math.round(x-4),Math.round(y-4),8,8);ctx.fillStyle='#ffe08a';ctx.fillRect(Math.round(x-2),Math.round(y-2),4,4);part(x,y,R(-12,12),R(-12,12),.45,Math.random()<.5?'#ff8a2a':'#ffd36b',R(2,4))});
 for(let i=P.length;i--;){const q=P[i];q.l-=dt;if(q.l<=0){P.splice(i,1);continue}q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=q.g*dt;ctx.globalAlpha=Math.min(1,q.l/q.m*1.4);ctx.fillStyle=q.c;ctx.fillRect(Math.round(q.x),Math.round(q.y),q.s,q.s)}
 for(let i=RG.length;i--;){const q=RG[i];q.l-=dt;if(q.l<=0){RG.splice(i,1);continue}const k=1-q.l/q.m,r=q.r0+(q.r1-q.r0)*Math.sin(k*Math.PI/2);ctx.globalAlpha=q.l/q.m;ctx.strokeStyle=q.c;ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(q.x,q.y,r,r*.75,0,0,7);ctx.stroke()}
 ctx.globalAlpha=1;ctx.setTransform(1,0,0,1,0,0)};
})();
