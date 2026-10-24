/* Jogos de mesa do Bar (2026-10-24, pedido do usuário): Truco, Uno e Dominó. Só as regras, sem rede nem tela:
   cada jogo é um conjunto de funções puras sobre um estado em JSON (vai inteiro para o Firebase como texto e é alterado
   numa transação por quem joga — js/mesas.js). Jogadores pelo índice na lista st.jog (uids).
     novo(jogadores) -> estado          acoes(st, i) -> ações válidas do jogador i agora
     aplicar(st, i, acao) -> estado novo (ou lança Error com o motivo)
     sair(st, i) -> estado (desistiu; o jogo só acaba quando sobra um jogador, ou um time no truco)
   st.fim = {vencedores:[índices], motivo} quando acaba. st.log: últimas mensagens para a mesa. */
(function(root){
 const clone=o=>JSON.parse(JSON.stringify(o));
 const embaralhar=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 const ativos=st=>st.jog.map((_,i)=>i).filter(i=>!st.fora[i]);
 const proximo=(st,i,dir=1)=>{const n=st.jog.length;for(let k=1;k<=n;k++){const j=((i+dir*k)%n+n)%n;if(!st.fora[j])return j}return i};
 const anota=(st,txt)=>{st.log=(st.log||[]).concat(txt).slice(-6)};
 const erro=m=>{throw new Error(m)};

 /* =============================== TRUCO (paulista) =============================== */
 const RANKS=['4','5','6','7','Q','J','K','A','2','3'],NAIPES=['o','e','c','p']; // ouros < espadas < copas < paus (manilhas)
 const NOME_NAIPE={o:'♦',e:'♠',c:'♥',p:'♣'},VALORES=[1,3,6,9,12],NOME_VALOR={3:'TRUCO',6:'SEIS',9:'NOVE',12:'DOZE'};
 const rank=c=>c.slice(0,-1),naipe=c=>c.slice(-1);
 const forca=(c,vira)=>{const man=RANKS[(RANKS.indexOf(rank(vira))+1)%RANKS.length];return rank(c)===man?100+NAIPES.indexOf(naipe(c)):RANKS.indexOf(rank(c))};
 const timeDe=(st,i)=>st.times.findIndex(t=>t.includes(i));
 function maoNova(st){
  const baralho=embaralhar(RANKS.flatMap(r=>NAIPES.map(n=>r+n)));
  const dist=st.mao?proximo(st,st.mao.dist):0;
  const cartas={};st.jog.forEach((_,i)=>{cartas[i]=st.fora[i]&&!st.auto[i]?[]:baralho.splice(0,3)});
  st.mao={dist,vira:baralho.pop(),cartas,mesa:[],rodadas:[],vez:proximo(st,dist),comeca:proximo(st,dist),valor:1,pedido:null,aumentou:null};
  anota(st,'Nova mão. Vira: '+st.mao.vira.replace(/.$/,s=>NOME_NAIPE[s]));
 }
 // quem ainda joga: fora do jogo (desistiu) só joga se ficou como automático (truco 2×2)
 const jogaTruco=(st,i)=>!st.fora[i]||st.auto[i];
 const proxTruco=(st,i)=>{const n=st.jog.length;for(let k=1;k<=n;k++){const j=(i+k)%n;if(jogaTruco(st,j))return j}return i};
 function resolverMao(st){
  const r=st.mao.rodadas,[a,b,c]=r;let v=null;
  // 'E' = empate; 0/1 = time que venceu a rodada
  if(r.filter(x=>x===0).length>=2)v=0;else if(r.filter(x=>x===1).length>=2)v=1;
  else if(r.length>=2&&a==='E'&&b!=='E')v=b;
  else if(r.length>=2&&a!=='E'&&b==='E')v=a;
  else if(r.length===3){if(a==='E'&&b==='E')v=c==='E'?-1:c;else v=c==='E'?a:c}
  return v; // null: continua; -1: ninguém pontua
 }
 function fimDaMao(st,venc,motivo){
  if(venc>=0){st.pontos[venc]+=st.mao.valor;anota(st,'Time '+(venc+1)+' ganhou '+st.mao.valor+' ponto(s)'+(motivo?' ('+motivo+')':'')+'.')}else anota(st,'Mão empatada: ninguém pontua.');
  const g=st.pontos.findIndex(p=>p>=12);
  if(g>=0){st.fim={vencedores:st.times[g].slice(),motivo:'12 pontos'};anota(st,'Time '+(g+1)+' venceu a partida!');return}
  maoNova(st);
 }
 function jogarCarta(st,i,k){
  const m=st.mao,c=m.cartas[i][k];if(!c)erro('Carta inválida.');
  m.cartas[i].splice(k,1);m.mesa.push({j:i,c});
  const jogando=st.jog.map((_,x)=>x).filter(x=>jogaTruco(st,x));
  if(m.mesa.length<jogando.length){m.vez=proxTruco(st,i);return}
  // rodada completa: maior carta; empate entre times diferentes = 'E'
  const fs=m.mesa.map(o=>({...o,f:forca(o.c,m.vira)})),top=Math.max(...fs.map(o=>o.f)),melhores=fs.filter(o=>o.f===top),ts=new Set(melhores.map(o=>timeDe(st,o.j)));
  const res=ts.size>1?'E':[...ts][0];m.rodadas.push(res);
  anota(st,res==='E'?'Rodada empatada ('+melhores.map(o=>o.c).join(' × ')+').':'Rodada do time '+(res+1)+' ('+melhores[0].c+').');
  m.ultimaMesa=m.mesa;m.mesa=[];m.vez=melhores[0].j;
  const v=resolverMao(st);if(v!==null)fimDaMao(st,v);
 }
 function autoTruco(st){ // jogador que desistiu no 2×2: joga a primeira carta e aceita pedidos
  for(let n=0;n<20&&!st.fim;n++){const m=st.mao;
   if(m.pedido){const resp=st.times.find((t,k)=>k!==m.pedido.time);if(resp.every(i=>st.fora[i])){m.valor=m.pedido.valor;m.aumentou=m.pedido.time;m.pedido=null;continue}break}
   if(st.fora[m.vez]&&st.auto[m.vez]&&m.cartas[m.vez].length){jogarCarta(st,m.vez,0);continue}break}
 }
 const TRUCO={nome:'Truco',min:2,max:4,valido:n=>n===2||n===4,
  novo(jog){const n=jog.length,st={tipo:'truco',jog:jog.slice(),fora:{},auto:{},times:n===4?[[0,2],[1,3]]:[[0],[1]],pontos:[0,0],log:[],fim:null};maoNova(st);return st},
  acoes(st,i){if(st.fim||st.fora[i])return [];const m=st.mao,meu=timeDe(st,i),out=[];
   if(m.pedido){if(m.pedido.time!==meu){out.push({t:'aceitar'},{t:'correr'});if(m.pedido.valor<12)out.push({t:'aumentar'})}return out}
   if(m.vez!==i)return [];
   m.cartas[i].forEach((c,k)=>out.push({t:'jogar',k}));
   if(m.valor<12&&m.aumentou!==meu)out.push({t:'truco'});
   return out},
  aplicar(st0,i,a){
   const st=clone(st0),m=st.mao;if(st.fim)erro('A partida acabou.');if(st.fora[i])erro('Você saiu da partida.');const meu=timeDe(st,i);
   if(a.t==='jogar'){if(m.pedido)erro('Responda o pedido primeiro.');if(m.vez!==i)erro('Não é a sua vez.');jogarCarta(st,i,a.k)}
   else if(a.t==='truco'){if(m.vez!==i||m.pedido)erro('Agora não.');if(m.valor>=12||m.aumentou===meu)erro('Seu time não pode pedir agora.');
    const v=VALORES[VALORES.indexOf(m.valor)+1];m.pedido={valor:v,time:meu,por:i};anota(st,'Time '+(meu+1)+' pediu '+NOME_VALOR[v]+'!')}
   else if(a.t==='aceitar'||a.t==='correr'||a.t==='aumentar'){
    if(!m.pedido||m.pedido.time===meu)erro('Não há pedido para você responder.');
    if(a.t==='aceitar'){m.valor=m.pedido.valor;m.aumentou=m.pedido.time;anota(st,'Aceito! A mão vale '+m.valor+'.');m.pedido=null}
    else if(a.t==='correr'){const quem=m.pedido.time;anota(st,'Correu!');m.pedido=null;fimDaMao(st,quem,'correu')}
    else{if(m.pedido.valor>=12)erro('Já está valendo 12.');m.valor=m.pedido.valor;const v=VALORES[VALORES.indexOf(m.pedido.valor)+1];m.pedido={valor:v,time:meu,por:i};m.aumentou=null;anota(st,'Aumentou para '+NOME_VALOR[v]+'!')}}
   else erro('Ação desconhecida.');
   autoTruco(st);return st},
  sair(st0,i){const st=clone(st0);if(st.fim||st.fora[i])return st;st.fora[i]=true;anota(st,'Um jogador desistiu.');
   const vivos=st.times.map(t=>t.filter(x=>!st.fora[x]));
   const sobra=vivos.findIndex(v=>v.length)>=0&&vivos.filter(v=>v.length).length===1?vivos.findIndex(v=>v.length):-1;
   if(sobra>=0){st.fim={vencedores:st.times[sobra],motivo:'o outro time desistiu'};anota(st,'Time '+(sobra+1)+' venceu: o outro time desistiu.');return st}
   st.auto[i]=true;autoTruco(st);return st}, // 2×2: o parceiro continua; a mão de quem saiu joga sozinha
  forca,NOME_NAIPE,NOME_VALOR,timeDe
 };

 /* =============================== UNO =============================== */
 const CORES=['r','g','b','y'],NOME_COR={r:'Vermelho',g:'Verde',b:'Azul',y:'Amarelo'};
 const corDe=c=>c[0]==='W'?null:c[0],simb=c=>c[0]==='W'?c:c.slice(1);
 function baralhoUno(){const b=[];for(const c of CORES){b.push(c+'0');for(const s of ['1','2','3','4','5','6','7','8','9','S','R','+'])b.push(c+s,c+s);}for(let k=0;k<4;k++)b.push('W','W4');return embaralhar(b)}
 const podeJogarUno=(st,c)=>c[0]==='W'||corDe(c)===st.cor||simb(c)===simb(st.descarte[st.descarte.length-1]);
 function comprarUno(st,i,n){for(let k=0;k<n;k++){if(!st.monte.length){const topo=st.descarte.pop();st.monte=embaralhar(st.descarte);st.descarte=[topo]}if(!st.monte.length)break;st.maos[i].push(st.monte.pop())}}
 const UNO={nome:'Uno',min:2,max:4,valido:n=>n>=2&&n<=4,
  novo(jog){const st={tipo:'uno',jog:jog.slice(),fora:{},maos:{},monte:baralhoUno(),descarte:[],cor:null,vez:0,dir:1,comprou:false,log:[],fim:null};
   jog.forEach((_,i)=>{st.maos[i]=st.monte.splice(0,7)});
   let c;do{c=st.monte.pop();if(/^[rgby][0-9]$/.test(c))break;st.monte.unshift(c)}while(true); // começa com um número
   st.descarte.push(c);st.cor=corDe(c);anota(st,'Primeira carta: '+c+'.');return st},
  acoes(st,i){if(st.fim||st.fora[i]||st.vez!==i)return [];const out=[];
   st.maos[i].forEach((c,k)=>{if(podeJogarUno(st,c))out.push(c[0]==='W'?{t:'jogar',k,cor:'?'}:{t:'jogar',k})});
   out.push(st.comprou?{t:'passar'}:{t:'comprar'});return out},
  aplicar(st0,i,a){
   const st=clone(st0);if(st.fim)erro('A partida acabou.');if(st.vez!==i||st.fora[i])erro('Não é a sua vez.');
   if(a.t==='jogar'){const c=st.maos[i][a.k];if(!c)erro('Carta inválida.');if(!podeJogarUno(st,c))erro('Essa carta não serve agora.');
    if(c[0]==='W'&&!CORES.includes(a.cor))erro('Escolha uma cor.');
    st.maos[i].splice(a.k,1);st.descarte.push(c);st.cor=c[0]==='W'?a.cor:corDe(c);st.comprou=false;
    anota(st,'Jogou '+c+(c[0]==='W'?' ('+NOME_COR[a.cor]+')':'')+'.');
    if(!st.maos[i].length){st.fim={vencedores:[i],motivo:'ficou sem cartas'};anota(st,'UNO! Acabaram as cartas.');return st}
    if(st.maos[i].length===1)anota(st,'UNO!');
    const s=simb(c),n=ativos(st).length;
    if(s==='R'){st.dir*=-1;st.vez=n===2?i:proximo(st,i,st.dir)} // com 2 jogadores, inverter = pular (joga de novo)
    else if(s==='S'){st.vez=proximo(st,proximo(st,i,st.dir),st.dir)}
    else if(s==='+'||s==='W4'){const alvo=proximo(st,i,st.dir);comprarUno(st,alvo,s==='+'?2:4);anota(st,'O próximo comprou '+(s==='+'?2:4)+'.');st.vez=proximo(st,alvo,st.dir)}
    else st.vez=proximo(st,i,st.dir);
    if(st.vez===i&&n>2)st.vez=proximo(st,i,st.dir)}
   else if(a.t==='comprar'){if(st.comprou)erro('Você já comprou.');comprarUno(st,i,1);st.comprou=true}
   else if(a.t==='passar'){if(!st.comprou)erro('Compre antes de passar.');st.comprou=false;st.vez=proximo(st,i,st.dir)}
   else erro('Ação desconhecida.');
   return st},
  sair(st0,i){const st=clone(st0);if(st.fim||st.fora[i])return st;st.fora[i]=true;st.monte=embaralhar(st.monte.concat(st.maos[i]));st.maos[i]=[];anota(st,'Um jogador desistiu.');
   const v=ativos(st);if(v.length===1){st.fim={vencedores:v,motivo:'os outros desistiram'};return st}
   if(st.vez===i){st.comprou=false;st.vez=proximo(st,i,st.dir)}return st},
  NOME_COR,corDe,simb,podeJogar:podeJogarUno
 };

 /* =============================== DOMINÓ =============================== */
 const pedra=s=>s.split('-').map(Number),pontosMao=m=>m.reduce((n,s)=>n+pedra(s)[0]+pedra(s)[1],0);
 function podeDomino(st,s){if(!st.mesa.length)return ['e'];const [a,b]=pedra(s),[l,r]=st.pontas,out=[];if(a===l||b===l)out.push('e');if(a===r||b===r)out.push('d');return out}
 const temJogada=(st,i)=>st.maos[i].some(s=>podeDomino(st,s).length);
 const DOMINO={nome:'Dominó',min:2,max:4,valido:n=>n>=2&&n<=4,
  novo(jog){const pedras=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)pedras.push(a+'-'+b);embaralhar(pedras);
   const st={tipo:'domino',jog:jog.slice(),fora:{},maos:{},monte:[],mesa:[],pontas:null,vez:0,passes:0,log:[],fim:null};
   jog.forEach((_,i)=>{st.maos[i]=pedras.splice(0,7)});st.monte=jog.length<4?pedras:[];
   // começa quem tem a maior carroça (ou a maior pedra)
   let best=-1;jog.forEach((_,i)=>st.maos[i].forEach(s=>{const [a,b]=pedra(s),v=(a===b?100:0)+a+b;if(v>best){best=v;st.vez=i}}));
   anota(st,'Começa quem tem a maior pedra.');return st},
  acoes(st,i){if(st.fim||st.fora[i]||st.vez!==i)return [];const out=[];
   st.maos[i].forEach((s,k)=>podeDomino(st,s).forEach(lado=>out.push({t:'jogar',k,lado})));
   if(!out.length)out.push(st.monte.length?{t:'comprar'}:{t:'passar'});return out},
  aplicar(st0,i,a){
   const st=clone(st0);if(st.fim)erro('A partida acabou.');if(st.vez!==i||st.fora[i])erro('Não é a sua vez.');
   if(a.t==='jogar'){const s=st.maos[i][a.k];if(!s)erro('Pedra inválida.');const lados=podeDomino(st,s);if(!lados.includes(a.lado))erro('Essa pedra não encaixa aí.');
    let [x,y]=pedra(s);st.maos[i].splice(a.k,1);
    if(!st.mesa.length){st.mesa.push([x,y]);st.pontas=[x,y]}
    else if(a.lado==='e'){if(y!==st.pontas[0])[x,y]=[y,x];st.mesa.unshift([x,y]);st.pontas[0]=x}
    else{if(x!==st.pontas[1])[x,y]=[y,x];st.mesa.push([x,y]);st.pontas[1]=y}
    st.passes=0;anota(st,'Jogou '+s+'.');
    if(!st.maos[i].length){st.fim={vencedores:[i],motivo:'bateu'};anota(st,'Bateu!');return st}
    st.vez=proximo(st,i)}
   else if(a.t==='comprar'){if(temJogada(st,i))erro('Você tem pedra para jogar.');if(!st.monte.length)erro('O monte acabou.');st.maos[i].push(st.monte.pop())}
   else if(a.t==='passar'){if(temJogada(st,i))erro('Você tem pedra para jogar.');if(st.monte.length)erro('Compre do monte primeiro.');
    st.passes++;anota(st,'Passou.');
    if(st.passes>=ativos(st).length){ // trancou: ganha quem tem menos pontos na mão
     const v=ativos(st).sort((p,q)=>pontosMao(st.maos[p])-pontosMao(st.maos[q]))[0];st.fim={vencedores:[v],motivo:'jogo trancado: menos pontos na mão'};anota(st,'Trancou!');return st}
    st.vez=proximo(st,i)}
   else erro('Ação desconhecida.');
   return st},
  sair(st0,i){const st=clone(st0);if(st.fim||st.fora[i])return st;st.fora[i]=true;st.maos[i]=[];anota(st,'Um jogador desistiu.');
   const v=ativos(st);if(v.length===1){st.fim={vencedores:v,motivo:'os outros desistiram'};return st}
   if(st.vez===i)st.vez=proximo(st,i);return st},
  pedra,pontosMao,podeJogar:podeDomino
 };

 root.JOGOS_MESA={truco:TRUCO,uno:UNO,domino:DOMINO,ativos};
})(typeof window!=='undefined'?window:globalThis);
