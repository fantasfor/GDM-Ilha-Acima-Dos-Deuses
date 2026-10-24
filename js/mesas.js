/* ---------- Mesas de jogo do Bar (2026-10-24, pedido do usuário) ----------
   Quatro mesas no pátio do bar (js/bar.js), 4 lugares cada. Sentado, aparecem 3 botões em cima da mesa: Truco, Uno e Dominó
   (regras em js/jogos-mesa.js). Quem clica convida quem está sentado na mesa e abre o painel do jogo; o convite aparece
   em cima de quem convidou e quem aceita abre o painel também. Quem convidou define a aposta (ouro) e inicia. Com jogo
   rolando, os botões somem e fica o de assistir; quem assiste pode pedir para jogar a próxima. Uma partida por mesa.
   Desistir: o jogo só acaba quando sobra um jogador (ou um time no truco).
   Dados: mesas/{mesa} = {assentos: {0..3: uid}, jogo: {tipo, dono, fase: convite|jogando|fim, conv: {uid: 'c'|'a'},
     nomes, aposta, jog: [uids], estado: JSON das regras, espect, fila, pago, premio}}.
   Online (conta conectada): Firebase, com transações (quem joga valida e grava a jogada). Sem conta ou nos testes: uma
   mesa local na memória, com o mesmo formato (MESAS.simular deixa um teste agir como outro jogador).
   Ouro: cada jogador paga a própria aposta quando a partida começa e recebe o prêmio quando vence (pote dividido). */
