/* ---------- Chat de voz (WebRTC) ----------
   Conversa por voz com quem está na mesma sala (sua ilha com visitas, a DG do grupo ou a taverna).
   O áudio vai direto entre os jogadores (ponto a ponto); o Firebase só faz a apresentação:
    voz/{sala}/{uid}     quem está com a voz ligada nesta sala
    sinal/{uid}/{id}     ofertas, respostas e candidatos de rede endereçados a cada jogador
   Em cada par, quem tem o uid "menor" faz a oferta. Até 8 pessoas por sala. */
(function(){
 if(MODO.teste||MODO.motor||!window.CONTA_ATIVA)return;
 const MAX=8,ICE=[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}];
 let N=null,db=null,uid=null,sala=null,ligado=false,mudo=false,mic=null,ctxAudio=null;
 const pares=new Map(),niveis=new Map(),offs=[];
 const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e};

 /* ---- configuração (engrenagem): modo, microfone e volume, salvos por jogador ---- */
 const CFG_KEY='ilha-rpg-voz';
 const cfg=Object.assign({modo:'sempre',mic:'',volume:100},(()=>{try{return JSON.parse(localStorage.getItem(CFG_KEY)||'{}')}catch(e){return {}}})());
 const salvarCfg=()=>{try{localStorage.setItem(CFG_KEY,JSON.stringify(cfg))}catch(e){}};
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
 function atualizar(){
  bVoz.classList.toggle('on',ligado);bVoz.setAttribute('aria-pressed',String(ligado));
  bVoz.textContent=ligado?'Voz ('+(pares.size+1)+')':'Voz';
  bVoz.title=ligado?'Sair do chat de voz':'Entrar no chat de voz com quem está no mesmo lugar';
  const tecla=window.TECLAS?TECLAS.rotulo('falar'):'V';
  bMic.hidden=!ligado;bFalar.hidden=!ligado||cfg.modo!=='apertar';
  bMic.className='vozMic '+(!ligado?'':mudo?'mudo':transmitindo()?'aberto':'espera');
  bMic.title=mudo?'Microfone mudo: clique para voltar a falar':cfg.modo==='apertar'?(apertando?'Transmitindo':'Segure '+tecla+' ou o botão Falar para falar'):'Microfone aberto: clique para deixar mudo';
  bMic.setAttribute('aria-label',bMic.title);bMic.setAttribute('aria-pressed',String(mudo));
  bFalar.textContent='Falar ('+tecla+')';bFalar.classList.toggle('on',apertando);
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
 const painel=el('div','vozPainel');painel.hidden=true;painel.setAttribute('role','dialog');painel.setAttribute('aria-label','Configurações de voz');
 painel.addEventListener('keydown',e=>e.stopPropagation());document.body.append(painel);
 bCfg.onclick=()=>{painel.hidden=!painel.hidden;if(!painel.hidden)montarPainel()};
 let medidor=null;
 async function montarPainel(){
  const box=[];
  const topo=el('div','vozTopo');topo.append(el('b','','Voz'),Object.assign(el('button','mpBtn','Fechar'),{type:'button',onclick:()=>{painel.hidden=true}}));box.push(topo);
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
  // microfone
  const lm=el('label','vozLinha');lm.append(el('span','','Microfone'));
  const sel=el('select');sel.append(new Option('Padrão do sistema',''));
  try{const lista=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='audioinput');lista.forEach((d,i)=>sel.append(new Option(d.label||'Microfone '+(i+1),d.deviceId)))}catch(e){}
  sel.value=cfg.mic;if(sel.value!==cfg.mic)sel.value='';
  sel.onchange=async()=>{cfg.mic=sel.value;salvarCfg();if(ligado)await trocarMicrofone()};
  lm.append(sel);box.push(lm);
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
  medidor=barra;
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
  ligado=true;mudo=false;apertando=false;medir(uid,mic);if(ctxAudio&&ctxAudio.state==='suspended')ctxAudio.resume();
  aplicarMic();
  sistema(cfg.modo==='apertar'?'Voz ligada: segure '+(window.TECLAS?TECLAS.rotulo('falar'):'V')+' ou o botão Falar para falar.':'Voz ligada: quem estiver no mesmo lugar com a voz ligada vai ouvir você.');
  entrarNaSala(window.MP&&MP.sala);atualizar();if(!painel.hidden)montarPainel();
 }
 function desligar(){
  if(!ligado)return;
  sairDaSala();ligado=false;
  if(mic){mic.getTracks().forEach(t=>t.stop());mic=null}const n=niveis.get(uid);if(n){try{n.src.disconnect()}catch(e){}niveis.delete(uid)}
  apertando=false;sistema('Voz desligada.');atualizar();if(!painel.hidden)montarPainel();
 }
 window.addEventListener('mp-sala',e=>{if(!ligado)return;sairDaSala();entrarNaSala(e.detail&&e.detail.sala)});

 /* ---- sala de voz ---- */
 function entrarNaSala(nova){
  if(!nova||!ligado)return;sala=nova;
  const eu=db.ref('voz/'+sala+'/'+uid);eu.set({nome:N.nome(),t:firebase.database.ServerValue.TIMESTAMP});eu.onDisconnect().remove();
  const lista=db.ref('voz/'+sala);
  const add=s=>{const id=s.key;if(id===uid||pares.has(id)||pares.size>=MAX-1)return;if(uid<id)abrir(id,true)};
  const rem=s=>fechar(s.key);
  lista.on('child_added',add);lista.on('child_removed',rem);
  offs.push(()=>lista.off('child_added',add),()=>lista.off('child_removed',rem));
 }
 function sairDaSala(){
  offs.splice(0).forEach(f=>f());
  for(const id of [...pares.keys()])fechar(id);
  if(sala)db.ref('voz/'+sala+'/'+uid).remove().catch(()=>{});
  sala=null;atualizar();
 }
 const enviar=(para,dados)=>db.ref('sinal/'+para).push({de:uid,sala,...dados,t:firebase.database.ServerValue.TIMESTAMP}).catch(()=>{});

 /* ---- conexão com um jogador ---- */
 function abrir(id,ofertar){
  const pc=new RTCPeerConnection({iceServers:ICE});
  const par={pc,pendentes:[],audio:null,pronto:false};pares.set(id,par);
  if(mic)mic.getTracks().forEach(t=>pc.addTrack(t,mic));
  pc.onicecandidate=e=>{if(e.candidate)enviar(id,{tipo:'ice',cand:JSON.stringify(e.candidate)})};
  pc.ontrack=e=>{
   if(par.audio)return;
   const a=new Audio();a.autoplay=true;a.srcObject=e.streams[0];a.volume=cfg.volume/100;a.play().catch(()=>{});par.audio=a;
   atualizar();
   const nome=window.MP?MP.nomeDe(id):'Alguém';sistema(nome+' entrou na voz.');
  };
  pc.onconnectionstatechange=()=>{if(['failed','closed'].includes(pc.connectionState))fechar(id)};
  if(ofertar)pc.createOffer().then(o=>pc.setLocalDescription(o)).then(()=>enviar(id,{tipo:'offer',sdp:pc.localDescription.sdp})).catch(()=>fechar(id));
  atualizar();return par;
 }
 function fechar(id){
  const par=pares.get(id);if(!par)return;pares.delete(id);
  try{par.pc.close()}catch(e){}
  if(par.audio){par.audio.srcObject=null;par.audio.remove()}
  atualizar();
 }
 async function sinal(s){
  const m=s.val();s.ref.remove().catch(()=>{});
  if(!m||!ligado||m.sala!==sala||m.de===uid)return;
  if(Date.now()+(N.offset||0)-(m.t||0)>30000)return;
  let par=pares.get(m.de);
  try{
   if(m.tipo==='offer'){
    if(par)fechar(m.de);if(pares.size>=MAX-1)return;
    par=abrir(m.de,false);
    await par.pc.setRemoteDescription({type:'offer',sdp:m.sdp});
    const r=await par.pc.createAnswer();await par.pc.setLocalDescription(r);
    enviar(m.de,{tipo:'answer',sdp:par.pc.localDescription.sdp});
    par.pronto=true;for(const c of par.pendentes.splice(0))await par.pc.addIceCandidate(c);
   }else if(m.tipo==='answer'&&par){
    await par.pc.setRemoteDescription({type:'answer',sdp:m.sdp});
    par.pronto=true;for(const c of par.pendentes.splice(0))await par.pc.addIceCandidate(c);
   }else if(m.tipo==='ice'&&par){
    const c=JSON.parse(m.cand);if(par.pronto)await par.pc.addIceCandidate(c);else par.pendentes.push(c);
   }
  }catch(e){console.warn('Voz:',e&&e.message||e)}
 }

 function iniciar(){
  N=window.NUVEM;db=N.db;uid=N.uid;
  db.ref('sinal/'+uid).on('child_added',sinal);
  window.VOZ={ligar,desligar,get ligado(){return ligado},get pares(){return pares.size},get mudo(){return mudo},get transmitindo(){return transmitindo()},cfg};
  atualizar();
 }
 if(window.NUVEM)iniciar();else window.addEventListener('nuvem-pronta',iniciar,{once:true});
 addEventListener('pagehide',()=>{if(ligado)sairDaSala()});
})();
