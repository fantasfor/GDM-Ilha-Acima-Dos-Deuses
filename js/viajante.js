/* ---------- O Viajante (2026-10-31, pedido do usuário) ----------
   NPC do pátio da taverna (parte de cima da área externa) que compra itens dos jogadores e revende para qualquer um:
   você vende por 75% do preço do item e ele fica no estoque, à venda pelo preço cheio (100%) para você mesmo ou para
   outro jogador.
   - Estoque compartilhado no Firebase, uma pilha por tipo de item: viajante/{id}__{qualidade} = {id, q, n, preco, de,
     nome, t}. Item repetido acumula na mesma pilha; nada expira. Vender e comprar são transações (só um jogador leva
     cada unidade). Regra em ferramentas/regras-firebase.json. Sem nuvem (jogo sem login), o estoque fica neste computador.
   - Aparência: o humanoide do jogo (o mesmo gerador do herói, js/sprites.js human) de roupa e capa pretas (o sobretudo),
     calça preta, botas de couro e cabelo grisalho, com uma mochila enorme nas costas de onde sai um brilho mágico, uma
     lanterna pendurada e itens mágicos (poção, cristal, orbe, livro, moeda) flutuando em volta, com faíscas.
   Ligado ao js/taverna.js por VIAJANTE.objetos(L) (desenho), VIAJANTE.click(w) e VIAJANTE.atualizar(dt). */
