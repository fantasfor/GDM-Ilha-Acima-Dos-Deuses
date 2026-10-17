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

 /* ---- interface: botão Voz e Mudo na barra do chat ---- */
 const caixa=el('span','vozBox');
 const bVoz=el('button','onlineTab vozBtn','Voz');bVoz.type='button';
 const bMudo=el('button','onlineTab vozMudo','Mudo');bMudo.type='button';bMudo.hidden=true;
 caixa.append(bVoz,bMudo);
 function colocarNaBarra(){const bar=document.querySelector('.onlineBar');if(bar&&!caixa.isConnected)bar.append(caixa);return !!bar}
 if(!colocarNaBarra()){const t=setInterval(()=>{if(colocarNaBarra())clearInterval(t)},500)}
 function atualizar(){
  bVoz.classList.toggle('on',ligado);bVoz.setAttribute('aria-pressed',String(ligado));
  bVoz.textContent=ligado?'Voz ('+(pares.size+1)+')':'Voz';
  bVoz.title=ligado?'Desligar o chat de voz':'Ligar o chat de voz com quem está no mesmo lugar';
  bMudo.hidden=!ligado;bMudo.classList.toggle('on',mudo);bMudo.setAttribute('aria-pressed',String(mudo));
  bMudo.title=mudo?'Microfone desligado: clique para falar':'Desligar o microfone';
 }
 bVoz.onclick=()=>ligado?desligar():ligar();
 bMudo.onclick=()=>{mudo=!mudo;if(mic)mic.getAudioTracks().forEach(t=>t.enabled=!mudo);atualizar()};
 const sistema=t=>window.onlineSystem&&onlineSystem(t);

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
   const n=niveis.get(id);if(!n||mudo)return false;
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
  try{mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}})}
  catch(e){sistema('Sem acesso ao microfone. Permita o microfone no navegador para usar a voz.');return}
  ligado=true;mudo=false;medir(uid,mic);if(ctxAudio&&ctxAudio.state==='suspended')ctxAudio.resume();
  sistema('Voz ligada: quem estiver no mesmo lugar com a voz ligada vai ouvir você.');
  entrarNaSala(window.MP&&MP.sala);atualizar();
 }
 function desligar(){
  if(!ligado)return;
  sairDaSala();ligado=false;
  if(mic){mic.getTracks().forEach(t=>t.stop());mic=null}const n=niveis.get(uid);if(n){try{n.src.disconnect()}catch(e){}niveis.delete(uid)}
  sistema('Voz desligada.');atualizar();
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
   const a=new Audio();a.autoplay=true;a.srcObject=e.streams[0];a.play().catch(()=>{});par.audio=a;
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
  window.VOZ={ligar,desligar,get ligado(){return ligado},get pares(){return pares.size},get mudo(){return mudo}};
  atualizar();
 }
 if(window.NUVEM)iniciar();else window.addEventListener('nuvem-pronta',iniciar,{once:true});
 addEventListener('pagehide',()=>{if(ligado)sairDaSala()});
})();
