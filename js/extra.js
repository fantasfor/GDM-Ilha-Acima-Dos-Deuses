/* ---------- efeitos de status embutidos ----------
   Monstros, itens, passivas e habilidades ficam em js/projeto.js (editados pela Engine).
   Efeitos personalizados ou alterados também ficam no projeto (dados.effects) e são aplicados pelo custom.js. */
Object.assign(FX_INFO,{
 vuln:{n:'Vulnerável',c:'#c6f',kind:'vuln'},
 weak:{n:'Fraqueza',c:'#bbb',kind:'dmgdown'},
 regen:{n:'Regeneração',c:'#5f8',kind:'hot',tick:1,good:true},
 rage:{n:'Fúria',c:'#f64',kind:'dmgup',good:true},
 ward:{n:'Proteção',c:'#6af',kind:'guard',good:true},
 haste:{n:'Pressa',c:'#fd5',kind:'haste',good:true}});
function stSum(t,kind){let m=0;if(t&&t.st)for(const k in t.st)if(FX_INFO[k]&&FX_INFO[k].kind==kind)m+=t.st[k].pw*(t.st[k].n||1);return m}
function fxExtra(f){const k=FX_INFO[f.type].kind,w=+f.power||0;return k=='hot'?' ('+w+' de vida por segundo)':k=='dmgup'?' (+'+w+'% de dano)':k=='dmgdown'?' (-'+w+'% de dano)':k=='guard'?' (-'+w+'% de dano recebido)':k=='haste'?' (+'+w+'% de velocidade)':''}
/* efeitos: padrões de duração/dano e acúmulos */
Object.assign(FX_INFO.poison||(FX_INFO.poison={n:'Veneno',c:'#7d3',kind:'dot',tick:1,dtype:'true'}),{dur:5,power:2,stacks:3});
if(FX_INFO.bleed)Object.assign(FX_INFO.bleed,{dur:4,power:2,stacks:3});
