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
  for(const [id,d] of Object.entries(biblioteca||{}))if(d&&!d.deleted&&d.chao&&d.pixels)out[id]={name:d.name||id,tema:'projeto',liquido:!!d.liquido,data:d};
  return out;
 }
 /* Pixels RGBA de uma textura (16×16; texturas maiores são cortadas, menores repetidas). */
 const pixelCache=new Map();
 function pixels(data){
  if(pixelCache.has(data))return pixelCache.get(data);
  const w=data.w,h=data.h,out=new Uint8ClampedArray(TILE*TILE*4);
  for(let y=0;y<TILE;y++)for(let x=0;x<TILE;x++){const c=data.palette[parseInt(data.pixels[(y%h)*w+(x%w)],36)];if(!/^#[0-9a-f]{6}$/i.test(c||''))continue;const n=parseInt(c.slice(1),16),o=(y*TILE+x)*4;out[o]=n>>16&255;out[o+1]=n>>8&255;out[o+2]=n&255;out[o+3]=255}
  pixelCache.set(data,out);return out;
 }
 /* Desenha a pintura numa ImageData W×W (transparente fora dos ladrilhos pintados).
    Bordas com outro chão ficam serrilhadas em pixel (2–3 px) para não parecerem um quadriculado. */
 function render(image,W,tiles,texs){
  const D=image.data,N=W/TILE,at=(i,j)=>tiles[i+','+j]||'';
  for(const key of Object.keys(tiles)){
   const id=tiles[key],t=texs[id];if(!t)continue;
   const [i,j]=key.split(',').map(Number);if(!(i>=0&&j>=0&&i<N&&j<N))continue;
   const P=pixels(t.data),L=at(i-1,j)!==id,R=at(i+1,j)!==id,U=at(i,j-1)!==id,B=at(i,j+1)!==id;
   const UL=at(i-1,j-1)!==id,UR=at(i+1,j-1)!==id,BL=at(i-1,j+1)!==id,BR=at(i+1,j+1)!==id;
   for(let y=0;y<TILE;y++)for(let x=0;x<TILE;x++){
    let d=9;if(L)d=Math.min(d,x);if(R)d=Math.min(d,15-x);if(U)d=Math.min(d,y);if(B)d=Math.min(d,15-y);
    if(UL&&!L&&!U)d=Math.min(d,Math.max(x,y));if(UR&&!R&&!U)d=Math.min(d,Math.max(15-x,y));if(BL&&!L&&!B)d=Math.min(d,Math.max(x,15-y));if(BR&&!R&&!B)d=Math.min(d,Math.max(15-x,15-y));
    const gx=i*TILE+x,gy=j*TILE+y;if(d<3&&hash(gx,gy)>[.38,.62,.86][d])continue;
    const s=(y*TILE+x)*4,o=(gy*W+gx)*4;D[o]=P[s];D[o+1]=P[s+1];D[o+2]=P[s+2];D[o+3]=P[s+3];
   }
  }
  return image;
 }
 root.CHAO={TILE,texturas,render,key:(i,j)=>i+','+j};
})(typeof window!=='undefined'?window:globalThis);
