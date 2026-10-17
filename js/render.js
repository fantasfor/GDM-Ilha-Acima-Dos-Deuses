/* ---------- desenho ---------- */
let time=0;
let hov=null,hovN=null;
function pickN(w){return NPCS.find(n=>dist(n,w)<16||dist({x:n.x,y:n.y-8},w)<16)}
function pickCampGate(w){return wallBuilt&&Math.abs(w.x-campGate.x)<CAMP_WALL.halfGate+8&&w.y>campGate.y-38&&w.y<campGate.y+10}
function pickCampPortal(w){return campPortalBuilt&&Math.abs(w.x-campPortal.x)<25&&w.y>campPortal.y-54&&w.y<campPortal.y+10}

const PORTAL_SQUARES = [
 { col: -8, sz: 2, spd: 7.5,  ph: 0,   c: '#38bdf8', core: '#e0f2fe' },
 { col: -6, sz: 3, spd: 10.0, ph: 14,  c: '#a855f7', core: '#ffffff' },
 { col: -4, sz: 2, spd: 6.8,  ph: 28,  c: '#f472b6', core: '#fff0f5' },
 { col: -2, sz: 3, spd: 8.5,  ph: 7,   c: '#22d3ee', core: '#ffffff' },
 { col: 0,  sz: 2, spd: 6.2,  ph: 35,  c: '#c084fc', core: '#ffffff' },
 { col: 2,  sz: 3, spd: 9.2,  ph: 19,  c: '#38bdf8', core: '#ffffff' },
 { col: 4,  sz: 2, spd: 7.2,  ph: 3,   c: '#e879f9', core: '#ffffff' },
 { col: 6,  sz: 3, spd: 10.8, ph: 24,  c: '#22d3ee', core: '#ffffff' },
 { col: 7,  sz: 2, spd: 6.5,  ph: 11,  c: '#a855f7', core: '#e9d5ff' },
 { col: -7, sz: 1, spd: 11.5, ph: 39,  c: '#ffffff' },
 { col: -5, sz: 2, spd: 8.2,  ph: 22,  c: '#38bdf8', core: '#f0fdfa' },
 { col: -3, sz: 3, spd: 7.8,  ph: 31,  c: '#9333ea', core: '#f3e8ff' },
 { col: -1, sz: 2, spd: 9.5,  ph: 16,  c: '#67e8f9', core: '#ffffff' },
 { col: 1,  sz: 2, spd: 7.0,  ph: 41,  c: '#f472b6', core: '#ffffff' },
 { col: 3,  sz: 3, spd: 10.2, ph: 8,   c: '#a855f7', core: '#ffffff' },
 { col: 5,  sz: 2, spd: 8.0,  ph: 26,  c: '#38bdf8', core: '#e0f2fe' },
 { col: -8, sz: 2, spd: 9.0,  ph: 18,  c: '#c084fc', core: '#ffffff' },
 { col: 8,  sz: 2, spd: 8.2,  ph: 33,  c: '#22d3ee', core: '#ffffff' },
 { col: 0,  sz: 3, spd: 7.4,  ph: 12,  c: '#c084fc', core: '#ffffff' },
 { col: -2, sz: 2, spd: 10.5, ph: 21,  c: '#67e8f9', core: '#ffffff' },
 { col: 4,  sz: 1, spd: 12.0, ph: 15,  c: '#ffffff' }
];

