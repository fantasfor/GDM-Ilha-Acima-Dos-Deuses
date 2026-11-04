/* ---------- Cidade: rua, Taverna do Javali Dourado e Cassino Arcano (2026-11-04, pedidos do usuário) ----------
   Embaixo da taverna, uma rua de terra separa a Taverna do Javali Dourado do Cassino Arcano. Tudo é uma área só, a
   Cidade (a sala "taverna" do multijogador): o botão Cidade deixa o herói na rua, na frente da porta da taverna; ele
   entra andando e o telhado e a fachada somem (js/construcoes.js, estilo Tibia/RuneScape). As pontas da rua levam de
   volta à ilha.
   - Chão: a mesma grama e a mesma estrada da ilha (verde liso com tufinhos, vala de terra com barranco de sombra em cima
     e de luz embaixo, pedrinhas), na paleta do jogo, com os tufos balançando ao vento (js/ilha-viva.js).
   - Cassino: 12 caça-níqueis na parede do fundo, 2 roletas e 2 mesas de blackjack com crupiês, o cristal arcano no
     meio, braseiros de fogo roxo, orbes de magia (o histórico de resultados fica nas janelas dos jogos).
   - Tudo em pixel art: elipses e contornos pixel a pixel, luzes em degraus (sem degradê) e letreiros em fonte de pixel.
   Os jogos e as rodadas ficam em js/cassino-jogos.js (CASSINO_JOGOS.PX são as peças de desenho em pixel). A taverna
   (js/taverna.js) chama RUA_TAVERNA e CASSINO: chao, objetos, luzes, brilho, interface, click, atualizar. */
