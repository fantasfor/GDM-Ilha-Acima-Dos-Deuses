/* ---------- Curandeiro: efeitos de habilidade novos (tabela do usuário, 2026-10-21) ----------
   curar        Curar: cura % da vida máxima do alvo (você ou o aliado sob o mouse) e limpa acúmulos de veneno e sangramento.
   zonaCura     Iluminação: área no mouse por alguns segundos; quem está nela cura % da vida por segundo e os inimigos
                levam % da vida máxima de quem lançou em dano mágico (o total dividido pelos segundos).
   auraContinua Presença Curativa: liga/desliga; você e os aliados perto ganham +% de dano e vida por segundo, gastando
                mana por segundo enquanto estiver ligada.
   pulso        Pulso de Luz: pulsos em volta que curam % da sua vida máxima (você e aliados), causam % da sua vida máxima
                em dano mágico e empurram os inimigos.
   As curas passam pela Amplificação de cura. Os aliados online recebem as curas e os buffs por efeitoAliados (online.js
   parte 'h:'). custom.js makeSkill chama CURANDEIRO.criar; update.js chama tick; render.js e arena.js chamam desenhar. */
window.CURANDEIRO=(()=>{
 const n=(v,d=0)=>Number.isFinite(+v)&&v!==''&&v!=null?+v:d;
 const zonas=[],agenda=[];let presenca=null;
 const amp=()=>1+Math.max(0,bonus('healAmp'));
 const aliados=(x,y,r,lista)=>{if(window.efeitoAliados)efeitoAliados(lista.map(f=>({...f,x,y,r})))};
 const aliadoSob=w=>{if(!window.MP||!MP.remotos)return null;let m=null,bd=16;for(const o of MP.remotos.values()){if(o.x==null)continue;const d=Math.hypot(o.x-w.x,o.y-8-w.y);if(d<bd){bd=d;m=o}}return m};
 const curarEu=(tipo,pw,limpa=0)=>applyFx(p,[{type:tipo,chance:100,pw,dur:0,limpa,caster:p}]);
 function brilho(x,y,cor){if(window.VFX)VFX.tocar('grito',{x,y:y-4,raio:16,cor});for(let i=0;i<6;i++)fxs.push({x:x+(Math.random()-.5)*12,y:y-6-Math.random()*14,r:4,c:'#bfffcf',t:0,d:.6})}
 function criar(s,{r,col}){
  switch(s.effect){
   case 'curar':{const pct=n(s.curaPct,3),limpa=n(s.limpa,2);
    return{f:()=>{const a=aliadoSob(wpos()),pw=+(pct*amp()).toFixed(2);
      if(a&&Math.hypot(a.x-p.x,a.y-p.y)<=220&&!window.inArena){aliados(a.x,a.y,14,[{tipo:'cura',pw,limpa}]);brilho(a.x,a.y,col);ft(a.x,a.y-30,s.name||'Curar','#6fe36f')}
      else{curarEu('cura',pw,limpa);brilho(p.x,p.y,col)}},
     d:()=>'Cura '+pct+'% da vida máxima do alvo (você ou o aliado sob o mouse) e limpa '+limpa+' acúmulos de veneno e sangramento.',
     info:()=>({cura:+(pct*amp()).toFixed(1)+'% da vida máxima do alvo',alcance:'você, ou o aliado sob o mouse (até 220 px)',area:'',efeito:'Limpa '+limpa+' acúmulos de Veneno e Sangramento'})}}
   case 'zonaCura':{const pct=n(s.curaPct,1),dur=n(s.duracao,5),dano=n(s.danoVidaPct,20);
    return{f:()=>{zonas.push({id:s.id,segue:true,x:p.x,y:p.y,r:r*areaMultiplier(p),t:dur,dur,prox:0,cor:col,pct,danoTick:mhp()*dano/100})}, // a área acompanha o herói
     d:()=>'Ilumina a área em volta de você por '+dur+' s (ela acompanha você): a cada segundo quem está nela cura '+pct+'% da vida máxima e os inimigos da área levam '+dano+'% da sua vida máxima em dano mágico.',
     info:()=>({cura:+(pct*amp()).toFixed(1)+'% da vida máxima por segundo, por '+dur+' s',dano:Math.round(mhp()*dano/100*buffDano('magic'))+' mágico por segundo ('+dano+'% da sua vida máxima), por '+dur+' s',alcance:'em você (acompanha você)',area:r+' px'})}}
   case 'auraContinua':{const mana=n(s.manaPorSeg,2),dpct=n(s.danoPct,2),reg=n(s.regen,2);
    return{f:()=>{if(presenca){presenca=null;ft(p.x,p.y-30,(s.name||'Presença')+' desligada','#ccc');return}presenca={id:s.id,r,mana,dpct,reg,prox:0,cor:col};ft(p.x,p.y-30,s.name||'Presença','#7fe8a0')},
     d:()=>'Liga/desliga: você e os aliados a até '+r+' px ganham +'+dpct+'% de dano físico e mágico e '+reg+' de vida por segundo. Gasta '+mana+' de mana por segundo enquanto estiver ligada.',
     info:()=>({cura:reg+' de vida por segundo (você e aliados)',alcance:'em você',area:r+' px (você e aliados)',efeito:'+'+dpct+'% de dano físico e mágico · -'+mana+' de mana por segundo · aperte de novo para desligar'})}}
   case 'pulso':{const pct=n(s.curaPct,3),dano=n(s.danoVidaPct,20),k=Math.max(1,n(s.pulsos,3)),emp=n(s.empurra,14);
    return{f:()=>{for(let i=0;i<k;i++)agenda.push({id:s.id,t:i,fn:()=>pulso(r*areaMultiplier(p),pct,dano,emp,col)})}, // 1 pulso por segundo, em volta de onde você está
     d:()=>'Libera '+k+' pulsos de luz em volta de você, 1 por segundo: cada um cura '+pct+'% da sua vida máxima em você e nos aliados e causa '+dano+'% da sua vida máxima em dano mágico nos inimigos, empurrando-os um pouco.',
     info:()=>({cura:Math.round(mhp()*pct/100*amp())+' por pulso ('+pct+'% da sua vida máxima), '+k+' pulsos',dano:Math.round(mhp()*dano/100*buffDano('magic'))+' mágico por pulso ('+dano+'% da sua vida máxima)',alcance:'em você',area:r+' px',efeito:'Empurra os inimigos'})}}
  }
  return null}
 function pulso(raio,pct,dano,emp,cor){
  if(p.dead>0)return;if(window.VFX)VFX.tocar('grito',{x:p.x,y:p.y-4,raio:Math.round(raio),cor});
  const cura=Math.round(mhp()*pct/100*amp());curarEu('curafixa',cura);aliados(p.x,p.y,raio,[{tipo:'curafixa',pw:cura}]);
  const d=mhp()*dano/100;
  for(const e of en){if(e.hp<=0||dist(e,p)>raio||!linhaLivre(p,e))continue;hurtE(e,{physical:0,magic:d},true);
   if(!e.boss&&!e.pvp&&e.hp>0){const a=Math.atan2(e.y-p.y,e.x-p.x);for(let k=0;k<emp;k++){const nx=e.x+Math.cos(a),ny=e.y+Math.sin(a);if(!walk(nx,ny))break;e.x=nx;e.y=ny}}}}
 function tick(dt){
  for(let i=agenda.length;i--;){const a=agenda[i];a.t-=dt;if(a.t<=0){agenda.splice(i,1);a.fn()}}
  for(let i=zonas.length;i--;){const z=zonas[i];if(z.segue){z.x=p.x;z.y=p.y}z.t-=dt;z.prox-=dt;
   if(z.prox<=0&&z.t>0){z.prox=1;const pw=+(z.pct*amp()).toFixed(2);
    if(p.dead<=0&&Math.hypot(p.x-z.x,p.y-z.y)<=z.r)curarEu('luz',pw);aliados(z.x,z.y,z.r,[{tipo:'luz',pw}]);
    for(const e of en)if(e.hp>0&&Math.hypot(e.x-z.x,e.y-z.y)<=z.r)hurtE(e,{physical:0,magic:z.danoTick},true)}
   if(z.t<=0)zonas.splice(i,1)}
  if(presenca){
   if(p.dead>0){presenca=null;return}
   presenca.prox-=dt;if(presenca.prox>0)return;presenca.prox=1;
   if(p.mp<presenca.mana){presenca=null;ft(p.x,p.y-30,'Sem mana: Presença desligada','#ccc');return}
   p.mp-=presenca.mana;const raio=presenca.r*areaMultiplier(p),efs=[{type:'presenca',pw:presenca.dpct,dur:1.6},{type:'regen',pw:presenca.reg,dur:1.6}];
   applyFx(p,efs.map(f=>({...f,chance:100,caster:p,silencioso:true})));aliados(p.x,p.y,raio,efs.map(f=>({tipo:f.type,pw:f.pw,dur:f.dur})));
   if(window.marcarAura)marcarAura(p.x,p.y,raio,presenca.cor,1.6)}}
 /* áreas: círculo de linha contínua com brilho por dentro. Iluminação = no chão onde foi lançada (raios de luz subindo);
    Presença Curativa = acompanha o herói enquanto estiver ligada */
 function area(x,y,r,cor,a,t){ctx.save();
  const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.6,hexA(cor,.10*a));g.addColorStop(1,hexA(cor,.32*a));
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,r,r*.8,0,0,7);ctx.fill();
  ctx.globalAlpha=.85*a;ctx.strokeStyle=cor;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y,r,r*.8,0,0,7);ctx.stroke();
  ctx.globalAlpha=.35*a*(.6+.4*Math.sin(t*3));ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y,r,r*.8,0,0,7);ctx.stroke();ctx.restore()}
 const hexA=(c,a)=>{const n=parseInt(String(c||'#ffffff').slice(1),16);return'rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+','+a+')'};
 function desenhar(){
  const t=typeof time=='number'?time:0;
  for(const z of zonas){const a=Math.max(0,Math.min(1,z.t*2,(z.dur-z.t)*4));area(z.x,z.y,z.r,z.cor||'#fff3a0',a,t);
   ctx.save();for(let k=0;k<12;k++){const q=(t*.6+k/12)%1,ang=k*2.4,rr=z.r*.85*Math.sqrt((k*.37)%1),x=Math.round(z.x+Math.cos(ang)*rr),y=Math.round(z.y+Math.sin(ang)*rr*.8);ctx.globalAlpha=a*(1-q)*.8;ctx.fillStyle='#fff6c8';ctx.fillRect(x,y-Math.round(q*18),1,3)}ctx.restore()}
  if(presenca&&p.dead<=0)area(p.x,p.y,presenca.r*areaMultiplier(p),presenca.cor||'#7fe8a0',.8,t)} /* habilidade que saiu da barra (troca de espaço/classe): a aura desliga e as áreas e pulsos dela param */
 function sincronizar(ids){if(presenca&&!ids.has(presenca.id))presenca=null;for(let i=zonas.length;i--;)if(!ids.has(zonas[i].id))zonas.splice(i,1);for(let i=agenda.length;i--;)if(agenda[i].id&&!ids.has(agenda[i].id))agenda.splice(i,1)}
 return{criar,tick,desenhar,sincronizar,ligada:()=>!!presenca}
})();
