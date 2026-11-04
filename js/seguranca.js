/* ---------- Segurança contra trapaças (2026-11-04, pedido do usuário) ----------
   O jogo roda no navegador de cada jogador (não há servidor do jogo), então nada aqui é impossível de burlar para quem
   sabe programar; o objetivo é barrar as trapaças comuns e deixar rastro das outras:
   1. Save assinado: o progresso salvo leva uma assinatura (_s). Save editado fora do jogo (no armazenamento do
      navegador ou mandado direto para a nuvem) não confere: o jogo carrega a última cópia boa ('ilha-rpg-save-ok') e
      anota a suspeita. Save antigo, sem assinatura, vale uma vez e passa a ser assinado.
   2. Console do navegador: ouro, XP e nível só mudam por código do jogo. Quem digitar p.gold=99999 (ou chamar
      addItem, gainPlayerXp, gainClassXp) no console é ignorado e fica registrado.
   3. Fórmulas do jogo (CALC: XP, chances de drop, dano) ficam trancadas depois de carregar.
   4. Vigia: valores impossíveis (qualidade acima de 100, pilhas gigantes, nível acima do máximo, ouro absurdo) são
      corrigidos e anotados.
   5. Suspeitas vão para o Firebase em suspeitas/{uid} (só o próprio jogador grava; só você lê pelo console do Firebase).
   Só fica ativo no jogo publicado: em localhost, file://, na Engine e nos testes ele só avisa no console. */
(function(){
 const LOCAL=/^(localhost|127\.|192\.168\.|10\.|\[::1\])/.test(location.hostname)||location.protocol==='file:';
 // ?seguranca=1 liga a proteção também em localhost (para testar); a URL nunca desliga
 const ATIVO=(!LOCAL||/[?&]seguranca=1\b/.test(location.search))&&window.parent===window&&!(window.MODO&&(MODO.teste||MODO.motor));
 const PIMENTA='gdm·ilha·acima·dos·deuses·v1';
 const LIM={ouro:5e7,pilha:9999};

 /* ---- assinatura do save (dois hashes de 53 bits) ---- */
 function cyrb53(str,seed=0){let h1=0xdeadbeef^seed,h2=0x41c6ce57^seed;for(let i=0;i<str.length;i++){const ch=str.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677)}
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
  return(4294967296*(2097151&h2)+(h1>>>0)).toString(36)}
 const assinatura=json=>cyrb53(json+PIMENTA,7)+'.'+cyrb53(PIMENTA+json,131);
 // texto do save já assinado (a assinatura vai no fim do objeto)
 function assinar(json){if(!json||json[json.length-1]!=='}')return json;return json.slice(0,-1)+(json.length>2?',':'')+'"_s":"'+assinatura(json)+'"}'}
 // confere um save já lido (objeto): true = assinado e certo; null = sem assinatura; false = mexido
 function conferir(d){if(!d||typeof d!=='object')return false;if(typeof d._s!=='string')return null;const s=d._s;delete d._s;const ok=assinatura(JSON.stringify(d))===s;return ok}

 /* ---- de onde veio a chamada: código do jogo ou o console do navegador ---- */
 function doConsole(){const linhas=String(new Error().stack||'').split('\n').map(l=>l.trim()).filter(Boolean);const ult=linhas[linhas.length-1]||'';
  return/<anonymous>|debugger eval|VM\d+|snippet|^at eval/i.test(ult)&&!/\.js[?:]/.test(ult)}

 /* ---- suspeitas ---- */
 const anotadas=[];let ultimoEnvio=0,avisouConsole=false;
 function suspeita(m){anotadas.push({t:Date.now(),m});if(anotadas.length>50)anotadas.shift();
  if(!avisouConsole){avisouConsole=true;console.warn('[Segurança] Ação bloqueada: '+m+'. Trapaças ficam registradas na sua conta.')}
  if(!ATIVO)return;const agora=Date.now();if(agora-ultimoEnvio<60000)return;ultimoEnvio=agora;
  try{if(window.NUVEM&&NUVEM.db&&NUVEM.uid&&window.firebase)NUVEM.db.ref('suspeitas/'+NUVEM.uid).push({t:firebase.database.ServerValue.TIMESTAMP,m:String(m).slice(0,80)}).catch(()=>{})}catch(e){}}

 /* ---- ouro, XP e nível só pelo código do jogo ---- */
 function guardar(obj,campo,nome){let v=obj[campo];
  Object.defineProperty(obj,campo,{configurable:true,enumerable:true,get:()=>v,
   set:n=>{if(ATIVO&&n!==v&&doConsole()){suspeita(nome+' mudado pelo console');return}v=n}})}
 function protegerFuncao(nome){const f=window[nome];if(typeof f!=='function'||f.__protegida)return;
  const g=function(...a){if(ATIVO&&doConsole()){suspeita(nome+' chamado pelo console');return false}return f.apply(this,a)};g.__protegida=true;window[nome]=g}

 /* ---- vigia: corrige o impossível ---- */
 function vigiar(){if(typeof p==='undefined')return;
  if(!(p.gold>=0))p.gold=0;if(p.gold>LIM.ouro){suspeita('ouro acima do limite');p.gold=LIM.ouro}
  const max=+(typeof CALC!=='undefined'&&CALC.maxLevel)||10;if(p.lvl>max){suspeita('nível acima do máximo');p.lvl=max}
  const conferirItem=s=>{if(!s||typeof s!=='object')return;if(s.q!=null&&(s.q>100||s.q<0)){suspeita('qualidade impossível');s.q=Math.max(0,Math.min(100,s.q|0))}
   if(s.n>LIM.pilha){suspeita('pilha gigante');s.n=LIM.pilha}if(typeof gearType!=='undefined'&&gearType[s.id]&&s.n>1){suspeita('equipamento empilhado');s.n=1}};
  if(typeof I!=='undefined')I.forEach(conferirItem);if(typeof EQ!=='undefined')Object.values(EQ).forEach(conferirItem);if(typeof RAPIDO!=='undefined')RAPIDO.forEach(conferirItem);
  if(p.classProgress)for(const k in p.classProgress){const c=p.classProgress[k];if(c&&c.rank>10){suspeita('rank de classe impossível');c.rank=10}}}

 /* ---- ligar tudo depois que o jogo carregou ---- */
 function ligar(){
  if(typeof p!=='undefined'){guardar(p,'gold','ouro');guardar(p,'xp','XP');guardar(p,'lvl','nível')}
  for(const n of ['addItem','gainPlayerXp','gainClassXp','setClass'])protegerFuncao(n);
  if(ATIVO&&typeof CALC!=='undefined')try{Object.freeze(CALC)}catch(e){}
  setInterval(vigiar,3000);
  if(ATIVO){console.log('%cPARE!','color:#cf4554;font:bold 42px monospace;text-shadow:2px 2px #000');
   console.log('%cEste é o console do navegador, feito para programadores. Se alguém pediu para você colar algo aqui para "ganhar ouro" ou itens, é golpe: pode roubar a sua conta. Trapaças são bloqueadas e ficam registradas.','font:14px monospace')}}
 if(document.readyState==='complete')setTimeout(ligar,0);else addEventListener('load',()=>setTimeout(ligar,0));

 window.SEGURANCA={assinar,conferir,suspeita,get ativo(){return ATIVO},get suspeitas(){return anotadas.slice()}};
})();
