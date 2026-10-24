/* ---------- Diálogo com retratos (estilo visual novel) ----------
   DIALOGO.abrir(falas,{esquerda,direita,aoFim}): os dois personagens aparecem grandes nas laterais da tela (esquerda e
   direita); quem fala fica aceso e um pouco à frente, o outro escurece. O texto sai letra a letra numa caixa embaixo.
   Clique, Espaço ou Enter completa a fala ou passa para a próxima; "Pular" fecha tudo.
   Retrato = função (t) => canvas em pixel art (ex.: heroiRetrato(), ANJO.quadro); é ampliado sem borrar.
   Fala = {lado:'esquerda'|'direita', nome, texto, retrato?} (retrato troca o personagem daquele lado).
   escolhas: [{texto, acao}] aparecem como botões depois da última fala (sem elas, o clique fecha).
   Todos os diálogos de NPC do jogo (a caixa #dialogue: carpinteiro, ferreiro, taverna, portais...) também abrem neste
   estilo: o nome vira a placa, cada parágrafo uma fala e cada botão uma escolha (o botão original é clicado). Painéis com
   listas, campos ou cartas (loja, DGs, arena) continuam na caixa de sempre. */
(function(){
 if(MODO.motor)return;
 const caixa=document.createElement('div');caixa.id='vn';caixa.setAttribute('role','dialog');caixa.setAttribute('aria-modal','true');
 caixa.innerHTML='<canvas class="vnRet vnEsq"></canvas><canvas class="vnRet vnDir"></canvas><div class="vnCaixa"><div class="vnNome"></div><div class="vnTexto" aria-live="polite"></div><div class="vnSeta"></div><div class="vnEscolhas"></div></div><button type="button" class="vnPular">Pular</button>';
 document.body.append(caixa);
 const cvE=caixa.querySelector('.vnEsq'),cvD=caixa.querySelector('.vnDir'),nomeEl=caixa.querySelector('.vnNome'),textoEl=caixa.querySelector('.vnTexto'),setaEl=caixa.querySelector('.vnSeta'),escEl=caixa.querySelector('.vnEscolhas');
 let atual=null; // {falas,i,n,esquerda,direita,aoFim}
 const VEL=42; // letras por segundo
 let laco=0; // um laço de desenho por diálogo aberto
 /* retrato do jogador: o herói de lado, virado para a direita */
 window.heroiRetrato=()=>()=>heroImg('s',{});
 function abrir(falas,o={}){
  if(!falas||!falas.length){if(o.aoFim)o.aoFim();return}
  atual={falas,i:0,n:0,esquerda:o.esquerda||heroiRetrato(),direita:o.direita||null,aoFim:o.aoFim||null,t0:performance.now(),escolhas:o.escolhas||null,assinatura:o.assinatura||null,aoFechar:o.aoFechar||null};escEl.replaceChildren();
  caixa.classList.add('on');if(window.clearMovementInput)clearMovementInput();p.dest=null;p.path=[];
  mostrar();const id=++laco;requestAnimationFrame(n=>quadro(n,id))}
 function mostrar(){const f=atual.falas[atual.i];atual.n=0;nomeEl.textContent=f.nome||'';caixa.dataset.lado=f.lado==='esquerda'?'esquerda':'direita';textoEl.textContent='';setaEl.classList.remove('on');
  if(window.playGameSound)playGameSound('fala')}
 function avancar(){if(!atual)return;const f=atual.falas[atual.i];
  if(atual.n<f.texto.length){atual.n=f.texto.length;return} // completa a fala
  if(atual.i>=atual.falas.length-1&&atual.escolhas){mostrarEscolhas();return} // última fala: as escolhas ficam esperando
  atual.i++;if(atual.i>=atual.falas.length){fechar();return}mostrar()}
 function mostrarEscolhas(){if(escEl.childElementCount||!atual)return;setaEl.classList.remove('on');
  for(const e of atual.escolhas){const b=document.createElement('button');b.type='button';b.textContent=e.texto;
   b.onclick=ev=>{ev.stopPropagation();const a=e.acao;fechar(true);try{a&&a()}catch(x){console.error(x)}};escEl.append(b)}
  escEl.querySelector('button').focus()}
 function fechar(escolheu){if(!atual)return;const fim=atual.aoFim,sai=atual.aoFechar;atual=null;caixa.classList.remove('on');escEl.replaceChildren();if(fim)fim();if(sai)sai(!!escolheu)}
 /* desenha um retrato ampliado por inteiro, encostado embaixo; quem não fala fica escuro */
 function retrato(cv,fn,espelhar,aceso,t){
  const W=cv.clientWidth|0,H=cv.clientHeight|0;if(!W||!H)return;if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
  const g=cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);if(!fn)return;
  let img=null;try{img=fn(t)}catch(e){img=null}if(!img||!img.width)return;
  const b=limites(img),k=escala(W,H),dx=Math.round((W-b.w*k)/2),dy=H-b.h*k;
  g.imageSmoothingEnabled=false;g.save();if(espelhar){g.translate(W,0);g.scale(-1,1)}
  g.drawImage(img,b.x,b.y,b.w,b.h,dx,dy,b.w*k,b.h*k);g.restore();
  if(!aceso){g.globalCompositeOperation='source-atop';g.fillStyle='rgba(13,13,13,.62)';g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over'}}
 /* todos os retratos com o mesmo tamanho de pixel (1 pixel do desenho = k pixels da tela), medido pelo maior personagem
    (o Anjo, ~96×72): o herói fica do tamanho dele em relação aos outros, nunca ampliado para encher o espaço */
 const REF={w:96,h:72},escala=(W,H)=>Math.max(1,Math.floor(Math.min(H*.96/REF.h,W*.96/REF.w)));
 /* área com pixels do quadro (o retrato fica do tamanho do desenho, não do quadro) */
 const cacheLim=new WeakMap();
 function limites(img){let r=cacheLim.get(img);if(r)return r;
  const w=img.width,h=img.height;let x0=w,y0=h,x1=-1,y1=-1;
  try{const d=(img.getContext?img:(()=>{const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0);return c})()).getContext('2d').getImageData(0,0,w,h).data;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}catch(e){x0=0;y0=0;x1=w-1;y1=h-1}
  if(x1<0){x0=0;y0=0;x1=w-1;y1=h-1}
  r={x:x0,y:y0,w:x1-x0+1,h:y1-y0+1};cacheLim.set(img,r);return r}
 function quadro(now,id){
  if(!atual||id!==laco)return;const t=(now-atual.t0)/1000,f=atual.falas[atual.i];
  if(atual.n<f.texto.length){atual.n=Math.min(f.texto.length,atual.n+VEL/60);textoEl.textContent=f.texto.slice(0,Math.floor(atual.n))}
  else{textoEl.textContent=f.texto;setaEl.classList.add('on')}
  const fala=f.lado==='esquerda',dir=!fala&&f.retrato||atual.direitaAtual||atual.direita;if(!fala)atual.direitaAtual=dir; // a fala pode trocar quem está à direita (retrato)
  retrato(cvE,atual.esquerda,false,fala,t);retrato(cvD,dir,true,!fala,t);
  requestAnimationFrame(n=>quadro(n,id))}
 caixa.addEventListener('pointerdown',e=>{e.stopPropagation();if(e.target.closest('.vnPular')||e.target.closest('.vnEscolhas'))return;avancar()});
 caixa.querySelector('.vnPular').onclick=e=>{e.stopPropagation();fechar()};
 // Espaço/Enter avançam; o jogo não recebe as teclas enquanto o diálogo está aberto
 addEventListener('keydown',e=>{if(!atual)return;if((e.key===' '||e.key==='Enter')&&!(escEl.childElementCount&&e.target.closest&&e.target.closest('.vnEscolhas'))){e.preventDefault();avancar()}else if(e.key==='Escape'){e.preventDefault();fechar()}e.stopImmediatePropagation()},true);
 window.DIALOGO={abrir,fechar,aberto:()=>!!atual};
 /* ---- diálogos de NPC (#dialogue) no mesmo estilo ---- */
 const caixaNPC=document.getElementById('dialogue');
 // retrato pelo nome do NPC (o desenho de lado, virado para o herói)
 function retratoDe(nome){
  const lado=s=>s&&(s.s||s.d||s);
  if(/^Carpinteiro/.test(nome))return()=>lado(HS.carpinteiro);
  if(/^Ferreiro/.test(nome))return()=>lado(HS.ferreiro);
  const m=/^Mestre (.+)/.exec(nome);if(m){const k=Object.keys(CL).find(c=>CL[c].n===m[1]);if(k)return()=>CL[k].sprite||lado(HS[k]||HS.war)}
  if(/Taverneira/.test(nome))return()=>lado(HS.sty||HS.war);
  if(/Lanceiro|Bardo|Curandeir|Anjo/.test(nome))return()=>lado(HS[/Curandeir/.test(nome)?'hea':'war']);
  return null}
 function converter(){
  if(!caixaNPC)return;const box=caixaNPC;
  // só mexe na classe quando muda: mexer sem mudar também avisa o observador (e viraria um laço)
  if(!box.classList.contains('open')){if(box.classList.contains('vnOculto'))box.classList.remove('vnOculto');if(atual&&atual.assinatura)fechar(true);return}
  if(box.classList.contains('dgModal')||box.classList.contains('arenaModal'))return;
  if(box.querySelector('input,select,textarea,table,ul,ol,canvas,img,.tavItem,.lobCard,[data-sem-vn]'))return; // lojas e painéis ficam como estão
  const ps=[...box.querySelectorAll('p')].filter(p=>p.textContent.trim());if(!ps.length)return;
  const assinatura=box.innerHTML;if(atual&&atual.assinatura===assinatura)return;
  const nome=(box.querySelector('b')||{}).textContent||'',bts=[...box.querySelectorAll('button')].filter(b=>!b.classList.contains('dialogueClose')&&b.textContent.trim());
  if(!box.classList.contains('vnOculto'))box.classList.add('vnOculto');
  const escolhas=bts.length?bts.map(b=>({texto:b.textContent.trim(),acao:()=>b.click()})):[{texto:'Fechar',acao:null}];
  abrir(ps.map(p=>({lado:'direita',nome,texto:p.textContent.replace(/\s+/g,' ').trim()})),{direita:retratoDe(nome),escolhas,assinatura,
   // escolheu: o botão original já cuidou da caixa (fechou ou trocou o conteúdo); se ela ficou aberta igual, fecha
   aoFechar:escolheu=>setTimeout(()=>{if(atual&&atual.assinatura)return;if((!escolheu||box.innerHTML===assinatura)&&(box.classList.contains('open')||box.classList.contains('vnOculto')))box.classList.remove('open','vnOculto')},0)})}
 if(caixaNPC)new MutationObserver(()=>queueMicrotask(converter)).observe(caixaNPC,{attributes:true,attributeFilter:['class'],childList:true,subtree:true,characterData:true});
})();
