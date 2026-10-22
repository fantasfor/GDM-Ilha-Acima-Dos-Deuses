/* ---------- Tempo do jogo ----------
   Igual para todos os jogadores: vem do relógio real (do servidor do Firebase quando há conta; senão o do computador).
   Cada hora real é um dia do jogo: os primeiros 30 min são DIA e os outros 30 são NOITE (ex.: 17:00 dia, 17:30 noite).
   O relógio do jogo marca 06:00 no começo do dia e 18:00 no começo da noite. Amanhecer e anoitecer levam 3 min.
   Noite: campo de visão −10%; na ilha os monstros ficam 5% mais fortes (dano ×1,05 e recebem ÷1,05) e dão 5% a mais de
   XP, ouro e chance de drop (ex.: 1% × 1,05). Teste: ?tempo=0.75 na URL ou TEMPO.forcar(0.75) (0 = amanhecer, .5 = anoitecer). */
window.TEMPO=(()=>{
 const HORA=3600000,TRANSICAO=3/60,BONUS=1.05,VISAO=.9;
 let forcada=null;
 {const q=new URLSearchParams(location.search).get('tempo');if(q!=null&&q!=='')forcada=((+q%1)+1)%1}
 // relógio do servidor (Firebase, conta.js NUVEM.offset): todos veem a mesma hora mesmo com o relógio do computador errado
 const agora=()=>Date.now()+(window.NUVEM&&+NUVEM.offset||0);
 const fase=()=>forcada!=null?forcada:(agora()%HORA)/HORA;
 const ehNoite=()=>fase()>=.5;
 /* escuridão: 0 de dia, 1 de noite; sobe no começo da noite e desce no começo do dia */
 const escuro=()=>{const f=fase();return f<TRANSICAO?1-f/TRANSICAO:f<.5?0:f<.5+TRANSICAO?(f-.5)/TRANSICAO:1};
 const hora=()=>{const m=Math.floor(((fase()*24+6)%24)*60);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
 const minutosAte=()=>{const f=fase();return Math.ceil(((f<.5?.5:1)-f)*60)};
 /* na ilha (fora de DG, arena e taverna) */
 const naIlha=e=>!window.inDungeon&&!window.inArena&&!window.inTaverna&&!(e&&(e.isDungeonMob||e.pvp||e.duelo));
 // o bônus da noite segue o relógio do jogo (igual para todos), não o dia/noite fixado no botão
 const noiteNaIlha=e=>(agora()%HORA)/HORA>=.5&&naIlha(e);
 return{agora,fase,ehNoite,escuro,hora,minutosAte,
  visao:()=>ehNoite()?VISAO:1,
  forcaMonstro:e=>noiteNaIlha(e)?BONUS:1,
  premio:e=>noiteNaIlha(e)?BONUS:1,
  forcar(f){forcada=f==null?null:((+f%1)+1)%1}}
})();
/* desenho da noite: escurece a tela (azulado) mantendo as luzes; chamado pelo render da ilha, da arena e da taverna */
// luzes: [{x,y,r}] no mundo (fogueira, tochas, velas, o herói): ali a escuridão some aos poucos (buraco suave na camada)
const camadaNoite=document.createElement('canvas');
window.desenharNoite=function(forca=1,luzes=[]){
 const k=TEMPO.escuro()*forca;if(k<=0)return;
 const c=camadaNoite;if(c.width!==cv.width||c.height!==cv.height){c.width=cv.width;c.height=cv.height}const g=c.getContext('2d');
 g.globalCompositeOperation='source-over';g.clearRect(0,0,c.width,c.height);g.fillStyle='rgb('+Math.round(255-170*k)+','+Math.round(255-160*k)+','+Math.round(255-110*k)+')';g.fillRect(0,0,c.width,c.height);
 g.globalCompositeOperation='destination-out';
 for(const l of luzes){const sx=cv.width/2+(l.x-p.x)*S,sy=cv.height/2+(l.y-p.y)*S,r=l.r*S;if(sx<-r||sy<-r||sx>c.width+r||sy>c.height+r)continue;const lg=g.createRadialGradient(sx,sy,0,sx,sy,r);lg.addColorStop(0,'rgba(0,0,0,'+(l.a??.9)+')');lg.addColorStop(.55,'rgba(0,0,0,'+((l.a??.9)*.6)+')');lg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=lg;g.fillRect(sx-r,sy-r,r*2,r*2)}
 ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='multiply';ctx.drawImage(c,0,0);ctx.restore()};
/* luz quente de tocha/fogueira que aparece à noite (coordenadas do mundo, com a transformação da câmera já aplicada) */
window.luzNoite=function(x,y,r,cor='255,170,80',forca=1){
 const k=TEMPO.escuro()*forca;if(k<=0)return;
 ctx.save();ctx.globalCompositeOperation='screen';const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba('+cor+','+(.32*k)+')');g.addColorStop(1,'rgba('+cor+',0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore()};
/* botão Dia/Noite (só no Play da Engine, no alto, junto de Taverna): alterna só na sua tela entre o relógio do jogo (igual para todos),
   dia fixo e noite fixa. Só muda o visual e a visão; o bônus da noite (monstros e recompensas) segue o relógio do jogo. */
addEventListener('load',()=>{
 if(typeof MODO==='undefined'||MODO.motor||!MODO.teste)return; // só no Play da Engine (para testar); no jogo vale o relógio (30 min de dia, 30 de noite)
 const MODOS=[['auto','Hora: jogo',null],['dia','Hora: dia',.25],['noite','Hora: noite',.75]];let i=0;
 const b=document.createElement('button');b.type='button';b.className='ib diaNoiteBtn';
 const mostrar=()=>{b.textContent=MODOS[i][1];b.title=i===0?'Dia e noite pelo relógio do jogo (igual para todos). Clique para fixar o dia.':i===1?'Dia fixo (só na sua tela). Clique para fixar a noite.':'Noite fixa (só na sua tela). Clique para voltar ao relógio do jogo.'};
 b.onclick=()=>{i=(i+1)%MODOS.length;TEMPO.forcar(MODOS[i][2]);mostrar()};mostrar();
 (document.getElementById('hbtns')||document.body).append(b);
});