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
const RIO_Y0=CY-470,RBR=[CY-180,CY+200];
const riverX=y=>CX+380+34*Math.sin(y/70)+14*Math.sin(y/23);
const riverW=y=>y<RIO_Y0?0:9+5*Math.min(1,(y-RIO_Y0)/700)+2*Math.sin(y/50);
const LAGO={x:Math.round(riverX(RIO_Y0)),y:RIO_Y0,r:74,nome:'Lago Grande',s:3};
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
/* caminhos de terra (refeitos em 2026-10-23): estradas curvas (pontos de passagem suavizados) que saem das 4 saídas do
   acampamento: ao sul até a cachoeira, a leste pelas duas pontes, ao norte até o lago e a oeste até a floresta */
const CAMINHOS=(()=>{const [B1,B2]=RBR,b1=riverX(B1),b2=riverX(B2),w1=riverW(B1)+18,w2=riverW(B2)+18;
 // curva suave por dentro dos pontos (Catmull-Rom), em trechos curtos
 const suave=pts=>{const out=[];for(let i=0;i<pts.length-1;i++){const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];
  for(let k=0;k<8;k++){const t=k/8,t2=t*t,t3=t2*t,f=(a,b,c,d)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);out.push([f(p0[0],p1[0],p2[0],p3[0]),f(p0[1],p1[1],p2[1],p3[1])])}}
  out.push(pts[pts.length-1]);return out};
 return [
  [[CX,CY+140],[CX-20,CY+250],[CX-40,CY+350],[CX+40,CY+470],[CX+120,CY+560],[riverX(CY+620)-70,CY+620]],             // sul: cachoeira
  [[CX-25,CY+300],[CX+120,CY+260],[b2-150,B2+24],[b2-w2,B2]],[[b2+w2,B2],[b2+120,B2+50],[b2+190,B2+150],[b2+230,B2+260]], // sudeste: ponte de baixo
  [[CX+140,CY],[CX+230,CY-50],[b1-110,B1+10],[b1-w1,B1]],[[b1+w1,B1],[b1+110,B1-30],[b1+150,B1-160],[LAGO.x+LAGO.r+50,LAGO.y+30]], // leste: ponte de cima e lago
  [[CX,CY-140],[CX-30,CY-260],[CX+40,CY-380],[LAGO.x-LAGO.r-60,LAGO.y+50],[LAGO.x-LAGO.r-12,LAGO.y+20]],             // norte: margem do lago
  [[CX-140,CY],[CX-280,CY+30],[CX-420,CY-20],[CX-520,CY-110],[CX-560,CY-200]],                                          // oeste: floresta
  [[CX-280,CY+30],[CX-370,CY+170],[CX-440,CY+330]]].map(suave)})();const CAMINHO_SEGS=CAMINHOS.flatMap(l=>l.slice(1).map((q,i)=>[l[i],q]));
