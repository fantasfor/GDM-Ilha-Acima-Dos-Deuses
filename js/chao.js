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
  for(const [id,t] of Object.entries(root.PAREDES_DG&&root.PAREDES_DG.texturas||{}))out[id]={...t,pacote:true}; // assoalho (js/paredes-dg.js)
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
  // o.dg: na DG o vazio é parede (com moldura), então a beira do chão encostada nela fica lisa; só serrilha entre chãos
  const D=image.data,i0=o.i0||0,j0=o.j0||0,N=W/TILE,M=(o.H||W)/TILE,outro=(i,j,id)=>{const v=tiles[i+','+j]||'';return v!==id&&!(o.dg&&!v)&&!(o.dg&&natural(v,texs))};
  for(const key of Object.keys(tiles)){
   const id=tiles[key],t=texs[id];if(!t)continue;
   if(o.dg&&natural(id,texs))continue; // chão natural (trilha de terra): desenhado depois, com a borda ondulada (bordaNatural)
   const [i,j]=key.split(',').map(Number);if(!(i-i0>=0&&j-j0>=0&&i-i0<N&&j-j0<M))continue;
   const T=pixels(t.data),P=T.p,parede=!!t.parede,L=outro(i-1,j,id),R=outro(i+1,j,id),U=outro(i,j-1,id),B=outro(i,j+1,id);
   const UL=outro(i-1,j-1,id),UR=outro(i+1,j-1,id),BL=outro(i-1,j+1,id),BR=outro(i+1,j+1,id);
   for(let y=0;y<TILE;y++)for(let x=0;x<TILE;x++){
    let d=9;if(L)d=Math.min(d,x);if(R)d=Math.min(d,15-x);if(U)d=Math.min(d,y);if(B)d=Math.min(d,15-y);
    if(UL&&!L&&!U)d=Math.min(d,Math.max(x,y));if(UR&&!R&&!U)d=Math.min(d,Math.max(15-x,y));if(BL&&!L&&!B)d=Math.min(d,Math.max(x,15-y));if(BR&&!R&&!B)d=Math.min(d,Math.max(15-x,15-y));
    const gx=(i-i0)*TILE+x,gy=(j-j0)*TILE+y;if(!parede&&d<3&&hash(gx+i0*TILE,gy+j0*TILE)>[.38,.62,.86][d])continue; // parede pintada: sem borda serrilhada
    const wx=i*TILE+x,wy=j*TILE+y,s=(((wy%T.h)+T.h)%T.h*T.w+((wx%T.w)+T.w)%T.w)*4,o=(gy*W+gx)*4;D[o]=P[s];D[o+1]=P[s+1];D[o+2]=P[s+2];D[o+3]=P[s+3];
   }
  }
  if(o.dg)bordaNatural(D,W,N,M,i0,j0,tiles,texs);
  return image;
 }
 /* Chãos naturais nas DGs (2026-10-30, pedido do usuário: caminho de terra da DG nível 10 mais natural): em vez do quadrado do
    ladrilho, a beira sai de um campo suave entre os centros dos ladrilhos (esquinas em escada viram curvas) cortado por um
    ruído: ondula para dentro e para fora do chão vizinho. Onde a trilha recua, aparece o chão vizinho mais forte (ou o piso da DG). */
 const NATURAIS=new Set(['pk_fn_trilha']);
 function natural(id,texs){return !!id&&(NATURAIS.has(id)||!!(texs[id]&&texs[id].natural))}
 function ruidoSuave(x,y,c){const a=x/c,b=y/c,i=Math.floor(a),j=Math.floor(b),S=t=>t*t*(3-2*t),U=S(a-i),V=S(b-j),H=(p,q)=>hash(p*7919+31,q*104729+17);
  return (H(i,j)*(1-U)+H(i+1,j)*U)*(1-V)+(H(i,j+1)*(1-U)+H(i+1,j+1)*U)*V}
 function bordaNatural(D,W,N,M,i0,j0,tiles,texs){
  const chao=v=>!!v&&!(texs[v]&&texs[v].parede),alvo=new Set(),S=t=>t*t*(3-2*t),H2=TILE/2;
  for(const k in tiles){if(!natural(tiles[k],texs))continue;const [i,j]=k.split(',').map(Number);for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const q=(i+di)+','+(j+dj);if(chao(tiles[q]))alvo.add(q)}}
  const pinta=(o,id,wx,wy)=>{const t=texs[id];if(!t){D[o+3]=0;return}const T=pixels(t.data),P=T.p,s=(((wy%T.h)+T.h)%T.h*T.w+((wx%T.w)+T.w)%T.w)*4;D[o]=P[s];D[o+1]=P[s+1];D[o+2]=P[s+2];D[o+3]=P[s+3]};
  for(const q of alvo){
   const [i,j]=q.split(',').map(Number);if(!(i-i0>=0&&j-j0>=0&&i-i0<N&&j-j0<M))continue;const nat=natural(tiles[q],texs);
   for(let y=0;y<TILE;y++)for(let x=0;x<TILE;x++){
    const wx=i*TILE+x,wy=j*TILE+y,a=(wx+.5-H2)/TILE,b=(wy+.5-H2)/TILE,ia=Math.floor(a),ib=Math.floor(b),U=S(a-ia),V=S(b-ib);
    const cs=[tiles[ia+','+ib],tiles[(ia+1)+','+ib],tiles[ia+','+(ib+1)],tiles[(ia+1)+','+(ib+1)]],w=[(1-U)*(1-V),U*(1-V),(1-U)*V,U*V];
    let id=null,f=0,viz=null,fv=0;
    for(let k=0;k<4;k++){const v=cs[k];if(!v)continue;let s=0;for(let m=0;m<4;m++)if(cs[m]===v)s+=w[m];if(natural(v,texs)){if(s>f){f=s;id=v}}else if(chao(v)&&s>fv){fv=s;viz=v}}
    if(!id)continue;
    const o=(((j-j0)*TILE+y)*W+(i-i0)*TILE+x)*4,limiar=.5+(ruidoSuave(wx,wy,10)-.5)*.75+(hash(wx,wy)-.5)*.08;
    if(f>limiar)pinta(o,id,wx,wy);else if(nat){if(viz)pinta(o,viz,wx,wy);else D[o+3]=0} // trilha recuou: chão vizinho (sem textura = piso da DG por baixo)
   }
  }
 }
 /* ---------- Chão pintado das DGs ----------
    config.chao = {"i,j": id} (pode ter coordenadas negativas); '@dg' = ladrilho de chão da própria DG (tema ou arte própria).
    O que não está pintado é parede: a camada já traz as paredes nas bordas da pintura. */
 function dgCaixa(tiles){let i0=Infinity,j0=Infinity,i1=-Infinity,j1=-Infinity;for(const k in tiles){const [i,j]=k.split(',').map(Number);if(i<i0)i0=i;if(j<j0)j0=j;if(i>i1)i1=i;if(j>j1)j1=j}return i1<i0?null:{i0,j0,i1,j1,x:i0*TILE,y:j0*TILE,w:(i1-i0+1)*TILE,h:(j1-j0+1)*TILE}}
 /* Paredes no estilo de interior (2026-10-24, pedidos do usuário):
    - face da parede em visão 3/4 com 2 ladrilhos (32 px) de altura, o pé do desenho no pé da face, quinas escuras nas pontas
      e sombra no chão logo abaixo;
    - moldura grossa (borda) em volta do chão e da face, por fora da área andável: desenho próprio (art.borda; padrão do
      tema), contorno escuro por fora, brilho logo dentro dele e friso escuro encostado no chão; largura em px
      (config.bordaLargura, até 16);
    - estilos por chão (config.estilosParede): a parede e a moldura em volta de um chão podem ter outro desenho
      (ex.: cripta onde o chão é de esqueletos). estilos = {idDoChao: {parede, borda}} (canvas). */
 /* camada da DG na paleta do jogo (2026-10-30): o chão, as paredes e as bordas já montados */
