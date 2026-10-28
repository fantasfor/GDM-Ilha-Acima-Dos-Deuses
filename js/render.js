/* ---------- desenho ---------- */
let time=0;
let hov=null,hovN=null;
function pickN(w){return NPCS.find(n=>dist(n,w)<16||dist({x:n.x,y:n.y-8},w)<16)}
function pickCampGate(w){return wallBuilt&&Math.abs(w.x-campGate.x)<CAMP_WALL.halfGate+8&&w.y>campGate.y-38&&w.y<campGate.y+10}
/* flecha do arco/besta (PACOTE_ARMAS.FLECHA, 1:1) girada na direção do voo; devolve false se o pacote não carregou */
let FLECHA_IMG=null;
function desenharSeta(q){
 if(FLECHA_IMG===null)FLECHA_IMG=window.PACOTE_ARMAS&&PACOTE_ARMAS.FLECHA&&pixelArt(PACOTE_ARMAS.FLECHA)||false;
 if(!FLECHA_IMG)return false;
 const im=FLECHA_IMG;ctx.save();ctx.translate(Math.round(q.x),Math.round(q.y));ctx.rotate(Math.atan2(q.vy,q.vx));ctx.drawImage(im,-im.width+3,-Math.floor(im.height/2));ctx.restore();return true;
}
/* arma de tiro equipada (arco ou besta, pela pose de ataque): o tiro vira flecha */
function armaDeTiro(slot){const it=typeof EQ!='undefined'&&EQ[slot||'sw'],o=it&&ITEMS[it.id];return!!o&&(o.ataque=='arco'||o.ataque=='besta')}
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
/* dr.ent = quem está sendo desenhado (herói ou outro jogador): o VFX desenha aura e contorno atrás (js/vfx-habilidades.js).
   pintar(c, ml, mt) desenha um canvas em pixels do mundo com margem ml dos lados e mt em cima, alinhado ao desenho */
/* silhueta de um desenho numa cor só (contorno de destaque: dr.borda = cor antes de chamar dr) */
const silhuetas=new WeakMap();
function silhueta(img,cor){let m=silhuetas.get(img);if(!m){m={};silhuetas.set(img,m)}if(m[cor])return m[cor];const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);g.globalCompositeOperation='source-in';g.fillStyle=cor;g.fillRect(0,0,c.width,c.height);return m[cor]=c}
const LADOS=[[1,0],[-1,0],[0,1],[0,-1]];
function dr(img,x,y,fl,sc=1,an){const k=sc/(img.q||1),w=img.width*k,hh=img.height*k;const pd=(img.pad||0)*k;ctx.fillStyle='#0005';ctx.fillRect(Math.round(x-w/2+pd+2),Math.round(y),Math.round(w-2*pd-4),3);
 const ent=dr.ent;dr.ent=null;const borda=dr.borda;dr.borda=null;const sil=borda&&silhueta(img,borda),bordaEm=(bx,by)=>{for(const [ox,oy] of LADOS)ctx.drawImage(sil,bx+ox*k,by+oy*k,w,hh)};
 if(an){ctx.save();ctx.translate(Math.round((x+an.dx)*S)/S,Math.round((y+an.dy)*S)/S);ctx.rotate(an.rot);if(an.sk)ctx.transform(1,0,an.sk,1,0,0);ctx.scale(an.sx*(fl<0?-1:1),an.sy);
  if(ent&&window.VFX)VFX.atras(ent,img,(c,ml,mt)=>ctx.drawImage(c,-w/2-ml*sc,-hh+3+(img.anchorY||0)-mt*sc,c.width*sc,c.height*sc));
  if(sil)bordaEm(-w/2,-hh+3+(img.anchorY||0));
  ctx.drawImage(img,-w/2,-hh+3+(img.anchorY||0),w,hh);
  ctx.restore();return}
 const dx=Math.round((x-w/2)*S)/S,dy=Math.round((y-hh+3+(img.anchorY||0))*S)/S;
 if(ent&&window.VFX)VFX.atras(ent,img,(c,ml,mt)=>{if(fl<0){ctx.save();ctx.translate(dx+w+ml*sc,dy-mt*sc);ctx.scale(-1,1);ctx.drawImage(c,0,0,c.width*sc,c.height*sc);ctx.restore()}else ctx.drawImage(c,dx-ml*sc,dy-mt*sc,c.width*sc,c.height*sc)});
 if(fl<0){ctx.save();ctx.translate(dx+w,dy);ctx.scale(-1,1);if(sil)bordaEm(0,0);ctx.drawImage(img,0,0,w,hh);ctx.restore()}else{if(sil)bordaEm(dx,dy);ctx.drawImage(img,dx,dy,w,hh)}}
// animação procedural: parado (respirar), andar (pulinho+balanço), atacar (recuo e golpe), dano (tremida)
const monsterAnimationArtCache=new WeakMap();
/* 4 posições: de frente (d), de costas (u), de lado para a direita (animation) e para a esquerda (direcoes.esquerda, desenhada
   à parte com a luz do mesmo lado; sem ela o lado é espelhado). esqMonstro diz se o desenho da esquerda vale (aí não espelha). */
const esqMonstro=(e,dir,fl)=>{const d=!e.dungeonAnimation&&MONSTER_TYPES[e.ty]&&MONSTER_TYPES[e.ty].direcoes,a=d&&d.esquerda;return fl<0&&dir!='d'&&dir!='u'&&!!(a&&a.idle&&a.idle.length)};
window.esqMonstro=esqMonstro;
function monsterSpriteFrame(e,dir,an,fl=1){
 const definition=MONSTER_TYPES[e.ty],base=e.dungeonAnimation||definition&&definition.animation;
 const vista=!e.dungeonAnimation&&definition&&definition.direcoes&&definition.direcoes[dir=='d'?'frente':dir=='u'?'costas':esqMonstro(e,dir,fl)?'esquerda':''];
 const animation=vista&&vista.idle&&vista.idle.length?{...vista,durations:vista.durations||base&&base.durations}:base;
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
  a.sw=k<.34?1:k<.67?2:3;a.k=k;
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
  a.dy=-Math.abs(Math.sin(t*12.566))*1.2;a.mv=true;
  a.ph=[1,0,2,0][Math.floor(t*8)%4];
 }else{
  const w=Math.sin(t*2.5+id);
  a.sy=1+w*.025;
 }
 if(u.hit>0)a.dx=Math.sin(t*90)*1.2;
 return a}
