/* ---------- mapa ----------
   Ilha flutuante de 96×96 ladrilhos (js/config.js N): em volta é o vazio (espaço, desenhado pelo render.js),
   com o paredão de pedra embaixo da borda e a cachoeira onde o rio cai no vazio.
   V(i,j) mede a distância até a borda na mesma escala da ilha antiga: 28,6 = borda (vazio além), 26,2 = começo da areia.
   Projetos da ilha antiga (64×64) são deslocados para o novo centro em js/chao.js (CHAO.migrarIlha). */
const ILHA_MIGROU=!!(window.CHAO&&typeof PROJETO!='undefined'&&PROJETO.mundo&&CHAO.migrarIlha(PROJETO.mundo));
const ILHA_C=N/2;
const V=(i,j)=>{const a=Math.abs(i-ILHA_C),b=Math.abs(j-ILHA_C);return Math.max(a,b)*.62+Math.hypot(a,b)*.38+hash(i,j)*1.6-(ILHA_C-32)};
const smoothT=t=>t*t*(3-2*t),vnoise=(x,y,s)=>{const a=x/s,b=y/s,i=Math.floor(a),j=Math.floor(b),u=smoothT(a-i),v=smoothT(b-j);
 return (hash(i,j)*(1-u)+hash(i+1,j)*u)*(1-v)+(hash(i,j+1)*(1-u)+hash(i+1,j+1)*u)*v};
const CAMP_SAFE_HALF_SIZE=132;
const campDistance=(x,y)=>Math.max(Math.abs(x-CX),Math.abs(y-CY));
// a taverna (js/taverna.js) inteira é área segura, como o acampamento
const insideCamp=(x,y,margin=0)=>!!window.inTaverna||!window.inDungeon&&!window.inTutorial&&campDistance(x,y)<CAMP_SAFE_HALF_SIZE+margin;
const CAMP_WALL={built:false,gateOpen:true,halfGate:32,thickness:10};
const campGate={x:CX,y:CY+CAMP_SAFE_HALF_SIZE};
const campWallPosts=[];
for(let side=0;side<4;side++)for(let i=0;i<24;i++){
 const r=CAMP_SAFE_HALF_SIZE,d=-r+i*r/12;
 const x=CX+(side==0?d:side==1?r:side==2?-d:-r),y=CY+(side==0?-r:side==1?d:side==2?r:-d);
 if(side==2&&Math.abs(x-CX)<CAMP_WALL.halfGate+5)continue;
 campWallPosts.push({x,y})
}
function campGateOccupied(x,y,margin=0){return Math.abs(x-campGate.x)<CAMP_WALL.halfGate+margin&&Math.abs(y-campGate.y)<CAMP_WALL.thickness+margin}
function campWallBlocks(x,y){
 if(window.inDungeon||window.inTaverna||window.inTutorial||!CAMP_WALL.built)return false;
 if(y>CY&&Math.abs(x-CX)<CAMP_WALL.halfGate)return !CAMP_WALL.gateOpen&&campGateOccupied(x,y);
 return Math.abs(campDistance(x,y)-CAMP_SAFE_HALF_SIZE)<CAMP_WALL.thickness
}
function campWallSegmentClear(from,to){
 if(window.inDungeon||window.inTaverna||window.inTutorial||!CAMP_WALL.built)return true;
 const steps=Math.ceil(Math.hypot(to.x-from.x,to.y-from.y)/2);
 for(let i=1;i<=steps;i++){const f=i/steps;if(campWallBlocks(from.x+(to.x-from.x)*f,from.y+(to.y-from.y)*f))return false}
 return true
}
/* ---------- água (refeita em 2026-10-23: ilha mais viva) ----------
   O rio nasce no Lago Grande ao norte (o único lago), desce a leste do acampamento (duas pontes) e cai no vazio no sul.
   A margem do lago é irregular (o raio muda com o ângulo) e ele é um pouco mais largo que alto (perspectiva de cima). */
// 2026-10-29 (imagem do usuário, área azul): lago maior (raio 74 → 120) e um pouco mais ao norte; o rio nasce dentro dele.
// As pontes ficam onde as estradas novas cruzam o rio.
const RIO_Y0=CY-470,RBR=[CY-196,CY+185];
const riverX=y=>CX+380+34*Math.sin(y/70)+14*Math.sin(y/23);
const riverW=y=>y<RIO_Y0?0:9+5*Math.min(1,(y-RIO_Y0)/700)+2*Math.sin(y/50);
const LAGO={x:Math.round(riverX(RIO_Y0)),y:CY-492,r:120,nome:'Lago Grande',s:3};
const LAGOS=[LAGO];
window.LAGOS=LAGOS;
const lagoR=(L,a)=>L.r*(1+.13*Math.sin(3*a+L.s)+.08*Math.sin(5*a+L.s*2)+.04*Math.sin(9*a+L.s*3));
// [distância ao centro, raio da margem naquela direção] (o y conta 1,25× para o lago ficar mais largo)
const lagoDist=(L,x,y)=>{const dx=x-L.x,dy=(y-L.y)*1.25;return [Math.hypot(dx,dy),lagoR(L,Math.atan2(dy,dx))]};
// [distância ao centro da água, meia largura] do rio ou do lago mais perto
const rioDist=(x,y)=>{let rd=Infinity,rw=1;if(y>=RIO_Y0){rd=Math.abs(x-riverX(y));rw=riverW(y)}
 for(const L of LAGOS){if(Math.abs(x-L.x)>L.r*1.4+30||Math.abs(y-L.y)>L.r*1.2+30)continue;const [ld,lr]=lagoDist(L,x,y);if(ld-lr<rd-rw){rd=ld;rw=lr}}return [rd,rw]};
const inRiver=(x,y,m=0)=>{const [rd,rw]=rioDist(x,y);return rd<rw+m};
const onBridge=(x,y)=>RBR.some(b=>Math.abs(y-b)<11&&Math.abs(x-riverX(b))<riverW(b)+14);
/* caminhos de terra (refeitos em 2026-10-29 pelas linhas vermelhas da imagem do usuário): uma estrada em anel em volta do
   acampamento (com a entrada do portão sul) e, saindo dela, ao norte até o lago, a leste pela ponte de cima até o outro lado
   do lago, ao sul até a cachoeira, a sudeste pela ponte de baixo até a borda, e a oeste e a sudoeste até a borda */
// curva suave por dentro dos pontos (Catmull-Rom), em trechos curtos
const suaveCaminho=pts=>{const out=[];for(let i=0;i<pts.length-1;i++){const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];
  for(let k=0;k<8;k++){const t=k/8,t2=t*t,t3=t2*t,f=(a,b,c,d)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);out.push([f(p0[0],p1[0],p2[0],p3[0]),f(p0[1],p1[1],p2[1],p3[1])])}}
  out.push(pts[pts.length-1]);return out};
const segsCaminho=ls=>ls.flatMap(l=>l.slice(1).map((q,i)=>[l[i],q]));
/* distância até a linha mais perto de um conjunto de trechos, com índice em grade de 32 px (o terreno pergunta isto em
   cada pixel da ilha; antes cada pergunta passava por todos os trechos). Além de m px a resposta é Infinity. */
