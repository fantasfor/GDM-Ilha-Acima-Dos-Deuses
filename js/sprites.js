/* ---------- pixel art ---------- */
function shade(h,f){const n=parseInt(h.slice(1),16),c=v=>Math.max(0,Math.min(255,Math.round(v*f)));return '#'+[n>>16&255,n>>8&255,n&255].map(v=>c(v).toString(16).padStart(2,'0')).join('')}
function mkCanvas(w,h,q=1){const c=document.createElement('canvas');c.width=w;c.height=h;c.q=q;return c}
function pixelArt(data){
 if(!data||!Array.isArray(data.palette)||typeof data.pixels!='string')return null;
 const w=Math.max(1,Math.min(64,Math.floor(+data.w||32))),h=Math.max(1,Math.min(64,Math.floor(+data.h||32)));
 if(data.pixels.length!==w*h)return null;
 const c=mkCanvas(w,h,data.q===2?2:1),x=c.getContext('2d'),im=x.createImageData(w,h);
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
 c.pixelData=data;return c
}
function half(c){const w=c.width>>1,h=c.height>>1,o=mkCanvas(w,h),x=o.getContext('2d'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,im=x.createImageData(w,h);for(let j=0;j<h;j++)for(let i=0;i<w;i++)for(const [a,b] of [[0,0],[1,1],[1,0],[0,1]]){const s=((j*2+b)*c.width+i*2+a)*4;if(d[s+3]>=128){const t=(j*w+i)*4;im.data[t]=d[s];im.data[t+1]=d[s+1];im.data[t+2]=d[s+2];im.data[t+3]=255;break}}x.putImageData(im,0,0);return o}
function kit(x){
 const R=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a,b,w,h)};
 const box=(a,b,w,h,col)=>{R(a-1,b-1,w+2,h+2,'#161022');R(a,b,w,h,col);R(a,b,w,1,shade(col,1.3));R(a,b,1,h,shade(col,1.15));R(a,b+h-1,w,1,shade(col,.7));R(a+w-1,b,1,h,shade(col,.8))};
 const disc=(cx,cy,r,col)=>{x.fillStyle=col;for(let py=cy-r;py<=cy+r;py++)for(let px=cx-r;px<=cx+r;px++)if((px-cx)*(px-cx)+(py-cy)*(py-cy)<=r*r+r*.5)x.fillRect(px,py,1,1)};
 return{R,box,disc}}
/* Sprites em 32 bits: 2x a resolução original (q=2 → desenhados com metade do tamanho no mundo) */
const TREE=(()=>{const c=mkCanvas(30,26,2),{box,disc}=kit(c.getContext('2d'));
 const L=[[15,9,8],[8,13,6],[22,13,6],[15,14,7]];
 box(12,17,6,8,'#7a4a25');
 L.forEach(([a,b,r])=>disc(a,b,r+1,'#10301a'));
 L.forEach(([a,b,r])=>disc(a,b,r,'#2d7a37'));
 L.forEach(([a,b,r])=>disc(a-1,b-2,r-2,'#3f9a47'));
 L.forEach(([a,b,r])=>disc(a-2,b-3,Math.max(1,r>>2),'#6cc06a'));
 return half(c)})();