function drawCampPortal(target,theme,original=false){
 const ctx=target||cv.getContext('2d');
 const {x,y}=campPortal,pulse=Math.sin(time*3.5),t=time;
 const isHovered=!target&&pickCampPortal(wpos());
 const isGoblinTheme=(theme||window.campPortalTheme)==='goblin';
 if(!original&&gameArtDraw(isGoblinTheme?'portal-camp-goblin':'portal-camp',ctx,x,y))return;
 // Brilho mágico no solo ao redor do portal de madeira mágica
 const groundGlow=ctx.createRadialGradient(x,y,4,x,y,32);
 if(isGoblinTheme){
  groundGlow.addColorStop(0,'rgba(255,70,20,0.55)');
  groundGlow.addColorStop(0.6,'rgba(255,160,30,0.25)');
  groundGlow.addColorStop(1,'rgba(70,10,0,0)');
 }else{
  groundGlow.addColorStop(0,'rgba(125,78,255,0.45)');
  groundGlow.addColorStop(0.6,'rgba(62,217,255,0.22)');
  groundGlow.addColorStop(1,'rgba(50,20,90,0)');
 }
 ctx.fillStyle=groundGlow;ctx.fillRect(x-35,y-25,70,50);

 // Sombra projetada no chão
 ctx.fillStyle='rgba(10,5,18,0.55)';
 ctx.beginPath();ctx.ellipse(x,y+2,26,7,0,0,Math.PI*2);ctx.fill();

 // Raízes grossas de madeira mágica se espalhando no solo
 ctx.fillStyle='#23140e';
 ctx.fillRect(x-26,y-1,10,4);ctx.fillRect(x+16,y-1,10,4);
 ctx.fillRect(x-22,y+2,8,2);ctx.fillRect(x+14,y+2,8,2);
 ctx.fillStyle='#3d2317';
 ctx.fillRect(x-25,y,8,2);ctx.fillRect(x+17,y,8,2);
 ctx.fillRect(x-19,y+1,5,2);ctx.fillRect(x+14,y+1,5,2);
 ctx.fillStyle='#5c3824';
 ctx.fillRect(x-23,y,5,1);ctx.fillRect(x+18,y,1,5,1);

 // Musgo e cogumelos luminescentes nas raízes
 ctx.fillStyle='#1c4222';ctx.fillRect(x-24,y-1,4,1);ctx.fillRect(x+20,y-1,4,1);
 ctx.fillStyle=isGoblinTheme?'#ff7722':'#2ee69a';ctx.fillRect(x-21,y-2,2,2);ctx.fillRect(x+19,y-2,2,2);
 ctx.fillStyle=isGoblinTheme?'#ffd033':'#ff529a';ctx.fillRect(x-17,y-1,2,1);ctx.fillRect(x+15,y-1,2,1);

 // Centro do Portal em Pixel Art: Vórtice Dimensional com quadradinhos subindo devagar
 ctx.save();
 // Máscara de recorte do portal em pixel art (cobre toda a abertura interna entre os pilares)
 ctx.beginPath();
 ctx.rect(x - 11, y - 42, 22, 42);
 ctx.clip();

 // Fundo do portal em faixas de pixel art
 if(isGoblinTheme){
  ctx.fillStyle = '#100202'; ctx.fillRect(x - 11, y - 42, 22, 42);
  ctx.fillStyle = '#220606'; ctx.fillRect(x - 11, y - 37, 22, 37);
  ctx.fillStyle = '#380907'; ctx.fillRect(x - 10, y - 32, 20, 32);
  ctx.fillStyle = '#521008'; ctx.fillRect(x - 9, y - 26, 18, 26);
  ctx.fillStyle = '#6e1a0b'; ctx.fillRect(x - 8, y - 20, 16, 20);
 }else{
  ctx.fillStyle = '#06020c'; ctx.fillRect(x - 11, y - 42, 22, 42);
  ctx.fillStyle = '#0d041a'; ctx.fillRect(x - 11, y - 37, 22, 37);
  ctx.fillStyle = '#140626'; ctx.fillRect(x - 10, y - 32, 20, 32);
  ctx.fillStyle = '#1c0836'; ctx.fillRect(x - 9, y - 26, 18, 26);
  ctx.fillStyle = '#260a4a'; ctx.fillRect(x - 8, y - 20, 16, 20);
 }

 // Textura sutil de colunas de energia em pixel art no fundo
 for(let col = -10; col <= 9; col += 2){
  const bandPulse = Math.sin(t * 3 + col * 0.8) * 0.5 + 0.5;
  if(isGoblinTheme){
   ctx.fillStyle = (col % 4 === 0) ? `rgba(255,100,30,${0.08 + bandPulse * 0.12})` : `rgba(255,200,60,${0.05 + bandPulse * 0.08})`;
  } else {
   ctx.fillStyle = (col % 4 === 0) ? `rgba(168,85,247,${0.06 + bandPulse * 0.08})` : `rgba(34,211,238,${0.04 + bandPulse * 0.06})`;
  }
  ctx.fillRect(x + col, y - 37, 1, 37);
 }

 // Quadradinhos subindo devagar em pixel art
 const travelH = 41;
 for(let i = 0; i < PORTAL_SQUARES.length; i++){
  const sq = PORTAL_SQUARES[i];
  const progress = (t * sq.spd + sq.ph) % travelH;
  const py = Math.floor(y - 1 - progress);
  // Movimento vertical com leve oscilação horizontal de 1 pixel
  const px = Math.floor(x + sq.col + Math.sin(t * 1.8 + sq.ph * 0.6) * 1.1);

  // Variação de opacidade nas bordas de entrada (inferior) e saída (superior)
  let alpha = 1;
  if(progress < 5) alpha = progress / 5;
  else if(progress > travelH - 6) alpha = (travelH - progress) / 6;

  ctx.globalAlpha = Math.max(0.15, Math.min(1, alpha));
  let color = sq.c;
  let coreColor = sq.core;
  if(isGoblinTheme){
   if(color === '#a855f7' || color === '#9333ea' || color === '#c084fc') color = '#ef4444';
   else if(color === '#d8b4fe' || color === '#e9d5ff') color = '#f97316';
   else if(color === '#22d3ee' || color === '#06b6d4' || color === '#67e8f9') color = '#fbbf24';
   else if(color === '#a5f3fc') color = '#fef08a';
   if(coreColor === '#ffffff') coreColor = '#fffbeb';
   else if(coreColor === '#f3e8ff' || coreColor === '#cffafe') coreColor = '#fee2e2';
  }

  if(sq.sz === 3){
   // Quadradinho 3x3 com miolo brilhante 1x1
   ctx.fillStyle = color;
   ctx.fillRect(px - 1, py - 1, 3, 3);
   if(coreColor){
    ctx.fillStyle = coreColor;
    ctx.fillRect(px, py, 1, 1);
   }
  } else if(sq.sz === 2){
   // Quadradinho 2x2 com destaque
   ctx.fillStyle = color;
   ctx.fillRect(px, py, 2, 2);
   if(coreColor){
    ctx.fillStyle = coreColor;
    ctx.fillRect(px, py, 1, 1);
   }
  } else {
   // Quadradinho 1x1
   ctx.fillStyle = color;
   ctx.fillRect(px, py, 1, 1);
  }
 }
 ctx.globalAlpha = 1;

 // Moldura interna brilhante em pixel art no portal
 if(isGoblinTheme){
  ctx.fillStyle = 'rgba(239,68,68,0.45)';
  ctx.fillRect(x - 11, y - 37, 1, 37);
  ctx.fillRect(x + 10, y - 37, 1, 37);
  ctx.fillRect(x - 11, y - 37, 22, 1);
  ctx.fillStyle = 'rgba(251,191,36,0.35)';
  ctx.fillRect(x - 10, y - 37, 1, 37);
  ctx.fillRect(x + 9, y - 37, 1, 37);
 } else {
  ctx.fillStyle = 'rgba(168,85,247,0.35)';
  ctx.fillRect(x - 11, y - 37, 1, 37);
  ctx.fillRect(x + 10, y - 37, 1, 37);
  ctx.fillRect(x - 11, y - 37, 22, 1);
  ctx.fillStyle = 'rgba(34,211,238,0.25)';
  ctx.fillRect(x - 10, y - 37, 1, 37);
  ctx.fillRect(x + 9, y - 37, 1, 37);
 }

 ctx.restore();

 // Troncos colossais retorcidos de madeira mágica (Pilares laterais)
 // Pilar Esquerdo (x-21 a x-11, y-44 a y)
 ctx.fillStyle='#1d100b';ctx.fillRect(x-21,y-44,10,44);
 ctx.fillStyle='#361e14';ctx.fillRect(x-20,y-44,9,43);
 ctx.fillStyle='#52301f';ctx.fillRect(x-19,y-42,7,40);
 ctx.fillStyle='#73452c';ctx.fillRect(x-18,y-40,4,37);
 ctx.fillStyle='#945b3a';ctx.fillRect(x-17,y-36,2,32);

 // Pilar Direito (x+11 a x+21, y-44 a y)
 ctx.fillStyle='#1d100b';ctx.fillRect(x+11,y-44,10,44);
 ctx.fillStyle='#361e14';ctx.fillRect(x+11,y-44,9,43);
 ctx.fillStyle='#52301f';ctx.fillRect(x+12,y-42,7,40);
 ctx.fillStyle='#73452c';ctx.fillRect(x+14,y-40,4,37);
 ctx.fillStyle='#945b3a';ctx.fillRect(x+15,y-36,2,32);

 // Nós e anéis de madeira viva na casca
 ctx.fillStyle='#23140e';
 ctx.fillRect(x-18,y-25,5,4);ctx.fillRect(x+13,y-28,5,4);
 ctx.fillRect(x-17,y-12,4,3);ctx.fillRect(x+14,y-14,4,3);
 ctx.fillStyle='#422618';
 ctx.fillRect(x-17,y-24,3,2);ctx.fillRect(x+14,y-27,3,2);

 // Veios de Seiva Arcana Luminosa entalhados na madeira viva (brilho pulsante)
 const veinAlpha=0.65+0.35*Math.sin(t*4);
 ctx.fillStyle=isGoblinTheme?`rgba(255,100,20,${veinAlpha})`:`rgba(78,238,255,${veinAlpha})`;
 ctx.fillRect(x-16,y-36,2,9);ctx.fillRect(x-15,y-27,1,7);ctx.fillRect(x-16,y-20,2,8);ctx.fillRect(x-17,y-12,1,6);
 ctx.fillRect(x+15,y-37,2,8);ctx.fillRect(x+14,y-29,1,8);ctx.fillRect(x+15,y-21,2,7);ctx.fillRect(x+16,y-14,1,6);
 ctx.fillStyle=isGoblinTheme?`rgba(255,210,50,${veinAlpha})`:`rgba(192,132,252,${veinAlpha})`;
 ctx.fillRect(x-15,y-32,1,3);ctx.fillRect(x-16,y-18,1,3);
 ctx.fillRect(x+16,y-34,1,4);ctx.fillRect(x+15,y-18,1,3);

 // Trepadeiras e folhagens místicas entrelaçadas nos troncos
 ctx.fillStyle='#1e421a';
 ctx.fillRect(x-21,y-30,2,8);ctx.fillRect(x-20,y-22,3,2);ctx.fillRect(x-21,y-14,2,7);
 ctx.fillRect(x+19,y-32,2,9);ctx.fillRect(x+18,y-23,3,2);ctx.fillRect(x+19,y-15,2,8);
 ctx.fillStyle='#387a2a';
 ctx.fillRect(x-22,y-29,2,3);ctx.fillRect(x-19,y-21,2,2);ctx.fillRect(x-22,y-12,2,3);
 ctx.fillRect(x+20,y-30,2,3);ctx.fillRect(x+17,y-22,2,2);ctx.fillRect(x+20,y-13,2,3);
 ctx.fillStyle='#5dd444';
 ctx.fillRect(x-22,y-28,1,1);ctx.fillRect(x+20,y-29,1,1);

 // Arco superior de galhos curvados e entrelaçados (com sobreposição sem frestas)
 ctx.fillStyle='#1d100b';ctx.fillRect(x-18,y-47,36,11);ctx.fillRect(x-14,y-50,28,6);
 ctx.fillStyle='#361e14';ctx.fillRect(x-17,y-46,34,9);ctx.fillRect(x-13,y-49,26,5);
 ctx.fillStyle='#52301f';ctx.fillRect(x-15,y-45,30,7);ctx.fillRect(x-11,y-48,22,4);
 ctx.fillStyle='#73452c';ctx.fillRect(x-13,y-44,26,5);ctx.fillStyle='#945b3a';ctx.fillRect(x-11,y-43,22,2);

 // Cantoneiras / mísulas entalhadas nos cantos internos do portal
 ctx.fillStyle='#1d100b';
 ctx.fillRect(x-11,y-37,3,2);ctx.fillRect(x-11,y-35,2,2);
 ctx.fillRect(x+8,y-37,3,2);ctx.fillRect(x+9,y-35,2,2);
 ctx.fillStyle='#361e14';
 ctx.fillRect(x-11,y-37,2,1);ctx.fillRect(x-11,y-36,1,1);
 ctx.fillRect(x+9,y-37,2,1);ctx.fillRect(x+10,y-36,1,1);

 // Galhos e brotos mágicos pontiagudos saindo do topo do arco
 ctx.fillStyle='#361e14';
 ctx.fillRect(x-18,y-51,3,4);ctx.fillRect(x-19,y-54,2,4);
 ctx.fillRect(x+15,y-51,3,4);ctx.fillRect(x+17,y-54,2,4);
 ctx.fillStyle='#5cb842';
 ctx.fillRect(x-20,y-55,2,2);ctx.fillRect(x+18,y-55,2,2);

 // Cristal de Madeira Mágica / Gema Arcana incrustada no ápice do arco
 const crystalGlow=ctx.createRadialGradient(x,y-46,1,x,y-46,10);
 if(isGoblinTheme){
  crystalGlow.addColorStop(0,'rgba(255,255,220,0.95)');
  crystalGlow.addColorStop(0.4,'rgba(255,90,30,0.85)');
  crystalGlow.addColorStop(1,'rgba(220,38,38,0)');
  ctx.fillStyle=crystalGlow;ctx.beginPath();ctx.arc(x,y-46,9+pulse,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#450a0a';ctx.fillRect(x-3,y-49,6,7);
  ctx.fillStyle='#ea580c';ctx.fillRect(x-2,y-48,4,5);
  ctx.fillStyle='#fef08a';ctx.fillRect(x-1,y-47,2,3);
  ctx.fillStyle='#ffffff';ctx.fillRect(x,y-47,1,2);
 }else{
  crystalGlow.addColorStop(0,'rgba(255,255,255,0.9)');
  crystalGlow.addColorStop(0.4,'rgba(78,238,255,0.7)');
  crystalGlow.addColorStop(1,'rgba(147,51,234,0)');
  ctx.fillStyle=crystalGlow;ctx.beginPath();ctx.arc(x,y-46,9+pulse,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#0f303d';ctx.fillRect(x-3,y-49,6,7);
  ctx.fillStyle='#38bdf8';ctx.fillRect(x-2,y-48,4,5);
  ctx.fillStyle='#bae6fd';ctx.fillRect(x-1,y-47,2,3);
  ctx.fillStyle='#ffffff';ctx.fillRect(x,y-47,1,2);
 }

 // Esporos / Fagulhas mágicas flutuando para o céu
 for(let s=0;s<5;s++){
  const spT=(t*16+s*25)%45,spX=x-16+((s*13+t*4)%32),spY=y-8-spT;
  const spAlpha=Math.max(0,1-spT/45);
  ctx.fillStyle=isGoblinTheme
   ?(s%2?`rgba(255,130,20,${spAlpha})`:`rgba(255,220,50,${spAlpha})`)
   :(s%2?`rgba(78,238,255,${spAlpha})`:`rgba(216,180,254,${spAlpha})`);
  ctx.fillRect(Math.round(spX),Math.round(spY),1.5,1.5);
 }

 // Rótulo e hover do portal
 if(target)return;
 const portalTitle=isGoblinTheme?'PORTAL: COVIL DOS GOBLINS':'PORTAL MÁGICO';
 ctx.font='bold 6px monospace';ctx.textAlign='center';
 ctx.fillStyle='#120822';ctx.fillText(portalTitle,x+.5,y-53.5);
 ctx.fillStyle=isHovered?'#ffd84a':(isGoblinTheme?'#ff8844':'#d8b4fe');ctx.fillText(portalTitle,x,y-54);
 if(isHovered){
  ctx.font='5px monospace';
  ctx.fillStyle='#000';ctx.fillText('Clique para abrir as Masmorras',x+.5,y-60.5);
  ctx.fillStyle='#ffffff';ctx.fillText('Clique para abrir as Masmorras',x,y-61);
 }
}
for(const theme of ['magic','goblin'])gameArtRegister(theme==='goblin'?'portal-camp-goblin':'portal-camp',theme==='goblin'?'Portal do acampamento — goblins':'Portal do acampamento — mágico',{
 w:64,h:64,ay:60/64,draw:g=>{g.translate(32-campPortal.x,60-campPortal.y);drawCampPortal(g,theme,true)}
});
function dr(img,x,y,fl,sc=1,an){const k=sc/(img.q||1),w=img.width*k,hh=img.height*k;const pd=(img.pad||0)*k;ctx.fillStyle='#0005';ctx.fillRect(Math.round(x-w/2+pd+2),Math.round(y),Math.round(w-2*pd-4),3);
 if(an){ctx.save();ctx.translate(Math.round((x+an.dx)*S)/S,Math.round((y+an.dy)*S)/S);ctx.rotate(an.rot);if(an.sk)ctx.transform(1,0,an.sk,1,0,0);ctx.scale(an.sx*(fl<0?-1:1),an.sy);
  ctx.drawImage(img,-w/2,-hh+3+(img.anchorY||0),w,hh);
  ctx.restore();return}
 const dx=Math.round((x-w/2)*S)/S,dy=Math.round((y-hh+3+(img.anchorY||0))*S)/S;
 if(fl<0){ctx.save();ctx.translate(dx+w,dy);ctx.scale(-1,1);ctx.drawImage(img,0,0,w,hh);ctx.restore()}else ctx.drawImage(img,dx,dy,w,hh)}
// animação procedural: parado (respirar), andar (pulinho+balanço), atacar (recuo e golpe), dano (tremida)
const monsterAnimationArtCache=new WeakMap();
function monsterSpriteFrame(e,dir,an){
 const definition=MONSTER_TYPES[e.ty],animation=e.dungeonAnimation||definition&&definition.animation;
 if(!animation)return fr(e.sp,dir,an);
 const action=e.aw>0||e.skillWindup?'attack':time-(e.mvAt==null?-9:e.mvAt)<.15?'walk':'idle';
 const frames=animation[action]&&animation[action].length?animation[action]:animation.idle;
 if(!frames||!frames.length)return fr(e.sp,dir,an);
 if(e.spriteAction!==action){e.spriteAction=action;e.spriteActionAt=time}
 const duration=Number(animation.durations&&animation.durations[action]);
 const interval=duration>0?duration/frames.length:Math.max(.05,Number(animation.interval)||.18);
 const frame=frames[Math.floor(Math.max(0,time-e.spriteActionAt)/interval)%frames.length];
 if(frame&&typeof frame.getContext=='function')return frame;
 if(!frame||typeof frame!='object')return fr(e.sp,dir,an);
 let sprite=monsterAnimationArtCache.get(frame);
 if(!sprite){sprite=pixelArt(frame);if(sprite)monsterAnimationArtCache.set(frame,sprite)}
 return sprite||fr(e.sp,dir,an)
}
function anim(u,wu,slime){
 const a={dx:0,dy:0,sx:1,sy:1,rot:0};
 if(u._aid===undefined)u._aid=((u.hx!==undefined?u.hx:u.x||0)*7.13+(u.hy!==undefined?u.hy:u.y||0)*3.71)%6.28;
 const id=u._aid,t=time,s=(u.fx||0)>=0?1:-1;
 const dt=Math.max(0,Math.min(.05,t-(u._lt||t)));u._lt=t;
 if(u.px!==undefined&&Math.hypot(u.x-u.px,u.y-u.py)>.02)u.mvAt=t;u.px=u.x;u.py=u.y;
 const isMoving=t-(u.mvAt||-9)<.12;

 if(u.aw>0&&wu){
  if(slime)u.hopT=0;
  const k=1-u.aw/wu;
  a.sw=k<.34?1:k<.67?2:3;
  if(slime){
   if(k<.5){const q=k/.5;a.sy=1-.18*q;a.sx=1+.14*q;a.dy=q}
   else{const q=(k-.5)/.5;a.sy=.82+.28*q;a.sx=1.14-.18*q;a.dy=1-q*2;a.dx=s*q*2}
  }else{
   if(k<.5){const q=k/.5;a.sy=1-.1*q;a.sx=1+.06*q;a.rot=-.16*q*s;a.dy=q}
   else{const q=(k-.5)/.5;a.sy=.9+.2*q;a.sx=1.06-.1*q;a.rot=(-.16+.4*q)*s;a.dy=1-q*2}
  }
 }else if(slime){
  const hopDur=0.52;
  if(isMoving){
   u.hopT=(u.hopT||0)+dt;
  }else if(u.hopT&&(u.hopT%hopDur)>0.01){
   u.hopT+=dt*1.4;
   if((u.hopT%hopDur)<0.04)u.hopT=0;
  }else{
   u.hopT=0;
  }
  if(u.hopT>0){
   const p=(u.hopT%hopDur)/hopDur;
   if(p<0.14){
    const squash=Math.sin((p/0.14)*Math.PI)*0.22;
    a.dy=0;a.sy=1-squash;a.sx=1+squash*0.8;
   }else if(p<0.74){
    const k=(p-0.14)/0.60,jumpH=Math.sin(k*Math.PI);
    a.dy=-jumpH*5.5;
    const stretch=(1-k*0.6)*0.24*jumpH;
    a.sy=1+stretch;a.sx=1-stretch*0.5;
   }else if(p<0.90){
    const landSquash=Math.sin(((p-0.74)/0.16)*Math.PI)*0.26;
    a.dy=0;a.sy=1-landSquash;a.sx=1+landSquash*0.85;
   }else{
    const rebound=Math.sin(((p-0.90)/0.10)*Math.PI)*0.05;
    a.dy=0;a.sy=1+rebound;a.sx=1-rebound*0.5;
   }
  }else{
   const w=Math.sin(t*2.2+id);
   a.sy=1+w*0.06;a.sx=1-w*0.03;
  }
 }else if(isMoving){
  a.dy=-Math.abs(Math.sin(t*12.566))*1.2;
  a.ph=[1,0,2,0][Math.floor(t*8)%4];
 }else{
  const w=Math.sin(t*2.5+id);
  a.sy=1+w*.025;
 }
 if(u.hit>0)a.dx=Math.sin(t*90)*1.2;
 return a}
const wh=img=>img.height/(img.q||1);
/* Clique em monstro: caixa do tamanho do sprite desenhado (com folga de 5 px para os lados e em cima),
   mínimo de 22×26 px para os pequenos; com vários sobrepostos, vence o mais perto do cursor. */
function pick(w){
 let best=null,bd=Infinity;
 for(const e of en){
  if(e.hp<=0||!canSee(e.x,e.y))continue;
  const img=e.img,q=img&&img.q||1,sc=(e.bossType=='grandboss'?1.8:e.bossType=='boss'||e.boss?1.5:1)*(window.MSCALE||.7)*(e.size||1);
  const half=Math.max(11,(img?img.width/q:16)*sc/2+5),h=Math.max(26,(img?img.height/q:16)*sc+8);
  const dx=w.x-e.x,top=e.y-h,bottom=e.y+6;
  if(Math.abs(dx)>half||w.y<top||w.y>bottom)continue;
  const d=Math.hypot(dx,(w.y-(e.y-h/2))*.7);
  if(d<bd){bd=d;best=e}
 }
 return best
}
function lunge(u,t,aw,wu){if(!(aw>0)||!t)return[0,0];const d=Math.hypot(t.x-u.x,t.y-u.y)||1,k=5*(1-aw/wu);return[(t.x-u.x)/d*k,(t.y-u.y)/d*k]}
function statusDots(t,x,y){if(!t.st)return;let i=0;for(const k in t.st){if(!FX_INFO[k])continue;ctx.fillStyle='#000a';ctx.fillRect(x+i*4-.5,y-.5,3,3);ctx.fillStyle=FX_INFO[k].c;ctx.fillRect(x+i*4,y,2,2);i++}}
function bar(x,y,w,f,c){ctx.fillStyle='#000a';ctx.fillRect(Math.round(x-w/2)-1,Math.round(y)-1,w+2,4);ctx.fillStyle=c;ctx.fillRect(Math.round(x-w/2),Math.round(y),Math.round(w*f),2)}
function circ(x,y,r,c,fill){ctx.beginPath();ctx.ellipse(x,y,r,r*.75,0,0,7);if(fill){ctx.fillStyle=c;ctx.fill()}else{ctx.strokeStyle=c;ctx.lineWidth=1;ctx.stroke()}}
function drawMapElement(e){
 const s=sceneryFor(e);if(!s)return;const k=1/(s.c.q||1);
 ctx.drawImage(s.c,Math.round((e.x-s.ax*k)*S)/S,Math.round((e.y-s.ay*k)*S)/S,s.c.width*k,s.c.height*k)
}
function drawCarpenterDebris(n){
 const x=n.x,y=n.y;
 ctx.fillStyle='#0005';ctx.fillRect(x-17,y+1,34,4);
 ctx.fillStyle='#5a351b';ctx.fillRect(x-15,y-14,27,5);ctx.fillRect(x-11,y-20,22,5);
 ctx.fillStyle='#9b6935';ctx.fillRect(x-14,y-13,24,3);ctx.fillRect(x-10,y-19,19,3);
 ctx.fillStyle='#d0a15a';ctx.fillRect(x-12,y-13,3,1);ctx.fillRect(x+6,y-19,3,1);
 ctx.fillStyle='#75441f';ctx.fillRect(x+12,y-12,5,12);ctx.fillStyle='#c28a42';ctx.fillRect(x+13,y-11,3,7);
 ctx.fillStyle='#55504a';ctx.fillRect(x+13,y-17,2,6);ctx.fillStyle='#b7a17c';ctx.fillRect(x+11,y-18,6,2)
}
function drawCampLog(x,y,w=12,h=32){
 x=Math.round(x);y=Math.round(y);
 ctx.fillStyle='#0005';ctx.fillRect(x-w/2-2,y,w+4,5);
 ctx.fillStyle='#382315';ctx.fillRect(x-w/2-1,y-h,w+2,h+3);
 ctx.fillStyle='#79502d';ctx.fillRect(x-w/2,y-h+3,w,h-1);
 ctx.fillStyle='#bf8b4b';ctx.fillRect(x-w/2+1,y-h+4,3,h-3);
 ctx.fillStyle='#52321c';ctx.fillRect(x+w/2-3,y-h+4,2,h-3);
 ctx.fillStyle='#e0b476';ctx.fillRect(x-w/2+1,y-h+1,w-2,3);
 ctx.fillStyle='#9b6a35';ctx.fillRect(x-2,y-h+1,3,2);
 ctx.fillStyle='#462c1b';ctx.fillRect(x-1,y-h+10,2,5);ctx.fillRect(x+2,y-10,1,6)
}
function drawCampGate(){
 const {x,y}=campGate,h=CAMP_WALL.halfGate;
 drawCampLog(x-h,y,12,38);drawCampLog(x+h,y,12,38);
 ctx.fillStyle='#382315';ctx.fillRect(x-h-6,y-39,h*2+12,6);
 ctx.fillStyle='#bd8b4d';ctx.fillRect(x-h-5,y-38,h*2+10,3);
 if(!CAMP_WALL.gateOpen){
  for(let dx=-h+9;dx<h-5;dx+=9)drawCampLog(x+dx,y,9,30);
  ctx.fillStyle='#4a2e1b';ctx.fillRect(x-h+6,y-23,h*2-12,3);ctx.fillRect(x-h+6,y-9,h*2-12,3);
  ctx.fillStyle='#929698';ctx.fillRect(x-3,y-16,6,4)
 }else{
  ctx.fillStyle='#6d4425';ctx.fillRect(x-h+2,y-24,5,23);ctx.fillRect(x+h-7,y-24,5,23);
  ctx.fillStyle='#ba8748';ctx.fillRect(x-h+3,y-22,1,19);ctx.fillRect(x+h-6,y-22,1,19)
 }
 ctx.font='6px monospace';ctx.textAlign='center';ctx.fillStyle='#ffe28a';
 ctx.fillText(CAMP_WALL.gateOpen?'Portão aberto':'Portão fechado',x,y-44);
 if(pickCampGate(wpos())){ctx.fillStyle='#fff';ctx.fillText('Clique para '+(CAMP_WALL.gateOpen?'fechar':'abrir'),x,y-51)}
}
const fog=document.createElement('canvas'),fogCtx=fog.getContext('2d'),fogMaskCv=document.createElement('canvas'),fogMask=fogMaskCv.getContext('2d'),VISION_RANGE=200;
const visionTrees=()=>trees.filter(t=>Math.hypot(t.x-p.x,t.y-17-p.y)<VISION_RANGE+20);
function treeHit(ox,oy,dx,dy,t){
 const x=(ox-t.x)/15,y=(oy-(t.y-17))/11,a=(dx/15)**2+(dy/11)**2,b=2*(x*dx/15+y*dy/11),c=x*x+y*y-1;
 if(c<=0)return Infinity;
 const disc=b*b-4*a*c;if(disc<0)return Infinity;
 const hit=(-b-Math.sqrt(disc))/(2*a);return hit>0?hit:Infinity
}
function treeExit(ox,oy,dx,dy,t){
 const x=(ox-t.x)/15,y=(oy-(t.y-17))/11,a=(dx/15)**2+(dy/11)**2,b=2*(x*dx/15+y*dy/11),c=x*x+y*y-1;
 if(c<=0)return Infinity;
 const disc=b*b-4*a*c;if(disc<0)return Infinity;
 const s=Math.sqrt(disc);return (-b-s)/(2*a)>0?(-b+s)/(2*a):Infinity
}
let fogPat=null;
function fogPattern(){
 if(fogPat)return fogPat;
 const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
 for(let i=0;i<26;i++){
  const x=Math.random()*256,y=Math.random()*256,rr=30+Math.random()*50,l=Math.random()<.5?'200,210,215':'20,26,30',al=.10+Math.random()*.12;
  for(const ox of[-256,0,256])for(const oy of[-256,0,256]){
   const gr=g.createRadialGradient(x+ox,y+oy,0,x+ox,y+oy,rr);gr.addColorStop(0,'rgba('+l+','+al+')');gr.addColorStop(1,'rgba('+l+',0)');
   g.fillStyle=gr;g.fillRect(x+ox-rr,y+oy-rr,rr*2,rr*2)
  }
 }
 return fogPat=fogCtx.createPattern(c,'repeat')
}
function canSee(x,y){
 const dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy);if(d>VISION_RANGE)return false;if(d<.001)return true;
 return !visionTrees().some(t=>treeHit(p.x,p.y,dx,dy,t)<1)
}
function drawVision(){
 // a névoa é toda borrada: desenhada em resolução reduzida (Q) e ampliada, custa uma fração do tempo
 const Q=window.modoDesempenho?.2:.35,S0=S,FW=Math.max(1,Math.ceil(cv.width*Q)),FH=Math.max(1,Math.ceil(cv.height*Q));
 if(fog.width!=FW||fog.height!=FH){fog.width=FW;fog.height=FH;fogMaskCv.width=FW;fogMaskCv.height=FH}
 {const S=S0*Q;
 const FOG_A=.80,FOG_RGB='58,66,72',W=fog.width,H=fog.height,cx=W/2,cy=H/2,r=VISION_RANGE*S;
 // máscara de visão: polígono de raios (bloqueado pelas árvores), borrado e com borda radial suave
 const m=fogMask;m.setTransform(1,0,0,1,0,0);m.globalCompositeOperation='source-over';m.filter='none';m.clearRect(0,0,W,H);
 const trs=visionTrees(),N=240,R=VISION_RANGE+30;
 m.beginPath();
 for(let i=0;i<N;i++){
  const a=i/N*Math.PI*2,dx=Math.cos(a),dy=Math.sin(a);let dist=R;
  for(const t of trs){const e=treeExit(p.x,p.y,dx,dy,t);if(e<dist)dist=e}
  const X=cx+dx*dist*S,Y=cy+dy*dist*S;i?m.lineTo(X,Y):m.moveTo(X,Y)
 }
 m.closePath();m.fillStyle='#fff';m.filter='blur('+(5*S)+'px)';m.fill();m.filter='none';
 const edge=45*S,vis=m.createRadialGradient(cx,cy,Math.max(0,r-edge),cx,cy,r);
 vis.addColorStop(0,'rgba(0,0,0,1)');vis.addColorStop(1,'rgba(0,0,0,0)');
 m.globalCompositeOperation='destination-in';m.fillStyle=vis;m.fillRect(0,0,W,H);m.globalCompositeOperation='source-over';
 // névoa escura com neblina em movimento, recortada pela máscara
 fogCtx.setTransform(1,0,0,1,0,0);fogCtx.globalCompositeOperation='source-over';fogCtx.globalAlpha=1;fogCtx.clearRect(0,0,W,H);
 fogCtx.fillStyle='rgba('+FOG_RGB+','+FOG_A+')';fogCtx.fillRect(0,0,W,H);
 const tm=performance.now()/1000,pat=fogPattern();
 fogCtx.globalCompositeOperation='source-atop';fogCtx.fillStyle=pat;
 [[.012,.006,.5],[-.008,.01,.35]].forEach(([vx,vy,al],k)=>{
  const ox=(tm*vx*600+k*97)%256,oy=(tm*vy*600+k*53)%256;
  fogCtx.globalAlpha=al;fogCtx.setTransform(S*1.6,0,0,S*1.6,ox*S,oy*S);fogCtx.fillRect(-300,-300,W/(S*1.6)+600,H/(S*1.6)+600)
 });
 fogCtx.setTransform(1,0,0,1,0,0);fogCtx.globalAlpha=1;
 fogCtx.globalCompositeOperation='destination-out';fogCtx.drawImage(fogMaskCv,0,0);fogCtx.globalCompositeOperation='source-over';
 }
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='low';ctx.drawImage(fog,0,0,cv.width,cv.height);ctx.restore()
}
function drawDynamicLighting(){
 if(window.modoDesempenho)return;
 const W=cv.width,H=cv.height;
 const sources=[],screen=(x,y)=>({x:W/2+(x-p.x)*S,y:H/2+(y-p.y)*S});
 const add=(x,y,r,color,power=1)=>{const pt=screen(x,y);if(pt.x+r<0||pt.x-r>W||pt.y+r<0||pt.y-r>H)return;sources.push({...pt,r:r*S,color,power})};
 const flicker=.94+.04*Math.sin(time*9)+.02*Math.sin(time*23);
 if(p.dead<=0)add(p.x,p.y-7,72,'185,210,255',.58);
 add(CX,CY-4,88,'255,150,60',flicker);
 (window.PORTALS||[]).forEach(q=>add(q.x,q.y-16,32,'170,105,255',.48));
 proj.slice(0,12).forEach(q=>add(q.x,q.y,18,q.c==='#ff7a1a'?'255,130,45':'140,190,255',.4));
 fxs.slice(0,12).forEach(f=>{
  if(f.style==='fire'||f.style==='holy'||f.style==='frost'||f.style==='nature'||f.style==='shadow'){
   const color=f.style==='fire'?'255,115,35':f.style==='holy'?'255,225,145':f.style==='frost'?'130,205,255':f.style==='nature'?'155,225,100':'175,110,255';
   add(f.x,f.y,Math.min(36,Math.max(18,f.r*.55)),color,.35)
  }
 });
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='screen';
 sources.forEach(q=>{
  const g=ctx.createRadialGradient(q.x,q.y,0,q.x,q.y,q.r);
  g.addColorStop(0,'rgba('+q.color+','+(q.power*.11)+')');g.addColorStop(.45,'rgba('+q.color+','+(q.power*.045)+')');g.addColorStop(1,'rgba('+q.color+',0)');
  ctx.fillStyle=g;ctx.fillRect(q.x-q.r,q.y-q.r,q.r*2,q.r*2)
 });
 ctx.restore()
}
function draw(){
 if(MODO.motor)return;
 if(window.inTaverna&&window.drawTaverna){
  drawTaverna();
  return;
 }
 if(window.inDungeon&&window.drawDungeonWorld){
  drawDungeonWorld();
  return;
 }
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#1f6a9a';ctx.fillRect(0,0,cv.width,cv.height);
 ctx.setTransform(S,0,0,S,Math.round(cv.width/2-p.x*S),Math.round(cv.height/2-p.y*S));ctx.imageSmoothingEnabled=false;
 ctx.drawImage(map,0,0);
 {const r=CAMP_SAFE_HALF_SIZE;ctx.fillStyle='#72bf7410';ctx.fillRect(CX-r,CY-r,r*2,r*2);ctx.strokeStyle='#9ad78460';ctx.lineWidth=1;ctx.strokeRect(CX-r,CY-r,r*2,r*2)}

 // correnteza do rio
 for(let y=Math.floor((p.y-190)/5)*5;y<p.y+190;y+=5){const rx=riverX(y),rw=riverW(y);if(Math.abs(rx-p.x)>340)continue;
  for(let k=0;k<3;k++){const o=hash(y,k)*2-1,yy=y+Math.floor((time*7+hash(k,y)*5)%5);if(RBR.some(b=>Math.abs(yy-b)<12))continue;ctx.fillStyle=(y/5+k)%2?'#ffffff40':'#bfe8f835';ctx.fillRect(Math.round(rx+o*(rw-3)+Math.sin(time*1.3+y*.4+k*2)*1.5),yy,3,1)}}
 // brilho da fogueira
 {const fl=.5+.12*Math.sin(time*9)+.06*Math.sin(time*23),g=ctx.createRadialGradient(CX,CY,4,CX,CY,95);g.addColorStop(0,'rgba(255,170,60,'+(.38*fl)+')');g.addColorStop(1,'rgba(255,120,30,0)');ctx.fillStyle=g;ctx.fillRect(CX-100,CY-100,200,200)}
 // marcas de água animadas
 ctx.fillStyle='#ffffff30';for(let k=0;k<60;k++){const a=hash(k,1)*W,b=hash(1,k)*W;if(V(a/T|0,b/T|0)>30&&Math.abs(a-p.x)<300&&Math.abs(b-p.y)<200)ctx.fillRect(Math.round(a+Math.sin(time+k)*3),Math.round(b),5,1)}
 // alvos de meteoro
 mets.forEach(m=>{circ(m.x,m.y,36,'#f604',true);circ(m.x,m.y,36,'#f90')});if(window.drawPortals)drawPortals();
 const L=[];
 const occ=[];if(p.dead<=0)occ.push(p);en.forEach(e=>{if(e.hp>0&&Math.abs(e.x-p.x)<300&&Math.abs(e.y-p.y)<220)occ.push(e)});NPCS.forEach(n=>occ.push(n));
 trees.forEach(t=>{if(Math.abs(t.x-p.x)<260&&Math.abs(t.y-p.y)<170){const hid=occ.some(u=>u.y<t.y&&u.y>t.y-25&&Math.abs(u.x-t.x)<17),a0=t.a==null?1:t.a;t.a=a0+((hid?.42:1)-a0)*.18;L.push([t.y,()=>{ctx.globalAlpha=t.a;dr(TREEV[treeVar(t)]||TREE,t.x,t.y,1,1,{dx:0,dy:0,sx:1+Math.sin(time*2+t.y)*.012,sy:1,rot:0,sk:Math.sin(time*1.4+t.x*.09)*.07});ctx.globalAlpha=1}])}});
 mapElements.forEach(e=>{if(Math.abs(e.x-p.x)<260&&Math.abs(e.y-p.y)<170)L.push([e.y,()=>drawMapElement(e)])});
 if(wallBuilt){
  for(const post of campWallPosts)if(Math.abs(post.x-p.x)<300&&Math.abs(post.y-p.y)<220)L.push([post.y,()=>drawCampLog(post.x,post.y)]);
  if(Math.abs(campGate.x-p.x)<300&&Math.abs(campGate.y-p.y)<220)L.push([campGate.y+1,drawCampGate])
 }
 if(campPortalBuilt)L.push([campPortal.y,drawCampPortal]);
 if(window.blacksmithSaved){
  L.push([CY-35,()=>{
   const fx=CX+52,fy=CY-34;
   ctx.fillStyle='#2b2d30';ctx.fillRect(fx-7,fy-10,14,12);
   ctx.fillStyle='#1c1e22';ctx.fillRect(fx-8,fy-12,16,3);
   const emberFlicker=Math.sin(time*12)*0.15+0.85;
   ctx.fillStyle=`rgba(255,60,10,${0.9*emberFlicker})`;ctx.fillRect(fx-5,fy-8,10,5);
   ctx.fillStyle=`rgba(255,200,30,${emberFlicker})`;ctx.fillRect(fx-3,fy-7,6,3);
   ctx.fillStyle='#fff';ctx.fillRect(fx-1,fy-6,2,2);
   const ax=CX+74,ay=CY-34;
   ctx.fillStyle='#1a1a1e';ctx.fillRect(ax-5,ay-3,10,4);ctx.fillRect(ax-3,ay-6,6,4);
   ctx.fillStyle='#3a3d45';ctx.fillRect(ax-6,ay-8,12,3);ctx.fillRect(ax-7,ay-7,3,2);
   ctx.fillStyle='#6a7282';ctx.fillRect(ax-5,ay-8,9,1);
  }]);
 }
 NPCS.forEach(n=>{
  if(n.x<-1000)return;
  L.push([n.y,()=>{const f=face(n);if(hovN==n)circ(n.x,n.y,12,'#ff5');
   const spr=(n.blacksmith&&window.SPRITE_BLACKSMITH)?window.SPRITE_BLACKSMITH.idle:((CL[n.cls]&&CL[n.cls].sprite)||HS[n.cls][f.d]);
   dr(spr,n.x,n.y,f.fl,1,anim(n,0));
   ctx.font='6px monospace';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(n.nm,n.x+.5,n.y-19.5);ctx.fillStyle='#ffe28a';ctx.fillText(n.nm,n.x,n.y-20);
   ctx.fillStyle='#ffd84a';ctx.fillText(n.carpenter&&!questDone?'…':n.carpenter&&campPortalBuilt?'':n.carpenter&&sawQuestActive&&!sawObtained?'':n.carpenter?'!':n.blacksmith?'!':'!',n.x,n.y-26+Math.round(Math.sin(time*4)*1.5))}]);
 });
 if(!carpenterHelped&&Math.abs(carpenter.x-p.x)<260&&Math.abs(carpenter.y-p.y)<170)L.push([carpenter.y+3,()=>drawCarpenterDebris(carpenter)]);
 L.push([CY,()=>{ctx.fillStyle='#4a2c14';ctx.fillRect(CX-5,CY,10,2);ctx.fillRect(CX-4,CY-1,8,1);
  const f=Math.sin(time*14)>0?1:0;ctx.fillStyle='#e8541e';ctx.fillRect(CX-3,CY-5-f,6,5+f);ctx.fillStyle='#ffb02e';ctx.fillRect(CX-2,CY-4-f,4,4);ctx.fillStyle='#fff3a0';ctx.fillRect(CX-1,CY-2,2,2)}]);
 en.forEach(e=>{if(e.hp>0&&canSee(e.x,e.y))L.push([e.y,()=>{const o=lunge(e,p,e.aw,e.wu),scale=(e.bossType=='grandboss'?1.8:e.bossType=='boss'||e.boss?1.5:1)*(window.MSCALE||.7)*(e.size||1),spriteH=wh(e.img)*scale,labelY=e.y-spriteH-1;
 if(hov==e||p.tgt==e)circ(e.x,e.y,12,hov==e?'#ff5':'#f55');
 if(e.elite&&!e.boss){const k=.5+.5*Math.sin(time*4+e.x*.1);ctx.save();ctx.globalAlpha=.22+.18*k;ctx.fillStyle='#f0a52e';ctx.beginPath();ctx.ellipse(e.x,e.y,9+k*1.5,4+k*.6,0,0,7);ctx.fill();ctx.globalAlpha=.55+.3*k;ctx.strokeStyle='#ffd36b';ctx.lineWidth=.6;ctx.stroke();ctx.restore()}
 ctx.globalAlpha=e.hit>0?.5:1;(f=>{const isSlime=e.ty==='sl'||e.base==='sl'||(MONSTER_TYPES[e.ty]&&/gosma|slime/i.test(MONSTER_TYPES[e.ty].name));const an=anim(e,e.wu,isSlime);dr(monsterSpriteFrame(e,f.d,an),e.x+o[0],e.y+o[1],f.fl,scale,an)})(face(e));ctx.globalAlpha=1;
 const maxHp=monsterMaxHp(e),hpRatio=Math.max(0,Math.min(1,e.hp/maxHp)),maxMp=monsterMaxMp(e),mpRatio=maxMp?Math.max(0,Math.min(1,e.mp/maxMp)):0,name=e.name||(MONSTER_TYPES[e.ty]&&MONSTER_TYPES[e.ty].name)||'Monstro';
 ctx.font='5px monospace';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillStyle='#d8d8d8';
 const mark=e.bossType=='grandboss'?'♛ ':e.bossType=='boss'?'★ ':e.elite?'✦ ':'';
 if(e.elite&&!e.boss){ctx.fillStyle='#000';ctx.fillText(mark+name,e.x+.4,labelY+.4);ctx.fillStyle='#ffd36b'}
 ctx.fillText(mark+name,e.x,labelY);ctx.fillStyle='#d8d8d8';
 if(questMonsterRequested(e.ty)){ctx.font='bold 8px monospace';ctx.fillStyle='#ffd84a';ctx.fillText('!',e.x,labelY-5);ctx.font='5px monospace';ctx.fillStyle='#d8d8d8'}
 const barW=28,t=1/S,barX=Math.round(e.x-barW/2),barY=Math.round(labelY+2),hpSegments=Math.ceil(maxHp/100);
 ctx.fillStyle='#3a3a3a';ctx.fillRect(barX-t,barY-t,barW+2*t,1+2*t);
 ctx.fillStyle='#4b121c';ctx.fillRect(barX,barY,barW,1);
 ctx.fillStyle=e.boss||e.elite?'#f0a52e':'#ed354e';ctx.fillRect(barX,barY,barW*hpRatio,1);
 for(let segment=1;segment<hpSegments;segment++){const x=barX+Math.round(barW*100/maxHp*segment);ctx.fillStyle='#3a3a3a';ctx.fillRect(x,barY,t,1)}
 ctx.fillStyle='#10203a';ctx.fillRect(barX,barY+1+t,barW,1);ctx.fillStyle='#3985ed';ctx.fillRect(barX,barY+1+t,barW*mpRatio,1);
 ctx.font='5px monospace';ctx.textBaseline='middle';ctx.fillStyle='#fff2d7';ctx.fillText(String(e.lvl),barX+barW+3,barY+1.5);statusDots(e,barX,barY+4);
 ctx.textBaseline='alphabetic'}])});
 if(p.dead<=0)L.push([p.y,()=>{const o=lunge(p,p.wt,p.aw,.25);ctx.globalAlpha=p.hit>0?.5:1;(f=>{const an=anim(p,.25);dr(heroImg(f.d,an),p.x+o[0],p.y+o[1],f.fl,1,an)})(face(p));ctx.globalAlpha=1;
  const barW=28,t=1/S,barX=Math.round(p.x-barW/2),barY=Math.round(p.y-25),maxHp=mhp(),maxMp=mmp(),hpRatio=Math.max(0,Math.min(1,p.hp/maxHp)),mpRatio=Math.max(0,Math.min(1,p.mp/maxMp)),hpSegments=Math.ceil(maxHp/100);
  ctx.fillStyle='#3a3a3a';ctx.fillRect(barX-t,barY-t,barW+2*t,3+3*t);
  ctx.fillStyle='#173d1c';ctx.fillRect(barX,barY,barW,2);ctx.fillStyle='#4cd04f';ctx.fillRect(barX,barY,barW*hpRatio,2);
  for(let segment=1;segment<hpSegments;segment++){const sx=barX+Math.round(barW*100/maxHp*segment);ctx.fillStyle='#3a3a3a';ctx.fillRect(sx,barY,t,2)}
  ctx.fillStyle='#10203a';ctx.fillRect(barX,barY+2+t,barW,1);ctx.fillStyle='#3985ed';ctx.fillRect(barX,barY+2+t,barW*mpRatio,1);
 }]);
 if(window.onlineDrawables)onlineDrawables(L);
 L.sort((a,b)=>a[0]-b[0]).forEach(l=>l[1]());
 proj.forEach(q=>{ctx.fillStyle=q.c||'#ff7a1a';ctx.fillRect(Math.round(q.x-3),Math.round(q.y-3),6,6);ctx.fillStyle='#ffe28a';ctx.fillRect(Math.round(q.x-2),Math.round(q.y-2),4,4)});
 fxs.forEach((f,i)=>{const q=Math.max(0,Math.min(1,f.t/f.d)),fade=1-q,r=f.r*(.35+q),style=f.style||'ring';ctx.globalAlpha=fade;
  if(style=='fire'||style=='holy')circ(f.x,f.y,r*(style=='holy'?.8:1),f.c);
  else if(style=='frost'){circ(f.x,f.y,r,f.c);circ(f.x,f.y,r*.58,'#e9fbff')}
  else if(style=='shadow'){circ(f.x,f.y,r,'#271b3d');circ(f.x,f.y,r*.68,f.c)}
  else if(style=='nature'){circ(f.x,f.y,r,f.c);circ(f.x,f.y,r*.7,'#b7e98a')}
  else circ(f.x,f.y,r,f.c);
  if(style!='ring')for(let k=0;k<8;k++){const a=k*Math.PI/4+time*1.3,dist=r*(style=='holy'?.82:.72),size=style=='frost'?2:1.5;ctx.fillStyle=style=='fire'&&k%2?'#ffd36b':style=='shadow'&&k%2?'#b387e8':style=='nature'&&k%2?'#a8d86e':style=='holy'?'#fff4bb':f.c;ctx.fillRect(Math.round(f.x+Math.cos(a)*dist-size/2),Math.round(f.y+Math.sin(a)*dist-size/2),size,size)}
  if(style=='holy'){ctx.fillStyle='#fff7c4';ctx.fillRect(Math.round(f.x-1),Math.round(f.y-r*.55),2,Math.max(2,Math.round(r*1.1)));ctx.fillRect(Math.round(f.x-r*.45),Math.round(f.y-1),Math.max(2,Math.round(r*.9)),2)}
  ctx.globalAlpha=1});
 ctx.font='6px monospace';ctx.textAlign='center';
 fts.forEach(f=>{ctx.globalAlpha=Math.max(0,f.a);ctx.fillStyle='#000';ctx.fillText(f.t,Math.round(f.x)+.5,Math.round(f.y)+.5);ctx.fillStyle=f.c;ctx.fillText(f.t,Math.round(f.x),Math.round(f.y));ctx.globalAlpha=1});
 drawDynamicLighting();drawVision();
 {ctx.setTransform(1,0,0,1,0,0);const g=ctx.createRadialGradient(cv.width/2,cv.height/2,Math.min(cv.width,cv.height)*.42,cv.width/2,cv.height/2,Math.max(cv.width,cv.height)*.75);g.addColorStop(0,'rgba(10,26,42,0)');g.addColorStop(1,'rgba(10,26,42,.38)');ctx.fillStyle=g;ctx.fillRect(0,0,cv.width,cv.height)}
 if(p.dead>0){ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0008';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='#fff';ctx.font='28px monospace';ctx.textAlign='center';ctx.fillText('Você caiu... renasce em '+Math.ceil(p.dead)+'s',cv.width/2,cv.height/2)}
 // minimapa (js/minimapa.js)
 drawMinimap()}
const restored=loadGame();
{// Personagem novo começa com o kit inicial; as ferramentas de teste da Engine podem dar outros itens.
 const has=id=>I.some(s=>s&&s.id==id)||Object.values(EQ).some(s=>s&&s.id==id);
 if(!restored){
  if(ITEMS.sw&&!has('sw'))EQ.sw={id:'sw',n:1,q:rollQ()};
  for(const [id,n] of [['hp',3],['mp',2]])if(ITEMS[id]&&!has(id))addItem(id,undefined,n);
 }
 if(!restored){p.hp=mhp();p.mp=mmp()}
 dirtyInv=true}
let last=performance.now();
(function loop(t){const dt=Math.min(.05,(t-last)/1000);last=t;if(!MODO.motor){time+=dt;upd(dt);draw();hud()}requestAnimationFrame(loop)})(last);
