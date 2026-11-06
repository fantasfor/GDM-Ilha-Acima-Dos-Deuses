/* ---------- Jogos do Cassino Arcano (2026-11-04, pedido do usuário) ----------
   Os 3 jogos mais famosos dos cassinos, no estilo do jogo, com apostas em ouro:
   - Caça-níquel (uma máquina por pessoa): 3 rolos com Moeda, Poção, Espada, Glooc, Caveira, Coroa e o Javali Dourado
     (prêmio máximo); paga 3 iguais ou 2 iguais (tabela PAGA3/PAGA2; retorno médio ~91%).
   - Roleta (europeia, 0–36): rodadas para todos na mesa, 20 s de apostas; número (36×), cor, par/ímpar, metade (2×),
     dúzia e coluna (3×). O giro é igual para todos (sai do estado da mesa).
   - Blackjack (21): 4 lugares por mesa, a banca compra até 17; blackjack paga 2,5×, vitória 2×, empate devolve.
     Pedir, Parar e Dobrar; 20 s por vez (passou, para sozinho).
   Mecânica das mesas da taverna (js/mesas.js): cassino/{mesa} no Firebase = {estado, assentos: {i: uid},
   apostas: {rodada: {uid: {nome, l}}}}; o estado anda por transações (qualquer um que está no cassino empurra a rodada
   quando o tempo acaba; a transação garante uma vez só). Sem conta ou nos testes: mesa local na memória.
   Ouro: cada jogador paga a própria aposta e recebe o próprio prêmio (uma vez por rodada; pagos guardados).
   O mapa (js/cassino.js) abre os painéis (CASSINO_JOGOS.abrir) e desenha as mesas com estes dados. */
