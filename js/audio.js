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
const musicaDG={ultimaLuta:0};
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
  // em combate (fora da taverna) toca a música de combate; ela fica até o combate acabar (state.js emCombate, ~10 s sem golpes)
  const luta=quer&&scene!=='tavern'&&p.dead<=0&&window.emCombate&&emCombate();
  // DG com trilha própria (config.trilha, ex.: Caverna dos Glooc): explorando, batalha e chefe
  const cfgDG=scene==='dungeon'&&window.lerDungeonConfig?lerDungeonConfig():null,trilha=cfgDG&&cfgDG.trilha;
  const chefeLuta=trilha&&p.dead<=0&&(window.SELO_CHEFE&&SELO_CHEFE.fechado||en.some(e=>e.isBoss&&e.hp>0&&e.mec&&Math.hypot(e.x-p.x,e.y-p.y)<380));
  const semArquivo=!(config[scene+'.music']&&config[scene+'.music'].src);
  if(trilha==='glooc'&&semArquivo&&quer){
   // com folga: a batalha só volta para a exploração depois de 5 s sem luta, e o chefe fica até a arena abrir (antes a música
   // trocava a cada pausa curta da luta e recomeçava, salpicando)
   const quer2=chefeLuta?'gloocChefe':luta?'gloocLuta':'gloocCaverna',atual=ativos.musica&&ativos.musica.cena,ag=performance.now();
   if(quer2!=='gloocCaverna')musicaDG.ultimaLuta=ag;
   const segura=atual&&atual!=='gloocCaverna'&&quer2==='gloocCaverna'&&ag-(musicaDG.ultimaLuta||0)<5000;
   const desceChefe=atual==='gloocChefe'&&quer2==='gloocLuta'&&ag-(musicaDG.ultimaLuta||0)<5000&&window.SELO_CHEFE&&SELO_CHEFE.fechado;
   if(!segura&&!desceChefe)trocar('musica',quer2)}
  else trocar('musica',luta?'combate':quer&&semArquivo?quer:null);
  // ilha: ambiente de dia (mar, vento, pássaros) ou de noite (grilos, coruja), pelo relógio do jogo (js/tempo.js)
  // na taverna não há ambiente de fundo (conversa): só a música da banda e os sons dos objetos (lareira, fogueira, chafariz...)
  const amb=quer==='tavern'?null:quer==='world'&&window.TEMPO&&TEMPO.ehNoite()?'worldNoite':trilha==='glooc'?'cavernaGlooc':quer;
  trocar('ambiente',quer&&!(config[scene+'.ambient']&&config[scene+'.ambient'].src)?amb:null);
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
 // cada moeda que chega ao personagem: "blim" curto, com altura um pouco diferente a cada vez
 moeda:()=>{const f=2000+Math.random()*450;tone(f,f*.985,.16,'sine',.014);tone(f*1.5,f*1.48,.09,'sine',.006,.012);noise(.025,.004,9000,0,'highpass',12000,.6)},
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
 // jogos de mesa (js/mesas.js): sininho claro quando chega a sua vez e tique nos últimos segundos do prazo
 suaVez:()=>{const t=agora();[[76,0],[83,.13]].forEach(([m,d])=>{nota(bus.efeitos,mtof(m),t+d,.5,{tipo:'triangle',vol:.05*escala,solta:.6});nota(bus.efeitos,mtof(m+12),t+d,.35,{tipo:'sine',vol:.02*escala,solta:.5})})},
 // UNO!: dois toques curtos e agudos com um brilho (mesa de jogo, js/mesas.js)
 /* Glooc e o Chefe da Tribo (2026-10-29): golpe com grunhido, machadada pesada, grito de guerra, impulso e queda do pulo,
    giro e o machado voando; o selo da arena fechando */
 gloocGolpe:()=>{noise(.14,.028,800,0,'bandpass',2600,1.2);tone(380,250,.09,'sawtooth',.012,.02);tone(300,210,.07,'square',.006,.03)},
 gloocMachado:()=>{noise(.22,.034,900,0,'lowpass',260,.9);tone(240,150,.12,'sawtooth',.013,.02);tone(90,48,.16,'sine',.03,.17);noise(.08,.02,500,.17,'lowpass',200,.8)},
 gloocGrito:()=>{const t=agora();for(const [f0,v,dt] of [[170,.05,0],[118,.04,.04],[230,.02,.08]]){const o=audio.createOscillator(),g=audio.createGain(),fl=audio.createBiquadFilter(),l=audio.createOscillator(),lg=audio.createGain();o.type='sawtooth';o.frequency.setValueAtTime(f0,t+dt);o.frequency.linearRampToValueAtTime(f0*1.25,t+dt+.25);o.frequency.exponentialRampToValueAtTime(f0*.6,t+dt+1.1);l.frequency.value=9;lg.gain.value=f0*.05;l.connect(lg);lg.connect(o.frequency);fl.type='bandpass';fl.frequency.value=750;fl.Q.value=1.4;g.gain.setValueAtTime(.0001,t+dt);g.gain.linearRampToValueAtTime(v*escala,t+dt+.08);g.gain.exponentialRampToValueAtTime(.0001,t+dt+1.2);o.connect(fl);fl.connect(g);g.connect(bus.efeitos);o.start(t+dt);l.start(t+dt);o.stop(t+dt+1.25);l.stop(t+dt+1.25)}noise(1,.02,1400,0,'bandpass',500,1.1)},
 saltoImpulso:()=>{noise(.36,.03,280,0,'bandpass',2600,1.3);tone(200,320,.2,'sawtooth',.012)},
 saltoQueda:()=>{tone(95,34,.55,'sine',.09);noise(.45,.06,520,0,'lowpass',90,.8);for(let k=0;k<5;k++)noise(.05,.015,2400,.08+k*.07,'highpass',1800,.7)},
 giroChefe:()=>{for(let k=0;k<3;k++)noise(.12,.024,600,k*.11,'bandpass',2200,1.6)},
 machadoVoa:()=>{for(let k=0;k<6;k++){noise(.05,.02,1400,k*.11,'bandpass',3000,2);tone(520,420,.04,'triangle',.006,k*.11)}},
 portalFecha:()=>{tone(220,70,.8,'sawtooth',.02);tone(880,440,.6,'sine',.018,.05);noise(.7,.02,3000,0,'bandpass',600,1.5)}, uno:()=>{const t=agora();[[79,0],[84,.09]].forEach(([m,d])=>{nota(bus.efeitos,mtof(m),t+d,.22,{tipo:'square',vol:.03*escala,solta:.25,filtro:3200});nota(bus.efeitos,mtof(m+12),t+d,.16,{tipo:'sine',vol:.02*escala,solta:.2})});noise(.18,.008,7000,.1,'highpass',10000,.6)},
 tiqueVez:()=>{tone(1400,1300,.05,'square',.008);tone(700,650,.04,'sine',.01)},
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
 // ---- sons das habilidades, ataques e poção (2026-10-22): cada tipo tem o seu ----
 swing:()=>{noise(.12,.03,2600,0,'bandpass',900,1.2);tone(520,260,.1,'sine',.012)}, // golpe corpo a corpo cortando o ar
 arco:()=>{tone(180,120,.12,'triangle',.03);noise(.05,.02,3000,0,'highpass',6000,.7);tone(900,1400,.08,'sine',.008,.02)}, // corda do arco
 feitico:()=>{tone(600,980,.16,'sine',.02);tone(1200,1900,.12,'triangle',.008,.03);noise(.15,.008,4000,.02,'bandpass',2500,2)}, // disparo mágico
 corte:()=>{noise(.22,.04,4200,0,'bandpass',700,1.4);tone(1600,500,.2,'sine',.014,.01)}, // meia-lua cortando
 investida:()=>{noise(.3,.03,600,0,'lowpass',2400,.9);tone(140,60,.2,'sine',.05,.26);noise(.12,.04,500,.26,'lowpass',120,.7)}, // corrida + impacto
 grito:()=>{const t=agora();for(const [f,d] of [[160,0],[220,.04],[110,.02]])nota(bus.efeitos,f,t+d,.5,{tipo:'sawtooth',vol:.018*escala,ataque:.05,solta:.3,filtro:900,vibrato:.02});noise(.6,.015,800,0,'bandpass',400,1)}, // brado de guerra
 giro:()=>{for(let i=0;i<4;i++)noise(.14,.025,3000,i*.12,'bandpass',900,1.5)}, // lâmina rodando
 fogo:()=>{noise(.45,.03,1200,0,'lowpass',300,.8);tone(220,90,.4,'sawtooth',.012)}, // bola de fogo (rugido de chama)
 gelo:()=>{arpejo([88,91,95,100],.04,{tipo:'sine',vol:.02,dur:.15});noise(.2,.01,7000,0,'highpass',9000,.6)}, // cristais de gelo
 meteoros:()=>{tone(1800,300,.7,'sine',.012);noise(.8,.02,2500,0,'bandpass',600,1)}, // assobio da chuva de meteoros
 explosao:()=>{tone(90,40,.4,'sine',.06);noise(.35,.04,900,0,'lowpass',120,.7)}, // impacto de meteoro/bola
 brilho:()=>{arpejo([76,79,83,88],.05,{tipo:'triangle',vol:.02,dur:.25,brilho:2})}, // aura/inspiração/fortalecer
 cura:()=>{arpejo([72,76,79,84],.07,{tipo:'sine',vol:.025,dur:.3});noise(.5,.006,5000,.1,'highpass',8000,.5)}, // cura (sinos)
 luzSagrada:()=>{const t=agora();[60,64,67,72].forEach((m,i)=>nota(bus.efeitos,mtof(m),t,1.2,{tipo:'sine',vol:.012*escala,ataque:.2,solta:1}));noise(1,.006,3000,0,'bandpass',5000,2)}, // zona de luz
 pulso:()=>{tone(70,35,.8,'sine',.08);noise(.6,.035,1500,0,'lowpass',200,.7);arpejo([72,79,84,91],.04,{tipo:'triangle',vol:.025,dur:.4,brilho:4})}, // pulso de luz (ultimate)
 beber:()=>{for(let i=0;i<3;i++){tone(320+i*30,180,.09,'sine',.03,i*.15);noise(.06,.012,700,i*.15+.02,'bandpass',400,4)}}, // goles da poção
 drop:()=>{tone(1700,1300,.06,'sine',.012);noise(.04,.01,3000,0,'bandpass',2000,2)},
 fala:()=>{tone(880,990,.05,'triangle',.01)}, // diálogo: nova fala (js/dialogo.js)
 anjo:()=>{const t=agora();[64,68,71,76,80].forEach((m,i)=>nota(bus.efeitos,mtof(m),t+i*.09,1.6,{tipo:'sine',vol:.016*escala,ataque:.25,solta:1.3,vibrato:.004}));noise(1.4,.006,6000,0,'highpass',9000,.5)}, // coro do anjo / portal celeste
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

