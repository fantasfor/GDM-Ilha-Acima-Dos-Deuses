/* ---------- pixel art ---------- */
function shade(h,f){const n=parseInt(h.slice(1),16),c=v=>Math.max(0,Math.min(255,Math.round(v*f)));return '#'+[n>>16&255,n>>8&255,n&255].map(v=>c(v).toString(16).padStart(2,'0')).join('')}
function mkCanvas(w,h,q=1){const c=document.createElement('canvas');c.width=w;c.height=h;c.q=q;return c}
function pixelArt(data){
 if(!data||!Array.isArray(data.palette)||typeof data.pixels!='string')return null;
 const w=Math.max(1,Math.min(64,Math.floor(+data.w||32))),h=Math.max(1,Math.min(64,Math.floor(+data.h||32)));
 if(data.pixels.length!==w*h)return null;
 // padrão 1:1 (js/proporcao.js): todo desenho vale 1 pixel = 1 pixel do mundo; a marca antiga "2×" (q:2) é ignorada
 const c=mkCanvas(w,h),x=c.getContext('2d'),im=x.createImageData(w,h);
 for(let i=0;i<data.pixels.length;i++){const col=data.palette[parseInt(data.pixels[i],36)];if(!/^#[0-9a-f]{6}$/i.test(col||''))continue;
  const n=parseInt(col.slice(1),16),p=i*4;im.data[p]=n>>16&255;im.data[p+1]=n>>8&255;im.data[p+2]=n&255;im.data[p+3]=255}
 if(typeof data.glow==='string'&&data.glow.length===w*h&&data.glow.includes('1')){
  const light=mkCanvas(w,h),g=light.getContext('2d'),radius=Math.max(1,Math.min(8,Number(data.glowRadius)||3));
  for(let i=0;i<w*h;i++)if(data.glow[i]==='1'&&im.data[i*4+3]){
   const col=data.palette[parseInt(data.pixels[i],36)];g.fillStyle=col;g.shadowColor=col;g.shadowBlur=radius;
   g.fillRect(i%w,Math.floor(i/w),1,1);
  }
  x.drawImage(light,0,0);
  const original=mkCanvas(w,h);original.getContext('2d').putImageData(im,0,0);x.drawImage(original,0,0);
 }else x.putImageData(im,0,0);
 if(+data.pad>0)c.pad=+data.pad; // folga lateral (quadro mais largo que o corpo): a sombra fica do tamanho do corpo
 c.pixelData=data;return c
}
function half(c){const w=c.width>>1,h=c.height>>1,o=mkCanvas(w,h),x=o.getContext('2d'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,im=x.createImageData(w,h);for(let j=0;j<h;j++)for(let i=0;i<w;i++)for(const [a,b] of [[0,0],[1,1],[1,0],[0,1]]){const s=((j*2+b)*c.width+i*2+a)*4;if(d[s+3]>=128){const t=(j*w+i)*4;im.data[t]=d[s];im.data[t+1]=d[s+1];im.data[t+2]=d[s+2];im.data[t+3]=255;break}}x.putImageData(im,0,0);return o}
function kit(x){
 const R=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a,b,w,h)};
 const box=(a,b,w,h,col)=>{R(a-1,b-1,w+2,h+2,'#161022');R(a,b,w,h,col);R(a,b,w,1,shade(col,1.3));R(a,b,1,h,shade(col,1.15));R(a,b+h-1,w,1,shade(col,.7));R(a+w-1,b,1,h,shade(col,.8))};
 const disc=(cx,cy,r,col)=>{x.fillStyle=col;for(let py=cy-r;py<=cy+r;py++)for(let px=cx-r;px<=cx+r;px++)if((px-cx)*(px-cx)+(py-cy)*(py-cy)<=r*r+r*.5)x.fillRect(px,py,1,1)};
 return{R,box,disc}}
/* Árvore e tenda originais, em 1:1 (1 pixel = 1 pixel do mundo) */
const TREE=(()=>{const c=mkCanvas(30,26),{box,disc}=kit(c.getContext('2d'));
 const L=[[15,9,8],[8,13,6],[22,13,6],[15,14,7]];
 box(12,17,6,8,'#7a4a25');
 L.forEach(([a,b,r])=>disc(a,b,r+1,'#10301a'));
 L.forEach(([a,b,r])=>disc(a,b,r,'#2d7a37'));
 L.forEach(([a,b,r])=>disc(a-1,b-2,r-2,'#3f9a47'));
 L.forEach(([a,b,r])=>disc(a-2,b-3,Math.max(1,r>>2),'#6cc06a'));
 return c})();
const TENT=(()=>{const c=mkCanvas(64,36),x=c.getContext('2d');
 const row=(y,from,to,col)=>{x.fillStyle=col;x.fillRect(32+from,y,to-from+1,1)};
 for(let y=1;y<=35;y++){const hw=Math.round(Math.max(0,y-2)*30/32)+1;row(y,-hw,hw,'#3a1410')}
 for(let y=2;y<=34;y++){const hw=Math.round((y-2)*30/32);row(y,-hw,-1,'#c0392b');row(y,0,hw,'#a02f23');row(y,-hw,-hw+1,'#e0584a')}
 for(let y=27;y<=28;y++){const hw=Math.round((y-2)*30/32);row(y,-hw,hw,'#ecf0f1')}
 for(let y=18;y<=34;y++){const hw=Math.round((y-18)*9/16);row(y,-hw,hw,'#2a0e0b')}
 return c})();
function potion(l,h,d){const c=mkCanvas(16,16),{R,box,disc}=kit(c.getContext('2d'));
 disc(8,9,6,'#161022');disc(8,9,5,d);disc(8,10,4,l);R(5,8,2,1,h);R(5,9,1,2,h);R(9,12,3,1,shade(l,.8));
 box(6,2,4,3,'#cfe8f0');box(6,1,4,2,'#a67c52');
 return c}
