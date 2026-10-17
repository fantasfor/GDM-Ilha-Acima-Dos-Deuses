/* ---------- Conta, progresso na nuvem e online pelo Firebase ----------
   Ativo só quando js/firebase-config.js está preenchido (versão do GitHub Pages).
   - Tela de login: Google, GitHub, Microsoft, e-mail e senha ou convidado.
   - O progresso (autosave e slots) fica na conta, em saves/{uid}; vale o mais recente.
   - online.js usa window.ONLINE_NUVEM para posição dos jogadores e chat em tempo real.
   As regras de segurança do banco estão em ferramentas/regras-firebase.json. */
(function(){
 const C=window.FIREBASE_CONFIG;
 if(MODO.teste||MODO.motor||!C||!C.apiKey||!C.databaseURL)return;
 window.CONTA_ATIVA=true;
 const V='10.12.2',SDK=['app','auth','database'].map(n=>'https://www.gstatic.com/firebasejs/'+V+'/firebase-'+n+'-compat.js');
 const SAVE='ilha-rpg-save',DONO='ilha-rpg-dono',QUANDO='ilha-rpg-save-t',SLOTS=[1,2,3].map(i=>'ilha-rpg-slot'+i);
 const UPLOAD_MS=20000,MAX_SAVE=300000;
 const ls={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}},del:k=>{try{localStorage.removeItem(k)}catch(e){}}};
 const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e};
 let auth,db,user=null,perfil={nome:''},enviado=null,ultimoEnvio=0,meuT=0;

 /* ---- tela de login (fica acima do menu e bloqueia o jogo até entrar) ---- */
 const tela=el('div');tela.id='conta';tela.className='open';tela.setAttribute('role','dialog');tela.setAttribute('aria-modal','true');tela.setAttribute('aria-label','Entrar no jogo');
 tela.addEventListener('keydown',e=>e.stopPropagation());
 document.body.append(tela);
 function caixa(sub){
  const box=el('div','mbox contaBox');const h=el('h1');h.innerHTML='Ilha do<br>Acampamento';
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
  const box=caixa();const lista=(window.LOGIN_PROVEDORES||['google','email','convidado']).filter(id=>NOMES[id]||id==='email'||id==='convidado');
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

 /* ---- progresso: localStorage <-> saves/{uid} ---- */
 const lerSlots=()=>{const s={};SLOTS.forEach((k,i)=>{const v=ls.get(k);if(v&&v.length<MAX_SAVE)s['s'+(i+1)]=v});return s};
 function recarregar(){window._noSave=true;location.reload()}
 async function sincronizarProgresso(){
  const nuvem=(await db.ref('saves/'+user.uid).get()).val();
  const dono=ls.get(DONO),quando=Number(ls.get(QUANDO))||0;
  if(nuvem&&typeof nuvem.dados==='string'&&(dono!==user.uid||nuvem.t!==quando)){
   // a nuvem foi salva por outro aparelho depois do último envio deste (ou este navegador era de outra pessoa):
   // usa o da nuvem. Compara por igualdade para não depender do relógio de cada computador.
   ls.set(SAVE,nuvem.dados);ls.set(QUANDO,String(nuvem.t));ls.set(DONO,user.uid);
   SLOTS.forEach((k,i)=>{const v=nuvem.slots&&nuvem.slots['s'+(i+1)];if(typeof v==='string')ls.set(k,v);else ls.del(k)});
   recarregar();return false;
  }
  if(!nuvem&&dono&&dono!==user.uid){
   // conta nova num navegador que tinha o jogo de outra conta: começa do zero
   ls.del(SAVE);ls.del(QUANDO);SLOTS.forEach(k=>ls.del(k));ls.set(DONO,user.uid);
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
  db.ref('saves/'+user.uid).set({t:agora,dados,slots:lerSlots()}).catch(e=>{enviado=null;console.warn('Progresso não enviado à nuvem:',e&&e.code||e)});
 }
 setInterval(()=>enviarProgresso(false),5000);
 addEventListener('pagehide',()=>{if(window.saveGame)saveGame();enviarProgresso(true)});

 /* ---- online em tempo real: online/{uid} e chat ---- */
 const nuvem={pronto:false,id:null,name:'',
  outros:new Map(),msgs:[],seq:0,conectado:false,offset:0,enviado:{},ultimoPos:0,ultimoT:0,
  async sync({me,since,chat}){
   if(!this.conectado)throw new Error('sem conexão');
   const agora=Date.now(),eu=db.ref('online/'+user.uid);
   const dados={name:this.name,cls:me.cls,sex:me.sex,lvl:me.lvl,x:me.x,y:me.y,fx:me.fx,fy:me.fy,hp:Math.round(me.hp*100)/100,dead:me.dead,dg:me.dg,eq:me.eq,sala:me.sala||'ilha:'+user.uid};
   // só os campos que mudaram, no máximo 5 vezes por segundo
   const mudou={};for(const k in dados)if(JSON.stringify(dados[k])!==JSON.stringify(this.enviado[k]))mudou[k]=dados[k];
   if(Object.keys(mudou).length&&agora-this.ultimoPos>=200){this.ultimoPos=agora;Object.assign(this.enviado,mudou);eu.update(mudou)}
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
  rename(nome){this.name=nome;perfil.nome=nome;db.ref('perfis/'+user.uid).set({nome}).catch(()=>{})},
  leave(){if(user)db.ref('online/'+user.uid).remove().catch(()=>{})}
 };
 function ligarOnline(){
  const lista=db.ref('online');
  const guardar=s=>nuvem.outros.set(s.key,s.val()||{});
  lista.on('child_added',guardar);lista.on('child_changed',guardar);lista.on('child_removed',s=>nuvem.outros.delete(s.key));
  db.ref('.info/serverTimeOffset').on('value',s=>nuvem.offset=s.val()||0);
  db.ref('.info/connected').on('value',s=>{
   nuvem.conectado=!!s.val();
   if(nuvem.conectado){const eu=db.ref('online/'+user.uid);eu.onDisconnect().remove();nuvem.enviado={};nuvem.ultimoT=0}
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
  },'danger'));
  box.append(r);
 }
 const menu=document.getElementById('menu');
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
    perfil.nome=p&&p.nome||'';
    if(!perfil.nome){
     const base=(u.displayName||'').split(' ')[0].replace(/[^\p{L}\p{N}_-]/gu,'').slice(0,18);
     perfil.nome=base.length>=3?base:'Aventureiro'+Math.floor(1000+Math.random()*9000);
     db.ref('perfis/'+u.uid).set({nome:perfil.nome}).catch(()=>{});
    }
    nuvem.id=u.uid;nuvem.name=perfil.nome;
    if(!await sincronizarProgresso())return;
   }catch(e){
    console.error('Falha ao ler a conta:',e);
    semNuvem(e&&e.code==='PERMISSION_DENIED'?'O banco recusou o acesso. Publique as regras de ferramentas/regras-firebase.json no Firebase.':'Não foi possível ler sua conta. Verifique a internet.');return;
   }
   ligarOnline();tela.classList.remove('open');
   const box=menu&&menu.querySelector('.mbox');if(box)linhaConta(box);
  });
 })();
})();