/* padrão de proporção: 1 pixel do desenho = 1 pixel do mundo para herói, monstros e chefes (o tamanho vem do desenho) */
const ESCALA_MUNDO=1;
const wh=img=>img?img.height/(img.q||1):16; // sem imagem (jogador inimigo na arena, boneco): altura de um personagem
/* Clique em monstro: caixa do tamanho do sprite desenhado (com folga de 5 px para os lados e em cima),
   mínimo de 22×26 px para os pequenos; com vários sobrepostos, vence o mais perto do cursor. */
function pick(w){
 let best=null,bd=Infinity;
 for(const e of en){
  if(e.hp<=0||!canSee(e.x,e.y))continue;
  const img=e.img,q=img&&img.q||1,sc=ESCALA_MUNDO;
  const half=Math.max(11,(img?img.width/q:16)*sc/2+5),h=Math.max(26,(img?img.height/q:16)*sc+8);
  const dx=w.x-e.x,top=e.y-h,bottom=e.y+6;
  if(Math.abs(dx)>half||w.y<top||w.y>bottom)continue;
  const d=Math.hypot(dx,(w.y-(e.y-h/2))*.7);
  if(d<bd){bd=d;best=e}
 }
 return best
}
function lunge(u,t,aw,wu){if(!(aw>0)||!t)return[0,0];const d=Math.hypot(t.x-u.x,t.y-u.y)||1,k=5*(1-aw/wu);return[(t.x-u.x)/d*k,(t.y-u.y)/d*k]}
function bar(x,y,w,f,c){ctx.fillStyle='#000a';ctx.fillRect(Math.round(x-w/2)-1,Math.round(y)-1,w+2,4);ctx.fillStyle=c;ctx.fillRect(Math.round(x-w/2),Math.round(y),Math.round(w*f),2)}
function circ(x,y,r,c,fill){ctx.beginPath();ctx.ellipse(x,y,r,r*.75,0,0,7);if(fill){ctx.fillStyle=c;ctx.fill()}else{ctx.strokeStyle=c;ctx.lineWidth=1;ctx.stroke()}}
function drawMapElement(e){
 const s=sceneryFor(e);if(!s)return;const k=1/(s.c.q||1);
 ctx.drawImage(s.c,Math.round((e.x-s.ax*k)*S)/S,Math.round((e.y-s.ay*k)*S)/S,s.c.width*k,s.c.height*k)
}
/* carpinteiro escondido (missão): uma tora grossa na frente dele, só a cabeça para fora, gritando por socorro num balão */
function drawCarpenterDebris(n){
 const x=n.x,y=n.y+2,R=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(a),Math.round(b),w,h)};
 // tora deitada: casca escura com veios e a ponta cortada (anéis) à direita
 R(x-20,y-16,38,16,'#4a2c16');R(x-20,y-16,38,2,'#6b4422');R(x-20,y-3,38,3,'#3a2210');
 for(let k=-16;k<16;k+=5)R(x+k,y-13+(k%2?1:0),3,1,'#5e3a1c');R(x-12,y-8,6,1,'#5e3a1c');R(x+2,y-6,8,1,'#5e3a1c');
 R(x+16,y-16,6,16,'#c9965a');R(x+17,y-14,4,12,'#e0b47a');R(x+18,y-11,2,6,'#a8763f');R(x+19,y-9,1,2,'#7a5028');
 R(x-22,y-12,3,10,'#3a2210');R(x-6,y-21,3,6,'#4a2c16');R(x-7,y-22,5,2,'#5e8a3a'); // galho quebrado com folhas
 // balão: Socorro! (aparece e some)
 if((time%4)<2.6){const tx='Socorro!',bx=x-6,by=y-46;ctx.font='bold 6px monospace';const w=Math.ceil(ctx.measureText(tx).width)+8;
  R(bx-w/2,by-7,w,10,'#161022');R(bx-w/2+1,by-6,w-2,8,'#ffffff');R(bx-1,by+3,3,2,'#161022');R(bx,by+3,1,1,'#ffffff');
  ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillStyle='#c0392b';ctx.fillText(tx,bx,by+.5+Math.round(Math.sin(time*12)*.5))}
}
/* Paliçada do acampamento em pixel art 1:1 (refeita em 2026-10-23): cada tora tem casca em tons de cilindro (luz à
   esquerda), rachaduras e nós, ponta apontada com a madeira cortada clara, duas voltas de corda e musgo na base.
   Desenhos prontos (3 alturas × 4 variações), escolhidos pela posição; o portão tem postes grossos, viga com os anéis da
   madeira à mostra e portas de tábuas com travessas em Z e ferragens. */
const TORA_CASCA=['#22130a','#3b2414','#55361f','#714a2b','#8d6038','#a97a48'],TORA_CORTE=['#8a5a30','#c08850','#e0b478'];
const toraSprites={};
function toraSprite(w,h,v){const k=w+'x'+h+'v'+v;if(toraSprites[k])return toraSprites[k];
 const c=mkCanvas(w+2,h+3),g=c.getContext('2d'),P=(x,y,cor)=>{g.fillStyle=cor;g.fillRect(x,y,1,1)},rn=(a,b)=>hash(a*31+v*7+w,b*17+h);
 const ponta=Math.round(w*.55);
 for(let y=0;y<h;y++){
  // largura da linha: ponta apontada no alto (triângulo), depois o corpo inteiro
  const larg=y<ponta?Math.max(1,Math.round((y+1)/ponta*w)):w,x0=1+Math.round((w-larg)/2);
  for(let i=0;i<larg;i++){const x=x0+i,f=larg>1?i/(larg-1):.5;
   let t;if(y<ponta){t=f<.45?2:f<.75?1:0;P(x,y+1,TORA_CORTE[t]);continue}                 // madeira cortada da ponta
   t=f<.12?5:f<.3?4:f<.55?3:f<.78?2:1;                                                     // cilindro: luz à esquerda
   if(rn(x,y>>2)>.82&&t>1)t--;                                                             // veios da casca
   if((x+v)%3===0&&rn(x,y)>.7&&t>1)t-=1;
   P(x,y+1,TORA_CASCA[t])}}
 // rachaduras compridas
 for(let r=0;r<2;r++){const x=2+Math.floor(rn(r,9)*(w-3)),y0=ponta+3+Math.floor(rn(r,5)*(h-ponta-10)),L=4+Math.floor(rn(r,3)*6);for(let y=y0;y<y0+L&&y<h-2;y++)P(x,y+1,TORA_CASCA[0])}
 // nó: anel escuro com miolo claro
 {const nx=3+Math.floor(rn(5,5)*(w-6)),ny=ponta+6+Math.floor(rn(6,6)*(h-ponta-14));P(nx,ny,TORA_CASCA[0]);P(nx+1,ny,TORA_CASCA[1]);P(nx,ny+1,TORA_CASCA[1]);P(nx+1,ny+1,TORA_CORTE[0]);P(nx-1,ny+1,TORA_CASCA[1])}
 // duas voltas de corda (amarram uma tora na outra)
 for(const cy of [ponta+4,h-9]){for(let x=1;x<=w;x++){P(x,cy+1+((x>>1)&1?0:0),x%2?'#d8c088':'#b89a60');P(x,cy+2,'#6a5432')}}
 // musgo na base
 for(let x=1;x<=w;x++){if(rn(x,77)>.45)P(x,h,'#4f7d36');if(rn(x,78)>.7)P(x,h-1,'#6a9a44')}
 // contorno escuro
 const im=g.getImageData(0,0,c.width,c.height),d=im.data,W2=c.width,H2=c.height,cheio=(x,y)=>x>=0&&y>=0&&x<W2&&y<H2&&d[(y*W2+x)*4+3]>0,marca=[];
 for(let y=0;y<H2;y++)for(let x=0;x<W2;x++)if(!cheio(x,y)&&(cheio(x-1,y)||cheio(x+1,y)||cheio(x,y-1)||cheio(x,y+1)))marca.push([x,y]);
 g.fillStyle='#160c06';for(const [x,y] of marca)g.fillRect(x,y,1,1);
 return toraSprites[k]=c}
