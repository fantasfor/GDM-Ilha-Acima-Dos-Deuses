/* ---------- HUD ---------- */
{
 const dialogue=$('dialogue');
 const addDialogueClose=()=>{
  if(!dialogue.classList.contains('open')||dialogue.querySelector('.dialogueClose')||!dialogue.childElementCount)return;
  const close=document.createElement('button');close.type='button';close.className='dialogueClose';close.dataset.closeDialog='';close.setAttribute('aria-label','Fechar janela');close.title='Fechar';close.textContent='×';dialogue.prepend(close)
 };
 new MutationObserver(addDialogueClose).observe(dialogue,{attributes:true,attributeFilter:['class'],childList:true});
 addDialogueClose()
}
const BAG=spr(["....kkkk....","...kbbbbk...","..kbbbbbbk..",".kbbbbbbbbk.",".kbbyyyybbk.",".kbbyyyybbk.",".kbbbbbbbbk.",".kbkkkkkkbk.",".kbbbbbbbbk.",".kbbbbbbbbk.","..kbbbbbbk..","...kkkkkk..."],{b:'#b5722e',y:'#e8c15a',k:'#3a2410'});
$('bag').style.backgroundImage='url('+BAG.toDataURL()+')';
const pt=$('pt').getContext('2d');pt.imageSmoothingEnabled=false;
const qi=q=>q<20?0:q<45?1:q<70?2:q<90?3:q<100?4:5,QCOL=['#9a9a9a','#f0f0f0','#4fd860','#4f9af0','#c060f0','#ffb830'],qc=o=>o&&o.q!=null?' q'+qi(o.q):'';
function setPortrait(){applySkills();bs.style.backgroundImage='url('+basic().ic+')'}
function drawPortrait(){const W=96,H=80,g=pt.createLinearGradient(0,0,0,H);g.addColorStop(0,'#27405f');g.addColorStop(1,'#16233a');pt.fillStyle=g;pt.fillRect(0,0,W,H);
 pt.fillStyle='#0a1220';pt.fillRect(0,H-8,W,8);pt.fillStyle='#1e2d46';pt.fillRect(0,H-8,W,1);
 const mv=time-(p.mvAt||-9)<.2,ph=mv?[1,0,2,0][Math.floor(time*8)%4]:0,atk=p.aw>0?Math.min(3,1+Math.floor((1-p.aw/.25)*3)):0,
  br=Math.sin(time*2.5),bob=mv?-(Math.floor(time*8)%2)*2:0,h=Math.round(72+br*1.5),w=Math.round(63-br*.8);
 const hi=heroImg('d',{ph,sw:atk});
 pt.drawImage(hi,11,2,18,16,Math.round((W-w*18/14)/2),H-4-h+bob,Math.round(w*18/14),h)}
