/* ---------- Ilha viva (2026-10-23): animações do cenário da ilha ----------
   Tudo em pixel art 1:1, perto do jogador (só o que aparece na tela), desenhado pelo render.js em três momentos:
   - chao(): no chão, antes dos personagens — tufos de grama e juncos balançando com o vento (rajadas que passam pela
     ilha), brilhos e ondinhas na água, peixes pulando nos lagos, ninfeias balançando;
   - ar(): por cima dos personagens — borboletas nos campos de flores, libélulas nos lagos, pássaros passando com a
     sombra no chão, folhas e pétalas caindo das árvores (cor de cada árvore), pólen no sol;
   - luzes(): depois da noite — vaga-lumes piscando.
   De dia há borboletas, pássaros e pólen; de noite, vaga-lumes (js/tempo.js TEMPO.escuro). */
(function(){
 if(typeof map==='undefined'||typeof islandTerrainMask==='undefined')return;
 const h=(a,b)=>hash(a,b),R=Math.round;
 const escuro=()=>window.TEMPO&&TEMPO.escuro?TEMPO.escuro():0;
 // vento: onda lenta que atravessa a ilha + rajadas (a grama e os juncos de um lugar dobram juntos)
 const vento=(x,y,t)=>{const rajada=Math.max(0,Math.sin(t*.45-x*.006-y*.002)),base=Math.sin(t*1.9+x*.045+y*.03);return base*(.35+.25*rajada)+rajada*.9};
 const tipoChao=(x,y)=>{x|=0;y|=0;return x>=0&&y>=0&&x<W&&y<W?islandTerrainMask[y*W+x]:2};
 const visivel=(x,y,m=20)=>{const vw=cv.width/S/2+m,vh=cv.height/S/2+m;return Math.abs(x-p.x)<vw&&Math.abs(y-p.y)<vh};
 /* ---- tufos de grama e juncos: desenhos prontos (variante × 5 inclinações), um drawImage por tufo ---- */
 const CORES_TUFO={campo:['#2f6e31','#4b9a44','#78c260'],mata:['#1d4a24','#347536','#55a04e'],seco:['#5d7a34','#8aa548','#c2c86a']};
 function tufo(cores,lam,inc,alto){const c=mkCanvas(9,8),g=c.getContext('2d');
  for(let k=0;k<lam;k++){const x0=2+k*2-(lam>3?1:0),hh=alto-(k%2)-(k==0?1:0),dx=inc*(hh/alto);
   for(let j=0;j<hh;j++){const t=j/hh,x=R(x0+dx*t*t*1.6);g.fillStyle=j<1?cores[0]:j>hh-2?cores[2]:cores[1];g.fillRect(x,7-j,1,1)}}
  return c}
 const TUFOS={};for(const b in CORES_TUFO){TUFOS[b]=[];for(let v=0;v<3;v++){const l=[];for(let i=-2;i<=2;i++)l.push(tufo(CORES_TUFO[b],3+v%2,i,4+v));TUFOS[b].push(l)}}
 function junco(inc,taboa){const c=mkCanvas(7,11),g=c.getContext('2d');
  for(let k=0;k<2;k++){const hh=8-k*2,x0=2+k*2;for(let j=0;j<hh;j++){const t=j/hh;g.fillStyle=j>hh-3?'#6bbf5f':'#3f7a35';g.fillRect(R(x0+inc*t*t*1.4),10-j,1,1)}
   if(taboa&&k==0){const x=R(x0+inc*1.4);g.fillStyle='#7a4a24';g.fillRect(x,2,1,3);g.fillStyle='#3f7a35';g.fillRect(x,1,1,1)}}
  return c}
 const JUNCOS=[0,1].map(t=>[-2,-1,0,1,2].map(i=>junco(i,t)));
 const quadroVento=(x,y,t)=>Math.max(0,Math.min(4,R(2+vento(x,y,t)*1.6)));
 function plantas(t){
  // tufos espalhados (poucos: a grama do chão já tem cor; o tufo é só o movimento do vento)
  const x0=Math.floor((p.x-cv.width/S/2-10)/10)*10,x1=p.x+cv.width/S/2+10,y0=Math.floor((p.y-cv.height/S/2-10)/10)*10,y1=p.y+cv.height/S/2+14;
  for(let y=y0;y<y1;y+=10)for(let x=x0;x<x1;x+=10){const r=h(x*7+3,y*13+5);if(r<.8)continue;
   const px=x+R(h(x,y+1)*9),py=y+R(h(x+1,y)*9),k=tipoChao(px,py);
   if(k===0){if(insideCamp(px,py,-10))continue;const b=biomaIlha(px,py),bio=b>.64?'mata':b<.32?'seco':'campo';
    ctx.drawImage(TUFOS[bio][R(r*97)%3][quadroVento(px,py,t)],px-4,py-7)}
   else if(k===1||k===0){continue}}
  // juncos nas margens (onde a água está a 2–7 px)
  for(let y=y0;y<y1;y+=5)for(let x=x0;x<x1;x+=5){const r=h(x*11+1,y*3+7);if(r<.55)continue;const px=x+R(h(x,y+2)*4),py=y+R(h(x+2,y)*4);
   if(tipoChao(px,py)===4||tipoChao(px,py)===5)continue;const [rd,rw]=rioDist(px,py);if(rd<rw+2||rd>rw+7)continue;
   if(typeof onBridge=='function'&&onBridge(px,py+6))continue;
   ctx.drawImage(JUNCOS[r>.85?1:0][quadroVento(px,py,t)],px-3,py-10)}}
 /* ---- água: brilhos, ondinhas, peixes, ninfeias ---- */
 const ondas=[],peixes=[];let proxOnda=0,proxPeixe=2;
 const pontoNaAgua=(L,borda=.75)=>{const a=Math.random()*Math.PI*2,r=lagoR(L,a)*Math.sqrt(Math.random())*borda;return {x:L.x+Math.cos(a)*r,y:L.y+Math.sin(a)*r/1.25}};
 function agua(t,dt){
  // brilhos de sol: pontos fixos que acendem e apagam (mais de dia)
  const brilho=1-escuro()*.7;
  const x0=Math.floor((p.x-cv.width/S/2)/6)*6,x1=p.x+cv.width/S/2,y0=Math.floor((p.y-cv.height/S/2)/6)*6,y1=p.y+cv.height/S/2;
  for(let y=y0;y<y1;y+=6)for(let x=x0;x<x1;x+=6){const r=h(x*5+9,y*9+1);if(r<.6)continue;const px=x+R(h(x,y+5)*5),py=y+R(h(x+5,y)*5);
   if(tipoChao(px,py)!==4)continue;const s=Math.sin(t*(1.3+r*2)+r*40);if(s<.86)continue;
   ctx.globalAlpha=(s-.86)/.14*brilho;ctx.fillStyle='#ffffff';ctx.fillRect(px,py,1,1);if(s>.97){ctx.fillRect(px-1,py,3,1);ctx.fillRect(px,py-1,1,3)}}
  ctx.globalAlpha=1;
  // ondinhas e peixes nos lagos visíveis
  const perto=LAGOS.filter(L=>visivel(L.x,L.y,L.r*1.4));
  if(perto.length&&t>proxOnda){const L=perto[Math.floor(Math.random()*perto.length)];ondas.push({...pontoNaAgua(L),t:0,d:1.6,r:6});proxOnda=t+.35+Math.random()*.6}
  if(perto.length&&t>proxPeixe){const L=perto[Math.floor(Math.random()*perto.length)],a=pontoNaAgua(L,.6),dir=Math.random()<.5?-1:1;
   peixes.push({x:a.x,y:a.y,dir,t:0,d:.9,cor:Math.random()<.5?'#f0a050':'#c8d0d8'});ondas.push({x:a.x,y:a.y,t:0,d:1.2,r:5});proxPeixe=t+3+Math.random()*5}
  for(let i=ondas.length;i--;){const o=ondas[i];o.t+=dt;if(o.t>o.d){ondas.splice(i,1);continue}const q=o.t/o.d;
   ctx.globalAlpha=(1-q)*.55;ctx.strokeStyle='#d8f0f8';ctx.lineWidth=1/S*2;ctx.beginPath();ctx.ellipse(o.x,o.y,1+q*o.r,(1+q*o.r)*.45,0,0,7);ctx.stroke()}
  ctx.globalAlpha=1;
  for(let i=peixes.length;i--;){const f=peixes[i];f.t+=dt;if(f.t>f.d){ondas.push({x:f.x+f.dir*10,y:f.y,t:0,d:1.2,r:5});peixes.splice(i,1);continue}
   const q=f.t/f.d,x=f.x+f.dir*10*q,y=f.y-Math.sin(q*Math.PI)*9;ctx.fillStyle=f.cor;ctx.fillRect(R(x)-1,R(y),3,1);ctx.fillStyle='#ffffff';ctx.fillRect(R(x)+(f.dir>0?1:-1),R(y),1,1);
   ctx.fillStyle=f.cor;ctx.fillRect(R(x)-f.dir*2,R(y)+(q<.5?1:-1),1,1);
   if(q<.25||q>.75){ctx.fillStyle='#e8f6fb';ctx.fillRect(R(x)+R((Math.random()-.5)*4),R(y)+2,1,1)}}}
 /* ---- bichos e folhas no ar ---- */
 const borboletas=[],libelulas=[],folhas=[],passaros=[],polens=[],vagalumes=[];
 const CORES_BORB=[['#ffd84a','#c08a10'],['#ffffff','#9aa4b2'],['#ff8ac0','#b0407a'],['#6ab4ff','#2a6ab8'],['#ff9a4a','#b85a10']];
 function novoEm(raio,filtro,tentativas=12){for(let k=0;k<tentativas;k++){const a=Math.random()*Math.PI*2,r=Math.random()*raio,x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r*.7;if(filtro(x,y))return {x,y}}return null}
 const corFolha=v=>v===4?['#ffb0cc','#ffe0ec']:v===5?['#e8782a','#f5b04a']:v===2?['#2a7a5a','#3fa06c']:['#5fae4e','#9ed86a'];
 function ar(t,dt){
  const dia=1-escuro();
  // borboletas nos campos de flores (de dia)
  while(borboletas.length<(dia>.4?7:0)){const q=novoEm(220,(x,y)=>tipoChao(x,y)===0&&floridoIlha(x,y)>.6);if(!q)break;borboletas.push({...q,hx:q.x,hy:q.y,f:Math.random()*9,c:CORES_BORB[Math.floor(Math.random()*CORES_BORB.length)],v:.6+Math.random()*.6})}
  if(dia<=.4)borboletas.length=0;
  for(let i=borboletas.length;i--;){const b=borboletas[i];if(Math.hypot(b.x-p.x,b.y-p.y)>320){borboletas.splice(i,1);continue}
   b.f+=dt*b.v;b.x=b.hx+Math.sin(b.f*1.3)*14+Math.sin(b.f*3.1)*4;b.y=b.hy+Math.cos(b.f*1.7)*8;const alt=4+Math.sin(b.f*5)*2;
   const asa=Math.sin(t*24+i)>0;ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(R(b.x),R(b.y),2,1);
   ctx.fillStyle=b.c[0];if(asa){ctx.fillRect(R(b.x)-1,R(b.y-alt)-1,1,2);ctx.fillRect(R(b.x)+1,R(b.y-alt)-1,1,2)}else{ctx.fillRect(R(b.x)-1,R(b.y-alt),1,1);ctx.fillRect(R(b.x)+1,R(b.y-alt),1,1)}
   ctx.fillStyle=b.c[1];ctx.fillRect(R(b.x),R(b.y-alt),1,1)}
  // libélulas sobre a água: param no ar e dão arrancadas
  while(libelulas.length<(dia>.3?3:0)){const q=novoEm(240,(x,y)=>tipoChao(x,y)===4);if(!q)break;libelulas.push({...q,tx:q.x,ty:q.y,prox:0})}
  if(dia<=.3)libelulas.length=0;
  for(let i=libelulas.length;i--;){const l=libelulas[i];if(Math.hypot(l.x-p.x,l.y-p.y)>340){libelulas.splice(i,1);continue}
   if(t>l.prox){const a=Math.random()*Math.PI*2;l.tx=l.x+Math.cos(a)*18;l.ty=l.y+Math.sin(a)*10;if(tipoChao(l.tx,l.ty)!==4){l.tx=l.x;l.ty=l.y}l.prox=t+.6+Math.random()*1.4}
   l.x+=(l.tx-l.x)*Math.min(1,dt*6);l.y+=(l.ty-l.y)*Math.min(1,dt*6);const y=R(l.y-6);
   ctx.fillStyle='#2ab8c8';ctx.fillRect(R(l.x)-1,y,3,1);ctx.fillStyle=Math.sin(t*40+i)>0?'#e0f8ff':'#a0d8e8';ctx.fillRect(R(l.x),y-1,1,1);ctx.fillRect(R(l.x),y+1,1,1)}
  // folhas e pétalas caindo das árvores perto
  if(typeof trees!='undefined'&&folhas.length<26)for(const tr of trees){if(Math.abs(tr.x-p.x)>200||Math.abs(tr.y-p.y)>130||Math.random()>dt*.35)continue;
   const v=window.treeVar?treeVar(tr):0,[c1,c2]=corFolha(v);folhas.push({x:tr.x+(Math.random()-.5)*26,y:tr.y-26-Math.random()*14,chao:tr.y+(Math.random()*16-4),t:0,f:Math.random()*9,c:Math.random()<.5?c1:c2})}
  for(let i=folhas.length;i--;){const f=folhas[i];f.t+=dt;f.f+=dt*3;
   if(f.y<f.chao){f.y+=dt*9;f.x+=Math.sin(f.f)*dt*14+vento(f.x,f.y,t)*dt*6}else if(f.t>6){folhas.splice(i,1);continue}
   ctx.globalAlpha=f.y<f.chao?1:Math.max(0,1-(f.t-4)/2);ctx.fillStyle=f.c;ctx.fillRect(R(f.x),R(f.y),Math.sin(f.f)>0?2:1,1)}
  ctx.globalAlpha=1;
  // pólen e poeirinha no sol
  while(polens.length<(dia>.5?14:0)){const q=novoEm(200,(x,y)=>tipoChao(x,y)===0);if(!q)break;polens.push({...q,f:Math.random()*9})}
  if(dia<=.5)polens.length=0;
  for(let i=polens.length;i--;){const o=polens[i];o.f+=dt;o.x+=Math.sin(o.f*.7)*dt*3+vento(o.x,o.y,t)*dt*2;o.y-=dt*1.2;if(Math.hypot(o.x-p.x,o.y-p.y)>260){polens.splice(i,1);continue}
   ctx.globalAlpha=.35+.35*Math.sin(o.f*2);ctx.fillStyle='#fff8d0';ctx.fillRect(R(o.x),R(o.y)-8,1,1)}
  ctx.globalAlpha=1;
  // pássaros: um bando de vez em quando, voando alto, com as sombras no chão
  if(dia>.5&&!passaros.length&&Math.random()<dt*.06){const dir=Math.random()<.5?-1:1,y=p.y-60+Math.random()*120,n=3+Math.floor(Math.random()*3);
   for(let k=0;k<n;k++)passaros.push({x:p.x-dir*(cv.width/S/2+30+k*9),y:y+(k%2?6:-6)*Math.ceil(k/2),dir,f:Math.random()*6})}
  for(let i=passaros.length;i--;){const b=passaros[i];b.x+=b.dir*dt*48;b.f+=dt*9;if(Math.abs(b.x-p.x)>cv.width/S/2+60&&Math.sign(b.x-p.x)===b.dir){passaros.splice(i,1);continue}
   ctx.fillStyle='rgba(10,20,10,.16)';ctx.fillRect(R(b.x)+12,R(b.y)+30,3,1);
   const up=Math.sin(b.f)>0,x=R(b.x),y=R(b.y);ctx.fillStyle='#2a2630';ctx.fillRect(x,y,1,1);
   if(up){ctx.fillRect(x-2,y-1,2,1);ctx.fillRect(x+1,y-1,2,1)}else{ctx.fillRect(x-2,y+1,2,1);ctx.fillRect(x+1,y+1,2,1)}}}
 // vaga-lumes (de noite), depois da escuridão: brilham
 function luzes(t,dt){const n=escuro();
  while(vagalumes.length<(n>.4?22:0)){const q=novoEm(230,(x,y)=>tipoChao(x,y)===0||tipoChao(x,y)===1);if(!q)break;vagalumes.push({...q,f:Math.random()*9,v:.5+Math.random()})}
  if(n<=.4)vagalumes.length=0;
  for(let i=vagalumes.length;i--;){const v=vagalumes[i];v.f+=dt*v.v;v.x+=Math.sin(v.f*1.1)*dt*6;v.y+=Math.cos(v.f*.8)*dt*4;if(Math.hypot(v.x-p.x,v.y-p.y)>300){vagalumes.splice(i,1);continue}
   const a=Math.max(0,Math.sin(v.f*2.2))*n;if(a<.05)continue;const x=R(v.x),y=R(v.y)-6;
   ctx.globalAlpha=a*.25;ctx.fillStyle='#d8ff70';ctx.fillRect(x-2,y-1,5,3);ctx.fillRect(x-1,y-2,3,5);ctx.globalAlpha=a;ctx.fillStyle='#f4ffb0';ctx.fillRect(x,y,1,1)}
  ctx.globalAlpha=1}
 /* ---- DG de floresta (Floresta Negra): folhas caindo das árvores, névoa rasteira, esporos e vaga-lumes ---- */
 const dgFolhas=[],dgNevoa=[],dgVaga=[];let dgUlt=null;
 function dgAr(){const t=time,dt=dgUlt==null?0:Math.min(.1,Math.max(0,t-dgUlt));dgUlt=t;
  const dec=window.DUNGEON_DECORATIONS||[];
  if(dgFolhas.length<30)for(const d of dec){if(d.arvore==null||Math.abs(d.x-p.x)>220||Math.abs(d.y-p.y)>150||Math.random()>dt*.4)continue;
   const [c1,c2]=corFolha(d.arvore);dgFolhas.push({x:d.x+(Math.random()-.5)*24,y:d.y-24-Math.random()*16,chao:d.y+Math.random()*14-2,t:0,f:Math.random()*9,c:Math.random()<.5?c1:c2})}
  for(let i=dgFolhas.length;i--;){const f=dgFolhas[i];f.t+=dt;f.f+=dt*3;if(f.y<f.chao){f.y+=dt*8;f.x+=Math.sin(f.f)*dt*12}else if(f.t>6){dgFolhas.splice(i,1);continue}
   ctx.globalAlpha=f.y<f.chao?1:Math.max(0,1-(f.t-4)/2);ctx.fillStyle=f.c;ctx.fillRect(R(f.x),R(f.y),Math.sin(f.f)>0?2:1,1)}
  // névoa rasteira: manchas grandes e fracas andando devagar
  while(dgNevoa.length<9)dgNevoa.push({x:p.x+(Math.random()-.5)*600,y:p.y+(Math.random()-.5)*380,rx:40+Math.random()*50,v:4+Math.random()*5,f:Math.random()*9});
  for(let i=dgNevoa.length;i--;){const n=dgNevoa[i];n.x+=n.v*dt;n.f+=dt*.3;if(n.x-p.x>340){n.x=p.x-340;n.y=p.y+(Math.random()-.5)*380}
   ctx.globalAlpha=.06+.03*Math.sin(n.f);ctx.fillStyle='#c8d8c0';ctx.beginPath();ctx.ellipse(n.x,n.y,n.rx,n.rx*.32,0,0,7);ctx.fill()}
  ctx.globalAlpha=1}
 function dgLuzes(){const dt=.016;
  while(dgVaga.length<20){const a=Math.random()*6.283,r=40+Math.random()*200;dgVaga.push({x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r*.7,f:Math.random()*9,v:.5+Math.random()})}
  for(let i=dgVaga.length;i--;){const v=dgVaga[i];v.f+=dt*v.v;v.x+=Math.sin(v.f*1.1)*.2;v.y+=Math.cos(v.f*.8)*.15;if(Math.hypot(v.x-p.x,v.y-p.y)>280){dgVaga.splice(i,1);continue}
   if(window.dungeonWalk&&!dungeonWalk(v.x,v.y+6))continue;                                // só sobre o chão da trilha e das clareiras
   const a=Math.max(0,Math.sin(v.f*2.2));if(a<.05)continue;const x=R(v.x),y=R(v.y)-6;
   ctx.globalAlpha=a*.3;ctx.fillStyle='#d8ff70';ctx.fillRect(x-2,y-1,5,3);ctx.fillRect(x-1,y-2,3,5);ctx.globalAlpha=a;ctx.fillStyle='#f4ffb0';ctx.fillRect(x,y,1,1)}
  ctx.globalAlpha=1}
 let ultimo=null;
 const passo=()=>{const dt=ultimo==null?0:Math.min(.1,Math.max(0,time-ultimo));return dt};
 window.ILHA_VIVA={
  chao(){if(window.inDungeon||window.inTaverna||window.inArena||window.inTutorial)return;const t=time,dt=passo();agua(t,dt);plantas(t)},
  ar(){if(window.inDungeon||window.inTaverna||window.inArena||window.inTutorial)return;const t=time,dt=passo();ar(t,dt)},
  luzes(){if(window.inDungeon||window.inTaverna||window.inArena||window.inTutorial)return;const t=time,dt=passo();luzes(t,dt);ultimo=time},
  vento,dgAr,dgLuzes};
})();
