/* ---------- Seta de missão (2026-10-23) ----------
   SETA_MISSAO.desenhar({x, y, alto, cor}): com o alvo na tela, uma seta em pixel art pulando em cima dele (alto = altura
   do desenho do alvo); fora da tela, uma seta na borda apontando para ele, com a distância. Chamada com a câmera do mundo
   (ctx já transformado); a seta da borda é desenhada na tela e a transformação volta como estava.
   Usada no tutorial (círculo, monstros, portal) e na ilha (carpinteiro e o que a missão pede). */
(function(){
 // seta para baixo 7×6 (1 = cor, 2 = contorno, 3 = brilho)
 const FORMA=['2222222','2131112','2111112','0211120','0021200','0002000'];
 const cache={};
 function arte(cor){if(cache[cor])return cache[cor];const c=document.createElement('canvas');c.width=7;c.height=6;const g=c.getContext('2d');
  FORMA.forEach((l,y)=>[...l].forEach((ch,x)=>{if(ch==='0')return;g.fillStyle=ch==='2'?'#1a1220':ch==='3'?'#fff8c8':cor;g.fillRect(x,y,1,1)}));return cache[cor]=c}
 function desenhar(a){
  if(!a||!Number.isFinite(a.x)||!Number.isFinite(a.y))return;
  const cor=a.cor||'#ffd84a',img=arte(cor),vw=cv.width/S/2,vh=cv.height/S/2,dx=a.x-p.x,dy=a.y-p.y;
  if(Math.abs(dx)<vw-12&&Math.abs(dy)<vh-12){                      // na tela: em cima do alvo, pulando
   const y=Math.round(a.y-(a.alto||26)-8+Math.sin(time*5)*2);ctx.drawImage(img,Math.round(a.x)-3,y);return}
  // fora da tela: na borda, girada para o alvo, com a distância
  const ang=Math.atan2(dy,dx),m=26,W=cv.width,H=cv.height,cxs=W/2,cys=H/2,c=Math.cos(ang),s=Math.sin(ang);
  const k=Math.min((W/2-m)/Math.max(1e-6,Math.abs(c)),(H/2-m)/Math.max(1e-6,Math.abs(s))),sx=cxs+c*k,sy=cys+s*k,esc=Math.max(2,Math.round(S));
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;
  ctx.translate(Math.round(sx),Math.round(sy));ctx.rotate(ang-Math.PI/2);ctx.drawImage(img,-3.5*esc,-3*esc+Math.sin(time*5)*esc,7*esc,6*esc);
  ctx.setTransform(1,0,0,1,0,0);ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  const tx=sx-c*20,ty=sy-s*20,txt=Math.round(Math.hypot(dx,dy)/16)+' m';ctx.fillStyle='#000';ctx.fillText(txt,tx+1,ty+1);ctx.fillStyle=cor;ctx.fillText(txt,tx,ty);
  ctx.restore()}
 window.SETA_MISSAO={desenhar};
 /* alvo da missão na ilha: o carpinteiro (depois dos 10 monstros, até ele ir para o acampamento); depois, o monstro que a
    missão pede (Esqueleto do Serrote, Toco Vivo) quando ele já está na ilha */
 window.alvoMissao=()=>{
  if(window.inDungeon||window.inTaverna||window.inArena||window.inTutorial||window.cameraMenu&&cameraMenu.ativo)return null;
  if(window.DIALOGO&&DIALOGO.aberto())return null;
  if(typeof cacaFeita!=='undefined'&&cacaFeita&&!carpenterHelped&&carpenter.x>-1000)return {x:carpenter.x,y:carpenter.y,alto:24};
  if(typeof questMonsterRequested=='function')for(const ty of ['gob','toco_vivo'])if(questMonsterRequested(ty)){const t=questMonsterTarget(ty);if(t)return {x:t.x,y:t.y,alto:24,cor:'#ff6a5a'}}
  return null};
})();
