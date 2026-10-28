/* ---------- Estatísticas da DG (2026-10-28) ----------
   Do começo ao fim de cada DG, cada jogador conta o que é EFETIVO:
    - dano causado (físico, mágico e total): só a vida que o monstro realmente perdeu (o excesso do golpe que mata não conta);
      dano contínuo verdadeiro entra só no total;
    - dano recebido (físico, mágico e total): só a vida que o herói realmente perdeu;
    - cura efetiva: só a vida que voltou de fato (curar quem está cheio não conta), de habilidades e efeitos (não conta poção
      nem regeneração). Quem recebe a cura anota de quem ela veio; a cura de cada um é a soma do que os outros anotaram.
   Zera ao entrar na DG (dungeon.js enterGoblinDungeon). No grupo, cada um grava os próprios números em
   salas/{sala da DG}/stats/{uid} (a cada 2 s) e o painel do fim junta todos. Empate: todos os empatados aparecem. */
(function(){
 const vazio=()=>({ff:0,fm:0,ft:0,rf:0,rm:0,rt:0,cura:{}});
 let eu=vazio(),ativo=false,sujo=false;
 const meuId=()=>window.NUVEM&&NUVEM.uid||'eu';
 const meuNome=()=>window.NUVEM&&NUVEM.nome?NUVEM.nome():'Você';
 const pos=v=>Number.isFinite(v)&&v>0;
 const serial=s=>({n:String(meuNome()).slice(0,18),d:[s.ff,s.fm,s.ft,s.rf,s.rm,s.rt].map(v=>Math.round(v)),c:Object.fromEntries(Object.entries(s.cura).map(([k,v])=>[k,Math.round(v)]))});
 window.STATS_DG={
  zerar(){eu=vazio();ativo=true;sujo=true},
  dano(f,m,t){if(!ativo||!window.inDungeon||!pos(t))return;eu.ff+=f||0;eu.fm+=m||0;eu.ft+=t;sujo=true},
  recebido(f,m,t){if(!ativo||!window.inDungeon||!pos(t))return;eu.rf+=f||0;eu.rm+=m||0;eu.rt+=t;sujo=true},
  cura(v,de){if(!ativo||!window.inDungeon||!pos(v))return;const k=de||meuId();eu.cura[k]=(eu.cura[k]||0)+v;sujo=true},
  get meus(){return eu},
  // fim da DG (dungeon.js exitDungeon): junta os números (do grupo, se houver) e mostra o painel
  fim(){
   if(!ativo)return;ativo=false;
   const meu={id:meuId(),...serial(eu)},sala=window.MP&&MP.dgSala,db=window.NUVEM&&NUVEM.db;
   if(!eu.ft&&!eu.rt&&!Object.keys(eu.cura).length&&!sala)return; // DG sem combate e sem grupo: nada a mostrar
   if(!sala||!db){mostrar([meu]);return}
   const ref=db.ref('salas/'+sala+'/stats');
   const espera=new Promise(r=>setTimeout(()=>r(null),2500));
   const leitura=ref.child(meuId()).set({n:meu.n,d:meu.d,c:meu.c}).catch(()=>{}).then(()=>ref.once('value')).then(s=>s.val()).catch(()=>null);
   Promise.race([leitura,espera]).then(v=>{const lista=v?Object.entries(v).map(([id,o])=>({id,n:o&&o.n||'?',d:Array.isArray(o&&o.d)?o.d:[0,0,0,0,0,0],c:o&&o.c||{}})):[];if(!lista.some(x=>x.id===meu.id))lista.push(meu);mostrar(lista)});
  }
 };
 // envio dos meus números para a sala da DG do grupo (no máximo a cada 2 s, só quando mudaram)
 setInterval(()=>{if(!sujo||!ativo||!window.NUVEM||!NUVEM.db||!window.MP||!MP.dgSala)return;sujo=false;const s=serial(eu);NUVEM.db.ref('salas/'+MP.dgSala+'/stats/'+NUVEM.uid).set(s).catch(()=>{})},2000);

 /* ---- painel do fim ---- */
 const CATEGORIAS=[['Mais dano físico causado',x=>x.d[0]],['Mais dano mágico causado',x=>x.d[1]],['Mais dano total causado',x=>x.d[2]],
  ['Mais dano físico recebido',x=>x.d[3]],['Mais dano mágico recebido',x=>x.d[4]],['Mais dano total recebido',x=>x.d[5]],['Mais cura efetiva',x=>x.curaFeita]];
 // destaque de uma categoria: maior valor; empatados aparecem todos ("A e B (empate)"); tudo zero = ninguém
 function destaque(lista,val){const max=Math.max(0,...lista.map(val));if(max<=0)return['—',0];const top=lista.filter(x=>val(x)===max).map(x=>x.n);return[top.join(' e ')+(top.length>1?' (empate)':''),max]}
 function mostrar(lista){
  for(const x of lista)x.curaFeita=lista.reduce((s,o)=>s+(+(o.c&&o.c[x.id])||0),0);
  const E=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
  let box=document.getElementById('statsDG');if(box)box.remove();
  box=E('div');box.id='statsDG';box.setAttribute('role','dialog');box.setAttribute('aria-label','Estatísticas da masmorra');
  const p0=E('div','sdgBox');p0.append(E('h3','','Estatísticas da masmorra'));
  const dest=E('div','sdgDestaques');for(const [rot,val] of CATEGORIAS){const [quem,v]=destaque(lista,val);const l=E('div','sdgLinha');l.append(E('span','',rot),E('b','',quem),E('i','',v?String(v):''));dest.append(l)}p0.append(dest);
  // tabela de todos (ordem: mais dano total)
  const tab=E('table','sdgTabela'),cab=E('tr');['Jogador','Dano fís.','Dano mág.','Dano total','Receb. fís.','Receb. mág.','Receb. total','Cura'].forEach(t=>cab.append(E('th','',t)));tab.append(cab);
  for(const x of lista.slice().sort((a,b)=>b.d[2]-a.d[2])){const tr=E('tr');tr.append(E('td','',x.n));for(const v of [...x.d,x.curaFeita])tr.append(E('td','',String(v)));tab.append(tr)}
  p0.append(tab,E('p','sdgNota','Valores efetivos: o excesso do golpe final e a cura em quem já estava cheio não contam.'));
  const ok=E('button','mb','Fechar');ok.type='button';ok.onclick=()=>box.remove();p0.append(ok);box.append(p0);document.body.append(box);
 }
 window.STATS_DG.mostrar=mostrar; // testes
})();
