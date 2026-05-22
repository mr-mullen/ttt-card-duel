const ASCII = {
  pieces: {
    X: [
      " ╲   ╱ ",
      "  ╲ ╱  ",
      "   ╳   ",
      "  ╱ ╲  ",
      " ╱   ╲ "
    ],
    O: [
      " ╭───╮ ",
      " │   │ ",
      " │   │ ",
      " │   │ ",
      " ╰───╯ "
    ]
  },

  board: (rows, cols) => {
    const horiz = '═'.repeat(7);
    const vert = '║';
    const cross = '╬';
    const tDown = '╦';
    const tUp = '╩';
    const tRight = '╠';
    const tLeft = '╣';
    const tl = '╔';
    const tr = '╗';
    const bl = '╚';
    const br = '╝';
    
    let art = [];
    
    for (let r = 0; r < rows; r++) {
      if (r === 0) {
        let topLine = tl + horiz;
        for (let c = 1; c < cols; c++) {
          topLine += tDown + horiz;
        }
        art.push(topLine);
      } else {
        let midLine = tRight + horiz;
        for (let c = 1; c < cols; c++) {
          midLine += cross + horiz;
        }
        art.push(midLine);
      }
      
      let rowLine = vert + '       ';
      for (let c = 1; c < cols; c++) {
        rowLine += vert + '       ';
      }
      art.push(rowLine);
      art.push(rowLine);
      art.push(rowLine);
    }
    
    let botLine = bl + horiz;
    for (let c = 1; c < cols; c++) {
      botLine += tUp + horiz;
    }
    art.push(botLine);
    
    return art;
  },

  cards: {
    EXPANSION: {
      sigil: '▣',
      art: [
        "╔═══════╗",
        "║ EXPAND║",
        "║   ╱╲  ║",
        "║  ╱──╲ ║",
        "║ ╱    ╲║",
        "╚═══════╝"
      ]
    },
    MIRROR_WORLD: {
      sigil: '◈',
      art: [
        "╔═══════╗",
        "║◄►◄►◄► ║",
        "║ MIRROR║",
        "║  ╱╲   ║",
        "║ ◄ ╲ ► ║",
        "╚═══════╝"
      ]
    },
    THE_VOID: {
      sigil: '◌',
      art: [
        "╔═══════╗",
        "║   ◎   ║",
        "║  VOID ║",
        "║  ╲╱   ║",
        "║   ○   ║",
        "╚═══════╝"
      ]
    },
    STEAL: {
      sigil: '⚔',
      art: [
        "╔═══════╗",
        "║  ╔═╗  ║",
        "║══╣⚔╠══║",
        "║  ╚═╝  ║",
        "║ STEAL ║",
        "╚═══════╝"
      ]
    },
    BOMB: {
      sigil: '✷',
      art: [
        "╔═══════╗",
        "║  ╭─╮  ║",
        "║ ╱✷✷✷╲ ║",
        "║ │ ☼ │ ║",
        "║ ╲ ✷ ╱ ║",
        "╚═══════╝"
      ]
    },
    FORTIFY: {
      sigil: '◆',
      art: [
        "╔═══════╗",
        "║ ╔═══╗ ║",
        "║ ║ ◆ ║ ║",
        "║ ╚═══╝ ║",
        "║FORTIFY║",
        "╚═══════╝"
      ]
    },
    DOUBLE_PLAY: {
      sigil: '⇉',
      art: [
        "╔═══════╗",
        "║ ⇒ ⇒  ║",
        "║DOUBLE ║",
        "║ ⇒ ⇒  ║",
        "║ PLAY  ║",
        "╚═══════╝"
      ]
    },
    TELEPORT: {
      sigil: '†',
      art: [
        "╔═══════╗",
        "║   ↑   ║",
        "║  ╱█╲  ║",
        "║ ╱███╲ ║",
        "║TÉLÈPOT║",
        "╚═══════╝"
      ]
    },
    SKIP: {
      sigil: '⊘',
      art: [
        "╔═══════╗",
        "║  ╱╲   ║",
        "║ ╱ ⊘ ╲ ║",
        "║  ╲╱   ║",
        "║ SKIP  ║",
        "╚═══════╝"
      ]
    },
    DISCARD: {
      sigil: '✕',
      art: [
        "╔═══════╗",
        "║ ╱───╲ ║",
        "║ │ ✕ │ ║",
        "║ ╲───╱ ║",
        "║DISCARD║",
        "╚═══════╝"
      ]
    },
    DRAW_TWO: {
      sigil: '⇑',
      art: [
        "╔═══════╗",
        "║  ⇑⇑  ║",
        "║       ║",
        "║ DRAW  ║",
        "║  TWO  ║",
        "╚═══════╝"
      ]
    },
    MISERE_MODE: {
      sigil: '�奀',
      art: [
        "╔═══════╗",
        "║ MISÈRE║",
        "║  ⇔⇔⇔  ║",
        "║ MODE  ║",
        "║ ⚠WRNG ║",
        "╚═══════╝"
      ]
    },
    LANDSLIDE: {
      sigil: '▾',
      art: [
        "╔═══════╗",
        "║ ▽ ▽ ▽ ║",
        "║▔▔▔▔▔▔▔║",
        "║  ↓↓  ║",
        "║LANDSLDE║",
        "╚═══════╝"
      ]
    },
    BLIND: {
      sigil: '◐',
      art: [
        "╔═══════╗",
        "║  ▓▓▓  ║",
        "║  ▓◐▓  ║",
        "║  ▓▓▓  ║",
        "║ BLIND ║",
        "╚═══════╝"
      ]
    },
    EARTHQUAKE: {
      sigil: '≋',
      art: [
        "╔═══════╗",
        "║ ≈≈≈≈≈ ║",
        "║ QuAKE ║",
        "║ ≈≈≈≈≈ ║",
        "║  )))  ║",
        "╚═══════╝"
      ]
    },
    OVERWRITE: {
      sigil: '⚜',
      art: [
        "╔═══════╗",
        "║  ╳→╳  ║",
        "║       ║",
        "║OVERWR.║",
        "║  ↻    ║",
        "╚═══════╝"
      ]
    },
    HAND_SWAP: {
      sigil: '⇄',
      art: [
        "╔═══════╗",
        "║ ⇄   ⇄ ║",
        "║ HANDS ║",
        "║ ⇄   ⇄ ║",
        "║ SWAP  ║",
        "╚═══════╝"
      ]
    },
    OVERTIME: {
      sigil: '∞',
      art: [
        "╔═══════╗",
        "║  ∞∞   ║",
        "║       ║",
        "║OVERTIM║",
        "║   E   ║",
        "╚═══════╝"
      ]
    },
    CORNERS_RULE: {
      sigil: '◌',
      art: [
        "╔═══════╗",
        "║○     ○║",
        "║   +   ║",
        "║○     ○║",
        "║CORNERS║",
        "╚═══════╝"
      ]
    },
    BLACK_MARKET: {
      sigil: '▤',
      art: [
        "╔═══════╗",
        "║ ▤▤▤▤▤ ║",
        "║ ▤ ▤ ▤ ║",
        "║ ▤▤▤▤▤ ║",
        "║BLACKMKT║",
        "╚═══════╝"
      ]
    },
    WILD_GRID: {
      sigil: '✿',
      art: [
        "╔═══════╗",
        "║ ⚎ ⚍ ⚏ ║",
        "║ ⚍ ⚏ ⚎ ║",
        "║ ⚏ ⚎ ⚍ ║",
        "║ WILD  ║",
        "║ GRID  ║",
        "╚═══════╝"
      ]
    },
    NUKE: {
      sigil: '☢',
      art: [
        "╔═══════╗",
        "║  ☢☢☢  ║",
        "║  ☢☢☢  ║",
        "║ ☢☢☢☢☢ ║",
        "║  NUKE ║",
        "║ »»»«« ║",
        "╚═══════╝"
      ]
    },
    TIME_WARP: {
      sigil: '⊗',
      art: [
        "╔═══════╗",
        "║ ⊗⇔⊘⇔⊗ ║",
        "║  TIME ║",
        "║ ⊘⇔⊗⇔⊘ ║",
        "║  WARP ║",
        "╚═══════╝"
      ]
    },
    ARCHITECT: {
      sigil: '✐',
      art: [
        "╔═══════╗",
        "║ ┌───┐ ║",
        "║ │ ✐ │ ║",
        "║ └───┘ ║",
        "║ARCHTECT║",
        "╚═══════╝"
      ]
    }
  },

  cardFrame: {
    top: '╭──────────╮',
    bottom: '╰──────────╯',
    side: '│'
  }
};

