/* ---------- menu, zoom do mapa e efeitos de habilidade ---------- */
(function(){
const KEY='ilha-rpg-save',OPT='ilha-rpg-opt',$$=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const ls={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}},del:k=>{try{localStorage.removeItem(k)}catch(e){}}};
let opt={zoom:1,mm:170};try{Object.assign(opt,JSON.parse(ls.get(OPT)||'{}'))}catch(e){}
window.autoTargetAfterKill=opt.autoTargetAfterKill!==false;
window.modoDesempenho=!!opt.desempenho;
window.MMR=opt.mm;setZoom(opt.zoom);
const saveOpt=()=>ls.set(OPT,JSON.stringify(opt));
const zoom=z=>{setZoom(z);opt.zoom=ZM;saveOpt()},mmz=f=>{window.MMR=opt.mm=Math.max(90,Math.min(380,Math.round(opt.mm*f)));saveOpt()};
/* câmera e minimapa: roda do mouse, teclas e botões */
cv.addEventListener('wheel',e=>{e.preventDefault();zoom(ZM*(e.deltaY<0?1.1:1/1.1))},{passive:false});
$('mm').addEventListener('wheel',e=>{e.preventDefault();mmz(e.deltaY<0?.88:1.13)},{passive:false});
addEventListener('keydown',e=>{const a=window.TECLAS&&TECLAS.acao(e);if(a=='zoom_mais')zoom(ZM*1.1);else if(a=='zoom_menos')zoom(ZM/1.1);else if(e.key=='Escape'){if(!(window.closePanels&&closePanels()))toggle()}});
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
/* O progresso é salvo sozinho o tempo todo (e na conta, quando há login): não existe carregar um
   ponto antigo, então o que o jogador faz não tem volta. Com conta, recomeçar é "Apagar conta" (js/conta.js). */
const hasSave=()=>!!ls.get(KEY);
const restart=()=>{window._noSave=true;if(window.saveGame)window.saveGame=()=>{};ls.del(KEY);sessionStorage.setItem('ilha-skip','1');location.reload()};
const B=(t,fn,c)=>{const b=$$('button','mb '+(c||''),t);b.onclick=fn;return b};
function show(){const box=$$('div','mbox');menu.replaceChildren(box);
 const h=(t)=>{box.append($$('h1','',t||'Ilha do<br>Acampamento'),$$('div','sub','AVENTURA RPG'))},back=()=>box.append(B('← Voltar',()=>{view='main';show()}));
 if(view=='main'){h(started?'Pausa':null);
  box.append(started?B('▶ Voltar ao jogo',toggle):B(hasSave()?'▶ Continuar':'▶ Novo jogo',()=>{started=true;toggle();if(window.saveGame)saveGame()}));
  box.append(B('⚙ Opções',()=>{view='opt';show()}),B('⌨ Controles',()=>{view='help';show()}));
  box.append($$('p','msave','O jogo salva automaticamente.'));
  // excluir fica escondido no fim, pequeno e vermelho: com conta exclui a conta; sem conta apaga o progresso
  if(window.CONTA_ATIVA){const d=$$('button','mDel','Excluir conta');d.type='button';d.onclick=()=>{if(window.excluirConta)excluirConta(box)};box.append(d)}
  else if(hasSave()||started){const d=$$('button','mDel','Apagar progresso');d.type='button';d.onclick=()=>{view='new';show()};box.append(d)}
  }
 else if(view=='new'){h('Apagar progresso');box.append($$('p','mhelp','Isso apaga todo o progresso deste navegador e não tem como desfazer. Tem certeza?'),B('Sim, começar do zero',()=>restart(),'danger'));back()}
 else if(view=='opt'){h('Opções');
  const r1=$$('div','mrow','<span>Zoom da câmera</span><input type=range min=.6 max=2.4 step=.05><b></b>'),r2=$$('div','mrow','<span>Alcance do minimapa</span><input type=range min=90 max=380 step=10><b></b>');
  const bind=(r,get,set,fmt)=>{const i=r.querySelector('input'),o=r.querySelector('b');i.value=get();o.textContent=fmt(get());i.oninput=()=>{set(+i.value);o.textContent=fmt(get())}};
  bind(r1,()=>ZM,v=>zoom(v),v=>Math.round(v*100)+'%');bind(r2,()=>opt.mm,v=>{window.MMR=opt.mm=v;saveOpt()},v=>v);
  const r3=$$('label','mrow','<span>Atacar outro inimigo automaticamente após derrotar o alvo</span><input type="checkbox">'),check=r3.querySelector('input');
  check.checked=window.autoTargetAfterKill;check.onchange=()=>{window.autoTargetAfterKill=opt.autoTargetAfterKill=check.checked;saveOpt()};
  const caixa=(texto,get,set)=>{const r=$$('label','mrow','<span>'+texto+'</span><input type="checkbox">'),c=r.querySelector('input');c.checked=get();c.onchange=()=>set(c.checked);return r};
  // desempenho e rede
  const r4=caixa('Modo desempenho (menos luzes e névoa mais leve, para computadores fracos)',()=>!!window.modoDesempenho,v=>{window.modoDesempenho=opt.desempenho=v;saveOpt()});
  box.append(r1,r2,r3,r4);
  if(window.REDE)box.append(caixa('Mostrar ping e FPS no canto da tela',()=>REDE.mostrar,v=>{REDE.mostrar=v}));
  // som: volume, saída (alto-falante/fone) e, com conta, a voz
  if(window.SOM){
   const rv=$$('div','mrow','<span>Volume do jogo</span><input type=range min=0 max=100 step=5><b></b>');
   bind(rv,()=>SOM.volume,v=>SOM.definirVolume(v),v=>Math.round(v)+'%');rv.querySelector('input').addEventListener('change',()=>SOM.testar());
   box.append(rv);
   if(SOM.suportaSaida()){
    const rs=$$('label','mrow','<span>Saída de som</span>'),sel=$$('select');sel.append(new Option('Padrão do sistema',''));rs.append(sel);box.append(rs);
    SOM.dispositivos('audiooutput').then(lista=>{lista.filter(d=>d.deviceId!=='default').forEach((d,i)=>sel.append(new Option(d.label||'Saída '+(i+1),d.deviceId)));sel.value=SOM.saida;if(sel.value!==SOM.saida)sel.value=''});
    sel.onchange=()=>{SOM.definirSaida(sel.value);SOM.testar()};
   }
   if(window.VOZ&&VOZ.abrirConfig)box.append(B('Configurar voz e microfone',()=>{toggle();VOZ.abrirConfig()}));
  }
  back()}
 else{h('Controles');if(window.TECLAS)TECLAS.painel(box,()=>show());
  box.append($$('h3','teclasGrupo','Dicas'),$$('div','mhelp','Aceite a madeira e a madeira mágica dos Brotos Vivos nos itens encontrados; elas ficam em Materiais na mochila.<br>Após construir a paliçada, fale com o carpinteiro e entregue 10 madeiras mágicas para construir o portal do acampamento.<br>Monstros pedidos em missões recebem +20% no peso de spawn enquanto são necessários.<br>Chat: <kbd>/nome NovoNome</kbd> muda seu nome · <kbd>/s Nome mensagem</kbd> sussurra para alguém.'));back()}}
