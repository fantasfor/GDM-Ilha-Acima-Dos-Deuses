/* ---------- Forja do Ferreiro (2026-10-31, pedido do usuário) ----------
   Junte 2 itens iguais (mesmo equipamento) para forjar 1 desse item com outra qualidade:
   - média = (qualidade do item 1 + qualidade do item 2) / 2, arredondada;
   - pela tabela do nível do ferreiro: chance "Ruim" de sair pior (de 1 até "Qualidade Ruim" pontos abaixo da média) e
     chance "Boa" de sair melhor (de 1 até "Qualidade Boa" pontos acima). Qualquer valor da faixa tem a mesma chance.
     Ex.: nível 1, itens 50% e 75% → média 63%: 75% de chance de sair 33–62%, 25% de sair 64–73%. Fica entre 0 e 100.
   - o ferreiro sobe de nível pelo total de itens forjados (NIVEIS: 10 → nível 2, 50 → 3 ... 1500 → 10; 2000 = Mestre).
     Salvo no progresso (data.forja = {forjados, recorde}, js/ui.js).
   Janela de tela cheia: à esquerda a cena (o ferreiro, a bigorna e a fornalha num canvas) onde os dois itens giram, se
   chocam, levam marteladas e o resultado sobe brilhando com o número rolando; à direita a escolha dos itens.
   Abre pelo diálogo do Ferreiro no acampamento (js/combat.js, data-open-forja). */