function caminhoDist(x,y){let best=Infinity;for(const [a,b] of CAMINHO_SEGS){if(x<Math.min(a[0],b[0])-24||x>Math.max(a[0],b[0])+24||y<Math.min(a[1],b[1])-24||y>Math.max(a[1],b[1])+24)continue;
 const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy))),d=Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);if(d<best)best=d}return best}
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
  d1:hx('#8c6c49'),d2:hx('#7f6140'),d3:hx('#9a7a55'),r1:hx('#6b5848'),r2:hx('#4d3f34'),r3:hx('#1d1712'),moss:hx('#3f6b34')};
 // rampas da grama (escuro → claro) por bioma
 const G={campo:['#2f6e31','#3c843a','#4b9a44','#5dae50','#78c260'].map(hx),mata:['#1f4f2a','#29622f','#347536','#418843','#55a04e'].map(hx),
  seco:['#5d7a34','#73903c','#8aa548','#a3b656','#bfc86c'].map(hx)};
 const BAY=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
 const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const tom=(rampa,v,x,y)=>{v=Math.max(0,Math.min(.999,v))*(rampa.length-1);const i=Math.floor(v),f=v-i;return rampa[Math.min(rampa.length-1,i+(f*16>BAY[y&3][x&3]+.5?1:0))]};
 const gramaEm=(x,y)=>{const b=biomaIlha(x,y),n=vn(x,y,48)*.7+vn(x,y,17)*.3,cl=vn(x+50,y+20,30);
  let c=b>.64?tom(G.mata,n,x,y):b<.32?tom(G.seco,n,x,y):tom(G.campo,n,x,y);
  if(b>.56&&b<=.64)c=mix(c,tom(G.mata,n,x,y),(b-.56)/.08*.8);else if(b>=.32&&b<.4)c=mix(c,tom(G.seco,n,x,y),(.4-b)/.08*.8);
  if(cl>.78)c=mix(c,G.campo[4],.15);                                   // manchas de trevo, bem leves
  return c};
 for(let y=0;y<W;y++)for(let x=0;x<W;x++){
  const wob=(vn(x,y,24)-.5)*2.2+(vn(x,y,9)-.5)*.8,v=Vp(x,y)+wob;
  if(v>28.6){islandTerrainMask[y*W+x]=2;continue} // vazio: fica transparente (o espaço aparece por trás)
  const dc=Math.hypot((x-CX)/T,(y-CY)/T)+(vn(x,y,20)-.5)*2.4,n=vn(x,y,14),f=vn(x,y,4),px=hash(x*3+1,y*7+2);
  let c,kind=v>26.2?1:0;
  if(v>26.2){c=mix(C.sand,C.sand2,n);if(v>28)c=mix(c,C.r1,Math.min(1,(v-28)/.6)*.7)}
  else{c=gramaEm(x,y);if(v>25)c=mix(c,C.sand,(v-25)/1.2*.6)}
  if(v<26.8&&dc>=5.4){const pd=caminhoDist(x+(vn(x,y,40)-.5)*16,y+(vn(x+77,y,40)-.5)*16),pw=6+(vn(x,y,12)-.5)*3;
   if(pd<pw+2){let d=mix(n>.5?C.d1:C.d2,C.d3,f);if(px>.95)d=mix(d,C.d2,.9);if(pd<pw){c=d;kind=3}else c=mix(c,d,.5*(1-(pd-pw)/2))}}
  if(dc<5.9){const t=Math.max(0,Math.min(1,(5.9-dc)/1.2));let d=mix(n>.5?C.d1:C.d2,C.d3,f);if(px>.96)d=mix(d,C.d2,.9);c=mix(c,d,t>.5?1:t*2*(px>.4?1:.6));kind=3}
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
   else if(r<.18){const esc=b>.64?'#1d4a24':'#2f6f2c',cla=b<.32?'#c2c86a':'#6bbf5f';dot(x,y,1,3,esc);dot(x+1,y+1,1,2,cla)}
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
const islandTerrainOriginal=map.getContext('2d').getImageData(0,0,W,W);
RBR.forEach(b=>{
 const left=Math.round(riverX(b)-riverW(b)-14),right=Math.round(riverX(b)+riverW(b)+14);
 for(let y=b-10;y<b+10;y++)for(let x=left;x<right;x++)islandTerrainMask[y*W+x]=5;
});
/* chão pintado na Engine (js/chao.js): texturas por ladrilho por cima do terreno; líquidos bloqueiam a passagem */
const CHAO_TEX=window.CHAO?CHAO.texturas(PROJ.pixel):{},CHAO_TILES=window.CHAO&&PROJETO.mundo&&PROJETO.mundo.chao||{},CHAO_GRID=new Array(N*N).fill(null);
for(const [k,id] of Object.entries(CHAO_TILES)){const [i,j]=k.split(',').map(Number),t=CHAO_TEX[id];if(!t||!(i>=0&&j>=0&&i<N&&j<N))continue;CHAO_GRID[j*N+i]={id,name:t.name,liquido:!!t.liquido};for(let y=j*T;y<j*T+T;y++)for(let x=i*T;x<i*T+T;x++)islandTerrainMask[y*W+x]=6}
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
 g.putImageData(image,0,0);
 paintChao();
};
const MAP_ELEMENT_TYPES={
 rock:{name:'Pedra pequena',radius:6,blocks:true},
 boulder:{name:'Pedra grande',radius:10,blocks:true},
 bush:{name:'Arbusto',radius:5,blocks:false},
 log:{name:'Tronco',radius:9,blocks:true},
 fence:{name:'Cerca',radius:9,blocks:true},
 crystal:{name:'Cristal',radius:6,blocks:true},
 mushroom:{name:'Cogumelo',radius:4,blocks:false},
 cactus:{name:'Cacto',radius:6,blocks:true},
 stump:{name:'Toco',radius:6,blocks:true},
 sign:{name:'Placa',radius:4,blocks:false},
 stonewall:{name:'Muro de pedra',radius:8,blocks:true}
};
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
const longeDeArvores=(x,y)=>{if(window.inDungeon||window.inTaverna||window.inArena||window.inTutorial)return true;for(const t of trees)if(Math.abs(t.x-x)<18&&y>t.y-30&&y<t.y+7)return false;for(const e of mapElements){const ty=MAP_ELEMENT_TYPES[e.type];if(ty&&ty.blocks&&Math.hypot(e.x-x,e.y-y)<ty.radius+12)return false}return true};
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
/* layout da ilha (2026-10-23, mundo.ilhaLayout 1): florestas fechadas nas bordas e em manchas, bosques soltos, árvores isoladas
   no campo, um anel de árvores na margem do lago e do rio (sem encostar na água), clareira grande em volta do acampamento
   e nada em cima dos caminhos. Determinístico (mesma ilha sempre); a Engine grava estas árvores no projeto uma vez. */
