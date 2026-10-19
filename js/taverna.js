/* ---------- Taverna do Javali Dourado: ponto de encontro de todos os jogadores ----------
   Um botão leva da ilha para a taverna (sala "taverna" do multijogador). Lá não há monstros e as
   habilidades interagem entre os jogadores: curas curam quem está na área (ou o jogador mirado),
   bênçãos e proteções fortalecem os outros e ataques só empurram, sem dano.
   O mapa é desenhado aqui em pixel art; a colisão está em tavernaWalk(). */
(function(){
 if(MODO.motor)return;
 const OX=24,OY=24,TW=416,TH=288,DOOR={x:OX+TW/2,y:OY+TH-6};
 const ENTRADA={x:OX+TW/2,y:OY+TH-30},BARKEEP={x:OX+104,y:OY+70,fx:0,fy:1,nm:'Taverneira Bete'};
 const MESAS=[{x:OX+112,y:OY+150},{x:OX+212,y:OY+196},{x:OX+316,y:OY+150},{x:OX+104,y:OY+236},{x:OX+322,y:OY+238}];
 const BARRIS=[{x:OX+398,y:OY+96},{x:OX+398,y:OY+116},{x:OX+386,y:OY+106},{x:OX+30,y:OY+250}];
 const LAREIRA={x:OX+328,y:OY+44};
 /* Lanceiro: mestre da arena (PvP, js/arena.js), de armadura de placas pesada, elmo fechado com pluma, escudo e lança */
 const LANCEIRO={x:OX+214,y:OY+100,fx:0,fy:1,nm:'Lanceiro Aldric'};
 // montado como os outros personagens (mesma escala de pixel): placas de ferro, grevas e botas de aço, capa, escudo e a lança do pacote de armas
 const LANCA_NPC=(()=>{const a=window.PACOTE_ARMAS&&PACOTE_ARMAS.ARMAS.lanca;return{v:{c:['#9aa7b8','#7a4a25'],st:0},equippedSprite:a?pixelArt(a.mao):null,ataque:'estocada',pega:a?a.pega:.72,escalaMao:2,wt:'lanca'}})();
 const looksLanceiro={},spriteLanceiro=d=>{const dir=d,k=d+(window.HEROI_MANA?HEROI_MANA.versao():'');return looksLanceiro[k]||(looksLanceiro[k]=human('war',dir,0,{nude:1,sex:'m',he:ITEMS.he1,ch:ITEMS.ch1,le:ITEMS.le2,bo:ITEMS.bo2,ca:ITEMS.ca1,sh:ITEMS.sh,sw:LANCA_NPC}))};
 /* mestres de classe: um por classe do projeto; aprender uma classe nova custa PRECO_CLASSE de ouro
    (voltar para uma classe que o jogador já aprendeu é grátis) */
 const PRECO_CLASSE=2000;
 const LUGARES_MESTRE=[[40,120],[40,170],[388,160],[388,206],[170,110],[262,110],[40,214],[388,250],[214,258]];
 let MESTRES=[];
 function montarMestres(){
  const ids=Object.keys(CL).filter(id=>id!=='sty'&&CL[id]&&CL[id].n);
  MESTRES=ids.slice(0,LUGARES_MESTRE.length).map((cls,i)=>({cls,x:OX+LUGARES_MESTRE[i][0],y:OY+LUGARES_MESTRE[i][1],fx:0,fy:1,nm:'Mestre '+CL[cls].n}));
 }
 let ilhaPos=null,enGuardado=null,fundo=null;
 window.inTaverna=false;

 /* ---- colisão ---- */
 window.tavernaWalk=(x,y)=>{
  if(x<OX+12||x>OX+TW-12||y<OY+54||y>OY+TH-12)return Math.abs(x-DOOR.x)<10&&y>=OY+TH-12&&y<=OY+TH-2;
  if(x<OX+190&&y<OY+92)return false;                       // balcão e área da taverneira
  if(x>OX+292&&x<OX+364&&y<OY+66)return false;             // lareira
  for(const m of MESAS)if(Math.hypot(x-m.x,(y-m.y)*1.3)<15)return false;
  for(const b of BARRIS)if(Math.hypot(x-b.x,y-b.y)<8)return false;
  for(const m of MESTRES)if(Math.hypot(x-m.x,(y-m.y)*1.4)<6)return false;
  if(Math.hypot(x-LANCEIRO.x,(y-LANCEIRO.y)*1.4)<8)return false;
  return true;
 };
 window.posicaoParaSalvar=()=>window.inTaverna&&ilhaPos?ilhaPos:p;

 /* ---- arte: fundo (piso, paredes, tapete, balcão) desenhado uma vez ---- */
 const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};
 const hsh=(a,b)=>{let h=(a*374761393+b*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};
 function desenharFundo(){
  const c=document.createElement('canvas');c.width=TW;c.height=TH;const g=c.getContext('2d');
  // piso de tábuas corridas: fileiras de 6 px com tábuas compridas de tamanhos variados
  for(let y=0,row=0;y<TH;y+=6,row++){let x=-((hsh(row,7)*40)|0);while(x<TW){
   const len=34+((hsh(x,row)*30)|0),v=hsh(row,x),base=v<.33?'#74492a':v<.66?'#7d5130':'#6c4326';
   R(g,x,y,len,6,base);R(g,x,y,len,1,'#8e6038');R(g,x,y+5,len,1,'#4a2d17');R(g,x+len-1,y,1,6,'#3a2412');
   for(let k=6;k<len-4;k+=9+((hsh(k,row)*7)|0))if(hsh(x+k,y)>.55)R(g,x+k,y+2+((hsh(k,x)*2)|0),4+((hsh(y,k)*5)|0),1,'#62402480');
   R(g,x+2,y+2,1,1,'#3a2412');R(g,x+len-3,y+2,1,1,'#3a2412');x+=len;
  }}
  // tapete central
  const tx=150,ty=118,tw=124,th=86;
  R(g,tx-1,ty-1,tw+2,th+2,'#2b1210');R(g,tx,ty,tw,th,'#8e2f2a');R(g,tx+3,ty+3,tw-6,th-6,'#d9a441');R(g,tx+5,ty+5,tw-10,th-10,'#7a2622');
  for(let i=0;i<tw-14;i+=8){R(g,tx+7+i,ty+8,4,2,'#c48a36');R(g,tx+7+i,ty+th-10,4,2,'#c48a36')}
  R(g,tx+tw/2-10,ty+th/2-6,20,12,'#a8392f');R(g,tx+tw/2-6,ty+th/2-3,12,6,'#d9a441');
  for(let i=0;i<tw;i+=4){R(g,tx+i,ty-3,2,2,'#d9a441');R(g,tx+i,ty+th+1,2,2,'#d9a441')}
  // parede do fundo: pedra embaixo, reboco com vigas em cima
  R(g,0,0,TW,52,'#b49470');
  for(let x=0;x<TW;x+=48){R(g,x,0,6,52,'#4a2f1a');R(g,x+1,0,1,52,'#6a4426')}
  R(g,0,0,TW,6,'#3f2816');R(g,0,6,TW,1,'#6a4426');R(g,0,20,TW,4,'#4a2f1a');
  for(let y=34;y<52;y+=6)for(let x=(y/6%2)*8;x<TW;x+=16){R(g,x,y,15,5,hsh(x,y)<.5?'#6b5a4b':'#5e4e41');R(g,x,y,15,1,'#80705f')}
  R(g,0,50,TW,3,'#2a1c12');
  // janelas com noite e lua
  for(const wx of [216,262]){R(g,wx-1,5,26,22,'#2c1b0f');R(g,wx,6,24,20,'#1d3550');R(g,wx+2,8,9,7,'#2a4a6e');R(g,wx+13,8,9,7,'#2a4a6e');R(g,wx+2,17,9,7,'#24405f');R(g,wx+13,17,9,7,'#24405f');R(g,wx+11,6,2,20,'#4a2f1a');R(g,wx,15,24,2,'#4a2f1a');R(g,wx-2,26,28,3,'#5a3a20')}
  R(g,220,9,4,4,'#f5ecc8');R(g,221,10,2,2,'#fffbe8');for(const [sx,sy] of [[230,11],[268,9],[280,19],[244,20]])R(g,sx,sy,1,1,'#cfe3ff');
  // prateleiras com garrafas atrás do balcão
  for(const sy of [14,30]){R(g,22,sy+8,150,3,'#5a3418');R(g,22,sy+11,150,1,'#2e1a0c');
   for(let i=0;i<14;i++){const bx=28+i*10+(hsh(i,sy)*3|0),cor=['#3f7a3a','#7a2a2a','#2f4f8a','#a8862f','#5a3a7a'][(hsh(sy,i)*5)|0],h=5+(hsh(i,sy+1)*4|0);R(g,bx,sy+8-h,4,h,cor);R(g,bx+1,sy+8-h-2,2,2,'#2a1a0c');R(g,bx+1,sy+8-h+1,1,h-2,'#ffffff40')}}
  // quadro de avisos
  R(g,140,8,40,28,'#3f2816');R(g,142,10,36,24,'#9a7046');for(const [nx,ny,c] of [[145,12,'#efe2c0'],[159,14,'#e8d6a8'],[148,23,'#f2e8cc'],[163,24,'#e2cf9c']]){R(g,nx,ny,11,9,c);R(g,nx+5,ny,1,1,'#b02a2a');R(g,nx+2,ny+3,7,1,'#8a7a5a');R(g,nx+2,ny+5,5,1,'#8a7a5a')}
  // lareira (pedra) — o fogo é animado no desenho
  const lx=LAREIRA.x-OX-36;R(g,lx,2,72,64,'#4f463f');for(let y=4;y<64;y+=7)for(let x=lx+((y/7)%2)*6;x<lx+70;x+=12){R(g,x,y,11,6,hsh(x,y)<.5?'#7a6e63':'#6a5f55');R(g,x,y,11,1,'#8f8478')}
  R(g,lx+14,26,44,38,'#1a1210');R(g,lx+16,28,40,36,'#2a1a12');R(g,lx-4,22,80,5,'#5a3418');R(g,lx-4,22,80,1,'#8a5a30');
  R(g,lx+20,58,32,4,'#3a2a20');R(g,lx+24,55,24,3,'#5a3418');
  // paredes laterais e de baixo, com a porta
  R(g,0,0,10,TH,'#3f2816');R(g,10,0,2,TH,'#6a4426');R(g,TW-10,0,10,TH,'#3f2816');R(g,TW-12,0,2,TH,'#6a4426');
  R(g,0,TH-10,TW,10,'#3f2816');R(g,0,TH-11,TW,1,'#6a4426');
  const dx=TW/2-13;R(g,dx-2,TH-14,30,14,'#2a1a0e');R(g,dx,TH-12,26,12,'#7a4a24');R(g,dx+12,TH-12,2,12,'#4a2a14');R(g,dx+2,TH-10,22,1,'#9a6a3a');R(g,dx+20,TH-7,2,2,'#e0c060');
  R(g,dx-6,TH-26,38,10,'#3f2816');R(g,dx-4,TH-24,34,6,'#d9a441');R(g,dx-2,TH-23,30,4,'#7a2622');
  // balcão
  R(g,8,70,186,20,'#3e2210');R(g,8,68,186,6,'#9a6636');R(g,8,68,186,1,'#c08a52');R(g,8,74,186,1,'#5a3418');
  for(let x=14;x<186;x+=26){R(g,x,77,20,10,'#5a3418');R(g,x+1,78,18,1,'#7a4a24')}
  R(g,8,88,186,3,'#24140a');
  for(const [cx,cor] of [[40,'#d9a441'],[70,'#c8c8c8'],[132,'#d9a441'],[160,'#7a2a2a']]){R(g,cx,62,5,7,cor);R(g,cx+5,64,2,3,cor);R(g,cx+1,63,3,1,'#fff8')}
  return c;
 }
 function mesa(m){
  const x=Math.round(m.x),y=Math.round(m.y);
  R(ctx,x-15,y+3,30,5,'#0005');R(ctx,x-2,y-4,4,9,'#3e2210');
  ctx.fillStyle='#4a2a14';ctx.beginPath();ctx.ellipse(x,y-6,15,8,0,0,7);ctx.fill();
  ctx.fillStyle='#8f5d31';ctx.beginPath();ctx.ellipse(x,y-7,14,7,0,0,7);ctx.fill();
  ctx.fillStyle='#a8703c';ctx.beginPath();ctx.ellipse(x-2,y-8,9,4,0,0,7);ctx.fill();
  R(ctx,x-6,y-11,3,4,'#d9a441');R(ctx,x-6,y-11,3,1,'#fff6d0');R(ctx,x+3,y-10,4,3,'#c8c8c8');R(ctx,x+3,y-11,4,1,'#f2f2f2');
  R(ctx,x-1,y-16,2,5,'#f2ead2');const f=Math.sin(time*11+x)>0?1:0;R(ctx,x-1,y-19-f,2,3,'#ffb02e');R(ctx,x,y-18,1,1,'#fff3a0');
 }
 function banquinho(x,y){R(ctx,x-4,y+1,8,2,'#0004');R(ctx,x-3,y-3,1,4,'#3e2210');R(ctx,x+2,y-3,1,4,'#3e2210');R(ctx,x-4,y-5,8,3,'#7a4a24');R(ctx,x-4,y-5,8,1,'#9a6636')}
 function barril(b){const x=Math.round(b.x),y=Math.round(b.y);R(ctx,x-7,y+1,14,3,'#0005');R(ctx,x-6,y-14,12,15,'#7a4a24');R(ctx,x-7,y-11,14,9,'#865230');R(ctx,x-6,y-14,12,2,'#9a6636');R(ctx,x-7,y-10,14,1,'#3b2c22');R(ctx,x-7,y-4,14,1,'#3b2c22');R(ctx,x-4,y-13,1,13,'#a8703c80')}
 function fogo(){
  const x=LAREIRA.x,y=OY+58;
  for(let i=0;i<6;i++){const h=8+Math.abs(Math.sin(time*9+i*1.7))*9,w=4;R(ctx,x-14+i*5,y-h,w,h,i%2?'#e8541e':'#ff7a1a')}
  for(let i=0;i<4;i++){const h=4+Math.abs(Math.sin(time*13+i))*6;R(ctx,x-9+i*5,y-h,3,h,'#ffd36b')}
  R(ctx,x-12,y-1,24,2,'#3a1a0a');
  const g=ctx.createRadialGradient(x,y,4,x,y+20,110);g.addColorStop(0,'rgba(255,150,60,'+(.22+.05*Math.sin(time*7))+')');g.addColorStop(1,'rgba(255,120,30,0)');ctx.fillStyle=g;ctx.fillRect(x-110,y-60,220,190);
 }

 /* ---- desenho da cena ---- */
 const bancos=[];MESAS.forEach(m=>{bancos.push({x:m.x-20,y:m.y+2},{x:m.x+20,y:m.y+2},{x:m.x,y:m.y+14})});
 window.drawTaverna=function(){
  if(!fundo)fundo=desenharFundo();
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0b0806';ctx.fillRect(0,0,cv.width,cv.height);
  ctx.setTransform(S,0,0,S,Math.round(cv.width/2-p.x*S),Math.round(cv.height/2-p.y*S));ctx.imageSmoothingEnabled=false;
  ctx.drawImage(fundo,OX,OY);
  fogo();
  const L=[];
  MESAS.forEach(m=>L.push([m.y,()=>mesa(m)]));
  bancos.forEach(b=>L.push([b.y-1,()=>banquinho(b.x,b.y)]));
  BARRIS.forEach(b=>L.push([b.y,()=>barril(b)]));
  L.push([BARKEEP.y,()=>{
   const f=face(BARKEEP),spr=(HS.sty||HS.war)[f.d];dr(spr,BARKEEP.x,BARKEEP.y,f.fl,1,anim(BARKEEP,0));
   ctx.font='6px monospace';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(BARKEEP.nm,BARKEEP.x+.5,BARKEEP.y-21.5-ACIMA_HEROI());ctx.fillStyle='#ffe28a';ctx.fillText(BARKEEP.nm,BARKEEP.x,BARKEEP.y-22-ACIMA_HEROI());
   ctx.fillStyle='#ffd84a';ctx.fillText('!',BARKEEP.x,BARKEEP.y-28+Math.round(Math.sin(time*4)*1.5));
  }]);
  // mestres de classe
  for(const m of MESTRES)L.push([m.y,()=>{
   const f=face(m),c=CL[m.cls];if(!c)return;
   const spr=c.sprite||(HS[c.base||m.cls]||HS.war)[f.d];
   if(mestreSob===m)circ(m.x,m.y,12,'#ff5');
   dr(spr,m.x,m.y,f.fl,1,anim(m,0));
   ctx.font='5px monospace';ctx.textAlign='center';ctx.textBaseline='alphabetic';
   ctx.fillStyle='#000';ctx.fillText(m.nm,m.x+.4,m.y-21.6-ACIMA_HEROI());ctx.fillStyle='#ffe28a';ctx.fillText(m.nm,m.x,m.y-22-ACIMA_HEROI());
   if(m.cls!==p.cls){ctx.fillStyle='#ffd84a';ctx.font='6px monospace';ctx.fillText('!',m.x,m.y-28+Math.round(Math.sin(time*4+m.x)*1.5))}
  }]);
  L.push([LANCEIRO.y,()=>{const x=LANCEIRO.x,y=LANCEIRO.y,f=face(LANCEIRO);
   if(lanceiroSob)circ(x,y,12,'#ff5');
   dr(spriteLanceiro(f.d),x,y,f.fl,1,anim(LANCEIRO,0));
   ctx.font='5px monospace';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillStyle='#000';ctx.fillText(LANCEIRO.nm,x+.4,y-21.6-ACIMA_HEROI());ctx.fillStyle='#ffe28a';ctx.fillText(LANCEIRO.nm,x,y-22-ACIMA_HEROI());
   ctx.fillStyle='#f87171';ctx.font='bold 6px monospace';ctx.fillText('PvP',x,y-28+Math.round(Math.sin(time*4)*1.5))}]);
  // o balcão fica na frente da taverneira
  L.push([OY+91,()=>ctx.drawImage(fundo,8,66,186,26,OX+8,OY+66,186,26)]);
  if(p.dead<=0)L.push([p.y,()=>{const o=lunge(p,p.wt,p.aw,.25);ctx.globalAlpha=p.hit>0?.5:1;const f=face(p),an=anim(p,.25);dr.ent=p;dr(heroImg(f.d,an),p.x+o[0],p.y+o[1],f.fl,1,an);ctx.globalAlpha=1;
   const barW=28,t=1/S,bx=Math.round(p.x-barW/2),by=Math.round(p.y-25-ACIMA_HEROI()),hr=Math.max(0,Math.min(1,p.hp/mhp())),mr=Math.max(0,Math.min(1,p.mp/mmp()));
   R(ctx,bx-t,by-t,barW+2*t,3+3*t,'#3a3a3a');R(ctx,bx,by,barW,2,'#173d1c');ctx.fillStyle='#4cd04f';ctx.fillRect(bx,by,barW*hr,2);ctx.fillStyle='#10203a';ctx.fillRect(bx,by+2+t,barW,1);ctx.fillStyle='#3985ed';ctx.fillRect(bx,by+2+t,barW*mr,1)}]);
  if(window.onlineDrawables)onlineDrawables(L);
  L.sort((a,b)=>a[0]-b[0]).forEach(l=>l[1]());
  // luz quente das velas e sombra nos cantos
  ctx.save();ctx.globalCompositeOperation='screen';
  for(const m of MESAS){const g=ctx.createRadialGradient(m.x,m.y-16,1,m.x,m.y-16,46);g.addColorStop(0,'rgba(255,190,90,.20)');g.addColorStop(1,'rgba(255,160,60,0)');ctx.fillStyle=g;ctx.fillRect(m.x-46,m.y-62,92,92)}
  ctx.restore();
  proj.forEach(q=>{R(ctx,q.x-3,q.y-3,6,6,q.c||'#ff7a1a')});
  fxs.forEach(f=>{const q=Math.max(0,Math.min(1,f.t/f.d));ctx.globalAlpha=1-q;circ(f.x,f.y,f.r*(.35+q),f.c);ctx.globalAlpha=1});
  ctx.font='6px monospace';ctx.textAlign='center';
  fts.forEach(f=>{ctx.globalAlpha=Math.max(0,f.a);ctx.fillStyle='#000';ctx.fillText(f.t,Math.round(f.x)+.5,Math.round(f.y)+.5);ctx.fillStyle=f.c;ctx.fillText(f.t,Math.round(f.x),Math.round(f.y));ctx.globalAlpha=1});
  ctx.setTransform(1,0,0,1,0,0);
  const v=ctx.createRadialGradient(cv.width/2,cv.height/2,Math.min(cv.width,cv.height)*.35,cv.width/2,cv.height/2,Math.max(cv.width,cv.height)*.75);
  v.addColorStop(0,'rgba(10,5,2,0)');v.addColorStop(1,'rgba(10,5,2,.55)');ctx.fillStyle=v;ctx.fillRect(0,0,cv.width,cv.height);
  minimapa();
 };
 function minimapa(){
  const mm=$('mm').getContext('2d'),SZ=160,k=(SZ-16)/TW,ox=8,oy=(SZ-TH*k)/2;
  mm.setTransform(1,0,0,1,0,0);mm.fillStyle='#0b0806';mm.fillRect(0,0,SZ,SZ);
  mm.imageSmoothingEnabled=false;if(fundo)mm.drawImage(fundo,ox,oy,TW*k,TH*k);
  const at=(x,y)=>[ox+(x-OX)*k,oy+(y-OY)*k];
  if(window.onlineMinimap)onlineMinimap(mm,OX-ox/k,OY-oy/k,k,SZ);
  const [px,py]=at(p.x,p.y);mm.fillStyle='#000';mm.fillRect(px-3,py-3,6,6);mm.fillStyle='#fff';mm.fillRect(px-2,py-2,4,4);
 }

 /* ---- entrar e sair ---- */
 function entrar(){
  if(window.inTaverna)return;
  if(window.inDungeon){ft(p.x,p.y-24,'Saia da masmorra antes de ir à taverna.','#f87171');return}
  if(p.dead>0)return;
  if(window.inArena&&window.ARENA)ARENA.sair(true);
  if(window.MP&&MP.antesDeSair)MP.antesDeSair();
  ilhaPos={x:p.x,y:p.y};enGuardado=en.splice(0,en.length);montarMestres();
  clearMovementInput();window.inTaverna=true;
  p.x=ENTRADA.x;p.y=ENTRADA.y;p.fx=0;p.fy=-1;proj.length=0;
  ft(p.x,p.y-30,'Taverna do Javali Dourado','#ffd84a');ring(p.x,p.y,30,'#ffd84a',.6);
  atualizarBotao();
 }
 function sair(silencioso){
  if(!window.inTaverna)return;
  window.inTaverna=false;clearMovementInput();
  en.length=0;if(enGuardado)en.push(...enGuardado);enGuardado=null;
  const volta=ilhaPos&&walk(ilhaPos.x,ilhaPos.y)?ilhaPos:{x:CX,y:CY+34};p.x=volta.x;p.y=volta.y;ilhaPos=null;
  if(!silencioso)ft(p.x,p.y-24,'De volta à ilha','#ffd84a');
  atualizarBotao();if(window.saveGame)saveGame();
 }
 window.entrarTaverna=entrar;window.sairTaverna=sair;
 const botao=document.createElement('button');botao.type='button';botao.className='ib tavBtn';
 function atualizarBotao(){botao.textContent=window.inTaverna?'Sair da taverna':'Taverna';botao.title=window.inTaverna?'Voltar para a sua ilha':'Ir para a taverna, onde todos os jogadores se encontram'}
 botao.onclick=()=>window.inTaverna?sair():entrar();atualizarBotao();
 (document.getElementById('hbtns')||document.body).append(botao);

 /* ---- cliques: porta e taverneira ---- */
 window.tavernaClick=(w,mode)=>{
  mestreAlvo=null;lanceiroAlvo=false;
  if(Math.hypot(w.x-DOOR.x,w.y-(DOOR.y-4))<16){if(dist(p,DOOR)<34)sair();else setDest(DOOR.x,DOOR.y-12);return true}
  if(Math.hypot(w.x-BARKEEP.x,w.y-(BARKEEP.y-8))<16&&mode!=2){if(dist(p,BARKEEP)<44)falarTaverneira();else setDest(BARKEEP.x,OY+100);return true}
  if(Math.hypot(w.x-LANCEIRO.x,w.y-(LANCEIRO.y-10))<13&&mode!=2){if(dist(p,LANCEIRO)<36)falarLanceiro();else{lanceiroAlvo=true;setDest(LANCEIRO.x,LANCEIRO.y+14)}return true}
  const m=mestreEm(w);
  if(m&&mode!=2){if(dist(p,m)<34)falarMestre(m);else{mestreAlvo=m;setDest(m.x,m.y+12)}return true}
  return false;
 };
 let mestreSob=null,mestreAlvo=null,lanceiroSob=false,lanceiroAlvo=false;
 /* painel de PvP do Lanceiro (js/arena.js): partidas 1x1 / 2x2 com lobby, ou treino com o boneco */
 function falarLanceiro(){lanceiroAlvo=false;if(window.ARENA)ARENA.abrirPainel()}
 const mestreEm=w=>MESTRES.find(m=>Math.hypot(w.x-m.x,w.y-(m.y-8))<14)||null;
 function falarMestre(m){
  mestreAlvo=null;
  const c=CL[m.cls];if(!c)return;
  const box=$('dialogue');box.classList.remove('dgModal');
  const atual=p.cls===m.cls,aprendida=!!(p.classProgress&&p.classProgress[m.cls]),preco=aprendida?0:PRECO_CLASSE;
  const ps=c.passive&&c.passive.n?'<p>Passiva: <b>'+c.passive.n+'</b>'+(c.passive.d?' – '+c.passive.d:'')+'</p>':'';
  box.innerHTML='<b>'+m.nm+'</b>'+
   (atual?'<p>Você já é '+c.n+'. Continue treinando!</p>'
    :'<p>Quer seguir o caminho de '+c.n+'?'+(aprendida?' Você já aprendeu esta classe: trocar é grátis.':' Aprender custa <b>'+PRECO_CLASSE.toLocaleString('pt-BR')+' de ouro</b>.')+'</p>'+ps+
     '<p>Você tem '+p.gold.toLocaleString('pt-BR')+' de ouro.</p><button type="button" data-tav-classe>'+(aprendida?'Trocar para '+c.n:'Aprender '+c.n+' ('+PRECO_CLASSE.toLocaleString('pt-BR')+' de ouro)')+'</button>')+
   '<button type="button" data-close-dialog>Até mais</button>';
  box.classList.add('open');
  const b=box.querySelector('[data-tav-classe]');
  if(b)b.onclick=()=>{
   if(p.gold<preco){ft(p.x,p.y-24,'Ouro insuficiente: precisa de '+preco.toLocaleString('pt-BR'),'#f87171');return}
   p.gold-=preco;box.classList.remove('open');
   setClass(m.cls);if(preco&&window.playGameSound)playGameSound('coin');
  };
 }
 function falarTaverneira(){
  const box=$('dialogue');box.classList.remove('dgModal');
  box.innerHTML='<b>Taverneira Bete</b><p>Bem-vindo ao Javali Dourado! Aqui todo mundo se encontra.</p>'+
   '<p>Suas habilidades funcionam com os outros: curas curam quem está perto ou o amigo que você mirar, bênçãos e proteções fortalecem o grupo e ataques só empurram. Ninguém se machuca aqui dentro.</p>'+
   '<button type="button" data-tav-bebida>Pedir uma bebida (5 de ouro): vida e mana cheias</button><button type="button" data-tav-vender>Vender itens</button><button type="button" data-close-dialog>Até mais</button>';
  box.classList.add('open');
  box.querySelector('[data-tav-vender]').onclick=abrirVenda;
  const b=box.querySelector('[data-tav-bebida]');
  if(b)b.onclick=()=>{if(p.gold<5){ft(p.x,p.y-24,'Ouro insuficiente','#f87171');return}p.gold-=5;p.hp=mhp();p.mp=mmp();ring(p.x,p.y,24,'#ffd84a',.5);ft(p.x,p.y-24,'Saúde!','#ffd84a');box.classList.remove('open');if(window.playGameSound)playGameSound('coin')};
 }
 /* venda de itens da bolsa (preço em state.js precoVenda; configurável na Engine). Itens de missão não entram. */
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function abrirVenda(){
  const box=$('dialogue');box.classList.remove('dgModal');
  const itens=I.map((s,i)=>[s,i]).filter(([s])=>s&&ITEMS[s.id]&&!(window.ehMissao&&ehMissao(s.id)));
  const linha=([s,i])=>{const nome=ITEMS[s.id].n.split(' (')[0],pr=precoVenda(s.id,s.q),cor=gearType[s.id]&&s.q!=null?QCOL[qi(s.q)]:'#e7dcc4';
   return '<div class="tavItem"><img src="'+ITEMS[s.id].ic+'" alt=""><span style="color:'+cor+'">'+esc(nome)+(s.n>1?' ×'+s.n:'')+(gearType[s.id]&&s.q!=null?' <small>'+s.q+'%</small>':'')+'</span>'
    +'<b>'+pr+' ouro</b><button type="button" data-vender="'+i+'" data-qtd="1">Vender</button>'+(s.n>1?'<button type="button" data-vender="'+i+'" data-qtd="'+s.n+'">Todos ('+pr*s.n+')</button>':'')+'</div>'};
  box.innerHTML='<b>Taverneira Bete · Vender</b><p>Você tem <b class="tavOuro">'+(p.gold|0).toLocaleString('pt-BR')+'</b> de ouro. Itens equipados e de missão não aparecem aqui.</p>'+
   '<div class="tavVenda">'+(itens.length?itens.map(linha).join(''):'<p class="dgm-muted">Nada para vender na bolsa.</p>')+'</div>'+
   '<button type="button" data-tav-voltar>Voltar</button><button type="button" data-close-dialog>Até mais</button>';
  box.classList.add('open');
  box.querySelector('[data-tav-voltar]').onclick=falarTaverneira;
  box.querySelectorAll('[data-vender]').forEach(b=>b.onclick=()=>{
   const i=+b.dataset.vender,s=I[i];if(!s)return;const qtd=Math.min(s.n,+b.dataset.qtd||1),total=precoVenda(s.id,s.q)*qtd;
   s.n-=qtd;if(s.n<=0)I[i]=null;p.gold+=total;dirtyInv=true;
   ft(p.x,p.y-24,'+'+total+' ouro','#ffd84a');if(window.playGameSound)playGameSound('coin');saveGame();abrirVenda();
  });
 }
 window.abrirVendaTaverna=abrirVenda;
 // a porta também funciona ao chegar nela andando
 const upd0=upd;upd=function(dt){upd0(dt);
  if(!window.inTaverna)return;
  BARKEEP.fx=p.x-BARKEEP.x;BARKEEP.fy=p.y-BARKEEP.y;if(dist(p,BARKEEP)>110){BARKEEP.fx=0;BARKEEP.fy=1}
  for(const m of MESTRES){if(dist(p,m)<70){m.fx=p.x-m.x;m.fy=p.y-m.y}else{m.fx=0;m.fy=1}}
  mestreSob=mestreEm(wpos());if(mestreSob)cv.style.cursor='pointer';
  {const w=wpos();lanceiroSob=Math.hypot(w.x-LANCEIRO.x,w.y-(LANCEIRO.y-10))<13;if(lanceiroSob)cv.style.cursor='pointer'}
  if(dist(p,LANCEIRO)<70){LANCEIRO.fx=p.x-LANCEIRO.x;LANCEIRO.fy=p.y-LANCEIRO.y}else{LANCEIRO.fx=0;LANCEIRO.fy=1}
  if(lanceiroAlvo&&dist(p,LANCEIRO)<36){p.dest=null;p.path=[];falarLanceiro()}
  if(mestreAlvo&&dist(p,mestreAlvo)<34){p.dest=null;p.path=[];falarMestre(mestreAlvo)}
  if(p.y>OY+TH-12&&Math.abs(p.x-DOOR.x)<10)sair();
 };

 /* ---- habilidades que interagem entre jogadores ---- */
 function tipoDe(s){
  if(s.effect==='heal')return 'cura';
  if(s.effect==='buff'||s.effect==='guard')return 'bencao';
  const txt=(s.n||'')+' '+(typeof s.d==='function'?(()=>{try{return s.d()}catch(e){return ''}})():s.d||'');
  if(/\bcura\b|recupera/i.test(txt))return 'cura';
  if(/aumenta|metade do dano|protege|escudo|b[eê]n[cç][aã]o|f[uú]ria/i.test(txt))return 'bencao';
  return 'impacto';
 }
 window.tipoHabilidade=tipoDe;
 const COR={cura:'#7f7',bencao:'#ffd84a',impacto:'#f97316'};
 function jogadorPerto(w){
  if(!window.MP)return null;let melhor=null,bd=40;
  for(const o of MP.remotos.values()){const d=Math.hypot(o.x-w.x,o.y-w.y);if(d<bd){bd=d;melhor=o}}
  return melhor;
 }
 function enviar(fx){
  if(!window.NUVEM||!window.MP||MP.sala!=='taverna')return;
  const r=NUVEM.db.ref('salas/taverna/fx').push({de:NUVEM.uid,nome:NUVEM.nome(),...fx,t:firebase.database.ServerValue.TIMESTAMP});
  setTimeout(()=>r.remove().catch(()=>{}),6000);
 }
 const cast0=cast;
 cast=function(s){
  if(!window.inTaverna)return cast0(s);
  const tipo=tipoDe(s);
  if(s.f&&s.f.tg){
   // habilidade com alvo: mira outro jogador perto do cursor
   if(p.dead>0||s.t>0||!s.f||p.mp<s.mana||s.lock)return cast0(s);
   const w=wpos(),alvo=jogadorPerto(w);
   if(!alvo){ft(p.x,p.y-24,'Mire em outro jogador','#ccc');return}
   if(dist(p,alvo)>200){ft(p.x,p.y-24,'Longe demais','#ccc');return}
   p.mp-=s.mana;s.t=s.cd*cooldownMultiplier(p);p.fx=alvo.x-p.x;p.fy=alvo.y-p.y;
   fxs.push({x:alvo.x,y:alvo.y,r:18,c:COR[tipo],t:0,d:.5});ring(alvo.x,alvo.y,14,COR[tipo],.4);
   ft(alvo.x,alvo.y-30,s.n,COR[tipo]);if(window.playGameSound)playGameSound('magic');
   enviar({tipo,alvo:alvo.uid,x:Math.round(alvo.x),y:Math.round(alvo.y),r:16,hab:s.n});
   return;
  }
  const t0=s.t;cast0(s);
  if(s.t>t0)enviar({tipo,x:Math.round(p.x),y:Math.round(p.y),r:Math.max(30,Math.min(70,+s.radius||48)),hab:s.n});
 };
 function receber(f){
  if(!f||!window.inTaverna||f.de===(window.NUVEM&&NUVEM.uid))return;
  if(Date.now()+((window.NUVEM&&NUVEM.offset)||0)-(f.t||0)>4000)return;
  const cor=COR[f.tipo]||'#fff';
  fxs.push({x:f.x,y:f.y,r:f.r||30,c:cor,t:0,d:.6});
  const atingido=f.alvo?f.alvo===NUVEM.uid:Math.hypot(p.x-f.x,p.y-f.y)<=(f.r||30)+6;
  if(!atingido||p.dead>0)return;
  if(f.tipo==='cura'){const v=Math.round(mhp()*.2);p.hp=Math.min(mhp(),p.hp+v);ft(p.x,p.y-24,'+'+v+' ('+f.nome+')','#6f6');ring(p.x,p.y,16,'#7f7',.4)}
  else if(f.tipo==='bencao'){p.bf=Math.max(p.bf||0,6);ft(p.x,p.y-24,'Bênção de '+f.nome+'!','#ffd84a');ring(p.x,p.y,20,'#ffd84a',.5)}
  else{
   // empurrão sem dano
   const a=Math.atan2(p.y-f.y,p.x-f.x)||Math.random()*6.28;
   for(let i=0;i<22;i++){const nx=p.x+Math.cos(a),ny=p.y+Math.sin(a);if(!walk(nx,ny))break;p.x=nx;p.y=ny}
   p.dest=null;p.path=[];p.hit=.2;ft(p.x,p.y-24,['Ei!','Ai!','Opa!','Haha!'][Math.random()*4|0],'#f97316');
  }
 }
 window.addEventListener('mp-sala',e=>{
  const sala=e.detail&&e.detail.sala;
  if(window._tavOff){_tavOff();window._tavOff=null}
  if(sala!=='taverna'||!window.NUVEM)return;
  const r=NUVEM.db.ref('salas/taverna/fx'),fn=s=>receber(s.val());
  r.on('child_added',fn);window._tavOff=()=>r.off('child_added',fn);
 });
})();
