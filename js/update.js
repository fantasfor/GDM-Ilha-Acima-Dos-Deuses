/* ---------- update ---------- */
function entityRadius(e){return e&&e.img?Math.min(9,Math.max(4,(e.img.width||12)*.3))*(e.bossType=='grandboss'?1.8:e.boss||e.bossType=='boss'?1.5:e.elite?1.25:1)*(e.size||1):0}
// monstro resetando (fora de combate) recupera esta fração da vida e da mana máximas por segundo
const RESET_REGEN=.05;
// chefe da DG só luta com quem está dentro da sala dele (dungeonRoomBounds, com 10 px de folga); fora da DG, sempre
const emConversa=()=>!!(window.DIALOGO&&DIALOGO.aberto());let conversando=false;
/* alcance do ataque básico: o da arma (ou 20 px) crescendo com o tamanho do monstro — um monstro maior (ex.: Glooc
   Saqueador, 130%) encosta no herói mais longe e antes não chegava a ficar no alcance, então nunca batia */
const alcanceBasicoMonstro=e=>(e.weaponBasic?e.weaponBasic.rng:20)*Math.max(1,+e.size||1);
function naSalaDoChefe(e,a){const r=window.inDungeon&&e.boss&&e.dungeonRoomBounds;return !r||(a.x>=r.x-10&&a.x<=r.x+r.w+10&&a.y>=r.y-10&&a.y<=r.y+r.h+10)}
// alcance extra contra alvos grandes (bosses): só o que excede o corpo de um monstro comum
function targetReach(t){return Math.max(0,entityRadius(t)-9)}
/* corpos sólidos: herói, monstros e NPCs não entram um no outro e ninguém empurra ninguém (só habilidade com empurrão,
   que move o alvo direto). O passo é recusado se chega mais perto de um corpo já encostado; afastar-se sempre pode. */
const raioCorpo=u=>u===p||u.pvp||!u.img?5:entityRadius(u);
function corpoNoCaminho(e,x,y){
 const re=raioCorpo(e),testa=b=>{if(b===e||!b||b.hp<=0&&b!==p)return false;const dx=x-b.x,dy=y-b.y,R=re+raioCorpo(b);if(Math.abs(dx)>R||Math.abs(dy)>R)return false;const d1=Math.hypot(dx,dy);return d1<R&&d1<Math.hypot(e.x-b.x,e.y-b.y)-1e-6};
 if(e!==p&&p.dead<=0&&testa(p))return true;
 for(const b of en)if(testa(b))return true;
 if(!window.inDungeon&&!window.inTaverna&&!window.inArena&&!window.inTutorial)for(const n of NPCS)if(n.x>-1000&&testa(n))return true;
 return false}
function move(e,d,sp,dt){const dx=d.x-e.x,dy=d.y-e.y,L=Math.hypot(dx,dy);if(L<.001)return true;const st=Math.min(sp*dt,L),nx=e.x+dx/L*st,ny=e.y+dy/L*st,oldX=e.x,oldY=e.y,room=e.dungeonRoomBounds;
 const free=(x,y)=>walk(x,y)&&campWallSegmentClear(e,{x,y})&&(e===p||!insideCamp(x,y))&&(!window.inDungeon||!e.boss||!room||(x>=room.x+6&&x<=room.x+room.w-6&&y>=room.y+6&&y<=room.y+room.h-6))&&!corpoNoCaminho(e,x,y);
 // esbarrou em alguém: contorna pelo lado (mantém o mesmo lado para não ficar indo e voltando); senão desliza na parede
 const contornar=()=>{const bx=dx/L,by=dy/L,lado=e.ladoDesvio||1;for(const a of [.6,1.1,1.57,2.1].flatMap(a=>[a*lado,-a*lado])){const c=Math.cos(a),s=Math.sin(a),qx=(bx*c-by*s)*st,qy=(bx*s+by*c)*st;if(free(e.x+qx,e.y+qy)){e.x+=qx;e.y+=qy;e.ladoDesvio=Math.sign(a)||1;return true}}return false};
 if(free(nx,ny)){e.x=nx;e.y=ny}
 else if(corpoNoCaminho(e,nx,ny)&&contornar()){}
 else{if(free(nx,e.y))e.x=nx;if(free(e.x,ny))e.y=ny}
 // monstro travado na parede: tenta passar de lado
 if(e!==p&&e.x===oldX&&e.y===oldY){const bx=dx/L,by=dy/L;for(const a of [1.57,-1.57,.8,-.8,2.3,-2.3]){const c=Math.cos(a),s=Math.sin(a),qx=(bx*c-by*s)*st,qy=(bx*s+by*c)*st;if(free(e.x+qx,e.y+qy)){e.x+=qx;e.y+=qy;break}}}
 e.fx=dx;e.fy=dy;return e.x===oldX&&e.y===oldY}
