/* ---------- Molduras em pixel art dos menus (2026-10-28, pedido do usuário) ----------
   Painéis e botões de todas as janelas do jogo ganham moldura desenhada em pixel art, só com a paleta da interface
   (#0d0d0d, #262626, #595959, #a69c94, #d9d0c7). As artes são geradas aqui (cada pixel da arte = 2 px na tela) e
   aplicadas por CSS (border-image), sem arquivos de imagem:
   - painel: contorno escuro com cantos recortados, moldura de pedra com juntas e brilho, rebite em cada canto;
   - botão: relevo (luz em cima/à esquerda, sombra embaixo/à direita); mouse em cima = mais claro; apertado = afundado.
   Os espaços de item (mochila, baú, atalhos) não mudam: têm a borda colorida pela qualidade. */
(function(){
 const K=2; // tamanho do pixel da arte na tela
 const C={p:'#0d0d0d',e:'#262626',c:'#595959',d:'#a69c94',l:'#d9d0c7'};
 // desenha uma arte (lista de linhas; '.' = transparente) e devolve a URL
 function arte(linhas){const h=linhas.length,w=linhas[0].length,cv=document.createElement('canvas');cv.width=w*K;cv.height=h*K;const g=cv.getContext('2d');
  linhas.forEach((l,y)=>[...l].forEach((ch,x)=>{if(C[ch]){g.fillStyle=C[ch];g.fillRect(x*K,y*K,K,K)}}));return cv.toDataURL()}
 /* painel 16×16 com borda de 4: fora p (cantos recortados), luz d em cima/esquerda, pedra c com juntas, linha p por dentro;
    rebite l no canto. O miolo (8×8) fica transparente: o fundo do painel aparece. */
 /* painel 24×24, borda de 6: contorno p (cantos chanfrados), luz d (em cima/esquerda) e sombra e, faixa de pedra c de
    2 px com juntas a cada 6 px, sombra e e linha p por dentro; nos cantos, placa de pedra com rebite em losango */
 const BP=6;
 function painel(){
  const W=24,g=[...Array(W)].map(()=>Array(W).fill('.'));
  const borda=(x,y)=>Math.min(x,y,W-1-x,W-1-y);
  for(let y=0;y<W;y++)for(let x=0;x<W;x++){const b=borda(x,y);if(b>=BP)continue;
   const cima=y<=x&&y<=W-1-x,esq=x<y&&x<=W-1-y,claro=cima||esq;
   g[y][x]=b===0?'p':b===1?(claro?'d':'e'):b<=3?'c':b===4?'e':'p';
   // juntas das pedras ao longo da faixa
   if(b===2||b===3){const t=cima||y>=W-BP?x:y;if(t%6===2)g[y][x]='e';else if(t%6===3&&b===2)g[y][x]=claro?'d':'c'}}
  // cantos chanfrados
  for(const [x,y] of [[0,0],[1,0],[0,1],[W-1,0],[W-2,0],[W-1,1],[0,W-1],[1,W-1],[0,W-2],[W-1,W-1],[W-2,W-1],[W-1,W-2]])g[y][x]='.';
  for(const [x,y] of [[1,1],[W-2,1],[1,W-2],[W-2,W-2]])g[y][x]='p';
  // placa do canto com rebite em losango
  for(const [cx,cy] of [[3,3],[W-4,3],[3,W-4],[W-4,W-4]]){for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(Math.abs(dx)+Math.abs(dy)<=3)g[cy+dy][cx+dx]=Math.abs(dx)+Math.abs(dy)===3?'p':'c';
   g[cy][cx]='l';g[cy-1][cx]='d';g[cy][cx-1]='d';g[cy+1][cx]='e';g[cy][cx+1]='e'}
  return arte(g.map(r=>r.join('')))}
 // botão 6×6 com borda 2: contorno p (cantos recortados), relevo luz/sombra, miolo cheio
 function botao(face,luz,sombra){
  const L=['.pppp.','p'+luz.repeat(3)+sombra+'p','p'+luz+face+face+sombra+'p','p'+luz+face+face+sombra+'p','p'+luz+sombra.repeat(3)+'p','.pppp.'];return arte(L)}
 const P=painel(),B=botao('e','c','p'),BH=botao('c','d','e'),BA=botao('e','p','c'),BO=botao('c','l','e');
 // janelas pequenas (dica, escolha de habilidade, menu do botão direito): moldura fina de 2 px de arte
 const PQ=arte(['.pppp.','pdcccp','pc..ep','pc..ep','pceeep','.pppp.']),PEQUENOS=['#tip','#skillPicker','#invMenu','.menuAliado'];
 const PAINEIS=['.mbox','#dialogue:not(.dgModal):not(.arenaModal)','#invp','#skillPanel','#codex','.biBox','.qmBox','.sdgBox','.mesaPainel','.mpPainel','.selPainel','.vozPainel','#vn .vnCaixa','#telaMorte','#falhaSave>div','.panel'];
 const BOTOES=['#menu button','.mb','#dialogue:not(.dgModal) button:not(.lobCard):not(.dialogueClose)','.ib','.qmBtn','.biOrg','.biFechar','.biAba','.mesaBtn','.mesaFechar','.mesaTab','.invSort','.invTabs button','#invMenu button','#telaMorte button','#vn .vnEscolhas button','.menuAliado button','.dgm-enter','.dgp-voltar','#falhaSave button'];
 const sel=(l,s='')=>l.map(x=>x+s).join(',');
 const css=sel(PEQUENOS)+'{border-style:solid!important;border-width:'+2*K+'px!important;border-color:transparent!important;border-image:url('+PQ+') '+2*K+' repeat!important;border-radius:0!important;outline:0!important}'+
  sel(PAINEIS)+'{border-style:solid!important;border-width:'+BP*K+'px!important;border-color:transparent!important;border-image:url('+P+') '+BP*K+' repeat!important;border-radius:0!important;outline:0!important;background-clip:padding-box!important}'+
  sel(BOTOES)+'{border-style:solid!important;border-width:'+2*K+'px!important;border-color:transparent!important;border-image:url('+B+') '+2*K+' fill repeat!important;border-radius:0!important;outline:0!important;background:transparent!important;box-shadow:none!important}'+
  sel(BOTOES,':hover:not(:disabled)')+'{border-image-source:url('+BH+')!important}'+
  sel(BOTOES,':active:not(:disabled)')+'{border-image-source:url('+BA+')!important}'+
  sel(BOTOES,'.on')+','+sel(BOTOES,'[aria-selected=true]')+'{border-image-source:url('+BO+')!important}'+
  sel(BOTOES,':disabled')+'{opacity:.5;cursor:default}';
 const st=document.createElement('style');st.id='molduraPixel';st.textContent=css;
 // no fim do <head> depois que as folhas de estilo carregarem, para valer por cima delas
 const por=()=>document.head.append(st);if(document.readyState==='loading')addEventListener('DOMContentLoaded',por);else por();
 window.MOLDURA_PIXEL={painel:P,botao:B};
})();
