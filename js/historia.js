/* ---------- Linha da história, níveis 1 a 10 (2026-11-02, imagem do usuário) ----------
   Tutorial (3 etapas, nível 3) → 10 monstros na ilha → Carpinteiro (Saqueador, serrote, muralha, madeira mágica, portal)
   → Ferreiro e, em paralelo, a caçada do Arqueiro Caçador ao Ladino. Este arquivo cuida do que vem depois do portal:

   FERREIRO (p.historia.ferreiro)
    - preso numa jaula na Caverna dos Glooc (dg-caverna-glooc); derrotado o Glooc Chefe, a jaula abre e ele agradece:
      sem os equipamentos não pode fazer nada, melhor conversar no acampamento ('resgatado');
    - no acampamento ele não tem forja nem martelo (não dá para abrir a forja): os esqueletos invadiram a caverna e
      roubaram as ferramentas dos Glooc (fazem isso com frequência). Pede para fazer a DG dos esqueletos ('buscar');
    - na Floresta Negra, vencido o Rei Esqueleto do Covil, a forja dele e o martelo provisório estão perto do chefe:
      quem iniciou a DG pega ('recuperado'); no acampamento o ferreiro recebe, agradece e a forja abre ('pronto').

   EXPLORADOR (ARQUEIRO CAÇADOR) E LADINO (p.historia.cacada) — mecânica de história só de quem iniciou a DG (no grupo, o líder)
    - na Caverna dos Glooc, o Arqueiro Caçador (arqueiro de verde) aparece no começo (teste: 100%; depois volta a 20%): caça um Ladino que
      roubou algo dele; não diz o quê; quem ajudar aprende a usar arco ou facas de caça ('procurar');
    - depois disso, o Ladino (capuz preto) aparece na Floresta Negra (teste: 100%; depois volta a 50%) numa sala no meio da DG, como
      inimigo. Com 20% da vida ele se rende e conversa: o Arqueiro Caçador é perigoso e o item é extremamente perigoso na mão dele.
      Pegar o item → o Ladino não entrega mais nada: leve a relíquia ao Arqueiro Caçador ('pegou'); deixar com o Ladino → aprende a classe Ladino e ganha as duas Facas de Caça ('deixou');
    - com o item, o Arqueiro Caçador aparece 100% na Caverna dos Glooc: recebe a relíquia, ensina a classe Explorador e dá o
      Arco e a Aljava ('entregue'). Fim da missão: nenhum dos dois aparece de novo.
   Classe ainda não criada no jogo fica guardada em p.historia.classes e vira aprendida quando a classe existir. */
