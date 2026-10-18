/* Projeto do Ilha RPG — gravado pela Engine (editor.html). Edite pela engine; alterações manuais podem ser sobrescritas. */
window.PROJETO={
 "formato": 1,
 "nome": "Ilha RPG",
 "dados": {
  "classes": [
   {
    "id": "war",
    "name": "Guerreiro",
    "base": "war",
    "attackSpeed": 1.25,
    "attrs": {
     "F": 20,
     "A": 10,
     "I": 5
    },
    "per": {
     "F": 6,
     "A": 3,
     "I": 1
    },
    "passives": [
     {
      "id": "p_pele_ferro",
      "lv": 2
     }
    ],
    "skills": [
     {
      "id": "war_throw",
      "rank": 1
     },
     {
      "id": "war_charge",
      "rank": 2
     },
     {
      "id": "war_spin",
      "rank": 3
     },
     {
      "id": "war_fury",
      "rank": 4
     },
     {
      "id": "war_impact",
      "rank": 5
     },
     {
      "id": "war_wall",
      "rank": 6
     }
    ],
    "kit": [
     {
      "id": "kit_espada_treino",
      "n": 1
     },
     {
      "id": "kit_gibao",
      "n": 1
     },
     {
      "id": "hp",
      "n": 3
     }
    ]
   },
   {
    "id": "mag",
    "name": "Mago",
    "base": "mag",
    "attackSpeed": 1,
    "attrs": {
     "F": 5,
     "A": 5,
     "I": 15
    },
    "per": {
     "F": 1,
     "A": 2,
     "I": 5
    },
    "passives": [
     {
      "id": "p_mente_afiada",
      "lv": 2
     }
    ],
    "skills": [
     {
      "id": "mag_fire",
      "rank": 1
     },
     {
      "id": "mag_blink",
      "rank": 2
     },
     {
      "id": "mag_nova",
      "rank": 3
     },
     {
      "id": "mag_meteor",
      "rank": 4
     },
     {
      "id": "mag_ice",
      "rank": 5
     },
     {
      "id": "mag_shield",
      "rank": 6
     }
    ],
    "kit": [
     {
      "id": "kit_cajado_aprendiz",
      "n": 1
     },
     {
      "id": "kit_tunica_aprendiz",
      "n": 1
     },
     {
      "id": "mp",
      "n": 3
     }
    ]
   },
   {
    "id": "hea",
    "name": "Curandeiro",
    "base": "hea",
    "attackSpeed": 1.1,
    "attrs": {
     "F": 7,
     "A": 7,
     "I": 14
    },
    "per": {
     "F": 2,
     "A": 2,
     "I": 4
    },
    "passives": [
     {
      "id": "p_vigor",
      "lv": 2
     }
    ],
    "skills": [
     {
      "id": "hea_ray",
      "rank": 1
     },
     {
      "id": "hea_heal",
      "rank": 2
     },
     {
      "id": "hea_aura",
      "rank": 3
     },
     {
      "id": "hea_rebirth",
      "rank": 4
     },
     {
      "id": "hea_light",
      "rank": 5
     },
     {
      "id": "hea_shield",
      "rank": 6
     }
    ],
    "kit": [
     {
      "id": "kit_bastao_novico",
      "n": 1
     },
     {
      "id": "kit_manto_novico",
      "n": 1
     },
     {
      "id": "hp",
      "n": 2
     },
     {
      "id": "mp",
      "n": 2
     }
    ]
   }
  ],
  "items": [
   {
    "id": "hp",
    "name": "Poção de Vida",
    "kind": "consumable",
    "c1": "#e03c3c",
    "healHp": 80,
    "healMp": 0,
    "tags": [],
    "drop": false,
    "sprite": {
     "w": 8,
     "h": 8,
     "q": 1,
     "palette": [
      "#161022",
      "#745739",
      "#91a2a8",
      "#8f1f2a",
      "#e03c3c",
      "#ff9a9a",
      "#b33030"
     ],
     "pixels": "--0000----0110----02200--033433--0354430-0444440-034463---0040--"
    }
   },
   {
    "id": "mp",
    "name": "Poção de Mana",
    "kind": "consumable",
    "c1": "#3c7be0",
    "healHp": 0,
    "healMp": 60,
    "tags": [],
    "drop": false,
    "sprite": {
     "w": 8,
     "h": 8,
     "q": 1,
     "palette": [
      "#161022",
      "#745739",
      "#91a2a8",
      "#1f3f8f",
      "#3c7be0",
      "#9ac4ff",
      "#3062b3"
     ],
     "pixels": "--0000----0110----02200--033433--0354430-0444440-034463---0040--"
    }
   },
   {
    "id": "sh",
    "name": "Escudo",
    "kind": "armor",
    "slot": "sh",
    "style": 0,
    "c1": "#9fb4c8",
    "c2": "#d9a62e",
    "stats": {
     "hp": 40
    },
    "effects": [],
    "tags": [],
    "drop": true,
    "sprite": {
     "w": 8,
     "h": 8,
     "q": 1,
     "palette": [
      "#161022",
      "#cfeaff",
      "#7f90a0",
      "#9fb4c8",
      "#d9a62e"
     ],
     "pixels": "-000000--011112--033432--034442--033432--000400--000000---0000--"
    }
   },
   {
    "id": "sw",
    "name": "Espada",
    "kind": "weapon",
    "wtype": "espada",
    "twoHanded": false,
    "style": 0,
    "c1": "#9aa7b8",
    "c2": "#c9a227",
    "damageType": "physical",
    "stats": {
     "dmg": 8,
     "arm": 0,
     "magicArm": 0,
     "hp": 0,
     "mp": 0,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "basic": {
     "name": "Golpe de espada",
     "rng": 22,
     "dm": 1.1,
     "ranged": false,
     "desc": "Corte rápido e preciso."
    },
    "skills": [],
    "tags": [
     "metal"
    ],
    "drop": true,
    "effects": [
     {
      "type": "bleed",
      "chance": 25,
      "dur": 4,
      "power": 3,
      "pct": 10,
      "src": "physical"
     }
    ]
   },
   {
    "id": "sw2",
    "name": "Machado de Guerra",
    "kind": "weapon",
    "wtype": "machado_2mao",
    "twoHanded": true,
    "style": 1,
    "c1": "#9aa7b8",
    "c2": "#7a4a25",
    "damageType": "physical",
    "stats": {
     "dmg": 12,
     "arm": 0,
     "magicArm": 0,
     "hp": 0,
     "mp": 0,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "basic": {
     "name": "Machadada",
     "rng": 22,
     "dm": 1.7,
     "ranged": false,
     "desc": "Ataque lento e pesado."
    },
    "skills": [],
    "tags": [
     "metal"
    ],
    "drop": true,
    "effects": [
     {
      "type": "rage",
      "chance": 18,
      "dur": 6,
      "power": 25,
      "target": "self"
     }
    ]
   },
   {
    "id": "sw3",
    "name": "Cajado Arcano",
    "kind": "weapon",
    "wtype": "cajado",
    "twoHanded": true,
    "style": 2,
    "c1": "#7a4a25",
    "c2": "#55ffff",
    "damageType": "magic",
    "stats": {
     "dmg": 4,
     "arm": 0,
     "magicArm": 0,
     "hp": 0,
     "mp": 30,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "basic": {
     "name": "Orbe do cajado",
     "rng": 80,
     "dm": 1,
     "ranged": true,
     "proj": "#55ffff",
     "desc": "Dispara um orbe arcano."
    },
    "skills": [],
    "tags": [
     "arcano"
    ],
    "drop": true,
    "effects": [
     {
      "type": "burn",
      "chance": 30,
      "dur": 4,
      "power": 3,
      "pct": 12,
      "src": "magic"
     }
    ]
   },
   {
    "id": "saw",
    "name": "Serrote do Goblin",
    "kind": "weapon",
    "wtype": "serrote",
    "twoHanded": false,
    "style": 0,
    "c1": "#aeb8bd",
    "c2": "#a97138",
    "damageType": "physical",
    "stats": {
     "dmg": 6,
     "arm": 0,
     "magicArm": 0,
     "hp": 0,
     "mp": 0,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "basic": {
     "name": "Corte de serrote",
     "rng": 20,
     "dm": 0.9,
     "ranged": false,
     "desc": "Um golpe curto com a lâmina dentada."
    },
    "skills": [],
    "tags": [
     "madeira",
     "missao"
    ],
    "drop": false,
    "questOnly": true
   },
   {
    "id": "wood",
    "name": "Madeira",
    "kind": "material",
    "tags": [
     "construcao"
    ],
    "drop": false,
    "questOnly": true
   },
   {
    "id": "magicWood",
    "name": "Madeira Mágica",
    "kind": "material",
    "tags": [
     "construcao",
     "magia"
    ],
    "drop": false,
    "questOnly": true
   },
   {
    "id": "he1",
    "name": "Capacete de Ferro",
    "kind": "armor",
    "slot": "he",
    "style": 0,
    "c1": "#9aa7b8",
    "c2": "#c0392b",
    "stats": {
     "dmg": 0,
     "arm": 3,
     "magicArm": 0,
     "hp": 0,
     "mp": 0,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "metal"
    ],
    "drop": true
   },
   {
    "id": "he2",
    "name": "Elmo Alado",
    "kind": "armor",
    "slot": "he",
    "style": 1,
    "c1": "#d9a62e",
    "c2": "#f2f2f2",
    "stats": {
     "dmg": 0,
     "arm": 5,
     "magicArm": 0,
     "hp": 20,
     "mp": 0,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "metal"
    ],
    "drop": true,
    "effects": [
     {
      "type": "haste",
      "chance": 15,
      "dur": 5,
      "power": 25,
      "target": "self"
     }
    ]
   },
   {
    "id": "he3",
    "name": "Capuz Sombrio",
    "kind": "armor",
    "slot": "he",
    "style": 2,
    "c1": "#4a2f7a",
    "c2": "#9b6bff",
    "stats": {
     "dmg": 0,
     "arm": 2,
     "magicArm": 0,
     "hp": 0,
     "mp": 20,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "tecido"
    ],
    "drop": true
   },
   {
    "id": "ch1",
    "name": "Peitoral de Ferro",
    "kind": "armor",
    "slot": "ch",
    "style": 0,
    "c1": "#8a97aa",
    "c2": "#8a2f2f",
    "stats": {
     "dmg": 0,
     "arm": 6,
     "magicArm": 0,
     "hp": 0,
     "mp": 0,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "metal"
    ],
    "drop": true
   },
   {
    "id": "ch2",
    "name": "Armadura Dourada",
    "kind": "armor",
    "slot": "ch",
    "style": 1,
    "c1": "#d9a62e",
    "c2": "#8a2f2f",
    "stats": {
     "dmg": 0,
     "arm": 9,
     "magicArm": 0,
     "hp": 30,
     "mp": 0,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "metal"
    ],
    "drop": true,
    "effects": [
     {
      "type": "ward",
      "chance": 15,
      "dur": 5,
      "power": 30,
      "target": "self"
     }
    ]
   },
   {
    "id": "ch3",
    "name": "Túnica de Couro",
    "kind": "armor",
    "slot": "ch",
    "style": 2,
    "c1": "#8a5a30",
    "c2": "#e0c080",
    "stats": {
     "dmg": 0,
     "arm": 4,
     "magicArm": 0,
     "hp": 0,
     "mp": 0,
     "spd": 5,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "couro"
    ],
    "drop": true
   },
   {
    "id": "le1",
    "name": "Calça de Couro",
    "kind": "armor",
    "slot": "le",
    "style": 0,
    "c1": "#7a4a25",
    "c2": "#c9a060",
    "stats": {
     "dmg": 0,
     "arm": 3,
     "magicArm": 0,
     "hp": 0,
     "mp": 0,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "couro"
    ],
    "drop": true
   },
   {
    "id": "le2",
    "name": "Grevas de Aço",
    "kind": "armor",
    "slot": "le",
    "style": 1,
    "c1": "#9aa7b8",
    "c2": "#e6e6f0",
    "stats": {
     "dmg": 0,
     "arm": 5,
     "magicArm": 0,
     "hp": 0,
     "mp": 0,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "metal"
    ],
    "drop": true
   },
   {
    "id": "le3",
    "name": "Calça Real",
    "kind": "armor",
    "slot": "le",
    "style": 2,
    "c1": "#2a4fa0",
    "c2": "#f2d24a",
    "stats": {
     "dmg": 0,
     "arm": 3,
     "magicArm": 0,
     "hp": 0,
     "mp": 15,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "tecido"
    ],
    "drop": true
   },
   {
    "id": "bo",
    "name": "Botas de Couro",
    "kind": "armor",
    "slot": "bo",
    "style": 0,
    "c1": "#a0622d",
    "c2": "#c98a4f",
    "stats": {
     "dmg": 0,
     "arm": 0,
     "magicArm": 0,
     "hp": 0,
     "mp": 0,
     "spd": 25,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "couro"
    ],
    "drop": true
   },
   {
    "id": "bo2",
    "name": "Botas de Aço",
    "kind": "armor",
    "slot": "bo",
    "style": 1,
    "c1": "#8a97aa",
    "c2": "#e6e6f0",
    "stats": {
     "dmg": 0,
     "arm": 3,
     "magicArm": 0,
     "hp": 0,
     "mp": 0,
     "spd": 10,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "metal"
    ],
    "drop": true
   },
   {
    "id": "bo3",
    "name": "Botas Élficas",
    "kind": "armor",
    "slot": "bo",
    "style": 2,
    "c1": "#2f7a43",
    "c2": "#d9e8a0",
    "stats": {
     "dmg": 0,
     "arm": 0,
     "magicArm": 0,
     "hp": 0,
     "mp": 0,
     "spd": 35,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "natureza"
    ],
    "drop": true
   },
   {
    "id": "ca1",
    "name": "Capa Vermelha",
    "kind": "armor",
    "slot": "ca",
    "style": 0,
    "c1": "#b8232f",
    "c2": "#e0b030",
    "stats": {
     "dmg": 0,
     "arm": 2,
     "magicArm": 0,
     "hp": 0,
     "mp": 0,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "tecido"
    ],
    "drop": true
   },
   {
    "id": "ca2",
    "name": "Capa Élfica",
    "kind": "armor",
    "slot": "ca",
    "style": 1,
    "c1": "#2f7a43",
    "c2": "#c9d98a",
    "stats": {
     "dmg": 0,
     "arm": 1,
     "magicArm": 0,
     "hp": 0,
     "mp": 0,
     "spd": 5,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "natureza"
    ],
    "drop": true
   },
   {
    "id": "ca3",
    "name": "Manto Negro",
    "kind": "armor",
    "slot": "ca",
    "style": 2,
    "c1": "#2b2b3a",
    "c2": "#7a5bd0",
    "stats": {
     "dmg": 0,
     "arm": 2,
     "magicArm": 0,
     "hp": 0,
     "mp": 20,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "tecido"
    ],
    "drop": true
   },
   {
    "id": "ri1",
    "name": "Anel de Força",
    "kind": "armor",
    "slot": "ri",
    "style": 0,
    "c1": "#d9a62e",
    "c2": "#e03c3c",
    "stats": {
     "dmg": 4,
     "arm": 0,
     "magicArm": 0,
     "hp": 0,
     "mp": 0,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "joia"
    ],
    "drop": true
   },
   {
    "id": "ri2",
    "name": "Anel de Vida",
    "kind": "armor",
    "slot": "ri",
    "style": 1,
    "c1": "#c0c0d0",
    "c2": "#3fb86a",
    "stats": {
     "dmg": 0,
     "arm": 0,
     "magicArm": 0,
     "hp": 30,
     "mp": 0,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "joia"
    ],
    "drop": true,
    "effects": [
     {
      "type": "regen",
      "chance": 18,
      "dur": 6,
      "power": 6,
      "target": "self"
     }
    ]
   },
   {
    "id": "ri3",
    "name": "Anel Arcano",
    "kind": "armor",
    "slot": "ri",
    "style": 2,
    "c1": "#9b6bff",
    "c2": "#3c7be0",
    "stats": {
     "dmg": 0,
     "arm": 0,
     "magicArm": 0,
     "hp": 0,
     "mp": 25,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "joia"
    ],
    "drop": true
   },
   {
    "id": "ne1",
    "name": "Colar de Presa",
    "kind": "armor",
    "slot": "ne",
    "style": 0,
    "c1": "#e0d8c0",
    "c2": "#f2f2f2",
    "stats": {
     "dmg": 2,
     "arm": 2,
     "magicArm": 0,
     "hp": 0,
     "mp": 0,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "joia"
    ],
    "drop": true,
    "effects": [
     {
      "type": "rage",
      "chance": 12,
      "dur": 5,
      "power": 20,
      "target": "self"
     }
    ]
   },
   {
    "id": "ne2",
    "name": "Amuleto de Rubi",
    "kind": "armor",
    "slot": "ne",
    "style": 1,
    "c1": "#d9a62e",
    "c2": "#e03c3c",
    "stats": {
     "dmg": 0,
     "arm": 1,
     "magicArm": 0,
     "hp": 25,
     "mp": 0,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "joia"
    ],
    "drop": true,
    "effects": [
     {
      "type": "regen",
      "chance": 15,
      "dur": 5,
      "power": 5,
      "target": "self"
     }
    ]
   },
   {
    "id": "ne3",
    "name": "Pingente de Safira",
    "kind": "armor",
    "slot": "ne",
    "style": 2,
    "c1": "#c0c0d0",
    "c2": "#3c7be0",
    "stats": {
     "dmg": 0,
     "arm": 0,
     "magicArm": 0,
     "hp": 0,
     "mp": 30,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "tags": [
     "joia"
    ],
    "drop": true
   },
   {
    "name": "GM teste",
    "kind": "weapon",
    "slot": "he",
    "wtype": "espada",
    "twoHanded": false,
    "style": 0,
    "c1": "#9aa7b8",
    "c2": "#c9a227",
    "damageType": "physical",
    "stats": {
     "dmg": 100,
     "arm": 0,
     "hp": 0,
     "mp": 0,
     "spd": 0,
     "F": 10,
     "A": 10,
     "I": 10,
     "magicArm": 0
    },
    "basic": {
     "name": "Golpe",
     "rng": 22,
     "dm": 1,
     "ranged": false,
     "proj": "#ffffff",
     "desc": ""
    },
    "skills": [
     "hea_heal"
    ],
    "tags": [],
    "healHp": 0,
    "healMp": 0,
    "drop": true,
    "id": "x_novo_item",
    "sprite": {
     "w": 32,
     "h": 32,
     "palette": [
      "#000000",
      "#ff9500",
      "#613900",
      "#757575"
     ],
     "pixels": "............................1111...........................11111...........................11111..........................111122.........................1111222........................11112221........................11122221......................1111222211......................111222211......................1112222111................0....1122222111.................00..1112222211..................0001112222211...................001112222211....................00001222211......................000222211........................0000211.......................0033000300.....................00330000330....................0033000.0030..................0033300....0000................0333000.......000..............033000..........00.............333000........................033000........................0033000........................003300.........................003300........................0033300.........................003000..........................00000...........................0000............................"
    }
   },
   {
    "id": "sw_veneno",
    "name": "Adaga Venenosa",
    "kind": "weapon",
    "wtype": "espada",
    "twoHanded": false,
    "style": 0,
    "c1": "#6a8a5a",
    "c2": "#77dd33",
    "damageType": "physical",
    "stats": {
     "dmg": 7,
     "arm": 0,
     "magicArm": 0,
     "hp": 0,
     "mp": 0,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "basic": {
     "name": "Golpe de espada",
     "rng": 22,
     "dm": 1.1,
     "ranged": false,
     "desc": "Corte rápido e preciso."
    },
    "skills": [],
    "tags": [
     "metal"
    ],
    "drop": true,
    "effects": [
     {
      "type": "poison",
      "chance": 35,
      "dur": 5,
      "power": 2,
      "pct": 12,
      "src": "physical"
     }
    ]
   },
   {
    "id": "sw_gelo",
    "name": "Lâmina Gélida",
    "kind": "weapon",
    "wtype": "espada",
    "twoHanded": false,
    "style": 0,
    "c1": "#8ac8e8",
    "c2": "#e9fbff",
    "damageType": "physical",
    "stats": {
     "dmg": 9,
     "arm": 0,
     "magicArm": 0,
     "hp": 0,
     "mp": 0,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 0
    },
    "basic": {
     "name": "Golpe de espada",
     "rng": 22,
     "dm": 1.1,
     "ranged": false,
     "desc": "Corte rápido e preciso."
    },
    "skills": [],
    "tags": [
     "metal"
    ],
    "drop": true,
    "effects": [
     {
      "type": "slow",
      "chance": 30,
      "dur": 3,
      "power": 35
     },
     {
      "type": "vuln",
      "chance": 12,
      "dur": 4,
      "power": 20
     }
    ]
   },
   {
    "id": "cajado_arcano_copia",
    "name": "Cajado Arcano Fogo",
    "kind": "weapon",
    "wtype": "cajado",
    "twoHanded": true,
    "style": 2,
    "c1": "#7a4a25",
    "c2": "#55ffff",
    "damageType": "magic",
    "stats": {
     "arm": 0,
     "magicArm": 0,
     "hp": 0,
     "spd": 0,
     "F": 0,
     "A": 0,
     "I": 5,
     "magicLifeSteal": 20
    },
    "basic": {
     "name": "Projetil de Fogo",
     "rng": 50,
     "dm": 1,
     "ranged": true,
     "proj": "#ff0000",
     "desc": "Ataque automático da arma.",
     "damageType": "magic",
     "base": 10,
     "per": 0,
     "charPercent": 100,
     "scaleStat": "I",
     "scalePercent": 0,
     "icon": "blade",
     "bonuses": {
      "critChance": 20,
      "critDamage": 20
     },
     "vfx": "fire",
     "sprite": {
      "w": 24,
      "h": 24,
      "q": 1,
      "palette": [
       "#161f2c",
       "#7a1f2b",
       "#c23a3a",
       "#05070a",
       "#213044",
       "#293a53",
       "#0d121a",
       "#151f2b",
       "#151e2a",
       "#141d2a",
       "#141d29",
       "#141c28",
       "#131b27",
       "#131b26",
       "#121a25",
       "#121a24",
       "#111923",
       "#111823",
       "#111822",
       "#101721",
       "#101720",
       "#0f161f",
       "#0f151e",
       "#0e151d",
       "#0e141c",
       "#0e131c",
       "#0d131b"
      ],
      "pixels": "4555555555555555555555534000000000000000000000034700000000000000000000734800000000000100001000834900000010001000110000934a00000010001001100000a34b00000010011012100000b34c00000110011122210000c34d00001010122122221000d34e00001001122222221000e34f00000101122222221000f34g00000101122222220000g34h00000111221222100000h34i00001211221222100000i34j00001221221221000000j34k00001222221221000000k34l00001222211221000000l34m00001221211210000000m34n00001221111210000000n34o00012221111210000000o34p00000000000000000000p34q00000000000000000000q3466666666666666666666663333333333333333333333333"
     }
    },
    "skills": [],
    "tags": [
     "arcano"
    ],
    "drop": true,
    "effects": [
     {
      "type": "burn",
      "chance": 30,
      "dur": 4,
      "power": 3,
      "pct": 12,
      "src": "magic"
     },
     {
      "type": "burn",
      "chance": 20,
      "dur": 5,
      "power": 5,
      "pct": 5,
      "src": "magic"
     }
    ],
    "damageMin": 5,
    "damageMax": 10,
    "itemSprite": {
     "w": 32,
     "h": 32,
     "q": 1,
     "palette": [
      "#161022",
      "#7a4a25",
      "#c23a3a"
     ],
     "pixels": "-----------------------------------------------------------------------------00000000------------------------02222220------------------------02222220------------------------02222220------------------------02222220------------------------02222220------------------------02222220------------------------00011000--------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0000-------------"
    },
    "sprite": {
     "w": 32,
     "h": 32,
     "q": 1,
     "palette": [
      "#161022",
      "#7a4a25",
      "#c23a3a"
     ],
     "pixels": "-----------------------------------------------------------------------------00000000------------------------02222220------------------------02222220------------------------02222220------------------------02222220------------------------02222220------------------------02222220------------------------00011000--------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0000-------------"
    },
    "equippedSprite": {
     "w": 32,
     "h": 32,
     "q": 1,
     "palette": [
      "#161022",
      "#7a4a25",
      "#c23a3a"
     ],
     "pixels": "-----------------------------------------------------------------------------00000000------------------------02222220------------------------02222220------------------------02222220------------------------02222220------------------------02222220------------------------02222220------------------------00011000--------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0000-------------"
    },
    "equippedSprites": {
     "d": {
      "w": 32,
      "h": 32,
      "q": 1,
      "palette": [
       "#161022",
       "#7a4a25",
       "#c23a3a"
      ],
      "pixels": "-----------------------------------------------------------------------------00000000------------------------02222220------------------------02222220------------------------02222220------------------------02222220------------------------02222220------------------------02222220------------------------00011000--------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0000-------------"
     },
     "u": {
      "w": 32,
      "h": 32,
      "q": 1,
      "palette": [
       "#161022",
       "#7a4a25",
       "#c23a3a"
      ],
      "pixels": "-----------------------------------------------------------------------------00000000------------------------02222220------------------------02222220------------------------02222220------------------------02222220------------------------02222220------------------------02222220------------------------00011000--------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0000-------------"
     },
     "s": {
      "w": 32,
      "h": 32,
      "q": 1,
      "palette": [
       "#161022",
       "#7a4a25",
       "#c23a3a"
      ],
      "pixels": "-----------------------------------------------------------------------------00000000------------------------02222220------------------------02222220------------------------02222220------------------------02222220------------------------02222220------------------------02222220------------------------00011000--------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0110----------------------------0000-------------"
     }
    }
   },
   {
    "id": "kit_espada_treino",
    "kind": "weapon",
    "name": "Espada de Treino",
    "twoHanded": false,
    "skills": [],
    "effects": [],
    "tags": [
     "inicial"
    ],
    "drop": false,
    "wtype": "espada",
    "style": 0,
    "c1": "#9aa1a8",
    "c2": "#8a5a30",
    "damageType": "physical",
    "damageMin": 3,
    "damageMax": 5,
    "stats": {
     "dmg": 4
    },
    "basic": {
     "name": "Golpe de treino",
     "ranged": false,
     "rng": 22,
     "proj": "#ffffff",
     "damageType": "",
     "base": 0,
     "per": 0,
     "charPercent": 100,
     "scaleStat": "none",
     "scalePercent": 0,
     "icon": "blade",
     "desc": "Golpe simples de espada."
    }
   },
   {
    "id": "kit_cajado_aprendiz",
    "kind": "weapon",
    "name": "Cajado de Aprendiz",
    "twoHanded": true,
    "skills": [],
    "effects": [],
    "tags": [
     "inicial"
    ],
    "drop": false,
    "wtype": "cajado",
    "style": 2,
    "c1": "#6a4a2a",
    "c2": "#9bd4ff",
    "damageType": "magic",
    "damageMin": 2,
    "damageMax": 4,
    "stats": {
     "dmg": 3,
     "mp": 10
    },
    "basic": {
     "name": "Faísca",
     "ranged": true,
     "rng": 80,
     "proj": "#9bd4ff",
     "damageType": "magic",
     "base": 0,
     "per": 0,
     "charPercent": 100,
     "scaleStat": "none",
     "scalePercent": 0,
     "icon": "orb",
     "desc": "Dispara uma faísca mágica."
    }
   },
   {
    "id": "kit_bastao_novico",
    "kind": "weapon",
    "name": "Bastão de Noviço",
    "twoHanded": true,
    "skills": [],
    "effects": [],
    "tags": [
     "inicial"
    ],
    "drop": false,
    "wtype": "cajado",
    "style": 1,
    "c1": "#8a6a3a",
    "c2": "#f0e08a",
    "damageType": "magic",
    "damageMin": 2,
    "damageMax": 4,
    "stats": {
     "dmg": 3,
     "hp": 10
    },
    "basic": {
     "name": "Luz",
     "ranged": true,
     "rng": 70,
     "proj": "#f0e08a",
     "damageType": "magic",
     "base": 0,
     "per": 0,
     "charPercent": 100,
     "scaleStat": "none",
     "scalePercent": 0,
     "icon": "cross",
     "desc": "Dispara um feixe de luz."
    }
   },
   {
    "id": "kit_gibao",
    "kind": "armor",
    "name": "Gibão Acolchoado",
    "slot": "ch",
    "style": 0,
    "effects": [],
    "tags": [
     "inicial"
    ],
    "drop": false,
    "c1": "#7a6a4a",
    "c2": "#b8a070",
    "stats": {
     "arm": 2,
     "hp": 10
    }
   },
   {
    "id": "kit_tunica_aprendiz",
    "kind": "armor",
    "name": "Túnica de Aprendiz",
    "slot": "ch",
    "style": 2,
    "effects": [],
    "tags": [
     "inicial"
    ],
    "drop": false,
    "c1": "#3a4a8a",
    "c2": "#9bd4ff",
    "stats": {
     "arm": 1,
     "mp": 10
    }
   },
   {
    "id": "kit_manto_novico",
    "kind": "armor",
    "name": "Manto de Noviço",
    "slot": "ch",
    "style": 2,
    "effects": [],
    "tags": [
     "inicial"
    ],
    "drop": false,
    "c1": "#d8d0b8",
    "c2": "#e0c060",
    "stats": {
     "arm": 1,
     "hp": 5,
     "mp": 5
    }
   }
  ],
  "skills": [
   {
    "id": "war_throw",
    "name": "Arremesso",
    "kind": "class",
    "cross": false,
    "effect": "projectile",
    "mana": 10,
    "cd": 2.5,
    "base": 25,
    "per": 5,
    "radius": 0,
    "heal": 0,
    "mpRestore": 0,
    "icon": "blade",
    "c1": "#8a94a8",
    "c2": "#ffffff",
    "color": "#dddddd",
    "weaponTypes": [],
    "tags": [],
    "desc": "Arremessa uma lança teleguiada.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100,
    "castTime": 0.5
   },
   {
    "id": "war_charge",
    "name": "Investida",
    "kind": "class",
    "cross": false,
    "effect": "blink",
    "mana": 20,
    "cd": 7,
    "base": 25,
    "per": 5,
    "radius": 0,
    "heal": 0,
    "mpRestore": 0,
    "icon": "dash",
    "c1": "#d9823a",
    "c2": "#ffe0b0",
    "color": "#ffe0b0",
    "weaponTypes": [],
    "tags": [],
    "desc": "Avança até o alvo e causa dano próximo.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100
   },
   {
    "id": "war_spin",
    "name": "Giro",
    "kind": "class",
    "cross": false,
    "effect": "nova",
    "mana": 20,
    "cd": 6,
    "base": 35,
    "per": 8,
    "radius": 40,
    "heal": 0,
    "mpRestore": 0,
    "icon": "spin",
    "c1": "#b8322a",
    "c2": "#ffd0c0",
    "color": "#ee5555",
    "weaponTypes": [],
    "tags": [],
    "desc": "Atinge todos ao redor.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100
   },
   {
    "id": "war_fury",
    "name": "Fúria",
    "kind": "class",
    "cross": false,
    "effect": "buff",
    "mana": 40,
    "cd": 25,
    "base": 8,
    "per": 0,
    "radius": 0,
    "heal": 0,
    "mpRestore": 0,
    "icon": "flame",
    "c1": "#e0401e",
    "c2": "#ffd84a",
    "color": "#f55",
    "weaponTypes": [],
    "tags": [],
    "desc": "Aumenta dano e velocidade por alguns segundos.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100
   },
   {
    "id": "war_impact",
    "name": "Impacto",
    "kind": "class",
    "cross": false,
    "effect": "nova",
    "mana": 15,
    "cd": 4,
    "base": 50,
    "per": 10,
    "radius": 30,
    "heal": 0,
    "mpRestore": 0,
    "icon": "burst",
    "c1": "#d98a20",
    "c2": "#fff0b0",
    "color": "#ffaa44",
    "weaponTypes": [],
    "tags": [],
    "desc": "Golpe pesado em área.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100
   },
   {
    "id": "war_wall",
    "name": "Muralha",
    "kind": "class",
    "cross": false,
    "effect": "guard",
    "mana": 25,
    "cd": 18,
    "base": 0,
    "per": 0,
    "radius": 0,
    "heal": 0,
    "mpRestore": 0,
    "icon": "shield",
    "c1": "#4a6a96",
    "c2": "#dfe8f5",
    "color": "#9cf",
    "weaponTypes": [],
    "tags": [],
    "desc": "Recebe metade do dano por 6 segundos.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100
   },
   {
    "id": "mag_fire",
    "name": "Bola de fogo",
    "kind": "class",
    "cross": false,
    "effect": "projectile",
    "mana": 15,
    "cd": 2,
    "base": 25,
    "per": 6,
    "radius": 0,
    "heal": 0,
    "mpRestore": 0,
    "icon": "orb",
    "c1": "#d9501a",
    "c2": "#ffd84a",
    "color": "#ffb04a",
    "weaponTypes": [],
    "tags": [],
    "desc": "Dispara uma bola de fogo.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100,
    "castTime": 0.5
   },
   {
    "id": "mag_blink",
    "name": "Salto",
    "kind": "class",
    "cross": false,
    "effect": "blink",
    "mana": 20,
    "cd": 6,
    "base": 0,
    "per": 0,
    "radius": 0,
    "heal": 0,
    "mpRestore": 0,
    "icon": "dash",
    "c1": "#3a8ab8",
    "c2": "#bfefff",
    "color": "#9cf",
    "weaponTypes": [],
    "tags": [],
    "desc": "Teletransporta na direção do mouse.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100
   },
   {
    "id": "mag_nova",
    "name": "Nova",
    "kind": "class",
    "cross": false,
    "effect": "nova",
    "mana": 30,
    "cd": 8,
    "base": 30,
    "per": 8,
    "radius": 48,
    "heal": 0,
    "mpRestore": 0,
    "icon": "burst",
    "c1": "#2f62c0",
    "c2": "#cfe8ff",
    "color": "#77ccff",
    "weaponTypes": [],
    "tags": [],
    "desc": "Explode energia ao redor.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100
   },
   {
    "id": "mag_meteor",
    "name": "Meteoro",
    "kind": "class",
    "cross": false,
    "effect": "meteor",
    "mana": 70,
    "cd": 25,
    "base": 120,
    "per": 12,
    "radius": 36,
    "heal": 0,
    "mpRestore": 0,
    "icon": "meteor",
    "c1": "#a02010",
    "c2": "#ffd84a",
    "color": "#ff6600",
    "weaponTypes": [],
    "tags": [],
    "desc": "Chama um meteoro no local do mouse.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100
   },
   {
    "id": "mag_ice",
    "name": "Raio de gelo",
    "kind": "class",
    "cross": false,
    "effect": "projectile",
    "mana": 20,
    "cd": 3,
    "base": 40,
    "per": 8,
    "radius": 0,
    "heal": 0,
    "mpRestore": 0,
    "icon": "snow",
    "c1": "#3a7ab8",
    "c2": "#e0f6ff",
    "color": "#99eeff",
    "weaponTypes": [],
    "tags": [],
    "desc": "Lança gelo teleguiado.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100,
    "castTime": 0.5
   },
   {
    "id": "mag_shield",
    "name": "Escudo arcano",
    "kind": "class",
    "cross": false,
    "effect": "guard",
    "mana": 30,
    "cd": 18,
    "base": 0,
    "per": 0,
    "radius": 0,
    "heal": 0,
    "mpRestore": 0,
    "icon": "shield",
    "c1": "#6a4ab8",
    "c2": "#e0d0ff",
    "color": "#c9aaff",
    "weaponTypes": [],
    "tags": [],
    "desc": "Recebe metade do dano por 6 segundos.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100
   },
   {
    "id": "hea_ray",
    "name": "Raio sagrado",
    "kind": "class",
    "cross": false,
    "effect": "projectile",
    "mana": 12,
    "cd": 2,
    "base": 18,
    "per": 4,
    "radius": 0,
    "heal": 8,
    "mpRestore": 0,
    "icon": "orb",
    "c1": "#c9a020",
    "c2": "#fff6b0",
    "color": "#ffe66b",
    "weaponTypes": [],
    "tags": [],
    "desc": "Dispara luz e cura ao acertar.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100,
    "castTime": 0.5
   },
   {
    "id": "hea_heal",
    "name": "Cura",
    "kind": "class",
    "cross": true,
    "effect": "heal",
    "mana": 25,
    "cd": 5,
    "base": 60,
    "per": 10,
    "radius": 0,
    "heal": 0,
    "mpRestore": 0,
    "icon": "cross",
    "c1": "#2f9a58",
    "c2": "#bff5cf",
    "color": "#88ee99",
    "weaponTypes": [],
    "tags": [],
    "desc": "Recupera vida.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100
   },
   {
    "id": "hea_aura",
    "name": "Aura sagrada",
    "kind": "class",
    "cross": false,
    "effect": "nova",
    "mana": 30,
    "cd": 8,
    "base": 20,
    "per": 4,
    "radius": 50,
    "heal": 30,
    "mpRestore": 0,
    "icon": "burst",
    "c1": "#2f9a58",
    "c2": "#dfffe0",
    "color": "#77ff77",
    "weaponTypes": [],
    "tags": [],
    "desc": "Fere inimigos e cura.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100
   },
   {
    "id": "hea_rebirth",
    "name": "Renascer",
    "kind": "class",
    "cross": false,
    "effect": "heal",
    "mana": 60,
    "cd": 30,
    "base": 150,
    "per": 20,
    "radius": 0,
    "heal": 0,
    "mpRestore": 30,
    "icon": "flame",
    "c1": "#d9a020",
    "c2": "#ffffff",
    "color": "#fff6a0",
    "weaponTypes": [],
    "tags": [],
    "desc": "Recupera muita vida e mana.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100
   },
   {
    "id": "hea_light",
    "name": "Lança de luz",
    "kind": "class",
    "cross": false,
    "effect": "projectile",
    "mana": 18,
    "cd": 3,
    "base": 35,
    "per": 6,
    "radius": 0,
    "heal": 0,
    "mpRestore": 0,
    "icon": "blade",
    "c1": "#c9a020",
    "c2": "#ffffff",
    "color": "#fff6a0",
    "weaponTypes": [],
    "tags": [],
    "desc": "Lança de luz teleguiada.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100,
    "castTime": 0.5
   },
   {
    "id": "hea_shield",
    "name": "Escudo divino",
    "kind": "class",
    "cross": false,
    "effect": "guard",
    "mana": 30,
    "cd": 18,
    "base": 0,
    "per": 0,
    "radius": 0,
    "heal": 0,
    "mpRestore": 0,
    "icon": "shield",
    "c1": "#b8962a",
    "c2": "#fff6c0",
    "color": "#fff6c0",
    "weaponTypes": [],
    "tags": [],
    "desc": "Recebe metade do dano por 6 segundos.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100
   },
   {
    "id": "skill_acid",
    "name": "Cuspe ácido",
    "kind": "monster",
    "effect": "projectile",
    "mana": 10,
    "cd": 7,
    "base": 12,
    "per": 0,
    "radius": 0,
    "icon": "orb",
    "c1": "#498a3a",
    "c2": "#d9ff9a",
    "color": "#b5e85a",
    "weaponTypes": [],
    "tags": [
     "veneno"
    ],
    "desc": "Ataque ácido da gosma.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100,
    "castTime": 0.5
   },
   {
    "id": "skill_crush",
    "name": "Golpe esmagador",
    "kind": "monster",
    "effect": "nova",
    "mana": 12,
    "cd": 6,
    "base": 25,
    "per": 0,
    "radius": 28,
    "icon": "axe",
    "c1": "#777c84",
    "c2": "#f4d28a",
    "color": "#fa6",
    "weaponTypes": [],
    "tags": [
     "impacto"
    ],
    "desc": "Ataque pesado do esqueleto.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100
   },
   {
    "id": "skill_roar",
    "name": "Rugido arcano",
    "kind": "monster",
    "effect": "nova",
    "mana": 25,
    "cd": 10,
    "base": 25,
    "per": 0,
    "radius": 48,
    "icon": "burst",
    "c1": "#5a428a",
    "c2": "#e0d0ff",
    "color": "#b9a2ff",
    "weaponTypes": [],
    "tags": [
     "chefe"
    ],
    "desc": "Ataque em área do Guardião.",
    "category": "ability",
    "scaleStat": "weaponPower",
    "scalePercent": 100
   },
   {
    "id": "m_wolf",
    "name": "Mordida",
    "category": "ability",
    "effect": "nova",
    "mana": 8,
    "cd": 5,
    "base": 16,
    "per": 0,
    "radius": 24,
    "monRange": 24,
    "damageType": "physical",
    "scaleStat": "none",
    "scalePercent": 0,
    "charPercent": 0,
    "effects": [
     {
      "type": "bleed",
      "chance": 60,
      "dur": 4,
      "power": 2,
      "pct": 10,
      "src": "physical"
     }
    ],
    "color": "#ffd9a0",
    "vfx": "arcane",
    "tags": [
     "monstro"
    ],
    "cross": false
   },
   {
    "id": "m_bat",
    "name": "Sonar",
    "category": "ability",
    "effect": "nova",
    "mana": 10,
    "cd": 6,
    "base": 8,
    "per": 0,
    "radius": 50,
    "monRange": 50,
    "damageType": "magic",
    "scaleStat": "magicPower",
    "scalePercent": 100,
    "charPercent": 0,
    "effects": [
     {
      "type": "slow",
      "chance": 100,
      "dur": 3,
      "power": 30
     }
    ],
    "color": "#9bd4ff",
    "vfx": "arcane",
    "tags": [
     "monstro"
    ],
    "cross": false
   },
   {
    "id": "m_spider",
    "name": "Veneno",
    "category": "ability",
    "effect": "nova",
    "mana": 12,
    "cd": 7,
    "base": 10,
    "per": 0,
    "radius": 70,
    "monRange": 70,
    "damageType": "magic",
    "scaleStat": "magicPower",
    "scalePercent": 100,
    "charPercent": 0,
    "effects": [
     {
      "type": "poison",
      "chance": 100,
      "dur": 5,
      "power": 2,
      "pct": 10,
      "src": "magic"
     }
    ],
    "color": "#9bd4ff",
    "vfx": "arcane",
    "tags": [
     "monstro"
    ],
    "cross": false
   },
   {
    "id": "m_shroom",
    "name": "Esporos",
    "category": "ability",
    "effect": "nova",
    "mana": 14,
    "cd": 8,
    "base": 10,
    "per": 0,
    "radius": 40,
    "monRange": 40,
    "damageType": "magic",
    "scaleStat": "magicPower",
    "scalePercent": 100,
    "charPercent": 0,
    "effects": [
     {
      "type": "poison",
      "chance": 100,
      "dur": 6,
      "power": 2,
      "pct": 8,
      "src": "magic"
     }
    ],
    "color": "#9bd4ff",
    "vfx": "arcane",
    "tags": [
     "monstro"
    ],
    "cross": false
   },
   {
    "id": "m_crab",
    "name": "Pinça",
    "category": "ability",
    "effect": "nova",
    "mana": 8,
    "cd": 5,
    "base": 23,
    "per": 0,
    "radius": 22,
    "monRange": 22,
    "damageType": "physical",
    "scaleStat": "none",
    "scalePercent": 0,
    "charPercent": 0,
    "effects": [
     {
      "type": "bleed",
      "chance": 70,
      "dur": 4,
      "power": 2,
      "pct": 10,
      "src": "physical"
     }
    ],
    "color": "#ffd9a0",
    "vfx": "arcane",
    "tags": [
     "monstro"
    ],
    "cross": false
   },
   {
    "id": "m_ghost",
    "name": "Lamento",
    "category": "ability",
    "effect": "nova",
    "mana": 14,
    "cd": 8,
    "base": 14,
    "per": 0,
    "radius": 60,
    "monRange": 60,
    "damageType": "magic",
    "scaleStat": "magicPower",
    "scalePercent": 100,
    "charPercent": 0,
    "effects": [
     {
      "type": "weak",
      "chance": 100,
      "dur": 6,
      "power": 25
     },
     {
      "type": "vuln",
      "chance": 60,
      "dur": 5,
      "power": 20
     }
    ],
    "color": "#9bd4ff",
    "vfx": "arcane",
    "tags": [
     "monstro"
    ],
    "cross": false
   },
   {
    "id": "m_goblin",
    "name": "Facada",
    "category": "ability",
    "effect": "nova",
    "mana": 6,
    "cd": 4,
    "base": 17,
    "per": 0,
    "radius": 22,
    "monRange": 22,
    "damageType": "physical",
    "scaleStat": "none",
    "scalePercent": 0,
    "charPercent": 0,
    "effects": [
     {
      "type": "bleed",
      "chance": 50,
      "dur": 4,
      "power": 2,
      "pct": 10,
      "src": "physical"
     }
    ],
    "color": "#ffd9a0",
    "vfx": "arcane",
    "tags": [
     "monstro"
    ],
    "cross": false
   }
  ],
  "passives": [
   {
    "id": "p_pele_ferro",
    "name": "Pele de Ferro",
    "desc": "Defesa física aumentada.",
    "arm": 12
   },
   {
    "id": "p_vigor",
    "name": "Vigor",
    "desc": "Mais vida máxima.",
    "hp": 15
   },
   {
    "id": "p_mente_afiada",
    "name": "Mente Afiada",
    "desc": "Mais Inteligência e mana.",
    "I": 3,
    "mp": 10
   },
   {
    "id": "p_pes_ligeiros",
    "name": "Pés Ligeiros",
    "desc": "Movimento mais rápido.",
    "moveSpeed": 8
   },
   {
    "id": "p_furia_constante",
    "name": "Fúria Constante",
    "desc": "Dano aumentado.",
    "dmg": 10
   },
   {
    "id": "p_sede_batalha",
    "name": "Sede de Batalha",
    "desc": "Ataques mais rápidos.",
    "attackSpeed": 10
   },
   {
    "id": "p_resistencia_arcana",
    "name": "Resistência Arcana",
    "desc": "Defesa mágica aumentada.",
    "magicArm": 15
   }
  ],
  "monsters": [
   {
    "id": "sl",
    "name": "Gosma",
    "base": "sl",
    "classId": "mag",
    "bossType": "normal",
    "tags": [
     "gosma"
    ],
    "minLevel": 1,
    "maxLevel": 999,
    "weight": 1,
    "stats": {
     "F": 10,
     "A": 3,
     "I": 3
    },
    "xp": 10,
    "gold": 3,
    "aggro": 60,
    "equipment": [
     "sw"
    ],
    "drops": [
     {
      "id": "he1",
      "chance": 22
     }
    ],
    "skills": [
     "skill_acid"
    ],
    "sounds": {},
    "sprite": {
     "w": 40,
     "h": 24,
     "q": 1,
     "palette": [
      "#7a1f2b",
      "#c08c4c",
      "#8ca85a",
      "#1b1226",
      "#b5bd78",
      "#435829",
      "#607d3a",
      "#e6d89a",
      "#718848",
      "#7da24b",
      "#b6da75",
      "#30382c",
      "#9eac67",
      "#354432",
      "#ebf69c",
      "#526a31",
      "#e2d9b5"
     ],
     "pixels": "--------------------------------------------------------------------------------------------------------11111111111---------------------00000000000000-----1-------------------111000------00------1-----------------1100033333-----00------11---------------00339aaaa933-----0------1-------------000e444444422293---00-----1-----------001-944444444222293---0-----1----------00-13624777422777269----0----1---------00-1-36227bb222bb726f----0----1---------0--1-3688222222228865----0----1---------0--11-588222222228853---0----11----------0--1-35c662gdd66c53----0--111-----------00--1--3355555533-----0011----------------00-11--333333-----110--------------------000-111----111111-00-----------------------00011111------00--1-----------------------0000011111000111-----------------------------00000------------------------------------------------------------------------------------------------------------------------------------------------------------------------------"
    },
    "animation": {
     "idle": [],
     "walk": [],
     "attack": []
    },
    "per": {
     "F": 1,
     "A": 1,
     "I": 1
    }
   },
   {
    "id": "sk",
    "name": "Esqueleto",
    "base": "sk",
    "classId": "war",
    "bossType": "normal",
    "tags": [
     "morto-vivo"
    ],
    "minLevel": 4,
    "maxLevel": 999,
    "weight": 1,
    "stats": {
     "F": 16,
     "A": 5,
     "I": 5
    },
    "xp": 25,
    "gold": 8,
    "aggro": 75,
    "equipment": [
     "sw",
     "he1"
    ],
    "drops": [
     {
      "id": "sw2",
      "chance": 11
     },
     {
      "id": "le2",
      "chance": 11
     }
    ],
    "skills": [
     "skill_crush"
    ],
    "per": {
     "F": 1,
     "A": 1,
     "I": 1
    }
   },
   {
    "id": "gob",
    "name": "Goblin do Serrote",
    "base": "goblinSaw",
    "classId": "war",
    "bossType": "normal",
    "tags": [
     "goblin"
    ],
    "minLevel": 1,
    "maxLevel": 999,
    "weight": 0.6,
    "stats": {
     "F": 17,
     "A": 10,
     "I": 5
    },
    "xp": 55,
    "gold": 24,
    "aggro": 90,
    "equipment": [
     "saw"
    ],
    "drops": [],
    "skills": [],
    "per": {
     "F": 1,
     "A": 1,
     "I": 1
    }
   },
   {
    "id": "sprout",
    "name": "Broto Vivo",
    "base": "sprout",
    "classId": "war",
    "bossType": "normal",
    "minLevel": 1,
    "maxLevel": 999,
    "weight": 0.8,
    "stats": {
     "F": 9,
     "A": 5,
     "I": 3
    },
    "xp": 18,
    "gold": 4,
    "aggro": 65,
    "equipment": [],
    "drops": [
     {
      "id": "wood",
      "chance": 100
     },
     {
      "id": "magicWood",
      "chance": 100
     }
    ],
    "skills": [],
    "per": {
     "F": 1,
     "A": 1,
     "I": 1
    }
   },
   {
    "id": "boss",
    "name": "Guardião da Ilha",
    "base": "sk",
    "classId": "mag",
    "bossType": "boss",
    "tags": [
     "chefe"
    ],
    "minLevel": 1,
    "maxLevel": 999,
    "weight": 1,
    "stats": {
     "F": 25,
     "A": 8,
     "I": 10
    },
    "xp": 180,
    "gold": 80,
    "aggro": 110,
    "equipment": [
     "sw3",
     "ch2",
     "he2"
    ],
    "drops": [
     {
      "id": "sw3",
      "chance": 13.2
     },
     {
      "id": "ri3",
      "chance": 13.2
     }
    ],
    "skills": [
     "skill_roar"
    ],
    "per": {
     "F": 1,
     "A": 1,
     "I": 1
    }
   },
   {
    "id": "wolf",
    "name": "Lobo",
    "base": "wolf",
    "classId": "war",
    "bossType": "normal",
    "tags": [],
    "minLevel": 5,
    "maxLevel": 999,
    "weight": 2,
    "zone": "",
    "stats": {
     "F": 14,
     "A": 9,
     "I": 3
    },
    "xp": 22,
    "gold": 7,
    "aggro": 80,
    "equipment": [],
    "drops": [],
    "skills": [
     "m_wolf"
    ],
    "attackSpeed": 1.2,
    "moveSpeed": 48,
    "hpMult": 0.636,
    "dmgMult": 0.238,
    "per": {
     "F": 1,
     "A": 1,
     "I": 1
    }
   },
   {
    "id": "bat",
    "name": "Morcego",
    "base": "bat",
    "classId": "war",
    "bossType": "normal",
    "tags": [],
    "minLevel": 1,
    "maxLevel": 999,
    "weight": 2,
    "zone": "",
    "stats": {
     "F": 6,
     "A": 12,
     "I": 4
    },
    "xp": 14,
    "gold": 4,
    "aggro": 90,
    "equipment": [],
    "drops": [],
    "skills": [
     "m_bat"
    ],
    "attackSpeed": 1,
    "moveSpeed": 54,
    "hpMult": 0.5,
    "dmgMult": 0.389,
    "sounds": {},
    "animation": {
     "idle": [],
     "walk": [],
     "attack": [],
     "durations": {}
    },
    "per": {
     "F": 1,
     "A": 1,
     "I": 1
    }
   },
   {
    "id": "spider",
    "name": "Aranha",
    "base": "spider",
    "classId": "war",
    "bossType": "normal",
    "tags": [],
    "minLevel": 3,
    "maxLevel": 999,
    "weight": 2,
    "zone": "far",
    "stats": {
     "F": 10,
     "A": 8,
     "I": 5
    },
    "xp": 20,
    "gold": 6,
    "aggro": 70,
    "equipment": [],
    "drops": [],
    "skills": [
     "m_spider"
    ],
    "attackSpeed": 1.3,
    "moveSpeed": 34,
    "hpMult": 0.667,
    "dmgMult": 0.3,
    "per": {
     "F": 1,
     "A": 1,
     "I": 1
    }
   },
   {
    "id": "shroom",
    "name": "Cogumelo",
    "base": "shroom",
    "classId": "war",
    "bossType": "normal",
    "tags": [],
    "minLevel": 6,
    "maxLevel": 999,
    "weight": 1.5,
    "zone": "",
    "stats": {
     "F": 20,
     "A": 2,
     "I": 6
    },
    "xp": 30,
    "gold": 10,
    "aggro": 55,
    "equipment": [],
    "drops": [],
    "skills": [
     "m_shroom"
    ],
    "attackSpeed": 2,
    "moveSpeed": 18,
    "hpMult": 1,
    "dmgMult": 0.183,
    "per": {
     "F": 1,
     "A": 1,
     "I": 1
    }
   },
   {
    "id": "crab",
    "name": "Caranguejo",
    "base": "crab",
    "classId": "war",
    "bossType": "normal",
    "tags": [],
    "minLevel": 2,
    "maxLevel": 999,
    "weight": 2,
    "zone": "coast",
    "stats": {
     "F": 16,
     "A": 4,
     "I": 3
    },
    "xp": 26,
    "gold": 9,
    "aggro": 60,
    "equipment": [],
    "drops": [],
    "skills": [
     "m_crab"
    ],
    "attackSpeed": 1.7,
    "moveSpeed": 26,
    "hpMult": 0.833,
    "dmgMult": 0.271,
    "per": {
     "F": 1,
     "A": 1,
     "I": 1
    }
   },
   {
    "id": "ghost",
    "name": "Fantasma",
    "base": "ghost",
    "classId": "war",
    "bossType": "normal",
    "tags": [],
    "minLevel": 8,
    "maxLevel": 999,
    "weight": 1.2,
    "zone": "far",
    "stats": {
     "F": 8,
     "A": 7,
     "I": 14
    },
    "xp": 34,
    "gold": 12,
    "aggro": 100,
    "equipment": [],
    "drops": [],
    "skills": [
     "m_ghost"
    ],
    "attackSpeed": 1.6,
    "moveSpeed": 30,
    "hpMult": 1,
    "dmgMult": 0.25,
    "per": {
     "F": 1,
     "A": 1,
     "I": 1
    }
   },
   {
    "id": "goblin",
    "name": "Goblin",
    "base": "goblin",
    "classId": "war",
    "bossType": "normal",
    "tags": [],
    "minLevel": 4,
    "maxLevel": 999,
    "weight": 2,
    "zone": "",
    "stats": {
     "F": 12,
     "A": 10,
     "I": 4
    },
    "xp": 28,
    "gold": 11,
    "aggro": 85,
    "equipment": [],
    "drops": [],
    "skills": [
     "m_goblin"
    ],
    "attackSpeed": 1.3,
    "moveSpeed": 40,
    "hpMult": 0.75,
    "dmgMult": 0.306,
    "per": {
     "F": 1,
     "A": 1,
     "I": 1
    }
   },
   {
    "id": "rato",
    "name": "Rato",
    "base": "sl",
    "classId": "war",
    "bossType": "normal",
    "tags": [
     "Animal"
    ],
    "minLevel": 1,
    "maxLevel": 999,
    "weight": 100,
    "zone": "",
    "stats": {
     "F": 15,
     "A": 10,
     "I": 5
    },
    "xp": 15,
    "gold": 5,
    "aggro": 65,
    "equipment": [],
    "drops": [
     {
      "id": "cajado_arcano_copia",
      "chance": 22
     }
    ],
    "skills": [],
    "attackSpeed": 1,
    "sprite": {
     "w": 64,
     "h": 20,
     "q": 1,
     "palette": [
      "#000000",
      "#ff9f80",
      "#c27961",
      "#ffcaa3",
      "#ffe2b6",
      "#9e634f",
      "#7a1f2b"
     ],
     "pixels": "---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------433------------------------------------------------------------41113----------------------------------------000000000---------01111100----------------------------------000000000000000000000001111000000000--------------------433330000000000000000000000000001100066000003----------433333333111111000000000000000000000000000000000000005---------411122222222221100000000000000000000000000000000000000--------431225----------3220000000000000000000000000000000000000------43225----------------00000000000000000000000000000000----------415----------------------000000000000000000000000000-----------425------------------------0000000000000000000000000-----------45--------------------------0000000000000000000000000----------------------------------------0000000000000000000000000---------------------------------------025---00000-----025--0000-----------------------------------------------2223---------22223---------",
     "glow": "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
     "glowRadius": 8
    },
    "animation": {
     "durations": {
      "walk": 0.5
     },
     "idle": [],
     "walk": [
      {
       "w": 64,
       "h": 20,
       "q": 1,
       "palette": [
        "#000000",
        "#ff9f80",
        "#c27961",
        "#ffcaa3",
        "#ffe2b6",
        "#9e634f",
        "#7a1f2b"
       ],
       "pixels": "---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------433------------------------------------------------------------41113----------------------------------------000000000---------01111100----------------------------------000000000000000000000001111000000000--------------------433330000000000000000000000000001100066000003----------433333333111111000000000000000000000000000000000000005---------411122222222221100000000000000000000000000000000000000--------431225----------3220000000000000000000000000000000000000------43225----------------00000000000000000000000000000000----------415----------------------000000000000000000000000000-----------425------------------------0000000000000000000000000-----------45--------------------------0000000000000000000000000----------------------------------------0000000000000000000000000----------------------------------------0000-0025------00000025-----------------------------------------3225-----------3225---------------",
       "glow": "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
       "glowRadius": 3
      },
      {
       "w": 64,
       "h": 20,
       "q": 1,
       "palette": [
        "#000000",
        "#ff9f80",
        "#c27961",
        "#ffcaa3",
        "#ffe2b6",
        "#9e634f",
        "#7a1f2b"
       ],
       "pixels": "---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------433------------------------------------------------------------41113----------------------------------------000000000---------01111100----------------------------------000000000000000000000001111000000000--------------------433330000000000000000000000000001100066000003----------433333333111111000000000000000000000000000000000000005---------411122222222221100000000000000000000000000000000000000--------431225----------3220000000000000000000000000000000000000------43225----------------00000000000000000000000000000000----------415----------------------000000000000000000000000000-----------425------------------------0000000000000000000000000-----------45--------------------------0000000000000000000000000----------------------------------------0000000000000000000000000---------------------------------------025---00000-----025--0000-----------------------------------------------2223---------22223---------",
       "glow": "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
       "glowRadius": 8
      },
      {
       "w": 64,
       "h": 20,
       "q": 1,
       "palette": [
        "#000000",
        "#ff9f80",
        "#c27961",
        "#ffcaa3",
        "#ffe2b6",
        "#9e634f",
        "#7a1f2b"
       ],
       "pixels": "---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------433------------------------------------------------------------41113----------------------------------------000000000---------01111100----------------------------------000000000000000000000001111000000000--------------------433330000000000000000000000000001100066000003----------433333333111111000000000000000000000000000000000000005---------411122222222221100000000000000000000000000000000000000--------431225----------3220000000000000000000000000000000000000------43225----------------00000000000000000000000000000000----------415----------------------000000000000000000000000000-----------425------------------------0000000000000000000000000-----------45--------------------------0000000000000000000000000----------------------------------------0000000000000000000000000----------------------------------------0000-0025------00000025-----------------------------------------3225-----------3225---------------",
       "glow": "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
       "glowRadius": 3
      }
     ],
     "attack": []
    },
    "size": 50,
    "per": {
     "F": 5,
     "A": 3,
     "I": 2
    }
   }
  ],
  "effects": []
 },
 "mundo": {
  "arvores": [
   {
    "x": 399,
    "y": 496
   },
   {
    "x": 391,
    "y": 484
   },
   {
    "x": 385,
    "y": 471
   },
   {
    "x": 381,
    "y": 454
   },
   {
    "x": 379,
    "y": 439
   },
   {
    "x": 377,
    "y": 423
   },
   {
    "x": 388,
    "y": 411
   },
   {
    "x": 397,
    "y": 398
   },
   {
    "x": 400,
    "y": 430
   },
   {
    "x": 396,
    "y": 449
   },
   {
    "x": 408,
    "y": 414
   },
   {
    "x": 419,
    "y": 405
   },
   {
    "x": 421,
    "y": 420
   },
   {
    "x": 420,
    "y": 440
   },
   {
    "x": 419,
    "y": 456
   },
   {
    "x": 400,
    "y": 463
   },
   {
    "x": 408,
    "y": 476
   },
   {
    "x": 418,
    "y": 497
   },
   {
    "x": 424,
    "y": 482
   },
   {
    "x": 428,
    "y": 468
   },
   {
    "x": 432,
    "y": 449
   },
   {
    "x": 436,
    "y": 435
   },
   {
    "x": 435,
    "y": 407
   },
   {
    "x": 453,
    "y": 402
   },
   {
    "x": 467,
    "y": 398
   },
   {
    "x": 422,
    "y": 382
   },
   {
    "x": 402,
    "y": 379
   },
   {
    "x": 377,
    "y": 381
   },
   {
    "x": 482,
    "y": 390
   },
   {
    "x": 497,
    "y": 390
   },
   {
    "x": 513,
    "y": 391
   },
   {
    "x": 528,
    "y": 390
   },
   {
    "x": 542,
    "y": 389
   },
   {
    "x": 557,
    "y": 389
   },
   {
    "x": 571,
    "y": 389
   },
   {
    "x": 462,
    "y": 413
   },
   {
    "x": 447,
    "y": 421
   },
   {
    "x": 495,
    "y": 404
   },
   {
    "x": 479,
    "y": 409
   },
   {
    "x": 446,
    "y": 446
   },
   {
    "x": 456,
    "y": 434
   },
   {
    "x": 472,
    "y": 423
   },
   {
    "x": 445,
    "y": 460
   },
   {
    "x": 438,
    "y": 478
   },
   {
    "x": 435,
    "y": 492
   },
   {
    "x": 433,
    "y": 507
   },
   {
    "x": 427,
    "y": 521
   },
   {
    "x": 422,
    "y": 536
   },
   {
    "x": 410,
    "y": 524
   },
   {
    "x": 403,
    "y": 511
   },
   {
    "x": 396,
    "y": 524
   },
   {
    "x": 394,
    "y": 538
   },
   {
    "x": 384,
    "y": 515
   },
   {
    "x": 383,
    "y": 501
   },
   {
    "x": 389,
    "y": 552
   },
   {
    "x": 394,
    "y": 567
   },
   {
    "x": 400,
    "y": 582
   },
   {
    "x": 404,
    "y": 597
   },
   {
    "x": 407,
    "y": 612
   },
   {
    "x": 408,
    "y": 567
   },
   {
    "x": 409,
    "y": 551
   },
   {
    "x": 422,
    "y": 565
   },
   {
    "x": 422,
    "y": 580
   },
   {
    "x": 422,
    "y": 594
   },
   {
    "x": 421,
    "y": 610
   },
   {
    "x": 417,
    "y": 624
   },
   {
    "x": 409,
    "y": 637
   },
   {
    "x": 390,
    "y": 600
   },
   {
    "x": 391,
    "y": 818
   },
   {
    "x": 399,
    "y": 832
   },
   {
    "x": 404,
    "y": 849
   },
   {
    "x": 406,
    "y": 863
   },
   {
    "x": 404,
    "y": 878
   },
   {
    "x": 403,
    "y": 892
   },
   {
    "x": 402,
    "y": 908
   },
   {
    "x": 401,
    "y": 924
   },
   {
    "x": 401,
    "y": 938
   },
   {
    "x": 400,
    "y": 953
   },
   {
    "x": 399,
    "y": 969
   },
   {
    "x": 397,
    "y": 987
   },
   {
    "x": 396,
    "y": 1003
   },
   {
    "x": 395,
    "y": 1018
   },
   {
    "x": 392,
    "y": 1034
   },
   {
    "x": 391,
    "y": 1048
   },
   {
    "x": 390,
    "y": 1062
   },
   {
    "x": 389,
    "y": 1077
   },
   {
    "x": 389,
    "y": 1092
   },
   {
    "x": 389,
    "y": 1106
   },
   {
    "x": 389,
    "y": 1123
   },
   {
    "x": 391,
    "y": 1137
   },
   {
    "x": 399,
    "y": 1150
   },
   {
    "x": 409,
    "y": 1160
   },
   {
    "x": 421,
    "y": 1170
   },
   {
    "x": 433,
    "y": 1178
   },
   {
    "x": 449,
    "y": 1180
   },
   {
    "x": 463,
    "y": 1182
   },
   {
    "x": 477,
    "y": 1183
   },
   {
    "x": 486,
    "y": 1172
   },
   {
    "x": 498,
    "y": 1163
   },
   {
    "x": 508,
    "y": 1152
   },
   {
    "x": 508,
    "y": 1136
   },
   {
    "x": 492,
    "y": 1134
   },
   {
    "x": 479,
    "y": 1141
   },
   {
    "x": 465,
    "y": 1147
   },
   {
    "x": 451,
    "y": 1152
   },
   {
    "x": 434,
    "y": 1144
   },
   {
    "x": 424,
    "y": 1132
   },
   {
    "x": 415,
    "y": 1119
   },
   {
    "x": 409,
    "y": 1101
   },
   {
    "x": 483,
    "y": 1123
   },
   {
    "x": 471,
    "y": 1112
   },
   {
    "x": 457,
    "y": 1111
   },
   {
    "x": 439,
    "y": 1122
   },
   {
    "x": 480,
    "y": 1159
   },
   {
    "x": 485,
    "y": 1107
   },
   {
    "x": 427,
    "y": 1157
   },
   {
    "x": 445,
    "y": 1166
   },
   {
    "x": 466,
    "y": 1098
   },
   {
    "x": 451,
    "y": 1087
   },
   {
    "x": 430,
    "y": 1083
   },
   {
    "x": 412,
    "y": 1087
   },
   {
    "x": 484,
    "y": 1083
   },
   {
    "x": 478,
    "y": 1066
   },
   {
    "x": 464,
    "y": 1061
   },
   {
    "x": 440,
    "y": 1071
   },
   {
    "x": 462,
    "y": 1129
   },
   {
    "x": 456,
    "y": 1048
   },
   {
    "x": 437,
    "y": 1045
   },
   {
    "x": 419,
    "y": 1051
   },
   {
    "x": 411,
    "y": 1070
   },
   {
    "x": 428,
    "y": 1098
   },
   {
    "x": 444,
    "y": 1105
   },
   {
    "x": 473,
    "y": 1045
   },
   {
    "x": 456,
    "y": 1033
   },
   {
    "x": 424,
    "y": 1037
   },
   {
    "x": 437,
    "y": 1027
   },
   {
    "x": 454,
    "y": 1018
   },
   {
    "x": 445,
    "y": 1005
   },
   {
    "x": 424,
    "y": 1015
   },
   {
    "x": 476,
    "y": 1021
   },
   {
    "x": 476,
    "y": 1003
   },
   {
    "x": 472,
    "y": 985
   },
   {
    "x": 463,
    "y": 969
   },
   {
    "x": 441,
    "y": 965
   },
   {
    "x": 416,
    "y": 981
   },
   {
    "x": 410,
    "y": 1031
   },
   {
    "x": 453,
    "y": 945
   },
   {
    "x": 443,
    "y": 934
   },
   {
    "x": 418,
    "y": 945
   },
   {
    "x": 471,
    "y": 942
   },
   {
    "x": 471,
    "y": 921
   },
   {
    "x": 468,
    "y": 905
   },
   {
    "x": 459,
    "y": 890
   },
   {
    "x": 442,
    "y": 894
   },
   {
    "x": 429,
    "y": 909
   },
   {
    "x": 418,
    "y": 929
   },
   {
    "x": 445,
    "y": 912
   },
   {
    "x": 453,
    "y": 868
   },
   {
    "x": 449,
    "y": 851
   },
   {
    "x": 434,
    "y": 871
   },
   {
    "x": 424,
    "y": 895
   },
   {
    "x": 419,
    "y": 966
   },
   {
    "x": 450,
    "y": 825
   },
   {
    "x": 449,
    "y": 810
   },
   {
    "x": 437,
    "y": 841
   },
   {
    "x": 411,
    "y": 995
   },
   {
    "x": 421,
    "y": 861
   },
   {
    "x": 419,
    "y": 847
   },
   {
    "x": 420,
    "y": 832
   },
   {
    "x": 420,
    "y": 818
   },
   {
    "x": 420,
    "y": 878
   },
   {
    "x": 432,
    "y": 990
   },
   {
    "x": 463,
    "y": 997
   },
   {
    "x": 416,
    "y": 1145
   },
   {
    "x": 399,
    "y": 1172
   },
   {
    "x": 389,
    "y": 1162
   },
   {
    "x": 372,
    "y": 1090
   },
   {
    "x": 372,
    "y": 1076
   },
   {
    "x": 372,
    "y": 1010
   },
   {
    "x": 381,
    "y": 998
   },
   {
    "x": 381,
    "y": 927
   },
   {
    "x": 381,
    "y": 912
   },
   {
    "x": 379,
    "y": 897
   },
   {
    "x": 379,
    "y": 883
   },
   {
    "x": 385,
    "y": 868
   },
   {
    "x": 489,
    "y": 1050
   },
   {
    "x": 495,
    "y": 1064
   },
   {
    "x": 500,
    "y": 1079
   },
   {
    "x": 505,
    "y": 1093
   },
   {
    "x": 512,
    "y": 1107
   },
   {
    "x": 523,
    "y": 1118
   },
   {
    "x": 536,
    "y": 1126
   },
   {
    "x": 549,
    "y": 1134
   },
   {
    "x": 565,
    "y": 1139
   },
   {
    "x": 580,
    "y": 1143
   },
   {
    "x": 595,
    "y": 1147
   },
   {
    "x": 609,
    "y": 1149
   },
   {
    "x": 623,
    "y": 1149
   },
   {
    "x": 637,
    "y": 1148
   },
   {
    "x": 654,
    "y": 1147
   },
   {
    "x": 668,
    "y": 1147
   },
   {
    "x": 617,
    "y": 1134
   },
   {
    "x": 603,
    "y": 1132
   },
   {
    "x": 588,
    "y": 1125
   },
   {
    "x": 575,
    "y": 1119
   },
   {
    "x": 562,
    "y": 1109
   },
   {
    "x": 552,
    "y": 1099
   },
   {
    "x": 550,
    "y": 1084
   },
   {
    "x": 536,
    "y": 1086
   },
   {
    "x": 520,
    "y": 1086
   },
   {
    "x": 537,
    "y": 1101
   },
   {
    "x": 560,
    "y": 1123
   },
   {
    "x": 635,
    "y": 1162
   },
   {
    "x": 624,
    "y": 1172
   },
   {
    "x": 616,
    "y": 1186
   },
   {
    "x": 601,
    "y": 1173
   },
   {
    "x": 570,
    "y": 1153
   },
   {
    "x": 555,
    "y": 1150
   },
   {
    "x": 538,
    "y": 1143
   },
   {
    "x": 522,
    "y": 1140
   },
   {
    "x": 591,
    "y": 1163
   },
   {
    "x": 579,
    "y": 1173
   },
   {
    "x": 525,
    "y": 1157
   },
   {
    "x": 516,
    "y": 1169
   },
   {
    "x": 506,
    "y": 1179
   },
   {
    "x": 742,
    "y": 124
   },
   {
    "x": 827,
    "y": 122
   },
   {
    "x": 486,
    "y": 130
   },
   {
    "x": 578,
    "y": 132
   },
   {
    "x": 590,
    "y": 134
   },
   {
    "x": 693,
    "y": 137
   },
   {
    "x": 708,
    "y": 136
   },
   {
    "x": 741,
    "y": 138
   },
   {
    "x": 761,
    "y": 135
   },
   {
    "x": 784,
    "y": 128
   },
   {
    "x": 849,
    "y": 131
   },
   {
    "x": 937,
    "y": 128
   },
   {
    "x": 973,
    "y": 135
   },
   {
    "x": 1007,
    "y": 133
   },
   {
    "x": 441,
    "y": 150
   },
   {
    "x": 485,
    "y": 148
   },
   {
    "x": 549,
    "y": 145
   },
   {
    "x": 579,
    "y": 149
   },
   {
    "x": 606,
    "y": 147
   },
   {
    "x": 627,
    "y": 141
   },
   {
    "x": 675,
    "y": 147
   },
   {
    "x": 688,
    "y": 149
   },
   {
    "x": 782,
    "y": 145
   },
   {
    "x": 797,
    "y": 145
   },
   {
    "x": 832,
    "y": 148
   },
   {
    "x": 964,
    "y": 150
   },
   {
    "x": 1027,
    "y": 147
   },
   {
    "x": 523,
    "y": 161
   },
   {
    "x": 565,
    "y": 160
   },
   {
    "x": 629,
    "y": 161
   },
   {
    "x": 652,
    "y": 155
   },
   {
    "x": 710,
    "y": 154
   },
   {
    "x": 733,
    "y": 161
   },
   {
    "x": 745,
    "y": 155
   },
   {
    "x": 952,
    "y": 155
   },
   {
    "x": 979,
    "y": 163
   },
   {
    "x": 992,
    "y": 156
   },
   {
    "x": 1015,
    "y": 163
   },
   {
    "x": 1030,
    "y": 162
   },
   {
    "x": 377,
    "y": 175
   },
   {
    "x": 433,
    "y": 171
   },
   {
    "x": 468,
    "y": 171
   },
   {
    "x": 489,
    "y": 169
   },
   {
    "x": 509,
    "y": 170
   },
   {
    "x": 537,
    "y": 168
   },
   {
    "x": 565,
    "y": 174
   },
   {
    "x": 591,
    "y": 177
   },
   {
    "x": 609,
    "y": 170
   },
   {
    "x": 629,
    "y": 177
   },
   {
    "x": 666,
    "y": 174
   },
   {
    "x": 691,
    "y": 168
   },
   {
    "x": 782,
    "y": 172
   },
   {
    "x": 795,
    "y": 172
   },
   {
    "x": 809,
    "y": 172
   },
   {
    "x": 961,
    "y": 174
   },
   {
    "x": 976,
    "y": 177
   },
   {
    "x": 1043,
    "y": 169
   },
   {
    "x": 318,
    "y": 185
   },
   {
    "x": 339,
    "y": 182
   },
   {
    "x": 404,
    "y": 181
   },
   {
    "x": 420,
    "y": 189
   },
   {
    "x": 443,
    "y": 189
   },
   {
    "x": 489,
    "y": 183
   },
   {
    "x": 544,
    "y": 185
   },
   {
    "x": 562,
    "y": 186
   },
   {
    "x": 612,
    "y": 184
   },
   {
    "x": 658,
    "y": 188
   },
   {
    "x": 679,
    "y": 182
   },
   {
    "x": 715,
    "y": 181
   },
   {
    "x": 731,
    "y": 182
   },
   {
    "x": 745,
    "y": 182
   },
   {
    "x": 774,
    "y": 187
   },
   {
    "x": 797,
    "y": 186
   },
   {
    "x": 809,
    "y": 188
   },
   {
    "x": 954,
    "y": 189
   },
   {
    "x": 1003,
    "y": 187
   },
   {
    "x": 1026,
    "y": 188
   },
   {
    "x": 1043,
    "y": 183
   },
   {
    "x": 226,
    "y": 202
   },
   {
    "x": 291,
    "y": 202
   },
   {
    "x": 392,
    "y": 198
   },
   {
    "x": 405,
    "y": 199
   },
   {
    "x": 445,
    "y": 202
   },
   {
    "x": 474,
    "y": 197
   },
   {
    "x": 514,
    "y": 199
   },
   {
    "x": 527,
    "y": 195
   },
   {
    "x": 571,
    "y": 202
   },
   {
    "x": 585,
    "y": 198
   },
   {
    "x": 617,
    "y": 199
   },
   {
    "x": 681,
    "y": 202
   },
   {
    "x": 695,
    "y": 200
   },
   {
    "x": 709,
    "y": 194
   },
   {
    "x": 733,
    "y": 201
   },
   {
    "x": 761,
    "y": 198
   },
   {
    "x": 792,
    "y": 199
   },
   {
    "x": 807,
    "y": 200
   },
   {
    "x": 844,
    "y": 197
   },
   {
    "x": 982,
    "y": 195
   },
   {
    "x": 1030,
    "y": 203
   },
   {
    "x": 1047,
    "y": 196
   },
   {
    "x": 252,
    "y": 209
   },
   {
    "x": 277,
    "y": 211
   },
   {
    "x": 304,
    "y": 208
   },
   {
    "x": 419,
    "y": 208
   },
   {
    "x": 472,
    "y": 211
   },
   {
    "x": 499,
    "y": 207
   },
   {
    "x": 545,
    "y": 214
   },
   {
    "x": 591,
    "y": 214
   },
   {
    "x": 603,
    "y": 215
   },
   {
    "x": 624,
    "y": 211
   },
   {
    "x": 641,
    "y": 213
   },
   {
    "x": 661,
    "y": 207
   },
   {
    "x": 748,
    "y": 207
   },
   {
    "x": 780,
    "y": 211
   },
   {
    "x": 819,
    "y": 213
   },
   {
    "x": 965,
    "y": 206
   },
   {
    "x": 982,
    "y": 215
   },
   {
    "x": 1014,
    "y": 214
   },
   {
    "x": 1084,
    "y": 207
   },
   {
    "x": 1105,
    "y": 208
   },
   {
    "x": 202,
    "y": 226
   },
   {
    "x": 219,
    "y": 219
   },
   {
    "x": 232,
    "y": 225
   },
   {
    "x": 285,
    "y": 229
   },
   {
    "x": 298,
    "y": 221
   },
   {
    "x": 493,
    "y": 220
   },
   {
    "x": 528,
    "y": 222
   },
   {
    "x": 564,
    "y": 222
   },
   {
    "x": 577,
    "y": 225
   },
   {
    "x": 591,
    "y": 227
   },
   {
    "x": 746,
    "y": 220
   },
   {
    "x": 806,
    "y": 224
   },
   {
    "x": 837,
    "y": 229
   },
   {
    "x": 978,
    "y": 227
   },
   {
    "x": 1028,
    "y": 221
   },
   {
    "x": 1086,
    "y": 222
   },
   {
    "x": 201,
    "y": 239
   },
   {
    "x": 247,
    "y": 241
   },
   {
    "x": 266,
    "y": 233
   },
   {
    "x": 507,
    "y": 235
   },
   {
    "x": 537,
    "y": 237
   },
   {
    "x": 562,
    "y": 242
   },
   {
    "x": 783,
    "y": 238
   },
   {
    "x": 833,
    "y": 241
   },
   {
    "x": 1017,
    "y": 238
   },
   {
    "x": 1042,
    "y": 240
   },
   {
    "x": 1061,
    "y": 240
   },
   {
    "x": 520,
    "y": 253
   },
   {
    "x": 812,
    "y": 255
   },
   {
    "x": 1086,
    "y": 247
   },
   {
    "x": 1196,
    "y": 251
   },
   {
    "x": 233,
    "y": 266
   },
   {
    "x": 537,
    "y": 264
   },
   {
    "x": 558,
    "y": 266
   },
   {
    "x": 781,
    "y": 260
   },
   {
    "x": 831,
    "y": 267
   },
   {
    "x": 1028,
    "y": 258
   },
   {
    "x": 1044,
    "y": 261
   },
   {
    "x": 1087,
    "y": 263
   },
   {
    "x": 211,
    "y": 277
   },
   {
    "x": 227,
    "y": 281
   },
   {
    "x": 239,
    "y": 279
   },
   {
    "x": 548,
    "y": 281
   },
   {
    "x": 562,
    "y": 280
   },
   {
    "x": 796,
    "y": 276
   },
   {
    "x": 814,
    "y": 272
   },
   {
    "x": 1032,
    "y": 278
   },
   {
    "x": 1046,
    "y": 276
   },
   {
    "x": 1083,
    "y": 278
   },
   {
    "x": 1198,
    "y": 275
   },
   {
    "x": 1344,
    "y": 272
   },
   {
    "x": 202,
    "y": 291
   },
   {
    "x": 513,
    "y": 285
   },
   {
    "x": 535,
    "y": 284
   },
   {
    "x": 822,
    "y": 287
   },
   {
    "x": 1058,
    "y": 285
   },
   {
    "x": 1187,
    "y": 288
   },
   {
    "x": 1341,
    "y": 286
   },
   {
    "x": 1358,
    "y": 306
   },
   {
    "x": 1327,
    "y": 310
   },
   {
    "x": 1256,
    "y": 332
   },
   {
    "x": 1307,
    "y": 326
   },
   {
    "x": 1372,
    "y": 330
   },
   {
    "x": 1268,
    "y": 340
   },
   {
    "x": 1326,
    "y": 346
   },
   {
    "x": 1354,
    "y": 344
   },
   {
    "x": 1367,
    "y": 344
   },
   {
    "x": 1277,
    "y": 358
   },
   {
    "x": 1342,
    "y": 358
   },
   {
    "x": 1263,
    "y": 367
   },
   {
    "x": 1356,
    "y": 365
   },
   {
    "x": 1369,
    "y": 362
   },
   {
    "x": 1281,
    "y": 384
   },
   {
    "x": 1325,
    "y": 384
   },
   {
    "x": 1344,
    "y": 382
   },
   {
    "x": 1370,
    "y": 377
   },
   {
    "x": 1251,
    "y": 390
   },
   {
    "x": 1265,
    "y": 396
   },
   {
    "x": 1256,
    "y": 411
   },
   {
    "x": 1288,
    "y": 404
   },
   {
    "x": 1329,
    "y": 402
   },
   {
    "x": 1352,
    "y": 404
   },
   {
    "x": 1365,
    "y": 410
   },
   {
    "x": 1278,
    "y": 423
   },
   {
    "x": 1294,
    "y": 421
   },
   {
    "x": 1340,
    "y": 418
   },
   {
    "x": 251,
    "y": 428
   },
   {
    "x": 1265,
    "y": 432
   },
   {
    "x": 1357,
    "y": 437
   },
   {
    "x": 220,
    "y": 444
   },
   {
    "x": 236,
    "y": 444
   },
   {
    "x": 253,
    "y": 450
   },
   {
    "x": 278,
    "y": 445
   },
   {
    "x": 1268,
    "y": 448
   },
   {
    "x": 1342,
    "y": 441
   },
   {
    "x": 1385,
    "y": 443
   },
   {
    "x": 228,
    "y": 459
   },
   {
    "x": 1289,
    "y": 460
   },
   {
    "x": 1342,
    "y": 456
   },
   {
    "x": 1357,
    "y": 454
   },
   {
    "x": 1273,
    "y": 471
   },
   {
    "x": 1332,
    "y": 469
   },
   {
    "x": 1359,
    "y": 474
   },
   {
    "x": 1381,
    "y": 472
   },
   {
    "x": 1251,
    "y": 489
   },
   {
    "x": 1266,
    "y": 487
   },
   {
    "x": 1285,
    "y": 482
   },
   {
    "x": 1301,
    "y": 484
   },
   {
    "x": 1288,
    "y": 498
   },
   {
    "x": 1371,
    "y": 500
   },
   {
    "x": 132,
    "y": 513
   },
   {
    "x": 1249,
    "y": 512
   },
   {
    "x": 1303,
    "y": 509
   },
   {
    "x": 1353,
    "y": 509
   },
   {
    "x": 1391,
    "y": 514
   },
   {
    "x": 147,
    "y": 524
   },
   {
    "x": 1340,
    "y": 519
   },
   {
    "x": 1355,
    "y": 522
   },
   {
    "x": 1339,
    "y": 534
   },
   {
    "x": 1369,
    "y": 534
   },
   {
    "x": 1384,
    "y": 533
   },
   {
    "x": 145,
    "y": 549
   },
   {
    "x": 1253,
    "y": 545
   },
   {
    "x": 1340,
    "y": 548
   },
   {
    "x": 1352,
    "y": 548
   },
   {
    "x": 1376,
    "y": 548
   },
   {
    "x": 1390,
    "y": 548
   },
   {
    "x": 1311,
    "y": 560
   },
   {
    "x": 1345,
    "y": 563
   },
   {
    "x": 1369,
    "y": 566
   },
   {
    "x": 1392,
    "y": 562
   },
   {
    "x": 1274,
    "y": 574
   },
   {
    "x": 1289,
    "y": 580
   },
   {
    "x": 1302,
    "y": 575
   },
   {
    "x": 1319,
    "y": 573
   },
   {
    "x": 1344,
    "y": 579
   },
   {
    "x": 1364,
    "y": 579
   },
   {
    "x": 161,
    "y": 584
   },
   {
    "x": 1254,
    "y": 585
   },
   {
    "x": 1269,
    "y": 586
   },
   {
    "x": 1302,
    "y": 589
   },
   {
    "x": 138,
    "y": 606
   },
   {
    "x": 157,
    "y": 596
   },
   {
    "x": 170,
    "y": 604
   },
   {
    "x": 183,
    "y": 596
   },
   {
    "x": 1263,
    "y": 605
   },
   {
    "x": 151,
    "y": 617
   },
   {
    "x": 184,
    "y": 612
   },
   {
    "x": 199,
    "y": 617
   },
   {
    "x": 161,
    "y": 629
   },
   {
    "x": 177,
    "y": 629
   },
   {
    "x": 145,
    "y": 636
   },
   {
    "x": 202,
    "y": 642
   },
   {
    "x": 132,
    "y": 658
   },
   {
    "x": 155,
    "y": 652
   },
   {
    "x": 172,
    "y": 648
   },
   {
    "x": 188,
    "y": 658
   },
   {
    "x": 150,
    "y": 666
   },
   {
    "x": 174,
    "y": 666
   },
   {
    "x": 207,
    "y": 661
   },
   {
    "x": 227,
    "y": 670
   },
   {
    "x": 182,
    "y": 679
   },
   {
    "x": 202,
    "y": 681
   },
   {
    "x": 239,
    "y": 683
   },
   {
    "x": 137,
    "y": 693
   },
   {
    "x": 157,
    "y": 696
   },
   {
    "x": 200,
    "y": 695
   },
   {
    "x": 284,
    "y": 691
   },
   {
    "x": 1339,
    "y": 692
   },
   {
    "x": 1359,
    "y": 687
   },
   {
    "x": 143,
    "y": 705
   },
   {
    "x": 241,
    "y": 703
   },
   {
    "x": 143,
    "y": 717
   },
   {
    "x": 200,
    "y": 714
   },
   {
    "x": 228,
    "y": 716
   },
   {
    "x": 1341,
    "y": 716
   },
   {
    "x": 1356,
    "y": 713
   },
   {
    "x": 135,
    "y": 733
   },
   {
    "x": 161,
    "y": 733
   },
   {
    "x": 207,
    "y": 735
   },
   {
    "x": 239,
    "y": 732
   },
   {
    "x": 266,
    "y": 733
   },
   {
    "x": 1313,
    "y": 728
   },
   {
    "x": 1329,
    "y": 729
   },
   {
    "x": 248,
    "y": 748
   },
   {
    "x": 274,
    "y": 747
   },
   {
    "x": 1328,
    "y": 742
   },
   {
    "x": 1353,
    "y": 744
   },
   {
    "x": 135,
    "y": 761
   },
   {
    "x": 1326,
    "y": 758
   },
   {
    "x": 1325,
    "y": 771
   },
   {
    "x": 1350,
    "y": 771
   },
   {
    "x": 208,
    "y": 861
   },
   {
    "x": 220,
    "y": 865
   },
   {
    "x": 232,
    "y": 863
   },
   {
    "x": 252,
    "y": 864
   },
   {
    "x": 264,
    "y": 864
   },
   {
    "x": 278,
    "y": 864
   },
   {
    "x": 194,
    "y": 873
   },
   {
    "x": 172,
    "y": 890
   },
   {
    "x": 221,
    "y": 888
   },
   {
    "x": 261,
    "y": 889
   },
   {
    "x": 276,
    "y": 888
   },
   {
    "x": 1253,
    "y": 885
   },
   {
    "x": 185,
    "y": 904
   },
   {
    "x": 206,
    "y": 896
   },
   {
    "x": 234,
    "y": 899
   },
   {
    "x": 1256,
    "y": 899
   },
   {
    "x": 196,
    "y": 917
   },
   {
    "x": 221,
    "y": 911
   },
   {
    "x": 254,
    "y": 913
   },
   {
    "x": 277,
    "y": 912
   },
   {
    "x": 1267,
    "y": 912
   },
   {
    "x": 208,
    "y": 922
   },
   {
    "x": 242,
    "y": 923
   },
   {
    "x": 265,
    "y": 928
   },
   {
    "x": 1423,
    "y": 927
   },
   {
    "x": 214,
    "y": 940
   },
   {
    "x": 238,
    "y": 939
   },
   {
    "x": 255,
    "y": 944
   },
   {
    "x": 285,
    "y": 941
   },
   {
    "x": 1410,
    "y": 935
   },
   {
    "x": 227,
    "y": 954
   },
   {
    "x": 1382,
    "y": 954
   },
   {
    "x": 1395,
    "y": 950
   },
   {
    "x": 206,
    "y": 965
   },
   {
    "x": 249,
    "y": 967
   },
   {
    "x": 1342,
    "y": 969
   },
   {
    "x": 1369,
    "y": 970
   },
   {
    "x": 1404,
    "y": 964
   },
   {
    "x": 227,
    "y": 978
   },
   {
    "x": 253,
    "y": 981
   },
   {
    "x": 281,
    "y": 977
   },
   {
    "x": 1344,
    "y": 983
   },
   {
    "x": 1409,
    "y": 980
   },
   {
    "x": 211,
    "y": 986
   },
   {
    "x": 249,
    "y": 994
   },
   {
    "x": 1311,
    "y": 986
   },
   {
    "x": 1359,
    "y": 994
   },
   {
    "x": 1403,
    "y": 995
   },
   {
    "x": 222,
    "y": 1006
   },
   {
    "x": 263,
    "y": 1000
   },
   {
    "x": 279,
    "y": 1001
   },
   {
    "x": 1318,
    "y": 1000
   },
   {
    "x": 1344,
    "y": 999
   },
   {
    "x": 1382,
    "y": 1008
   },
   {
    "x": 238,
    "y": 1017
   },
   {
    "x": 254,
    "y": 1017
   },
   {
    "x": 268,
    "y": 1018
   },
   {
    "x": 1325,
    "y": 1020
   },
   {
    "x": 1386,
    "y": 1021
   },
   {
    "x": 1404,
    "y": 1014
   },
   {
    "x": 203,
    "y": 1030
   },
   {
    "x": 221,
    "y": 1028
   },
   {
    "x": 278,
    "y": 1032
   },
   {
    "x": 1371,
    "y": 1025
   },
   {
    "x": 1399,
    "y": 1033
   },
   {
    "x": 1420,
    "y": 1034
   },
   {
    "x": 156,
    "y": 1040
   },
   {
    "x": 169,
    "y": 1043
   },
   {
    "x": 183,
    "y": 1043
   },
   {
    "x": 240,
    "y": 1042
   },
   {
    "x": 261,
    "y": 1044
   },
   {
    "x": 276,
    "y": 1046
   },
   {
    "x": 1355,
    "y": 1039
   },
   {
    "x": 148,
    "y": 1054
   },
   {
    "x": 169,
    "y": 1059
   },
   {
    "x": 202,
    "y": 1055
   },
   {
    "x": 246,
    "y": 1059
   },
   {
    "x": 268,
    "y": 1061
   },
   {
    "x": 1371,
    "y": 1053
   },
   {
    "x": 147,
    "y": 1067
   },
   {
    "x": 171,
    "y": 1074
   },
   {
    "x": 185,
    "y": 1071
   },
   {
    "x": 208,
    "y": 1072
   },
   {
    "x": 221,
    "y": 1066
   },
   {
    "x": 1396,
    "y": 1073
   },
   {
    "x": 156,
    "y": 1086
   },
   {
    "x": 222,
    "y": 1086
   },
   {
    "x": 247,
    "y": 1086
   },
   {
    "x": 183,
    "y": 1095
   },
   {
    "x": 198,
    "y": 1091
   },
   {
    "x": 1268,
    "y": 1133
   },
   {
    "x": 1253,
    "y": 1149
   },
   {
    "x": 1272,
    "y": 1146
   },
   {
    "x": 1291,
    "y": 1143
   },
   {
    "x": 1303,
    "y": 1156
   },
   {
    "x": 1252,
    "y": 1168
   },
   {
    "x": 1276,
    "y": 1176
   },
   {
    "x": 1290,
    "y": 1173
   },
   {
    "x": 1312,
    "y": 1172
   },
   {
    "x": 1280,
    "y": 1190
   },
   {
    "x": 1306,
    "y": 1187
   },
   {
    "x": 1255,
    "y": 1213
   },
   {
    "x": 235,
    "y": 1226
   },
   {
    "x": 248,
    "y": 1222
   },
   {
    "x": 267,
    "y": 1221
   },
   {
    "x": 1274,
    "y": 1223
   },
   {
    "x": 194,
    "y": 1234
   },
   {
    "x": 228,
    "y": 1240
   },
   {
    "x": 247,
    "y": 1236
   },
   {
    "x": 265,
    "y": 1233
   },
   {
    "x": 198,
    "y": 1250
   },
   {
    "x": 210,
    "y": 1254
   },
   {
    "x": 241,
    "y": 1250
   },
   {
    "x": 275,
    "y": 1246
   },
   {
    "x": 338,
    "y": 1254
   },
   {
    "x": 371,
    "y": 1250
   },
   {
    "x": 501,
    "y": 1251
   },
   {
    "x": 545,
    "y": 1253
   },
   {
    "x": 562,
    "y": 1252
   },
   {
    "x": 585,
    "y": 1254
   },
   {
    "x": 611,
    "y": 1254
   },
   {
    "x": 979,
    "y": 1248
   },
   {
    "x": 1003,
    "y": 1251
   },
   {
    "x": 1253,
    "y": 1253
   },
   {
    "x": 1273,
    "y": 1251
   },
   {
    "x": 254,
    "y": 1262
   },
   {
    "x": 287,
    "y": 1265
   },
   {
    "x": 311,
    "y": 1266
   },
   {
    "x": 328,
    "y": 1267
   },
   {
    "x": 340,
    "y": 1268
   },
   {
    "x": 367,
    "y": 1263
   },
   {
    "x": 381,
    "y": 1265
   },
   {
    "x": 396,
    "y": 1265
   },
   {
    "x": 586,
    "y": 1269
   },
   {
    "x": 618,
    "y": 1269
   },
   {
    "x": 948,
    "y": 1262
   },
   {
    "x": 1000,
    "y": 1264
   },
   {
    "x": 1018,
    "y": 1259
   },
   {
    "x": 201,
    "y": 1278
   },
   {
    "x": 224,
    "y": 1273
   },
   {
    "x": 246,
    "y": 1276
   },
   {
    "x": 267,
    "y": 1274
   },
   {
    "x": 498,
    "y": 1275
   },
   {
    "x": 535,
    "y": 1279
   },
   {
    "x": 558,
    "y": 1276
   },
   {
    "x": 612,
    "y": 1282
   },
   {
    "x": 949,
    "y": 1281
   },
   {
    "x": 965,
    "y": 1274
   },
   {
    "x": 993,
    "y": 1277
   },
   {
    "x": 1021,
    "y": 1282
   },
   {
    "x": 1251,
    "y": 1273
   },
   {
    "x": 1265,
    "y": 1280
   },
   {
    "x": 198,
    "y": 1294
   },
   {
    "x": 227,
    "y": 1291
   },
   {
    "x": 248,
    "y": 1291
   },
   {
    "x": 265,
    "y": 1287
   },
   {
    "x": 291,
    "y": 1286
   },
   {
    "x": 315,
    "y": 1290
   },
   {
    "x": 338,
    "y": 1288
   },
   {
    "x": 352,
    "y": 1285
   },
   {
    "x": 376,
    "y": 1292
   },
   {
    "x": 392,
    "y": 1289
   },
   {
    "x": 558,
    "y": 1292
   },
   {
    "x": 580,
    "y": 1289
   },
   {
    "x": 602,
    "y": 1295
   },
   {
    "x": 617,
    "y": 1295
   },
   {
    "x": 638,
    "y": 1287
   },
   {
    "x": 956,
    "y": 1294
   },
   {
    "x": 999,
    "y": 1294
   },
   {
    "x": 1034,
    "y": 1294
   },
   {
    "x": 1248,
    "y": 1291
   },
   {
    "x": 1281,
    "y": 1291
   },
   {
    "x": 280,
    "y": 1302
   },
   {
    "x": 305,
    "y": 1302
   },
   {
    "x": 326,
    "y": 1307
   },
   {
    "x": 484,
    "y": 1301
   },
   {
    "x": 520,
    "y": 1303
   },
   {
    "x": 535,
    "y": 1306
   },
   {
    "x": 575,
    "y": 1302
   },
   {
    "x": 589,
    "y": 1302
   },
   {
    "x": 628,
    "y": 1308
   },
   {
    "x": 650,
    "y": 1302
   },
   {
    "x": 733,
    "y": 1307
   },
   {
    "x": 925,
    "y": 1306
   },
   {
    "x": 978,
    "y": 1302
   },
   {
    "x": 1015,
    "y": 1299
   },
   {
    "x": 1047,
    "y": 1302
   },
   {
    "x": 1214,
    "y": 1307
   },
   {
    "x": 1234,
    "y": 1306
   },
   {
    "x": 1249,
    "y": 1307
   },
   {
    "x": 1267,
    "y": 1299
   },
   {
    "x": 226,
    "y": 1313
   },
   {
    "x": 248,
    "y": 1314
   },
   {
    "x": 279,
    "y": 1317
   },
   {
    "x": 307,
    "y": 1314
   },
   {
    "x": 419,
    "y": 1314
   },
   {
    "x": 443,
    "y": 1314
   },
   {
    "x": 471,
    "y": 1314
   },
   {
    "x": 488,
    "y": 1316
   },
   {
    "x": 532,
    "y": 1320
   },
   {
    "x": 560,
    "y": 1311
   },
   {
    "x": 573,
    "y": 1319
   },
   {
    "x": 663,
    "y": 1311
   },
   {
    "x": 681,
    "y": 1317
   },
   {
    "x": 697,
    "y": 1312
   },
   {
    "x": 826,
    "y": 1321
   },
   {
    "x": 845,
    "y": 1320
   },
   {
    "x": 960,
    "y": 1314
   },
   {
    "x": 1000,
    "y": 1318
   },
   {
    "x": 1066,
    "y": 1317
   },
   {
    "x": 1082,
    "y": 1313
   },
   {
    "x": 1112,
    "y": 1313
   },
   {
    "x": 1200,
    "y": 1320
   },
   {
    "x": 1273,
    "y": 1314
   },
   {
    "x": 1292,
    "y": 1311
   },
   {
    "x": 450,
    "y": 1326
   },
   {
    "x": 489,
    "y": 1332
   },
   {
    "x": 520,
    "y": 1332
   },
   {
    "x": 544,
    "y": 1332
   },
   {
    "x": 656,
    "y": 1333
   },
   {
    "x": 683,
    "y": 1330
   },
   {
    "x": 702,
    "y": 1333
   },
   {
    "x": 729,
    "y": 1329
   },
   {
    "x": 742,
    "y": 1328
   },
   {
    "x": 787,
    "y": 1330
   },
   {
    "x": 871,
    "y": 1327
   },
   {
    "x": 982,
    "y": 1327
   },
   {
    "x": 1092,
    "y": 1328
   },
   {
    "x": 1105,
    "y": 1329
   },
   {
    "x": 1216,
    "y": 1331
   },
   {
    "x": 1235,
    "y": 1327
   },
   {
    "x": 1255,
    "y": 1329
   },
   {
    "x": 210,
    "y": 1337
   },
   {
    "x": 410,
    "y": 1341
   },
   {
    "x": 427,
    "y": 1341
   },
   {
    "x": 441,
    "y": 1342
   },
   {
    "x": 456,
    "y": 1342
   },
   {
    "x": 587,
    "y": 1338
   },
   {
    "x": 612,
    "y": 1338
   },
   {
    "x": 636,
    "y": 1340
   },
   {
    "x": 707,
    "y": 1346
   },
   {
    "x": 729,
    "y": 1342
   },
   {
    "x": 766,
    "y": 1342
   },
   {
    "x": 799,
    "y": 1345
   },
   {
    "x": 817,
    "y": 1346
   },
   {
    "x": 831,
    "y": 1346
   },
   {
    "x": 852,
    "y": 1346
   },
   {
    "x": 898,
    "y": 1340
   },
   {
    "x": 1034,
    "y": 1338
   },
   {
    "x": 1051,
    "y": 1347
   },
   {
    "x": 1069,
    "y": 1344
   },
   {
    "x": 1091,
    "y": 1341
   },
   {
    "x": 1110,
    "y": 1343
   },
   {
    "x": 1134,
    "y": 1346
   },
   {
    "x": 1233,
    "y": 1341
   },
   {
    "x": 1251,
    "y": 1344
   },
   {
    "x": 1275,
    "y": 1338
   },
   {
    "x": 454,
    "y": 1357
   },
   {
    "x": 474,
    "y": 1359
   },
   {
    "x": 509,
    "y": 1353
   },
   {
    "x": 522,
    "y": 1355
   },
   {
    "x": 570,
    "y": 1358
   },
   {
    "x": 590,
    "y": 1358
   },
   {
    "x": 606,
    "y": 1357
   },
   {
    "x": 639,
    "y": 1353
   },
   {
    "x": 687,
    "y": 1359
   },
   {
    "x": 702,
    "y": 1359
   },
   {
    "x": 744,
    "y": 1353
   },
   {
    "x": 825,
    "y": 1359
   },
   {
    "x": 866,
    "y": 1356
   },
   {
    "x": 904,
    "y": 1354
   },
   {
    "x": 936,
    "y": 1354
   },
   {
    "x": 960,
    "y": 1359
   },
   {
    "x": 1105,
    "y": 1357
   },
   {
    "x": 1119,
    "y": 1358
   },
   {
    "x": 1134,
    "y": 1360
   },
   {
    "x": 1223,
    "y": 1359
   },
   {
    "x": 1263,
    "y": 1351
   },
   {
    "x": 431,
    "y": 1364
   },
   {
    "x": 500,
    "y": 1371
   },
   {
    "x": 534,
    "y": 1369
   },
   {
    "x": 628,
    "y": 1366
   },
   {
    "x": 640,
    "y": 1366
   },
   {
    "x": 675,
    "y": 1365
   },
   {
    "x": 720,
    "y": 1369
   },
   {
    "x": 821,
    "y": 1372
   },
   {
    "x": 852,
    "y": 1367
   },
   {
    "x": 890,
    "y": 1370
   },
   {
    "x": 910,
    "y": 1368
   },
   {
    "x": 938,
    "y": 1371
   },
   {
    "x": 977,
    "y": 1372
   },
   {
    "x": 1208,
    "y": 1364
   },
   {
    "x": 429,
    "y": 1380
   },
   {
    "x": 443,
    "y": 1385
   },
   {
    "x": 480,
    "y": 1384
   },
   {
    "x": 521,
    "y": 1380
   },
   {
    "x": 533,
    "y": 1384
   },
   {
    "x": 558,
    "y": 1380
   },
   {
    "x": 580,
    "y": 1385
   },
   {
    "x": 624,
    "y": 1382
   },
   {
    "x": 667,
    "y": 1385
   },
   {
    "x": 682,
    "y": 1381
   },
   {
    "x": 702,
    "y": 1383
   },
   {
    "x": 714,
    "y": 1384
   },
   {
    "x": 730,
    "y": 1385
   },
   {
    "x": 766,
    "y": 1376
   },
   {
    "x": 869,
    "y": 1385
   },
   {
    "x": 954,
    "y": 1382
   },
   {
    "x": 978,
    "y": 1386
   },
   {
    "x": 992,
    "y": 1378
   },
   {
    "x": 1008,
    "y": 1382
   },
   {
    "x": 1117,
    "y": 1379
   },
   {
    "x": 562,
    "y": 1392
   },
   {
    "x": 598,
    "y": 1395
   },
   {
    "x": 638,
    "y": 1398
   },
   {
    "x": 915,
    "y": 1393
   },
   {
    "x": 934,
    "y": 1392
   },
   {
    "x": 990,
    "y": 1399
   },
   {
    "x": 1022,
    "y": 1396
   },
   {
    "x": 1059,
    "y": 1394
   },
   {
    "x": 544,
    "y": 1407
   },
   {
    "x": 585,
    "y": 1408
   },
   {
    "x": 614,
    "y": 1405
   },
   {
    "x": 663,
    "y": 1411
   },
   {
    "x": 1004,
    "y": 1408
   },
   {
    "x": 1056,
    "y": 1407
   },
   {
    "x": 1073,
    "y": 1407
   },
   {
    "x": 546,
    "y": 1421
   },
   {
    "x": 951,
    "y": 1419
   }
  ],
  "elementos": [
   {
    "type": "rock",
    "x": 394,
    "y": 639
   },
   {
    "type": "rock",
    "x": 390,
    "y": 649
   },
   {
    "type": "rock",
    "x": 385,
    "y": 660
   },
   {
    "type": "rock",
    "x": 381,
    "y": 670
   },
   {
    "type": "rock",
    "x": 379,
    "y": 680
   },
   {
    "type": "rock",
    "x": 385,
    "y": 690
   },
   {
    "type": "rock",
    "x": 395,
    "y": 691
   },
   {
    "type": "rock",
    "x": 396,
    "y": 681
   },
   {
    "type": "rock",
    "x": 396,
    "y": 669
   },
   {
    "type": "rock",
    "x": 396,
    "y": 659
   },
   {
    "type": "rock",
    "x": 406,
    "y": 647
   },
   {
    "type": "rock",
    "x": 405,
    "y": 664
   },
   {
    "type": "rock",
    "x": 405,
    "y": 674
   },
   {
    "type": "rock",
    "x": 406,
    "y": 684
   },
   {
    "type": "rock",
    "x": 393,
    "y": 728
   },
   {
    "type": "rock",
    "x": 388,
    "y": 739
   },
   {
    "type": "rock",
    "x": 387,
    "y": 750
   },
   {
    "type": "rock",
    "x": 387,
    "y": 761
   },
   {
    "type": "rock",
    "x": 388,
    "y": 771
   },
   {
    "type": "rock",
    "x": 388,
    "y": 781
   },
   {
    "type": "rock",
    "x": 387,
    "y": 791
   },
   {
    "type": "rock",
    "x": 384,
    "y": 801
   },
   {
    "type": "rock",
    "x": 395,
    "y": 802
   },
   {
    "type": "rock",
    "x": 404,
    "y": 796
   },
   {
    "type": "rock",
    "x": 410,
    "y": 788
   },
   {
    "type": "rock",
    "x": 410,
    "y": 776
   },
   {
    "type": "rock",
    "x": 410,
    "y": 766
   },
   {
    "type": "rock",
    "x": 410,
    "y": 756
   },
   {
    "type": "rock",
    "x": 411,
    "y": 746
   },
   {
    "type": "rock",
    "x": 413,
    "y": 736
   },
   {
    "type": "rock",
    "x": 399,
    "y": 752
   },
   {
    "type": "rock",
    "x": 397,
    "y": 788
   },
   {
    "type": "rock",
    "x": 398,
    "y": 773
   },
   {
    "type": "rock",
    "x": 398,
    "y": 742
   },
   {
    "type": "rock",
    "x": 427,
    "y": 731
   },
   {
    "type": "rock",
    "x": 429,
    "y": 742
   },
   {
    "type": "rock",
    "x": 430,
    "y": 754
   },
   {
    "type": "rock",
    "x": 427,
    "y": 764
   },
   {
    "type": "rock",
    "x": 425,
    "y": 777
   },
   {
    "type": "rock",
    "x": 422,
    "y": 787
   },
   {
    "type": "rock",
    "x": 421,
    "y": 798
   }
  ],
  "portais": [
   {
    "id": "portal_mushroom_grove",
    "name": "Bosque dos Cogumelos",
    "minLevel": 7,
    "targetLevel": 30,
    "frequency": 1.1,
    "monsters": [
     {
      "id": "shroom",
      "chance": 45,
      "min": 1,
      "max": 2,
      "elite": 10
     },
     {
      "id": "ghost",
      "chance": 35,
      "min": 1,
      "max": 1,
      "elite": 10
     },
     {
      "id": "sprout",
      "chance": 20,
      "min": 1,
      "max": 6,
      "elite": 10
     }
    ]
   },
   {
    "id": "ratos",
    "name": "Ratos",
    "minLevel": 1,
    "targetLevel": 1,
    "frequency": 1,
    "monsters": [
     {
      "id": "rato",
      "chance": 100,
      "min": 5,
      "max": 10,
      "elite": 20
     }
    ]
   },
   {
    "id": "broto",
    "name": "Broto",
    "minLevel": 10,
    "targetLevel": 30,
    "frequency": 1,
    "monsters": [
     {
      "id": "sprout",
      "chance": 50,
      "min": 1,
      "max": 3,
      "elite": 50
     },
     {
      "id": "shroom",
      "chance": 50,
      "min": 1,
      "max": 3,
      "elite": 0
     }
    ]
   }
  ],
  "calc": {
   "hp0": 100,
   "hpPerF": 10,
   "mp0": 100,
   "mpPerI": 10,
   "armPerA": 0.5,
   "physPerF": 1,
   "magPerI": 1,
   "regenPerF": 0.01,
   "regenPerI": 0.01,
   "camp": 20,
   "move": 50,
   "spdPerA": 0.001,
   "minInterval": 0.15,
   "atkSpdPerA": 0.001,
   "maxLevel": 30,
   "monHp0": 200,
   "monHpPerF": 15,
   "monHpMul": 1,
   "armorFloor": 0,
   "monHpLevel": 0,
   "portalLevelRange": 5,
   "monPhysPerF": 1,
   "monMagPerI": 1,
   "monMinInterval": 0.15,
   "magArmPerI": 0.5,
   "monArmPerA": 0.5,
   "monMagArmPerI": 0.5,
   "monMpPerI": 5,
   "monMp0": 100,
   "monRegenPerF": 0.01,
   "monRegenPerI": 0.01,
   "monMove0": 55,
   "monMovePerA": 0.002,
   "monAtkSpdPerA": 0.001
  },
  "spawns": [],
  "chao": {},
  "ilhaV": 2
 },
 "artes": {
  "monstros/sl": null,
  "monstros/bat": null
 },
 "artesMapa": {
  "tree": {},
  "rock": {},
  "boulder": {},
  "bush": {},
  "log": {},
  "stump": {},
  "crystal": {},
  "mushroom": {},
  "cactus": {},
  "sign": {},
  "fence": {},
  "stonewall": {}
 },
 "biblioteca": {
  "px_mv8rwqpx": {
   "id": "px_mv8rwqpx",
   "name": "Gosma",
   "w": 40,
   "h": 24,
   "q": 1,
   "palette": [
    "#c08c4c",
    "#8ca85a",
    "#1b1226",
    "#b5bd78",
    "#435829",
    "#607d3a",
    "#e6d89a",
    "#718848",
    "#7da24b",
    "#b6da75",
    "#30382c",
    "#9eac67",
    "#354432",
    "#ebf69c",
    "#526a31",
    "#e2d9b5"
   ],
   "pixels": "--------------------------------------------------------------------------------------------------------00000000000------------------------00000-----------0-------------------0000----------------0-----------------00--222222-------------00---------------0-2289999822------------0--------------02d333333311182----------0-------------0-833333333111182---------0-------------02513666311666158---------0------------0-25116aa111aa615e---------0------------0-2577111111117754---------0------------00-477111111117742--------00-------------0-24b551fcc55b42-------000---------------0--2244444422------000-------------------00--222222-----000------------------------000----000000-----------------------------00000----------0--------------------------0000000000000----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------",
   "el": false,
   "solid": false,
   "radius": 6
  }
 },
 "sons": {},
 "dgs": {
  "version": 2,
  "activeId": "dg-original",
  "dungeons": [
   {
    "id": "dg-original",
    "config": {
     "name": "Covil do Lorde Goblin",
     "theme": "cave",
     "art": {},
     "playerSpawn": {
      "x": 150,
      "y": 210
     },
     "entrancePortal": {
      "x": 125,
      "y": 210,
      "name": "Portal de Retorno"
     },
     "exitPortal": {
      "x": 920,
      "y": 480,
      "name": "Portal Mágico de Saída"
     },
     "blacksmithPos": {
      "x": 890,
      "y": 560,
      "name": "Ferreiro Prisioneiro"
     },
     "rooms": [
      {
       "id": 1,
       "name": "Entrada da Caverna",
       "x": 80,
       "y": 140,
       "w": 160,
       "h": 140
      },
      {
       "id": 2,
       "name": "Posto dos Goblins",
       "x": 340,
       "y": 140,
       "w": 180,
       "h": 152
      },
      {
       "id": 3,
       "name": "Arsenal Goblin",
       "x": 333,
       "y": 382,
       "w": 200,
       "h": 180
      },
      {
       "id": 4,
       "name": "Covil do Lorde",
       "x": 630,
       "y": 330,
       "w": 340,
       "h": 300
      }
     ],
     "corridors": [
      {
       "id": 11,
       "from": 1,
       "to": 2,
       "x": 234,
       "y": 183,
       "w": 129,
       "h": 60,
       "dir": "h"
      },
      {
       "id": 12,
       "from": 2,
       "to": 3,
       "x": 400,
       "y": 290,
       "w": 60,
       "h": 103,
       "dir": "v"
      },
      {
       "id": 13,
       "from": 3,
       "to": 4,
       "x": 524,
       "y": 450,
       "w": 111,
       "h": 60,
       "dir": "h"
      }
     ],
     "doors": [
      {
       "id": 21,
       "x": 610,
       "y": 480,
       "w": 12,
       "h": 56,
       "roomId": 3,
       "orientation": "vertical"
      }
     ],
     "torches": [
      {
       "x": 96,
       "y": 146
      },
      {
       "x": 224,
       "y": 146
      },
      {
       "x": 96,
       "y": 268
      },
      {
       "x": 290,
       "y": 186
      },
      {
       "x": 290,
       "y": 234
      },
      {
       "x": 356,
       "y": 146
      },
      {
       "x": 504,
       "y": 146
      },
      {
       "x": 504,
       "y": 278
      },
      {
       "x": 406,
       "y": 340
      },
      {
       "x": 454,
       "y": 340
      },
      {
       "x": 346,
       "y": 396
      },
      {
       "x": 514,
       "y": 396
      },
      {
       "x": 346,
       "y": 558
      },
      {
       "x": 580,
       "y": 456
      },
      {
       "x": 580,
       "y": 504
      },
      {
       "x": 650,
       "y": 336
      },
      {
       "x": 790,
       "y": 336
      },
      {
       "x": 950,
       "y": 336
      },
      {
       "x": 650,
       "y": 618
      },
      {
       "x": 790,
       "y": 618
      },
      {
       "x": 950,
       "y": 618
      }
     ],
     "chests": [
      {
       "id": 1,
       "tier": "blue",
       "x": 470,
       "y": 175,
       "bossChest": false
      },
      {
       "id": 2,
       "tier": "purple",
       "x": 365,
       "y": 520,
       "bossChest": false
      },
      {
       "id": 3,
       "tier": "gold",
       "x": 890,
       "y": 390,
       "bossChest": true
      }
     ],
     "mobs": [
      {
       "id": 101,
       "type": "goblin",
       "x": 410,
       "y": 170,
       "lvl": 30
      },
      {
       "id": 102,
       "type": "goblin",
       "x": 455,
       "y": 220,
       "lvl": 30
      },
      {
       "id": 103,
       "type": "gob",
       "x": 430,
       "y": 340,
       "lvl": 30
      },
      {
       "id": 104,
       "type": "gob",
       "x": 408,
       "y": 456,
       "lvl": 30
      },
      {
       "id": 105,
       "type": "gob",
       "x": 445,
       "y": 500,
       "lvl": 30
      },
      {
       "id": 106,
       "type": "goblin",
       "x": 470,
       "y": 510,
       "lvl": 30,
       "isBoss": true
      },
      {
       "id": 107,
       "type": "goblinBoss",
       "x": 780,
       "y": 480,
       "lvl": 50,
       "isBoss": true
      }
     ],
     "decorations": [
      {
       "type": "barrel",
       "x": 95,
       "y": 165
      },
      {
       "type": "crate",
       "x": 108,
       "y": 168
      },
      {
       "type": "bones",
       "x": 220,
       "y": 255
      },
      {
       "type": "stalagmite",
       "x": 92,
       "y": 245
      },
      {
       "type": "puddle",
       "x": 175,
       "y": 240,
       "r": 16
      },
      {
       "type": "web",
       "x": 232,
       "y": 182
      },
      {
       "type": "bones",
       "x": 275,
       "y": 228
      },
      {
       "type": "crystal",
       "x": 310,
       "y": 183,
       "col": "#f97316"
      },
      {
       "type": "banner",
       "x": 355,
       "y": 160
      },
      {
       "type": "crate",
       "x": 350,
       "y": 175
      },
      {
       "type": "barrel",
       "x": 362,
       "y": 172
      },
      {
       "type": "puddle",
       "x": 440,
       "y": 165,
       "r": 20
      },
      {
       "type": "stalagmite",
       "x": 505,
       "y": 240
      },
      {
       "type": "bones",
       "x": 495,
       "y": 265
      },
      {
       "type": "barrel",
       "x": 406,
       "y": 310
      },
      {
       "type": "bones",
       "x": 450,
       "y": 360
      },
      {
       "type": "crystal",
       "x": 404,
       "y": 375,
       "col": "#ef4444"
      },
      {
       "type": "weapon_pile",
       "x": 355,
       "y": 410
      },
      {
       "type": "barrel",
       "x": 345,
       "y": 430
      },
      {
       "type": "crate",
       "x": 340,
       "y": 445
      },
      {
       "type": "crate",
       "x": 355,
       "y": 448
      },
      {
       "type": "puddle",
       "x": 450,
       "y": 430,
       "r": 24
      },
      {
       "type": "bones",
       "x": 490,
       "y": 535
      },
      {
       "type": "banner",
       "x": 512,
       "y": 415
      },
      {
       "type": "stalagmite",
       "x": 345,
       "y": 540
      },
      {
       "type": "bones",
       "x": 540,
       "y": 498
      },
      {
       "type": "crystal",
       "x": 575,
       "y": 453,
       "col": "#f59e0b"
      },
      {
       "type": "web",
       "x": 625,
       "y": 452
      },
      {
       "type": "skull_pile",
       "x": 660,
       "y": 360
      },
      {
       "type": "banner",
       "x": 650,
       "y": 420
      },
      {
       "type": "banner",
       "x": 650,
       "y": 550
      },
      {
       "type": "barrel",
       "x": 940,
       "y": 355
      },
      {
       "type": "crate",
       "x": 928,
       "y": 360
      },
      {
       "type": "stalagmite",
       "x": 660,
       "y": 590
      },
      {
       "type": "stalagmite",
       "x": 935,
       "y": 605
      },
      {
       "type": "puddle",
       "x": 740,
       "y": 570,
       "r": 28
      },
      {
       "type": "weapon_pile",
       "x": 895,
       "y": 590
      },
      {
       "type": "crystal",
       "x": 780,
       "y": 334,
       "col": "#ef4444"
      },
      {
       "type": "crystal",
       "x": 880,
       "y": 334,
       "col": "#f97316"
      }
     ]
    }
   },
   {
    "id": "dg-mvbmbqxg",
    "config": {
     "name": "Esqueleto",
     "theme": "cave",
     "art": {},
     "playerSpawn": {
      "x": 150,
      "y": 210
     },
     "entrancePortal": {
      "x": 120,
      "y": 210,
      "name": "Portal de Retorno"
     },
     "exitPortal": {
      "x": 330,
      "y": 210,
      "name": "Portal de Saída"
     },
     "blacksmithPos": {
      "x": 300,
      "y": 250,
      "name": "Ferreiro",
      "disabled": true
     },
     "rooms": [
      {
       "id": 1,
       "name": "Sala 1",
       "x": 80,
       "y": 120,
       "w": 300,
       "h": 200
      }
     ],
     "corridors": [],
     "doors": [],
     "torches": [
      {
       "x": 96,
       "y": 126
      },
      {
       "x": 364,
       "y": 126
      }
     ],
     "chests": [],
     "mobs": [],
     "decorations": []
    }
   }
  ]
 }
};