function swordIcon(){const c=mkCanvas(16,16),{R}=kit(c.getContext('2d'));
 for(let i=0;i<10;i++)R(12-i,1+i,4,4,'#161022');
 for(let j=-3;j<=3;j++)R(3+j,8+j,4,4,'#161022');
 for(let i=0;i<4;i++)R(2-i+1,11+i,3,3,'#161022');
 for(let i=0;i<10;i++){R(13-i,2+i,2,2,'#e6e6f0');R(13-i,2+i,1,1,'#ffffff');R(14-i,3+i,1,1,'#9aa7b8')}
 for(let j=-3;j<=3;j++)R(4+j,9+j,2,2,'#c9a227');
 for(let i=0;i<3;i++)R(3-i,12+i,2,2,'#7a4a25');
 R(0,14,2,2,'#e6c24a');
 return c}
function shieldIcon(){const c=mkCanvas(16,16),{R,box}=kit(c.getContext('2d'));
 box(6,11,4,3,'#9fb4c8');box(4,9,8,3,'#9fb4c8');box(3,2,10,8,'#9fb4c8');
 R(7,4,2,8,'#d9a62e');R(5,6,6,2,'#d9a62e');R(4,3,2,1,'#e8f2fa');
 return c}
/* Arma desenhada em linha a partir da mão (hx,hy) com ângulo deg; st: 0 espada, 1 machado, 2 cajado */
function drawWeapon(R,st,c,hx,hy,deg,L,z){
 const a=deg*Math.PI/180,co=Math.cos(a),si=Math.sin(a),bw=z>1?1:0,
  P=(t,o)=>[Math.round(hx+co*t-si*o),Math.round(hy+si*t+co*o)],
  parts=st==1?[[0,L,0,0,'#7a4a25'],[L-7,L-1,1,3*z,c[0]]]:st==2?[[0,L,0,0,c[0]],[L,L+2*z,-z,z,c[1]]]:[[0,2,0,0,'#6b3b1f'],[3,3,-2*z,2*z,c[1]],[4,L,-bw,bw,c[0]]];
 for(const k of [1,0])for(const [t0,t1,o0,o1,col] of parts)for(let t=t0;t<=t1;t++)for(let o=o0;o<=o1;o++){const [x,y]=P(t,o);k?R(x-1,y-1,z+2,z+2,'#161022'):R(x,y,z,z,col)}}