(function(){
 const h=()=>p.historia||(p.historia={});
 const salvar=()=>{if(window.saveGame)saveGame()};
 const som=(n,v)=>{if(window.playGameSound)playGameSound(n,v)};
 const E=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);

 /* ---------- visual dos NPCs: o humanoide do jogo (js/sprites.js CLASSE_VISUAL explorador/ladino) ---------- */
 const CAPA={explorador:{v:{c:['#2f7a43','#c9d98a'],st:1}},ladino:{v:{c:['#1f1a1a','#3a2a2a'],st:2}}};
 const conjuntos={};
 function conjunto(cl){if(conjuntos[cl])return conjuntos[cl];const E2={ca:CAPA[cl]},o={w:{}};
  try{for(const d of ['d','u','s','ds','us']){o[d]=human(cl,d,0,E2);o.w[d]=[human(cl,d,1,E2),human(cl,d,2,E2)]}}catch(e){return null}
  return conjuntos[cl]=o}
 const retrato=nome=>/^(Explorador|Arqueiro)/.test(nome)?()=>(conjunto('explorador')||{}).s:/^Ladino/.test(nome)?()=>(conjunto('ladino')||{}).s:null;

 /* ---------- ferreiro ---------- */
 const forjaPronta=()=>!!(typeof blacksmithSaved!=='undefined'&&blacksmithSaved)&&(h().ferreiro||'pronto')==='pronto';
 function ferreiroResgatado(){h().ferreiro='resgatado';salvar()}
 function dialogoFerreiro(){
  if(!(typeof blacksmithSaved!=='undefined'&&blacksmithSaved))return false;
  const st=h().ferreiro;if(!st||st==='pronto')return false;
  const box=$('dialogue');box.classList.remove('dgModal');
  if(st==='resgatado')box.innerHTML='<b>Ferreiro</b><p>Que bom ver você de novo, herói! Aqui no acampamento eu me sinto vivo outra vez.</p>'+
   '<p>Mas olhe para isto: não tenho a minha forja, nem o meu martelo. Sem eles não consigo forjar nada.</p>'+
   '<p>Enquanto eu estava preso, os esqueletos invadiram a caverna dos Glooc e roubaram tudo o que encontraram, inclusive as minhas ferramentas.</p>'+
   '<p>Parece que eles fazem isso com frequência: roubam os Glooc e levam tudo para a Floresta Negra, a masmorra deles.</p>'+
   '<p>Entre na Floresta Negra pelo portal e vença o Rei Esqueleto do Covil. A minha forja e o martelo provisório devem estar perto dele.</p>'+
   '<button type="button" data-hist="ferreiro-buscar">Vou recuperar as suas ferramentas</button>';
  else if(st==='buscar')box.innerHTML='<b>Ferreiro</b><p>As minhas ferramentas estão com os esqueletos, na Floresta Negra.</p><p>Vença o Rei Esqueleto do Covil e procure a forja e o martelo perto dele. Sem eles não consigo forjar nada.</p><button type="button" data-close-dialog>Estou indo</button>';
  else if(st==='recuperado')box.innerHTML='<b>Ferreiro</b><p>Minha forja! E o martelo! Você conseguiu!</p><p>Os esqueletos nem cuidaram dela... mas nada que um bom ferreiro não arrume.</p><p>Obrigado, herói. A partir de agora, a minha forja é sua também: traga dois equipamentos iguais e eu fundo os dois num só.</p><button type="button" data-hist="ferreiro-montar">Entregar a forja e o martelo</button>';
  box.classList.add('open');return true}

 // preso, o ferreiro está sem o martelo (os esqueletos levaram); a jaula de ferro dos Glooc fica na frente dele
 let preso=null;
 const spritePreso=()=>{if(preso)return preso;try{preso=human('ferreiro','d',0,{sw:{}})}catch(e){preso=null}return preso};
 function jaula(x,y,aberta){const g=ctx,t=typeof time=='number'?time:0,X=Math.round(x),Y=Math.round(y),W=22,A=32,x0=X-W/2,y0=Y-A+2;
  const ferro=['#3a3040','#5e5668','#8e8898'],R=(a,b,w,hh,c)=>{g.fillStyle=c;g.fillRect(a,b,w,hh)};
  // tampa e base, com rebites
  R(x0-1,y0-1,W+2,4,'#000');R(x0,y0,W,2,ferro[1]);R(x0,y0,W,1,ferro[2]);R(x0-1,Y-1,W+2,3,'#000');R(x0,Y,W,1,ferro[0]);
  for(const k of [2,W-3])R(x0+k,y0+1,1,1,ferro[2]);
  // grades: de frente; aberta, as da direita viram a porta para fora
  for(let i=0;i<=W;i+=4){const porta=aberta&&i>=W/2;if(porta)continue;R(x0+i-1,y0+3,3,A-5,'#000');R(x0+i,y0+3,1,A-5,ferro[1]);R(x0+i,y0+3,1,2,ferro[2])}
  if(aberta){const px=x0+W+3;for(let k=0;k<3;k++){R(px+k*3-1,y0+4+k,3,A-8-k*2,'#000');R(px+k*3,y0+4+k,1,A-8-k*2,ferro[1])}R(px-1,y0+3,10,2,'#000');R(px,y0+3,8,1,ferro[2])}
  else{R(X+3,y0+A/2-2,4,5,'#000');R(X+4,y0+A/2-1,2,3,'#d08a3a');R(X+4,y0+A/2-1,2,1,'#efc56a')} // cadeado
 }
 /* ---------- DG: qual é, quem manda na história, objetos ---------- */
 const cfgDG=()=>(window.lerDungeonConfig?lerDungeonConfig():{})||{};
 // pelo chefe da DG: Caverna dos Glooc (Glooc Chefe) ou Floresta Negra (Rei Esqueleto do Covil)
 function tipoDG(cfg=cfgDG()){const bs=(cfg.mobs||[]).filter(m=>m.isBoss||(MONSTER_TYPES[m.type]&&['boss','grandboss'].includes(MONSTER_TYPES[m.type].bossType))).map(m=>m.type);
  return bs.includes('glooc_chefe')?'glooc':bs.includes('rei_esqueleto_covil')?'ossos':null}
 const souDono=()=>!window.mpEspelho; // no grupo, só quem iniciou a DG (o líder) vê e mexe na história
 // ferreiro preso: só na Caverna dos Glooc, depois do portal e antes do resgate, para quem iniciou a DG
 function ajustarDG(cfg,bs){if(!bs)return;bs.disabled=!(tipoDG(cfg)==='glooc'&&typeof campPortalBuilt!=='undefined'&&campPortalBuilt&&!(typeof blacksmithSaved!=='undefined'&&blacksmithSaved)&&souDono());bs.jaula=true;
  // a jaula com o ferreiro fica na sala do chefe (2026-11-02, pedido do usuário)
  if(!bs.disabled){const chefe=(cfg.mobs||[]).find(m=>m.isBoss||(MONSTER_TYPES[m.type]&&['boss','grandboss'].includes(MONSTER_TYPES[m.type].bossType)));
   if(chefe){bs.x=chefe.x+42;bs.y=chefe.y+4}}}
 let objetos=[],ladino=null,alvo=null,vigia=0;
 const chefesVencidos=()=>!!(window.dungeonBossesDefeated&&dungeonBossesDefeated()); // js/dungeon.js
 let chefeVencido=false;
 const andavel=(x,y)=>typeof walk=='function'?walk(x,y):true;
 function pertoAndavel(x,y){if(andavel(x,y))return{x,y};for(let r=6;r<=60;r+=6)for(let k=0;k<12;k++){const a=k*Math.PI/6,X=x+Math.cos(a)*r,Y=y+Math.sin(a)*r;if(andavel(X,Y))return{x:X,y:Y}}return{x,y}}
 function aoEntrar(){objetos=[];ladino=null;alvo=null;chefeVencido=false;clearInterval(vigia);
  if(!souDono())return;const cfg=cfgDG(),tipo=tipoDG(cfg),H=h(),ini=cfg.playerSpawn||{x:p.x,y:p.y};
  if(tipo==='glooc'&&(H.cacada==='pegou'||!H.cacada)){const q=pertoAndavel(ini.x+34,ini.y-6);objetos.push({tipo:'explorador',x:q.x,y:q.y,nome:'Arqueiro Caçador'})} // teste: 100% de chance (antes Math.random()<.2 quando !H.cacada)
  if(tipo==='ossos'){
   const chefe=(cfg.mobs||[]).find(m=>m.isBoss||m.type==='rei_esqueleto_covil');
   if(H.ferreiro==='buscar'&&chefe){const q=pertoAndavel(chefe.x+30,chefe.y+6);objetos.push({tipo:'forja',x:q.x,y:q.y,nome:'Forja do Ferreiro'})}
   if(H.cacada==='procurar')soltarLadino(cfg,ini,chefe)} // teste: 100% de chance (antes Math.random()<.5)
  vigia=setInterval(passo,60)}
 function aoSair(){objetos=[];ladino=null;alvo=null;clearInterval(vigia)}
 /* o Ladino: numa sala no meio da DG (o monstro da DG mais perto da metade do caminho entre a entrada e o chefe) */
 function soltarLadino(cfg,ini,chefe){
  const fim=chefe||{x:ini.x+400,y:ini.y},total=Math.hypot(fim.x-ini.x,fim.y-ini.y)||1;
  const cand=(cfg.mobs||[]).filter(m=>!m.isBoss&&m.type!=='rei_esqueleto_covil').map(m=>({m,f:Math.hypot(m.x-ini.x,m.y-ini.y)/total,d:Math.hypot(m.x-fim.x,m.y-fim.y)})).filter(c=>c.d>140);
  cand.sort((a,b)=>Math.abs(a.f-.5)-Math.abs(b.f-.5));const c=cand[0];const pos=pertoAndavel(c?c.m.x+16:(ini.x+fim.x)/2,c?c.m.y:(ini.y+fim.y)/2);
  if(!MONSTER_TYPES.ladino_historia){const base=MONSTER_TYPES.sk||Object.values(MONSTER_TYPES)[0];MONSTER_TYPES.ladino_historia={...base,name:'Ladino',animation:null,direcoes:null,semArma:null,custom:false}}
  const lvl=Math.max(4,p.lvl)+1,e=spawnAt(pos.x,pos.y,'sk',lvl);e.ty='ladino_historia';e.name='Ladino';
  const conj=conjunto('ladino');if(conj){e.sp=conj;e.img=conj.d}
  e.max=Math.round(e.max*2.4);e.hp=e.max;e.delayedHp=e.max;e.dmg=Math.round(e.dmg*1.25);e.spd*=1.25;e.isDungeonMob=true;e.roamRadius=20;e.roamT=3;e.historia='ladino';
  en.push(e);ladino={e,x:pos.x,y:pos.y}}
 // a cada instante: o Ladino se rende antes de morrer (vira NPC e conversa); chegar perto de um objeto clicado abre a conversa
 function passo(){if(!window.inDungeon){aoSair();return}
  if(!chefeVencido&&chefesVencidos()){chefeVencido=true;const f=objetos.find(o=>o.tipo==='forja');if(f){ft(f.x,f.y-30,'A forja do Ferreiro!','#ffd84a');ring(f.x,f.y,30,'#ffd84a',.6)}}
  if(ladino&&ladino.e){const e=ladino.e;if(e.hp>0){ladino.x=e.x;ladino.y=e.y}
   if(e.hp<=e.max*.2){const i=en.indexOf(e);if(i>=0&&e.hp>0)en.splice(i,1);ladino.e=null;if(p.tgt===e)p.tgt=null;
    objetos.push({tipo:'ladino',x:ladino.x,y:ladino.y,nome:'Ladino'});ring(ladino.x,ladino.y,26,'#a69c94',.7);ft(ladino.x,ladino.y-34,'O Ladino se rende!','#d9d0c7');som('grito',.5);
    alvo=objetos[objetos.length-1]}}
  if(alvo&&objetos.includes(alvo)&&Math.hypot(p.x-alvo.x,p.y-alvo.y)<30){const o=alvo;alvo=null;p.dest=null;p.path=[];interagir(o)}}
 /* ---------- desenho dos objetos na DG (entram na lista ordenada por y da DG) ---------- */
 function objetosDG(L){for(const o of objetos)L.push([o.y,()=>desenhar(o)])}
 const ativo=o=>o.tipo!=='forja'||chefesVencidos();
 function desenhar(o){const t=typeof time=='number'?time:performance.now()/1000;
  if(o.tipo==='forja')desenharForja(o.x,o.y,t,ativo(o));
  else{const c=conjunto(o.tipo);if(c&&typeof dr=='function'){const s=p.x<o.x-6?c.s:c.d,fl=p.x<o.x-6?-1:1;dr(s,o.x,o.y,fl,1,{dx:0,dy:Math.round(Math.sin(t*2)*.5),sx:1,sy:1,rot:0})}}
  const sob=typeof wpos=='function'&&Math.hypot(wpos().x-o.x,wpos().y-o.y)<20;
  ctx.font='5px monospace';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText(o.nome,o.x+.4,o.y-31.6);ctx.fillStyle=o.tipo==='forja'?'#e7cb88':'#ffe28a';ctx.fillText(o.nome,o.x,o.y-32);
  if(ativo(o)){ctx.font='bold 8px monospace';ctx.fillStyle='#ffd84a';ctx.fillText('!',o.x,o.y-38+Math.round(Math.sin(t*5)*1.5))}
  if(sob){ctx.strokeStyle='#ffd84a';ctx.lineWidth=.6;ctx.beginPath();ctx.ellipse(o.x,o.y,11,4,0,0,Math.PI*2);ctx.stroke()}}
 // a forja roubada: bigorna pequena, fornalha apagada e o martelo provisório em cima (pixel art com a paleta do jogo)
 function desenharForja(x,y,t,brilha){const g=ctx,R=(a,b,w,hh,c)=>{g.fillStyle=c;g.fillRect(Math.round(x+a),Math.round(y+b),w,hh)};
  if(brilha){g.save();g.globalAlpha=.25+.1*Math.sin(t*3);g.fillStyle='#efc56a';g.beginPath();g.ellipse(x,y-6,18,10,0,0,Math.PI*2);g.fill();g.restore()}
  // fornalha (apagada, só umas brasas)
  R(2,-22,15,22,'#000');R(3,-21,13,21,'#5e5668');R(3,-21,13,2,'#8e8898');R(6,-12,7,12,'#000');R(7,-4,5,3,'#3a3040');
  if(Math.sin(t*4)>0)R(8,-3,1,1,'#e8743a');R(10,-4,1,1,'#b8402a');
  // bigorna
  R(-16,-7,17,4,'#000');R(-15,-6,15,2,'#7c8098');R(-15,-6,15,1,'#c4c8d6');R(-19,-6,4,2,'#000');R(-18,-6,3,1,'#7c8098');
  R(-11,-3,7,3,'#000');R(-10,-3,5,3,'#3e3a52');R(-13,0,11,2,'#000');R(-12,0,9,1,'#5e5668');
  // martelo provisório deitado na bigorna: pedra amarrada num cabo de madeira
  R(-14,-10,9,2,'#000');R(-13,-9,7,1,'#7d3f34');R(-7,-12,5,5,'#000');R(-6,-11,3,3,'#5e5668');R(-6,-11,3,1,'#8e8898')}
 /* ---------- clique ---------- */
 function cliqueDG(w){if(!w||!objetos.length)return false;const o=objetos.find(o=>Math.hypot(w.x-o.x,w.y-(o.y-10))<20);if(!o)return false;
  if(Math.hypot(p.x-o.x,p.y-o.y)>30){alvo=o;setDest(o.x-14,o.y+4)}else interagir(o);return true}
 function interagir(o){const box=$('dialogue');box.classList.remove('dgModal');const H=h();
  if(o.tipo==='forja'){
   if(!chefesVencidos()){ft(o.x,o.y-30,'Vença o Rei Esqueleto do Covil primeiro!','#f87171');return}
   box.innerHTML='<b>Forja do Ferreiro</b><p>Entre os despojos do Rei Esqueleto está a forja do Ferreiro, toda desmontada, e o martelo provisório dele.</p><p>Os esqueletos roubaram dos Glooc o que os Glooc tinham roubado do Ferreiro.</p><button type="button" data-hist="pegar-forja">Pegar a forja e o martelo</button>'}
  else if(o.tipo==='explorador'&&H.cacada==='pegou')
   box.innerHTML='<b>Arqueiro Caçador</b><p>Você voltou! E... está com ela. A relíquia.</p><p>O Ladino deve ter enchido a sua cabeça de histórias. Não acredite em tudo o que ouve nas masmorras.</p>'+
    '<p>Eu prometi e cumpro: vou te ensinar o que sei da vida de explorador. E fique com o meu arco e a minha aljava.</p>'+
    (contar('reliquia_roubada')?'<button type="button" data-hist="entregar">Entregar a Relíquia Roubada</button> ':'<p>(Você não está com a relíquia.)</p>')+'<button type="button" data-close-dialog>Agora não</button>';
  else if(o.tipo==='explorador')
   box.innerHTML='<b>Arqueiro Caçador</b><p>Psiu! Fale baixo... Eu estou caçando um ladino.</p><p>Ele roubou uma coisa minha. Uma coisa muito importante.</p>'+
    '<p>O quê? Isso eu não posso dizer. Quanto menos gente souber, melhor.</p>'+
    '<p>Mas se você me ajudar, eu te ensino a usar um arco... ou, se preferir, facas de caça. É só achar esse ladino: dizem que ele anda pelas masmorras dos esqueletos.</p>'+
    '<button type="button" data-hist="aceitar-cacada">Vou te ajudar a achar o Ladino</button> <button type="button" data-close-dialog>Agora não</button>';
  else if(o.tipo==='ladino')
   box.innerHTML='<b>Ladino</b><p>Chega! Chega... você venceu. O que você quer de mim?</p><p>Devolver o que eu roubei do Arqueiro Caçador? Ha! Você não sabe com quem está andando.</p>'+
    '<p>Aquele Arqueiro Caçador é perigoso. E isto que eu peguei é extremamente perigoso, ainda mais na mão dele. Eu roubei para que ele não usasse.</p>'+
    '<p>A escolha é sua: pegue, se quiser. Ou deixe comigo, e eu sumo com ela.</p>'+
    '<button type="button" data-hist="pegar-item">Pegar o item</button> <button type="button" data-hist="deixar-item">Deixar com o Ladino</button>';
  box.classList.add('open');atual=o}
 let atual=null;
 const contar=id=>typeof itemCount=='function'?itemCount(id):I.filter(s=>s&&s.id===id).reduce((a,s)=>a+(s.n||1),0);
 function tirar(id){for(let i=0;i<I.length;i++)if(I[i]&&I[i].id===id){I[i]=null;dirtyInv=true;return true}return false}
 function some(o,cor){const k=objetos.indexOf(o);if(k>=0)objetos.splice(k,1);ring(o.x,o.y,28,cor||'#a69c94',.7)}
 // classe aprendida pela história: se ainda não existe no jogo, fica guardada e vale quando ela for criada
 function aprenderClasse(id){const H=h();if(typeof CL!=='undefined'&&CL[id]){p.classProgress=p.classProgress||{};if(!p.classProgress[id])p.classProgress[id]={rank:1,xp:0}}
  else{H.classes=H.classes||[];if(!H.classes.includes(id))H.classes.push(id)}
  ft(p.x,p.y-40,'Classe aprendida: '+((typeof CL!=='undefined'&&CL[id]&&CL[id].n)||{ladino:'Ladino',explorador:'Explorador'}[id]||id)+'!','#79a35a');som('rankUp')}
 const dar=(id,q,n=1)=>{for(let k=0;k<n;k++)addItem(id,q)};
 document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-hist]');if(!b)return;const a=b.dataset.hist,H=h(),box=$('dialogue');
  const fechar=()=>{box.classList.remove('open','dgModal')};
  if(a==='ferreiro-buscar'){H.ferreiro='buscar';fechar();ft(p.x,p.y-30,'Missão: as ferramentas do Ferreiro','#ffd84a');som('quest');salvar()}
  else if(a==='ferreiro-montar'){H.ferreiro='pronto';fechar();ft(p.x,p.y-30,'A forja do Ferreiro está montada!','#ffd84a');som('quest');if(window.FORJA&&FORJA.atualizarMundo)FORJA.atualizarMundo();salvar();setTimeout(()=>{if(window.showBlacksmithDialogue)showBlacksmithDialogue()},400)}
  else if(a==='pegar-forja'){H.ferreiro='recuperado';const o=atual;fechar();if(o)some(o,'#ffd84a');ft(p.x,p.y-30,'Você pegou a forja e o martelo do Ferreiro!','#ffd84a');som('item');salvar()}
  else if(a==='aceitar-cacada'){H.cacada='procurar';const o=atual;box.innerHTML='<b>Arqueiro Caçador</b><p>Ótimo. Se encontrar o Ladino, faça ele devolver o que é meu.</p><p>Eu estarei por aí. Boa caçada.</p><button type="button" data-close-dialog>Até mais</button>';if(o)setTimeout(()=>some(o,'#79a35a'),300);ft(p.x,p.y-30,'Missão: a caçada ao Ladino','#ffd84a');som('quest');salvar()}
  else if(a==='pegar-item'){H.cacada='pegou';const o=atual;dar('reliquia_roubada'); // pegou o item: o Ladino não entrega nada além da relíquia (facas só ao deixar; a classe vem do Arqueiro Caçador na entrega)
   box.innerHTML='<b>Ladino</b><p>Que seja. Pegue logo essa coisa e suma daqui.</p><p>Só não diga que eu não avisei.</p><button type="button" data-close-dialog>Fechar</button>';if(o)setTimeout(()=>some(o,'#1f1a1a'),300);som('item');salvar()}
  else if(a==='deixar-item'){H.cacada='deixou';const o=atual;dar('faca_de_caca',60,2);aprenderClasse('ladino'); // deixar o item: aprende a classe Ladino e ganha as facas (2026-11-02, pedido do usuário)
   box.innerHTML='<b>Ladino</b><p>Sábia escolha. Você não vai se arrepender... eu acho.</p><p>Fique com estas facas de caça — e deixe eu te mostrar uns truques meus. Agora você é um de nós.</p><p>Adeus, aventureiro.</p><button type="button" data-close-dialog>Fechar</button>';if(o)setTimeout(()=>some(o,'#1f1a1a'),300);som('item');salvar()}
  else if(a==='entregar'){if(!contar('reliquia_roubada'))return;tirar('reliquia_roubada');H.cacada='entregue';const o=atual;aprenderClasse('explorador');dar('arco_explorador',60);dar('aljava_explorador',60);
   box.innerHTML='<b>Arqueiro Caçador</b><p>Finalmente... Obrigado, de verdade.</p><p>Que o arco te guie. Daqui em diante, cada um segue o seu caminho.</p><button type="button" data-close-dialog>Adeus</button>';if(o)setTimeout(()=>some(o,'#79a35a'),300);som('quest');salvar()}
  ev.stopPropagation()},true);

 /* ---------- objetivo na tela e carregar ---------- */
 function objetivo(){const H=h();if(!(typeof blacksmithSaved!=='undefined'&&blacksmithSaved))return null;
  const st=H.ferreiro||'pronto';
  if(st==='resgatado')return 'O Ferreiro está a salvo no acampamento. Fale com ele.';
  if(st==='buscar')return 'Os esqueletos roubaram a forja e o martelo do Ferreiro. Pelo portal, entre na Floresta Negra, vença o Rei Esqueleto do Covil e pegue as ferramentas perto dele.';
  if(st==='recuperado')return 'Você está com a forja e o martelo! Leve ao Ferreiro, no acampamento.';
  if(H.cacada==='procurar')return 'Caçada do Arqueiro Caçador: o Ladino anda pelas masmorras dos esqueletos (Floresta Negra). Encontre-o.';
  if(H.cacada==='pegou')return 'Leve a Relíquia Roubada ao Arqueiro Caçador, na Caverna dos Glooc.';
  return null}
 /* DG com missão da história pendente (indicador no menu do portal, js/dungeon-library.js) */
 function missaoDG(cfg){const H=h(),t=tipoDG(cfg);
  if(t==='glooc'){if(typeof campPortalBuilt!=='undefined'&&campPortalBuilt&&!(typeof blacksmithSaved!=='undefined'&&blacksmithSaved))return 'Resgatar o Ferreiro';
   if(H.cacada==='pegou')return 'Entregar a Relíquia Roubada'}
  if(t==='ossos'){if(H.ferreiro==='buscar')return 'Recuperar a forja do Ferreiro';
   if(H.cacada==='procurar')return 'Encontrar o Ladino'}
  return null}
 function aoCarregar(){const H=h();
  // save de antes desta história: quem já tinha salvado o ferreiro continua com a forja
  if(typeof blacksmithSaved!=='undefined'&&blacksmithSaved&&!H.ferreiro)H.ferreiro='pronto';
  if(Array.isArray(H.classes)&&typeof CL!=='undefined')H.classes=H.classes.filter(id=>{if(!CL[id])return true;p.classProgress=p.classProgress||{};if(!p.classProgress[id])p.classProgress[id]={rank:1,xp:0};return false})}
 // a relíquia é item de missão enquanto a entrega estiver pendente (js/state.js ITENS_MISSAO)
 if(typeof ITENS_MISSAO!=='undefined')ITENS_MISSAO.reliquia_roubada=()=>h().cacada==='pegou';
 if(window.FORJA&&FORJA.atualizarMundo)FORJA.atualizarMundo(); // o ferreiro do acampamento fica sem martelo até as ferramentas voltarem
 addEventListener('ilha-dg-entrou',aoEntrar);addEventListener('ilha-dg-saiu',aoSair);
 window.HISTORIA={h,forjaPronta,dialogoFerreiro,ferreiroResgatado,ajustarDG,spritePreso,jaula,objetosDG,cliqueDG,retrato,objetivo,aoCarregar,tipoDG,conjunto,missaoDG,
  classePendente:id=>!!(h().classes||[]).includes(id),get objetos(){return objetos},get ladino(){return ladino}};
})();
