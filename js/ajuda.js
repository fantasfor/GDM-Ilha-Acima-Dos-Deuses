/* ---------- Ajuda das janelas (2026-10-31, pedido do usuário) ----------
   Toda janela do jogo tem um "?" no canto superior esquerdo que explica tudo sobre ela.
   JANELAS: sel = a janela, cab = onde o "?" entra (o cabeçalho; sem cab ele fica solto no canto), t = título, h = texto.
   As janelas se redesenham sozinhas (replaceChildren/innerHTML), então um observador põe o "?" de volta quando some.
   Janela nova: acrescente uma linha aqui. Carregado logo depois do js/ui.js para o Esc fechar a ajuda antes da janela. */
(function(){
 const li=a=>'<ul>'+a.map(x=>'<li>'+x+'</li>').join('')+'</ul>',H=(t,a)=>'<h5>'+t+'</h5>'+li(a);
 const JANELAS=[
  {sel:'#invp',cab:'.ttl',t:'Mochila',h:
   H('Abas',['<b>Equipamento</b>: o boneco com o que você veste. Clique num espaço para filtrar a mochila pelo que serve nele; botão direito desequipa; arraste itens entre a mochila e o boneco.','<b>Atributos</b>: força, agilidade, inteligência e todos os números do seu personagem com os bônus do equipamento.'])+
   H('Itens',['Clique num equipamento para vestir; numa poção para usar.','Botão direito abre as opções: equipar (ou na Mão 2 / Anel 2), pôr no acesso rápido, descartar (clique duas vezes para confirmar).','Arraste para trocar de lugar. Passe o mouse para ver os detalhes e a comparação com o que está equipado.','A cor do nome é a qualidade (0–100%): Ruim, Comum, Boa, Rara, Épica e Perfeita. Qualidade maior = atributos maiores.'])+
   H('Filtros e organizar',['Os ícones em cima mostram só uma categoria (armas, armaduras, poções, materiais...). O número é quantos itens tem nela.','<b>Organizar</b> junta tudo por tipo e qualidade.'])+
   H('Acesso rápido (1–6)',['Os espaços 1–6 da barra são separados da mochila. Arraste uma poção para lá ou use o botão direito › "Pôr no acesso rápido". Tecla 1–6 usa.']),},
  {sel:'#skillPanel',cab:'.skillHead',t:'Habilidades',h:
   H('O que mostra',['O nível do personagem, o rank da classe (até 10) e o XP que falta para o próximo rank.','<b>Árvore da classe</b>: cada habilidade libera num rank. Acesa = liberada; apagada = ainda não.','<b>Cross</b>: habilidades de outras classes que você já liberou e pode usar nesta.'])+
   H('Como usar',['Passe o mouse numa habilidade para ver dano, custo, recarga e efeitos.','Para pôr na barra, clique na setinha acima dos espaços Q W E R T Y e escolha a habilidade.','O XP de classe vem de derrotar monstros com esta classe ativa.']),},
  {sel:'#codex',cab:'.cx-top',t:'Enciclopédia',h:
   H('Abas',['<b>Monstros</b>: os que você já derrotou, com nível, vida, ataques e o que deixam cair.','<b>Itens</b>: só os que você já pegou, com dano, atributos, efeitos e habilidades da arma.','<b>Habilidades</b> e <b>Passivas</b>: só as que você já liberou.','<b>Classes</b>: as classes do jogo. <b>Efeitos</b>: o que cada efeito faz, quanto dura, quanto acumula e com o que o dano aumenta.'])+
   H('Dicas',['O que ainda não foi descoberto aparece como silhueta "???".','Palavras sublinhadas são links: clique para ir direto à ficha (ex.: um efeito dentro de uma habilidade).','A busca procura pelo nome em todas as abas.']),},
  {sel:'#painelClasses',cab:'.pcTopo',t:'Classes',h:
   H('A árvore',['Cada caixa é uma classe; as setas mostram de qual classe ela vem. Setas douradas saem de classes que você já tem.','Caixa com faixa roxa precisa de <b>duas</b> classes para liberar (as duas setas que chegam nela).','Legenda: atual (borda dourada), aprendida (verde), ainda não é sua, em breve (tracejada).','Arraste para mover a árvore.'])+
   H('Ficha da classe',['Clique numa classe aprendida para abrir a ficha: rank, atributos, passivas e habilidades.','Nomes de habilidades e efeitos são links para a Enciclopédia.','<b>Trocar para</b> muda sua classe (em alguns momentos, como numa masmorra, a troca fica bloqueada).']),},
  {sel:'#bauIlha',cab:'.qmTopo',t:'Baú do acampamento',h:
   H('Como funciona',['Guarda itens que não cabem ou que você não quer carregar. Fica no seu acampamento e não some.','Arraste itens entre o baú e a mochila.','Botão direito num item do baú trava o lugar dele (não sai do lugar ao organizar).','Os filtros em cima mostram só uma categoria; o que está fora do filtro fica apagado.']),},
  {sel:'#viajanteLoja',cab:'.qmTopo',t:'O Viajante',h:
   H('Vender',['Você recebe <b>75%</b> do valor do item na hora, e o item vai para o estoque do Viajante.','"Todos" vende a pilha inteira. Itens equipados e de missão não aparecem.'])+
   H('Comprar',['O estoque é de todos os jogadores: o que alguém vende, qualquer um compra por <b>100%</b> do valor (até você mesmo, para recuperar).','Itens iguais da mesma qualidade se juntam numa pilha e ficam para sempre.','Se outro jogador comprar antes, você leva só o que sobrou.'])+
   H('Dica',['Passe o mouse num item para ver os detalhes e comparar com o seu.']),},
  {sel:'#quadroMissoes',cab:'.qmTopo',t:'Quadro de Missões',h:
   H('Como funciona',['Cada papel pede para derrotar uma quantidade de um monstro, com recompensa em XP e ouro.','Uma missão por vez: aceite, cumpra e volte aqui para <b>Receber a recompensa</b>.','Conta cada monstro do tipo pedido que você ajudar a derrotar, na ilha ou na masmorra.','Novos papéis chegam a cada hora. Abandonar libera para aceitar outra.']),},
  {sel:'#forjaPainel',cab:'.fjTopo',t:'Forja do Ferreiro',h:
   H('Forjar',['Escolha <b>dois equipamentos iguais</b> da mochila (o mesmo item). Os dois somem e volta <b>um</b> com qualidade nova.','A base é a <b>média</b> das duas qualidades. Ex.: 50% e 75% → média 63%.','Pela sorte do ferreiro, sai <b>pior</b> (1 até X pontos abaixo da média) ou <b>melhor</b> (1 até Y acima). A barra mostra as duas faixas.'])+
   H('Nível do ferreiro',['Ele melhora forjando: nível 2 com 10 itens forjados, depois 50, 100, 200, 350, 550, 800, 1000 e 1500 (nível 10). 2000 = Mestre.','Cada nível aumenta a chance de sair melhor e o quanto pode melhorar, e diminui o quanto pode piorar.'])+
   H('Dicas',['<b>Próximo par</b> escolhe sozinho dois itens iguais. Clique na cena ou aperte Espaço para pular a animação.','Itens equipados e do baú não entram.']),},
  {sel:'.mpSocial',cab:'.mpTopo',t:'Social',h:
   H('Amigos',['Lista dos seus amigos, online primeiro, com nível e ping.','Daqui você convida para o grupo, visita a ilha ou chama para a sua.','Para adicionar alguém: abra <b>Jogadores</b> e use "Adicionar amigo"; o pedido chega no Correio da pessoa.']),},
  {sel:'.mpCorreio',cab:'.mpTopo',t:'Correio',h:
   H('Pedidos e convites',['Pedidos de amizade e convites de ilha e de grupo que chegaram para você.','Aceite ou recuse cada um. O número na cartinha é quantos estão esperando.']),},
  {sel:'.mpPainel:not(.mpSocial):not(.mpCorreio)',cab:'.mpTopo',t:'Jogadores',h:
   H('Online',['Quem está jogando agora e onde está (na ilha, na taverna, numa masmorra), com o ping.','Convide para o grupo, peça amizade ou visite a ilha de alguém.','Grupo: até 5 jogadores entram juntos nas masmorras e dividem a caçada.']),},
  {sel:'#menu .mbox',t:'Menu',h:
   H('Opções do menu',['<b>Voltar ao jogo</b> (ou Esc) despausa.','<b>Personagens</b>: troca de personagem na sua conta.','<b>Opções</b>: zoom da câmera, alcance do minimapa, atacar o próximo inimigo sozinho e outros ajustes.','<b>Controles</b>: todas as teclas, e você pode trocá-las.','O jogo salva sozinho o tempo todo; não existe voltar a um ponto antigo.']),},
  {sel:'#statsDG .sdgBox',cab:'h3',t:'Estatísticas da masmorra',h:
   H('Os números',['Contam do começo ao fim da masmorra, de cada jogador do grupo.','<b>Dano causado</b>: só a vida que o monstro perdeu de verdade (o excesso do golpe final não conta).','<b>Dano recebido</b>: só a vida que você perdeu de verdade.','<b>Cura</b>: só a vida que voltou de fato (curar quem está cheio não conta); poção e regeneração não entram.']),},
  {sel:'#drop',cab:'.dh',t:'Itens encontrados',h:
   H('Como funciona',['O que os monstros deixam cair aparece aqui. ✓ pega o item para a mochila; ✗ rejeita.','<b>Coleta</b>: escolha pegar sozinho tudo, ou só a partir de uma qualidade (Boa, Rara, Épica, Perfeita). "Manual" deixa você decidir.','<b>Rejeitar tudo</b> limpa a lista. Item com "!" é de missão.','Passe o mouse para ver os detalhes e comparar.']),},
  {sel:'#dialogue.dgModal:not(.arenaModal)',cab:'.dgm-head',t:'Masmorras',h:
   H('Portal',['Cada masmorra mostra o chefe, o nível recomendado e o que pode cair.','Entre sozinho ou monte um grupo de até 5 jogadores (clique em + para convidar).','Dentro da masmorra, derrote o chefe para terminar e ver as estatísticas.']),},
  {sel:'#dialogue.arenaModal',cab:'.arn-wrap>b:first-child',t:'Arena',h:
   H('Partidas',['1 contra 1 ou 2 contra 2. Cada um usa o próprio equipamento; quem cai fica assistindo.','A partida acaba quando uma equipe perde todos ou em 5 minutos (ganha quem tem mais gente viva, depois mais vida). Cair não custa ouro.','<b>Ranqueada</b>: busca um oponente com pontos parecidos; vitória soma e derrota tira pontos.','Sem conexão, treine com o boneco.']),},
 ];
 const E=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.innerHTML=x;return e};
 let caixa=null,dono=null,vigia=0;
 function fechar(){if(caixa)caixa.remove();caixa=null;dono=null;clearInterval(vigia)}
 function abrir(j,btn){
  if(caixa&&dono===btn){fechar();return}fechar();dono=btn;
  caixa=E('div','ajudaCaixa');caixa.setAttribute('role','dialog');caixa.setAttribute('aria-label','Ajuda: '+j.t);
  const topo=E('div','ajudaTopo'),x=E('button','biFechar','×');x.type='button';x.setAttribute('aria-label','Fechar a ajuda');x.onclick=fechar;
  topo.append(E('b','','? '+j.t),x);caixa.append(topo,E('div','ajudaTexto',j.h));
  for(const ev of ['pointerdown','mousedown','click','wheel','contextmenu'])caixa.addEventListener(ev,e=>e.stopPropagation());
  document.body.append(caixa);
  // ao lado do "?", sem sair da tela
  const r=btn.getBoundingClientRect(),w=caixa.offsetWidth,h=caixa.offsetHeight;
  caixa.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left))+'px';caixa.style.top=Math.max(8,Math.min(innerHeight-h-8,r.bottom+6))+'px';
  // a janela fechou (ou o "?" sumiu num redesenho): fecha junto
  vigia=setInterval(()=>{if(!dono||!dono.isConnected||!dono.offsetParent){const j2=dono&&dono._j,el=j2&&document.querySelector(j2.sel);const novo=el&&el.offsetParent!==null&&el.querySelector(':scope .ajudaBtn');if(novo&&novo.offsetParent){dono=novo;return}fechar()}},300)}
 function botao(j){const b=E('button','ajudaBtn','?');b.type='button';b.title='Ajuda: '+j.t;b.setAttribute('aria-label','Ajuda: '+j.t);b._j=j;
  for(const ev of ['pointerdown','mousedown'])b.addEventListener(ev,e=>e.stopPropagation()); // não arrasta a janela
  b.onclick=e=>{e.preventDefault();e.stopPropagation();abrir(j,b)};return b}
 // põe o "?" em cada janela aberta que ainda não tem
 function por(){for(const j of JANELAS)for(const el of document.querySelectorAll(j.sel)){
  const cab=j.cab?el.querySelector(j.cab):el;if(!cab||cab.querySelector(':scope>.ajudaBtn'))continue;
  const b=botao(j);if(!j.cab)b.classList.add('solto');cab.prepend(b)}}
 let pend=false;const agendar=()=>{if(pend)return;pend=true;requestAnimationFrame(()=>{pend=false;por()})};
 new MutationObserver(agendar).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden']});
 por();
 addEventListener('keydown',e=>{if(caixa&&e.key==='Escape'){fechar();e.stopImmediatePropagation();e.preventDefault()}},true);
 document.addEventListener('pointerdown',e=>{if(caixa&&!caixa.contains(e.target)&&!(e.target.closest&&e.target.closest('.ajudaBtn')))fechar()},true);
 window.AJUDA={JANELAS,botao,abrir,fechar,por};
})();