const indiceSegs=(segs,m)=>{const G=Math.ceil(W/32),cel=Array.from({length:G*G},()=>[]);
 segs.forEach((s,k)=>{const [a,b]=s,i0=Math.max(0,Math.floor((Math.min(a[0],b[0])-m)/32)),i1=Math.min(G-1,Math.floor((Math.max(a[0],b[0])+m)/32)),j0=Math.max(0,Math.floor((Math.min(a[1],b[1])-m)/32)),j1=Math.min(G-1,Math.floor((Math.max(a[1],b[1])+m)/32));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)cel[j*G+i].push(s)});return{G,cel,m}};
const distIndice=(I,x,y)=>{const i=Math.floor(x/32),j=Math.floor(y/32);if(i<0||j<0||i>=I.G||j>=I.G)return Infinity;let best=Infinity;
 for(const [a,b] of I.cel[j*I.G+i]){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1))),d=Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);if(d<best)best=d}
 return best<=I.m?best:Infinity};
const ANEL_R=176; // meia largura do anel (o muro do acampamento fica em 132)
/* as 4 estradas que saem da ilha (oeste, sudoeste, sul e sudeste) vão até a beira do vazio, atravessando a areia */
const CAMINHOS=(()=>{const [B1,B2]=RBR,b1=riverX(B1),b2=riverX(B2),w1=riverW(B1)+18,w2=riverW(B2)+18,R=ANEL_R;
 // anel: quadrado de cantos arredondados, fechado (começa e termina no meio do lado de cima)
 const anel=[[0,-R],[R-55,-R],[R-16,-R+16],[R,-R+55],[R,0],[R,R-55],[R-16,R-16],[R-55,R],[0,R],[-R+55,R],[-R+16,R-16],[-R,R-55],[-R,0],[-R,-R+55],[-R+16,-R+16],[-R+55,-R],[0,-R]].map(([x,y])=>[CX+x,CY+y]);
 return [anel,
  [[CX-10,CY-R],[CX-24,CY-254],[CX-27,CY-329],[CX-5,CY-380],[CX+66,CY-413],[CX+166,CY-425],[CX+234,CY-439]],                       // norte: margem oeste do lago
  [[CX+R,CY-35],[CX+208,CY-66],[CX+230,CY-128],[CX+259,CY-178],[b1-60,B1+2],[b1-w1,B1]],                                           // leste: até a ponte de cima
  [[b1+w1,B1],[CX+519,CY-207],[CX+556,CY-250],[CX+570,CY-313],[CX+553,CY-371],[CX+516,CY-417],[CX+477,CY-439]],                    // depois da ponte: margem leste do lago
  [[CX,CY+130],[CX,CY+R],[CX-8,CY+208],[CX-32,CY+259],[CX-49,CY+318],[CX-35,CY+385],[CX-2,CY+452],[CX+44,CY+519],[CX+116,CY+561],[CX+234,CY+590],[CX+314,CY+624],[CX+338,CY+674]], // saída sul: cachoeira
  [[CX-21,CY+237],[CX+49,CY+222],[CX+166,CY+208],[CX+259,CY+192],[b2-w2,B2]],                                                    // sudeste: até a ponte de baixo
  [[b2+w2,B2],[CX+506,CY+230],[CX+546,CY+284],[CX+578,CY+343],[CX+607,CY+388],[CX+642,CY+422],[CX+655,CY+432]],                    // saída sudeste
  [[CX-690,CY-210],[CX-647,CY-203],[CX-590,CY-193],[CX-523,CY-183],[CX-496,CY-150],[CX-486,CY-103],[CX-459,CY-55],[CX-413,CY-18],[CX-329,CY-8],[CX-220,CY-2],[CX-R,CY]], // saída oeste
  [[CX-215,CY-2],[CX-271,CY+24],[CX-304,CY+57],[CX-334,CY+108],[CX-358,CY+183],[CX-378,CY+284],[CX-395,CY+385],[CX-422,CY+486],[CX-444,CY+570],[CX-469,CY+630],[CX-475,CY+648]]  // saída sudoeste
 ].map(suaveCaminho)})();const CAMINHO_SEGS=segsCaminho(CAMINHOS),CAMINHO_IDX=indiceSegs(CAMINHO_SEGS,40);
function caminhoDist(x,y){return distIndice(CAMINHO_IDX,x,y)}
/* ---------- floresta (2026-10-29, pedido do usuário: a ilha como uma floresta de verdade) ----------
   Mata fechada em quase tudo; clareiras abertas onde os portais soltam os monstros; de cada clareira sai uma trilha de terra
   até a estrada mais perto (os monstros andam muito por ali). Na clareira e na trilha a grama está gasta: pisada,
   amarelada e com terra aparecendo, mais no meio (desgasteIlha, usado pelo terreno e pelos tufos da ilha viva). */
const CLAREIRAS=[
 {x:CX-440,y:CY-430,r:95},{x:CX-300,y:CY-250,r:80},{x:CX+60,y:CY-560,r:75},{x:CX-560,y:CY+150,r:85},
 {x:CX-210,y:CY+400,r:95},{x:CX+190,y:CY+390,r:80},{x:CX+540,y:CY-10,r:80},{x:CX+500,y:CY+560,r:70},
 // mais arenas de spawn (2026-10-29, pedido do usuário) nos trechos grandes de mata
 {x:CX-218,y:CY-551,r:75},{x:CX-601,y:CY-68,r:65},{x:CX-520,y:CY+330,r:70},{x:CX-218,y:CY+599,r:70},{x:CX+165,y:CY-301,r:75},{x:CX+499,y:CY+399,r:60},
 // +5 pela mata e +1 ao lado do lago, a leste dele (2026-10-29, pedido do usuário)
 {x:CX-335,y:CY-585,r:55},{x:CX-68,y:CY+532,r:60},{x:CX+265,y:CY+299,r:55},{x:CX-335,y:CY+499,r:55},{x:CX+590,y:CY+130,r:55},{x:CX+530,y:CY-530,r:55}
].map((c,i)=>({...c,id:'clareira'+(i+1),s:i*1.7+.4}));
window.CLAREIRAS=CLAREIRAS;
// borda irregular: o raio muda com o ângulo
const clareiraR=(c,x,y)=>{const a=Math.atan2(y-c.y,x-c.x);return c.r*(1+.12*Math.sin(3*a+c.s)+.07*Math.sin(5*a+c.s*2))};
// 0 no centro, 1 na borda da clareira mais perto (maior que 1 fora)
const clareiraFator=(x,y)=>{let f=Infinity;for(const c of CLAREIRAS){if(Math.abs(x-c.x)>c.r*2||Math.abs(y-c.y)>c.r*2)continue;const d=Math.hypot(x-c.x,y-c.y)/clareiraR(c,x,y);if(d<f)f=d}return f};
const naClareira=(x,y,folga=1)=>clareiraFator(x,y)<folga;
window.naClareira=naClareira;
/* trilhas: da borda da clareira até o ponto de estrada mais perto que dá para alcançar sem cruzar água, com uma curva */
const TRILHAS=(()=>{const pts=CAMINHOS.flatMap(l=>l.filter((q,i)=>i%3==0));
 const secoAte=(a,b)=>{for(let k=1;k<20;k++){const x=a[0]+(b[0]-a[0])*k/20,y=a[1]+(b[1]-a[1])*k/20;if(inRiver(x,y,10))return false}return true};
 return CLAREIRAS.map((c,i)=>{let alvo=null,bd=Infinity;for(const q of pts){const d=Math.hypot(q[0]-c.x,q[1]-c.y);if(d<bd&&secoAte([c.x,c.y],q)){bd=d;alvo=q}}
  if(!alvo)return null;const ang=Math.atan2(alvo[1]-c.y,alvo[0]-c.x),ini=[c.x+Math.cos(ang)*c.r*.5,c.y+Math.sin(ang)*c.r*.5],
   curva=(hash(i*13+5,i*7+1)-.5)*.5*bd,meio=[(ini[0]+alvo[0])/2-Math.sin(ang)*curva,(ini[1]+alvo[1])/2+Math.cos(ang)*curva];
  return suaveCaminho([ini,meio,alvo])}).filter(Boolean)})();
