/* ---------- Tela de carregamento (2026-11-05, pedido do usuário) ----------
   Ao ir para a cidade ou entrar/sair de uma DG, o jogo monta o lugar novo de uma vez (mapa, arte, monstros) e a tela
   parecia congelar do nada. Agora: a tela de carregamento aparece primeiro (espera ela ser pintada), o jogo monta o lugar
   por baixo e ela só some depois que o lugar novo já foi desenhado algumas vezes (as artes ficam prontas atrás dela).
   Usa o painel em pixel art da interface (.mbox, js/moldura-pixel.js) e a paleta da interface.
   Uso: TELA_CARREGANDO.rodar('Cidade', 'Indo para a cidade…', () => entrar()). */
(function(){
 const st=document.createElement('style');
 st.textContent='#carregando{position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;background:var(--c-preto,#0d0d0d);opacity:0;transition:opacity .18s steps(3)}'+
  '#carregando.on{display:flex}#carregando.vis{opacity:1}'+
  '#carregando .mbox{width:min(320px,calc(100vw - 32px));animation:none;font-family:monospace}'+
  '#carregando h2{margin:0 0 6px;font-size:18px;letter-spacing:2px;color:var(--c-linho,#d9d0c7);text-transform:uppercase}'+
  '#carregando p{margin:0 0 14px;font-size:12px;color:var(--c-pedra,#a69c94)}'+
  '#carregando .barra{height:10px;background:var(--c-escuro,#262626);box-shadow:0 0 0 2px var(--c-preto,#0d0d0d),0 0 0 4px var(--c-cinza,#595959);overflow:hidden;position:relative}'+
  '#carregando .barra i{position:absolute;top:0;bottom:0;width:30%;background:var(--c-linho,#d9d0c7);animation:carregaAnda 1s steps(10) infinite}'+
  '@keyframes carregaAnda{from{left:-30%}to{left:100%}}'+
  '@media (prefers-reduced-motion:reduce){#carregando{transition:none}#carregando .barra i{animation:none;left:0;width:100%;opacity:.5}}';
 document.head.append(st);
 const tela=document.createElement('div');tela.id='carregando';tela.setAttribute('role','status');tela.setAttribute('aria-live','polite');
 tela.innerHTML='<div class="mbox"><h2></h2><p></p><div class="barra" aria-hidden="true"><i></i></div></div>';
 const por=()=>document.body.append(tela);if(document.body)por();else addEventListener('DOMContentLoaded',por);
 const quadro=()=>new Promise(r=>requestAnimationFrame(()=>r()));
 let ocupado=false;
 /* mostra a tela, roda fn (síncrona) quando a tela já está na tela e esconde depois de alguns quadros do lugar novo */
 async function rodar(titulo,texto,fn){
  if(ocupado){try{fn()}catch(e){console.error(e)}return}
  ocupado=true;
  tela.querySelector('h2').textContent=titulo||'';tela.querySelector('p').textContent=texto||'Carregando…';
  tela.classList.add('on');await quadro();tela.classList.add('vis');await quadro();await quadro();
  const t0=performance.now();
  try{fn()}catch(e){console.error(e)}
  // o lugar novo desenha por baixo (artes e cache prontos); fica no mínimo 0,35 s para não piscar
  for(let i=0;i<4;i++)await quadro();
  const falta=350-(performance.now()-t0);if(falta>0)await new Promise(r=>setTimeout(r,falta));
  tela.classList.remove('vis');await new Promise(r=>setTimeout(r,200));tela.classList.remove('on');ocupado=false;
 }
 window.TELA_CARREGANDO={rodar,get ocupado(){return ocupado}};
})();