function arvoresDaIlha(){const out=[],perto=new Map(),cel=(x,y)=>(x>>4)+','+(y>>4);
 const ocupado=(x,y,d)=>{for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const l=perto.get(((x>>4)+i)+','+((y>>4)+j));if(l)for(const t of l)if(Math.abs(t.x-x)<d&&Math.abs(t.y-y)<d*.8)return true}return false};
 const poe=(x,y)=>{const t={x:Math.round(x),y:Math.round(y)};out.push(t);const k=cel(t.x,t.y);if(!perto.has(k))perto.set(k,[]);perto.get(k).push(t)};
 for(let y=T;y<W-T;y+=9)for(let x=T;x<W-T;x+=9){const jx=x+(hash(x,y*3)-.5)*8,jy=y+(hash(y,x*5)-.5)*8,v=V(jx/T|0,jy/T|0);
  if(v>=25.6)continue;                                                                  // praia e borda
  const dc=Math.hypot(jx-CX,jy-CY);if(dc<CAMP_SAFE_HALF_SIZE+60)continue;                 // clareira do acampamento
  // longe da água e dos caminhos, e a copa (que sobe ~40 px) também não cobre o caminho nem o lago
  if(inRiver(jx,jy,16)||inRiver(jx,jy-24,10)||caminhoDist(jx,jy)<20||caminhoDist(jx,jy-22)<16||onBridge(jx,jy+12))continue;
  if(Math.hypot(jx-LAGO.x,(jy-LAGO.y)*1.25)<LAGO.r*1.25+46)continue;                       // clareira em volta do lago
  const borda=Math.max(0,(v-20.5)/5),mancha=vnoise(jx,jy,150),mata=biomaIlha(jx,jy)>.62?.18:0;
  const dens=borda*.62+Math.max(0,mancha-.52)*1.7+mata-(dc<CAMP_SAFE_HALF_SIZE+200?.3:0);
  const r=hash(jx*7|0,jy*3|0);
  if(dens>.6){if(r<.62&&!ocupado(jx,jy,12))poe(jx,jy)}                                     // floresta fechada
  else if(dens>.38){if(r<.26&&!ocupado(jx,jy,16))poe(jx,jy)}                                // bosque solto
  else if(r<.016&&!ocupado(jx,jy,44))poe(jx,jy)}                                          // árvore sozinha no campo
 return out}
window.arvoresDaIlha=arvoresDaIlha;
if(!(+(PROJETO&&PROJETO.mundo&&PROJETO.mundo.ilhaLayout)>=1)){trees.splice(0,trees.length,...arvoresDaIlha());
 // elementos do projeto que caíram em cima dos caminhos novos saem (pedras e troncos no meio da estrada)
 const fora=mapElements.filter(e=>caminhoDist(e.x,e.y)<9);for(const e of fora)mapElements.splice(mapElements.indexOf(e),1)}
/* grade de passagem (2×2 px): o chão primeiro, depois cada árvore, elemento sólido e NPC "carimba" só as células em volta
   (mesmas regras do walkRaw, sem testar todas as árvores em cada célula da ilha grande) */
function rebuildWG(){window.sceneryDirty&&sceneryDirty();WG=new Uint8Array(GW*GW);
 for(let j=0;j<GW;j++)for(let i=0;i<GW;i++)WG[j*GW+i]=groundFree(i*2+1,j*2+1)?1:0;
 const carimbo=(o,r,teste)=>{const i0=Math.max(0,Math.floor((o.x-r-2)/2)),i1=Math.min(GW-1,Math.ceil((o.x+r)/2)),j0=Math.max(0,Math.floor((o.y-r-2)/2)),j1=Math.min(GW-1,Math.ceil((o.y+r)/2));for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)if(teste(i*2+1,j*2+1))WG[j*GW+i]=0};
 for(const t of trees)carimbo(t,7,(x,y)=>Math.abs(t.x-x)<6&&Math.abs(t.y-y)<5&&Math.hypot(t.x-x,(t.y-y)*1.4)<4.5);
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