const TENT=(()=>{const c=mkCanvas(64,36,2),x=c.getContext('2d');
 const row=(y,from,to,col)=>{x.fillStyle=col;x.fillRect(32+from,y,to-from+1,1)};
 for(let y=1;y<=35;y++){const hw=Math.round(Math.max(0,y-2)*30/32)+1;row(y,-hw,hw,'#3a1410')}
 for(let y=2;y<=34;y++){const hw=Math.round((y-2)*30/32);row(y,-hw,-1,'#c0392b');row(y,0,hw,'#a02f23');row(y,-hw,-hw+1,'#e0584a')}
 for(let y=27;y<=28;y++){const hw=Math.round((y-2)*30/32);row(y,-hw,hw,'#ecf0f1')}
 for(let y=18;y<=34;y++){const hw=Math.round((y-18)*9/16);row(y,-hw,hw,'#2a0e0b')}
 return half(c)})();
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
const IC_SHAPE={
 he:[["...dd...","..dmmd..",".dmhmmd.",".dmmmmd.",".dmddmd.",".dm..md.",".dd..dd.","........"],["a..dd..a","aadmhdaa","..dmmd..","..dmmd..","..dmmd..","..dm.md.","..dd.dd.","........"],["..dddd..",".dmmmmd.","dmmhmmmd","dmm..mmd","dmd..dmd","dmd..dmd","dmmaammd",".dddddd."]],
 ch:[["dd....dd","dmd..dmd","dmmddmmd","dmmmmmmd",".dmhmmd.",".daaaad.",".dmmmmd.","..dddd.."],["dddddddd","dmmaammd","dmhmmmmd","dmmaammd",".dmaamd.",".dmmmmd.",".dmmmmd.","..dddd.."],["..d..d..",".dmddmd.",".dmmmmd.",".dmamad.",".dmmmmd.",".dmamad.",".dmmmmd.","..dddd.."]],
 le:[["daaaaaad","dmmddmmd","dmhddmmd","dmmddmmd","dmmddmmd","dmmddmmd","dmd..dmd","ddd..ddd"],["dddddddd","dmmddmmd","daaddaad","dmmddmmd","dmmddmmd","daaddaad","dmd..dmd","ddd..ddd"],["daaaaaad","dmmddmmd","dmaddamd","dmaddamd","dmaddamd","dmaddamd","dmd..dmd","ddd..ddd"]],
 bo:[["........","ddd..ddd","dmd..dmd","dad..dad","dmd..dmd","dmmddmmd","dmmddmmd","dddddddd"],["........","ddd..ddd","dad..dad","dmd..dmd","dmd..dmd","dmmddmmd","dmmddmmd","dddddddd"],["ddd..ddd","dad..dad","dmd..dmd","dmd..dmd","dmd..dmd","dmmddmmd","dmmddmmd","dddddddd"]],
 ca:[["..dddd..",".dmaamd.","dmmmmmmd","dmhmmmmd","dmmmmmmd","dmmmmmmd","dmmmmmmd","dddddddd"],["..dddd..",".damad..","dmmmmmmd","dmhmmmmd","dmmmmmmd","dmmmmmmd","dmmmmmmd","dddddddd"],["..dddd..",".dmaamd.","dmmmmmmd","dmhmmmmd","dmmmmmmd","dmmmmmmd","dmdmdmdm","d.d.d.d."]],
 ri:[["...dd...","..dggd..","..dmmd..",".dm..md.",".dm..md.",".dm..md.","..dmmd..","...dd..."]],
 ne:[["d......d","dm....md",".dm..md.",".dm..md.","..dmmd..","...dgd..","..dggd..","...dd..."]]
};
const gearIcon=(slot,v,st)=>{const t=slot=='ri'?'ri':slot,sh=IC_SHAPE[t];return spr(sh[Math.min(st,sh.length-1)],{d:'#161022',m:v[0],h:shade(v[0],1.45),a:v[1],g:v[1]})};
const statTxt=o=>Object.keys(ITEM_STATS).filter(k=>o[k]).map(k=>(o[k]>0?'+':'')+itemStatValue(k,o[k])+' '+ITEM_STATS[k].text).join(', ');
const GEARIDS=[];
for(const slot in GEAR)for(const [id,n,c,st,stats] of GEAR[slot]){ITEMS[id]={n:n+' ('+statTxt(stats)+')',...stats,c:gearIcon(slot,c,st),g:1,v:{c,st}};gearType[id]=slot;GEARIDS.push(id)}
ITEMS.sw.v={c:['#e6e6f0','#c9a227'],st:0};ITEMS.sh.v={c:['#9fb4c8','#d9a62e'],st:0};
for(const [id,n,c,st,stats] of [['sw2','Machado de Guerra',['#9aa7b8','#7a4a25'],1,{dmg:12}],['sw3','Cajado Arcano',['#7a4a25','#55ffff'],2,{dmg:4,mp:30}]]){ITEMS[id]={n:n+' ('+statTxt(stats)+')',...stats,c:half(weaponIcon(st,c)),g:1,v:{c,st}};gearType[id]='sw';GEARIDS.push(id)}
for(const k in ITEMS){if(!ITEMS[k].g)ITEMS[k].c=half(ITEMS[k].c);ITEMS[k].ic=ITEMS[k].c.toDataURL()}
function equippedArt(item,dir){return item&&item.equippedSprites&&(item.equippedSprites[dir]||item.equippedSprites[dir[0]])}
function drawEquipmentLayers(E,slots,dir,cx){
 for(const slot of slots){const sprite=equippedArt(E[slot],dir);if(sprite)cx.drawImage(sprite,0,0,28,32)}
}
const MARGEM=48; // folga em volta do quadro do herói para armas grandes (js/sprites.js recortarHeroi)
function human(cl,dir,ph=0,E={}){
 const equipment=E,visualDir=dir;
 E={...E};
 for(const slot of ['he','ch','le','bo','ca','ne','r1','r2'])if(equippedArt(E[slot],visualDir))E[slot]=null;
 // tela folgada (MARGEM em volta do quadro 80x48) para armas grandes; no fim recorta só o que foi usado
 const dg=dir.length>1;dir=dir[0];const c=mkCanvas(80+2*MARGEM,48+2*MARGEM,2),cx=c.getContext('2d');cx.translate(26+MARGEM,4+MARGEM);const {R,box}=kit(cx);
 const P={war:['#9aa7b8','#c0392b','#6b3b1f','#f2c28b','#4a3a2a'],mag:['#5b3fd0','#f5d84a','#e0e0f0','#f2c28b','#2a1f66'],hea:['#f2f2e8','#3fb86a','#e8c84a','#f2c28b','#c9c9b8'],sk:['#d8d8cc','#222222','','#e8e8e0', '#b8b8aa'],sty:['#d94f9a','#ffd84a','#3a1f10','#f2c28b','#7a3a5a']}[cl];
  const N=E.nude,fem=E.sex=='f';
  let [B,A,H,S,L]=P;const robe=(cl=='mag'||cl=='hea'||cl=='sty')&&!N,sd=dir=='s',bk=dir=='u',BT=N?S:'#3a2a1a';
  if(N){B=S;L=S;A='#f0e6d2';H=fem?'#8a3b1c':'#4a2c14'}
 gearPre(E,dir,box,R);
 if(dir!='u')drawEquipmentLayers(equipment,['ca'],visualDir,cx);
 if(robe){box(sd?9:8,14,sd?10:12,15,B);R(sd?9:8,27,sd?10:12,2,A);
  if(ph==1)box(sd?7:9,29,4,3,'#3a2a1a');if(ph==2)box(sd?15:15,29,4,3,'#3a2a1a')}
 else if(sd){const a=ph==1?-3:ph==2?3:0;box(10+a,22,4,7,L);box(14-a,22,4,7,shade(L,.85));box(9+a,28,6,3,BT);box(14-a,28,6,3,N?shade(S,.85):'#2a1c10')}
 else{const l1=ph==1?2:0,l2=ph==2?2:0;box(9,22,4,7-l1,L);box(15,22,4,7-l2,L);box(8,28-l1,5,3,BT);box(15,28-l2,5,3,BT)}
 if(!robe){const tx=sd?10:8,tw=sd?9:12;box(tx,13,tw,10,B);if(N){R(tx,22,tw,2,A);if(!sd&&!bk)R(13,15,2,4,shade(B,.9))}else{R(tx,21,tw,2,A);if(!sd&&!bk)R(13,14,2,6,shade(B,1.2))}}
 else R(sd?9:8,21,sd?10:12,2,A);
 if(cl=='sk'&&!bk)for(const y of [15,17,19])R(sd?11:10,y,sd?7:8,1,A);
 if(N){const tx=sd?10:8,tw=sd?9:12;
  if(sd){R(10,22,9,3,A)}else{R(9,22,10,3,A);R(13,23,2,2,shade(A,.8))}
  if(fem){R(tx,15,tw,3,'#e86a9a');if(bk)R(tx,15,tw,1,shade('#e86a9a',.8))}}
 if(cl=='war'&&bk&&!N)box(9,14,10,9,'#7a4a25');
 if(sd){box(12,14,4,8,shade(B,.9));box(12,21,4,3,S)}
 else{box(5,14,3,8,B);box(20,14,3,8,B);box(5,21,3,3,S);box(20,21,3,3,S)}
 box(9,3,10,10,S);
 if(bk){R(9,3,10,10,H||S);if(dg)R(17,6,2,5,S)}
 else if(H){R(9,3,10,3,H);if(sd)R(9,6,4,5,H);else{R(9,6,2,4,H);R(17,6,2,4,H)}}
 if(!bk){
  if(cl=='sk'){if(sd){R(14,7,3,3,'#111111');R(15,11,3,1,'#111111')}else{R(10,7,3,3,'#111111');R(15,7,3,3,'#111111');R(13,10,2,1,'#111111');R(11,12,6,1,'#111111')}}
  else if(sd)R(15,8,2,2,'#111111');
  else if(dg){R(13,8,2,2,'#111111');R(16,8,2,2,'#111111');R(15,11,2,1,shade(S,.65))}
  else{R(11,8,2,2,'#111111');R(15,8,2,2,'#111111');R(13,11,2,1,shade(S,.65))}
 }
 if(N&&fem){if(bk)box(9,12,10,9,H);else if(sd)box(15,8,5,12,H);else{box(7,6,3,13,H);box(18,6,3,13,H)}}
 gearBody(E,dir,robe?0:ph,box,R);
 drawEquipmentLayers(equipment,['le','bo','ch','ne','r1','r2'],visualDir,cx);
 if(cl=='war'){
  if(!equipment.he&&!N){box(8,2,12,5,'#aab4c4');if(!sd&&!bk)R(13,6,2,5,'#8896a8');R(13,0,2,2,A)}
  if(!N){if(dir=='d')box(1,14,6,10,'#7a4a25'),R(2,18,4,2,'#d9a62e');
  const sx=sd?19:22;box(sx,5,3,16,'#e6e6f0');box(sx-1,20,5,2,'#c9a227');box(sx,22,3,3,'#6b3b1f')}}
 if(cl=='mag'){
  if(!equipment.he&&!N){box(10,1,8,4,'#3a2a9a');box(7,4,14,3,'#2a1f66');R(13,2,2,1,'#f5d84a')}
  if(!N){const sx=sd?19:22;box(sx,7,2,21,'#7a4a25');box(sx-1,2,4,4,'#55ffff');R(sx,3,1,1,'#ffffff')}}
 if(cl=='hea'){
  if(!equipment.he&&!N){R(9,3,10,2,A);R(10,0,8,1,'#ffe66b')}
  if(dir=='d'&&!N){R(13,16,2,5,A);R(12,17,4,2,A)}
  if(!N){const sx=sd?19:22;box(sx,7,2,21,'#c9a227');box(sx-1,3,4,4,'#ffd84a')}}
 if(cl=='sk'){const sx=sd?19:22;box(sx,10,2,11,'#8a8a8a');box(sx-1,20,4,2,'#6b3b1f')}
 gearHead(E,dir,box,R);
 drawEquipmentLayers(equipment,dir=='u'?['he','ca']:['he'],visualDir,cx);
 if(N)gearWeapon(E,visualDir,E.swing||0,box,R,cx);
 return recortarHeroi(c)}