function weaponIcon(st,c){const cv=mkCanvas(16,16),{R}=kit(cv.getContext('2d'));drawWeapon(R,st,c,2,14,-45,st==2?12:14,1);return cv}
function sawToolSprite(){
 const c=mkCanvas(18,8),{R}=kit(c.getContext('2d'));
 R(0,1,6,6,'#42291a');R(1,2,4,4,'#a97138');R(1,2,3,1,'#d2a15e');
 R(5,2,12,4,'#3f474d');R(6,2,11,2,'#d7e0df');R(16,1,2,2,'#d7e0df');
 for(let x=7;x<16;x+=2)R(x,4,1,2,'#f0e5c8');
 R(6,5,10,1,'#879397');return c
}
function sawToolIcon(){
 const c=mkCanvas(16,16),x=c.getContext('2d'),tool=sawToolSprite();
 x.save();x.translate(1,5);x.rotate(-Math.PI/5);x.imageSmoothingEnabled=false;x.drawImage(tool,0,0,14,6);x.restore();return c
}
function woodIcon(magic=false){
 const c=mkCanvas(16,16),{R,disc}=kit(c.getContext('2d'));
 R(3,4,10,8,'#58371d');R(4,4,8,7,'#a6743c');R(4,5,8,2,'#cf9955');R(5,10,7,1,'#724522');
 disc(3,8,4,'#4d301a');disc(3,8,3,'#d4a564');disc(3,8,1,'#9b6937');R(8,7,4,1,'#785029');
 if(magic){R(6,5,1,5,'#bb88ff');R(7,8,4,1,'#ead5ff');R(12,2,1,3,'#b2ffff');R(11,3,3,1,'#b2ffff');R(1,12,2,2,'#bb88ff')}
 return c
}
const ITEMS={
 hp:{n:'Poção de Vida (cura 80)',c:potion('#e03c3c','#ff9a9a','#8f1f2a'),use:1,heal:{hp:80}},
 mp:{n:'Poção de Mana (+60)',c:potion('#3c7be0','#9ac4ff','#1f3f8f'),use:1,heal:{mp:60}},
 sw:{n:'Espada (+8 dano)',dmg:8,c:swordIcon()},
 sh:{n:'Escudo (+40 vida máx.)',hp:40,c:shieldIcon()}
};
/* Equipamentos: slot → 3 variações [id, nome, [cor principal, cor de destaque], estilo, atributos] */
const SLOT_LABEL={he:'Capacete',ch:'Peito',le:'Calça',bo:'Bota',ca:'Capa',r1:'Anel 1',r2:'Anel 2',ne:'Colar',sw:'Mão 1',sh:'Mão 2'};
const gearType={sw:'sw',sh:'sh'};
const GEAR={
 he:[['he1','Capacete de Ferro',['#9aa7b8','#c0392b'],0,{arm:3}],['he2','Elmo Alado',['#d9a62e','#f2f2f2'],1,{arm:5,hp:20}],['he3','Capuz Sombrio',['#4a2f7a','#9b6bff'],2,{arm:2,mp:20}]],
 ch:[['ch1','Peitoral de Ferro',['#8a97aa','#8a2f2f'],0,{arm:6}],['ch2','Armadura Dourada',['#d9a62e','#8a2f2f'],1,{arm:9,hp:30}],['ch3','Túnica de Couro',['#8a5a30','#e0c080'],2,{arm:4,spd:.05}]],
 le:[['le1','Calça de Couro',['#7a4a25','#c9a060'],0,{arm:3}],['le2','Grevas de Aço',['#9aa7b8','#e6e6f0'],1,{arm:5}],['le3','Calça Real',['#2a4fa0','#f2d24a'],2,{arm:3,mp:15}]],
 bo:[['bo','Botas de Couro',['#a0622d','#c98a4f'],0,{spd:.25}],['bo2','Botas de Aço',['#8a97aa','#e6e6f0'],1,{spd:.1,arm:3}],['bo3','Botas Élficas',['#2f7a43','#d9e8a0'],2,{spd:.35}]],
 ca:[['ca1','Capa Vermelha',['#b8232f','#e0b030'],0,{arm:2}],['ca2','Capa Élfica',['#2f7a43','#c9d98a'],1,{spd:.05,arm:1}],['ca3','Manto Negro',['#2b2b3a','#7a5bd0'],2,{arm:2,mp:20}]],
 ri:[['ri1','Anel de Força',['#d9a62e','#e03c3c'],0,{dmg:4}],['ri2','Anel de Vida',['#c0c0d0','#3fb86a'],1,{hp:30}],['ri3','Anel Arcano',['#9b6bff','#3c7be0'],2,{mp:25}]],
 ne:[['ne1','Colar de Presa',['#e0d8c0','#f2f2f2'],0,{arm:2,dmg:2}],['ne2','Amuleto de Rubi',['#d9a62e','#e03c3c'],1,{hp:25,arm:1}],['ne3','Pingente de Safira',['#c0c0d0','#3c7be0'],2,{mp:30}]]
};
/* Ícones de equipamento 16×16 (padrão de ícone, js/proporcao.js): d contorno, m cor principal, h luz, s sombra, a/g destaque, w brilho */
const IC_SHAPE={"he":[["................","......aaa.......",".....aaaa.......","....dddddddd....","...dhhmmmmmmd...","..dhmmmmmmmmsd..","..dhmmmmmmmmsd..","..dmmmmmmmmmsd..","..dddddddddddd..","..dmmd....dmsd..","..dmmd....dmsd..","..dmmd....dmsd..","...dmd....dsd...","...ddd....ddd...","................","................"],["................","a..............a","aa...dddddd...aa","aaa.dhhmmmmd.aaa",".aaadhmmmmmmdaa.","..aadmmmmmmmsda.","...dmmmmmmmmsd..","...dmmddddmmsd..","...dmd....dmsd..","...dmd....dmsd..","...dmd....dmsd..","...dsd....dssd..","...ddd....dddd..","................","................","................"],["................","......dddd......",".....dhmmmd.....","....dhmmmmmd....","...dhmmmmmmmd...","...dmmmmmmmmsd..","..dmmmsssssmmsd.","..dmmsd...dsmsd.","..dmmd.....dmsd.","..dmmd.....dmsd.","..dmmsd...dsmsd.","..dmmmsddddmmsd.","...dmmmmmmmmsd..","....ddddddddd...","................","................"]],"ch":[["................","...ddd....ddd...","..dhmmd..dmmsd..","..dhmmmddmmmsd..","..dhmmmmmmmmsd..","...dhmmmmmmsd...","...dmmhmmmmsd...","...dmmmmmmmsd...","...daaaaaaaad...","...dmmmmmmmsd...","...dmmmmmmmsd...","....dmmmmmsd....",".....dddddd.....","................","................","................"],["................",".dddd......dddd.","dhmmmd....dmmmsd","dhmmmmddddmmmmsd",".ddhmmmmmmmmmsd.","...dhmaammmmsd..","...dmmaammmmsd..","...dmmmmmmmmsd..","...dmmaammmmsd..","...dmmmmmmmmsd..","....dmmmmmmsd...","....dddddddd....","................","................","................","................"],["................","...dd......dd...","..dmmd....dmmd..",".dhmmmddddmmmsd.",".dhmmmmaammmmsd.",".ddmmmmmammmmdd.","..dmmmmaammmsd..","..dmmmmmammmsd..","..dmmmmaammmsd..","..dmmmmmmmmmsd..","..dmmmmmmmmmsd..","..dsmmmmmmmmsd..","..dddddddddddd..","................","................","................"]],"le":[["................","...dddddddddd...","...daaaaaaaad...","...dhmmmmmmsd...","...dhmmddmmsd...","...dhmmddmmsd...","...dhmd..dmsd...","...dhmd..dmsd...","...dhmd..dmsd...","...dhmd..dmsd...","...dhmd..dmsd...","...dssd..dssd...","...dddd..dddd...","................","................","................"],["................","...dddddddddd...","...dhmmmmmmsd...","...dhmmddmmsd...","...dhmd..dmsd...","...daad..daad...","...dhmd..dmsd...","...dhmd..dmsd...","...daad..daad...","...dhmd..dmsd...","...dhmd..dmsd...","...dssd..dssd...","...dddd..dddd...","................","................","................"],["................","...dddddddddd...","...daaaaaaaad...","...dhmmmmmmsd...","...dhmaddamsd...","...dhmaddamsd...","...dhad..dasd...","...dhad..dasd...","...dhad..dasd...","...dhad..dasd...","...dhad..dasd...","...dsad..dasd...","...dddd..dddd...","................","................","................"]],"bo":[["................","................","................","...dddd..dddd...","...dhmd..dmsd...","...dhmd..dmsd...","...daad..daad...","...dhmd..dmsd...","...dhmd..dmsd...","..dhmmd..dmmsd..",".dhmmmd..dmmmsd.",".dhmmmd..dmmmsd.",".ddddd....ddddd.","................","................","................"],["................","................","...dddd..dddd...","...daad..daad...","...dhmd..dmsd...","...dhmd..dmsd...","...dhmd..dmsd...","...daad..daad...","...dhmd..dmsd...","..dhmmd..dmmsd..",".dhmmmd..dmmmsd.",".dsssd....dsssd.",".ddddd....ddddd.","................","................","................"],["................","..dddd....dddd..","..daad....daad..","...dhmd..dmsd...","...dhmd..dmsd...","...dhmd..dmsd...","...dhmd..dmsd...","...dhmd..dmsd...","...dhmd..dmsd...","..dhmmd..dmmsd..",".dhmmmd..dmmmsd.",".dhmmmd..dmmmsd.",".ddddd....ddddd.","................","................","................"]],"ca":[["................",".....dddddd.....","....daaaaaad....","...dmmmmmmmmd...","...dhmmmmmmsd...","..dhmmmmmmmmsd..","..dhmmmmmmmmsd..","..dhmmmmmmmmsd..",".dhmmmmmmmmmmsd.",".dhmmmmmmmmmmsd.",".dhmmmmmmmmmmsd.",".dhmmmmmmmmmmsd.",".dsmmmmmmmmmmsd.",".dddddddddddddd.","................","................"],["................",".....dddddd.....","....dmaaaamd....","...dmmmmmmmmd...","...dhmmmmmmsd...","..dhmmmmmmmmsd..","..dhmmmmmmmmsd..","..dhmmmmmmmmsd..",".dhmmmmmmmmmmsd.",".dhmmmmmmmmmmsd.",".dhmmmmmmmmmmsd.",".dhmmmmmmmmmmsd.",".daaaaaaaaaaaad.",".dddddddddddddd.","................","................"],["................",".....dddddd.....","....daaaaaad....","...dmmmmmmmmd...","...dhmmmmmmsd...","..dhmmmmmmmmsd..","..dhmmmmmmmmsd..","..dhmmmmmmmmsd..",".dhmmmmmmmmmmsd.",".dhmmmmmmmmmmsd.",".dhmmmmmmmmmmsd.",".dhmdmmdmmdmmsd.",".dmd.dd.dd.dmsd.",".dd..d..d...dd..","................","................"]],"ri":[["................","................","......dddd......",".....daggad.....",".....dgwgad.....","......dggd......",".....dddddd.....","....dmhhmmsd....","...dmhd..dmsd...","...dmd....dmd...","...dmd....dmd...","...dmsd..dmsd...","....dmmmmmsd....",".....dddddd.....","................","................"]],"ne":[["................","..d..........d..","..dm........md..","...dm......md...","...dm......md...","....dm....md....","....dmm..mmd....",".....dmmmmd.....","......dddd......",".....daggad.....",".....dgwgad.....",".....dagggd.....","......dddd......","................","................","................"]]};
const gearIcon=(slot,v,st)=>{const t=slot=='ri'?'ri':slot,sh=IC_SHAPE[t];return spr(sh[Math.min(st,sh.length-1)],{d:'#161022',m:v[0],h:shade(v[0],1.45),s:shade(v[0],.7),a:v[1],g:v[1],w:'#ffffff'})};
const statTxt=o=>Object.keys(ITEM_STATS).filter(k=>o[k]).map(k=>(o[k]>0?'+':'')+itemStatValue(k,o[k])+' '+ITEM_STATS[k].text).join(', ');
for(const slot in GEAR)for(const [id,n,c,st,stats] of GEAR[slot]){ITEMS[id]={n:n+' ('+statTxt(stats)+')',...stats,c:gearIcon(slot,c,st),g:1,v:{c,st}};gearType[id]=slot}
ITEMS.sw.v={c:['#e6e6f0','#c9a227'],st:0};ITEMS.sh.v={c:['#9fb4c8','#d9a62e'],st:0};
for(const [id,n,c,st,stats] of [['sw2','Machado de Guerra',['#9aa7b8','#7a4a25'],1,{dmg:12}],['sw3','Cajado Arcano',['#7a4a25','#55ffff'],2,{dmg:4,mp:30}]]){ITEMS[id]={n:n+' ('+statTxt(stats)+')',...stats,c:weaponIcon(st,c),g:1,v:{c,st}};gearType[id]='sw'}
for(const k in ITEMS)ITEMS[k].ic=ITEMS[k].c.toDataURL(); // ícones 16×16, sem reduzir
/* Animação de armas e armaduras (Engine › item › Aparência): quadros Parado/Andando/Atacando por direção (d, u, s)
   e da arma empunhada (w). O estado vem de quem está sendo desenhado (equipEstado) e o quadro sai do relógio. */