(function(){
 const LAY=window.TAVERNA_LAYOUT;if(!LAY)return;
 const POS=LAY.L.npcs.viajante||{x:LAY.PX+96,y:LAY.PY+100};
 const NPC={x:POS.x,y:POS.y,fx:0,fy:1,nm:'Viajante'};
 const VENDE=.75,MAX=300;
 const loc=()=>typeof MODO!=='undefined'&&MODO.teste?sessionStorage:localStorage;
 const nuvem=()=>!!(window.NUVEM&&NUVEM.db&&NUVEM.uid&&window.firebase);
 const chave=(id,q)=>id+'__'+(q==null?'x':q); // uma pilha por item e qualidade

 /* ---------- desenho ---------- */
 const C={k:'#000000',couro:'#7d3f34',couroL:'#a8653f',couroE:'#4e2430',ouro:'#d08a3a',ouroL:'#efc56a',roxo:'#b07ad8',agua:'#6e9cc4',aco:'#c4c8d6',sangue:'#cf4554',sangueE:'#a22b4b',osso:'#ddd0a6'};
 const ITENS_MAGICOS=[
  {cor:C.sangue,px:['.o.','sws','sss','.s.'],mapa:{o:C.osso,s:C.sangue,w:'#ffc2a8'}},   // poção
  {cor:C.agua,px:['.c.','cwc','ccc','.c.'],mapa:{c:C.agua,w:C.aco}},                   // cristal
  {cor:C.roxo,px:['.r.','rwr','.r.'],mapa:{r:C.roxo,w:'#ffffff'}},                     // orbe
  {cor:C.ouroL,px:['gggg','pppg','gggg'],mapa:{g:C.sangueE,p:C.osso}},                 // livro
  {cor:C.ouroL,px:['oo','oo'],mapa:{o:C.ouroL}}];                                      // moeda
 const pinta=(g,x,y,px,mapa)=>{for(let j=0;j<px.length;j++)for(let i=0;i<px[j].length;i++){const c=mapa[px[j][i]];if(c){g.fillStyle=c;g.fillRect(x+i,y+j,1,1)}}};
 function brilho(g,x,y,r,cor,a){const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,cor);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=a;g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);g.globalAlpha=1}
 // o humanoide do jogo vestido de Viajante (guardado depois de pronto)
 let corpo=null;
 function sprite(){if(corpo)return corpo;if(typeof human!=='function'||!window.APARENCIA)return null;
  const preto=(a,b,st=0)=>({v:{c:[a,b],st}});
  try{corpo=human('war','d',0,{nude:1,sex:'m',look:{...APARENCIA.padrao('m'),cabelo:'#8e8898'},
   ch:preto('#1f1a1a','#d08a3a',2),ca:preto('#1f1a1a','#3a2a2a'),le:preto('#1f1a1a','#3a2a2a'),bo:preto('#4e2430','#7d3f34')})}catch(e){corpo=null}
  return corpo}
 // itens em volta da mochila: volta elíptica acima dela, cada um no seu ritmo
 const itensNoAr=(t,u)=>ITENS_MAGICOS.map((it,k)=>{const a=t*.9+k*Math.PI*2/ITENS_MAGICOS.length;
  return{it,k,x:Math.round(Math.cos(a)*12)-1,y:Math.round(-43+u+Math.sin(a)*3+Math.sin(t*2.2+k*1.7)*1.5),frente:Math.sin(a)>0}});
 const item=(g,x,y,o,t)=>{brilho(g,x+o.x+1,y+o.y+1.5,5,o.it.cor,.35+.15*Math.sin(t*3+o.k));pinta(g,x+o.x,y+o.y,o.it.px,o.it.mapa)};
 /* o Viajante com os pés em (x, y) no ctx do jogo; t anima o brilho e os itens; an = respiração (anim do render.js) */
 function desenhar(x,y,t,an){
  const g=ctx;x=Math.round(x);y=Math.round(y);const u=an?Math.round(an.dy||0):0,P=(dx,dy,w,h,c)=>{g.fillStyle=c;g.fillRect(x+dx,y+dy+u,w,h)};
  const voa=itensNoAr(t,0);
  // brilho de dentro da mochila e os itens que passam por trás
  brilho(g,x,y-36+u,17,'rgba(176,122,216,.9)',.24+.08*Math.sin(t*2.4));
  for(const o of voa)if(!o.frente)item(g,x,y+u,o,t);
  // mochila enorme nas costas: aparece acima da cabeça e dos lados; duas tiras com fivelas, bolsos, um pergaminho e um
  // cajado com cristal saindo pela boca aberta, de onde vem o brilho
  P(-10,-35,20,25,C.k);P(-11,-33,22,21,C.k);P(-9,-34,18,23,C.couro);P(-10,-32,20,19,C.couro);P(-10,-32,2,19,C.couroL);P(8,-32,2,19,C.couroE);
  for(const ty of [-29,-21]){P(-10,ty,20,1,C.couroE);P(-1,ty-1,2,3,C.ouroL)}
  P(-13,-24,3,9,C.k);P(-12,-23,2,7,C.couro);P(10,-24,3,9,C.k);P(10,-23,2,7,C.couroE);
  P(-8,-40,3,7,C.k);P(-7,-39,1,6,C.osso);P(-6,-39,1,6,'#b8a47c');P(-7,-37,2,1,C.sangueE);
  P(6,-45,1,12,C.couroL);P(5,-47,3,3,C.k);P(6,-46,1,1,C.aco);P(5,-46,1,1,C.agua);P(7,-46,1,1,C.agua);P(6,-47,1,1,C.agua);
  P(-9,-37,18,3,C.k);P(-8,-36,16,1,C.couroE);g.globalAlpha=.6+.4*Math.sin(t*3);P(-6,-35,12,1,C.roxo);P(-3,-35,6,1,'#d9f2ff');g.globalAlpha=1;
  // lanterna pendurada do lado, com a chama tremendo
  const fl=.7+.3*Math.sin(t*9)*Math.sin(t*5.3);P(-15,-25,1,3,C.k);brilho(g,x-15,y-19+u,9,'rgba(247,184,74,.9)',.25*fl);
  P(-17,-22,5,6,C.k);P(-16,-21,3,4,'#e8743a');g.globalAlpha=fl;P(-16,-20,3,2,'#f7b84a');P(-15,-20,1,1,'#fffbf0');g.globalAlpha=1;P(-17,-22,5,1,C.ouro);
  // o humanoide do jogo na frente da mochila
  const s=sprite();if(s&&typeof dr==='function')dr(s,x,y,1,1,an||{dx:0,dy:0,sx:1,sy:1,rot:0});
  // itens que passam pela frente e as faíscas que sobem da mochila
  for(const o of voa)if(o.frente)item(g,x,y+u,o,t);
  for(let j=0;j<7;j++){const f=(t*.55+j/7)%1,ciclo=Math.floor(t*.55+j/7),sx=Math.round(Math.sin(j*12.9+ciclo*3.1)*7),sy=Math.round(-37-f*16);
   g.globalAlpha=1-f;P(sx,sy,1,1,[C.ouroL,C.roxo,C.aco][j%3]);g.globalAlpha=1}
 }

 /* ---------- estoque (nuvem ou este computador): uma pilha por item e qualidade ---------- */
 let estoque=[],ouvindo=null;
 const validos=l=>l.filter(o=>o&&ITEMS[o.id]&&o.n>0&&o.preco>0).sort((a,b)=>(b.t||0)-(a.t||0)).slice(0,MAX);
 function lerLocal(){try{const v=JSON.parse(loc().getItem('ilha-rpg-viajante')||'{}');return v&&!Array.isArray(v)?v:{}}catch(e){return{}}}
 function gravarLocal(m){try{loc().setItem('ilha-rpg-viajante',JSON.stringify(m))}catch(e){}}
 const daLista=m=>validos(Object.entries(m).map(([key,o])=>({...o,key})));
 function ouvir(){
  if(ouvindo)return;
  if(!nuvem()){estoque=daLista(lerLocal());ouvindo='local';desenharPainel();return}
  const ref=NUVEM.db.ref('viajante');
  const fn=s=>{estoque=daLista(s.val()||{});desenharPainel()};
  ref.on('value',fn,e=>{console.warn('Estoque do Viajante:',e&&e.code||e);aviso('Não deu para ver o estoque agora.')});ouvindo={ref,fn}}
 function parar(){if(ouvindo&&ouvindo!=='local')ouvindo.ref.off('value',ouvindo.fn);ouvindo=null}
 // soma qtd na pilha do item (ou cria a pilha)
 const somar=(cur,o,qtd)=>cur?{...cur,n:(+cur.n||0)+qtd,de:o.de,nome:o.nome,t:Date.now()}:{id:o.id,...(o.q!=null?{q:o.q}:{}),n:qtd,preco:o.preco,de:o.de,nome:o.nome,t:Date.now()};

 // vender: o item sai da mochila, o ouro (75%) entra na hora e o item vai para a pilha dele no estoque
 async function vender(i,qtd){
  const s=I[i];if(!s||!ITEMS[s.id]||(window.ehMissao&&ehMissao(s.id)))return;
  qtd=Math.max(1,Math.min(s.n,qtd|0));const preco=Math.max(1,precoVenda(s.id,s.q)),recebe=Math.max(1,Math.floor(preco*qtd*VENDE));
  const q=gearType[s.id]&&s.q!=null?s.q:null,o={id:s.id,q,preco,de:nuvem()?NUVEM.uid:'eu',nome:nomeJogador()},key=chave(s.id,q);
  s.n-=qtd;if(s.n<=0)I[i]=null;p.gold+=recebe;dirtyInv=true;saveGame();
  ft(p.x,p.y-24,'+'+recebe+' ouro','#ffd84a');if(window.playGameSound)playGameSound('coin');
  if(nuvem()){try{const r=await NUVEM.db.ref('viajante/'+key).transaction(cur=>somar(cur,o,qtd),undefined,false);if(!r.committed)throw new Error('não gravou')}
   catch(e){ // não foi para o estoque: desfaz (o item volta, o ouro sai)
    p.gold-=recebe;addItem(o.id,q==null?undefined:q,qtd);dirtyInv=true;saveGame();aviso('O Viajante não conseguiu guardar o item agora. Nada foi vendido.');console.warn('Viajante (vender):',e&&e.code||e)}}
  else{const m=lerLocal();m[key]=somar(m[key],o,qtd);gravarLocal(m);estoque=daLista(m);desenharPainel()}
 }
 // comprar qtd da pilha: transação — se outro jogador levou antes, você leva só o que sobrou (ou nada)
 async function comprar(o,qtd){
  qtd=Math.max(1,Math.min(o.n,qtd|0));if(p.gold<o.preco*qtd){aviso('Ouro insuficiente: custa '+o.preco*qtd+'.');return}
  let levou=0;const tira=cur=>{levou=0;if(!cur)return cur;const k=Math.min(qtd,+cur.n||0);if(k<=0)return cur;levou=k;const n=cur.n-k;return n>0?{...cur,n,t:cur.t}:null};
  if(!nuvem()){const m=lerLocal();m[o.key]=tira(m[o.key]);if(!m[o.key])delete m[o.key];gravarLocal(m);estoque=daLista(m);if(levou)receber(o,levou);else aviso('Esse item já foi vendido.');return}
  try{const r=await NUVEM.db.ref('viajante/'+o.key).transaction(tira,undefined,false);
   if(r.committed&&levou>0)receber(o,levou);else aviso('Alguém comprou esse item antes de você.')}
  catch(e){aviso('Não deu para comprar agora.');console.warn('Viajante (comprar):',e&&e.code||e)}
 }
 // o ouro já foi conferido antes de tirar o item do estoque (aqui ele já é seu)
 function receber(o,n){p.gold=Math.max(0,p.gold-o.preco*n);addItem(o.id,gearType[o.id]?o.q:undefined,n);dirtyInv=true;saveGame();
  ft(p.x,p.y-24,'Comprou '+nomeItem(o.id)+(n>1?' ×'+n:''),'#ffd84a');if(window.playGameSound)playGameSound('item');desenharPainel()}
 const nomeItem=id=>String(ITEMS[id]&&ITEMS[id].n||id).replace(/ \(.*$/,'');
 const nomeJogador=()=>String(window.NUVEM&&NUVEM.nome?NUVEM.nome():p.nome||'Viajante').slice(0,18);

 /* ---------- painel ---------- */
 let el=null,aba='comprar',filtro='all',msg='';
 const E=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
 const aberto=()=>!!el&&!el.hidden;
 function aviso(t){msg=t;desenharPainel();setTimeout(()=>{if(msg===t){msg='';desenharPainel()}},4000)}
 function abrir(){alvo=false;aba='comprar';msg='';if($('dialogue'))$('dialogue').classList.remove('open');ouvir();desenharPainel()}
 function fechar(){if(el)el.hidden=true;parar();if(typeof tipEl!='undefined')tipEl.style.display='none'}
 const combina=id=>filtro==='all'||typeof itemNaCategoria!='function'||itemNaCategoria({id},filtro);
 const botao=(txt,titulo,fn,off)=>{const b=E('button','vjBtn',txt);b.type='button';b.title=titulo;b.disabled=!!off;b.onclick=()=>{b.disabled=true;fn()};return b};
 function linha(id,q,n,precoTxt,extra,botoes){
  const d=E('div','vjLinha'),im=E('img');im.src=ITEMS[id].ic;im.alt='';
  const cor=gearType[id]&&q!=null?QCOL[qi(q)]:'#e7dcc4',nm=E('span','vjNome',nomeItem(id)+(n>1?' ×'+n:''));nm.style.color=cor;
  if(gearType[id]&&q!=null)nm.append(E('small','',' '+q+'%'));
  const info=E('div','vjInfo');info.append(nm);if(extra)info.append(E('small','vjDe',extra));
  d.append(im,info,E('b','vjPreco',precoTxt),...botoes);d._tip=()=>itemTip(id,q);return d}
 function desenharPainel(){
  if(!ouvindo)return; // fechado: o estoque não está sendo acompanhado
  if(!el){el=E('div');el.id='viajanteLoja';el.setAttribute('role','dialog');el.setAttribute('aria-label','Loja do Viajante');document.body.append(el)}
  el.hidden=false;el.replaceChildren();
  const box=E('div','qmBox vjBox'),topo=E('div','qmTopo'),x=E('button','biFechar','×');x.type='button';x.setAttribute('aria-label','Fechar');x.onclick=fechar;
  topo.append(E('b','','O Viajante'),x);
  const abas=E('div','vjAbas');for(const [id,t] of [['comprar','Comprar'],['vender','Vender']]){const b=E('button','vjAba'+(aba===id?' on':''),t);b.type='button';b.onclick=()=>{aba=id;desenharPainel()};abas.append(b)}
  abas.append(E('span','vjOuro',(p.gold|0)+' ouro'));
  const fil=E('div','biFiltros'),lista=E('div','vjLista');
  if(aba==='comprar'){
   if(typeof barraFiltros=='function')barraFiltros(fil,{ativo:()=>filtro,escolher:id=>{filtro=id;desenharPainel()},contar:id=>estoque.filter(o=>id==='all'||itemNaCategoria({id:o.id},id)).reduce((a,o)=>a+o.n,0)});
   const itens=estoque.filter(o=>combina(o.id));
   for(const o of itens){const bts=[botao('Comprar','Comprar 1 por '+o.preco+' ouro',()=>comprar(o,1),p.gold<o.preco)];
    if(o.n>1){const tudo=Math.min(o.n,Math.floor(p.gold/o.preco));bts.push(botao(tudo>=o.n?'Todos':'×'+Math.max(1,tudo),tudo>=o.n?'Comprar os '+o.n+' por '+o.preco*o.n+' ouro':'Comprar '+tudo+' (o que o seu ouro paga) por '+o.preco*tudo+' ouro',()=>comprar(o,tudo),tudo<2))}
    lista.append(linha(o.id,o.q,o.n,o.preco+' ouro',o.n>1?'cada · '+o.n+' em estoque':null,bts))}
   if(!itens.length)lista.append(E('p','biVazio',estoque.length?'Nada desta categoria no estoque.':'O estoque está vazio. Venda algo e ele aparece aqui para todos.'))}
  else{
   const minhas=I.map((s,i)=>[s,i]).filter(([s])=>s&&ITEMS[s.id]&&!(window.ehMissao&&ehMissao(s.id)));
   if(typeof barraFiltros=='function')barraFiltros(fil,{ativo:()=>filtro,escolher:id=>{filtro=id;desenharPainel()},contar:id=>minhas.filter(([s])=>itemNaCategoria(s,id)).length});
   const itens=minhas.filter(([s])=>combina(s.id));
   for(const [s,i] of itens){const pr=Math.max(1,precoVenda(s.id,s.q)),um=Math.max(1,Math.floor(pr*VENDE)),bts=[botao('Vender','Você recebe '+um+' ouro; ele revende por '+pr,()=>vender(i,1))];
    if(s.n>1)bts.push(botao('Todos','Vender os '+s.n+' por '+Math.max(1,Math.floor(pr*s.n*VENDE))+' ouro',()=>vender(i,s.n)));
    lista.append(linha(s.id,s.q,s.n,um+' ouro',s.n>1?'cada · revende por '+pr:'revende por '+pr,bts))}
   if(!itens.length)lista.append(E('p','biVazio',minhas.length?'Nada desta categoria na mochila.':'Nada para vender na mochila.'))}
  const pe=E('p','biDica',(nuvem()?'Estoque compartilhado entre todos os jogadores':'Sem conexão: o estoque fica neste computador')+' · itens iguais se juntam numa pilha e ficam para sempre · equipados e itens de missão não aparecem.');
  box.append(topo,abas,fil,lista,pe,E('p','biMsg',msg));el.append(box);
 }

 /* ---------- no pátio: desenho, clique e chegada ---------- */
 let sob=false,alvo=false;
 const em=w=>Math.abs(w.x-NPC.x)<14&&w.y>NPC.y-40&&w.y<NPC.y+2; // o corpo e a mochila
 window.VIAJANTE={npc:NPC,desenhar,
  objetos(L){L.push([NPC.y,()=>{const t=typeof time=='number'?time:performance.now()/1000;
   if(sob&&typeof circ=='function')circ(NPC.x,NPC.y,13,'#ff5');desenhar(NPC.x,NPC.y,t,typeof anim=='function'?anim(NPC,0):null);
   const top=NPC.y-50; // logo acima dos itens que flutuam
   ctx.font='5px monospace';ctx.textAlign='center';ctx.textBaseline='alphabetic';
   ctx.fillStyle='#000';ctx.fillText(NPC.nm,NPC.x+.4,top+.4);ctx.fillStyle='#ffe28a';ctx.fillText(NPC.nm,NPC.x,top);
   ctx.fillStyle='#ffd84a';ctx.font='bold 6px monospace';ctx.fillText('$',NPC.x,top-6+Math.round(Math.sin(t*4)*1.5))}])},
  click(w,mode){if(mode==2||!em(w)){alvo=false;return false}if(Math.hypot(p.x-NPC.x,p.y-NPC.y)<34)abrir();else{alvo=true;setDest(NPC.x,NPC.y+14)}return true},
  atualizar(){if(!window.inTaverna){if(aberto())fechar();return}
   sob=em(wpos());if(sob)cv.style.cursor='pointer';
   if(alvo&&Math.hypot(p.x-NPC.x,p.y-NPC.y)<34){alvo=false;p.dest=null;p.path=[];abrir()}
   if(aberto()&&Math.hypot(p.x-NPC.x,p.y-NPC.y)>90)fechar()},
  abrir,fechar,get aberto(){return aberto()}};
 addEventListener('keydown',e=>{if(aberto()&&e.key==='Escape'){fechar();e.stopImmediatePropagation()}},true);
 // a mochila mudou (outra tela vendeu, usou, pegou): atualiza a aba Vender
 addEventListener('mochila-mudou',()=>{if(aberto())desenharPainel()});
})();
