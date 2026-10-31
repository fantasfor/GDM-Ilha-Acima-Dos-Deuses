/* ---------- Baú da ilha (2026-10-28) ----------
   Baú pessoal no acampamento para guardar itens. Individual: cada jogador tem o seu, salvo junto do progresso (save
   local e nuvem, campo "bau"). Aparece também na ilha de outro jogador, mas abre sempre o baú de quem clicou.
   10 abas de 10 linhas × 5 colunas (50 espaços cada, 500 no total). O espaço k fica na aba floor(k/50); saves antigos
   (40 espaços) caem inteiros na aba 1.
   Clique no baú (de perto; de longe o herói anda até ele) abre o painel:
   - clique num item da mochila guarda na aba aberta (ou soma à pilha igual que já estiver no baú); clique num item do
     baú retira;
   - arrastar: da mochila (do painel ou da Mochila do jogo) para um espaço do baú ou para uma aba; do baú para outro
     espaço (troca de lugar), para uma aba ou para um espaço da mochila;
   - botão direito num item do baú trava/destrava: item travado não sai do lugar quando se aperta "Organizar" (que
     junta as pilhas e ordena a aba aberta por tipo e qualidade).
   Mover é tirar de um lado e pôr no outro na mesma chamada (nada duplica nem some) e salva na hora. Itens de missão
   não entram (são temporários). Equipados ficam no herói: só a mochila aparece.
   Item cujo tipo deixou de existir não some: vai para ITENS_ORFAOS (js/ui.js), como os da mochila. */