const TRILHA_IDX=indiceSegs(segsCaminho(TRILHAS),40);
const trilhaDist=(x,y)=>distIndice(TRILHA_IDX,x,y);
// terra por onde os monstros gostam de andar: estrada ou trilha
const terraDist=(x,y)=>Math.min(caminhoDist(x,y),trilhaDist(x,y));
window.terraDist=terraDist;
/* desgaste da grama (0 a 1): forte no meio da clareira, some um pouco além da borda; ao longo da trilha, faixa gasta */
const desgasteIlha=(x,y)=>{const f=clareiraFator(x,y),dc=f<1.25?1-Math.max(0,Math.min(1,(f-.45)/.8)):0,td=trilhaDist(x,y),dt=td<14?(1-td/14)*.75:0;return Math.max(dc,dt)};
window.desgasteIlha=desgasteIlha;
const map=document.createElement('canvas');map.width=map.height=W;
const islandTerrainKinds=['grass','sand','void','camp','river','bridge'],islandTerrainMask=new Uint8Array(W*W);
/* biomas da grama (js/ilha-viva.js usa as mesmas regras para os tufos e as flores animadas):
   bioma < .32 campo seco (verde-amarelado), > .64 mata fechada (verde escuro), no meio o campo; flores em manchas */
const biomaIlha=(x,y)=>vnoise(x,y,170);
const floridoIlha=(x,y)=>vnoise(x+311,y-97,70);
window.biomaIlha=biomaIlha;window.floridoIlha=floridoIlha;
/* terreno: campo contínuo (interpolado) + ruído por pixel e pontilhado ordenado (Bayer) entre os tons, sem bordas retas */
(function(){const m=map.getContext('2d'),img=m.createImageData(W,W),D=img.data,vn=vnoise;
 const Vp=(x,y)=>{const a=x/T-.5,b=y/T-.5,i=Math.floor(a),j=Math.floor(b),u=a-i,v=b-j;
  return (V(i,j)*(1-u)+V(i+1,j)*u)*(1-v)+(V(i,j+1)*(1-u)+V(i+1,j+1)*u)*v};
 const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
 const C={deep:hx('#173f73'),deep2:hx('#1c5a8c'),wat:hx('#2775a8'),sh:hx('#3f97c4'),raso:hx('#62b6d2'),reflexo:hx('#a6dcec'),foam:hx('#dff2f6'),
  sand:hx('#e3cc8f'),sand2:hx('#d4b878'),molhada:hx('#a8905e'),lama:hx('#7d6a46'),
  d1:hx('#8c6c49'),d2:hx('#7f6140'),d3:hx('#9a7a55'),pisada:hx('#7d8a44'),pisada:hx('#7d8a44'),r1:hx('#6b5848'),r2:hx('#4d3f34'),r3:hx('#1d1712'),moss:hx('#3f6b34')};
 /* grama de uma cor só (2026-10-29, pedido do usuário): o mesmo verde na ilha toda; o que dá vida são fiapos de capim de 2
    pixels (um traço deitado para a direita, como o vento) no verde um tom abaixo, com a ponta às vezes um tom acima.
    Terra natural: marrom terroso que conversa com esse verde; da grama para a terra passa por grama pisada salpicada
    (pixel a pixel, sem misturar cores), a beira da terra é mais escura (úmida, com grama teimando) e o meio tem pedrinhas. */
 const GR=hx('#4b9a44'),GR_E=hx('#3c843a'),GR_C=hx('#62ad4f'),PIS=hx('#6f8a40'),TE=hx('#76603f'),TE_E=hx('#644f36'),TE_C=hx('#8b7550'),PEDRINHA=hx('#9a8a6e'),TE_S=hx('#4f3d2b');
 C.d1=TE;C.d2=TE_E;C.pisada=PIS;
 const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 /* tufinhos espaçados (2026-10-29, o usuário achou os fiapos espalhados serrilhados demais): no máximo um tufo por célula
    de 9×7 px, em 40% delas; o tufo é um "w" de 5 pixels (folha do meio mais alta, ponta clara) sobre o verde liso */
 const TUFO=[[0,0,0],[0,-1,0],[-1,0,0],[1,0,0],[0,-2,1]];
 const tufoEm=(x,y)=>{for(const [dx,dy,c] of TUFO){const ox=x-dx,oy=y-dy,cx=Math.floor(ox/9),cy=Math.floor(oy/7);if(hash(cx*5+1,cy*3+7)>.4)continue;
   if(cx*9+1+Math.floor(hash(cx,cy*11)*7)===ox&&cy*7+2+Math.floor(hash(cx*13,cy)*4)===oy)return c?GR_C:GR_E}return null};
 const gramaEm=(x,y)=>tufoEm(x,y)||GR;
 /* terra pelo quanto já entrou no caminho (q: < 0 grama, 0 a 1 beira, > 1 miolo); h = sorteio fixo do pixel */
 /* sem salpicado (2026-10-29, o usuário achou serrilhado): faixas lisas — grama pisada por fora, beira de terra úmida e o
    miolo de terra com uma pedrinha ou outra */
 const terraEm=(q,h,grama)=>{if(q<0)return q>-.42?PIS:grama;
  if(q<.38)return TE_E;
  return h>.993?PEDRINHA:h>.982?TE_C:TE};
 const qCam=(x,y,v)=>{const rec=(vn(x,y,11)-.5)*2.2,dc=Math.hypot((x-CX)/T,(y-CY)/T)+(vn(x,y,20)-.5)*2.4;let q=-9;
  if(v<28.3&&dc>=5.4){const pd=v<26.8?caminhoDist(x+(vn(x,y,40)-.5)*16,y+(vn(x+77,y,40)-.5)*16):caminhoDist(x,y),pw=9+(vn(x,y,12)-.5)*3,
    td=v<26.2?trilhaDist(x+(vn(x,y,30)-.5)*8,y+(vn(x+5,y,30)-.5)*8):Infinity,tw=4.6+(vn(x+9,y,10)-.5)*1.6;
   q=Math.max((pw-(pd+rec))/2.6,(tw-(td+rec*.6))/1.8)}
  if(dc<7.2)q=Math.max(q,(5.9-dc)*T/14+rec/4);return q};
 for(let y=0;y<W;y++)for(let x=0;x<W;x++){
  const wob=(vn(x,y,24)-.5)*2.2+(vn(x,y,9)-.5)*.8,v=Vp(x,y)+wob;
  if(v>28.6){islandTerrainMask[y*W+x]=2;continue} // vazio: fica transparente (o espaço aparece por trás)
  const dc=Math.hypot((x-CX)/T,(y-CY)/T)+(vn(x,y,20)-.5)*2.4,n=vn(x,y,14),f=vn(x,y,4),px=hash(x*3+1,y*7+2);
  let c,kind=v>26.2?1:0;
  if(v>26.2){c=mix(C.sand,C.sand2,n);if(v>28)c=mix(c,C.r1,Math.min(1,(v-28)/.6)*.7)}
  else{c=gramaEm(x,y);if(v>25)c=mix(c,C.sand,(v-25)/1.2*.6);
   /* grama gasta pelos monstros (clareiras e trilhas, desgasteIlha): em tons fixos (sem degradê), da grama pisada e
      amarelada até a terra aparecendo no meio, em manchas */
   if(v<25.8){const w=desgasteIlha(x,y);if(w>.05){const g=w*(.55+.9*(vn(x,y,9)*.65+vn(x+41,y,26)*.35))-Math.max(0,v-24.6);
    // clareira gasta: q > 0 onde a terra aparece; antes disso, grama pisada salpicada
    const q=(g-.9)/.25;if(q>-.9){const t=terraEm(q,px,c);c=t;if(q>=0)kind=3}}}}
  /* estradas (até a beira do vazio, nas 4 saídas), trilhas dos monstros e o chão batido do acampamento. Mais grossos e em
     2,5D (2026-10-29, pedido do usuário): o caminho é uma vala rasa no chão, com a luz vindo do alto à esquerda — o barranco
     de cima fica na sombra (faixa escura), o de baixo pega luz (terra clara) e a grama na beira de cima ganha um friso claro.
     qCam: quanto o pixel entrou no caminho (< 0 grama, 0 a 1 beira, > 1 miolo); comparado com 2 px acima e abaixo. */
  {const q=qCam(x,y,v);
   if(q>-1.2&&(q>=0||kind===0&&v<=25)){const qa=qCam(x,y-2,v),qb=qCam(x,y+2,v);
    if(q>=0){let t=terraEm(q,px,c);kind=3;
     if(q<1.2&&qa<q-.12)t=q<.6?TE_S:TE_E;          // barranco de cima: sombra
     else if(q<.75&&qb<q-.12)t=TE_C;                // barranco de baixo: luz
     c=t}
    else if(qb>=0&&q>-.6)c=GR_C;                     // friso de grama clara na beira de cima
    else c=terraEm(q,px,c)}}
  {const [rd,rw0]=rioDist(x,y),rw=rw0+(vn(x,y,18)-.5)*3;
   if(rd<rw+9){
    if(rd<rw){const t=1-rd/rw,lago=rw0>20;                             // t: 0 na margem, 1 no meio
     c=t<.12?mix(C.raso,C.sh,t/.12):t<.4?mix(C.sh,C.wat,(t-.12)/.28):mix(C.wat,lago?C.deep:C.deep2,Math.min(1,(t-.4)/.6));
     if(t>.2&&t<.75){const k=vn(x*.7,y*1.6,9);if(Math.abs(k-.5)<.012&&hash(x,y)>.35)c=mix(c,C.reflexo,.28)} // reflexos (ondas finas, deitadas)
     if(rd>rw-1.3)c=mix(c,C.foam,.6)}
    else if(rd<rw+1.6)c=mix(C.molhada,C.lama,px);                      // margem molhada
    else if(rd<rw+(rw0>20?6:4))c=mix(c,C.sand2,.75*(1-(rd-rw-1.6)/(rw0>20?4.4:2.4)))}
   if(rd<rw0)kind=4}
  islandTerrainMask[y*W+x]=kind;
  const o=(y*W+x)*4;D[o]=c[0];D[o+1]=c[1];D[o+2]=c[2];D[o+3]=255}
 // vazio: paredão de pedra embaixo da borda (ilha flutuante) e a cachoeira onde o rio cai
 for(let x=0;x<W;x++){let since=1e9,rio=false;
  for(let y=0;y<W;y++){const k=islandTerrainMask[y*W+x];if(k!==2){since=0;rio=k===4;continue}since++;
   const o=(y*W+x)*4;let col=null,a=0;
   if(rio&&since<=120){const t=since/120;col=mix(mix(C.foam,C.sh,Math.min(1,since/24)),C.wat,t);if(hash(x*5,y>>2)>.78)col=mix(col,C.foam,.55);a=(1-t*t)*(.7+.3*vn(x,y*.15,3))}
   else if(since<=34){const t=since/34;col=mix(mix(C.r1,C.r2,vn(x,y,6)),C.r3,t);if(since<=2)col=mix(col,C.moss,.55);else if(hash(x,y)>.93)col=mix(col,C.r1,.6);a=since<22?1:(hash(x*3,y*7)>(since-22)/12?1:0)}
   if(col){D[o]=col[0];D[o+1]=col[1];D[o+2]=col[2];D[o+3]=Math.round(a*255)}}}
 m.putImageData(img,0,0);
 RBR.forEach(b=>{const rw=riverW(b),x0=Math.round(riverX(b)-rw-14),x1=Math.round(riverX(b)+rw+14),y0=b-10;
  m.fillStyle='#3b2610';m.fillRect(x0-1,y0-1,x1-x0+2,22);
  for(let x=x0;x<x1;x+=3){m.fillStyle=(x/3|0)%2?'#a47a45':'#946b3a';m.fillRect(x,y0,2,20);m.fillStyle='#c79a5e';m.fillRect(x,y0,2,1)}
  m.fillStyle='#5a3b1c';m.fillRect(x0,y0,x1-x0,2);m.fillRect(x0,y0+18,x1-x0,2);
  for(let x=x0;x<x1;x+=8){m.fillStyle='#3b2610';m.fillRect(x,y0-2,2,4);m.fillRect(x,y0+18,2,4)}});
 // detalhes fixos: flores em manchas (cada mancha com as suas cores), tufos, cogumelos na mata, pedrinhas com musgo, conchas
 const dot=(x,y,w,h,col)=>{m.fillStyle=col;m.fillRect(x,y,w,h)};
 const CORES_FLOR=[['#f2d24a','#fff6c0'],['#f2f2f2','#f2d24a'],['#e86a9a','#ffd0e0'],['#b58cff','#efe0ff'],['#ff8a4a','#ffe0a0'],['#6ab4ff','#e0f0ff']];
 const livreDeAgua=(x,y,m0)=>!inRiver(x,y,m0)&&caminhoDist(x,y)>9;
 for(let n=0;n<6500;n++){const x=Math.floor(hash(n,1)*W),y=Math.floor(hash(n,2)*W),v=Vp(x,y),dc=Math.hypot((x-CX)/T,(y-CY)/T);
  if(v<24.5&&dc>6.4&&livreDeAgua(x,y,3)){const r=hash(n,3),b=biomaIlha(x,y),fl=floridoIlha(x,y);
   if(fl>.68&&b>.3&&r<.7){const [p,q]=CORES_FLOR[Math.floor(vnoise(x,y,220)*CORES_FLOR.length)%CORES_FLOR.length];dot(x,y+1,1,2,'#2f6f2c');dot(x-1,y,3,1,p);dot(x,y-1,1,3,p);dot(x,y,1,1,q)}
   else if(r<.18){const esc='#3c843a',cla='#62ad4f'; /* grama de uma cor só: os tufos no mesmo verde */dot(x,y,1,3,esc);dot(x+1,y+1,1,2,cla)}
   else if(r<.38&&b>.64){dot(x,y,1,2,'#e8dcc0');dot(x-1,y-1,3,1,n%2?'#c0392b':'#a8743a');if(n%3==0){dot(x+3,y+1,1,1,'#e8dcc0');dot(x+2,y,3,1,'#c0392b')}}
   else if(r<.43){dot(x,y,3,2,'#8a8f96');dot(x,y,2,1,'#b8bec6');if(b>.5)dot(x,y-1,2,1,'#4f7d3a')}
   }
  else if(v>26.4&&v<28&&hash(n,4)<.35){dot(x,y,2,1,hash(n,5)<.5?'#f2e8d0':'#b89868')}
  else if(dc<5&&dc>1.5&&hash(n,6)<.3){dot(x,y,2,1,'#6a4f33');dot(x+2,y+1,1,1,'#a88660')}}
 // margens: juncos, taboas e pedrinhas no rio e nos lagos
 const junco=(x,y,n)=>{if(n%4){dot(x,y-3,1,4,'#3f7a35');dot(x+1,y-4,1,3,'#6bbf5f');if(n%4==1){dot(x,y-6,1,2,'#7a4a24');dot(x,y-7,1,1,'#3f7a35')}}else{dot(x,y,3,2,'#8a8f96');dot(x,y,2,1,'#b8bec6')}};
 for(let n=0;n<1100;n++){const y=Math.floor(hash(n,9)*W);if(y<RIO_Y0)continue;const s=hash(n,10)<.5?-1:1,x=Math.floor(riverX(y)+s*(riverW(y)+3+hash(n,11)*6));
  if(Vp(x,y)<26.5&&!RBR.some(b=>Math.abs(y-b)<16)&&!LAGOS.some(L=>Math.hypot(x-L.x,y-L.y)<L.r+12))junco(x,y,n)}
 LAGOS.forEach((L,li)=>{const qtd=Math.round(L.r*3.2);
  for(let n=0;n<qtd;n++){const a=hash(n,li*7+21)*Math.PI*2,r=lagoR(L,a)+2+hash(n,li*7+22)*5,x=Math.round(L.x+Math.cos(a)*r),y=Math.round(L.y+Math.sin(a)*r/1.25);
   if(caminhoDist(x,y)>10&&!(L===LAGO&&Math.abs(x-riverX(y))<riverW(y)+6&&y>L.y))junco(x,y,n+li)}
  // ninfeias (folhas redondas com um corte e flor branca ou rosa) nas lagoas
  const nf=L.ninfeias?26:L===LAGO?10:4;
  for(let n=0;n<nf;n++){const a=hash(n,li*5+40)*Math.PI*2,r=lagoR(L,a)*(.35+.5*hash(n,li*5+41)),x=Math.round(L.x+Math.cos(a)*r),y=Math.round(L.y+Math.sin(a)*r/1.25);
   m.fillStyle='#2f7a3a';m.beginPath();m.ellipse(x,y,3,2,0,0,7);m.fill();m.fillStyle='#4fa04a';m.fillRect(x-2,y-1,3,1);m.fillStyle='#1f5a2a';m.fillRect(x,y,3,1);
   if(n%3==0){dot(x-1,y-2,2,1,n%2?'#ffffff':'#ff9ac0');dot(x,y-3,1,1,'#ffe07a')}}});
})();/* onde o rio cai no vazio (render.js desenha a água caindo e a névoa) */
const RIO_FIM=(()=>{for(let y=W-1;y>RIO_Y0;y--){const x=Math.round(riverX(y));if(islandTerrainMask[y*W+x]===4)return {x,y,w:riverW(y)}}return null})();
if(window.PALETA_JOGO)PALETA_JOGO.canvasNaPaleta(map); /* terreno da ilha na paleta do jogo (2026-10-30) */
const islandTerrainOriginal=map.getContext('2d').getImageData(0,0,W,W);
RBR.forEach(b=>{
 const left=Math.round(riverX(b)-riverW(b)-14),right=Math.round(riverX(b)+riverW(b)+14);
 for(let y=b-10;y<b+10;y++)for(let x=left;x<right;x++)islandTerrainMask[y*W+x]=5;
});
/* chão pintado na Engine (js/chao.js): texturas por ladrilho por cima do terreno; líquidos bloqueiam a passagem */
const CHAO_TEX=window.CHAO?CHAO.texturas(PROJ.pixel):{},CHAO_TILES=window.CHAO&&PROJETO.mundo&&PROJETO.mundo.chao||{},CHAO_GRID=new Array(N*N).fill(null);
for(const [k,id] of Object.entries(CHAO_TILES)){const [i,j]=k.split(',').map(Number),t=CHAO_TEX[id];if(!t||!(i>=0&&j>=0&&i<N&&j<N))continue;CHAO_GRID[j*N+i]={id,name:t.name,liquido:!!t.liquido};for(let y=j*T;y<j*T+T;y++)for(let x=i*T;x<i*T+T;x++)islandTerrainMask[y*W+x]=6}
window.ILHA_CHAO_ANIM=window.CHAO&&CHAO.animados?CHAO.animados(CHAO_TILES,CHAO_TEX):null; // água pintada corre (render.js)
const mapBase=mkCanvas(W,W);
function paintChao(){
 mapBase.getContext('2d').drawImage(map,0,0);
 if(!Object.keys(CHAO_TILES).length)return;
 const layer=mkCanvas(W,W);layer.getContext('2d').putImageData(CHAO.render(new ImageData(W,W),W,CHAO_TILES,CHAO_TEX),0,0);
 map.getContext('2d').drawImage(layer,0,0);
}
paintChao();
for(const [index,id] of islandTerrainKinds.entries()){
 if(id==='void')continue; // o vazio não tem ladrilho: é o espaço do render.js
 const sample=islandTerrainMask.findIndex((kind,i)=>kind===index&&i%W>16&&i%W<W-16&&i/W>16),x=sample%W,y=Math.floor(sample/W);
 gameArtRegister('island-ground-'+id,({grass:'Grama da ilha',sand:'Areia da ilha',camp:'Terra (acampamento e caminhos)',river:'Água do rio',bridge:'Tábuas das pontes'}[id]),{
  w:16,h:16,draw:g=>g.putImageData(islandTerrainOriginal,-x,-y,x,y,16,16)
 });
}
window.applyIslandTerrainArt=()=>{
 const tiles=islandTerrainKinds.map(id=>{
  if(id==='void')return null;
  const data=gameArtData('island-ground-'+id),canvas=data&&pixelArt(data);
  return canvas?{w:canvas.width,h:canvas.height,data:canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data}:null;
 });
 const g=map.getContext('2d'),image=g.createImageData(W,W);image.data.set(islandTerrainOriginal.data);
 for(let y=0;y<W;y++)for(let x=0;x<W;x++){
  const tile=tiles[islandTerrainMask[y*W+x]];if(!tile)continue;
  const from=((y%tile.h)*tile.w+x%tile.w)*4,to=(y*W+x)*4,alpha=tile.data[from+3]/255;
  for(let channel=0;channel<3;channel++)image.data[to+channel]=tile.data[from+channel]*alpha+image.data[to+channel]*(1-alpha);
 }
 g.putImageData(image,0,0);if(window.PALETA_JOGO)PALETA_JOGO.canvasNaPaleta(map);
 paintChao();
};
/* tipos de elemento do mapa: só os dos pacotes (js/pacote-mapa.js) e da biblioteca do projeto (2026-10-24, pedido do usuário:
 os elementos embutidos — pedras, arbusto, tronco, cerca, cristal, cogumelo, cacto, toco, placa e muro — não eram usados na ilha e saíram) */