function snapWalk(x,y,avoid,agent){const room=agent&&agent.dungeonRoomBounds,ok=(a,b)=>walk(a,b)&&(!avoid||!insideCamp(a,b))&&(!window.inDungeon||!agent||!agent.boss||!room||(a>=room.x+6&&a<=room.x+room.w-6&&b>=room.y+6&&b<=room.y+room.h-6));if(ok(x,y))return{x,y};for(let r=4;r<=56;r+=4)for(let k=0;k<12;k++){const a=k*Math.PI/6,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(ok(px,py))return{x:px,y:py}}return{x,y}}
function navigate(agent,x,y){const room=window.inDungeon&&agent.boss&&agent.dungeonRoomBounds;if(room){const pad=14;x=Math.max(room.x+pad,Math.min(room.x+room.w-pad,x));y=Math.max(room.y+pad,Math.min(room.y+room.h-pad,y))}
 const sp=snapWalk(x,y,agent!==p,agent);x=sp.x;y=sp.y;
 const key=Math.floor(x/T)+','+Math.floor(y/T);
 if(key!==agent.pathKey){agent.dest={x,y};agent.pathKey=key;agent.path=buildPath(agent,{x,y},agent!==p);agent.pathI=0}
 else agent.dest={x,y}
}
function flank(e,range,t=p){const base=e.fa!==undefined?e.fa:Math.atan2(e.y-t.y,e.x-t.x);let pick=null;
 for(const o of [0,.55,-.55,1.1,-1.1,1.65,-1.65,2.2,-2.2,3.14]){const a=base+o,x=t.x+Math.cos(a)*range,y=t.y+Math.sin(a)*range;if(!walk(x,y)||insideCamp(x,y))continue;
  let free=true;for(const q of en){if(q===e||q.hp<=0||!q.chasing)continue;if(Math.hypot(q.x-x,q.y-y)<11){free=false;break}}if(free){pick=[a,x,y];break}}
 if(!pick){approach(e,t,range);return}e.fa=pick[0];navigate(e,pick[1],pick[2])}
/* Alvo dos monstros: o herói local ou, no multijogador, o jogador mais próximo da mesma sala (js/multiplayer.js).
   Um alvo remoto recebe o dano pela nuvem e aplica as próprias defesas. */
const monsterTarget=e=>window.MP&&MP.alvoDe?MP.alvoDe(e):p;
function hitTarget(a,...args){if(a===p)return hurtP(...args);if(window.MP)MP.ferirRemoto(a,...args)}
function approach(agent,target,range){
 const dx=target.x-agent.x,dy=target.y-agent.y,d=Math.hypot(dx,dy)||1;
 navigate(agent,target.x-dx/d*range,target.y-dy/d*range)
}
function moveAlong(agent,speed,dt){
 if(!agent.dest)return false;
 if(agent.pathI>=agent.path.length&&!walk(agent.dest.x,agent.dest.y)){agent.dest=null;agent.path=[];agent.pathKey='';return false}
 while(agent.pathI<agent.path.length&&dist(agent,agent.path[agent.pathI])<4)agent.pathI++;
 const point=agent.path[agent.pathI]||agent.dest,dx=point.x-agent.x,dy=point.y-agent.y,d=Math.hypot(dx,dy);
 if(d<1)return false;
 const before=agent.x,oldY=agent.y;
 move(agent,{x:agent.x+dx/d*Math.min(speed*dt,d),y:agent.y+dy/d*Math.min(speed*dt,d)},speed,dt);
 if(agent.x===before&&agent.y===oldY){agent.blk=(agent.blk||0)+dt;if(agent===p||agent.blk>.6){agent.dest=null;agent.path=[];agent.pathKey='';agent.blk=0;if(agent===p){p.tgt=null;p.npcT=null;p.gateT=false}return false}if(agent===p||!(agent.repathEm>time)){agent.repathEm=time+.25;agent.path=buildPath(agent,agent.dest,agent!==p);agent.pathI=0} /* monstro preso: recalcula o caminho no máximo 4× por segundo (era a cada quadro) */}else agent.blk=0
 if(dist(agent,agent.dest)<Math.max(3,speed*dt)){agent.dest=null;agent.path=[];agent.pathKey='';if(agent!==p&&!agent.boss&&!agent.chasing)agent.roamT=5}
 return agent.x!==before||agent.y!==oldY
}
/* desencalhar (2026-10-29): quem ficar num ponto onde não dá para andar (dentro de uma decoração sólida ou da parede, depois
   de um empurrão, pulo ou queda) vai para o ponto livre mais perto; monstros dentro da parede não podiam ser alvejados */
function desencalhar(u){
 if(walk(u.x,u.y))return false;
 for(let r=3;r<=36;r+=3)for(let k=0;k<16;k++){const a=k/16*Math.PI*2,x=u.x+Math.cos(a)*r,y=u.y+Math.sin(a)*r;if(walk(x,y)){u.x=x;u.y=y;u.dest=null;u.path=[];return true}}
 return false}
window.desencalhar=desencalhar;
let desencalharT=0;
function movePlayer(sp,dt){
 if(!p.dest)return;
 moveAlong(p,sp,dt)
}
/* IA tática dos monstros e do Mestre do duelo. Quem ataca de longe mantém distância: recua se o alvo chega perto e anda de
   lado entre um ataque e outro (fica difícil de alcançar e de acertar); todos saem da área de dano do jogador (Chuva de
   Meteoros); o Mestre usa as habilidades da classe dele (js/arena.js) ou salto para trás
   (mago). Devolve true quando já decidiu o que fazer neste quadro (sem ataque básico). */