(function(){
 const ROLETAS=['rol1','rol2'],BJS=['bj1','bj2'],IDS=[...ROLETAS,...BJS];
 const NOME={rol1:'Roleta da Lua',rol2:'Roleta do Sol',bj1:'Blackjack das Runas',bj2:'Blackjack do Dragão'};
 const ROL_APOSTAS=20000,GIRO_MS=8000,RES_MS=4500,BJ_APOSTAS=12000,BJ_VEZ=20000,MAX_ROL=10000,MAX_BJ=5000;
 const FICHAS=[1,5,10,25,50,100,500];
 const clone=o=>o==null?o:JSON.parse(JSON.stringify(o));
 const online=()=>!!(window.NUVEM&&NUVEM.conectado&&NUVEM.db&&window.CONTA_ATIVA&&!(window.MODO&&MODO.teste));
 const eu=()=>online()?NUVEM.uid:'local';
 const meuNome=()=>(online()&&NUVEM.nome?NUVEM.nome():(window.p&&p.name)||'Você').slice(0,24);
 let deslocamento=0;const agora=()=>Date.now()+deslocamento;
 const som=(n,v)=>{if(window.playGameSound)playGameSound(n,v==null?1:v)};
 const aviso=(t,c)=>{if(window.ft&&window.p)ft(p.x,p.y-30,t,c||'#efc56a')};
 const salvar=()=>{if(window.saveGame)saveGame()};
 const ouro=()=>p.gold|0;
 // lista de um objeto do Firebase (que às vezes vira array)
 const entradas=o=>o?Object.entries(o).filter(([,v])=>v!=null):[];

 /* ================= pixel art (2026-11-04, pedido do usuário: só elementos de pixel art) =================
    elipse e contorno pixel a pixel (sem arco suavizado), luz em degraus (sem degradê) e números na fonte 3×5 */
 const PX={
  elipse(g,cx,cy,rx,ry,cor,metade){cx=Math.round(cx);cy=Math.round(cy);if(cor)g.fillStyle=cor;
   for(let y=metade==='baixo'?0:-ry;y<=(metade==='cima'?0:ry);y++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(y/ry)**2)));g.fillRect(cx-w,cy+y,w*2+1,1)}},
  contorno(g,cx,cy,rx,ry,cor,a0=0,a1=Math.PI*2){g.fillStyle=cor;const n=Math.ceil((rx+ry)*4);let ux=null,uy=null;
   for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,x=Math.round(cx+Math.cos(a)*rx),y=Math.round(cy+Math.sin(a)*ry);if(x!==ux||y!==uy){g.fillRect(x,y,1,1);ux=x;uy=y}}},
  // luz: 4 discos achatados com a mesma cor somando para o centro (degraus nítidos)
  luz(g,x,y,r,cor,a){if(!(a>0)||r<2)return;g.save();g.globalCompositeOperation='screen';g.globalAlpha=Math.min(1,a*.34);g.fillStyle=cor;
   for(let k=4;k>=1;k--){const rr=Math.max(1,Math.round(r*k/4));PX.elipse(g,x,y,rr,Math.max(1,Math.round(rr*.8)))}g.restore()},
  num(g,txt,x,y,cor,sombra){PX.texto(g,txt,x,y,cor,sombra)},
  // letreiros em fonte de pixel 3×5 (maiúsculas, sem acento), centrados em x; e = tamanho de cada pixel
  texto(g,txt,x,y,cor,sombra,e=1){txt=String(txt).normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase();const w=(txt.length*4-1)*e;let x0=Math.round(x-w/2);y=Math.round(y);
   for(const ch of txt){const m=DIG[ch];if(m)for(let i=0;i<15;i++)if(m[i]==='1'){if(sombra){g.fillStyle=sombra;g.fillRect(x0+(i%3)*e+e,y+(i/3|0)*e+e,e,e)}g.fillStyle=cor;g.fillRect(x0+(i%3)*e,y+(i/3|0)*e,e,e)}x0+=4*e}}};
 const DIG={'0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001111','+':'000010111010000','-':'000000111000000','X':'101101010101101',' ':'000000000000000','<':'001010100010001','>':'100010001010100','·':'000000010000000',':':'000010000010000','.':'000000000000010','!':'010010010000010',
  A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',
  N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',Y:'101101010010010',Z:'111001010100111'};

 /* ================= armazenamento (Firebase ou memória, a mesma interface) ================= */
 const dados={};IDS.forEach(id=>dados[id]={estado:null,assentos:{},apostas:{}});
 const LOCAL={},escutando=new Set();let relogio=false;
 const caminho=(id,campo)=>campo.split('/').reduce((o,k)=>o&&o[k],LOCAL[id]);
 function localDefine(id,campo,val){LOCAL[id]=LOCAL[id]||{};const ks=campo.split('/');let o=LOCAL[id];for(let i=0;i<ks.length-1;i++)o=o[ks[i]]=o[ks[i]]||{};if(val==null)delete o[ks[ks.length-1]];else o[ks[ks.length-1]]=clone(val);chegou(id,clone(LOCAL[id]))}
 function transacao(id,campo,fn){
  if(online())return NUVEM.db.ref('cassino/'+id+'/'+campo).transaction(cur=>{const r=fn(cur);return r===undefined?undefined:r}).then(r=>r.committed).catch(()=>false);
  const r=fn(clone(caminho(id,campo)??null));if(r===undefined)return Promise.resolve(false);localDefine(id,campo,r);return Promise.resolve(true)}
 function definir(id,campo,val){if(online())return NUVEM.db.ref('cassino/'+id+'/'+campo).set(val).then(()=>true).catch(()=>false);localDefine(id,campo,val);return Promise.resolve(true)}
 function escutar(id){if(escutando.has(id))return;escutando.add(id);
  if(online()){NUVEM.db.ref('cassino/'+id).on('value',s=>chegou(id,s.val()));if(!relogio){relogio=true;NUVEM.db.ref('.info/serverTimeOffset').on('value',s=>{deslocamento=+s.val()||0})}}
  else chegou(id,clone(LOCAL[id]||null))}
 function pararDeEscutar(){if(online())for(const id of escutando)NUVEM.db.ref('cassino/'+id).off();escutando.clear()}
 function chegou(id,v){dados[id]={estado:(v&&v.estado)||null,assentos:(v&&v.assentos)||{},apostas:(v&&v.apostas)||{}};if(painel.id===id)painel.sujo=true}

 /* pagamentos já feitos (não paga duas vezes a mesma rodada, nem recarregando a página) */
 const pagos=new Set((()=>{try{return JSON.parse(localStorage.getItem('cassino-pagos')||'[]')}catch(e){return[]}})());
 function marcarPago(k){pagos.add(k);try{localStorage.setItem('cassino-pagos',JSON.stringify([...pagos].slice(-80)))}catch(e){}}
 const ganhar=(v,txt)=>{if(v<=0)return;p.gold=ouro()+v;salvar();aviso(txt||('+'+v+' ouro'),'#efc56a')};
 const pagar=v=>{if(v<=0)return true;if(ouro()<v){aviso('Ouro insuficiente','#cf4554');return false}p.gold=ouro()-v;return true};

 /* ================= CAÇA-NÍQUEL ================= */
 const SIMB=['moeda','pocao','espada','glooc','caveira','coroa','javali'];
 const PESO={moeda:30,pocao:24,espada:18,glooc:12,caveira:8,coroa:5,javali:3};
 const PAGA3={moeda:4,pocao:10,espada:20,glooc:40,caveira:80,coroa:200,javali:500};
 const PAGA2={moeda:0,pocao:1,espada:1,glooc:2,caveira:3,coroa:5,javali:10};
 const NOME_SIMB={moeda:'Moeda',pocao:'Poção',espada:'Espada',glooc:'Glooc',caveira:'Caveira',coroa:'Coroa',javali:'Javali Dourado'};
 const FITA=['moeda','pocao','espada','moeda','glooc','pocao','caveira','moeda','espada','coroa','pocao','moeda','glooc','espada','javali','pocao','moeda','espada','caveira','pocao'];
 function sortear(){let r=Math.random()*100;for(const s of SIMB){r-=PESO[s];if(r<0)return s}return 'moeda'}
 function premioSlot(res){const c={};res.forEach(s=>c[s]=(c[s]||0)+1);
  for(const s in c)if(c[s]===3)return{mult:PAGA3[s],s,n:3};
  for(const s in c)if(c[s]===2&&PAGA2[s])return{mult:PAGA2[s],s,n:2};
  return{mult:0}}
 const slot={aposta:5,maquina:0,girando:false,rolos:[0,1,2].map(r=>({pos:r*7,de:0,ate:0,ini:0,dur:0,parou:true})),res:null,ganho:0,premio:null,fim:0,alav:-9,ultTique:0,moedas:[],faiscas:[],ultimoGanho:0,jogadas:0,hist:[]};
 /* prêmios do caça-níquel para todos (2026-11-04, pedido do usuário): quem ganha manda {u, nome, m (máquina), v, x, j}
    para cassinoFeed; os outros ouvem o som de prêmio vindo daquela máquina (mais baixo de longe), a máquina pisca no
    mapa e o prêmio entra no histórico do cassino (mural e janela do caça-níquel) */
 const feed=[];let feedRef=null,feedLigado=false;
 function enviarFeed(v,mult,jack){const o={u:eu(),nome:meuNome(),m:slot.maquina|0,v,x:mult,j:jack?1:0};
  if(online())NUVEM.db.ref('cassinoFeed').push({...o,t:firebase.database.ServerValue.TIMESTAMP}).catch(()=>{});else chegouFeed({...o,t:Date.now()})}
 function chegouFeed(o){if(!o||!(o.v>0))return;if(feed.some(f=>f.t===o.t&&f.u===o.u))return;feed.unshift(o);feed.sort((a,b)=>(b.t||0)-(a.t||0));if(feed.length>12)feed.length=12;
  if(o.u!==eu()&&agora()-(o.t||0)<15000&&window.CASSINO){CASSINO.festaMaquina(o.m);const v=CASSINO.volumeEm('slot',o.m);if(v>.03)som(o.j?'jackpot':'slotOutro',v)}
  if(painel.tipo==='slot')painel.sujo=true}
 function ligarFeed(){if(feedLigado)return;feedLigado=true;if(!online())return;
  feedRef=NUVEM.db.ref('cassinoFeed').orderByChild('t').limitToLast(12);
  feedRef.on('child_added',s=>{const v=s.val();chegouFeed(v);if(v&&v.t<Date.now()-3600000)s.ref.remove().catch(()=>{})})} // prêmio de mais de 1 h: apaga
 function desligarFeed(){if(feedRef)feedRef.off();feedRef=null;feedLigado=false}
 function girarSlot(){
  if(slot.girando)return;if(!pagar(slot.aposta))return;salvar();
  slot.girando=true;slot.ganho=0;slot.premio=null;slot.res=[sortear(),sortear(),sortear()];slot.alav=performance.now();slot.jogadas++;som('slotAlavanca');
  const agoraMs=performance.now(),suspense=slot.res[0]===slot.res[1]&&PAGA3[slot.res[0]]>=40;
  slot.rolos.forEach((r,k)=>{const base=Math.floor(r.pos),voltas=FITA.length*(3+k);
   const alvos=FITA.map((s,i)=>i).filter(i=>FITA[i]===slot.res[k]),alvo=alvos[Math.random()*alvos.length|0];
   let fim=base+voltas;fim+=((alvo-fim)%FITA.length+FITA.length)%FITA.length;
   Object.assign(r,{de:r.pos,ate:fim,ini:agoraMs+180,dur:1050+k*480+(k===2&&suspense?1100:0),parou:false,susp:k===2&&suspense})})}
 // freia como um rolo de verdade, com um pequeno tranco no fim
 const easeRolo=t=>{if(t>=1)return 1;const a=1-Math.pow(1-t,3);return a+Math.sin(t*Math.PI)*.012};
 // now = Infinity termina o giro na hora (fechou a janela girando: o prêmio não se perde)
 function atualizarSlot(now){
  if(!slot.girando)return;let todos=true;
  slot.rolos.forEach((r,k)=>{if(r.parou)return;const t=Math.max(0,Math.min(1,(now-r.ini)/r.dur));
   const antes=Math.floor(r.pos);r.pos=r.de+(r.ate-r.de)*easeRolo(t);
   if(Math.floor(r.pos)!==antes&&now-slot.ultTique>45){slot.ultTique=now;som('slotTique')}
   if(t>=1){r.pos=r.ate;r.parou=true;som('slotPara'+k);slot.faiscas.push(...faiscas(52+k*52,64,'#efc56a',6));
    if(k===1&&slot.rolos[2].susp&&Number.isFinite(now))som('slotSuspense')} // os dois primeiros combinaram: rufar até o último parar
   else todos=false});
  if(todos){slot.girando=false;const pr=premioSlot(slot.res);slot.premio=pr;slot.fim=Number.isFinite(now)?now:performance.now();
   slot.hist.unshift({res:slot.res.slice(),v:pr.mult*slot.aposta,a:slot.aposta});if(slot.hist.length>5)slot.hist.length=5;painel.sujo=true;
   if(pr.mult>0){slot.ganho=pr.mult*slot.aposta;slot.ultimoGanho=slot.ganho;ganhar(slot.ganho,'Caça-níquel: +'+slot.ganho+' ouro!');
    // o prêmio sobe contando na tela, com o tilintar das moedas (mais tempo para prêmio maior)
    slot.conta={ini:slot.fim+250,dur:Math.min(3200,500+Math.log10(pr.mult+1)*900),ate:slot.ganho,ult:0};
    const jack=pr.s==='javali'&&pr.n===3,grande=pr.mult>=40;som(jack?'jackpot':grande?'slotGrande':'slotGanha');
    enviarFeed(slot.ganho,pr.mult,jack);if(window.CASSINO)CASSINO.festaMaquina(slot.maquina); // os outros jogadores ouvem o prêmio
    const n=Math.min(80,8+pr.mult*(pr.n===3?1.2:3));for(let i=0;i<n;i++)slot.moedas.push({x:120+(Math.random()-.5)*60,y:96,vx:(Math.random()-.5)*3.2,vy:-2-Math.random()*3.4,r:Math.random()*6,t:0})}
   else{slot.ultimoGanho=0;slot.conta=null;som(slot.res[0]===slot.res[1]&&PAGA3[slot.res[0]]>=40?'slotQuase':'slotPerde')}}} // "quase!": escapou o prêmio grande
 function faiscas(x,y,c,n){const a=[];for(let i=0;i<n;i++)a.push({x,y,vx:(Math.random()-.5)*2.4,vy:-Math.random()*2.2,c,t:0});return a}

 /* ================= ROLETA ================= */
 const RODA=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
 const VERMELHOS=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
 const corNum=n=>n===0?'verde':VERMELHOS.has(n)?'vermelho':'preto';
 const chaveAp=a=>a.t+':'+a.v;
 // ganhou? quanto volta (aposta × multiplicador, já com a aposta)
 function retornoRol(a,n){
  switch(a.t){case 'n':return n===+a.v?36:0;case 'cor':return n&&((a.v==='v')===VERMELHOS.has(n))?2:0;case 'par':return n&&((a.v==='par')===(n%2===0))?2:0;
   case 'meta':return n&&((+a.v===1)===(n<=18))?2:0;case 'duz':return n&&Math.ceil(n/12)===+a.v?3:0;case 'col':return n&&((n-1)%3)+1===+a.v?3:0}return 0}
 const NOME_AP=a=>a.t==='n'?'nº '+a.v:a.t==='cor'?(a.v==='v'?'Vermelho':'Preto'):a.t==='par'?(a.v==='par'?'Par':'Ímpar'):a.t==='meta'?(+a.v===1?'1–18':'19–36'):a.t==='duz'?(a.v+'ª dúzia'):('Coluna '+a.v);
 const minhasRol={}; // {id: {n, l:[{t,v,a}], pago}}
 const meus={}; // histórico dos seus resultados em cada mesa: {id: [{t: texto, v: ganho ou perda}]}
 function anguloRoda(id,now){ // ângulo da roda e da bola (iguais para todos: saem do estado da mesa)
  const e=dados[id]&&dados[id].estado,t=now==null?agora():now;if(!e)return{roda:t/3000%(Math.PI*2),bola:null,raio:1};
  const base=(e.n*1.7)%(Math.PI*2),pocket=n=>RODA.indexOf(n)/37*Math.PI*2;
  if(e.fase==='giro'&&e.ini){const s=Math.max(0,Math.min(1,(t-e.ini)/GIRO_MS)),wf=base+Math.PI*6,roda=base+Math.PI*6*(1-Math.pow(1-s,2)),bf=wf+pocket(e.num);
   const bola=bf-Math.PI*16*Math.pow(1-s,2.4),cai=Math.max(0,Math.min(1,(s-.62)/.22)),pulo=s>.62&&s<.92?Math.abs(Math.sin(s*60))*.08*(1-cai):0;
   return{roda,bola,raio:1-cai*.32+pulo,s,num:e.num}}
  const ult=e.ult;const parado=base+(t%600000)/9000;
  return{roda:parado,bola:ult?parado+pocket(ult.num):null,raio:.68,num:ult?ult.num:null}}
 async function apostarRol(id,a){
  const e=dados[id].estado;if(!e||e.fase!=='apostas'||agora()>e.ate-700){aviso('Apostas fechadas: espere a próxima rodada','#cf4554');return}
  let m=minhasRol[id];if(!m||m.n!==e.n)m=minhasRol[id]={n:e.n,l:[],pago:false};
  const total=m.l.reduce((s,x)=>s+x.a,0);if(total+a.a>MAX_ROL){aviso('Limite de '+MAX_ROL+' ouro por rodada','#cf4554');return}
  if(!pagar(a.a))return;
  const ex=m.l.find(x=>chaveAp(x)===chaveAp(a));if(ex)ex.a+=a.a;else m.l.push({...a});som('ficha');
  const ok=await definir(id,'apostas/'+e.n+'/'+eu(),{nome:meuNome(),l:m.l});
  if(!ok){p.gold=ouro()+a.a;if(ex)ex.a-=a.a;else m.l.pop();aviso('A aposta não foi aceita','#cf4554')}
  salvar();painel.sujo=true}
 async function limparRol(id){const e=dados[id].estado,m=minhasRol[id];if(!e||!m||m.n!==e.n||e.fase!=='apostas'||!m.l.length)return;
  const v=m.l.reduce((s,x)=>s+x.a,0);m.l=[];await definir(id,'apostas/'+e.n+'/'+eu(),null);p.gold=ouro()+v;salvar();som('ficha');painel.sujo=true}
 function avancarRol(id){
  transacao(id,'estado',cur=>{const t=agora();
   if(!cur||!cur.n)return{n:1,fase:'apostas',ate:t+ROL_APOSTAS,hist:[]};
   if(cur.fase==='apostas'){if(t<cur.ate)return undefined;const ap=dados[id].apostas[cur.n];
    if(!ap||!entradas(ap).length){cur.ate=t+ROL_APOSTAS;return cur}
    cur.fase='giro';cur.num=Math.random()*37|0;cur.ini=t;cur.ate=t+GIRO_MS+RES_MS;return cur}
   // hist[k] é o número da rodada histN-k (cada um recebe o prêmio da própria rodada, mesmo voltando depois)
   if(cur.fase==='giro'){if(t<cur.ate)return undefined;cur.hist=[cur.num,...(cur.hist||[])].slice(0,14);cur.histN=cur.n;cur.ult={n:cur.n,num:cur.num};const velha=cur.n-2;cur.n++;cur.fase='apostas';cur.ate=t+ROL_APOSTAS;delete cur.num;delete cur.ini;
    if(velha>0)setTimeout(()=>definir(id,'apostas/'+velha,null),500);return cur}
   return undefined})}
 function pagarRol(id){
  const e=dados[id].estado,m=minhasRol[id];if(!e||!m||m.pago||!m.l.length)return;
  let num=null;const hist=e.hist||[],k0=e.histN!=null?e.histN-m.n:-1;
  if(e.fase==='giro'&&e.n===m.n&&agora()>=e.ini+GIRO_MS)num=e.num;
  else if(k0>=0&&k0<hist.length)num=hist[k0];
  else if(k0>=hist.length){m.pago=true;return} // rodada velha demais (fora do histórico): não paga
  if(num==null)return;m.pago=true;const k=id+':'+m.n+':'+eu();if(pagos.has(k))return;marcarPago(k);
  const ganho=m.l.reduce((s,a)=>s+a.a*retornoRol(a,num),0),apostado=m.l.reduce((s,a)=>s+a.a,0);m.res={num,ganho,apostado};
  (meus[id]=meus[id]||[]).unshift({t:num+' '+corNum(num),v:ganho-apostado});if(meus[id].length>5)meus[id].length=5;
  if(ganho>0){ganhar(ganho,'Roleta: '+num+'! +'+ganho+' ouro');som(ganho>=apostado*10?'jackpot':'roletaGanha')}else{aviso('Roleta: deu '+num+' '+corNum(num),'#b8a47c');som('slotPerde')}
  painel.sujo=true}

 /* ================= BLACKJACK ================= */
 const NAIPES={e:'♠',c:'♥',o:'♦',p:'♣'};
 function novoBaralho(){const c=[];for(let d=0;d<4;d++)for(const r of 'A23456789TJQK')for(const s of 'eocp')c.push(r+s);for(let i=c.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[c[i],c[j]]=[c[j],c[i]]}return c.join('')}
 const cartas=s=>(s||'').match(/../g)||[];
 function valor(s){let t=0,a=0;for(const c of cartas(s)){const r=c[0];if(r==='A'){a++;t+=11}else t+='TJQK'.includes(r)?10:+r}while(t>21&&a){t-=10;a--}return t}
 const blackjack=s=>cartas(s).length===2&&valor(s)===21;
 const LUGARES=['l0','l1','l2','l3'];
 const assentoDe=(id,u)=>{for(const [k,v] of entradas(dados[id].assentos))if(v===u)return +k;return -1};
 function resultadoBJ(m,banca){const v=valor(m.c),b=valor(banca),bb=blackjack(banca);
  if(m.st==='estourou')return{r:'Estourou',x:0};
  if(m.st==='bj')return bb?{r:'Empate',x:1}:{r:'BLACKJACK!',x:2.5};
  if(bb)return{r:'Banca: blackjack',x:0};if(b>21)return{r:'Banca estourou!',x:2};if(v>b)return{r:'Ganhou!',x:2};if(v===b)return{r:'Empate',x:1};return{r:'Perdeu',x:0}}
 function proximaVez(cur,de){for(let i=de+1;i<4;i++){const m=cur.maos&&cur.maos[LUGARES[i]];if(m&&m.st==='joga')return i}return -1}
 function terminarBanca(cur,t){
  let bar=cur.bar||'';const vivos=entradas(cur.maos).some(([,m])=>m.st!=='estourou');
  if(vivos&&!blackjack(cur.banca))while(valor(cur.banca)<17){cur.banca+=bar.slice(0,2);bar=bar.slice(2)}
  cur.bar=bar;cur.fase='fim';cur.vez=-1;cur.fimEm=t;cur.ate=t+1200+cartas(cur.banca).length*650+4500;return cur}
 function passarVez(cur,t){cur.vez=proximaVez(cur,cur.vez);if(cur.vez<0)return terminarBanca(cur,t);cur.ate=t+BJ_VEZ;return cur}
 function avancarBJ(id){
  transacao(id,'estado',cur=>{const t=agora();
   if(!cur||!cur.n)return{n:1,fase:'apostas',ate:0,vez:-1};
   if(cur.fase==='apostas'){if(!cur.ate||t<cur.ate)return undefined;const ms=entradas(cur.maos);if(!ms.length){cur.ate=0;return cur}
    let bar=novoBaralho();const tira=()=>{const c=bar.slice(0,2);bar=bar.slice(2);return c};
    const ord=LUGARES.filter(k=>cur.maos[k]);for(const k of ord)cur.maos[k].c=tira();cur.banca=tira();for(const k of ord)cur.maos[k].c+=tira();cur.banca+=tira();
    for(const k of ord)cur.maos[k].st=blackjack(cur.maos[k].c)?'bj':'joga';
    cur.bar=bar;cur.fase='jogando';cur.ini=t;cur.vez=-1;
    if(blackjack(cur.banca)){for(const k of ord)if(cur.maos[k].st==='joga')cur.maos[k].st='parou';return terminarBanca(cur,t+ord.length*500)}
    passarVez(cur,t);if(cur.fase==='jogando')cur.ate=t+BJ_VEZ+(ord.length*2+2)*250;return cur}
   if(cur.fase==='jogando'){if(t<cur.ate)return undefined;const m=cur.maos&&cur.maos[LUGARES[cur.vez]];if(m&&m.st==='joga')m.st='parou';return passarVez(cur,t)}
   // histórico da mesa: o que a banca fez nas últimas mãos ('BJ', 'X' = estourou, ou o total)
   if(cur.fase==='fim'){if(t<cur.ate)return undefined;const b=cur.banca,h=blackjack(b)?'BJ':valor(b)>21?'X':valor(b);return{n:cur.n+1,fase:'apostas',ate:0,vez:-1,hist:[h,...(cur.hist||[])].slice(0,12)}}
   return undefined})}
 async function sentarBJ(id,i){
  if(assentoDe(id,eu())>=0)return true;
  const ok=await transacao(id,'assentos/'+i,cur=>cur&&cur!==eu()?undefined:eu());
  if(!ok){aviso('Esse lugar está ocupado','#cf4554');return false}
  if(online())NUVEM.db.ref('cassino/'+id+'/assentos/'+i).onDisconnect().remove();
  if(window.CASSINO)CASSINO.sentarHeroi(id,i);som('ficha');painel.sujo=true;return true}
 async function levantarBJ(id){const i=assentoDe(id,eu());if(i<0)return;
  const e=dados[id].estado,m=e&&e.maos&&e.maos[LUGARES[i]];
  if(e&&e.fase==='apostas'&&m&&m.u===eu())await retirarBJ(id);
  await transacao(id,'assentos/'+i,cur=>cur===eu()?null:undefined);if(window.CASSINO)CASSINO.levantarHeroi();painel.sujo=true}
 async function apostarBJ(id,v){
  const i=assentoDe(id,eu());if(i<0){aviso('Sente-se primeiro','#cf4554');return}
  const e=dados[id].estado;if(!e||e.fase!=='apostas'){aviso('Espere a próxima rodada','#cf4554');return}
  const atual=(e.maos&&e.maos[LUGARES[i]]&&e.maos[LUGARES[i]].ap)||0;if(atual+v>MAX_BJ){aviso('Limite de '+MAX_BJ+' ouro por mão','#cf4554');return}
  if(ouro()<v){aviso('Ouro insuficiente','#cf4554');return}
  const ok=await transacao(id,'estado',cur=>{if(!cur||cur.fase!=='apostas')return undefined;cur.maos=cur.maos||{};const k=LUGARES[i],m=cur.maos[k];
   cur.maos[k]={u:eu(),nome:meuNome(),ap:(m&&m.u===eu()?m.ap:0)+v,c:'',st:'ap'};if(!cur.ate)cur.ate=agora()+BJ_APOSTAS;return cur});
  if(ok){pagar(v);salvar();som('ficha')}else aviso('A aposta não entrou: a rodada começou','#cf4554');painel.sujo=true}
 async function retirarBJ(id){const i=assentoDe(id,eu());if(i<0)return;let v=0;
  const ok=await transacao(id,'estado',cur=>{if(!cur||cur.fase!=='apostas'||!cur.maos)return undefined;const m=cur.maos[LUGARES[i]];if(!m||m.u!==eu())return undefined;v=m.ap;delete cur.maos[LUGARES[i]];if(!entradas(cur.maos).length)cur.ate=0;return cur});
  if(ok&&v){p.gold=ouro()+v;salvar();som('ficha')}painel.sujo=true}
 async function agirBJ(id,acao){
  const i=assentoDe(id,eu());if(i<0)return;let extra=0;
  const e0=dados[id].estado,m0=e0&&e0.maos&&e0.maos[LUGARES[i]];
  if(acao==='dobrar'&&(!m0||ouro()<m0.ap)){aviso('Ouro insuficiente para dobrar','#cf4554');return}
  const ok=await transacao(id,'estado',cur=>{const t=agora();extra=0;if(!cur||cur.fase!=='jogando'||cur.vez!==i)return undefined;const m=cur.maos[LUGARES[i]];if(!m||m.u!==eu()||m.st!=='joga')return undefined;
   let bar=cur.bar||'';const tira=()=>{const c=bar.slice(0,2);bar=bar.slice(2);return c};
   if(acao==='pedir'){m.c+=tira();const v=valor(m.c);if(v>21)m.st='estourou';else if(v===21)m.st='parou'}
   else if(acao==='parar')m.st='parou';
   else if(acao==='dobrar'){if(cartas(m.c).length!==2)return undefined;extra=m.ap;m.ap*=2;m.dobrou=1;m.c+=tira();m.st=valor(m.c)>21?'estourou':'parou'}
   cur.bar=bar;if(m.st!=='joga')return passarVez(cur,t);cur.ate=t+BJ_VEZ;return cur});
  if(ok){if(acao==='parar')som('ficha');if(extra){pagar(extra);salvar()}}painel.sujo=true} // a carta tem som próprio (ciclo abaixo, para todos perto)
 function pagarBJ(id){
  const e=dados[id].estado;if(!e||e.fase!=='fim')return;const i=assentoDe(id,eu());
  for(const [k,m] of entradas(e.maos)){if(m.u!==eu())continue;const chave=id+':'+e.n+':'+k+':'+eu();if(pagos.has(chave))continue;
   if(agora()<e.fimEm+700+cartas(e.banca).length*650)return; // espera a banca virar as cartas
   marcarPago(chave);const r=resultadoBJ(m,e.banca),v=Math.floor(m.ap*r.x);
   (meus[id]=meus[id]||[]).unshift({t:r.r.replace('!','')+' ('+valor(m.c)+')',v:v-m.ap});if(meus[id].length>5)meus[id].length=5;painel.sujo=true;
   if(v>0){ganhar(v,'Blackjack: '+r.r+' +'+v+' ouro');som(r.x>=2.5?'bjBlackjack':r.x>=2?'bjVence':'ficha')}else{aviso('Blackjack: '+r.r,'#b8a47c');som('slotPerde')}}
  void i}

 /* ================= ciclo: escuta enquanto está na área da taverna; empurra as rodadas de dentro do cassino ================= */
 let naArea=false;
 setInterval(()=>{
  const dentro=!!window.inTaverna;
  if(dentro&&!naArea){IDS.forEach(escutar);ligarFeed()}
  if(!dentro&&naArea){for(const id of BJS)if(assentoDe(id,eu())>=0)levantarBJ(id);for(const id of ROLETAS)limparRol(id);fechar();pararDeEscutar();desligarFeed()}
  naArea=dentro;if(!dentro)return;
  const noCassino=window.CASSINO&&CASSINO.dentro();
  for(const id of IDS){if(noCassino||painel.id===id){if(id.startsWith('rol'))avancarRol(id);else avancarBJ(id)}
   if(id.startsWith('rol'))pagarRol(id);else pagarBJ(id);
   somDaMesa(id)}
 },300);
 /* sons das mesas para todos perto (2026-11-04, pedido do usuário): a bolinha girando na roleta (rolando, pulando nas
    casas e parando) e as cartas sendo jogadas no blackjack; o volume cai com a distância (com a janela aberta, cheio) */
 const ultFase={},ultCartas={};
 const volMesa=id=>painel.id===id?1:window.CASSINO?CASSINO.volumeEm('mesa',id):0;
 function somDaMesa(id){
  const e=dados[id].estado,f=e?e.fase+':'+e.n:'',antes=ultFase[id];ultFase[id]=f;
  if(id.startsWith('rol')){if(antes===undefined||f===antes||!e||e.fase!=='giro')return;
   const ini=e.ini,falta=x=>ini+x-agora(),aindaGira=()=>{const q=dados[id].estado;return q&&q.fase==='giro'&&q.ini===ini};
   if(falta(0)>-1500){const v=volMesa(id);if(v>.03)som('roletaGira',v)}
   setTimeout(()=>{if(!aindaGira())return;const v=volMesa(id);if(v>.03)som('roletaBola',v)},Math.max(0,falta(GIRO_MS*.62)));
   setTimeout(()=>{if(!aindaGira())return;const v=volMesa(id);if(v>.03)som('roletaPara',v)},Math.max(0,falta(GIRO_MS)));return}
  const n=e?cartas(e.banca).length+entradas(e.maos).reduce((s,[,m])=>s+cartas(m.c).length,0):0,c0=ultCartas[id];ultCartas[id]=n;
  const vira=antes!==undefined&&f!==antes&&e&&e.fase==='fim'; // a banca vira a carta escondida
  if(c0==null||(n<=c0&&!vira))return;const v=volMesa(id);if(v<=.03)return;
  if(vira)som('cartaVira',v);
  for(let k=0;k<Math.min(12,n-c0);k++)setTimeout(()=>som('carta',v),(vira?650:0)+k*(e.fase==='fim'?650:250))}

 /* ================= painel (tela do jogo) ================= */
 const painel={id:null,tipo:null,el:null,cv:null,g:null,ctrl:null,sujo:false,ficha:5,raf:0,ultimoDesenho:''};
 const E=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
 const B=(x,fn,c)=>{const b=E('button',c||'csBtn',x);b.type='button';b.onclick=e=>{e.stopPropagation();fn()};return b};
 function montar(){
  if(painel.el)return;const el=painel.el=E('div');el.id='cassinoPainel';el.setAttribute('role','dialog');el.hidden=true;
  const box=E('div','csBox'),topo=E('div','csTopo'),tit=E('b','csTitulo'),ouroEl=E('span','csOuro'),x=B('×',fechar,'biFechar');x.setAttribute('aria-label','Fechar');
  topo.append(tit,ouroEl,x);const palco=E('div','csPalco'),cv=E('canvas');palco.append(cv);const ctrl=E('div','csControles');
  box.append(topo,palco,ctrl);el.append(box);document.body.append(el);
  Object.assign(painel,{cv,g:cv.getContext('2d'),ctrl,tit,ouroEl});
  addEventListener('keydown',e=>{if(!painel.id)return;if(e.key==='Escape'){fechar();e.stopImmediatePropagation();e.preventDefault()}
   else if(painel.tipo==='slot'&&(e.code==='Space'||e.key==='Enter')&&!e.target.closest('input,textarea')){girarSlot();e.preventDefault();e.stopImmediatePropagation()}},true)}
 function abrir(id,extra){
  montar();if(window.$&&$('dialogue'))$('dialogue').classList.remove('open');
  painel.id=id;painel.tipo=id==='slot'?'slot':id.startsWith('rol')?'roleta':'bj';if(painel.tipo==='slot')slot.maquina=extra|0;
  painel.el.hidden=false;painel.el.className='cs-'+painel.tipo; // (".slot" já é a casinha da mochila no CSS do jogo)
  // o desenho é feito em 2× (texto nítido); as medidas do desenho continuam em pixels do jogo (w × h)
  const [w,h]=painel.tipo==='slot'?[240,128]:painel.tipo==='roleta'?[320,130]:[320,170];painel.cv.width=w*2;painel.cv.height=h*2;painel.w=w;painel.h=h;
  painel.tit.textContent=painel.tipo==='slot'?'Caça-níquel · Máquina '+((extra|0)+1):NOME[id];
  if(painel.tipo!=='slot')escutar(id);
  painel.sujo=true;controles();cancelAnimationFrame(painel.raf);const laço=()=>{if(!painel.id)return;quadro();painel.raf=requestAnimationFrame(laço)};laço()}
 function fechar(){if(!painel.id)return;const id=painel.id;painel.id=null;if(slot.girando)atualizarSlot(Infinity);if(painel.el)painel.el.hidden=true;cancelAnimationFrame(painel.raf);
  if(id&&id.startsWith('bj')&&assentoDe(id,eu())>=0)levantarBJ(id);if(typeof tipEl!='undefined')tipEl.style.display='none'}

 /* ---- controles (botões) ---- */
 function fichas(onde,max){const f=E('div','csFichas');f.append(E('span','','Ficha:'));
  for(const v of FICHAS){if(max&&v>max)continue;const b=B(String(v),()=>{painel.ficha=v;if(painel.tipo==='slot')slot.aposta=v;controles()},'csFicha f'+v+((painel.tipo==='slot'?slot.aposta:painel.ficha)===v?' sel':''));f.append(b)}onde.append(f)}
 function controles(){
  const c=painel.ctrl;if(!c)return;c.replaceChildren();painel.ouroEl.textContent=ouro()+' ouro';
  if(painel.tipo==='slot'){
   fichas(c,100);const a=E('div','csAcoes');const b=B(slot.girando?'Girando…':'Puxar a alavanca ('+slot.aposta+')',girarSlot,'csBtn grande');b.disabled=slot.girando||ouro()<slot.aposta;a.append(b);c.append(a);
   const t=E('div','csTabela');for(const s of [...SIMB].reverse()){const l=E('div','csLinha');l.append(icone(s),E('span','',NOME_SIMB[s]),E('b','','3× '+PAGA3[s]+'×'),E('small','',PAGA2[s]?'2× '+PAGA2[s]+'×':''));t.append(l)}c.append(t);
   // histórico: as suas jogadas nesta sessão e os prêmios de todos no cassino
   const h=E('div','csHist');h.append(E('b','','Suas jogadas'));const l1=E('div','csHistLista');
   for(const j of slot.hist){const it=E('span','csHistItem'+(j.v>0?' ganhou':''));j.res.forEach(s=>it.append(icone(s)));it.append(E('i','',j.v>0?'+'+j.v:'−'+j.a));l1.append(it)}
   if(!slot.hist.length)l1.append(E('i','csVazio','Nenhuma ainda'));h.append(l1);
   h.append(E('b','','Prêmios no cassino'));const l2=E('div','csHistLista');
   for(const f of feed.slice(0,5))l2.append(E('span','csHistItem ganhou'+(f.j?' jackpot':''),(f.u===eu()?'Você':String(f.nome||'Jogador').slice(0,14))+' · máq. '+((f.m|0)+1)+' · +'+f.v));
   if(!feed.length)l2.append(E('i','csVazio','Nenhum prêmio ainda'));h.append(l2);c.append(h);return}
  const id=painel.id,e=dados[id].estado;
  if(painel.tipo==='roleta'){
   const m=minhasRol[id],minhas=m&&e&&m.n===e.n?m.l:[],aberta=e&&e.fase==='apostas'&&agora()<e.ate-700;
   fichas(c);const outros={};const ap=e&&dados[id].apostas[e.n];for(const [u,v] of entradas(ap)){if(u===eu())continue;for(const a of v.l||[])outros[chaveAp(a)]=(outros[chaveAp(a)]||0)+a.a}
   const meu={};for(const a of minhas)meu[chaveAp(a)]=a.a;
   const cel=(a,txt,cls)=>{const b=B(txt,()=>apostarRol(id,{...a,a:painel.ficha}),'csCasa '+(cls||''));b.disabled=!aberta;const k=chaveAp(a);if(meu[k])b.append(E('i','csMinha',String(meu[k])));if(outros[k])b.append(E('i','csOutra',String(outros[k])));b.title=NOME_AP(a);return b};
   const pano=E('div','csPano');pano.append(cel({t:'n',v:0},'0','verde zero'));
   // o pano preenche coluna por coluna (CSS grid-auto-flow: column): em cima 3, 6… 36; embaixo 1, 4… 34
   for(let k=0;k<12;k++)for(let r=3;r>=1;r--){const n=k*3+r;pano.append(cel({t:'n',v:n},String(n),corNum(n)))}
   for(let r=3;r>=1;r--)pano.append(cel({t:'col',v:r},'2:1','fora col'));
   c.append(pano);const fora=E('div','csFora');
   for(const d of [1,2,3])fora.append(cel({t:'duz',v:d},d+'ª 12','fora'));
   fora.append(cel({t:'meta',v:1},'1–18','fora'),cel({t:'par',v:'par'},'PAR','fora'),cel({t:'cor',v:'v'},'◆','vermelho fora'),cel({t:'cor',v:'p'},'◆','preto fora'),cel({t:'par',v:'impar'},'ÍMPAR','fora'),cel({t:'meta',v:2},'19–36','fora'));
   c.append(fora);
   const a=E('div','csAcoes'),total=minhas.reduce((s,x)=>s+x.a,0);a.append(E('span','csInfo','Sua aposta: '+total+' ouro'));const lb=B('Limpar',()=>limparRol(id));lb.disabled=!aberta||!total;a.append(lb);c.append(a);
   histMesa(c,id,'Números da mesa',((e&&e.hist)||[]).slice(0,5).map(n=>{const s=E('span','csNum '+corNum(n),String(n));return s}));return}
  // blackjack
  const i=assentoDe(id,eu()),mao=i>=0&&e&&e.maos&&e.maos[LUGARES[i]];
  const histBJ=()=>histMesa(c,id,'Banca nas últimas mãos',((e&&e.hist)||[]).slice(0,5).map(h=>E('span','csNum '+(h==='BJ'?'bj':h==='X'?'estourou':'preto'),h==='X'?'Estourou':String(h))));
  if(i<0){const a=E('div','csAcoes');a.append(E('span','csInfo','Escolha um lugar:'));for(let k=0;k<4;k++){const oc=dados[id].assentos[k];const b=B(oc?'Ocupado':'Lugar '+(k+1),()=>sentarBJ(id,k));b.disabled=!!oc;a.append(b)}c.append(a);
   histBJ();return}
  if(e&&e.fase==='apostas'){fichas(c);const a=E('div','csAcoes');a.append(B('Apostar '+painel.ficha,()=>apostarBJ(id,painel.ficha),'csBtn grande'));
   if(mao&&mao.u===eu())a.append(E('span','csInfo','Na mesa: '+mao.ap+' ouro'),B('Retirar',()=>retirarBJ(id)));a.append(B('Levantar',()=>levantarBJ(id)));c.append(a)}
  else if(e&&e.fase==='jogando'&&e.vez===i&&mao&&mao.st==='joga'){const a=E('div','csAcoes');a.append(B('Pedir',()=>agirBJ(id,'pedir'),'csBtn grande'),B('Parar',()=>agirBJ(id,'parar'),'csBtn grande'));
   if(cartas(mao.c).length===2){const d=B('Dobrar ('+mao.ap+')',()=>agirBJ(id,'dobrar'));d.disabled=ouro()<mao.ap;a.append(d)}c.append(a)}
  else{const a=E('div','csAcoes');a.append(E('span','csInfo',e&&e.fase==='jogando'?(mao&&mao.st==='joga'?'Espere a sua vez…':'Aguardando os outros e a banca…'):'Fim da mão.'));c.append(a)}
  histBJ()}
 // histórico de uma mesa: o que saiu (de todos) e os seus resultados
 function histMesa(c,id,titulo,itens){const h=E('div','csHist');h.append(E('b','',titulo));const l=E('div','csHistLista');l.append(...itens);if(!itens.length)l.append(E('i','csVazio','Nada ainda'));h.append(l);
  h.append(E('b','','Seus resultados'));const l2=E('div','csHistLista');for(const r of meus[id]||[])l2.append(E('span','csHistItem'+(r.v>0?' ganhou':r.v<0?' perdeu':''),r.t+' · '+(r.v>0?'+':'')+r.v));
  if(!(meus[id]||[]).length)l2.append(E('i','csVazio','Nada ainda'));h.append(l2);c.append(h)}
 // ícone de um símbolo do caça-níquel (canvas 18×18)
 function icone(s){const ic=E('canvas','csIco');ic.width=18;ic.height=18;desenharSimb(ic.getContext('2d'),s,9,9);return ic}

 /* ================= desenho do painel (canvas pixel art, ampliado pelo CSS) ================= */
 const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 const COR={preto:'#000000',noite:['#311339','#4f2052','#74366e'],magia:['#4a1f6e','#7a3ca8','#b07ad8'],ouro:['#9a5a2a','#d08a3a','#efc56a'],sangue:['#6e1438','#a22b4b','#cf4554'],
  folha:['#263a3a','#3f6b45','#79a35a'],osso:['#7a6650','#b8a47c','#ddd0a6'],aco:['#3e3a52','#7c8098','#c4c8d6'],agua:['#2a2a52','#3d5a8c','#6e9cc4'],madeira:['#4e2430','#7d3f34','#a8653f'],pedra:['#3a3040','#5e5668','#8e8898'],terra:['#1f1a1a','#3a2a2a','#5a4038']};
 /* símbolos do caça-níquel (18×18, centro em x,y) */
 function desenharSimb(g,s,x,y){x=Math.round(x);y=Math.round(y);const px=(a,b,c)=>R(g,x+a,y+b,1,1,c);
  const disco=(cx,cy,r,f)=>{for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const d=Math.hypot(i,j);if(d<=r+.3){const c=f(i,j,d);if(c)px(cx+i,cy+j,c)}}};
  if(s==='moeda'){const O=COR.ouro;disco(0,0,7,(i,j,d)=>d>6.4?'#000000':d>5.4?O[0]:(i+j<-4?O[2]:d>3.6&&d<4.6?O[0]:O[1]));R(g,x-1,y-3,2,6,O[2]);R(g,x-2,y-3,4,1,O[2]);R(g,x-2,y+2,4,1,O[2]);px(-3,-4,'#ffffff')}
  else if(s==='pocao'){const S=COR.sangue;disco(0,3,5,(i,j,d)=>d>4.4?'#000000':j<-2?COR.aco[2]:(i<-1&&j<1?S[2]:j>2?S[0]:S[1]));R(g,x-2,y-6,4,5,'#000000');R(g,x-1,y-5,2,4,COR.aco[2]);R(g,x-2,y-8,4,3,'#000000');R(g,x-1,y-8,2,2,COR.madeira[2]);px(-2,1,'#ffffff');px(2,4,S[2])}
  else if(s==='espada'){const A=COR.aco;for(let k=0;k<11;k++){px(-5+k,5-k-1,'#000000');px(-4+k,5-k-1,A[2]);px(-4+k,5-k,A[1]);px(-3+k,5-k,'#000000')}
   for(let k=-3;k<=3;k++){px(-5+k,3+k,'#000000');px(-4+k,3+k,COR.ouro[1])}px(-7,7,COR.madeira[1]);px(-8,8,COR.madeira[0]);px(-6,6,COR.madeira[2]);px(-9,9,COR.ouro[2])}
  else if(s==='glooc'){const F=COR.folha;disco(0,2,7,(i,j,d)=>j<-3+Math.abs(i)*.15-1?null:d>6.4?'#000000':(i<-2&&j<1?F[2]:j>4?F[0]:F[1]));R(g,x-7,y+8,15,1,'#000000');
   for(const ex of [-3,2]){R(g,x+ex,y-1,2,3,'#ffffff');px(ex+1,0,'#000000')}R(g,x-1,y+4,3,1,F[0]);px(4,-2,F[2])}
  else if(s==='caveira'){const O=COR.osso;disco(0,-1,6,(i,j,d)=>d>5.4?'#000000':(i<-1&&j<-2?O[2]:j>3?O[0]:O[1]));R(g,x-3,y+4,7,4,'#000000');R(g,x-2,y+4,5,3,O[1]);px(-1,6,'#000000');px(1,6,'#000000');
   for(const ex of [-3,1]){R(g,x+ex,y-2,3,3,'#000000');px(ex+1,-1,'#ff4040')}px(0,2,'#000000')}
  else if(s==='coroa'){const O=COR.ouro;R(g,x-7,y-1,15,8,'#000000');R(g,x-6,y,13,6,O[1]);R(g,x-6,y+4,13,2,O[0]);R(g,x-6,y,13,1,O[2]);
   for(const [cx,h] of [[-5,5],[0,7],[5,5]]){for(let k=0;k<h;k++){R(g,x+cx-Math.floor((h-k)/3),y-1-k,1+2*Math.floor((h-k)/3),1,k===h-1?'#000000':O[k>h/2?2:1])}}
   px(0,2,COR.sangue[2]);px(-4,2,COR.agua[2]);px(4,2,COR.agua[2]);px(0,-8,COR.sangue[2])}
  else if(s==='javali'){const O=COR.ouro;disco(0,1,7,(i,j,d)=>d>6.4?'#000000':(i<-2&&j<0?O[2]:j>4?O[0]:O[1]));
   R(g,x-7,y-6,4,4,'#000000');R(g,x-6,y-5,2,2,O[2]);R(g,x+4,y-6,4,4,'#000000');R(g,x+4,y-5,2,2,O[2]);
   R(g,x-3,y+2,7,4,'#000000');R(g,x-2,y+2,5,3,O[2]);px(-1,3,COR.madeira[0]);px(1,3,COR.madeira[0]);
   R(g,x-4,y+4,1,3,COR.osso[2]);R(g,x+4,y+4,1,3,COR.osso[2]);px(-3,-1,'#000000');px(2,-1,'#000000');px(-3,-2,'#ffffff')}}
 /* carta de baralho 12×17 (canto em x,y) */
 function desenharCarta(g,c,x,y,costas){x=Math.round(x);y=Math.round(y);R(g,x,y,12,17,'#000000');
  if(costas){R(g,x+1,y+1,10,15,COR.noite[1]);R(g,x+2,y+2,8,13,COR.noite[0]);for(let j=0;j<13;j+=3)for(let i=(j/3)%2;i<8;i+=2)R(g,x+2+i,y+2+j,1,1,COR.ouro[1]);R(g,x+5,y+7,2,3,COR.magia[2]);return}
  R(g,x+1,y+1,10,15,COR.osso[2]);R(g,x+1,y+15,10,1,COR.osso[1]);const verm=c[1]==='c'||c[1]==='o',cor=verm?COR.sangue[1]:COR.preto;
  g.font='bold 6px monospace';g.textAlign='left';g.textBaseline='top';g.fillStyle=cor;g.fillText(c[0]==='T'?'10':c[0],x+2,y+1);
  naipe(g,c[1],x+6,y+11,cor)}
 function naipe(g,n,x,y,cor){const px=(a,b)=>R(g,x+a,y+b,1,1,cor);
  if(n==='c'){for(const [a,b] of [[-2,-1],[-1,-2],[1,-2],[2,-1],[-2,0],[-1,0],[0,0],[1,0],[2,0],[-1,1],[0,1],[1,1],[0,2],[0,-1],[-1,-1],[1,-1]])px(a,b)}
  else if(n==='o'){for(const [a,b] of [[0,-2],[-1,-1],[0,-1],[1,-1],[-2,0],[-1,0],[0,0],[1,0],[2,0],[-1,1],[0,1],[1,1],[0,2]])px(a,b)}
  else if(n==='e'){for(const [a,b] of [[0,-2],[-1,-1],[0,-1],[1,-1],[-2,0],[-1,0],[0,0],[1,0],[2,0],[-1,1],[1,1],[0,1],[0,2],[-1,2],[1,2]])px(a,b)}
  else{for(const [a,b] of [[0,-2],[-1,-1],[0,-1],[1,-1],[-2,0],[-1,0],[1,0],[2,0],[-2,1],[2,1],[0,0],[0,1],[0,2],[-1,2],[1,2]])px(a,b)}}
 function ficha(g,x,y,v){const c=v>=500?COR.magia:v>=100?COR.noite:v>=25?COR.folha:v>=5?COR.sangue:COR.osso;x=Math.round(x);y=Math.round(y);R(g,x-3,y-1,7,4,'#000000');R(g,x-2,y-1,5,3,c[1]);R(g,x-2,y-1,5,1,c[2]);R(g,x-1,y,1,1,'#ffffff')}
 function pilha(g,x,y,v){let n=Math.min(6,Math.max(1,Math.ceil(Math.log2(v+1)/1.6)));for(let k=0;k<n;k++)ficha(g,x,y-k*2,v)}
 function texto(g,t,x,y,cor,al,tam){g.font=(tam||'bold 6px')+' monospace';g.textAlign=al||'center';g.textBaseline='alphabetic';g.fillStyle='#000000';g.fillText(t,x+.5,y+.5);g.fillStyle=cor||COR.osso[2];g.fillText(t,x,y)}
 // luzes de magia: halo colorido que muda de cor
 const tons=['#b07ad8','#6e9cc4','#efc56a','#cf4554','#79a35a'];
 const brilho=(g,x,y,r,cor,a)=>PX.luz(g,x,y,r,cor,a); // luz em degraus de pixel (sem degradê)
 /* roda da roleta pixel a pixel: cada pixel pega a cor pela distância do centro e pelo ângulo (casa do número) */
 const RODA_T=124;let rodaCv=null,rodaG=null,rodaImg=null; // criados no primeiro desenho
 const rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
 function rodaPixel(roda,Rr){if(!rodaCv){rodaCv=document.createElement('canvas');rodaCv.width=rodaCv.height=RODA_T;rodaG=rodaCv.getContext('2d');rodaImg=rodaG.createImageData(RODA_T,RODA_T)}
  const D=rodaImg.data,C0=RODA_T/2,P=Math.PI*2/37,K={};const k=h=>K[h]||(K[h]=rgb(h));
  for(let y=0;y<RODA_T;y++)for(let x=0;x<RODA_T;x++){const dx=x-C0+.5,dy=y-C0+.5,d=Math.hypot(dx,dy),o=(y*RODA_T+x)*4;let c=null;
   if(d>Rr+3)c=null;else if(d>Rr+2)c='#000000';else if(d>Rr-1)c=dx+dy<-Rr*.6?COR.madeira[2]:COR.madeira[1];else if(d>Rr-3)c=COR.madeira[0];
   else if(d>Rr-15){const a=Math.atan2(dy,dx)-roda+Math.PI/2,q=a/P,i=((Math.round(q)%37)+37)%37,fr=Math.abs(q-Math.round(q));
    if(fr>.42||d<Rr-14)c=COR.ouro[0];else{const n=RODA[i];c=n===0?COR.folha[1]:VERMELHOS.has(n)?COR.sangue[1]:'#1f1a1a'}}
   else if(d>Rr-18)c=COR.madeira[0];
   else if(d>10){const a=((Math.atan2(dy,dx)-roda)%(Math.PI/2)+Math.PI/2)%(Math.PI/2);c=d<17&&(a<.16||a>Math.PI/2-.16)?COR.ouro[2]:(d>Rr-21?COR.madeira[1]:COR.madeira[2])}
   else if(d>9)c='#000000';else c=dx+dy<-4?COR.ouro[2]:COR.ouro[1];
   if(!c){D[o+3]=0;continue}const v=k(c);D[o]=v[0];D[o+1]=v[1];D[o+2]=v[2];D[o+3]=255}
  rodaG.putImageData(rodaImg,0,0);
  for(let i=0;i<37;i++){const a=roda+i*P-Math.PI/2,r=Rr-8.5;PX.num(rodaG,RODA[i],C0+Math.cos(a)*r,C0+Math.sin(a)*r-2,COR.osso[2])}
  return rodaCv}

 function quadro(){
  const g=painel.g,now=performance.now(),T=now/1000,W=painel.w,H=painel.h;g.setTransform(2,0,0,2,0,0);g.imageSmoothingEnabled=false;
  if(painel.tipo==='slot')atualizarSlot(now);
  // fundo: veludo roxo com losangos dourados e luzes de magia passeando
  R(g,0,0,W,H,COR.noite[0]);for(let y=0;y<H;y+=8)for(let x=((y/8)%2)*8;x<W;x+=16){R(g,x+7,y+3,2,2,COR.noite[1])}
  for(let k=0;k<5;k++){const lx=(W/2)+Math.sin(T*.4+k*1.7)*W*.45,ly=H*.5+Math.cos(T*.33+k*2.3)*H*.4;brilho(g,lx,ly,40,tons[k],.18)}
  if(painel.tipo==='slot')desenharMaquina(g,now,T,W,H);else if(painel.tipo==='roleta')desenharRoleta(g,now,T,W,H);else desenharBJ(g,now,T,W,H);
  // texto do ouro e controles atualizam sem redesenhar a cada quadro
  const chave=painel.tipo+'|'+ouro()+'|'+(painel.tipo==='slot'?slot.girando+':'+slot.aposta:JSON.stringify(dados[painel.id].estado&&{f:dados[painel.id].estado.fase,v:dados[painel.id].estado.vez,n:dados[painel.id].estado.n,m:dados[painel.id].estado.maos})+JSON.stringify(dados[painel.id].assentos)+(minhasRol[painel.id]?JSON.stringify(minhasRol[painel.id].l):'')+JSON.stringify(dados[painel.id].apostas)+(dados[painel.id].estado&&agora()<dados[painel.id].estado.ate-700));
  if(painel.sujo||chave!==painel.ultimoDesenho){painel.sujo=false;painel.ultimoDesenho=chave;controles()}
  // longe da mesa (andou): fecha
  if(window.CASSINO&&!CASSINO.pertoDe(painel.id,slot.maquina))fechar()}

 function desenharMaquina(g,now,T,W,H){
  const mx=30,my=8,mw=180,mh=114; // sem a barra de aposta embaixo (pedido do usuário): a aposta está no botão
  // gabinete
  R(g,mx-2,my-2,mw+4,mh+4,'#000000');R(g,mx,my,mw,mh,COR.madeira[0]);R(g,mx+2,my+2,mw-4,mh-4,COR.sangue[0]);R(g,mx+2,my+2,mw-4,2,COR.sangue[2]);
  // letreiro com lâmpadas correndo
  R(g,mx+10,my+6,mw-20,20,'#000000');R(g,mx+11,my+7,mw-22,18,COR.noite[1]);
  const pisca=slot.girando?Math.floor(now/70):Math.floor(now/260),ganhando=slot.premio&&slot.premio.mult>0&&now-slot.fim<3500;
  for(let k=0;k<18;k++){const lx=mx+13+k*9.1,on=ganhando?(Math.floor(now/90)+k)%2===0:(k+pisca)%4===0;R(g,lx,my+8,3,2,on?COR.ouro[2]:COR.ouro[0]);R(g,lx,my+22,3,2,(k+pisca+2)%4===0||ganhando&&on?COR.ouro[2]:COR.ouro[0]);if(on)brilho(g,lx+1,my+9,6,'#efc56a',.5)}
  texto(g,'JAVALI DOURADO',mx+mw/2,my+19,ganhando&&Math.floor(now/150)%2?'#ffffff':COR.ouro[2],'center','bold 7px');
  // rolos
  const ry=my+32,rh=72,cel=24;
  for(let k=0;k<3;k++){const rx=mx+16+k*52,r=slot.rolos[k];R(g,rx-2,ry-2,48,rh+4,'#000000');R(g,rx,ry,44,rh,COR.osso[2]);
   g.save();g.beginPath();g.rect(rx,ry,44,rh);g.clip();
   const i0=Math.floor(r.pos),fr=r.pos-i0;
   for(let j=-2;j<=2;j++){const idx=((i0-j)%FITA.length+FITA.length)%FITA.length,yy=ry+rh/2+(j+fr)*cel;const borra=!r.parou&&r.ate-r.pos>2;
    if(borra){g.globalAlpha=.55;desenharSimb(g,FITA[idx],rx+22,yy-3);g.globalAlpha=.45;desenharSimb(g,FITA[idx],rx+22,yy+3);g.globalAlpha=1}else desenharSimb(g,FITA[idx],rx+22,yy)}
   // sombra curva do rolo
   R(g,rx,ry,44,8,'#00000055');R(g,rx,ry+rh-8,44,8,'#00000055');R(g,rx,ry,44,3,'#00000066');R(g,rx,ry+rh-3,44,3,'#00000066');
   g.restore();if(r.susp&&!r.parou){g.save();g.globalAlpha=.4+.3*Math.sin(now/60);R(g,rx-2,ry-2,48,2,COR.sangue[2]);R(g,rx-2,ry+rh,48,2,COR.sangue[2]);g.restore()}}
  // linha de pagamento
  const ly=ry+rh/2;R(g,mx+8,ly,4,1,COR.sangue[2]);R(g,mx+mw-12,ly,4,1,COR.sangue[2]);
  if(ganhando){g.save();g.globalAlpha=.5+.5*Math.sin(now/80);R(g,mx+14,ly,mw-28,1,COR.sangue[2]);g.restore()}
  // alavanca: desce quando puxada e volta
  const ta=(now-slot.alav)/450,desce=ta>=0&&ta<1?Math.sin(ta*Math.PI):0,ax=mx+mw+6,ay=my+40+desce*40;
  R(g,ax-2,my+60,6,30,'#000000');R(g,ax-1,my+61,4,28,COR.aco[1]);R(g,ax,Math.min(ay,my+62),2,Math.abs(my+62-ay)+2,COR.aco[2]);
  R(g,ax-4,ay-4,10,10,'#000000');R(g,ax-3,ay-3,8,8,COR.sangue[1]);R(g,ax-2,ay-2,3,3,COR.sangue[2]);
  // vitória: moedas pulando e faíscas
  for(let i=slot.moedas.length;i--;){const m=slot.moedas[i];m.t++;m.x+=m.vx;m.y+=m.vy;m.vy+=.12;if(m.y>H+10){slot.moedas.splice(i,1);continue}
   const lado=Math.abs(Math.cos(m.r+m.t*.25));R(g,m.x-3*lado,m.y-3,Math.max(1,6*lado),6,'#000000');R(g,m.x-2*lado,m.y-2,Math.max(1,4*lado),4,COR.ouro[1]);R(g,m.x-lado,m.y-2,Math.max(1,lado*2),1,COR.ouro[2])}
  for(let i=slot.faiscas.length;i--;){const f=slot.faiscas[i];f.t++;f.x+=f.vx;f.y+=f.vy;f.vy+=.08;if(f.t>30){slot.faiscas.splice(i,1);continue}R(g,f.x,f.y,1,1,f.c)}
  // prêmio contando (com o tilintar a cada passo)
  let mostra=slot.ganho;const ct=slot.conta;
  if(ct){const s=Math.max(0,Math.min(1,(now-ct.ini)/ct.dur));mostra=Math.round(ct.ate*(1-Math.pow(1-s,2)));if(s<1&&mostra>ct.ult&&now-(ct.tique||0)>55){ct.tique=now;ct.ult=mostra;som('moedaConta')}if(s>=1)slot.conta=null}
  const fimConta=ct?ct.ini+ct.dur:slot.fim;
  if(ganhando||slot.premio&&slot.premio.mult>0&&now<fimConta+1500){const pr=slot.premio,big=pr.mult>=40;texto(g,pr.s==='javali'&&pr.n===3?'JACKPOT!!!':big?'GRANDE PRÊMIO!':'GANHOU!',W/2,ry+rh/2-30+Math.sin(now/120)*2,Math.floor(now/120)%2?COR.ouro[2]:'#ffffff','center','bold 10px');
   texto(g,'+'+mostra+' ouro',W/2,ry+rh/2+28+(ct?Math.sin(now/40):0),ct?COR.ouro[2]:'#ffffff','center','bold 9px')}}

 function desenharRoleta(g,now,T,W,H){
  const id=painel.id,e=dados[id].estado,cx=68,cy=66,Rr=56,ang=anguloRoda(id);
  // roda pixel a pixel: madeira, anel de números com trastes dourados e o cone com a cruzeta no centro
  g.drawImage(rodaPixel(ang.roda,Rr),cx-RODA_T/2,cy-RODA_T/2);
  // bola (raio 1 = trilho de fora; .68 = dentro da casa do número)
  if(ang.bola!=null){const rb=Rr-9+(ang.raio-.68)/.32*5,x=Math.round(cx+Math.cos(ang.bola-Math.PI/2)*rb),y=Math.round(cy+Math.sin(ang.bola-Math.PI/2)*rb);
   R(g,x-2,y-1,4,2,'#000000');R(g,x-1,y-2,2,4,'#000000');R(g,x-1,y-1,2,2,'#ffffff');brilho(g,x,y,6,'#ffffff',.5)}
  // ponteiro
  R(g,cx-1,cy-Rr-6,3,5,COR.ouro[2]);R(g,cx-2,cy-Rr-7,5,1,'#000000');
  // à direita: estado, tempo, número que saiu e histórico
  const x0=140;let msg='',sub='',cor=COR.osso[2];
  if(!e)msg='Abrindo a mesa…';
  else if(e.fase==='apostas'){const s=Math.max(0,Math.ceil((e.ate-agora())/1000));msg=s>0?'FAÇAM SUAS APOSTAS':'Apostas fechadas';sub=s>0?s+' s':'';cor=s<=5?COR.sangue[2]:COR.ouro[2];
   R(g,x0,40,170,4,'#000000');R(g,x0+1,41,168*Math.max(0,Math.min(1,(e.ate-agora())/ROL_APOSTAS)),2,s<=5?COR.sangue[2]:COR.ouro[1])}
  else if(e.fase==='giro'){const pronto=agora()>=e.ini+GIRO_MS;msg=pronto?'SAIU '+e.num+'!':'A bola está rolando…';cor=pronto?(corNum(e.num)==='vermelho'?COR.sangue[2]:corNum(e.num)==='verde'?COR.folha[2]:'#ffffff'):COR.osso[2];
   if(pronto){const nc=corNum(e.num);R(g,x0+60,46,40,30,'#000000');R(g,x0+61,47,38,28,nc==='vermelho'?COR.sangue[1]:nc==='verde'?COR.folha[1]:'#1f1a1a');texto(g,String(e.num),x0+80,67,'#ffffff','center','bold 14px');for(let k=0;k<6;k++)brilho(g,x0+80+Math.cos(T*3+k)*28,61+Math.sin(T*3+k)*18,10,tons[k%5],.6)}}
  texto(g,msg,x0+85,22,cor,'center','bold 8px');if(sub)texto(g,sub,x0+85,34,cor,'center','bold 7px');
  texto(g,'Últimos:',x0,96,COR.osso[1],'left');const hist=(e&&e.hist)||[];hist.slice(0,5).forEach((n,k)=>{const c=corNum(n);R(g,x0+k*17,100,15,11,'#000000');R(g,x0+k*17+1,101,13,9,c==='vermelho'?COR.sangue[1]:c==='verde'?COR.folha[1]:'#1f1a1a');texto(g,String(n),x0+k*17+7.5,108,'#ffffff','center','bold 6px')});
  const m=minhasRol[id];if(m&&m.res&&e&&(e.ult&&e.ult.n===m.n||e.fase==='giro'&&e.n===m.n)){texto(g,m.res.ganho>0?'Você ganhou '+m.res.ganho+' ouro!':'Não foi desta vez ('+m.res.apostado+')',x0+85,124,m.res.ganho>0?COR.ouro[2]:COR.osso[1],'center')}
  // jogadores apostando
  const ap=e&&dados[id].apostas[e.n];const nomes=entradas(ap).map(([,v])=>v.nome).slice(0,4);if(nomes.length)texto(g,'Na mesa: '+nomes.join(', '),x0+85,88,COR.osso[1],'center','5px')}

 const viu={}; // quando cada carta apareceu (para a animação de distribuir)
 function quandoApareceu(k,atraso){if(viu[k]==null)viu[k]=performance.now()+(atraso||0);return viu[k]}
 /* cabeça e nome de quem está sentado (2026-11-06, pedido do usuário): recorte da cabeça do personagem de frente */
 const cabecas=new Map();
 function cabecaDe(uid){const c=cabecas.get(uid),t=performance.now();if(c&&t-c.t<4000)return c.img;let img=null;
  try{const s=uid===eu()?(typeof heroImg=='function'?heroImg('d',{}):null):(window.spriteDeJogador?spriteDeJogador(uid):null);
   if(s&&s.width){const t2=document.createElement('canvas');t2.width=s.width;t2.height=s.height;const q=t2.getContext('2d');q.drawImage(s,0,0);const d=q.getImageData(0,0,t2.width,t2.height).data;let x0=t2.width,y0=t2.height,x1=-1,y1=-1;
    for(let y=0;y<t2.height;y++)for(let x=0;x<t2.width;x++)if(d[(y*t2.width+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
    if(x1>=0){const h=Math.max(1,Math.round((y1-y0+1)*.46));
     // centro da cabeça = meio dos pixels das 4 linhas de cima (a arma do lado fica de fora do recorte)
     let sx=0,n=0;for(let y=y0;y<Math.min(y0+4,y1);y++)for(let x=x0;x<=x1;x++)if(d[(y*t2.width+x)*4+3]>8){sx+=x;n++}
     const cx=n?sx/n:(x0+x1)/2,w=Math.min(x1-x0+1,Math.round(h*1.05)),ax=Math.max(0,Math.round(cx-w/2));
     const o=document.createElement('canvas');o.width=w;o.height=h;const og=o.getContext('2d');og.drawImage(t2,ax,y0,w,h,0,0,w,h);img=o}}}catch(er){}
  cabecas.set(uid,{img,t});return img}
 function nomeDe(uid){if(uid===eu())return meuNome();const o=window.ONLINE_NUVEM&&ONLINE_NUVEM.outros&&ONLINE_NUVEM.outros.get(uid);return o&&o.name||'Jogador'}
 function desenharCabeca(g,uid,cx,cy,alt){const img=cabecaDe(uid);if(!img)return;const k=alt/img.height,w=Math.round(img.width*k);g.imageSmoothingEnabled=false;g.drawImage(img,Math.round(cx-w/2),Math.round(cy),w,Math.round(alt))}
 function desenharBJ(g,now,T,W,H){
  const id=painel.id,e=dados[id].estado;
  // mesa: feltro verde em meia-lua com borda de couro e o letreiro
  PX.elipse(g,W/2,8,152,150,'#000000','baixo');PX.elipse(g,W/2,8,150,148,COR.madeira[1],'baixo');PX.elipse(g,W/2,8,147,145,COR.madeira[2],'baixo');PX.elipse(g,W/2,8,145,143,COR.madeira[1],'baixo');
  PX.elipse(g,W/2,8,142,140,COR.folha[0],'baixo');PX.elipse(g,W/2,8,139,137,COR.folha[1],'baixo');
  PX.contorno(g,W/2,8,100,90,COR.ouro[1],.15,Math.PI-.15);PX.contorno(g,W/2,8,98,88,COR.ouro[0],.15,Math.PI-.15);
  texto(g,'BLACKJACK PAGA 3 PARA 2',W/2,72,COR.ouro[2],'center','bold 6px');texto(g,'A banca compra até 17',W/2,80,COR.folha[2],'center','5px');
  // sapato (baralho) e fichas da banca
  R(g,W-46,10,22,16,'#000000');R(g,W-45,11,20,14,COR.madeira[0]);desenharCarta(g,'Ae',W-41,9,true);for(let k=0;k<5;k++)pilha(g,40+k*8,22,[500,100,25,5,1][k]);
  if(!e){texto(g,'Abrindo a mesa…',W/2,40);return}
  const sh={x:W-35,y:12},mov=(k,atraso,dx,dy)=>{const t0=quandoApareceu(k,atraso),s=Math.max(0,Math.min(1,(now-t0)/300));return{x:sh.x+(dx-sh.x)*s,y:sh.y+(dy-sh.y)*s,vis:now>=t0}};
  const banca=cartas(e.banca),revelar=e.fase==='fim';
  banca.forEach((c,k)=>{const atraso=k<2?(k===0?LUGARES.length*250:(LUGARES.length*2+1)*250):(revelar?(k-1)*650:0);
   const q=mov(id+e.n+'b'+k,atraso,W/2-20+k*14,24);if(!q.vis)return;
   const virada=k===1&&!revelar;desenharCarta(g,c,q.x,q.y,virada)});
  if(banca.length)texto(g,revelar?'Banca: '+valor(e.banca):'Banca',W/2,20,COR.osso[2],'center');
  // lugares: 4 em arco embaixo
  const pos=[[44,104],[118,128],[202,128],[276,104]];const u=eu(),meu=assentoDe(id,u);
  for(let i=0;i<4;i++){const [x,y]=pos[i],m=e.maos&&e.maos[LUGARES[i]],ocup=dados[id].assentos[i],vez=e.fase==='jogando'&&e.vez===i;
   {const c=vez?COR.ouro[2]:COR.folha[2];g.globalAlpha=vez?.6+.4*Math.sin(now/150):.5;R(g,x-22,y-30,45,1,c);R(g,x-22,y+15,45,1,c);R(g,x-22,y-30,1,46,c);R(g,x+22,y-30,1,46,c);g.globalAlpha=1}
   if(vez){brilho(g,x,y-8,30,'#efc56a',.25);const s=Math.max(0,Math.ceil((e.ate-agora())/1000));texto(g,s+'s',x,y+28,s<=5?COR.sangue[2]:COR.ouro[2])}
   if(!m){if(ocup){desenharCabeca(g,ocup,x,y-26,20);texto(g,nomeDe(ocup).slice(0,12),x,y+2,ocup===u?COR.ouro[2]:COR.osso[2],'center','5px')}else texto(g,'Livre',x,y-6,COR.folha[2],'center','5px');continue}
   if(m.u)desenharCabeca(g,m.u,x-14,y+4,9); // com mão na mesa: a cabeça pequena ao lado do nome
   cartas(m.c).forEach((c,k)=>{const atraso=k<2?(k===0?i*250:(4+1+i)*250):0;const q=mov(id+e.n+'l'+i+'k'+k,atraso,x-14+k*9,y-26+(k>1?-2:0));if(q.vis)desenharCarta(g,c,q.x,q.y)});
   pilha(g,x+14,y+10,m.ap);texto(g,String(m.ap),x+14,y+20,COR.ouro[2],'center','5px');
   texto(g,(m.u===u?meuNome():m.nome||nomeDe(m.u)).slice(0,10),x-2,y+12,m.u===u?COR.ouro[2]:COR.osso[2],'center','5px');
   if(cartas(m.c).length){const v=valor(m.c);texto(g,m.st==='bj'?'BJ!':String(v),x-6,y+4,v>21?COR.sangue[2]:'#ffffff','center','bold 6px')}
   if(e.fase==='fim'&&cartas(m.c).length&&now-quandoApareceu(id+e.n+'fim',0)>cartas(e.banca).length*650+600){const r=resultadoBJ(m,e.banca);texto(g,r.r,x,y-34,r.x>=2?COR.ouro[2]:r.x===1?COR.osso[2]:COR.sangue[2],'center','bold 6px');if(r.x>=2)brilho(g,x,y-34,18,'#efc56a',.4)}}
  if(e.fase==='fim')quandoApareceu(id+e.n+'fim',0);
  let msg='';if(e.fase==='apostas')msg=e.ate?'Apostas fecham em '+Math.max(0,Math.ceil((e.ate-agora())/1000))+' s':'Aguardando apostas';else if(e.fase==='jogando')msg=e.vez===meu?'SUA VEZ!':'Vez do lugar '+(e.vez+1);else msg='Fim da mão';
  texto(g,msg,W/2,48,e.vez===meu&&e.fase==='jogando'?COR.ouro[2]:COR.osso[2],'center','bold 7px')}

 window.CASSINO_JOGOS={IDS,ROLETAS,BJS,NOME,dados,abrir,fechar,get aberto(){return painel.id},PX,feed,corNum,
  anguloRoda,estado:id=>dados[id]&&dados[id].estado,assentoDe,eu,cartas,valor,LUGARES,slot,desenharSimb,desenharCarta,
  // regras, para os testes
  premioSlot,PAGA3,PAGA2,PESO,retornoRol,resultadoBJ,RODA,
  sentarBJ,levantarBJ,apostarBJ,agirBJ,apostarRol,girarSlot,avancarRol,avancarBJ,escutarTodas:()=>IDS.forEach(escutar),
  // testes (só na mesa local): acaba o tempo da fase de agora
  acelerar(id){if(online()||!LOCAL[id]||!LOCAL[id].estado)return;LOCAL[id].estado.ate=agora()-1;chegou(id,clone(LOCAL[id]))}};
})();
