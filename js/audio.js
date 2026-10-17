/* Sons do jogo: efeitos sintetizados, música e ambiente gerados na hora, arquivos existentes e sons
   configurados na Engine (projeto.sons). Um arquivo configurado na Engine sempre substitui o som gerado.
   Mixagem: efeitos, música e ambiente têm volumes próprios, e todos passam pelo volume geral
   (Menu › Opções). A saída de som (alto-falante/fone) também vale para a voz (js/voz.js). */
(function(){
const AudioCtor=window.AudioContext||window.webkitAudioContext;
let audio=null,noiseBuffer=null,bus=null;
const clips=new Map(),loops=new Map();
let unlocked=false,lastScene='';
const settings=()=>PROJ.audio||{};

/* ---------- configuração do jogador ---------- */
const SOM_KEY='ilha-rpg-som';
const salvo=(()=>{try{return JSON.parse(localStorage.getItem(SOM_KEY)||'{}')}catch(e){return {}}})();
// versões antigas tinham só "volume": vira o volume geral
const SOM=window.SOM=Object.assign({saida:'',geral:salvo.volume??100,musica:55,ambiente:65,efeitos:100},salvo);
delete SOM.volume;
const CANAIS=[['geral','Volume geral'],['musica','Música'],['ambiente','Ambiente'],['efeitos','Efeitos']];
SOM.canais=CANAIS;
const nivel=c=>Math.max(0,Math.min(1,(+SOM[c]||0)/100));
let escala=1; // volume deste som (sons de outros jogadores ficam mais baixos com a distância)
const ganhoEfeito=()=>escala*nivel('efeitos')*nivel('geral'); // para <audio> (fora do contexto de áudio)
const elementos=new Set(); // todos os <audio> do jogo, para trocar a saída de uma vez
function saidaEm(el){if(el&&el.setSinkId&&SOM.saida!==undefined)el.setSinkId(SOM.saida||'').catch(()=>{})}
SOM.salvar=()=>{try{localStorage.setItem(SOM_KEY,JSON.stringify({saida:SOM.saida,geral:SOM.geral,musica:SOM.musica,ambiente:SOM.ambiente,efeitos:SOM.efeitos}))}catch(e){}};
SOM.aplicarSaida=el=>{if(el)saidaEm(el);else{elementos.forEach(saidaEm);if(audio&&audio.setSinkId)audio.setSinkId(SOM.saida||'').catch(()=>{})}window.dispatchEvent(new Event('som-saida'))};
SOM.definirSaida=id=>{SOM.saida=id||'';SOM.salvar();SOM.aplicarSaida()};
// definirVolume(canal, 0..100); sem canal = volume geral (compatível com a versão antiga)
SOM.definirVolume=(canal,v)=>{if(v===undefined){v=canal;canal='geral'}if(!CANAIS.some(c=>c[0]===canal))return;SOM[canal]=Math.max(0,Math.min(100,Math.round(+v||0)));SOM.salvar();aplicarVolumes()};
SOM.suportaSaida=()=>'setSinkId' in HTMLMediaElement.prototype;
SOM.dispositivos=async tipo=>{try{return (await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind===tipo)}catch(e){return []}};
SOM.testar=canal=>{if(canal==='musica'||canal==='ambiente')return;window.playGameSound&&playGameSound(canal==='efeitos'?'lootRaro':'coin')};
const registrar=el=>{elementos.add(el);if(SOM.saida)saidaEm(el);return el};

/* ---------- contexto e canais (efeitos, música, ambiente -> geral -> saída) ---------- */
function criarContexto(){
 if(audio)return audio;
 audio=new AudioCtor();if(SOM.saida&&audio.setSinkId)audio.setSinkId(SOM.saida).catch(()=>{});
 const geral=audio.createGain();
 // compressor leve: vários sons juntos (moedas + loot + golpes) não estouram
 const comp=audio.createDynamicsCompressor();comp.threshold.value=-14;comp.knee.value=12;comp.ratio.value=3;comp.attack.value=.004;comp.release.value=.2;
 geral.connect(comp);comp.connect(audio.destination);
 bus={geral};for(const c of ['efeitos','musica','ambiente']){bus[c]=audio.createGain();bus[c].connect(geral)}
 aplicarVolumes(true);
 return audio;
}
// música e ambiente gerados são baixos por natureza; os multiplicadores deixam 100% num nível confortável
const BASE={geral:1,efeitos:1,musica:.9,ambiente:1};
function aplicarVolumes(agora){
 if(bus){const t=audio.currentTime;for(const c of ['geral','efeitos','musica','ambiente']){const g=bus[c].gain,v=nivel(c)*BASE[c];if(agora)g.value=v;else g.setTargetAtTime(v,t,.05)}}
 for(const [kind,l] of loops)if(l.voice)l.voice.volume=Math.max(0,Math.min(1,l.base*nivel(kind==='music'?'musica':'ambiente')*nivel('geral')));
}

/* ---------- arquivos (<audio>) ---------- */
function playClip(config,loop=false,canal='efeitos'){
 if(!config||!config.src)return null;
 const key=config.src;
 let clip=clips.get(key);
 if(!clip){
  clip=registrar(new window.Audio(key));clip.preload='auto';
  clip.addEventListener('error',()=>console.error('Não foi possível carregar o áudio:',config.name||key.slice(0,120)));
  clips.set(key,clip)
 }
 const voice=loop||!clip.paused?clip.cloneNode():clip;
 if(voice!==clip){voice.addEventListener('error',()=>console.error('Não foi possível carregar o áudio:',config.name||key.slice(0,120)));if(SOM.saida)saidaEm(voice)}
 const base=Number.isFinite(+config.volume)?+config.volume:.5;
 voice.volume=Math.max(0,Math.min(1,base*(loop?nivel(canal)*nivel('geral'):ganhoEfeito())));voice.loop=loop;
 if(!loop&&voice.readyState>0)voice.currentTime=0;
 voice.play().catch(error=>console.error('Não foi possível reproduzir o áudio '+(config.name||'configurado')+':',error));
 return voice
}
window.previewGameAudio=config=>playClip(config);
window.playEntitySound=(category,id,event,vol=1)=>{
 const entry=(typeof GAMEDATA!=='undefined'&&GAMEDATA[category]||[]).find(d=>d.id==id);
 const config=entry&&entry.sounds&&entry.sounds[event];
 if(config&&config.src){escala=vol;try{playClip(config)}finally{escala=1}return true}
 return false
};

/* ---------- cena atual: ilha, masmorra ou taverna ---------- */
const cenaAtual=()=>window.inTaverna?'tavern':window.inDungeon?'dungeon':'world';
function refreshLoops(){
 const scene=cenaAtual(),config=settings();
 for(const kind of ['music','ambient']){
  const key=scene+'.'+kind,sound=config[key],current=loops.get(kind);
  const src=unlocked&&!document.hidden&&sound&&sound.src;
  if(current&&(current.src!==src||scene!==lastScene)){current.voice.pause();loops.delete(kind)}
  if(src&&!loops.has(kind)){const voice=playClip(sound,true,kind==='music'?'musica':'ambiente');loops.set(kind,{src,voice,base:+sound.volume||.5})}
 }
 aplicarVolumes();
 // sem arquivo configurado, a música e o ambiente são gerados (abaixo)
 if(unlocked&&audio){
  const quer=document.hidden?null:scene;
  trocar('musica',quer&&!(config[scene+'.music']&&config[scene+'.music'].src)?quer:null);
  trocar('ambiente',quer&&!(config[scene+'.ambient']&&config[scene+'.ambient'].src)?quer:null);
 }
 lastScene=scene
}
window.refreshGameAudio=refreshLoops;
setInterval(refreshLoops,500);
document.addEventListener('visibilitychange',refreshLoops);
const swordClips=['espada1.mp3','espada2.mp3'].map(file=>{
 const clip=registrar(new window.Audio('assets/audio/'+file));
 clip.preload='auto';clip.volume=.72;
 clip.addEventListener('error',()=>console.error('Não foi possível carregar o som de espada:',clip.src));
 return clip
});
function unlock(){
 unlocked=true;
 if(AudioCtor){criarContexto();if(audio.state=='suspended')audio.resume().catch(error=>console.error('Não foi possível iniciar o áudio do jogo:',error))}
 refreshLoops();
}
document.addEventListener('pointerdown',unlock,{once:true,capture:true});
document.addEventListener('keydown',unlock,{once:true,capture:true});

/* ---------- blocos de síntese ---------- */
function ruido(){
 if(!noiseBuffer){noiseBuffer=audio.createBuffer(1,audio.sampleRate*2,audio.sampleRate);const s=noiseBuffer.getChannelData(0);for(let i=0;i<s.length;i++)s[i]=Math.random()*2-1}
 return noiseBuffer;
}
const mtof=m=>440*Math.pow(2,(m-69)/12);
// efeito curto com deslize de frequência (efeitos do jogo)
function tone(startFreq,endFreq,duration,type='triangle',volume=.035,delay=0){
 volume*=escala;if(volume<=.0002)return;
 const start=audio.currentTime+delay,osc=audio.createOscillator(),gain=audio.createGain();
 osc.type=type;osc.frequency.setValueAtTime(startFreq,start);
 osc.frequency.exponentialRampToValueAtTime(Math.max(1,endFreq),start+duration);
 gain.gain.setValueAtTime(.0001,start);gain.gain.linearRampToValueAtTime(volume,start+.006);
 gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
 osc.connect(gain);gain.connect(bus.efeitos);osc.start(start);osc.stop(start+duration+.01)
}
function noise(duration,volume,cutoff,delay=0,filterType='lowpass',endCutoff=cutoff,q=0.7,destino){
 volume*=escala;if(volume<=.0002)return;
 const buf=ruido(),start=audio.currentTime+delay,source=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain();
 source.buffer=buf;filter.type=filterType;filter.Q.setValueAtTime(q,start);filter.frequency.setValueAtTime(cutoff,start);
 filter.frequency.exponentialRampToValueAtTime(Math.max(1,endCutoff),start+duration);
 gain.gain.setValueAtTime(.0001,start);gain.gain.linearRampToValueAtTime(volume,start+.008);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
 source.connect(filter);filter.connect(gain);gain.connect(destino||bus.efeitos);
 source.start(start,Math.random()*Math.max(0,buf.duration-duration-.01),duration+.01)
}
// nota musical com envelope (música, jingles): t = tempo absoluto do contexto
function nota(dest,freq,t,dur,{tipo='triangle',vol=.04,ataque=.008,solta,filtro,detune=0,vibrato=0}={}){
 if(vol<=.0002)return;
 const osc=audio.createOscillator(),g=audio.createGain();let saida=g;
 osc.type=tipo;osc.frequency.setValueAtTime(freq,t);if(detune)osc.detune.setValueAtTime(detune,t);
 if(vibrato){const lfo=audio.createOscillator(),lg=audio.createGain();lfo.frequency.value=5.2;lg.gain.value=freq*vibrato;lfo.connect(lg);lg.connect(osc.frequency);lfo.start(t);lfo.stop(t+dur+(solta||dur)+.05)}
 const fim=t+dur,rel=solta??Math.max(.05,dur*.6);
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+ataque);g.gain.setValueAtTime(vol,Math.max(t+ataque,fim-.01));g.gain.exponentialRampToValueAtTime(.0001,fim+rel);
 if(filtro){const f=audio.createBiquadFilter();f.type='lowpass';f.frequency.value=filtro;g.connect(f);saida=f}
 osc.connect(g);saida.connect(dest);osc.start(t);osc.stop(fim+rel+.02);
}
const agora=()=>audio.currentTime;
function playSword(){
 const clip=swordClips[Math.floor(Math.random()*swordClips.length)];
 const voice=clip.paused?clip:clip.cloneNode();
 if(voice!==clip&&SOM.saida)saidaEm(voice);
 voice.volume=Math.max(0,Math.min(1,.72*ganhoEfeito()));
 if(voice.readyState>0)voice.currentTime=0;
 const playback=voice.play();
 if(playback)playback.catch(error=>console.error('Não foi possível reproduzir o som de espada:',error))
}
// arpejo brilhante (loot, nível): notas em sequência com brilho no fim
function arpejo(notas,passo,{tipo='triangle',vol=.035,dur=.18,brilho=0,inicio=0}={}){
 const t0=agora()+inicio;
 notas.forEach((m,i)=>{nota(bus.efeitos,mtof(m),t0+i*passo,dur,{tipo,vol:vol*escala,solta:.25});nota(bus.efeitos,mtof(m+12),t0+i*passo,dur*.6,{tipo:'sine',vol:vol*.35*escala,solta:.2})});
 if(brilho)for(let i=0;i<brilho;i++)nota(bus.efeitos,mtof(notas[notas.length-1]+24+[0,4,7,12][i%4]),t0+notas.length*passo+i*.045,.05,{tipo:'sine',vol:vol*.4*escala,solta:.3});
}
const sounds={
 skill:()=>{tone(420,570,.12,'sine',.018);tone(590,760,.18,'sine',.014,.08)},
 magic:()=>{tone(145,235,.32,'sine',.025);tone(292,470,.3,'sine',.014,.035);tone(580,390,.28,'triangle',.009,.1);noise(.3,.012,1500,.015,'bandpass',800,.8)},
 magicHit:()=>{tone(300,115,.22,'sine',.035);tone(510,210,.18,'triangle',.02,.018);noise(.13,.026,2100,0,'bandpass',650,1.1)},
 sword:()=>{
  noise(.16,.025,3600,0,'highpass',750,.8);
  noise(.07,.032,650,0,'lowpass',240,.7);
  tone(1480,720,.24,'sine',.012,.008);
  tone(2240,1080,.17,'sine',.006,.012)
 },
 hit:()=>{noise(.08,.024,700,0,'lowpass',180,.8);tone(115,62,.1,'sine',.018)},
 hurt:()=>{tone(105,72,.19,'sine',.022);noise(.12,.014,900,0,'bandpass',340,.7)},
 death:()=>{tone(185,112,.36,'sine',.019);tone(92,58,.42,'sine',.009,.04);noise(.32,.009,700,0,'bandpass',260,.65)},
 coin:()=>{noise(.09,.012,5200,0,'bandpass',1800,1.2);tone(1320,1180,.18,'sine',.012,.16);tone(1760,1510,.16,'sine',.008,.2)},
 item:()=>{tone(420,560,.13,'sine',.018);tone(620,830,.18,'sine',.012,.075)},
 // morte do jogador: queda grave, acorde menor descendo e um baque
 defeat:()=>{const t=agora();[[57,0],[53,.18],[50,.36],[45,.6]].forEach(([m,d])=>nota(bus.efeitos,mtof(m),t+d,.35,{tipo:'triangle',vol:.05*escala,solta:.6,filtro:1800}));
  nota(bus.efeitos,mtof(33),t+.6,1.2,{tipo:'sine',vol:.07*escala,solta:1.4});tone(90,38,.7,'sine',.06,.6);noise(.8,.02,500,.6,'lowpass',90,.7)},
 // renascer: brilho subindo com coro suave
 revive:()=>{const t=agora();noise(.9,.014,400,0,'bandpass',4000,1.4);
  [60,64,67,72,76,79,84].forEach((m,i)=>nota(bus.efeitos,mtof(m),t+.1+i*.07,.3,{tipo:'triangle',vol:.03*escala,solta:.5}));
  [60,64,67].forEach(m=>nota(bus.efeitos,mtof(m+12),t+.55,1.1,{tipo:'sawtooth',vol:.012*escala,ataque:.3,solta:.9,filtro:1600,vibrato:.004}))},
 // subir de nível: fanfarra curta
 levelUp:()=>{arpejo([60,64,67,72],.09,{tipo:'square',vol:.022,dur:.14});const t=agora()+.38;[72,76,79,84].forEach(m=>nota(bus.efeitos,mtof(m),t,.6,{tipo:'triangle',vol:.03*escala,solta:.8}));noise(.6,.01,6000,.38,'highpass',9000,.6)},
 rankUp:()=>{arpejo([67,71,74,79,83],.07,{tipo:'triangle',vol:.03,brilho:4})},
 quest:()=>{arpejo([62,66,69,74],.11,{tipo:'triangle',vol:.035,dur:.22});const t=agora()+.48;[62,66,69,74].forEach(m=>nota(bus.efeitos,mtof(m+12),t,.7,{tipo:'sine',vol:.02*escala,solta:.9}))},
 // pegar item por raridade (somRaridade): cada nível é maior e mais brilhante que o anterior
 lootComum:()=>{tone(700,900,.09,'sine',.02);tone(1050,1250,.12,'sine',.014,.06)},
 lootIncomum:()=>arpejo([72,76,79],.06,{vol:.03}),
 lootRaro:()=>{arpejo([72,76,79,84],.055,{vol:.032,brilho:3});noise(.25,.006,7000,.2,'highpass',10000,.5)},
 lootEpico:()=>{arpejo([69,72,76,81,84,88],.05,{tipo:'square',vol:.018,brilho:5});const t=agora()+.3;[69,72,76].forEach(m=>nota(bus.efeitos,mtof(m+12),t,.7,{tipo:'sawtooth',vol:.012*escala,ataque:.05,solta:.7,filtro:2400,vibrato:.004}));noise(.7,.01,6000,.28,'highpass',11000,.5)},
 lootLendario:()=>{const t=agora();tone(70,40,.6,'sine',.08);noise(.5,.02,300,0,'lowpass',80,.7);
  arpejo([60,64,67,72,76,79,84,88],.045,{tipo:'square',vol:.02,brilho:8,inicio:.08});
  [60,64,67,72].forEach((m,i)=>nota(bus.efeitos,mtof(m+12),t+.5,1.6,{tipo:'sawtooth',vol:.014*escala,ataque:.12,solta:1.4,filtro:2200,detune:i%2?7:-7,vibrato:.005}));
  nota(bus.efeitos,mtof(48),t+.5,1.6,{tipo:'triangle',vol:.05*escala,solta:1.2});noise(1.6,.014,5000,.45,'highpass',12000,.4)},
 // item batendo no chão (somQueda): mais grave e brilhante nas raridades altas
 drop:()=>{tone(1700,1300,.06,'sine',.012);noise(.04,.01,3000,0,'bandpass',2000,2)}
};
const LOOT=['lootComum','lootComum','lootIncomum','lootRaro','lootEpico','lootLendario'];
// pegar um item: som pela raridade (qualidade). Itens sem qualidade (material, consumível) usam "item".
window.somRaridade=(q,id)=>{
 if(window.playEntitySound&&id&&playEntitySound('items',id,'pickup'))return;
 playGameSound(q==null?'item':LOOT[typeof qi==='function'?qi(q):0]);
};
window.somQueda=q=>{
 const r=q==null||typeof qi!=='function'?0:qi(q);
 playGameSound('drop',.7+r*.1);
 if(r>=3&&audio&&bus){const t=agora();nota(bus.efeitos,mtof(84+r*2),t+.02,.08,{tipo:'sine',vol:.02,solta:.4});if(r>=4)noise(.4,.01,8000,.05,'highpass',12000,.5)}
 if(r>=5&&audio&&bus){tone(55,35,.5,'sine',.07);noise(.35,.02,200,0,'lowpass',60,.7)}
};
// vol: 0 a 1, multiplica o volume (sons de outros jogadores, pela distância)
window.playGameSound=function(name,vol=1){
 const config=settings();
 escala=vol;
 try{
  if(config[name]&&config[name].src){playClip(config[name]);return}
  if(name=='sword'){playSword();return}
  if(!AudioCtor)return;
  const play=sounds[name];
  if(!play)return;
  criarContexto();
  if(audio.state=='suspended')audio.resume().then(()=>{escala=vol;try{play()}finally{escala=1}}).catch(error=>console.error('Não foi possível iniciar o áudio do jogo:',error));
  else play()
 }finally{escala=1}
};

/* ---------- música gerada: uma trilha por lugar, com troca suave ---------- */
// cada trilha recebe (destino, tempo, passo) e agenda as notas daquele passo
const TRILHAS={
 // ilha: calma, dó maior, I-vi-IV-V, pad + arpejo dedilhado + melodia pentatônica
 world:{passo:60/84/2,toca(d,t,n,est){
  const ACORDES=[[48,52,55],[45,48,52],[41,45,48],[43,47,50]],bar=Math.floor(n/8)%4,s=n%8,ac=ACORDES[bar],P=60/84/2;
  if(s===0){ac.forEach(m=>nota(d,mtof(m+12),t,P*8,{tipo:'sine',vol:.022,ataque:.9,solta:1.2}));ac.forEach(m=>nota(d,mtof(m+12),t,P*8,{tipo:'triangle',vol:.008,ataque:1,solta:1.2,detune:8}))}
  if(s===0||s===4)nota(d,mtof(ac[0]-12),t,P*1.6,{tipo:'triangle',vol:.05,solta:.4});
  const arp=[0,1,2,1,0,2,1,2][s];nota(d,mtof(ac[arp]+24),t,P*.8,{tipo:'triangle',vol:.016,solta:.5,filtro:3000});
  const PENTA=[72,74,76,79,81,84];
  if([0,3,4,6].includes(s)&&Math.random()<.55){est.mel=Math.max(0,Math.min(PENTA.length-1,(est.mel??2)+Math.round((Math.random()-.5)*3)));nota(d,mtof(PENTA[est.mel]),t,P*(s===6?2:1.2),{tipo:'sine',vol:.022,ataque:.03,solta:.5,vibrato:.003})}
 }},
 // masmorra: lá menor, lenta e escura: drone, sinos esparsos com eco e um pulso grave
 dungeon:{passo:1,toca(d,t,n,est){
  const ACORDES=[[45,52],[41,48],[38,45],[40,47]],bar=Math.floor(n/4)%4,s=n%4,ac=ACORDES[bar];
  if(s===0){nota(d,mtof(ac[0]-12),t,4,{tipo:'sawtooth',vol:.016,ataque:1.2,solta:1.5,filtro:380});nota(d,mtof(ac[1]-12),t,4,{tipo:'sawtooth',vol:.01,ataque:1.5,solta:1.5,filtro:300,detune:-6});
   nota(d,52,t,.25,{tipo:'sine',vol:.05,solta:.3});nota(d,49,t+.28,.2,{tipo:'sine',vol:.035,solta:.3})}
  if(Math.random()<.38){const SINOS=[69,72,74,76,79,81],m=SINOS[Math.floor(Math.random()*SINOS.length)];nota(d,mtof(m),t,.05,{tipo:'sine',vol:.022,solta:2.4});nota(d,mtof(m),t+.42,.05,{tipo:'sine',vol:.008,solta:2})}
 }},
 // taverna: ré maior, animada: baixo, dedilhado de alaúde, melodia de rabeca e pandeiro
 tavern:{passo:60/112/2,toca(d,t,n,est){
  const ACORDES=[[50,54,57],[50,54,57],[43,47,50],[45,49,52],[50,54,57],[43,47,50],[45,49,52],[50,54,57]],bar=Math.floor(n/8)%8,s=n%8,ac=ACORDES[bar],P=60/112/2;
  if(s===0||s===4)nota(d,mtof(ac[0]-12),t,P*1.2,{tipo:'triangle',vol:.05,solta:.15});
  if(s===2||s===6)nota(d,mtof(ac[2]-12),t,P,{tipo:'triangle',vol:.035,solta:.12});
  if(s===2||s===6)ac.forEach((m,i)=>nota(d,mtof(m+12),t+i*.018,P*1.2,{tipo:'square',vol:.009,solta:.2,filtro:1700}));
  const ESC=[62,64,66,67,69,71,73,74,76,78];
  if(Math.random()<.7){est.mel=Math.max(0,Math.min(ESC.length-1,(est.mel??4)+[-2,-1,-1,1,1,2][Math.floor(Math.random()*6)]));nota(d,mtof(ESC[est.mel]),t,P*.9,{tipo:'triangle',vol:.022,ataque:.015,solta:.12,filtro:3200,vibrato:.004})}
  if(s%2===1){const g=audio.createGain(),src=audio.createBufferSource(),f=audio.createBiquadFilter();src.buffer=ruido();f.type='highpass';f.frequency.value=6500;g.gain.setValueAtTime(.012,t);g.gain.exponentialRampToValueAtTime(.0001,t+.06);src.connect(f);f.connect(g);g.connect(d);src.start(t,Math.random(),.07)}
  if(s===0||s===4){const o=audio.createOscillator(),g=audio.createGain();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(48,t+.12);g.gain.setValueAtTime(.06,t);g.gain.exponentialRampToValueAtTime(.0001,t+.18);o.connect(g);g.connect(d);o.start(t);o.stop(t+.2)}
 }}
};
/* ---------- ambiente gerado ---------- */
// fundo contínuo (ruído filtrado) + eventos aleatórios (pássaros, goteiras, lareira...)
const AMBIENTES={
 world:{montar(d){
  // mar: ruído grave subindo e descendo devagar; vento: ruído médio bem baixo
  const mar=fundo(d,'lowpass',520,.7,.045);const lfo=audio.createOscillator(),lg=audio.createGain();lfo.frequency.value=.09;lg.gain.value=.03;lfo.connect(lg);lg.connect(mar.gain);lfo.start();
  const vento=fundo(d,'bandpass',900,.5,.008);return [mar,vento,{parar:()=>lfo.stop()}];
 },eventos:[[2.5,7,(d,t)=>{const n=2+Math.floor(Math.random()*3),f0=2200+Math.random()*1400;for(let i=0;i<n;i++){const o=audio.createOscillator(),g=audio.createGain(),ti=t+i*.11;o.type='sine';o.frequency.setValueAtTime(f0,ti);o.frequency.exponentialRampToValueAtTime(f0*1.35,ti+.05);o.frequency.exponentialRampToValueAtTime(f0*.9,ti+.09);g.gain.setValueAtTime(.0001,ti);g.gain.linearRampToValueAtTime(.014,ti+.01);g.gain.exponentialRampToValueAtTime(.0001,ti+.1);o.connect(g);g.connect(d);o.start(ti);o.stop(ti+.12)}}]]},
 dungeon:{montar(d){return [fundo(d,'lowpass',110,.7,.07),fundo(d,'bandpass',300,3,.004)]},
  eventos:[[1.2,4,(d,t)=>{const f=900+Math.random()*700;for(const [k,v] of [[0,.03],[.27,.01],[.5,.004]]){const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(f,t+k);o.frequency.exponentialRampToValueAtTime(f*.45,t+k+.07);g.gain.setValueAtTime(v,t+k);g.gain.exponentialRampToValueAtTime(.0001,t+k+.1);o.connect(g);g.connect(d);o.start(t+k);o.stop(t+k+.12)}}],
   [8,18,(d,t)=>{const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(70,t);o.frequency.exponentialRampToValueAtTime(40,t+1.4);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.03,t+.3);g.gain.exponentialRampToValueAtTime(.0001,t+1.5);o.connect(g);g.connect(d);o.start(t);o.stop(t+1.6)}]]},
 tavern:{montar(d){
  // conversa ao fundo: ruído na faixa da voz, oscilando
  const voz=fundo(d,'bandpass',420,1.3,.02);const lfo=audio.createOscillator(),lg=audio.createGain();lfo.frequency.value=.35;lg.gain.value=.008;lfo.connect(lg);lg.connect(voz.gain);lfo.start();
  return [voz,fundo(d,'lowpass',180,.7,.012),{parar:()=>lfo.stop()}];
 },eventos:[[.05,.25,(d,t)=>{const g=audio.createGain(),src=audio.createBufferSource(),f=audio.createBiquadFilter();src.buffer=ruido();f.type='highpass';f.frequency.value=1200+Math.random()*2000;const v=.004+Math.random()*.012;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.02+Math.random()*.03);src.connect(f);f.connect(g);g.connect(d);src.start(t,Math.random(),.06)}],
  [3,9,(d,t)=>{for(const [f,k] of [[2600+Math.random()*400,0],[3400+Math.random()*400,.07]]){const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.012,t+k);g.gain.exponentialRampToValueAtTime(.0001,t+k+.35);o.connect(g);g.connect(d);o.start(t+k);o.stop(t+k+.4)}}]]}
};
function fundo(d,tipo,freq,q,vol){
 const src=audio.createBufferSource(),f=audio.createBiquadFilter(),g=audio.createGain();
 src.buffer=ruido();src.loop=true;f.type=tipo;f.frequency.value=freq;f.Q.value=q;g.gain.value=vol;
 src.connect(f);f.connect(g);g.connect(d);src.start(0,Math.random()*1.5);
 return {gain:g.gain,parar:()=>{try{src.stop()}catch(e){}}};
}
const ativos={musica:null,ambiente:null}; // {cena, saida(gain), ...}
SOM.estado=()=>({contexto:audio?audio.state:'nenhum',musica:ativos.musica&&ativos.musica.cena,ambiente:ativos.ambiente&&ativos.ambiente.cena,notas:ativos.musica?ativos.musica.n:0});
function trocar(canal,cena){
 const a=ativos[canal];if(a&&a.cena===cena)return;
 if(a){const t=agora();a.saida.gain.cancelScheduledValues(t);a.saida.gain.setValueAtTime(a.saida.gain.value,t);a.saida.gain.linearRampToValueAtTime(0,t+1.4);a.parado=true;setTimeout(()=>{(a.nos||[]).forEach(n=>n.parar());try{a.saida.disconnect()}catch(e){}},1600);ativos[canal]=null}
 if(!cena)return;
 const saida=audio.createGain(),t=agora();saida.gain.setValueAtTime(0,t);saida.gain.linearRampToValueAtTime(1,t+2);saida.connect(bus[canal]);
 const novo={cena,saida,prox:t+.15,n:0,est:{}};
 if(canal==='ambiente'){const amb=AMBIENTES[cena];novo.nos=amb.montar(saida);novo.timers=amb.eventos.map(([a,b])=>t+a+Math.random()*(b-a))}
 ativos[canal]=novo;
}
// agenda um pouco à frente (o setInterval do navegador não é preciso)
setInterval(()=>{
 if(!audio||audio.state!=='running')return;
 const t=agora(),m=ativos.musica;
 if(m&&!m.parado){const tr=TRILHAS[m.cena];if(m.prox<t-1)m.prox=t+.05;while(m.prox<t+.6){try{tr.toca(m.saida,m.prox,m.n,m.est)}catch(e){console.error('Música:',e)}m.prox+=tr.passo;m.n++}}
 const a=ativos.ambiente;
 if(a&&!a.parado){const ev=AMBIENTES[a.cena].eventos;ev.forEach(([mn,mx,fn],i)=>{if(a.timers[i]<t-2)a.timers[i]=t+mn;while(a.timers[i]<t+.3){try{fn(a.saida,Math.max(t,a.timers[i]))}catch(e){}a.timers[i]+=mn+Math.random()*(mx-mn)}})}
},150);
})();