/* cada tática é ligada por monstro (Engine › Monstro › Inteligência (IA)); sem configuração, todas ficam desligadas.
   Os Mestres de classe do duelo (arena) usam todas: lutam como um jogador. */
function iaTatica(e,a,d,alcance,ve,dt){
 const ar=p.canal&&p.canal.area,ia=(MONSTER_TYPES[e.ty]&&MONSTER_TYPES[e.ty].ia)||{},liga=k=>!!e.duelo||ia[k]===true;
 if(ar&&!e.boss&&liga('esquiva')&&Math.hypot(e.x-ar.x,e.y-ar.y)<ar.r+8){const ang=Math.atan2(e.y-ar.y,e.x-ar.x)||Math.random()*6.28;navigate(e,ar.x+Math.cos(ang)*(ar.r+26),ar.y+Math.sin(ang)*(ar.r+26));return true}
 if(e.duelo&&iaDuelista(e,a,d,ve,dt))return true;
 if(alcance>=45&&ve){
  if(d<alcance*.5&&liga('distancia')){const ang=Math.atan2(e.y-a.y,e.x-a.x);for(const o of [0,.5,-.5,1,-1]){const x=a.x+Math.cos(ang+o)*alcance*.8,y=a.y+Math.sin(ang+o)*alcance*.8;if(walk(x,y)&&linhaLivre({x,y},a)){navigate(e,x,y);e.fx=a.x-e.x;e.fy=a.y-e.y;return e.cd>0}}}
  if(d<=alcance&&e.cd>.35&&liga('lado')){e.strafeT=(e.strafeT||0)-dt;if(!e.lado)e.lado=Math.random()<.5?1:-1;
   if(!e.dest||e.strafeT<=0){e.strafeT=.8+Math.random()*.8;if(Math.random()<.3)e.lado*=-1;const ang=Math.atan2(e.y-a.y,e.x-a.x)+e.lado*.35,r=Math.min(alcance*.85,Math.max(alcance*.6,d)),x=a.x+Math.cos(ang)*r,y=a.y+Math.sin(ang)*r;if(walk(x,y)&&linhaLivre({x,y},a))navigate(e,x,y);else e.lado*=-1}
   e.fx=a.x-e.x;e.fy=a.y-e.y;return true}}
 return false}
function iaDuelista(e,a,d,ve,dt){
 if(window.ARENA&&ARENA.iaMestre&&ARENA.iaMestre(e,a,d,ve,dt))return true; // habilidades da classe que o Mestre ensina (js/arena.js)
 return false} // o Mestre só usa as habilidades que a classe dele tem hoje (sem truques extras)/* botão Reaparecer (tela de morte): na arena volta pela regra da arena; fora dela, no acampamento com vida e mana cheias */
window.reaparecer=function(){if(!(p.dead>0)||p.dead>=1e8)return;p.dead=0;p.morreuEm=null;if(window.inArena&&window.ARENA){ARENA.renascer();return}if(window.inTutorial&&window.TUTORIAL){TUTORIAL.renascer();return}p.x=CX;p.y=CY+34;p.dest=null;p.path=[];p.hp=mhp();p.mp=mmp();ring(p.x,p.y,30,'#fff6b0',.7);if(window.playGameSound)playGameSound('revive');saveGame()};
/* monstros da DG mais fortes: vida, dano, atributos e defesas × (jogadores + 0,5): sozinho 1,5×, 2 jogadores 2,5×,
   3 → 3,5×, 4 → 4,5×. Elites também; o Chefe (grandboss) não. Recalcula se o grupo muda, a partir dos valores originais. */
/* dificuldade da DG pelo grupo (pedido do usuário, 2026-10-23): sozinho é o normal; cada jogador a mais multiplica a vida
   máxima por 1,7 e o dano por 1,3 (2 jogadores: ×1,7 e ×1,3; 3: ×2,89 e ×1,69; 4: ×4,91 e ×2,2). Vale para todos, chefe também */
/* 2026-10-28 (pedido do usuário): o dano NÃO aumenta mais com o grupo; só a vida (×1,7 por jogador a mais) */
const escalaGrupoDG=n=>({vida:Math.pow(1.7,Math.max(0,n-1)),dano:1});
window.escalaGrupoDG=escalaGrupoDG;
window.escalarDG=function(e){
 if(!e||e.pvp||e.duelo)return;const n=Math.max(1,window.MP&&MP.tamanhoGrupo||1);if(e.dgK===n)return;
 if(!e.dgBase)e.dgBase={max:e.max,dmg:e.dmg,wm:e.weaponDamageMultiplier||1,wb:e.weaponDamageBase};
 const b=e.dgBase,{vida,dano}=escalaGrupoDG(n),parte=e.max>0?e.hp/e.max:1;e.max=Math.round(b.max*vida);e.hp=Math.round(e.max*parte);if(e.delayedHp!=null)e.delayedHp=e.hp;
 e.dmg=Math.round(b.dmg*dano);e.weaponDamageMultiplier=b.wm*dano;if(b.wb!=null)e.weaponDamageBase=Math.round(b.wb*dano);
 e.dgK=n};