(function(){
 // tabela do usuário, uma linha por nível do ferreiro: [chance ruim, chance boa, até quanto pior, até quanto melhor]
 const TABELA=[[75,25,30,10],[70,30,28,14],[65,35,26,16],[60,40,24,18],[55,45,22,20],[50,50,20,22],[45,55,18,24],[40,60,16,26],[35,65,14,28],[30,70,10,30]];
 // total de itens forjados para chegar ao nível 2, 3 ... 10; o último (2000) é o Mestre Ferreiro
 const NIVEIS=[10,50,100,200,350,550,800,1000,1500,2000];
 let forjados=0,recorde=null;
 const nivelDe=f=>Math.min(TABELA.length,1+NIVEIS.slice(0,TABELA.length-1).filter(n=>f>=n).length);
 const linhaDo=n=>TABELA[Math.max(1,Math.min(TABELA.length,n))-1];
 const media=(a,b)=>Math.round((a+b)/2);
 // sorteia a qualidade do item forjado (r1 e r2 só para testar)
 function sortear(q1,q2,n=nivelDe(forjados),r1=Math.random(),r2=Math.random()){
  const [ruim,,piorMax,melhorMax]=linhaDo(n),m=media(q1,q2),pior=r1*100<ruim,max=pior?piorMax:melhorMax,d=1+Math.floor(r2*max);
  return{q:Math.max(0,Math.min(100,m+(pior?-d:d))),pior,media:m}}
 // o que falta para o próximo nível: {de, ate, rotulo} (null = Mestre)
 function proximo(f=forjados){const n=nivelDe(f);if(n<TABELA.length)return{de:n>1?NIVEIS[n-2]:0,ate:NIVEIS[n-1],rotulo:'nível '+(n+1)};
  const m=NIVEIS[NIVEIS.length-1];return f<m?{de:NIVEIS[NIVEIS.length-2],ate:m,rotulo:'Mestre'}:null}

 /* ---------- estado do painel ---------- */
 let el=null,esc=[],ultimo=null,vigia=0,hist=[],seguidas=0;
 const E=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
 const aberto=()=>!!el&&!el.hidden;
 const nomeItem=id=>String(ITEMS[id]&&ITEMS[id].n||id).replace(/ \(.*$/,'');
 const cor=q=>QCOL[qi(q)];
 const pinta=(e,q)=>{e.style.color=cor(q);return e};
 const som=(n,v)=>{if(window.playGameSound)playGameSound(n,v)};
 // equipamentos da mochila que têm par (dois ou mais iguais), agrupados por item
 function grupos(){const c={};I.forEach((s,i)=>{if(s&&ITEMS[s.id]&&gearType[s.id]&&s.q!=null)(c[s.id]=c[s.id]||[]).push(i)});return Object.entries(c).filter(([,l])=>l.length>1)}
 function abrir(){esc=[];ultimo=null;if($('dialogue'))$('dialogue').classList.remove('open');montar();desenhar();iniciarCena();
  clearInterval(vigia);vigia=setInterval(()=>{const f=typeof blacksmith=='object'?blacksmith:null;if(!aberto()||!f||Math.hypot(p.x-f.x,p.y-f.y)>90||window.inTaverna||(typeof inDungeon!='undefined'&&inDungeon))fechar()},400)}
 function fechar(){if(el)el.hidden=true;clearInterval(vigia);pararCena();if(anim)terminarAnim();if(typeof tipEl!='undefined')tipEl.style.display='none'}
 // a escolha ainda vale? (o item pode ter saído da mochila por outra tela)
 function conferir(){esc=esc.filter(i=>I[i]&&gearType[I[i].id]&&I[i].q!=null);if(esc.length==2&&I[esc[0]].id!==I[esc[1]].id)esc.length=1}
 function escolher(i){if(anim)return;conferir();ultimo=null;const k=esc.indexOf(i);if(k>=0)esc.splice(k,1);else if(esc.length<2&&(!esc.length||I[esc[0]].id===I[i].id))esc.push(i);else esc=[i];som('tiqueVez');desenhar()}
 // escolhe sozinho um par: do mesmo item da última forja se ainda tiver, senão o primeiro; os dois de maior qualidade
 function proximoPar(){if(anim)return;const gs=grupos();if(!gs.length)return;const g=gs.find(([id])=>ultimo&&id===ultimo.id)||gs[0];
  esc=g[1].slice().sort((a,b)=>I[b].q-I[a].q).slice(0,2);ultimo=null;som('tiqueVez');desenhar()}
 function forjar(){if(anim)return;conferir();if(esc.length<2)return;const [a,b]=esc,s1=I[a],s2=I[b];if(!s1||!s2||s1.id!==s2.id)return;
  const nAntes=nivelDe(forjados),r=sortear(s1.q,s2.q),id=s1.id;
  // o item muda na hora (fechar no meio da animação não perde nada); a cena só mostra
  I[a]={id,n:1,q:r.q};I[b]=null;esc=[];dirtyInv=true;forjados++;
  const subiu=nivelDe(forjados)>nAntes,mestre=forjados===NIVEIS[NIVEIS.length-1],novoRecorde=recorde==null||r.q>recorde;if(novoRecorde)recorde=r.q;
  seguidas=r.pior?0:seguidas+1;hist.unshift({id,q:r.q,pior:r.pior});hist.length=Math.min(hist.length,14);
  ultimo={id,q:r.q,pior:r.pior,media:r.media,q1:s1.q,q2:s2.q,subiu,mestre,novoRecorde,i:a};
  saveGame();dispatchEvent(new Event('mochila-mudou'));comecarAnim(s1,s2,ultimo);desenhar()}

 /* ---------- cena animada (canvas): fornalha, ferreiro, bigorna, itens, martelo, faíscas ---------- */
 const LW=200,LH=120,CHAO=92,BX=100,BY=76; // tamanho lógico da cena, chão e o topo da bigorna
 const Cc={k:'#0d0d0d',e:'#1a1a1a',c:'#262626',p:'#3a3436',g:'#595959',m:'#7d756e',l:'#a69c94',a:'#c4c8d6',w:'#e7dcc4',
  t:'#7d3f34',tl:'#a8653f',o:'#d08a3a',ol:'#efc56a',f1:'#cf4554',f2:'#e8743a',f3:'#f7b84a',f4:'#fffbf0'};
 let cv=null,g=null,raf=0,tempo=0,ult=0,S=1,ox=0,oy=0,tremor=0,flash=0,parts=[],anim=null,muro=null;
 const imgs=new Map();const icone=id=>{let i=imgs.get(id);if(!i){i=new Image();i.src=ITEMS[id].ic;imgs.set(id,i)}return i};
 function iniciarCena(){if(!raf){ult=performance.now();raf=requestAnimationFrame(quadro)}}
 function pararCena(){cancelAnimationFrame(raf);raf=0}
 function quadro(ms){raf=requestAnimationFrame(quadro);const dt=Math.min(.05,(ms-ult)/1000);ult=ms;tempo+=dt;if(!cv||!cv.isConnected)return;passo(dt);pintar()}
 const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};
 function brilho(x,y,r,c,a){const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,c);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=a;g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);g.globalAlpha=1}
 // parede de pedra (desenhada uma vez), maior que a cena para cobrir a tela toda; MX/MY = onde ela começa na cena
 const MX=-120,MY=CHAO-260;
 function fazerMuro(){const c=document.createElement('canvas');c.width=LW-2*MX;c.height=CHAO-MY;const q=c.getContext('2d');q.fillStyle=Cc.k;q.fillRect(0,0,c.width,c.height);
  for(let y=c.height-8,l=0;y>-8;y-=8,l++)for(let x=-(l%2)*7;x<c.width;x+=14){const v=(Math.abs(x*7+y*13+l*3))%7;q.fillStyle=v<3?'#1f1c1c':v<5?'#252121':'#2c2727';q.fillRect(x+1,y+1,12,6);q.fillStyle='#ffffff08';q.fillRect(x+1,y+1,12,1)}
  return c}
 // prateleira com ferramentas penduradas na parede, atrás do ferreiro
 function ferramentas(){R(14,40,58,3,Cc.k);R(15,40,56,2,Cc.t);R(15,40,56,1,Cc.tl);
  R(20,43,1,10,Cc.m);R(18,53,5,3,Cc.k);R(19,53,3,2,Cc.l);            // martelinho
  R(32,43,1,14,Cc.m);R(34,43,1,14,Cc.m);R(31,57,2,2,Cc.l);R(34,57,2,2,Cc.l); // tenaz
  R(46,43,2,4,Cc.t);R(46,47,2,14,Cc.a);R(46,47,1,14,Cc.w);R(44,46,6,1,Cc.o); // espada pendurada
  R(58,43,8,9,Cc.k);R(59,44,6,7,Cc.g);R(59,44,6,1,Cc.l);R(61,46,2,3,Cc.o)}   // escudinho
 function fornalha(){const x=150,y=36,ch=t=>Math.sin(tempo*9+t*1.7)*Math.sin(tempo*5.3+t);
  brilho(172,74,46,'rgba(232,116,58,.9)',.32+.06*ch(1));
  R(x-2,y-2,48,CHAO-y+2,Cc.k);R(x,y,44,CHAO-y,Cc.g);R(x,y,44,2,Cc.l);for(let k=0;k<6;k++)R(x+2+k*7,y+6,6,1,Cc.m);
  R(x+8,y+18,28,CHAO-y-18,Cc.k);R(x+10,y+16,24,2,Cc.k); // boca
  for(let i=0;i<24;i++){const h=8+Math.round(9*Math.abs(ch(i))+4*Math.sin(i*1.3));for(let j=0;j<h;j++){const f=j/h;R(x+10+i,CHAO-1-j,1,1,f<.25?Cc.f4:f<.5?Cc.f3:f<.8?Cc.f2:Cc.f1)}}
  R(x+6,y-14,32,14,Cc.k);R(x+8,y-14,28,13,Cc.p); // chaminé
  if(Math.random()<.25)parts.push({x:x+12+Math.random()*20,y:CHAO-12,vx:(Math.random()-.5)*6,vy:-14-Math.random()*16,v:.9+Math.random(),c:Math.random()<.5?Cc.f3:Cc.f2,g:-4,s:1})}
 function bigorna(){R(BX-26,BY,8,2,Cc.k);R(BX-24,BY+2,6,1,Cc.k);R(BX-18,BY-1,37,6,Cc.k);R(BX-17,BY,35,4,Cc.g);R(BX-17,BY,35,1,Cc.a);R(BX-24,BY,7,2,Cc.g);R(BX-24,BY,7,1,Cc.l);
  R(BX-9,BY+5,19,7,Cc.k);R(BX-8,BY+5,17,6,Cc.p);R(BX-8,BY+5,2,6,Cc.g);
  R(BX-15,BY+11,31,CHAO-BY-11,Cc.k);R(BX-14,BY+12,29,CHAO-BY-12,Cc.g);R(BX-14,BY+12,29,1,Cc.l)}
 // o ferreiro de lado, virado para a bigorna, sem o martelo do desenho dele (o martelo daqui é o que bate);
 // o humanoide do jogo (js/sprites.js human) tem 40×32 com os pés na linha 27 e a mão da frente em (20, 19)
 const FX=50,PES=27,MAO={x:FX+20,y:CHAO-PES+19};let corpoF=null;
 function ferreiro(){if(corpoF===null){try{corpoF=human('ferreiro','s',0,{sw:{}})}catch(e){corpoF=window.SPRITE_BLACKSMITH&&SPRITE_BLACKSMITH.idle||0}}
  if(corpoF&&corpoF.width)g.drawImage(corpoF,FX,CHAO-PES)}
 // martelo: o cabo sai da mão (giro em radianos; 0 = deitado para a direita); bate no topo da bigorna
 function martelo(a){g.save();g.translate(MAO.x,MAO.y);g.rotate(a);R(-1,-1,21,2,Cc.k);R(-1,0,20,1,Cc.tl);R(16,-4,7,8,Cc.k);R(17,-3,5,6,Cc.l);R(17,-3,5,1,Cc.a);R(21,-3,1,6,Cc.m);g.restore()}
 const giroBate=Math.atan2(BY-1-MAO.y,BX-12-MAO.x),giroParado=giroBate,giroAlto=-2.3;
 function item(id,x,y,giro,esc_=1,flip=1){const im=icone(id);if(!im.complete||!im.naturalWidth)return;g.save();g.translate(Math.round(x),Math.round(y));g.rotate(giro);g.scale(flip*esc_,esc_);g.drawImage(im,-8,-8,16,16);g.restore()}
 function raios(x,y,c,a,r){g.save();g.translate(x,y);g.rotate(tempo*.8);g.globalAlpha=a;g.fillStyle=c;for(let k=0;k<12;k++){g.rotate(Math.PI/6);g.beginPath();g.moveTo(0,0);g.lineTo(r,-2.2);g.lineTo(r,2.2);g.fill()}g.restore();g.globalAlpha=1}
 function faiscas(x,y,n,cores,forca=1){for(let k=0;k<n;k++){const a=Math.random()*Math.PI*2,v=(20+Math.random()*60)*forca;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-25*forca,v:.4+Math.random()*.8,c:cores[k%cores.length],g:90,s:Math.random()<.2?2:1})}}
 function confete(c){for(let k=0;k<70;k++)parts.push({x:BX+(Math.random()-.5)*20,y:44,vx:(Math.random()-.5)*150,vy:-40-Math.random()*90,v:1.4+Math.random()*1.4,c:k%3?c:k%2?Cc.ol:Cc.f4,g:70,s:2,conf:1})}
 const ease=t=>1-Math.pow(1-Math.min(1,Math.max(0,t)),3),volta=t=>{t=Math.min(1,Math.max(0,t));const c=1.7;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)};
 // a animação da forja: tempos em segundos
 const T={gira:1.05,batidas:[1.45,1.85,2.25],revela:2.45,numero:3.15,fim:3.9};
 function comecarAnim(s1,s2,r){anim={t:0,a:s1,b:s2,r,ev:{}};som('forjaGira')}
 function terminarAnim(){if(!anim)return;if(!anim.ev.numero)resultadoSom(anim.r);if(anim.r.subiu&&!anim.ev.nivel)som('levelUp');anim=null;desenhar()}
 function pular(){if(!anim)return;if(anim.t<T.numero){anim.t=T.numero-.01;anim.ev.choque=anim.ev.revela=1;T.batidas.forEach((_,k)=>anim.ev['b'+k]=1)}}
 function resultadoSom(r){if(r.pior)som('forjaPior');else{som(typeof LOOT!='undefined'?LOOT[qi(r.q)]:'lootRaro');setTimeout(()=>som('brilho'),180)}}
 function passo(dt){
  tremor=Math.max(0,tremor-dt*18);flash=Math.max(0,flash-dt*3.2);
  for(const q of parts){q.v-=dt;q.vy+=q.g*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.conf){q.vx*=.985}if(q.y>CHAO&&!q.conf){q.y=CHAO;q.vy*=-.3;q.vx*=.6}}
  parts=parts.filter(q=>q.v>0);
  if(!anim)return;const A=anim,t=(A.t+=dt),ev=A.ev;
  if(t>=T.gira&&!ev.choque){ev.choque=1;flash=1;tremor=6;faiscas(BX,50,46,[Cc.f4,Cc.f3,Cc.ol,cor(A.a.q),cor(A.b.q)],1.3);som('bigorna');som('explosao',.6)}
  T.batidas.forEach((b,k)=>{if(t>=b&&!ev['b'+k]){ev['b'+k]=1;tremor=3+k;faiscas(BX-8,BY-2,18+k*8,[Cc.f4,Cc.f3,Cc.f2]);som('bigorna')}});
  if(t>=T.revela&&!ev.revela){ev.revela=1;flash=.6;som('magic',.6)}
  if(t>=T.revela&&t<T.numero){A.tique=(A.tique||0)+dt;if(A.tique>.07){A.tique=0;A.rola=Math.round(Math.random()*100);som('tiqueVez',.5)}}
  if(t>=T.numero&&!ev.numero){ev.numero=1;tremor=A.r.pior?1:4;resultadoSom(A.r);if(!A.r.pior){confete(cor(A.r.q));faiscas(BX,48,30,[cor(A.r.q),Cc.ol,Cc.f4],1.2)}}
  if(A.r.subiu&&t>=T.numero+.5&&!ev.nivel){ev.nivel=1;som('levelUp');confete(Cc.ol)}
  if(t>=T.fim+(A.r.subiu?1.2:0))terminarAnim()}
 function texto(s,x,y,tam,c,a=1,borda=Cc.k){g.save();g.globalAlpha=a;g.font='bold '+tam+'px monospace';g.textAlign='center';g.textBaseline='middle';g.lineWidth=Math.max(1.5,tam/5);g.strokeStyle=borda;g.lineJoin='round';g.strokeText(s,x,y);g.fillStyle=c;g.fillText(s,x,y);g.restore()}
 function pintar(){
  const w=cv.clientWidth|0,h=cv.clientHeight|0;if(!w||!h)return;if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}
  g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;g.fillStyle=Cc.k;g.fillRect(0,0,w,h);
  S=Math.max(1,Math.floor(Math.min(w/LW,h/LH)*2)/2);ox=Math.round((w-LW*S)/2);oy=Math.round((h-LH*S)/2);
  const tx=tremor?(Math.random()-.5)*tremor:0,ty=tremor?(Math.random()-.5)*tremor:0;
  g.setTransform(S,0,0,S,ox+tx*S,oy+ty*S);g.imageSmoothingEnabled=false;
  if(!muro)muro=fazerMuro();g.drawImage(muro,MX,MY);
  R(MX,CHAO,LW-2*MX,200,'#2a2420');for(let x=MX;x<LW-MX;x+=9)R(x,CHAO+1,8,1,'#3a302a');R(MX,CHAO,LW-2*MX,1,Cc.k);
  ferramentas();fornalha();
  // luz quente vinda da fornalha e do metal
  brilho(BX,BY,40,'rgba(247,184,74,.8)',anim&&anim.t>T.gira&&anim.t<T.revela?.35:.12);
  bigorna();ferreiro();
  const A=anim,t=A?A.t:0;
  // martelo: parado ou batendo
  let giro=giroParado-.06-Math.abs(Math.sin(tempo*1.3))*.05;
  if(A&&t>T.gira-.2&&t<T.revela){giro=giroAlto;for(const b of T.batidas){const d=t-(b-.4);if(d>=0&&d<.4)giro=d<.28?giroBate+(giroAlto-giroBate)*ease(d/.28):giroAlto+(giroBate-giroAlto)*ease((d-.28)/.12)}
   if(t>=T.batidas[T.batidas.length-1])giro=giroBate+(giroParado-giroBate)*ease((t-T.batidas[T.batidas.length-1])/.2)}
  if(!A){ // parado: os itens escolhidos flutuam sobre a bigorna, ou o último resultado brilhando
   const bob=Math.sin(tempo*2.4)*1.5;
   if(esc.length){esc.forEach((i,k)=>{const s=I[i];if(!s)return;const x=esc.length==1?BX:BX+(k?13:-13);brilho(x,58+bob,11,cor(s.q),.35);item(s.id,x,58+(k?-bob:bob),Math.sin(tempo*1.6+k)*.15)});
    if(esc.length==2)texto('média '+media(I[esc[0]].q,I[esc[1]].q)+'%',BX,36,6,Cc.w,.9)}
   else if(ultimo){const c=cor(ultimo.q);raios(BX,52+bob,c,.18,30);brilho(BX,52+bob,18,c,.5);item(ultimo.id,BX,52+bob,0,1.4,Math.cos(tempo*1.2)>=0?1:-1);
    texto(ultimo.q+'%',BX,26,13,c);texto(ultimo.pior?'pior que '+ultimo.media+'%':'MELHOR que '+ultimo.media+'%',BX,38,6,ultimo.pior?Cc.l:Cc.ol)}
   else texto('escolha 2 itens iguais',BX,46,6,Cc.m,.8+.2*Math.sin(tempo*3))}
  else{
   const r=A.r;
   if(t<T.gira){ // os dois sobem e giram em volta um do outro, cada vez mais rápido e mais perto
    const f=t/T.gira,rad=26*(1-ease(f))+1,th=f*f*16,cy=52-8*ease(Math.min(1,f*3)),sp=f*f*30;
    for(const [s,o] of [[A.a,0],[A.b,Math.PI]]){for(let k=4;k>=1;k--){const th2=th-k*.18*(.3+f);g.globalAlpha=.12*(5-k)*f;item(s.id,BX+Math.cos(th2+o)*rad,cy+Math.sin(th2+o)*rad*.45,sp-k*.4)}g.globalAlpha=1;
     brilho(BX+Math.cos(th+o)*rad,cy+Math.sin(th+o)*rad*.45,10,cor(s.q),.4+.4*f);item(s.id,BX+Math.cos(th+o)*rad,cy+Math.sin(th+o)*rad*.45,sp)}
    texto(A.a.q+'%  +  '+A.b.q+'%',BX,22,7,Cc.w,1-f)}
   else if(t<T.revela){ // metal em brasa na bigorna levando marteladas
    const f=(t-T.gira)/(T.revela-T.gira),quente=f<.5?Cc.f4:f<.8?Cc.f3:Cc.f2;brilho(BX-6,BY-2,14,'rgba(255,240,200,.9)',.6);
    R(BX-14,BY-4,16,4,Cc.k);R(BX-13,BY-3,14,2,quente);R(BX-13,BY-3,14,1,Cc.f4);texto('média '+r.media+'%',BX,30,7,Cc.ol,1)}
   else{ // o resultado sobe girando como moeda, com raios da cor da qualidade, e o número rola até parar
    const f=(t-T.revela)/(T.numero-T.revela),y=BY-4-(BY-4-50)*volta(f),giroM=(1-ease(Math.min(1,f*1.15)))*24,c=t>=T.numero?cor(r.q):Cc.f4;
    raios(BX,y,c,Math.min(.3,f*.4),24+16*ease(f));brilho(BX,y,20,c,.6);item(r.id,BX,y,0,1+.4*ease(f),Math.cos(giroM));
    if(t<T.numero)texto((A.rola!=null?A.rola:r.media)+'%',BX,24,12,Cc.w,.9);
    else{const d=t-T.numero,pul=1+.5*Math.max(0,1-d*4)*Math.abs(Math.sin(d*18));texto(r.q+'%',BX,24,Math.round(13*pul),c);
     texto(r.pior?'pior  −'+(r.media-r.q):'MELHOR!  +'+(r.q-r.media),BX,37,r.pior?6:8,r.pior?Cc.l:Cc.ol,Math.min(1,d*4));
     if(r.novoRecorde&&!r.pior)texto('novo recorde!',BX,46+Math.sin(tempo*6),5,Cc.a,Math.min(1,d*3));
     if(r.subiu&&d>.5)texto(r.mestre?'MESTRE FERREIRO!':'FERREIRO NÍVEL '+nivelDe(forjados)+'!',BX,12,8,Cc.ol,Math.min(1,(d-.5)*3),'#4e2430')}}}
  martelo(giro);
  for(const q of parts){g.globalAlpha=Math.min(1,q.v*2);R(q.x,q.y,q.s,q.s,q.c)}g.globalAlpha=1;
  if(flash){g.globalAlpha=flash*.8;g.fillStyle=Cc.f4;g.fillRect(-20,-20,LW+40,LH+40);g.globalAlpha=1}
  // escurece as bordas
  g.setTransform(1,0,0,1,0,0);const v=g.createRadialGradient(w/2,h/2,Math.min(w,h)*.35,w/2,h/2,Math.max(w,h)*.7);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.65)');g.fillStyle=v;g.fillRect(0,0,w,h)}

 /* ---------- painel (HTML) ---------- */
 let lado=null,topoInfo=null;
 function montar(){
  if(!el){el=E('div');el.id='forjaPainel';el.setAttribute('role','dialog');el.setAttribute('aria-label','Forja do Ferreiro');document.body.append(el);
   for(const ev of ['pointerdown','mousedown','click','wheel','contextmenu'])el.addEventListener(ev,e=>e.stopPropagation())}
  if(cv&&cv.isConnected){el.hidden=false;return}
  el.replaceChildren();el.hidden=false;
  const topo=E('div','fjTopo'),x=E('button','biFechar','×');x.type='button';x.setAttribute('aria-label','Fechar');x.onclick=fechar;
  topoInfo=E('div','fjTopoInfo');topo.append(E('h3','','Forja do Ferreiro'),topoInfo,x);
  const corpo=E('div','fjCorpo'),cena=E('div','fjCena');cv=E('canvas');g=cv.getContext('2d');cena.append(cv);
  cena.onclick=()=>pular();cena.title='Clique para pular a animação';
  lado=E('div','fjLado');corpo.append(cena,lado);el.append(topo,corpo)}
 function espaco(k){const i=esc[k],s=i!=null&&I[i],d=E('button','fjEspaco'+(s?'':' vazio'));d.type='button';
  if(s){const im=E('img');im.src=ITEMS[s.id].ic;im.alt='';d.append(im,pinta(E('span','',s.q+'%'),s.q));d.style.borderColor=cor(s.q);d._tip=()=>itemTip(s.id,s.q)+'<div class=tm>Clique: tirar da bigorna</div>';d.onclick=()=>escolher(i)}
  else d.append(E('span','','Item '+(k+1)));return d}
 function faixa(m,[,,pmax,mmax]){
  const d=E('div','fjFaixa'),z=(c,a,b)=>{const s=E('i',c);s.style.left=a+'%';s.style.width=Math.max(.6,b-a)+'%';d.append(s)};
  z('fjPior',Math.max(0,m-pmax),Math.max(0,m-1));z('fjMelhor',Math.min(100,m+1),Math.min(100,m+mmax));
  const mk=E('b','fjMedia');mk.style.left=m+'%';d.append(mk);return d}
 function desenhar(){
  if(!aberto())return;montar();conferir();
  const n=nivelDe(forjados),t=linhaDo(n),px=proximo();
  // cabeçalho: nível, barra até o próximo, total e recorde
  topoInfo.replaceChildren();const nv=E('b','fjNv',px||n<TABELA.length?'Ferreiro nível '+n:'Mestre Ferreiro');topoInfo.append(nv);
  if(px){const bar=E('span','fjXp'),f=E('i');f.style.width=Math.min(100,(forjados-px.de)/(px.ate-px.de)*100)+'%';bar.append(f);topoInfo.append(bar,E('small','',forjados+'/'+px.ate+' forjados para o '+px.rotulo))}
  topoInfo.append(E('small','fjChances','Pior '+t[0]+'% (até −'+t[2]+') · Melhor '+t[1]+'% (até +'+t[3]+')'));
  if(recorde!=null)topoInfo.append(pinta(E('small','fjRec','Recorde '+recorde+'%'),recorde));
  lado.replaceChildren();
  // bigorna: item 1 + item 2 = média
  const big=E('div','fjBigorna'),res=E('div','fjRes');big.append(espaco(0),E('em','','+'),espaco(1),E('em','','='),res);lado.append(big);
  if(esc.length==2){const a=I[esc[0]],b=I[esc[1]],m=media(a.q,b.q),lo=Math.max(0,m-t[2]),hi=Math.max(0,m-1),lo2=Math.min(100,m+1),hi2=Math.min(100,m+t[3]);
   res.append(E('small','','média'),pinta(E('b','',m+'%'),m));
   const info=E('div','fjInfo'),l1=E('div','fjLinha'),l2=E('div','fjLinha');
   l1.append(E('span','fjTag pior',t[0]+'%'),document.createTextNode(' sai pior: '),pinta(E('b','',lo+'%'),lo),document.createTextNode(' a '),pinta(E('b','',hi+'%'),hi));
   l2.append(E('span','fjTag melhor',t[1]+'%'),document.createTextNode(' sai melhor: '),pinta(E('b','',lo2+'%'),lo2),document.createTextNode(' a '),pinta(E('b','',hi2+'%'),hi2));
   info.append(l1,l2,faixa(m,t));lado.append(info)}
  else res.append(E('small','',esc.length?'escolha outro igual':'escolha 2 itens iguais'));
  const acoes=E('div','fjAcoes'),bt=E('button','vjBtn fjForjar',anim?'Forjando…':'Forjar');bt.type='button';bt.disabled=esc.length<2||!!anim;bt.onclick=forjar;
  const gs=grupos(),bp=E('button','vjBtn fjPar','Próximo par');bp.type='button';bp.disabled=!gs.length||!!anim;bp.title='Escolhe sozinho dois itens iguais (os de maior qualidade)';bp.onclick=proximoPar;
  acoes.append(bt,bp);lado.append(acoes);
  if(ultimo&&!anim){const r=E('div','fjSaiu'+(ultimo.pior?' pior':' melhor')),im=E('img');im.src=ITEMS[ultimo.id].ic;im.alt='';r.style.borderColor=ultimo.pior?'':cor(ultimo.q);
   const tx=E('span','');tx.append(document.createTextNode(ultimo.q1+'% + '+ultimo.q2+'% → '),pinta(E('b','',nomeItem(ultimo.id)+' '+ultimo.q+'% ('+qName(ultimo.q)+')'),ultimo.q),document.createTextNode(ultimo.pior?' · pior que a média '+ultimo.media+'%':' · MELHOR que a média '+ultimo.media+'%!'));
   r.append(im,tx);if(ultimo.subiu)r.append(E('b','fjSubiu',ultimo.mestre?'O ferreiro virou Mestre Ferreiro!':'O ferreiro subiu para o nível '+nivelDe(forjados)+'!'));r._tip=()=>itemTip(ultimo.id,ultimo.q);lado.append(r)}
  // últimas forjas
  if(hist.length){const h=E('div','fjHist');h.append(E('h4','',seguidas>1?'Últimas forjas · '+seguidas+' melhores seguidas!':'Últimas forjas'));const fila=E('div','fjHistFila');
   for(const o of hist){const c=E('span','fjChip'+(o.pior?' pior':'')),im=E('img');im.src=ITEMS[o.id].ic;im.alt='';c.append(im,pinta(E('b','',(o.pior?'▼':'▲')+o.q),o.q));c._tip=()=>itemTip(o.id,o.q);fila.append(c)}
   h.append(fila);lado.append(h)}
  // equipamentos com par na mochila, agrupados por item
  lado.append(E('h4','','Na mochila (só equipamentos com par)'));
  const lista=E('div','fjLista'),base=esc.length?I[esc[0]].id:null;
  for(const [id,ids] of gs){const gr=E('div','fjGrupo');gr.append(E('small','',nomeItem(id)+' ×'+ids.length));const fila=E('div','fjGrupoFila');
   for(const i of ids.slice().sort((a,b)=>I[b].q-I[a].q)){const s=I[i],d=E('button','fjItem'+(esc.includes(i)?' on':'')+(base&&id!==base&&esc.length<2?' fora':''));d.type='button';
    const im=E('img');im.src=ITEMS[s.id].ic;im.alt='';d.append(im,pinta(E('small','',s.q+'%'),s.q));d.onclick=()=>escolher(i);
    d._tip=()=>itemTip(s.id,s.q)+'<div class=tm>Clique: '+(esc.includes(i)?'tirar da bigorna':'pôr na bigorna')+'</div>';fila.append(d)}
   gr.append(fila);lista.append(gr)}
  if(!gs.length)lista.append(E('p','biVazio','Você não tem dois equipamentos iguais na mochila. Traga pares de armas, armaduras ou acessórios.'));
  lado.append(lista,E('p','biDica','Os dois itens somem e volta um só · equipados e itens do baú não entram · clique na cena ou Espaço para pular a animação.'))}

 window.FORJA={abrir,fechar,sortear,media,nivelDe,proximo,TABELA,NIVEIS,get nivel(){return nivelDe(forjados)},get forjados(){return forjados},get aberto(){return aberto()},
  dados:()=>({forjados,recorde}),
  carregar(d){const f=d&&(Number.isInteger(d.forjados)?d.forjados:Number.isInteger(d.xp)?d.xp:0);forjados=f>0?f:0;recorde=d&&Number.isInteger(d.recorde)&&d.recorde>=0&&d.recorde<=100?d.recorde:null}};
 addEventListener('keydown',e=>{if(!aberto())return;if(e.key==='Escape'){fechar();e.stopImmediatePropagation()}else if(e.code==='Space'){e.preventDefault();e.stopImmediatePropagation();if(anim)pular();else if(esc.length==2)forjar()}},true);
 addEventListener('mochila-mudou',()=>{if(aberto()&&!anim)desenhar()});
})();