const INV_CATEGORIES=[['all','Todos'],['consumables','Consumíveis'],['materials','Materiais'],['sw','Armas'],['he','Capacete'],['ch','Peito'],['le','Calça'],['bo','Bota'],['ca','Capa'],['ne','Colar'],['ri','Anel']];
const INV_CATEGORY_ICONS={
 materials:woodIcon(),
 all:spr(["....kkkk....","...kbbbbk...","..kbbbybbbk.",".kbbbbbbbbk.",".kbbbyybbbk.",".kbbbbbbbbk.",".kbbbbbbbbk.",".kbkkkkkkbk.",".kbbbbbbbbk.","..kbbbbbbk..","...kkkkkk...","............"],{b:'#b5722e',y:'#e8c15a',k:'#3a2410'}),
 consumables:spr(["....wwww....","....wwww....",".....kk.....","....krrk....","...krrrrk...","...krrrrk...","...krrrrk...","...krrrrk...","...krrrrk...","....krrk....",".....kk.....","............"],{w:'#d8ecff',k:'#5a3522',r:'#d83a45'}),
 sw:spr(["..........ss",".........sss","........sss.",".......sss..","......sss...",".....sss....","....sss.....","...sss......","..sss.......",".sss........","sssssssss...","...kk......."],{s:'#d7e1eb',k:'#a87538'}),
 he:spr(["....kkkk....","...kssssk...","..kssssssk..",".kssssssssk.",".kssssssssk.",".kssskksssk.",".kkk..kkk...","............"],{k:'#263444',s:'#bdcbd7'}),
 ch:spr(["..kkkkkkkk..",".kssssssssk.","kswwsssswwsk","kswwsssswwsk","kswwsssswwsk",".kssssssssk.",".kssskksssk.",".kssskksssk.","..kkkkkkkk.."],{k:'#243243',s:'#9aaec1',w:'#dbe8f2'}),
 le:spr(["..kkkkkkkk..",".kssssssssk.",".kssskksssk.",".kssskksssk.",".kssskksssk.",".kssskksssk.",".kkk..kkk...","............"],{k:'#34261c',s:'#9d7546'}),
 bo:spr(["..kk....kk..","..ks....sk..","..ks....sk..",".kss....ssk.",".ksssssssssk",".kkkkkkkkkk.","............"],{k:'#34261c',s:'#b07c48'}),
 ca:spr(["...kkkkkk...","..kssssssk..",".kssssssssk.",".kssssssssk.",".kssssssssk.","..kssssssk..","...kssssk...","....kkkk...."],{k:'#322223',s:'#b7404d'}),
 ne:spr(["...kk..kk...","...ks..sk...","....kssk....",".....kk.....",".....yy.....",".....yy.....",".....kk.....","............"],{k:'#704d1b',s:'#e1bb61',y:'#f3df82'}),
 ri:spr(["....kkkk....","..kk....kk..",".k..yyyy..k.","k..yy..yy..k","k..yy..yy..k",".k..yyyy..k.","..kk....kk..","....kkkk...."],{k:'#745018',y:'#e7bf4c'})
};
let invOpen=false,invCategory='all',invEquipSlot=null;function togInv(){invOpen=!invOpen;$('invp').style.display=invOpen?'flex':'none';if(window.dp)dp.classList.toggle('shift',invOpen)}
$('bag').onclick=e=>{e.stopPropagation();togInv()};
INV_CATEGORIES.forEach(([id,label])=>{const button=document.createElement('button');button.type='button';button.className='invCategory';button.setAttribute('aria-pressed',id=='all'?'true':'false');button.setAttribute('aria-label',label);button.title=label;button.dataset.category=id;const icon=document.createElement('img');icon.src=INV_CATEGORY_ICONS[id].toDataURL();icon.alt='';icon.setAttribute('aria-hidden','true');button.appendChild(icon);button.onclick=e=>{e.stopPropagation();invCategory=id;invEquipSlot=null;renderInv()};$('invCategories').appendChild(button)});
const bs=document.createElement('div');bs.className='sk bs';bs.innerHTML='<u></u><span></span>';const basicModeButton=document.createElement('button');basicModeButton.type='button';basicModeButton.className='basicModeButton';basicModeButton.onclick=e=>{e.stopPropagation();cycleBasicMode()};bs.appendChild(basicModeButton);bs._tip=basicTip;$('sks').appendChild(bs);
let shownBasicMode='',shownBasicIcon='';function refreshBasicMode(){const labels={sw:'M1',sh:'M2',alternate:'REV',distance:'M/R'},mode=p.basicMode||'sw';if(mode!=shownBasicMode){basicModeButton.textContent=labels[mode]||'M1';basicModeButton.title='Ataque básico: '+BASIC_MODE_LABEL[mode]+' — clique para alternar';basicModeButton.setAttribute('aria-label',basicModeButton.title);shownBasicMode=mode}const icon='url('+basic().ic+')';if(icon!=shownBasicIcon){bs.style.backgroundImage=icon;shownBasicIcon=icon}}
window.refreshBasicMode=refreshBasicMode;refreshBasicMode();
SK.forEach((s,i)=>{const d=document.createElement('div');d.className='sk'+(s.w?' wk':'');d.style.backgroundImage='url('+s.ic+')';d._tip=()=>skTip(s);d.innerHTML=(i<6?'<button class="skillSelect" type="button" aria-label="Selecionar habilidade do slot '+s.k.toUpperCase()+'">↑</button>':'')+'<b>'+s.k.toUpperCase()+'</b><em>'+s.mana+'</em><u></u><span></span>';d.onclick=e=>{e.stopPropagation();cast(s)};const select=d.querySelector('.skillSelect');if(select){select.dataset.skillSlot=i;select.onclick=e=>{e.stopPropagation();openSkillPicker(i,select)}}$('sks').appendChild(d);s.el=d;s.u=d.querySelector('u');s.cn=d.querySelector('span')});
const skTip=s=>'<b>'+s.n+'</b>'+(s.k?' <span class=tk>['+s.k.toUpperCase()+']</span>':'')+(s.w?'<div class=tw>Habilidade da arma</div>':'')+'<div>'+s.d()+'</div><div class=tm>Mana: '+s.mana+' • Recarga: '+s.cd+'s</div>'+(s.wt&&s.wt.length?'<div class=tm>Exige uma tag de arma: '+s.wt.join(', ')+'</div>':'')+(s.rank?'<div class=tm>Libera no rank '+s.rank+' da classe dona</div>':'');
const skillPanel=$('skillPanel');
function renderSkillMenu(){
 if(!skillPanel)return;
 const progress=(p.classProgress&&p.classProgress[p.cls])||{rank:0,xp:0},rank=progress.rank||0,need=rank>=10?0:rank*CALC.rankXp;
 skillPanel.innerHTML='';const head=document.createElement('div');head.className='skillHead';
 const title=document.createElement('strong');title.textContent='Habilidades — '+CL[p.cls].n;
 const close=document.createElement('button');close.type='button';close.textContent='×';close.onclick=()=>skillPanel.classList.remove('open');
 const status=document.createElement('div');status.className='skillProgress';status.textContent='Personagem Nv '+p.lvl+'/30 · Rank da classe '+rank+'/10'+(need?' · XP de classe '+progress.xp+'/'+need:' · Rank máximo');
 head.append(title,close);skillPanel.append(head,status);
 const own=document.createElement('h4');own.textContent='Árvore de habilidades da classe';skillPanel.appendChild(own);
 const entries=skillEntries(p.cls);
 const tree=document.createElement('div');tree.className='skillTree';
 entries.forEach((s,index)=>{const node=document.createElement('button');node.type='button';node.className='skillTreeNode'+(s.rank<=rank?' unlocked':' locked');node._tip=()=>skTip(s)+'<div class=tm>'+(s.rank<=rank?'Desbloqueada':'Libera no rank '+s.rank)+'</div>';
  const icon=document.createElement('img');icon.src=s.ic;icon.alt='';const name=document.createElement('span');name.textContent=s.n;node.append(icon,name);tree.appendChild(node);
  if(index<entries.length-1){const link=document.createElement('div');link.className='skillTreeLink';tree.appendChild(link)}
 });
 skillPanel.appendChild(tree);
 const crosses=document.createElement('div');crosses.className='skillCross';
 const ch=document.createElement('h4');ch.textContent='Habilidades cross disponíveis';crosses.appendChild(ch);
 const crossGrid=document.createElement('div');crossGrid.className='crossGrid';
 const known=availableCrossSkills().filter(s=>s.owner!=p.cls);
 if(!known.length){const none=document.createElement('div');none.className='skillEmpty';none.textContent='Nenhuma habilidade cross desbloqueada.';crossGrid.appendChild(none)}
 known.forEach(s=>{const node=document.createElement('div');node.className='crossNode';node._tip=()=>skTip(s)+'<div class=tm>Classe de origem: '+CL[s.owner].n+'</div>';
  const icon=document.createElement('img');icon.src=s.ic;icon.alt='';const name=document.createElement('span');name.textContent=s.n;const source=document.createElement('small');source.textContent=CL[s.owner].n;node.append(icon,name,source);crossGrid.appendChild(node)});
 crosses.appendChild(crossGrid);
 skillPanel.appendChild(crosses);
 const hint=document.createElement('div');hint.className='skillHint';hint.textContent='Passe o mouse para ver os detalhes. As habilidades cross desbloqueadas podem ser escolhidas pela seta acima dos slots.';skillPanel.appendChild(hint);
}
const skillPicker=document.createElement('div');skillPicker.id='skillPicker';document.body.appendChild(skillPicker);
let skillPickerSlot=-1;
function closeSkillPicker(){skillPicker.classList.remove('open');skillPickerSlot=-1}
function openSkillPicker(index,button){
 if(inCombat()){ft(p.x,p.y-24,'Troca de habilidade só fora de combate','#e8bd3e');return}
 if(SK[index]&&SK[index].t>0){ft(p.x,p.y-24,'Aguarde a habilidade terminar a recarga','#e8bd3e');return}
 if(skillPickerSlot===index&&skillPicker.classList.contains('open')){closeSkillPicker();return}
 const options=classSlotOptions(index);if(!options.length)return;
 skillPickerSlot=index;skillPicker.innerHTML='';skillPicker.setAttribute('aria-label','Escolha uma habilidade para o espaço '+SK[index].k.toUpperCase());
 const selected=p.skillSlots&&p.skillSlots[p.cls]&&p.skillSlots[p.cls][index]||skillEntries(p.cls)[index]?.id;
 options.forEach(s=>{const option=document.createElement('button');option.type='button';option.className='pickerOption'+(s.id===selected?' selected':'');option.setAttribute('aria-label',s.n+' — '+CL[s.owner].n);option._tip=()=>skTip(s)+'<div class=tm>Classe: '+CL[s.owner].n+(s.cross?' • habilidade cross':'')+'</div>';
  const icon=document.createElement('img');icon.src=s.ic;icon.alt='';option.append(icon);
  option.onclick=e=>{e.stopPropagation();selectSkillSlot(index,s.id);closeSkillPicker()};skillPicker.appendChild(option)});
 skillPicker.classList.add('open');
 const rect=button.getBoundingClientRect(),height=skillPicker.offsetHeight;let top=rect.top-height-6;
 if(top<4)top=rect.bottom+6;
 skillPicker.style.left=Math.max(4,Math.min(innerWidth-skillPicker.offsetWidth-4,rect.left+rect.width/2-skillPicker.offsetWidth/2))+'px';
 skillPicker.style.top=Math.max(4,Math.min(innerHeight-height-4,top))+'px';
}
document.addEventListener('pointerdown',e=>{if(skillPicker.classList.contains('open')&&!skillPicker.contains(e.target)&&!e.target.closest('.skillSelect'))closeSkillPicker()});
addEventListener('keydown',e=>{if(e.key=='Escape')closeSkillPicker()});
$('skillBtn').onclick=()=>{skillPanel.classList.toggle('open');if(skillPanel.classList.contains('open'))renderSkillMenu()};
addEventListener('keydown',e=>{if(TECLAS.acao(e)=='painel_hab'){$('skillBtn').click()}});
/* ---------- Missões (cadeia principal dos NPCs) ---------- */
const QUEST_STEPS=[
 {k:'questDone',n:'Derrotar o Guardião Esqueleto',who:'Principal'},
 {k:'carpenterHelped',n:'Levar o carpinteiro ao acampamento',who:'Carpinteiro'},
 {k:'sawQuestActive',n:'Aceitar a missão do serrote',who:'Carpinteiro'},
 {k:'sawObtained',n:'Recuperar o serrote do Goblin',who:'Carpinteiro'},
 {k:'woodQuestActive',n:'Aceitar a missão das 20 madeiras',who:'Carpinteiro'},
 {k:'wallBuilt',n:'Construir a paliçada do acampamento',who:'Carpinteiro'},
 {k:'magicWoodQuestActive',n:'Aceitar a missão das 10 madeiras mágicas',who:'Carpinteiro'},
 {k:'campPortalBuilt',n:'Construir o portal do acampamento',who:'Carpinteiro'},
 {k:'blacksmithSaved',n:'Resgatar o ferreiro no Covil dos Goblins',who:'Ferreiro'}
];
const questFlags=()=>[questDone,carpenterHelped,sawQuestActive,sawObtained,woodQuestActive,wallBuilt,magicWoodQuestActive,campPortalBuilt,blacksmithSaved];
const questStage=()=>{const f=questFlags();let n=0;while(n<f.length&&f[n])n++;return n};
function setQuestStage(n){
 if(window.inDungeon&&window.exitDungeon)exitDungeon(true);
 const on=i=>n>i;
 questDone=on(0);carpenterHelped=on(1);sawQuestActive=on(2);sawObtained=on(3);woodQuestActive=on(4);wallBuilt=on(5);magicWoodQuestActive=on(6);campPortalBuilt=on(7);blacksmithSaved=on(8);window.blacksmithSaved=blacksmithSaved;
 campPortalTheme=campPortalBuilt?'goblin':'normal';window.campPortalTheme=campPortalTheme;
 for(let i=drops.length-1;i>=0;i--)if(drops[i].questReward)drops.splice(i,1);
 const hasSaw=I.some(s=>s&&s.id=='saw')||Object.values(EQ).some(s=>s&&s.id=='saw');
 if(sawObtained&&!hasSaw&&ITEMS.saw)addItem('saw');
 if(!sawObtained){I.forEach((s,i)=>{if(s&&s.id=='saw')I[i]=null});for(const k in EQ)if(EQ[k]&&EQ[k].id=='saw')EQ[k]=null}
 if(!wallBuilt)CAMP_WALL.gateOpen=true;
 // recarrega para aplicar chefe, carpinteiro, paliçada, portal e ferreiro a partir do save
 saveGame();window._noSave=true;sessionStorage.setItem('ilha-skip','1');location.reload()
}
/* Ganchos usados pelas ferramentas de teste da Engine (somente no Play da Engine; o jogo normal não tem trapaças). */
if(MODO.teste)window.TESTE={
 estado:()=>({classe:p.cls,nivel:p.lvl,rank:(p.classProgress&&p.classProgress[p.cls]||{rank:1}).rank,ouro:p.gold,vida:Math.round(p.hp),missao:questStage(),dg:!!window.inDungeon,x:Math.round(p.x),y:Math.round(p.y)}),
 missoes:()=>QUEST_STEPS.map(s=>s.n),
 itens:()=>Object.keys(ITEMS).map(id=>[id,ITEMS[id].n.split(' (')[0]]),
 monstros:()=>Object.keys(MONSTER_TYPES).map(id=>[id,MONSTER_TYPES[id].name||id]),
 missao:n=>{if(n!==questStage())setQuestStage(Math.max(0,Math.min(QUEST_STEPS.length,n)))},
 xp:n=>gainPlayerXp(n),
 nivel:()=>{if(p.lvl<CALC.maxLevel)gainPlayerXp(p.lvl*CALC.xpPerLevel-p.xp)},
 rank:()=>{const r=p.classProgress[p.cls]||(p.classProgress[p.cls]={rank:1,xp:0});r.rank=Math.min(10,r.rank+1);if(r.rank>=10)r.xp=0;applySkills();renderSkillMenu()},
 classe:id=>{if(CL[id])setClass(id)},
 curar:()=>{p.hp=mhp();p.mp=mmp()},
 recargas:()=>SK.forEach(s=>s.t=0),
 ouro:n=>{p.gold+=n},
 item:(id,q)=>{const ok=addItem(id,q);dirtyInv=true;return ok},
 todosItens:()=>{for(const id of Object.keys(ITEMS))addItem(id);dirtyInv=true},
 invocar:id=>{
  const template=MONSTER_TYPES[id],base=MB[id]&&MB[id].base||'sl',stats=MB[id]||MB.sl;if(!template||!SP[base])return false;
  let point=null;
  for(let radius=45;radius<=190&&!point;radius+=15)for(let attempt=0;attempt<32&&!point;attempt++){const a=Math.random()*Math.PI*2,x=p.x+Math.cos(a)*radius,y=p.y+Math.sin(a)*radius;if(walk(x,y)&&!insideCamp(x,y,8))point={x,y}}
  if(!point)return false;
  const e={boss:false,img:SP[base].d,sp:SP[base],max:stats.max,dmg:stats.dmg,spd:stats.spd,xp:stats.xp,g:stats.g,aggro:stats.aggro,wu:stats.wu,ac:stats.ac};
  configureMonster(e,id,Math.max(1,p.lvl));Object.assign(e,{x:point.x,y:point.y,hx:point.x,hy:point.y,hp:e.max,fx:0,fy:1,aw:0,cd:0,hit:0,rt:0,dest:null,path:[],pathI:0,pathKey:'',roamT:5,roamRadius:60,chasing:false});
  en.push(e);insp=e;p.tgt=e;ring(e.x,e.y,24,'#d8b66b',.4);return true
 },
 derrotarAlvo:()=>{if(p.tgt&&p.tgt.hp>0){const t=p.tgt,b=t.boss;t.boss=false;hurtE(t,1e9,true);t.boss=b;return true}return false},
 acampamento:()=>{p.x=CX;p.y=CY+34;p.dest=null;p.path=[];p.pathKey='';p.npcT=null;p.tgt=null;p.aw=0;p.wt=null;p.attackBasic=null},
 teleportar:(x,y)=>{if(!window.inDungeon&&walk(x,y)){p.x=x;p.y=y;p.dest=null;p.path=[];p.tgt=null;return true}return false},
 entrarDG:id=>{if(window.inDungeon&&window.exitDungeon)exitDungeon(true);window.currentDungeonId=id;window.enterGoblinDungeon&&enterGoblinDungeon()},
 sairDG:()=>{if(window.inDungeon)exitDungeon(true)}
};
function compareEquipment(id,q,preferredSlot){
 const type=gearType[id];if(!type)return'';
 let slot=preferredSlot||type;if(type=='ri'&&!preferredSlot){slot=!EQ.r1?'r1':!EQ.r2?'r2':'r1';if(EQ.r1&&EQ.r2){const score=s=>Object.values(qStats(s.id,s.q)).reduce((sum,v)=>sum+Number(v||0),0);if(score(EQ.r2)<score(EQ.r1))slot='r2'}}
 const current=EQ[slot],candidate=qStats(id,q),equipped=current?qStats(current.id,current.q):{},names=Object.fromEntries(Object.entries(ITEM_STATS).map(([k,s])=>[k,s.label]));
 const rows=Object.keys(names).filter(k=>(candidate[k]||0)||(equipped[k]||0));
 const panel=(item,stats,label,quality)=>'<div class="compareCard '+label+'"><div class=compareLabel>'+label+'</div><div class=compareIcon><img src="'+item.ic+'" alt=""></div><div class=compareName>'+item.n.split(' (')[0]+'</div><div class=compareStats>'+
  (rows.length?rows.map(k=>{const value=stats[k]||0,diff=(candidate[k]||0)-(equipped[k]||0),better=label=='Novo'?diff>0:diff<0,range=k==='dmg'&&qualityWeaponRange(item,quality),display=range?range.min+' - '+range.max:itemStatValue(k,value);return'<div class="compareStat '+(diff===0?'same':better?'better':'worse')+'"><span>'+names[k]+'</span><b>'+display+'</b></div>'}).join(''):'<div class=compareSame>Sem atributos</div>')+'</div></div>';
 const existing=current?ITEMS[current.id]:null,empty={ic:BLANK,n:'Vazio'};
 return'<div class=compareHead>Comparação — '+SLOT_LABEL[slot]+'</div><div class=compareGrid>'+panel(ITEMS[id],candidate,'Novo',q)+panel(existing||empty,equipped,'Equipado',current?.q)+'</div>'
}
function itemTip(id,q,preferredSlot){const it=ITEMS[id],t=gearType[id],m=it.n.match(/\(([^)]*)\)/);const qcol=t?QCOL[qi(q==null?50:q)]:null;let h='<b'+(qcol?' style="color:'+qcol+'" data-qc='+qcol:'')+'>'+it.n.split(' (')[0]+'</b>';
 if(t)h+='<div class=tw>'+(t=='ri'?'Anel':SLOT_LABEL[t])+'</div>';
 if(t)h+='<div class=tm style="color:'+qcol+'">Qualidade: '+(q==null?50:q)+'% ('+qName(q==null?50:q)+')</div>';const stats=t?qStats(id,q):it,st=statTxt(t==='sw'&&weaponDamageRange(it)?{...stats,dmg:0}:stats);if(st)h+='<div>'+st.split(', ').join('<br>')+'</div>';
 else if(it.use&&m)h+='<div>'+m[1]+'</div>';
 if(!t&&attributeText(it.bonuses))h+='<div class=tw>'+(it.use?'Bônus por '+it.bonusDuration+'s':'Atributos do material')+'</div><div>'+attributeText(it.bonuses).split(', ').join('<br>')+'</div>';
 if(t=='sw'){h+='<div class=tm>Tipo: '+(it.wt||'arma')+(it.th?' • duas mãos':' • uma mão')+'</div>';const range=qualityWeaponRange(it,q);if(range)h+='<div>Dano da arma: '+range.min+' - '+range.max+' (sorteado por ataque)</div>'}
 if(it.tags&&it.tags.length)h+='<div class=tm>Tags: '+it.tags.join(', ')+'</div>';
 if(t=='sw')h+='<div class=tm>Habilidades: '+(WSK[id]||WSK.sw).slice(0,1).map(s=>s.n).join(', ')+'</div>';
 if(t&&!(preferredSlot&&EQ[preferredSlot]&&EQ[preferredSlot].id==id&&EQ[preferredSlot].q===q))h+=compareEquipment(id,q,preferredSlot);
 return h}