function upd(dt){conversando=emConversa();if(p.dead<=0&&!p.dash)desencalhar(p);desencalharT-=dt;if(desencalharT<=0){desencalharT=.3;for(const e of en)if(e.hp>0&&!e.dash&&!(e.mec&&e.mec.salto))desencalhar(e)}if(p.tgt&&!canSee(p.tgt.x,p.tgt.y)){p.tgt=null;p.aw=0;p.wt=null;p.attackBasic=null}hov=p.dead>0?null:pick(wpos());hovN=p.dead>0?null:pickN(wpos());const dgHov=window.inDungeon&&window.pickDungeonHover?window.pickDungeonHover(wpos()):null;cv.style.cursor=hov||hovN||dgHov||(window.inTaverna&&window.BAR&&BAR.hover&&BAR.hover(wpos()))||(window.BAU_ILHA&&BAU_ILHA.sob(wpos()))||pickCampGate(wpos())||pickCampPortal(wpos())?'pointer':'crosshair';NPCS.forEach(n=>{if(p.dead<=0&&dist(n,p)<90){n.fx=p.x-n.x;n.fy=p.y-n.y}else{n.fx=0;n.fy=1}});
 fxs.forEach(f=>f.t+=dt);for(let i=fxs.length;i--;)if(fxs[i].t>fxs[i].d)fxs.splice(i,1);
 fts.forEach(f=>{f.y-=14*dt;f.a-=dt*.9});for(let i=fts.length;i--;)if(fts[i].a<=0)fts.splice(i,1);
 p.hit-=dt;
 if(p.dead>0){
  p.conj=null; // na DG não renasce: a tela de morte oferece Sair da dungeon ou Assistir (js/morte-dg.js)
  // morto: a animação de queda roda (render.js desenharHeroiMorto) e o jogador volta pelo botão Reaparecer (reaparecer abaixo)
 }
 else{
  tickAttributeBuffs(p,dt);SK.forEach(s=>s.t=Math.max(0,s.t-dt));p.acd-=dt;tickStatus(p,dt);if(window.tickDash)tickDash(dt);if(window.tickCanal)tickCanal(dt);if(window.CURANDEIRO)CURANDEIRO.tick(dt);
  // bebendo uma poção: atordoar cancela; no fim faz efeito (state.js usarConsumivel)
  if(p.beber){const b=p.beber;if(statusSpeed(p)==0&&(p.st&&Object.keys(p.st).some(k=>fxKind(k)=='stun'))){p.beber=null;ft(p.x,p.y-24,'Interrompido','#ccc')}else if((b.r-=dt)<=0){p.beber=null;if(I[b.i]&&I[b.i].id===b.id)usarConsumivel(b.i)}}const pst=statusSpeed(p);if(pst==0){p.dest=null;p.aw=0;p.wt=null;p.attackBasic=null;p.acd=Math.max(p.acd,.15)}
  // conjuração em andamento (combat.js cast/lancar): só ser atordoado interrompe (dá para andar); no fim a habilidade sai
  if(p.conj){const c=p.conj;
   if(pst==0){p.conj=null;ft(p.x,p.y-24,'Conjuração interrompida','#ccc')} // só atordoar/congelar interrompe; andar não cancela
   else if((c.r-=dt)<=0){p.conj=null;if(c.t&&c.t.hp<=0)ft(p.x,p.y-24,'Sem alvo','#ccc');else if(p.mp<c.s.mana)ft(p.x,p.y-24,'Sem mana','#ccc');else{lancar(c.s,c.w,c.t);if(c.volta&&c.volta.hp>0&&!p.canal)p.tgt=c.volta /* volta a atacar o alvo de antes */}}}
  if(p.aw>0){p.aw-=dt;p.dest=null;if(p.aw<=0){const t=p.wt,b=p.attackBasic||basicForDistance(t?dist(p,t):Infinity),landed=!!(t&&t.hp>0&&dist(p,t)-targetReach(t)<b.rng+8&&linhaLivre(p,t));if(landed){const {damage,bfx}=withWeaponDamageRoll(()=>({damage:basicAttackDamage(b),bfx:resolveFx(b.effects,charDamage(b.damageType))}));if(b.proj){const a=Math.atan2(t.y-8-p.y,t.x-p.x);proj.push({x:p.x,y:p.y-8,vx:Math.cos(a)*190,vy:Math.sin(a)*190,t:1.6,d:damage,magic:b.damageType=='magic',c:b.proj,tg:t,fx:bfx,seta:b.damageType!='magic'&&typeof armaDeTiro=='function'&&armaDeTiro(b.weaponSlot)})}else{hurtE(t,damage,b.damageType=='magic',bfx);ring(t.x,t.y-8,10,'#fff',.15)}if(p.basicMode=='alternate'&&b.weaponSlot)p.basicNext=b.weaponSlot=='sw'?'sh':'sw'}p.wt=null;p.attackBasic=null}}
  else if(p.tgt){const reach=targetReach(p.tgt),d=dist(p,p.tgt)-reach,b=basicForDistance(d),livre=linhaLivre(p,p.tgt);if(d>b.rng||!livre)approach(p,p.tgt,livre?Math.max(8,b.rng-3)+reach:6+reach);/* parede no meio: contorna até ver o alvo */else{p.dest=null;p.path=[];p.pathKey='';p.fx=p.tgt.x-p.x;p.fy=p.tgt.y-p.y;if(p.acd<=0){p.aw=.25;p.wt=p.tgt;p.attackBasic=b;p.acd=attackInterval();if(window.somDoJogador)somDoJogador('a.'+Math.round(p.tgt.x)+'.'+Math.round(p.tgt.y));if(window.playEntitySound&&b.som){playEntitySound(...b.som);if(window.somDoJogador)somDoJogador('b.'+b.som.join('.'))}else if(window.playGameSound)playGameSound(b.proj?(b.damageType=='magic'?'feitico':'arco'):'swing',.8)}}}
  if(p.npcT){const n=p.npcT;if(dist(p,n)<28){p.npcT=null;p.dest=null;p.path=[];p.pathKey='';p.fx=n.x-p.x;p.fy=n.y-p.y;if(window.MP&&MP.soDono&&MP.soDono()){}else if(n.carpenter){if(!questDone)ft(n.x,n.y-26,'Derrote o Glooc Saqueador primeiro!','#ffd84a');else showCarpenterDialogue()}else if(n.blacksmith){showBlacksmithDialogue()}}else approach(p,n,22)}
  if(p.gateT&&dist(p,campGate)<40){p.gateT=false;p.dest=null;p.path=[];p.pathKey='';if(!(window.MP&&MP.soDono&&MP.soDono()))toggleCampGate()}
  if(p.portalT&&dist(p,campPortal)<45){p.portalT=false;p.dest=null;p.path=[];p.pathKey='';if(!(window.MP&&MP.soDono&&MP.soDono()))showDungeonMenu()}
  /* medo (grito do Chefe Glooc): enquanto durar, o herói é empurrado para longe de quem gritou, mesmo parado, e os comandos de
     andar não valem; acaba na hora se o chefe morrer (antes, clicar no baú do chefe fazia o herói andar ao contrário) */
  let medo=!!p.st&&Object.keys(p.st).some(k=>fxKind(k)==='medo'&&p.st[k].t>0);
  if(medo&&p.medoFonte&&!(p.medoFonte.hp>0)){for(const k of Object.keys(p.st))if(fxKind(k)==='medo')delete p.st[k];p.medoFonte=null;medo=false}
  if(medo&&pst>0){const F=p.medoFonte||p,dx=p.x-F.x,dy=p.y-F.y,d=Math.hypot(dx,dy)||1,ux=d>1?dx/d:-(p.fx||0),uy=d>1?dy/d:-(p.fy||1);
   p.dest=null;p.path=[];p.pathKey='';p.npcT=null;move(p,{x:p.x+ux*40,y:p.y+uy*40},CALC.move*pst*.9,dt);if(!p.tgt){p.fx=ux;p.fy=uy}} // com medo ainda dá para atacar quem estiver no alcance (o alvo não é apagado)
  const inv=1;
  const kx=medo?0:inv*((held.has('mover_direita')?1:0)-(held.has('mover_esquerda')?1:0)+p.joy.x);
  const ky=medo?0:inv*((held.has('mover_baixo')?1:0)-(held.has('mover_cima')?1:0)+p.joy.y),kl=Math.hypot(kx,ky);
  if(kl>.08){p.dest=null;p.path=[];p.pathKey='';p.tgt=null;p.npcT=null;p.gateT=false;p.portalT=false;move(p,{x:p.x+kx/kl*40,y:p.y+ky/kl*40},CALC.move*pst*(1+spdB()+(p.bf>0?.3:0)),dt)}
  else if(!medo)movePlayer(CALC.move*pst*(1+spdB()+(p.bf>0?.3:0)),dt);
  p.bf=Math.max(0,p.bf-dt);
  const a=attributes();
  p.hp=Math.min(mhp(),p.hp+regenHp()*reducaoPct(p,'regenPct')*dt); /* Fratura reduz a regeneração */p.mp=Math.min(mmp(),p.mp+regenMp()*dt);
  if(window.inDungeon&&window.updateDungeon)updateDungeon(dt);
 }
 for(const e of en){
  if(e.pvp)continue; // jogadores e boneco da arena (js/arena.js)
  if(window.inDungeon&&!e.mpProxy&&e.hp>0)escalarDG(e);
  if(e.hp<=0){if(!e.boss&&(e.rt-=dt)<=0)e.gone=1;continue}
  // monstro de outro jogador (multijogador): só acompanha a posição enviada pelo dono da sala
  if(e.mpProxy){if(window.MP)MP.moverProxy(e,dt);continue}
  // conversando (diálogo do tutorial ou de NPC aberto): os monstros ficam parados e não atacam
  if(conversando){e.aw=0;e.skillWindup=false;e.dest=null;continue}
  tickAttributeBuffs(e,dt);e.cd-=dt;e.hit-=dt;e.alert=Math.max(0,(e.alert||0)-dt);e.giveUp=Math.max(0,(e.giveUp||0)-dt);tickStatus(e,dt);if(e.hp<=0)continue;e.skillCd=Math.max(0,e.skillCd-dt);const ea=monsterAttributes(e);e.hp=Math.min(monsterMaxHp(e),e.hp+(ea.F*CALC.monRegenPerF+monsterAttribute(e,'regenHp'))*reducaoPct(e,'regenPct')*dt);e.mp=Math.min(monsterMaxMp(e),e.mp+(ea.I*CALC.monRegenPerI+monsterAttribute(e,'regenMp'))*dt);
  // reset: CALC.monsterReset s fora de combate (sem perseguir nem apanhar) e o monstro volta para casa recuperando 5% da vida máxima por segundo
  if(e.chasing)e.foraCombate=0;else e.foraCombate=(e.foraCombate||0)+dt;
  if(e.foraCombate>=(CALC.monsterReset||10)){const mx=monsterMaxHp(e),mm=monsterMaxMp(e);
   if(e.hp<mx||e.mp<mm){if(!e.resetando){e.resetando=true;e.st=null;ring(e.x,e.y,14,'#7fe08a',.45);if(e.mec&&window.CHEFES)CHEFES.reset(e)}e.hp=Math.min(mx,e.hp+mx*RESET_REGEN*dt);e.mp=Math.min(mm,e.mp+mm*RESET_REGEN*dt)}
   else e.resetando=false}
  if(e.st&&statusSpeed(e)==0){e.dest=null;e.aw=0;e.skillWindup=false;e.dashM=null;continue}
  /* investida de monstro (habilidade effect 'investida', ex.: Javaporco): corre em linha reta até onde o alvo estava e, se
     chegar perto dele, aplica o dano e os efeitos (atordoar) */
  if(e.dashM){const m=e.dashM;m.t+=dt;const k=Math.min(1,m.t/m.dur),nx=m.x0+(m.x1-m.x0)*k,ny=m.y0+(m.y1-m.y0)*k;if(walk(nx,ny)){e.x=nx;e.y=ny}else m.t=m.dur;e.fx=m.x1-m.x0;e.fy=m.y1-m.y0;
   if(Math.random()<.5)fxs.push({x:e.x+(Math.random()-.5)*8,y:e.y,r:4,c:'#c9b08a',t:0,d:.35,style:'ring'});
   if(m.t>=m.dur){e.dashM=null;const al=m.alvo;if(al&&al.dead<=0&&dist(e,al)<28){hitTarget(al,m.dano,m.mag,m.fx,null,e);if(window.VFX)VFX.tocar('impacto',{x:al.x,y:al.y-8});if(window.playGameSound&&dist(e,p)<260)playGameSound('investida',.6)}}
   continue}
  const a=monsterTarget(e),d=dist(e,a),home={x:e.hx,y:e.hy};
  if(e.aw>0){
   e.aw-=dt;
   if(e.aw<=0&&a.dead<=0){
    const weaponDelta=monsterWeaponDamageDelta(e),attackDamage=e.weaponRanges?.length?Math.round(((e.weaponDamageBase??e.dmg)+weaponDelta)*(e.weaponDamageMultiplier||1)):e.dmg;
    if(e.skillWindup){
     const skill=e.skill;e.skillWindup=false;
     if(d<=((skill.radius?skill.radius*areaMultiplier(e):skill.range))&&linhaLivre(e,a)){let damage,skillFx=skill.fxs?resolveFx(skill.fxs,attackDamage,monsterCtx(e,weaponDelta)):null;
      if(skill.flatDamage){const context=monsterCtx(e,weaponDelta),power=skill.magic?context.mag:context.phys,cd=power,stat=skill.scaleStat||'none',source=context.attr(stat);
       const legacy=skill.damage+skill.per*e.lvl+cd*(skill.charPercent||0)/100+source*(skill.scalePercent??100)/100;
       if(skill.damageModel=='split'||hasSplitDamage(skill)){damage={physical:Math.max(0,(skill.physicalFlat||0)+(+skill.actionStats?.physicalDmg||0)+(skill.physicalPercent||0)*context.phys/100),magic:Math.max(0,(skill.magicFlat||0)+(+skill.actionStats?.magicDmg||0)+(skill.magicPercent||0)*context.mag/100)};
        if(skill.damageModel!='split')damage[skill.magic?'magic':'physical']+=legacy}
       else damage=legacy;skillFx=resolveFx(skill.effects,cd,monsterCtx(e,weaponDelta))}
      else damage=skill.magic?skill.damage*(1+e.stats.I*monMagPerI()/100):attackDamage*(skill.multiplier||1);
      if(skill.effect==='curaAliados'){const r=(skill.radius||90)*areaMultiplier(e),fam=window.mesmaFamilia||((x,y)=>x.ty===y.ty);for(const o of en){if(o.hp<=0||o.pvp||o.mpProxy||!(o===e||fam(o,e))||Math.hypot(o.x-e.x,o.y-e.y)>r)continue;const mx=monsterMaxHp(o);if(o.hp>=mx)continue;const v=Math.round(mx*Math.max(1,skill.damage||15)/100);o.hp=Math.min(mx,o.hp+v);ft(o.x,o.y-28,'+'+v,'#6fe36f');fxs.push({x:o.x,y:o.y,r:14,c:'#6fe36f',t:0,d:.6,style:'holy'})}ring(e.x,e.y,r,'#6fe36f',.4)} /* Esqueleto Curador: cura a família por perto */
      else if(skill.effect==='investida'){const len=Math.max(1,d),para=Math.max(0,len-10);e.dashM={x0:e.x,y0:e.y,x1:e.x+(a.x-e.x)/len*para,y1:e.y+(a.y-e.y)/len*para,t:0,dur:Math.max(.12,para/360),dano:damage,fx:skillFx,mag:skill.magic,alvo:a}}
      else if(['heal','buff','guard'].includes(skill.effect)){
       if(skill.effect==='heal')e.hp=Math.min(monsterMaxHp(e),e.hp+Math.max(0,skill.damage+skill.per*e.lvl));
       const action=skill.actionStats||{};if(action.physicalDmg||action.magicDmg)hitTarget(a,{physical:Math.max(0,+action.physicalDmg||0),magic:Math.max(0,+action.magicDmg||0)},false,skillFx,null,e);
      }else hitTarget(a,damage,skill.magic,skillFx,null,e);
      ring(a.x,a.y,(skill.radius||18)*areaMultiplier(e),skill.magic?'#9cf':'#f90',.3);if(skill.vfx&&skill.vfx!='none')fxs.push({x:a.x,y:a.y,r:Math.max(16,Math.min(52,skill.radius||24)),c:skill.vfxColor||'#9bd4ff',t:0,d:.55,style:skill.vfx})}
    }else if(e.castOnly){e.castOnly=false}
    else if(d<alcanceBasicoMonstro(e)+6&&linhaLivre(e,a)){const extra=k=>attributeValue(e.attributeStats,k)+statusAttributeBonus(e,k),damage=e.attackMagic?{physical:monsterAttribute(e,'physicalDmg'),magic:attackDamage+extra('magicDmg')+statusAttributeBonus(e,'I')*monMagPerI()}:{physical:attackDamage+extra('physicalDmg')+statusAttributeBonus(e,'F')*monPhysPerF(),magic:monsterAttribute(e,'magicDmg')};hitTarget(a,damage,!!e.attackMagic,resolveFx(e.weaponFx,attackDamage,monsterCtx(e,weaponDelta)),null,e)}
   }
  }
  else if(a.dead<=0&&!insideCamp(a.x,a.y)&&!(e.giveUp>0)&&naSalaDoChefe(e,a)&&(e.chasing?d<(e.bossType=='grandboss'?620:e.boss?420:Math.max(CALC.loseMin,e.aggro*CALC.loseMul)):(d<e.aggro||(e.alert>0&&d<Math.max(CALC.loseMin,e.aggro*CALC.loseMul))))){e.chasing=true;if(a===p)marcarCombate();e.noAtk=(e.noAtk||0)+dt;if(e.noAtk>CALC.giveUp&&e.bossType!='grandboss'){e.giveUp=8;e.noAtk=0;e.alert=0}
   /* alcance para parar e golpear: o da habilidade só quando ela está pronta (mana e recarga); senão o do ataque básico.
      Antes valia sempre o da habilidade: com a Investida (110 px) ou o Golpe Real, o monstro golpeava de longe e nunca acertava */
   const hasSkill=e.skill&&e.skill.cost<999999,skillPronta=hasSkill&&e.mp>=e.skill.cost&&e.skillCd<=0,alcanceBasico=alcanceBasicoMonstro(e),attackRange=skillPronta?Math.max(alcanceBasico,e.skill.range*(e.skill.radius?areaMultiplier(e):1)):alcanceBasico,ve=linhaLivre(e,a);
   if(window.CHEFES&&CHEFES.tick(e,dt,a,d)){e.noAtk=0} // mecânica de chefe (js/chefes.js)
   else if(iaTatica(e,a,d,attackRange,ve,dt)){} // distância, desvio de área, fuga e truques do duelista (abaixo)
   else if(hasSkill&&d>Math.max(20,attackRange)&&e.mp>=e.skill.cost&&e.skillCd<=0)flank(e,attackRange-4,a);
   else if(hasSkill&&d<=attackRange&&ve&&e.mp>=e.skill.cost&&e.skillCd<=0){e.dest=null;e.fx=a.x-e.x;e.fy=a.y-e.y;e.aw=e.skill.windup/Math.max(.1,1+monsterAttribute(e,'castSpeed'));e.noAtk=0;e.skillWindup=true;e.mp-=e.skill.cost;applyActionAttributes(e,e.skill);e.skillCd=e.skill.cd*cooldownMultiplier(e);if(!(window.playEntitySound&&playEntitySound('skills',e.skill.id,'cast'))&&window.playEntitySound)playEntitySound('monsters',e.ty,'skill');ft(e.x,e.y-24,e.skill.name,'#f9c')}
   else if(d>attackRange||!ve){if(!ve)approach(e,a,8);else if(e.bossType=='grandboss')approach(e,a,Math.max(12,attackRange-4));else flank(e,Math.max(12,attackRange-4),a)}
   else{e.dest=null;e.fx=a.x-e.x;e.fy=a.y-e.y;if(e.cd<=0){e.aw=e.wu;e.noAtk=0;e.skillWindup=false;const agilityFactor=Math.max(.05,1-ea.A*CALC.monAtkSpdPerA)/Math.max(.05,1-e.stats.A*CALC.monAtkSpdPerA);e.cd=Math.max(CALC.monMinInterval,e.ac*agilityFactor*(1-Math.min(.9,statusAttributeBonus(e,'attackSpeed'))))/statusAtk(e); /* gelo: ataca mais devagar */if(!(window.playEntitySound&&playEntitySound('monsters',e.ty,'attack'))&&window.playGameSound&&dist(e,p)<260)playGameSound(e.weaponBasic&&e.weaponBasic.proj?(e.attackMagic?'feitico':'arco'):/^glooc/.test(e.ty)?(/machad|saquead|chefe/.test(e.ty)?'gloocMachado':'gloocGolpe'):'swing',/^glooc/.test(e.ty)?.7:.45)}}
  }
  else{
   if(e.chasing){e.dest=null;e.path=[];e.pathKey='';e.chasing=false;e.fa=undefined;e.alert=0;e.noAtk=0;if(e.boss&&window.inDungeon)e.foraCombate=CALC.monsterReset||10/* chefe da DG: saiu da sala, reseta na hora */}
   if(e.boss){if(dist(e,home)>3)navigate(e,home.x,home.y);else{e.dest=null;e.path=[];e.pathKey=''}}
   else if(Math.hypot(e.x-home.x,e.y-home.y)>Math.max(e.roamRadius,e.rumo||0))navigate(e,home.x,home.y);
   else{
   if(!e.dest)e.roamT-=dt;
   if(!e.dest&&e.roamT<=0){
    /* na ilha os monstros andam à toa, mas costumam seguir a terra (trilhas das clareiras e estradas, js/world.js terraDist):
       6 em 10 passeios procuram um ponto de terra até ~2× mais longe; e.rumo deixa ir até lá sem ser puxado de volta */
    e.rumo=0;
    if(!window.inDungeon&&!window.inArena&&!window.inTutorial&&window.terraDist&&!e.seguidor&&Math.random()<.6){const R=Math.max(120,e.roamRadius*2.2);
     for(let attempt=0;attempt<16;attempt++){const angle=rnd(0,Math.PI*2),radius=rnd(24,R),x=home.x+Math.cos(angle)*radius,y=home.y+Math.sin(angle)*radius;
      if(terraDist(x,y)<4&&walk(x,y)&&!insideCamp(x,y,8)){e.rumo=radius+16;navigate(e,x,y);break}}}
    if(!e.dest)for(let attempt=0;attempt<12;attempt++){
     const angle=rnd(0,Math.PI*2),radius=rnd(18,e.roamRadius),x=home.x+Math.cos(angle)*radius,y=home.y+Math.sin(angle)*radius;
     if(walk(x,y)&&!insideCamp(x,y,8)&&longeDeArvores(x,y)){navigate(e,x,y);break}
    }
    if(!e.dest)e.roamT=.5
   }
   }
  }
  moveAlong(e,e.spd*statusSpeed(e)*Math.max(0,1+statusAttributeBonus(e,'moveSpeed')+statusAttributeBonus(e,'A')*.005),dt)}
 for(let i=proj.length;i--;){const q=proj[i];if(q.tg){if(q.tg.hp<=0){proj.splice(i,1);continue}const tx=q.tg.x,ty=q.tg.y-wh(q.tg.img)/2,a=Math.atan2(ty-q.y,tx-q.x);q.vx=Math.cos(a)*190;q.vy=Math.sin(a)*190;if(dist(q,{x:tx,y:ty})<10){acertoProjetil(q,q.tg);proj.splice(i,1);continue}}q.x+=q.vx*dt;q.y+=q.vy*dt;q.t-=dt;if(q.tg){if(q.t<=0||bloqueiaTiro(q.x,q.y+8))proj.splice(i,1);continue}
  const h=en.find(e=>e.hp>0&&(dist(e,q)<14||dist({x:e.x,y:e.y-wh(e.img)/2},q)<14));if(h){acertoProjetil(q,h);proj.splice(i,1)}else if(q.t<=0||!walk(q.x,q.y))proj.splice(i,1)}
 for(let i=mets.length;i--;){const m=mets[i];m.t-=dt;if(m.t<=0){const radius=m.radius||36*areaMultiplier(p);ring(m.x,m.y,radius,'#f60',.5);en.forEach(e=>{if(e.hp>0&&dist(e,m)<radius&&linhaLivre(m,e))hurtE(e,m.dmg||120+p.lvl*12,m.magic!==false,m.fx)});mets.splice(i,1)}}
}