show();
window.atualizarMenu=()=>{if(menu.classList.contains('open'))show()};
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
 if(!window.modoDesempenho)for(let i=0;i<6;i++){const x=(i*431+time*7)%(W+500)-250,y=(i*263+40)%W,g=ctx.createRadialGradient(x,y,4,x,y,110);g.addColorStop(0,'rgba(6,16,30,.13)');g.addColorStop(1,'rgba(6,16,30,0)');ctx.fillStyle=g;ctx.fillRect(x-110,y-110,220,220)}
 // rastro de projéteis e meteoros
 proj.forEach(q=>part(q.x,q.y,R(-8,8),R(-8,8),.3,q.c||'#ff9a3a',R(1.5,3)));
 const cur=mets.slice();pm.forEach(m=>{if(!cur.includes(m)){burst(m.x,m.y,'#ff8a2a',40,95,.7);burst(m.x,m.y,'#ffe08a',18,60,.5);ringFx(m.x,m.y,4,40,.5,'#f93');ringFx(m.x,m.y,2,26,.4,'#fff')}});pm=cur;
 cur.forEach(m=>{const k=Math.max(0,m.t/.9),x=m.x+k*70,y=m.y-k*230;ctx.fillStyle='#ff5a1a';ctx.fillRect(Math.round(x-4),Math.round(y-4),8,8);ctx.fillStyle='#ffe08a';ctx.fillRect(Math.round(x-2),Math.round(y-2),4,4);part(x,y,R(-12,12),R(-12,12),.45,Math.random()<.5?'#ff8a2a':'#ffd36b',R(2,4))});
 for(let i=P.length;i--;){const q=P[i];q.l-=dt;if(q.l<=0){P.splice(i,1);continue}q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=q.g*dt;ctx.globalAlpha=Math.min(1,q.l/q.m*1.4);ctx.fillStyle=q.c;ctx.fillRect(Math.round(q.x),Math.round(q.y),q.s,q.s)}
 for(let i=RG.length;i--;){const q=RG[i];q.l-=dt;if(q.l<=0){RG.splice(i,1);continue}const k=1-q.l/q.m,r=q.r0+(q.r1-q.r0)*Math.sin(k*Math.PI/2);ctx.globalAlpha=q.l/q.m;ctx.strokeStyle=q.c;ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(q.x,q.y,r,r*.75,0,0,7);ctx.stroke()}
 ctx.globalAlpha=1;ctx.setTransform(1,0,0,1,0,0)};
})();
