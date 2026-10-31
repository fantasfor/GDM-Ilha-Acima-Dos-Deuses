/* ---------- Controles configuráveis ----------
   Cada ação do jogo tem uma tecla (código físico do teclado, KeyboardEvent.code), salva por jogador.
   Os outros módulos perguntam TECLAS.acao(evento) para saber qual ação a tecla dispara.
   A tela de edição fica em Menu › Controles: clique numa ação e aperte a nova tecla;
   se ela já estiver em uso, as duas ações trocam de tecla. */
(function(){
 // v2 (2026-10-22): habilidades em Q E R F T G; teclas salvas da versão antiga ficam para trás.
 // 2026-10-23: andar pelo teclado (WASD e setas) saiu do jogo, a pedido do usuário: o herói anda com o mouse (e o toque no celular)
 // v3 (2026-10-24, pedido do usuário): habilidades em Q W E R T Y e Z X; das teclas salvas na v2 ficam só as que não são de habilidade
 const KEY='ilha-rpg-teclas-v3';
 const ACOES=[
  ['Habilidades',[['hab1','Habilidade 1','KeyQ'],['hab2','Habilidade 2','KeyW'],['hab3','Habilidade 3','KeyE'],['hab4','Habilidade 4','KeyR'],['hab5','Habilidade 5','KeyT'],['hab6','Habilidade 6','KeyY'],['hab7','Ataque básico 1','KeyZ'],['hab8','Ataque básico 2','KeyX']]],
  ['Itens',[['item1','Atalho de item 1','Digit1'],['item2','Atalho de item 2','Digit2'],['item3','Atalho de item 3','Digit3'],['item4','Atalho de item 4','Digit4'],['item5','Atalho de item 5','Digit5'],['item6','Atalho de item 6','Digit6'],['pegar','Aceitar item encontrado','Space']]],
  ['Janelas',[['mochila','Mochila','KeyI'],['painel_hab','Habilidades','KeyK'],['enciclopedia','Enciclopédia','KeyJ'],['classes','Classes','KeyL'],['jogadores','Jogadores e amigos','KeyP']]],
  ['Online',[['chat','Abrir o chat','Enter'],['falar','Apertar para falar (voz)','KeyV']]],
  ['Câmera',[['zoom_mais','Aproximar','Equal'],['zoom_menos','Afastar','Minus']]]
 ];
 const PADRAO={},NOMES={};
 for(const [,lista] of ACOES)for(const [id,nome,tecla] of lista){PADRAO[id]=tecla;NOMES[id]=nome}
 let mapa={...PADRAO};
 try{const v2=localStorage.getItem('ilha-rpg-teclas-v2'),v3=localStorage.getItem(KEY);
  if(v3)Object.assign(mapa,JSON.parse(v3));
  else if(v2){const o=JSON.parse(v2),usadas=new Set(Object.entries(PADRAO).filter(([id])=>/^hab/.test(id)).map(([,t])=>t));
   for(const [id,t] of Object.entries(o))if(!/^hab/.test(id)&&!usadas.has(t))mapa[id]=t}}catch(e){}
 for(const k of Object.keys(mapa))if(!(k in PADRAO))delete mapa[k]; // ações que saíram (ex.: andar com WASD) não valem mais
 const salvar=()=>{try{localStorage.setItem(KEY,JSON.stringify(mapa))}catch(e){}};
 const ROT={Space:'Espaço',Enter:'Enter',Escape:'Esc',Tab:'Tab',Backspace:'Apagar',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',ShiftLeft:'Shift',ShiftRight:'Shift dir.',ControlLeft:'Ctrl',ControlRight:'Ctrl dir.',AltLeft:'Alt',AltRight:'Alt Gr',Equal:'+',Minus:'-',NumpadAdd:'Num +',NumpadSubtract:'Num -',Backquote:"'",Semicolon:'Ç',Comma:',',Period:'.',Slash:';',BracketLeft:'´',BracketRight:'[',Backslash:']',Quote:'~',CapsLock:'Caps'};
 function rotulo(code){
  if(!code)return '—';
  if(ROT[code])return ROT[code];
  if(/^Key[A-Z]$/.test(code))return code.slice(3);
  if(/^Digit\d$/.test(code))return code.slice(5);
  if(/^Numpad\d$/.test(code))return 'Num '+code.slice(6);
  if(/^F\d+$/.test(code))return code;
  return code;
 }
 // atalhos extras que sempre funcionam além da tecla escolhida (teclado numérico e "+" sem Shift)
 const EXTRA={zoom_mais:['NumpadAdd'],zoom_menos:['NumpadSubtract'],mochila:['KeyB']};
 const digitando=e=>e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||e.target instanceof HTMLSelectElement||(e.target&&e.target.isContentEditable);
 let capturando=null;
 const T=window.TECLAS={
  acoes:ACOES,
  tecla:id=>mapa[id],
  rotulo:id=>rotulo(mapa[id]),
  rotuloCodigo:rotulo,
  // ação disparada por um evento de teclado (null quando o jogador está digitando ou editando teclas)
  acao(e){
   if(capturando||!e||digitando(e))return null;
   for(const id in mapa)if(mapa[id]===e.code)return id;
   for(const id in EXTRA)if(EXTRA[id].includes(e.code)&&!Object.values(mapa).includes(e.code))return id;
   return null;
  },
  definir(id,code){
   const outro=Object.keys(mapa).find(k=>k!==id&&mapa[k]===code);
   if(outro)mapa[outro]=mapa[id]; // troca: a ação que usava a tecla fica com a antiga
   mapa[id]=code;salvar();avisar();
  },
  restaurar(){mapa={...PADRAO};salvar();avisar()},
  painel
 };
 function avisar(){window.dispatchEvent(new CustomEvent('teclas-mudaram'))}
 // rótulos da barra de habilidades e dos atalhos de itens acompanham as teclas
 function atualizarRotulos(){
  if(typeof SK!=='undefined')SK.forEach((s,i)=>{const r=T.rotulo('hab'+(i+1));s.k=r.toLowerCase();const b=s.el&&s.el.querySelector(':scope > b');if(b)b.textContent=r});
  document.querySelectorAll('#quick .qslot kbd').forEach((k,i)=>k.textContent=T.rotulo('item'+(i+1)));
 }
 window.addEventListener('teclas-mudaram',atualizarRotulos);
 window.addEventListener('load',atualizarRotulos);

 /* ---- tela de edição (dentro do menu) ---- */
 function painel(box,voltar){
  const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
  const wrap=el('div','teclas');
  wrap.append(el('p','mhelp','Clique numa ação e aperte a nova tecla (Esc cancela). Se a tecla já estiver em uso, as duas ações trocam.'));
  for(const [grupo,lista] of ACOES){
   wrap.append(el('h3','teclasGrupo',grupo));
   for(const [id] of lista){
    const linha=el('div','teclaLinha');linha.append(el('span','',NOMES[id]));
    const b=el('button','teclaBtn',T.rotulo(id));b.type='button';b.setAttribute('aria-label',NOMES[id]+': '+T.rotulo(id)+'. Clique para trocar.');
    b.onclick=()=>{
     if(capturando)return;
     capturando=id;b.textContent='Aperte uma tecla…';b.classList.add('esperando');
     const fim=ev=>{
      ev.preventDefault();ev.stopPropagation();removeEventListener('keydown',fim,true);
      const cancelou=ev.code==='Escape';capturando=null;
      if(!cancelou&&ev.code)T.definir(id,ev.code);
      voltar?voltar():painel(box);
     };
     addEventListener('keydown',fim,true);
    };
    linha.append(b);wrap.append(linha);
   }
  }
  wrap.append(el('h3','teclasGrupo','Mouse e toque'));
  const m=el('div','mhelp');
  m.innerHTML='<kbd>Botão direito</kbd> andar / atacar (segure para seguir o mouse)<br><kbd>Botão esquerdo</kbd> inspecionar, falar com NPC, abrir portão, portal e baús<br><kbd>Roda</kbd> zoom da câmera · roda sobre o minimapa: alcance do minimapa<br><kbd>Esc</kbd> menu (fixo)<br>No celular: toque para andar e atacar; o direcional fica no canto da tela.';
  wrap.append(m);
  const r=el('button','mb','Restaurar teclas padrão');r.type='button';r.onclick=()=>{T.restaurar();voltar?voltar():painel(box)};
  wrap.append(r);
  box.append(wrap);
 }
})();