function drawCampLog(x,y,w=10,h=32){
 x=Math.round(x);y=Math.round(y);const v=Math.floor(hash(x,y)*4),hh=h+(Math.floor(hash(y,x)*3)-1)*2,s=toraSprite(w,hh,v);
 ctx.fillStyle='#0004';ctx.fillRect(x-w/2-2,y,w+4,3);
 ctx.drawImage(s,x-Math.round(s.width/2),y-s.height+2)}
/* portão: postes grossos, viga de cima com os anéis da madeira nas pontas, portas de tábuas (fechado) ou abertas para dentro */
let portaoVigaC=null,portaoPortaC=null;
function portaoViga(L){if(portaoVigaC&&portaoVigaC.width===L)return portaoVigaC;const c=mkCanvas(L,8),g=c.getContext('2d'),P=(x,y,cor)=>{g.fillStyle=cor;g.fillRect(x,y,1,1)};
 for(let x=0;x<L;x++)for(let y=0;y<8;y++){const t=y===0||y===7?0:y===1?5:y<3?4:y<5?3:y<6?2:1;P(x,y,TORA_CASCA[(t>1&&hash(x>>2,y)>.85)?t-1:t])}
 for(const x0 of [0,L-6]){for(let y=1;y<7;y++)for(let x=x0;x<x0+6;x++){const r=Math.hypot(x-x0-2.5,y-3.5);P(x,y,r<1?'#8a5a30':r<2?'#e0b478':r<2.6?'#c08850':'#8a5a30')}}
 return portaoVigaC=c}
function portaoPorta(w,h){if(portaoPortaC&&portaoPortaC.width===w)return portaoPortaC;const c=mkCanvas(w,h),g=c.getContext('2d'),R2=(x,y,a,b,cor)=>{g.fillStyle=cor;g.fillRect(x,y,a,b)};
 for(let x=0;x<w;x++){const tab=Math.floor(x/5),borda=x%5===0;R2(x,0,1,h,borda?'#3b2414':tab%2?'#8d6038':'#7a5230');if(!borda&&x%5===1)R2(x,0,1,h,'#a97a48')}
 for(let x=0;x<w;x+=5)R2(x+2,0,1,2,'#3b2414');                                              // pontas das tábuas
 R2(0,5,w,3,'#55361f');R2(0,5,w,1,'#8d6038');R2(0,h-8,w,3,'#55361f');R2(0,h-8,w,1,'#8d6038'); // travessas
 for(let i=0;i<h-14;i++){const x=Math.round(i*(w-3)/(h-14));R2(x,7+i,3,1,'#55361f');R2(x,7+i,1,1,'#8d6038')} // diagonal (Z)
 for(const y of [6,h-7]){R2(1,y,4,1,'#5e6670');R2(1,y,1,1,'#9aa4ae');R2(w-5,y,4,1,'#5e6670')}            // dobradiças de ferro
 return portaoPortaC=c}
function drawCampGate(){
 const {x,y}=campGate,h=CAMP_WALL.halfGate;
 if(!CAMP_WALL.gateOpen){const pw=h*2-14,ph=28,porta=portaoPorta(pw,ph);ctx.drawImage(porta,Math.round(x-pw/2),Math.round(y-ph+2));
  ctx.fillStyle='#5e6670';ctx.fillRect(Math.round(x)-1,Math.round(y)-14,3,3);ctx.fillStyle='#9aa4ae';ctx.fillRect(Math.round(x)-1,Math.round(y)-14,1,1)} // argola
 else{ // portas abertas para dentro, de lado (só a espessura das tábuas aparece)
  for(const s of [-1,1]){const px=Math.round(x+s*(h-9));ctx.fillStyle='#3b2414';ctx.fillRect(px-2,Math.round(y)-27,5,28);ctx.fillStyle='#8d6038';ctx.fillRect(px-1,Math.round(y)-26,3,26);ctx.fillStyle='#a97a48';ctx.fillRect(px-1,Math.round(y)-26,1,26)}}
 drawCampLog(x-h,y,14,40);drawCampLog(x+h,y,14,40);
 const viga=portaoViga(h*2+18);ctx.drawImage(viga,Math.round(x-viga.width/2),Math.round(y-41));
 ctx.font='6px monospace';ctx.textAlign='center';ctx.fillStyle='#ffe28a';
 ctx.fillText(CAMP_WALL.gateOpen?'Portão aberto':'Portão fechado',x,y-46);
 if(pickCampGate(wpos())){ctx.fillStyle='#fff';ctx.fillText('Clique para '+(CAMP_WALL.gateOpen?'fechar':'abrir'),x,y-53)}
}/* qualidade dos efeitos: 2 = tudo, 1 = sem a névoa dessaturada (blend caro), 0 = modo desempenho. Opções › Modo desempenho força 0;
   a qualidade automática (js/rede.js REDE.qualidade) baixa sozinha quando o FPS cai e volta quando sobra */