const tipEl=document.createElement('div');tipEl.id='tip';document.body.appendChild(tipEl);
const tipFind=n=>{while(n&&n._tip===undefined)n=n.parentNode;return n&&n._tip?n:null};
document.addEventListener('mousemove',e=>{const s=tipFind(e.target);if(!s){tipEl.style.display='none';return}
 tipEl.innerHTML=s._tip();const qb=tipEl.querySelector('[data-qc]');tipEl.style.borderColor=qb?qb.dataset.qc:'';tipEl.style.display='block';const w=tipEl.offsetWidth,h=tipEl.offsetHeight;
 let x=e.clientX+14,y=e.clientY-h-12;if(x+w>innerWidth-4)x=e.clientX-w-14;if(y<4)y=e.clientY+18;tipEl.style.left=Math.max(4,x)+'px';tipEl.style.top=y+'px'});
document.addEventListener('mouseout',e=>{if(!e.relatedTarget)tipEl.style.display='none'});
$('bag')._tip=()=>'<b>Mochila</b><div class=tm>Tecla I</div>';
$('st')._tip=()=>'<b>Atributos</b><div><b style="color:#f55">F</b> Força: vida, poder físico e regeneração</div><div><b style="color:#5ee05a">A</b> Agilidade: defesa física, velocidade de ataque e movimento</div><div><b style="color:#5aa8ff">I</b> Inteligência: mana, poder mágico e regeneração</div><div>O tipo e alcance do ataque básico vêm da arma; a velocidade de ataque vem da classe.</div><div class=tm>⚔ dano • ✨ poder mágico • 🛡 armadura física • 🔮 armadura mágica • ⏱ intervalo • ➤ movimento</div>';
/* A Mochila é desenhada por js/hud.js. */
function renderInv(){dirtyInv=false}
// No Play da Engine o progresso fica num save temporário da sessão, separado do save real do jogador.
const saveStore=()=>MODO.teste?sessionStorage:localStorage;
function saveGame(){
 if(window._noSave||MODO.motor)return;
 // na taverna o progresso guarda o lugar da ilha de onde o jogador saiu (js/taverna.js)
 const pos=window.posicaoParaSalvar?posicaoParaSalvar():p;
 const data={p:{x:pos.x,y:pos.y,hp:p.hp,mp:p.mp,lvl:p.lvl,xp:p.xp,gold:p.gold,cls:p.cls,sex:p.sex,classProgress:p.classProgress,skillSlots:p.skillSlots,basicMode:p.basicMode,basicNext:p.basicNext},items:I,equipment:EQ,questDone,carpenterHelped,sawQuestActive,sawObtained,woodQuestActive,wallBuilt,magicWoodQuestActive,campPortalBuilt,campPortalTheme,blacksmithSaved,wallVersion:2,gateOpen:CAMP_WALL.gateOpen,lootMode,questDrops:drops.filter(o=>o.questReward||o.id=='wood'||o.id=='magicWood')};
 try{saveStore().setItem('ilha-rpg-save',JSON.stringify(data))}catch(err){console.error('Não foi possível salvar o jogo:',err)}
}
window.saveGame=saveGame;
function loadGame(){
 let raw;if(MODO.motor)return false;try{raw=saveStore().getItem('ilha-rpg-save')}catch(err){console.error('Não foi possível ler o progresso salvo:',err);return false}
 if(!raw)return false;
 try{
  const d=JSON.parse(raw);if(!d||!d.p||!Array.isArray(d.items))return false;
  for(const k of ['x','y','hp','mp','lvl','xp','gold'])if(Number.isFinite(d.p[k]))p[k]=d.p[k];
  p.lvl=Math.max(1,Math.min(30,Math.floor(p.lvl)));if(p.lvl>=CALC.maxLevel)p.xp=0;
  if(CL[d.p.cls])p.cls=d.p.cls;
  p.classProgress={war:{rank:1,xp:0}};
  if(d.p.classProgress&&typeof d.p.classProgress=='object')Object.keys(d.p.classProgress).forEach(id=>{const v=d.p.classProgress[id];if(CL[id]&&v&&Number.isFinite(v.rank)&&Number.isFinite(v.xp))p.classProgress[id]={rank:Math.max(1,Math.min(10,Math.floor(v.rank))),xp:Math.max(0,v.xp)}});
  if(!p.classProgress[p.cls])p.classProgress[p.cls]={rank:1,xp:0};
  p.skillSlots=d.p.skillSlots&&typeof d.p.skillSlots=='object'?d.p.skillSlots:{};
  p.basicMode=BASIC_MODES.includes(d.p.basicMode)?d.p.basicMode:'sw';p.basicNext=d.p.basicNext=='sh'?'sh':'sw';
  lootMode=Object.prototype.hasOwnProperty.call(LOOT_MODES,d.lootMode)?d.lootMode:'manual';
  if(d.p.sex=='m'||d.p.sex=='f')p.sex=d.p.sex;
  if(!walk(p.x,p.y)){p.x=CX;p.y=CY+34}
  I.length=Math.max(40,d.items.length);I.fill(null);d.items.forEach((s,i)=>{if(s&&ITEMS[s.id]&&Number.isInteger(s.n)&&s.n>0)I[i]={id:s.id,n:s.n,q:s.q}});
  for(const id of Object.keys(EQ)){const e=d.equipment&&d.equipment[id];EQ[id]=e&&fits(id,e.id)?{id:e.id,n:1,q:e.q}:null}
  questDone=d.questDone===true;if(questDone)boss.hp=0;carpenterHelped=questDone&&d.carpenterHelped===true;
  sawQuestActive=carpenterHelped&&d.sawQuestActive===true;sawObtained=sawQuestActive&&d.sawObtained===true;
  woodQuestActive=sawObtained&&d.woodQuestActive===true;wallBuilt=woodQuestActive&&d.wallVersion===2&&d.wallBuilt===true;
  magicWoodQuestActive=wallBuilt&&d.magicWoodQuestActive===true;campPortalBuilt=magicWoodQuestActive&&d.campPortalBuilt===true;
  campPortalTheme=d.campPortalTheme||(campPortalBuilt?'goblin':null);
  blacksmithSaved=campPortalBuilt&&d.blacksmithSaved===true;
  window.blacksmithSaved=blacksmithSaved;
  CAMP_WALL.gateOpen=d.gateOpen!==false;placeCarpenter();if(window.placeBlacksmith)placeBlacksmith();syncCampWall();
  if(!walk(p.x,p.y)){p.x=CX;p.y=CY+34}
  drops.length=0;
  if(Array.isArray(d.questDrops))for(const o of d.questDrops){
   if(!o||(o.id!='wood'&&o.id!='magicWood'&&o.id!='saw')||!ITEMS[o.id])continue;
   drops.push({id:o.id,k:++dropSeq,q:gearType[o.id]&&Number.isFinite(o.q)?o.q:null,n:Number.isInteger(o.n)&&o.n>0?o.n:1,questReward:o.id=='saw'&&o.questReward===true})
  }
  showDrop();
  drops.slice().filter(autoAccepts).forEach(acceptDrop);
  if(sawQuestActive&&!sawObtained&&window.resumeSawQuest)resumeSawQuest();
  p.hp=Math.min(mhp(),Math.max(0,p.hp));p.mp=Math.min(mmp(),Math.max(0,p.mp));
  applySkills();setPortrait();if(window.renderSkillMenu)renderSkillMenu();if(window.repop)repop();dirtyInv=true;return true
 }catch(err){console.error('Progresso salvo inválido:',err);return false}
}
addEventListener('beforeunload',saveGame);setInterval(saveGame,5000);
const ap=document.createElement('div');ap.id='ap';document.querySelector('#invp .doll').prepend(ap);
function attrPanel(){if(!invOpen)return;const a=attributes(),c=CL[p.cls],fmt=(v,d=0)=>Number(v).toFixed(d),value=(total,initial,d=0)=>{const delta=total-initial,sign=delta<0?' - ':' + ';return fmt(initial,d)+(Math.abs(delta)>0.0001?'<span class="statBonus">'+sign+fmt(Math.abs(delta),d)+'</span>':'')},row=(l,v,col)=>'<div><span'+(col?' style="color:'+col+'"':'')+'>'+l+'</span><i>'+v+'</i></div>';
 const passiveAttr=k=>c.pa?c.pa(k):0,baseF=a.F-passiveAttr('F'),baseA=a.A-passiveAttr('A'),baseI=a.I-passiveAttr('I');
 const effectSum=kind=>Object.keys(p.st||{}).reduce((sum,k)=>{const s=p.st[k];return FX_INFO[k]&&FX_INFO[k].kind==kind&&s.t>0?sum+s.pw*(s.n||1):sum},0);
 const hpBase=Math.round(CALC.hp0+(baseF-3)*CALC.hpPerF)+bonus('hp'),mpBase=Math.round(CALC.mp0+(baseI-3)*CALC.mpPerI)+bonus('mp');
 const regenHpBase=baseF*CALC.regenPerF+campB()+bonus('regenHp'),regenMpBase=baseI*CALC.regenPerI+campB()+bonus('regenMp'),hpRegenEffect=effectSum('hot');
 const damageFactor=(1+(c.pDmg||0))*(p.bf>0?1.5:1)*(1+effectSum('dmgup')/100);
 const hasteFactor=Object.keys(p.st||{}).reduce((factor,k)=>{const s=p.st[k];return FX_INFO[k]&&FX_INFO[k].kind=='haste'&&s.t>0?factor*(1+s.pw*(s.n||1)/100):factor},1);
 const moveBase=Math.round(CALC.move*(1+bonus('spd')+bonus('moveSpeed')+baseA*CALC.spdPerA)),moveWithEffects=Math.round(CALC.move*(1+spdB()+(p.bf>0?.3:0))*hasteFactor);
 const armorBase=Math.round(baseA*CALC.armPerA+bonus('arm')),magicArmorBase=Math.round(baseF+baseA+baseI+bonus('magicArm'));
 const intervalBase=Math.max(CALC.minInterval,(c.attackSpeed||1)*(1-baseA*CALC.atkSpdPerA)*(1-bonus('attackSpeed')));
 const guardEffect=Math.min(80,effectSum('guard')),protection=Math.round((1-(1-guardEffect/100)*(p.guard>0?.5:1))*100);
 ap.innerHTML='<h4>Atributos</h4>'+
  row('Força',value(a.F,baseF),'#f55')+row('Agilidade',value(a.A,baseA),'#5ee05a')+row('Inteligência',value(a.I,baseI),'#5aa8ff')+'<hr>'+
  row('Vida máx.',value(mhp(),hpBase))+row('Mana máx.',value(mmp(),mpBase))+
  row('Reg. vida',value(regenHp()+hpRegenEffect,regenHpBase,2)+'/s')+row('Reg. mana',value(regenMp(),regenMpBase,2)+'/s')+'<hr>'+
  row('Dano físico',Math.round((physicalPower()+bonus('dmg'))*damageFactor))+row('Dano mágico',Math.round((magicPower()+bonus('dmg'))*damageFactor))+
  row('Def. física',value(armor(),armorBase))+row('Def. mágica',value(magicArmor(),magicArmorBase))+
  (protection?row('Proteção','<span class="statBonus">'+protection+'%</span>'):'')+
  row('Int. de ataque',value(attackInterval(),intervalBase,2)+'s')+row('Vel. movimento',value(moveWithEffects,moveBase))+
  row('Aumento de área',fmt(bonus('area')*100,1)+'%')+row('Redução de recarga',fmt((1-cooldownMultiplier(p))*100,1)+'%')+
  row('Chance crítica',fmt(Math.max(0,Math.min(1,bonus('critChance')))*100,1)+'%')+
  row('Dano crítico',fmt(Math.max(1,1.5+bonus('critDamage'))*100,1)+'%')+
  row('Roubo de vida',fmt(Math.max(0,Math.min(1,bonus('lifeSteal')))*100,1)+'%')+row('Roubo de vida mág.',fmt(Math.max(0,Math.min(1,bonus('magicLifeSteal')))*100,1)+'%')+row('Nível',p.lvl);
 ap.style.display='block'}
