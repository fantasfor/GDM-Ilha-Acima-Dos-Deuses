/* ---------- Chão pintado da ilha ----------
   PROJETO.mundo.chao = {"i,j": idDaTextura} na grade de ladrilhos 16×16 (64×64 na ilha).
   Texturas: as do pacote (js/pacote-mapa.js) e as da biblioteca do projeto marcadas como chão (chao:true).
   Usado pelo jogo e pela Engine, para os dois desenharem exatamente igual. */
(function(root){
 const TILE=16;
 const hash=(x,y)=>{let h=(x*374761393+y*668265263)|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296};
 /* Todas as texturas de chão disponíveis: {id: {name, tema, liquido, data}} */
 function texturas(biblioteca){
  const out={},pack=root.PACOTE_MAPA&&root.PACOTE_MAPA.texturas||{};
  for(const [id,t] of Object.entries(pack))out[id]={...t,pacote:true};
  for(const [id,d] of Object.entries(biblioteca||{}))if(d&&!d.deleted&&d.chao&&d.pixels)out[id]={name:d.name||id,tema:d.tema||'projeto',liquido:!!d.liquido,parede:!!d.parede,data:d}; // parede: pintura de parede (DG), bloqueia
  return out;
 }
 /* Pixels RGBA da textura inteira (qualquer tamanho). Na pintura ela se repete alinhada ao mundo: uma textura de
    32×32 cobre 2×2 ladrilhos sem cortar o desenho (antes só os primeiros 16×16 apareciam). */
 const pixelCache=new Map();
 function pixels(data){
  if(pixelCache.has(data))return pixelCache.get(data);
  const w=Math.max(1,data.w|0),h=Math.max(1,data.h|0),out=new Uint8ClampedArray(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=data.palette[parseInt(data.pixels[y*w+x],36)];if(!/^#[0-9a-f]{6}$/i.test(c||''))continue;const n=parseInt(c.slice(1),16),o=(y*w+x)*4;out[o]=n>>16&255;out[o+1]=n>>8&255;out[o+2]=n&255;out[o+3]=255}
  const r={p:out,w,h};pixelCache.set(data,r);return r;
 }
 /* Desenha a pintura numa ImageData W×W (transparente fora dos ladrilhos pintados).
    Bordas com outro chão ficam serrilhadas em pixel (2–3 px) para não parecerem um quadriculado.
    o = {i0, j0, H}: recorte da grade (DGs têm coordenadas negativas); a imagem tem W×H px a partir do ladrilho i0,j0. */
 function render(image,W,tiles,texs,o={}){
  const D=image.data,i0=o.i0||0,j0=o.j0||0,N=W/TILE,M=(o.H||W)/TILE,at=(i,j)=>tiles[i+','+j]||'';
  for(const key of Object.keys(tiles)){
   const id=tiles[key],t=texs[id];if(!t)continue;
   const [i,j]=key.split(',').map(Number);if(!(i-i0>=0&&j-j0>=0&&i-i0<N&&j-j0<M))continue;
   const T=pixels(t.data),P=T.p,parede=!!t.parede,L=at(i-1,j)!==id,R=at(i+1,j)!==id,U=at(i,j-1)!==id,B=at(i,j+1)!==id;
   const UL=at(i-1,j-1)!==id,UR=at(i+1,j-1)!==id,BL=at(i-1,j+1)!==id,BR=at(i+1,j+1)!==id;
   for(let y=0;y<TILE;y++)for(let x=0;x<TILE;x++){
    let d=9;if(L)d=Math.min(d,x);if(R)d=Math.min(d,15-x);if(U)d=Math.min(d,y);if(B)d=Math.min(d,15-y);
    if(UL&&!L&&!U)d=Math.min(d,Math.max(x,y));if(UR&&!R&&!U)d=Math.min(d,Math.max(15-x,y));if(BL&&!L&&!B)d=Math.min(d,Math.max(x,15-y));if(BR&&!R&&!B)d=Math.min(d,Math.max(15-x,15-y));
    const gx=(i-i0)*TILE+x,gy=(j-j0)*TILE+y;if(!parede&&d<3&&hash(gx+i0*TILE,gy+j0*TILE)>[.38,.62,.86][d])continue; // parede pintada: sem borda serrilhada
    const wx=i*TILE+x,wy=j*TILE+y,s=(((wy%T.h)+T.h)%T.h*T.w+((wx%T.w)+T.w)%T.w)*4,o=(gy*W+gx)*4;D[o]=P[s];D[o+1]=P[s+1];D[o+2]=P[s+2];D[o+3]=P[s+3];
   }
  }
  return image;
 }
 /* ---------- Chão pintado das DGs ----------
    config.chao = {"i,j": id} (pode ter coordenadas negativas); '@dg' = ladrilho de chão da própria DG (tema ou arte própria).
    O que não está pintado é parede: a camada já traz as paredes nas bordas da pintura. */
 function dgCaixa(tiles){let i0=Infinity,j0=Infinity,i1=-Infinity,j1=-Infinity;for(const k in tiles){const [i,j]=k.split(',').map(Number);if(i<i0)i0=i;if(j<j0)j0=j;if(i>i1)i1=i;if(j>j1)j1=j}return i1<i0?null:{i0,j0,i1,j1,x:i0*TILE,y:j0*TILE,w:(i1-i0+1)*TILE,h:(j1-j0+1)*TILE}}
 function dgCamada(tiles,texs,{piso,parede,cores}){
  const cx=dgCaixa(tiles);if(!cx)return null;
  const i0=cx.i0-1,j0=cx.j0-1,W=(cx.i1-cx.i0+3)*TILE,H=(cx.j1-cx.j0+3)*TILE;
  const c=root.document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  g.putImageData(render(g.createImageData(W,H),W,tiles,texs,{i0,j0,H}),0,0);
  g.save();g.translate(-i0*TILE,-j0*TILE); // padrões alinhados ao mundo
  // ladrilho de parede pintada (textura com parede) não conta como chão: a borda da parede é desenhada em volta dele também
  const ehParede=id=>!!(texs[id]&&texs[id].parede),tem=(i,j)=>{const id=tiles[i+','+j];return !!id&&!ehParede(id)},lista=Object.keys(tiles).map(k=>{const [i,j]=k.split(',').map(Number);return [i,j,tiles[k]]}).filter(([,,id])=>!ehParede(id));
  g.fillStyle=piso?g.createPattern(piso,'repeat'):cores.inner;for(const [i,j,id] of lista)if(id==='@dg')g.fillRect(i*TILE,j*TILE,TILE,TILE);
  const pat=parede&&g.createPattern(parede,'repeat');
  for(const [i,j] of lista){const x=i*TILE,y=j*TILE;
   // parede de cima em visão 3/4: a face inteira (um ladrilho de altura) com o desenho todo da parede da DG; se ali já há
   // uma pintura de parede do projeto, vale a pintura
   if(!tem(i,j-1)&&!ehParede(tiles[i+','+(j-1)])){g.fillStyle=pat||cores.wall;g.fillRect(x,y-TILE,TILE,TILE);g.fillStyle=cores.highlight;g.fillRect(x,y-TILE,TILE,1);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x,y-2,TILE,2);g.fillStyle=cores.shadow;g.fillRect(x,y,TILE,2)}
   if(!tem(i,j+1)){g.fillStyle=pat||cores.shadow;g.fillRect(x,y+TILE-2,TILE,2)}
   if(!tem(i-1,j)){g.fillStyle=pat||cores.shadow;g.fillRect(x,y,2,TILE);g.fillStyle=cores.wall;g.fillRect(x,y,1,TILE)}
   if(!tem(i+1,j)){g.fillStyle=pat||cores.shadow;g.fillRect(x+TILE-2,y,2,TILE);g.fillStyle=cores.wall;g.fillRect(x+TILE-1,y,1,TILE)}}
  g.restore();return{c,x:i0*TILE,y:j0*TILE};
 }
 /* Converte salas e corredores (retângulos) em chão pintado com o ladrilho da DG: vale o centro de cada ladrilho. */
 function dgDeSalas(caixas){const out={};for(const b of caixas||[]){if(!b)continue;for(let j=Math.floor(b.y/TILE);j*TILE<b.y+b.h;j++)for(let i=Math.floor(b.x/TILE);i*TILE<b.x+b.w;i++){const x=(i+.5)*TILE,y=(j+.5)*TILE;if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h)out[i+','+j]='@dg'}}return out}
 /* Ilha v2: 96×96 ladrilhos (era 64×64). Projetos antigos têm árvores, elementos, spawns e chão pintado
    deslocados para o novo centro (+16 ladrilhos), ficando no mesmo lugar em relação ao acampamento. */
 const ILHA_V=2,ILHA_DESLOC=(96-64)/2*TILE;
 function migrarIlha(m){
  if(!m||m.ilhaV>=ILHA_V)return false;const d=ILHA_DESLOC,t=d/TILE;
  for(const a of [m.arvores,m.elementos,m.spawns])if(Array.isArray(a))for(const o of a)if(o&&Number.isFinite(o.x)&&Number.isFinite(o.y)){o.x+=d;o.y+=d}
  if(m.chao&&typeof m.chao=='object'){const c={};for(const [k,v] of Object.entries(m.chao)){const [i,j]=k.split(',').map(Number);c[(i+t)+','+(j+t)]=v}m.chao=c}
  m.ilhaV=ILHA_V;return true;
 }
 root.CHAO={TILE,texturas,render,key:(i,j)=>i+','+j,dgCaixa,dgCamada,dgDeSalas,ILHA_V,ILHA_DESLOC,migrarIlha};
})(typeof window!=='undefined'?window:globalThis);
