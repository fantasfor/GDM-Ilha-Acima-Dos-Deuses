/* ---------- Plano de balanceamento (o mesmo de planejamento/Balanceamento.xlsx) ----------
   Equipamentos do nível 1 ao 30 (1 de cada tipo de arma física e mágica; capacete, peitoral, calça e bota) e o ataque
   básico dos monstros por nível, calculados com as Fórmulas do projeto:
     vida = vida base + Força × vida por Força · defesa = Agilidade × defesa por Agilidade (mágica: Inteligência)
     golpe = dano da arma × (1 + Força × % por ponto) (mágico: Inteligência) · dano final = golpe − defesa
   Alvo: herói e monstro do mesmo nível, com os atributos da classe de referência, precisam de GOLPES golpes para se matar;
   a armadura completa absorve ARMADURA do golpe do monstro. Valores para itens de qualidade 50%.
   Usado pela Engine (engine/js/project.js criarEquipamentos) e pelo jogo (ataque dos monstros e drops por nível). */
(function(root){
 const PARAM={golpes:10,min:.67,max:1.33,armadura:.25,pecas:{ch:.40,le:.25,he:.20,bo:.15},magica:.5,duasMaos:.10,distancia:.15,escudo:.5,niveis:30};
 // tipos de arma (chave do js/pacote-armas.js): velocidade de ataque %, duas mãos, alcance; o mesmo dano por segundo para todos
 const TIPOS=[
  ['espada','Espada',0,false,22],['espada_grande','Espada Grande',-12,true,26],['adaga','Adaga',25,false,18],['arco','Arco',0,true,140],
  ['besta','Besta',-22,true,160],['manopla','Manopla',20,false,16],['machado','Machado',0,true,24],['martelo','Martelo',-18,true,24],
  ['lanca','Lança',0,true,34],['machadinha','Machadinha',8,false,20],['maca','Maça',0,false,20],['escudo','Escudo',0,false,16],
  ['cajado','Cajado',0,true,120],['vara','Vara',0,false,110],['orbe','Orbe',0,false,120]
 ].map(([chave,nome,vel,duas,alcance])=>({chave,nome,vel,duas,alcance}));
 const PECAS=[['he','Capacete'],['ch','Peitoral'],['le','Calça'],['bo','Bota']];
 // material por faixa de 5 níveis (nome e cores do ícone das armaduras)
 const MATERIAIS=[['Cobre','#b87333','#e0a070'],['Bronze','#cd7f32','#f0c070'],['Ferro','#9aa7b8','#c0392b'],['Aço','#c0c8d4','#3c7be0'],['Prata','#e0e4ec','#9b6bff'],['Ouro','#d9a62e','#e03c3c']];
 const material=n=>MATERIAIS[Math.min(MATERIAIS.length-1,Math.floor((n-1)/5))];
 const PADRAO_CALC={hp0:50,hpPerF:2,armPerA:.5,magArmPerI:.5,physPerF:.2,magPerI:.2};
 const PADRAO_CLASSE={war:{attrs:{F:25,A:15,I:5},per:{F:6,A:3,I:1}},mag:{attrs:{F:5,A:5,I:15},per:{F:1,A:2,I:5}}};
 const num=(v,d)=>Number.isFinite(+v)&&v!==''&&v!=null?+v:d;
 const atr=(c,k,n)=>num(c&&c.attrs&&c.attrs[k],0)+(n-1)*num(c&&c.per&&c.per[k],0);
 const faixa=(media,p=PARAM)=>{const min=Math.max(1,Math.round(media*p.min));return{min,max:Math.max(min,Math.round(media*p.max)),media}};
 /* números de um nível: calc = Fórmulas do projeto; classes = {war, mag} no formato do projeto (attrs, per) */
 function nivel(n,calc={},classes={}){
  const c={...PADRAO_CALC,...Object.fromEntries(Object.entries(calc||{}).filter(([,v])=>v!==''&&v!=null))},p=PARAM;
  const war=classes.war||PADRAO_CLASSE.war,mag=classes.mag||PADRAO_CLASSE.mag;
  const F=atr(war,'F',n),A=atr(war,'A',n),vida=c.hp0+F*c.hpPerF,defesa=Math.round(A*c.armPerA),G=1+F*c.physPerF/100;
  const armaFisica=(vida/p.golpes+defesa)/G,golpeMonstro=(vida/p.golpes+defesa)/(1-p.armadura),armadura=Math.round(golpeMonstro*p.armadura);
  const Fm=atr(mag,'F',n),Im=atr(mag,'I',n),vidaMago=c.hp0+Fm*c.hpPerF,defMag=Math.round(Im*c.magArmPerI),U=1+Im*c.magPerI/100;
  return{n,F,A,vida,defesa,armaFisica,armaMagica:(vidaMago/p.golpes+defMag)/U,armadura,ataqueMonstro:golpeMonstro/G};
 }
 const multiplicador=t=>(1-t.vel/100)*(t.duas?1+PARAM.duasMaos:1)*(t.alcance>=60?1-PARAM.distancia:1)*(t.chave=='escudo'?PARAM.escudo:1);
 /* lista dos equipamentos do plano: {id, nome, nivel, tipo:'arma'|'armadura', ...}; o nível só organiza o plano:
    o item não guarda nível (o nome usa I–V dentro de cada material) */
 const variante=n=>['I','II','III','IV','V'][(n-1)%5];
 function equipamentos(calc,classes){
  const out=[];
  for(let n=1;n<=PARAM.niveis;n++){
   const N=nivel(n,calc,classes),[mat,c1,c2]=material(n),nn=String(n).padStart(2,'0');
   for(const t of TIPOS){const magica=['cajado','vara','orbe'].includes(t.chave),f=faixa((magica?N.armaMagica:N.armaFisica)*multiplicador(t));
    out.push({tipo:'arma',id:'eq_'+t.chave+'_'+nn,nome:t.nome+' de '+mat+' '+variante(n),nivel:n,chave:t.chave,magica,min:f.min,max:f.max})}
   for(const [slot,nome] of PECAS){const arm=Math.max(0,Math.round(N.armadura*PARAM.pecas[slot]));
    out.push({tipo:'armadura',id:'eq_'+slot+'_'+nn,nome:nome+' de '+mat+' '+variante(n),nivel:n,slot,arm,magicArm:Math.round(arm*PARAM.magica),c1,c2,estilo:Math.min(2,Math.floor((n-1)/10))})}
  }
  return out;
 }
 /* ataque básico (mín–máx) de um monstro do nível n: mata o herói de referência com a armadura completa em GOLPES golpes */
 const cacheAtaque=new Map();
 function ataqueMonstro(n,calc,classes){
  const k=n+'|'+JSON.stringify(calc||{});if(cacheAtaque.has(k))return cacheAtaque.get(k);
  const f=faixa(nivel(Math.max(1,Math.round(n)),calc,classes).ataqueMonstro);if(cacheAtaque.size>200)cacheAtaque.clear();cacheAtaque.set(k,f);return f;
 }
 root.BALANCEAMENTO={PARAM,TIPOS,PECAS,MATERIAIS,nivel,equipamentos,ataqueMonstro,versao:'equip-v1'};
})(typeof window!=='undefined'?window:globalThis);