const equipEstado={v:'idle'};
function equipAnimQuadros(item,dir){const a=item&&item.equippedAnim&&(item.equippedAnim[dir]||item.equippedAnim[dir[0]]);if(!a)return null;const q=a[equipEstado.v]&&a[equipEstado.v].length?a[equipEstado.v]:a.idle;if(!q||!q.length)return null;const dur=+(a.durations&&a.durations[equipEstado.v]),iv=dur>0?dur/q.length:Math.max(.05,+a.interval||.18);return{q,i:Math.floor(performance.now()/1000/iv)%q.length}}
function equipFrame(item,dir){const f=equipAnimQuadros(item,dir);return f&&f.q[f.i]||null}
// define o estado e devolve o pedaço da chave de cache com o quadro de cada peça animada
function chaveEquipAnim(itens,dir,estado){equipEstado.v=estado;let k='';for(const it of itens){if(!it||!it.equippedAnim)continue;for(const d of [dir,dir[0],'w']){const f=equipAnimQuadros(it,d);if(f)k+='|'+d+estado+f.i}}return k}
const MARGEM=48; // folga em volta do quadro do herói para armas grandes (js/sprites.js recortarHeroi)
/* Herói: montado em tamanho real numa grade 16×26 (o molde de js/aparencia.js, feito a partir do desenho de frente da
   Engine) — corpo, roupa, cabelo e capacete em camadas — e contornado de escuro no fim. Depois vai para a tela 2× do
   herói, onde a arma é desenhada na mesma escala (1 pixel do desenho = 1 pixel do herói), e é reduzido.
   Grade: cabeça x3–12 y1–10 · pescoço y11 · ombros y12 · tronco x4–11 y13–17 · braços x2 e x13 · mãos y17–18 ·
   cintura y18 · quadril y19–21 · pernas y22–24. As roupas pintam as regiões do molde (APARENCIA.grade). */