function dgCamada(...a){const r=dgCamadaBruta(...a);if(r&&r.c&&root.PALETA_JOGO)root.PALETA_JOGO.canvasNaPaleta(r.c);return r}
function dgCamadaBruta(tiles,texs,{piso,parede,borda,largura,cores,estilos}){
  const cx=dgCaixa(tiles);if(!cx)return null;
  const i0=cx.i0-1,j0=cx.j0-3,W=(cx.i1-cx.i0+3)*TILE,H=(cx.j1-cx.j0+5)*TILE; // folga: 2 ladrilhos da face da parede + 1 da borda em cima, 1 de borda nos outros lados
  const c=root.document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  g.putImageData(render(g.createImageData(W,H),W,tiles,texs,{i0,j0,H,dg:true}),0,0);
  g.save();g.translate(-i0*TILE,-j0*TILE); // padrões alinhados ao mundo
  // ladrilho de parede pintada (textura com parede) não conta como chão: a borda da parede é desenhada em volta dele também
  const ehParede=id=>!!(texs[id]&&texs[id].parede),tem=(i,j)=>{const id=tiles[i+','+j];return !!id&&!ehParede(id)},lista=Object.keys(tiles).map(k=>{const [i,j]=k.split(',').map(Number);return [i,j,tiles[k]]}).filter(([,,id])=>!ehParede(id));
  // ladrilho da DG por baixo de tudo: onde o serrilhado entre dois chãos deixa buracos, aparece ele (e não o vazio)
  g.globalCompositeOperation='destination-over';g.fillStyle=piso?g.createPattern(piso,'repeat'):cores.inner;for(const [i,j] of lista)g.fillRect(i*TILE,j*TILE,TILE,TILE);g.globalCompositeOperation='source-over';
  const b=Math.max(0,Math.min(16,Math.round(largura==null?6:+largura||0)));
  const est=estilos||{},estDe=id=>est[id]?id:'',pats={},padrao=(img,ctx)=>img?(ctx===g?(pats[img.__id||(img.__id=Math.random())]||(pats[img.__id]=g.createPattern(img,'repeat'))):ctx.createPattern(img,'repeat')):null;
  const faceDe=k=>k&&est[k].parede||parede,bordaDe=k=>(k&&(est[k].borda||est[k].parede))||borda||parede;
  const ocupa=new Map(Object.keys(tiles).map(k=>[k,estDe(tiles[k])])),face=new Set(),animFaces=[]; // chão, pinturas de parede e face: a borda fica por fora disso
  for(const [i,j,id] of lista){const x=i*TILE,y=j*TILE;
   // parede de cima em visão 3/4: a face inteira com o desenho todo da parede; se ali já há uma pintura de parede do projeto, vale a pintura
   // face com 2 ladrilhos de altura (1 se logo acima já houver chão); o pé do desenho fica no pé da face
   if(!tem(i,j-1)&&!ehParede(tiles[i+','+(j-1)])){const n=tem(i,j-2)?1:2,k=estDe(id);g.save();g.translate(0,y);g.fillStyle=padrao(faceDe(k),g)||cores.wall;g.fillRect(x,-n*TILE,TILE,n*TILE);g.restore();if(faceDe(k)&&faceDe(k).__anim)animFaces.push({x,y,n,i,j:j-1,img:faceDe(k)});
    for(let s=1;s<=n;s++){ocupa.set(i+','+(j-s),k);face.add(i+','+(j-s))}
    g.fillStyle='rgba(0,0,0,.22)';g.fillRect(x,y,TILE,2);g.fillStyle='rgba(0,0,0,.1)';g.fillRect(x,y+2,TILE,2)}} // sombra da parede no chão
  for(const k of face){const [i,j]=k.split(',').map(Number),x=i*TILE,y=j*TILE; // quinas: a face escurece onde termina
   g.fillStyle='rgba(0,0,0,.3)';if(!ocupa.has((i-1)+','+j))g.fillRect(x,y,2,TILE);if(!ocupa.has((i+1)+','+j))g.fillRect(x+TILE-2,y,2,TILE)}
  g.restore();
  if(b){ // máscara = cada ladrilho ocupado crescido b px (cantos fechados sozinhos); moldura = máscara menos os ladrilhos
   const m=root.document.createElement('canvas');m.width=W;m.height=H;const gm=m.getContext('2d');gm.translate(-i0*TILE,-j0*TILE);gm.fillStyle='#fff';
   for(const k of ocupa.keys()){const [i,j]=k.split(',').map(Number);gm.fillRect(i*TILE-b,j*TILE-b,TILE+2*b,TILE+2*b)}
   const contorno=gm.getImageData(0,0,W,H).data; // guardada antes de pintar: dá o lado de fora da moldura
   gm.globalCompositeOperation='source-in';gm.fillStyle=padrao(bordaDe(''),gm)||cores.wall;gm.fillRect(i0*TILE,j0*TILE,W,H);
   gm.globalCompositeOperation='source-atop'; // estilos por chão: a moldura em volta deles com o desenho deles
   for(const k of Object.keys(est)){const p=padrao(bordaDe(k),gm);if(!p)continue;gm.fillStyle=p;for(const [q,e] of ocupa)if(e===k){const [i,j]=q.split(',').map(Number);gm.fillRect(i*TILE-b,j*TILE-b,TILE+2*b,TILE+2*b)}}
   gm.globalCompositeOperation='destination-out';for(const k of ocupa.keys()){const [i,j]=k.split(',').map(Number);gm.fillRect(i*TILE,j*TILE,TILE,TILE)}
   gm.setTransform(1,0,0,1,0,0);gm.globalCompositeOperation='source-over';
   const img=gm.getImageData(0,0,W,H),d=img.data,sh=/^#([0-9a-f]{6})$/i.exec(cores.shadow||'')?parseInt(cores.shadow.slice(1),16):0;
   const dentro=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&contorno[(y*W+x)*4+3]>0,ocupado=(x,y)=>ocupa.has((Math.floor(x/TILE)+i0)+','+(Math.floor(y/TILE)+j0));
   const fora=(x,y,r)=>!dentro(x-r,y)||!dentro(x+r,y)||!dentro(x,y-r)||!dentro(x,y+r),junto=(x,y)=>ocupado(x-1,y)||ocupado(x+1,y)||ocupado(x,y-1)||ocupado(x,y+1);
   for(let y=0;y<H;y++)for(let x=0;x<W;x++){const o=(y*W+x)*4;if(!d[o+3])continue;
    if(fora(x,y,1)){d[o]=sh>>16&255;d[o+1]=sh>>8&255;d[o+2]=sh&255;d[o+3]=255} // contorno escuro por fora
    else if(junto(x,y))for(let k=0;k<3;k++)d[o+k]=d[o+k]*.5; // friso escuro encostado no chão e na parede
    else if(fora(x,y,2))for(let k=0;k<3;k++)d[o+k]=d[o+k]+(255-d[o+k])*.28} // brilho logo dentro do contorno
   gm.putImageData(img,0,0);g.drawImage(m,0,0);
  }
  // piso e parede animados: o quadro 0 fica na camada; dgAnimar redesenha por cima só o que se mexe
  const animChao=Object.keys(tiles).filter(k=>texs[tiles[k]]&&quadros(texs[tiles[k]].data).length).map(k=>{const [i,j]=k.split(',').map(Number);return{i,j,id:tiles[k],sombra:face.has(i+','+(j-1))}}); // ladrilho da DG ('@dg') animado: o desenho do piso da DG tem quadros
  if(piso&&piso.__anim)for(const [i,j,id] of lista)if(id==='@dg')animChao.push({i,j,id,piso:true,sombra:face.has(i+','+(j-1))});
  return{c,x:i0*TILE,y:j0*TILE,anim:animChao.length||animFaces.length?{chao:animChao,faces:animFaces,tiles,texs,ocupa,cache:new Map(),dg:true,piso}:null};
 }
 /* ---------- Piso e parede animados (2026-10-24, pedido do usuário) ----------
    O desenho de uma textura de chão ou de uma face de parede pode ter anim = {idle: [quadros], durations: {idle: segundos}}
    — o mesmo formato da linha do tempo do editor de sprites da Engine (aba Parado). Sem quadros, fica parado. */
 function quadros(data){const a=data&&data.anim;return a&&Array.isArray(a.idle)?a.idle.filter(q=>q&&q.pixels&&q.w===data.w&&q.h===data.h):[]}
 function ciclo(data,n){const d=data&&data.anim&&data.anim.durations;return Math.max(.05,+(d&&d.idle)||n*.25)}
 function quadroEm(data,t){const f=quadros(data);if(!f.length)return{i:0,data};const i=Math.floor(t/ciclo(data,f.length)*f.length)%f.length;return{i,data:f[i]}}
 // canvas de um desenho com os quadros já convertidos (canvas.__anim), para a face de parede animada
 function comAnim(canvas,data,toCanvas){const f=quadros(data);if(canvas&&f.length&&!canvas.__anim)canvas.__anim={quadros:f.map(toCanvas),ciclo:ciclo(data,f.length)};return canvas}
 /* Redesenha por cima da camada da DG (dgCamada) o que é animado e está à vista. vis = {x0, y0, x1, y1} em px do mundo. */
 // chão pintado da ilha: só os ladrilhos animados (água do rio...), com a borda serrilhada da ilha (dg:false)
 function animados(tiles,texs){const chao=Object.keys(tiles).filter(k=>texs[tiles[k]]&&quadros(texs[tiles[k]].data).length).map(k=>{const [i,j]=k.split(',').map(Number);return{i,j,id:tiles[k]}});return chao.length?{anim:{chao,faces:[],tiles,texs,ocupa:new Map(),cache:new Map(),dg:false}}:null}
 function dgAnimar(g,cam,t,vis){
  const A=cam&&cam.anim;if(!A)return;
  const fora=(x,y,w,h)=>vis&&(x+w<vis.x0||x>vis.x1||y+h<vis.y0||y>vis.y1);
  for(const a of A.chao){
   const x=a.i*TILE,y=a.j*TILE;if(fora(x,y,TILE,TILE))continue;
   if(a.piso){const an=A.piso.__anim,i=Math.floor(t/an.ciclo*an.quadros.length)%an.quadros.length,img=an.quadros[i];if(!img)continue; // piso da DG: o quadro em padrão alinhado ao mundo
    img.__pat=img.__pat||new WeakMap();let pat=img.__pat.get(g);if(!pat){pat=g.createPattern(img,'repeat');img.__pat.set(g,pat)}g.fillStyle=pat;g.fillRect(x,y,TILE,TILE);
    if(a.sombra){g.fillStyle='rgba(0,0,0,.22)';g.fillRect(x,y,TILE,2);g.fillStyle='rgba(0,0,0,.1)';g.fillRect(x,y+2,TILE,2)}continue}
   const tex=A.texs[a.id],q=quadroEm(tex.data,t),k=a.i+','+a.j+','+q.i;
   let c=A.cache.get(k);
   if(!c){ // o ladrilho com o quadro, usando o mesmo serrilhado das bordas (o vizinho decide)
    const sub={};for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const kk=(a.i+di)+','+(a.j+dj);if(A.tiles[kk])sub[kk]=A.tiles[kk]}
    c=root.document.createElement('canvas');c.width=c.height=TILE;const gc=c.getContext('2d');
    gc.putImageData(render(gc.createImageData(TILE,TILE),TILE,sub,{...A.texs,[a.id]:{...tex,data:q.data}},{i0:a.i,j0:a.j,H:TILE,dg:A.dg!==false}),0,0);
    if(a.sombra){gc.fillStyle='rgba(0,0,0,.22)';gc.fillRect(0,0,TILE,2);gc.fillStyle='rgba(0,0,0,.1)';gc.fillRect(0,2,TILE,2)}
    A.cache.set(k,c);
   }
   g.drawImage(c,x,y);
  }
  for(const f of A.faces){
   if(fora(f.x,f.y-f.n*TILE,TILE,f.n*TILE))continue;
   const an=f.img.__anim,i=Math.floor(t/an.ciclo*an.quadros.length)%an.quadros.length,img=an.quadros[i];if(!img)continue;
   img.__pat=img.__pat||new WeakMap();let pat=img.__pat.get(g);if(!pat){pat=g.createPattern(img,'repeat');img.__pat.set(g,pat)}
   g.save();g.translate(0,f.y);g.fillStyle=pat;g.fillRect(f.x,-f.n*TILE,TILE,f.n*TILE);g.restore();
   g.fillStyle='rgba(0,0,0,.3)';for(let s=1;s<=f.n;s++){const yy=f.y-s*TILE;if(!A.ocupa.has((f.i-1)+','+(f.j+1-s)))g.fillRect(f.x,yy,2,TILE);if(!A.ocupa.has((f.i+1)+','+(f.j+1-s)))g.fillRect(f.x+TILE-2,yy,2,TILE)}
  }
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
 /* Parede da DG de floresta: um maciço de árvores (copas arredondadas umas na frente das outras, com luz em cima à
    esquerda, folhas soltas, troncos e sombra no pé). 64×32 (o máximo do formato de pixel art) (2026-10-24: antes 32×16, repetia demais): três fileiras de copas
    sorteadas, emenda dos lados; o pé do desenho fica no pé da face da parede (2 ladrilhos de altura). */
 const PAL_FLOR=['#0e1a10','#2a5228','#3f7a34','#5fa343','#8fd05e','#4a2e14','#7a5028','#18281a','#c4f088']; // tons claros: a DG escurece tudo
 function copasFloresta(W,H,copas,pe){ // pe: {y, troncos} na parede (pé com troncos); null na borda (emenda em cima e embaixo também)
  const px=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
   let melhor=null;
   for(const [cx,cy,r] of copas){let dx=x+.5-cx;if(dx>W/2)dx-=W;if(dx<-W/2)dx+=W;let dy=y+.5-cy;if(!pe){if(dy>H/2)dy-=H;if(dy<-H/2)dy+=H}const d=Math.hypot(dx,dy*1.08),borda=r+(hash(x*3+cx,y*5)-.5)*1.2;
    if(d<borda&&(!melhor||cy>melhor.cy))melhor={cx,cy,r,dx,dy,d,borda}}
   let c=pe?0:7;
   if(melhor){const {dx,dy,d,borda,r}=melhor,luz=(dx+dy)/r;
    c=d>borda-1.1?1:luz<-.75?4:luz<-.2?3:2;
    const n=hash(x*7+1,y*13+2);if(c===2&&n<.18)c=1;else if(c===3&&n<.15)c=4;else if(c===4&&n<.12)c=8;else if(c===2&&n>.9)c=3}
   else if(pe&&y>=pe.y){const tr=pe.troncos.some(t=>{const e=Math.abs(x+.5-t);return Math.min(e,W-e)<1.6});c=tr?((x%2)?5:6):7}
   if(pe&&y===H-1&&c!==5&&c!==6)c=hash(x,9)<.5?7:0;
   px.push(c.toString(36))}
  return {w:W,h:H,q:1,palette:PAL_FLOR,pixels:px.join('')};
 }
 let paredeFlor=null,bordaFlor=null;
 function paredeFloresta(){
  if(paredeFlor)return paredeFlor;
  const W=64,H=32,copas=[],r=(k,s)=>hash(k*31+s,s*17+5);
  for(let k=0;k<6;k++)copas.push([k*W/6+r(k,1)*5,5+r(k,2)*3,6.2+r(k,3)*1.6]);        // fundo
  for(let k=0;k<5;k++)copas.push([k*W/5+5+r(k,4)*4,12.5+r(k,5)*2.5,6+r(k,6)*1.6]);   // meio
  const frente=[];for(let k=0;k<5;k++){const c=[k*W/5+3+r(k,7)*5,19+r(k,8)*1.5,5.4+r(k,9)*1.4];copas.push(c);frente.push(c[0])}
  return paredeFlor=copasFloresta(W,H,copas,{y:25,troncos:frente});
 }
 /* Borda da DG de floresta: mata fechada, só copas, emenda nos 4 lados (16×16). */
 function bordaFloresta(){
  if(bordaFlor)return bordaFlor;
  return bordaFlor=copasFloresta(16,16,[[3,3,4.6],[11,2,4.4],[7,8.5,4.8],[15,9,4.2],[2,13,4.4],[10,14.5,4.6]],null);
 } root.CHAO={TILE,texturas,render,key:(i,j)=>i+','+j,dgCaixa,dgCamada,dgAnimar,animados,quadros,quadroEm,comAnim,dgDeSalas,ILHA_V,ILHA_DESLOC,migrarIlha,paredeFloresta,bordaFloresta};
})(typeof window!=='undefined'?window:globalThis);