/* a mata da ilha (2026-10-29, pedido do usuário: a vegetação do mesmo bioma das árvores, pedras meio enterradas) volta a ter
 elementos desenhados pelo jogo (js/scenery.js), nas folhas, madeira e pedra das árvores da ilha, no lugar dos do pacote
 "floresta sombria" (verde-azulado escuro, de outro clima) */
const MAP_ELEMENT_TYPES={
 mata_arbusto:{name:'Arbusto da mata',radius:5,blocks:false},mata_samambaia:{name:'Samambaia da mata',radius:4,blocks:false},
 mata_pedra:{name:'Pedra meio enterrada',radius:7,blocks:true},mata_toco:{name:'Toco da mata',radius:6,blocks:true},
 mata_tronco:{name:'Tronco caído da mata',radius:10,blocks:true},mata_cogumelos:{name:'Cogumelos da mata',radius:4,blocks:false}};
// elementos que a geração da mata põe sozinha (são trocados quando a ilha é refeita)
window.ehMatoDaIlha=t=>/^px:pk_fn_|^mata_/.test(t);
window.PIXLIB={};
/* elementos do pacote de mapa (js/pacote-mapa.js); um elemento da biblioteca do projeto com o mesmo id tem prioridade */
for(const [id,e] of Object.entries(window.PACOTE_MAPA&&PACOTE_MAPA.elementos||{})){PIXLIB[id]={...e.data,name:e.name};MAP_ELEMENT_TYPES['px:'+id]={name:e.name,radius:e.raio||6,blocks:!!e.solido}}
if(PROJ.pixel)for(const id in PROJ.pixel){const p=PROJ.pixel[id];if(!p||p.deleted||!p.pixels)continue;PIXLIB[id]=p;if(p.el)MAP_ELEMENT_TYPES['px:'+id]={name:p.name||id,radius:p.radius||6,blocks:!!p.solid}}
const trees=[],mapElements=[];
if(Array.isArray(PROJ.map&&PROJ.map.elements)){
 mapElements.push(...PROJ.map.elements.filter(e=>e&&MAP_ELEMENT_TYPES[e.type]&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&e.x>=0&&e.x<W&&e.y>=0&&e.y<W).map(e=>({type:e.type,x:e.x,y:e.y})))
}
/* chão andável: o chão pintado manda (líquido bloqueia, o resto libera, até sobre o mar); sem pintura, vale o terreno da ilha */
function groundFree(x,y){const i=Math.floor(x/T),j=Math.floor(y/T);if(i<0||j<0||i>=N||j>=N)return false;const ch=CHAO_GRID[j*N+i];if(ch)return !ch.liquido;return V(i,j)<28.5&&!(inRiver(x,y)&&!onBridge(x,y))}
const walkRaw=(x,y,ig,exclude)=>{if(typeof NPCS!='undefined')for(const n of NPCS)if(Math.abs(n.x-x)<7&&Math.abs(n.y-y)<7&&Math.hypot(n.x-x,n.y-y)<6.5)return false;const i=Math.floor(x/T),j=Math.floor(y/T);if(i<0||j<0||i>=N||j>=N||!groundFree(x,y))return false;for(const t of trees)if(t!==exclude&&Math.abs(t.x-x)<6&&Math.abs(t.y-y)<5&&Math.hypot(t.x-x,(t.y-y)*1.4)<4.5)return false;for(const e of mapElements){if(e===exclude||ig&&e.type==ig)continue;const type=MAP_ELEMENT_TYPES[e.type];if(type&&type.blocks&&Math.hypot(e.x-x,e.y-y)<type.radius+4)return false}return true};
let WG=null;const GW=W/2;
const walk=(x,y)=>{if(window.inTutorial&&window.tutorialWalk)return tutorialWalk(x,y);if(window.inArena&&window.arenaWalk)return arenaWalk(x,y);if(window.inTaverna&&window.tavernaWalk)return tavernaWalk(x,y);if(window.inDungeon&&typeof dungeonWalk==='function')return dungeonWalk(x,y);if(campWallBlocks(x,y))return false;if(!WG)return walkRaw(x,y);const i=Math.floor(x/2),j=Math.floor(y/2);return i>=0&&j>=0&&i<GW&&j<GW&&WG[j*GW+i]===1};
/* paredes bloqueiam golpes e magias: na DG as paredes e portas fechadas; na ilha a paliçada (portão fechado) e muros de pedra.
   Água, árvores e pedras pequenas não bloqueiam. linhaLivre(a,b) confere o caminho em passos de 4 px. */