window.qualidade=()=>window.modoDesempenho?0:(window.REDE&&REDE.qualidade!=null?REDE.qualidade:2);
const fogMaskCv=document.createElement('canvas'),fogMask=fogMaskCv.getContext('2d'),VISAO_ILHA=200;
let VISION_RANGE=VISAO_ILHA; /* à noite a visão cai 10% (js/tempo.js); na DG não muda */
/* árvores que bloqueiam a visão: guardadas por quadro (canSee é chamado para cada monstro; antes filtrava todas as árvores toda vez) */
let arvVis={t:-1,x:0,y:0,r:0,l:[]};
const visionTrees=()=>{if(window.inArena||window.inTaverna||window.inTutorial)return[];const v=arvVis;if(v.t===time&&v.x===p.x&&v.y===p.y&&v.r===VISION_RANGE)return v.l;
 v.t=time;v.x=p.x;v.y=p.y;v.r=VISION_RANGE;v.l=trees.filter(t=>Math.abs(t.x-p.x)<VISION_RANGE+40&&Math.hypot(t.x-p.x,t.y-17-p.y)<VISION_RANGE+20);return v.l};
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
function canSee(x,y){
 if(window.cameraMenu&&cameraMenu.ativo)return true; // menu de personagem: a ilha inteira à vista
 if(window.inArena&&window.ARENA&&ARENA.ve)return ARENA.ve(x,y); // arena: visão sua e dos aliados, com as colunas
 const dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy);if(!window.inDungeon&&!window.inArena&&!window.inTutorial&&Math.hypot(x-CX,y-CY)<110)return true; /* luz da fogueira */if(d>VISION_RANGE)return false;if(d<.001)return true;
 return !visionTrees().some(t=>treeHit(p.x,p.y,dx,dy,t)<1)
}
function drawVision(){
 // qualidade 0 (modo desempenho ou FPS muito baixo): só um escurecimento radial em volta do alcance, uma pintura só
 if(qualidade()<1){const W=cv.width,H=cv.height,r=VISION_RANGE*S,g=ctx.createRadialGradient(W/2,H/2,Math.max(0,r-45*S),W/2,H/2,r);g.addColorStop(0,'rgba(8,16,34,0)');g.addColorStop(1,'rgba(8,16,34,.55)');ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore();return}
 // a névoa é toda borrada: desenhada em resolução reduzida (Q) e ampliada, custa uma fração do tempo
 const q=qualidade(),Q=q>=2?.18:q>=1?.14:.1,S0=S,FW=Math.max(1,Math.ceil(cv.width*Q)),FH=Math.max(1,Math.ceil(cv.height*Q));
 if(fogMaskCv.width!=FW||fogMaskCv.height!=FH){fogMaskCv.width=FW;fogMaskCv.height=FH}
 {const S=S0*Q;
 const W=FW,H=FH,cx=W/2,cy=H/2,r=VISION_RANGE*S;
 // máscara de visão: polígono de raios (bloqueado pelas árvores), borrado e com borda radial suave
 const m=fogMask;m.setTransform(1,0,0,1,0,0);m.globalCompositeOperation='source-over';m.filter='none';m.clearRect(0,0,W,H);
 const trs=visionTrees(),N=q>=2?180:120,R=VISION_RANGE+30;
 m.beginPath();
 for(let i=0;i<N;i++){
  const a=i/N*Math.PI*2,dx=Math.cos(a),dy=Math.sin(a);let dist=R;
  for(const t of trs){const e=treeExit(p.x,p.y,dx,dy,t);if(e<dist)dist=e}
  const X=cx+dx*dist*S,Y=cy+dy*dist*S;i?m.lineTo(X,Y):m.moveTo(X,Y)
 }
 m.closePath();m.fillStyle='#fff';m.fill(); /* sem filter blur (custava muito): a máscara pequena ampliada com suavização já fica borrada */
 const edge=45*S,vis=m.createRadialGradient(cx,cy,Math.max(0,r-edge),cx,cy,r);
 vis.addColorStop(0,'rgba(0,0,0,1)');vis.addColorStop(1,'rgba(0,0,0,0)');
 m.globalCompositeOperation='destination-in';m.fillStyle=vis;m.fillRect(0,0,W,H);m.globalCompositeOperation='source-over';
 // a fogueira do acampamento ilumina a área em volta dela: fica visível mesmo longe do herói
 if(!window.inDungeon&&!window.inArena&&!window.inTaverna){const fx=cx+(CX-p.x)*S,fy=cy+(CY-6-p.y)*S,fr=135*S;if(fx>-fr&&fy>-fr&&fx<W+fr&&fy<H+fr){const lg=m.createRadialGradient(fx,fy,fr*.55,fx,fy,fr);lg.addColorStop(0,'#fff');lg.addColorStop(1,'rgba(255,255,255,0)');m.fillStyle=lg;m.fillRect(fx-fr,fy-fr,fr*2,fr*2)}}
 }
 aplicarNevoa(fogMaskCv);
}
/* Névoa no estilo LoL/Dota: fora da visão o mapa continua à mostra, mas sem cor, mais escuro e azulado, com a borda
   suave; quem está lá fora não aparece. A máscara (branco = visível) vem em resolução reduzida e é ampliada. */
const nevoaCor=document.createElement('canvas'),nevoaCinza=document.createElement('canvas');
function aplicarNevoa(mask,forca=1){
 const W=mask.width,H=mask.height;for(const c of [nevoaCor,nevoaCinza])if(c.width!==W||c.height!==H){c.width=W;c.height=H}
 const camada=(c,cor)=>{const g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);g.fillStyle=cor;g.fillRect(0,0,W,H);g.globalCompositeOperation='destination-out';g.drawImage(mask,0,0);g.globalCompositeOperation='source-over'};
 camada(nevoaCor,'rgba(8,16,34,'+(.5*forca)+')');
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='low';
 if(qualidade()>=2){camada(nevoaCinza,'#808080');ctx.globalAlpha=.85*forca;ctx.globalCompositeOperation='saturation';ctx.drawImage(nevoaCinza,0,0,cv.width,cv.height);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
 ctx.drawImage(nevoaCor,0,0,cv.width,cv.height);ctx.restore()}
