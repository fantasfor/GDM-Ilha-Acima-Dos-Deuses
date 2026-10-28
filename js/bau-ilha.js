/* ---------- Baú da ilha (2026-10-28) ----------
   Baú pessoal no acampamento para guardar itens. Individual: cada jogador tem o seu, salvo junto do progresso (save
   local e nuvem, campo "bau"); na ilha de outro jogador ele não aparece.
   10 abas de 5×10 (50 espaços cada, 500 no total). O espaço k fica na aba floor(k/50); saves antigos (40 espaços)
   caem inteiros na aba 1.
   Clique no baú (de perto; de longe o herói anda até ele) abre o painel: clique num item da mochila guarda na aba
   aberta (ou soma à pilha igual que já estiver no baú), clique num item do baú retira; arrastar um item do baú até
   outra aba muda o item de aba. Mover é tirar de um lado e pôr no outro na mesma chamada (nada duplica nem some) e
   salva na hora. Itens de missão não entram (são temporários). Equipados ficam no herói: só a mochila aparece.
   Item cujo tipo deixou de existir não some: vai para ITENS_ORFAOS (js/ui.js), como os da mochila. */
(function(){
 const ABAS=10,LIN=5,COL=10,POR_ABA=LIN*COL,VAGAS=ABAS*POR_ABA,POS={x:CX-38,y:CY+18};
 const BAU=new Array(VAGAS).fill(null);
 const pilha=id=>!!(ITEMS[id]&&(ITEMS[id].use||ITEMS[id].stackable));
 let arteF=null,arteA=null,aberto=false,alvo=false,el=null,aba=0;
 const arte=a=>!window.BAUS||typeof pixelArt!='function'?null:a?arteA||(arteA=pixelArt(BAUS.arte('madeira',true))):arteF||(arteF=pixelArt(BAUS.arte('madeira',false)));
 const visivel=()=>!window.inDungeon&&!window.inTaverna&&!window.inArena&&!window.inTutorial&&!(window.MP&&MP.visitando);
 const perto=()=>Math.hypot(p.x-POS.x,p.y-POS.y)<34;
 const sob=w=>!!w&&visivel()&&Math.abs(w.x-POS.x)<13&&w.y>POS.y-22&&w.y<POS.y+4;
 const aviso=t=>{ft(p.x,p.y-24,t,'#f87171');if(el&&!el.hidden){const m=el.querySelector('.biMsg');if(m)m.textContent=t}};
 const livreNaAba=a=>{for(let k=a*POR_ABA;k<(a+1)*POR_ABA;k++)if(!BAU[k])return k;return -1};
 const usadosNaAba=a=>BAU.slice(a*POR_ABA,(a+1)*POR_ABA).filter(Boolean).length;
 function guardar(i){
  const s=I[i];if(!s)return;
  if(window.ehMissao&&ehMissao(s.id)){aviso('Itens de missão não vão para o baú.');return}
  let k=pilha(s.id)?BAU.findIndex(b=>b&&b.id===s.id):-1;
  if(k>=0)BAU[k].n+=s.n;
  else{k=livreNaAba(aba);if(k<0){aviso('A aba '+(aba+1)+' está cheia ('+POR_ABA+' espaços). Escolha outra aba.');return}BAU[k]={id:s.id,n:s.n,...(s.q!=null?{q:s.q}:{})}}
  I[i]=null;feito();
 }
 function retirar(k){
  const b=BAU[k];if(!b)return;
  const s=pilha(b.id)?I.find(x=>x&&x.id===b.id):null;
  if(s)s.n+=b.n;else I[livre(b.id)]={id:b.id,n:b.n,...(b.q!=null?{q:b.q}:{})};
  BAU[k]=null;feito();
 }
 // muda um item do baú para outra aba (primeiro espaço livre dela)
 function moverParaAba(k,a){
  if(!BAU[k]||a===Math.floor(k/POR_ABA))return;const d=livreNaAba(a);
  if(d<0){aviso('A aba '+(a+1)+' está cheia.');return}
  BAU[d]=BAU[k];BAU[k]=null;feito();
 }
 function feito(){dirtyInv=true;if(window.playGameSound)playGameSound('item');saveGame();desenhar()}
 /* ---- painel ---- */
 const E=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
 function vaga(s,fn,k){
  const d=E('button','biSlot');d.type='button';
  if(s&&ITEMS[s.id]){const im=E('img');im.src=ITEMS[s.id].ic;im.alt='';d.append(im);if(s.n>1)d.append(E('b','',String(s.n)));if(gearType[s.id]&&s.q!=null)d.style.borderColor=QCOL[qi(s.q)];d._tip=()=>itemTip(s.id,s.q);d.onclick=fn;
   if(k!=null){d.draggable=true;d.ondragstart=e=>{e.dataTransfer.setData('text/plain','bau:'+k);e.dataTransfer.effectAllowed='move'}}}
  else{d.disabled=true;d.classList.add('vazio')}
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
  // abas 1..10, com quantos espaços cada uma usa; soltar um item do baú numa aba muda o item de aba
  const abas=E('div','biAbas');abas.setAttribute('role','tablist');
  for(let a=0;a<ABAS;a++){const b=E('button','biAba'+(a===aba?' on':''),String(a+1));b.type='button';b.setAttribute('role','tab');b.setAttribute('aria-selected',String(a===aba));
   const n=usadosNaAba(a);b.title='Aba '+(a+1)+': '+n+'/'+POR_ABA;if(n)b.append(E('small','',String(n)));b.onclick=()=>{aba=a;desenhar()};
   b.ondragover=e=>{e.preventDefault();b.classList.add('alvo')};b.ondragleave=()=>b.classList.remove('alvo');
   b.ondrop=e=>{e.preventDefault();const t=e.dataTransfer.getData('text/plain');if(t.startsWith('bau:'))moverParaAba(+t.slice(4),a)};abas.append(b)}
  const grade=E('div','biGrade biGradeBau');for(let k=aba*POR_ABA;k<(aba+1)*POR_ABA;k++)grade.append(vaga(BAU[k],()=>retirar(k),k));
  const mochila=I.map((s,i)=>s?vaga(s,()=>guardar(i)):null).filter(Boolean),gm=E('div','biGrade');
  (mochila.length?mochila:[E('p','biVazio','Mochila vazia.')]).forEach(v=>gm.append(v));
  const cols=E('div','biCols');cols.append(col('Mochila',gm),col('Baú · aba '+(aba+1)+' ('+usadosNaAba(aba)+'/'+POR_ABA+') · total '+usados+'/'+VAGAS,abas,grade));
  box.append(topo,E('p','biDica','Clique num item da mochila para guardar na aba aberta e num item do baú para retirar. Arraste um item do baú até outra aba para mudá-lo de aba. O baú é só seu.'),cols,E('p','biMsg'));
  el.append(box);
 }
 function abrir(){aberto=true;alvo=false;desenhar()}
 function fechar(){aberto=false;if(el)el.hidden=true;if(typeof tipEl!='undefined')tipEl.style.display='none'}
 addEventListener('keydown',e=>{if(aberto&&e.key==='Escape'){fechar();e.stopImmediatePropagation()}},true);
 // chegou andando até o baú: abre; afastou-se (ou saiu da ilha): fecha
 setInterval(()=>{if(alvo&&visivel()&&perto()){p.dest=null;p.path=[];abrir()}if(aberto&&(!visivel()||Math.hypot(p.x-POS.x,p.y-POS.y)>70))fechar()},120);
 window.BAU_ILHA={VAGAS,ABAS,POR_ABA,POS,sob,
  clique(w,mode){if(mode==2||!sob(w))return false;if(perto())abrir();else{alvo=true;setDest(POS.x,POS.y+14)}return true},
  // desenho na lista de profundidade do render.js (fechado ou aberto; com o mouse em cima, nome e contorno)
  objeto(L){if(!visivel())return;L.push([POS.y,()=>{const a=arte(aberto);if(!a)return;const x=Math.round(POS.x-a.width/2),y=Math.round(POS.y-a.height+2);ctx.drawImage(a,x,y);
   if(sob(typeof wpos=='function'?wpos():null)){ctx.strokeStyle='#d9d0c7';ctx.lineWidth=1;ctx.strokeRect(x-.5,y-.5,a.width+1,a.height+1);ctx.font='6px monospace';ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText('Baú',POS.x+.5,y-2.5);ctx.fillStyle='#ffe28a';ctx.fillText('Baú',POS.x,y-3)}}])},
  // no save: a lista dos 500 espaços sem os vazios do fim (a posição é o espaço; a aba sai dela)
  dados:()=>{const d=BAU.map(b=>b&&{id:b.id,n:b.n,...(b.q!=null?{q:b.q}:{})});let n=d.length;while(n&&!d[n-1])n--;return d.slice(0,n)},
  carregar(lista){BAU.fill(null);if(!lista||typeof lista!=='object')return;
   const pares=Array.isArray(lista)?lista.map((s,k)=>[k,s]):Object.entries(lista).map(([k,s])=>[+k,s]); // objeto: nuvem antiga que virou {índice: item}
   for(const [k,s] of pares){if(!(k>=0&&k<VAGAS)||!s||typeof s.id!='string')continue;const n=Math.max(1,Math.floor(+s.n||1));
    if(ITEMS[s.id])BAU[k]={id:s.id,n,...(s.q!=null?{q:s.q}:{})};else if(typeof ITENS_ORFAOS!='undefined')ITENS_ORFAOS.push({id:s.id,n,q:s.q})}},
  get aberto(){return aberto},get aba(){return aba},set aba(a){aba=Math.max(0,Math.min(ABAS-1,a|0));desenhar()},guardar,retirar,moverParaAba,abrir,fechar};
})();