const HT={W:16,H:26},QH=64; // QH: altura do quadro do herói na tela 2× (40×32 depois de reduzido)
const CONTORNO='#161022';
// contorno de 1 px: todo pixel vazio encostado (4 vizinhos) num pixel que não é contorno fica escuro
function contornar(c,cor=CONTORNO){
 const W=c.width,H=c.height,x=c.getContext('2d'),im=x.getImageData(0,0,W,H),D=im.data,n=parseInt(cor.slice(1),16),r=n>>16&255,g=n>>8&255,b=n&255;
 const cheio=i=>D[i+3]>=128&&!(D[i]===r&&D[i+1]===g&&D[i+2]===b),marcar=[];
 for(let y=0;y<H;y++)for(let X=0;X<W;X++){const i=(y*W+X)*4;if(D[i+3]>=128)continue;
  if((X>0&&cheio(i-4))||(X<W-1&&cheio(i+4))||(y>0&&cheio(i-W*4))||(y<H-1&&cheio(i+W*4)))marcar.push(i)}
 for(const i of marcar){D[i]=r;D[i+1]=g;D[i+2]=b;D[i+3]=255}
 x.putImageData(im,0,0);return c}
// mão na tela 2× do herói (ponto da grade x,y → 2x-2, 2y-2): [principal, secundária] por direção
const MAOS={d:[[26,34],[2,34]],u:[[2,34],[26,34]],s:[[14,36],[14,36]]};
/* NPCs de classe (sem aparência própria): roupa vira equipamento comum, só onde o NPC não usa nada */
const CLASSE_VISUAL={
 war:{he:['#aab4c4','#c0392b',0],ch:['#9aa7b8','#c0392b',0],le:['#4a3a2a','#6b5a4a'],bo:['#3a2a1a','#5a4a3a'],arma:'espada',escudo:['#7a4a25','#d9a62e']},
 mag:{robe:['#5b3fd0','#f5d84a'],chapeu:1,cabelo:'curto',arma:'cajado'},
 hea:{robe:['#f2f2e8','#3fb86a'],tiara:1,cabelo:'curto',arma:'cajado'},
 sty:{robe:['#d94f9a','#ffd84a'],cabelo:'longo',corCabelo:'#3a1f10'},
 sk:{osso:1,arma:'espada'}
};
const armasClasse={};
function armaDeClasse(k){
 if(k in armasClasse)return armasClasse[k];const a=window.PACOTE_ARMAS&&PACOTE_ARMAS.ARMAS[k];
 return armasClasse[k]=a?{v:{c:['#9aa7b8','#7a4a25'],st:k=='cajado'?2:0},equippedSprite:pixelArt(a.mao),escalaMao:2,pega:a.pega,ataque:a.ataque,wt:a.tag}:null}
function equippedArt(item,dir){return equipFrame(item,dir)||item&&item.equippedSprites&&(item.equippedSprites[dir]||item.equippedSprites[dir[0]])}
// desenho vestido do projeto: só na grade atual do herói (16×26); desenhos de grades antigas ficam de lado
const gradeNova=a=>a&&a.width===HT.W&&a.height===HT.H;
function drawEquipmentLayers(E,slots,dir,cx){
 for(const slot of slots){const sprite=equippedArt(E[slot],dir);if(gradeNova(sprite))cx.drawImage(sprite,-2,-2,HT.W*2,HT.H*2)}
}
// regiões do molde (js/aparencia.js); sem ele, um molde vazio
const moldeDe=(dir,ph)=>window.APARENCIA&&APARENCIA.grade?APARENCIA.grade(dir,ph):[];
function human(cl,dir,ph=0,E={}){
 // personagem principal e NPCs de classe no estilo Mana Seed (js/heroi-mana.js), quando ele está ligado
 if(window.HEROI_MANA&&cl!=='sk'){const m=HEROI_MANA.deHuman(cl,dir,ph,E);if(m)return m}
 const equipment=E,visualDir=dir;
 E={...E};
 for(const slot of ['he','ch','le','bo','ca','ne','r1','r2'])if(gradeNova(equippedArt(E[slot],visualDir)))E[slot]=null;
 const dg=dir.length>1;dir=dir[0];const bk=dir=='u';
 const N=E.nude,fem=E.sex=='f',V=!N&&CLASSE_VISUAL[cl]||null;
 if(V){const g=(k,c)=>{if(!E[k]&&c)E[k]={v:{c:[c[0],c[1]],st:c[2]||0}}};g('he',V.he);g('ch',V.ch);g('le',V.le);g('bo',V.bo);g('sh',V.escudo);
  if(!E.sw&&V.arma)E.sw=armaDeClasse(V.arma)}
 const passo=V&&V.robe?0:ph,G=moldeDe(visualDir,passo);
 const t=mkCanvas(HT.W,HT.H),tx=t.getContext('2d');tx.imageSmoothingEnabled=false;
 const R=(a,b,w,h,col)=>{tx.fillStyle=col;tx.fillRect(a,b,w,h)},P=(a,b,col)=>R(a,b,1,1,col);
 const camada=slots=>{for(const s of slots){const a=equippedArt(equipment[s],visualDir);if(gradeNova(a))tx.drawImage(a,0,0)}};
 // capa por trás do corpo
 if(!bk){gearPre(E,dir,R);camada(['ca'])}
 // corpo e cabelo: js/aparencia.js (pixel art editável na Engine, com as cores escolhidas)
 let look=null;
 if(window.APARENCIA){
  const base=APARENCIA.padrao('m');
  look=N?(E.look||APARENCIA.padrao(fem?'f':'m')):V&&V.osso?{pele:'#e8e8e0',cabelo:base.cabelo,olhos:'#111111',estilo:'careca'}:{...base,estilo:V&&V.cabelo||'careca',cabelo:V&&V.corCabelo||base.cabelo};
  tx.drawImage(APARENCIA.corpo(N&&fem?'f':'m',visualDir,passo,look),0,0)}
 if(V&&V.osso)ossos(R,dir,G);
 if(V&&V.robe)manto(R,dir,V.robe,G);
 gearBody(E,dir,dg,R,P,G);
 camada(['le','bo','ch','ne','r1','r2']);
 if(look)tx.drawImage(APARENCIA.cabelo(look,visualDir),0,0);
 if(V&&V.chapeu&&!E.he){R(2,4,12,1,'#2a1f66');R(4,3,8,1,'#3a2a9a');R(5,2,6,1,'#3a2a9a');R(6,1,4,1,'#3a2a9a');R(7,0,2,1,'#3a2a9a');P(7,3,'#f5d84a')}
 if(V&&V.tiara&&!E.he){R(3,4,10,1,'#e8c84a');if(!bk)P(dg?8:7,4,'#3fb86a')}
 gearHead(E,dir,dg,R,P,G);
 camada(bk?['he','ca']:['he']);
 // escudo comum (não é arma) na mão da frente, à esquerda
 if(E.sh&&!E.shWeapon&&!equippedArt(E.sh,visualDir)&&dir=='d'){const [m,a]=E.sh.v.c;R(1,14,4,6,m);R(1,14,4,1,a);R(2,15,2,1,a);R(2,16,1,3,a);R(1,19,4,1,shade(m,.75))}
 contornar(t);
 const c=mkCanvas(80+2*MARGEM,QH+2*MARGEM,2),cx=c.getContext('2d');cx.translate(26+MARGEM,4+MARGEM);cx.imageSmoothingEnabled=false;
 const {R:R2,box}=kit(cx),armas=()=>{if(E.sw||E.sh)gearWeapon(E,visualDir,E.swing||0,box,R2,cx)};
 // de costas (u, us) a arma e o escudo ficam atrás do corpo; nas outras direções, na frente
 if(bk)armas();
 cx.drawImage(t,-2,-2,HT.W*2,HT.H*2);
 if(!bk)armas();
 return recortarHeroi(c)}