(function(){
 const ABAS=10,LIN=10,COL=5,POR_ABA=LIN*COL,VAGAS=ABAS*POR_ABA,POS={x:CX-38,y:CY+18};
 const BAU=new Array(VAGAS).fill(null);
 const pilha=id=>!!(ITEMS[id]&&(ITEMS[id].use||ITEMS[id].stackable));
 let arteF=null,arteA=null,aberto=false,alvo=false,el=null,aba=0;
 let arrasto=null; // {de:'bau'|'mochila', i} enquanto um item do painel é arrastado
 /* filtro (2026-10-31, os mesmos da Mochila: js/ui.js barraFiltros): na coluna da mochila mostra só o que combina; no baú
    os outros itens ficam apagados no lugar (continuam arrastáveis, e os espaços não mudam) */
 let filtro='all';
 const combina=s=>!!s&&(filtro==='all'||typeof itemNaCategoria!='function'||itemNaCategoria(s,filtro));
 const arte=a=>!window.BAUS||typeof pixelArt!='function'?null:a?arteA||(arteA=pixelArt(BAUS.arte('madeira',true))):arteF||(arteF=pixelArt(BAUS.arte('madeira',false)));
 // aparece em toda ilha, inclusive na de outro jogador (2026-10-28): quem abre vê sempre o PRÓPRIO baú
 const visivel=()=>!window.inDungeon&&!window.inTaverna&&!window.inArena&&!window.inTutorial;
 const perto=()=>Math.hypot(p.x-POS.x,p.y-POS.y)<34;
 const sob=w=>!!w&&visivel()&&Math.abs(w.x-POS.x)<13&&w.y>POS.y-22&&w.y<POS.y+4;
 const aviso=t=>{ft(p.x,p.y-24,t,'#f87171');if(el&&!el.hidden){const m=el.querySelector('.biMsg');if(m)m.textContent=t}};
 const livreNaAba=a=>{for(let k=a*POR_ABA;k<(a+1)*POR_ABA;k++)if(!BAU[k])return k;return -1};
 const usadosNaAba=a=>BAU.slice(a*POR_ABA,(a+1)*POR_ABA).filter(Boolean).length;
 const copia=s=>({id:s.id,n:s.n,...(s.q!=null?{q:s.q}:{})});
 const missao=id=>!!(window.ehMissao&&ehMissao(id));
 // todo espaço da mochila aceita qualquer item (o acesso rápido 1–6 agora é separado: js/state.js RAPIDO)
 const cabeNaMochila=()=>true;
 /* mochila → baú. dest (opcional): espaço do baú; vazio = põe ali; mesma pilha = soma; outro item (não travado) = troca */
 function guardar(i,dest){
  const s=I[i];if(!s)return;
  if(missao(s.id)){aviso('Itens de missão não vão para o baú.');return}
  if(dest!=null){const b=BAU[dest];
   if(!b)BAU[dest]=copia(s);
   else if(b.id===s.id&&pilha(s.id))b.n+=s.n;
   else{if(b.trava){aviso('Esse espaço está travado. Destrave (botão direito) para trocar.');return}
    if(!cabeNaMochila(i,b)){aviso('Atalhos 1–6: só itens consumíveis.');return}
    BAU[dest]=copia(s);I[i]=copia(b);feito();return}
   I[i]=null;feito();return}
  let k=pilha(s.id)?BAU.findIndex(b=>b&&b.id===s.id):-1;
  if(k>=0)BAU[k].n+=s.n;
  else{k=livreNaAba(aba);if(k<0){aviso('A aba '+(aba+1)+' está cheia ('+POR_ABA+' espaços). Escolha outra aba.');return}BAU[k]=copia(s)}
  I[i]=null;feito();
 }
 /* baú → mochila. dest (opcional): espaço da mochila; vazio = põe ali; mesma pilha = soma; outro item = troca */
 function retirar(k,dest){
  const b=BAU[k];if(!b)return;
  if(dest!=null){const s=I[dest];
   if(!cabeNaMochila(dest,b)){aviso('Atalhos 1–6: só itens consumíveis.');return}
   if(!s)I[dest]=copia(b);
   else if(s.id===b.id&&pilha(b.id))s.n+=b.n;
   else{if(missao(s.id)){aviso('Itens de missão não vão para o baú.');return}I[dest]=copia(b);BAU[k]=copia(s);feito();return}
   BAU[k]=null;feito();return}
  const s=pilha(b.id)?I.find(x=>x&&x.id===b.id):null;
  if(s)s.n+=b.n;else I[livre(b.id)]=copia(b);
  BAU[k]=null;feito();
 }
 // dentro do baú: espaço k → espaço d (vazio = move; mesma pilha = soma; outro = troca, se ele não estiver travado)
 function moverPara(k,d){
  if(k===d||!BAU[k])return;const a=BAU[k],b=BAU[d];
  if(b&&b.id===a.id&&pilha(a.id)&&!b.trava){b.n+=a.n;BAU[k]=null}
  else if(b&&b.trava){aviso('Esse espaço está travado.');return}
  else{BAU[d]=a;BAU[k]=b}
  feito();
 }
 // muda um item do baú para outra aba (primeiro espaço livre dela)
 function moverParaAba(k,a){
  if(!BAU[k]||a===Math.floor(k/POR_ABA))return;const d=livreNaAba(a);
  if(d<0){aviso('A aba '+(a+1)+' está cheia.');return}
  BAU[d]=BAU[k];BAU[k]=null;feito();
 }
 function travar(k){const b=BAU[k];if(!b)return;if(b.trava)delete b.trava;else b.trava=true;feito(true)}
 /* Organizar a aba aberta: junta pilhas iguais e ordena por tipo (consumíveis, materiais, equipamentos por espaço),
    qualidade e nome. Itens travados ficam onde estão; os outros ocupam os espaços livres em ordem. */
 const ORDEM_SLOT=['sw','sh','he','ch','le','bo','ca','ne','ri'];
 const tipoOrdem=s=>{const d=ITEMS[s.id]||{},t=gearType[s.id];return d.use?0:d.material?1:t?2+ORDEM_SLOT.indexOf(t):20};
 function organizar(){
  const k0=aba*POR_ABA,soltos=[];
  for(let k=k0;k<k0+POR_ABA;k++){const b=BAU[k];if(b&&!b.trava){soltos.push(b);BAU[k]=null}}
  const juntos=[];for(const s of soltos){const j=pilha(s.id)&&juntos.find(x=>x.id===s.id);if(j)j.n+=s.n;else juntos.push(s)}
  juntos.sort((a,b)=>tipoOrdem(a)-tipoOrdem(b)||(b.q||0)-(a.q||0)||String(ITEMS[a.id]?.n||a.id).localeCompare(String(ITEMS[b.id]?.n||b.id)));
  let k=k0;for(const s of juntos){while(BAU[k])k++;BAU[k]=s}
  feito();ft(p.x,p.y-24,'Aba '+(aba+1)+' organizada','#e7cb88');
 }
 function feito(silencio){dirtyInv=true;if(!silencio&&window.playGameSound)playGameSound('item');saveGame();desenhar()}
 /* ---- painel ---- */
 const E=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
 // origem do que está sendo arrastado: um item deste painel, ou um item da Mochila do jogo (js/hud.js)
 function origem(){if(arrasto)return arrasto;const h=window.HUD_ARRASTO&&HUD_ARRASTO();return typeof h=='number'?{de:'mochila',i:h}:null}
 function alvoDeSoltar(d,fn){
  d.addEventListener('dragover',e=>{if(!origem())return;e.preventDefault();d.classList.add('alvo')});
  d.addEventListener('dragleave',()=>d.classList.remove('alvo'));
  d.addEventListener('drop',e=>{e.preventDefault();d.classList.remove('alvo');const o=origem();arrasto=null;if(o)fn(o)})}
 function vaga(s,{clique,k,i}){
  const d=E('button','biSlot');d.type='button';
  if(s&&ITEMS[s.id]){const im=E('img');im.src=ITEMS[s.id].ic;im.alt='';d.append(im);if(s.n>1)d.append(E('b','',String(s.n)));if(gearType[s.id]&&s.q!=null)d.style.borderColor=QCOL[qi(s.q)];
   if(s.trava){d.classList.add('travado');d.append(E('i','biCadeado'))}
   d._tip=()=>itemTip(s.id,s.q)+(k!=null?'<div class=tm>'+(s.trava?'Travado: fica no lugar ao organizar. ':'')+'Botão direito: '+(s.trava?'destravar':'travar')+' · arraste para mover</div>':'');
   d.onclick=clique;d.draggable=true;
   d.ondragstart=e=>{arrasto=k!=null?{de:'bau',i:k}:{de:'mochila',i};e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain','bau')}catch(err){}if(typeof tipEl!='undefined')tipEl.style.display='none'};
   d.ondragend=()=>{arrasto=null};
   if(k!=null)d.oncontextmenu=e=>{e.preventDefault();travar(k)}}
  else d.classList.add('vazio');
  // soltar: num espaço do baú (k) ou da mochila (i)
  if(k!=null)alvoDeSoltar(d,o=>o.de==='bau'?moverPara(o.i,k):guardar(o.i,k));
  else alvoDeSoltar(d,o=>{if(o.de==='bau')retirar(o.i,i)});
  return d;
 }
 function desenhar(){
  if(!aberto)return;
  if(!el){el=E('div');el.id='bauIlha';el.setAttribute('role','dialog');el.setAttribute('aria-label','Baú do acampamento');document.body.append(el)}
  el.hidden=false;el.replaceChildren();
  const box=E('div','biBox'),topo=E('div','biTopo'),x=E('button','biFechar','×');x.type='button';x.setAttribute('aria-label','Fechar');x.onclick=fechar;
  topo.append(E('b','','Baú do acampamento'),x);
  const usados=BAU.filter(Boolean).length;
  const col=(tit,...filhos)=>{const c=E('div','biCol');c.append(E('h4','',tit),...filhos);return c};
  // abas 1..10, com quantos espaços cada uma usa; soltar um item numa aba manda o item para ela
  const abas=E('div','biAbas');abas.setAttribute('role','tablist');
  for(let a=0;a<ABAS;a++){const b=E('button','biAba'+(a===aba?' on':''),String(a+1));b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-selected',String(a===aba));
   const n=usadosNaAba(a);b.title='Aba '+(a+1)+': '+n+'/'+POR_ABA;if(n)b.append(E('small','',String(n)));b.onclick=()=>{aba=a;desenhar()};
   alvoDeSoltar(b,o=>{if(o.de==='bau')moverParaAba(o.i,a);else{aba=a;guardar(o.i);desenhar()}});abas.append(b)}
  const grade=E('div','biGrade biGradeBau');for(let k=aba*POR_ABA;k<(aba+1)*POR_ABA;k++){const d=vaga(BAU[k],{clique:()=>retirar(k),k});if(BAU[k]&&!combina(BAU[k]))d.classList.add('fora');grade.append(d)}
  const org=E('button','biOrg','Organizar aba');org.type='button';org.title='Junta pilhas e ordena a aba aberta por tipo e qualidade. Itens travados (cadeado) ficam no lugar.';org.onclick=organizar;
  const gm=E('div','biGrade');let temItem=false;
  I.forEach((s,i)=>{if(s&&combina(s)){temItem=true;gm.append(vaga(s,{clique:()=>guardar(i),i}))}});
  if(!temItem)gm.append(E('p','biVazio',filtro==='all'?'Mochila vazia.':'Nada desta categoria na mochila.'));
  // filtros: a contagem soma a mochila e a aba aberta do baú
  const fil=E('div','biFiltros');fil.setAttribute('role','group');fil.setAttribute('aria-label','Filtrar itens por categoria');
  if(typeof barraFiltros=='function'){const k0=aba*POR_ABA;barraFiltros(fil,{ativo:()=>filtro,escolher:id=>{filtro=id;desenhar()},
   contar:id=>I.filter(s=>s&&itemNaCategoria(s,id)).length+BAU.slice(k0,k0+POR_ABA).filter(s=>s&&itemNaCategoria(s,id)).length})}
  // soltar um item do baú no fundo da mochila: vai para o primeiro espaço livre
  alvoDeSoltar(gm,o=>{if(o.de==='bau')retirar(o.i)});
  const cab=E('div','biCabBau');cab.append(abas,org);
  const cols=E('div','biCols');cols.append(col('Mochila',gm),col('Baú · aba '+(aba+1)+' ('+usadosNaAba(aba)+'/'+POR_ABA+') · total '+usados+'/'+VAGAS,cab,grade));
  box.append(topo,E('p','biDica','Clique ou arraste para guardar e retirar. Arraste itens do baú para trocar de lugar ou para outra aba. Botão direito trava o item (o cadeado o mantém no lugar ao organizar). O baú é só seu.'),fil,cols,E('p','biMsg'));
  el.append(box);
 }
 function abrir(){aberto=true;alvo=false;desenhar()}
 function fechar(){aberto=false;arrasto=null;if(el)el.hidden=true;if(typeof tipEl!='undefined')tipEl.style.display='none'}
 addEventListener('keydown',e=>{if(aberto&&e.key==='Escape'){fechar();e.stopImmediatePropagation()}},true);
 // a Mochila do jogo mexeu nos itens: atualiza o painel
 addEventListener('mochila-mudou',()=>{if(aberto)desenhar()});
 // chegou andando até o baú: abre; afastou-se (ou saiu da ilha): fecha
 setInterval(()=>{if(alvo&&visivel()&&perto()){p.dest=null;p.path=[];abrir()}if(aberto&&(!visivel()||Math.hypot(p.x-POS.x,p.y-POS.y)>70))fechar()},120);
 window.BAU_ILHA={VAGAS,ABAS,POR_ABA,LIN,COL,POS,sob,
  clique(w,mode){if(mode==2||!sob(w))return false;if(perto())abrir();else{alvo=true;setDest(POS.x,POS.y+14)}return true},
  // desenho na lista de profundidade do render.js (fechado ou aberto; com o mouse em cima, nome e contorno)
  objeto(L){if(!visivel())return;L.push([POS.y,()=>{const a=arte(aberto);if(!a)return;const x=Math.round(POS.x-a.width/2),y=Math.round(POS.y-a.height+2);ctx.drawImage(a,x,y);
   if(sob(typeof wpos=='function'?wpos():null)){ctx.strokeStyle='#d9d0c7';ctx.lineWidth=1;ctx.strokeRect(x-.5,y-.5,a.width+1,a.height+1);ctx.font='6px monospace';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText('Baú',POS.x+.5,y-2.5);ctx.fillStyle='#ffe28a';ctx.fillText('Baú',POS.x,y-3)}}])},
  // no save: a lista dos 500 espaços sem os vazios do fim (a posição é o espaço; a aba sai dela); t = travado
  dados:()=>{const d=BAU.map(b=>b&&{...copia(b),...(b.trava?{t:1}:{})});let n=d.length;while(n&&!d[n-1])n--;return d.slice(0,n)},
  carregar(lista){BAU.fill(null);if(!lista||typeof lista!=='object')return;
   const pares=Array.isArray(lista)?lista.map((s,k)=>[k,s]):Object.entries(lista).map(([k,s])=>[+k,s]); // objeto: nuvem antiga que virou {índice: item}
   for(const [k,s] of pares){if(!(k>=0&&k<VAGAS)||!s||typeof s.id!='string')continue;const n=Math.max(1,Math.floor(+s.n||1));
    if(ITEMS[s.id])BAU[k]={id:s.id,n,...(s.q!=null?{q:s.q}:{}),...(s.t?{trava:true}:{})};else if(typeof ITENS_ORFAOS!='undefined')ITENS_ORFAOS.push({id:s.id,n,q:s.q})}},
  // arrastando um item do baú (para a Mochila do jogo aceitar soltar nela)
  get arrastandoDoBau(){return arrasto&&arrasto.de==='bau'?arrasto.i:null},soltarNaMochila(dest){const o=arrasto;arrasto=null;if(o&&o.de==='bau')retirar(o.i,dest)},
  get aberto(){return aberto},get aba(){return aba},set aba(a){aba=Math.max(0,Math.min(ABAS-1,a|0));desenhar()},guardar,retirar,moverPara,moverParaAba,travar,organizar,abrir,fechar};
})();
