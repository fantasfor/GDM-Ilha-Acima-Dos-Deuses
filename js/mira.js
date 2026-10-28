/* ---------- Mira das habilidades ----------
   Clique numa habilidade da barra: o cursor vira mira e a área aparece; clique no mapa lança, botão direito ou Esc cancela.
   Opção "Segurar para mirar" (Menu › Opções): segurar a tecla da habilidade mostra a área e soltar lança.
   Área: meteoro = círculo no cursor; explosão = círculo em volta do herói; projétil = alcance, linha e alvo;
   avanço = linha até onde o herói chega. Vermelho = parede no caminho ou longe demais. */
(function(){
 const MIRA={s:null,tecla:null};window.MIRA=MIRA;
 const alvoTg=s=>!!(s.f&&s.f.tg),noCursor=s=>!!(s.f&&s.f.mira)||s.effect=='meteor';
 const raio=s=>(+s.radius||(noCursor(s)?36:40))*areaMultiplier(p);
 const precisaMira=s=>!!s&&!!s.f&&(alvoTg(s)||noCursor(s)||['nova','blink','projectile'].includes(s.effect));
 function cancelar(){MIRA.s=null;MIRA.tecla=null;cv.style.cursor=''}
 function lancar(){const s=MIRA.s;cancelar();if(s)cast(s)}
 function mirar(s){if(p.dead>0||!s||!s.f)return;if(s.lock||s.t>0||p.mp<s.mana){cast(s);return}MIRA.s=s;cv.style.cursor='crosshair'}
 // barra de habilidades (clique): mira primeiro quando a habilidade tem área, alvo ou direção
 window.mirarOuLancar=s=>{if(!precisaMira(s)){cast(s);return}if(MIRA.s===s){cancelar();return}mirar(s)};
 // teclado: com "segurar para mirar", a tecla mostra a área e lança ao soltar
 window.teclaHabilidade=(s,e)=>{if(e.repeat)return;if(window.segurarMira&&precisaMira(s)){mirar(s);if(MIRA.s)MIRA.tecla=e.code;return}if(MIRA.s)cancelar();cast(s)};
 addEventListener('keyup',e=>{if(MIRA.s&&MIRA.tecla&&e.code===MIRA.tecla)lancar()});
 addEventListener('keydown',e=>{if(e.key==='Escape'&&MIRA.s){cancelar();e.stopImmediatePropagation()}},true);
 cv.addEventListener('pointerdown',e=>{if(!MIRA.s)return;mx=e.offsetX;my=e.offsetY;e.stopImmediatePropagation();if(e.button===2)cancelar();else if(!MIRA.tecla)lancar()},true);
 addEventListener('blur',cancelar);
 function circulo(x,y,r,ok,cheio=true){ctx.save();ctx.lineWidth=1/S*1.5;ctx.strokeStyle=ok?'rgba(255,230,140,.9)':'rgba(255,90,90,.9)';
  if(cheio){ctx.fillStyle=ok?'rgba(255,215,90,.13)':'rgba(255,70,70,.12)';ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()}
  ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.stroke();ctx.restore()} // círculo de indicação: linha contínua
 function linha(x0,y0,x1,y1,ok){ctx.save();ctx.strokeStyle=ok?'rgba(255,230,140,.75)':'rgba(255,90,90,.8)';ctx.lineWidth=1/S*1.5;ctx.setLineDash([3/S*2,3/S*2]);ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.restore()}
 function desenhar(){
  const s=MIRA.s;if(!s||p.dead>0)return;
  ctx.save();ctx.setTransform(S,0,0,S,Math.round(cv.width/2-p.x*S),Math.round(cv.height/2-p.y*S));
  const w=wpos();
  if(noCursor(s)){const ok=linhaLivre(p,w);linha(p.x,p.y,w.x,w.y,ok);circulo(w.x,w.y,raio(s),ok)}
  else if(alvoTg(s)){const t=pick(w),ok=!t||(dist(p,t)<=200&&linhaLivre(p,t));circulo(p.x,p.y,200,true,false);
   if(t){linha(p.x,p.y-6,t.x,t.y-6,ok);circulo(t.x,t.y,10,ok)}else{ctx.globalAlpha=.6;linha(p.x,p.y-6,w.x,w.y,true);ctx.globalAlpha=1}}
  else if(s.effect=='blink'){const d=Math.min(80,dist(p,w)),a=Math.atan2(w.y-p.y,w.x-p.x),x=p.x+Math.cos(a)*d,y=p.y+Math.sin(a)*d,ok=walk(x,y);linha(p.x,p.y,x,y,ok);circulo(x,y,32*areaMultiplier(p),ok)}
  else circulo(p.x,p.y,raio(s),true);
  ctx.restore();
 }
 /* mouse em cima do botão da habilidade (ui.js define MIRA.previa): mostra no herói o alcance (contorno) e o tamanho
    da área (preenchido), sem mirar nem lançar. Alcance: o da habilidade (alcance()) ou 200 nas de alvo; avanço: 80. */
 function desenharPrevia(){
  const s=MIRA.previa;if(!s||!s.f||p.dead>0)return;
  ctx.save();ctx.setTransform(S,0,0,S,Math.round(cv.width/2-p.x*S),Math.round(cv.height/2-p.y*S));
  const alc=typeof s.alcance=='function'?+s.alcance()||0:alvoTg(s)?200:s.effect=='blink'?80:0;
  if(alc>0)circulo(p.x,p.y,alc,true,false);
  if(!alvoTg(s)&&s.effect!='projectile'&&(+s.radius>0||noCursor(s)||s.effect=='nova'||s.effect=='blink'))circulo(p.x,p.y,s.effect=='blink'?32*areaMultiplier(p):raio(s),true);
  ctx.restore();
 }
 const draw0=draw;draw=function(){draw0();if(MIRA.s)desenhar();else if(MIRA.previa)desenharPrevia()};
})();