/* Roupa por região do molde: pinta cada pixel do molde cuja letra está em "letras" (filtro opcional por posição) */
function regiao(G,letras,R,cor,filtro){for(let y=0;y<G.length;y++){const l=G[y];for(let x=0;x<l.length;x++)if(letras.includes(l[x])&&(!filtro||filtro(x,y)))R(x,y,1,1,cor)}}
const acimaDoPe=(G,x,y)=>G[y+1]&&G[y+1][x]=='f';
// manto (NPCs de magia): cobre tronco, braços, quadril e pernas (vira saia); as botas aparecem embaixo
function manto(R,dir,[m,a],G){
 const sd=dir=='s',m2=shade(m,.8);
 regiao(G,'taTp',R,m);regiao(G,'AP',R,m2);regiao(G,'lL',R,m,(x,y)=>!acimaDoPe(G,x,y));regiao(G,'lL',R,a,(x,y)=>acimaDoPe(G,x,y));regiao(G,'f',R,'#3a2a1a');
 if(sd)R(5,22,6,1,m);else{R(4,22,8,1,m);if(dir!='u')R(7,19,2,3,m2)}}
// esqueleto: costelas, órbitas e dentes (a pele já vem cor de osso)
function ossos(R,dir,G){
 regiao(G,'tT',R,'#d8d8cc');regiao(G,'tT',R,'#8a8a80',(x,y)=>y%2==0);regiao(G,'we',R,'#111111');
 if(dir!='u'&&dir!='s')R(6,9,4,1,'#8a8a80')}
/* Equipamento por cima do corpo (grade no comentário do human) */
function gearPre(E,dir,R){const g=E.ca;if(!g||dir=='u')return;const [m,a]=g.v.c,m2=shade(m,.75);
 if(dir=='s'){R(1,12,5,12,m);R(1,23,5,1,a);R(1,12,1,11,m2)}
 else{R(2,12,12,12,m);R(2,23,12,1,a);R(2,12,1,11,m2);R(13,12,1,11,m2)}}
function gearBody(E,dir,dg,R,P,G){
 const sd=dir=='s',bk=dir=='u';
 if(E.le){const [m,c]=E.le.v.c,m2=shade(m,.8);
  regiao(G,'pl',R,m);regiao(G,'PL',R,m2);regiao(G,'pP',R,c,(x,y)=>y==19)}
 if(E.bo){const [m,c]=E.bo.v.c;
  regiao(G,'f',R,m);regiao(G,'lL',R,c,(x,y)=>acimaDoPe(G,x,y))}
 if(E.ch){const [m,c]=E.ch.v.c,st=E.ch.v.st,m2=shade(m,.8),hi=shade(m,1.25);
  regiao(G,'t',R,m);regiao(G,'T',R,m2);regiao(G,'a',R,shade(m,.92));regiao(G,'A',R,m2);
  if(!sd&&!bk&&st!=2)R(7,13,2,2,hi);if(bk)regiao(G,'t',R,m2,(x,y)=>x==7||x==8);
  if(st==1){if(sd)R(5,12,4,1,hi);else{R(1,12,3,2,m);R(12,12,3,2,m);R(1,12,3,1,hi);R(12,12,3,1,hi)}} // ombreiras
  if(st==2&&!bk&&!sd){P(7,14,c);P(8,15,c);P(7,16,c)}} // cordões
 if(E.ne){const [m,c]=E.ne.v.c;
  if(sd){P(10,13,m);P(10,14,c)}else if(bk)R(6,13,4,1,m);else{const o=dg?1:0;R(5+o,13,6,1,m);R(7+o,14,2,1,c)}}
 const anel=(r,lado)=>{if(r)regiao(G,'h',R,r.v.c[1],(x,y)=>(G[y-1]&&G[y-1][x]!='h')&&(lado==null||(lado?x>=8:x<8)))};
 if(sd)anel(E.r1||E.r2,null);else{anel(E.r1,bk);anel(E.r2,!bk)}}
