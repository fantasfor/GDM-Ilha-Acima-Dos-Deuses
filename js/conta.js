/* ---------- Conta, progresso na nuvem e online pelo Firebase ----------
   Ativo só quando js/firebase-config.js está preenchido (versão do GitHub Pages).
   - Tela de login: só Google. Depois do login, seleção de personagem (1 espaço) com a ilha ao fundo; clicar entra no jogo.
   - O progresso (autosave e slots) fica na conta, em saves/{uid}; vale o mais recente.
   - online.js usa window.ONLINE_NUVEM para posição dos jogadores e chat em tempo real.
   As regras de segurança do banco estão em ferramentas/regras-firebase.json. */
(function(){
 const C=window.FIREBASE_CONFIG;
 if(MODO.teste||MODO.motor||!C||!C.apiKey||!C.databaseURL)return;
 window.CONTA_ATIVA=true;
 if(window.atualizarMenu)atualizarMenu();
 const V='10.12.2',SDK=['app','auth','database'].map(n=>'https://www.gstatic.com/firebasejs/'+V+'/firebase-'+n+'-compat.js');
 const SAVE='ilha-rpg-save',DONO='ilha-rpg-dono',QUANDO='ilha-rpg-save-t';
 const UPLOAD_MS=10000,MAX_SAVE=300000;
 const ls={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}},del:k=>{try{localStorage.removeItem(k)}catch(e){}}};
 const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e};
 let auth,db,user=null,perfil={nome:''},enviado=null,ultimoEnvio=0,meuT=0;

 /* ---- tela de login (fica acima do menu e bloqueia o jogo até entrar) ---- */
 const tela=el('div');tela.id='conta';tela.className='open';tela.setAttribute('role','dialog');tela.setAttribute('aria-modal','true');tela.setAttribute('aria-label','Entrar no jogo');
 tela.addEventListener('keydown',e=>e.stopPropagation());
 document.body.append(tela);
 function caixa(sub){
  const box=el('div','mbox contaBox');const h=el('h1');h.innerHTML='GDM<br>Ilha Acima dos Deuses';
  box.append(h,el('div','sub',sub||'AVENTURA RPG ONLINE'));tela.replaceChildren(box);tela.classList.add('open');return box;
 }
 const botao=(texto,fn,cls)=>{const b=el('button','mb '+(cls||''),texto);b.type='button';b.onclick=fn;return b};
 const aviso=(box,texto,erro)=>{let a=box.querySelector('.contaMsg');if(!a){a=el('p','contaMsg');box.append(a)}a.textContent=texto;a.classList.toggle('erro',!!erro)};
 function esperando(texto){const box=caixa();aviso(box,texto)}
 const ERROS={
  'auth/invalid-email':'E-mail inválido.','auth/missing-password':'Digite a senha.',
  'auth/invalid-credential':'E-mail ou senha incorretos.','auth/wrong-password':'E-mail ou senha incorretos.','auth/user-not-found':'Não existe conta com esse e-mail. Use "Criar conta".',
  'auth/email-already-in-use':'Esse e-mail já tem conta. Use "Entrar".','auth/weak-password':'A senha precisa de pelo menos 6 caracteres.',
  'auth/popup-closed-by-user':'A janela de login foi fechada.','auth/cancelled-popup-request':'A janela de login foi fechada.',
  'auth/unauthorized-domain':'Este endereço não está autorizado no Firebase (Authentication > Settings > Authorized domains).',
  'auth/operation-not-allowed':'Essa forma de entrar não está ativada no Firebase (Authentication > Sign-in method).',
  'auth/network-request-failed':'Sem conexão com a internet.','auth/too-many-requests':'Muitas tentativas. Espere um pouco e tente de novo.',
  'auth/account-exists-with-different-credential':'Esse e-mail já entra por outro método. Use o mesmo de antes.',
  'auth/credential-already-in-use':'Essa conta já existe. Saia do convidado e entre por ela.'
 };
 const msgErro=e=>/^auth\/(api-key-not-valid|invalid-api-key)/.test(e&&e.code||'')?'A apiKey em js/firebase-config.js está errada.':ERROS[e&&e.code]||('Não foi possível entrar'+(e&&e.code?' ('+e.code+')':'')+'.');
 const NOMES={google:'Google',github:'GitHub',microsoft:'Microsoft'};
 function provedor(id){
  if(id==='google'){const p=new firebase.auth.GoogleAuthProvider();p.setCustomParameters({prompt:'select_account'});return p}
  if(id==='github')return new firebase.auth.GithubAuthProvider();
  if(id==='microsoft')return new firebase.auth.OAuthProvider('microsoft.com');
 }
 async function entrarCom(id,box){
  aviso(box,'Abrindo login '+NOMES[id]+'…');
  try{await auth.signInWithPopup(provedor(id))}
  catch(e){
   // celulares e navegadores que bloqueiam janelas entram pelo redirecionamento
   if(e.code==='auth/popup-blocked'||e.code==='auth/operation-not-supported-in-this-environment')return auth.signInWithRedirect(provedor(id));
   aviso(box,msgErro(e),true);
  }
 }
 function telaLogin(){
  const box=caixa();const lista=['google']; // só Google (pedido do usuário)
  for(const id of lista){
   if(NOMES[id])box.append(botao('Entrar com '+NOMES[id],()=>entrarCom(id,box),'contaProv contaProv-'+id));
   else if(id==='email'){
    const f=el('form','contaEmail');
    const email=el('input');email.type='email';email.placeholder='E-mail';email.autocomplete='email';email.required=true;
    const senha=el('input');senha.type='password';senha.placeholder='Senha (mínimo 6)';senha.autocomplete='current-password';senha.minLength=6;
    const linha=el('div','contaLinha');
    const entrar=botao('Entrar',null);entrar.type='submit';
    const criar=botao('Criar conta',async()=>{if(!f.reportValidity())return;aviso(box,'Criando conta…');try{await auth.createUserWithEmailAndPassword(email.value.trim(),senha.value)}catch(e){aviso(box,msgErro(e),true)}});
    linha.append(entrar,criar);
    const esqueci=el('button','contaLink','Esqueci a senha');esqueci.type='button';
    esqueci.onclick=async()=>{if(!email.value.trim()){aviso(box,'Digite seu e-mail acima.',true);return}try{await auth.sendPasswordResetEmail(email.value.trim());aviso(box,'Enviamos um link para redefinir a senha.')}catch(e){aviso(box,msgErro(e),true)}};
    f.onsubmit=async e=>{e.preventDefault();aviso(box,'Entrando…');try{await auth.signInWithEmailAndPassword(email.value.trim(),senha.value)}catch(err){aviso(box,msgErro(err),true)}};
    f.append(el('div','contaOu','ou com e-mail'),email,senha,linha,esqueci);box.append(f);
   }
   else box.append(botao('Jogar como convidado',async()=>{aviso(box,'Entrando como convidado…');try{await auth.signInAnonymously()}catch(e){aviso(box,msgErro(e),true)}},'dim'));
  }
  if(lista.includes('convidado'))box.append(el('p','contaNota','Convidado: o progresso fica só neste navegador até você vincular uma conta no menu.'));
 }
 function semNuvem(motivo){
  const box=caixa('SEM CONEXÃO');aviso(box,motivo,true);
  box.append(botao('Tentar de novo',()=>location.reload()),botao('Jogar offline',()=>tela.classList.remove('open'),'dim'));
 }

 /* ---- progresso: localStorage <-> saves/{uid} (só o salvamento automático; não há pontos antigos para voltar) ---- */
 function recarregar(){window._noSave=true;location.reload()}
 async function sincronizarProgresso(){
  const nuvem=(await db.ref('saves/'+user.uid).get()).val();
  const dono=ls.get(DONO),quando=Number(ls.get(QUANDO))||0;
  if(nuvem&&typeof nuvem.dados==='string'&&(dono!==user.uid||nuvem.t!==quando)){
   // a nuvem foi salva por outro aparelho depois do último envio deste (ou este navegador era de outra pessoa):
   // usa o da nuvem. Compara por igualdade para não depender do relógio de cada computador.
   ls.set(SAVE,nuvem.dados);ls.set(QUANDO,String(nuvem.t));ls.set(DONO,user.uid);
   recarregar();return false;
  }
  if(!nuvem&&dono&&dono!==user.uid){
   // conta nova num navegador que tinha o jogo de outra conta: começa do zero
   ls.del(SAVE);ls.del(QUANDO);ls.del('ilha-rpg-explorado');ls.set(DONO,user.uid);
   recarregar();return false;
  }
  ls.set(DONO,user.uid);enviado=nuvem?nuvem.dados:null;meuT=nuvem?nuvem.t:0;
  enviarProgresso(true);
  // se a mesma conta salvar de outro computador ou aba, esta para de salvar para não apagar aquele progresso
  db.ref('saves/'+user.uid+'/t').on('value',s=>{const t=s.val();if(t!=null&&t!==meuT)outroLugar()});
  return true;
 }
 function outroLugar(){
  if(window._noSave)return;
  window._noSave=true;nuvem.leave();
  const box=caixa('CONTA ABERTA EM OUTRO LUGAR');
  aviso(box,'Sua conta salvou progresso em outro computador ou aba. Este jogo parou de salvar para não apagar aquele progresso.');
  box.append(botao('Continuar aqui',()=>location.reload()));
 }
 function enviarProgresso(forcar){
  if(!user||window._noSave)return;
  const dados=ls.get(SAVE);if(!dados||dados.length>MAX_SAVE)return;
  const agora=Date.now();
  if(dados===enviado||(!forcar&&agora-ultimoEnvio<UPLOAD_MS))return;
  enviado=dados;ultimoEnvio=agora;meuT=agora;ls.set(QUANDO,String(agora));
  db.ref('saves/'+user.uid).set({t:agora,dados}).catch(e=>{enviado=null;console.warn('Progresso não enviado à nuvem:',e&&e.code||e)});
 }
 setInterval(()=>enviarProgresso(false),5000);
 addEventListener('pagehide',()=>{if(window.saveGame)saveGame();enviarProgresso(true)});

 /* ---- online em tempo real: online/{uid} e chat ---- */
 const nuvem={pronto:false,id:null,name:'',
  outros:new Map(),msgs:[],seq:0,conectado:false,offset:0,enviado:{},ultimoPos:0,ultimoT:0,ultimoLento:0,
  posSala:null,ultimoRapido:0,rapidoEnviado:'',somSeq:0,sons:'',aoSom:null,
  // posição suavizada de outro jogador da sala: desenha um pouco no passado, entre duas amostras recebidas
  posicao(id){
   const a=amostras.get(id);if(!a||!a.length)return null;
   const t=performance.now()-ATRASO_MS;
   if(t<=a[0].t)return a[0];
   for(let i=a.length-1;i>=0;i--)if(a[i].t<=t){const q=a[i],r=a[i+1];if(!r)return q;const k=(t-q.t)/Math.max(1,r.t-q.t);return {x:q.x+(r.x-q.x)*k,y:q.y+(r.y-q.y)*k}}
   return a[a.length-1];
  },
  async sync({me,since,chat}){
   if(!this.conectado)throw new Error('sem conexão');
   const agora=Date.now(),eu=db.ref('online/'+user.uid),sala=me.sala||'ilha:'+user.uid;
   // rápido: posição, vida, ping e sons de ataque vão para pos/{sala}/{uid}, só para quem está no mesmo lugar
   if(sala!==this.posSala)trocarPos(sala);
   if(me.sons&&me.sons.length){this.somSeq=(this.somSeq+1)%1000;this.sons=me.sons.slice(-6).map(t=>String(t).replace(/[|,]/g,'').slice(0,200)).join(',').slice(0,700)}
   const rapido=[me.x,me.y,me.fx,me.fy,Math.round(me.hp*100)/100,Math.round((me.mp||0)*100)/100,me.dead?1:0,Math.round(me.ping||0),this.somSeq,this.sons].join('|');
   if(rapido!==this.rapidoEnviado&&agora-this.ultimoRapido>=90){this.ultimoRapido=agora;this.rapidoEnviado=rapido;db.ref('pos/'+sala+'/'+user.uid).set(rapido).catch(()=>{});this.sons=''} // os eventos vão uma vez só (quem recebe compara o número da sequência)
   // lento: nome, classe, equipamento e sala (lista de jogadores e amigos); posição só de vez em quando
   const dados={name:this.name,cls:me.cls,sex:me.sex,lvl:me.lvl,hp:Math.round(me.hp*10)/10,dead:me.dead,dg:me.dg,eq:me.eq,sala};
   if(agora-this.ultimoPos>=1500||this.enviado.sala!==sala){dados.x=me.x;dados.y=me.y}
   const mudou={};for(const k in dados)if(JSON.stringify(dados[k])!==JSON.stringify(this.enviado[k]))mudou[k]=dados[k];
   if(Object.keys(mudou).length&&(agora-this.ultimoLento>=1000||'sala' in mudou)){this.ultimoLento=agora;if('x' in mudou)this.ultimoPos=agora;Object.assign(this.enviado,mudou);eu.update(mudou)}
   // aparência numa gravação separada: com as regras antigas do Firebase ela é recusada sem derrubar o resto
   if(me.ap&&me.ap!==this.enviado.ap){this.enviado.ap=me.ap;eu.update({ap:me.ap}).catch(()=>{})}
   if(agora-this.ultimoT>20000){this.ultimoT=agora;eu.update({t:firebase.database.ServerValue.TIMESTAMP})}
   for(const m of chat){
    // canal global ('g') para todos; local ('l') só para quem está na mesma sala
    const text=typeof m==='string'?m:m.text,local=m&&m.canal==='l'&&this.salaChat,pasta=local?'chatSala/'+this.salaChat:'chat';
    const key=db.ref(pasta).push().key;
    db.ref().update({[pasta+'/'+key]:{uid:user.uid,name:this.name,text,t:firebase.database.ServerValue.TIMESTAMP},['ultimaMsg/'+user.uid]:firebase.database.ServerValue.TIMESTAMP})
     .catch(()=>this.msgs.push({n:++this.seq,system:true,text:'Mensagem não enviada: espere um instante entre mensagens.'}));
   }
   const limite=agora+this.offset-60000,jogadores=[];
   for(const [id,o] of this.outros)if(id!==user.uid&&o.x!=null&&(!o.t||o.t>limite))jogadores.push(Object.assign({id},o,{eq:o.eq||{}}));
   return {ok:true,jogadores,chat:this.msgs.filter(m=>m.n>(since||0))};
  },
  // troca de nome pelo chat (/nome): o nome precisa estar livre; devolve true ou false
  async rename(nome){if(!await reservarNome(nome))return false;this.name=nome;return true},
  leave(){if(user){db.ref('online/'+user.uid).remove().catch(()=>{});if(this.posSala)db.ref('pos/'+this.posSala+'/'+user.uid).remove().catch(()=>{})}}
 };
 /* ---- posições rápidas da sala atual: pos/{sala}/{uid} = "x|y|fx|fy|vida|mana|morto|ping|seqEventos|eventos"
    eventos: sons e animações de combate do jogador (golpes, habilidades), tocados pelos outros da sala ---- */
 const ATRASO_MS=110,amostras=new Map(),rapidos=new Map();let posOff=null;
 function aplicarRapido(id,s){
  if(id===user.uid||typeof s!=='string')return;
  const [x,y,fx,fy,hp,mp,dead,ping,seq,sons]=s.split('|'),r={x:+x,y:+y,fx:+fx||0,fy:+fy||0,hp:+hp,mp:+mp||0,dead:dead==='1',ping:+ping||0};
  if(!Number.isFinite(r.x)||!Number.isFinite(r.y))return;
  const ant=rapidos.get(id);rapidos.set(id,Object.assign(r,{seq}));
  const a=amostras.get(id)||[];a.push({t:performance.now(),x:r.x,y:r.y});
  // teleporte (troca de mapa, entrada em DG): começa do ponto novo
  if(a.length>1&&Math.hypot(a[a.length-2].x-r.x,a[a.length-2].y-r.y)>160)a.splice(0,a.length-1);
  while(a.length>12)a.shift();amostras.set(id,a);
  const o=nuvem.outros.get(id);if(o)Object.assign(o,{x:r.x,y:r.y,fx:r.fx,fy:r.fy,hp:r.hp,mp:r.mp,dead:r.dead,ping:r.ping,sala:nuvem.posSala});
  if(ant&&seq!==ant.seq&&sons&&nuvem.aoSom)nuvem.aoSom(id,sons.split(','),r);
 }
 function trocarPos(sala){
  if(posOff){posOff();posOff=null}
  if(nuvem.posSala)db.ref('pos/'+nuvem.posSala+'/'+user.uid).remove().catch(()=>{});
  amostras.clear();rapidos.clear();nuvem.posSala=sala;nuvem.rapidoEnviado='';
  if(!sala)return;
  db.ref('pos/'+sala+'/'+user.uid).onDisconnect().remove();
  const r=db.ref('pos/'+sala),add=s=>aplicarRapido(s.key,s.val()),rem=s=>{amostras.delete(s.key);rapidos.delete(s.key)};
  r.on('child_added',add);r.on('child_changed',add);r.on('child_removed',rem);
  posOff=()=>{r.off('child_added',add);r.off('child_changed',add);r.off('child_removed',rem)};
 }
 function ligarOnline(){
  const lista=db.ref('online');
  // o registro lento não apaga a posição rápida de quem está na mesma sala
  const guardar=s=>{
   const v=s.val()||{},o=nuvem.outros.get(s.key)||{};
   for(const k of Object.keys(o))if(!(k in v))delete o[k];
   Object.assign(o,v);
   const r=rapidos.get(s.key);if(r&&v.sala===nuvem.posSala)Object.assign(o,{x:r.x,y:r.y,fx:r.fx,fy:r.fy,hp:r.hp,mp:r.mp,dead:r.dead,ping:r.ping});
   nuvem.outros.set(s.key,o);
  };
  lista.on('child_added',guardar);lista.on('child_changed',guardar);lista.on('child_removed',s=>nuvem.outros.delete(s.key));
  db.ref('.info/serverTimeOffset').on('value',s=>nuvem.offset=s.val()||0);
  db.ref('.info/connected').on('value',s=>{
   nuvem.conectado=!!s.val();
   if(nuvem.conectado){const eu=db.ref('online/'+user.uid);eu.onDisconnect().remove();nuvem.enviado={};nuvem.ultimoT=0;nuvem.rapidoEnviado='';if(nuvem.posSala)db.ref('pos/'+nuvem.posSala+'/'+user.uid).onDisconnect().remove()}
  });
  const receber=canal=>s=>{
   const v=s.val()||{};if(typeof v.text!=='string')return;
   nuvem.msgs.push({n:++nuvem.seq,canal,id:v.uid,name:String(v.name||'?').slice(0,18),text:v.text.slice(0,140),t:Math.round((v.t||Date.now())/1000)});
   if(nuvem.msgs.length>80)nuvem.msgs.shift();
  };
  db.ref('chat').orderByChild('t').startAt(Date.now()-6*3600000).limitToLast(30).on('child_added',receber('g'));
  // chat local: troca de canal junto com a sala (js/multiplayer.js)
  let localOff=null;
  const ligarLocal=sala=>{
   if(localOff){localOff();localOff=null}
   nuvem.salaChat=sala||null;if(!sala)return;
   const q=db.ref('chatSala/'+sala).orderByChild('t').startAt(Date.now()+nuvem.offset-10*60000).limitToLast(15),fn=receber('l');
   q.on('child_added',fn);localOff=()=>q.off('child_added',fn);
   db.ref('chatSala/'+sala).orderByChild('t').endAt(Date.now()-86400000).limitToFirst(25).get().then(s=>s.forEach(m=>{m.ref.remove().catch(()=>{})})).catch(()=>{});
  };
  window.addEventListener('mp-sala',e=>ligarLocal(e.detail&&e.detail.sala));
  if(window.MP&&MP.sala)ligarLocal(MP.sala);
  // limpeza: mensagens com mais de um dia podem ser apagadas por qualquer jogador
  db.ref('chat').orderByChild('t').endAt(Date.now()-86400000).limitToFirst(25).get()
   .then(s=>s.forEach(m=>{m.ref.remove().catch(()=>{})})).catch(()=>{});
  nuvem.pronto=true;
  // conexão compartilhada com o multijogador, a taverna e o chat de voz
  window.NUVEM={db,uid:user.uid,nome:()=>nuvem.name,get offset(){return nuvem.offset},get conectado(){return nuvem.conectado}};
  window.dispatchEvent(new Event('nuvem-pronta'));
 }
 window.ONLINE_NUVEM=nuvem;

 /* ---- nomes únicos: nomes/{chave} = uid ----
    A chave ignora maiúsculas, acentos e símbolos ("Ána_1" e "ana1" são o mesmo nome). */
 const limparNome=n=>String(n||'').replace(/[^\p{L}\p{N} _-]/gu,'').replace(/\s+/g,' ').trim().slice(0,18);
 const chaveNome=n=>limparNome(n).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const nomeValido=n=>{const l=limparNome(n);return l.length>=3&&chaveNome(l).length>=3};
 // libera um nome só se ele for deste jogador
 async function liberarNome(chave){try{if((await db.ref('nomes/'+chave).get()).val()===user.uid)await db.ref('nomes/'+chave).remove()}catch(e){}}
 async function nomeLivre(n){const v=(await db.ref('nomes/'+chaveNome(n)).get()).val();return !v||v===user.uid}
 async function reservarNome(n){
  n=limparNome(n);if(!nomeValido(n))return false;
  const nova=chaveNome(n),antiga=perfil.nome?chaveNome(perfil.nome):null;
  try{if(!await nomeLivre(n))return false}catch(e){return false}
  try{await db.ref('nomes/'+nova).set(user.uid)}catch(e){return false} // as regras também recusam nome de outra pessoa
  if(antiga&&antiga!==nova)liberarNome(antiga);
  perfil.nome=n;await db.ref('perfis/'+user.uid).set({nome:n,criado:true});perfil.criado=true;
  return true;
 }

 /* ---- criação de personagem: nome, classe e sexo, com prévia do sprite ---- */
 function spritePersonagem(cls,sex,look,dir='d'){
  const c=CL[cls];if(c&&c.sprite)return c.sprite;
  const E={nude:1,sex,swing:0,shWeapon:false,look};
  for(const s of Object.keys(EQ))if(EQ[s]&&ITEMS[EQ[s].id])E[s]=ITEMS[EQ[s].id];
  return human((c&&c.base)||cls,dir,0,E);
 }
 // desenha o sprite ampliado só em múltiplos inteiros: os pixels continuam quadrados e a proporção não muda
 function desenharPrevia(cv,img){
  // recorta a borda transparente do sprite para ampliar só o personagem
  const t=document.createElement('canvas');t.width=img.width;t.height=img.height;const tg=t.getContext('2d');tg.drawImage(img,0,0);
  const d=tg.getImageData(0,0,t.width,t.height).data;let x0=t.width,y0=t.height,x1=-1,y1=-1;
  for(let y=0;y<t.height;y++)for(let x=0;x<t.width;x++)if(d[(y*t.width+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  if(x1<0){x0=0;y0=0;x1=t.width-1;y1=t.height-1}
  const w=x1-x0+1,h=y1-y0+1,g=cv.getContext('2d'),k=Math.max(1,Math.floor(Math.min((cv.width-12)/w,(cv.height-16)/h)));
  g.clearRect(0,0,cv.width,cv.height);g.imageSmoothingEnabled=false;
  const x=Math.round((cv.width-w*k)/2),y=Math.round((cv.height-h*k)/2)-3;
  g.fillStyle='#0007';g.fillRect(x+Math.round(w*k*.15),y+h*k-k,Math.round(w*k*.7),k*2);
  g.drawImage(t,x0,y0,w,h,x,y,w*k,h*k);
 }
 function criarPersonagem(){
  return new Promise(pronto=>{
   const box=caixa('CRIE SEU PERSONAGEM');
   let cls=CL[p.cls]?p.cls:'war',sex=p.sex==='f'?'f':'m',verificado=null,timer=null;
   const sugestao=limparNome((user.displayName||'').split(' ')[0]);
   const f=el('form','criarForm');
   // nome
   const ln=el('label','criarCampo');ln.append(el('span','','Nome do personagem'));
   const nome=el('input');nome.maxLength=18;nome.autocomplete='off';nome.placeholder='3 a 18 letras ou números';nome.value=perfil.nome||(sugestao.length>=3?sugestao:'');
   const status=el('small','criarStatus');ln.append(nome,status);f.append(ln);
   // prévia
   const prev=el('canvas','criarPrevia');prev.width=132;prev.height=132;
   const nomeCls=el('b','criarClasse');
   const lp=el('div','criarPreviaBox');lp.append(prev,nomeCls);f.append(lp);
   // classe
   const lc=el('div','criarCampo');lc.append(el('span','','Classe'));const gc=el('div','criarOpcoes');lc.append(gc);f.append(lc);
   const ids=Object.keys(CL).filter(id=>id!=='sty'&&CL[id]&&CL[id].n);
   const bc={};for(const id of ids){const b=botao(CL[id].n,()=>{cls=id;atualizar()},'criarOpcao');bc[id]=b;gc.append(b)}
   // sexo
   const ls2=el('div','criarCampo');ls2.append(el('span','','Sexo'));const gs=el('div','criarOpcoes');ls2.append(gs);f.append(ls2);
   // trocar o sexo leva junto a aparência padrão dele, se o jogador ainda não mexeu nela
   const trocarSexo=s=>{if(AP&&APARENCIA.codificar(look)===APARENCIA.codificar(APARENCIA.padrao(sex)))look=APARENCIA.padrao(s);sex=s;atualizar()};
   const bs={m:botao('Masculino',()=>trocarSexo('m'),'criarOpcao'),f:botao('Feminino',()=>trocarSexo('f'),'criarOpcao')};gs.append(bs.m,bs.f);
   // aparência (js/aparencia.js): estilo de cabelo e cores de pele, cabelo e olhos (sugestões ou qualquer cor)
   const AP=window.APARENCIA;let look=AP?AP.normalizar(p.look,sex):null,dirPrevia='d';const be={},linhasCor={};
   if(AP){
    const le=el('div','criarCampo');le.append(el('span','','Cabelo'));const ge=el('div','criarOpcoes');le.append(ge);f.append(le);
    for(const e of AP.estilos()){const b=botao(e.nome,()=>{look.estilo=e.id;atualizar()},'criarOpcao');be[e.id]=b;ge.append(b)}
    const sug=AP.cores();
    // o personagem Mana Seed (js/heroi-mana.js) tem os olhos desenhados com o contorno: sem cor de olhos
    for(const [k,rot] of [['pele','Cor da pele'],['cabelo','Cor do cabelo'],['olhos','Cor dos olhos']].filter(([k])=>!(k==='olhos'&&window.HEROI_MANA))){
     const lc2=el('div','criarCampo');lc2.append(el('span','',rot));const linha=el('div','criarCores');
     const amostras=sug[k].map(cor=>{const b=botao('',()=>{look[k]=cor;atualizar()},'criarCor');b.style.background=cor;b.title=cor;b.setAttribute('aria-label',rot+' '+cor);b.dataset.cor=cor;linha.append(b);return b});
     const livre=el('input','criarCorLivre');livre.type='color';livre.title='Qualquer cor';livre.setAttribute('aria-label',rot+': qualquer cor');livre.oninput=()=>{look[k]=livre.value;atualizar()};
     linha.append(livre);lc2.append(linha);f.append(lc2);linhasCor[k]={amostras,livre};
    }
    prev.title='Clique para girar o personagem';prev.style.cursor='pointer';
    prev.onclick=()=>{dirPrevia={d:'s',s:'u',u:'d'}[dirPrevia];atualizar()};
   }
   addEventListener('heroi-pronto',()=>atualizar(),{once:true}); // as imagens do personagem chegaram: redesenha a prévia
   const ok=botao('Começar a aventura',null);ok.type='submit';f.append(ok);
   box.append(f);
   const msg=el('p','contaMsg');box.append(msg);
   function atualizar(){
    for(const id in bc){bc[id].classList.toggle('on',id===cls);bc[id].setAttribute('aria-pressed',String(id===cls))}
    for(const id in bs){bs[id].classList.toggle('on',id===sex);bs[id].setAttribute('aria-pressed',String(id===sex))}
    nomeCls.textContent=CL[cls].n+' · '+(sex==='f'?'Feminino':'Masculino');
    if(AP){look=AP.normalizar(look,sex);
     for(const id in be){be[id].classList.toggle('on',id===look.estilo);be[id].setAttribute('aria-pressed',String(id===look.estilo))}
     for(const k in linhasCor){const {amostras,livre}=linhasCor[k];let marcada=false;for(const b of amostras){const on=b.dataset.cor===look[k];marcada=marcada||on;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on))}
      livre.value=look[k];livre.classList.toggle('on',!marcada)}}
    try{desenharPrevia(prev,spritePersonagem(cls,sex,look,dirPrevia))}catch(e){}
   }
   // nome: confere se está livre enquanto digita
   async function conferir(){
    const n=nome.value;verificado=null;
    if(!nomeValido(n)){status.textContent='Use de 3 a 18 letras ou números.';status.className='criarStatus erro';return}
    status.textContent='Verificando…';status.className='criarStatus';
    try{const livre=await nomeLivre(n);if(nome.value!==n)return;verificado=livre?n:null;status.textContent=livre?'Nome disponível':'Esse nome já está em uso';status.className='criarStatus '+(livre?'ok':'erro')}
    catch(e){status.textContent='Não foi possível verificar agora.';status.className='criarStatus erro'}
   }
   nome.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(conferir,350)});
   f.onsubmit=async e=>{
    e.preventDefault();ok.disabled=true;msg.classList.remove('erro');msg.textContent='Criando personagem…';
    if(!await reservarNome(nome.value)){ok.disabled=false;msg.classList.add('erro');msg.textContent=nomeValido(nome.value)?'Esse nome já está em uso. Escolha outro.':'Use de 3 a 18 letras ou números.';conferir();return}
    // aplica classe e sexo ao herói e salva
    p.sex=sex;if(look)p.look={...look};p.classProgress=p.classProgress||{};if(!p.classProgress[cls])p.classProgress[cls]={rank:1,xp:0};
    // personagem novo: troca o kit dado na abertura do jogo pelo kit da classe escolhida
    if(window.personagemNovo&&window.darKit&&CL[cls].kit&&CL[cls].kit.length){I.fill(null);for(const k in EQ)EQ[k]=null;p.kits={}}
    p.cls=cls;if(window.darKit)darKit(cls,{salvar:false});p.hp=mhp();p.mp=mmp();if(window.applySkills)applySkills();if(window.setPortrait)setPortrait();if(window.renderSkillMenu)renderSkillMenu();
    if(window.saveGame)saveGame();enviarProgresso(true);
    pronto();
   };
   atualizar();if(nome.value)conferir();
   setTimeout(()=>nome.focus(),50);
  });
 }

 /* ---- conta no menu: nome, vincular convidado e sair ---- */
 const descrever=()=>{
  if(!user)return '';
  if(user.isAnonymous)return 'Convidado';
  const p=user.providerData[0]||{},via={'google.com':'Google','github.com':'GitHub','microsoft.com':'Microsoft',password:'e-mail'}[p.providerId]||'conta';
  return (user.email||p.email||user.displayName||'')+' · '+via;
 };
 function linhaConta(box){
  if(!user||box.querySelector('.contaMenu'))return;
  const r=el('div','contaMenu');r.append(el('span','','Conta: '+nuvem.name+(descrever()?' ('+descrever()+')':'')));
  if(user.isAnonymous){
   for(const id of (window.LOGIN_PROVEDORES||[]).filter(id=>NOMES[id]))r.append(botao('Vincular '+NOMES[id],async()=>{
    try{await user.linkWithPopup(provedor(id));user=auth.currentUser;r.remove();linhaConta(box)}catch(e){alert(msgErro(e))}
   }));
  }
  r.append(botao('Sair da conta',async()=>{
   if(window.saveGame)saveGame();enviarProgresso(true);nuvem.leave();
   window._noSave=true;await auth.signOut();location.reload();
  }));
  const del=box.querySelector('.mDel');if(del)box.insertBefore(r,del);else box.append(r);
 }
 /* ---- seleção de personagem: um espaço; clicar no personagem entra no jogo. O fundo é a ilha dele, com a câmera
    passeando devagar (render.js cameraMenu). Apagar personagem: progresso, nome, perfil e amigos; a conta (Google) fica ---- */
 function telaSelecao(){
  return new Promise(resolve=>{
   tela.replaceChildren();tela.classList.add('open','selecao');document.body.classList.add('selecaoPersonagem');
   if(window.cameraMenu)cameraMenu.ligar();
   const painel=el('div','selPainel');
   const fechar=()=>{tela.classList.remove('selecao');document.body.classList.remove('selecaoPersonagem');if(window.cameraMenu)cameraMenu.desligar()};
   const slot=el('button','selSlot');slot.type='button';slot.setAttribute('aria-label','Jogar com '+(perfil.nome||'o personagem'));
   const cv=el('canvas','selSprite');cv.width=120;cv.height=120;
   try{desenharPrevia(cv,spritePersonagem(p.cls,p.sex,window.APARENCIA?APARENCIA.normalizar(p.look,p.sex):p.look))}catch(e){}
   const rank=(p.classProgress&&p.classProgress[p.cls]||{rank:1}).rank;
   const info=el('div','selInfo');info.append(el('strong','',perfil.nome||'Aventureiro'),el('span','',(CL[p.cls]?CL[p.cls].n:'Sem classe')+' · Nível '+p.lvl+' · Rank '+rank),el('em','','Clique para jogar'));
   slot.append(cv,info);slot.onclick=()=>{fechar();if(window.iniciarJogo)iniciarJogo();resolve()};
   const linha=el('div','selBotoes');
   linha.append(botao('Apagar personagem',()=>confirmarApagarPersonagem(painel),'danger'),botao('Sair',async()=>{window._noSave=true;nuvem.leave();await auth.signOut();location.reload()},'dim'));
   painel.append(el('h1','selTitulo','GDM Ilha Acima dos Deuses'),el('div','selSub','PERSONAGEM'),slot,linha,el('div','selConta',descrever()));
   tela.append(painel);setTimeout(()=>slot.focus(),50);
  });
 }
 function confirmarApagarPersonagem(box){
  const c=el('div','contaApagar');
  c.append(el('p','','Apagar o personagem remove para sempre o progresso, os itens, o nome e os amigos dele. Não tem como desfazer. Depois você cria um personagem novo.'),
   el('p','','Para confirmar, digite APAGAR:'));
  const i=el('input');i.autocomplete='off';i.setAttribute('aria-label','Digite APAGAR para confirmar');
  i.addEventListener('keydown',e=>e.stopPropagation());
  const msg=el('p','contaMsg');
  const ok=botao('Apagar personagem',async()=>{
   if(i.value.trim().toUpperCase()!=='APAGAR'){msg.textContent='Digite APAGAR para confirmar.';msg.classList.add('erro');return}
   ok.disabled=true;msg.classList.remove('erro');msg.textContent='Apagando…';
   try{await apagarPersonagem()}catch(e){ok.disabled=false;msg.classList.add('erro');msg.textContent=msgErro(e)}
  },'danger');
  c.append(i,ok,botao('Cancelar',()=>c.remove(),'dim'),msg);
  const antigo=box.querySelector('.contaApagar');if(antigo)antigo.remove();
  box.append(c);i.focus();
 }
 async function apagarPersonagem(){
  const uid=user.uid;
  window._noSave=true;nuvem.leave();
  if(perfil.nome)await liberarNome(chaveNome(perfil.nome)); // o nome fica livre para outra pessoa
  try{const a=(await db.ref('amigos/'+uid).get()).val()||{};for(const id of Object.keys(a))await db.ref('amigos/'+id+'/'+uid).remove().catch(()=>{})}catch(e){}
  if(nuvem.posSala)await db.ref('pos/'+nuvem.posSala+'/'+uid).remove().catch(()=>{});
  for(const k of ['saves','perfis','online','amigos','grupos','convites','sussurros','ultimaMsg','ping'])await db.ref(k+'/'+uid).remove().catch(()=>{});
  for(const k of [SAVE,QUANDO,'ilha-rpg-explorado','ilha-rpg-grupo','ilha-rpg-online','ilha-rpg-dg-recordes'])ls.del(k);
  location.reload(); // volta para a criação de personagem
 } const menu=document.getElementById('menu');
 if(menu)new MutationObserver(()=>{const box=menu.querySelector('.mbox');if(box&&[...box.querySelectorAll('button')].some(b=>/Opções/.test(b.textContent)))linhaConta(box)}).observe(menu,{childList:true});

 /* ---- carregar o Firebase e acompanhar o login ---- */
 const carregar=src=>new Promise((ok,falha)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>falha(new Error(src));document.head.append(s)});
 esperando('Conectando…');
 (async()=>{
  try{if(!window.firebase)for(const src of SDK)await carregar(src)}
  catch(e){semNuvem('Não foi possível carregar o serviço de contas. Verifique a internet.');return}
  try{firebase.initializeApp(C);auth=firebase.auth();db=firebase.database()}
  catch(e){console.error(e);semNuvem('A configuração do Firebase (js/firebase-config.js) está incompleta.');return}
  auth.getRedirectResult().catch(e=>{if(!user){telaLogin();aviso(tela.querySelector('.mbox'),msgErro(e),true)}});
  let primeiro=true;
  auth.onAuthStateChanged(async u=>{
   if(!u){user=null;if(primeiro||!tela.classList.contains('open'))telaLogin();primeiro=false;return}
   primeiro=false;if(user&&user.uid===u.uid)return;
   user=u;esperando('Carregando seu progresso…');
   try{
    const p=(await db.ref('perfis/'+u.uid).get()).val();
    perfil.nome=p&&p.nome||'';perfil.criado=!!(p&&p.criado);
    nuvem.id=u.uid;nuvem.name=perfil.nome||'Aventureiro';
    if(!await sincronizarProgresso())return;
    // conta nova (ou sem personagem): escolhe nome, classe e sexo antes de jogar
    if(!perfil.criado)await criarPersonagem();
    nuvem.name=perfil.nome;
    await telaSelecao(); // um espaço de personagem: clicar entra no jogo
   }catch(e){
    console.error('Falha ao ler a conta:',e);
    semNuvem(e&&e.code==='PERMISSION_DENIED'?'O banco recusou o acesso. Publique as regras de ferramentas/regras-firebase.json no Firebase.':'Não foi possível ler sua conta. Verifique a internet.');return;
   }
   ligarOnline();tela.classList.remove('open');
   const box=menu&&menu.querySelector('.mbox');if(box)linhaConta(box);
  });
 })();
})();
