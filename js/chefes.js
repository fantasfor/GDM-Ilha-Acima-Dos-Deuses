/* ---------- Chefes com mecânicas ----------
   Qualquer monstro pode ter "mecanicas" (Engine › Monstro › Mecânicas de chefe). Cada mecânica tem tipo, nome, recarga,
   fase (só abaixo de X% da vida), aviso (tempo do telégrafo no chão) e dano em % da vida máxima de quem ficar na área.
   Tipos: impacto (círculo no alvo), chuva (vários círculos), investida (faixa até o alvo e o chefe avança),
   explosao (círculo em volta do chefe), anel (seguro só perto do chefe), raios (faixas em estrela), invocar (ajudantes)
   e furia (fica mais forte por um tempo). "furia" do monstro: abaixo de X% da vida o chefe se enfurece de vez.
   Novas (2026-10-23, DG Floresta Negra): nuvem (fumaça amarela que anda devagar no chão, dano e veneno), trilha (ossos
   brotando do chão em fila, avançando numa direção), caveira (caveira de fogo atirada no alvo, queimadura) e espiral
   (várias caveiras de fogo saindo em espiral do chefe).
   Do Glooc Chefe da Tribo (2026-10-29): salto (pula no alvo depois do aviso, área 3× o tamanho dele, atordoa 1s; com a vida
   abaixo de machadoFase% atira o machado antes na mesma área, que deixa lento, e depois pula — os dois dão dano), grito (a
   cada cadaPct% de vida perdida: medo, o herói anda ao contrário) e giro (gira alguns segundos batendo em volta).
   Só o dono da sala simula; os avisos vão para o grupo por MP.telegrafo. Os telégrafos ficam em window.TELEGRAFOS. */