/* bateria da Caverna dos Glooc: bumbo, tambor tribal (tom), caixa/chimbal de ruído e o ruído subindo antes do drop */
function bumboGlooc(d,t,v,q=1){const o=audio.createOscillator(),g=audio.createGain();o.frequency.setValueAtTime(150*q,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.24);o.connect(g);g.connect(d);o.start(t);o.stop(t+.26)}
function tomGlooc(d,t,v,f0){const o=audio.createOscillator(),g=audio.createGain(),f=audio.createBiquadFilter();o.type='triangle';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f0*.55,t+.22);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.34);f.type='lowpass';f.frequency.value=900;o.connect(g);g.connect(f);f.connect(d);o.start(t);o.stop(t+.36)}
function chiadoGlooc(d,t,v,fq,dur,tipo,n){const g=audio.createGain(),src=audio.createBufferSource(),f=audio.createBiquadFilter();src.buffer=ruido();f.type=tipo;f.frequency.value=fq;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);src.connect(f);f.connect(g);g.connect(d);src.start(t,((n||0)*.173)%1.5,dur+.02)}
function riserGlooc(d,t,dur,v){const g=audio.createGain(),src=audio.createBufferSource(),f=audio.createBiquadFilter();src.buffer=ruido();src.loop=true;f.type='bandpass';f.Q.value=2.5;f.frequency.setValueAtTime(350,t);f.frequency.exponentialRampToValueAtTime(9000,t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+dur);g.gain.setValueAtTime(.0001,t+dur+.01);src.connect(f);f.connect(g);g.connect(d);src.start(t);src.stop(t+dur+.02)}/* ---------- música gerada: uma trilha por lugar, com troca suave ---------- */
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
 /* combate: lá menor, 128 bpm em semicolcheias. Começa meio lenta (8 compassos em meio-tempo: pad, baixo longo, bumbo só
    no 1 e no 3, dedilhado esparso; nos 2 últimos um ruído subindo e a caixa acelerando) e cai no DROP (16 compassos: bumbo
    em todo tempo, palma no 2 e 4, chimbal, baixo serrilhado "respirando" no contratempo e um riff agudo); depois uma pausa
    curta de 4 compassos e outro drop, enquanto durar o combate. Sempre que o combate começa, a música recomeça do início. */
 combate:{passo:60/128/4,toca(d,t,n,est){
  const P=60/128/4,s=n%16,b=Math.floor(n/16),ACORDES=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]],BAIXO=[33,29,36,31];
  const ciclo=b<8?-1:(b-8)%20,secao=b<8?'sobe':ciclo<16?'drop':'pausa',i=(b<8?b:ciclo)%4,ac=ACORDES[i];
  const bumbo=(v,q=1)=>{const o=audio.createOscillator(),g=audio.createGain();o.frequency.setValueAtTime(150*q,t);o.frequency.exponentialRampToValueAtTime(42,t+.11);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.22);o.connect(g);g.connect(d);o.start(t);o.stop(t+.24)};
  const chiado=(v,fq,dur,tipo='highpass')=>{const g=audio.createGain(),src=audio.createBufferSource(),f=audio.createBiquadFilter();src.buffer=ruido();f.type=tipo;f.frequency.value=fq;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);src.connect(f);f.connect(g);g.connect(d);src.start(t,(n*.173)%1.5,dur+.02)};
  if(secao==='sobe'){
   if(s===0){ac.forEach(m=>nota(d,mtof(m),t,P*16,{tipo:'sawtooth',vol:.007,ataque:.6,solta:.8,filtro:900+b*160}));nota(d,mtof(BAIXO[i]),t,P*14,{tipo:'triangle',vol:.05,ataque:.05,solta:.4})}
   if(s===0||s===8)bumbo(.06);
   if(s%4===2&&b>=2)nota(d,mtof(ac[(s/4|0)%3]+12),t,P*1.5,{tipo:'triangle',vol:.012+b*.002,solta:.25,filtro:2600});
   if(b>=4&&s%2===0)chiado(.003+b*.0008,8000,.03);
   if(b>=6){const k=b===6?4:s<8?2:1;if(s%k===0)chiado(.006+(b-6)*.006+s*.0006,1800,.06,'bandpass')} // caixa acelerando
   if(b===6&&s===0){const g=audio.createGain(),src=audio.createBufferSource(),f=audio.createBiquadFilter(),dur=P*32;src.buffer=ruido();src.loop=true;f.type='bandpass';f.Q.value=2.5;f.frequency.setValueAtTime(400,t);f.frequency.exponentialRampToValueAtTime(9000,t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.03,t+dur);g.gain.setValueAtTime(.0001,t+dur+.01);src.connect(f);f.connect(g);g.connect(d);src.start(t);src.stop(t+dur+.02)} // riser
   if(b===7&&s===15)nota(d,mtof(81),t,P,{tipo:'sine',vol:.02,solta:.05});
   return}
  if(secao==='pausa'){
   if(s===0){ac.forEach(m=>nota(d,mtof(m+12),t,P*16,{tipo:'sine',vol:.012,ataque:.3,solta:.6}))}
   if(s%4===0)chiado(.004,9000,.03);
   if(ciclo===19&&s>=8)chiado(.008+(s-8)*.002,1800,.05,'bandpass');
   return}
  // DROP
  if(ciclo===0&&s===0){chiado(.05,600,1.2,'lowpass');bumbo(.12,.8)} // impacto na entrada do drop
  if(s%4===0)bumbo(.11);
  if(s===4||s===12)chiado(.03,1500,.12,'bandpass'); // palma/caixa
  if(s%2===1)chiado(.006,9000,.03);
  if(s%4===2){const fq=mtof(BAIXO[i]+12),o=audio.createOscillator(),g=audio.createGain(),f=audio.createBiquadFilter();o.type='sawtooth';o.frequency.value=fq;f.type='lowpass';f.Q.value=6;f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(2200,t+P*.8);f.frequency.exponentialRampToValueAtTime(260,t+P*1.8);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.045,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+P*1.9);o.connect(f);f.connect(g);g.connect(d);o.start(t);o.stop(t+P*2)} // baixo no contratempo
  if(s===0)nota(d,mtof(BAIXO[i]),t,P*3,{tipo:'sine',vol:.06,solta:.1}); // sub no tempo forte
  const RIFF=[0,2,1,2,0,2,1,0,0,2,1,2,2,1,0,1];
  if(s%2===0||ciclo>=8){const m=ac[RIFF[s]]+24+(ciclo>=8&&s%8===7?2:0);nota(d,mtof(m),t,P*.9,{tipo:'square',vol:.009,ataque:.004,solta:.08,filtro:3200})}
  if(ciclo>=8&&s===0)ac.forEach(m=>nota(d,mtof(m+12),t,P*15,{tipo:'sawtooth',vol:.005,ataque:.02,solta:.3,filtro:2400,detune:7}));
 }},
 /* ---- Caverna dos Glooc (DG nível 5, 2026-10-29, pedido do usuário) ----
    gloocCaverna: explorando — ré menor lenta: drone grave, tambor tribal distante com eco, kalimba pentatônica e gotas.
    gloocLuta: batalha — 140 bpm; uns 3 s devagar (bumbo espaçado, ruído subindo, caixa acelerando) e cai no drop: bumbo,
    palma, tambores tribais, baixo pulsando, metais e o riff agudo; a cada 8 compassos uma pausa curta e outro drop.
    gloocChefe: o chefe — 150 bpm; ~10 s sombrios (coro grave, batida de coração, ruído subindo, caixa acelerando) e o drop
    épico: impacto, bateria em tempo dobrado, rufos de tambor, metais em acordes, arpejo rápido e o coro por cima. */
 gloocCaverna:{passo:60/76/2,continua:true,toca(d,t,n,est){
  const P=60/76/2,s=n%16,bar=Math.floor(n/16)%8,ACORDES=[[50,57],[46,53],[48,55],[45,52],[50,57],[53,60],[46,53],[45,52]],ac=ACORDES[bar];
  if(bar%2===1&&s===0){const FRASE=[[69,0],[72,2],[74,4],[72,7],[69,10]];for(const [m,k] of FRASE)nota(d,mtof(m+(bar>=4?-2:0)),t+k*P,P*1.6,{tipo:'sine',vol:.016,ataque:.05,solta:.6,vibrato:.004})} /* frase da flauta a cada 2 compassos */
  if(s===0){nota(d,mtof(ac[0]-12),t,P*16,{tipo:'sawtooth',vol:.013,ataque:1.6,solta:2,filtro:300});nota(d,mtof(ac[1]-12),t,P*16,{tipo:'triangle',vol:.012,ataque:2,solta:2,detune:-5})}
  if(s===0||s===6||s===10){tomGlooc(d,t,.05,118);tomGlooc(d,t+.34,.014,118)} // tambor distante e o eco
  const PENTA=[62,65,67,69,72,74,77];
  if([2,5,8,13].includes(s)&&Math.random()<.6){est.k=Math.max(0,Math.min(6,(est.k??3)+Math.round((Math.random()-.5)*3)));const m=PENTA[est.k];nota(d,mtof(m),t,.04,{tipo:'triangle',vol:.02,solta:.9,filtro:2800});nota(d,mtof(m+12),t,.03,{tipo:'sine',vol:.006,solta:.6})}
  if(Math.random()<.06)nota(d,1400+Math.random()*900,t,.02,{tipo:'sine',vol:.01,solta:.25}); // gota
 }},
 gloocLuta:{passo:60/140/4,toca(d,t,n,est){
  const P=60/140/4,s=n%16,b=Math.floor(n/16),RAIZ=[38,34,36,33],ACORDES=[[62,65,69],[58,62,65],[60,64,67],[57,61,64]];
  if(b<2){ // começa devagar (~3 s)
   if(b===0&&s===0){ACORDES[0].forEach(m=>nota(d,mtof(m-12),t,P*32,{tipo:'sawtooth',vol:.008,ataque:2.4,solta:.4,filtro:1400}));riserGlooc(d,t,P*32,.028)}
   if(s===0||s===8)bumboGlooc(d,t,.08);
   if(b===1&&s===12)tomGlooc(d,t,.05,160);
   if(b===1){const k=s<8?2:1;if(s%k===0)chiadoGlooc(d,t,.008+s*.0012,1800,.06,'bandpass',n)}
   return}
  // ciclo de 20 compassos (~34 s): drop A (0–7), drop B com outros acordes (8–15), pausa (16–17) e subida (18–19)
  const c=(b-2)%20,i=c%4,B2=c>=8&&c<16,ac=B2?[[58,62,65],[60,64,67],[62,65,69],[57,61,64]][i]:ACORDES[i],raiz=B2?[34,36,38,33][i]:RAIZ[i];
  if(c===16||c===17){if(s===0)ac.forEach(m=>nota(d,mtof(m),t,P*16,{tipo:'sine',vol:.012,ataque:.2,solta:.5}));if(s%8===0)tomGlooc(d,t,.03,130);return} /* pausa */
  if(c>=18){if(c===18&&s===0)riserGlooc(d,t,P*32,.03);if(s%4===0)bumboGlooc(d,t,.07);const k=c===18?4:s<8?2:1;if(s%k===0)chiadoGlooc(d,t,.008+(c-18)*.01+s*.001,1800,.05,'bandpass',n);return} /* subindo para o próximo drop */
  if(c===0&&s===0){chiadoGlooc(d,t,.05,700,1.1,'lowpass',n);bumboGlooc(d,t,.13,.8)} // impacto do drop
  if(s%4===0||s===10)bumboGlooc(d,t,.11);
  if(s===4||s===12)chiadoGlooc(d,t,.032,1500,.12,'bandpass',n);
  if(s%2===1)chiadoGlooc(d,t,.006,9000,.03,'highpass',n);
  if([2,3,6,14].includes(s))tomGlooc(d,t,.035,[180,160,140,120][[2,3,6,14].indexOf(s)]);
  if(s%2===0){const m=raiz+(s%4===2?12:0),o=audio.createOscillator(),g=audio.createGain(),f=audio.createBiquadFilter();o.type='sawtooth';o.frequency.value=mtof(m);f.type='lowpass';f.Q.value=5;f.frequency.setValueAtTime(260,t);f.frequency.exponentialRampToValueAtTime(1800,t+P*.6);f.frequency.exponentialRampToValueAtTime(220,t+P*1.6);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.04,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+P*1.7);o.connect(f);f.connect(g);g.connect(d);o.start(t);o.stop(t+P*1.8)}
  if(c<4&&(s===0||s===6))ac.forEach(m=>nota(d,mtof(m-12),t,P*1.6,{tipo:'sawtooth',vol:.01,ataque:.005,solta:.12,filtro:1600})); // metais
  const RIFF=[0,2,1,0,2,1,0,2,1,0,2,1,2,1,0,1],PENTA=[62,65,67,69,72,74];
  if(c%8>=4&&(s%2===0||c%8>=6))nota(d,mtof(PENTA[(RIFF[s]+i*2+(B2?3:0))%6]+12+(B2?12:0)),t,P*.85,{tipo:'square',vol:.009,ataque:.004,solta:.07,filtro:3400});
 }},
 gloocChefe:{passo:60/150/4,toca(d,t,n,est){
  const P=60/150/4,s=n%16,b=Math.floor(n/16),RAIZ=[38,34,31,33],CORO=[[62,65,69],[58,62,65],[55,58,62],[57,61,64]];
  if(b<6){ // começo sombrio (~10 s)
   const ac=CORO[b%4];
   if(b===0&&s===0)nota(d,mtof(26),t,P*96,{tipo:'sawtooth',vol:.016,ataque:3,solta:1,filtro:220});
   if(s===0)ac.forEach((m,k)=>{nota(d,mtof(m-12),t,P*16,{tipo:'sine',vol:.016,ataque:1.2,solta:.8,vibrato:.004});nota(d,mtof(m-12),t,P*16,{tipo:'triangle',vol:.006,ataque:1.4,solta:.8,detune:k*6-6})});
   if(s===0||s===3)bumboGlooc(d,t,s?.05:.08,.7); // batida de coração
   if(b>=2&&s===8)tomGlooc(d,t,.04,100);
   if(b===4&&s===0)riserGlooc(d,t,P*32,.035);
   if(b===5){const k=s<8?2:1;if(s%k===0)chiadoGlooc(d,t,.01+s*.0016,1700,.06,'bandpass',n)}
   return}
  // ciclo de 24 compassos (~38 s): drop (0–15), ponte em meio-tempo com o coro (16–19) e a subida (20–23) de volta ao drop
  const c=(b-6)%24,i=c%4,ac=CORO[i],raiz=RAIZ[i];
  if(c>=16&&c<20){if(s===0){ac.forEach(m=>{nota(d,mtof(m),t,P*16,{tipo:'sine',vol:.016,ataque:.4,solta:.6,vibrato:.004});nota(d,mtof(m-12),t,P*16,{tipo:'triangle',vol:.008,ataque:.5,solta:.6})});bumboGlooc(d,t,.09,.7)}if(s===8)chiadoGlooc(d,t,.03,1200,.16,'bandpass',n);if(s===12||s===14)tomGlooc(d,t,.035,120);if(s%4===2)nota(d,mtof(ac[(s/4|0)%3]+12),t,P*1.8,{tipo:'triangle',vol:.012,solta:.3,filtro:2400});return} /* ponte */
  if(c>=20){if(c===20&&s===0)riserGlooc(d,t,P*64,.04);if(s===0||s===8)bumboGlooc(d,t,.08,.7);if(c>=22){const k=c===22?4:s<8?2:1;if(s%k===0)chiadoGlooc(d,t,.01+(c-22)*.012+s*.0012,1700,.06,'bandpass',n)}if(s===0)ac.forEach(m=>nota(d,mtof(m-12),t,P*16,{tipo:'sawtooth',vol:.007,ataque:1,solta:.4,filtro:700+(c-20)*500}));return} /* subida */
  if(c===0&&s===0){chiadoGlooc(d,t,.07,500,1.6,'lowpass',n);bumboGlooc(d,t,.15,.6);nota(d,48,t,.9,{tipo:'sine',vol:.08,solta:.6})} // impacto épico
  if(s%4===0||(c>=8&&s%2===0))bumboGlooc(d,t,.11);
  if(s===4||s===12){chiadoGlooc(d,t,.04,1200,.16,'bandpass',n);nota(d,200,t,.05,{tipo:'triangle',vol:.03,solta:.08})}
  if(s%2===1)chiadoGlooc(d,t,.005,9500,.03,'highpass',n);
  if(c%2===1&&s>=13)tomGlooc(d,t,.04,[170,140,115][s-13]); // rufo
  if(s===0||s===3||s===6)ac.forEach(m=>nota(d,mtof(m-12),t,P*(s===6?3:1.5),{tipo:'sawtooth',vol:.011,ataque:.004,solta:.15,filtro:1900})); // metais
  if(s===0)nota(d,mtof(raiz-12),t,P*4,{tipo:'sine',vol:.07,solta:.1});
  if(s%4===2)nota(d,mtof(raiz),t,P*1.5,{tipo:'sawtooth',vol:.02,solta:.08,filtro:900});
  nota(d,mtof(ac[s%3]+24+(s>=8?12:0)),t,P*.8,{tipo:'square',vol:.006,ataque:.003,solta:.05,filtro:3600}); // arpejo
  if(s===0)ac.forEach(m=>nota(d,mtof(m+12),t,P*16,{tipo:'sine',vol:.008,ataque:.3,solta:.5,vibrato:.004})); // coro
 }}, // taverna: as 5 músicas de js/musica-taverna.js, no compasso do relógio do jogo (todos os jogadores ouvem igual):
 // baixo, dedilhado de alaúde, melodia (rabeca/flauta), pandeiro e bumbo; aplauso entre as músicas
 tavern:{sincronizada:true,tocaPasso(d,t,info){
  const m=info.m,P=m.passos,k=info.passo,s=k%P,bar=Math.floor(k/P)%m.barras,pl=m.passo,forte=s===0||(P===8?s===4:s===3);
  if(forte)nota(d,mtof(m.baixo[bar]),t,pl*1.3,{tipo:'triangle',vol:.05,solta:.15});
  if(P===8?(s===2||s===6):(s===1||s===2||s===4||s===5))m.acorde[bar].forEach((q,i)=>nota(d,mtof(q+12),t+i*.018,pl*1.1,{tipo:'square',vol:.008,solta:.18,filtro:1700}));
  const n=m.notas[k%(m.barras*P)],ultima=Math.floor(k/(m.barras*P))===m.voltas-1;
  if(n){nota(d,mtof(n[0]),t,pl*n[1]*.92,{tipo:m.lead,vol:m.lead==='square'?.011:m.lead==='sine'?.03:.024,ataque:.015,solta:.14,filtro:m.lead==='square'?2400:3400,vibrato:m.vib});
   if(ultima)nota(d,mtof(n[0]-12+(n[0]%2?3:4)),t,pl*n[1]*.9,{tipo:'triangle',vol:.01,ataque:.02,solta:.12,filtro:2600})} // última volta: segunda voz
  if(s%2===1){const g=audio.createGain(),src=audio.createBufferSource(),f=audio.createBiquadFilter();src.buffer=ruido();f.type='highpass';f.frequency.value=6500;g.gain.setValueAtTime(.011,t);g.gain.exponentialRampToValueAtTime(.0001,t+.06);src.connect(f);f.connect(g);g.connect(d);src.start(t,(k*.137)%1.5,.07)}
  if(forte){const o=audio.createOscillator(),g=audio.createGain();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(48,t+.12);g.gain.setValueAtTime(.055,t);g.gain.exponentialRampToValueAtTime(.0001,t+.18);o.connect(g);g.connect(d);o.start(t);o.stop(t+.2)}
 },
 // aplauso e assobios curtos depois de cada música
 aplauso(d,t){for(let i=0;i<46;i++){const ti=t+Math.random()*2.6*Math.pow(Math.random(),.5),g=audio.createGain(),src=audio.createBufferSource(),f=audio.createBiquadFilter();src.buffer=ruido();f.type='bandpass';f.frequency.value=1400+Math.random()*1800;f.Q.value=1.2;const v=.01+Math.random()*.014;g.gain.setValueAtTime(v,ti);g.gain.exponentialRampToValueAtTime(.0001,ti+.05);src.connect(f);f.connect(g);g.connect(d);src.start(ti,Math.random(),.06)}
  const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(1900,t+.4);o.frequency.exponentialRampToValueAtTime(2700,t+.7);o.frequency.exponentialRampToValueAtTime(1800,t+1);g.gain.setValueAtTime(.0001,t+.4);g.gain.linearRampToValueAtTime(.012,t+.45);g.gain.exponentialRampToValueAtTime(.0001,t+1.05);o.connect(g);g.connect(d);o.start(t+.4);o.stop(t+1.1)}}
};
/* ---------- ambiente gerado ---------- */
// fundo contínuo (ruído filtrado) + eventos aleatórios (pássaros, goteiras, lareira...)
const AMBIENTES={
 world:{montar(d){
  // mar: ruído grave subindo e descendo devagar; vento: ruído médio bem baixo
  const mar=fundo(d,'lowpass',520,.7,.045);const lfo=audio.createOscillator(),lg=audio.createGain();lfo.frequency.value=.09;lg.gain.value=.03;lfo.connect(lg);lg.connect(mar.gain);lfo.start();
  const vento=fundo(d,'bandpass',900,.5,.008);return [mar,vento,{parar:()=>lfo.stop()}];
 },eventos:[[2.5,7,(d,t)=>{const n=2+Math.floor(Math.random()*3),f0=2200+Math.random()*1400;for(let i=0;i<n;i++){const o=audio.createOscillator(),g=audio.createGain(),ti=t+i*.11;o.type='sine';o.frequency.setValueAtTime(f0,ti);o.frequency.exponentialRampToValueAtTime(f0*1.35,ti+.05);o.frequency.exponentialRampToValueAtTime(f0*.9,ti+.09);g.gain.setValueAtTime(.0001,ti);g.gain.linearRampToValueAtTime(.014,ti+.01);g.gain.exponentialRampToValueAtTime(.0001,ti+.1);o.connect(g);g.connect(d);o.start(ti);o.stop(ti+.12)}}]]},
 // ilha à noite: mar mais baixo, vento leve, grilos (trilos agudos sem parar), coruja de vez em quando
 worldNoite:{montar(d){
  const mar=fundo(d,'lowpass',420,.7,.032);const lfo=audio.createOscillator(),lg=audio.createGain();lfo.frequency.value=.07;lg.gain.value=.02;lfo.connect(lg);lg.connect(mar.gain);lfo.start();
  const vento=fundo(d,'bandpass',700,.5,.006);return [mar,vento,{parar:()=>lfo.stop()}];
 },eventos:[[.25,.9,(d,t)=>{const f=4200+Math.random()*900,n=3+Math.floor(Math.random()*4),v=.004+Math.random()*.006;for(let i=0;i<n;i++){const o=audio.createOscillator(),g=audio.createGain(),ti=t+i*.045;o.type='sine';o.frequency.setValueAtTime(f,ti);g.gain.setValueAtTime(.0001,ti);g.gain.linearRampToValueAtTime(v,ti+.008);g.gain.exponentialRampToValueAtTime(.0001,ti+.035);o.connect(g);g.connect(d);o.start(ti);o.stop(ti+.05)}}],
  [9,22,(d,t)=>{for(const [k,f0,dur] of [[0,420,.32],[.45,400,.5]]){const o=audio.createOscillator(),g=audio.createGain(),ti=t+k;o.type='sine';o.frequency.setValueAtTime(f0,ti);o.frequency.exponentialRampToValueAtTime(f0*.86,ti+dur);g.gain.setValueAtTime(.0001,ti);g.gain.linearRampToValueAtTime(.022,ti+.05);g.gain.exponentialRampToValueAtTime(.0001,ti+dur);o.connect(g);g.connect(d);o.start(ti);o.stop(ti+dur+.02)}}]]}, dungeon:{montar(d){return [fundo(d,'lowpass',110,.7,.07),fundo(d,'bandpass',300,3,.004)]},
  eventos:[[1.2,4,(d,t)=>{const f=900+Math.random()*700;for(const [k,v] of [[0,.03],[.27,.01],[.5,.004]]){const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(f,t+k);o.frequency.exponentialRampToValueAtTime(f*.45,t+k+.07);g.gain.setValueAtTime(v,t+k);g.gain.exponentialRampToValueAtTime(.0001,t+k+.1);o.connect(g);g.connect(d);o.start(t+k);o.stop(t+k+.12)}}],
   [8,18,(d,t)=>{const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(70,t);o.frequency.exponentialRampToValueAtTime(40,t+1.4);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.03,t+.3);g.gain.exponentialRampToValueAtTime(.0001,t+1.5);o.connect(g);g.connect(d);o.start(t);o.stop(t+1.6)}]]},
 // Caverna dos Glooc: o ronco grave da caverna, gotas com eco e, de vez em quando, Glooc tagarelando lá longe
 cavernaGlooc:{montar(d){return [fundo(d,'lowpass',100,.7,.06),fundo(d,'bandpass',260,3,.004)]},
  eventos:[[1,3.5,(d,t)=>{const f=900+Math.random()*900;for(const [k,v] of [[0,.028],[.3,.009],[.55,.004]]){const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(f,t+k);o.frequency.exponentialRampToValueAtTime(f*.45,t+k+.07);g.gain.setValueAtTime(v,t+k);g.gain.exponentialRampToValueAtTime(.0001,t+k+.1);o.connect(g);g.connect(d);o.start(t+k);o.stop(t+k+.12)}}],
   [7,16,(d,t)=>{const n=3+Math.floor(Math.random()*4);for(let i=0;i<n;i++){const ti=t+i*(.09+Math.random()*.07),o=audio.createOscillator(),g=audio.createGain(),f=audio.createBiquadFilter(),f0=420+Math.random()*380;o.type='sawtooth';o.frequency.setValueAtTime(f0,ti);o.frequency.exponentialRampToValueAtTime(f0*(Math.random()<.5?1.4:.7),ti+.07);f.type='bandpass';f.frequency.value=1100;f.Q.value=4;g.gain.setValueAtTime(.0001,ti);g.gain.linearRampToValueAtTime(.006,ti+.01);g.gain.exponentialRampToValueAtTime(.0001,ti+.08);o.connect(f);f.connect(g);g.connect(d);o.start(ti);o.stop(ti+.1)}}],
   [9,20,(d,t)=>{const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(64,t);o.frequency.exponentialRampToValueAtTime(38,t+1.5);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.028,t+.3);g.gain.exponentialRampToValueAtTime(.0001,t+1.6);o.connect(g);g.connect(d);o.start(t);o.stop(t+1.7)}]]}, tavern:{montar(d){
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
const posMusica={};
function trocar(canal,cena){
 const a=ativos[canal];if(a&&a.cena===cena)return;
 if(a&&canal==='musica')posMusica[a.cena]={n:a.n,quando:performance.now()};
 if(a){const t=agora();a.saida.gain.cancelScheduledValues(t);a.saida.gain.setValueAtTime(a.saida.gain.value,t);a.saida.gain.linearRampToValueAtTime(0,t+1.4);a.parado=true;setTimeout(()=>{(a.nos||[]).forEach(n=>n.parar());try{a.saida.disconnect()}catch(e){}},1600);ativos[canal]=null}
 if(!cena)return;
 const saida=audio.createGain(),t=agora();saida.gain.setValueAtTime(0,t);saida.gain.linearRampToValueAtTime(1,t+2);saida.connect(bus[canal]);
 const volta=canal==='musica'&&TRILHAS[cena]&&TRILHAS[cena].continua&&posMusica[cena]&&performance.now()-posMusica[cena].quando<120000?posMusica[cena].n:0; /* música de exploração continua de onde parou ao voltar da luta */
 const novo={cena,saida,prox:t+.15,n:volta,est:{}};
 if(canal==='ambiente'){const amb=AMBIENTES[cena];novo.nos=amb.montar(saida);novo.timers=amb.eventos.map(([a,b])=>t+a+Math.random()*(b-a))}
 ativos[canal]=novo;
}
/* música sincronizada (taverna): o passo vem do relógio do jogo, não do contexto de áudio; base = relógio − tempo do áudio */
function tocarSincronizada(m,t){
 const tr=TRILHAS[m.cena],base=(window.TEMPO?TEMPO.agora():Date.now())/1000-t;
 if(m.proxG==null||m.proxG<t+base-1)m.proxG=t+base+.05;
 for(let guarda=0;m.proxG<t+base+.6&&guarda<64;guarda++){
  const info=MUSICA_TAVERNA.em(m.proxG);
  if(info.pausa){if(m.aplauso!==info.fimPausa){m.aplauso=info.fimPausa;try{tr.aplauso(m.saida,Math.max(t,m.proxG-base))}catch(e){}}m.proxG=info.fimPausa+.001;continue}
  const ta=info.inicio-base;
  if(ta>=t-.02&&info.inicio>(m.ultimo??-1)+1e-4){m.ultimo=info.inicio;try{tr.tocaPasso(m.saida,Math.max(t,ta),info)}catch(e){console.error('Música:',e)}m.n++}
  m.proxG=info.inicio+info.m.passo+1e-4}
}// agenda um pouco à frente (o setInterval do navegador não é preciso)
setInterval(()=>{
 if(!audio||audio.state!=='running')return;
 const t=agora(),m=ativos.musica;
 if(m&&!m.parado&&TRILHAS[m.cena].sincronizada){if(window.MUSICA_TAVERNA)tocarSincronizada(m,t)}
 else if(m&&!m.parado){const tr=TRILHAS[m.cena];if(m.prox<t-1)m.prox=t+.05;while(m.prox<t+1.2){ /* 1,2 s de antecedência: com o jogo pesado o intervalo atrasa e as notas saíam picotadas */try{tr.toca(m.saida,m.prox,m.n,m.est)}catch(e){console.error('Música:',e)}m.prox+=tr.passo;m.n++}}
 const a=ativos.ambiente;
 if(a&&!a.parado){const ev=AMBIENTES[a.cena].eventos;ev.forEach(([mn,mx,fn],i)=>{if(a.timers[i]<t-2)a.timers[i]=t+mn;while(a.timers[i]<t+.3){try{fn(a.saida,Math.max(t,a.timers[i]))}catch(e){}a.timers[i]+=mn+Math.random()*(mx-mn)}})}
},150);

/* ---------- sons do cenário (2026-10-28, pedido do usuário) ----------
   Fogueiras e lareira (estalos), árvores (folhas ao vento), chafarizes, fontes e o rio (água) tocam onde estão: o volume
   cresce quanto mais perto o herói chega ((1 - distância/alcance)², somando as fontes do mesmo tipo, até 1) e o som vem
   do lado em que a fonte está (pan estéreo). Um conjunto de nós por tipo, no canal Ambiente (volume nas Opções). */
const TIPOS_CENARIO={
 fogo:{R:150,montar(d){return [fundo(d,'lowpass',360,.7,.06),fundo(d,'bandpass',1100,.8,.012)]},
  eventos:[[.04,.16,(d,t)=>{const g=audio.createGain(),src=audio.createBufferSource(),f=audio.createBiquadFilter();src.buffer=ruido();f.type='highpass';f.frequency.value=1800+Math.random()*3500;const v=.015+Math.random()*.05;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.012+Math.random()*.03);src.connect(f);f.connect(g);g.connect(d);src.start(t,Math.random(),.06)}],
   [.6,2.2,(d,t)=>{const o=audio.createOscillator(),g=audio.createGain();o.frequency.setValueAtTime(140+Math.random()*60,t);o.frequency.exponentialRampToValueAtTime(50,t+.08);g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.0001,t+.1);o.connect(g);g.connect(d);o.start(t);o.stop(t+.12)}]]},
 arvore:{R:120,montar(d){const f=fundo(d,'bandpass',2600,.5,.022),l=audio.createOscillator(),lg=audio.createGain();l.frequency.value=.13;lg.gain.value=.016;l.connect(lg);lg.connect(f.gain);l.start();return [f,{parar:()=>{try{l.stop()}catch(e){}}}]},
  eventos:[[.3,1.4,(d,t)=>{const g=audio.createGain(),src=audio.createBufferSource(),f=audio.createBiquadFilter(),dur=.15+Math.random()*.35;src.buffer=ruido();f.type='bandpass';f.frequency.value=3000+Math.random()*2500;f.Q.value=.8;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.02+Math.random()*.02,t+dur*.4);g.gain.exponentialRampToValueAtTime(.0001,t+dur);src.connect(f);f.connect(g);g.connect(d);src.start(t,Math.random(),dur+.05)}]]},
 // caldeirão no fogo (cozinha dos Glooc): bolhas estourando devagar
 borbulha:{R:120,montar(d){return [fundo(d,'lowpass',240,.8,.03)]},
  eventos:[[.12,.45,(d,t)=>{const o=audio.createOscillator(),g=audio.createGain(),f0=180+Math.random()*260;o.type='sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f0*2.2,t+.06);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.03+Math.random()*.02,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+.08);o.connect(g);g.connect(d);o.start(t);o.stop(t+.09)}]]},
 // estalagmites: gotas pingando com eco
 goteira:{R:110,montar(d){return []},
  eventos:[[.8,2.6,(d,t)=>{const f=1500+Math.random()*900;for(const [k,v] of [[0,.035],[.22,.01]]){const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(f,t+k);o.frequency.exponentialRampToValueAtTime(f*.5,t+k+.06);g.gain.setValueAtTime(v,t+k);g.gain.exponentialRampToValueAtTime(.0001,t+k+.09);o.connect(g);g.connect(d);o.start(t+k);o.stop(t+k+.1)}}]]},
 agua:{R:160,montar(d){return [fundo(d,'bandpass',950,.6,.05),fundo(d,'highpass',4200,.5,.014)]},
  eventos:[[.05,.25,(d,t)=>{const o=audio.createOscillator(),g=audio.createGain(),f0=700+Math.random()*1500;o.type='sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f0*1.6,t+.04);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.012+Math.random()*.012,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+.05);o.connect(g);g.connect(d);o.start(t);o.stop(t+.06)}]]}
};
// tipo de som de um elemento de mapa (pelo id e pelo nome do tipo); peso: quanto ele soa (churrasqueira mais baixo)
function somDoElemento(type){
 const t=(type+' '+((window.MAP_ELEMENT_TYPES&&MAP_ELEMENT_TYPES[type]&&MAP_ELEMENT_TYPES[type].name)||'')).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
 if(/churrasq/.test(t))return['fogo',.5];
 if(/fogueir|fogo|braseir|tocha|lareir/.test(t))return['fogo',1];
 if(/chafariz|fonte|cachoeir|cascata|poco\b|lago|agua/.test(t))return['agua',1];
 if(/arvore|pinheir|palmeir|carvalho|salgueir|\btree/.test(t))return['arvore',1];
 return null}
// fontes de som perto do herói: [tipo, x, y, peso]
function fontesDoCenario(){
 const L=[],perto=(x,y,r)=>Math.abs(x-p.x)<r&&Math.abs(y-p.y)<r;
 if(window.inTaverna&&window.TAVERNA_LAYOUT){const T=TAVERNA_LAYOUT.L;L.push(['fogo',T.lareira.x,T.lareira.y+10,1]);for(const e of T.decor){const s=somDoElemento(e.type);if(s)L.push([s[0],e.x,e.y,s[1]])}return L}
 // DG: tochas, braseiros, fogueiras, lampiões e a churrasqueira (fogo), caldeirão (bolhas) e estalagmites (gotas)
 if(window.inDungeon){
  for(const t of window.dungeonTorches||[])if(perto(t.x,t.y,170))L.push(['fogo',t.x,t.y,.8]);
  for(const d of window.DUNGEON_DECORATIONS||[]){if(!d.el||!perto(d.x,d.y,170))continue;const nome=(d.el+' '+((window.PIXLIB&&PIXLIB[d.el]&&PIXLIB[d.el].name)||(window.PACOTE_MAPA&&PACOTE_MAPA.elementos[d.el]&&PACOTE_MAPA.elementos[d.el].name)||'')).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
   if(/caldeir/.test(nome))L.push(['borbulha',d.x,d.y,1],['fogo',d.x,d.y,.5]);else if(/churrasq/.test(nome))L.push(['fogo',d.x,d.y,.5]);else if(/fogueir|braseir|tocha|lampiao/.test(nome))L.push(['fogo',d.x,d.y,/lampiao/.test(nome)?.35:1]);else if(/estalagmite/.test(nome))L.push(['goteira',d.x,d.y,.5])}
  return L}
 if(window.inArena||window.inTutorial)return L;
 if(typeof CX!='undefined')L.push(['fogo',CX,CY,1]); // fogueira do acampamento
 if(typeof trees!='undefined')for(const t of (window.arvoresPerto?arvoresPerto(p.x,p.y,140):trees))if(perto(t.x,t.y,130))L.push(['arvore',t.x,t.y-10,.6]);
 if(typeof mapElements!='undefined')for(const e of mapElements)if(perto(e.x,e.y,170)){const s=somDoElemento(e.type);if(s)L.push([s[0],e.x,e.y,s[1]])}
 // rio: o ponto de água mais perto em volta do herói
 if(typeof inRiver=='function'){let melhor=null;for(const r of [0,24,48,72,100])for(let a=0;a<(r?12:1);a++){const x=p.x+Math.cos(a*Math.PI/6)*r,y=p.y+Math.sin(a*Math.PI/6)*r;if(inRiver(x,y)&&(!melhor||r<melhor.r))melhor={x,y,r}}if(melhor)L.push(['agua',melhor.x,melhor.y,.8])}
 return L}
const cenario={}; // tipo -> {g (volume), pan, nos, timers}
setInterval(()=>{
 if(!audio||!bus||audio.state!=='running'||!unlocked||typeof p=='undefined')return;
 const t=agora(),soma={},lado={},fontes=document.hidden?[]:fontesDoCenario();
 for(const [tipo,x,y,peso] of fontes){const R=TIPOS_CENARIO[tipo].R,d=Math.hypot(x-p.x,y-p.y);if(d>=R)continue;const w=peso*(1-d/R)**2;soma[tipo]=(soma[tipo]||0)+w;lado[tipo]=(lado[tipo]||0)+w*Math.max(-1,Math.min(1,(x-p.x)/(R*.6)))}
 for(const tipo in TIPOS_CENARIO){
  const alvo=Math.min(1,soma[tipo]||0),def=TIPOS_CENARIO[tipo];let c=cenario[tipo];
  if(!c&&alvo>.005){const g=audio.createGain(),pan=audio.createStereoPanner?audio.createStereoPanner():null;g.gain.value=0;if(pan){g.connect(pan);pan.connect(bus.ambiente)}else g.connect(bus.ambiente);
   c=cenario[tipo]={g,pan,nos:def.montar(g),timers:def.eventos.map(([a,b])=>t+a+Math.random()*(b-a))}}
  if(!c)continue;
  c.g.gain.setTargetAtTime(alvo,t,.25);if(c.pan&&alvo>0)c.pan.pan.setTargetAtTime(Math.max(-.85,Math.min(.85,(lado[tipo]||0)/Math.max(1e-6,soma[tipo]))),t,.25);
  // eventos (estalos, folhas, respingos) só com o som audível
  if(alvo>.02)def.eventos.forEach(([mn,mx,fn],i)=>{if(c.timers[i]<t-2)c.timers[i]=t+mn;while(c.timers[i]<t+.3){try{fn(c.g,Math.max(t,c.timers[i]))}catch(e){}c.timers[i]+=mn+Math.random()*(mx-mn)}});
  // longe de tudo por um tempo: desmonta os nós (economiza processamento)
  if(alvo<=.005){c.quieto=(c.quieto||0)+1;if(c.quieto>40){(c.nos||[]).forEach(n=>n.parar());try{c.g.disconnect()}catch(e){}delete cenario[tipo]}}else c.quieto=0;
 }
},150);
/* ---------- passos do herói (2026-10-28, pedido do usuário) ----------
   Um passo a cada ~18 px andados (mais rápido = mais passos), alternando pé esquerdo e direito, com o som do chão:
   madeira (taverna, pontes), pedra (DG, pátio do bar, arena) ou terra/grama (ilha). Canal Efeitos, bem baixo. */
let passoX=null,passoY=0,passoAnda=0,passoPe=0;
function chaoDoPasso(){
 if(window.inTaverna)return window.BAR&&BAR.dentro(p.x,p.y)?'pedra':'madeira';
 if(window.inDungeon||window.inArena)return 'pedra';
 if(typeof onBridge=='function'&&onBridge(p.x,p.y))return 'madeira';
 return 'terra'}
function tocarPasso(tipo){
 if(!audio||!bus)return;const t=agora(),pe=(passoPe^=1)?1:.92,src=audio.createBufferSource(),f=audio.createBiquadFilter(),g=audio.createGain();
 src.buffer=ruido();src.playbackRate.value=pe;
 if(tipo==='madeira'){f.type='bandpass';f.frequency.value=420*pe;f.Q.value=1.6;g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.0001,t+.07);
  const o=audio.createOscillator(),og=audio.createGain();o.frequency.setValueAtTime(150*pe,t);o.frequency.exponentialRampToValueAtTime(80,t+.06);og.gain.setValueAtTime(.025,t);og.gain.exponentialRampToValueAtTime(.0001,t+.07);o.connect(og);og.connect(bus.efeitos);o.start(t);o.stop(t+.08)}
 else if(tipo==='pedra'){f.type='highpass';f.frequency.value=1800*pe;g.gain.setValueAtTime(.03,t);g.gain.exponentialRampToValueAtTime(.0001,t+.045)}
 else{f.type='lowpass';f.frequency.value=900*pe;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.035,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+.11)}
 src.connect(f);f.connect(g);g.connect(bus.efeitos);src.start(t,Math.random()*1.2,.14)}
setInterval(()=>{
 if(!audio||!bus||audio.state!=='running'||typeof p=='undefined'||document.hidden)return;
 if(passoX===null){passoX=p.x;passoY=p.y;return}
 const d=Math.hypot(p.x-passoX,p.y-passoY);passoX=p.x;passoY=p.y;
 // teleporte (portal, entrar na taverna) não conta; parado, morto ou sentado não dá passo
 if(d>40||p.dead>0||(window.MESAS&&MESAS.sentado)){passoAnda=0;return}
 passoAnda+=d;if(passoAnda>=18){passoAnda=0;tocarPasso(chaoDoPasso())}
},50);
SOM.cenario=()=>Object.fromEntries(Object.entries(cenario).map(([k,c])=>[k,+c.g.gain.value.toFixed(3)]));
})();
