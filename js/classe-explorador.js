/* ---------- Classe Explorador (2026-11-02, pedido do usuário) ----------
   Classe da história (não tem Mestre na taverna e não aparece na criação de personagem — CL.explorador.historia):
   aprendida na caçada do Arqueiro Caçador ao Ladino (js/historia.js): pegar o item com o Ladino ou entregar a
   relíquia ao Arqueiro Caçador ensina Explorador; deixar o item com o Ladino ensina Ladino (classe futura).
   Habilidades (1 por rank):
    1 Armadilha de Caça — arma uma armadilha no chão (até 3, duram 20 s): prende por 2 s o primeiro inimigo que
      pisar nela, com dano leve e 3 acúmulos de sangramento;
    2 Gancho — lança um projétil-gancho com corda na direção do mouse: fisga o que vier primeiro — um inimigo
      (comum: vocês se puxam até o meio, dano leve; chefe/elite: você se puxa até ele) ou um OBSTÁCULO com
      colisão (árvore, muro, parede de DG: você se puxa até ele). Sem nada para fisgar, devolve mana e recarga;
    3 Grito de Estratégia — brado verde (mesmo estilo do Grito de Guerra): +25% de velocidade de ataque e de
      movimento por 10 s (efeito 'estrategia': kind haste = movimento; atkBuff = ataque, js/combat.js statusAtk);
    4 Instinto de Caça — marca o alvo como presa: -30% de defesa física por 8 s (efeito 'presa', kind armorPct).
   Passiva: Passos de Caçador, +20% de velocidade de movimento (CL.pSpd).
   O visual do herói usa o conjunto 'explorador' do js/sprites.js (CLASSE_VISUAL, o arqueiro de verde). */