(function(){
 const TG=window.TELEGRAFOS=[];
 const VOO=.45; // tempo no ar do pulo do Chefe Glooc
 const PADRAO={impacto:{raio:52,aviso:1.6,danoPct:35,cd:9},chuva:{raio:30,aviso:1.4,danoPct:25,cd:14,qtd:4,espalhar:90},investida:{largura:40,comprimento:170,aviso:1.3,danoPct:40,cd:12},
  explosao:{raio:70,aviso:1.8,danoPct:45,cd:16},anel:{raio:150,raioSeguro:44,aviso:2,danoPct:45,cd:20},raios:{largura:22,comprimento:160,aviso:1.5,danoPct:30,cd:15,qtd:6},
  invocar:{qtd:3,cd:25,maxVivos:6},furia:{duracao:8,cd:30,mais:40},
  nuvem:{raio:24,duracao:7,vel:12,danoPct:4,cd:8},trilha:{qtd:9,espaco:18,raio:12,aviso:.8,danoPct:25,cd:9},caveira:{vel:110,danoPct:18,cd:10},espiral:{qtd:24,vel:80,danoPct:12,cd:14,voltas:2},
  salto:{raio:34,aviso:1,danoPct:22,cd:8,atordoa:1,machadoFase:20,lentidao:20},grito:{raio:260,duracao:3,cadaPct:20,aviso:.6},giro:{raio:35,duracao:5,cd:20,danoPct:6,tick:.5,aviso:.3}};
 /* mecânicas padrão do chefe da DG, o Rei Esqueleto do Covil (também viram o padrão de quem criar um chefe novo na Engine) */
 window.MECANICAS_CHEFE_DG=[
  {tipo:'trilha',nome:'Trilha de Ossos',cd:9,qtd:9,espaco:18,raio:12,aviso:.8,danoPct:25},
  {tipo:'caveira',nome:'Caveira de Fogo',cd:10,vel:110,danoPct:18},
  {tipo:'espiral',nome:'Espiral de Caveiras',cd:14,fase:50,qtd:24,vel:80,danoPct:12,voltas:2},
  {tipo:'invocar',nome:'Exército de Ossos',cd:30,fase:20,monstro:'sk',qtd:5,maxVivos:5}];
 const val=(m,k)=>m[k]!=null&&m[k]!==''&&isFinite(+m[k])?+m[k]:(PADRAO[m.tipo]||{})[k];
 const lista=e=>e.mecanicas||(MONSTER_TYPES[e.ty]&&MONSTER_TYPES[e.ty].mecanicas)||null;
 const vida=e=>Math.max(0,e.hp)/Math.max(1,monsterMaxHp(e));
 function telegrafar(tg){TG.push(tg);if(window.MP&&MP.telegrafo)MP.telegrafo(tg)}
 const tremer=v=>{if(window.inDungeon&&window.tremerDG)tremerDG(v)};
 function gritar(e,txt,cor='#ff7a5a'){ft(e.x,e.y-38,txt,cor);if(window.playEntitySound)playEntitySound('monsters',e.ty,'skill')}
 /* o chefe só anda (e avança na investida) por chão livre e dentro da sala dele (dungeonRoomBounds) */
 function livre(e,x,y){const r=window.inDungeon&&e.dungeonRoomBounds;return walk(x,y)&&!bloqueiaTiro(x,y)&&(!r||(x>=r.x+6&&x<=r.x+r.w-6&&y>=r.y+6&&y<=r.y+r.h-6))}
 // até onde dá para avançar em linha reta antes de bater em parede ou na borda da sala
 function alcanceLivre(e,ang,L){const c=Math.cos(ang),s=Math.sin(ang);let d=0;while(d+4<=L&&livre(e,e.x+c*(d+4),e.y+s*(d+4)))d+=4;return d}
 /* ---- executar uma mecânica ---- */
 function executar(e,m,a){
  const area=areaMultiplier(e),aviso=Math.max(.3,val(m,'aviso')||1.5),pct=Math.max(0,val(m,'danoPct')||0)/100,nome=m.nome||'',base={src:e,t:0,maxT:aviso,pct,label:nome};
  e.dest=null;e.path=[];e.fx=a.x-e.x;e.fy=a.y-e.y;
  if(m.tipo==='impacto')telegrafar({...base,type:'circle',x:a.x,y:a.y,r:val(m,'raio')*area});
  else if(m.tipo==='chuva'){const n=Math.max(1,Math.round(val(m,'qtd'))),sp=val(m,'espalhar');for(let k=0;k<n;k++)telegrafar({...base,type:'circle',x:a.x+(k?(Math.random()-.5)*2*sp:0),y:a.y+(k?(Math.random()-.5)*2*sp:0),r:val(m,'raio')*area,t:-k*.22,label:k?'':nome})}
  else if(m.tipo==='investida'){const ang=Math.atan2(a.y-e.y,a.x-e.x),L=alcanceLivre(e,ang,val(m,'comprimento')*area);if(L<24)return;telegrafar({...base,type:'rect',x:e.x,y:e.y,angle:ang,w:val(m,'largura')*area,length:L,investida:true})}
  else if(m.tipo==='explosao')telegrafar({...base,type:'circle',x:e.x,y:e.y,r:val(m,'raio')*area,segue:true});
  else if(m.tipo==='anel')telegrafar({...base,type:'ring',x:e.x,y:e.y,r:val(m,'raio')*area,r0:val(m,'raioSeguro')*area,segue:true});
  else if(m.tipo==='raios'){const n=Math.max(2,Math.round(val(m,'qtd'))),giro=(e.mec.giro=(e.mec.giro||0)+Math.PI/n);for(let k=0;k<n;k++)telegrafar({...base,type:'rect',x:e.x,y:e.y,angle:giro+k*2*Math.PI/n,w:val(m,'largura')*area,length:val(m,'comprimento')*area,label:k?'':nome,segue:true})}
  else if(m.tipo==='invocar'){
   const id=MONSTER_TYPES[m.monstro]?m.monstro:Object.keys(MONSTER_TYPES).find(k=>!['boss','grandboss'].includes(MONSTER_TYPES[k].bossType)&&k!==e.ty);if(!id||!window.spawnAt)return;
   const vivos=en.filter(o=>o.invocadoPor===e&&o.hp>0).length,n=Math.min(Math.round(val(m,'qtd')),Math.max(0,Math.round(val(m,'maxVivos'))-vivos));
   for(let k=0;k<n;k++){const ang=Math.random()*6.283,r=26+Math.random()*24;let x=e.x+Math.cos(ang)*r,y=e.y+Math.sin(ang)*r;if(!walk(x,y)){x=e.x;y=e.y}
    const o=spawnAt(x,y,id,Math.max(1,(e.lvl||1)-2));Object.assign(o,{invocadoPor:e,isDungeonMob:!!e.isDungeonMob,dungeonRoomId:e.dungeonRoomId,alert:8,pack:e.pack||('chefe'+e.mpId)});en.push(o);ring(x,y,12,'#b98cff',.4)}
   ring(e.x,e.y,40,'#b98cff',.6);
  }
  else if(m.tipo==='furia'){e.mec.furiaT=val(m,'duracao');e.mec.furiaMais=val(m,'mais')/100;ring(e.x,e.y,36,'#ff3b30',.7)}
  else if(m.tipo==='nuvem'){const ang=Math.atan2(a.y-e.y,a.x-e.x),v=val(m,'vel');NUVENS.push({x:e.x+Math.cos(ang)*12,y:e.y+Math.sin(ang)*12,vx:Math.cos(ang)*v,vy:Math.sin(ang)*v,r:val(m,'raio')*area,t:0,dur:val(m,'duracao'),pct:val(m,'danoPct')/100,tick:.3,src:e,sd:Math.random()*9})}
  else if(m.tipo==='trilha'){const ang=Math.atan2(a.y-e.y,a.x-e.x),n=Math.max(2,Math.round(val(m,'qtd'))),esp=val(m,'espaco');
   for(let k=1;k<=n;k++){const x=e.x+Math.cos(ang)*esp*k,y=e.y+Math.sin(ang)*esp*k;if(bloqueiaTiro(x,y))break;telegrafar({...base,type:'circle',x,y,r:val(m,'raio')*area,t:-k*.13,estilo:'ossos',label:k===1?nome:''})}}
  else if(m.tipo==='caveira'){const ang=Math.atan2(a.y-e.y,a.x-e.x);atirarCaveira(e,ang,val(m,'vel'),pct)}
  else if(m.tipo==='espiral'){e.mec.espiral={n:Math.max(4,Math.round(val(m,'qtd'))),i:0,t:0,ang:Math.random()*6.283,voltas:val(m,'voltas')||2,vel:val(m,'vel'),pct}}
  else if(m.tipo==='salto'){const r=val(m,'raio')*area,mach=val(m,'machadoFase'),comMachado=mach>0&&vida(e)*100<=mach,atraso=comMachado?.7:0;
   // onde cair: o alvo, ou recuando pela linha até ter espaço para o corpo do chefe (antes ele caía encostado e entrava na parede)
   {const cabe=(x,y)=>[[0,0],[9,0],[-9,0],[0,5],[0,-5],[6,4],[-6,4],[6,-4],[-6,-4]].every(([dx,dy])=>walk(x+dx,y+dy));let k=1;while(k>0&&!cabe(e.x+(a.x-e.x)*k,e.y+(a.y-e.y)*k))k-=.08;k=Math.max(0,k);a={x:e.x+(a.x-e.x)*k,y:e.y+(a.y-e.y)*k}}
   if(comMachado)e.semMachado=true; // o machado sai da mão e só volta quando ele cai do pulo
   // abaixo de machadoFase%: o machado voa primeiro (lentidão), depois o pulo (atordoa) na mesma área
   if(comMachado){if(window.playGameSound)playGameSound('machadoVoa');}
   if(comMachado)telegrafar({...base,type:'circle',x:a.x,y:a.y,r,maxT:.7,label:'Machado!',efeitos:[{type:'slow',chance:100,pw:val(m,'lentidao'),acumulos:1}],machado:{x0:e.x,y0:e.y-12}});
   // parado durante o aviso (agachado), depois o voo (VOO s): o impacto é na queda
   telegrafar({...base,type:'circle',x:a.x,y:a.y,r,t:-atraso,maxT:aviso+VOO,label:comMachado?'':nome,efeitos:[{type:'stun',chance:100,dur:val(m,'atordoa')}],src:e,salto:true});
   e.mec.salto={x0:e.x,y0:e.y,x1:a.x,y1:a.y,t:-atraso,d:aviso,voou:false}}
  else if(m.tipo==='grito'){const R=val(m,'raio');if(window.playGameSound)playGameSound('gloocGrito');for(let k=0;k<4;k++)setTimeout(()=>ring(e.x,e.y,30+k*55,'#c084fc',.7-k*.12),k*90);tremer(.5);
   // medo: o herói é empurrado para longe do chefe (update.js), mesmo parado
   if(p.dead<=0&&dist(p,e)<=R){applyFx(p,[{type:'medo',chance:100,dur:val(m,'duracao')}]);p.medoFonte=e}}
  else if(m.tipo==='giro'){e.mec.rodando={t:val(m,'duracao'),tk:.2,r:val(m,'raio')*area,pct,tick:Math.max(.2,val(m,'tick'))};e.canal={visual:{raio:Math.round(val(m,'raio')*area),cor:'#e8eef4'},ang:0,chefe:true}; /* a mesma área do Girar do herói (raio 35 × área) */if(window.playGameSound)playGameSound('giroChefe')} // o mesmo giro do herói (lâmina girando, o desenho segue a lâmina)
  e.aw=Math.min(.9,aviso*.5);e.castOnly=true;e.skillWindup=false;e.mec.conjurando=aviso;
  gritar(e,nome?nome+'!':'!');
 }
 /* ---- chamado pela IA dos monstros (update.js) enquanto o chefe persegue: true = ele usou uma mecânica agora ---- */
 function tick(e,dt,a,d){
  const mecs=lista(e);if(!mecs||!mecs.length)return false;
  if(!e.mec){e.mec={cds:mecs.map(m=>Math.max(1.5,(val(m,'cd')||10)*.45)),base:{dmg:e.dmg,ac:e.ac,spd:e.spd}}}
  const M=e.mec,v=vida(e);
  if(!M.rugiu){M.rugiu=true;gritar(e,(e.name||MONSTER_TYPES[e.ty]?.name||'Chefe')+' ruge!','#ff5a3a');ring(e.x,e.y,46,'#ff5a3a',.6);tremer(.35)}
  // fúria de fase: abaixo de X% da vida fica mais forte de vez
  const limite=+(MONSTER_TYPES[e.ty]&&MONSTER_TYPES[e.ty].furia)||+e.furiaPct||0;
  if(limite&&!M.enfurecido&&v*100<=limite){M.enfurecido=true;gritar(e,'ENFURECIDO!','#ff3b30');ring(e.x,e.y,60,'#ff3b30',.9);tremer(.5)}
  aplicarForca(e);
  for(let i=0;i<mecs.length;i++)M.cds[i]-=dt;
  // grito: cada vez que a vida cai mais cadaPct% (sem recarga)
  for(const m of mecs)if(m.tipo==='grito'){const n=Math.floor((1-v)*100/Math.max(1,val(m,'cadaPct'))+1e-6);if(n>(M.gritoN||0)){M.gritoN=n;if(!M.salto&&!(e.aw>0)){executar(e,m,a);return true}}}
  if(e.aw>0||a.dead>0||d>320||M.salto||M.rodando)return false;
  for(let i=0;i<mecs.length;i++){const m=mecs[i];if(m.tipo==='grito')continue;if(M.cds[i]>0)continue;if(m.fase&&v*100>+m.fase)continue;
   executar(e,m,a);M.cds[i]=Math.max(1,(val(m,'cd')||10)*cooldownMultiplier(e));return true}
  return false;
 }
 function aplicarForca(e){const M=e.mec,b=M.base;let k=1;if(M.enfurecido)k+=.3;if(M.furiaT>0)k+=M.furiaMais||.4;
  if(M.k!==k){M.k=k;e.dmg=Math.round(b.dmg*k);e.ac=b.ac/Math.min(1.6,k);e.spd=b.spd*(1+(k-1)*.4)}}
 function reset(e){if(!e.mec)return;const b=e.mec.base;e.dmg=b.dmg;e.ac=b.ac;e.spd=b.spd;e.mec=null}
 /* ---- fumaça, caveiras de fogo e ossos do chão ---- */
 const NUVENS=window.NUVENS_VENENO=[],CAVEIRAS=window.CAVEIRAS_FOGO=[],OSSOS=[];
 function atirarCaveira(e,ang,vel,pct){CAVEIRAS.push({x:e.x+Math.cos(ang)*8,y:e.y-8+Math.sin(ang)*8,vx:Math.cos(ang)*vel,vy:Math.sin(ang)*vel,t:0,pct,src:e,rastro:[]});if(window.playGameSound)playGameSound('magicHit')}
 const queimadura=()=>[{type:'burn',chance:100,pw:Math.max(1,Math.round(mhp()*.015)),acumulos:2}],veneno=()=>[{type:'poison',chance:100,pw:Math.max(1,Math.round(mhp()*.012)),acumulos:1}];
 function atualizarPerigos(dt){
  for(let i=NUVENS.length;i--;){const n=NUVENS[i];n.t+=dt;if(n.t>=n.dur||!n.src){NUVENS.splice(i,1);continue}
   const nx=n.x+n.vx*dt,ny=n.y+n.vy*dt;if(!bloqueiaTiro(nx,ny)){n.x=nx;n.y=ny}
   n.tick-=dt;if(n.tick<=0){n.tick=.5;if(p.dead<=0&&Math.hypot(p.x-n.x,(p.y-n.y)*1.4)<n.r)hurtP(Math.max(1,Math.round(mhp()*n.pct*.5)),true,veneno(),null,n.src)}}
  for(let i=CAVEIRAS.length;i--;){const c=CAVEIRAS[i];c.t+=dt;c.rastro.push({x:c.x,y:c.y});if(c.rastro.length>6)c.rastro.shift();c.x+=c.vx*dt;c.y+=c.vy*dt;
   if(c.t>3.5||bloqueiaTiro(c.x,c.y+8)){fxs.push({x:c.x,y:c.y+6,r:10,c:'#ff6a2a',t:0,d:.4,style:'fire'});CAVEIRAS.splice(i,1);continue}
   if(p.dead<=0&&Math.hypot(p.x-c.x,p.y-8-c.y)<8){hurtP(Math.max(1,Math.round(mhp()*c.pct)),true,queimadura(),null,c.src);fxs.push({x:c.x,y:c.y+6,r:12,c:'#ff6a2a',t:0,d:.45,style:'fire'});CAVEIRAS.splice(i,1)}}
  for(let i=OSSOS.length;i--;){OSSOS[i].t+=dt;if(OSSOS[i].t>.7)OSSOS.splice(i,1)}
  // espiral: as caveiras saem uma a uma, girando
  for(const e of en){const S=e.mec&&e.mec.espiral;if(!S||e.hp<=0){if(S)e.mec.espiral=null;continue}S.t+=dt;const passo=1.8/S.n;
   while(S.t>=passo&&S.i<S.n){S.t-=passo;atirarCaveira(e,S.ang+S.i*(6.283*S.voltas/S.n),S.vel,S.pct);S.i++}if(S.i>=S.n)e.mec.espiral=null}}
 // caveira de fogo em pixel art (1:1): crânio claro com órbitas escuras e chama atrás
 const CAVEIRA_ARTE=(()=>{const c=document.createElement('canvas');c.width=7;c.height=7;const g=c.getContext('2d'),P=(x,y,w,h,cor)=>{g.fillStyle=cor;g.fillRect(x,y,w,h)};
  P(1,0,5,1,'#3a1a10');P(0,1,7,4,'#3a1a10');P(1,5,5,2,'#3a1a10');P(1,1,5,4,'#f4ead0');P(2,5,3,1,'#d8c8a0');P(2,2,1,1,'#ff5a1a');P(4,2,1,1,'#ff5a1a');P(3,4,1,1,'#3a1a10');P(1,1,2,1,'#ffffff');return c})();
 /* ---- telégrafos: crescem até o golpe; quem estiver dentro leva o dano ---- */
 function dentro(tg,q){
  if(tg.type==='circle')return dist(q,tg)<=tg.r;
  if(tg.type==='ring'){const d=dist(q,tg);return d<=tg.r&&d>=tg.r0}
  const c=Math.cos(tg.angle),s=Math.sin(tg.angle),dx=q.x-tg.x,dy=q.y-tg.y,lx=dx*c+dy*s,ly=-dx*s+dy*c;return lx>=0&&lx<=tg.length&&Math.abs(ly)<=tg.w/2;
 }
 function impacto(tg){
  const cor=tg.type==='ring'?'#ff3b30':tg.type==='rect'?'#ff8a3a':'#ff5a3a';
  if(tg.estilo==='ossos'){}
  else if(tg.type==='rect'){for(let k=0;k<=4;k++){const f=k/4;fxs.push({x:tg.x+Math.cos(tg.angle)*tg.length*f,y:tg.y+Math.sin(tg.angle)*tg.length*f,r:tg.w*.7,c:cor,t:0,d:.45,style:'fire'})}}
  else if(tg.type==='ring'){for(let k=0;k<10;k++){const a=k/10*6.283,r=(tg.r+tg.r0)/2;fxs.push({x:tg.x+Math.cos(a)*r,y:tg.y+Math.sin(a)*r,r:(tg.r-tg.r0)*.45,c:cor,t:0,d:.5,style:'fire'})}}
  else{fxs.push({x:tg.x,y:tg.y,r:tg.r,c:cor,t:0,d:.5,style:'fire'});ring(tg.x,tg.y,tg.r,'#ffd36b',.35)}
  if(tg.estilo==='ossos')OSSOS.push({x:tg.x,y:tg.y,t:0,r:tg.r});
  tremer(tg.type==='circle'&&tg.r<40?.15:.3);if(window.playGameSound)playGameSound('magicHit');
  if(p.dead<=0&&dentro(tg,p))hurtP(tg.dmg!=null?tg.dmg:Math.max(1,Math.round(mhp()*(tg.pct||.3))),false,tg.efeitos||null,null,tg.src||null);
  // investida: o chefe atravessa a faixa
  if(tg.investida&&tg.src&&tg.src.hp>0&&!tg.src.mpProxy){const e=tg.src,L=alcanceLivre(e,tg.angle,Math.hypot(tg.x+Math.cos(tg.angle)*tg.length-e.x,tg.y+Math.sin(tg.angle)*tg.length-e.y));e.dash={x0:e.x,y0:e.y,x1:e.x+Math.cos(tg.angle)*L,y1:e.y+Math.sin(tg.angle)*L,t:0}}
 }
 function atualizar(dt){
  for(let i=TG.length;i--;){const tg=TG[i];tg.t+=dt;
   if(tg.segue&&tg.src&&tg.src.hp>0&&tg.t<tg.maxT*.6){tg.x=tg.src.x;tg.y=tg.src.y}
   if(tg.t>=tg.maxT){TG.splice(i,1);impacto(tg)}}
  atualizarPerigos(dt);atualizarPoeira(dt);
  for(const e of en){
   if(e.dash){const D=e.dash;D.t+=dt/.28;let f=Math.min(1,D.t);let x=D.x0+(D.x1-D.x0)*f,y=D.y0+(D.y1-D.y0)*f;if(livre(e,x,y)&&linhaLivre(e,{x,y})){e.x=x;e.y=y}else f=1;if(f>=1)e.dash=null;if(Math.random()<.6)fxs.push({x:e.x,y:e.y,r:10,c:'#c8a070',t:0,d:.4,style:'ring'})}
   if(e.mec){if(e.mec.furiaT>0)e.mec.furiaT-=dt;if(e.mec.conjurando>0)e.mec.conjurando-=dt;
// atordoado (ou congelado): o chefe perde o que estava preparando — avisos no chão, pulo, giro e espiral (pedido do usuário)
    const tonto=e.st&&statusSpeed(e)===0;
    if(tonto&&!e.mec.tonto){let n=0;for(let k=TG.length;k--;)if(TG[k].src===e){TG.splice(k,1);n++}
     if(n||e.mec.salto||e.mec.rodando||e.mec.espiral||e.mec.conjurando>0){ft(e.x,e.y-40,'Interrompido!','#ffd84a');ring(e.x,e.y,26,'#ffd84a',.6)}
     e.mec.salto=null;e.saltoZ=0;e.agachado=false;e.semMachado=false;e.mec.rodando=null;e.canal=null;e.mec.espiral=null;e.mec.conjurando=0;e.aw=0}
    e.mec.tonto=tonto;
    // pulo: parado (agachado) durante o aviso, depois voa até o centro da área em VOO s; terra levanta na saída e na queda
    const S=e.mec.salto;if(S){S.t+=dt;if(e.hp<=0){e.mec.salto=null;e.saltoZ=0;e.agachado=false;e.semMachado=false}else if(S.t>=0){e.dest=null;e.path=[];
     if(S.t<S.d){e.saltoZ=0;e.agachado=S.t>S.d*.6}
     else{const g=Math.min(1,(S.t-S.d)/VOO);if(!S.voou){S.voou=true;e.agachado=false;poeira(e.x,e.y,10,.7);if(window.playGameSound)playGameSound('saltoImpulso')}
      const x=S.x0+(S.x1-S.x0)*g,y=S.y0+(S.y1-S.y0)*g;if(walk(x,y)){e.x=x;e.y=y}e.saltoZ=Math.sin(Math.PI*g)*30;
      if(g>=1){e.saltoZ=0;e.mec.salto=null;e.semMachado=false;poeira(e.x,e.y,26,1.3);if(window.playGameSound)playGameSound('saltoQueda');ring(e.x,e.y,30,'#c8a070',.6)}}}}
    // giro: o mesmo do herói (lâmina girando e o desenho seguindo); bate em volta a cada tick
    const G=e.mec.rodando;if(G){G.t-=dt;if(e.canal)e.canal.ang+=dt*14;G.tk-=dt;
     if(G.tk<=0){G.tk=G.tick;if(window.playGameSound)playGameSound('giroChefe',.6);if(p.dead<=0&&dist(p,e)<=G.r+6)hurtP(Math.max(1,Math.round(mhp()*G.pct)),false,null,null,e);if(Math.random()<.5)poeira(e.x,e.y,4,.4)}
     if(G.t<=0||e.hp<=0){e.mec.rodando=null;e.canal=null}}}
  }
 }
 /* terra levantando do chão (pulo do Chefe Glooc): torrões e pó que sobem e caem, na cor do chão de terra/pedra */
 const POEIRA=[];
 function poeira(x,y,n,forca){for(let k=0;k<n;k++){const a=Math.random()*6.283,v=(20+Math.random()*50)*forca;POEIRA.push({x:x+Math.cos(a)*6,y:y+Math.sin(a)*3,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.5,z:0,vz:(40+Math.random()*70)*forca,t:0,vida:.6+Math.random()*.5,cor:['#7d6a52','#5a4a3a','#a08a6e','#8e8898'][k%4],tam:Math.random()<.3?2:1})}}
 function atualizarPoeira(dt){for(let i=POEIRA.length;i--;){const q=POEIRA[i];q.t+=dt;q.vz-=220*dt;q.z=Math.max(0,q.z+q.vz*dt);q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.96;q.vy*=.96;if(q.t>=q.vida)POEIRA.splice(i,1)}}
 /* ---- desenho no chão (ilha e DG chamam antes das entidades) ---- */
 window.desenharTelegrafos=function(){
  const tt=time;
  // auras dos chefes: roxa enquanto conjura, vermelha enfurecido
  for(const e of en){if(!e.mec||e.hp<=0)continue;const pulso=.5+.5*Math.sin(tt*8);
   if(e.mec.enfurecido||e.mec.furiaT>0){ctx.save();ctx.globalAlpha=.25+.2*pulso;ctx.fillStyle='#ff3b30';ctx.beginPath();ctx.ellipse(e.x,e.y,20+pulso*3,8+pulso,0,0,7);ctx.fill();ctx.restore()}
   if(e.mec.conjurando>0){ctx.save();ctx.globalAlpha=.35+.25*pulso;ctx.strokeStyle='#c084fc';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x,e.y,16+pulso*4,6+pulso*2,0,0,7);ctx.stroke();ctx.restore()}}
  // fumaça amarela venenosa: bolhas que mudam de forma devagar
  for(const n of NUVENS){const f=Math.min(1,n.t/.5,(n.dur-n.t)/.8);for(let k=0;k<7;k++){const a=k/7*6.283+n.sd+tt*.4,rr=n.r*(.45+.25*Math.sin(tt*1.7+k*2.1)),x=n.x+Math.cos(a)*n.r*.42,y=n.y+Math.sin(a)*n.r*.25;
   ctx.globalAlpha=.22*f;ctx.fillStyle=k%2?'#d8c83a':'#b0a028';ctx.beginPath();ctx.ellipse(x,y,rr,rr*.55,0,0,7);ctx.fill()}
   ctx.globalAlpha=.5*f;ctx.fillStyle='#f0e870';for(let k=0;k<5;k++){const q=(tt*.6+k/5)%1;ctx.fillRect(Math.round(n.x+Math.sin(k*7.3)*n.r*.6),Math.round(n.y-q*10),1,1)}ctx.globalAlpha=1}
  for(const q of POEIRA){ctx.globalAlpha=Math.min(1,(q.vida-q.t)/.25);ctx.fillStyle='rgba(0,0,0,.25)';if(q.z>2)ctx.fillRect(Math.round(q.x),Math.round(q.y),1,1);ctx.fillStyle=q.cor;ctx.fillRect(Math.round(q.x),Math.round(q.y-q.z),q.tam,q.tam)}ctx.globalAlpha=1;
  // ossos brotando do chão (Trilha de Ossos)
  for(const o of OSSOS){const q=o.t/.7,h=Math.round((q<.3?q/.3:1-(q-.3)/.7)*9);if(h<=0)continue;for(let k=0;k<4;k++){const x=Math.round(o.x+(k-1.5)*o.r*.45),y=Math.round(o.y+((k%2)*2-1)*2);
   ctx.fillStyle='#3a2e24';ctx.fillRect(x-1,y-h-1,3,h+1);ctx.fillStyle='#e9e3cf';ctx.fillRect(x,y-h,1,h);ctx.fillStyle='#fffbf0';ctx.fillRect(x,y-h,1,1)}}
  // caveiras de fogo
  for(const c of CAVEIRAS){c.rastro.forEach((r,i)=>{ctx.globalAlpha=(i+1)/c.rastro.length*.7;ctx.fillStyle=i%2?'#ffb02a':'#ff5a1a';ctx.fillRect(Math.round(r.x)-1,Math.round(r.y)-1,3,3)});ctx.globalAlpha=1;
   ctx.drawImage(CAVEIRA_ARTE,Math.round(c.x)-3,Math.round(c.y)-3)}
  // machado do Chefe Glooc voando até a área, girando (some no impacto)
  for(const tg of TG){if(!tg.machado||tg.t<0)continue;const f=Math.min(1,tg.t/tg.maxT),M=tg.machado,x=M.x0+(tg.x-M.x0)*f,y=M.y0+(tg.y-M.y0)*f-Math.sin(Math.PI*f)*26,img=window.ITEMS&&ITEMS.machado_chefe_glooc&&ITEMS.machado_chefe_glooc.c;
   ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.rotate(tt*18);if(img)ctx.drawImage(img,-img.width/2,-img.height/2);else{ctx.fillStyle='#cfd6de';ctx.fillRect(-4,-4,8,8)}ctx.restore()}
  for(const tg of TG){if(tg.t<0)continue;const f=Math.max(0,Math.min(1,tg.t/tg.maxT)),forte=f>.8?.5+.5*Math.sin(tt*30):0;
   ctx.save();ctx.lineWidth=1.5;
   const cor=tg.type==='ring'?'239,68,68':tg.type==='rect'?'249,115,22':'239,68,68';
   ctx.strokeStyle='rgba('+cor+','+(.75+.25*forte)+')';ctx.fillStyle='rgba('+cor+',.16)';
   if(tg.type==='circle'){ctx.beginPath();ctx.arc(tg.x,tg.y,tg.r,0,7);ctx.fill();ctx.stroke();ctx.fillStyle='rgba('+cor+',.38)';ctx.beginPath();ctx.arc(tg.x,tg.y,tg.r*f,0,7);ctx.fill()}
   else if(tg.type==='ring'){ctx.beginPath();ctx.arc(tg.x,tg.y,tg.r,0,7);ctx.arc(tg.x,tg.y,tg.r0,0,7,true);ctx.fill();ctx.stroke();ctx.fillStyle='rgba('+cor+',.38)';ctx.beginPath();ctx.arc(tg.x,tg.y,tg.r0+(tg.r-tg.r0)*f,0,7);ctx.arc(tg.x,tg.y,tg.r0,0,7,true);ctx.fill();
    ctx.strokeStyle='rgba(134,239,172,.8)';ctx.setLineDash([3,3]);ctx.beginPath();ctx.arc(tg.x,tg.y,tg.r0,0,7);ctx.stroke()}
   else{ctx.translate(tg.x,tg.y);ctx.rotate(tg.angle);ctx.fillRect(0,-tg.w/2,tg.length,tg.w);ctx.strokeRect(0,-tg.w/2,tg.length,tg.w);ctx.fillStyle='rgba('+cor+',.38)';ctx.fillRect(0,-tg.w/2,tg.length*f,tg.w)}
   ctx.restore();
   if(tg.label){ctx.font='bold 6px monospace';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(tg.label,tg.x+.5,tg.y-(tg.r||10)-3.5);ctx.fillStyle='#ffd36b';ctx.fillText(tg.label,tg.x,tg.y-(tg.r||10)-4)}
  }
 };
 const upd0=upd;upd=function(dt){upd0(dt);atualizar(dt)};
 window.CHEFES={tick,reset,executar,telegrafar,PADRAO,lista};
})();