window.aplicarNevoa=aplicarNevoa;
function drawDynamicLighting(){
 if(qualidade()<1)return;
 const W=cv.width,H=cv.height;
 const sources=[],screen=(x,y)=>({x:W/2+(x-p.x)*S,y:H/2+(y-p.y)*S});
 const add=(x,y,r,color,power=1)=>{const pt=screen(x,y);if(pt.x+r<0||pt.x-r>W||pt.y+r<0||pt.y-r>H)return;sources.push({...pt,r:r*S,color,power})};
 const flicker=.94+.04*Math.sin(time*9)+.02*Math.sin(time*23),nk=!window.inDungeon&&window.TEMPO?TEMPO.escuro():0; // à noite as luzes ficam maiores e mais fortes
 if(p.dead<=0&&nk>0)add(p.x,p.y-7,60+40*nk,'255,235,200',.9*nk); // de dia o herói não tem halo (deixava a tela leitosa)
 add(CX,CY-6,110+150*nk,'255,150,60',flicker*(1.15+2.6*nk)); // fogueira: ilumina bem o acampamento, mais ainda à noite
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
/* Vazio em volta da ilha: espaço escuro com estrelas em 3 camadas (paralaxe) e duas nebulosas bem fracas */
function drawEspaco(){
 const w=cv.width,h=cv.height;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#04050c';ctx.fillRect(0,0,w,h);
 const neb=(x0,y0,r,cor,par)=>{const x=x0-(p.x-CX)*par*S+w/2,y=y0-(p.y-CY)*par*S+h/2,g=ctx.createRadialGradient(x,y,0,x,y,r*S);g.addColorStop(0,cor);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-r*S,y-r*S,2*r*S,2*r*S)};
 neb(-260,-180,420,'rgba(90,50,150,.16)',.05);neb(320,240,360,'rgba(30,90,150,.13)',.05);
 const TS=1400;
 for(const [n,par,sz,cam] of [[110,.06,1,1],[60,.14,1,2],[22,.26,2,3]])for(let k=0;k<n;k++){
  const bx=hash(k,cam*31)*TS,by=hash(cam*17,k)*TS,x=((bx-p.x*par*S)%TS+TS)%TS,y=((by-p.y*par*S)%TS+TS)%TS,tw=.55+.45*Math.sin(time*(1.2+hash(k,cam)*2)+k);
  ctx.globalAlpha=tw*(cam==1?.55:.85);ctx.fillStyle=k%9==0?'#9fc4ff':k%13==0?'#ffd9a8':'#ffffff';
  for(let ox=x;ox<w;ox+=TS)for(let oy=y;oy<h;oy+=TS)ctx.fillRect(Math.round(ox),Math.round(oy),sz,sz)}
 ctx.globalAlpha=1}
/* Cachoeira: onde o rio chega na borda, a água cai no vazio (o desenho fixo está no mapa; aqui gotas e névoa animadas) */
function drawCachoeira(){
 const f=RIO_FIM;if(!f||Math.abs(f.x-p.x)>420||Math.abs(f.y-p.y)>320)return;
 for(let k=0;k<26;k++){const ox=(hash(k,3)-.5)*2*(f.w+2),q=(time*.9+hash(k,7))%1,y=f.y+2+q*130;
  ctx.globalAlpha=(1-q)*.8;ctx.fillStyle=k%3?'#cfe8f0':'#7fb8dc';ctx.fillRect(Math.round(f.x+ox),Math.round(y),1,3+Math.round(q*4))}
 for(let k=0;k<10;k++){const q=(time*.35+hash(k,11))%1,r=6+q*14,x=f.x+(hash(k,13)-.5)*f.w*3,y=f.y+6+q*20;
  ctx.globalAlpha=(1-q)*.22;ctx.fillStyle='#e6f4fa';ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()}
 ctx.globalAlpha=1}
/* morte do herói: cai de lado (gira 90° nos pés), afunda um pouco e fica translúcido; uma alminha sobe.
   Depois de ~1 s aparece a tela com o botão Reaparecer (update.js reaparecer). */
window.desenharHeroiMorto=function(){
 if(!(p.dead>0)||p.dead>=1e8)return;const t0=p.morreuEm??time,k=Math.min(1,(time-t0)/.8),e=1-Math.pow(1-k,3),f=face(p),lado=f.fl<0?-1:1;
 ctx.globalAlpha=1-.4*k;dr(heroImg(f.d,{}),p.x,p.y,f.fl,1,{dx:0,dy:2*e,sx:1,sy:1-.1*e,rot:lado*e*Math.PI/2});ctx.globalAlpha=1;
 if(k<1&&k>.85){for(let i=0;i<6;i++){const a=i/6*Math.PI*2;ctx.fillStyle='#8a7a6a';ctx.fillRect(Math.round(p.x+Math.cos(a)*(6+(k-.85)*60)),Math.round(p.y+Math.sin(a)*2),1,1)}} // poeira ao bater no chão
 const q=Math.min(1,Math.max(0,(time-t0-.6)/1.8));if(q>0&&q<1){ctx.globalAlpha=(1-q)*.8;const x=Math.round(p.x+Math.sin(q*9)*2),y=Math.round(p.y-10-q*30);
  ctx.fillStyle='#e8f4ff';ctx.fillRect(x-2,y-3,5,5);ctx.fillRect(x-1,y+2,3,2);ctx.fillRect(x,y+4,1,1);ctx.fillStyle='#1a2a3a';ctx.fillRect(x-1,y-1,1,1);ctx.fillRect(x+1,y-1,1,1);ctx.globalAlpha=1}};
const telaMorte=document.createElement('div');telaMorte.id='telaMorte';telaMorte.innerHTML='<b>Você caiu</b><small></small><button type="button" data-a="volta">Reaparecer</button><button type="button" data-a="assistir">Assistir</button>';document.body.append(telaMorte);
// na DG: Sair da dungeon e Assistir aliados (js/morte-dg.js); fora dela, Reaparecer
telaMorte.onclick=e=>{const a=e.target.dataset&&e.target.dataset.a;if(!a)return;e.stopPropagation();if(a==='assistir'&&window.MORTE_DG)MORTE_DG.assistir();else if(window.inDungeon&&window.MORTE_DG)MORTE_DG.sair();else reaparecer()};
function atualizarTelaMorte(){const on=p.dead>0&&p.dead<1e8&&!cameraMenu.ativo&&time-(p.morreuEm??time)>1.1;telaMorte.classList.toggle('on',on);
 const dg=!!window.inDungeon,al=dg&&window.MORTE_DG?MORTE_DG.aliados().length:0;
 telaMorte.querySelector('[data-a=volta]').textContent=dg?'Sair da dungeon':'Reaparecer';telaMorte.querySelector('[data-a=assistir]').hidden=!dg||!al;
 if(on)telaMorte.querySelector('small').textContent=dg?(al?'Na masmorra não dá para renascer: saia ou assista os aliados terminarem.':'Sozinho na masmorra: você sai e ela recomeça do zero. Nada foi perdido.'):window.inArena?'Você volta para a arena.':window.inTutorial?'Você volta para o começo do santuário.':'Você volta para o acampamento. Nada foi perdido.'}/* projéteis e efeitos de habilidade no chão (fogo, gelo, luz, sombra, natureza): os mesmos na ilha e na DG (dungeon.js) */