const bloqueiaTiro=(x,y)=>{if(window.inTutorial)return false;if(window.inArena)return !!(window.arenaParede&&arenaParede(x,y));if(window.inDungeon)return !!(window.dungeonParede&&dungeonParede(x,y));if(window.inTaverna)return false;if(campWallBlocks(x,y))return true;for(const e of mapElements)if(e.type=='stonewall'&&Math.hypot(e.x-x,e.y-y)<MAP_ELEMENT_TYPES.stonewall.radius)return true;return false};
const linhaLivre=(a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,n=Math.ceil(Math.hypot(dx,dy)/4);for(let i=1;i<n;i++)if(bloqueiaTiro(a.x+dx*i/n,a.y+dy*i/n))return false;return true};
window.linhaLivre=linhaLivre;window.bloqueiaTiro=bloqueiaTiro;
// longe das árvores e dos elementos sólidos: ninguém nasce nem para escondido atrás da copa (mesma área em que a árvore fica transparente)
const longeDeArvores=(x,y)=>{if(window.inDungeon||window.inTaverna||window.inArena||window.inTutorial)return true;for(const t of arvoresPerto(x,y+12,19))if(Math.abs(t.x-x)<18&&y>t.y-30&&y<t.y+7)return false;for(const e of mapElements){const ty=MAP_ELEMENT_TYPES[e.type];if(ty&&ty.blocks&&Math.hypot(e.x-x,e.y-y)<ty.radius+12)return false}return true};
window.longeDeArvores=longeDeArvores;
for(let n=0;n<1200&&trees.length<72;n++){const x=rnd(0,W),y=rnd(0,W);if(V(x/T|0,y/T|0)<25.5&&Math.hypot(x-CX,y-CY)>95&&!inRiver(x,y,16))trees.push({x,y})}
if(Array.isArray(PROJ.map&&PROJ.map.trees)){trees.splice(0,trees.length,...PROJ.map.trees.filter(t=>t&&Number.isFinite(t.x)&&Number.isFinite(t.y)&&t.x>=0&&t.x<W&&t.y>=0&&t.y<W).map(t=>({x:t.x,y:t.y})))}
// lagos novos (2026-10-23): árvores e elementos sólidos que ficaram dentro da água ou na margem saem
{const seco=o=>!inRiver(o.x,o.y,7);for(const l of [trees,mapElements]){const ok=l.filter(seco);l.splice(0,l.length,...ok)}}
/* bosques da borda nova (ilha maior): gerados onde a ilha antiga não chegava. A Engine grava estas mesmas árvores
   no projeto ao abrir um projeto antigo (motor.js arvoresDoAnel); aqui aparecem enquanto o projeto não foi salvo. */
