/* ---------- Painel de Classes (2026-10-31, pedido do usuário) ----------
   Botão "Classes" (tecla L). Janela que ocupa a tela toda com a árvore de classes de cima para baixo, como o desenho
   do usuário: cada classe com o ícone e o nome ao lado, setas mostrando de onde vem cada uma e as que precisam de
   duas (Paladino: Bárbaro + Oráculo; Bardo: Curador + Explorador). Por enquanto só Guerreiro, Curador (Curandeiro)
   e Mago existem no jogo; as outras aparecem só visualmente ("Em breve") — ARVORE/LIGA guardam o desenho.
   - Classe aprendida (vencida com o Mestre na taverna): clique abre a ficha — personagem, rank e XP, atributos,
     passivas e habilidades (com palavras-chave clicáveis que abrem a Enciclopédia) — e o botão para trocar para ela.
   - Classe que ainda não é sua: diz como aprender (ou de quais classes ela vem).
   Ícones 16×16 em pixel art com as cores da paleta (js/ui.js iconeFiltro: a aço, w madeira, g ouro, r sangue,
   b água, m magia, f folha, # linho, k vão escuro; maiúscula = brilho). Arrastar move a árvore; a rodinha desce. */
(function(){
 if(typeof MODO!=='undefined'&&MODO.motor)return;
 const E=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
 const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

 /* ---- a árvore do desenho: posição (coluna, linha) e quem libera quem ---- */
 const ARVORE=[
  {k:'war',n:'Guerreiro',c:0,l:0},{k:'lanceiro',n:'Lanceiro',c:0,l:1},{k:'cavaleiro',n:'Cavaleiro',c:0,l:2},{k:'gladiador',n:'Gladiador',c:0,l:3},{k:'campeao',n:'Campeão',c:0,l:4},
  {k:'centuriao',n:'Centurião',c:1,l:3},{k:'legiao',n:'Legião',c:1,l:4},
  {k:'barbaro',n:'Bárbaro',c:2,l:1},{k:'paladino',n:'Paladino',c:2,l:2},{k:'templario',n:'Templário',c:2,l:3},
  {k:'hea',n:'Curador',c:3,l:0},{k:'oraculo',n:'Oráculo',c:3,l:2},{k:'bardo',n:'Bardo',c:4,l:1},
  {k:'explorador',n:'Explorador',c:5.5,l:0},{k:'arqueiro',n:'Arqueiro',c:5,l:1},{k:'ladino',n:'Ladino',c:6,l:1},
  {k:'mestre_ladino',n:'Mestre Ladino',c:6,l:2},{k:'assassino',n:'Assassino',c:6,l:3},{k:'assassino_fantasma',n:'Assassino Fantasma',c:6,l:4},
  {k:'mercenario',n:'Mercenário das Sombras',c:7,l:1.6},{k:'assassino_b',n:'Assassino',ic:'assassino',c:7,l:2.6},
  {k:'mag',n:'Mago',c:7,l:0}]; // no desenho o Mago fica sozinho à direita; aqui no canto de cima, para caber na tela
 const LIGA=[['war','lanceiro'],['lanceiro','cavaleiro'],['cavaleiro','gladiador'],['gladiador','campeao'],['cavaleiro','centuriao'],['centuriao','legiao'],
  ['war','barbaro'],['barbaro','paladino'],['oraculo','paladino'],['paladino','templario'],
  ['hea','oraculo'],['hea','bardo'],['explorador','bardo'],['explorador','arqueiro'],['explorador','ladino'],
  ['ladino','mestre_ladino'],['mestre_ladino','assassino'],['assassino','assassino_fantasma'],['ladino','mercenario']];
 const NO=Object.fromEntries(ARVORE.map(o=>[o.k,o])),PAIS=k=>LIGA.filter(([,b])=>b===k).map(([a])=>NO[a]);
 const COL=172,LIN=112,NW=160,NH=60,MARGEM=20; // tamanho da grade e do botão de cada classe

 /* ---- ícones (16×16, pixel art) ---- */
 const ICONES={
  war:["...........aa...","..........aaa...",".gggggggggaag....",".gaaaaaaaaag.....",".gaaaarraaaag....",".gaaaarraaaag....",".garrrrrrrrag....",".garrrrrrrrag....",".gaaaarraaaag....",".gaaaarraaaag....","..gaaarraaag.....","...gaaaaaag......","..w.gaaaag.......",".ww..gggg........","gw..............","g..............."],
  mag:["..........mm....","........mmm.....",".......mmm......","......mmmm......",".....mmmmmm.....",".....mmmgmm.....","....mmmgggmm....","....mmmmgmmm....","...mmmmmmmmmm...","...gggggggggg...","mmmmmmmmmmmmmmmm",".mmmmmmmmmmmmmm."],
  hea:[".....ffff.......",".....fFff.......",".....ffff.......",".ffffffffffff...",".fFffffffffff...",".ffffffffffff...",".ffffffffffff...",".....ffff.......",".....ffff..g....",".....ffff.ggg...",".....ffff..g....",".....ffff......."],
  // lança com fita vermelha
  lanceiro:["...........aa","..........aAa",".........aaa.","........raa..",".......rrww..","........ww...",".......ww....","......ww.....",".....ww......","....ww.......","...ww........","..ww.........",".ww.........."],
  // elmo de cavaleiro com pluma
  cavaleiro:["...rr...","..rrrr..","...rr...",".aaaaaa.","aaaaaaaa","aAaaaaaa","akkkkkka","aaaakaaa","aaaakaaa",".aaaaaa.","..aaaa.."],
  // tridente
  gladiador:["a...a...a","a...a...a","aa..a..aa",".aaaaaaa.","....w....","....w....","....w....","....w....","....w....","...ggg...","....w...."],
  // troféu de ouro
  campeao:[".gggggggg.","g.gggggg.g","g.gGgggg.g",".gggggggg.","..gggggg..","...gggg...","....gg....","....gg....","...gggg...","..wwwwww..","..wwwwww.."],
  // elmo romano com crista atravessada
  centuriao:["rrrrrrrrrr",".rrrrrrrr.","...aaaa...","..aaaaaa..",".aaaaaaaa.",".aakkkkaa.",".aak..kaa.",".aa....aa.",".aa....aa.","..a....a.."],
  // estandarte da legião
  legiao:["...ggg...","..g.g.g..","....g....",".rrrwrrr.",".rrrwrrr.",".rgrwrgr.",".rrrwrrr.","..r.w.r..","....w....","....w....","....w...."],
  // machado de duas lâminas
  barbaro:[".aa.....aa.","aaaa...aaaa","aaaaawaaaaa","aaaaawaaaaa","aaaa.w.aaaa",".aa..w..aa.",".....w.....",".....w.....",".....w.....",".....w.....","....www...."],
  // escudo claro com cruz de ouro
  paladino:["#########","####g####","####g####","#ggggggg#","####g####","####g####",".###g###.","..##g##..","...###...","....#...."],
  // elmo fechado com a cruz vermelha
  templario:["..######..",".########.","####rr####","####rr####","#rrrrrrrr#","#kkkrrkkk#","####rr####","####rr####",".###rr###.","..######.."],
  // olho que tudo vê
  oraculo:["...mmmmm...",".mm#####mm.","m###bbb###m","m##bBkbb##m","m###bbb###m",".mm#####mm.","...mmmmm..."],
  // alaúde
  bardo:["........ww",".......ww.","......ww..",".....ww...","..wwwww...",".wwwkwww..","wwwkkkwww.","wwwwkwwww.","wwwwwwwww.",".wwwwwww..","..wwwww..."],
  // bússola
  explorador:["...gggg...",".gg####gg.",".g##rr##g.","g###rr###g","g####k###g","g###bb###g",".g##bb##g.",".gg####gg.","...gggg..."],
  // arco com flecha
  arqueiro:[".ww......","w.#......","w.#......","w.#......","wgwwwwwaa","w.#......","w.#......","w.#......",".ww......"],
  // adaga
  ladino:["........a",".......aA","......aa.",".....aa..","..g.aa...","...ga....","...wg....","..w..g...",".w......."],
  // duas adagas cruzadas
  mestre_ladino:["a.......a",".a.....a.","..a...a..","...a.a...","....g....","...g.g...","..w...w..",".w.....w.","w.......w"],
  // capuz com olhos vermelhos
  assassino:["....mm....","...mmmm...","..mmmmmm..",".mmkkkkmm.",".mkrkkrkm.",".mkkkkkkm.","mmmkkkkmmm","mmmmmmmmmm","mmmmmmmmmm"],
  // fantasma
  assassino_fantasma:["...####...","..######..",".########.",".#kk##kk#.",".########.",".###kk###.",".########.",".########.",".#.##.##.#"],
  // máscara e moeda
  mercenario:[".mmmmmmmm.","mmmmmmmmmm","mkkmmmmkkm","mmmmmmmmmm",".mmmmmmmm.","..mmmmmm..","..........","...gggg...","..gggggg..","..ggGggg..","...gggg..."],
  futura:["....######....","..##kkkkkk##..",".#kkk####kkk#.",".#kk##kk##kk#.","#kkkkkkk##kkk#","#kkkkkk##kkkk#","#kkkkk##kkkkk#","#kkkkk##kkkkk#",".#kkkkkkkkkk#.",".#kkkk##kkkk#.","..##kk##kk##..","....######...."]};
 const cache={};
 function icone(id){if(cache[id])return cache[id];const no=NO[id],rows=ICONES[no&&no.ic||id]||ICONES[CL[id]&&CL[id].base]||ICONES.futura;
  let c=null;try{c=typeof iconeFiltro=='function'?iconeFiltro(rows):null}catch(e){}return cache[id]=c?c.toDataURL():''}
 window.ICONE_CLASSE=icone; // a enciclopédia usa nos títulos das classes

 const existe=k=>!!(CL[k]&&CL[k].n);
 const prog=id=>p.classProgress&&p.classProgress[id];
 const raw=id=>(GAMEDATA.classes||[]).find(c=>c.id==id)||{};
 const nomeDe=k=>existe(k)?CL[k].n:(NO[k]&&NO[k].n)||k;
 const defPassiva=id=>(GAMEDATA.passives||[]).find(x=>x.id==id)||(GAMEDATA.skills||[]).find(x=>x.id==id)||{};
 /* ícone da passiva pelo que ela dá (defesa = escudo, vida = cruz, mana = orbe, dano = lâmina, vel. de ataque = giro,
    movimento = investida, atributos = explosão), nas cores da paleta; o ícone escolhido na Engine (icon) vale primeiro */
 const ICONE_POR=[[['arm'],'shield','#7c8098','#c4c8d6'],[['magicArm'],'shield','#7a3ca8','#b07ad8'],[['hp'],'cross','#a22b4b','#cf4554'],[['mp','regenMp'],'orb','#3d5a8c','#6e9cc4'],
  [['dmg'],'blade','#a22b4b','#efc56a'],[['attackSpeed'],'spin','#d08a3a','#efc56a'],[['moveSpeed','spd'],'dash','#3f6b45','#79a35a'],[['F','A','I'],'burst','#9a5a2a','#efc56a']];
 function icoPassiva(d){d=d||{};let k=d.icon,a=d.c1,b=d.c2;
  if(!k){const r=ICONE_POR.find(([ks])=>ks.some(x=>+d[x]||(d.stats&&+d.stats[x])))||ICONE_POR[0];k=r[1];a=a||r[2];b=b||r[3]}
  try{const v=SKI(k,a||'#4a6a96',b||'#e7cb88');return typeof v=='string'?v:v&&v.toDataURL?v.toDataURL():''}catch(e){return''}}
 window.ICONE_PASSIVA=icoPassiva; // a enciclopédia usa o mesmo
 // palavras-chave (nomes de efeitos, habilidades, passivas…) viram links que abrem a ficha na Enciclopédia
 const linkar=html=>window.CODEX?CODEX.linkar(html):html;

 /* ---- botão e janela ---- */
 const col=document.getElementById('sbtns');
 const btn=E('button','','Classes');btn.id='classesBtn';btn.type='button';btn.title='Classes: árvore, fichas e troca de classe (L)';btn.dataset.key='L';
 if(col)col.append(btn);else document.body.append(btn);
 const box=E('section');box.id='painelClasses';box.setAttribute('role','dialog');box.setAttribute('aria-label','Classes');box.hidden=true;document.body.append(box);
 btn.onclick=e=>{e.stopPropagation();box.hidden?abrir():fechar()};
 addEventListener('keydown',e=>{if(window.TECLAS&&TECLAS.acao(e)=='classes'&&!e.target.closest('input,textarea,select')){box.hidden?abrir():fechar()}}); // tecla L (Controles)
 let ficha=null,arrasto=null;
 function abrir(){box.hidden=false;ficha=null;desenhar()}
 function fechar(){box.hidden=true;if(typeof tipEl!='undefined')tipEl.style.display='none'}
 addEventListener('keydown',e=>{if(box.hidden||e.key!=='Escape')return;if(ficha){ficha=null;desenhar()}else fechar();e.stopImmediatePropagation()},true);
 // link de palavra-chave dentro da ficha: abre a Enciclopédia por cima
 box.addEventListener('click',e=>{const a=e.target.closest('.cx-link');if(!a)return;e.preventDefault();e.stopPropagation();if(window.CODEX)CODEX.abrir(a.dataset.ref)});
 window.PAINEL_CLASSES={abrir,fechar,get aberto(){return!box.hidden}};
 function aviso(t){const m=box.querySelector('.pcAviso');if(!m)return;m.textContent=t;m.classList.add('on');clearTimeout(aviso.t);aviso.t=setTimeout(()=>m.classList.remove('on'),3600)}

 function desenhar(){
  box.replaceChildren();
  const topo=E('div','pcTopo');topo.append(E('h3','','Classes'),E('span','pcAtual','Atual: <b>'+esc(CL[p.cls]&&CL[p.cls].n||'—')+'</b> · rank '+((prog(p.cls)||{}).rank||1)));
  const leg=E('div','pcLegenda','<span><i class="atual"></i>atual</span><span><i class="livre"></i>aprendida</span><span><i class="bloq"></i>ainda não é sua</span><span><i class="futura"></i>em breve</span>');
  const x=E('button','pcX','✕');x.type='button';x.setAttribute('aria-label','Fechar');x.onclick=fechar;topo.append(leg,x);
  box.append(topo);
  if(ficha){box.append(fichaClasse(ficha),E('p','pcAviso'));return}
  box.append(arvore(),E('p','pcDica','Arraste para mover a árvore · as setas mostram de onde vem cada classe · as que recebem duas setas precisam das duas · clique numa classe sua para ver a ficha e trocar'),E('p','pcAviso'));
 }

 /* ---- árvore: botões posicionados na grade e as setas num SVG por baixo ---- */
 function arvore(){
  const cols=Math.max(...ARVORE.map(o=>o.c))+1,lins=Math.max(...ARVORE.map(o=>o.l))+1;
  const W=Math.ceil(MARGEM*2+(cols-1)*COL+NW),H=Math.ceil(MARGEM*2+(lins-1)*LIN+NH);
  const pos=o=>({x:MARGEM+o.c*COL,y:MARGEM+o.l*LIN});
  const view=E('div','pcView'),mapa=E('div','pcMapa');mapa.style.width=W+'px';mapa.style.height=H+'px';
  // setas: do lado do pai que olha para o filho até o lado do filho, com ponta
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('width',W);svg.setAttribute('height',H);svg.setAttribute('class','pcSetas');
  svg.innerHTML='<defs><marker id="pcPonta" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#a69c94"/></marker><marker id="pcPontaOn" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#e7cb88"/></marker></defs>';
  const borda=(o,dx,dy)=>{const P=pos(o),cx=P.x+NW/2,cy=P.y+NH/2,k=Math.min(Math.abs((NW/2+3)/(dx||1e-9)),Math.abs((NH/2+3)/(dy||1e-9)));return[cx+dx*k,cy+dy*k]};
  for(const [a,b] of LIGA){const A=NO[a],B=NO[b],PA=pos(A),PB=pos(B),dx=(PB.x+NW/2)-(PA.x+NW/2),dy=(PB.y+NH/2)-(PA.y+NH/2);
   const [x1,y1]=borda(A,dx,dy),[x2,y2]=borda(B,-dx,-dy),on=!!prog(a)&&existe(b);
   const l=document.createElementNS('http://www.w3.org/2000/svg','line');l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',x2);l.setAttribute('y2',y2);
   l.setAttribute('class','pcSeta2'+(on?' on':''));l.setAttribute('marker-end','url(#'+(on?'pcPontaOn':'pcPonta')+')');svg.append(l)}
  mapa.append(svg);
  for(const o of ARVORE){const P=pos(o),ex=existe(o.k),pr=ex&&prog(o.k),atual=o.k===p.cls,pais=PAIS(o.k);
   const est=atual?'atual':pr?'livre':ex?'bloq':'futura';
   const sub=atual?'Atual · rank '+pr.rank:pr?'Rank '+pr.rank+' · ver ficha':ex?'Não aprendida':pais.length>1?pais.map(x=>x.n).join(' + '):'Em breve';
   const b=E('button','pcNo '+est+(pais.length>1?' duplo':''));b.type='button';b.style.left=P.x+'px';b.style.top=P.y+'px';
   b.append(E('span','pcIco','<img src="'+icone(o.k)+'" alt="">'),E('span','pcTxt','<b>'+esc(o.n)+'</b><small>'+esc(sub)+'</small>'));
   if(est==='bloq')b.querySelector('.pcIco').append(E('i','pcCadeado'));
   b.onclick=e=>{e.stopPropagation();if(arrasto&&arrasto.moveu)return;
    if(pr){ficha=o.k;desenhar();return}
    if(ex){aviso('Para aprender '+o.n+', vença o Mestre de '+o.n+' num duelo na taverna.');return}
    aviso(o.n+(pais.length?' vem de '+pais.map(x=>x.n).join(pais.length>1?' e de ':' ')+(pais.length>1?' (precisa das duas)':''):'')+'. Esta classe ainda vai ser criada — em breve!')};
   mapa.append(b)}
  view.append(mapa);
  // tela menor que a árvore: reduz para caber na largura (até 70%; abaixo disso, arraste para ver o resto)
  const caber=()=>{if(!view.isConnected)return removeEventListener('resize',caber);const k=Math.max(.7,Math.min(1,(view.clientWidth-8)/W));mapa.style.zoom=k};
  requestAnimationFrame(caber);addEventListener('resize',caber);
  // arrastar move a árvore nos dois sentidos (a rodinha desce normalmente)
  view.addEventListener('pointerdown',e=>{if(e.button!==0)return;arrasto={x:e.clientX,y:e.clientY,sx:view.scrollLeft,sy:view.scrollTop,moveu:false}});
  addEventListener('pointermove',e=>{if(!arrasto)return;const dx=e.clientX-arrasto.x,dy=e.clientY-arrasto.y;if(Math.abs(dx)+Math.abs(dy)>5)arrasto.moveu=true;if(arrasto.moveu){view.scrollLeft=arrasto.sx-dx;view.scrollTop=arrasto.sy-dy}});
  addEventListener('pointerup',()=>setTimeout(()=>{arrasto=null},0));
  return view}

 /* ---- ficha da classe aprendida ---- */
 function fichaClasse(id){
  const c=CL[id],pr=prog(id)||{rank:1,xp:0},rk=pr.rank||1,need=rk>=10?0:rk*((typeof CALC!='undefined'&&CALC.rankXp)||100),atual=id===p.cls,R=raw(id);
  const f=E('div','pcFicha');
  const voltar=E('button','pcVoltar','◀ Árvore de classes');voltar.type='button';voltar.onclick=()=>{ficha=null;desenhar()};
  const spr=c.sprite||(typeof HS!='undefined'&&HS[id]&&(HS[id].d||HS[id].s));let sprUrl='';try{sprUrl=spr&&spr.toDataURL?spr.toDataURL():''}catch(e){}
  const filhos=LIGA.filter(([a])=>a===id).map(([,b])=>NO[b]);
  const cab=E('div','pcCab');
  cab.innerHTML='<span class="pcIcoG"><img src="'+icone(id)+'" alt=""></span><div class="pcNome"><h2>'+esc(c.n)+'</h2>'+(R.desc?'<p>'+linkar(esc(R.desc))+'</p>':'')
   +'<div class="pcRank"><b>Rank '+rk+'</b><span class="pcBarra"><i style="width:'+(need?Math.min(100,Math.round(pr.xp/need*100)):100)+'%"></i></span><small>'+(need?Math.floor(pr.xp)+' / '+need+' XP de classe':'rank máximo')+'</small></div>'
   +(filhos.length?'<p class="pcProx">Leva a: '+filhos.map(o=>'<span><img src="'+icone(o.k)+'" alt="">'+esc(o.n)+'</span>').join('')+'</p>':'')+'</div>'
   +(sprUrl?'<span class="pcBoneco"><img src="'+sprUrl+'" alt=""></span>':'');
  const troca=E('button','pcTrocar'+(atual?' atual':''),atual?'Classe atual':'Trocar para '+esc(c.n));troca.type='button';troca.disabled=atual;
  troca.onclick=()=>{const bl=typeof trocaBloqueada=='function'&&trocaBloqueada();if(bl){aviso(bl);return}setClass(id);desenhar()};
  const pl=c.perLevel||{},max=Math.max(1,...['F','A','I'].map(k=>(c[k]+3)));
  const at=E('div','pcBloco');at.innerHTML='<h4>Atributos</h4>'+[['F','Força','#cf4554'],['A','Agilidade','#79a35a'],['I','Inteligência','#6e9cc4']].map(([k,n,cor])=>
   '<div class="pcAtr"><span>'+n+'</span><span class="pcBarra"><i style="width:'+Math.round((c[k]+3)/max*100)+'%;background:'+cor+'"></i></span><b>'+(c[k]+3)+'</b><small>+'+(pl[k]||0)+'/nível</small></div>').join('')
   +'<div class="pcAtr"><span>Vel. de ataque</span><span></span><b>'+c.attackSpeed+'×</b><small></small></div>';
  const ps=E('div','pcBloco');ps.innerHTML='<h4>Passivas</h4>';
  if(c.passive&&c.passive.n)ps.append(linhaHab(icoPassiva(R.passive||{}),c.passive.n,c.passive.d,'Da classe',true));
  for(const r of c.plist||[]){const lib=r.on?r.on():true,d=defPassiva(r.d.id);ps.append(linhaHab(icoPassiva(d),r.d.n,r.d.t,r.rank?'Rank '+r.rank:'Nível '+r.lv,lib,null,null,'passive:'+r.d.id))}
  if(ps.children.length===1)ps.append(E('p','pcVazio','Nenhuma passiva.'));
  const hs=E('div','pcBloco pcHabs');hs.innerHTML='<h4>Habilidades</h4>';let ents=[];try{ents=skillEntries(id)}catch(e){}
  for(const s of ents){let ds='';try{ds=typeof s.d=='function'?s.d():s.d||''}catch(e){}hs.append(linhaHab(s.ic,s.n,ds,'Rank '+s.rank+(s.cross?' · Cross':''),rk>=s.rank,s.mana,s.cd,'skill:'+s.id))}
  if(!ents.length)hs.append(E('p','pcVazio','Nenhuma habilidade.'));
  const corpo=E('div','pcCorpo');corpo.append(at,ps,hs);
  f.append(voltar,cab,troca,corpo);return f}
 // uma passiva ou habilidade: ícone, nome (liberada: clique abre a ficha dela na Enciclopédia) e o texto com palavras-chave
 function linhaHab(ic,nome,desc,req,lib,mana,cd,ref){const d=E('div','pcHab'+(lib?'':' bloq'));
  const titulo=lib&&ref?'<a class="cx-link" data-ref="'+esc(ref)+'" href="#"><b>'+esc(nome)+'</b></a>':'<b>'+esc(nome)+'</b>';
  d.innerHTML='<span class="pcHabIco">'+(ic?'<img src="'+ic+'" alt="">':'')+(lib?'':'<i class="pcCadeado"></i>')+'</span><div>'+titulo+'<span class="pcReq">'+(lib?'':'libera no ')+esc(req)+(mana!=null&&lib?' · '+mana+' mana · '+cd+' s':'')+'</span>'
   +'<p>'+(lib?linkar(desc||''):'Suba de rank para liberar.')+'</p></div>';return d}
})();
