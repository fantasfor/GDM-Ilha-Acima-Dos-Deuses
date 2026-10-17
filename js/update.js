/* ---------- update ---------- */
function entityRadius(e){return e&&e.img?Math.min(9,Math.max(4,(e.img.width||12)*.3))*(e.bossType=='grandboss'?1.8:e.boss||e.bossType=='boss'?1.5:e.elite?1.25:1)*(e.size||1):0}
// alcance extra contra alvos grandes (bosses): só o que excede o corpo de um monstro comum
function targetReach(t){return Math.max(0,entityRadius(t)-9)}
function move(e,d,sp,dt){const dx=d.x-e.x,dy=d.y-e.y,L=Math.hypot(dx,dy);if(L<.001)return true;const st=Math.min(sp*dt,L),nx=e.x+dx/L*st,ny=e.y+dy/L*st,oldX=e.x,oldY=e.y,room=e.dungeonRoomBounds;
 const free=(x,y)=>walk(x,y)&&campWallSegmentClear(e,{x,y})&&(e===p||!insideCamp(x,y))&&(!window.inDungeon||!e.boss||!room||(x>=room.x+6&&x<=room.x+room.w-6&&y>=room.y+6&&y<=room.y+room.h-6));
 if(free(nx,ny)){e.x=nx;e.y=ny}
 else{if(free(nx,e.y))e.x=nx;if(free(e.x,ny))e.y=ny}
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
 if(agent.x===before&&agent.y===oldY){agent.blk=(agent.blk||0)+dt;if(agent===p||agent.blk>.6){agent.dest=null;agent.path=[];agent.pathKey='';agent.blk=0;if(agent===p){p.tgt=null;p.npcT=null;p.gateT=false}return false}agent.path=buildPath(agent,agent.dest,agent!==p);agent.pathI=0}else agent.blk=0
 if(dist(agent,agent.dest)<Math.max(3,speed*dt)){agent.dest=null;agent.path=[];agent.pathKey='';if(agent!==p&&!agent.boss&&!agent.chasing)agent.roamT=5}
 return agent.x!==before||agent.y!==oldY
}
function movePlayer(sp,dt){
 if(!p.dest)return;
 moveAlong(p,sp,dt)
}
function upd(dt){if(p.tgt&&!canSee(p.tgt.x,p.tgt.y)){p.tgt=null;p.aw=0;p.wt=null;p.attackBasic=null}hov=p.dead>0?null:pick(wpos());hovN=p.dead>0?null:pickN(wpos());const dgHov=window.inDungeon&&window.pickDungeonHover?window.pickDungeonHover(wpos()):null;cv.style.cursor=hov||hovN||dgHov||pickCampGate(wpos())||pickCampPortal(wpos())?'pointer':'crosshair';NPCS.forEach(n=>{if(p.dead<=0&&dist(n,p)<90){n.fx=p.x-n.x;n.fy=p.y-n.y}else{n.fx=0;n.fy=1}});
 fxs.forEach(f=>f.t+=dt);for(let i=fxs.length;i--;)if(fxs[i].t>fxs[i].d)fxs.splice(i,1);
 fts.forEach(f=>{f.y-=14*dt;f.a-=dt*.9});for(let i=fts.length;i--;)if(fts[i].a<=0)fts.splice(i,1);
 p.hit-=dt;
 if(p.dead>0){
  if(window.inDungeon&&window.exitDungeon){
   exitDungeon(false);
   ft(CX,CY-30,'VOCÊ FOI DERROTADO E EXPULSO DA MASMORRA!','#ff4444');
  }
  p.dead-=dt;if(p.dead<=0){p.x=CX;p.y=CY+34;p.hp=mhp();p.mp=mmp();saveGame()}
 }
 else{
  tickAttributeBuffs(p,dt);SK.forEach(s=>s.t=Math.max(0,s.t-dt));p.guard=Math.max(0,(p.guard||0)-dt);p.acd-=dt;tickStatus(p,dt);const pst=statusSpeed(p);if(pst==0){p.dest=null;p.aw=0;p.wt=null;p.attackBasic=null;p.acd=Math.max(p.acd,.15)}
  if(p.aw>0){p.aw-=dt;p.dest=null;if(p.aw<=0){const t=p.wt,b=p.attackBasic||basicForDistance(t?dist(p,t):Infinity),landed=!!(t&&t.hp>0&&dist(p,t)-targetReach(t)<b.rng+8);if(landed){const {damage,bfx}=withWeaponDamageRoll(()=>({damage:basicAttackDamage(b),bfx:resolveFx(b.effects,charDamage(b.damageType))}));if(b.proj){const a=Math.atan2(t.y-8-p.y,t.x-p.x);proj.push({x:p.x,y:p.y-8,vx:Math.cos(a)*190,vy:Math.sin(a)*190,t:1.6,d:damage,magic:b.damageType=='magic',c:b.proj,tg:t,fx:bfx})}else{hurtE(t,damage,b.damageType=='magic',bfx);ring(t.x,t.y-8,10,'#fff',.15)}if(p.basicMode=='alternate'&&b.weaponSlot)p.basicNext=b.weaponSlot=='sw'?'sh':'sw'}p.wt=null;p.attackBasic=null}}
  else if(p.tgt){const reach=targetReach(p.tgt),d=dist(p,p.tgt)-reach,b=basicForDistance(d);if(d>b.rng)approach(p,p.tgt,Math.max(8,b.rng-3)+reach);else{p.dest=null;p.path=[];p.pathKey='';p.fx=p.tgt.x-p.x;p.fy=p.tgt.y-p.y;if(p.acd<=0){p.aw=.25;p.wt=p.tgt;p.attackBasic=b;p.acd=attackInterval();if(window.playEntitySound&&b.formula)playEntitySound('skills',b.formula.id,'cast')}}}
  if(p.npcT){const n=p.npcT;if(dist(p,n)<28){p.npcT=null;p.dest=null;p.path=[];p.pathKey='';p.fx=n.x-p.x;p.fy=n.y-p.y;if(n.carpenter){if(!questDone)ft(n.x,n.y-26,'Derrote o Guardião Esqueleto primeiro!','#ffd84a');else showCarpenterDialogue()}else if(n.blacksmith){showBlacksmithDialogue()}else if(n.cls=='sty')sexBox.style.display='block';else setClass(n.cls)}else approach(p,n,22)}
  if(p.gateT&&dist(p,campGate)<40){p.gateT=false;p.dest=null;p.path=[];p.pathKey='';toggleCampGate()}
  if(p.portalT&&dist(p,campPortal)<45){p.portalT=false;p.dest=null;p.path=[];p.pathKey='';showDungeonMenu()}
  const kx=(held.has('d')||held.has('arrowright')?1:0)-(held.has('a')||held.has('arrowleft')?1:0)+p.joy.x;
  const ky=(held.has('s')||held.has('arrowdown')?1:0)-(held.has('w')||held.has('arrowup')?1:0)+p.joy.y,kl=Math.hypot(kx,ky);
  if(kl>.08){p.dest=null;p.path=[];p.pathKey='';p.tgt=null;p.npcT=null;p.gateT=false;p.portalT=false;move(p,{x:p.x+kx/kl*40,y:p.y+ky/kl*40},CALC.move*pst*(1+spdB()+(p.bf>0?.3:0)),dt)}
  else movePlayer(CALC.move*pst*(1+spdB()+(p.bf>0?.3:0)),dt);
  p.bf=Math.max(0,p.bf-dt);
  const a=attributes();
  p.hp=Math.min(mhp(),p.hp+regenHp()*dt);p.mp=Math.min(mmp(),p.mp+regenMp()*dt);
  if(window.inDungeon&&window.updateDungeon)updateDungeon(dt);
 }
 for(const e of en){
  if(e.hp<=0){if(!e.boss&&(e.rt-=dt)<=0)e.gone=1;continue}
  // monstro de outro jogador (multijogador): só acompanha a posição enviada pelo dono da sala
  if(e.mpProxy){if(window.MP)MP.moverProxy(e,dt);continue}
  tickAttributeBuffs(e,dt);e.cd-=dt;e.hit-=dt;e.alert=Math.max(0,(e.alert||0)-dt);e.giveUp=Math.max(0,(e.giveUp||0)-dt);tickStatus(e,dt);if(e.hp<=0)continue;e.skillCd=Math.max(0,e.skillCd-dt);const ea=monsterAttributes(e);e.hp=Math.min(monsterMaxHp(e),e.hp+(ea.F*.05+monsterAttribute(e,'regenHp'))*dt);e.mp=Math.min(monsterMaxMp(e),e.mp+(ea.I*.05+monsterAttribute(e,'regenMp'))*dt);
  if(e.st&&statusSpeed(e)==0){e.dest=null;e.aw=0;e.skillWindup=false;continue}
  const a=monsterTarget(e),d=dist(e,a),home={x:e.hx,y:e.hy};
  if(e.aw>0){
   e.aw-=dt;
   if(e.aw<=0&&a.dead<=0){
    const weaponDelta=monsterWeaponDamageDelta(e),attackDamage=e.weaponRanges?.length?Math.round(((e.weaponDamageBase??e.dmg)+weaponDelta)*(e.weaponDamageMultiplier||1)):e.dmg;
    if(e.skillWindup){
     const skill=e.skill;e.skillWindup=false;
     if(d<=((skill.radius?skill.radius*areaMultiplier(e):skill.range))){let damage,skillFx=skill.fxs?resolveFx(skill.fxs,attackDamage,monsterCtx(e,weaponDelta)):null;
      if(skill.flatDamage){const context=monsterCtx(e,weaponDelta),power=skill.magic?context.mag:context.phys,cd=power,stat=skill.scaleStat||'none',source=context.attr(stat);
       const legacy=skill.damage+skill.per*e.lvl+cd*(skill.charPercent||0)/100+source*(skill.scalePercent??100)/100;
       if(skill.damageModel=='split'||hasSplitDamage(skill)){damage={physical:Math.max(0,(skill.physicalFlat||0)+(+skill.actionStats?.physicalDmg||0)+(skill.physicalPercent||0)*context.phys/100),magic:Math.max(0,(skill.magicFlat||0)+(+skill.actionStats?.magicDmg||0)+(skill.magicPercent||0)*context.mag/100)};
        if(skill.damageModel!='split')damage[skill.magic?'magic':'physical']+=legacy}
       else damage=legacy;skillFx=resolveFx(skill.effects,cd,monsterCtx(e,weaponDelta))}
      else damage=skill.magic?skill.damage+e.stats.I*5:attackDamage*(skill.multiplier||1);
      if(['heal','buff','guard'].includes(skill.effect)){
       if(skill.effect==='heal')e.hp=Math.min(monsterMaxHp(e),e.hp+Math.max(0,skill.damage+skill.per*e.lvl));
       const action=skill.actionStats||{};if(action.physicalDmg||action.magicDmg)hitTarget(a,{physical:Math.max(0,+action.physicalDmg||0),magic:Math.max(0,+action.magicDmg||0)},false,skillFx,null,e);
      }else hitTarget(a,damage,skill.magic,skillFx,null,e);
      ring(a.x,a.y,(skill.radius||18)*areaMultiplier(e),skill.magic?'#9cf':'#f90',.3);if(skill.vfx&&skill.vfx!='none')fxs.push({x:a.x,y:a.y,r:Math.max(16,Math.min(52,skill.radius||24)),c:skill.vfxColor||'#9bd4ff',t:0,d:.55,style:skill.vfx})}
    }else if(e.castOnly){e.castOnly=false}
    else if(d<(e.weaponBasic?e.weaponBasic.rng:30)){const extra=k=>attributeValue(e.attributeStats,k)+statusAttributeBonus(e,k),damage=e.attackMagic?{physical:monsterAttribute(e,'physicalDmg'),magic:attackDamage+extra('magicDmg')+statusAttributeBonus(e,'I')*CALC.magPerI}:{physical:attackDamage+extra('physicalDmg')+statusAttributeBonus(e,'F')*CALC.physPerF,magic:monsterAttribute(e,'magicDmg')};hitTarget(a,damage,!!e.attackMagic,resolveFx(e.weaponFx,attackDamage,monsterCtx(e,weaponDelta)),null,e)}
   }
  }
  else if(a.dead<=0&&!insideCamp(a.x,a.y)&&!(e.giveUp>0)&&(e.chasing?d<(e.bossType=='grandboss'?620:e.boss?420:Math.max(CALC.loseMin,e.aggro*CALC.loseMul)):(d<e.aggro||(e.alert>0&&d<Math.max(CALC.loseMin,e.aggro*CALC.loseMul))))){e.chasing=true;e.noAtk=(e.noAtk||0)+dt;if(e.noAtk>CALC.giveUp&&e.bossType!='grandboss'){e.giveUp=8;e.noAtk=0;e.alert=0}
   const hasSkill=e.skill&&e.skill.cost<999999,attackRange=hasSkill?e.skill.range*(e.skill.radius?areaMultiplier(e):1):(e.weaponBasic?e.weaponBasic.rng:20);
   if(hasSkill&&d>Math.max(20,attackRange)&&e.mp>=e.skill.cost&&e.skillCd<=0)flank(e,attackRange-4,a);
   else if(hasSkill&&d<=attackRange&&e.mp>=e.skill.cost&&e.skillCd<=0){e.dest=null;e.fx=a.x-e.x;e.fy=a.y-e.y;e.aw=e.skill.windup;e.noAtk=0;e.skillWindup=true;e.mp-=e.skill.cost;applyActionAttributes(e,e.skill);e.skillCd=e.skill.cd*cooldownMultiplier(e);if(!(window.playEntitySound&&playEntitySound('skills',e.skill.id,'cast'))&&window.playEntitySound)playEntitySound('monsters',e.ty,'skill');ft(e.x,e.y-24,e.skill.name,'#f9c')}
   else if(d>attackRange){if(e.bossType=='grandboss')approach(e,a,Math.max(12,attackRange-4));else flank(e,Math.max(12,attackRange-4),a)}
   else{e.dest=null;e.fx=a.x-e.x;e.fy=a.y-e.y;if(e.cd<=0){e.aw=e.wu;e.noAtk=0;e.skillWindup=false;const agilityFactor=Math.max(.05,1-ea.A*.005)/Math.max(.05,1-e.stats.A*.005);e.cd=Math.max(CALC.minInterval,e.ac*agilityFactor*(1-Math.min(.9,statusAttributeBonus(e,'attackSpeed'))));if(window.playEntitySound)playEntitySound('monsters',e.ty,'attack')}}
  }
  else{
   if(e.chasing){e.dest=null;e.path=[];e.pathKey='';e.chasing=false;e.fa=undefined;e.alert=0;e.noAtk=0}
   if(e.boss){if(dist(e,home)>3)navigate(e,home.x,home.y);else{e.dest=null;e.path=[];e.pathKey=''}}
   else if(Math.hypot(e.x-home.x,e.y-home.y)>e.roamRadius)navigate(e,home.x,home.y);
   else{
   if(!e.dest)e.roamT-=dt;
   if(!e.dest&&e.roamT<=0){
    for(let attempt=0;attempt<12;attempt++){
     const angle=rnd(0,Math.PI*2),radius=rnd(18,e.roamRadius),x=home.x+Math.cos(angle)*radius,y=home.y+Math.sin(angle)*radius;
     if(walk(x,y)&&!insideCamp(x,y,8)){navigate(e,x,y);break}
    }
    if(!e.dest)e.roamT=.5
   }
   }
  }
  moveAlong(e,e.spd*statusSpeed(e)*Math.max(0,1+statusAttributeBonus(e,'moveSpeed')+statusAttributeBonus(e,'A')*.005),dt)}
 for(let i=proj.length;i--;){const q=proj[i];if(q.tg){if(q.tg.hp<=0){proj.splice(i,1);continue}const tx=q.tg.x,ty=q.tg.y-wh(q.tg.img)/2,a=Math.atan2(ty-q.y,tx-q.x);q.vx=Math.cos(a)*190;q.vy=Math.sin(a)*190;if(dist(q,{x:tx,y:ty})<10){hurtE(q.tg,q.d,q.magic,q.fx);if(q.hl)heal(q.hl());ring(q.x,q.y,14,'#f93',.25);proj.splice(i,1);continue}}q.x+=q.vx*dt;q.y+=q.vy*dt;q.t-=dt;if(q.tg){if(q.t<=0)proj.splice(i,1);continue}
  const h=en.find(e=>e.hp>0&&(dist(e,q)<14||dist({x:e.x,y:e.y-wh(e.img)/2},q)<14));if(h){hurtE(h,q.d,q.magic,q.fx);if(q.hl)heal(q.hl());ring(q.x,q.y,14,'#f93',.25);proj.splice(i,1)}else if(q.t<=0||!walk(q.x,q.y))proj.splice(i,1)}
 for(let i=mets.length;i--;){const m=mets[i];m.t-=dt;if(m.t<=0){const radius=m.radius||36*areaMultiplier(p);ring(m.x,m.y,radius,'#f60',.5);en.forEach(e=>{if(e.hp>0&&dist(e,m)<radius)hurtE(e,m.dmg||120+p.lvl*12,m.magic!==false,m.fx)});mets.splice(i,1)}}
}