(function(){
 const G=()=>window.TAVERNA_GEO||{OX:24,OY:24,TW:480,TH:320};
 const OX=24,OY=24,TW=480,TH=320,PX0=OX+TW;
 const RY0=OY+TH,RUA0=364,RY1=436;                         // gramado na frente da taverna (RY0..RUA0) e a rua (RUA0..RY1)
 const RX1=968;                                            // fim da rua (a direita do pátio)
 const C={x:24,y:RY1,w:640,h:336};                         // cassino (planta, com as paredes)
 const PAREDE=54,PORTA={x:344,w:22};                       // parede do fundo (vista de dentro) e a porta
 const DOOR_TAV={x:OX+TW/2};
 const PORTA_LOJA=-120,RX0=-300,LOJA={x0:-232,x1:-8,y0:190};   // loja do Viajante (js/loja-viajante.js), à esquerda da taverna; a rua vai até RX0
 const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const hsh=(a,b)=>{let h=(a*374761393+b*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};
 const COR={noite:['#311339','#4f2052','#74366e'],magia:['#4a1f6e','#7a3ca8','#b07ad8'],ouro:['#9a5a2a','#d08a3a','#efc56a'],sangue:['#6e1438','#a22b4b','#cf4554'],
  folha:['#263a3a','#3f6b45','#79a35a'],osso:['#7a6650','#b8a47c','#ddd0a6'],aco:['#3e3a52','#7c8098','#c4c8d6'],agua:['#2a2a52','#3d5a8c','#6e9cc4'],madeira:['#4e2430','#7d3f34','#a8653f'],pedra:['#3a3040','#5e5668','#8e8898'],terra:['#1f1a1a','#3a2a2a','#5a4038']};
 const TONS=['#b07ad8','#6e9cc4','#efc56a','#cf4554','#79a35a'];
 const J=()=>window.CASSINO_JOGOS;
 const PXd=()=>J()&&J().PX;
 const elipse=(g,cx,cy,rx,ry,cor,m)=>{const P=PXd();if(P)P.elipse(g,cx,cy,rx,ry,cor,m)};
 const contorno=(g,cx,cy,rx,ry,cor,a0,a1)=>{const P=PXd();if(P)P.contorno(g,cx,cy,rx,ry,cor,a0,a1)};
 const luz=(g,x,y,r,cor,a)=>{const P=PXd();if(P)P.luz(g,x,y,r,cor,a)};
 const letreiro=(g,t,x,y,cor,e)=>{const P=PXd();if(P)P.texto(g,t,x,y,cor,'#000000',e||1)};
 const tipoEl=e=>window.MAP_ELEMENT_TYPES&&MAP_ELEMENT_TYPES[e.type];
 const desenharElem=(g,e)=>{const a=window.sceneryFor&&sceneryFor(e);if(a&&a.c)g.drawImage(a.c,Math.round(e.x-a.ax),Math.round(e.y-a.ay))};
 const naPaleta=c=>window.PALETA_JOGO?PALETA_JOGO.canvasNaPaleta(c):c;
 const h2=(x,y)=>typeof hash==='function'?hash(x,y):hsh(x,y); // o mesmo sorteio da ilha (world.js), para o desenho da grama ser igual

 /* ================= chão: grama e estrada iguais às da ilha (world.js) ================= */
 const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
 const GR=hx('#4b9a44'),GR_E=hx('#3c843a'),GR_C=hx('#62ad4f'),PIS=hx('#6f8a40'),TE=hx('#76603f'),TE_E=hx('#644f36'),TE_C=hx('#8b7550'),PEDRINHA=hx('#9a8a6e'),TE_S=hx('#4f3d2b');
 // tufinho "w" de 5 pixels, no máximo um por célula de 9×7 px, em 40% delas (o mesmo da ilha)
 const TUFO=[[0,0,0],[0,-1,0],[-1,0,0],[1,0,0],[0,-2,1]];
 const tufoEm=(x,y)=>{for(const [dx,dy,c] of TUFO){const ox=x-dx,oy=y-dy,cx=Math.floor(ox/9),cy=Math.floor(oy/7);if(h2(cx*5+1,cy*3+7)>.4)continue;
  if(cx*9+1+Math.floor(h2(cx,cy*11)*7)===ox&&cy*7+2+Math.floor(h2(cx*13,cy)*4)===oy)return c?GR_C:GR_E}return null};
 const gramaEm=(x,y)=>tufoEm(x,y)||GR;
 const terraEm=(q,h,grama)=>{if(q<0)return q>-.42?PIS:grama;if(q<.38)return TE_E;return h>.993?PEDRINHA:h>.982?TE_C:TE};
 // quanto o ponto entrou na estrada (< 0 grama, 0 a 1 beira, > 1 miolo): a rua de ponta a ponta e o caminho da porta da taverna
 const beira=(x,k)=>Math.sin(x*.07+k)*2+Math.sin(x*.023+k*3)*1.5;
 function qRua(x,y){if(y<RY0-8||y>RY1+8)return -9;const t=RUA0+beira(x,1),b=RY1-2+beira(x,4);let q=Math.min(y-t,b-y)/2.6;
  if(y<RUA0+6&&y>=RY0){const w=13+Math.sin(y*.3)*1.2;q=Math.max(q,(w-Math.abs(x-DOOR_TAV.x))/2.6,(w-Math.abs(x-PORTA_LOJA))/2.6)} // portas da taverna e da loja
  if(y>RY1-26){const w=30+(y-(RY1-26))*1.6;q=Math.max(q,(w-Math.abs(x-PORTA.x))/2.6)} // a praça do cassino emenda na rua
  return q}
 const X0=-760,Y0=-420,CW=2260,CH=1560;
 /* mata fechada em volta da cidade (2026-11-04, pedido do usuário: não ver o preto do fim do mapa): fora da clareira o
    chão vira copa de árvore vista de cima (copas redondas sorteadas numa grade, com luz em cima à esquerda e sombra
    entre elas), e uma fileira de árvores de verdade marca a borda. A estrada atravessa a mata nas duas pontas. */
 const ondula=(a,k)=>Math.sin(a*.05+k)*8+Math.sin(a*.13+k*2)*4;
 function naClareira(x,y){if(y>=RUA0-6&&y<=RY1+6)return true; // a estrada segue pela mata
  return(y>=-22+ondula(x,1)&&y<=446+ondula(x,2)&&x>=-334+ondula(y,3)&&x<=992+ondula(y,4))||(x>=10+ondula(y,5)&&x<=684+ondula(y,6)&&y<=792+ondula(x,7)&&y>=RY1)}
 const COPA=[hx("#263a3a"),hx("#3f6b45"),hx("#79a35a"),hx("#1f1a1a")];
 function copaEm(x,y){const T=15,cx0=Math.floor(x/T),cy0=Math.floor(y/T);let best=null,bd=1e9;
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const cx=cx0+i,cy=cy0+j,px=cx*T+h2(cx*7+1,cy*3+5)*T,py=cy*T+h2(cx*5+9,cy*11+2)*T,r=9+h2(cx,cy*7)*4,d=Math.hypot(x-px,(y-py)*1.15)/r;if(d<bd){bd=d;best=[px,py]}}
  if(bd>1)return COPA[3];const dx=x-best[0],dy=y-best[1];if(bd>.86)return COPA[0];if(dx+dy<-5&&bd<.7)return COPA[2];return dy>3&&bd>.55?COPA[0]:COPA[1]}
 let chaoRua=null,gramaTile=null;
 function desenharChaoRua(){
  const c=document.createElement('canvas');c.width=CW;c.height=CH;const g=c.getContext('2d'),img=g.createImageData(CW,CH),D=img.data;
  for(let j=0;j<CH;j++)for(let i=0;i<CW;i++){const x=i+X0,y=j+Y0,o=(j*CW+i)*4;if(!naClareira(x,y)){const cor=copaEm(x,y);D[o]=cor[0];D[o+1]=cor[1];D[o+2]=cor[2];D[o+3]=255;continue}let cor=gramaEm(x,y);
   const q=qRua(x,y);
   if(q>-1.2){const px=h2(x*3+1,y*7+2);
    if(q>=0){const qa=qRua(x,y-2),qb=qRua(x,y+2);let t=terraEm(q,px,cor);
     if(q<1.2&&qa<q-.12)t=q<.6?TE_S:TE_E;else if(q<.75&&qb<q-.12)t=TE_C;cor=t}
    else if(qRua(x,y+2)>=0&&q>-.6)cor=GR_C;else cor=terraEm(q,px,cor)}
   D[o]=cor[0];D[o+1]=cor[1];D[o+2]=cor[2];D[o+3]=255}
  g.putImageData(img,0,0);g.save();g.translate(-X0,-Y0);
  // praça de pedra na frente do cassino (lajes) e o tapete roxo da entrada
  for(let y=RUA0+34;y<RY1;y+=6)for(let x=PORTA.x-64+((y/6)%2)*6;x<PORTA.x+64;x+=12){const d=Math.abs(x+5-PORTA.x)/64+(RY1-y)/70;if(d>1.05)continue;R(g,x,y,11,5,hsh(x,y)<.5?'#5e5668':'#8e8898');R(g,x,y,11,1,'#c4c8d6');R(g,x,y+5,11,1,'#3a3040')}
  R(g,PORTA.x-12,RY1-22,24,22,COR.noite[1]);R(g,PORTA.x-12,RY1-22,2,22,COR.ouro[1]);R(g,PORTA.x+10,RY1-22,2,22,COR.ouro[1]);
  // jardim do lado do cassino: cerca na beira da rua
  for(let x=C.x+C.w+4;x<RX1;x+=14){R(g,x,RY1-10,3,14,'#4e2430');R(g,x,RY1-10,1,14,'#a8653f')}R(g,C.x+C.w+4,RY1-7,RX1-C.x-C.w-4,2,'#7d3f34');R(g,C.x+C.w+4,RY1-2,RX1-C.x-C.w-4,2,'#7d3f34');
  g.restore();return chaoRua={c:naPaleta(c),x:X0,y:Y0}}
 // ladrilho de grama da ilha (63×63 = 7 × 9 células: emenda sem costura), para o pátio do bar
 function gramaLadrilho(){if(gramaTile)return gramaTile;const c=document.createElement('canvas');c.width=c.height=63;const g=c.getContext('2d'),img=g.createImageData(63,63);
  for(let y=0;y<63;y++)for(let x=0;x<63;x++){const cor=gramaEm(x,y),o=(y*63+x)*4;img.data[o]=cor[0];img.data[o+1]=cor[1];img.data[o+2]=cor[2];img.data[o+3]=255}
  g.putImageData(img,0,0);return gramaTile=naPaleta(c)}

 /* ================= RUA ================= */
 // decorações da rua (mesmos elementos do pátio do bar)
 // posições editáveis na Engine (cena Cidade): js/taverna-layout.js (TAVERNA_LAYOUT.L.cidade); a mata em volta é gerada (FLORESTA)
 const CID=window.TAVERNA_LAYOUT.L.cidade;
 const DECOR=CID.rua;
 // árvores da borda da mata: pontos fora da clareira com a clareira logo ao lado (a estrada fica livre)
 const FLORESTA=[];
 for(let y=-80;y<=850;y+=20)for(let x=-400;x<=1060;x+=22){const px=x+Math.round((hsh(x,y)-.5)*10),py=y+Math.round((hsh(y,x)-.5)*8);
  if(naClareira(px,py)||(py>RUA0-30&&py<RY1+40&&(px<-300||px>960)))continue;
  if(naClareira(px,py+24)||naClareira(px+26,py)||naClareira(px-26,py)||naClareira(px,py-30))FLORESTA.push({type:'px:pk_bar_arvore',x:px,y:py})}
 const LAMP_MAGICO=CID.lampMagicos;
 const PLACAS=[{x:RX0+14,y:378,lado:-1},{x:956,y:378,lado:1}];
 function placa(pl){const x=pl.x,y=pl.y;R(ctx,x-1,y-20,3,22,'#000000');R(ctx,x,y-20,1,21,'#a8653f');
  const bx=x-14;R(ctx,bx-1,y-27,30,11,'#000000');R(ctx,bx,y-26,28,9,'#7d3f34');R(ctx,bx,y-26,28,1,'#a8653f');
  if(pl.lado<0){R(ctx,bx-3,y-24,3,5,'#000000');R(ctx,bx-2,y-23,2,3,'#7d3f34')}else{R(ctx,bx+28,y-24,3,5,'#000000');R(ctx,bx+28,y-23,2,3,'#7d3f34')}
  letreiro(ctx,pl.lado<0?'< ILHA':'ILHA >',bx+14,y-24,'#efc56a')}
 function lampMagico(l){const x=l.x,y=l.y,t=time,cor=TONS[Math.floor(t*.5+x)%TONS.length];
  R(ctx,x-3,y-1,7,3,'#000000');R(ctx,x-2,y-1,5,2,COR.pedra[1]);R(ctx,x-1,y-24,3,24,'#000000');R(ctx,x,y-24,1,23,COR.pedra[2]);
  const by=Math.round(y-30+Math.sin(t*2+x)*1.5);R(ctx,x-3,by-1,7,7,'#000000');R(ctx,x-2,by,5,5,cor);R(ctx,x-1,by+1,2,2,'#ffffff');
  R(ctx,x-4,y-25,9,2,'#000000');R(ctx,x-3,y-25,7,1,COR.ouro[1])}
 // zonas de som (música por aproximação): 1 dentro, cai até 0 a "fade" px da área
 const distRet=(x,y,r)=>Math.hypot(Math.max(r.x0-x,0,x-r.x1),Math.max(r.y0-y,0,y-r.y1));
 const ZONA_TAV=[{x0:OX,y0:OY,x1:OX+TW,y1:OY+TH},{x0:PX0,y0:4,x1:PX0+440,y1:364}],ZONA_CAS={x0:C.x,y0:C.y,x1:C.x+C.w,y1:C.y+C.h};
 const fator=(d,fade)=>d<=0?1:Math.max(0,1-d/fade)**2;
 window.RUA_TAVERNA={
  contem:(x,y)=>y>=RY0&&y<RY1&&x>=RX0-40&&x<RX1+40&&!(x>=PX0&&y<RUA0),
  walk(x,y){if(Math.abs(x-PORTA.x)<PORTA.w/2&&y>=RUA0)return true; // a porta do cassino emenda na rua
   if(x<RX0+2||x>RX1-2||y>RY1-2)return false;if(y<RUA0&&(x<LOJA.x0+6||x>PX0-6))return false; // gramado na frente da loja e da taverna
   for(const l of LAMP_MAGICO)if(Math.hypot(x-l.x,(y-l.y)*1.4)<5)return false;for(const pl of PLACAS)if(Math.abs(x-pl.x)<3&&Math.abs(y-pl.y)<3)return false;
   for(const e of DECOR){const t=tipoEl(e);if(t&&t.blocks&&Math.hypot(x-e.x,(y-e.y)*1.3)<Math.max(4,t.radius||6))return false}return true},
  saida:(x,y)=>y>=RUA0&&y<RY1&&(x<RX0+6||x>RX1-6),
  entrada:{x:DOOR_TAV.x,y:396},
  // grama (para os tufos ao vento): fora da estrada, das construções e do pátio
  ehGrama:(x,y)=>naClareira(x,y)&&qRua(x,y)<-1.4&&!(x>=OX-4&&x<PX0+444&&y<RY0+2)&&!(x>=LOJA.x0&&x<LOJA.x1&&y>=LOJA.y0&&y<RY0+2)&&!(x>=C.x-4&&x<C.x+C.w+4&&y>=C.y-2)&&!(x>C.x+C.w&&y>RY1-12&&y<RY1+4),
  gramaLadrilho,
  // só o pedaço à vista (o chão da cidade com a mata é grande); na Engine (sem herói andando) desenha tudo
  chao(){const ch=chaoRua||desenharChaoRua();if(window.MODO&&MODO.motor||typeof p==='undefined'){ctx.drawImage(ch.c,ch.x,ch.y);return}
   const vw=cv.width/S,vh=cv.height/S,sx=Math.max(0,Math.floor(p.x-vw/2-ch.x)-4),sy=Math.max(0,Math.floor(p.y-vh/2-ch.y)-4),sw=Math.min(ch.c.width-sx,Math.ceil(vw)+8),sh=Math.min(ch.c.height-sy,Math.ceil(vh)+8);
   if(sw>0&&sh>0)ctx.drawImage(ch.c,sx,sy,sw,sh,ch.x+sx,ch.y+sy,sw,sh)},
  objetos(L){for(const e of DECOR)L.push([e.y,()=>desenharElem(ctx,e)]);
   const vw=cv.width/S/2+60,vh=cv.height/S/2+80;for(const e of FLORESTA)if(Math.abs(e.x-p.x)<vw&&Math.abs(e.y-p.y)<vh)L.push([e.y,()=>desenharElem(ctx,e)]);for(const l of LAMP_MAGICO)L.push([l.y,()=>lampMagico(l)]);for(const pl of PLACAS)L.push([pl.y,()=>placa(pl)])},
  luzes(){const ls=[];for(const e of DECOR)if(e.type==='px:pk_bar_lampiao')ls.push({x:e.x,y:e.y-34,r:80,a:.8});for(const l of LAMP_MAGICO)ls.push({x:l.x,y:l.y-28,r:60,a:.8});ls.push({x:PORTA.x,y:RY1-30,r:110,a:.9});return ls},
  limites:()=>({x0:RX0,y0:0,x1:RX1,y1:C.y+C.h}),
  // música por aproximação: a da taverna vale na taverna inteira (com o pátio) e some pela rua; a do cassino, no cassino
  fatoresSom(x,y){return{taverna:fator(Math.min(...ZONA_TAV.map(r=>distRet(x,y,r))),150),cassino:fator(distRet(x,y,ZONA_CAS),110)}},
  minimapa(mm,at,k){const ch=chaoRua||desenharChaoRua(),[x,y]=at(ch.x,ch.y);mm.drawImage(ch.c,x,y,ch.c.width*k,ch.c.height*k)}
 };

 /* ================= CASSINO: peças ================= */
 const MAQUINAS=CID.maquinas.map((o,k)=>({k,x:o.x,y:o.y}));
 const vagaMaquina=m=>({x:m.x,y:m.y+14});
 const CRUPIES={rol1:'Crupiê Lia',rol2:'Crupiê Dante',bj1:'Crupiê Vera',bj2:'Crupiê Otto'};
 const MESAS=CID.mesasCassino.map(o=>({id:o.id,x:o.x,y:o.y,tipo:o.id.startsWith('rol')?'rol':'bj',crupie:CRUPIES[o.id]}));
 MESAS.forEach(m=>{m.cr=m.tipo==='rol'?{x:m.x-30,y:m.y-18}:{x:m.x,y:m.y-22}});
 const BANCOS_BJ=[[-38,9],[-17,22],[17,22],[38,9]];
 const lugarBJ=(m,i)=>({x:m.x+BANCOS_BJ[i][0],y:m.y+BANCOS_BJ[i][1]+4});
 const vagaMesa=m=>m.tipo==='rol'?{x:m.x+8,y:m.y+28}:{x:m.x,y:m.y+40};
 const CRISTAL=CID.cristal;
 const BRASEIROS=CID.braseiros;
 const CRISTAIS_PAREDE=[40,120,200,284,404,488,568,648].map(x=>({x,y:C.y+26}));
 const ORBES=Array.from({length:9},(_,k)=>({x:C.x+60+hsh(k,4)*(C.w-120),y:C.y+PAREDE+40+hsh(k,5)*(C.h-PAREDE-80),f:hsh(k,6)*6.28,c:TONS[k%TONS.length]}));
 const festa={}; // máquina -> instante em que alguém ganhou nela (pisca 3 s)
 // crupiês: mesmo boneco dos personagens, de colete (camisa) e cabelo arrumado
 const sprCrupie={};
 function spriteCrupie(k){if(sprCrupie[k])return sprCrupie[k];const sexo=k%2?'m':'f';
  try{const look=window.APARENCIA?{...APARENCIA.padrao(sexo),cabelo:['#311339','#1f1a1a','#9a5a2a','#4f2052'][k%4],estilo:sexo==='f'?'rabo':undefined}:undefined;sprCrupie[k]=human('war','d',0,{nude:1,sex:sexo,look,ch:ITEMS.ch1})}catch(e){sprCrupie[k]=(HS.sty||HS.war).d}
  return sprCrupie[k]}

 /* ---- chão e paredes de dentro (desenhado uma vez, em pixel) ---- */
 let chaoCassino=null;
 function desenharChao(){
  const c=document.createElement('canvas');c.width=C.w;c.height=C.h;const g=c.getContext('2d');
  // carpete vinho com losangos dourados e roxos
  R(g,0,0,C.w,C.h,COR.sangue[0]);
  for(let y=PAREDE;y<C.h;y+=16)for(let x=0;x<C.w;x+=16){const cx=x+8,cy=y+8;for(let k=0;k<8;k++){R(g,cx-k,cy-8+k,1,1,COR.noite[1]);R(g,cx+k,cy-8+k,1,1,COR.noite[1]);R(g,cx-k,cy+8-k,1,1,COR.noite[1]);R(g,cx+k,cy+8-k,1,1,COR.noite[1])}R(g,cx,cy,1,1,COR.ouro[1]);if(hsh(x,y)>.8)R(g,cx-1,cy-1,3,3,COR.sangue[1])}
  // tapete da entrada até o cristal (roxo com barra dourada)
  R(g,PORTA.x-C.x-15,PAREDE,30,CRISTAL.y-C.y-PAREDE,COR.noite[0]);R(g,PORTA.x-C.x-13,PAREDE,26,CRISTAL.y-C.y-PAREDE,COR.noite[1]);R(g,PORTA.x-C.x-13,PAREDE,2,CRISTAL.y-C.y-PAREDE,COR.ouro[1]);R(g,PORTA.x-C.x+11,PAREDE,2,CRISTAL.y-C.y-PAREDE,COR.ouro[1]);
  // círculo de runas em volta do cristal (pixel a pixel) com runas nos pontos cardeais
  const kx=CRISTAL.x-C.x,ky=CRISTAL.y-C.y;contorno(g,kx,ky,46,26,COR.ouro[0]);contorno(g,kx,ky,45,25,COR.ouro[0]);contorno(g,kx,ky,40,22,COR.magia[1]);
  for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.round(kx+Math.cos(a)*43),y=Math.round(ky+Math.sin(a)*23.5);R(g,x-1,y-1,3,3,COR.magia[0]);R(g,x,y-1,1,3,COR.magia[2])}
  // tapetes ovais embaixo das mesas
  for(const m of MESAS){elipse(g,m.x-C.x,m.y-C.y+6,64,34,COR.ouro[1]);elipse(g,m.x-C.x,m.y-C.y+6,62,32,COR.noite[0]);contorno(g,m.x-C.x,m.y-C.y+6,56,28,COR.noite[1])}
  // parede do fundo: pedra escura, faixa de runas, moldura dourada; o arco da porta no meio
  for(let y=0,row=0;y<PAREDE-4;y+=7,row++)for(let x=(row%2)*8;x<C.w;x+=16){R(g,x,y,15,6,hsh(x,y)<.5?COR.pedra[0]:'#2b2433');R(g,x,y,15,1,COR.pedra[1])}
  R(g,0,0,C.w,4,COR.ouro[0]);R(g,0,3,C.w,1,COR.ouro[2]);R(g,0,PAREDE-6,C.w,6,COR.noite[0]);R(g,0,PAREDE-6,C.w,1,COR.ouro[1]);R(g,0,PAREDE-1,C.w,1,'#000000');
  for(let x=10;x<C.w;x+=26){const v=hsh(x,9);R(g,x,16,2,8,COR.magia[0]);if(v<.5)R(g,x+2,18,3,1,COR.magia[0]);else R(g,x-3,21,3,1,COR.magia[0])}
  const dx=PORTA.x-C.x;R(g,dx-16,0,32,PAREDE,'#000000');R(g,dx-13,0,26,PAREDE,COR.terra[0]);R(g,dx-11,0,22,PAREDE,COR.noite[0]);for(let k=0;k<8;k++)R(g,dx-13+k,8-k,26-k*2,1,COR.ouro[k%2?0:1]);
  R(g,dx-11,PAREDE-8,22,8,COR.noite[1]);
  // paredes dos lados e de baixo
  R(g,0,0,8,C.h,COR.pedra[0]);R(g,8,0,2,C.h,COR.ouro[0]);R(g,C.w-8,0,8,C.h,COR.pedra[0]);R(g,C.w-10,0,2,C.h,COR.ouro[0]);R(g,0,C.h-8,C.w,8,COR.pedra[0]);R(g,0,C.h-10,C.w,2,COR.ouro[0]);
  return chaoCassino=naPaleta(c)}

 /* ---- desenhos das peças (no mundo) ---- */
 const SIMB_COR={moeda:COR.ouro[1],pocao:COR.sangue[1],espada:COR.aco[1],glooc:COR.folha[1],caveira:COR.osso[0],coroa:COR.ouro[2],javali:COR.ouro[2]};
 function maquina(m){
  const x=Math.round(m.x),y=Math.round(m.y),usando=J()&&J().aberto==='slot'&&J().slot.maquina===m.k,S=J()&&J().slot,t=time,fe=festa[m.k]!=null&&t-festa[m.k]<3;
  R(ctx,x-12,y-1,25,3,'#0006');
  R(ctx,x-11,y-38,23,38,'#000000');R(ctx,x-10,y-37,21,36,COR.sangue[1]);R(ctx,x-10,y-37,21,1,COR.sangue[2]);R(ctx,x-10,y-37,2,36,COR.sangue[2]);R(ctx,x+9,y-37,2,36,COR.sangue[0]);
  // cúpula com luz de magia (em festa: pisca dourado)
  const cor=fe?(Math.floor(t*10)%2?'#ffffff':COR.ouro[2]):TONS[(m.k+Math.floor(t*1.5))%TONS.length];R(ctx,x-7,y-44,15,7,'#000000');R(ctx,x-6,y-43,13,6,cor);R(ctx,x-4,y-42,4,2,'#ffffff');
  // janela dos rolos
  R(ctx,x-8,y-30,17,10,'#000000');R(ctx,x-7,y-29,15,8,COR.osso[2]);
  for(let r=0;r<3;r++){const gira=usando&&S&&!S.rolos[r].parou,sim=gira?['moeda','glooc','coroa','pocao','javali'][Math.floor(t*14+r*2)%5]:(usando&&S&&S.res?S.res[r]:['moeda','coroa','glooc'][(m.k+r)%3]);
   R(ctx,x-6+r*5,y-27,3,4,SIMB_COR[sim]);if(gira)R(ctx,x-6+r*5,y-28+((t*30|0)%5),3,1,'#ffffff')}
  // lâmpadas correndo
  for(let k=0;k<5;k++){const on=fe?(k+Math.floor(t*12))%2===0:(k+Math.floor(t*(usando?12:4))+m.k)%3===0;R(ctx,x-8+k*4,y-34,2,2,on?COR.ouro[2]:COR.ouro[0])}
  // painel e bandeja de moedas (em festa: moedas pulando da bandeja)
  R(ctx,x-8,y-18,17,6,COR.noite[0]);R(ctx,x-6,y-16,4,2,COR.sangue[2]);R(ctx,x+2,y-16,5,2,COR.folha[2]);R(ctx,x-7,y-8,15,4,'#000000');R(ctx,x-6,y-7,13,2,COR.ouro[0]);
  if(fe)for(let k=0;k<5;k++){const s=((t-festa[m.k])*1.6+k*.2)%1,mx=x-5+k*2.5+Math.sin(k*2)*3,my=y-8-Math.sin(s*Math.PI)*14;R(ctx,mx,my,2,2,COR.ouro[2]);R(ctx,mx,my,1,1,'#ffffff')}
  // alavanca
  const ta=usando&&S?(performance.now()-S.alav)/450:9,desce=ta>=0&&ta<1?Math.sin(ta*Math.PI)*8:0;
  R(ctx,x+11,y-26,3,8,'#000000');R(ctx,x+12,y-26+desce*.5,1,8-desce*.3,COR.aco[2]);R(ctx,x+11,y-30+desce,4,4,'#000000');R(ctx,x+12,y-29+desce,2,2,COR.sangue[2])}
 const VERM=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
 function roleta(m){
  const x=Math.round(m.x),y=Math.round(m.y),j=J(),a=j?j.anguloRoda(m.id):{roda:0,bola:null};
  ctx.globalAlpha=.4;elipse(ctx,x,y+8,44,10,'#000000');ctx.globalAlpha=1;
  R(ctx,x-30,y,3,9,'#000000');R(ctx,x+28,y,3,9,'#000000');
  elipse(ctx,x,y-4,43,17,'#000000');elipse(ctx,x,y-4,42,16,COR.madeira[1]);contorno(ctx,x,y-4,42,16,COR.madeira[2],Math.PI,Math.PI*2);
  elipse(ctx,x+2,y-5,37,12,COR.folha[1]);
  // casas dos números no feltro
  for(let k=0;k<12;k++)for(let r=0;r<3;r++){const n=k*3+3-r;R(ctx,x-6+Math.round(k*3.6),y-11+r*4,3,3,VERM.has(n)?COR.sangue[1]:'#1f1a1a')}
  R(ctx,x-9,y-11,2,11,COR.folha[2]);
  // fichas apostadas nesta rodada (de todos)
  const e=j&&j.estado(m.id),ap=e&&j.dados[m.id].apostas[e.n];if(ap){let k=0;for(const u in ap){const l=(ap[u]&&ap[u].l)||[];for(const b of l){const hh=hsh(k++,b.a+String(b.v).length);const fx=Math.round(x-4+hh*36),fy=Math.round(y-10+hsh(k,3)*9);R(ctx,fx-1,fy,3,2,'#000000');R(ctx,fx,fy,2,1,TONS[k%TONS.length])}}}
  // a roda, girando (a mesma do painel), em pixel
  const wx=x-26,wy=y-6;elipse(ctx,wx,wy,12,7,'#000000');elipse(ctx,wx,wy,11,6,COR.madeira[2]);elipse(ctx,wx,wy,8,4,COR.madeira[0]);
  for(let k=0;k<12;k++){const an=a.roda+k/12*Math.PI*2;R(ctx,wx+Math.round(Math.cos(an)*8.5),wy+Math.round(Math.sin(an)*4.6),2,1,k%2?COR.sangue[1]:'#1f1a1a')}
  R(ctx,wx-1,wy-1,3,2,COR.ouro[2]);
  if(a.bola!=null){const rb=a.raio>=.9?9.5:7;R(ctx,wx+Math.round(Math.cos(a.bola-Math.PI/2)*rb),wy+Math.round(Math.sin(a.bola-Math.PI/2)*rb*.55),1,1,'#ffffff')}}
 function mesaBJ(m){
  const x=Math.round(m.x),y=Math.round(m.y),j=J(),e=j&&j.estado(m.id);
  ctx.globalAlpha=.4;elipse(ctx,x,y+10,44,12,'#000000');ctx.globalAlpha=1;
  elipse(ctx,x,y-10,43,30,'#000000','baixo');R(ctx,x-43,y-14,87,5,'#000000');
  elipse(ctx,x,y-10,42,29,COR.madeira[1],'baixo');R(ctx,x-42,y-13,85,4,COR.madeira[1]);R(ctx,x-42,y-13,85,1,COR.madeira[2]);
  elipse(ctx,x,y-10,36,23,COR.folha[1],'baixo');R(ctx,x-36,y-10,73,1,COR.folha[2]);
  contorno(ctx,x,y-10,24,14,COR.ouro[1],.3,Math.PI-.3);
  R(ctx,x+20,y-14,8,5,'#000000');R(ctx,x+21,y-13,6,3,COR.madeira[0]); // sapato do baralho
  if(!e)return;
  const carta=(cx,cy,cos)=>{R(ctx,cx,cy,4,5,'#000000');R(ctx,cx,cy,3,4,cos?COR.noite[1]:COR.osso[2])};
  const banca=j.cartas(e.banca);banca.forEach((c,k)=>carta(x-8+k*4,y-8,k===1&&e.fase!=='fim'));
  for(let i=0;i<4;i++){const mo=e.maos&&e.maos[j.LUGARES[i]];if(!mo)continue;const b=BANCOS_BJ[i],cx=Math.round(x+b[0]*.62),cy=Math.round(y+b[1]*.5-8);
   j.cartas(mo.c).forEach((c,k)=>carta(cx-3+k*3,cy,false));R(ctx,cx+5,cy+2,3,2,'#000000');R(ctx,cx+5,cy+2,2,1,COR.ouro[2])}}
 function banquinho(x,y){x=Math.round(x);y=Math.round(y);R(ctx,x-5,y-1,11,3,'#0006');R(ctx,x-1,y-6,3,6,'#000000');R(ctx,x,y-6,1,6,COR.ouro[1]);R(ctx,x-5,y-9,11,4,'#000000');R(ctx,x-4,y-9,9,3,COR.sangue[1]);R(ctx,x-4,y-9,9,1,COR.sangue[2])}
 function crupie(m,k){const c=m.cr,spr=spriteCrupie(k);if(sob===m)circ(c.x,c.y,12,'#ff5');dr(spr,c.x,c.y,1,1,anim({x:c.x,y:c.y,fx:0,fy:1},0));
  ctx.font='5px monospace';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(m.crupie,c.x+.4,c.y-21.6-ACIMA_HEROI());ctx.fillStyle='#efc56a';ctx.fillText(m.crupie,c.x,c.y-22-ACIMA_HEROI())}
 function cristal(c=CRISTAL){const x=c.x,y=c.y,t=time;
  R(ctx,x-14,y-6,29,8,'#000000');R(ctx,x-13,y-6,27,6,COR.pedra[1]);R(ctx,x-13,y-6,27,1,COR.pedra[2]);R(ctx,x-9,y-12,19,7,'#000000');R(ctx,x-8,y-12,17,6,COR.pedra[2]);R(ctx,x-8,y-12,17,1,COR.ouro[2]);
  const by=Math.round(y-34+Math.sin(t*1.6)*3),cor=TONS[Math.floor(t*.7)%TONS.length],cor2=TONS[(Math.floor(t*.7)+1)%TONS.length];
  for(let k=0;k<16;k++){const w=k<6?k:16-k;R(ctx,x-w,by+k,w*2+1,1,'#000000')}
  for(let k=1;k<15;k++){const w=(k<6?k:16-k)-1;R(ctx,x-w,by+k,w*2+1,1,k<6?cor2:cor);R(ctx,x-w,by+k,1,1,'#ffffff')}
  for(let k=0;k<6;k++){const a=t*1.4+k*Math.PI/3;R(ctx,Math.round(x+Math.cos(a)*20),Math.round(by+8+Math.sin(a)*6),2,2,TONS[k%TONS.length])}}
 function braseiro(b){const x=b.x,y=b.y,t=time;R(ctx,x-6,y-2,13,4,'#000000');R(ctx,x-5,y-2,11,3,COR.pedra[1]);R(ctx,x-1,y-12,3,10,'#000000');R(ctx,x,y-12,1,10,COR.ouro[1]);R(ctx,x-6,y-16,13,5,'#000000');R(ctx,x-5,y-15,11,3,COR.ouro[1]);
  // chama de magia roxa em pixel: três línguas que sobem e trocam de altura
  for(const [o,h,f] of [[-3,7,0],[2,6,1.7],[-1,10,3.1]]){const hh=Math.round(h+Math.sin(t*9+f+x)*2);for(let k=0;k<hh;k++){const w=Math.max(0,Math.round((1-k/hh)*2.2));R(ctx,x+o-w,y-16-k,w*2+1,1,k>hh*.6?COR.magia[2]:k>hh*.25?COR.magia[1]:COR.magia[0])}R(ctx,x+o,y-16-hh,1,1,'#ffffff')}}
 function cristalParede(cp,k){const x=cp.x,y=cp.y,cor=TONS[(k+Math.floor(time*.9))%TONS.length];R(ctx,x-3,y-6,7,12,'#000000');R(ctx,x-2,y-5,5,10,cor);R(ctx,x-1,y-4,1,6,'#ffffff');R(ctx,x-5,y+5,11,3,'#000000');R(ctx,x-4,y+5,9,2,COR.ouro[1])}
 // entrada: dois pilares, arco e o letreiro com lâmpadas mágicas (letras em pixel)
 function portico(){const x=PORTA.x,y=C.y,t=time;
  for(const px of [x-24,x+24]){R(ctx,px-5,y-38,11,40,'#000000');R(ctx,px-4,y-38,9,39,COR.pedra[1]);R(ctx,px-4,y-38,2,39,COR.pedra[2]);R(ctx,px-6,y-4,13,5,'#000000');R(ctx,px-5,y-4,11,3,COR.ouro[1])}
  R(ctx,x-34,y-50,69,16,'#000000');R(ctx,x-33,y-49,67,14,COR.noite[1]);R(ctx,x-33,y-49,67,1,COR.ouro[2]);R(ctx,x-33,y-36,67,1,COR.ouro[0]);
  for(let k=0;k<17;k++){const on=(k+Math.floor(t*8))%3===0,cor=on?TONS[(k+Math.floor(t*2))%TONS.length]:COR.noite[0];R(ctx,x-32+k*4,y-52,2,2,cor);R(ctx,x-32+k*4,y-34,2,2,(k+Math.floor(t*8)+1)%3===0?TONS[(k+3)%TONS.length]:COR.noite[0])}
  letreiro(ctx,'CASSINO',x,y-47,Math.floor(t*3)%4?COR.ouro[2]:'#ffffff');letreiro(ctx,'ARCANO',x,y-41,COR.magia[2])}

 /* ================= CASSINO: interface com o mapa ================= */
 let sob=null,alvo=null,sentado=null,avisoPreso=-9;
 const dentroCassino=(x,y)=>x>=C.x&&x<C.x+C.w&&y>=C.y&&y<C.y+C.h;
 function bloqueia(x,y){
  for(const m of MAQUINAS)if(Math.abs(x-m.x)<13&&y<m.y+5)return true;
  for(const m of MESAS){if(m.tipo==='rol'){if(((x-m.x)/44)**2+((y-m.y+3)/18)**2<1)return true}else if(y<m.y+18&&y>m.y-16&&((x-m.x)/42)**2+((Math.max(0,y-m.y+10))/26)**2<1)return true;
   if(Math.hypot(x-m.cr.x,(y-m.cr.y)*1.4)<7)return true}
  if(((x-CRISTAL.x)/18)**2+((y-CRISTAL.y+3)/9)**2<1)return true;
  for(const b of BRASEIROS)if(Math.hypot(x-b.x,(y-b.y)*1.3)<7)return true;
  return false}
 function sobMouse(w){
  for(const m of MAQUINAS)if(Math.abs(w.x-m.x)<12&&w.y>m.y-46&&w.y<m.y+2)return{tipo:'slot',m};
  for(const m of MESAS){if(Math.hypot(w.x-m.cr.x,w.y-(m.cr.y-10))<11)return{tipo:'mesa',m};if(Math.abs(w.x-m.x)<44&&w.y>m.y-24&&w.y<m.y+14)return{tipo:'mesa',m}}
  return null}
 function irPara(o){const v=o.tipo==='slot'?vagaMaquina(o.m):vagaMesa(o.m);if(Math.hypot(p.x-v.x,p.y-v.y)<20){abrirObj(o);return}alvo=o;setDest(v.x,v.y)}
 function abrirObj(o){alvo=null;p.dest=null;p.path=[];if(!J())return;if(o.tipo==='slot'){p.fx=0;p.fy=-1;J().abrir('slot',o.m.k)}else{p.fx=o.m.x-p.x;p.fy=o.m.y-p.y;J().abrir(o.m.id)}}
 function interfaceMesa(m){const j=J();if(!j)return;const e=j.estado(m.id),perto=Math.hypot(p.x-m.x,p.y-m.y)<170;if(!perto)return;
  let txt=j.NOME[m.id],sub='';
  if(e&&m.tipo==='rol'){if(e.fase==='apostas')sub='Apostas: '+Math.max(0,Math.ceil((e.ate-Date.now())/1000))+'s';else sub=Date.now()>=e.ini+8000?'Saiu '+e.num+'!':'Girando…'}
  else if(e&&m.tipo==='bj'){sub=e.fase==='apostas'?(e.ate?'Apostas: '+Math.max(0,Math.ceil((e.ate-Date.now())/1000))+'s':Object.values(j.dados[m.id].assentos||{}).filter(Boolean).length+'/4 sentados'):e.fase==='jogando'?'Jogando':'Fim da mão'}
  const y=m.y-(m.tipo==='rol'?40:52);ctx.font='5px monospace';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(txt,m.x+.4,y+.4);ctx.fillStyle='#efc56a';ctx.fillText(txt,m.x,y);
  if(sub){ctx.fillStyle='#000';ctx.fillText(sub,m.x+.4,y+6.4);ctx.fillStyle='#ddd0a6';ctx.fillText(sub,m.x,y+6)}}
 // luz em degraus sem passar do telhado (telhado fechado: as luzes de dentro não aparecem)
 function registrarConstrucoes(){
  if(!window.CONSTRUCOES)return;const T=G();
  const lar=window.TAVERNA_LAYOUT&&TAVERNA_LAYOUT.L.lareira;
  CONSTRUCOES.registrar({id:'taverna',cena:'taverna',x:T.OX,y:T.OY,w:T.TW,h:T.TH,fachada:36,beiral:18,colisao:false,
   portas:[{lado:'s',x:T.OX+T.TW/2,w:26},{lado:'l',y:T.OY+170,w:28}],janelas:[T.OX+70,T.OX+150,T.OX+330,T.OX+410],chamine:lar?lar.x:T.OX+414,
   placa:{texto:'TAVERNA DO JAVALI DOURADO',cor:'#efc56a'},
   extra(g,a){const x=T.OX+T.TW/2,y=T.OY+T.TH;for(const lx of [x-24,x+24]){R(g,lx-1,y-26,3,6,'#000000');R(g,lx-2,y-20,5,6,'#000000');R(g,lx-1,y-19,3,4,'#f7b84a')}
    const nk=window.TEMPO?TEMPO.escuro():0;if(nk>.05)for(const lx of [x-24,x+24])luz(g,lx,y-17,30,'#f7b84a',a*nk*.6)}});
  CONSTRUCOES.registrar({id:'cassino',cena:'taverna',x:C.x,y:C.y,w:C.w,h:C.h,fachada:26,beiral:0,colisao:false,
   telhado:{sombra:'#311339',base:'#4f2052',luz:'#74366e',cumeeira:'#1f1a1a'},parede:{sombra:'#3a3040',base:'#5e5668',luz:'#8e8898',tipo:'pedra'},
   portas:[{lado:'n',x:PORTA.x,w:PORTA.w}],janelas:[C.x+80,C.x+200,C.x+440,C.x+560],
   extra(g,a){const t=time,cy=C.y+Math.round((C.h-26)*.32);
    for(const [k,cx] of [[0,C.x+120],[1,PORTA.x],[2,C.x+C.w-120]]){const cor=TONS[(k+Math.floor(t*.8))%TONS.length],by=Math.round(cy-18+Math.sin(t*2+k)*2);
     R(g,cx-2,cy-6,5,6,'#000000');R(g,cx-1,cy-6,3,5,COR.ouro[1]);for(let i=0;i<10;i++){const w=i<4?i:10-i;R(g,cx-w,by+i,w*2+1,1,i===0||i===9?'#000000':cor)}R(g,cx,by+2,1,4,'#ffffff');
     luz(g,cx,by+5,28,cor,a*(.4+.15*Math.sin(t*3+k)))}
    // letreiro grande no telhado (letras de pixel)
    letreiro(g,'CASSINO ARCANO',PORTA.x,C.y+Math.round(C.h*.55),TONS[Math.floor(t*1.5)%TONS.length],2)}})}

 window.CASSINO={
  C,PORTA,MAQUINAS,MESAS,
  contem:dentroCassino,
  dentro:()=>typeof p!=='undefined'&&dentroCassino(p.x,p.y),
  walk(x,y){if(Math.abs(x-PORTA.x)<PORTA.w/2&&y<C.y+PAREDE+4)return y>=C.y;
   if(x<C.x+12||x>C.x+C.w-12||y<C.y+PAREDE+2||y>C.y+C.h-12)return false;return!bloqueia(x,y)},
  chao(){ctx.drawImage(chaoCassino||desenharChao(),C.x,C.y)},
  objetos(L){
   L.push([C.y-.2,portico]);
   CRISTAIS_PAREDE.forEach((cp,k)=>L.push([C.y+PAREDE-8,()=>cristalParede(cp,k)]));
   for(const m of MAQUINAS)L.push([m.y,()=>maquina(m)]);
   MESAS.forEach((m,k)=>{L.push([m.y,()=>m.tipo==='rol'?roleta(m):mesaBJ(m)]);L.push([m.cr.y,()=>crupie(m,k)]);
    if(m.tipo==='bj')for(let i=0;i<4;i++){const s=lugarBJ(m,i);L.push([s.y-6,()=>banquinho(s.x,s.y-4)])}});
   L.push([CRISTAL.y,cristal]);for(const b of BRASEIROS)L.push([b.y,()=>braseiro(b)])},
  luzes(){const ls=[{x:CRISTAL.x,y:CRISTAL.y-30,r:120,a:.9}];for(const b of BRASEIROS)ls.push({x:b.x,y:b.y-20,r:70,a:.8});for(const m of MESAS)ls.push({x:m.x,y:m.y-10,r:70,a:.7});return ls},
  /* luz do cassino: lá dentro é sempre noite de festa (um véu roxo) e as luzes de magia brilham em degraus de pixel;
     some com o telhado (de fora, só o letreiro da entrada e os lampiões brilham) */
  brilho(){const a=window.CONSTRUCOES?1-CONSTRUCOES.alfa('cassino'):1,t=time;
   luz(ctx,PORTA.x,C.y-44,60,TONS[Math.floor(t*2)%TONS.length],.35);
   for(const l of LAMP_MAGICO)luz(ctx,l.x,l.y-28,30,TONS[Math.floor(t*.5+l.x)%TONS.length],.4);
   if(a<=.01)return;
   ctx.save();ctx.beginPath();ctx.rect(C.x,C.y,C.w,C.h);ctx.clip();
   ctx.globalAlpha=a*.38;ctx.fillStyle='#1a0820';ctx.fillRect(C.x,C.y,C.w,C.h);ctx.globalAlpha=1;
   luz(ctx,CRISTAL.x,CRISTAL.y-28,100,TONS[Math.floor(t*.7)%TONS.length],a*(.4+.06*Math.sin(t*3)));
   CRISTAIS_PAREDE.forEach((cp,k)=>luz(ctx,cp.x,cp.y,30,TONS[(k+Math.floor(t*.9))%TONS.length],a*.35));
   for(const b of BRASEIROS)luz(ctx,b.x,b.y-20,40,'#b07ad8',a*(.4+.1*Math.sin(t*8+b.x)));
   for(const m of MAQUINAS){const fe=festa[m.k]!=null&&t-festa[m.k]<3;luz(ctx,m.x,m.y-40,fe?30:16,fe?'#efc56a':TONS[(m.k+Math.floor(t*1.5))%TONS.length],a*(fe?.6:.3))}
   for(const m of MESAS)luz(ctx,m.x,m.y-8,50,'#efc56a',a*.16);
   // orbes de magia flutuando
   for(const o of ORBES){o.f+=1/60;const x=Math.round(o.x+Math.sin(o.f*.5)*30),y=Math.round(o.y+Math.cos(o.f*.37)*18-20),c=TONS[(TONS.indexOf(o.c)+Math.floor(o.f*.3))%TONS.length];luz(ctx,x,y,22,c,a*.45);ctx.globalAlpha=a;R(ctx,x-1,y-1,3,3,c);R(ctx,x,y,1,1,'#ffffff');ctx.globalAlpha=1}
   // faíscas subindo do cristal
   for(let k=0;k<14;k++){const s=(t*.35+k/14)%1,x=Math.round(CRISTAL.x+Math.sin(k*2.3+t)*16*(1-s)),y=Math.round(CRISTAL.y-24-s*70);ctx.globalAlpha=a*(1-s);R(ctx,x,y,1,1,TONS[k%TONS.length])}
   ctx.restore()},
  interface(){if(window.CONSTRUCOES&&CONSTRUCOES.alfa('cassino')>.5)return;for(const m of MESAS)interfaceMesa(m)},
  hover(w){return!!sobMouse(w)},
  click(w,mode){if(mode==2||!window.CONSTRUCOES||CONSTRUCOES.alfa('cassino')>.5&&!dentroCassino(p.x,p.y))return false;const o=sobMouse(w);if(!o)return false;irPara(o);return true},
  // o painel fecha quando o herói se afasta
  pertoDe(id,k){if(id==='slot'){const m=MAQUINAS[k|0];return!!m&&Math.hypot(p.x-m.x,p.y-m.y-14)<44}const m=MESAS.find(o=>o.id===id);return!!m&&Math.hypot(p.x-m.x,p.y-m.y)<90},
  sentarHeroi(id,i){const m=MESAS.find(o=>o.id===id);if(!m)return;const s=lugarBJ(m,i);p.dest=null;p.path=[];p.x=s.x;p.y=s.y;p.fx=m.x-s.x;p.fy=m.y-s.y;sentado={id,i}},
  levantarHeroi(){if(!sentado)return;const m=MESAS.find(o=>o.id===sentado.id),s=lugarBJ(m,sentado.i);sentado=null;p.x=s.x+(s.x-m.x)*.25;p.y=s.y+10},
  // alguém ganhou nesta máquina: pisca e solta moedas por 3 s
  festaMaquina(k){festa[k|0]=time},
  // volume de um som do cassino para este jogador: cai com a distância; de fora (telhado fechado), abafado
  volumeEm(tipo,q){if(typeof p==='undefined'||!window.inTaverna)return 0;const o=tipo==='slot'?MAQUINAS[q|0]:MESAS.find(m=>m.id===q);if(!o)return 0;
   const v=Math.max(0,1-Math.hypot(p.x-o.x,p.y-o.y)/280)**1.4;return dentroCassino(p.x,p.y)?v:v*.3},
  atualizar(dt){
   if(sentado){const m=MESAS.find(o=>o.id===sentado.id),s=lugarBJ(m,sentado.i);
    if(p.dest||(p.path&&p.path.length)||Math.hypot(p.x-s.x,p.y-s.y)>6){p.dest=null;p.path=[];p.x=s.x;p.y=s.y;if(time-avisoPreso>2){avisoPreso=time;ft(p.x,p.y-30,'Use Levantar (ou feche a mesa) para sair','#cf4554')}}else{p.x=s.x;p.y=s.y}}
   if(alvo){const v=alvo.tipo==='slot'?vagaMaquina(alvo.m):vagaMesa(alvo.m);if(Math.hypot(p.x-v.x,p.y-v.y)<12)abrirObj(alvo);else if(!p.dest)alvo=null}
   const w=typeof wpos=='function'?wpos():null;sob=null;if(w&&(dentroCassino(p.x,p.y))){const o=sobMouse(w);if(o){cv.style.cursor='pointer';if(o.tipo==='mesa')sob=o.m}}
   void dt},
  minimapa(mm,at,k){const [x,y]=at(C.x,C.y);mm.drawImage(chaoCassino||desenharChao(),x,y,C.w*k,C.h*k)},
  /* Engine (cena Cidade): as peças móveis desenhadas em volta de (0,0) — w×h é a caixa, (ox, oy) o canto dela — e o que
     é fixo (entrada do cassino, cristais da parede, árvores da borda da mata) */
  pecas:{
   maquina:{w:40,h:60,ox:-20,oy:-52,fn:()=>maquina({k:0,x:0,y:0})},
   roleta:{w:112,h:84,ox:-56,oy:-62,fn:()=>{const m={id:'rol1',x:0,y:0,tipo:'rol',crupie:'Crupiê',cr:{x:-30,y:-18}};crupie(m,0);roleta(m)}},
   blackjack:{w:112,h:96,ox:-56,oy:-64,fn:()=>{const m={id:'bj1',x:0,y:0,tipo:'bj',crupie:'Crupiê',cr:{x:0,y:-22}};crupie(m,2);mesaBJ(m);for(let i=0;i<4;i++){const s=lugarBJ(m,i);banquinho(s.x,s.y-4)}}},
   cristal:{w:64,h:72,ox:-32,oy:-58,fn:()=>cristal({x:0,y:0})},
   braseiro:{w:30,h:46,ox:-15,oy:-40,fn:()=>braseiro({x:0,y:0})},
   'lamp-magico':{w:20,h:46,ox:-10,oy:-42,fn:()=>lampMagico({x:0,y:0})}},
  fixosMotor(){portico();CRISTAIS_PAREDE.forEach((cp,k)=>cristalParede(cp,k));FLORESTA.slice().sort((a,b)=>a.y-b.y).forEach(e=>desenharElem(ctx,e))}
 };
 if(document.readyState==='complete')registrarConstrucoes();else addEventListener('load',registrarConstrucoes);
})();
