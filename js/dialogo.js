/* ---------- Diálogo com retratos (estilo visual novel) ----------
   DIALOGO.abrir(falas,{esquerda,direita,aoFim}): os dois personagens aparecem grandes nas laterais da tela (esquerda e
   direita); quem fala fica aceso e um pouco à frente, o outro escurece. O texto sai letra a letra numa caixa embaixo.
   Clique, Espaço ou Enter completa a fala ou passa para a próxima; "Pular" fecha tudo.
   Retrato = função (t) => canvas em pixel art (ex.: heroiRetrato(), ANJO.quadro); é ampliado sem borrar.
   Fala = {lado:'esquerda'|'direita', nome, texto, retrato?} (retrato troca o personagem daquele lado). */
(function(){
 if(MODO.motor)return;
 const caixa=document.createElement('div');caixa.id='vn';caixa.setAttribute('role','dialog');caixa.setAttribute('aria-modal','true');
 caixa.innerHTML='<canvas class="vnRet vnEsq"></canvas><canvas class="vnRet vnDir"></canvas><div class="vnCaixa"><div class="vnNome"></div><div class="vnTexto" aria-live="polite"></div><div class="vnSeta"></div></div><button type="button" class="vnPular">Pular</button>';
 document.body.append(caixa);
 const cvE=caixa.querySelector('.vnEsq'),cvD=caixa.querySelector('.vnDir'),nomeEl=caixa.querySelector('.vnNome'),textoEl=caixa.querySelector('.vnTexto'),setaEl=caixa.querySelector('.vnSeta');
 let atual=null; // {falas,i,n,esquerda,direita,aoFim}
 const VEL=42; // letras por segundo
 let laco=0; // um laço de desenho por diálogo aberto
 /* retrato do jogador: o herói de lado, virado para a direita */
 window.heroiRetrato=()=>()=>heroImg('s',{});
 function abrir(falas,o={}){
  if(!falas||!falas.length){if(o.aoFim)o.aoFim();return}
  atual={falas,i:0,n:0,esquerda:o.esquerda||heroiRetrato(),direita:o.direita||null,aoFim:o.aoFim||null,t0:performance.now()};
  caixa.classList.add('on');if(window.clearMovementInput)clearMovementInput();p.dest=null;p.path=[];
  mostrar();const id=++laco;requestAnimationFrame(n=>quadro(n,id))}
 function mostrar(){const f=atual.falas[atual.i];atual.n=0;nomeEl.textContent=f.nome||'';caixa.dataset.lado=f.lado==='esquerda'?'esquerda':'direita';textoEl.textContent='';setaEl.classList.remove('on');
  if(window.playGameSound)playGameSound('fala')}
 function avancar(){if(!atual)return;const f=atual.falas[atual.i];
  if(atual.n<f.texto.length){atual.n=f.texto.length;return} // completa a fala
  atual.i++;if(atual.i>=atual.falas.length){fechar();return}mostrar()}
 function fechar(){if(!atual)return;const fim=atual.aoFim;atual=null;caixa.classList.remove('on');if(fim)fim()}
 /* desenha um retrato ampliado por inteiro, encostado embaixo; quem não fala fica escuro */
 function retrato(cv,fn,espelhar,aceso,t){
  const W=cv.clientWidth|0,H=cv.clientHeight|0;if(!W||!H)return;if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
  const g=cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);if(!fn)return;
  let img=null;try{img=fn(t)}catch(e){img=null}if(!img||!img.width)return;
  const b=limites(img),k=Math.max(1,Math.floor(Math.min(H*.96/b.h,W*.96/b.w))),dx=Math.round((W-b.w*k)/2),dy=H-b.h*k;
  g.imageSmoothingEnabled=false;g.save();if(espelhar){g.translate(W,0);g.scale(-1,1)}
  g.drawImage(img,b.x,b.y,b.w,b.h,dx,dy,b.w*k,b.h*k);g.restore();
  if(!aceso){g.globalCompositeOperation='source-atop';g.fillStyle='rgba(13,13,13,.62)';g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over'}}
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
 caixa.addEventListener('pointerdown',e=>{e.stopPropagation();if(e.target.closest('.vnPular'))return;avancar()});
 caixa.querySelector('.vnPular').onclick=e=>{e.stopPropagation();fechar()};
 // Espaço/Enter avançam; o jogo não recebe as teclas enquanto o diálogo está aberto
 addEventListener('keydown',e=>{if(!atual)return;if(e.key===' '||e.key==='Enter'){e.preventDefault();avancar()}else if(e.key==='Escape'){e.preventDefault();fechar()}e.stopImmediatePropagation()},true);
 window.DIALOGO={abrir,fechar,aberto:()=>!!atual};
})();
