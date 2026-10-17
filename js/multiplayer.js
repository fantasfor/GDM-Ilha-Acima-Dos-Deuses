/* ---------- Multijogador: cada um na sua ilha, visitas, grupo de DG e salas ----------
   Precisa da conta na nuvem (js/conta.js). Cada jogador está numa "sala":
    ilha:{uid}     a ilha de alguém; o dono simula os monstros
    dg:{uid}:{n}   a DG de um grupo (até 5); o líder simula os monstros
    taverna        ponto de encontro de todos, sem monstros (js/taverna.js)
   Quem não é o dono da sala fica em "espelho": vê os monstros do dono (salas/{sala}/mon),
   manda os golpes para ele (golpes) e recebe o dano que os monstros causam (danos/{uid}).
   O dono escolhe o alvo de cada monstro entre todos os jogadores da sala e avisa as mortes (mortes):
   cada um ganha a própria XP, ouro e itens. No grupo, os inimigos da DG ficam mais fortes. */
(function(){
 if(MODO.teste||MODO.motor||!window.CONTA_ATIVA)return;
 const MAX_GRUPO=5,MAX_ILHA=4,PUB_MS=100,CONVITE_S=90,APOIO_MS=15000;
 // por jogador extra no grupo: +60% de vida e +15% de dano para os inimigos da DG
 const ESCALA_VIDA=.6,ESCALA_DANO=.15;
 const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e};
 const btn=(text,fn,cls)=>{const b=el('button',cls||'mpBtn',text);b.type='button';b.onclick=fn;return b};
 let N=null,db=null,uid=null;
 const MP=window.MP={
  sala:null,visitando:null,dgSala:null,tamanhoGrupo:1,
  grupoLider:null,grupo:null,remotos:new Map(),nomes:new Map(),
  nomeDe:id=>MP.nomes.get(id)||'Aventureiro'
 };
 const ref=path=>db.ref(path);
 const hostDe=s=>!s||s==='taverna'?null:s.split(':')[1];
 const souHost=()=>!!uid&&hostDe(MP.sala)===uid;
 const outros=()=>window.ONLINE_NUVEM?ONLINE_NUVEM.outros:new Map();
 function aviso(texto,cor){ft(p.x,p.y-30,texto,cor||'#ffd84a');if(window.onlineSystem)onlineSystem(texto)}

 /* ---------- sala atual ---------- */
 function salaAtual(){
  if(window.inTaverna)return 'taverna';
  if(window.inDungeon)return MP.dgSala||('dg:'+uid+':solo');
  return 'ilha:'+(MP.visitando||uid);
 }
 MP.salaAtual=()=>MP.sala||(uid?salaAtual():null);
 /* jogadores (outros) que estão na mesma sala, com posição e estado */
 function atualizarRemotos(){
  const vistos=new Set();
  for(const [id,o] of outros()){
   if(o.name)MP.nomes.set(id,o.name);
   if(id===uid||o.sala!==MP.sala||o.x==null)continue;
   vistos.add(id);
   let r=MP.remotos.get(id);if(!r){r={uid:id,remote:true,st:null};MP.remotos.set(id,r)}
   r.x=o.x;r.y=o.y;r.dead=!!o.dead;r.hp=o.hp;r.name=o.name;r.lvl=o.lvl;
  }
  for(const id of [...MP.remotos.keys()])if(!vistos.has(id))MP.remotos.delete(id);
 }
 MP.pertoDeAlguem=(x,y,r)=>{for(const o of MP.remotos.values())if(!o.dead&&Math.hypot(o.x-x,o.y-y)<=r)return true;return false};

 /* ---------- alvo dos monstros (só o dono da sala decide) ---------- */
 MP.alvoDe=e=>{
  if(!souHost()||!MP.remotos.size)return p;
  let best=p.dead<=0?p:null,bd=best?dist(e,p):Infinity;
  for(const r of MP.remotos.values()){if(r.dead)continue;const d=dist(e,r);if(d<bd){bd=d;best=r}}
  // mantém o alvo atual enquanto ele não ficar bem mais longe que o mais próximo
  const cur=e.mpAlvo,valido=cur&&(cur===p?p.dead<=0:MP.remotos.get(cur.uid)===cur&&!cur.dead);
  if(valido&&cur!==best&&dist(e,cur)<bd*1.4+12)best=cur;
  e.mpAlvo=best||p;return e.mpAlvo;
 };
 const limparFx=fx=>Array.isArray(fx)?fx.map(f=>({type:f.type,chance:f.chance,dur:f.dur,pw:Math.round((f.pw||0)*100)/100})):null;
 MP.ferirRemoto=(alvo,d,magic,fx,dot,atacante)=>{
  if(!souHost()||!alvo||!alvo.uid)return;
  const dano=d&&typeof d==='object'?{physical:Math.round(+d.physical||0),magic:Math.round(+d.magic||0)}:Math.round(+d||0);
  ref('salas/'+MP.sala+'/danos/'+alvo.uid).push({d:dano,m:magic?1:0,fx:limparFx(fx),a:atacante&&atacante.mpId||null});
 };

 /* ---------- dono da sala: ids, escala do grupo e envio dos monstros ---------- */
 let seq=0,enviadoMon=new Map(),ultimoPub=0,publicando=false,portasEnviadas='';
 function prepararMonstros(){
  for(const e of en){
   if(e.mpId)continue;
   e.mpId=(window.inDungeon?'w':'i')+(++seq).toString(36);
   escalar(e);
  }
 }
 // aplica a escala do tamanho atual do grupo a partir dos valores originais (pode subir e descer durante a DG)
 function escalar(e){
  const n=window.inDungeon?MP.tamanhoGrupo:1;if((e.mpEscala||1)===n)return;
  if(!e.mpBase)e.mpBase={max:e.max,dmg:e.dmg,wm:e.weaponDamageMultiplier||1,wb:e.weaponDamageBase};
  const b=e.mpBase,kv=1+ESCALA_VIDA*(n-1),kd=1+ESCALA_DANO*(n-1),parte=e.max>0?e.hp/e.max:1;
  e.max=Math.round(b.max*kv);e.hp=Math.round(e.max*parte);if(e.delayedHp!=null)e.delayedHp=e.hp;
  e.dmg=Math.round(b.dmg*kd);e.weaponDamageMultiplier=b.wm*kd;
  if(b.wb!=null)e.weaponDamageBase=Math.round(b.wb*kd);
  e.mpEscala=n;
 }
 MP.escalaTexto=n=>n>1?'+'+Math.round(ESCALA_VIDA*100*(n-1))+'% de vida e +'+Math.round(ESCALA_DANO*100*(n-1))+'% de dano':'dificuldade normal';
 const codificar=e=>[e.ty,e.lvl||1,Math.round(e.x),Math.round(e.y),Math.max(0,Math.ceil(e.hp)),Math.round(monsterMaxHp(e)),
  (e.elite?1:0)|(e.boss?2:0)|(e.aw>0?4:0),Math.sign(Math.round(e.fx||0)),e.dungeonRoomId==null?'':e.dungeonRoomId].join('|');
 function publicar(agora){
  if(!souHost()){publicando=false;return}
  prepararMonstros();
  const temGente=MP.remotos.size>0;
  if(!temGente){publicando=false;return}
  if(agora-ultimoPub<PUB_MS)return;ultimoPub=agora;
  const base='salas/'+MP.sala;
  if(!publicando){
   // alguém chegou: manda o estado completo
   publicando=true;enviadoMon=new Map();portasEnviadas='';estadoEnviado='';
   const tudo={};for(const e of en)if(e.mpId&&!e.gone&&e.hp>0){const s=codificar(e);tudo[e.mpId]=s;enviadoMon.set(e.mpId,s)}
   ref(base+'/mon').set(tudo);
  }else{
   const mudou={},vivos=new Set();
   for(const e of en){if(!e.mpId||e.gone||e.hp<=0)continue;vivos.add(e.mpId);const s=codificar(e);if(enviadoMon.get(e.mpId)!==s){mudou[e.mpId]=s;enviadoMon.set(e.mpId,s)}}
   for(const id of [...enviadoMon.keys()])if(!vivos.has(id)){mudou[id]=null;enviadoMon.delete(id)}
   if(Object.keys(mudou).length)ref(base+'/mon').update(mudou);
  }
  if(MP.sala==='ilha:'+uid){const est=JSON.stringify(lerIlha());if(est!==estadoEnviado){estadoEnviado=est;ref(base+'/estado').set(est).catch(()=>{estadoEnviado=''})}}
  if(window.inDungeon&&window.DUNGEON_DOORS){
   const abertas=DUNGEON_DOORS.map((d,i)=>d.opened?i:-1).filter(i=>i>=0).join(',');
   if(abertas!==portasEnviadas){portasEnviadas=abertas;ref(base+'/portas').set(abertas||'-')}
  }
 }
 /* ---- progresso da ilha: quem visita vê a ilha como o dono a deixou (paliçada, portal, carpinteiro, ferreiro...) ----
    O dono publica salas/ilha:{uid}/estado; quem visita guarda o próprio progresso e o devolve ao voltar para casa.
    Enquanto visita, o salvamento usa o progresso guardado (window.ilhaParaSalvar, em ui.js). */
 const lerIlha=()=>({questDone,carpenterHelped,sawQuestActive,sawObtained,woodQuestActive,wallBuilt,magicWoodQuestActive,campPortalBuilt,campPortalTheme,blacksmithSaved,gateOpen:CAMP_WALL.gateOpen});
 function aplicarIlha(v){
  questDone=!!v.questDone;carpenterHelped=!!v.carpenterHelped;sawQuestActive=!!v.sawQuestActive;sawObtained=!!v.sawObtained;
  woodQuestActive=!!v.woodQuestActive;wallBuilt=!!v.wallBuilt;magicWoodQuestActive=!!v.magicWoodQuestActive;campPortalBuilt=!!v.campPortalBuilt;
  campPortalTheme=typeof v.campPortalTheme==='string'?v.campPortalTheme:'normal';blacksmithSaved=!!v.blacksmithSaved;window.blacksmithSaved=blacksmithSaved;
  CAMP_WALL.gateOpen=v.gateOpen!==false;
  try{placeCarpenter();placeBlacksmith();syncCampWall()}catch(e){console.warn('Ilha visitada:',e)}
 }
 let ilhaPropria=null,estadoEnviado='';
 window.ilhaParaSalvar=()=>ilhaPropria;
 function restaurarIlha(){if(ilhaPropria){const v=ilhaPropria;ilhaPropria=null;aplicarIlha(v)}}
 function receberIlha(s){
  let v=null;try{v=JSON.parse(s.val()||'null')}catch(e){}
  if(!v||!MP.visitando)return;
  if(!ilhaPropria)ilhaPropria=lerIlha();
  aplicarIlha(v);
 }
 // só o dono mexe no carpinteiro, no ferreiro, no portão e no portal da ilha
 MP.soDono=()=>{if(!MP.visitando||window.inDungeon||window.inTaverna)return false;aviso('Só o dono da ilha pode fazer isso.','#c0ae91');return true};

 /* ---- participação e divisão da recompensa ----
    Na ilha, XP e ouro de cada monstro são divididos em partes iguais entre quem participou da batalha:
    quem causou dano ou aplicou efeito nele, e quem usou cura/bênção/proteção nos últimos 15 s.
    Na DG do grupo, cada um recebe a recompensa inteira. */
 const apoios=new Map();
 MP.participou=e=>{if(souHost())(e.mpQuem||(e.mpQuem=new Set())).add(uid)};
 MP.apoiou=()=>{
  if(!uid||!MP.sala||MP.sala==='taverna')return;
  if(souHost())apoios.set(uid,Date.now());
  else if(hostDe(MP.sala))ref('salas/'+MP.sala+'/apoio').push({de:uid,t:firebase.database.ServerValue.TIMESTAMP});
 };
 MP.parte=e=>e.mpParte==null?1:e.mpParte;
 MP.morreu=e=>{
  if(!souHost())return; // quem visita já recebeu a sua parte no aviso de morte do dono
  if(!e.mpId||!MP.remotos.size){e.mpParte=1;return}
  const ilha=MP.sala.startsWith('ilha:');let quem=[uid,...MP.remotos.keys()];
  if(ilha){
   const s=new Set(e.mpQuem||[]),agora=Date.now();
   for(const [u,t] of apoios)if(agora-t<APOIO_MS&&(u===uid||MP.remotos.has(u)))s.add(u);
   if(!s.size)s.add(uid);
   quem=[...s];
  }
  const n=ilha?quem.length:1;
  e.mpParte=quem.includes(uid)?1/n:0;
  // XP e ouro vão com o aviso: valem os do monstro do dono (nível, elite e escala do grupo)
  ref('salas/'+MP.sala+'/mortes').push({id:e.mpId,quem,n,xp:Math.round(e.xp||0),g:Math.round(e.g||0),t:firebase.database.ServerValue.TIMESTAMP});
 };
 MP.telegrafo=tg=>{
  if(!souHost()||!MP.remotos.size)return;
  ref('salas/'+MP.sala+'/tg').push({type:tg.type,x:Math.round(tg.x),y:Math.round(tg.y),r:tg.r||0,angle:tg.angle||0,w:tg.w||0,length:tg.length||0,atraso:tg.t||0,maxT:tg.maxT,pct:tg.pct||.5,label:tg.label||'',src:tg.source&&tg.source.mpId||null,t:firebase.database.ServerValue.TIMESTAMP});
 };
 function receberGolpe(g){
  const e=en.find(q=>q.mpId===g.id);if(!e||e.hp<=0||!(g.d>0))return;
  e.hp-=Math.min(g.d,100000);e.hit=.15;ft(e.x,e.y-22,Math.round(g.d),'#9fe3ff');
  const autor=MP.remotos.get(g.de);if(autor){e.mpAlvo=autor;e.alert=8}
  (e.mpQuem||(e.mpQuem=new Set())).add(g.de);
  if(Array.isArray(g.fx)&&e.hp>0)applyFx(e,g.fx.filter(f=>f&&FX_INFO[f.type]).map(f=>({...f,caster:e,self:false})));
  if(e.hp<=0)killMonster(e);
 }

 /* ---------- quem visita: monstros espelhados ---------- */
 const proxies=new Map();let entrouEm=0;
 function criarProxy(id,ty,lvl,x,y,flags){
  let e=en.find(q=>q.mpId===id&&!q.gone&&q.hp>0);
  if(!e){
   if(!MONSTER_TYPES[ty])ty='sl';
   e=spawnAt(x,y,ty,lvl);
   if(ty==='boss'&&SP.sk){e.img=SP.sk.d;e.sp=SP.sk;e.boss=true}
   if(flags&1)makeElite(e);
   if(flags&2)e.boss=true;
   if(window.inDungeon)e.isDungeonMob=true;
   e.mpId=id;en.push(e);
  }
  e.mpProxy=true;e.dest=null;e.path=[];proxies.set(id,e);return e;
 }
 function aplicarMon(id,s){
  if(typeof s!=='string')return removerProxy(id);
  const [ty,lvl,x,y,hp,max,flags,fx,room]=s.split('|'),f=+flags||0;
  let e=proxies.get(id);
  if(e&&(e.gone||!en.includes(e))){proxies.delete(id);e=null}
  if(!e)e=criarProxy(id,ty,+lvl||1,+x,+y,f);
  e.mpTx=+x;e.mpTy=+y;e.max=Math.max(1,+max||1);e.lvl=+lvl||e.lvl;
  if(+hp>0&&e.hp>0)e.hp=+hp;
  e.aw=f&4?.2:0;if(+fx)e.fx=+fx;
  if(room!=='')e.dungeonRoomId=room;
 }
 function removerProxy(id){const e=proxies.get(id);if(!e)return;proxies.delete(id);if(e.hp>0){e.hp=0;e.gone=1}}
 MP.moverProxy=(e,dt)=>{
  if(e.mpTx==null)return;
  const dx=e.mpTx-e.x,dy=e.mpTy-e.y,d=Math.hypot(dx,dy);
  if(d>80){e.x=e.mpTx;e.y=e.mpTy;return}
  if(d>.3){const k=Math.min(1,dt*10);e.x+=dx*k;e.y+=dy*k;e.fx=dx;e.fy=dy;e.mov=.2}
  e.hit-=dt;
 };
 MP.golpe=(e,d,fx)=>{
  if(!e.mpId||!MP.sala)return;
  ref('salas/'+MP.sala+'/golpes').push({de:uid,id:e.mpId,d:Math.round(d),fx:limparFx(fx)});
 };
 function receberMorte(m){
  const e=proxies.get(m.id)||en.find(q=>q.mpId===m.id);if(!e||e.mpRecompensado)return;
  e.mpRecompensado=true;e.hp=0;
  // quem não participou da batalha não ganha nada desse monstro
  const quem=m.quem&&typeof m.quem==='object'?Object.values(m.quem):null;
  if(quem&&!quem.includes(uid)){e.gone=1;if(p.tgt===e)p.tgt=null;return}
  if(Number.isFinite(m.xp))e.xp=m.xp;if(Number.isFinite(m.g))e.g=m.g;
  e.mpParte=1/Math.max(1,m.n||1);killMonster(e);
 }
 function receberDano(d){
  if(p.dead>0)return;
  const atacante=d.a?en.find(q=>q.mpId===d.a)||null:null;
  const fx=Array.isArray(d.fx)?d.fx.filter(f=>f&&FX_INFO[f.type]).map(f=>({...f,caster:atacante||p,self:false})):null;
  hurtP(d.d,!!d.m,fx,null,atacante);
 }
 function receberTelegrafo(tg){
  if(!window.inDungeon||!window.bossTelegraphs)return;
  if(Date.now()+(N.offset||0)-(tg.t||0)>3000)return;
  bossTelegraphs.push({type:tg.type,x:tg.x,y:tg.y,r:tg.r,angle:tg.angle,w:tg.w,length:tg.length,t:tg.atraso||0,maxT:tg.maxT||1.5,pct:tg.pct,label:tg.label,source:tg.src&&en.find(q=>q.mpId===tg.src)||null});
 }
 function receberPortas(s){
  if(!window.inDungeon||!window.DUNGEON_DOORS||typeof s!=='string')return;
  const abertas=new Set(s.split(',').filter(Boolean).map(Number));
  DUNGEON_DOORS.forEach((door,i)=>{if(abertas.has(i)&&!door.opened){door.opened=true;if(door.wasLocked){ring(door.x,door.y,30,'#4ade80',.7);ft(door.x,door.y-18,'PORTA ABERTA!','#4ade80')}}});
 }

 /* ---------- troca de sala ---------- */
 let ouvintes=[];
 const ouvir=(r,ev,fn)=>{r.on(ev,fn);ouvintes.push(()=>r.off(ev,fn))};
 function trocarSala(antiga,nova){
  ouvintes.forEach(f=>f());ouvintes=[];proxies.clear();
  if(window.mpEspelho||hostDe(nova)&&hostDe(nova)!==uid)for(const e of en)if(e.mpId&&e.mpProxy)proxies.set(e.mpId,e);
  if(antiga&&hostDe(antiga)===uid)ref('salas/'+antiga).remove().catch(()=>{});
  publicando=false;enviadoMon=new Map();MP.remotos.clear();apoios.clear();
  MP.sala=nova;entrouEm=Date.now();
  const host=hostDe(nova),base='salas/'+nova;
  window.mpEspelho=!!host&&host!==uid;
  if(host===uid){
   ref(base).onDisconnect().remove();
   ouvir(ref(base+'/golpes'),'child_added',s=>{const g=s.val();s.ref.remove().catch(()=>{});if(g)receberGolpe(g)});
   ouvir(ref(base+'/apoio'),'child_added',s=>{const a=s.val();s.ref.remove().catch(()=>{});if(a&&a.de)apoios.set(a.de,Date.now())});
  }else if(host){
   ouvir(ref(base+'/mon'),'child_added',s=>aplicarMon(s.key,s.val()));
   ouvir(ref(base+'/mon'),'child_changed',s=>aplicarMon(s.key,s.val()));
   ouvir(ref(base+'/mon'),'child_removed',s=>removerProxy(s.key));
   // só as mortes que aconteceram depois de chegar à sala dão recompensa
   ouvir(ref(base+'/mortes'),'child_added',s=>{const m=s.val();if(m&&(m.t||0)>=entrouEm+(N.offset||0)-3000)receberMorte(m)});
   ouvir(ref(base+'/tg'),'child_added',s=>{const tg=s.val();if(tg)receberTelegrafo(tg)});
   ouvir(ref(base+'/portas'),'value',s=>receberPortas(s.val()));
   if(nova.startsWith('ilha:'))ouvir(ref(base+'/estado'),'value',receberIlha);
   ouvir(ref(base+'/danos/'+uid),'child_added',s=>{const d=s.val();s.ref.remove().catch(()=>{});if(d)receberDano(d)});
   // na primeira lista completa do dono, somem os monstros locais que ele já não tem
   // (ex.: voltou para a DG depois de morrer e alguns já tinham sido derrotados)
   const listaRef=ref(base+'/mon'),conferir=s=>{
    const v=s.val();if(!v)return;listaRef.off('value',conferir);
    for(const e of en)if(e.mpId&&e.mpProxy&&!(e.mpId in v)&&MP.sala===nova){e.hp=0;e.gone=1;proxies.delete(e.mpId)}
   };
   ouvir(listaRef,'value',conferir);
  }
  window.dispatchEvent(new CustomEvent('mp-sala',{detail:{sala:nova,antiga}}));
  atualizarPainel();
 }
 // o dono limpa mortes e telegrafos antigos para a sala não crescer
 setInterval(()=>{if(!souHost()||!MP.remotos.size)return;const base='salas/'+MP.sala;
  const lim=Date.now()+(N.offset||0)-8000;
  for(const k of ['mortes','tg'])ref(base+'/'+k).limitToFirst(40).get().then(s=>s.forEach(c=>{if(((c.val()||{}).t||0)<lim)c.ref.remove().catch(()=>{})})).catch(()=>{})},6000);

 function tick(){
  if(!uid)return;
  const nova=salaAtual();
  if(nova!==MP.sala)trocarSala(MP.sala,nova);
  atualizarRemotos();
  publicar(performance.now());
  // o dono da ilha visitada saiu dela: volta para casa
  if(MP.visitando){const dono=outros().get(MP.visitando);if(!dono||dono.sala!=='ilha:'+MP.visitando){if(!(MP.semDono>0))MP.semDono=performance.now();else if(performance.now()-MP.semDono>4000){MP.semDono=0;voltarParaCasa('O dono saiu da ilha.')}}else MP.semDono=0}
  // líder na DG: a dificuldade acompanha quantos do grupo estão lá dentro agora
  if(window.inDungeon&&MP.dgSala&&hostDe(MP.dgSala)===uid){
   const n=Math.min(MAX_GRUPO,1+MP.remotos.size);
   if(n!==MP.tamanhoGrupo){MP.tamanhoGrupo=n;en.forEach(e=>{if(!e.mpProxy)escalar(e)});
    if(MP.grupoLider===uid&&MP.grupo&&MP.grupo.dg)ref('grupos/'+uid+'/dg/n').set(n).catch(()=>{});
    aviso(n>1?n+' na masmorra: inimigos com '+MP.escalaTexto(n)+'.':'Sozinho na masmorra: dificuldade normal.','#f0a52e')}
  }
  // o líder saiu da DG: o grupo volta
  if(window.inDungeon&&MP.dgSala&&hostDe(MP.dgSala)!==uid){const g=MP.grupo;if(!g||!g.dg||g.dg.sala!==MP.dgSala){if(!(MP.semLider>0))MP.semLider=performance.now();else if(performance.now()-MP.semLider>3000){MP.semLider=0;aviso('O líder saiu da masmorra.','#f87171');exitDungeon(true)}}else MP.semLider=0}
 }

 /* ---------- visitar ilhas ---------- */
 let enLocal=null;
 // quantas pessoas estão na ilha de alguém agora (dono incluído, se estiver nela)
 const pessoasNaIlha=dono=>[...outros()].filter(([id,o])=>id!==uid&&o.sala==='ilha:'+dono).length+(MP.sala==='ilha:'+dono?1:0);
 function visitar(dono){
  if(dono===uid)return voltarParaCasa();
  if(MP.visitando===dono)return;
  if(pessoasNaIlha(dono)>=MAX_ILHA){aviso('A ilha de '+MP.nomeDe(dono)+' está cheia ('+MAX_ILHA+'/'+MAX_ILHA+').','#f87171');return}
  if(window.inDungeon)exitDungeon(true);
  if(window.sairTaverna&&window.inTaverna)sairTaverna(true);
  if(!MP.visitando){enLocal=en.splice(0,en.length)}else{en.length=0}
  MP.visitando=dono;
  const o=outros().get(dono);
  const alvo=o&&o.x!=null?snapWalk(o.x+18,o.y+10,false):{x:CX,y:CY+34};
  p.x=alvo.x;p.y=alvo.y;p.dest=null;p.path=[];p.tgt=null;
  aviso('Ilha de '+MP.nomeDe(dono),'#9fe3ff');
  tick();
 }
 function voltarParaCasa(motivo){
  if(!MP.visitando)return;
  MP.visitando=null;en.length=0;if(enLocal)en.push(...enLocal);enLocal=null;window.mpEspelho=false;restaurarIlha();
  p.x=CX;p.y=CY+34;p.dest=null;p.path=[];p.tgt=null;
  aviso(motivo?motivo+' De volta à sua ilha.':'De volta à sua ilha.','#9fe3ff');
  tick();
 }
 MP.voltarParaCasa=voltarParaCasa;MP.visitar=visitar;
 // sair da taverna ou da DG leva para a própria ilha
 MP.antesDeSair=()=>{if(MP.visitando)voltarParaCasa()};

 /* ---------- DG: o líder abre a sala; os membros entram como espelho ---------- */
 let entrandoComoMembro=false;
 window.addEventListener('ilha-dg-entrou',()=>{
  if(!uid)return;
  if(entrandoComoMembro){
   entrandoComoMembro=false;window.mpEspelho=true;
   // os monstros fixos que este jogador criou só acompanham os do líder (não atacam por conta própria)
   en.forEach((e,i)=>{e.mpId='m'+i;e.mpProxy=true;e.mpTx=e.x;e.mpTy=e.y;proxies.set(e.mpId,e)});
   tick();return;
  }
  else{
   // a DG sempre tem sala própria: dá para chamar o grupo depois de entrar. A dificuldade começa normal
   // e sobe conforme os membros chegam (tick).
   MP.tamanhoGrupo=1;MP.dgSala='dg:'+uid+':'+Date.now().toString(36);
   window.mpEspelho=false;
   if(MP.grupoLider===uid&&MP.grupo)publicarDgDoGrupo();
  }
  // ids iguais para os monstros fixos da DG (mesma ordem em todos os jogadores)
  en.forEach((e,i)=>{e.mpId='m'+i;escalar(e)});
  tick();
 });
 window.addEventListener('ilha-dg-saiu',()=>{
  const eraLider=MP.dgSala&&hostDe(MP.dgSala)===uid;
  MP.dgSala=null;MP.tamanhoGrupo=1;window.mpEspelho=false;proxies.clear();
  if(eraLider)ref('grupos/'+uid+'/dg').remove().catch(()=>{});
 });
 // o líder avisa o grupo da DG em que está (os membros recebem o convite para entrar)
 function publicarDgDoGrupo(){
  if(!window.inDungeon||!MP.dgSala||hostDe(MP.dgSala)!==uid)return;
  ref('grupos/'+uid+'/dg').set({id:String(window.currentDungeonId||''),sala:MP.dgSala,n:MP.tamanhoGrupo,nome:(window.getActiveDungeonConfig&&getActiveDungeonConfig().name)||'Masmorra'}).catch(()=>{});
 }
 function entrarDgDoGrupo(){
  const g=MP.grupo;if(!g||!g.dg)return;
  if(window.inDungeon){if(MP.dgSala===g.dg.sala)return;exitDungeon(true)}
  if(MP.visitando)voltarParaCasa();
  if(window.inTaverna&&window.sairTaverna)sairTaverna(true);
  window.currentDungeonId=g.dg.id;MP.dgSala=g.dg.sala;MP.tamanhoGrupo=g.dg.n||2;
  entrandoComoMembro=true;window.mpEspelho=true;
  enterGoblinDungeon();
  if(!window.inDungeon){entrandoComoMembro=false;window.mpEspelho=false;MP.dgSala=null}
 }
 MP.entrarDgDoGrupo=entrarDgDoGrupo;
 /* para o menu do portal (dungeon-library.js): o grupo atual e quem dá para chamar */
 MP.grupoDg=()=>{
  const g=MP.grupo,membros=g&&g.membros?Object.entries(g.membros).map(([id,nome])=>({id,nome:typeof nome==='string'?nome:MP.nomeDe(id),lider:id===MP.grupoLider,voce:id===uid})):[{id:uid,nome:N?N.nome():'Você',lider:true,voce:true}];
  return{membros,max:MAX_GRUPO,podeConvidar:!MP.grupoLider||MP.grupoLider===uid,cheio:membros.length>=MAX_GRUPO};
 };
 MP.candidatosDg=()=>{
  const g=MP.grupo,lista=[];
  for(const [id,o] of outros()){if(id===uid||o.x==null||!o.sala||(g&&g.membros&&g.membros[id]))continue;lista.push({id,nome:o.name||MP.nomeDe(id),nivel:o.lvl||1,amigo:!!MP.amigos[id],onde:onde(Object.assign({id},o))})}
  return lista.sort((a,b)=>b.amigo-a.amigo||a.nome.localeCompare(b.nome));
 };

 /* ---------- grupo ---------- */
 let grupoOff=null;
 function seguirGrupo(lider){
  if(grupoOff){grupoOff();grupoOff=null}
  MP.grupoLider=lider;MP.grupo=null;
  window.dispatchEvent(new CustomEvent('mp-grupo',{detail:{lider}})); // a voz passa para a sala do grupo (js/voz.js)
  if(!lider){atualizarPainel();return}
  try{localStorage.setItem('ilha-rpg-grupo',lider)}catch(e){}
  const r=ref('grupos/'+lider);let anterior=null;
  const fn=s=>{
   const g=s.val();
   if(!g||!g.membros||!g.membros[uid]){
    if(MP.grupo&&lider!==uid)aviso('O grupo acabou ou você saiu dele.','#c0ae91');
    try{localStorage.removeItem('ilha-rpg-grupo')}catch(e){}
    seguirGrupo(null);return;
   }
   MP.grupo=g;for(const [id,nome] of Object.entries(g.membros))if(typeof nome==='string')MP.nomes.set(id,nome);
   // grupo montado com o líder já dentro da DG: anuncia a DG para os membros entrarem
   if(lider===uid&&!g.dg&&window.inDungeon)publicarDgDoGrupo();
   const dg=g.dg&&g.dg.sala;
   if(lider!==uid&&dg&&dg!==anterior&&!(window.inDungeon&&MP.dgSala===dg))convidarDg(g);
   anterior=dg||null;atualizarPainel();
  };
  r.on('value',fn);grupoOff=()=>r.off('value',fn);
 }
 function criarGrupo(){
  if(MP.grupoLider)return Promise.resolve();
  const membros={[uid]:N.nome()};
  return ref('grupos/'+uid).set({lider:uid,membros}).then(()=>{ref('grupos/'+uid).onDisconnect().remove();seguirGrupo(uid)});
 }
 function sairDoGrupo(){
  const lider=MP.grupoLider;if(!lider)return;
  if(lider===uid)ref('grupos/'+uid).remove();else ref('grupos/'+lider+'/membros/'+uid).remove();
  seguirGrupo(null);
 }
 MP.sairDoGrupo=sairDoGrupo;

 /* ---------- convites ---------- */
 async function convidar(para,tipo){
  if(para===uid)return;
  if(tipo==='ilha'&&pessoasNaIlha(uid)>=MAX_ILHA){aviso('Sua ilha já tem '+MAX_ILHA+' pessoas.','#f87171');return}
  if(tipo==='amizade'&&MP.amigos[para]){aviso(MP.nomeDe(para)+' já é seu amigo.','#c0ae91');return}
  if(tipo==='grupo'){
   if(MP.grupoLider&&MP.grupoLider!==uid){aviso('Só o líder do grupo convida.','#f87171');return}
   await criarGrupo();
   if(Object.keys((MP.grupo&&MP.grupo.membros)||{}).length>=MAX_GRUPO){aviso('O grupo já tem '+MAX_GRUPO+' jogadores.','#f87171');return}
  }
  await ref('convites/'+para+'/'+uid).set({tipo,nome:N.nome(),t:firebase.database.ServerValue.TIMESTAMP});
  aviso('Convite enviado para '+MP.nomeDe(para)+'.','#9fe3ff');
 }
 MP.convidar=convidar;
 const toasts=el('div','mpToasts');document.body.append(toasts);
 function toast(texto,acoes,ms){
  const t=el('div','mpToast');t.append(el('span','',texto));
  const fechar=()=>t.remove();
  for(const [rotulo,fn,cls] of acoes)t.append(btn(rotulo,()=>{fechar();fn&&fn()},cls));
  toasts.append(t);if(ms)setTimeout(fechar,ms);return t;
 }
 /* ---------- correio: solicitações pendentes (convites/{eu}/{quem enviou}) ----------
    Chegam como aviso no topo e ficam no Correio até aceitar, recusar ou vencer:
    amizade vale 7 dias; convite de ilha ou de grupo, 10 minutos. */
 const VALIDADE={amizade:7*86400000,ilha:600000,grupo:600000};
 const pendentes=new Map(); // de -> {tipo,nome,t,toast}
 const TEXTO={ilha:n=>n+' convidou você para a ilha dele(a).',amizade:n=>n+' quer ser seu amigo.',grupo:n=>n+' convidou você para o grupo.'};
 const ROTULO_ACEITAR={ilha:'Ir',amizade:'Aceitar',grupo:'Entrar'};
 const vencido=c=>Date.now()+(N.offset||0)-(c.t||0)>(VALIDADE[c.tipo]||CONVITE_S*1000);
 function recusarConvite(de){const c=pendentes.get(de);if(c&&c.toast)c.toast.remove();pendentes.delete(de);ref('convites/'+uid+'/'+de).remove().catch(()=>{});atualizarCorreio()}
 // as regras do banco só deixam entrar no grupo / virar amigo enquanto o convite existe: age primeiro, apaga depois
 async function aceitarConvite(de){
  const c=pendentes.get(de);if(!c)return;
  if(c.toast)c.toast.remove();pendentes.delete(de);atualizarCorreio();
  try{await executarConvite(de,c)}finally{ref('convites/'+uid+'/'+de).remove().catch(()=>{})}
 }
 async function executarConvite(de,c){
  if(c.tipo==='ilha')visitar(de);
  else if(c.tipo==='amizade'){
   try{await ref().update({['amigos/'+uid+'/'+de]:c.nome,['amigos/'+de+'/'+uid]:N.nome()});aviso('Agora você e '+c.nome+' são amigos.','#9fe3ff')}
   catch(e){aviso('Não foi possível aceitar a amizade.','#f87171')}
  }else if(c.tipo==='grupo'){
   if(MP.grupoLider&&MP.grupoLider!==de)sairDoGrupo();
   try{await ref('grupos/'+de+'/membros/'+uid).set(N.nome());seguirGrupo(de);aviso('Você entrou no grupo de '+c.nome+'.','#9fe3ff')}
   catch(e){aviso('Não foi possível entrar: o grupo está cheio ou acabou.','#f87171')}
  }
 }
 function receberConvite(s){
  const de=s.key,c=s.val();if(!c||!c.tipo||!TEXTO[c.tipo])return;
  if(vencido(c)){s.ref.remove().catch(()=>{});return}
  MP.nomes.set(de,c.nome);
  const antigo=pendentes.get(de);if(antigo&&antigo.toast)antigo.toast.remove();
  const item={tipo:c.tipo,nome:c.nome,t:c.t};pendentes.set(de,item);
  // o aviso some sozinho; a solicitação continua no Correio
  item.toast=toast(TEXTO[c.tipo](c.nome),[[ROTULO_ACEITAR[c.tipo],()=>aceitarConvite(de),'mpBtn ok'],['Recusar',()=>recusarConvite(de)],['Depois',null]],CONVITE_S*1000);
  atualizarCorreio();if(window.playGameSound)playGameSound('quest',.5);
 }
 const correio=el('section','mpPainel mpCorreio');correio.hidden=true;correio.setAttribute('aria-label','Correio');
 correio.addEventListener('keydown',e=>e.stopPropagation());document.body.append(correio);
 const correioBtn=btn('Correio',()=>{correio.hidden=!correio.hidden;if(!correio.hidden)painel.hidden=true;atualizarCorreio()},'mpBtn mpAbrir mpCorreioBtn');correioBtn.title='Correio: pedidos de amizade e convites de ilha e de grupo';
 MP.botaoCorreio=correioBtn;MP.fecharCorreio=()=>{correio.hidden=true};
 function atualizarCorreio(){
  for(const [de,c] of pendentes)if(vencido(c)){if(c.toast)c.toast.remove();pendentes.delete(de);ref('convites/'+uid+'/'+de).remove().catch(()=>{})}
  const n=pendentes.size;correioBtn.textContent=n?'Correio ('+n+')':'Correio';correioBtn.classList.toggle('temCorreio',n>0);
  if(correio.hidden)return;
  const box=[];const h=el('div','mpTopo');h.append(el('b','','Correio'),btn('Fechar',()=>{correio.hidden=true}));box.push(h);
  const ul=el('ul','mpLista');
  const lista=[...pendentes].sort((a,b)=>(b[1].t||0)-(a[1].t||0));
  if(!lista.length)ul.append(el('li','mpNota','Nenhuma solicitação. Pedidos de amizade e convites de ilha e de grupo aparecem aqui.'));
  for(const [de,c] of lista){
   const li=el('li');li.append(el('span','mpNome',TEXTO[c.tipo](c.nome)));
   const resta=(VALIDADE[c.tipo]-(Date.now()+(N.offset||0)-(c.t||0)))/60000;
   li.append(el('small','',c.tipo==='amizade'?'Pedido de amizade':'Vence em '+Math.max(1,Math.ceil(resta))+' min'));
   const acoes=el('div','mpAcoes');acoes.append(btn(ROTULO_ACEITAR[c.tipo],()=>aceitarConvite(de),'mpBtn ok'),btn('Recusar',()=>recusarConvite(de),'mpBtn perigo'));
   li.append(acoes);ul.append(li);
  }
  box.push(ul);correio.replaceChildren(...box);
 }
 MP.correio={aceitar:aceitarConvite,recusar:recusarConvite,get pendentes(){return [...pendentes.keys()]}};
 setInterval(atualizarCorreio,5000);
 let toastDg=null;
 function convidarDg(g){
  if(toastDg)toastDg.remove();
  toastDg=toast('Seu grupo entrou na masmorra '+(g.dg.nome||'')+'.',[['Entrar',entrarDgDoGrupo,'mpBtn ok'],['Depois',null]],60000);
 }
 // o aviso some quando o jogador já está na DG do grupo (ou ela acabou)
 setInterval(()=>{if(toastDg&&toastDg.isConnected&&(!MP.grupo||!MP.grupo.dg||window.inDungeon&&MP.dgSala===MP.grupo.dg.sala)){toastDg.remove();toastDg=null}},500);

 /* ---------- amigos e sussurros ----------
    amigos/{uid}/{amigo} = nome (a amizade é aceita pelos dois lados)
    sussurros/{para}/{id} = mensagem privada; quem recebe apaga ao ler (chega mesmo se estava offline) */
 const TS=()=>firebase.database.ServerValue.TIMESTAMP;
 MP.amigos={};MP.ultimoSussurro=null;
 const linha=m=>{if(window.onlineLinha)onlineLinha(m)};
 function removerAmigo(id){ref().update({['amigos/'+uid+'/'+id]:null,['amigos/'+id+'/'+uid]:null}).catch(()=>{})}
 MP.sussurrar=(para,text)=>{
  text=String(text||'').trim().slice(0,140);if(!text||!para||para===uid)return false;
  const key=ref('sussurros/'+para).push().key;
  ref().update({['sussurros/'+para+'/'+key]:{de:uid,nome:N.nome(),text,t:TS()},['ultimaMsg/'+uid]:TS()})
   .then(()=>linha({canal:'s',id:uid,name:'para '+MP.nomeDe(para),text,t:Math.round(Date.now()/1000)}))
   .catch(()=>window.onlineSystem&&onlineSystem('Sussurro não enviado: espere um instante entre mensagens.'));
  return true;
 };
 // "/s Nome mensagem": procura o nome conhecido (online ou amigo) mais longo no começo do texto
 MP.resolverSussurro=texto=>{
  const conhecidos=new Map();
  for(const [id,o] of outros())if(id!==uid&&o.name)conhecidos.set(id,o.name);
  for(const [id,nome] of Object.entries(MP.amigos))if(typeof nome==='string'&&!conhecidos.has(id))conhecidos.set(id,nome);
  const t=texto.toLowerCase();let melhor=null;
  for(const [id,nome] of conhecidos){const n=nome.toLowerCase();if((t===n||t.startsWith(n+' '))&&(!melhor||n.length>melhor.nome.length))melhor={id,nome}}
  return melhor?{id:melhor.id,msg:texto.slice(melhor.nome.length).trim()}:null;
 };
 const abrirSussurro=id=>{if(window.abrirChatCom)abrirChatCom('/s '+MP.nomeDe(id)+' ')};

 /* ---------- painel: jogadores online, amigos, grupo e ilha ---------- */
 const painel=el('section','mpPainel');painel.hidden=true;painel.setAttribute('aria-label','Jogadores');
 painel.addEventListener('keydown',e=>e.stopPropagation());
 document.body.append(painel);
 const abrirBtn=btn('Jogadores',()=>{painel.hidden=!painel.hidden;if(!painel.hidden&&window.MP&&MP.fecharCorreio)MP.fecharCorreio();atualizarPainel()},'mpBtn mpAbrir');abrirBtn.title='Jogadores online, grupo e convites';
 MP.botaoPainel=abrirBtn;
 addEventListener('keydown',e=>{if(window.TECLAS&&TECLAS.acao(e)==='jogadores'){painel.hidden=!painel.hidden;atualizarPainel()}});
 function onde(o){
  if(!o||!o.sala)return '';
  if(o.sala==='taverna')return 'na taverna';
  if(o.sala.startsWith('dg:'))return 'numa masmorra';
  const dono=hostDe(o.sala);return dono===o.id||dono===o.uid?'na própria ilha':'na ilha de '+MP.nomeDe(dono);
 }
 // ping de quem está no mesmo lugar (chega junto com a posição)
 function pingDe(nome,o){
  if(!o||!(o.ping>0)||o.sala!==MP.sala)return;
  const c=window.REDE?REDE.cor(o.ping):'';nome.append(el('small','mpPing '+c,o.ping+' ms'));
 }
 function atualizarPainel(){
  if(painel.hidden)return;
  const box=[];
  const h=el('div','mpTopo');h.append(el('b','','Jogadores'),btn('Fechar',()=>{painel.hidden=true}));box.push(h);
  // situação atual
  const aqui=el('div','mpAqui');
  aqui.append(el('span','',window.inTaverna?'Você está na taverna.':MP.visitando?'Você está na ilha de '+MP.nomeDe(MP.visitando)+'.':window.inDungeon?'Você está numa masmorra.':'Você está na sua ilha.'));
  if(MP.visitando)aqui.append(btn('Voltar para minha ilha',()=>voltarParaCasa()));
  box.push(aqui);
  // grupo
  const g=MP.grupo,gr=el('div','mpGrupo');
  if(g&&g.membros){
   gr.append(el('b','','Grupo ('+Object.keys(g.membros).length+'/'+MAX_GRUPO+')'+(MP.grupoLider===uid?' · você é o líder':'')));
   const ul=el('ul');for(const [id,nome] of Object.entries(g.membros)){const li=el('li','',(id===MP.grupoLider?'[líder] ':'')+(typeof nome==='string'?nome:MP.nomeDe(id))+(id===uid?' (você)':''));ul.append(li)}
   gr.append(ul);
   if(g.dg&&MP.grupoLider!==uid&&!(window.inDungeon&&MP.dgSala===g.dg.sala))gr.append(btn('Entrar na DG do grupo',entrarDgDoGrupo,'mpBtn ok'));
   if(MP.grupoLider===uid)gr.append(el('p','mpNota','Abra o portal do acampamento e entre numa DG: o grupo recebe o convite para entrar junto.'));
   gr.append(btn(MP.grupoLider===uid?'Desfazer grupo':'Sair do grupo',sairDoGrupo,'mpBtn perigo'));
  }else gr.append(el('p','mpNota','Sem grupo. Convide alguém abaixo para montar um grupo de DG (até '+MAX_GRUPO+').'));
  box.push(gr);
  // amigos (online primeiro)
  const ids=Object.keys(MP.amigos),online=id=>{const o=outros().get(id);return !!(o&&o.x!=null&&o.sala)};
  ids.sort((a,b)=>online(b)-online(a)||MP.nomeDe(a).localeCompare(MP.nomeDe(b)));
  const ula=el('ul','mpLista');
  if(!ids.length)ula.append(el('li','mpNota','Nenhum amigo ainda. Use "Adicionar amigo" em quem está online.'));
  for(const id of ids){
   const o=outros().get(id),on=online(id);
   const li=el('li',on?'':'offline');
   const nm=el('span','mpNome',(typeof MP.amigos[id]==='string'?MP.amigos[id]:MP.nomeDe(id))+(on?' · Nv '+(o.lvl||1):''));if(on)pingDe(nm,o);
   li.append(nm,el('small','',on?onde(Object.assign({id},o)):'offline'));
   const acoes=el('div','mpAcoes');
   if(on&&o.sala==='ilha:'+id&&MP.visitando!==id)acoes.append(btn('Visitar',()=>visitar(id),'mpBtn ok'));
   if(on&&o.sala==='taverna'&&!window.inTaverna&&window.entrarTaverna)acoes.append(btn('Ir à taverna',()=>entrarTaverna(),'mpBtn ok'));
   if(on&&!(g&&g.membros&&g.membros[id])&&!(MP.grupoLider&&MP.grupoLider!==uid))acoes.append(btn('Convidar p/ grupo',()=>convidar(id,'grupo')));
   if(on&&o.sala!=='ilha:'+uid)acoes.append(btn('Convidar p/ ilha',()=>convidar(id,'ilha')));
   acoes.append(btn('Sussurrar',()=>abrirSussurro(id)));
   acoes.append(btn('Remover',()=>{if(confirm('Remover '+MP.nomeDe(id)+' dos amigos?'))removerAmigo(id)},'mpBtn perigo'));
   li.append(acoes);ula.append(li);
  }
  box.push(el('b','mpSub','Amigos ('+ids.filter(online).length+'/'+ids.length+' online)'),ula);
  // lista de jogadores
  const lista=el('ul','mpLista');let n=0;
  for(const [id,o] of outros()){
   if(id===uid||o.x==null)continue;n++;
   const nm=el('span','mpNome',(o.name||'?')+' · Nv '+(o.lvl||1)+(MP.amigos[id]?' · amigo':''));pingDe(nm,o);
   const li=el('li');li.append(nm,el('small','',onde(Object.assign({id},o))));
   const acoes=el('div','mpAcoes');
   if(o.sala!=='ilha:'+uid)acoes.append(btn('Convidar p/ ilha',()=>convidar(id,'ilha')));
   if(!(g&&g.membros&&g.membros[id])&&!(MP.grupoLider&&MP.grupoLider!==uid))acoes.append(btn('Convidar p/ grupo',()=>convidar(id,'grupo')));
   if(!MP.amigos[id])acoes.append(btn('Adicionar amigo',()=>convidar(id,'amizade')));
   acoes.append(btn('Sussurrar',()=>abrirSussurro(id)));
   li.append(acoes);lista.append(li);
  }
  if(!n)lista.append(el('li','mpNota','Ninguém mais online agora.'));
  box.push(el('b','mpSub','Online ('+n+')'),lista);
  painel.replaceChildren(...box);
 }
 MP.atualizarPainel=atualizarPainel;
 setInterval(()=>{if(!painel.hidden)atualizarPainel()},2000);

 /* ---------- início: depois do login ---------- */
 function iniciar(){
  N=window.NUVEM;db=N.db;uid=N.uid;
  const caixa=ref('convites/'+uid);
  caixa.on('child_added',receberConvite);caixa.on('child_changed',receberConvite);
  caixa.on('child_removed',s=>{const c=pendentes.get(s.key);if(c){if(c.toast)c.toast.remove();pendentes.delete(s.key);atualizarCorreio()}});
  ref('amigos/'+uid).on('value',s=>{MP.amigos=s.val()||{};for(const [id,n] of Object.entries(MP.amigos))if(typeof n==='string'&&!MP.nomes.has(id))MP.nomes.set(id,n);atualizarPainel()});
  ref('sussurros/'+uid).on('child_added',s=>{
   const m=s.val();s.ref.remove().catch(()=>{});
   if(!m||typeof m.text!=='string'||Date.now()+(N.offset||0)-(m.t||0)>86400000)return;
   MP.nomes.set(m.de,m.nome);MP.ultimoSussurro=m.de;
   linha({canal:'s',id:m.de,name:m.nome,text:m.text.slice(0,140),t:Math.round((m.t||Date.now())/1000)});
  });
  // ajuda nas batalhas: curas, bênçãos e proteções contam como participação (divisão de XP e ouro na ilha)
  // lancar (combat.js) é quando a habilidade sai de fato (na hora ou no fim da conjuração)
  const cast0=lancar;
  lancar=function(s){const t0=s.t,r=cast0.apply(this,arguments);if(s.t>t0&&!window.inTaverna&&window.tipoHabilidade&&tipoHabilidade(s)!=='impacto')MP.apoiou();return r};
  // volta ao grupo depois de recarregar a página (se ainda for membro)
  let salvo=null;try{salvo=localStorage.getItem('ilha-rpg-grupo')}catch(e){}
  if(salvo)ref('grupos/'+salvo+'/membros/'+uid).get().then(s=>{if(s.exists())seguirGrupo(salvo);else try{localStorage.removeItem('ilha-rpg-grupo')}catch(e){}}).catch(()=>{});
  setInterval(tick,100);tick();
 }
 if(window.NUVEM)iniciar();else window.addEventListener('nuvem-pronta',iniciar,{once:true});
})();
