/* ---------- Chat de voz (WebRTC) ----------
   Conversa por voz com quem está na mesma sala (sua ilha com visitas, a DG do grupo ou a taverna).
   Em grupo, também entra na sala do grupo (grupo:{líder}): os membros se ouvem em qualquer lugar, e quem está no mesmo lugar continua ouvindo.
   O áudio vai direto entre os jogadores (ponto a ponto); o Firebase só faz a apresentação:
    voz/{sala}/{uid}     quem está com a voz ligada nesta sala
    sinal/{uid}/{id}     ofertas, respostas e candidatos de rede endereçados a cada jogador
   Em cada par, quem tem o uid "menor" faz a oferta. Até 8 pessoas por sala.
   Quando a rede de alguém bloqueia a conexão direta (internet móvel, CGNAT), só funciona com um
   servidor TURN: window.VOZ_TURN_URL ou window.VOZ_ICE em js/firebase-config.js. */
(function(){
 if(MODO.teste||MODO.motor||!window.CONTA_ATIVA)return;
 const MAX=8,TENTATIVAS=3,STUN=[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}];
 let N=null,db=null,uid=null,ligado=false,mudo=false,mic=null,ctxAudio=null,ice=null;
 const pares=new Map(),niveis=new Map(),tentativas=new Map();
 const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e};
 // os áudios dos outros ficam na página (alguns navegadores não tocam áudio solto)
 const sons=el('div');sons.hidden=true;document.body.append(sons);

 /* ---- servidores de rede: STUN sempre; TURN se configurado ---- */
 async function servidores(){
  if(ice)return ice;
  let extra=Array.isArray(window.VOZ_ICE)?window.VOZ_ICE.filter(s=>s&&s.urls):[];
  if(window.VOZ_TURN_URL){
   try{const r=await fetch(window.VOZ_TURN_URL);const lista=await r.json();if(Array.isArray(lista))extra=extra.concat(lista.filter(s=>s&&s.urls))}
   catch(e){console.warn('Voz: não foi possível buscar as credenciais TURN',e&&e.message||e)}
  }
  return ice=STUN.concat(extra);
 }
 const temTurn=()=>!!(ice&&ice.some(s=>[].concat(s.urls).some(u=>/^turns?:/.test(u))));

 /* ---- configuração (engrenagem): modo, microfone, volume; a saída de som é a do jogo (js/audio.js) ---- */
 const CFG_KEY='ilha-rpg-voz';
 const cfg=Object.assign({modo:'sempre',mic:'',volume:100},(()=>{try{return JSON.parse(localStorage.getItem(CFG_KEY)||'{}')}catch(e){return {}}})());
 const salvarCfg=()=>{try{localStorage.setItem(CFG_KEY,JSON.stringify(cfg))}catch(e){}};
 const saida=()=>window.SOM?SOM.saida||'':'';
 const usarSaida=a=>{if(a&&a.setSinkId)a.setSinkId(saida()).catch(()=>{})};
 window.addEventListener('som-saida',()=>{for(const par of pares.values())usarSaida(par.audio)});
 let apertando=false; // "apertar para falar": tecla ou botão seguro
 const transmitindo=()=>ligado&&!mudo&&(cfg.modo==='sempre'||apertando);
 function aplicarMic(){if(mic)mic.getAudioTracks().forEach(t=>t.enabled=transmitindo());atualizar()}

 /* ---- interface na barra do chat: Voz, microfone (com nível), Falar e engrenagem ---- */
 const SVG_MIC='<svg viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path d="M6 1h4v1h1v7h-1v1H6V9H5V2h1z"/><path d="M3 7h1v2h1v1h1v1h4v-1h1V9h1V7h1v2h-1v1h-1v1h-1v1H9v2h2v1H5v-1h2v-2H6v-1H5v-1H4V9H3z"/></svg>';
 const caixa=el('span','vozBox');
 const bVoz=el('button','onlineTab vozBtn','Voz');bVoz.type='button';
 const bMic=el('button','vozMic');bMic.type='button';bMic.innerHTML=SVG_MIC+'<i class="vozNivel"><i></i></i>';
 const bFalar=el('button','onlineTab vozFalar','Falar');bFalar.type='button';
 const bCfg=el('button','vozCfg');bCfg.type='button';bCfg.title='Configurar a voz';bCfg.setAttribute('aria-label','Configurar a voz');
 bCfg.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path d="M7 1h2v2h1v1h1V3h2v2h-1v1h1v1h2v2h-2v1h-1v1h1v2h-2v-1h-1v1H9v2H7v-2H6v-1H5v1H3v-2h1v-1H3V9H1V7h2V6h1V5H3V3h2v1h1V3h1zM7 6v1H6v2h1v1h2V9h1V7H9V6z"/></svg>';
 caixa.append(bVoz,bMic,bFalar,bCfg);
 function colocarNaBarra(){const bar=document.querySelector('.onlineBar');if(bar&&!caixa.isConnected)bar.append(caixa);return !!bar}
 if(!colocarNaBarra()){const t=setInterval(()=>{if(colocarNaBarra())clearInterval(t)},500)}
 const conectados=()=>[...pares.values()].filter(par=>par.estado==='conectado').length;
 function atualizar(){
  bVoz.classList.toggle('on',ligado);bVoz.setAttribute('aria-pressed',String(ligado));
  bVoz.textContent=ligado?'Voz ('+(conectados()+1)+')':'Voz';
  bVoz.title=ligado?'Sair do chat de voz':window.MP&&MP.grupoLider?'Entrar no chat de voz (mesmo lugar e grupo)':'Entrar no chat de voz com quem está no mesmo lugar';
  const tecla=window.TECLAS?TECLAS.rotulo('falar'):'V';
  bMic.hidden=!ligado;bFalar.hidden=!ligado||cfg.modo!=='apertar';
  bMic.className='vozMic '+(!ligado?'':mudo?'mudo':transmitindo()?'aberto':'espera');
  bMic.title=mudo?'Microfone mudo: clique para voltar a falar':cfg.modo==='apertar'?(apertando?'Transmitindo':'Segure '+tecla+' ou o botão Falar para falar'):'Microfone aberto: clique para deixar mudo';
  bMic.setAttribute('aria-label',bMic.title);bMic.setAttribute('aria-pressed',String(mudo));
  bFalar.textContent='Falar ('+tecla+')';bFalar.classList.toggle('on',apertando);
  if(!painel.hidden)atualizarLista();
 }
 bVoz.onclick=()=>ligado?desligar():ligar();
 bMic.onclick=()=>{mudo=!mudo;aplicarMic()};
 // botão de segurar para falar (mouse e toque)
 const soltar=()=>{if(apertando){apertando=false;aplicarMic()}};
 bFalar.addEventListener('pointerdown',e=>{e.preventDefault();bFalar.setPointerCapture(e.pointerId);apertando=true;aplicarMic()});
 bFalar.addEventListener('pointerup',soltar);bFalar.addEventListener('pointercancel',soltar);bFalar.addEventListener('lostpointercapture',soltar);
 // tecla de falar (configurável em Menu › Controles)
 addEventListener('keydown',e=>{if(e.repeat||cfg.modo!=='apertar'||!ligado||!window.TECLAS||TECLAS.acao(e)!=='falar')return;apertando=true;aplicarMic()});
 addEventListener('keyup',e=>{if(window.TECLAS&&e.code===TECLAS.tecla('falar'))soltar()});
 addEventListener('blur',soltar);
 window.addEventListener('teclas-mudaram',atualizar);
 const sistema=t=>window.onlineSystem&&onlineSystem(t);

 /* ---- painel da engrenagem ---- */
 const painel=el('div','vozPainel');painel.hidden=true;painel.setAttribute('role','dialog');painel.setAttribute('aria-label','Configurações de voz e som');
 painel.addEventListener('keydown',e=>e.stopPropagation());document.body.append(painel);
 bCfg.onclick=()=>{painel.hidden=!painel.hidden;if(!painel.hidden)montarPainel()};
 let medidor=null,listaEl=null;
 async function opcoesDispositivos(sel,tipo,atual,padrao){
  sel.replaceChildren(new Option(padrao,''));
  const lista=window.SOM?await SOM.dispositivos(tipo):[];
  lista.filter(d=>d.deviceId&&d.deviceId!=='default'&&d.deviceId!=='communications').forEach((d,i)=>sel.append(new Option(d.label||(tipo==='audioinput'?'Microfone ':'Saída ')+(i+1),d.deviceId)));
  sel.value=atual;if(sel.value!==atual)sel.value='';
  return lista.length&&lista.every(d=>!d.label); // sem nomes: o navegador ainda não deu permissão
 }
 async function montarPainel(){
  const box=[];
  const topo=el('div','vozTopo');topo.append(el('b','','Voz e som'),Object.assign(el('button','mpBtn','Fechar'),{type:'button',onclick:()=>{painel.hidden=true}}));box.push(topo);
  // quem está na voz aqui
  listaEl=el('div','vozLista');box.push(listaEl);
  // modo
  const modo=el('fieldset','vozModo');modo.append(el('legend','','Modo do microfone'));
  for(const [id,rotulo,dica] of [['sempre','Sempre ligado','Fala sempre que o microfone capta som'],['apertar','Apertar para falar','Só transmite enquanto segura a tecla ou o botão Falar']]){
   const l=el('label'),r=el('input');r.type='radio';r.name='vozModo';r.checked=cfg.modo===id;r.onchange=()=>{cfg.modo=id;salvarCfg();apertando=false;aplicarMic();montarPainel()};
   l.append(r,el('span','',rotulo),el('small','',dica));modo.append(l);
  }
  box.push(modo);
  // tecla
  const lt=el('div','vozLinha');lt.append(el('span','','Tecla de falar'));
  const bt=el('button','teclaBtn',window.TECLAS?TECLAS.rotulo('falar'):'V');bt.type='button';
  bt.onclick=()=>{bt.textContent='Aperte uma tecla…';bt.classList.add('esperando');
   const fim=ev=>{ev.preventDefault();ev.stopPropagation();removeEventListener('keydown',fim,true);if(ev.code!=='Escape'&&window.TECLAS)TECLAS.definir('falar',ev.code);montarPainel()};
   addEventListener('keydown',fim,true)};
  lt.append(bt);box.push(lt);
  // entrada (microfone)
  const lm=el('label','vozLinha');lm.append(el('span','','Entrada (microfone)'));
  const sel=el('select');lm.append(sel);box.push(lm);
  const semNomes=await opcoesDispositivos(sel,'audioinput',cfg.mic,'Padrão do sistema');
  sel.onchange=async()=>{cfg.mic=sel.value;salvarCfg();if(ligado)await trocarMicrofone()};
  // saída (alto-falante ou fone): vale para a voz e para os sons do jogo
  if(window.SOM&&SOM.suportaSaida()){
   const ls=el('label','vozLinha');ls.append(el('span','','Saída (alto-falante/fone)'));
   const ss=el('select');ls.append(ss);box.push(ls);
   await opcoesDispositivos(ss,'audiooutput',SOM.saida,'Padrão do sistema');
   ss.onchange=()=>{SOM.definirSaida(ss.value);SOM.testar()};
   const tb=el('button','mpBtn','Testar saída');tb.type='button';tb.onclick=()=>SOM.testar();
   const lt2=el('div','vozLinha');lt2.append(el('span','',''),tb);box.push(lt2);
  }else box.push(el('p','mpNota','Este navegador não deixa escolher a saída de som: use a do sistema.'));
  if(semNomes){const pb=el('button','mpBtn','Mostrar nomes dos dispositivos');pb.type='button';
   pb.onclick=async()=>{try{const s=await navigator.mediaDevices.getUserMedia({audio:true});s.getTracks().forEach(t=>t.stop())}catch(e){}montarPainel()};box.push(pb)}
  // volume
  const lv=el('label','vozLinha');lv.append(el('span','','Volume dos outros'));
  const vol=el('input');vol.type='range';vol.min=0;vol.max=100;vol.value=cfg.volume;const vt=el('b','',cfg.volume+'%');
  vol.oninput=()=>{cfg.volume=+vol.value;vt.textContent=cfg.volume+'%';for(const par of pares.values())if(par.audio)par.audio.volume=cfg.volume/100;salvarCfg()};
  lv.append(vol,vt);box.push(lv);
  // teste do microfone
  const tst=el('div','vozLinha');tst.append(el('span','','Teste do microfone'));
  const barra=el('i','vozNivel grande');barra.append(el('i'));tst.append(barra);box.push(tst);
  box.push(el('p','mpNota',ligado?'Fale algo: a barra verde mostra o som que o microfone está captando.':'Entre na voz (botão Voz) para testar o microfone.'));
  painel.replaceChildren(...box);
  medidor=barra;atualizarLista();
 }
 const ROTULO={conectando:'conectando…',conectado:'conectado',falhou:'sem conexão',caiu:'reconectando…'};
 function atualizarLista(){
  if(!listaEl)return;
  const itens=[];
  if(!ligado)itens.push(el('p','mpNota','Você está fora da voz. Clique em Voz para entrar.'));
  else{
   const outros=[...new Set([...salas.values()].flatMap(s=>[...s.membros]))].filter(id=>id!==uid);
   if(!outros.length)itens.push(el('p','mpNota',window.MP&&MP.grupoLider?'Ninguém mais está com a voz ligada aqui nem no seu grupo. Em grupo, a voz conecta quem está no mesmo lugar e os membros do grupo em qualquer lugar.':'Ninguém mais está com a voz ligada aqui. Sem grupo, a voz só conecta quem está no mesmo lugar (mesma ilha, DG ou taverna) e também clicou em Voz.'));
   const ul=el('ul');
   for(const id of outros){
    const par=pares.get(id),estado=par?par.estado:'conectando';
    const li=el('li','voz-'+estado);li.append(el('span','',window.MP?MP.nomeDe(id):'Jogador'),el('small','',ROTULO[estado]||estado));ul.append(li);
   }
   if(outros.length)itens.push(el('b','mpSub','Na voz aqui'),ul);
   if([...pares.values()].some(par=>par.estado==='falhou'))itens.push(el('p','mpNota aviso',temTurn()?'A conexão falhou mesmo com o servidor TURN. Tente sair e entrar na voz de novo.':'A rede de alguém bloqueia a conexão direta (comum em internet móvel e em alguns provedores). Para funcionar nessas redes, o dono do jogo precisa configurar um servidor TURN (veja o LEIA-ME).'));
  }
  listaEl.replaceChildren(...itens);
 }
 async function trocarMicrofone(){
  try{
   const novo=await navigator.mediaDevices.getUserMedia({audio:{deviceId:cfg.mic?{exact:cfg.mic}:undefined,echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
   const faixa=novo.getAudioTracks()[0];
   for(const par of pares.values())for(const s of par.pc.getSenders())if(s.track&&s.track.kind==='audio')await s.replaceTrack(faixa);
   if(mic)mic.getTracks().forEach(t=>t.stop());
   const n=niveis.get(uid);if(n){try{n.src.disconnect()}catch(e){}}
   mic=novo;medir(uid,mic);aplicarMic();sistema('Microfone trocado.');
  }catch(e){sistema('Não foi possível usar esse microfone.')}
 }
 // nível do próprio microfone: anima a barra do ícone e a do painel
 function nivelProprio(){
  const n=niveis.get(uid);if(!n||!mic)return 0;
  n.an.getByteTimeDomainData(n.buf);let s=0;for(const v of n.buf){const d=v-128;s+=d*d}
  return Math.min(1,Math.sqrt(s/n.buf.length)/28);
 }
 setInterval(()=>{
  if(!ligado)return;
  const v=transmitindo()?nivelProprio():0;
  bMic.style.setProperty('--nivel',v.toFixed(2));
  if(medidor&&!painel.hidden){const bruto=nivelProprio();medidor.style.setProperty('--nivel',(transmitindo()?bruto:0).toFixed(2))}
 },90);

 /* ---- quem está falando (para o ícone sobre o personagem) ---- */
 function medir(id,stream){
  try{
   ctxAudio=ctxAudio||new (window.AudioContext||window.webkitAudioContext)();
   const src=ctxAudio.createMediaStreamSource(stream),an=ctxAudio.createAnalyser();an.fftSize=256;src.connect(an);
   const buf=new Uint8Array(an.fftSize);niveis.set(id,{an,buf,ate:0,src});
  }catch(e){}
 }
 const ate=new Map();
 window.vozFalando=id=>{
  if(!ligado)return false;
  const agora=performance.now();
  if(id===uid){
   // próprio microfone: analisador de áudio
   const n=niveis.get(id);if(!n||!transmitindo())return false;
   if(agora-(n.lido||0)>80){n.lido=agora;n.an.getByteTimeDomainData(n.buf);let s=0;for(const v of n.buf){const d=v-128;s+=d*d}if(Math.sqrt(s/n.buf.length)>6)ate.set(id,agora+250)}
  }else{
   // quem está do outro lado: nível que o próprio WebRTC informa
   const par=pares.get(id);if(!par)return false;
   if(agora-(par.lido||0)>80){par.lido=agora;try{for(const r of par.pc.getReceivers()){const f=r.getSynchronizationSources&&r.getSynchronizationSources()[0];if(f&&f.audioLevel>.02)ate.set(id,agora+250)}}catch(e){}}
  }
  return agora<(ate.get(id)||0);
 };

 /* ---- ligar e desligar ---- */
 async function ligar(){
  if(ligado||!N)return;
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){sistema('Este navegador não permite chat de voz.');return}
  const pedir=id=>navigator.mediaDevices.getUserMedia({audio:{deviceId:id?{exact:id}:undefined,echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
  try{mic=await pedir(cfg.mic).catch(()=>pedir(''))}
  catch(e){sistema('Sem acesso ao microfone. Permita o microfone no navegador para usar a voz.');return}
  await servidores();
  ligado=true;mudo=false;apertando=false;medir(uid,mic);if(ctxAudio&&ctxAudio.state==='suspended')ctxAudio.resume();
  aplicarMic();
  sistema(cfg.modo==='apertar'?'Voz ligada: segure '+(window.TECLAS?TECLAS.rotulo('falar'):'V')+' ou o botão Falar para falar.':(window.MP&&MP.grupoLider?'Voz ligada: quem está no mesmo lugar e o seu grupo (em qualquer lugar) ouvem você.':'Voz ligada: quem estiver no mesmo lugar com a voz ligada vai ouvir você.'));
  sincronizarSalas();if(!painel.hidden)montarPainel();
 }
 function desligar(){
  if(!ligado)return;
  sairDaSala();ligado=false;
  if(mic){mic.getTracks().forEach(t=>t.stop());mic=null}const n=niveis.get(uid);if(n){try{n.src.disconnect()}catch(e){}niveis.delete(uid)}
  apertando=false;sistema('Voz desligada.');atualizar();if(!painel.hidden)montarPainel();
 }
 /* ---- salas de voz: a do lugar sempre; em grupo, também a do grupo (os membros se ouvem em qualquer lugar).
    Quem está em qualquer uma das salas conecta, uma conexão só por pessoa. ---- */
 const salas=new Map(); // nome -> {membros:Set de uids, offs:[]}
 const presente=id=>[...salas.values()].some(s=>s.membros.has(id));
 const salaCom=id=>{for(const [n,s] of salas)if(s.membros.has(id))return n;return salas.keys().next().value||null};
 const salasDesejadas=()=>[...new Set([window.MP&&MP.sala,window.MP&&MP.grupoLider&&'grupo:'+MP.grupoLider].filter(Boolean))];
 function sincronizarSalas(){if(!ligado)return;const quero=salasDesejadas();for(const n of [...salas.keys()])if(!quero.includes(n))sairDe(n);for(const n of quero)if(!salas.has(n))entrarEm(n);atualizar()}
 window.addEventListener('mp-sala',sincronizarSalas);window.addEventListener('mp-grupo',sincronizarSalas);
 function entrarEm(nome){
  const s={membros:new Set(),offs:[]};salas.set(nome,s);
  const eu=db.ref('voz/'+nome+'/'+uid);eu.set({nome:N.nome(),t:firebase.database.ServerValue.TIMESTAMP});eu.onDisconnect().remove();
  const lista=db.ref('voz/'+nome);
  const add=x=>{const id=x.key;s.membros.add(id);if(id!==uid&&window.MP&&x.val()&&x.val().nome)MP.nomes.set(id,x.val().nome);conectarCom(id);atualizar()};
  const rem=x=>{s.membros.delete(x.key);if(!presente(x.key)){tentativas.delete(x.key);fechar(x.key)}atualizar()};
  lista.on('child_added',add);lista.on('child_removed',rem);
  s.offs.push(()=>lista.off('child_added',add),()=>lista.off('child_removed',rem));
 }
 function sairDe(nome){
  const s=salas.get(nome);if(!s)return;salas.delete(nome);s.offs.forEach(f=>f());
  db.ref('voz/'+nome+'/'+uid).remove().catch(()=>{});
  for(const id of [...pares.keys()])if(!presente(id)){tentativas.delete(id);fechar(id)}
 }
 // quem tem o uid menor oferece; o outro espera a oferta
 function conectarCom(id){if(id===uid||pares.has(id)||pares.size>=MAX-1||!presente(id))return;if(uid<id)abrir(id,true)}
 function sairDaSala(){for(const n of [...salas.keys()])sairDe(n);for(const id of [...pares.keys()])fechar(id);tentativas.clear();atualizar()}
 const enviar=(para,dados)=>db.ref('sinal/'+para).push({de:uid,sala:salaCom(para),...dados,t:firebase.database.ServerValue.TIMESTAMP}).catch(()=>{});

 /* ---- conexão com um jogador ---- */
 function abrir(id,ofertar){
  const pc=new RTCPeerConnection({iceServers:ice||STUN});
  const par={pc,pendentes:[],audio:null,pronto:false,estado:'conectando',ofertante:ofertar};pares.set(id,par);
  if(mic)mic.getTracks().forEach(t=>pc.addTrack(t,mic));
  pc.onicecandidate=e=>{if(e.candidate)enviar(id,{tipo:'ice',cand:JSON.stringify(e.candidate)})};
  pc.ontrack=e=>{
   const stream=e.streams&&e.streams[0]||new MediaStream([e.track]);
   if(!par.audio){
    const a=document.createElement('audio');a.autoplay=true;a.playsInline=true;sons.append(a);par.audio=a;usarSaida(a);
   }
   par.audio.srcObject=stream;par.audio.volume=cfg.volume/100;
   par.audio.play().catch(()=>avisarCliqueParaOuvir());
   // o Chrome só ativa o áudio remoto do WebRTC se o contexto de áudio estiver rodando
   if(ctxAudio&&ctxAudio.state==='suspended')ctxAudio.resume().catch(()=>{});
  };
  let timerCaiu=null;
  pc.onconnectionstatechange=()=>{
   const s=pc.connectionState;
   if(pares.get(id)!==par)return;
   if(s==='connected'){
    clearTimeout(timerCaiu);
    if(par.estado!=='conectado'){par.estado='conectado';tentativas.delete(id);sistema((window.MP?MP.nomeDe(id):'Alguém')+' conectou na voz.')}
   }else if(s==='disconnected'){
    par.estado='caiu';
    // tenta reaproveitar a conexão; se não voltar, refaz do zero
    clearTimeout(timerCaiu);timerCaiu=setTimeout(()=>{if(pares.get(id)===par&&pc.connectionState!=='connected')falhou(id)},6000);
   }else if(s==='failed')falhou(id);
   atualizar();
  };
  if(ofertar)pc.createOffer().then(o=>pc.setLocalDescription(o)).then(()=>enviar(id,{tipo:'offer',sdp:pc.localDescription.sdp})).catch(()=>falhou(id));
  // sem resposta em 15 s: conta como falha
  setTimeout(()=>{if(pares.get(id)===par&&par.estado==='conectando')falhou(id)},15000);
  atualizar();return par;
 }
 function falhou(id){
  const par=pares.get(id);if(!par)return;
  const ofertante=par.ofertante;fechar(id);
  const n=(tentativas.get(id)||0)+1;tentativas.set(id,n);
  if(n<TENTATIVAS){
   // quem oferece tenta de novo; o outro avisa para receber a nova oferta
   pares.set(id,{pc:{close(){},getReceivers:()=>[],getSenders:()=>[]},estado:'caiu',ofertante,fantasma:true});
   setTimeout(()=>{const p0=pares.get(id);if(p0&&p0.fantasma)pares.delete(id);if(ligado&&ofertante)conectarCom(id);atualizar()},1500*n);
  }else{
   pares.set(id,{pc:{close(){},getReceivers:()=>[],getSenders:()=>[]},estado:'falhou',ofertante,fantasma:true});
   sistema('Não foi possível conectar a voz com '+(window.MP?MP.nomeDe(id):'esse jogador')+'.'+(temTurn()?'':' A rede de um de vocês bloqueia a conexão direta.'));
  }
  atualizar();
 }
 function fechar(id){
  const par=pares.get(id);if(!par)return;pares.delete(id);
  try{par.pc.close()}catch(e){}
  if(par.audio){par.audio.srcObject=null;par.audio.remove()}
  atualizar();
 }
 // o navegador bloqueou o som: o próximo clique em qualquer lugar libera
 let esperandoClique=false;
 function avisarCliqueParaOuvir(){
  if(esperandoClique)return;esperandoClique=true;
  sistema('Clique em qualquer lugar do jogo para ouvir a voz dos outros.');
  addEventListener('pointerdown',()=>{esperandoClique=false;for(const par of pares.values())if(par.audio)par.audio.play().catch(()=>{});if(ctxAudio)ctxAudio.resume().catch(()=>{})},{once:true,capture:true});
 }
 async function sinal(s){
  const m=s.val();s.ref.remove().catch(()=>{});
  if(!m||!ligado||!salas.has(m.sala)||m.de===uid)return;
  if(Date.now()+(N.offset||0)-(m.t||0)>30000)return;
  let par=pares.get(m.de);
  try{
   if(m.tipo==='offer'){
    if(par)fechar(m.de);if(pares.size>=MAX-1)return;
    if(!presente(m.de))salas.get(m.sala).membros.add(m.de);
    par=abrir(m.de,false);
    await par.pc.setRemoteDescription({type:'offer',sdp:m.sdp});
    const r=await par.pc.createAnswer();await par.pc.setLocalDescription(r);
    enviar(m.de,{tipo:'answer',sdp:par.pc.localDescription.sdp});
    par.pronto=true;for(const c of par.pendentes.splice(0))await par.pc.addIceCandidate(c).catch(()=>{});
   }else if(m.tipo==='answer'&&par&&!par.fantasma){
    await par.pc.setRemoteDescription({type:'answer',sdp:m.sdp});
    par.pronto=true;for(const c of par.pendentes.splice(0))await par.pc.addIceCandidate(c).catch(()=>{});
   }else if(m.tipo==='ice'&&par&&!par.fantasma){
    const c=JSON.parse(m.cand);if(par.pronto)await par.pc.addIceCandidate(c).catch(()=>{});else par.pendentes.push(c);
   }
  }catch(e){console.warn('Voz:',e&&e.message||e)}
 }

 function iniciar(){
  N=window.NUVEM;db=N.db;uid=N.uid;
  db.ref('sinal/'+uid).on('child_added',sinal);
  window.VOZ={ligar,desligar,get ligado(){return ligado},get sala(){return [...salas.keys()].join(',')},get pares(){return conectados()},get mudo(){return mudo},get transmitindo(){return transmitindo()},cfg,
   abrirConfig(){painel.hidden=false;montarPainel()},
   estados:()=>Object.fromEntries([...pares].map(([id,par])=>[id,par.estado]))};
  atualizar();
 }
 if(window.NUVEM)iniciar();else window.addEventListener('nuvem-pronta',iniciar,{once:true});
 addEventListener('pagehide',()=>{if(ligado)sairDaSala()});
})();
