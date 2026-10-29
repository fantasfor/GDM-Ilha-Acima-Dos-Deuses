/* ---------- Paleta do jogo (2026-10-28, pedido do usuário) ----------
   Paleta harmonizada a partir do "Monstro de Sangue" (contorno #000000, carmim #6e1438/#a22b4b/#cf4554, roxo profundo
   #311339 e osso #c0bfbf/#d9d8d8). Vale para TODA a arte do jogo: monstros, armas, itens, ilha, objetos, taverna,
   arena, DGs e interface.
   Harmonia: cada rampa tem 3 tons (sombra, base, luz); as sombras puxam para o roxo/vinho do Monstro de Sangue e as
   luzes para o osso quente, então cores de rampas diferentes combinam entre si.
   Regras da arte (2026-10-28, corrigido pelo usuário):
   - cada PARTE do desenho usa no máximo 3 tons, da rampa dela (ex.: Rei Esqueleto: lâmina da espada 3 tons de aço,
     punho 3 de madeira, ossos 3 de osso velho, capa 3 de sangue, coroa 3 de ouro); para não ficar serrilhado;
   - olho: cor própria OLHO, que nenhuma outra parte usa (esqueletos: sempre vermelho, igual em todos os quadros);
   - contorno: CONTORNO (#000000), como no Monstro de Sangue.
   O osso é envelhecido (amarelado), a pedido do usuário.
   A Engine mostra esta paleta no editor de sprites (Projeto › Configurações › Paleta do jogo) e converte desenhos
   para ela. */
(function(){
 const RAMPAS=[
  {id:'sangue',nome:'Sangue',cores:['#6e1438','#a22b4b','#cf4554']},
  {id:'noite',nome:'Roxo profundo',cores:['#311339','#4f2052','#74366e']},
  // osso velho (amarelado, gasto); a sombra puxa para o marrom-vinho para combinar com o resto
  {id:'osso',nome:'Osso velho',cores:['#7a6650','#b8a47c','#ddd0a6']},
  {id:'pele',nome:'Pele',cores:['#9c4a4a','#cf7a6a','#e8b096']},
  {id:'madeira',nome:'Madeira e couro',cores:['#4e2430','#7d3f34','#a8653f']},
  {id:'ouro',nome:'Ouro',cores:['#9a5a2a','#d08a3a','#efc56a']},
  {id:'fogo',nome:'Fogo e brasa',cores:['#b8402a','#e8743a','#f7b84a']},
  {id:'folha',nome:'Folhagem',cores:['#263a3a','#3f6b45','#79a35a']},
  {id:'agua',nome:'Água',cores:['#2a2a52','#3d5a8c','#6e9cc4']},
  // aço das lâminas: cinza frio com a sombra puxando para o roxo
  {id:'aco',nome:'Aço (lâminas)',cores:['#3e3a52','#7c8098','#c4c8d6']},
  {id:'pedra',nome:'Pedra',cores:['#3a3040','#5e5668','#8e8898']},
  {id:'magia',nome:'Magia',cores:['#4a1f6e','#7a3ca8','#b07ad8']},
  {id:'terra',nome:'Terra escura',cores:['#1f1a1a','#3a2a2a','#5a4038']}
 ];
 const CONTORNO='#000000',OLHO='#ff4040'; // OLHO: só para olhos (brilho vermelho)
 // tons do olho (sombra = fundo da órbita, base = vermelho, luz = brilho): só olhos usam estas cores
 const OLHO_TONS=['#7a1028',OLHO,'#ffc2a8'];
 const todas=[CONTORNO,...OLHO_TONS,...RAMPAS.flatMap(r=>r.cores)];
 const rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
 // cor da paleta mais parecida (distância com peso de percepção)
 function maisPerto(hex,lista){const[a,b,c]=rgb(hex);let m=null,d=Infinity;for(const p of lista||todas){const[x,y,z]=rgb(p),r=(a+x)/2,e=(2+r/256)*(a-x)**2+4*(b-y)**2+(2+(255-r)/256)*(c-z)**2;if(e<d){d=e;m=p}}return m}
 const g=typeof window!='undefined'?window:globalThis;
 g.PALETA_JOGO={base:'Monstro de Sangue',CONTORNO,OLHO,OLHO_TONS,RAMPAS,todas,maisPerto,
  regras:{tonsPorCor:3,contorno:1},
  texto:'Cada parte do desenho usa no máximo 3 tons, da rampa dela (ex.: lâmina 3 de aço, punho 3 de madeira, ossos 3 de osso velho, capa 3 de sangue, coroa 3 de ouro). Olho em 3 tons próprios ('+OLHO_TONS.join(', ')+'), só para olhos. Contorno '+CONTORNO+'.',
  // rampa de uma cor da paleta (null = contorno ou fora da paleta)
  rampaDe:c=>{c=String(c).toLowerCase();return RAMPAS.find(r=>r.cores.includes(c))||null}};
})();
