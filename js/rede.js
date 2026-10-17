/* ---------- Desempenho e rede: ping e FPS ----------
   Mostra no canto da tela o ping até o servidor (Firebase) e os quadros por segundo.
   Liga e desliga em Menu › Opções ("Mostrar ping e FPS"); a escolha fica salva neste navegador.
   O ping é medido com uma gravação pequena em ping/{uid}: o tempo até o servidor confirmar. */
(function(){
 if(MODO.teste||MODO.motor)return;
 const KEY='ilha-rpg-rede',INTERVALO_MS=2500;
 const cfg=Object.assign({mostrar:true},(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}})());
 const salvar=()=>{try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}};
 const caixa=document.createElement('div');caixa.className='redeInfo';caixa.setAttribute('aria-live','off');
 caixa.title='Ping: tempo de ida e volta até o servidor. FPS: quadros por segundo.';
 document.body.append(caixa);
 const REDE=window.REDE={ping:0,fps:0,
  get mostrar(){return cfg.mostrar},
  set mostrar(v){cfg.mostrar=!!v;salvar();desenhar()}
 };
 // FPS: conta os quadros desenhados a cada segundo
 let quadros=0,inicio=performance.now();
 (function contar(t){quadros++;if(t-inicio>=1000){REDE.fps=Math.round(quadros*1000/(t-inicio));quadros=0;inicio=t;desenhar()}requestAnimationFrame(contar)})(inicio);
 // ping: mediana das últimas medidas (uma medida ruim isolada não assusta)
 const medidas=[];let medindo=false;
 async function medir(){
  const N=window.NUVEM;if(medindo||!N||!N.conectado)return;
  medindo=true;const t0=performance.now();
  try{await N.db.ref('ping/'+N.uid).set(firebase.database.ServerValue.TIMESTAMP);medidas.push(performance.now()-t0);if(medidas.length>5)medidas.shift();
   const o=[...medidas].sort((a,b)=>a-b);REDE.ping=Math.round(o[Math.floor(o.length/2)])}
  catch(e){}
  medindo=false;desenhar();
 }
 setInterval(medir,INTERVALO_MS);
 const cor=ms=>ms<=0?'':ms<90?'bom':ms<180?'medio':'ruim';
 REDE.cor=cor;
 function desenhar(){
  caixa.hidden=!cfg.mostrar;if(!cfg.mostrar)return;
  const online=!!window.NUVEM,sem=online&&!NUVEM.conectado;
  caixa.replaceChildren();
  if(online){const b=document.createElement('b');b.className=sem?'ruim':cor(REDE.ping);b.textContent=sem?'Sem conexão':'Ping '+(REDE.ping?REDE.ping+' ms':'…');caixa.append(b)}
  const f=document.createElement('span');f.className=REDE.fps>=50?'bom':REDE.fps>=30?'medio':'ruim';f.textContent=REDE.fps+' FPS';caixa.append(f);
 }
 desenhar();
})();
