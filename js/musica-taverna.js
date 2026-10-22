/* ---------- Músicas da taverna (iguais para todos) ----------
   5 músicas tocadas em sequência pelo relógio do jogo (js/tempo.js): todo jogador na taverna ouve a mesma música no
   mesmo ponto. As melodias são fixas: geradas a partir de uma semente própria de cada música (mesma semente = mesmas
   notas em qualquer computador). O som é feito pelo audio.js; o palco da taverna (taverna.js) mostra o nome. */
window.MUSICA_TAVERNA=(()=>{
 const PAUSA=5; // segundos de aplauso entre uma música e outra
 // escalas em MIDI (2 oitavas) e acordes por compasso (graus da escala: 0 = tônica)
 const MUSICAS=[
  {nome:'O Javali Dourado',bpm:120,passos:8,semente:11,tonica:62,modo:[0,2,4,5,7,9,11],acordes:[0,0,3,4,0,3,4,0],voltas:3,lead:'triangle',vib:.004},
  {nome:'Caneca Cheia',bpm:132,passos:8,semente:23,tonica:67,modo:[0,2,4,5,7,9,11],acordes:[0,4,0,4,3,0,4,0],voltas:3,lead:'square',vib:0},
  {nome:'Balada do Marinheiro',bpm:96,passos:6,semente:37,tonica:57,modo:[0,2,3,5,7,8,10],acordes:[0,5,2,6,0,3,4,0],voltas:3,lead:'triangle',vib:.006},
  {nome:'Dança da Ilha',bpm:126,passos:8,semente:41,tonica:64,modo:[0,2,3,5,7,9,10],acordes:[0,6,0,3,0,6,4,0],voltas:3,lead:'square',vib:.002},
  {nome:'Canção da Lareira',bpm:84,passos:8,semente:53,tonica:65,modo:[0,2,4,5,7,9,11],acordes:[0,5,3,4,0,5,3,0],voltas:2,lead:'sine',vib:.005}
 ];
 const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 // nota do grau g da escala (graus podem passar de 7: sobe a oitava)
 const grau=(m,g)=>m.tonica+12*Math.floor(g/7)+m.modo[((g%7)+7)%7];
 const triade=(m,c)=>[c,c+2,c+4];
 /* melodia: frase de 2 compassos (A), repetida variando (A'), parte B, e A de novo terminando na tônica.
    Tempos fortes caem em nota do acorde; o resto anda por grau. Resultado: notas[passo] = [midi, duração em passos] */
 function compor(m){
  const r=rng(m.semente),P=m.passos,barras=m.acordes.length,notas=new Array(barras*P).fill(null);
  const RITMOS=P===6?[[2,1,2,1],[3,1,1,1],[1,1,1,1,2],[2,2,2]]:[[2,1,1,2,2],[1,1,1,1,2,2],[2,2,1,1,2],[3,1,2,2],[1,1,2,1,1,2]];
  let g=7+[0,2,4][r()*3|0];
  const frase=(b0,nb,fim)=>{for(let b=b0;b<b0+nb;b++){const ritmo=RITMOS[r()*RITMOS.length|0],ac=triade(m,m.acordes[b]);let s=0;
   ritmo.forEach((d,i)=>{if(s>=P)return;
    if(i===0||d>=2){let melhor=g,dist=99;for(const c of ac)for(const o of [0,7,14]){const q=c+o;if(q>=5&&q<=16&&Math.abs(q-g)<dist){dist=Math.abs(q-g);melhor=q}}g=melhor}
    else g=Math.max(4,Math.min(16,g+[-2,-1,-1,1,1,2][r()*6|0]));
    if(fim&&b===b0+nb-1&&s+d>=P){g=7}
    notas[b*P+s]=[grau(m,g),Math.min(d,P-s)];s+=d})}};
  frase(0,2);for(let i=0;i<2*P;i++)notas[2*P+i]=notas[i]&&[notas[i][0],notas[i][1]]; // A'
  {const q=notas[3*P+P-2];if(q)q[0]=grau(m,g=9)} // A' termina diferente
  frase(4,2);frase(6,2,true);
  return notas}
 MUSICAS.forEach(m=>{m.passo=60/m.bpm/2;m.notas=compor(m);m.barras=m.acordes.length;m.duracao=m.barras*m.passos*m.voltas*m.passo;
  m.baixo=m.acordes.map(c=>grau(m,c)-24);m.acorde=m.acordes.map(c=>triade(m,c).map(q=>grau(m,q)-12))});
 const CICLO=MUSICAS.reduce((t,m)=>t+m.duracao+PAUSA,0);
 /* o que está tocando no tempo g (segundos do relógio do jogo) */
 function em(g){
  let t=((g%CICLO)+CICLO)%CICLO;const ciclo0=g-t;
  for(let i=0;i<MUSICAS.length;i++){const m=MUSICAS[i];
   if(t<m.duracao){const passo=Math.floor(t/m.passo);return{i,m,passo,inicio:ciclo0+(g-ciclo0-t)+passo*m.passo,progresso:t/m.duracao,pausa:false}}
   t-=m.duracao;if(t<PAUSA)return{i,m,pausa:true,fimPausa:g+(PAUSA-t),progresso:1}
   t-=PAUSA}
  return{i:0,m:MUSICAS[0],pausa:true,fimPausa:g+1,progresso:1}}
 const agora=()=>em((window.TEMPO?TEMPO.agora():Date.now())/1000);
 return{MUSICAS,em,agora,PAUSA}
})();