function hud(){attrPanel();const H=mhp(),M=mmp(),a=attributes(),hp=Math.max(0,p.hp),combat=inCombat();if(combat&&skillPicker.classList.contains('open'))closeSkillPicker();$('dock').classList.toggle('inCombat',combat);document.querySelectorAll('.skillSelect').forEach(button=>{const slot=Number(button.dataset.skillSlot),cooldown=SK[slot]&&SK[slot].t>0;button.disabled=combat||cooldown;button.title=combat?'Troca disponível apenas fora de combate':cooldown?'Aguarde a habilidade terminar a recarga':'Escolher habilidade'});$('hpb').style.width=hp/H*100+'%';$('hpt').textContent=Math.ceil(hp)+' / '+H;
 $('mpb').style.width=p.mp/M*100+'%';$('mpt').textContent=Math.floor(p.mp)+' / '+M;
 $('xpb').style.width=(p.lvl>=CALC.maxLevel?100:p.xp/(p.lvl*CALC.xpPerLevel)*100)+'%';$('lv').textContent='Nv '+p.lvl+(p.lvl>=CALC.maxLevel?' · MÁX':' · '+p.xp+'/'+p.lvl*CALC.xpPerLevel);const rankProgress=p.classProgress&&p.classProgress[p.cls]||{rank:1,xp:0},rank=rankProgress.rank||1,rankNeed=rank>=10?0:rank*CALC.rankXp;$('rankxpb').style.width=(rankNeed?Math.max(0,Math.min(100,rankProgress.xp/rankNeed*100)):100)+'%';$('ranklv').textContent='Rank '+rank+(rankNeed?' · '+rankProgress.xp+'/'+rankNeed:' · MÁX');drawPortrait();bs.classList.toggle('on',p.aw>0);{const iv=attackInterval(),c=Math.max(0,p.acd);bs.querySelector('u').style.height=Math.min(1,c/iv)*100+'%';bs.querySelector('span').textContent=c>0?(c>=1?Math.ceil(c):c.toFixed(1)):'';refreshBasicMode()}
 $('pname').textContent=CL[p.cls].n;$('hpr').textContent='+'+regenHp().toFixed(2);$('mpr').textContent='+'+regenMp().toFixed(2);
 $('gold').textContent='● '+p.gold;
 SK.forEach(s=>{s.u.style.height=s.t/s.cd*100+'%';s.cn.textContent=s.lock?'R'+s.lock:s.t>0?Math.ceil(s.t):'';s.el.style.opacity=p.mp<s.mana||s.lock||s.bad?.5:1});
 $('top').textContent='Botão direito: mover/atacar • Botão esquerdo: inspecionar/NPC • QWERTY ZX habilidades • I bolsa';
 if(insp&&insp.hp<=0)insp=null;
 window.insp=insp;
 const isDungeonBossTarget = window.inDungeon && window.dungeonBoss && (p.tgt === window.dungeonBoss || insp === window.dungeonBoss);
 const info=(p.tgt&&canSee(p.tgt.x,p.tgt.y)?p.tgt:null)||(insp&&canSee(insp.x,insp.y)?insp:null),monster=info&&MONSTER_TYPES[info.ty],mon=$('mon');
 mon.style.display=(monster && !isDungeonBossTarget)?'flex':'none';
 if(monster){const mc=$('monic').getContext('2d');mc.clearRect(0,0,40,40);mc.imageSmoothingEnabled=false;
  const k=Math.min(36/info.img.width,36/info.img.height),iw=Math.round(info.img.width*k),ih=Math.round(info.img.height*k);
  mc.drawImage(info.img,Math.round((40-iw)/2),Math.round((40-ih)/2),iw,ih);
  const mm2=35+(info.stats.I-3)*5;
  $('monhp').style.width=Math.max(0,info.hp)/info.max*100+'%';$('monhpt').textContent=Math.ceil(Math.max(0,info.hp))+' / '+info.max;
  $('monmp').style.width=Math.max(0,info.mp)/mm2*100+'%';$('monmpt').textContent=Math.floor(info.mp)+' / '+mm2;
  const bossLabel=info.bossType=='grandboss'?'♛ GRANDE CHEFE · ':info.bossType=='boss'?'★ CHEFE · ':info.elite?'✦ ELITE · ':'';mon.classList.toggle('elite',!!info.elite);
  $('monname').textContent=bossLabel+monster.name+' Nv '+info.lvl}
 const quest=$('quest');quest.classList.toggle('done',blacksmithSaved);
 const target=sawGoblin&&sawGoblin.hp>0?sawGoblin:null;
 const direction=target?(target.y<CY?'norte':'sul')+(target.x<CX?'oeste':'leste'):'';
 const sawDropPending=drops.some(d=>d.questReward);
 let objective;
 if(!questDone)objective='Derrote o Guardião Esqueleto que está perseguindo o carpinteiro escondido nos escombros.';
 else if(!carpenterHelped)objective='Fale com o carpinteiro escondido nos escombros; ele irá para o acampamento.';
 else if(!sawQuestActive)objective='Fale com o carpinteiro no acampamento para saber do muro.';
 else if(!sawObtained)objective=target
  ?'Goblin do Serrote encontrado no '+direction+'. O marcador mostra onde ele está.'
  :sawDropPending?'Serrote encontrado! Aceite o item para levá-lo ao carpinteiro.'
  :'Procure o Goblin do Serrote; ele aparece naturalmente pelo mapa. O indicador surge quando ele spawnar.';
 else if(!woodQuestActive&&!wallBuilt)objective='Serrote recuperado! Fale com o carpinteiro para saber quais materiais faltam.';
 else if(!wallBuilt)objective=itemCount('wood')>=WALL_WOOD_REQUIRED
  ?'Madeira: '+itemCount('wood')+'/20. Entregue 20 madeiras ao carpinteiro para construir a paliçada.'
  :'Madeira: '+itemCount('wood')+'/20. Derrote Brotos Vivos e aceite a madeira. Peso de spawn da missão: +20%.';
 else if(!magicWoodQuestActive)objective='Paliçada construída! Fale com o carpinteiro: seu irmão ferreiro precisa ser salvo.';
 else if(!campPortalBuilt)objective=itemCount('magicWood')>=PORTAL_WOOD_REQUIRED
  ?'Madeira mágica: '+itemCount('magicWood')+'/10. Entregue 10 ao carpinteiro para construir o portal.'
  :'Madeira mágica: '+itemCount('magicWood')+'/10. Derrote árvores vivas (Brotos Vivos) e aceite o material. Peso de spawn da missão: +20%.';
 else if(!blacksmithSaved)objective='O portal está sintonizado com o Covil dos Goblins! Clique no portal ou abra o menu, entre na DG, derrote o Lorde Goblin Demoníaco e resgate o Ferreiro!';
 else objective='O Ferreiro foi salvo e está na forja do acampamento! Você pode explorar a DG novamente para caçar baús raros e lendários!';
 quest.innerHTML='<b>'+(wallBuilt?'RESGATE DO FERREIRO':'PRIMEIRO OBJETIVO')+'</b>'+objective;
 if(dirtyInv)renderInv()}