const CARDS_CONFIG = {
  handSize: 3,
  drawPerTurn: 1,
  deckSize: 30
};

const CARD_DEFINITIONS = {
  EXPANSION: {
    id: 'EXPANSION',
    name: 'EXPANSION',
    rarity: 'COMMON',
    category: 'BOARD',
    isReaction: false,
    description: 'Add one row to the bottom of the board',
    effect: 'expand'
  },
  MIRROR_WORLD: {
    id: 'MIRROR_WORLD',
    name: 'MIRROR WORLD',
    rarity: 'COMMON',
    category: 'BOARD',
    isReaction: false,
    description: 'Flip the board horizontally',
    effect: 'mirror'
  },
  THE_VOID: {
    id: 'THE_VOID',
    name: 'THE VOID',
    rarity: 'COMMON',
    category: 'BOARD',
    isReaction: false,
    description: 'Remove one cell permanently',
    effect: 'void'
  },
  STEAL: {
    id: 'STEAL',
    name: 'STEAL',
    rarity: 'COMMON',
    category: 'PIECE',
    isReaction: false,
    description: 'Convert opponent piece to yours',
    effect: 'steal'
  },
  BOMB: {
    id: 'BOMB',
    name: 'BOMB',
    rarity: 'COMMON',
    category: 'PIECE',
    isReaction: false,
    description: 'Destroy any piece on the board',
    effect: 'bomb'
  },
  FORTIFY: {
    id: 'FORTIFY',
    name: 'FORTIFY',
    rarity: 'UNCOMMON',
    category: 'PIECE',
    isReaction: true,
    description: 'Shield a piece from effects',
    effect: 'fortify'
  },
  DOUBLE_PLAY: {
    id: 'DOUBLE_PLAY',
    name: 'DOUBLE PLAY',
    rarity: 'COMMON',
    category: 'PIECE',
    isReaction: false,
    description: 'Take an extra turn',
    effect: 'doublePlay'
  },
  TELEPORT: {
    id: 'TELEPORT',
    name: 'TELEPORT',
    rarity: 'COMMON',
    category: 'PIECE',
    isReaction: false,
    description: 'Move piece to any empty square',
    effect: 'teleport'
  },
  SKIP: {
    id: 'SKIP',
    name: 'SKIP',
    rarity: 'COMMON',
    category: 'OPPONENT',
    isReaction: false,
    description: 'Opponent loses next turn',
    effect: 'skip'
  },
  DISCARD: {
    id: 'DISCARD',
    name: 'DISCARD',
    rarity: 'COMMON',
    category: 'OPPONENT',
    isReaction: false,
    description: 'Force opponent to discard a card',
    effect: 'discard'
  },
  DRAW_TWO: {
    id: 'DRAW_TWO',
    name: 'DRAW TWO',
    rarity: 'COMMON',
    category: 'DRAW',
    isReaction: false,
    description: 'Draw 2 extra cards',
    effect: 'drawTwo'
  },
  MISERE_MODE: {
    id: 'MISERE_MODE',
    name: 'MISÈRE MODE',
    rarity: 'UNCOMMON',
    category: 'WIN',
    isReaction: false,
    description: '3-in-a-row LOSES for 2 turns',
    effect: 'misere'
  },
  LANDSLIDE: {
    id: 'LANDSLIDE',
    name: 'LANDSLIDE',
    rarity: 'UNCOMMON',
    category: 'BOARD',
    isReaction: false,
    description: 'All pieces fall downward',
    effect: 'landslide'
  },
  BLIND: {
    id: 'BLIND',
    name: 'BLIND',
    rarity: 'UNCOMMON',
    category: 'OPPONENT',
    isReaction: true,
    description: 'Opponent plays blind next turn',
    effect: 'blind'
  },
  EARTHQUAKE: {
    id: 'EARTHQUAKE',
    name: 'EARTHQUAKE',
    rarity: 'UNCOMMON',
    category: 'BOARD',
    isReaction: false,
    description: 'Rotate board 90° clockwise',
    effect: 'earthquake'
  },
  OVERWRITE: {
    id: 'OVERWRITE',
    name: 'OVERWRITE',
    rarity: 'UNCOMMON',
    category: 'PIECE',
    isReaction: false,
    description: 'Place piece on any square',
    effect: 'overwrite'
  },
  HAND_SWAP: {
    id: 'HAND_SWAP',
    name: 'HAND SWAP',
    rarity: 'UNCOMMON',
    category: 'OPPONENT',
    isReaction: false,
    description: 'Swap hands with opponent',
    effect: 'handSwap'
  },
  OVERTIME: {
    id: 'OVERTIME',
    name: 'OVERTIME',
    rarity: 'UNCOMMON',
    category: 'WIN',
    isReaction: false,
    description: 'Draw = play another round',
    effect: 'overtime'
  },
  CORNERS_RULE: {
    id: 'CORNERS_RULE',
    name: 'CORNERS RULE',
    rarity: 'UNCOMMON',
    category: 'WIN',
    isReaction: false,
    description: 'Control all 4 corners to win',
    effect: 'corners'
  },
  BLACK_MARKET: {
    id: 'BLACK_MARKET',
    name: 'BLACK MARKET',
    rarity: 'UNCOMMON',
    category: 'DRAW',
    isReaction: false,
    description: 'Both players draw and may play',
    effect: 'blackMarket'
  },
  WILD_GRID: {
    id: 'WILD_GRID',
    name: 'WILD GRID',
    rarity: 'UNCOMMON',
    category: 'BOARD',
    isReaction: false,
    description: 'Shuffle all pieces randomly',
    effect: 'wildGrid'
  },
  NUKE: {
    id: 'NUKE',
    name: 'NUKE',
    rarity: 'LEGENDARY',
    category: 'SPECIAL',
    isReaction: false,
    description: 'Wipe entire board clean',
    effect: 'nuke'
  },
  TIME_WARP: {
    id: 'TIME_WARP',
    name: 'TIME WARP',
    rarity: 'LEGENDARY',
    category: 'SPECIAL',
    isReaction: false,
    description: 'Undo the last 2 moves',
    effect: 'timeWarp'
  },
  ARCHITECT: {
    id: 'ARCHITECT',
    name: 'ARCHITECT',
    rarity: 'LEGENDARY',
    category: 'SPECIAL',
    isReaction: false,
    description: 'Redesign board shape',
    effect: 'architect'
  }
};

