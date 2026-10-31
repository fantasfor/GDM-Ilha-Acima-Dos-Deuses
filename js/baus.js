/* Baús das DGs (2026-10-24, pedido do usuário): cinco categorias — madeira (simples), verde, azul, roxo e dourado —
   com arte 1:1 (fechado 22×18, aberto 22×22), faixa de qualidade dos itens e tabela de loot padrão de cada uma.
   Cada baú colocado no mapa tem a sua própria tabela (config.chests[i].loot: ouro, qualidade e itens com chance) e o
   seu "aumento de qualidade" (qualidadeBonus, em pontos de qualidade): dois baús azuis podem dar itens diferentes.
   Usado pelo jogo (js/dungeon.js) e pela Engine (inspetor e prévia). */
(function(root){
 const TIPOS=[['madeira','Madeira (simples)'],['verde','Verde'],['blue','Azul'],['purple','Roxo'],['gold','Dourado']];
 const NOME={madeira:'Baú de Madeira',verde:'Baú Verde',blue:'Baú Azul',purple:'Baú Roxo',gold:'Baú Dourado'};
 const COR={madeira:'#d0a070',verde:'#6fd47a',blue:'#60a5fa',purple:'#c084fc',gold:'#fbbf24'};
 const QUALIDADE={madeira:[20,45],verde:[35,62],blue:[45,75],purple:[70,92],gold:[90,100]};
 const it=(id,chance)=>({id,chance});
 // só itens do projeto (armaduras 1/2/3 e as armas do usuário, da mais simples à mais forte); item que não existe é ignorado
 const LOOT_PADRAO={
  madeira:{goldMin:15,goldMax:40,qualityMin:20,qualityMax:45,items:[it('hp',100),it('mp',60),it('espada_de_madeira',8),it('cajado_base',8),it('he1',8),it('ch1',8),it('le1',8),it('bo',8)]},
  verde:{goldMin:30,goldMax:65,qualityMin:35,qualityMax:62,items:[it('hp',100),it('mp',100),it('espada_de_madeira_magica',10),it('cajado_da_floresta',10),it('arma_escudo',8),it('he1',12),it('ch1',12),it('le1',12),it('bo',12),it('ca1',6),it('ne1',6),it('ri1',6)]},
  blue:{goldMin:45,goldMax:90,qualityMin:45,qualityMax:75,items:[it('hp',100),it('mp',100),it('espada_osso',10),it('clava_osso',10),it('cajado_osso',10),it('escudo_osso',8),it('he2',12),it('ch2',12),it('le2',12),it('bo2',12),it('ca1',10),it('ne1',10),it('ri1',10)]},
  purple:{goldMin:140,goldMax:260,qualityMin:70,qualityMax:92,items:[it('hp',100),it('mp',100),it('espada_glooc',14),it('machadinha_glooc',14),it('cetro_glooc',14),it('cajado_de_poros',12),it('cetro_necromante',12),it('he2',18),it('ch2',18),it('le2',18),it('bo2',18),it('ca2',15),it('ne2',15),it('ri2',15)]},
  gold:{goldMin:400,goldMax:750,qualityMin:90,qualityMax:100,items:[it('hp',100),it('mp',100),it('espada_rei',20),it('cajado_rei',20),it('he3',20),it('ch3',20),it('le3',20),it('bo3',20),it('ca3',25),it('ne3',25),it('ri3',25)]}
 };
 // madeira do corpo, ferragens e pedra da fechadura de cada categoria
 const PAL={
  madeira:{mE:'#4a2c16',m:'#7a4c28',mL:'#9c6a3c',fE:'#3a3a44',f:'#6a6a78',fL:'#a0a0ae',g:'#6a6a78',gL:'#a0a0ae',brilho:'#e8c890'},
  verde:{mE:'#4a2c16',m:'#7a4c28',mL:'#9c6a3c',fE:'#1e4a26',f:'#3a8a46',fL:'#7ad888',g:'#2fbf5a',gL:'#b0ffc0',brilho:'#9cff9c'},
  blue:{mE:'#3a2416',m:'#6a4228',mL:'#8a5c38',fE:'#1a3466',f:'#2f62c0',fL:'#7ab4ff',g:'#3a8aff',gL:'#cfe6ff',brilho:'#9ccaff'},
  purple:{mE:'#2a1624',m:'#4e2a42',mL:'#6e3e5c',fE:'#3a1a5e',f:'#7a3cc0',fL:'#c89cff',g:'#b05cff',gL:'#f0d8ff',brilho:'#d8a8ff'},
  gold:{mE:'#3e1410',m:'#6e2a1e',mL:'#8e3e2a',fE:'#7a4a0e',f:'#d09a22',fL:'#ffe27a',g:'#e0303a',gL:'#ffb0b0',brilho:'#ffe27a'}
 };
 function grade(w,h,cores){
  const nomes=['',...Object.keys(cores)],idx=Object.fromEntries(nomes.map((n,i)=>[n,i])),px=new Array(w*h).fill(0);
  const g={p(x,y,c){if(x>=0&&y>=0&&x<w&&y<h)px[y*w+x]=idx[c]},r(x,y,ww,hh,c){for(let j=0;j<hh;j++)for(let i=0;i<ww;i++)g.p(x+i,y+j,c)},
   data(){return{w,h,q:1,palette:['',...Object.keys(cores).map(n=>cores[n])],pixels:px.map(c=>c.toString(36)).join('')}}};
  return g;
 }
 const cache={};
 // na paleta do jogo (2026-10-30, pedido do usuário): o desenho convertido uma vez e guardado
 const naPaleta=d=>root.PALETA_JOGO?root.PALETA_JOGO.dadosNaPaleta(d):d,memoPal=new Map(),guardado=(k,fn)=>{if(!memoPal.has(k))memoPal.set(k,naPaleta(fn()));return memoPal.get(k)};
 function arte(tier,aberto){return guardado(tier+'|'+aberto,()=>arteBruta(tier,aberto))}
 function arteBruta(tier,aberto){
  tier=PAL[tier]?tier:'blue';const k=tier+(aberto?'a':'f');if(cache[k])return cache[k];
  const c={contorno:'#160e0a',sombra:'#0c0a10',dentro:'#140c0a',...PAL[tier]},W=22,H=aberto?22:18,g=grade(W,H,c);
  const base=H-1; // linha da sombra
  g.r(3,base,16,1,'sombra');
  // corpo: tábuas com veio, contorno, cintas de ferragem e cantoneiras
  const y0=aberto?12:8,y1=base-1;
  g.r(2,y0,18,y1-y0+1,'contorno');g.r(3,y0+1,16,y1-y0-1,'m');
  for(let y=y0+3;y<y1;y+=3)g.r(3,y,16,1,'mE');
  g.r(3,y0+1,16,1,'mL');
  for(const x of [4,16]){g.r(x,y0,2,y1-y0+1,'fE');g.r(x,y0+1,1,y1-y0-1,'f');}
  g.r(2,y1-1,18,1,'fE');g.r(3,y1-1,16,1,'f');
  if(tier==='gold'||tier==='purple'){g.p(4,y0+2,'fL');g.p(17,y0+2,'fL')}
  if(aberto){
   // tampa aberta, inclinada para trás (vista por dentro) e o tesouro brilhando
   g.r(2,1,18,9,'contorno');g.r(3,2,16,7,'mE');g.r(3,2,16,1,'m');
   for(const x of [4,16]){g.r(x,1,2,9,'fE');g.r(x,2,1,7,'f')}
   g.r(3,10,16,2,'dentro');g.r(2,10,1,3,'contorno');g.r(19,10,1,3,'contorno');
   const brilho=tier==='madeira'?'mL':'brilho';
   g.r(6,10,10,2,brilho);g.p(8,9,brilho);g.p(12,9,'gL');g.p(14,10,'gL');
   g.r(10,y0,2,3,'fE');g.p(10,y0+1,'g');
  }else{
   // tampa abaulada fechada
   g.r(3,1,16,1,'contorno');g.r(2,2,18,6,'contorno');g.r(3,2,16,5,'m');g.r(4,2,14,1,'mL');g.r(3,5,16,1,'mE');
   for(const x of [4,16]){g.r(x,1,2,7,'fE');g.r(x,2,1,5,'f')}
   g.r(2,7,18,2,'fE');g.r(3,7,16,1,'f');g.r(3,7,16,1,'fL');g.p(2,7,'contorno');g.p(19,7,'contorno');
   // fechadura com a pedra da categoria (madeira: só o trinco de ferro)
   g.r(9,6,4,5,'fE');g.r(10,7,2,3,tier==='madeira'?'f':'g');g.p(10,7,tier==='madeira'?'fL':'gL');
   if(tier==='gold'){g.p(7,3,'fL');g.p(14,3,'fL');g.p(11,1,'fL')}
  }
  return cache[k]=g.data();
 }
 // categoria nova para os nomes antigos (antes: blue/purple/gold com estilos)
 const tipo=t=>PAL[t]?t:'blue';
 // faixa de qualidade final de um baú: a da tabela dele (ou da categoria) mais o aumento de qualidade dele
 function faixaQualidade(bau){
  const t=tipo(bau&&bau.tier),l=bau&&bau.loot,q=QUALIDADE[t],b=Math.round(+(bau&&bau.qualidadeBonus)||0);
  let mn=l&&l.qualityMin!=null?+l.qualityMin:q[0],mx=l&&l.qualityMax!=null?+l.qualityMax:q[1];
  mn=Math.max(1,Math.min(100,mn+b));mx=Math.max(mn,Math.min(100,mx+b));return [mn,mx];
 }
 root.BAUS={TIPOS,NOME,COR,QUALIDADE,LOOT_PADRAO,arte,tipo,faixaQualidade,
  // cópia da tabela da categoria; existe(id) tira os itens que o projeto não tem
  lootPadrao:(t,existe)=>{const l=JSON.parse(JSON.stringify(LOOT_PADRAO[tipo(t)]));if(existe)l.items=l.items.filter(x=>existe(x.id));return l}};
})(typeof window!=='undefined'?window:globalThis);