function arvoresDoAnel(existentes){const out=[],todas=[...(existentes||[])],ANTIGA=30*T;
 for(let y=T;y<W-T;y+=13)for(let x=T;x<W-T;x+=13){const jx=x+(hash(x,y)-.5)*10,jy=y+(hash(y,x)-.5)*10;
  if(Math.max(Math.abs(jx-CX),Math.abs(jy-CY))<ANTIGA||vnoise(jx,jy,90)<.56||hash(x*7,y*3)<.35)continue;
  if(V(jx/T|0,jy/T|0)>=25.5||inRiver(jx,jy,18)||caminhoDist(jx,jy)<16)continue;
  if(todas.some(t=>Math.abs(t.x-jx)<12&&Math.abs(t.y-jy)<12))continue;
  const t={x:Math.round(jx),y:Math.round(jy)};out.push(t);todas.push(t)}
 return out}
if(ILHA_MIGROU)trees.push(...arvoresDoAnel(trees));
/* layout 4 da ilha (2026-10-29, pedido do usuário: floresta de verdade; mundo.ilhaLayout 5; a 4 trouxe mais clareiras e a mata longe da base, a 5 mais 6 clareiras): mata fechada em quase tudo,
   mais rala na beira das estradas, das clareiras e do anel do acampamento, com aberturas naturais pequenas; nada nas
   estradas, trilhas, clareiras, água e pontes (a copa, que sobe ~40 px, também não cobre o caminho). Determinístico (mesma
   ilha sempre); a Engine grava estas árvores e os elementos (elementosDaIlha) no projeto uma vez. */