window.desenharEfeitosMundo=function(){
 proj.forEach(q=>{if(q.seta&&desenharSeta(q))return;if(q.vfx&&window.VFX&&VFX.projetil(ctx,q))return;ctx.fillStyle=q.c||'#ff7a1a';ctx.fillRect(Math.round(q.x-3),Math.round(q.y-3),6,6);ctx.fillStyle='#ffe28a';ctx.fillRect(Math.round(q.x-2),Math.round(q.y-2),4,4)});
 fxs.forEach((f,i)=>{const q=Math.max(0,Math.min(1,f.t/f.d)),fade=1-q,r=f.r*(.35+q),style=f.style||'ring';ctx.globalAlpha=fade;
  if(style=='fire'||style=='holy')circ(f.x,f.y,r*(style=='holy'?.8:1),f.c);
  else if(style=='frost'){circ(f.x,f.y,r,f.c);circ(f.x,f.y,r*.58,'#e9fbff')}
  else if(style=='shadow'){circ(f.x,f.y,r,'#271b3d');circ(f.x,f.y,r*.68,f.c)}
  else if(style=='nature'){circ(f.x,f.y,r,f.c);circ(f.x,f.y,r*.7,'#b7e98a')}
  else circ(f.x,f.y,r,f.c);
  if(style!='ring')for(let k=0;k<8;k++){const a=k*Math.PI/4+time*1.3,dist=r*(style=='holy'?.82:.72),size=style=='frost'?2:1.5;ctx.fillStyle=style=='fire'&&k%2?'#ffd36b':style=='shadow'&&k%2?'#b387e8':style=='nature'&&k%2?'#a8d86e':style=='holy'?'#fff4bb':f.c;ctx.fillRect(Math.round(f.x+Math.cos(a)*dist-size/2),Math.round(f.y+Math.sin(a)*dist-size/2),size,size)}
  if(style=='holy'){ctx.fillStyle='#fff7c4';ctx.fillRect(Math.round(f.x-1),Math.round(f.y-r*.55),2,Math.max(2,Math.round(r*1.1)));ctx.fillRect(Math.round(f.x-r*.45),Math.round(f.y-1),Math.max(2,Math.round(r*.9)),2)}
  ctx.globalAlpha=1});
};
function draw(){
 atualizarTelaMorte();
 if(MODO.motor)return;
 VISION_RANGE=window.inDungeon||!window.TEMPO?VISAO_ILHA:Math.round(VISAO_ILHA*TEMPO.visao());
 if(window.inTutorial&&window.drawTutorial){drawTutorial();return}
 if(window.inArena&&window.drawArena){drawArena();return}
 if(window.inTaverna&&window.drawTaverna){
  drawTaverna();
  return;
 }
 if(window.inDungeon&&window.drawDungeonWorld){
  drawDungeonWorld();
  return;
 }
 drawEspaco();
 ctx.setTransform(S,0,0,S,Math.round(cv.width/2-p.x*S),Math.round(cv.height/2-p.y*S));ctx.imageSmoothingEnabled=false;
 {/* só o pedaço visível do mapa (desenhar o mapa inteiro escalado a cada quadro custava caro) */const vw=cv.width/S,vh=cv.height/S,sx=Math.max(0,Math.floor(p.x-vw/2)-2),sy=Math.max(0,Math.floor(p.y-vh/2)-2),sw=Math.min(map.width-sx,Math.ceil(vw)+4),sh=Math.min(map.height-sy,Math.ceil(vh)+4);if(sw>0&&sh>0)ctx.drawImage(map,sx,sy,sw,sh,sx,sy,sw,sh);if(window.ILHA_CHAO_ANIM)CHAO.dgAnimar(ctx,ILHA_CHAO_ANIM,time,{x0:sx,y0:sy,x1:sx+sw,y1:sy+sh})}
 drawCachoeira();
 if(window.ILHA_VIVA)ILHA_VIVA.chao(); // grama e juncos ao vento, brilhos, ondinhas e peixes (js/ilha-viva.js)
 {const r=CAMP_SAFE_HALF_SIZE;ctx.fillStyle='#72bf7410';ctx.fillRect(CX-r,CY-r,r*2,r*2);ctx.strokeStyle='#9ad78460';ctx.lineWidth=1;ctx.strokeRect(CX-r,CY-r,r*2,r*2)}

 // correnteza do rio
 for(let y=Math.floor((p.y-190)/5)*5;y<p.y+190;y+=5){const rx=riverX(y),rw=riverW(y);if(rw<4||Math.abs(rx-p.x)>340||(RIO_FIM&&y>RIO_FIM.y-4))continue;
  for(let k=0;k<3;k++){const o=hash(y,k)*2-1,yy=y+Math.floor((time*7+hash(k,y)*5)%5);if(RBR.some(b=>Math.abs(yy-b)<12))continue;ctx.fillStyle=(y/5+k)%2?'#ffffff40':'#bfe8f835';ctx.fillRect(Math.round(rx+o*(rw-3)+Math.sin(time*1.3+y*.4+k*2)*1.5),yy,3,1)}}
 // brilho da fogueira
 {const fl=.5+.12*Math.sin(time*9)+.06*Math.sin(time*23),g=ctx.createRadialGradient(CX,CY,4,CX,CY,95);g.addColorStop(0,'rgba(255,170,60,'+(.38*fl)+')');g.addColorStop(1,'rgba(255,120,30,0)');ctx.fillStyle=g;ctx.fillRect(CX-100,CY-100,200,200)}
 // alvos de meteoro
 mets.forEach(m=>{circ(m.x,m.y,36,'#f604',true);circ(m.x,m.y,36,'#f90')});if(window.drawPortals)drawPortals();if(window.desenharTelegrafos)desenharTelegrafos();if(window.CURANDEIRO)CURANDEIRO.desenhar();
 const L=[];
 const occ=[];if(p.dead<=0)occ.push(p);en.forEach(e=>{if(e.hp>0&&Math.abs(e.x-p.x)<300&&Math.abs(e.y-p.y)<220)occ.push(e)});NPCS.forEach(n=>occ.push(n));
 // árvores e elementos do mapa ficam sempre à vista, dentro ou fora do campo de visão (pedido do usuário, 2026-10-24)
 // desenha tudo o que cabe na tela (com folga para a copa alta), qualquer que seja o zoom
 const naTela=(x,y)=>Math.abs(x-p.x)<cv.width/S/2+60&&y-p.y>-cv.height/S/2-20&&y-p.y<cv.height/S/2+80;
 trees.forEach(t=>{if(naTela(t.x,t.y)){const hid=occ.some(u=>u.y<t.y&&u.y>t.y-48&&Math.abs(u.x-t.x)<26),a0=t.a==null?1:t.a;t.a=a0+((hid?.42:1)-a0)*.18;L.push([t.y,()=>{ctx.globalAlpha=t.a;dr(TREEV[treeVar(t)]||TREE,t.x,t.y,1,1,{dx:0,dy:0,sx:1+Math.sin(time*2+t.y)*.012,sy:1,rot:0,sk:Math.sin(time*1.4+t.x*.09)*.07});ctx.globalAlpha=1}])}});
 mapElements.forEach(e=>{if(naTela(e.x,e.y))L.push([e.y,()=>drawMapElement(e)])});
 if(wallBuilt){
  for(const post of campWallPosts)if(naTela(post.x,post.y))L.push([post.y,()=>drawCampLog(post.x,post.y)]);
  if(naTela(campGate.x,campGate.y))L.push([campGate.y+1,drawCampGate])
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
 if(window.BAU_ILHA)BAU_ILHA.objeto(L); // baú do acampamento (js/bau-ilha.js)
 NPCS.forEach(n=>{
  if(n.x<-1000)return;
  L.push([n.y,()=>{const f=face(n);if(hovN==n)circ(n.x,n.y,12,'#ff5');
   // carpinteiro e ferreiro no mesmo desenho do herói (js/sprites.js CLASSE_VISUAL); o ferreiro pode ter desenho da Engine
   const spr=n.blacksmith&&window.SPRITE_BLACKSMITH&&SPRITE_BLACKSMITH.idle||(CL[n.cls]&&CL[n.cls].sprite)||(HS[n.cls]||HS.war)[f.d],topo=20;
   const escondido=n.carpenter&&!carpenterHelped;if(escondido)ctx.save(); // escondido atrás da tora: só a cabeça e os ombros aparecem (a tora é desenhada na frente)
   if(hovN==n)dr.borda='#ffd84a';dr(spr,n.x,n.y,f.fl,1,anim(n,0));if(escondido)ctx.restore();
   ctx.font='6px monospace';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(n.nm,n.x+.5,n.y-topo+.5-ACIMA_HEROI());ctx.fillStyle='#ffe28a';ctx.fillText(n.nm,n.x,n.y-topo-ACIMA_HEROI());
   ctx.fillStyle='#ffd84a';ctx.fillText(n.carpenter&&!questDone?'…':n.carpenter&&campPortalBuilt?'':n.carpenter&&sawQuestActive&&!sawObtained?'':n.carpenter?'!':n.blacksmith?'!':'!',n.x,n.y-topo-6+Math.round(Math.sin(time*4)*1.5))}]);
 });
 if(!carpenterHelped&&Math.abs(carpenter.x-p.x)<260&&Math.abs(carpenter.y-p.y)<170)L.push([carpenter.y+3,()=>drawCarpenterDebris(carpenter)]);
 // fogueira do acampamento: anel de pedras, lenha cruzada com brasas e chama em pixel art (js/fogo.js)
 L.push([CY+2,()=>{for(let k=0;k<10;k++){const a=k/10*Math.PI*2,x=Math.round(CX+Math.cos(a)*9),y=Math.round(CY+1+Math.sin(a)*4);ctx.fillStyle=k%3?'#6e6660':'#8a827a';ctx.fillRect(x-2,y-2,4,3);ctx.fillStyle='#4a4440';ctx.fillRect(x-2,y,4,1)}
  desenharLenha(ctx,CX,CY+1,14);desenharChama(ctx,CX,CY-1,9,15,.7)}]);
 // desenho de um monstro (também usado pela arena: o Mestre de classe no duelo)
 /* animação procedural só para quem não tem quadros próprios, e sem o tranco para a frente no ataque (pedido do usuário) */
const temQuadros=e=>{const a=e.dungeonAnimation||(MONSTER_TYPES[e.ty]&&MONSTER_TYPES[e.ty].animation);return !!(a&&['idle','walk','attack'].some(k=>a[k]&&a[k].length>1))};
window.animMonstro=(e,slime)=>{if(temQuadros(e)){anim(e,0,false);return null}const an=anim(e,e.wu,slime);if(e.aw>0){an.rot=0;an.dx=0}return an};
window.desenharMonstro=e=>{const o=[0,0],scale=ESCALA_MUNDO,spriteH=wh(e.img)*scale,labelY=e.y-spriteH-1;
 if(p.tgt==e)circ(e.x,e.y,12,'#f55'); // alvo marcado; o mouse em cima ganha contorno vermelho no próprio desenho (abaixo)
 if(e.elite&&!e.boss){const k=.5+.5*Math.sin(time*4+e.x*.1);ctx.save();ctx.globalAlpha=.22+.18*k;ctx.fillStyle='#f0a52e';ctx.beginPath();ctx.ellipse(e.x,e.y,9+k*1.5,4+k*.6,0,0,7);ctx.fill();ctx.globalAlpha=.55+.3*k;ctx.strokeStyle='#ffd36b';ctx.lineWidth=.6;ctx.stroke();ctx.restore()}
 ctx.globalAlpha=e.hit>0?.5:1;(f=>{const isSlime=e.ty==='sl'||e.base==='sl'||(MONSTER_TYPES[e.ty]&&/gosma|slime/i.test(MONSTER_TYPES[e.ty].name));const an=animMonstro(e,isSlime);if(hov==e)dr.borda='#ff2b2b';const esq=esqMonstro(e,f.d,f.fl);dr(monsterSpriteFrame(e,f.d,an||{},f.fl),e.x+o[0],e.y+o[1],esq?1:f.fl,scale,an)})(face(e));ctx.globalAlpha=1;
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
 ctx.font='5px monospace';ctx.textBaseline='middle';ctx.fillStyle='#fff2d7';ctx.fillText(String(e.lvl),barX+barW+3,barY+1.5); // efeitos do monstro: ícones abaixo da caixa do alvo (js/effects.js)
 ctx.textBaseline='alphabetic'};
 en.forEach(e=>{if(e.hp>0&&canSee(e.x,e.y))L.push([e.y,()=>desenharMonstro(e)])});
 if(p.dead<=0&&!cameraMenu.ativo)L.push([p.y,()=>{const o=lunge(p,p.wt,p.aw,.25);ctx.globalAlpha=p.hit>0?.5:1;(f=>{const an=anim(p,.25);dr.ent=p;dr(heroImg(f.d,an),p.x+o[0],p.y+o[1],f.fl,1,an)})(face(p));ctx.globalAlpha=1;
  const barW=28,t=1/S,barX=Math.round(p.x-barW/2),barY=Math.round(p.y-25-ACIMA_HEROI()),maxHp=mhp(),maxMp=mmp(),hpRatio=Math.max(0,Math.min(1,p.hp/maxHp)),mpRatio=Math.max(0,Math.min(1,p.mp/maxMp)),hpSegments=Math.ceil(maxHp/100);
  ctx.fillStyle='#3a3a3a';ctx.fillRect(barX-t,barY-t,barW+2*t,3+3*t);
  ctx.fillStyle='#173d1c';ctx.fillRect(barX,barY,barW,2);ctx.fillStyle='#4cd04f';ctx.fillRect(barX,barY,barW*hpRatio,2);
  for(let segment=1;segment<hpSegments;segment++){const sx=barX+Math.round(barW*100/maxHp*segment);ctx.fillStyle='#3a3a3a';ctx.fillRect(sx,barY,t,2)}
  ctx.fillStyle='#10203a';ctx.fillRect(barX,barY+2+t,barW,1);ctx.fillStyle='#3985ed';ctx.fillRect(barX,barY+2+t,barW*mpRatio,1);
 }]);
 if(p.dead>0&&!cameraMenu.ativo)L.push([p.y,desenharHeroiMorto]);
 if(window.onlineDrawables)onlineDrawables(L);
 L.sort((a,b)=>a[0]-b[0]).forEach(l=>l[1]());
 if(window.desenharLoot)desenharLoot(); // itens e moedas caídos dos monstros (js/loot.js)
 if(window.desenharConj)desenharConj(); // barra de conjuração (js/combat.js)
 desenharEfeitosMundo();
 if(window.ILHA_VIVA)ILHA_VIVA.ar(); // borboletas, libélulas, pássaros, folhas caindo e pólen
 if(window.desenharNoite&&!cameraMenu.ativo){desenharNoite(1,[{x:CX,y:CY-6,r:170},...(p.dead<=0?[{x:p.x,y:p.y-8,r:60,a:.55}]:[]),...(window.PORTALS||[]).map(q=>({x:q.x,y:q.y-20,r:50,a:.6}))]);ctx.setTransform(S,0,0,S,Math.round(cv.width/2-p.x*S),Math.round(cv.height/2-p.y*S))} // noite: escurece o mundo (os números de dano e as luzes ficam por cima)
 if(window.ILHA_VIVA)ILHA_VIVA.luzes(); // vaga-lumes por cima da noite
 ctx.font='6px monospace';ctx.textAlign='center';
 fts.forEach(f=>{ctx.globalAlpha=Math.max(0,f.a);ctx.fillStyle='#000';ctx.fillText(f.t,Math.round(f.x)+.5,Math.round(f.y)+.5);ctx.fillStyle=corFt(f);ctx.fillText(f.t,Math.round(f.x),Math.round(f.y));if(f.crit)iconeCrit(f);ctx.globalAlpha=1});
 if(!cameraMenu.ativo){drawDynamicLighting();drawVision()} // menu de personagem: de dia, sem névoa, tudo claro
 {ctx.setTransform(S,0,0,S,Math.round(cv.width/2-p.x*S),Math.round(cv.height/2-p.y*S));if(window.alvoMissao&&window.SETA_MISSAO){const a=alvoMissao();if(a)SETA_MISSAO.desenhar(a)}} // seta da missão (js/seta-missao.js), por cima da névoa
 {ctx.setTransform(1,0,0,1,0,0);const g=ctx.createRadialGradient(cv.width/2,cv.height/2,Math.min(cv.width,cv.height)*.42,cv.width/2,cv.height/2,Math.max(cv.width,cv.height)*.75);g.addColorStop(0,'rgba(10,20,30,0)');g.addColorStop(1,'rgba(10,20,30,.22)');ctx.fillStyle=g;ctx.fillRect(0,0,cv.width,cv.height)}
 if(p.dead>0&&p.dead<1e8){ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='rgba(0,0,0,'+Math.min(.45,(time-(p.morreuEm??time))*.4)+')';ctx.fillRect(0,0,cv.width,cv.height)} // a tela escurece aos poucos; o texto e o botão estão em #telaMorte
 // minimapa (js/minimapa.js)
 drawMinimap()}
const restored=loadGame();
if(window.SAVE_FALHOU)avisoFalhaSave(); // save existe mas não carregou: avisa e não salva por cima (js/ui.js)
{// Personagem novo começa com o kit inicial; as ferramentas de teste da Engine podem dar outros itens.
 const has=id=>I.some(s=>s&&s.id==id)||Object.values(EQ).some(s=>s&&s.id==id);
 // personagem novo: recebe o kit da classe (Engine › Classes › Kit inicial); sem kit configurado, o kit antigo
 window.personagemNovo=!restored;
 if(!restored&&!darKit(p.cls,{salvar:false})){
  if(ITEMS.sw&&!has('sw'))EQ.sw={id:'sw',n:1,q:rollQ()};
  for(const [id,n] of [['hp',3],['mp',2]])if(ITEMS[id]&&!has(id))addItem(id,undefined,n);
 }
 if(restored)darKit(p.cls,{salvar:false}); // item novo no kit da classe (ex.: escudo do Guerreiro) chega uma vez
 if(!restored){p.hp=mhp();p.mp=mmp()}
 dirtyInv=true}
let last=performance.now();
// um erro num quadro não pode parar o jogo: o próximo quadro já fica agendado antes, e o erro é registrado
let errosQuadro=0,ultimoErro='';
/* câmera do menu de personagem (conta.js): o jogo para, o mundo segue animando, o herói some e a câmera passeia
   devagar pelas regiões da ilha; ao entrar, o herói volta para onde estava */
window.cameraMenu={ativo:false,t:0,real:null,
 ligar(){if(this.ativo)return;this.ativo=true;this.real={x:p.x,y:p.y};this.t=Math.random()*60},
 desligar(){if(!this.ativo)return;this.ativo=false;if(this.real){p.x=this.real.x;p.y=this.real.y}this.real=null},
 passo(dt){this.t+=dt;const k=this.t*.03;p.x=CX+Math.cos(k)*W*.24+Math.cos(k*2.7)*W*.05;p.y=CY+Math.sin(k*1.4)*W*.2+Math.sin(k*.6)*W*.04}};
(function loop(t){requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000);last=t;if(MODO.motor)return;time+=dt;
 if(cameraMenu.ativo){try{cameraMenu.passo(dt);draw()}catch(e){}return}
 for(const [nome,fn] of [['upd',()=>upd(dt)],['draw',draw],['hud',hud]]){
  try{fn()}catch(e){
   const msg=nome+': '+(e&&e.message||e);
   if(msg!==ultimoErro||errosQuadro%300===0){console.error('Erro no quadro ('+nome+'):',e);if(errosQuadro<3&&window.onlineSystem)onlineSystem('Erro no jogo ('+msg.slice(0,90)+'). O jogo continua; se repetir, avise o desenvolvedor.')}
   ultimoErro=msg;errosQuadro++;
  }
 }
})(last);