function gearHead(E,dir,dg,R,P,G){
 const sd=dir=='s',bk=dir=='u';
 if(E.he){const [m,c]=E.he.v.c,st=E.he.v.st,hi=shade(m,1.35),lo=shade(m,.7);
  if(st==2){ // capuz
   if(bk){R(4,1,8,1,m);R(2,2,12,10,m);R(7,3,2,8,lo)}
   else if(sd){R(4,1,8,1,m);R(3,2,9,2,m);R(2,4,6,8,m);P(12,3,m);R(2,11,6,1,lo)}
   else{R(4,1,8,1,m);R(3,2,10,2,m);R(2,3,2,9,m);R(12,3,2,9,m);R(4,4,8,1,lo);R(4,1,3,1,hi);if(dg)R(12,4,1,7,lo)}}
  else{
   R(4,1,8,1,m);R(3,2,10,4,m);R(4,2,3,1,hi);R(3,5,10,1,lo);
   if(bk)R(3,6,10,3,m);
   else if(sd)R(3,6,4,3,m);
   else if(st==0){R(3,6,2,3,m);R(dg?8:7,6,2,3,m);R(dg?12:11,6,dg?1:2,3,m)} // proteção do rosto e do nariz
   if(st==0)R(7,0,2,1,c);
   if(st==1){P(1,1,c);R(1,2,2,1,c);P(2,3,c);if(!sd){P(14,1,c);R(13,2,2,1,c);P(13,3,c)}}}} // asas
 if(E.ca&&bk){const [m,c]=E.ca.v.c;regiao(G,'taTApP',R,m);R(3,12,10,1,c);regiao(G,'t',R,shade(m,.75),(x,y)=>x==7||x==8);R(3,22,10,2,m);R(3,23,10,1,shade(m,.8))}}
/* Recorta o sprite do herói: o quadro padrão (80×QH, corpo em 26,4) mais o que a arma passar dele.
   Cresce igual para os dois lados (o desenho continua centrado) e para cima/baixo só o necessário.
   ox/oy: deslocamento do quadro padrão dentro da imagem final (em pixels já reduzidos). */