(function(){
 // 4 mesas no pátio do bar e as 5 mesas redondas de dentro da taverna
 const IDS=['bar1','bar2','bar3','bar4','tav1','tav2','tav3','tav4','tav5'],NOME_MESA={bar1:'Mesa 1 do pátio',bar2:'Mesa 2 do pátio',bar3:'Mesa 3 do pátio',bar4:'Mesa 4 do pátio',tav1:'Mesa 1 da taverna',tav2:'Mesa 2 da taverna',tav3:'Mesa 3 da taverna',tav4:'Mesa 4 da taverna',tav5:'Mesa 5 da taverna'};
 const J=()=>window.JOGOS_MESA;
 const clone=o=>o==null?o:JSON.parse(JSON.stringify(o));
 const dados={};IDS.forEach(id=>dados[id]={assentos:{},jogo:null});
 const online=()=>!!(window.NUVEM&&NUVEM.conectado&&NUVEM.db&&window.CONTA_ATIVA&&!(window.MODO&&MODO.teste));
 let simulado=null; // teste: agir como outro jogador {uid, nome}
 const eu=()=>simulado?simulado.uid:online()?NUVEM.uid:'local';
 const meuNome=()=>simulado?simulado.nome:online()&&NUVEM.nome?NUVEM.nome():(window.p&&p.name)||'Você';
 const nomeDe=(j,uid)=>(j&&j.nomes&&j.nomes[uid])||(window.MP&&MP.nomeDe?MP.nomeDe(uid):'Jogador');
 const aviso=(t,c)=>{if(window.ft&&window.p)ft(p.x,p.y-30,t,c||'#ffd84a')};
 /* vez de cada um: 30 s para jogar; passou, perde a vez (regras: perderVez). O relógio é o do servidor (online), para
    todos contarem o mesmo prazo. */
 const PRAZO_MS=30000;let deslocamento=0;
 const agora=()=>Date.now()+deslocamento;
 const chaveVez=j=>{if(!j||j.fase!=='jogando')return '';const st=JSON.parse(j.estado);return JSON.stringify(J()[j.tipo].quemAge(st))+(st.mao&&st.mao.pedido?'p'+st.mao.pedido.valor:'')+(st.vez!=null?'v'+st.vez:'')};

 /* ---- armazenamento: Firebase ou memória, com a mesma interface ---- */
 const LOCAL={},escutando=new Set();let relogioLigado=false;
 const caminho=(id,campo)=>campo?campo.split('/').reduce((o,k)=>o&&o[k],LOCAL[id]):LOCAL[id];
 function localDefine(id,campo,val){LOCAL[id]=LOCAL[id]||{};const ks=campo.split('/');let o=LOCAL[id];for(let i=0;i<ks.length-1;i++)o=o[ks[i]]=o[ks[i]]||{};if(val==null)delete o[ks[ks.length-1]];else o[ks[ks.length-1]]=clone(val);setTimeout(()=>chegou(id,clone(LOCAL[id])),0)}
 function transacao(id,campo,fn){
  if(online())return NUVEM.db.ref('mesas/'+id+'/'+campo).transaction(cur=>{const r=fn(cur);return r===undefined?undefined:r}).then(r=>r.committed);
  const r=fn(clone(caminho(id,campo)??null));if(r===undefined)return Promise.resolve(false);localDefine(id,campo,r);return Promise.resolve(true);
 }
 function escutar(id){
  if(escutando.has(id))return;escutando.add(id);
  if(online()){NUVEM.db.ref('mesas/'+id).on('value',s=>chegou(id,s.val()));if(!relogioLigado){relogioLigado=true;NUVEM.db.ref('.info/serverTimeOffset').on('value',s=>{deslocamento=+s.val()||0})}}
 }
 function pararDeEscutar(){if(online())for(const id of escutando)NUVEM.db.ref('mesas/'+id).off();escutando.clear()}
 function chegou(id,v){
  dados[id]={assentos:(v&&v.assentos)||{},jogo:(v&&v.jogo)||null};
  cobrarEPagar(id);avisarVez(id);
  if(painel.mesa===id){if(foraDoJogo(id)){painel.mesa=null;if(painel.el)painel.el.hidden=true}else desenharPainel()}
 }

 /* ---- lugares ---- */
 let sentado=null; // {mesa, i}
 const assentoDe=(id,uid)=>{const a=dados[id].assentos;for(const k in a)if(a[k]===uid)return +k;return -1};
 const sentados=id=>Object.values(dados[id].assentos).filter(Boolean);
 async function sentar(id,i){
  if(sentado)await levantar();
  const ok=await transacao(id,'assentos/'+i,cur=>cur&&cur!==eu()?undefined:eu());
  if(!ok){aviso('Esse lugar está ocupado.','#f87171');return false}
  sentado={mesa:id,i};
  if(online())NUVEM.db.ref('mesas/'+id+'/assentos/'+i).onDisconnect().remove();
  return true;
 }
 async function levantar(){
  if(!sentado)return;const {mesa,i}=sentado;sentado=null;
  await transacao(mesa,'assentos/'+i,cur=>cur===eu()?null:undefined);
  // saindo da mesa: sai do convite (o jogo em andamento continua: dá para voltar pelo painel)
  const j=dados[mesa].jogo;if(j&&j.fase==='convite'){sairDoConvite(mesa);if(painel.mesa===mesa)fecharPainel()}
 }

 /* ---- jogo da mesa ---- */
 // convite parado há 3 min ou partida sem jogada há 10 min (ex.: todos caíram) não prendem a mesa: dá para começar outra
 const ativo=j=>!!j&&((j.fase==='convite'&&Date.now()-(j.t||0)<180000)||(j.fase==='jogando'&&Date.now()-(j.t||0)<600000));
 const regras=j=>J()[j.tipo];
 const estado=j=>j&&j.estado?JSON.parse(j.estado):null;
 const meuIndice=j=>j&&Array.isArray(j.jog)?j.jog.indexOf(eu()):-1;
 async function convidar(id,tipo){
  if(!sentado||sentado.mesa!==id){aviso('Sente-se na mesa primeiro.','#f87171');return}
  const outros=sentados(id).filter(u=>u!==eu());
  const ok=await transacao(id,'jogo',cur=>{if(ativo(cur))return undefined;const conv={};outros.forEach(u=>conv[u]='c');
   return{tipo,dono:eu(),fase:'convite',conv,nomes:{[eu()]:meuNome()},aposta:0,t:Date.now()}});
  if(!ok){aviso('Já tem um jogo nesta mesa.','#f87171');return}
  abrirPainel(id);
 }
 async function aceitar(id){
  const j=dados[id].jogo;if(!j)return;
  if(j.fase!=='convite'){assistir(id);return}
  if(j.aposta>0&&(p.gold|0)<j.aposta){aviso('Ouro insuficiente para a aposta.','#f87171');return}
  await transacao(id,'jogo',cur=>{if(!cur||cur.fase!=='convite')return undefined;cur.conv=cur.conv||{};cur.conv[eu()]='a';cur.nomes=cur.nomes||{};cur.nomes[eu()]=meuNome();if(cur.fila)delete cur.fila[eu()];return cur});
  abrirPainel(id);
 }
 async function sairDoConvite(id){
  await transacao(id,'jogo',cur=>{if(!cur||cur.fase!=='convite')return undefined;if(cur.dono===eu())return null;if(cur.conv)delete cur.conv[eu()];return cur});
 }
 async function definirAposta(id,v){
  v=Math.max(0,Math.min(100000,Math.floor(+v||0)));
  await transacao(id,'jogo',cur=>{if(!cur||cur.fase!=='convite'||cur.dono!==eu())return undefined;if(cur.aposta!==v){cur.aposta=v;for(const u in cur.conv||{})if(cur.conv[u]==='a')cur.conv[u]='c'}return cur}); // aposta mudou: todos aceitam de novo
 }
 async function iniciar(id){
  const j=dados[id].jogo,G=j&&regras(j);if(!j||j.dono!==eu()||j.fase!=='convite')return;
  if(j.aposta>0&&(p.gold|0)<j.aposta){aviso('Você não tem ouro para a aposta.','#f87171');return}
  const ordem=[0,1,2,3].map(k=>dados[id].assentos[k]).filter(Boolean),aceitos=[eu(),...Object.keys(j.conv||{}).filter(u=>j.conv[u]==='a')];
  const jog=[...ordem.filter(u=>aceitos.includes(u)),...aceitos.filter(u=>!ordem.includes(u))].slice(0,G.max); // na ordem das cadeiras
  if(!G.valido(jog.length)){aviso(G.nome+': '+(j.tipo==='truco'?'2 ou 4 jogadores':G.min+' a '+G.max+' jogadores')+'.','#f87171');return}
  const st=G.novo(jog);
  await transacao(id,'jogo',cur=>{if(!cur||cur.fase!=='convite'||cur.dono!==eu())return undefined;cur.fase='jogando';cur.jog=jog;cur.estado=JSON.stringify(st);cur.t=Date.now();cur.prazo=agora()+PRAZO_MS;return cur});
 }
 let erroJogo='';
 async function agir(id,acao){
  erroJogo='';
  await transacao(id,'jogo',cur=>{if(!cur||cur.fase!=='jogando')return undefined;const i=cur.jog.indexOf(eu());if(i<0)return undefined;
   try{const antes=chaveVez(cur),st=regras(cur).aplicar(JSON.parse(cur.estado),i,acao);cur.estado=JSON.stringify(st);cur.t=Date.now();if(st.fim)cur.fase='fim';else if(chaveVez(cur)!==antes)cur.prazo=agora()+PRAZO_MS;return cur}catch(e){erroJogo=e.message;return undefined}});
  if(erroJogo)desenharPainel();
 }
 async function desistir(id){
  await transacao(id,'jogo',cur=>{if(!cur||cur.fase!=='jogando')return undefined;const i=cur.jog.indexOf(eu());if(i<0)return undefined;
   const antes=chaveVez(cur),st=regras(cur).sair(JSON.parse(cur.estado),i);cur.estado=JSON.stringify(st);cur.t=Date.now();if(st.fim)cur.fase='fim';else if(chaveVez(cur)!==antes)cur.prazo=agora()+PRAZO_MS;return cur});
  if(painel.mesa===id)fecharPainel(); // quem desiste sai do painel
 }
 async function assistir(id){
  await transacao(id,'jogo',cur=>{if(!cur)return undefined;cur.espect=cur.espect||{};cur.espect[eu()]=1;cur.nomes=cur.nomes||{};cur.nomes[eu()]=meuNome();return cur});
  abrirPainel(id);
 }
 async function pedirVaga(id){
  await transacao(id,'jogo',cur=>{if(!cur)return undefined;cur.fila=cur.fila||{};cur.fila[eu()]=1;cur.nomes=cur.nomes||{};cur.nomes[eu()]=meuNome();return cur});
  aviso('Você entra na próxima partida desta mesa.');
 }
 async function novaPartida(id){
  const j=dados[id].jogo;if(!j||j.fase!=='fim'||j.dono!==eu())return;
  // quem pediu vaga entra primeiro; depois quem jogou; até o máximo do jogo
  const G=regras(j),conv={};[...Object.keys(j.fila||{}),...(j.jog||[])].filter(u=>u!==eu()).forEach(u=>{if(Object.keys(conv).length<G.max-1)conv[u]='c'});
  await transacao(id,'jogo',cur=>{if(!cur||cur.fase!=='fim'||cur.dono!==eu())return undefined;return{tipo:cur.tipo,dono:eu(),fase:'convite',conv,nomes:cur.nomes||{},aposta:cur.aposta||0,t:Date.now()}});
 }
 async function encerrar(id){ // dono fecha a mesa depois do fim (os botões voltam)
  await transacao(id,'jogo',cur=>cur&&cur.fase==='fim'&&cur.dono===eu()?null:undefined);
 }
 /* aposta: paga ao começar, prêmio ao vencer (cada um mexe só no próprio ouro) */
 function cobrarEPagar(id){
  const j=dados[id].jogo,u=eu();if(!j||!j.aposta||!Array.isArray(j.jog)||!j.jog.includes(u)||simulado)return;
  if((j.fase==='jogando'||j.fase==='fim')&&!(j.pago&&j.pago[u]))transacao(id,'jogo/pago/'+u,cur=>cur?undefined:1).then(ok=>{if(ok){p.gold=Math.max(0,(p.gold|0)-j.aposta);aviso('Aposta: -'+j.aposta+' ouro');if(window.saveGame)saveGame()}});
  const st=j.fase==='fim'&&estado(j);
  if(st&&st.fim&&st.fim.vencedores.map(i=>j.jog[i]).includes(u)&&!(j.premio&&j.premio[u])){
   const premio=Math.floor(j.aposta*j.jog.length/st.fim.vencedores.length);
   transacao(id,'jogo/premio/'+u,cur=>cur?undefined:1).then(ok=>{if(ok){p.gold=(p.gold|0)+premio;aviso('Você ganhou '+premio+' ouro!','#ffd84a');if(window.playGameSound)playGameSound('coin');if(window.saveGame)saveGame()}});
  }
 }

 /* o painel fecha sozinho para quem não faz mais parte do jogo da mesa: convite cancelado, recusado, desistiu ou saiu
    (quem jogou continua vendo o resultado no fim; quem assiste, enquanto estiver assistindo) */
 function foraDoJogo(id){
  const j=dados[id].jogo,u=eu();if(!j)return true;
  if(j.fase==='convite')return j.dono!==u&&!(j.conv&&j.conv[u]);
  const i=Array.isArray(j.jog)?j.jog.indexOf(u):-1;if(i>=0){const st=estado(j);return!!(st&&st.fora&&st.fora[i]&&!st.fim)}
  return!(j.espect&&j.espect[u])&&!(j.fila&&j.fila[u]);
 }
 /* ================= painel do jogo ================= */
 const painel={mesa:null,el:null,escolha:null};
 const E=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
 const B=(x,fn,c)=>{const b=E('button',c||'mesaBtn',x);b.type='button';b.onclick=fn;return b};
 function abrirPainel(id){painel.mesa=id;painel.escolha=null;if(!painel.el){painel.el=E('div','mesaPainel');painel.el.setAttribute('role','dialog');document.body.append(painel.el)}painel.el.hidden=false;desenharPainel()}
 function fecharPainel(){const id=painel.mesa;painel.mesa=null;if(painel.el)painel.el.hidden=true;
  const j=id&&dados[id].jogo;if(j&&j.espect&&j.espect[eu()])transacao(id,'jogo/espect/'+eu(),cur=>cur?null:undefined);
  if(j&&j.fase==='convite'&&j.conv&&j.conv[eu()]&&j.dono!==eu())sairDoConvite(id)}
 // cartas e pedras
 const CORUNO={r:'#d8432f',g:'#3f9a44',b:'#2f6fd0',y:'#e0b62a'};
 function cartaTruco(c,{costas,onClick,dest}={}){const d=E(onClick?'button':'div','carta truco'+(costas?' costas':'')+(dest?' destaque':''));if(onClick){d.type='button';d.onclick=onClick}
  if(!costas){const n=c.slice(-1),r=c.slice(0,-1);d.append(E('b','',r),E('span','',J().truco.NOME_NAIPE[n]));if(n==='o'||n==='c')d.classList.add('verm')}return d}
 function cartaUno(c,{costas,onClick,apagada}={}){const d=E(onClick?'button':'div','carta uno'+(costas?' costas':'')+(apagada?' apagada':''));if(onClick){d.type='button';d.onclick=onClick}
  if(!costas){const cor=c[0]==='W'?null:c[0],s=c[0]==='W'?(c==='W4'?'+4':'★'):c.slice(1);d.style.background=cor?CORUNO[cor]:'#262626';d.append(E('b','',s==='S'?'⊘':s==='R'?'⇄':s==='+'?'+2':s))}return d}
 function pedraDom(s,{costas,onClick,deitada}={}){const d=E(onClick?'button':'div','pedra'+(costas?' costas':'')+(deitada?' deitada':''));if(onClick){d.type='button';d.onclick=onClick}
  if(!costas){const [a,b]=typeof s==='string'?s.split('-').map(Number):s;for(const v of [a,b]){const h=E('span','meia');h.dataset.v=v;for(let k=0;k<v;k++)h.append(E('i'));d.append(h)}}return d}
 function desenharPainel(){
  const id=painel.mesa;if(!id||!painel.el)return;const el=painel.el,j=dados[id].jogo,u=eu();el.replaceChildren();
  const topo=E('div','mesaTopo');topo.append(E('b','',(j?regras(j).nome+' · ':'')+NOME_MESA[id]),B('×',fecharPainel,'mesaFechar'));el.append(topo);
  if(!j){el.append(E('p','mesaInfo','Nenhum jogo nesta mesa.'));return}
  const G=regras(j);
  if(j.fase==='convite'){
   const dono=j.dono===u,lista=E('div','mesaLista');
   const linha=(uid,txt)=>{const l=E('div','mesaJog');l.append(E('span','',nomeDe(j,uid)),E('small','',txt));lista.append(l)};
   linha(j.dono,'★ convidou');for(const k in j.conv||{})linha(k,j.conv[k]==='a'?'✓ pronto':'… convidado');
   el.append(E('p','mesaInfo',dono?'Convide quem está sentado na mesa. Quem aceitar aparece aqui.':'Aguardando '+nomeDe(j,j.dono)+' iniciar.'),lista);
   const ap=E('div','mesaAposta');ap.append(E('span','','Aposta: '));
   if(dono){const inp=E('input');inp.type='number';inp.min=0;inp.value=j.aposta||0;inp.onchange=()=>definirAposta(id,inp.value);ap.append(inp,E('small','',' ouro por jogador (você tem '+(p.gold|0)+')'))}
   else ap.append(E('b','',(j.aposta||0)+' ouro'),E('small','',' por jogador · pote do vencedor'));
   el.append(ap);
   const acoes=E('div','mesaAcoes'),n=1+Object.values(j.conv||{}).filter(v=>v==='a').length;
   if(dono){const b=B('Iniciar ('+n+' jogador'+(n>1?'es':'')+')',()=>iniciar(id),'mesaBtn primario');b.disabled=!G.valido(n);acoes.append(b,B('Cancelar',async()=>{await transacao(id,'jogo',cur=>cur&&cur.dono===u&&cur.fase==='convite'?null:undefined);fecharPainel()}))}
   else if(j.conv&&j.conv[u]==='a')acoes.append(B('Sair',()=>{sairDoConvite(id);fecharPainel()}));
   else acoes.append(B('Aceitar',()=>aceitar(id),'mesaBtn primario'),B('Recusar',()=>{sairDoConvite(id);fecharPainel()}));
   if(!G.valido(n))acoes.append(E('small','mesaDica',j.tipo==='truco'?'Truco: 2 ou 4 jogadores.':G.nome+': de '+G.min+' a '+G.max+' jogadores.'));
   el.append(acoes);return;
  }
  const st=estado(j),eu_i=meuIndice(j),jogador=eu_i>=0&&!st.fora[eu_i];
  const pote=(j.aposta||0)*j.jog.length;
  el.append(E('p','mesaInfo',(pote?'Pote: '+pote+' ouro · ':'')+j.jog.map((x,i)=>nomeDe(j,x)+(st.fora[i]?' (saiu)':'')).join(', ')+(jogador?'':' · você está assistindo')));
  // faixa da vez: SUA VEZ bem clara (ou de quem é), com o prazo de 30 s correndo
  const v=j.fase==='jogando'&&infoVez(id);painel.relogio=null;
  if(v){const fx=E('div','mesaVez'+(v.minha?' minha':''));fx.append(E('b','',v.minha?(v.pedido?'SUA VEZ: responda o pedido!':'SUA VEZ!'):'Vez de '+(v.nomes.join(' e ')||'…')));const rel=E('span','mesaRelogio',v.resta+'s');fx.append(rel);fx.style.setProperty('--resta',(v.resta/30*100)+'%');painel.relogio=rel;el.append(fx)}
  const tab=E('div','mesaTab');el.append(tab);
  if(j.tipo==='truco')mesaTruco(tab,j,st,eu_i);else if(j.tipo==='uno')mesaUno(tab,j,st,eu_i);else mesaDomino(tab,j,st,eu_i);
  if(erroJogo)el.append(E('p','mesaErro',erroJogo));
  const log=E('div','mesaLog');(st.log||[]).slice(-4).forEach(t=>log.append(E('div','',t)));el.append(log);
  const ac=E('div','mesaAcoes');
  if(j.fase==='fim'){
   const venc=st.fim.vencedores.map(i=>nomeDe(j,j.jog[i])).join(' e ');
   el.insertBefore(E('p','mesaFim','Fim! Venceu: '+venc+' ('+st.fim.motivo+')'+(pote?' · prêmio '+Math.floor(pote/st.fim.vencedores.length)+' ouro':'')),tab);
   if(j.dono===u)ac.append(B('Nova partida',()=>novaPartida(id),'mesaBtn primario'),B('Liberar a mesa',()=>{encerrar(id);fecharPainel()}));
   ac.append(B('Fechar',fecharPainel));
  }else{
   if(jogador)ac.append(B('Desistir',()=>{if(confirm('Desistir da partida? A aposta fica no pote.'))desistir(id)},'mesaBtn perigo'));
   else if(!(j.fila&&j.fila[u]))ac.append(B('Pedir para jogar a próxima',()=>pedirVaga(id)));
   else ac.append(E('small','mesaDica','Você entra na próxima partida.'));
  }
  el.append(ac);
 }
 const nomeJ=(j,st,i)=>nomeDe(j,j.jog[i])+(st.fora[i]?' (saiu)':'');
 function vez(st,i){return st.vez===i||st.mao&&st.mao.vez===i}
 function outrosJog(box,j,st,eu_i,quantos){const o=E('div','mesaOutros');j.jog.forEach((u,i)=>{if(i===eu_i)return;const c=E('div','mesaOutro'+(vez(st,i)?' vez':''));c.append(E('span','',nomeJ(j,st,i)),E('small','',quantos(i)));o.append(c)});box.append(o)}
 function mesaTruco(box,j,st,eu_i){
  const T=J().truco,m=st.mao,acs=eu_i>=0?T.acoes(st,eu_i):[];
  const placar=E('div','truPlacar');st.times.forEach((t,k)=>placar.append(E('span',eu_i>=0&&t.includes(eu_i)?'meu':'','Time '+(k+1)+': '+st.pontos[k]+(t.length>1?' ('+t.map(i=>nomeDe(j,j.jog[i])).join(' + ')+')':''))));box.append(placar);
  outrosJog(box,j,st,eu_i,i=>m.cartas[i].length+' carta(s)');
  const centro=E('div','truCentro');const vira=E('div','truVira');vira.append(E('small','','Vira'),cartaTruco(m.vira));centro.append(vira);
  const mesa=E('div','truMesa');(m.mesa.length?m.mesa:m.ultimaMesa||[]).forEach(o=>{const w=E('div','truJogada'+(m.mesa.length?'':' antiga'));w.append(cartaTruco(o.c),E('small','',nomeDe(j,j.jog[o.j])));mesa.append(w)});centro.append(mesa);
  centro.append(E('div','truValor','Vale '+m.valor+(m.rodadas.length?' · rodadas: '+m.rodadas.map(r=>r==='E'?'empate':'T'+(r+1)).join(', '):'')));box.append(centro);
  if(m.pedido)box.append(E('p','mesaAviso','Time '+(m.pedido.time+1)+' pediu '+T.NOME_VALOR[m.pedido.valor]+'!'));
  if(eu_i>=0&&!st.fora[eu_i]){const mao=E('div','mesaMao');const jogaveis=new Set(acs.filter(a=>a.t==='jogar').map(a=>a.k));
   m.cartas[eu_i].forEach((c,k)=>mao.append(cartaTruco(c,{dest:jogaveis.has(k),onClick:jogaveis.has(k)?()=>agir(painel.mesa,{t:'jogar',k}):null})));box.append(mao);
   const bt=E('div','mesaAcoes');for(const a of acs){if(a.t==='jogar')continue;const rot={truco:'Pedir '+T.NOME_VALOR[[1,3,6,9,12][[1,3,6,9,12].indexOf(m.valor)+1]],aceitar:'Aceitar',correr:'Correr',aumentar:'Aumentar'}[a.t];bt.append(B(rot,()=>agir(painel.mesa,a),a.t==='correr'?'mesaBtn':'mesaBtn primario'))}
   if(!st.fim&&vez(st,eu_i)&&!m.pedido)bt.append(E('small','mesaDica','Sua vez: escolha uma carta.'));box.append(bt)}
 }
 function mesaUno(box,j,st,eu_i){
  const U=J().uno,acs=eu_i>=0?U.acoes(st,eu_i):[];
  outrosJog(box,j,st,eu_i,i=>st.maos[i].length+' carta(s)'+(st.maos[i].length===1?' · UNO!':''));
  const centro=E('div','unoCentro');centro.append(cartaUno(st.descarte[st.descarte.length-1]));const cor=E('div','unoCor');cor.style.background=CORUNO[st.cor];cor.title='Cor da vez: '+U.NOME_COR[st.cor];centro.append(cor,E('small','','Monte: '+st.monte.length+' · sentido '+(st.dir>0?'↻':'↺')));box.append(centro);
  if(eu_i>=0&&!st.fora[eu_i]){
   if(painel.escolha!=null){const pk=E('div','unoEscolha');pk.append(E('span','','Escolha a cor:'));for(const c of ['r','g','b','y']){const b=B('',()=>{const k=painel.escolha;painel.escolha=null;agir(painel.mesa,{t:'jogar',k,cor:c})},'unoCorBtn');b.style.background=CORUNO[c];b.title=U.NOME_COR[c];pk.append(b)}pk.append(B('Voltar',()=>{painel.escolha=null;desenharPainel()}));box.append(pk)}
   const mao=E('div','mesaMao');const jog=new Set(acs.filter(a=>a.t==='jogar').map(a=>a.k));
   st.maos[eu_i].forEach((c,k)=>mao.append(cartaUno(c,{apagada:!jog.has(k)&&vez(st,eu_i),onClick:jog.has(k)?()=>{if(c[0]==='W'){painel.escolha=k;desenharPainel()}else agir(painel.mesa,{t:'jogar',k})}:null})));box.append(mao);
   const bt=E('div','mesaAcoes');for(const a of acs){if(a.t==='comprar')bt.append(B('Comprar',()=>agir(painel.mesa,a)));if(a.t==='passar')bt.append(B('Passar',()=>agir(painel.mesa,a)))}
   if(!st.fim&&vez(st,eu_i))bt.append(E('small','mesaDica','Sua vez.'));box.append(bt)}
 }
 function mesaDomino(box,j,st,eu_i){
  const D=J().domino,acs=eu_i>=0?D.acoes(st,eu_i):[];
  outrosJog(box,j,st,eu_i,i=>st.maos[i].length+' pedra(s)');
  const fila=E('div','domMesa');st.mesa.forEach(pr=>fila.append(pedraDom(pr,{deitada:pr[0]!==pr[1]})));if(!st.mesa.length)fila.append(E('small','','Mesa vazia: jogue qualquer pedra.'));box.append(fila);
  box.append(E('small','mesaDica','Pontas: '+(st.pontas?st.pontas.join(' · '):'—')+' · monte: '+st.monte.length));
  if(eu_i>=0&&!st.fora[eu_i]){
   if(painel.escolha!=null){const k=painel.escolha,ld=acs.filter(a=>a.t==='jogar'&&a.k===k);const pk=E('div','unoEscolha');pk.append(E('span','','Em qual ponta?'));
    for(const a of ld)pk.append(B(a.lado==='e'?'◀ Esquerda ('+st.pontas[0]+')':'Direita ('+st.pontas[1]+') ▶',()=>{painel.escolha=null;agir(painel.mesa,a)}));pk.append(B('Voltar',()=>{painel.escolha=null;desenharPainel()}));box.append(pk)}
   const mao=E('div','mesaMao');
   st.maos[eu_i].forEach((s,k)=>{const lados=acs.filter(a=>a.t==='jogar'&&a.k===k);mao.append(pedraDom(s,{onClick:lados.length?()=>{if(lados.length===1)agir(painel.mesa,lados[0]);else{painel.escolha=k;desenharPainel()}}:null}))});box.append(mao);
   const bt=E('div','mesaAcoes');for(const a of acs){if(a.t==='comprar')bt.append(B('Comprar do monte',()=>agir(painel.mesa,a)));if(a.t==='passar')bt.append(B('Passar',()=>agir(painel.mesa,a)))}
   if(!st.fim&&vez(st,eu_i))bt.append(E('small','mesaDica','Sua vez.'));box.append(bt)}
 }

 /* ---- vez: aviso, som e prazo ---- */
 const minhaVezAntes={};
 function infoVez(id){
  const j=dados[id].jogo;if(!j||j.fase!=='jogando')return null;const st=estado(j),G=regras(j),q=G.quemAge(st),u=eu();
  return{minha:q.some(i=>j.jog[i]===u),nomes:q.map(i=>nomeDe(j,j.jog[i])),resta:Math.max(0,Math.ceil(((j.prazo||0)-agora())/1000)),pedido:!!(st.mao&&st.mao.pedido)};
 }
 function avisarVez(id){
  const v=infoVez(id),antes=!!minhaVezAntes[id];minhaVezAntes[id]=!!(v&&v.minha);
  if(v&&v.minha&&!antes&&!simulado){if(window.playGameSound)playGameSound('suaVez');aviso(v.pedido?'RESPONDA O PEDIDO!':'SUA VEZ!','#ffd84a')}
 }
 let ultimoTique=-1;
 setInterval(()=>{
  for(const id of escutando){
   const j=dados[id].jogo;if(!j||j.fase!=='jogando'||!j.prazo)continue;
   const v=infoVez(id);
   if(v&&v.minha&&v.resta<=5&&v.resta>0&&v.resta!==ultimoTique){ultimoTique=v.resta;if(window.playGameSound)playGameSound('tiqueVez')}
   // passou do prazo (com 1 s de folga): qualquer um na mesa aplica a perda de vez; a transação garante uma vez só
   if(agora()>j.prazo+1000){const prazo=j.prazo;transacao(id,'jogo',cur=>{if(!cur||cur.fase!=='jogando'||cur.prazo!==prazo||agora()<=cur.prazo+1000)return undefined;
    const st=regras(cur).perderVez(JSON.parse(cur.estado));cur.estado=JSON.stringify(st);cur.t=Date.now();if(st.fim)cur.fase='fim';cur.prazo=agora()+PRAZO_MS;return cur})}
  }
  // relógio do painel aberto (sem redesenhar o painel inteiro)
  if(painel.mesa&&painel.relogio){const v=infoVez(painel.mesa);if(v){painel.relogio.textContent=v.resta+'s';painel.relogio.parentElement.style.setProperty('--resta',(v.resta/30*100)+'%');painel.relogio.parentElement.classList.toggle('urgente',v.resta<=5)}}
 },250);
 /* ---- ciclo: entra/sai da taverna (as mesas só são lidas lá) ---- */
 let naTaverna=false;
 setInterval(()=>{
  const dentro=!!window.inTaverna;
  if(dentro&&!naTaverna){IDS.forEach(escutar)}
  if(!dentro&&naTaverna){if(sentado)levantar();if(painel.mesa)fecharPainel();pararDeEscutar()}
  naTaverna=dentro;
 },400);

 window.MESAS={IDS,NOME_MESA,dados,eu,sentar,levantar,get sentado(){return sentado},assentoDe,sentados,convidar,aceitar,iniciar,agir,desistir,assistir,pedirVaga,novaPartida,encerrar,definirAposta,
  abrirPainel,fecharPainel,infoVez,get painelAberto(){return painel.mesa},estado,meuIndice,ativo,nomeDe,
  // testes: agir como outro jogador (só na mesa local)
  simular(uid,nome,fn){if(online())return;const ant=simulado;simulado={uid,nome};try{return fn()}finally{simulado=ant}},
  simSentar(mesa,i,uid){if(!online())localDefine(mesa,'assentos/'+i,uid)},
  escutarTodas(){IDS.forEach(escutar)}};
})();
