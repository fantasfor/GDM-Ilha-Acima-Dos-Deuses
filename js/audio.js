/* Sons do jogo: efeitos sintetizados, arquivos existentes e sons configurados na Engine (projeto.sons). */
(function(){
const AudioCtor=window.AudioContext||window.webkitAudioContext;
let audio=null,noiseBuffer=null;
const clips=new Map(),loops=new Map();
let unlocked=false,lastScene='';
const settings=()=>PROJ.audio||{};
function playClip(config,loop=false){
 if(!config||!config.src)return null;
 const key=config.src;
 let clip=clips.get(key);
 if(!clip){
  clip=new window.Audio(key);clip.preload='auto';
  clip.addEventListener('error',()=>console.error('Não foi possível carregar o áudio:',config.name||key.slice(0,120)));
  clips.set(key,clip)
 }
 const voice=loop||!clip.paused?clip.cloneNode():clip;
 if(voice!==clip)voice.addEventListener('error',()=>console.error('Não foi possível carregar o áudio:',config.name||key.slice(0,120)));
 voice.volume=Math.max(0,Math.min(1,Number.isFinite(+config.volume)?+config.volume:.5));voice.loop=loop;
 if(!loop&&voice.readyState>0)voice.currentTime=0;
 voice.play().catch(error=>console.error('Não foi possível reproduzir o áudio '+(config.name||'configurado')+':',error));
 return voice
}
window.previewGameAudio=config=>playClip(config);
window.playEntitySound=(category,id,event)=>{
 const entry=(typeof GAMEDATA!=='undefined'&&GAMEDATA[category]||[]).find(d=>d.id==id);
 const config=entry&&entry.sounds&&entry.sounds[event];
 if(config&&config.src){playClip(config);return true}
 return false
};
function refreshLoops(){
 const scene=window.inDungeon?'dungeon':'world';
 const config=settings();
 for(const kind of ['music','ambient']){
  const key=scene+'.'+kind,sound=config[key],current=loops.get(kind);
  const src=unlocked&&!document.hidden&&sound&&sound.src;
  if(current&&(current.src!==src||scene!==lastScene)){current.voice.pause();loops.delete(kind)}
  if(src&&!loops.has(kind)){const voice=playClip(sound,true);loops.set(kind,{src,voice})}
  else if(src&&loops.has(kind))loops.get(kind).voice.volume=Math.max(0,Math.min(1,+sound.volume||0));
 }
 lastScene=scene
}
window.refreshGameAudio=refreshLoops;
setInterval(refreshLoops,500);
document.addEventListener('visibilitychange',refreshLoops);
const swordClips=['espada1.mp3','espada2.mp3'].map(file=>{
 const clip=new window.Audio('assets/audio/'+file);
 clip.preload='auto';clip.volume=.72;
 clip.addEventListener('error',()=>console.error('Não foi possível carregar o som de espada:',clip.src));
 return clip
});
function unlock(){
 unlocked=true;refreshLoops();
 if(!AudioCtor)return;
 audio=audio||new AudioCtor();
 if(audio.state=='suspended')audio.resume().catch(error=>console.error('Não foi possível iniciar o áudio do jogo:',error));
}
document.addEventListener('pointerdown',unlock,{once:true,capture:true});
document.addEventListener('keydown',unlock,{once:true,capture:true});
function tone(startFreq,endFreq,duration,type='triangle',volume=.035,delay=0){
 const start=audio.currentTime+delay,osc=audio.createOscillator(),gain=audio.createGain();
 osc.type=type;osc.frequency.setValueAtTime(startFreq,start);
 osc.frequency.exponentialRampToValueAtTime(Math.max(1,endFreq),start+duration);
 gain.gain.setValueAtTime(.0001,start);gain.gain.linearRampToValueAtTime(volume,start+.006);
 gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
 osc.connect(gain);gain.connect(audio.destination);osc.start(start);osc.stop(start+duration+.01)
}
function noise(duration,volume,cutoff,delay=0,filterType='lowpass',endCutoff=cutoff,q=0.7){
 if(!noiseBuffer){
  noiseBuffer=audio.createBuffer(1,audio.sampleRate, audio.sampleRate);
  const samples=noiseBuffer.getChannelData(0);
  for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1
 }
 const start=audio.currentTime+delay,source=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain();
 source.buffer=noiseBuffer;filter.type=filterType;filter.Q.setValueAtTime(q,start);filter.frequency.setValueAtTime(cutoff,start);
 filter.frequency.exponentialRampToValueAtTime(Math.max(1,endCutoff),start+duration);
 gain.gain.setValueAtTime(.0001,start);gain.gain.linearRampToValueAtTime(volume,start+.008);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
 source.connect(filter);filter.connect(gain);gain.connect(audio.destination);
 source.start(start,Math.random()*Math.max(0,noiseBuffer.duration-duration),duration)
}
function playSword(){
 const clip=swordClips[Math.floor(Math.random()*swordClips.length)];
 const voice=clip.paused?clip:clip.cloneNode();
 voice.volume=clip.volume;
 if(voice.readyState>0)voice.currentTime=0;
 const playback=voice.play();
 if(playback)playback.catch(error=>console.error('Não foi possível reproduzir o som de espada:',error))
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
 defeat:()=>{tone(330,196,.28,'sine',.018);tone(164,98,.32,'sine',.009,.06)}
};
window.playGameSound=function(name){
 const config=settings();
 if(config[name]&&config[name].src){playClip(config[name]);return}
 if(name=='sword'){playSword();return}
 if(!AudioCtor)return;
 const play=sounds[name];
 if(!play)return;
 audio=audio||new AudioCtor();
 if(audio.state=='suspended')audio.resume().then(play).catch(error=>console.error('Não foi possível iniciar o áudio do jogo:',error));
 else play()
};
})();
