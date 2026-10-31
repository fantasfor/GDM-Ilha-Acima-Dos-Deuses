/* Portas das DGs (2026-10-24, pedidos do usuário: uma porta por tema, depois mais variações). Desenho em pixel 1:1 no
   tamanho de cada porta:
   - horizontal (fecha uma passagem de cima para baixo): portão de frente, mais alto que a área que bloqueia (visão 3/4),
     com o pé na linha de baixo da porta;
   - vertical (fecha uma passagem da esquerda para a direita): a porta vista de lado, uma lâmina alta e estreita.
   Fechada: portão inteiro. Aberta: só a moldura, e a passagem fica livre.
   Cada estilo = moldura de um tema (postes, viga e enfeite) + miolo (o que fecha a passagem). A porta usa door.estilo; sem
   estilo, o padrão do tema da DG. Arte própria do projeto ainda vale (Artes do jogo › dg-door-…). */
(function(root){
 // molduras por tema
 const M={
  forest:{poste:['#1e140e','#3a2618','#5a3a22'],viga:['#1e140e','#3a2618','#5a3a22'],folha:['#3a2616','#5a3a22','#76502e'],cinta:['#22222a','#4a4a56','#7a7a88'],extra:'hera'},
  ossos:{poste:['#6a6250','#b0a68e','#e8e0ca'],viga:['#3a3640','#58545e','#76727e'],folha:['#8a8270','#d4cab0','#f2ead6'],cinta:['#3a3640','#58545e','#76727e'],extra:'caveiras'},
  chamas:{poste:['#0e0a14','#1e1828','#3a2e52'],viga:['#0e0a14','#1e1828','#3a2e52'],folha:['#1a1618','#3a3438','#5a5258'],cinta:['#2a2428','#4a4448','#6a6268'],extra:'lava'},
  cave:{poste:['#2a2420','#4a423a','#6a6058'],viga:['#2a2420','#4a423a','#6a6058'],folha:['#3a2414','#5c3a20','#7c5230'],cinta:['#22222a','#4a4a56','#7a7a88']},
  underground:{poste:['#14262c','#24424c','#3a6470'],viga:['#14262c','#24424c','#3a6470'],folha:['#2a2a2e','#44444c','#62626c'],cinta:['#14262c','#24424c','#3a6470']}
 };
 // estilos: o primeiro de cada tema é o padrão
 const ESTILOS={
  floresta_portao:{nome:'Floresta escura · Portão de tábuas',tema:'forest',miolo:'tabuas'},
  floresta_troncos:{nome:'Floresta escura · Barricada de troncos',tema:'forest',miolo:'troncos'},
  floresta_raizes:{nome:'Floresta escura · Emaranhado de raízes',tema:'forest',miolo:'raizes'},
  ossos_grade:{nome:'DG de ossos · Grade de ossos',tema:'ossos',miolo:'grade_osso'},
  ossos_laje:{nome:'DG de ossos · Laje com caveira',tema:'ossos',miolo:'laje',entalhe:'caveira',pedra:['#2e2c34','#4a4652','#666274']},
  ossos_costelas:{nome:'DG de ossos · Costelas',tema:'ossos',miolo:'costelas'},
  chamas_chapas:{nome:'DG de chamas · Chapas com runa',tema:'chamas',miolo:'chapas'},
  chamas_grade:{nome:'DG de chamas · Grade em brasa',tema:'chamas',miolo:'grade_ferro',brasa:true},
  chamas_runas:{nome:'DG de chamas · Barreira de runas de fogo',tema:'chamas',miolo:'runas'},
  caverna_madeira:{nome:'Caverna · Madeira',tema:'cave',miolo:'tabuas'},
  caverna_laje:{nome:'Caverna · Laje de pedra rachada',tema:'cave',miolo:'laje',entalhe:'rachaduras',pedra:['#2a2420','#4a423a','#6a6058']},
  caverna_grade:{nome:'Caverna · Grade de ferro',tema:'cave',miolo:'grade_ferro'},
  subterraneo_madeira:{nome:'Subterrâneo · Madeira',tema:'underground',miolo:'tabuas'},
  subterraneo_grade:{nome:'Subterrâneo · Grade de ferro',tema:'underground',miolo:'grade_ferro'},
  subterraneo_laje:{nome:'Subterrâneo · Laje com círculo rúnico',tema:'underground',miolo:'laje',entalhe:'circulo',pedra:['#14262c','#24424c','#3a6470']}
 };
 const PADRAO={};for(const [k,e] of Object.entries(ESTILOS))if(!PADRAO[e.tema])PADRAO[e.tema]=k;
 const CONTORNO='#0c080a',ESCURO='#07050a',LAVA=['#c8401a','#ff7a1a','#ffd84a'],OSSO=['#8a8270','#d4cab0','#f2ead6'],FERRO=['#1e1e24','#3a3a44','#6a6a76'],TORA=['#2a1a10','#4a3020','#6a4628'],RAIZ=['#3a2618','#6a4a2e','#8e6a44'];
 const cache=new Map();
 const hash=(x,y)=>{let h=(x*374761393+y*668265263)|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296};
 function tela(w,h){const c=root.document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');return{c,g,r:(x,y,ww,hh,cor)=>{if(ww<=0||hh<=0)return;g.fillStyle=cor;g.fillRect(Math.round(x),Math.round(y),Math.round(ww),Math.round(hh))}}}
 // poste/viga com volume: luz à esquerda/em cima, sombra à direita/embaixo, contorno
 const barra=(r,x,y,w,h,C,vertical)=>{r(x,y,w,h,CONTORNO);r(x+1,y+1,w-2,h-2,C[1]);if(vertical){r(x+1,y+1,1,h-2,C[2]);r(x+w-2,y+1,1,h-2,C[0])}else{r(x+1,y+1,w-2,1,C[2]);r(x+1,y+h-2,w-2,1,C[0])}};
 const caveira=(r,cx,y)=>{r(cx-2,y,5,4,'#e8e0ca');r(cx-2,y+3,5,1,'#b0a68e');r(cx-1,y+1,1,1,'#1a1014');r(cx+1,y+1,1,1,'#1a1014');r(cx-1,y+4,3,1,'#b0a68e')};
 /* o que fecha a passagem, no retângulo x0..x1 × y0..y1; frente = porta horizontal, senão lâmina da porta vertical */
 function miolo(r,g,E,m,x0,y0,x1,y1,frente){
  const W=x1-x0,H=y1-y0,cx=Math.round((x0+x1)/2),cy=Math.round((y0+y1)/2);
  switch(E.miolo){
   case 'tabuas':case 'chapas':{
    const chapa=E.miolo==='chapas';
    if(frente){const tab=chapa?Math.max(6,Math.floor(W/3)):5;
     for(let x=x0,k=0;x<x1;x+=tab,k++){const w=Math.min(tab,x1-x);r(x,y0,w,H,m.folha[k%2?0:1]);r(x,y0,1,H,m.folha[2]);r(x+w-1,y0,1,H,CONTORNO)}
     for(const y of [y0+4,y1-6]){r(x0,y,W,3,m.cinta[1]);r(x0,y,W,1,m.cinta[2]);r(x0,y+2,W,1,m.cinta[0]);for(let x=x0+3;x<x1-2;x+=tab)r(x,y+1,1,1,chapa?LAVA[1]:m.cinta[2])}
     if(chapa){r(cx-3,cy-4,6,8,LAVA[0]);r(cx-2,cy-3,4,6,LAVA[1]);r(cx-1,cy-2,2,4,LAVA[2])}else{r(cx-2,cy-2,4,5,m.cinta[1]);r(cx-1,cy-1,2,2,m.cinta[2]);r(cx-1,cy+1,1,1,CONTORNO)}
    }else{r(x0,y0,W,H,CONTORNO);r(x0+1,y0,W-2,H,m.folha[1]);r(x0+1,y0,1,H,m.folha[2]);
     for(let y=y0+5;y<y1-3;y+=12){r(x0,y,W,3,m.cinta[1]);r(x0,y,W,1,m.cinta[2]);if(chapa)r(cx-1,y+1,2,1,LAVA[1])}
     if(chapa){r(cx-1,cy-3,2,6,LAVA[1]);r(cx-1,cy-1,2,2,LAVA[2])}}
    break;}
   case 'grade_osso':
    if(frente){for(let x=x0+2;x<x1-1;x+=5){r(x,y0,2,H,OSSO[1]);r(x,y0,1,H,OSSO[2]);r(x-1,y0+1,4,2,OSSO[2]);r(x-1,y1-3,4,2,OSSO[0])}
     const ym=y0+Math.round(H*.45);r(x0,ym,W,2,OSSO[0]);r(x0,ym,W,1,OSSO[2]);}
    else for(let y=y0+2;y<y1-1;y+=5){r(x0,y,W,2,OSSO[1]);r(x0,y,W,1,OSSO[2])}
    break;
   case 'grade_ferro':{
    const F=E.brasa?['#2a1410','#5a2a1a','#8a3a22']:FERRO;
    if(frente){for(let y=y0+3;y<y1-2;y+=7){r(x0,y,W,2,F[1]);r(x0,y,W,1,F[2])}
     for(let x=x0+2;x<x1-1;x+=5){r(x,y0,2,H,F[1]);r(x,y0,1,H,F[2]);r(x,y1-1,2,1,F[2]);r(x,y1,1,1,F[2]); // ponta
      if(E.brasa){r(x,y1-5,2,4,LAVA[0]);r(x,y1-3,2,2,LAVA[1]);r(x,y1-1,1,1,LAVA[2])}}}
    else{for(let y=y0+2;y<y1-1;y+=5){r(x0,y,W,2,F[1]);r(x0,y,W,1,F[2])}r(cx-1,y0,2,H,F[0]);if(E.brasa)r(cx-1,y1-6,2,5,LAVA[1])}
    break;}
   case 'troncos':
    if(frente){for(let y=y0,k=0;y<y1;y+=5,k++){const h=Math.min(5,y1-y);r(x0,y,W,h,CONTORNO);r(x0,y+1,W,h-2,TORA[1]);r(x0,y+1,W,1,TORA[2]);r(x0,y+h-2,W,1,TORA[0]);
      for(let x=x0+3+(k%2)*4;x<x1-2;x+=9)r(x,y+2,2,1,TORA[0]); // nós da casca
      r(x0,y+1,2,h-2,'#8a6a44');r(x1-2,y+1,2,h-2,'#8a6a44')} // pontas cortadas
     for(const x of [x0+Math.round(W/3),x0+Math.round(2*W/3)]){r(x,y0,2,H,'#a08050');r(x+1,y0,1,H,'#6a5030')}} // cordas
    else{r(x0,y0,W,H,CONTORNO);r(x0+1,y0,W-2,H,TORA[1]);r(x0+1,y0,1,H,TORA[2]);for(let y=y0+6;y<y1;y+=10)r(x0,y,W,2,'#a08050')}
    break;
   case 'raizes':
    r(x0,y0,W,H,'#120c08');
    for(let k=0;k<(frente?7:4);k++){
     if(frente){let y=y0+2+k*Math.max(2,Math.floor(H/7)),d=k%2?1:-1;for(let x=x0;x<x1;x++){r(x,y,1,2,RAIZ[1]);r(x,y,1,1,RAIZ[2]);if(hash(x,k)<.35)y+=d;if(y<y0+1||y>y1-3)d=-d;if(hash(x+50,k)<.06){r(x,y-2,1,2,'#c8323c')}}}
     else{let x=x0+1+(k%2),d=1;for(let y=y0;y<y1;y++){r(x,y,2,1,RAIZ[1]);r(x,y,1,1,RAIZ[2]);if(hash(k,y)<.3)x+=d;if(x<x0+1||x>x1-3)d=-d}}}
    break;
   case 'laje':{
    const P=E.pedra;r(x0,y0,W,H,CONTORNO);r(x0+1,y0+1,W-2,H-2,P[1]);r(x0+1,y0+1,W-2,1,P[2]);r(x0+1,y0+1,1,H-2,P[2]);r(x0+1,y1-2,W-2,1,P[0]);r(x1-2,y0+1,1,H-2,P[0]);
    for(let k=0;k<W*H/14;k++){const x=x0+2+Math.floor(hash(k,1)*(W-4)),y=y0+2+Math.floor(hash(k,2)*(H-4));r(x,y,1,1,hash(k,3)<.5?P[0]:P[2])}
    if(frente){
     if(E.entalhe==='caveira'){r(cx-5,cy-5,11,8,P[0]);r(cx-4,cy-4,9,6,'#d4cab0');r(cx-3,cy-2,2,2,'#1a1014');r(cx+1,cy-2,2,2,'#1a1014');r(cx-2,cy+2,5,2,'#b0a68e');r(cx-2,cy+3,1,1,'#1a1014');r(cx,cy+3,1,1,'#1a1014');r(cx+2,cy+3,1,1,'#1a1014')}
     else if(E.entalhe==='circulo'){for(let a=0;a<24;a++){const t=a/24*6.283;r(cx+Math.round(Math.cos(t)*6),cy+Math.round(Math.sin(t)*6),1,1,'#7ad0e0')}r(cx-1,cy-3,2,6,'#7ad0e0');r(cx-3,cy,6,1,'#7ad0e0')}
     else{let x=cx-6,y=y0+2;for(let s=0;s<H-4;s++){r(x,y+s,1,1,P[0]);x+=hash(s,9)<.4?1:hash(s,10)<.3?-1:0}x=cx+8;for(let s=0;s<H/2;s++){r(x,y1-3-s,1,1,P[0]);x+=hash(s,11)<.4?-1:0}}
    }else if(E.entalhe==='circulo')r(cx-1,cy-2,2,4,'#7ad0e0');
    break;}
   case 'costelas':
    if(frente){r(cx-1,y0,3,H,OSSO[1]);r(cx-1,y0,1,H,OSSO[2]);for(let y=y0+3;y<y1-2;y+=4)r(cx-2,y,5,1,OSSO[0]); // coluna
     for(let k=0;k<4;k++){const y=y0+3+k*Math.floor((H-6)/4);for(const s of [-1,1]){for(let i=0;i<Math.floor(W/2)-3;i++){const x=cx+s*(2+i),yy=y+Math.round(Math.pow(i/(W/2),2)*8);r(x,yy,1,2,OSSO[1]);r(x,yy,1,1,OSSO[2])}}}}
    else{for(let y=y0+2;y<y1-1;y+=4){r(x0,y,W,2,OSSO[1]);r(x0,y,W,1,OSSO[2])}r(cx-1,y0,2,H,OSSO[0])}
    break;
   case 'runas':{ // barreira mágica de fogo: translúcida, com runas acesas
    g.globalAlpha=.28;r(x0,y0,W,H,LAVA[0]);g.globalAlpha=.24;for(let x=x0;x<x1;x++){const top=y0+Math.round(2+Math.sin(x*.7)*2);r(x,top,1,H-(top-y0),LAVA[1])}g.globalAlpha=1;
    const passo=frente?12:14;
    for(let k=0,x=x0+4;frente?x<x1-4:k<Math.floor(H/passo);k++,x+=passo){const rx=frente?x:cx-2,ry=frente?cy-4:y0+4+k*passo;r(rx+2,ry,1,8,LAVA[2]);r(rx,ry+2,5,1,LAVA[2]);r(rx,ry+6,2,1,LAVA[2]);r(rx+3,ry+5,2,1,LAVA[2])}
    break;}
  }
 }
 /* portão de frente (porta horizontal): W de largura e A de altura */
 function portao(E,W,A,aberta){
  const m=M[E.tema],{c,g,r}=tela(W,A),P=6,V=6; // largura do poste, altura da viga
  r(1,A-2,W-2,2,ESCURO); // sombra no chão
  // fechada: fundo escuro nas frestas (a barreira de runas fica sem fundo: vê-se através dela); aberta: passagem livre
  if(aberta){r(P,V,W-2*P,2,'#000000');r(P,V+2,W-2*P,1,'#120c10')}else if(E.miolo!=='runas')r(P,V,W-2*P,A-V-1,ESCURO);
  if(!aberta)miolo(r,g,E,m,P,V,W-P,A-2,true);
  barra(r,0,0,P,A-1,m.poste,true);barra(r,W-P,0,P,A-1,m.poste,true);barra(r,0,0,W,V,m.viga,false);
  if(m.extra==='hera'){for(let x=3;x<W-3;x+=3){const l=1+((x*7)%5);for(let y=V;y<V+l;y++)r(x,y,1,1,y%2?'#2c6a3a':'#1d4a2a');}r(2,1,W-4,1,'#2c6a3a')}
  if(m.extra==='caveiras')for(let x=4;x<W-3;x+=7)caveira(r,x,0);
  if(m.extra==='lava'){r(P,2,W-2*P,1,aberta?LAVA[2]:LAVA[1]);for(const x of [2,W-4])for(let y=8;y<A-4;y+=6)r(x,y,2,2,aberta?LAVA[2]:LAVA[0])}
  if(E.tema==='ossos')for(const x of [0,W-P])for(let y=8;y<A-3;y+=5)r(x+1,y,P-2,1,'#6a6250'); // juntas dos ossos nas colunas
  return c;
 }
 /* porta vista de lado (porta vertical): lâmina estreita; aberta, ficam só os batentes de cima e de baixo */
 function lamina(E,W,A,aberta){
  const m=M[E.tema],{c,g,r}=tela(W,A),T=8;
  r(0,A-2,W,2,ESCURO);
  if(!aberta){if(E.miolo!=='runas'&&E.miolo!=='tabuas'&&E.miolo!=='chapas')r(1,T,W-2,A-2*T,ESCURO);miolo(r,g,E,m,1,T,W-1,A-T,false)}
  barra(r,0,0,W,T,m.poste,false);barra(r,0,A-T-1,W,T,m.poste,false);
  if(m.extra==='caveiras')caveira(r,Math.round(W/2),1);
  if(m.extra==='hera')for(let y=T;y<T+5;y++)r(2+(y%3),y,1,1,'#2c6a3a');
  if(m.extra==='lava')r(1,T-2,W-2,1,aberta?LAVA[2]:LAVA[1]);
  return c;
 }
 const ALTO=28; // quanto a frente do portão passa da área da porta (visão 3/4)
 // estilo da porta: o dela (door.estilo) ou o padrão do tema
 const estiloDe=(tema,estilo)=>ESTILOS[estilo]?estilo:PADRAO[M[tema]?tema:'cave'];
 // desenho da porta: canvas e onde ele fica em relação ao centro da porta (dx, dy = canto de cima à esquerda)
 // na paleta do jogo (2026-10-30): o desenho da porta convertido uma vez e guardado
 const memoPal=new Map();
 function arte(...a){const k=a.join('|');if(!memoPal.has(k)){const c=arteBruta(...a);if(root.PALETA_JOGO&&c&&c.c&&c.c.getContext)root.PALETA_JOGO.canvasNaPaleta(c.c);memoPal.set(k,c)}return memoPal.get(k)}
 function arteBruta(tema,vertical,aberta,w,h,estilo){
  const id=estiloDe(tema,estilo),E=ESTILOS[id];w=Math.max(8,Math.round(w));h=Math.max(8,Math.round(h));
  const k=id+vertical+aberta+w+'x'+h;let a=cache.get(k);
  if(!a){a=vertical?{c:lamina(E,w,h+16,aberta),dx:-w/2,dy:-h/2-16}:{c:portao(E,w,h+ALTO,aberta),dx:-w/2,dy:h/2-(h+ALTO)};cache.set(k,a)}
  return a;
 }
 root.PORTAS_DG={TEMAS:Object.keys(M),ESTILOS:Object.fromEntries(Object.entries(ESTILOS).map(([k,e])=>[k,e.nome])),temaDe:Object.fromEntries(Object.entries(ESTILOS).map(([k,e])=>[k,e.tema])),PADRAO,arte,
  desenhar(g,door,tema,aberta){const v=(door.orientation||'vertical')==='vertical',w=+door.w||(v?12:56),h=+door.h||(v?56:12),a=arte(tema,v,aberta,w,h,door.estilo);g.drawImage(a.c,Math.round(door.x+a.dx),Math.round(door.y+a.dy))}};
})(typeof window!=='undefined'?window:globalThis);