(function(){
 if(typeof MODO!=='undefined'&&MODO.motor)return;
 const VERDE='#79a35a',VERDE_E='#3f6b45',VERDE_C='#c4dc5a'; // rampa Folhagem/Veneno da paleta do jogo

 /* ---- efeitos próprios da classe ---- */
 Object.assign(FX_INFO,{
  estrategia:{n:'Grito de Estratégia',c:VERDE,kind:'haste',good:true,aura:true,atkBuff:true}, // +movimento (haste) e +velocidade de ataque (atkBuff)
  presa:{n:'Presa Marcada',c:VERDE,kind:'armorPct'}}); // -% de defesa física do alvo (js/combat.js reducaoPct)

 /* ---- Gancho: projétil-gancho com corda (rápido no voo e no puxão) ----
    Fisga o que vier primeiro na direção do mouse: um inimigo (vocês se puxam; chefe/elite puxa só você) ou um
    OBSTÁCULO com colisão — árvore, muro do acampamento, parede de DG (2026-11-02, pedido do usuário) — e você
    se puxa até ele. Sem nada para fisgar em 140 px, a habilidade não gasta mana nem recarga. */
 const VEL_GANCHO=560,ALCANCE_GANCHO=140; // px/s e alcance
 let gancho=null; // {e (inimigo) OU o {x,y,gx,gy} (obstáculo), x, y, fase:'ida'|'puxa', d:{x,y} destino do inimigo puxado}
 function lancarGancho(w){
  // 1) inimigo embaixo do mouse ou o alvo selecionado, dentro do alcance e à vista
  let t=typeof pick=='function'?pick(w):null;
  if(!(t&&t.hp>0))t=p.tgt&&p.tgt.hp>0?p.tgt:null;
  if(t&&(t.pvp||Math.hypot(t.x-p.x,t.y-p.y)>ALCANCE_GANCHO||!linhaLivre(p,t)))t=null;
  let obst=null;
  if(!t){ // 2) raio na direção do mouse: o primeiro inimigo perto da linha ou a primeira colisão (árvore, muro, parede)
   const a=Math.atan2(w.y-p.y,w.x-p.x),co=Math.cos(a),si=Math.sin(a);
   for(let d=10;d<=ALCANCE_GANCHO;d+=4){const X=p.x+co*d,Y=p.y+si*d;
    t=en.find(e=>e.hp>0&&!e.pvp&&Math.hypot(e.x-X,e.y-Y)<10);if(t)break;
    if(!walk(X,Y)||!campWallSegmentClear(p,{x:X,y:Y})){let r=Math.max(0,d-10);while(r>0&&!walk(p.x+co*r,p.y+si*r))r-=4;obst={x:p.x+co*r,y:p.y+si*r,gx:X,gy:Y};break}}}
  if(!t&&!obst){ // nada fisgável: devolve a mana e zera a recarga (não tem como "errar" e perder a habilidade)
   const sk=SK.find(k=>k.n==='Gancho');if(sk){p.mp=Math.min(mmp(),p.mp+(+sk.mana||0));sk.t=0}
   ft(p.x,p.y-24,'Nada para fisgar por perto','#ccc');return}
  gancho={e:t||null,o:t?null:obst,x:p.x,y:p.y-8,fase:'ida',lugar:lugar()}}
 function tickGancho(dt){
  const g=gancho;if(!g)return;
  if(g.lugar!==lugar()||p.dead>0){gancho=null;return}
  const e=g.e;
  if(g.fase==='ida'){
   if(e&&(e.hp<=0||!en.includes(e))){gancho=null;return}
   const tx=e?e.x:g.o.gx,ty=e?e.y-6:g.o.gy,dx=tx-g.x,dy=ty-g.y,d=Math.hypot(dx,dy),passo=VEL_GANCHO*dt;
   if(d>passo+8){g.x+=dx/d*passo;g.y+=dy/d*passo;return} // ainda voando (num inimigo, persegue)
   // fisgou!
   const ax=e?e.x:g.o.x,ay=e?e.y:g.o.y,dd=Math.hypot(ax-p.x,ay-p.y)||1,co=(ax-p.x)/dd,si=(ay-p.y)/dd;
   const puxar=(x1,y1)=>{p.dash={x0:p.x,y0:p.y,x1,y1,t:0,dur:Math.max(.06,Math.hypot(x1-p.x,y1-p.y)/VEL_GANCHO),dir:{x:co,y:si},rastro:true,fim:()=>{}};p.dest=null;p.path=[]};
   if(!e){ // obstáculo (árvore, muro, parede de DG): você se puxa até o último ponto livre antes dele
    ring(g.o.gx,g.o.gy,10,VERDE,.5);if(window.playGameSound)playGameSound('investida');
    g.d=null;puxar(g.o.x,g.o.y);g.fase='puxa';return}
   hurtE(e,12+p.lvl*2,false);ring(e.x,e.y,14,VERDE,.5);if(window.playGameSound)playGameSound('sword');
   if(e.hp<=0){gancho=null;return}
   const grande=e.boss||e.elite||['boss','grandboss'].includes(e.bossType);
   if(grande){g.d=null;puxar(e.x-co*16,e.y-si*16)} // chefe ou elite não sai do lugar: você vai até ele
   else{const mx=(p.x+e.x)/2,my=(p.y+e.y)/2;g.d={x:mx+co*10,y:my+si*10};puxar(mx-co*6,my-si*6)} // os dois se puxam até o meio
   g.fase='puxa';return}
  // fase 'puxa': o inimigo desliza até o ponto de encontro enquanto o dash puxa o herói
  if(g.d&&e&&e.hp>0&&en.includes(e)){const dx=g.d.x-e.x,dy=g.d.y-e.y,d=Math.hypot(dx,dy),passo=VEL_GANCHO*dt;
   if(d<=passo){if(walk(g.d.x,g.d.y)){e.x=g.d.x;e.y=g.d.y}g.d=null}
   else{const nx=e.x+dx/d*passo,ny=e.y+dy/d*passo;if(walk(nx,ny)){e.x=nx;e.y=ny}else g.d=null}}
  else g.d=null;
  if(!p.dash&&!g.d)gancho=null}
 function desenharGancho(){
  const g=gancho;if(!g||g.lugar!==lugar())return;
  const e=g.e,x0=Math.round(p.x),y0=Math.round(p.y-8);
  const x1=Math.round(g.fase==='ida'?g.x:e?e.x:g.o?g.o.gx:x0),y1=Math.round(g.fase==='ida'?g.y:e?e.y-6:g.o?g.o.gy:y0);
  // a corda (com uma sombra fina por baixo para aparecer em qualquer chão)
  ctx.save();ctx.lineWidth=1;
  ctx.strokeStyle='#00000088';ctx.beginPath();ctx.moveTo(x0+.5,y0+1.5);ctx.lineTo(x1+.5,y1+1.5);ctx.stroke();
  ctx.strokeStyle='#a8653f';ctx.beginPath();ctx.moveTo(x0+.5,y0+.5);ctx.lineTo(x1+.5,y1+.5);ctx.stroke();
  // o gancho: ponta de metal em L virada para o alvo
  const a=Math.atan2(y1-y0,x1-x0);ctx.translate(x1,y1);ctx.rotate(a);
  ctx.fillStyle='#000';ctx.fillRect(-1,-2,6,4);
  ctx.fillStyle='#7c8098';ctx.fillRect(0,-1,4,2);ctx.fillStyle='#c4c8d6';ctx.fillRect(0,-1,4,1);
  ctx.fillStyle='#7c8098';ctx.fillRect(2,-3,2,2);ctx.fillRect(2,1,2,2); // as duas farpas
  ctx.restore()}

 /* ---- Armadilha de Caça: armadilhas no chão ---- */
 const armadilhas=[];
 const lugar=()=>(window.inTutorial?'u':window.inArena?'a':window.inTaverna?'t':window.inDungeon?'d':'i')+(window.MP&&MP.visitando||'');
 function armar(w){
  if(armadilhas.length>=3)armadilhas.shift(); // no máximo 3 ao mesmo tempo: a mais antiga some
  armadilhas.push({x:w.x,y:w.y,t:20,lugar:lugar()});ring(w.x,w.y,12,VERDE,.5)}
 function tickArmadilhas(dt){
  if(!armadilhas.length)return;const aqui=lugar();
  for(let i=armadilhas.length;i--;){const a=armadilhas[i];a.t-=dt;
   if(a.t<=0||a.lugar!==aqui){armadilhas.splice(i,1);continue}
   const e=en.find(e=>e.hp>0&&!e.pvp&&!e.duelo&&Math.hypot(e.x-a.x,e.y-a.y)<12);
   if(e){armadilhas.splice(i,1);ring(a.x,a.y,16,VERDE,.6);ft(a.x,a.y-24,'Armadilha!',VERDE);if(window.playGameSound)playGameSound('sword');
    hurtE(e,10+p.lvl*2,false,resolveFx([{type:'stun',dur:2,chance:100},{type:'bleed',chance:100,acumulos:3}]))}}}
 // desenho: junto dos itens no chão (desenharLoot é chamado pela ilha e pela DG com a câmera do mundo)
 function desenharArmadilhas(){
  if(!armadilhas.length)return;const aqui=lugar(),t=performance.now()/1000;
  for(const a of armadilhas){if(a.lugar!==aqui)continue;const x=Math.round(a.x),y=Math.round(a.y);
   ctx.fillStyle='#000';ctx.fillRect(x-6,y-2,13,3);
   ctx.fillStyle='#5e5668';ctx.fillRect(x-5,y-1,11,1);
   ctx.fillStyle='#8e8898';for(let k=-4;k<=4;k+=2)ctx.fillRect(x+k,y-3,1,2); // os dentes
   if(Math.sin(t*4+a.x)>0){ctx.fillStyle=VERDE_C;ctx.fillRect(x,y-1,1,1)}}} // piscada para o dono ver onde armou
 addEventListener('load',()=>{const des0=window.desenharLoot;if(des0)window.desenharLoot=()=>{des0();desenharArmadilhas();desenharGancho()};
  const upd0=upd;upd=function(dt){upd0(dt);try{tickArmadilhas(dt);tickGancho(dt)}catch(e){console.error('Explorador:',e)}}});

 /* ---- a classe e as habilidades ---- */
 CL.explorador={n:'Explorador',base:'explorador',historia:true,F:6,A:14,I:4,perLevel:{F:3,A:4,I:2},attackSpeed:1,pSpd:.2,
  passive:{n:'Passos de Caçador',d:'+20% de velocidade de movimento.'}};
 SKS.explorador=[
  {n:'Armadilha de Caça',mana:15,cd:8,vfx:'none',ic:SKI('burst',VERDE_E,VERDE_C),f:Object.assign(w=>armar(w),{mira:1}),
   d:()=>'Arma uma armadilha no chão do mouse (até 3, duram 20 s): prende por 2 s o primeiro inimigo que pisar nela, causa '+(10+p.lvl*2)+' de dano e 3 acúmulos de sangramento.'},
  {n:'Gancho',mana:20,cd:9,vfx:'investida',ic:SKI('dash',VERDE_E,VERDE_C),f:w=>lancarGancho(w), // fisga inimigo OU obstáculo; sem nada para fisgar, devolve a mana e a recarga
   d:()=>'Lança um projétil-gancho com corda na direção do mouse (alcance 140). Num inimigo: vocês se puxam um para o outro ('+(12+p.lvl*2)+' de dano); chefe ou elite: você se puxa até ele. Em árvore, muro ou parede: você se puxa até o obstáculo. Sem nada para fisgar, não gasta mana.'},
  {n:'Grito de Estratégia',mana:30,cd:20,vfx:'aura',effect:'aura',ic:SKI('burst',VERDE_E,'#e8f5d0'),
   f:()=>{applyFx(p,[{caster:p,self:true,type:'estrategia',chance:100,dur:10,pw:25}]);ring(p.x,p.y,40,VERDE,.5);ft(p.x,p.y-24,'Grito de Estratégia!',VERDE)},
   d:()=>'Solta um brado verde: por 10 s, +25% de velocidade de ataque e de movimento.'},
  {n:'Instinto de Caça',mana:20,cd:12,vfx:'none',ic:SKI('orb',VERDE_E,VERDE_C),
   f:Object.assign((w,t)=>{applyFx(t,[{caster:p,type:'presa',chance:100,dur:8,pw:30}]);ring(t.x,t.y,18,VERDE,.5)},{tg:1}),
   d:()=>'Marca o alvo como presa, revelando os pontos vulneráveis: -30% de defesa física por 8 s.'}];
})();
