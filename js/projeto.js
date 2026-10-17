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
   }
  ],
  "skills": [
   {
    "id": "basic_strike",
    "name": "Golpe básico",
    "category": "basic",
    "isRanged": false,
    "basicRange": 22,
    "damageType": "weapon",
    "base": 0,
    "per": 0,
    "charPercent": 100,
    "scaleStat": "none",
    "scalePercent": 0,
    "icon": "blade",
    "c1": "#9aa7b8",
    "c2": "#c9a227",
    "effects": [],
    "desc": "Ataque automático da arma."
   },
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
    "scalePercent": 100
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
    "scalePercent": 100
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
    "scalePercent": 100
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
    "scalePercent": 100
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
    "scalePercent": 100
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
    "scalePercent": 100
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
     "he1"
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
     "sw2",
     "le2"
    ],
    "skills": [
     "skill_crush"
    ]
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
    "skills": []
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
     "wood",
     "magicWood"
    ],
    "guaranteedDrops": [
     "wood",
     "magicWood"
    ],
    "skills": []
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
     "sw3",
     "ri3"
    ],
    "skills": [
     "skill_roar"
    ]
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
    "dmgMult": 0.238
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
    "dmgMult": 0.3
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
    "dmgMult": 0.183
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
    "dmgMult": 0.271
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
    "dmgMult": 0.25
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
    "dmgMult": 0.306
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
     "F": 5,
     "A": 3,
     "I": 3
    },
    "xp": 15,
    "gold": 5,
    "aggro": 65,
    "equipment": [],
    "drops": [],
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
    "size": 50
   }
  ],
  "effects": []
 },
 "mundo": {
  "arvores": [
   {
    "x": 143,
    "y": 240
   },
   {
    "x": 135,
    "y": 228
   },
   {
    "x": 129,
    "y": 215
   },
   {
    "x": 125,
    "y": 198
   },
   {
    "x": 123,
    "y": 183
   },
   {
    "x": 121,
    "y": 167
   },
   {
    "x": 132,
    "y": 155
   },
   {
    "x": 141,
    "y": 142
   },
   {
    "x": 144,
    "y": 174
   },
   {
    "x": 140,
    "y": 193
   },
   {
    "x": 152,
    "y": 158
   },
   {
    "x": 163,
    "y": 149
   },
   {
    "x": 165,
    "y": 164
   },
   {
    "x": 164,
    "y": 184
   },
   {
    "x": 163,
    "y": 200
   },
   {
    "x": 144,
    "y": 207
   },
   {
    "x": 152,
    "y": 220
   },
   {
    "x": 162,
    "y": 241
   },
   {
    "x": 168,
    "y": 226
   },
   {
    "x": 172,
    "y": 212
   },
   {
    "x": 176,
    "y": 193
   },
   {
    "x": 180,
    "y": 179
   },
   {
    "x": 179,
    "y": 151
   },
   {
    "x": 197,
    "y": 146
   },
   {
    "x": 211,
    "y": 142
   },
   {
    "x": 166,
    "y": 126
   },
   {
    "x": 146,
    "y": 123
   },
   {
    "x": 121,
    "y": 125
   },
   {
    "x": 226,
    "y": 134
   },
   {
    "x": 241,
    "y": 134
   },
   {
    "x": 257,
    "y": 135
   },
   {
    "x": 272,
    "y": 134
   },
   {
    "x": 286,
    "y": 133
   },
   {
    "x": 301,
    "y": 133
   },
   {
    "x": 315,
    "y": 133
   },
   {
    "x": 206,
    "y": 157
   },
   {
    "x": 191,
    "y": 165
   },
   {
    "x": 239,
    "y": 148
   },
   {
    "x": 223,
    "y": 153
   },
   {
    "x": 190,
    "y": 190
   },
   {
    "x": 200,
    "y": 178
   },
   {
    "x": 216,
    "y": 167
   },
   {
    "x": 189,
    "y": 204
   },
   {
    "x": 182,
    "y": 222
   },
   {
    "x": 179,
    "y": 236
   },
   {
    "x": 177,
    "y": 251
   },
   {
    "x": 171,
    "y": 265
   },
   {
    "x": 166,
    "y": 280
   },
   {
    "x": 154,
    "y": 268
   },
   {
    "x": 147,
    "y": 255
   },
   {
    "x": 140,
    "y": 268
   },
   {
    "x": 138,
    "y": 282
   },
   {
    "x": 128,
    "y": 259
   },
   {
    "x": 127,
    "y": 245
   },
   {
    "x": 133,
    "y": 296
   },
   {
    "x": 138,
    "y": 311
   },
   {
    "x": 144,
    "y": 326
   },
   {
    "x": 148,
    "y": 341
   },
   {
    "x": 151,
    "y": 356
   },
   {
    "x": 152,
    "y": 311
   },
   {
    "x": 153,
    "y": 295
   },
   {
    "x": 166,
    "y": 309
   },
   {
    "x": 166,
    "y": 324
   },
   {
    "x": 166,
    "y": 338
   },
   {
    "x": 165,
    "y": 354
   },
   {
    "x": 161,
    "y": 368
   },
   {
    "x": 153,
    "y": 381
   },
   {
    "x": 134,
    "y": 344
   },
   {
    "x": 135,
    "y": 562
   },
   {
    "x": 143,
    "y": 576
   },
   {
    "x": 148,
    "y": 593
   },
   {
    "x": 150,
    "y": 607
   },
   {
    "x": 148,
    "y": 622
   },
   {
    "x": 147,
    "y": 636
   },
   {
    "x": 146,
    "y": 652
   },
   {
    "x": 145,
    "y": 668
   },
   {
    "x": 145,
    "y": 682
   },
   {
    "x": 144,
    "y": 697
   },
   {
    "x": 143,
    "y": 713
   },
   {
    "x": 141,
    "y": 731
   },
   {
    "x": 140,
    "y": 747
   },
   {
    "x": 139,
    "y": 762
   },
   {
    "x": 136,
    "y": 778
   },
   {
    "x": 135,
    "y": 792
   },
   {
    "x": 134,
    "y": 806
   },
   {
    "x": 133,
    "y": 821
   },
   {
    "x": 133,
    "y": 836
   },
   {
    "x": 133,
    "y": 850
   },
   {
    "x": 133,
    "y": 867
   },
   {
    "x": 135,
    "y": 881
   },
   {
    "x": 143,
    "y": 894
   },
   {
    "x": 153,
    "y": 904
   },
   {
    "x": 165,
    "y": 914
   },
   {
    "x": 177,
    "y": 922
   },
   {
    "x": 193,
    "y": 924
   },
   {
    "x": 207,
    "y": 926
   },
   {
    "x": 221,
    "y": 927
   },
   {
    "x": 230,
    "y": 916
   },
   {
    "x": 242,
    "y": 907
   },
   {
    "x": 252,
    "y": 896
   },
   {
    "x": 252,
    "y": 880
   },
   {
    "x": 236,
    "y": 878
   },
   {
    "x": 223,
    "y": 885
   },
   {
    "x": 209,
    "y": 891
   },
   {
    "x": 195,
    "y": 896
   },
   {
    "x": 178,
    "y": 888
   },
   {
    "x": 168,
    "y": 876
   },
   {
    "x": 159,
    "y": 863
   },
   {
    "x": 153,
    "y": 845
   },
   {
    "x": 227,
    "y": 867
   },
   {
    "x": 215,
    "y": 856
   },
   {
    "x": 201,
    "y": 855
   },
   {
    "x": 183,
    "y": 866
   },
   {
    "x": 224,
    "y": 903
   },
   {
    "x": 229,
    "y": 851
   },
   {
    "x": 171,
    "y": 901
   },
   {
    "x": 189,
    "y": 910
   },
   {
    "x": 210,
    "y": 842
   },
   {
    "x": 195,
    "y": 831
   },
   {
    "x": 174,
    "y": 827
   },
   {
    "x": 156,
    "y": 831
   },
   {
    "x": 228,
    "y": 827
   },
   {
    "x": 222,
    "y": 810
   },
   {
    "x": 208,
    "y": 805
   },
   {
    "x": 184,
    "y": 815
   },
   {
    "x": 206,
    "y": 873
   },
   {
    "x": 200,
    "y": 792
   },
   {
    "x": 181,
    "y": 789
   },
   {
    "x": 163,
    "y": 795
   },
   {
    "x": 155,
    "y": 814
   },
   {
    "x": 172,
    "y": 842
   },
   {
    "x": 188,
    "y": 849
   },
   {
    "x": 217,
    "y": 789
   },
   {
    "x": 200,
    "y": 777
   },
   {
    "x": 168,
    "y": 781
   },
   {
    "x": 181,
    "y": 771
   },
   {
    "x": 198,
    "y": 762
   },
   {
    "x": 189,
    "y": 749
   },
   {
    "x": 168,
    "y": 759
   },
   {
    "x": 220,
    "y": 765
   },
   {
    "x": 220,
    "y": 747
   },
   {
    "x": 216,
    "y": 729
   },
   {
    "x": 207,
    "y": 713
   },
   {
    "x": 185,
    "y": 709
   },
   {
    "x": 160,
    "y": 725
   },
   {
    "x": 154,
    "y": 775
   },
   {
    "x": 197,
    "y": 689
   },
   {
    "x": 187,
    "y": 678
   },
   {
    "x": 162,
    "y": 689
   },
   {
    "x": 215,
    "y": 686
   },
   {
    "x": 215,
    "y": 665
   },
   {
    "x": 212,
    "y": 649
   },
   {
    "x": 203,
    "y": 634
   },
   {
    "x": 186,
    "y": 638
   },
   {
    "x": 173,
    "y": 653
   },
   {
    "x": 162,
    "y": 673
   },
   {
    "x": 189,
    "y": 656
   },
   {
    "x": 197,
    "y": 612
   },
   {
    "x": 193,
    "y": 595
   },
   {
    "x": 178,
    "y": 615
   },
   {
    "x": 168,
    "y": 639
   },
   {
    "x": 163,
    "y": 710
   },
   {
    "x": 194,
    "y": 569
   },
   {
    "x": 193,
    "y": 554
   },
   {
    "x": 181,
    "y": 585
   },
   {
    "x": 155,
    "y": 739
   },
   {
    "x": 165,
    "y": 605
   },
   {
    "x": 163,
    "y": 591
   },
   {
    "x": 164,
    "y": 576
   },
   {
    "x": 164,
    "y": 562
   },
   {
    "x": 164,
    "y": 622
   },
   {
    "x": 176,
    "y": 734
   },
   {
    "x": 207,
    "y": 741
   },
   {
    "x": 160,
    "y": 889
   },
   {
    "x": 143,
    "y": 916
   },
   {
    "x": 133,
    "y": 906
   },
   {
    "x": 116,
    "y": 834
   },
   {
    "x": 116,
    "y": 820
   },
   {
    "x": 116,
    "y": 754
   },
   {
    "x": 125,
    "y": 742
   },
   {
    "x": 125,
    "y": 671
   },
   {
    "x": 125,
    "y": 656
   },
   {
    "x": 123,
    "y": 641
   },
   {
    "x": 123,
    "y": 627
   },
   {
    "x": 129,
    "y": 612
   },
   {
    "x": 233,
    "y": 794
   },
   {
    "x": 239,
    "y": 808
   },
   {
    "x": 244,
    "y": 823
   },
   {
    "x": 249,
    "y": 837
   },
   {
    "x": 256,
    "y": 851
   },
   {
    "x": 267,
    "y": 862
   },
   {
    "x": 280,
    "y": 870
   },
   {
    "x": 293,
    "y": 878
   },
   {
    "x": 309,
    "y": 883
   },
   {
    "x": 324,
    "y": 887
   },
   {
    "x": 339,
    "y": 891
   },
   {
    "x": 353,
    "y": 893
   },
   {
    "x": 367,
    "y": 893
   },
   {
    "x": 381,
    "y": 892
   },
   {
    "x": 398,
    "y": 891
   },
   {
    "x": 412,
    "y": 891
   },
   {
    "x": 361,
    "y": 878
   },
   {
    "x": 347,
    "y": 876
   },
   {
    "x": 332,
    "y": 869
   },
   {
    "x": 319,
    "y": 863
   },
   {
    "x": 306,
    "y": 853
   },
   {
    "x": 296,
    "y": 843
   },
   {
    "x": 294,
    "y": 828
   },
   {
    "x": 280,
    "y": 830
   },
   {
    "x": 264,
    "y": 830
   },
   {
    "x": 281,
    "y": 845
   },
   {
    "x": 304,
    "y": 867
   },
   {
    "x": 379,
    "y": 906
   },
   {
    "x": 368,
    "y": 916
   },
   {
    "x": 360,
    "y": 930
   },
   {
    "x": 345,
    "y": 917
   },
   {
    "x": 314,
    "y": 897
   },
   {
    "x": 299,
    "y": 894
   },
   {
    "x": 282,
    "y": 887
   },
   {
    "x": 266,
    "y": 884
   },
   {
    "x": 335,
    "y": 907
   },
   {
    "x": 323,
    "y": 917
   },
   {
    "x": 269,
    "y": 901
   },
   {
    "x": 260,
    "y": 913
   },
   {
    "x": 250,
    "y": 923
   }
  ],
  "elementos": [
   {
    "type": "rock",
    "x": 138,
    "y": 383
   },
   {
    "type": "rock",
    "x": 134,
    "y": 393
   },
   {
    "type": "rock",
    "x": 129,
    "y": 404
   },
   {
    "type": "rock",
    "x": 125,
    "y": 414
   },
   {
    "type": "rock",
    "x": 123,
    "y": 424
   },
   {
    "type": "rock",
    "x": 129,
    "y": 434
   },
   {
    "type": "rock",
    "x": 139,
    "y": 435
   },
   {
    "type": "rock",
    "x": 140,
    "y": 425
   },
   {
    "type": "rock",
    "x": 140,
    "y": 413
   },
   {
    "type": "rock",
    "x": 140,
    "y": 403
   },
   {
    "type": "rock",
    "x": 150,
    "y": 391
   },
   {
    "type": "rock",
    "x": 149,
    "y": 408
   },
   {
    "type": "rock",
    "x": 149,
    "y": 418
   },
   {
    "type": "rock",
    "x": 150,
    "y": 428
   },
   {
    "type": "rock",
    "x": 137,
    "y": 472
   },
   {
    "type": "rock",
    "x": 132,
    "y": 483
   },
   {
    "type": "rock",
    "x": 131,
    "y": 494
   },
   {
    "type": "rock",
    "x": 131,
    "y": 505
   },
   {
    "type": "rock",
    "x": 132,
    "y": 515
   },
   {
    "type": "rock",
    "x": 132,
    "y": 525
   },
   {
    "type": "rock",
    "x": 131,
    "y": 535
   },
   {
    "type": "rock",
    "x": 128,
    "y": 545
   },
   {
    "type": "rock",
    "x": 139,
    "y": 546
   },
   {
    "type": "rock",
    "x": 148,
    "y": 540
   },
   {
    "type": "rock",
    "x": 154,
    "y": 532
   },
   {
    "type": "rock",
    "x": 154,
    "y": 520
   },
   {
    "type": "rock",
    "x": 154,
    "y": 510
   },
   {
    "type": "rock",
    "x": 154,
    "y": 500
   },
   {
    "type": "rock",
    "x": 155,
    "y": 490
   },
   {
    "type": "rock",
    "x": 157,
    "y": 480
   },
   {
    "type": "rock",
    "x": 143,
    "y": 496
   },
   {
    "type": "rock",
    "x": 141,
    "y": 532
   },
   {
    "type": "rock",
    "x": 142,
    "y": 517
   },
   {
    "type": "rock",
    "x": 142,
    "y": 486
   },
   {
    "type": "rock",
    "x": 171,
    "y": 475
   },
   {
    "type": "rock",
    "x": 173,
    "y": 486
   },
   {
    "type": "rock",
    "x": 174,
    "y": 498
   },
   {
    "type": "rock",
    "x": 171,
    "y": 508
   },
   {
    "type": "rock",
    "x": 169,
    "y": 521
   },
   {
    "type": "rock",
    "x": 166,
    "y": 531
   },
   {
    "type": "rock",
    "x": 165,
    "y": 542
   }
  ],
  "portais": [
   {
    "id": "portal_ruins",
    "name": "Ruínas do Norte",
    "minLevel": 1,
    "targetLevel": 1,
    "countMin": 2,
    "countMax": 3,
    "eliteChance": 0.03,
    "frequency": 1,
    "monsters": [
     {
      "id": "sl",
      "chance": 65
     },
     {
      "id": "bat",
      "chance": 35
     }
    ]
   },
   {
    "id": "portal_cliff",
    "name": "Penhasco Leste",
    "minLevel": 4,
    "targetLevel": 6,
    "countMin": 2,
    "countMax": 4,
    "eliteChance": 0.05,
    "frequency": 1,
    "monsters": [
     {
      "id": "sk",
      "chance": 45
     },
     {
      "id": "wolf",
      "chance": 35
     },
     {
      "id": "spider",
      "chance": 20
     }
    ]
   },
   {
    "id": "portal_wolf_trail",
    "name": "Trilha dos Lobos",
    "minLevel": 4,
    "targetLevel": 6,
    "countMin": 2,
    "countMax": 3,
    "eliteChance": 0.08,
    "frequency": 0.9,
    "monsters": [
     {
      "id": "wolf",
      "chance": 60
     },
     {
      "id": "spider",
      "chance": 40
     }
    ]
   },
   {
    "id": "portal_forest",
    "name": "Floresta Antiga",
    "minLevel": 7,
    "targetLevel": 10,
    "countMin": 3,
    "countMax": 4,
    "eliteChance": 0.08,
    "frequency": 1,
    "monsters": [
     {
      "id": "shroom",
      "chance": 50
     },
     {
      "id": "ghost",
      "chance": 30
     },
     {
      "id": "goblin",
      "chance": 20
     }
    ]
   },
   {
    "id": "portal_mushroom_grove",
    "name": "Bosque dos Cogumelos",
    "minLevel": 7,
    "targetLevel": 9,
    "countMin": 3,
    "countMax": 4,
    "eliteChance": 0.1,
    "frequency": 1.1,
    "monsters": [
     {
      "id": "shroom",
      "chance": 45
     },
     {
      "id": "ghost",
      "chance": 35
     },
     {
      "id": "sprout",
      "chance": 20
     }
    ]
   },
   {
    "id": "portal_coast",
    "name": "Costa Sul",
    "minLevel": 11,
    "targetLevel": 14,
    "countMin": 3,
    "countMax": 5,
    "eliteChance": 0.1,
    "frequency": 1,
    "monsters": [
     {
      "id": "crab",
      "chance": 50
     },
     {
      "id": "ghost",
      "chance": 30
     },
     {
      "id": "sk",
      "chance": 20
     }
    ]
   },
   {
    "id": "portal_guardian_sanctum",
    "name": "Santuário do Guardião",
    "minLevel": 15,
    "targetLevel": 18,
    "countMin": 2,
    "countMax": 3,
    "eliteChance": 0.12,
    "frequency": 0.7,
    "monsters": [
     {
      "id": "ghost",
      "chance": 50
     },
     {
      "id": "sk",
      "chance": 40
     },
     {
      "id": "boss",
      "chance": 10
     }
    ]
   },
   {
    "id": "ratos",
    "name": "Ratos",
    "minLevel": 1,
    "targetLevel": 1,
    "countMin": 5,
    "countMax": 10,
    "eliteChance": 0.2,
    "frequency": 1,
    "monsters": [
     {
      "id": "rato",
      "chance": 100
     }
    ]
   }
  ],
  "calc": {}
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
       "h": 150
      },
      {
       "id": 3,
       "name": "Arsenal Goblin",
       "x": 330,
       "y": 390,
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
       "x": 240,
       "y": 180,
       "w": 100,
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
       "h": 100,
       "dir": "v"
      },
      {
       "id": 13,
       "from": 3,
       "to": 4,
       "x": 530,
       "y": 450,
       "w": 100,
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
       "lvl": 4
      },
      {
       "id": 102,
       "type": "goblin",
       "x": 455,
       "y": 220,
       "lvl": 4
      },
      {
       "id": 103,
       "type": "gob",
       "x": 430,
       "y": 340,
       "lvl": 4
      },
      {
       "id": 104,
       "type": "gob",
       "x": 408,
       "y": 456,
       "lvl": 5
      },
      {
       "id": 105,
       "type": "gob",
       "x": 445,
       "y": 500,
       "lvl": 5
      },
      {
       "id": 106,
       "type": "goblin",
       "x": 470,
       "y": 510,
       "lvl": 4
      },
      {
       "id": 107,
       "type": "goblinBoss",
       "x": 780,
       "y": 480,
       "lvl": 7,
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