const ACTIVE_CARDS = [
  'EXPANSION', 'MIRROR_WORLD', 'THE_VOID', 'STEAL', 'BOMB', 'FORTIFY',
  'DOUBLE_PLAY', 'TELEPORT', 'SKIP', 'DISCARD', 'DRAW_TWO', 'MISERE_MODE',
  'LANDSLIDE', 'BLIND', 'EARTHQUAKE', 'OVERWRITE', 'HAND_SWAP', 'OVERTIME',
  'CORNERS_RULE', 'BLACK_MARKET', 'WILD_GRID', 'NUKE', 'TIME_WARP', 'ARCHITECT'
];

const DECK_COMPOSITION = {
  COMMON: ['EXPANSION', 'MIRROR_WORLD', 'THE_VOID', 'STEAL', 'BOMB', 'DOUBLE_PLAY', 'TELEPORT', 'SKIP', 'DISCARD', 'DRAW_TWO', 'LANDSLIDE', 'WILD_GRID'],
  UNCOMMON: ['FORTIFY', 'MISERE_MODE', 'BLIND', 'EARTHQUAKE', 'OVERWRITE', 'HAND_SWAP', 'OVERTIME', 'CORNERS_RULE', 'BLACK_MARKET'],
  LEGENDARY: ['NUKE', 'TIME_WARP', 'ARCHITECT']
};

const RARITY_WEIGHTS = { COMMON: 0.55, UNCOMMON: 0.30, LEGENDARY: 0.15 };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ASCII, CARDS_CONFIG, CARD_DEFINITIONS, ACTIVE_CARDS, DECK_COMPOSITION, RARITY_WEIGHTS };
}