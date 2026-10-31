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
  {id:'terra',nome:'Terra escura',cores:['#1f1a1a','#3a2a2a','#5a4038']},
  /* rampas novas (2026-10-31, pedido do usuário: musgo e outras que faltavam). Mesma harmonia (sombra puxando para o
     roxo/vinho, luz para o osso quente). "extra": valem no editor de sprites e nas conversões que você escolher, mas
     a conversão automática do cenário (ilha, DGs) continua só com as de cima, para nada mudar sozinho no mapa. */
  {id:'musgo',nome:'Musgo',cores:['#2b3324','#56703a','#9aab5c'],extra:true},     // pedra com musgo, troncos, ruínas úmidas
  {id:'gelo',nome:'Gelo e neve',cores:['#4a5a7a','#8fb4cc','#e4f0f2'],extra:true}, // neve, gelo, cristais frios, magia de gelo
  {id:'veneno',nome:'Veneno',cores:['#2f3a1c','#6f8f2a','#c4dc5a'],extra:true},    // poções, gosmas, efeitos de veneno
  {id:'areia',nome:'Areia e palha',cores:['#7a5a3e','#bf9a62','#e8d39c'],extra:true}, // praia, deserto, palha, pergaminho
  {id:'pele2',nome:'Pele morena',cores:['#4a2a26','#7a4a36','#a8704e'],extra:true} // tons de pele mais escuros (personagens)
 ];
 const CONTORNO='#000000',OLHO='#ff4040'; // OLHO: só para olhos (brilho vermelho)
 /* rastro do golpe (2026-10-30, pedido do usuário): fica FORA da paleta, sempre na cor do ataque (em geral branco).
    A conversão dos desenhos (editor de sprites › Converter para a paleta, maisPerto) e a dos esqueletos não mexem
    nesta cor; a do ambiente (corNaPaleta: ilha, DGs) continua convertendo tudo. */
 const RASTRO='#ffffff';
 // tons do olho (sombra = fundo da órbita, base = vermelho, luz = brilho): só olhos usam estas cores
 const OLHO_TONS=['#7a1028',OLHO,'#ffc2a8'];
 const todas=[CONTORNO,...OLHO_TONS,...RAMPAS.flatMap(r=>r.cores)];
 const rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
 // cor da paleta mais parecida (distância com peso de percepção)
 function maisPerto(hex,lista){if(String(hex).slice(0,7).toLowerCase()===RASTRO)return RASTRO;const[a,b,c]=rgb(hex);let m=null,d=Infinity;for(const p of lista||todas){const[x,y,z]=rgb(p),r=(a+x)/2,e=(2+r/256)*(a-x)**2+4*(b-y)**2+(2+(255-r)/256)*(c-z)**2;if(e<d){d=e;m=p}}return m}
 /* ambiente na paleta (2026-10-30, pedido do usuário: decorações, objetos de ambiente, mapas e DGs na paleta do jogo; armas,
    armaduras e monstros ficam como estão): cada cor vira a mais parecida das rampas (ou o contorno), a transparência fica.
    corNaPaleta(hex), dadosNaPaleta(desenho {palette, pixels, anim, camadas}) → cópia convertida, canvasNaPaleta(canvas) →
    o mesmo canvas convertido (ilha, DG, taverna, arena, árvores, pedras, paredes e artes padrão desenhadas por código). */
 const BASE=RAMPAS.filter(r=>!r.extra); // rampas da conversão automática do cenário (as "extra" ficam de fora)
 const AMBIENTE=[CONTORNO,...BASE.flatMap(r=>r.cores)],cacheCor=new Map();
 // escolha pela COR (matiz), não só pela distância: a rampa de matiz e saturação mais parecidas e, nela, o tom de claridade
 // mais perto (antes o verde-claro das copas virava o bege do osso). Quase preto vira o contorno.
 const hsl=h=>{const[r,g,b]=rgb(h).map(v=>v/255),mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;let hh=0,s=0;
  if(d>1e-6){s=d/(1-Math.abs(2*l-1));hh=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;hh*=60;if(hh<0)hh+=360}return[hh,Math.min(1,s),l]};
 const RAMPA_HSL=BASE.map(r=>({r,tons:r.cores.map(hsl)}));
 function escolherCor(k){const[h,s,l]=hsl(k);if(l<.07)return CONTORNO;let m=null,dm=Infinity;
  for(const R of RAMPA_HSL)for(let i=0;i<3;i++){const[th,ts,tl]=R.tons[i],dh=Math.min(Math.abs(h-th),360-Math.abs(h-th))/180,peso=Math.min(s,ts);
   const d=dh*dh*30*peso+(s-ts)**2*.5+(l-tl)**2*4;if(d<dm){dm=d;m=R.r.cores[i]}}
  return m}
 function corNaPaleta(hex){if(typeof hex!='string'||!/^#[0-9a-f]{6}/i.test(hex))return hex;const k=hex.slice(0,7).toLowerCase();let c=cacheCor.get(k);if(!c){c=escolherCor(k);cacheCor.set(k,c)}return c+hex.slice(7)}
 function dadosNaPaleta(d){
  if(!d||typeof d!='object'||!Array.isArray(d.palette))return d;
  const o={...d,palette:d.palette.map(corNaPaleta)};
  if(Array.isArray(d.camadas))o.camadas=d.camadas.map(dadosNaPaleta);
  if(d.anim&&typeof d.anim=='object'){o.anim={...d.anim};for(const k in d.anim)if(Array.isArray(d.anim[k]))o.anim[k]=d.anim[k].map(dadosNaPaleta)}
  return o}
 function canvasNaPaleta(c){
  if(!c||!c.getContext||!c.width||!c.height)return c;
  try{const g=c.getContext('2d'),im=g.getImageData(0,0,c.width,c.height),D=im.data,m=new Map();
   for(let i=0;i<D.length;i+=4){if(!D[i+3])continue;const k=(D[i]<<16)|(D[i+1]<<8)|D[i+2];let v=m.get(k);
    if(v===undefined){v=parseInt(corNaPaleta('#'+k.toString(16).padStart(6,'0')).slice(1,7),16);m.set(k,v)}
    D[i]=v>>16;D[i+1]=(v>>8)&255;D[i+2]=v&255}
   g.putImageData(im,0,0)}catch(e){}
  return c}
 const g=typeof window!='undefined'?window:globalThis;
 g.PALETA_JOGO={base:'Monstro de Sangue',CONTORNO,OLHO,OLHO_TONS,RASTRO,RAMPAS,todas,maisPerto,corNaPaleta,dadosNaPaleta,canvasNaPaleta,
  regras:{tonsPorCor:3,contorno:1},
  texto:'Cada parte do desenho usa no máximo 3 tons, da rampa dela (ex.: lâmina 3 de aço, punho 3 de madeira, ossos 3 de osso velho, capa 3 de sangue, coroa 3 de ouro). Olho em 3 tons próprios ('+OLHO_TONS.join(', ')+'), só para olhos. Contorno '+CONTORNO+'.',
  // rampa de uma cor da paleta (null = contorno ou fora da paleta)
  rampaDe:c=>{c=String(c).toLowerCase();return RAMPAS.find(r=>r.cores.includes(c))||null}};
})();