const mm=$('mm').getContext('2d');mm.imageSmoothingEnabled=false;

/* lista de drops (canto superior direito): aceitar ou rejeitar */
const dp=document.createElement('div');dp.id='drop';document.body.appendChild(dp);
['pointerdown','click','contextmenu'].forEach(ev=>dp.addEventListener(ev,e=>e.stopPropagation()));
let dropSeq=0;
const LOOT_MODES={manual:null,all:0,good:45,rare:70,epic:90,perfect:100};
let lootMode='manual';
function autoAccepts(o){const threshold=LOOT_MODES[lootMode];return threshold===0||threshold!=null&&o.q!=null&&o.q>=threshold}
function offerDrop(id,questReward=false,forcedQuality=null){const q=gearType[id]?(forcedQuality==null?rollQ():Math.max(1,Math.min(100,Math.floor(forcedQuality)))):null,matching=drops.find(o=>o.id==id&&o.q===q&&!!o.questReward===!!questReward);if(matching)matching.n=(matching.n||1)+1;else drops.push({id,k:++dropSeq,q,n:1,questReward});const o=matching||drops[drops.length-1];if(autoAccepts(o))acceptDrop(o);else showDrop();if(questReward||id=='wood'||id=='magicWood')saveGame()}
function compactDrops(){for(let i=0;i<drops.length;i++)for(let j=i+1;j<drops.length;){const a=drops[i],b=drops[j];if(a.id==b.id&&a.q===b.q&&!!a.questReward===!!b.questReward){a.n=(a.n||1)+(b.n||1);drops.splice(j,1)}else j++}}
function showDrop(){compactDrops();dp.innerHTML='';dp.style.display=drops.length?'block':'none';if(!drops.length)return;
 const h=document.createElement('div');h.className='dh';const title=document.createElement('span');title.className='dhTitle';title.textContent='Itens encontrados ('+drops.reduce((n,o)=>n+(o.n||1),0)+')';h.appendChild(title);
 const mode=document.createElement('select');mode.className='lootMode';mode.setAttribute('aria-label','Coleta automática de loot');
 [['manual','Manual'],['all','Tudo'],['good','Boa ou melhor'],['rare','Rara ou melhor'],['epic','Épica ou melhor'],['perfect','Perfeita']].forEach(([value,label])=>{const option=document.createElement('option');option.value=value;option.textContent=value=='manual'?'Coleta: '+label:value=='all'?'Coleta: '+label:'Coleta: '+label;mode.appendChild(option)});
 mode.value=lootMode;mode.onchange=()=>{lootMode=mode.value;saveGame();const ready=drops.filter(autoAccepts);ready.forEach(acceptDrop);if(!ready.length)showDrop()};h.appendChild(mode);dp.appendChild(h);
 const rejectAll=document.createElement('button');rejectAll.className='rejectAll';rejectAll.type='button';rejectAll.textContent='Rejeitar tudo';rejectAll.onclick=rejectAllDrops;dp.appendChild(rejectAll);
 drops.forEach(o=>{const r=document.createElement('div');r.className='dr'+qc(o);r._tip=()=>itemTip(o.id,o.q);
  r.innerHTML='<img src="'+ITEMS[o.id].ic+'"><span>'+ITEMS[o.id].n.split(' (')[0]+(o.q==null?'':' <small>'+o.q+'%</small>')+((o.n||1)>1?' <b>×'+(o.n||1)+'</b>':'')+'</span><button class=ya aria-label="Aceitar '+ITEMS[o.id].n.split(' (')[0]+'">✓</button><button class=xa aria-label="Rejeitar '+ITEMS[o.id].n.split(' (')[0]+'">✕</button>';
  r.querySelector('.ya').onclick=()=>acceptDrop(o);r.querySelector('.xa').onclick=()=>rejectDrop(o);dp.appendChild(r)});
 dp.classList.toggle('shift',invOpen)}
function acceptDrop(o=drops[0]){if(!o)return;if(!addItem(o.id,o.q,o.n||1)){ft(p.x,p.y-24,'Bolsa cheia!','#f66');return}if(o.questReward&&o.id=='saw')sawObtained=true;if(window.playGameSound)playGameSound('item');ft(p.x,p.y-16,ITEMS[o.id].n.split(' (')[0]+((o.n||1)>1?' ×'+(o.n||1):''),'#9f9');drops.splice(drops.indexOf(o),1);tipEl.style.display='none';showDrop();saveGame()}
function rejectDrop(o=drops[0]){if(!o)return;drops.splice(drops.indexOf(o),1);tipEl.style.display='none';showDrop();saveGame()}
function rejectAllDrops(){if(!drops.length)return;drops.length=0;tipEl.style.display='none';showDrop();saveGame()}
addEventListener('keydown',e=>{if(!drops.length)return;if(TECLAS.acao(e)=='pegar')acceptDrop();else if(e.key=='Escape')rejectDrop()});
