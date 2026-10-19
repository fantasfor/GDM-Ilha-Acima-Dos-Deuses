/* ---------- Efeitos animados do pacote (js/pacote-efeitos.js, folhas em assets/efeitos) ----------
   Animação = "folha.linha.grupo" (ex.: "1C.14.2"): 8 quadros de 24×24.
   EFX.tocar(id, x, y, {ang, esc, dur, oy}) toca uma vez no mundo (habilidades: lançar e acerto);
   status com FX_INFO[k].anim mostram a animação em loop em cima de quem está afetado (ex.: Atordoado).
   Desenhado pelo menu.js no passe do mundo (ilha e DG). */
(function(){
 const P=window.PACOTE_EFEITOS||{pasta:'assets/efeitos/',cel:24,quadros:8,folhas:[]},C=P.cel||24,Q=P.quadros||8;
 const imgs={},ativos=[],recentes=[];
 const folha=f=>{if(!P.folhas.includes(f))return null;if(!imgs[f]){const i=new Image();i.src=P.pasta+f+'.png';imgs[f]=i}return imgs[f]};
 const ler=id=>{const m=/^(\d+[ABC])\.(\d+)\.([0-2])$/.exec(String(id||''));return m?{f:m[1],r:+m[2],g:+m[3]}:null};
 function quadro(g,id,k,x,y,ang,esc,alfa){
  const a=ler(id),im=a&&folha(a.f);if(!im||!im.complete||!im.naturalWidth)return;
  const s=C*esc;g.save();g.translate(Math.round(x),Math.round(y));if(ang)g.rotate(ang);g.globalAlpha=alfa??1;g.imageSmoothingEnabled=false;
  g.drawImage(im,(a.g*Q+(k%Q))*C,a.r*C,C,C,-s/2,-s/2,s,s);g.restore()}
 window.EFX={
  valido:id=>!!ler(id),
  carregar:id=>{const a=ler(id);if(a)folha(a.f)},
  // toca uma vez; esc = escala (1 = 24 px), dur = segundos da animação toda
  total:0,
  tocar(id,x,y,o={}){if(!ler(id))return;this.carregar(id);this.total++;const e={id,x,y,ang:o.ang||0,esc:o.esc||1,dur:Math.max(.1,o.dur||.4),t:0,oy:o.oy||0};ativos.push(e);recentes.push(e);if(recentes.length>8)recentes.shift();if(ativos.length>80)ativos.shift()},
  recentes,
  quadro,
  desenhar(g,dt){
   for(let i=ativos.length;i--;){const e=ativos[i];e.t+=dt;if(e.t>=e.dur){ativos.splice(i,1);continue}
    quadro(g,e.id,Math.min(Q-1,Math.floor(e.t/e.dur*Q)),e.x,e.y+e.oy,e.ang,e.esc,1)}
   // status em loop em cima da cabeça
   const fx=typeof FX_INFO!=='undefined'?FX_INFO:{},tq=Math.floor(performance.now()/1000*12);
   const em=t=>{if(!t||!t.st||t.hp<=0)return;let k2=0;for(const k in t.st){const f=fx[k];if(!f||!f.anim||!(t.st[k].t>0))continue;quadro(g,f.anim,tq,t.x+k2*10,t.y-34,0,.75,1);k2++}};
   if(typeof p!=='undefined')em(p);if(typeof en!=='undefined')for(const e of en)em(e);
  }
 };
})();
