/* ---------- efeitos de status embutidos ----------
   Monstros, itens, passivas e habilidades ficam em js/projeto.js (editados pela Engine).
   Efeitos personalizados ou alterados também ficam no projeto (dados.effects) e são aplicados pelo custom.js. */
Object.assign(FX_INFO,{
 vuln:{n:'Vulnerável',c:'#c6f',kind:'vuln'},
 weak:{n:'Fraqueza',c:'#bbb',kind:'dmgdown'},
 regen:{n:'Regeneração',c:'#5f8',kind:'hot',tick:1,good:true},
 rage:{n:'Fúria',c:'#f64',kind:'dmgup',good:true},
 ward:{n:'Proteção',c:'#6af',kind:'guard',good:true},
 haste:{n:'Pressa',c:'#fd5',kind:'haste',good:true},
 grito:{n:'Grito de Guerra',c:'#ff3a2a',kind:'physup',good:true,aura:true},
 inspiracao:{n:'Inspiração Mágica',c:'#8a6bff',kind:'magup',good:true,aura:true}, // +% de dano mágico (Mago)
 // Curandeiro (js/curandeiro.js): curas instantâneas (não ficam como efeito) e a Presença Curativa (+% de dano)
 cura:{n:'Cura',c:'#6fe36f',kind:'curapct',good:true},luz:{n:'Iluminação',c:'#fff3a0',kind:'curapct',good:true},curafixa:{n:'Pulso de Luz',c:'#ffe9a0',kind:'curaabs',good:true},
 presenca:{n:'Presença Curativa',c:'#7fe8a0',kind:'dmgup',good:true,aura:true},
 gelo:{n:'Gelo',c:'#8fd8ff',kind:'slow',power:5,stacks:10,atk:true,congela:3}}); // -5% de movimento e ataque por acúmulo; 10 acúmulos congelam 3 s // cada acúmulo deixa 10% mais lento // aura: chamas e contorno na cor do efeito (js/vfx-habilidades.js)
/* atordoado: espiral desenhada girando em cima da cabeça (js/vfx-habilidades.js) */
/* buffs do mesmo tipo não somam: vale o mais forte */
function stSum(t,kind){let m=0,b=0;if(t&&t.st)for(const k in t.st){const f=FX_INFO[k];if(!f||f.kind!=kind)continue;if(f.good)b=Math.max(b,t.st[k].pw);else m+=t.st[k].pw*(t.st[k].n||1)}return m+b}
function fxExtra(f){const k=FX_INFO[f.type].kind,w=+f.power||0;return k=='hot'?' ('+w+' de vida por segundo)':k=='dmgup'?' (+'+w+'% de dano)':k=='dmgdown'?' (-'+w+'% de dano)':k=='guard'?' (-'+w+'% de dano recebido)':k=='haste'?' (+'+w+'% de velocidade)':k=='physup'?' (+'+w+'% de dano físico)':k=='magup'?' (+'+w+'% de dano mágico)':''}
/* efeitos: padrões de duração/dano e acúmulos */
Object.assign(FX_INFO.poison||(FX_INFO.poison={n:'Veneno',c:'#7d3',kind:'dot',tick:1,dtype:'true'}),{dur:5,power:2,stacks:3});
if(FX_INFO.bleed)Object.assign(FX_INFO.bleed,{dur:4,power:2,stacks:3});
if(FX_INFO.burn)Object.assign(FX_INFO.burn,{power:3,stacks:10}); // fogo: 3 de dano por acúmulo por segundo // fogo da Bola de Fogo acumula