function recortarHeroi(c){
 const W=c.width,H=c.height,d=c.getContext('2d').getImageData(0,0,W,H).data;let x0=W,y0=H,x1=-1,y1=-1;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(d[(y*W+x)*4+3]>=128){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
 const par=v=>v+(v&1);
 const lado=x1<0?0:par(Math.max(0,MARGEM-x0,x1+1-(MARGEM+80))),cima=x1<0?0:par(Math.max(0,MARGEM-y0)),baixo=x1<0?0:par(Math.max(0,y1+1-(MARGEM+QH)));
 const r=mkCanvas(80+2*lado,QH+cima+baixo,2);r.getContext('2d').drawImage(c,MARGEM-lado,MARGEM-cima,r.width,r.height,0,0,r.width,r.height);
 // pés (linha 25 da grade) na base do personagem; sombra do tamanho do corpo
 const o=half(r);o.pad=12+lado/2;o.anchorY=5+baixo/2;o.ox=lado/2;o.oy=cima/2;return o}
/* Pose e golpe de cada tipo de arma: ângulo (-90 = ponta para cima, 0 = para a frente) e deslocamento da mão,
   por direção (s = de lado, d = de frente, u = de costas) e passo do golpe (0 = parado, 1 = preparo, 2 = golpe, 3 = volta). */
const POSES_ARMA={
 corte:{s:[[-90],[-130],[-65],[-40]],d:[[-90],[-120],[-165],[150]],u:[[180],[140],[105],[70]],off:{d:[[-90],[-120],[-165],[150]],u:[[0],[40],[75],[110]]}},
 pesado:{s:[[-95],[-170],[-35],[25]],d:[[-95],[-150],[175],[120]],u:[[190],[160],[95],[30]]},
 estocada:{s:[[-60],[-5,-4],[0,8],[0,3]],d:[[-80],[95,0,-3],[90,0,7],[90,0,2]],u:[[-100],[-85,0,3],[-90,0,-7],[-90,0,-2]]},
 vertical:{s:[[-90],[-90,0,-2],[-90,1,-5],[-90,0,-1]],d:[[-90],[-90,0,-2],[-90,0,-5],[-90,0,-1]],u:[[-90],[-90,0,-2],[-90,0,-5],[-90,0,-1]]},
 arco:{s:[[-90],[-90,-1],[-90,-2],[-90]],d:[[-90],[-90,0,-1],[-90,0,-2],[-90]],u:[[-90],[-90,0,1],[-90,0,2],[-90]]},
 besta:{s:[[0],[0,-1],[0,-3],[0]],d:[[90],[90,0,-1],[90,0,-3],[90]],u:[[-90],[-90,0,1],[-90,0,3],[-90]]},
 soco:{s:[[-90],[-90,-2],[-90,6],[-90,2]],d:[[-90],[-90,0,-1],[-90,0,4],[-90,0,1]],u:[[-90],[-90,0,1],[-90,0,-4],[-90,0,-1]]},
 escudo:{s:[[-90],[-90,-1],[-90,4],[-90,1]],d:[[-90],[-90],[-90,0,3],[-90,0,1]],u:[[-90],[-90],[-90,0,-2],[-90]]},
 orbe:{s:[[-90,0,-6],[-90,0,-7],[-90,0,-10],[-90,0,-7]],d:[[-90,0,-6],[-90,0,-7],[-90,0,-10],[-90,0,-7]],u:[[-90,0,-6],[-90,0,-7],[-90,0,-10],[-90,0,-7]]},
 varinha:{s:[[-80],[-115],[-55],[-35]],d:[[-80],[-110],[-150],[160]],u:[[180],[150],[110],[80]]}
};
function poseArma(tipo,dir,hand,step){const P=POSES_ARMA[tipo]||POSES_ARMA.corte,tab=hand=='off'&&P.off&&P.off[dir]||P[dir]||POSES_ARMA.corte[dir],v=tab[step]||tab[0];return{a:v[0],dx:v[1]||0,dy:v[2]||0}}
// tela temporária para girar a arma no tamanho real (reaproveitada por tamanho)
const telasArma={};const armaGirada=D=>telasArma[D]||(telasArma[D]=Object.assign(document.createElement('canvas'),{width:D,height:D}));
function gearWeapon(E,dir,swing,box,R,cx){
 const visualDir=dir;dir=dir[0];
 if(E.sh&&!E.shWeapon&&equippedArt(E.sh,visualDir))drawEquipmentLayers(E,['sh'],visualDir,cx);
 const sd=dir=='s',bk=dir=='u',maos=MAOS[sd?'s':bk?'u':'d'];
 const drawHeld=(w,hand,step)=>{if(!w)return;
  const sprite=equippedArt(w,visualDir)||equipFrame(w,'w')||w.equippedSprite;if(!sprite&&!w.c)return;
  const [hx,hy]=maos[hand=='main'?0:1],pose=poseArma(w.ataque,sd?'s':bk?'u':'d',hand,step);
  // a mão fica na grade do herói (múltiplo de 2 na tela 2×) para a arma não ficar meio pixel deslocada
  cx.save();cx.translate(Math.round((hx+pose.dx)/2)*2,Math.round((hy+pose.dy)/2)*2);cx.imageSmoothingEnabled=false;
  if(sprite){
   // escalaMao 2: cada pixel do desenho = 1 pixel do herói. A arma é girada no tamanho real (pixels inteiros) e só
   // depois ampliada 2×: girar direto na tela 2× deixava a arma com pixels menores que os do herói
   const st=w.v?w.v.st:0,L=st==2?20:st==1?14:16,k2=w.escalaMao==2,sh=k2?sprite.height:L,sw=k2?sprite.width:Math.max(1,Math.round(sh*sprite.width/sprite.height)),pega=w.pega??1;
   const D=(Math.ceil(Math.hypot(sw,sh)*2)+4)&~1,o=armaGirada(D),og=o.getContext('2d');og.setTransform(1,0,0,1,0,0);og.clearRect(0,0,D,D);og.imageSmoothingEnabled=false;
   // a arma é desenhada com a lâmina para a direita: na mão do lado esquerdo da tela (mão 2 de frente, mão 1 de costas) espelha
   const espelha=!sd&&((hand=='off')!==bk);
   og.translate(D/2,D/2);og.rotate((pose.a+90)*Math.PI/180);if(espelha)og.scale(-1,1);og.drawImage(sprite,Math.round(-sw/2),Math.round(-sh*pega),sw,sh);
   cx.drawImage(o,-D,-D,D*2,D*2)}
  else{
   // sem desenho da mão: o próprio ícone (arma na diagonal, ponta em cima à direita), na mesma escala do ícone
   const p=w.pega??.75;cx.rotate((pose.a+45)*Math.PI/180);cx.drawImage(w.c,-32*(1-p),-32*p,32,32)}
  cx.restore()};
 if(E.shWeapon)drawHeld(E.sh,'off',swing);
 drawHeld(E.sw,'main',swing)}
function slime(dir){const c=mkCanvas(28,20,2),x=c.getContext('2d');
 const inM=(px,py)=>py>=0&&py<=19&&((px-13.5)/13.5)**2+((py-12)/11)**2<=1;
 for(let py=0;py<20;py++)for(let px=0;px<28;px++){
  if(!inM(px,py))continue;
  const edge=!inM(px-1,py)||!inM(px+1,py)||!inM(px,py-1)||!inM(px,py+1);
  x.fillStyle=edge?'#1f6b2c':py<6?'#8fe48a':py>=15?'#3f9f48':'#58c75e';x.fillRect(px,py,1,1)}
 x.fillStyle='#d6ffd0';x.fillRect(6,4,4,2);x.fillRect(5,6,2,3);
 const eye=(a,b,off)=>{x.fillStyle='#ffffff';x.fillRect(a,b,4,5);x.fillStyle='#111111';x.fillRect(a+off,b+2,2,3)};
 if(dir=='d'){eye(8,8,1);eye(16,8,1);x.fillStyle='#1f6b2c';x.fillRect(12,15,4,1)}
 else if(dir=='s')eye(16,8,2);
 else if(dir=='ds'){eye(11,8,2);eye(18,8,2);x.fillStyle='#1f6b2c';x.fillRect(16,15,4,1)}
 return half(c)}
const DIRS=['d','u','s','ds','us'];const set3=(fn,cl)=>{const o={w:fn===human?{}:null};for(const d of DIRS){o[d]=fn(cl,d);if(o.w)o.w[d]=[fn(cl,d,1),fn(cl,d,2)]}return o};
const fr=(set,d,an)=>an&&an.ph&&set.w?set.w[d][an.ph-1]:set[d];
const HS={war:set3(human,'war'),mag:set3(human,'mag'),hea:set3(human,'hea'),sty:set3(human,'sty')};
const SP={sk:set3(human,'sk'),sl:{d:slime('d'),u:slime('u'),s:slime('s'),ds:slime('ds'),us:slime('us')}};
const FD=[['s',1],['ds',1],['d',1],['ds',-1],['s',-1],['us',-1],['u',1],['us',1]];
function face(u){if(u.canal&&u.canal.visual){const i=(Math.round(u.canal.ang/(Math.PI/4))%8+8)%8;return{d:FD[i][0],fl:FD[i][1]}} /* girando (Girar): o desenho segue a lâmina, mesmo andando */const x=u.fx||0,y=u.fy||0;if(!x&&!y)return{d:'d',fl:1};const a=Math.atan2(y,x),i=(Math.round(a/(Math.PI/4))+8)%8,k=u.fk;if(k!==undefined&&k!==i){const c=k*Math.PI/4,df=Math.abs(Math.atan2(Math.sin(a-c),Math.cos(a-c)));if(df<Math.PI/4+.25)return{d:FD[k][0],fl:FD[k][1]}}u.fk=i;return{d:FD[i][0],fl:FD[i][1]}}