function arvoresDaIlha(){const out=[],perto=new Map(),cel=(x,y)=>(x>>4)+','+(y>>4);
 const ocupado=(x,y,d)=>{for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const l=perto.get(((x>>4)+i)+','+((y>>4)+j));if(l)for(const t of l)if(Math.abs(t.x-x)<d&&Math.abs(t.y-y)<d*.8)return true}return false};
 const poe=(x,y)=>{const t={x:Math.round(x),y:Math.round(y)};out.push(t);const k=cel(t.x,t.y);if(!perto.has(k))perto.set(k,[]);perto.get(k).push(t)};
 for(let y=T;y<W-T;y+=7)for(let x=T;x<W-T;x+=7){const jx=x+(hash(x,y*3)-.5)*6,jy=y+(hash(y,x*5)-.5)*6,v=V(jx/T|0,jy/T|0);
  if(v>=25.6)continue;                                                                   // praia e borda
  const da=campDistance(jx,jy);if(da<ANEL_R+90)continue;                                  // anel e campo de visão em volta da base
  if(inRiver(jx,jy,14)||inRiver(jx,jy-24,10)||onBridge(jx,jy+12))continue;
  if(Math.hypot(jx-LAGO.x,(jy-LAGO.y)*1.25)<LAGO.r*1.25+26)continue;                       // margem do lago
  const rd=caminhoDist(jx,jy),td=trilhaDist(jx,jy);
  if(rd<19||caminhoDist(jx,jy-22)<15||td<12||trilhaDist(jx,jy-20)<9||terraPerto(jx,jy,6))continue; // caminhos mais largos (layout 7); tronco fora da terra pintada
  const cf=clareiraFator(jx,jy)+(vnoise(jx,jy,22)-.5)*.25;if(cf<1.05)continue;            // clareiras (borda irregular)
  let dens=.9;
  if(vnoise(jx+500,jy,120)<.24)dens=.12;                                                  // aberturas naturais no meio da mata
  if(rd<36)dens*=.5;if(td<20)dens*=.6;if(cf<1.4)dens*=.55;if(da<ANEL_R+160)dens*=.3;if(v>24.6)dens*=.6;
  const r=hash(jx*7|0,jy*3|0);
  if(dens>.6){if(r<.95&&!ocupado(jx,jy,11))poe(jx,jy)}                                      // mata fechada
  else if(dens>.25){if(r<.6&&!ocupado(jx,jy,15))poe(jx,jy)}                                  // mata rala (beiras)
  else if(r<.05&&!ocupado(jx,jy,30))poe(jx,jy)}                                            // árvore solta na abertura
 return out}
window.arvoresDaIlha=arvoresDaIlha;
/* plantas e pedras (pacote de mapa, floresta): samambaias, arbustos, raízes e cogumelos no meio da mata e nas beiras;
   pedras, tocos e troncos caídos mais na beira das clareiras e das estradas. Nada em cima da terra nem da água; os sólidos
   longe dos troncos das árvores. */
/* terra pintada perto (estrada, trilha, clareira gasta, acampamento): o caminho pintado serpenteia até ~8 px da linha do meio,
   então a mata confere o chão de verdade (islandTerrainMask 3) além da distância até a linha */
const terraPerto=(x,y,r)=>{for(let dy=-r;dy<=r;dy+=2)for(let dx=-r;dx<=r;dx+=2){const X=Math.round(x+dx),Y=Math.round(y+dy);if(X>=0&&Y>=0&&X<W&&Y<W&&islandTerrainMask[Y*W+X]===3)return true}return false};
function elementosDaIlha(arvores){const out=[],ok=id=>MAP_ELEMENT_TYPES[id],perto=new Map(),k=(x,y)=>(x>>5)+','+(y>>5);
 for(const t of arvores){const c=k(t.x,t.y);if(!perto.has(c))perto.set(c,[]);perto.get(c).push(t)}
 const arvoresEm=(x,y,r)=>{let n=0;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const l=perto.get(((x>>5)+i)+','+((y>>5)+j));if(l)for(const t of l)if(Math.hypot(t.x-x,t.y-y)<r)n++}return n};
 const usados=[];const livre=(x,y,d)=>!usados.some(e=>Math.abs(e.x-x)<d&&Math.abs(e.y-y)<d);
 const sorteia=(l,r)=>{let s=0;for(const [,w] of l)s+=w;let q=r*s;for(const [id,w] of l){q-=w;if(q<=0)return id}return l[l.length-1][0]};
 // mata da ilha (js/scenery.js), mesmas cores das árvores
 const MATA=[['mata_samambaia',6],['mata_arbusto',3.5],['mata_cogumelos',.8],['mata_toco',.6],['mata_pedra',.7]];
 const BEIRA=[['mata_pedra',3],['mata_arbusto',3],['mata_toco',1.5],['mata_tronco',1.2],['mata_samambaia',2.4]];
 const SOLIDO={mata_pedra:1,mata_toco:1,mata_tronco:1};
 for(let y=T;y<W-T;y+=20)for(let x=T;x<W-T;x+=20){const jx=Math.round(x+(hash(x*3,y)-.5)*16),jy=Math.round(y+(hash(y*5,x)-.5)*16),v=V(jx/T|0,jy/T|0);
  if(v>=25.4||campDistance(jx,jy)<ANEL_R+14||inRiver(jx,jy,8)||onBridge(jx,jy))continue;
  const rd=caminhoDist(jx,jy),td=trilhaDist(jx,jy),cf=clareiraFator(jx,jy);if(rd<14||td<9||cf<.85||terraPerto(jx,jy,8))continue;
  const beira=cf<1.35||rd<30,n=arvoresEm(jx,jy,22),r=hash(jx*11,jy*13);
  if(!(beira?r<.42:n>=2?r<.3:r<.08))continue;
  const id=sorteia(beira?BEIRA:MATA,hash(jx*17+3,jy*19+7));if(!ok(id))continue;
  if(SOLIDO[id]&&arvoresEm(jx,jy,id=='mata_tronco'?20:13))continue;
  if(!livre(jx,jy,id=='mata_tronco'?30:14))continue;
  const e={type:id,x:jx,y:jy};out.push(e);usados.push(e)}
 return out}
window.elementosDaIlha=elementosDaIlha;
if(!(+(PROJETO&&PROJETO.mundo&&PROJETO.mundo.ilhaLayout)>=7)){ // 7: caminhos mais largos, a mata e as plantas mais afastadas delestrees.splice(0,trees.length,...arvoresDaIlha());
 // os elementos de natureza do projeto são trocados pelos novos; outros (cerca, placa...) ficam, se não caíram na terra ou na água
 const outros=mapElements.filter(e=>!ehMatoDaIlha(e.type)&&!(terraDist(e.x,e.y)<9||inRiver(e.x,e.y,4)));
 mapElements.splice(0,mapElements.length,...outros,...elementosDaIlha(trees))}
