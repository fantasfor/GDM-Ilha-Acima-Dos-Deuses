/* constantes de cálculo (editáveis pelo GM na Enciclopédia > Cálculos) */
const CALC={hp0:140,hpPerF:5,mp0:35,mpPerI:5,armPerA:5,physPerF:3,magPerI:5,atkSpdPerA:.005,minInterval:.25,spdPerA:.005,move:62,regenPerF:.05,regenPerI:.05,camp:14,xpPerLevel:40,maxLevel:30,rankXp:100,monHp0:40,monHpPerF:5,dropChance:.22,qualExp:2.2,qualBase:.5,portalInterval:5,areaCap:5,portalLevelRange:10,portalLevelBonus:2,loseMul:2.5,loseMin:240,giveUp:10,monsterReset:10,islandMinMonsters:20};
const CALC_DEF={...CALC};
const ITEM_STATS={
 dmg:{label:'Dano',text:'dano'},
 physicalDmg:{label:'Dano físico',text:'dano físico'},
 magicDmg:{label:'Dano mágico',text:'dano mágico'},
 arm:{label:'Defesa física',text:'defesa física'},
 magicArm:{label:'Defesa mágica',text:'defesa mágica'},
 hp:{label:'Vida máxima',text:'vida máx.'},
 mp:{label:'Mana máxima',text:'mana máx.'},
 regenHp:{label:'Regeneração de vida (por segundo)',text:'vida/s',fractional:true},
 regenMp:{label:'Regeneração de mana (por segundo)',text:'mana/s',fractional:true},
 spd:{label:'Velocidade de movimento (%) — legado',text:'velocidade',percent:true},
 moveSpeed:{label:'Velocidade de movimento (%)',text:'movimento',percent:true},
 attackSpeed:{label:'Velocidade de ataque (%)',text:'velocidade de ataque',percent:true},
 castSpeed:{label:'Velocidade de conjuração (%)',text:'velocidade de conjuração',percent:true},
 area:{label:'Aumento de área (%)',text:'área',percent:true},
 cooldownReduction:{label:'Redução de recarga (%)',text:'redução de recarga',percent:true},
 critChance:{label:'Chance crítica (%)',text:'chance crítica',percent:true},
 critDamage:{label:'Dano crítico adicional (%)',text:'dano crítico adicional',percent:true},
 lifeSteal:{label:'Roubo de vida físico (%)',text:'roubo de vida físico',percent:true},
 magicLifeSteal:{label:'Roubo de vida mágico (%)',text:'roubo de vida mágico',percent:true},
 F:{label:'Força',text:'F'},
 A:{label:'Agilidade',text:'A'},
 I:{label:'Inteligência',text:'I'}
};
const ATTRIBUTE_KEYS=['physicalDmg','magicDmg','arm','magicArm','hp','mp','regenHp','regenMp','F','A','I','moveSpeed','attackSpeed','castSpeed','area','cooldownReduction','critChance','critDamage','lifeSteal','magicLifeSteal'];
const attributeValue=(stats,key)=>{const value=Number(stats&&stats[key])||0;return ITEM_STATS[key]?.percent?value/100:value};
const attributeText=stats=>ATTRIBUTE_KEYS.filter(k=>Number(stats?.[k])).map(k=>(stats[k]>0?'+':'')+stats[k]+(ITEM_STATS[k].percent?'%':'')+' '+ITEM_STATS[k].text).join(', ');
const itemStatValue=(k,v)=>{const s=ITEM_STATS[k];return Number((s.percent?v*100:v).toFixed(s.percent||s.fractional?2:0))+(s.percent?'%':'')};
const weaponTag=v=>{const tag=String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');return({machado:'machado_2mao',machado_2_mao:'machado_2mao',martelo:'martelo_2mao',martelo_2_mao:'martelo_2mao',espadao:'espada_grande'})[tag]||tag};
const weaponTags=it=>[...new Set([...(it?.tags||[]),it?.wt||it?.wtype].map(weaponTag).filter(Boolean))];
const skillWeaponAllowed=(skill,it)=>!skill.wt?.length||skill.wt.some(tag=>(it?weaponTags(it):['desarmado']).includes(weaponTag(tag)));
function weaponDamageRange(it){
 const present=v=>v!==''&&v!=null;
 if(!present(it.damageMin)&&!present(it.damageMax))return null;
 const min=Number(present(it.damageMin)?it.damageMin:it.damageMax),max=Number(present(it.damageMax)?it.damageMax:it.damageMin);
 if(!Number.isInteger(min)||!Number.isInteger(max)||min<0||max<min)throw new Error('Dano da arma: informe inteiros maiores ou iguais a zero, com máximo maior ou igual ao mínimo.');
 return{min,max};
}
const rollWeaponDamage=range=>range.min+Math.floor(Math.random()*(range.max-range.min+1));
function setp(o,path,v){const k=path.split('.');for(let i=0;i<k.length-1;i++){if(o[k[i]]==null||typeof o[k[i]]!='object')o[k[i]]=/^\d+$/.test(k[i+1])?[]:{};o=o[k[i]]}o[k[k.length-1]]=v}
const getp=(o,path)=>path.split('.').reduce((a,k)=>a==null?a:a[k],o);
/* ---------- Projeto (js/projeto.js, gravado pela Engine) ----------
   ?teste=1 → jogo rodando dentro da Engine (Play): usa o projeto ainda não salvo e um save temporário.
   ?motor=1 → runtime invisível da Engine: carrega os recursos para o editor desenhar a cena, sem jogo. */
const MODO=(()=>{const q=new URLSearchParams(location.search);return{teste:q.has('teste'),motor:q.has('motor'),dg:q.get('dg'),x:+q.get('x')||null,y:+q.get('y')||null}})();
window.MODO=MODO;
if(MODO.teste||MODO.motor){try{const injected=parent!==window&&parent.ENGINE&&parent.ENGINE.projetoParaRuntime();if(injected)window.PROJETO=JSON.parse(injected)}catch(e){console.warn('A Engine não enviou o projeto; usando js/projeto.js.',e)}}
const PROJETO=window.PROJETO||{};
const GAMEDATA=Object.assign({classes:[],items:[],skills:[],passives:[],monsters:[],effects:[]},PROJETO.dados);
const PROJ={calc:PROJETO.mundo?.calc||{},map:{trees:PROJETO.mundo?.arvores,elements:PROJETO.mundo?.elementos},portalDefs:PROJETO.mundo?.portais,spawns:PROJETO.mundo?.spawns,
 art:PROJETO.artes||{},mapArt:PROJETO.artesMapa||{},pixel:PROJETO.biblioteca||{},audio:PROJETO.sons||{}};
Object.assign(CALC,PROJ.calc);
const T=16,N=64,W=N*T,CX=W/2,CY=W/2;
const cv=document.getElementById('g'),ctx=cv.getContext('2d'),$=id=>document.getElementById(id);
let S=3;
let ZM=1;function setZoom(z){ZM=Math.max(.6,Math.min(2.4,Math.round(z*20)/20));rs()}
function rs(){cv.width=innerWidth;cv.height=innerHeight;S=Math.max(1.5,2*Math.round(innerHeight/540))*ZM;}
addEventListener('resize',rs);rs();
const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)};
const rnd=(a,b)=>a+Math.random()*(b-a);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function spr(rows,pal){const c=document.createElement('canvas');c.width=rows[0].length;c.height=rows.length;const x=c.getContext('2d');rows.forEach((r,j)=>[...r].forEach((ch,i)=>{if(pal[ch]){x.fillStyle=pal[ch];x.fillRect(i,j,1,1)}}));return c}
