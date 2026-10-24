/* Paredes das DGs no estilo de interior (2026-10-24, pedido do usuário a partir da imagem de uma taverna em pixel art):
   face da parede com 32 px de altura (o herói tem ~26: a parede fica um pouco mais alta que ele), viga de madeira em cima,
   parede no meio e rodapé escuro embaixo; em volta, uma moldura grossa (a borda, com contorno e brilho feitos em
   js/chao.js dgCamada). Estilos:
   - floresta: pedras claras com musgo e hera, viga de tora e grama no pé (padrão das DGs de floresta);
   - cripta: reboco claro com pedras à mostra, nichos com caveiras e ossos cruzados (parte dos esqueletos).
   Escada de madeira subindo para dentro da parede (decoração 'escada').
   Tudo 1:1 e no formato de pixel art do jogo ({w,h,palette,pixels}, até 64 px), editável na Engine. */
(function(root){
 const hash=(x,y)=>{let h=(x*374761393+y*668265263)|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296};
 // grade de pixels com paleta por nome; x dá a volta (emenda dos lados)
 function grade(w,h,cores){
  const nomes=Object.keys(cores),idx=Object.fromEntries(nomes.map((n,i)=>[n,i])),px=new Array(w*h).fill(0);
  const g={w,h,
   p(x,y,c){x=((Math.round(x)%w)+w)%w;y=Math.round(y);if(y>=0&&y<h)px[y*w+x]=idx[c]},
   r(x,y,ww,hh,c){for(let j=0;j<hh;j++)for(let i=0;i<ww;i++)g.p(x+i,y+j,c)},
   em(x,y){x=((x%w)+w)%w;return nomes[px[y*w+x]]},
   data(){return{w,h,q:1,palette:nomes.map(n=>cores[n]),pixels:px.map(c=>c.toString(36)).join('')}}};
  return g;
 }
 // pedras em fiadas (alturas alt, juntas desencontradas), com luz em cima à esquerda
 function pedras(g,y0,y1,alt,c,semente){
  for(let y=y0,k=0;y<y1;y+=alt,k++){
   const x0=Math.floor(hash(k,semente)*9);let x=x0;
   while(x<x0+g.w){ // uma volta inteira (x dá a volta na grade)
    let sw=7+Math.floor(hash(x+k*31,semente+1)*6);if(x0+g.w-x<sw+4)sw=x0+g.w-x; // a última fecha a volta sem cobrir a primeira
    const base=hash(x,k+semente)<.22?c.pedraE:c.pedra;
    const fim=Math.min(alt,y1-y);
    g.r(x,y,sw,1,c.junta);g.r(x,y,1,fim,c.junta);
    g.r(x+1,y+1,sw-1,fim-1,base);
    g.r(x+1,y+1,sw-2,1,c.pedraL);g.r(x+1,y+1,1,fim-2,c.pedraL);
    g.r(x+1,y+fim-1,sw-1,1,c.pedraE);g.r(x+sw-1,y+1,1,fim-1,c.pedraE);
    for(let j=y+2;j<y+fim-1;j++)for(let i=x+2;i<x+sw-1;i++){const n=hash(i*5+semente,j*7);if(n<.06)g.p(i,j,c.pedraE);else if(n>.95)g.p(i,j,c.pedraL)}
    x+=sw;
   }
  }
 }
 function viga(g){ // tábua de cima: sombra, brilho, meio, sombra; emendas
  g.r(0,0,g.w,1,'vigaE');g.r(0,1,g.w,1,'vigaL');g.r(0,2,g.w,1,'viga');g.r(0,3,g.w,1,'vigaE');
  for(const x of [0,21,43])g.r(x,1,1,2,'vigaE');
  for(let x=0;x<g.w;x++)if(hash(x,77)<.12)g.p(x,2,'vigaE');
 }
 const ESTILOS={
  floresta:{nome:'Floresta · Pedras com musgo',tema:'forest',
   face:{vigaE:'#4e3219',viga:'#7a5230',vigaL:'#a0703f',pedra:'#a7a585',pedraL:'#c6c3a2',pedraE:'#7f7f64',junta:'#575a43',musgo:'#5f8d35',musgoL:'#8cbb4c',folha:'#3f6e2a',terra:'#4a3522',terraE:'#2e2014'},
   borda:{base:'#8c5e34',veio:'#764c29',claro:'#a3713f',musgo:'#5f8d35'}},
  cripta:{nome:'Ossos · Cripta',tema:'ossos',
   face:{vigaE:'#3a2516',viga:'#5c3a22',vigaL:'#7c5232',reboco:'#d6cbb0',rebocoL:'#e6ddc6',rebocoE:'#b5a789',pedra:'#a99b7d',pedraL:'#bfb193',pedraE:'#867959',junta:'#6c6047',osso:'#efe8d4',ossoE:'#c4b99d',buraco:'#2a1e14',nicho:'#4a3b2c',rodape:'#4c301c',rodapeE:'#28190e',olho:'#2a1e14'},
   borda:{base:'#7a5232',veio:'#684428',claro:'#946540',musgo:'#7a5232'}},
  // DG de chamas ardentes (2026-10-24): rocha vulcânica com rachaduras de lava, viga de obsidiana e brasa no pé
  chamas:{nome:'Chamas · Rocha com lava',tema:'chamas',
   face:{vigaE:'#0e0a14',viga:'#1e1828',vigaL:'#3a2e52',pedra:'#3a2a28',pedraL:'#4e3832',pedraE:'#241a1a',junta:'#140e0e',lava:'#ff7a1a',lavaL:'#ffd84a',brasa:'#5a1a10',brasaE:'#2a0c08'},
   borda:{base:'#2a1e1e',veio:'#1e1414',claro:'#3e2e2a',musgo:'#c8401a'}},
  // mais variações (2026-10-24, pedido do usuário)
  raizes:{nome:'Floresta · Barranco com raízes',tema:'forest',semViga:true,
   face:{terraE:'#24180f',terra:'#36261a',terraL:'#483424',raizE:'#4a3424',raiz:'#7a5a3a',raizL:'#9e7c54',pedra:'#6a6a5a',pedraL:'#8a8a76',gramaE:'#1c3a1e',grama:'#2c5a2a',gramaL:'#4a8a3a'},
   borda:{base:'#3a2a1c',veio:'#2a1c12',claro:'#4e3a26',musgo:'#2c5a2a'}},
  palicada:{nome:'Floresta · Paliçada',tema:'forest',semViga:true,
   face:{casca:'#22140c',toraE:'#3a2616',tora:'#5c3c22',toraL:'#7c5632',topo:'#a07a4c',topoE:'#7a5a36',cordaE:'#6a5030',corda:'#a08050',terra:'#2e2014',terraE:'#1e140c'},
   borda:{base:'#4a3020',veio:'#36221a',claro:'#5e3e28',musgo:'#3a5a2a'}},
  ossuario:{nome:'Ossos · Ossuário',tema:'ossos',
   face:{vigaE:'#2a2830',viga:'#44424c',vigaL:'#5e5c68',fundo:'#140e10',ossoE:'#9a9078',osso:'#d4cab0',ossoL:'#f2ead6',buraco:'#1a1014',pedra:'#3a3640',pedraE:'#24222a',olho:'#1a1014'},
   borda:{base:'#3a3640',veio:'#2a2830',claro:'#4e4a56',musgo:'#3a3640'}},
  catacumba:{nome:'Ossos · Catacumba',tema:'ossos',
   face:{vigaE:'#22202a',viga:'#3a3846',vigaL:'#55526a',pedra:'#4e4a5a',pedraL:'#666278',pedraE:'#36323e',junta:'#1e1c24',cova:'#0e0a10',ossoE:'#a89e88',osso:'#e2dac4',teia:'#9a96a6',rodape:'#2a2830',rodapeE:'#16141a'},
   borda:{base:'#36323e',veio:'#26232c',claro:'#4a4656',musgo:'#36323e'}},
  obsidiana:{nome:'Chamas · Obsidiana',tema:'chamas',
   face:{vigaE:'#0a0610',viga:'#1a1426',vigaL:'#34284a',obsE:'#0e0a16',obs:'#1c1428',obsL:'#2e2244',brilho:'#5a4a7a',lava:'#ff7a1a',lavaL:'#ffd84a',brasa:'#5a1a10',brasaE:'#2a0c08'},
   borda:{base:'#1a1426',veio:'#0e0a16',claro:'#2e2244',musgo:'#c8401a'}},
  forja:{nome:'Chamas · Forja',tema:'chamas',
   face:{vigaE:'#16161c',viga:'#30303a',vigaL:'#4e4e5a',tijoloE:'#4a1e16',tijolo:'#6e2c1e',tijoloL:'#8e3e2a',junta:'#24100c',ferro:'#2a2a32',ferroL:'#55555f',fogoE:'#a0200e',fogo:'#ff7a1a',fogoL:'#ffd84a',brasa:'#5a1a10',brasaE:'#2a0c08'},
   borda:{base:'#4a1e16',veio:'#36140e',claro:'#6e2c1e',musgo:'#c8401a'}},
  pedra:{nome:'Caverna · Pedra bruta',tema:'cave',
   face:{vigaE:'#1e1814',viga:'#3a3028',vigaL:'#54483c',rochaE:'#2a241e',rocha:'#4a4038',rochaL:'#6a5e52',rochaLL:'#86786a',fenda:'#16120e',cascalho:'#5a5046',chao:'#221c16'},
   borda:{base:'#3a3028',veio:'#2a221c',claro:'#4e4238',musgo:'#3a3028'}},
  tijolos:{nome:'Subterrâneo · Tijolos com cano',tema:'underground',
   face:{vigaE:'#10222a',viga:'#1e3a46',vigaL:'#2e5664',tijoloE:'#1a3038',tijolo:'#2a4652',tijoloL:'#3a5e6c',junta:'#0e1a20',cano:'#4a4a52',canoL:'#7a7a86',canoE:'#2a2a30',limo:'#4a8a3a',limoL:'#7ac04e',agua:'#0e1a1e'},
   borda:{base:'#1e3a46',veio:'#10222a',claro:'#2e5664',musgo:'#4a8a3a'}}
 };
 // desenho do corpo de cada estilo novo (a viga, quando há, é desenhada por cima no fim)
 const DESENHO={
  raizes(g){
   for(let y=0;y<32;y++)for(let x=0;x<64;x++){const n=hash(x*3,y*7);g.p(x,y,n<.2?'terraE':n>.85?'terraL':'terra')}
   for(let k=0;k<7;k++){const x0=4+k*9+Math.floor(hash(k,1)*4),y0=2+Math.floor(hash(k,2)*6);g.r(x0,y0,3,2,'pedra');g.p(x0,y0,'pedraL')} // pedrinhas
   for(const rx of [6,22,37,51,60]){let x=rx;for(let y=3;y<29;y++){g.p(x,y,'raiz');g.p(x-1,y,'raizL');g.p(x+1,y,'raizE');if(y%6===0){const d=hash(rx,y)<.5?-1:1;for(let s=1;s<4;s++)g.p(x+d*s,y+s,'raiz')}x+=hash(rx,y*3)<.3?1:hash(rx,y*5)<.3?-1:0}}
   g.r(0,0,64,2,'gramaE');for(let x=0;x<64;x++){g.p(x,1,'grama');const l=1+Math.floor(hash(x,9)*4);for(let y=2;y<2+l;y++)g.p(x,y,y===1+l?'gramaE':'grama');if(hash(x,10)<.3)g.p(x,0,'gramaL')}
   g.r(0,29,64,3,'terraE');for(let x=0;x<64;x++)if(hash(x,11)<.25){g.p(x,28,'grama');g.p(x,27,'gramaL')}
  },
  palicada(g){
   for(let x0=0;x0<64;x0+=8){for(let y=0;y<29;y++){g.r(x0,y,1,1,'casca');g.p(x0+1,y,'toraL');g.r(x0+2,y,4,1,'tora');g.p(x0+6,y,'toraE');g.p(x0+7,y,'casca')}
    for(let y=4;y<28;y+=5)g.p(x0+3+(y%3),y,'casca'); // nós e rachaduras da casca
    g.r(x0+1,0,6,1,'topo');g.r(x0+2,1,4,1,'topoE')}
   for(const y of [9,21]){g.r(0,y,64,2,'corda');g.r(0,y+1,64,1,'cordaE');for(let x=4;x<64;x+=8)g.r(x,y-1,1,4,'cordaE')}
   g.r(0,29,64,2,'terra');g.r(0,31,64,1,'terraE');
  },
  ossuario(g){
   g.r(0,4,64,24,'fundo');
   for(let fila=0;fila<3;fila++){const y=5+fila*8,off=fila%2?4:0;
    for(let x=off;x<64+off;x+=8){g.r(x+1,y,6,5,'osso');g.r(x+1,y,6,1,'ossoL');g.r(x+6,y+1,1,4,'ossoE');g.r(x+2,y+5,4,1,'ossoE');g.p(x+2,y+2,'olho');g.p(x+5,y+2,'olho');g.p(x+3,y+4,'buraco');g.p(x+4,y+3,'ossoE')}
    g.r(0,y+6,64,1,'ossoE');g.r(0,y+7,64,1,'fundo');for(let x=fila*3;x<64;x+=11){g.r(x,y+6,6,1,'osso');g.p(x,y+6,'ossoL');g.p(x+5,y+6,'ossoL')}} // fêmures entre as filas
   g.r(0,28,64,1,'pedraE');g.r(0,29,64,2,'pedra');g.r(0,31,64,1,'pedraE');
  },
  catacumba(g){
   pedras(g,4,28,6,{pedra:'pedra',pedraL:'pedraL',pedraE:'pedraE',junta:'junta'},11);
   for(const [nx,ny] of [[6,9],[38,17]]){g.r(nx,ny,20,7,'cova');g.r(nx,ny,20,1,'junta');g.r(nx,ny+7,20,1,'pedraL');
    g.r(nx+5,ny+4,12,1,'osso');g.r(nx+5,ny+5,12,1,'ossoE');for(let x=nx+7;x<nx+15;x+=2)g.p(x,ny+3,'osso'); // esqueleto deitado (costelas)
    g.r(nx+2,ny+3,3,3,'osso');g.p(nx+3,ny+4,'cova');g.r(nx+17,ny+4,2,2,'ossoE')}
   for(const [x,y,d] of [[0,4,1],[63,4,-1],[30,4,1]])for(let s=0;s<4;s++){g.p(x+d*s,y+s,'teia');g.p(x+d*s,y,'teia');g.p(x,y+s,'teia')}
   g.r(0,28,64,1,'rodapeE');g.r(0,29,64,2,'rodape');g.r(0,31,64,1,'rodapeE');
  },
  obsidiana(g){
   for(let x0=0;x0<64;x0+=16){for(let y=4;y<28;y++)for(let x=x0;x<x0+16;x++){const t=(x-x0)/16;g.p(x,y,t<.2?'obsL':t>.8?'obsE':'obs')}
    for(let s=0;s<10;s++)g.p(x0+3+s,6+s*2,'brilho'); // reflexo diagonal
    g.r(x0,4,1,24,'lava');
    if(x0%32===0){const cx=x0+8,cy=15;for(const [dx,dy] of [[0,-4],[0,-3],[0,-2],[0,-1],[0,0],[0,1],[0,2],[-2,-2],[2,-2],[-1,2],[1,2],[-2,3],[2,3]])g.p(cx+dx,cy+dy,dy===0?'lavaL':'lava')}} // runa
   g.r(0,28,64,1,'lava');g.r(0,29,64,2,'brasa');g.r(0,31,64,1,'brasaE');
  },
  forja(g){
   for(let y=4,f=0;y<28;y+=4,f++)for(let x=(f%2)*4;x<64+4;x+=8){g.r(x,y,8,4,'junta');g.r(x+1,y+1,6,2,'tijolo');g.r(x+1,y+1,6,1,'tijoloL');g.r(x+1,y+2,6,1,hash(x,y)<.3?'tijoloE':'tijolo')}
   for(const gx of [10,42]){g.r(gx,9,14,13,'ferro');g.r(gx+1,10,12,11,'fogoE');g.r(gx+2,14,10,6,'fogo');g.r(gx+4,16,6,3,'fogoL');for(let x=gx+1;x<gx+13;x+=3)g.r(x,10,1,11,'ferro');g.r(gx,9,14,1,'ferroL')} // grades com fogo atrás
   g.r(0,28,64,1,'fogo');g.r(0,29,64,2,'brasa');g.r(0,31,64,1,'brasaE');
  },
  pedra(g){
   g.r(0,4,64,24,'fenda');
   const blocos=[[0,4,14,9],[14,4,11,7],[25,4,16,10],[41,4,10,8],[51,4,13,9],[0,13,9,8],[9,11,13,10],[22,14,12,8],[34,12,14,9],[48,13,16,8],[0,21,12,7],[12,21,15,7],[27,22,10,6],[37,21,14,7],[51,21,13,7]];
   for(const [x,y,w,h] of blocos){const cx=x+w/2,cy=y+h/2;for(let j=y+1;j<y+h;j++)for(let i=x+1;i<x+w;i++){const nx=(i-cx)/(w/2),ny=(j-cy)/(h/2);if(nx*nx+ny*ny>1.15)continue;const l=.55-nx*.3-ny*.45+(hash(i,j)-.5)*.2;g.p(i,j,l>.85?'rochaLL':l>.6?'rochaL':l>.3?'rocha':'rochaE')}}
   g.r(0,28,64,4,'chao');for(let x=0;x<64;x++)if(hash(x,12)<.35)g.p(x,28+Math.floor(hash(x,13)*3),'cascalho');
  },
  tijolos(g){
   for(let y=4,f=0;y<28;y+=4,f++)for(let x=(f%2)*5;x<64+5;x+=10){g.r(x,y,10,4,'junta');g.r(x+1,y+1,8,2,'tijolo');g.r(x+1,y+1,8,1,'tijoloL');if(hash(x,y)<.25)g.r(x+1,y+2,8,1,'tijoloE')}
   g.r(0,11,64,4,'cano');g.r(0,11,64,1,'canoL');g.r(0,14,64,1,'canoE');for(const x of [8,40]){g.r(x,10,3,6,'canoE');g.r(x,10,3,1,'canoL')} // cano com braçadeiras
   for(const lx of [20,52]){for(let y=15;y<15+5+Math.floor(hash(lx,1)*6);y++)g.p(lx,y,'limo');g.p(lx-1,15,'limoL');g.p(lx+1,16,'limo')} // limo escorrendo
   g.r(0,28,64,1,'junta');g.r(0,29,64,3,'agua');for(let x=0;x<64;x++)if(hash(x,14)<.2)g.p(x,29,'limo');
  }
 };
 const cache={};
 /* parede animada (2026-10-24): troca de cores da paleta em 4 quadros, no formato da linha do tempo do editor de sprites
    (anim = {idle: [quadros], durations: {idle}}). Chamas: a lava pulsa. Cripta: os olhos das caveiras acendem de vez em quando. */
 // cores (pelo nome na paleta do estilo) que mudam em cada um dos 4 quadros
 const LAVA_PULSO={lava:['#c8401a','#ff7a1a','#ffa83a','#ff7a1a'],lavaL:['#ff9a2a','#ffd84a','#fff4c0','#ffd84a'],brasa:['#4a140c','#5a1a10','#7a2412','#5a1a10']};
 const OLHOS={olho:['#2a1e14','#c8241a','#ff4a2a','#2a1e14']};
 const PULSO={
  chamas:{ciclo:1.2,cores:LAVA_PULSO},
  obsidiana:{ciclo:1.6,cores:LAVA_PULSO},
  forja:{ciclo:.8,cores:{fogo:['#ff7a1a','#ffa83a','#ff7a1a','#e8561e'],fogoL:['#ffd84a','#fff4c0','#ffe27a','#ffd84a'],fogoE:['#a0200e','#c8361a','#a0200e','#8a1a0a'],brasa:['#5a1a10','#7a2412','#5a1a10','#4a140c']}},
  cripta:{ciclo:2.4,cores:OLHOS},
  ossuario:{ciclo:3,cores:{olho:['#1a1014','#1a1014','#c8241a','#ff4a2a']}}
 };
 function animar(data,estilo){
  const P=PULSO[estilo];if(!P)return data;
  const nomes=Object.keys(ESTILOS[estilo].face); // a paleta da grade segue a ordem das cores do estilo
  const quadros=[0,1,2,3].map(f=>({...data,palette:data.palette.map((c,i)=>{const v=P.cores[nomes[i]];return v?v[f]:c})}));
  return {...data,anim:{idle:quadros,durations:{idle:P.ciclo}}};
 }
 function face(estilo){
  if(!ESTILOS[estilo])estilo='floresta';
  const k='f'+estilo;if(cache[k])return cache[k];
  const E=ESTILOS[estilo],c=E.face,g=grade(64,32,c);
  if(DESENHO[estilo])DESENHO[estilo](g);
  else if(estilo==='cripta'){
   g.r(0,4,64,24,'reboco');
   for(let y=4;y<28;y++)for(let x=0;x<64;x++){const n=hash(x*3+1,y*11);if(n<.05)g.p(x,y,'rebocoE');else if(n>.96)g.p(x,y,'rebocoL')}
   // pedras à mostra onde o reboco caiu
   for(const [x0,y0,w0,h0] of [[18,5,14,8],[50,16,12,10],[2,20,10,7]]){
    for(let y=y0;y<y0+h0;y+=4)for(let x=x0+((y-y0)/4%2)*3;x<x0+w0;x+=6){g.r(x,y,6,1,'junta');g.r(x,y,1,4,'junta');g.r(x+1,y+1,5,3,'pedra');g.r(x+1,y+1,4,1,'pedraL');g.r(x+5,y+1,1,3,'pedraE')}}
   // rachaduras
   for(const [x,y,dx] of [[36,6,1],[8,8,-1],[58,6,1]])for(let s=0;s<6;s++)g.p(x+Math.round(s*dx*.5),y+s,'rebocoE');
   // nichos com caveira
   for(const nx of [10,42]){
    g.r(nx-4,9,9,10,'buraco');g.r(nx-3,8,7,1,'buraco');g.r(nx-4,19,9,1,'nicho');g.r(nx-5,9,1,11,'rebocoE');g.r(nx+5,9,1,11,'rebocoL');
    g.r(nx-2,12,5,4,'osso');g.r(nx-1,11,3,1,'osso');g.r(nx-2,15,5,1,'ossoE');g.p(nx-1,13,'olho');g.p(nx+1,13,'olho');g.p(nx,14,'ossoE');
    g.r(nx-1,16,3,1,'osso');g.p(nx-1,17,'ossoE');g.p(nx+1,17,'ossoE');
   }
   // ossos cruzados
   for(let s=0;s<7;s++){g.p(24+s,16+s,'rebocoE');g.p(30-s,16+s,'rebocoE')}
   for(let s=0;s<7;s++){g.p(24+s,15+s,'osso');g.p(30-s,15+s,'osso')}
   for(const [x,y] of [[23,14],[24,14],[31,14],[30,14],[23,22],[24,22],[30,22],[31,22]])g.p(x,y,'ossoE');
   g.r(0,28,64,1,'rodapeE');g.r(0,29,64,2,'rodape');g.r(0,31,64,1,'rodapeE');
   for(const x of [0,32])g.r(x,29,1,2,'rodapeE');
  }else if(estilo==='chamas'){
   pedras(g,4,28,6,{pedra:'pedra',pedraL:'pedraL',pedraE:'pedraE',junta:'junta'},7);
   // lava escorrendo pelas juntas (algumas acendem) e veios descendo
   for(let y=4;y<28;y++)for(let x=0;x<64;x++)if(g.em(x,y)==='junta'&&hash(x*5,y*9)<.06)g.p(x,y,'lava');
   for(const vx of [14,45]){let x=vx;for(let y=5;y<27;y++){g.p(x,y,'lava');if(y%5===0)g.p(x,y,'lavaL');x+=hash(vx,y)<.3?1:hash(vx,y+50)<.3?-1:0}}
   g.r(0,28,64,1,'lava');g.r(0,29,64,2,'brasa');g.r(0,31,64,1,'brasaE');
   for(let x=0;x<64;x++)if(hash(x,13)<.25)g.p(x,29,'lava');
  }else{
   pedras(g,4,28,6,{pedra:'pedra',pedraL:'pedraL',pedraE:'pedraE',junta:'junta'},3);
   // musgo escorrendo de cima e em tufos sobre as pedras
   for(let x=0;x<64;x++){const n=hash(x,5);if(n<.4){const l=1+Math.floor(hash(x,6)*4);for(let j=0;j<l;j++)g.p(x,4+j,j===0?'musgoL':'musgo')}}
   for(let y=5;y<27;y++)for(let x=0;x<64;x++)if(g.em(x,y)==='junta'&&hash(x*13,y*3)<.1)g.p(x,y-1,'musgo');
   // hera pendurada
   for(const hx of [13,37,55]){const l=8+Math.floor(hash(hx,8)*12);for(let j=3;j<3+l;j++){g.p(hx+(j%5===0?1:0),j,'folha');if(j%3===0){g.p(hx-1,j,'musgo');g.p(hx+1,j+1,'musgoL')}}}
   // pé: rodapé de terra e tufos de grama
   g.r(0,28,64,1,'junta');g.r(0,29,64,2,'terra');g.r(0,31,64,1,'terraE');
   for(let x=0;x<64;x++)if(hash(x,9)<.3){g.p(x,27,'folha');g.p(x,28,'musgo');if(hash(x,10)<.4)g.p(x,26,'musgoL')}
  }
  if(!E.semViga)viga(g);
  return cache[k]=animar(g.data(),estilo);
 }
 function borda(estilo){
  if(!ESTILOS[estilo])estilo='floresta';
  const k='b'+estilo;if(cache[k])return cache[k];
  const c=ESTILOS[estilo].borda,g=grade(16,16,c);
  g.r(0,0,16,16,'base');
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){const n=hash(x*7+(y>>1)*3,y*5);if(n<.16)g.p(x,y,'veio');else if(n>.9)g.p(x,y,'claro');else if(n>.86)g.p(x,y,'musgo')} // musgo, brasa ou limo, conforme o estilo
  for(const y of [5,12])for(let x=0;x<16;x++)if(hash(x,y)<.7)g.p(x,y,'veio');
  return cache[k]=g.data();
 }
 // escada de madeira subindo para dentro da parede: degraus mais escuros lá em cima
 function escada(){
  if(cache.escada)return cache.escada;
  const W=28,H=44,c={vazio:'',fundo:'#140d07',poste:'#3a2414',posteL:'#5e3c20'};
  const tons=[['#c48c52','#9c6a3a','#7a5030'],['#ae7a46','#8a5c32','#6a4428'],['#966840','#764e2c','#5a3a22'],['#7a5434','#5e4026','#4a301c'],['#5c3e26','#48301c','#3a2616']];
  tons.forEach((t,i)=>{c['l'+i]=t[0];c['m'+i]=t[1];c['e'+i]=t[2]});
  const g=grade(W,H,c);
  g.r(0,0,W,H,'fundo');
  const degraus=8,alt=5;
  for(let s=0;s<degraus;s++){
   const y=H-(s+1)*alt,t=Math.min(4,Math.floor(s*5/degraus)),inset=Math.floor(s/3);
   g.r(3+inset,y,W-6-2*inset,1,'l'+t);g.r(3+inset,y+1,W-6-2*inset,2,'m'+t);g.r(3+inset,y+3,W-6-2*inset,1,'e'+t);
   for(const x of [9,18])g.p(x+inset,y+1,'e'+t);
  }
  g.r(0,0,3,H,'poste');g.r(W-3,0,3,H,'poste');g.r(1,0,1,H,'posteL');g.r(W-2,0,1,H,'posteL');
  return cache.escada=g.data();
 }
 // assoalho de tábuas corridas (como o chão da imagem), claro, 32×32 com emendas desencontradas e pregos
 function assoalho(){
  if(cache.assoalho)return cache.assoalho;
  const g=grade(32,32,{tabua:'#a8764a',luz:'#bd8a58',veio:'#93643c',fresta:'#5a381e',sombra:'#7e5432',prego:'#3e2614'});
  g.r(0,0,32,32,'tabua');
  for(let t=0;t<4;t++){const y=t*8,emenda=(t*13+5)%32;
   g.r(0,y,32,1,'fresta');g.r(0,y+1,32,1,'luz');g.r(0,y+7,32,1,'sombra');
   g.r(emenda,y,1,8,'fresta');g.p(emenda+1,y+3,'prego');g.p(emenda-2,y+3,'prego');
   for(let x=0;x<32;x++)for(let j=2;j<7;j++){const n=hash(x*3+t*17,j*5+t);if(n<.1)g.p(x,y+j,'veio');else if(n>.95)g.p(x,y+j,'luz')}
   for(let x=0;x<32;x++)if(hash(x,t*9)<.35)g.p(x,y+3+(x%3===0?1:0),'veio')}
  return cache.assoalho=g.data();
 }
 /* config.estilosParede =[{chao: idDoChao, estilo: 'cripta'|'floresta', wall?, borda?}] -> {idDoChao: {parede, borda}} para
    CHAO.dgCamada; arte(data) converte o desenho em canvas (desenho próprio vale mais que o do estilo) */
 function estilosDe(cfg,arte){
  const out={};
  const comAnim=d=>{const c=arte(d);return root.CHAO&&root.CHAO.comAnim?root.CHAO.comAnim(c,d,arte):c}; // parede animada leva os quadros
  for(const e of (cfg&&cfg.estilosParede)||[])if(e&&e.chao)out[e.chao]={parede:comAnim(e.wall||face(e.estilo||'cripta')),borda:arte(e.borda||borda(e.estilo||'cripta'))};
  return out;
 }
 root.PAREDES_DG={estilos:Object.fromEntries(Object.entries(ESTILOS).map(([k,v])=>[k,v.nome])),temaDe:Object.fromEntries(Object.entries(ESTILOS).map(([k,v])=>[k,v.tema])),face,borda,escada,estilosDe,
  // chão embutido (aparece nas texturas de chão de js/chao.js, no Pincel e em Mapa e DG › Piso)
  get texturas(){return{pd_assoalho:{name:'Assoalho de madeira',tema:'dg',liquido:false,data:assoalho()}}}};
})(typeof window!=='undefined'?window:globalThis);
