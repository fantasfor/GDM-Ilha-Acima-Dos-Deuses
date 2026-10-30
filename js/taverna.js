/* ---------- Taverna do Javali Dourado: ponto de encontro de todos os jogadores ----------
   Um botão leva da ilha para a taverna (sala "taverna" do multijogador). Lá não há monstros e as
   habilidades interagem entre os jogadores: curas curam quem está na área (ou o jogador mirado),
   bênçãos e proteções fortalecem os outros e ataques só empurram, sem dano.
   Palco com bardo e tamborileiro tocando as músicas da taverna (js/musica-taverna.js: as mesmas, no mesmo ponto, para
   todos), janelas que mostram o dia e a noite (js/tempo.js), quadro de missões na parede (matar de 2 a 10 monstros, por
   ouro e XP) e a taverneira, que anda atrás do balcão e vem até o balcão quando é chamada.
   O mapa é desenhado aqui em pixel art; a colisão está em tavernaWalk(). */
(function(){
 const OX=24,OY=24,TW=480,TH=320,DOOR={x:OX+TW/2,y:OY+TH-6};
 window.TAVERNA_GEO={OX,OY,TW,TH}; // o pátio do bar (js/bar.js) fica do lado direito
 const ENTRADA={x:OX+TW/2,y:OY+TH-30};
 /* taverneira: anda atrás do balcão (para trás, até as prateleiras, e para os lados); clicada, vem até o balcão */
 // o chão atrás do balcão vai da parede (y 52) até a beirada de trás do balcão (y ~84): ela pisa ali, nunca no tampo
 const BALCAO_Y=OY+78,ATRAS={x0:OX+24,x1:OX+184,y0:OY+60,y1:BALCAO_Y};
 const BARKEEP={x:OX+104,y:BALCAO_Y,fx:0,fy:1,nm:'Taverneira Bete',alvo:null,espera:3,chamada:null,deCostas:false};
 /* posições editáveis na Engine (cena Taverna): js/taverna-layout.js. Mesas "redonda" são desenhadas aqui; as "jogo",
    em js/bar.js. A colisão de mesas, barris e decorações é BAR.bloqueia. */
 const LAY=window.TAVERNA_LAYOUT,LL=LAY.L;
 const MESAS=LL.mesas.filter(m=>m.estilo!=='jogo');
 const BARRIS=LL.barris;
 const LAREIRA=LL.lareira;
 const JANELAS=[210,246]; // x (no fundo) das duas janelas da parede do fundo
 /* quadro de missões na parede do fundo (x = centro, y = base do quadro) */
 const QUADRO={x:LL.quadro.x,y:LL.quadro.y,x0:LL.quadro.x-OX-26,y0:LL.quadro.y-OY-32,w:52,h:32};
 /* palco encostado na parede; cortina atrás; bardo (alaúde) e tamborileiro */
 const PALCO={...LL.palco};
 const BARDO={...LL.npcs.bardo,fx:0,fy:1},TAMBOR={...LL.npcs.tambor,fx:0,fy:1};
 /* Lanceiro: mestre da arena (PvP, js/arena.js), de armadura de placas pesada, elmo fechado com pluma, escudo e lança */
 const LANCEIRO={...LL.npcs.lanceiro,fx:0,fy:1,nm:'Lanceiro Aldric'};
 // montado como os outros personagens (mesma escala de pixel): placas de ferro, grevas e botas de aço, capa, escudo e a lança do pacote de armas
 const LANCA_NPC=(()=>{const a=window.PACOTE_ARMAS&&PACOTE_ARMAS.ARMAS.lanca;return{v:{c:['#9aa7b8','#7a4a25'],st:0},equippedSprite:a?pixelArt(a.mao):null,ataque:'estocada',pega:a?a.pega:.72,escalaMao:2,wt:'lanca'}})();
 const looksLanceiro={},spriteLanceiro=d=>{const dir=d,k=d+(window.HEROI_MANA?HEROI_MANA.versao():'');return looksLanceiro[k]||(looksLanceiro[k]=human('war',dir,0,{nude:1,sex:'m',he:ITEMS.he1,ch:ITEMS.ch1,le:ITEMS.le2,bo:ITEMS.bo2,ca:ITEMS.ca1,sh:ITEMS.sh,sw:LANCA_NPC}))};
 /* mestres de classe: um por classe do projeto; aprender uma classe nova = vencer o Mestre num duelo na arena
   (js/arena.js ARENA.duelo); voltar para uma classe já aprendida é grátis */
 const LUGARES_MESTRE=LL.mestres;
 let MESTRES=[];
 function montarMestres(){
  const ids=Object.keys(CL).filter(id=>id!=='sty'&&CL[id]&&CL[id].n);
  MESTRES=ids.slice(0,LUGARES_MESTRE.length).map((cls,i)=>({cls,x:LUGARES_MESTRE[i].x,y:LUGARES_MESTRE[i].y,fx:0,fy:1,nm:'Mestre '+CL[cls].n}));
 }
 let ilhaPos=null,enGuardado=null,fundo=null;
 window.inTaverna=false;

 /* ---- colisão ---- */
 window.tavernaWalk=(x,y)=>{
  if(window.BAR){if(BAR.portaEm(x,y))return true;if(BAR.dentro(x,y))return BAR.walk(x,y)} // porta e pátio do bar
  if(x<OX+12||x>OX+TW-12||y<OY+54||y>OY+TH-12)return Math.abs(x-DOOR.x)<10&&y>=OY+TH-12&&y<=OY+TH-2;
  if(x<OX+196&&y<OY+92)return false;                       // balcão e área da taverneira
  if(Math.abs(x-LAREIRA.x)<43&&y<LAREIRA.y+22)return false;  // lareira
  if(x>PALCO.x0-4&&x<PALCO.x1+4&&y>PALCO.y0-46&&y<PALCO.y1+8)return false; // palco, cortina e a placa (ninguém fica escondido atrás)
  if(window.BAR&&BAR.bloqueia(x,y))return false;            // mesas, barris e decorações
  for(const m of MESTRES)if(Math.hypot(x-m.x,(y-m.y)*1.4)<6)return false;
  if(Math.hypot(x-LANCEIRO.x,(y-LANCEIRO.y)*1.4)<8)return false;
  return true;
 };
 window.posicaoParaSalvar=()=>window.inTaverna&&ilhaPos?ilhaPos:p;

 /* ---- arte: fundo (piso, paredes, tapete, balcão, palco) desenhado uma vez ---- */
 const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};
 const hsh=(a,b)=>{let h=(a*374761393+b*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};
 function desenharFundo(soParedes){
  const c=document.createElement('canvas');c.width=TW;c.height=TH;const g=c.getContext('2d');
  // piso de tábuas corridas: fileiras de 6 px com tábuas compridas de tamanhos variados
  for(let y=0,row=0;y<TH;y+=6,row++){let x=-((hsh(row,7)*40)|0);while(x<TW){
   const len=34+((hsh(x,row)*30)|0),v=hsh(row,x),base=v<.33?'#74492a':v<.66?'#7d5130':'#6c4326';
   R(g,x,y,len,6,base);R(g,x,y,len,1,'#8e6038');R(g,x,y+5,len,1,'#4a2d17');R(g,x+len-1,y,1,6,'#3a2412');
   for(let k=6;k<len-4;k+=9+((hsh(k,row)*7)|0))if(hsh(x+k,y)>.55)R(g,x+k,y+2+((hsh(k,x)*2)|0),4+((hsh(y,k)*5)|0),1,'#62402480');
   R(g,x+2,y+2,1,1,'#3a2412');R(g,x+len-3,y+2,1,1,'#3a2412');x+=len;
  }}
  // parede do fundo: pedra embaixo, reboco (com textura e manchas) e vigas de madeira com luz e sombra
  R(g,0,0,TW,52,'#b49470');
  for(let y=6;y<34;y++)for(let x=0;x<TW;x++){const n=hsh(x,y*7);if(n<.08)R(g,x,y,1,1,'#a88660');else if(n>.95)R(g,x,y,1,1,'#c4a684')}
  for(let i=0;i<14;i++){const x=hsh(i,5)*TW|0,y=8+(hsh(i,6)*20|0);R(g,x,y,3+(hsh(i,7)*5|0),2,'#a6845f')}
  for(let x=0;x<TW;x+=48){R(g,x,0,6,52,'#4a2f1a');R(g,x+1,0,1,52,'#6a4426');R(g,x+5,0,1,52,'#2e1d10');for(let y=4;y<50;y+=9)R(g,x+2,y,2,1,'#3a2414')}
  R(g,0,0,TW,6,'#3f2816');R(g,0,6,TW,1,'#6a4426');R(g,0,20,TW,4,'#4a2f1a');
  for(let y=34;y<52;y+=6)for(let x=(y/6%2)*8;x<TW;x+=16){R(g,x,y,15,5,hsh(x,y)<.5?'#6b5a4b':'#5e4e41');R(g,x,y,15,1,'#80705f')}
  R(g,0,50,TW,3,'#2a1c12');
  // moldura das janelas (o céu é desenhado a cada quadro: dia ou noite)
  for(const wx of JANELAS){R(g,wx-2,4,30,26,'#2c1b0f');R(g,wx-3,28,32,3,'#5a3a20')}
  // troféu: o Javali Dourado numa placa de madeira (entre as prateleiras e as janelas)
  {const bx=179,by=7;R(g,bx,by,22,24,'#3f2816');R(g,bx+1,by+1,20,22,'#7a4a24');R(g,bx+1,by+1,20,1,'#a8703c');R(g,bx+3,by+21,16,2,'#5a3418');
   R(g,bx+5,by+6,12,10,'#b8862a');R(g,bx+6,by+5,10,1,'#d9a441');R(g,bx+4,by+5,3,4,'#d9a441');R(g,bx+15,by+5,3,4,'#d9a441');R(g,bx+4,by+4,2,2,'#8a5a1a');R(g,bx+16,by+4,2,2,'#8a5a1a');
   R(g,bx+8,by+9,2,2,'#2a1a0c');R(g,bx+12,by+9,2,2,'#2a1a0c');R(g,bx+8,by+13,6,4,'#d9a441');R(g,bx+9,by+14,1,1,'#5a3418');R(g,bx+12,by+14,1,1,'#5a3418');
   R(g,bx+6,by+15,2,3,'#fff6d0');R(g,bx+14,by+15,2,3,'#fff6d0');R(g,bx+7,by+7,2,1,'#f2d07a')}
  // prateleiras com garrafas atrás do balcão
  for(const sy of [14,30]){R(g,22,sy+8,150,3,'#5a3418');R(g,22,sy+11,150,1,'#2e1a0c');
   for(let i=0;i<14;i++){const bx=28+i*10+(hsh(i,sy)*3|0),cor=['#3f7a3a','#7a2a2a','#2f4f8a','#a8862f','#5a3a7a'][(hsh(sy,i)*5)|0],h=5+(hsh(i,sy+1)*4|0);R(g,bx,sy+8-h,4,h,cor);R(g,bx+1,sy+8-h-2,2,2,'#2a1a0c');R(g,bx+1,sy+8-h+1,1,h-2,'#ffffff40')}}
  // quadro de missões e lareira (posições editáveis; na Engine são desenhados à parte)
  if(!soParedes){pintarQuadro(g,QUADRO,OX,OY);pintarLareira(g,LAREIRA,OX,OY)}
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
  if(!soParedes)pintarPalco(g,PALCO,OX,OY);
  return c;
 }
 /* peças do fundo com posição editável, desenhadas em g com o canto (ox, oy) do mundo na origem */
 function pintarQuadro(g,q,ox,oy){const x0=q.x-26-ox,y0=q.y-32-oy,w=52,h=32;
  R(g,x0-2,y0-2,w+4,h+4,'#3f2816');R(g,x0,y0,w,h,'#9a7046');for(let y=y0+3;y<y0+h;y+=6)R(g,x0,y,w,1,'#8a6038');R(g,x0-2,y0-2,w+4,1,'#6a4426')}
 // lareira de pedra (o fogo é animado no desenho da cena): 72×64, com o centro em x e a base 22 px abaixo de y
 function pintarLareira(g,l,ox,oy){const lx=l.x-36-ox,t=l.y-44-oy;
  R(g,lx,t+2,72,64,'#4f463f');for(let y=4;y<64;y+=7)for(let x=lx+((y/7)%2)*6;x<lx+70;x+=12){R(g,x,t+y,11,6,hsh(x+ox-OX,y)<.5?'#7a6e63':'#6a5f55');R(g,x,t+y,11,1,'#8f8478')}
  R(g,lx+14,t+26,44,38,'#1a1210');R(g,lx+16,t+28,40,36,'#2a1a12');R(g,lx-4,t+22,80,5,'#5a3418');R(g,lx-4,t+22,80,1,'#8a5a30');
  R(g,lx+20,t+58,32,4,'#3a2a20');R(g,lx+24,t+55,24,3,'#5a3418')}
 // palco: tablado de tábuas claras com a beirada da frente
 function pintarPalco(g,P,ox,oy){const x0=P.x0-ox,x1=P.x1-ox,y0=P.y0-oy,y1=P.y1-oy;
  R(g,x0-2,y0-2,x1-x0+2,y1-y0+12,'#24140a');
  for(let y=y0,k=0;y<y1;y+=5,k++){R(g,x0,y,x1-x0,5,k%2?'#a8743f':'#9a6a38');R(g,x0,y,x1-x0,1,'#c08a52');for(let x=x0+((k*17)%30);x<x1;x+=30)R(g,x,y,1,5,'#6a4424')}
  R(g,x0,y1,x1-x0,8,'#5a3418');R(g,x0,y1,x1-x0,1,'#d9a441');for(let x=x0+6;x<x1;x+=16)R(g,x,y1+2,8,4,'#4a2a14');R(g,x0,y1+8,x1-x0,2,'#1a0e06');
  R(g,x0-2,y0,2,y1-y0+8,'#3e2210')}
 /* céu da janela: azul com nuvens de dia, escuro com lua e estrelas à noite (relógio do jogo) */
 function janela(wx){
  const x=OX+wx,y=OY+6,k=window.TEMPO?TEMPO.escuro():0,mix=(a,b)=>{const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);return'rgb('+[16,8,0].map(s=>Math.round(((A>>s)&255)*(1-k)+((B>>s)&255)*k)).join(',')+')'};
  // céu (só dentro do vidro: tudo recortado no retângulo da janela) com morros ao longe
  ctx.save();ctx.beginPath();ctx.rect(x,y,26,22);ctx.clip();
  R(ctx,x,y,26,22,mix('#7fbfe8','#101e36'));R(ctx,x,y+8,26,8,mix('#9ccff0','#16284a'));R(ctx,x,y+14,26,8,mix('#c4e4f6','#1d3550'));
  if(k<.6){ctx.globalAlpha=1-k/.6;const n=(time*1.5+wx*3)%46;for(const [o,yy,w] of [[0,4,9],[23,10,7]]){const cx=x-10+((n+o)%46);R(ctx,cx,yy+y,w,2,'#ffffff');R(ctx,cx+2,yy+y-1,w-4,1,'#ffffff');R(ctx,cx+1,yy+y+2,w-2,1,'#dbeaf6')}ctx.globalAlpha=1}
  if(k>.4){ctx.globalAlpha=(k-.4)/.6;if(wx===JANELAS[0]){R(ctx,x+4,y+3,4,4,'#f5ecc8');R(ctx,x+5,y+4,2,2,'#fffbe8');R(ctx,x+7,y+3,1,1,mix('#7fbfe8','#101e36'))}for(const [sx,sy] of [[14,5],[20,3],[9,11],[22,12],[17,9],[3,13]])R(ctx,x+((sx+wx)%24),y+sy,1,1,(sx+sy)%3?'#cfe3ff':'#ffffff');ctx.globalAlpha=1}
  R(ctx,x,y+17,26,5,mix('#5f8a4a','#0d1a14'));R(ctx,x+3,y+15,8,3,mix('#6e9a55','#10201a'));R(ctx,x+15,y+16,9,2,mix('#6e9a55','#10201a'));
  ctx.restore();
  // reflexo no vidro, caixilhos com sombra, cortininhas e parapeito com vaso
  R(ctx,x+2,y+2,1,6,'#ffffff30');R(ctx,x+15,y+2,1,4,'#ffffff30');
  R(ctx,x+12,y,2,22,'#4a2f1a');R(ctx,x+12,y,1,22,'#6a4426');R(ctx,x,y+10,26,2,'#4a2f1a');R(ctx,x,y+10,26,1,'#6a4426');
  R(ctx,x-1,y-1,28,1,'#2c1b0f');R(ctx,x-1,y-1,1,24,'#2c1b0f');R(ctx,x+26,y-1,1,24,'#2c1b0f');
  for(const [cx,dir] of [[x-4,1],[x+25,-1]]){R(ctx,cx,y-2,5,20,'#8e2f2a');R(ctx,cx+(dir>0?0:4),y-2,1,20,'#6a1f1c');R(ctx,cx+(dir>0?3:1),y+2,1,14,'#a8392f');R(ctx,cx,y+18,5,3,'#7a2622');R(ctx,cx+1,y+13,3,1,'#d9a441')}
  R(ctx,x-4,y-4,34,2,'#3f2816');R(ctx,x-4,y-4,34,1,'#6a4426');
  R(ctx,x-3,y+22,32,3,'#7a4a24');R(ctx,x-3,y+22,32,1,'#a8703c');R(ctx,x-2,y+25,30,1,'#2c1b0f');
  R(ctx,x+3,y+17,5,5,'#a8582a');R(ctx,x+3,y+17,5,1,'#c87a3a');R(ctx,x+4,y+13,1,4,'#4a8a3a');R(ctx,x+6,y+12,1,5,'#5a9a4a');R(ctx,x+3,y+12,2,2,'#d84a6a');R(ctx,x+6,y+11,2,2,'#f0d040')}
 /* luz do sol que entra pelas janelas e cai no chão (só de dia) */
 function raioDeSol(){
  const k=window.TEMPO?1-TEMPO.escuro():1;if(k<=0)return;ctx.save();ctx.globalAlpha=.10*k;ctx.fillStyle='#fff3c8';
  for(const wx of JANELAS){const x=OX+wx,y=OY+28;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+26,y);ctx.lineTo(x+46,y+70);ctx.lineTo(x+20,y+70);ctx.closePath();ctx.fill()}ctx.restore()}
 /* mesa redonda: pé com base, tampo de tábuas com borda escura e brilho, caneca com espuma, prato com pão e vela no castiçal */
 function mesa(m){
  const x=Math.round(m.x),y=Math.round(m.y);
  ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(x,y+4,17,4,0,0,7);ctx.fill();
  R(ctx,x-6,y+2,12,2,'#2e1a0c');R(ctx,x-2,y-4,4,7,'#3e2210');R(ctx,x-2,y-4,1,7,'#5a3418');
  ctx.fillStyle='#2e1a0c';ctx.beginPath();ctx.ellipse(x,y-5,16,8,0,0,7);ctx.fill();
  ctx.fillStyle='#6e4422';ctx.beginPath();ctx.ellipse(x,y-6,15,7,0,0,7);ctx.fill();
  ctx.fillStyle='#8f5d31';ctx.beginPath();ctx.ellipse(x,y-7,14,6,0,0,7);ctx.fill();
  ctx.save();ctx.beginPath();ctx.ellipse(x,y-7,14,6,0,0,7);ctx.clip();for(let k=-12;k<=12;k+=5)R(ctx,x+k,y-13,1,12,'#7a4c28');ctx.restore();
  ctx.fillStyle='#b07a44';ctx.beginPath();ctx.ellipse(x-4,y-9,6,2,0,0,7);ctx.fill();
  // caneca de cerveja (com espuma e alça)
  R(ctx,x-9,y-12,4,5,'#c88a2a');R(ctx,x-9,y-12,1,5,'#e8b04a');R(ctx,x-9,y-13,4,2,'#fff6e0');R(ctx,x-5,y-11,1,3,'#8a5a1a');R(ctx,x-9,y-7,4,1,'#6a4418');
  // prato com pão
  ctx.fillStyle='#d9d0c7';ctx.beginPath();ctx.ellipse(x+5,y-6,4,2,0,0,7);ctx.fill();R(ctx,x+3,y-8,4,2,'#c8883a');R(ctx,x+4,y-9,2,1,'#e0a85a');
  // vela no castiçal
  R(ctx,x-1,y-10,3,1,'#8a8a8a');R(ctx,x,y-15,2,5,'#f2ead2');R(ctx,x+1,y-14,1,2,'#e0d4b8');
  desenharChama(ctx,x+.5,y-15,2,4,x*.1);
 }
 /* cadeira de madeira com encosto; lado: -1 (encosto à esquerda), 1 (à direita), 0 (de costas para quem vê) */
 function cadeira(x,y,lado){
  x=Math.round(x);y=Math.round(y);
  R(ctx,x-5,y+1,10,2,'#0004');R(ctx,x-4,y-3,1,4,'#2e1a0c');R(ctx,x+3,y-3,1,4,'#2e1a0c');R(ctx,x-3,y-2,1,3,'#3e2210');R(ctx,x+2,y-2,1,3,'#3e2210');
  R(ctx,x-4,y-5,8,3,'#7a4a24');R(ctx,x-4,y-5,8,1,'#a8703c');R(ctx,x-4,y-3,8,1,'#5a3418');
  if(lado){const bx=lado<0?x-5:x+3;R(ctx,bx,y-14,2,11,'#5a3418');R(ctx,bx,y-14,1,11,'#7a4a24');R(ctx,bx,y-14,2,1,'#a8703c');for(const yy of [-12,-9])R(ctx,bx+(lado<0?2:-1),yy+y,1,1,'#3e2210')}
  else{R(ctx,x-4,y-11,1,9,'#5a3418');R(ctx,x+3,y-11,1,9,'#5a3418');R(ctx,x-4,y-12,8,2,'#7a4a24');R(ctx,x-4,y-12,8,1,'#a8703c');R(ctx,x-3,y-8,6,1,'#6a4424');R(ctx,x-3,y-5,6,1,'#6a4424')}
 }
 function barril(b){const x=Math.round(b.x),y=Math.round(b.y);R(ctx,x-7,y+1,14,3,'#0005');R(ctx,x-6,y-14,12,15,'#7a4a24');R(ctx,x-7,y-11,14,9,'#865230');R(ctx,x-6,y-14,12,2,'#9a6636');R(ctx,x-7,y-10,14,1,'#3b2c22');R(ctx,x-7,y-4,14,1,'#3b2c22');R(ctx,x-4,y-13,1,13,'#a8703c80')}
 /* fogo da lareira: brasas, lenha cruzada e três chamas de alturas diferentes; luz quente pulsando */
 function fogo(){
  const x=LAREIRA.x,y=LAREIRA.y+15;
  desenharLenha(ctx,x,y,26);
  desenharChama(ctx,x-7,y-3,9,13,1.3);desenharChama(ctx,x+7,y-3,9,12,2.7);desenharChama(ctx,x,y-3,13,19,.4);
  const g=ctx.createRadialGradient(x,y-6,4,x,y+20,115);g.addColorStop(0,'rgba(255,150,60,'+(.24+.06*Math.sin(time*7)+.03*Math.sin(time*17))+')');g.addColorStop(1,'rgba(255,120,30,0)');ctx.fillStyle=g;ctx.fillRect(x-115,y-60,230,195);
 }
 /* papéis do quadro: um por oferta do dia; o da missão aceita fica com alfinete vermelho; "!" com missão pronta */
 function papeisDoQuadro(){
  const of=ofertas(),q=QUADRO,x0=OX+q.x0,y0=OY+q.y0,pos=[[4,4],[19,6],[34,3],[11,17],[27,18]];
  of.forEach((o,i)=>{const [px,py]=pos[i]||[4,4];R(ctx,x0+px,y0+py,12,11,['#efe2c0','#e8d6a8','#f2e8cc'][i%3]);R(ctx,x0+px+5,y0+py,2,2,'#2a4a8e');for(let l=0;l<3;l++)R(ctx,x0+px+2,y0+py+3+l*2,8-l*2,1,'#8a7a5a')});
  if(p.missao){const [px,py]=pos[3];R(ctx,x0+px,y0+py,14,12,'#f6edd4');R(ctx,x0+px+6,y0+py,2,2,'#b02a2a');R(ctx,x0+px+2,y0+py+4,10,1,'#8a7a5a');R(ctx,x0+px+2,y0+py+7,7,1,'#8a7a5a')}
  if(quadroSob){ctx.strokeStyle='#ffd84a';ctx.lineWidth=1;ctx.strokeRect(x0-2.5,y0-2.5,q.w+5,q.h+5)}
  ctx.font='5px monospace';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText('MISSÕES',QUADRO.x+.4,y0-4.6);ctx.fillStyle='#ffe28a';ctx.fillText('MISSÕES',QUADRO.x,y0-5);
  if(p.missao&&p.missao.feitos>=p.missao.qtd){ctx.fillStyle='#ffd84a';ctx.font='bold 8px monospace';ctx.fillText('!',QUADRO.x,y0-10+Math.round(Math.sin(time*4)*1.5))}}

 /* ---- palco: cortina, placa com o nome da música, bardo e tamborileiro no ritmo, notas subindo ---- */
 const notasNoAr=[];let ultimoPasso=-1;
 let bardoSpr=null;const spriteBardo=()=>{if(bardoSpr)return bardoSpr;try{const look=window.APARENCIA?{...APARENCIA.padrao('m'),cabelo:'#c8a050',estilo:'rabo'}:undefined;bardoSpr=human('war','d',0,{nude:1,sex:'m',look,ca:ITEMS.ca1})}catch(e){bardoSpr=(HS.sty||HS.war).d}return bardoSpr};
 function musicaAgora(){return window.MUSICA_TAVERNA?MUSICA_TAVERNA.agora():null}
 function cortina(P){
  P=P||PALCO;const x0=P.x0,x1=P.x1,y=P.y0,w=x1-x0;
  R(ctx,x0-2,y-34,w+2,3,'#3e2210');
  for(let x=x0;x<x1;x+=6){const o=Math.sin(time*1.2+x*.3)*.6;R(ctx,x+o,y-31,6,31,(x/6|0)%2?'#8e2f2a':'#7a2622');R(ctx,x+o,y-31,1,31,'#a8392f')}
  R(ctx,x0,y-31,w,3,'#d9a441');for(let x=x0+2;x<x1;x+=8)R(ctx,x,y-28,4,3,'#d9a441');
  // placa da música
  const mu=musicaAgora(),txt=!mu?'':mu.pausa?'Aplausos!':mu.m.nome,cx=Math.round((x0+x1)/2);
  ctx.font='5px monospace';const tw=Math.max(40,Math.ceil(ctx.measureText(txt).width)+10);
  R(ctx,cx-tw/2-1,y-45,tw+2,10,'#24140a');R(ctx,cx-tw/2,y-44,tw,8,'#5a3418');R(ctx,cx-tw/2,y-44,tw,1,'#9a6636');
  if(mu&&!mu.pausa){R(ctx,cx-tw/2+1,y-37,Math.round((tw-2)*mu.progresso),1,'#d9a441')}
  ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(txt,cx+.4,y-38.6);ctx.fillStyle='#ffe28a';ctx.fillText(txt,cx,y-39)}
 function musico(u,tipo){
  const mu=musicaAgora(),tocando=mu&&!mu.pausa,pl=mu&&mu.m?mu.m.passo:.25,fase=tocando?((mu.passo%2)+((Date.now()/1000)%pl)/pl)/2:0,bate=tocando&&fase<.35?1:0;
  const spr=tipo==='bardo'?spriteBardo():(HS.sty||HS.war).d,x=u.x,y=u.y;
  // nos aplausos os dois se curvam
  ctx.save();if(!tocando&&mu){ctx.translate(x,y);ctx.scale(1,.88);ctx.translate(-x,-y)}
  dr(spr,x,y-(tipo==='bardo'?bate:0),1,1,anim(u,0));ctx.restore();
  if(tipo==='bardo'){const lx=x-1,ly=y-10-bate;R(ctx,lx-5,ly,8,6,'#8a5a2a');R(ctx,lx-4,ly+1,6,4,'#a8743f');R(ctx,lx-2,ly+2,2,2,'#2a1a0c');R(ctx,lx+3,ly-4,1,6,'#5a3418');R(ctx,lx+3,ly-5,3,2,'#5a3418');R(ctx,lx-3+(bate?1:0),ly+1,1,1,'#f2c28b')}
  else{R(ctx,x-5,y-7,10,7,'#8e2f2a');R(ctx,x-5,y-7,10,2,'#e8dcc0');R(ctx,x-5,y-2,10,1,'#d9a441');const b=tocando&&mu.passo%2===0?1:0;R(ctx,x-6+(b?1:0),y-11+(b?2:0),1,4,'#c8a070');R(ctx,x+5-(b?0:1),y-11+(b?0:2),1,4,'#c8a070')}
  ctx.font='5px monospace';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(tipo==='bardo'?'Bardo Lírio':'Tambor',x+.4,y-21.6-ACIMA_HEROI());ctx.fillStyle='#e7dcc4';ctx.fillText(tipo==='bardo'?'Bardo Lírio':'Tambor',x,y-22-ACIMA_HEROI())}
 function notasMusicais(){
  const mu=musicaAgora();
  if(mu&&!mu.pausa&&mu.passo!==ultimoPasso){ultimoPasso=mu.passo;const n=mu.m.notas[mu.passo%(mu.m.barras*mu.m.passos)];if(n&&notasNoAr.length<14)notasNoAr.push({x:BARDO.x-4+Math.random()*8,y:BARDO.y-24,t:0,v:8+Math.random()*6,cor:['#ffe28a','#ffffff','#d9a441'][mu.i%3],o:Math.random()*6})}
  for(let i=notasNoAr.length;i--;){const n=notasNoAr[i];n.t+=1/60;if(n.t>1.8){notasNoAr.splice(i,1);continue}
   const x=Math.round(n.x+Math.sin(n.t*3+n.o)*3),y=Math.round(n.y-n.t*n.v*2);ctx.globalAlpha=Math.min(1,(1.8-n.t)/.6);R(ctx,x,y,2,2,n.cor);R(ctx,x+1,y-4,1,4,n.cor);R(ctx,x+2,y-4,2,1,n.cor);ctx.globalAlpha=1}}

 /* ---- desenho da cena ---- */
 // 4 cadeiras por mesa (atrás, direita, frente, esquerda): as mesas da taverna também são mesas de jogo (js/mesas.js, js/bar.js)
 // (posição de cada cadeira e o ponto onde o herói senta: layout da Engine; lado do encosto pelo lado da mesa)
 const bancos=[];MESAS.forEach(m=>m.cadeiras.forEach((c,i)=>{const q=LAY.cadeiraEm(m,i);bancos.push({x:q.x,y:q.y,lado:c.o===1?1:c.o===3?-1:0})}));
 window.drawTaverna=function(){
  if(!fundo)fundo=desenharFundo();
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0b0806';ctx.fillRect(0,0,cv.width,cv.height);
  ctx.setTransform(S,0,0,S,Math.round(cv.width/2-p.x*S),Math.round(cv.height/2-p.y*S));ctx.imageSmoothingEnabled=false;
  ctx.drawImage(fundo,OX,OY);if(window.BAR)BAR.chao();
  for(const wx of JANELAS)janela(wx);
  raioDeSol();papeisDoQuadro();
  fogo();
  const L=[];
  MESAS.forEach(m=>L.push([m.y,()=>mesa(m)]));
  bancos.forEach(b=>L.push([b.y-1,()=>cadeira(b.x,b.y,b.lado)]));
  BARRIS.forEach(b=>L.push([b.y,()=>barril(b)]));
  L.push([PALCO.y0-1,()=>cortina()]);
  L.push([BARDO.y,()=>musico(BARDO,'bardo')]);L.push([TAMBOR.y,()=>musico(TAMBOR,'tambor')]);
  L.push([BARKEEP.y,()=>{
   const f=face(BARKEEP),spr=(HS.sty||HS.war)[f.d];if(taverneiraSob)circ(BARKEEP.x,BARKEEP.y,12,'#ff5');dr(spr,BARKEEP.x,BARKEEP.y,f.fl,1,anim(BARKEEP,0));
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
  if(p.dead<=0)L.push([p.y,()=>{const o=lunge(p,p.wt,p.aw,.25);ctx.globalAlpha=p.hit>0?.5:1;const f=face(p),an=anim(p,.25);dr.ent=p;dr(heroImg(f.d,an),p.x+o[0],p.y+o[1],f.fl,1,an);if(window.rastroArma)rastroArma(p,f,an,p.x+o[0],p.y+o[1]);ctx.globalAlpha=1;
   const barW=28,t=1/S,bx=Math.round(p.x-barW/2),by=Math.round(p.y-25-ACIMA_HEROI()),hr=Math.max(0,Math.min(1,p.hp/mhp())),mr=Math.max(0,Math.min(1,p.mp/mmp()));
   R(ctx,bx-t,by-t,barW+2*t,3+3*t,'#3a3a3a');R(ctx,bx,by,barW,2,'#173d1c');ctx.fillStyle='#4cd04f';ctx.fillRect(bx,by,barW*hr,2);ctx.fillStyle='#10203a';ctx.fillRect(bx,by+2+t,barW,1);ctx.fillStyle='#3985ed';ctx.fillRect(bx,by+2+t,barW*mr,1)}]);
  if(window.BAR)BAR.objetos(L);
  if(window.onlineDrawables)onlineDrawables(L);
  L.sort((a,b)=>a[0]-b[0]).forEach(l=>l[1]());
  notasMusicais();
  // noite: a taverna fica um pouco mais escura e as velas, a lareira e as lanternas do palco brilham mais
  const nk=window.TEMPO?TEMPO.escuro():0;
  if(window.desenharNoite){desenharNoite(.4,[{x:LAREIRA.x,y:LAREIRA.y+6,r:120},...MESAS.map(m=>({x:m.x,y:m.y-14,r:55,a:.7})),{x:PALCO.x0+8,y:PALCO.y0-24,r:60,a:.6},{x:PALCO.x1-8,y:PALCO.y0-24,r:60,a:.6},...(window.BAR?BAR.luzes():[])]);ctx.setTransform(S,0,0,S,Math.round(cv.width/2-p.x*S),Math.round(cv.height/2-p.y*S))}
  ctx.save();ctx.globalCompositeOperation='screen';
  for(const m of MESAS){const g=ctx.createRadialGradient(m.x,m.y-16,1,m.x,m.y-16,46+16*nk);g.addColorStop(0,'rgba(255,190,90,'+(.20+.14*nk)+')');g.addColorStop(1,'rgba(255,160,60,0)');ctx.fillStyle=g;ctx.fillRect(m.x-62,m.y-78,124,124)}
  for(const lx of [PALCO.x0+8,PALCO.x1-8]){const g=ctx.createRadialGradient(lx,PALCO.y0-20,1,lx,PALCO.y0-20,70);g.addColorStop(0,'rgba(255,200,120,'+(.16+.12*nk)+')');g.addColorStop(1,'rgba(255,170,80,0)');ctx.fillStyle=g;ctx.fillRect(lx-70,PALCO.y0-90,140,140)}
  ctx.restore();
  if(window.BAR)BAR.brilho(nk);
  for(const lx of [PALCO.x0+8,PALCO.x1-8]){R(ctx,lx-1,PALCO.y0-24,2,6,'#3e2210');R(ctx,lx-2,PALCO.y0-30,4,6,'#ffb02e');R(ctx,lx-1,PALCO.y0-29,2,3,'#fff3a0')}
  proj.forEach(q=>{R(ctx,q.x-3,q.y-3,6,6,q.c||'#ff7a1a')});
  fxs.forEach(f=>{const q=Math.max(0,Math.min(1,f.t/f.d));ctx.globalAlpha=1-q;circ(f.x,f.y,f.r*(.35+q),f.c);ctx.globalAlpha=1});
  ctx.font='6px monospace';ctx.textAlign='center';
  if(window.BAR)BAR.interface(); // botões e convites das mesas, por cima de tudo
  fts.forEach(f=>{ctx.globalAlpha=Math.max(0,f.a);ctx.fillStyle='#000';ctx.fillText(f.t,Math.round(f.x)+.5,Math.round(f.y)+.5);ctx.fillStyle=corFt(f);ctx.fillText(f.t,Math.round(f.x),Math.round(f.y));if(f.crit)iconeCrit(f);ctx.globalAlpha=1});
  ctx.setTransform(1,0,0,1,0,0);
  const v=ctx.createRadialGradient(cv.width/2,cv.height/2,Math.min(cv.width,cv.height)*.35,cv.width/2,cv.height/2,Math.max(cv.width,cv.height)*.75);
  v.addColorStop(0,'rgba(10,5,2,0)');v.addColorStop(1,'rgba(10,5,2,.55)');ctx.fillStyle=v;ctx.fillRect(0,0,cv.width,cv.height);
  minimapa();
 };
 function minimapa(){
  const mm=$('mm').getContext('2d'),SZ=160,k=(SZ-16)/(TW+(window.BAR?BAR.BW:0)),ox=8,oy=(SZ-TH*k)/2; // a taverna e o pátio do bar
  mm.setTransform(1,0,0,1,0,0);mm.fillStyle='#0b0806';mm.fillRect(0,0,SZ,SZ);
  mm.imageSmoothingEnabled=false;if(fundo)mm.drawImage(fundo,ox,oy,TW*k,TH*k);if(window.BAR)BAR.minimapa(mm,ox,oy,k);
  const at=(x,y)=>[ox+(x-OX)*k,oy+(y-OY)*k];
  if(window.onlineMinimap)onlineMinimap(mm,OX-ox/k,OY-oy/k,k,SZ);
  const [px,py]=at(p.x,p.y);mm.fillStyle='#000';mm.fillRect(px-3,py-3,6,6);mm.fillStyle='#fff';mm.fillRect(px-2,py-2,4,4);
 }

 /* na Engine (modo motor) só a prévia da cena (painel Projeto › Cenas); o resto do arquivo não roda */
 if(MODO.motor){window.CENA_PREVIA=window.CENA_PREVIA||{};CENA_PREVIA.taverna=()=>{const f=fundo||(fundo=desenharFundo()),c=document.createElement('canvas');c.width=TW;c.height=TH;const g=c.getContext('2d');g.drawImage(f,0,0);g.translate(-OX,-OY);
  for(const m of MESAS){g.fillStyle='#4a2a14';g.beginPath();g.ellipse(m.x,m.y-6,15,8,0,0,7);g.fill();g.fillStyle='#8f5d31';g.beginPath();g.ellipse(m.x,m.y-7,14,7,0,0,7);g.fill()}
  for(const b of BARRIS){R(g,b.x-6,b.y-14,12,15,'#7a4a24');R(g,b.x-7,b.y-11,14,9,'#865230')}
  {const x0=PALCO.x0,x1=PALCO.x1,y=PALCO.y0;for(let x=x0;x<x1;x+=6)R(g,x,y-31,6,31,(x/6|0)%2?'#8e2f2a':'#7a2622');R(g,x0,y-31,x1-x0,3,'#d9a441')}
  return{c,x:OX,y:OY,w:TW,h:TH,nome:'Taverna'}};
  /* editor da cena Taverna (engine/js/scene-taverna.js): o fundo fixo e cada peça móvel desenhados pelas mesmas funções
     do jogo. Elas pintam no ctx do canvas principal, que fica parado no modo motor: desenha-se nele e copia-se o
     recorte com conteúdo. Cada peça vem com a âncora {ax, ay} (o ponto da posição dela dentro do desenho). */
  const pintar=(w,h,ox,oy,fn)=>{
   const W0=cv.width,H0=cv.height;cv.width=w;cv.height=h;ctx.setTransform(1,0,0,1,-ox,-oy);ctx.imageSmoothingEnabled=false;
   try{fn()}catch(e){console.warn('Prévia da taverna:',e)}
   ctx.setTransform(1,0,0,1,0,0);const d=ctx.getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
   let r=null;if(x1>=0){const c=document.createElement('canvas');c.width=x1-x0+1;c.height=y1-y0+1;c.getContext('2d').drawImage(cv,x0,y0,c.width,c.height,0,0,c.width,c.height);r={c,ax:ox+x0,ay:oy+y0}}
   cv.width=W0;cv.height=H0;
   // âncora: a peça é desenhada em (x - ax, y - ay); com o desenho feito em volta de (0,0): ax = -(canto do recorte)
   if(r){r.ax=-r.ax;r.ay=-r.ay}return r};
  const boneco=(spr,extra)=>pintar(48,60,-24,-50,()=>{dr(spr,0,0,1,1,anim({x:0,y:0,fx:0,fy:1},0));if(extra)extra()});
  window.TAVERNA_MOTOR={
   padrao:()=>LAY.padrao(),OX,OY,TW,TH,PX:LAY.PX,PY:LAY.PY,BW:LAY.BW,BH:LAY.BH,
   // fundo fixo: piso, paredes, balcão, janelas, taverneira, porta do pátio e o quiosque do bar
   fundo(){const x0=OX,y0=LAY.PY,w=LAY.PX+LAY.BW-x0,h=Math.max(OY+TH,LAY.PY+LAY.BH)-y0,c=document.createElement('canvas');c.width=w;c.height=h;
    const f=desenharFundo(true),r=pintar(w,h,x0,y0,()=>{ctx.drawImage(f,OX,OY);for(const wx of JANELAS)janela(wx);if(window.BAR){BAR.chao();BAR.quiosque()}
     const spr=(HS.sty||HS.war).d;dr(spr,BARKEEP.x,BARKEEP.y,1,1,anim(BARKEEP,0));ctx.drawImage(f,8,66,186,26,OX+8,OY+66,186,26)});
    if(r)c.getContext('2d').drawImage(r.c,-r.ax-x0,-r.ay-y0);return{c,x:x0,y:y0}},
   /* peça móvel: tipo e, quando precisa, o dado (o lado da cadeira, o tamanho do palco, a classe do mestre) */
   peca(tipo,o){
    if(tipo==='mesa-redonda')return pintar(48,40,-24,-28,()=>mesa({x:0,y:0}));
    if(tipo==='mesa-jogo')return pintar(48,40,-24,-24,()=>window.BAR&&BAR.desenharMesa({x:0,y:0}));
    if(tipo==='cadeira-redonda')return pintar(24,28,-12,-20,()=>cadeira(0,0,o===1?1:o===3?-1:0));
    if(tipo==='cadeira-jogo')return pintar(24,28,-12,-22,()=>window.BAR&&BAR.desenharCadeira(0,0,o));
    if(tipo==='barril')return pintar(20,24,-10,-18,()=>barril({x:0,y:0}));
    if(tipo==='quadro')return pintar(64,52,-32,-46,()=>{pintarQuadro(ctx,{x:0,y:0},0,0);ctx.font='5px monospace';ctx.textAlign='center';ctx.fillStyle='#ffe28a';ctx.fillText('MISSÕES',0,-39)});
    if(tipo==='lareira')return pintar(88,76,-44,-48,()=>{pintarLareira(ctx,{x:0,y:0},0,0);desenharLenha(ctx,0,15,26);desenharChama(ctx,-7,12,9,13,1.3);desenharChama(ctx,7,12,9,12,2.7);desenharChama(ctx,0,12,13,19,.4)});
    if(tipo==='palco'){const P={x0:0,y0:0,x1:Math.max(40,+o.w||100),y1:Math.max(30,+o.h||74)};return pintar(P.x1+8,P.y1+70,-4,-56,()=>{pintarPalco(ctx,P,0,0);cortina(P)})}
    if(tipo==='bardo')return pintar(48,60,-24,-50,()=>musico({x:0,y:0,fx:0,fy:1},'bardo'));
    if(tipo==='tambor')return pintar(48,60,-24,-50,()=>musico({x:0,y:0,fx:0,fy:1},'tambor'));
    if(tipo==='lanceiro')return boneco(spriteLanceiro('d'));
    if(tipo==='barman')return boneco((HS.sty||HS.war).d);
    if(tipo==='mestre'){const ids=Object.keys(CL).filter(id=>id!=='sty'&&CL[id]&&CL[id].n),c=CL[ids[o|0]];return boneco(c?c.sprite||(HS[c.base||ids[o|0]]||HS.war).d:(HS.war).d)}
    return null},
   // nome da classe de cada lugar de mestre (na ordem do jogo)
   mestres:()=>Object.keys(CL).filter(id=>id!=='sty'&&CL[id]&&CL[id].n).map(id=>CL[id].n)
  };
  return}
 /* ---- entrar e sair ---- */
 function entrar(){
  if(window.inTaverna)return;
  if(window.inDungeon){ft(p.x,p.y-24,'Saia da masmorra antes de ir à taverna.','#f87171');return}
  if(p.dead>0)return;
  if(window.inArena&&window.ARENA)ARENA.sair(true);
  if(window.MP&&MP.antesDeSair)MP.antesDeSair();
  ilhaPos={x:p.x,y:p.y};enGuardado=en.splice(0,en.length);montarMestres();
  // na taverna não há auras nem bônus de habilidade: a aura ligada desliga e os efeitos positivos saem (2026-10-28)
  if(window.CURANDEIRO&&CURANDEIRO.desligar)CURANDEIRO.desligar();
  if(p.st)for(const [k,s] of Object.entries(p.st))if(FX_INFO[k]&&FX_INFO[k].good)delete p.st[k];
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
 window.entrarTaverna=entrar;window.sairTaverna=sair;window.falarMestreTaverna=cls=>{const m=MESTRES.find(x=>x.cls===cls);if(m)falarMestre(m)}; /* abre o diálogo do Mestre da classe */
 const botao=document.createElement('button');botao.type='button';botao.className='ib tavBtn';
 function atualizarBotao(){botao.textContent=window.inTaverna?'Sair da taverna':'Taverna';botao.title=window.inTaverna?'Voltar para a sua ilha':'Ir para a taverna, onde todos os jogadores se encontram'}
 botao.onclick=()=>window.inTaverna?sair():entrar();atualizarBotao();
 (document.getElementById('hbtns')||document.body).append(botao);

 /* ---- cliques: porta, taverneira, quadro, Lanceiro e mestres ---- */
 const taverneiraEm=w=>Math.hypot(w.x-BARKEEP.x,w.y-(BARKEEP.y-8))<16;
 const quadroEm=w=>w.x>OX+QUADRO.x0-4&&w.x<OX+QUADRO.x0+QUADRO.w+4&&w.y>OY+QUADRO.y0-4&&w.y<OY+QUADRO.y0+QUADRO.h+6;
 const pertoDoQuadro=()=>Math.hypot(p.x-QUADRO.x,p.y-(QUADRO.y+22))<36;
 window.tavernaClick=(w,mode)=>{
  if(window.BAR&&BAR.click(w,mode))return true;
  mestreAlvo=null;lanceiroAlvo=false;quadroAlvo=false;
  if(Math.hypot(w.x-DOOR.x,w.y-(DOOR.y-4))<16){if(dist(p,DOOR)<34)sair();else setDest(DOOR.x,DOOR.y-12);return true}
  if(taverneiraEm(w)&&mode!=2){chamarTaverneira();return true}
  if(quadroEm(w)&&mode!=2){if(pertoDoQuadro())abrirQuadro();else{quadroAlvo=true;setDest(QUADRO.x,QUADRO.y+24)}return true}
  if(Math.hypot(w.x-LANCEIRO.x,w.y-(LANCEIRO.y-10))<13&&mode!=2){if(dist(p,LANCEIRO)<36)falarLanceiro();else{lanceiroAlvo=true;setDest(LANCEIRO.x,LANCEIRO.y+14)}return true}
  const m=mestreEm(w);
  if(m&&mode!=2){if(dist(p,m)<34)falarMestre(m);else{mestreAlvo=m;setDest(m.x,m.y+12)}return true}
  return false;
 };
 let mestreSob=null,mestreAlvo=null,lanceiroSob=false,lanceiroAlvo=false,quadroSob=false,quadroAlvo=false,taverneiraSob=false;
 /* a taverneira vem até o balcão, na frente de quem chamou; o diálogo abre quando os dois chegam */
 function chamarTaverneira(){
  const x=Math.max(ATRAS.x0,Math.min(ATRAS.x1,p.y<OY+130?p.x:BARKEEP.x));
  BARKEEP.chamada={x,y:BALCAO_Y};BARKEEP.alvo=null;BARKEEP.deCostas=false;
  if(Math.hypot(p.x-x,p.y-(OY+100))>20)setDest(x,OY+100);
 }
 window.TAVERNEIRA={npc:BARKEEP,chamar:chamarTaverneira};
 function andarTaverneira(dt){
  const B=BARKEEP,vel=30;
  if(!B.chamada&&!B.alvo){B.espera-=dt;
   if(B.espera<=0){B.deCostas=false;
    // às vezes vai até as prateleiras (para trás), às vezes anda para os lados ao longo do balcão
    const atras=Math.random()<.4;B.alvo={x:ATRAS.x0+Math.random()*(ATRAS.x1-ATRAS.x0),y:atras?ATRAS.y0:BALCAO_Y-Math.random()*4,atras}}}
  const alvo=B.chamada||B.alvo;
  if(alvo){const dx=alvo.x-B.x,dy=alvo.y-B.y,d=Math.hypot(dx,dy);
   if(d>1){const k=Math.min(d,vel*dt)/d;B.x+=dx*k;B.y+=dy*k;B.fx=dx;B.fy=dy}
   else{B.x=alvo.x;B.y=alvo.y;
    if(B.chamada){if(dist(p,B)<56){B.chamada=null;B.espera=8;falarTaverneira()}else if(dist(p,B)>150){B.chamada=null;B.espera=2}}
    else{B.deCostas=!!alvo.atras;B.alvo=null;B.espera=3+Math.random()*6}}}
  // parada: de costas mexendo nas garrafas, ou olhando para quem está perto
  if(!alvo||B.chamada&&Math.hypot(B.x-B.chamada.x,B.y-B.chamada.y)<=1){if(B.deCostas){B.fx=0;B.fy=-1}else if(dist(p,B)<110){B.fx=p.x-B.x;B.fy=p.y-B.y}else{B.fx=0;B.fy=1}}
 }
 /* painel de PvP do Lanceiro (js/arena.js): partidas 1x1 / 2x2 com lobby, ou treino com o boneco */
 function falarLanceiro(){lanceiroAlvo=false;if(window.ARENA)ARENA.abrirPainel()}
 const mestreEm=w=>MESTRES.find(m=>Math.hypot(w.x-m.x,w.y-(m.y-8))<14)||null;
 function falarMestre(m){
  mestreAlvo=null;
  const c=CL[m.cls];if(!c)return;
  const box=$('dialogue');box.classList.remove('dgModal');
  const atual=p.cls===m.cls,aprendida=!!(p.classProgress&&p.classProgress[m.cls]);
  /* arma inicial da classe (2026-10-29, pedido do usuário): quem já aprendeu a classe pode pedir as armas do kit inicial
     (arma e escudo) de novo; só entrega as que não estão na mochila nem equipadas */
  const armasKit=(c.kit||[]).filter(r=>ITEMS[r.id]&&(gearType[r.id]==='sw'||gearType[r.id]==='sh')).map(r=>r.id);
  const tem=id=>I.some(s=>s&&s.id===id)||Object.values(EQ).some(s=>s&&s.id===id);
  const pedirArma=(atual||aprendida)&&armasKit.length?'<button type="button" data-tav-arma>Pedir a arma inicial de '+c.n+'</button>':'';
  const ps=c.passive&&c.passive.n?'<p>Passiva: <b>'+c.passive.n+'</b>'+(c.passive.d?' – '+c.passive.d:'')+'</p>':'';
  // classe nova: só vencendo o Mestre num duelo na arena (Mestre nível 10 com os atributos da classe); já aprendida: trocar é grátis
  box.innerHTML='<b>'+m.nm+'</b>'+
   (atual?'<p>Você já é '+c.n+'. Continue treinando! Quer medir forças de novo?</p>'+pedirArma+'<button type="button" data-tav-duelo>Desafiar o Mestre de novo</button>'
    :aprendida?'<p>Você já aprendeu '+c.n+': trocar é grátis.</p>'+ps+'<button type="button" data-tav-classe>Trocar para '+c.n+'</button>'+pedirArma+'<button type="button" data-tav-duelo>Desafiar o Mestre de novo</button>'
    :'<p>Quer seguir o caminho de '+c.n+'? Prove o seu valor: vença-me num duelo na arena. Eu luto no <b>nível 10</b>, com a força de um '+c.n+'.</p>'+ps+
     '<p class=tm>Perder não custa nada: você volta para a taverna e pode tentar de novo.</p><button type="button" data-tav-duelo>Desafiar o Mestre</button>')+
   '<button type="button" data-close-dialog>Até mais</button>';
  box.classList.add('open');
  const b=box.querySelector('[data-tav-classe]');if(b)b.onclick=()=>{box.classList.remove('open');setClass(m.cls)};
  const ba=box.querySelector('[data-tav-arma]');if(ba)ba.onclick=()=>{
   const faltam=armasKit.filter(id=>!tem(id));
   if(!faltam.length){ft(p.x,p.y-30,'Você já tem a arma inicial','#ccc');box.querySelector('p').textContent='Você já tem as armas do começo de '+c.n+'. Cuide bem delas!';ba.remove();return}
   const dadas=faltam.filter(id=>addItem(id));
   if(!dadas.length){ft(p.x,p.y-30,'Mochila cheia','#f88');return}
   dirtyInv=true;saveGame();if(window.playGameSound)playGameSound('item');
   ft(p.x,p.y-30,'Recebeu: '+dadas.map(id=>String(ITEMS[id].n||id).replace(/ \(.*$/,'')).join(', '),'#ffd84a');
   box.querySelector('p').textContent=(dadas.length>1?'Aqui estão ':'Aqui está ')+dadas.map(id=>String(ITEMS[id].n||id).replace(/ \(.*$/,'')).join(' e ')+'. Use bem!';ba.remove()};
  const dd=box.querySelector('[data-tav-duelo]');if(dd)dd.onclick=()=>{box.classList.remove('open');if(window.ARENA&&ARENA.duelo)ARENA.duelo(m.cls)};
 }
 function falarTaverneira(){
  const box=$('dialogue');box.classList.remove('dgModal');
  const mu=musicaAgora();
  box.innerHTML='<b>Taverneira Bete</b><p>Bem-vindo ao Javali Dourado! Aqui todo mundo se encontra.'+(mu&&!mu.pausa?' O Bardo Lírio está tocando <b>'+mu.m.nome+'</b>.':'')+'</p>'+
   '<p>Aqui dentro é lugar de descanso: nada de habilidades nem brigas. Ninguém se machuca na taverna.</p>'+
   '<p class=tm>Procurando trabalho? Veja o quadro de missões na parede.</p>'+
   '<button type="button" data-tav-bebida>Pedir uma bebida ('+moeda(5)+'): vida e mana cheias</button><button type="button" data-tav-vender>Vender itens</button><button type="button" data-close-dialog>Até mais</button>';
  box.classList.add('open');
  box.querySelector('[data-tav-vender]').onclick=abrirVenda;
  const b=box.querySelector('[data-tav-bebida]');
  if(b)b.onclick=()=>{if(p.gold<5){ft(p.x,p.y-24,'Ouro insuficiente','#f87171');return}p.gold-=5;p.hp=mhp();p.mp=mmp();ring(p.x,p.y,24,'#ffd84a',.5);ft(p.x,p.y-24,'Saúde!','#ffd84a');box.classList.remove('open');if(window.playGameSound)playGameSound('coin')};
 }

 /* ---- quadro de missões: 3 ofertas por dia do jogo (1 hora real); matar de 2 a 10 monstros da ilha.
    A recompensa sai do próprio monstro (XP e ouro de um do nível do portal) × quantidade × 1,5. Uma missão por vez. ---- */
 const diaDoJogo=()=>Math.floor((window.TEMPO?TEMPO.agora():Date.now())/3600000);
 function candidatos(){
  const vistos=new Map();
  for(const d of window.PORTAL_DEFS||[])for(const m of d.monsters||[]){const t=MONSTER_TYPES[m.id];if(!t||m.id==='gob'||(t.bossType&&t.bossType!=='normal'))continue;
   // nível da oferta: o do portal, mas nunca abaixo do nível mínimo do próprio monstro (Engine › Monstro › Nível mínimo);
   // sem isso um portal de nível 1 com Demônio oferecia "Demônio nível 1" com recompensa de nível 1
   const lv=Math.max(1,Math.min(+CALC.maxLevel||10,Math.max(d.targetLevel||d.minLevel||1,+t.nivelMin||1)));if(!vistos.has(m.id)||vistos.get(m.id)>lv)vistos.set(m.id,lv)}
  const lista=[...vistos].map(([id,lv])=>({id,lv}));
  const perto=lista.filter(c=>c.lv<=p.lvl+2);return perto.length?perto:lista}
 function oferta(){
  const cs=candidatos();if(!cs.length)return null;const c=cs[Math.random()*cs.length|0],qtd=2+(Math.random()*9|0);
  const e=window.spawnAt?spawnAt(0,0,c.id,c.lv):{xp:5*c.lv,g:3*c.lv};
  return{tipo:c.id,nome:MONSTER_TYPES[c.id].name||c.id,qtd,nivel:c.lv,xp:Math.max(1,Math.round(qtd*(e.xp||1)*1.5)),ouro:Math.max(1,Math.round(qtd*((e.g||0)+c.lv*2)*1.5))}}
 function ofertas(){
  const dia=diaDoJogo();
  if(!p.quadro||p.quadro.dia!==dia||!Array.isArray(p.quadro.ofertas)){p.quadro={dia,ofertas:[oferta(),oferta(),oferta()].filter(Boolean)}}
  return p.quadro.ofertas}
 window.textoMissaoQuadro=()=>{const m=p.missao;if(!m)return'';const ok=m.feitos>=m.qtd;
  return'<div class="qmq'+(ok?' ok':'')+'"><b>QUADRO DA TAVERNA</b>'+(ok?'Missão cumprida! Volte ao quadro da taverna para receber.':'Derrote '+m.nome+': '+m.feitos+'/'+m.qtd)+'<br><span>Recompensa: '+m.xp+' XP · '+moeda(m.ouro)+'</span></div>'};
 /* janela do quadro (não é conversa): um cartaz por trabalho com o desenho do monstro, quantos derrotar, o nível e a
    recompensa (XP e ouro); em cima, a missão aceita com o progresso. Fecha no ×, no Esc ou ao se afastar do quadro. */
 const imgsMonstro=new Map();
 function imgMonstro(id){
  if(imgsMonstro.has(id))return imgsMonstro.get(id);
  const t=MONSTER_TYPES[id],v=t&&(t.sprite||t.sp),ok=c=>c&&(c.getContext||c instanceof HTMLImageElement)?c:null;
  const c=ok(v)||(v&&ok(v.d))||ok((SP[(MB[id]||{}).base]||SP.sl||{}).d);let url='';try{url=c?c.toDataURL?c.toDataURL():c.src:''}catch(e){}
  imgsMonstro.set(id,url);return url}
 let quadroEl=null;
 const EL=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
 function cartaz(o,botao){
  const d=EL('div','qmCartaz'),fig=EL('div','qmFoto'),im=EL('img');im.src=imgMonstro(o.tipo);im.alt=o.nome;fig.append(im);
  const info=EL('div','qmInfo');info.append(EL('b','',o.nome),EL('span','qmNivel','Nível '+o.nivel));
  const qtd=EL('div','qmQtd');qtd.append(EL('span','','Derrotar'),EL('strong','',o.feitos!=null?o.feitos+' / '+o.qtd:'× '+o.qtd));
  if(o.feitos!=null){const bar=EL('div','qmBarra'),f=EL('i');f.style.width=Math.min(100,Math.round(o.feitos/o.qtd*100))+'%';bar.append(f);qtd.append(bar)}
  const pr=EL('div','qmPremio');pr.append(EL('span','','Recompensa'),EL('strong','qmXp',o.xp+' XP'),EL('strong','qmOuro',o.ouro+' ouro'));
  d.append(fig,info,qtd,pr);if(botao)d.append(botao);return d}
 function abrirQuadro(){
  quadroAlvo=false;const m=p.missao,of=ofertas();
  if($('dialogue'))$('dialogue').classList.remove('open');
  if(!quadroEl){quadroEl=EL('div');quadroEl.id='quadroMissoes';quadroEl.setAttribute('role','dialog');quadroEl.setAttribute('aria-label','Quadro de missões');document.body.append(quadroEl)}
  quadroEl.hidden=false;quadroEl.replaceChildren();
  const box=EL('div','qmBox'),topo=EL('div','qmTopo'),x=EL('button','biFechar','×');x.type='button';x.setAttribute('aria-label','Fechar');x.onclick=fecharQuadro;
  topo.append(EL('b','','Quadro de Missões'),x);box.append(topo);
  const B=(txt,fn,cls)=>{const b=EL('button','qmBtn'+(cls?' '+cls:''),txt);b.type='button';b.onclick=fn;return b};
  if(m){const ok=m.feitos>=m.qtd;box.append(EL('h4','',ok?'Missão cumprida!':'Sua missão'));
   box.append(cartaz(m,ok?B('Receber a recompensa',entregar,'ok'):B('Abandonar',()=>{p.missao=null;saveGame();abrirQuadro()},'sair')))}
  box.append(EL('h4','',m?'Outros trabalhos (termine a missão atual para aceitar)':'Trabalhos de hoje'));
  const lista=EL('div','qmLista');
  if(of.length)of.forEach((o,i)=>{const b=m?null:B('Aceitar',()=>{const q=of[i];if(!q||p.missao)return;p.missao={...q,feitos:0};of.splice(i,1);
   ft(p.x,p.y-24,'Missão aceita!','#ffd84a');if(window.playGameSound)playGameSound('item');saveGame();abrirQuadro()});lista.append(cartaz(o,b))});
  else lista.append(EL('p','biVazio','Nenhum trabalho hoje.'));
  box.append(lista,EL('p','biDica','Uma missão por vez. Vale cada monstro do tipo pedido que você ajudar a derrotar, na ilha ou na DG. Novos papéis em '+(60-Math.floor(((window.TEMPO?TEMPO.agora():Date.now())%3600000)/60000))+' min.'));
  quadroEl.append(box);
 }
 function entregar(){const q=p.missao;if(!q||q.feitos<q.qtd)return;p.missao=null;p.gold+=q.ouro;gainPlayerXp(q.xp);
  ft(p.x,p.y-30,'+'+q.xp+' XP  +'+q.ouro+' ouro','#ffd84a');ring(p.x,p.y,30,'#ffd84a',.6);if(window.playGameSound)playGameSound('quest');saveGame();abrirQuadro()}
 function fecharQuadro(){if(quadroEl)quadroEl.hidden=true;if(typeof tipEl!='undefined')tipEl.style.display='none'}
 const quadroAberto=()=>!!quadroEl&&!quadroEl.hidden;
 addEventListener('keydown',e=>{if(quadroAberto()&&e.key==='Escape'){fecharQuadro();e.stopImmediatePropagation()}},true);
 window.abrirQuadroTaverna=abrirQuadro;window.fecharQuadroTaverna=fecharQuadro;
 // cada monstro do tipo pedido que você ajuda a derrotar conta (na ilha ou na DG)
 const km0=killMonster;killMonster=function(e){const r=km0.apply(this,arguments);
  const m=p.missao;if(m&&e&&e.ty===m.tipo&&!e.duelo&&!e.pvp&&m.feitos<m.qtd){m.feitos++;
   if(m.feitos>=m.qtd){ft(p.x,p.y-36,'Missão cumprida! Volte ao quadro da taverna','#ffd84a');if(window.playGameSound)playGameSound('quest')}else ft(e.x,e.y-40,m.nome+' '+m.feitos+'/'+m.qtd,'#e7dcc4');if(window.saveGame)saveGame()}
  return r};

 /* venda de itens da bolsa (preço em state.js precoVenda; configurável na Engine). Itens de missão não entram. */
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 function abrirVenda(){
  const box=$('dialogue');box.classList.remove('dgModal');
  const itens=I.map((s,i)=>[s,i]).filter(([s])=>s&&ITEMS[s.id]&&!(window.ehMissao&&ehMissao(s.id)));
  const linha=([s,i])=>{const nome=ITEMS[s.id].n.split(' (')[0],pr=precoVenda(s.id,s.q),cor=gearType[s.id]&&s.q!=null?QCOL[qi(s.q)]:'#e7dcc4';
   return '<div class="tavItem"><img src="'+ITEMS[s.id].ic+'" alt=""><span style="color:'+cor+'">'+esc(nome)+(s.n>1?' ×'+s.n:'')+(gearType[s.id]&&s.q!=null?' <small>'+s.q+'%</small>':'')+'</span>'
    +'<b>'+moeda(pr)+'</b><button type="button" data-vender="'+i+'" data-qtd="1">Vender</button>'+(s.n>1?'<button type="button" data-vender="'+i+'" data-qtd="'+s.n+'">Todos ('+pr*s.n+')</button>':'')+'</div>'};
  box.innerHTML='<b>Taverneira Bete · Vender</b><p>Você tem <b class="tavOuro">'+moeda(p.gold|0)+'</b>. Itens equipados e de missão não aparecem aqui.</p>'+
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
  if(quadroAberto()&&(!window.inTaverna||Math.hypot(p.x-QUADRO.x,p.y-(QUADRO.y+22))>90))fecharQuadro(); // afastou-se ou saiu
  if(!window.inTaverna)return;
  andarTaverneira(dt);if(window.BAR)BAR.atualizar(dt);
  for(const m of MESTRES){if(dist(p,m)<70){m.fx=p.x-m.x;m.fy=p.y-m.y}else{m.fx=0;m.fy=1}}
  const w=wpos();
  mestreSob=mestreEm(w);quadroSob=quadroEm(w);taverneiraSob=taverneiraEm(w);lanceiroSob=Math.hypot(w.x-LANCEIRO.x,w.y-(LANCEIRO.y-10))<13;
  if(mestreSob||quadroSob||taverneiraSob||lanceiroSob)cv.style.cursor='pointer';
  if(dist(p,LANCEIRO)<70){LANCEIRO.fx=p.x-LANCEIRO.x;LANCEIRO.fy=p.y-LANCEIRO.y}else{LANCEIRO.fx=0;LANCEIRO.fy=1}
  if(lanceiroAlvo&&dist(p,LANCEIRO)<36){p.dest=null;p.path=[];falarLanceiro()}
  if(mestreAlvo&&dist(p,mestreAlvo)<34){p.dest=null;p.path=[];falarMestre(mestreAlvo)}
  if(quadroAlvo&&pertoDoQuadro()){p.dest=null;p.path=[];abrirQuadro()}
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
 /* na taverna inteira (e no pátio do bar) nenhuma habilidade funciona (pedido do usuário, 2026-10-28): nem de pé, nem
    sentado. Corta já ao apertar a tecla (antes da mira) e no lançamento. As curas/bênçãos entre jogadores de antes
    (enviar/receber) ficam só para receber de clientes antigos. */
 const AVISO_TAV='Habilidades não funcionam na taverna';let avisoTav=-9;
 const avisar=()=>{if(time-avisoTav>1){avisoTav=time;ft(p.x,p.y-24,AVISO_TAV,'#ccc')}};
 const cast0=cast;
 cast=function(s){if(window.inTaverna){avisar();return}return cast0(s)};
 if(window.teclaHabilidade){const th0=teclaHabilidade;window.teclaHabilidade=function(s,e){if(window.inTaverna){avisar();return}return th0.apply(this,arguments)}}
 void enviar;void jogadorPerto; function receber(f){
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