/* grade das árvores (32 px) para perguntas de "tem árvore perto?" sem passar pela lista toda (a floresta tem milhares) */
const GRADE_ARV={G:Math.ceil(W/32),cel:null};
function indexarArvores(){const G=GRADE_ARV.G,c=Array.from({length:G*G},()=>[]);for(const t of trees){const i=Math.floor(t.x/32),j=Math.floor(t.y/32);if(i>=0&&j>=0&&i<G&&j<G)c[j*G+i].push(t)}GRADE_ARV.cel=c}
function arvoresPerto(x,y,r){const G=GRADE_ARV.G,out=[];if(!GRADE_ARV.cel)indexarArvores();const i0=Math.max(0,Math.floor((x-r)/32)),i1=Math.min(G-1,Math.floor((x+r)/32)),j0=Math.max(0,Math.floor((y-r)/32)),j1=Math.min(G-1,Math.floor((y+r)/32));
 for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)for(const t of GRADE_ARV.cel[j*G+i])if(Math.abs(t.x-x)<=r&&Math.abs(t.y-y)<=r)out.push(t);return out}
window.arvoresPerto=arvoresPerto;
/* grade de passagem (2×2 px): o chão primeiro, depois cada árvore, elemento sólido e NPC "carimba" só as células em volta
   (mesmas regras do walkRaw, sem testar todas as árvores em cada célula da ilha grande) */
function rebuildWG(){window.sceneryDirty&&sceneryDirty();WG=new Uint8Array(GW*GW);
 for(let j=0;j<GW;j++)for(let i=0;i<GW;i++)WG[j*GW+i]=groundFree(i*2+1,j*2+1)?1:0;
 const carimbo=(o,r,teste)=>{const i0=Math.max(0,Math.floor((o.x-r-2)/2)),i1=Math.min(GW-1,Math.ceil((o.x+r)/2)),j0=Math.max(0,Math.floor((o.y-r-2)/2)),j1=Math.min(GW-1,Math.ceil((o.y+r)/2));for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)if(teste(i*2+1,j*2+1))WG[j*GW+i]=0};
 /* mata fechada não dá passagem (2026-10-29, pedido do usuário): árvore com 3 ou mais vizinhas a até 20 px bloqueia um
    raio maior (9 px), e as vizinhas se emendam numa parede; na beira da mata (poucas vizinhas) só o tronco bloqueia */
 indexarArvores();
 for(const t of trees){const viz=window.inDungeon?0:arvoresPerto(t.x,t.y,20).filter(o=>o!==t&&Math.hypot(o.x-t.x,o.y-t.y)<=20).length;
  if(viz>=3)carimbo(t,10,(x,y)=>Math.hypot(t.x-x,(t.y-y)*1.15)<9);
  else carimbo(t,7,(x,y)=>Math.abs(t.x-x)<6&&Math.abs(t.y-y)<5&&Math.hypot(t.x-x,(t.y-y)*1.4)<4.5)}
 for(const e of mapElements){const ty=MAP_ELEMENT_TYPES[e.type];if(ty&&ty.blocks){const r=ty.radius+4;carimbo(e,r,(x,y)=>Math.hypot(e.x-x,e.y-y)<r)}}
 if(typeof NPCS!='undefined')for(const n of NPCS)if(n.x>-1000)carimbo(n,7,(x,y)=>Math.abs(n.x-x)<7&&Math.abs(n.y-y)<7&&Math.hypot(n.x-x,n.y-y)<6.5);
}rebuildWG();
function buildPath(from,to,avoidCamp=false){
 const room=window.inDungeon&&from.dungeonRoomBounds;
 const inRoom=(x,y)=>!room||(x>=room.x+6&&x<=room.x+room.w-6&&y>=room.y+6&&y<=room.y+room.h-6);
 let minCellX=0,minCellY=0,maxCellX=N-1,maxCellY=N-1;
 if(window.inDungeon){
  for(const box of window.dungeonCaixas?window.dungeonCaixas():[...(window.CAVE_ROOMS||[]),...(window.CAVE_CORRIDORS||[])]){
   minCellX=Math.min(minCellX,Math.floor(box.x/T));
   minCellY=Math.min(minCellY,Math.floor(box.y/T));
   maxCellX=Math.max(maxCellX,Math.ceil((box.x+box.w)/T));
   maxCellY=Math.max(maxCellY,Math.ceil((box.y+box.h)/T));
  }
 }
 const cols=maxCellX-minCellX+1,rows=maxCellY-minCellY+1;
 const cell=(x,y)=>Math.max(0,Math.min(cols-1,Math.floor(x/T)-minCellX))+Math.max(0,Math.min(rows-1,Math.floor(y/T)-minCellY))*cols;
 const worldCell=(i)=>({x:(i%cols+minCellX+.5)*T,y:((Math.floor(i/cols)+minCellY)+.5)*T});
 const open=(i)=>{const {x,y}=worldCell(i);return inRoom(x,y)&&walk(x,y)&&walk(x+3,y)&&walk(x-3,y)&&walk(x,y+3)&&walk(x,y-3)&&(!avoidCamp||!insideCamp(x,y))};
 const seg=(a,b)=>{const {x:ax,y:ay}=worldCell(a),{x:bx,y:by}=worldCell(b);for(let k=1;k<8;k++){const x=ax+(bx-ax)*k/8,y=ay+(by-ay)*k/8;if(!inRoom(x,y)||!walk(x,y)||(avoidCamp&&insideCamp(x,y)))return false}return true};
 let goal=cell(to.x,to.y);const start=cell(from.x,from.y),prev=new Int32Array(cols*rows).fill(-2),queue=new Int32Array(cols*rows);
 if(!inRoom(from.x,from.y)) return [];
 let head=0,tail=0;prev[start]=-1;queue[tail++]=start;
 while(head<tail&&prev[goal]===-2){const i=queue[head++],x=i%cols,y=(i/cols)|0;
  for(const n of [x>0?i-1:-1,x<cols-1?i+1:-1,y>0?i-cols:-1,y<rows-1?i+cols:-1]){
   if(n>=0&&prev[n]===-2&&seg(i,n)&&(n===goal||open(n))){prev[n]=i;queue[tail++]=n}
  }}
 if(prev[goal]===-2){let best=-1,bd=1e12;for(let i=0;i<cols*rows;i++)if(prev[i]!==-2&&i!==start){const q=worldCell(i),dx=q.x-to.x,dy=q.y-to.y,d=dx*dx+dy*dy;if(d<bd){bd=d;best=i}}if(best<0)return [];goal=best}
 const raw=[];for(let i=goal;i!==start&&i>=0;i=prev[i])raw.push(worldCell(i));
 raw.reverse();const clear=(a,b)=>{const n=Math.ceil(dist(a,b)/2);for(let i=1;i<=n;i++){const f=i/n,x=a.x+(b.x-a.x)*f,y=a.y+(b.y-a.y)*f;if(!inRoom(x,y)||!walk(x,y)||(avoidCamp&&insideCamp(x,y)))return false}return true};
 const path=[];let at=from;
 while(raw.length){let far=0;for(let i=0;i<raw.length;i++){if(clear(at,raw[i]))far=i;else break}
  at=raw[far];path.push(at);raw.splice(0,far+1)}
 return path
}