/* Recorta o sprite do herói: o quadro padrão (80x48, corpo em 26,4) mais o que a arma passar dele.
   Cresce igual para os dois lados (o desenho continua centrado) e para cima/baixo só o necessário.
   ox/oy: deslocamento do quadro padrão dentro da imagem final (em pixels já reduzidos). */
function recortarHeroi(c){
 const W=c.width,H=c.height,d=c.getContext('2d').getImageData(0,0,W,H).data;let x0=W,y0=H,x1=-1,y1=-1;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(d[(y*W+x)*4+3]>=128){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
 const par=v=>v+(v&1);
 const lado=x1<0?0:par(Math.max(0,MARGEM-x0,x1+1-(MARGEM+80))),cima=x1<0?0:par(Math.max(0,MARGEM-y0)),baixo=x1<0?0:par(Math.max(0,y1+1-(MARGEM+48)));
 const r=mkCanvas(80+2*lado,48+cima+baixo,2);r.getContext('2d').drawImage(c,MARGEM-lado,MARGEM-cima,r.width,r.height,0,0,r.width,r.height);
 const o=half(r);o.pad=13+lado/2;o.anchorY=6+baixo/2;o.ox=lado/2;o.oy=cima/2;return o}
function gearWeapon(E,dir,swing,box,R,cx){
 const visualDir=dir;dir=dir[0];
 if(E.sh&&!E.shWeapon&&equippedArt(E.sh,visualDir))drawEquipmentLayers(E,['sh'],visualDir,cx);
 else if(E.sh&&dir=='d'&&!E.shWeapon){const [m,a]=E.sh.v.c;box(1,14,6,10,m);R(3,16,2,6,a);R(2,18,4,2,a)}
 const sd=dir=='s',bk=dir=='u',angles=sd?[-90,-130,-65,-40]:[-90,-120,-165,150];
 const drawHeld=(w,hand,step)=>{if(!w)return;const st=w.v.st,L=st==2?20:st==1?14:16,heldAngles=hand=='main'?(bk?[180,140,105,70]:angles):(bk?[0,40,75,110]:angles),heldAngle=heldAngles[step],hx=bk?(hand=='main'?7:21):hand=='main'?(sd?19:23):5;
  if(equippedArt(w,visualDir)||w.equippedSprite){const sprite=equippedArt(w,visualDir)||w.equippedSprite,h=w.wt=='serrote'?12:L*2,width=Math.max(2,Math.round(h*sprite.width/sprite.height));
   cx.save();cx.translate(hx,22);cx.rotate((heldAngle+90)*Math.PI/180);cx.imageSmoothingEnabled=false;cx.drawImage(sprite,-width/2,-h,width,h);cx.restore();return}
  drawWeapon(R,st,w.v.c,hx,22,heldAngle,L,2)};
 if(E.shWeapon)drawHeld(E.sh,'off',swing);
 drawHeld(E.sw,'main',swing)}
/* Equipamento desenhado por cima do sprite base (28x32, antes de reduzir) */
function gearPre(E,dir,box,R){const g=E.ca;if(!g||dir=='u')return;const [m,a]=g.v.c;
 if(dir=='s'){box(3,14,9,15,m);R(3,27,9,2,a);R(4,16,1,10,shade(m,.75))}
 else{box(5,13,18,16,m);R(5,27,18,2,a);R(6,15,1,11,shade(m,.75));R(21,15,1,11,shade(m,.75))}}
function gearBody(E,dir,ph,box,R){
 const sd=dir=='s',bk=dir=='u',l1=ph==1?2:0,l2=ph==2?2:0,a=ph==1?-3:ph==2?3:0;
 if(E.le){const [m,c]=E.le.v.c;
  if(sd){box(10+a,22,4,7,m);box(14-a,22,4,7,shade(m,.85));R(10+a,25,4,1,c);R(14-a,25,4,1,c)}
  else{box(9,22,4,7-l1,m);box(15,22,4,7-l2,m);R(9,24,4,1,c);R(15,24,4,1,c)}}
 if(E.bo){const [m,c]=E.bo.v.c;
  if(sd){box(9+a,26,6,5,m);R(9+a,26,6,1,c);box(14-a,26,6,5,shade(m,.85));R(14-a,26,6,1,c)}
  else{box(8,26-l1,5,5,m);R(8,26-l1,5,1,c);box(15,26-l2,5,5,m);R(15,26-l2,5,1,c)}}
 if(E.ch){const [m,c]=E.ch.v.c,st=E.ch.v.st,tx=sd?10:8,tw=sd?9:12;
  box(tx,13,tw,10,m);R(tx,21,tw,2,c);
  if(!sd&&!bk)R(13,14,2,6,shade(m,1.25));if(bk)R(13,14,2,7,shade(m,.75));
  if(st==1){if(sd)box(11,12,5,4,m);else{box(5,12,5,4,m);box(18,12,5,4,m)}}
  if(st==2&&!bk)for(const y of [15,17,19])R(sd?13:13,y,2,1,c)}
 if(E.ne){const [m,c]=E.ne.v.c;
  if(bk)R(10,12,8,1,m);
  else if(sd){R(14,12,3,1,m);R(16,13,2,2,c)}
  else{R(10,12,8,1,m);R(11,13,1,2,m);R(16,13,1,2,m);R(13,13,2,3,c)}}
 const r1=E.r1,r2=E.r2;
 if(sd){const r=r1||r2;if(r)R(12,22,4,2,r.v.c[1])}
 else{if(r1)R(5,22,3,2,r1.v.c[1]);if(r2)R(20,22,3,2,r2.v.c[1])}}
function gearHead(E,dir,box,R){
 const sd=dir=='s',bk=dir=='u';
 if(E.he){const [m,c]=E.he.v.c,st=E.he.v.st,hx=8,hw=sd?11:12;
  if(bk){box(hx,1,hw,11,m);R(hx,5,hw,1,shade(m,.7))}
  else{box(hx,1,hw,6,m);R(hx,5,hw,1,shade(m,.7));
   if(st==0){if(sd)R(hx,6,3,5,m);else{R(hx,6,2,5,m);R(hx+hw-2,6,2,5,m)}R(13,0,2,1,c)}
   if(st==1){R(5,2,4,2,c);R(3,1,3,1,c);if(!sd){R(19,2,4,2,c);R(22,1,3,1,c)}}
   if(st==2){R(hx-1,2,hw+2,5,m);R(hx-1,6,3,7,m);R(hx+hw-2,6,3,7,m);R(13,0,2,2,m)}}}
 if(E.ca&&bk){const [m,c]=E.ca.v.c;box(6,13,16,17,m);R(13,15,2,14,shade(m,.7));R(6,13,16,2,c);R(6,28,16,2,c)}}
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
function face(u){const x=u.fx||0,y=u.fy||0;if(!x&&!y)return{d:'d',fl:1};const a=Math.atan2(y,x),i=(Math.round(a/(Math.PI/4))+8)%8,k=u.fk;if(k!==undefined&&k!==i){const c=k*Math.PI/4,df=Math.abs(Math.atan2(Math.sin(a-c),Math.cos(a-c)));if(df<Math.PI/4+.25)return{d:FD[k][0],fl:FD[k][1]}}u.fk=i;return{d:FD[i][0],fl:FD[i][1]}}
