const CARD_EFFECTS_PIECE = {
  steal: (state, card, target) => {
    if (target === null) return { ...state, _pendingTarget: card.id };
    
    const newState = { ...state };
    const index = parseInt(target);
    const currentPlayer = newState.currentPlayer;
    const opponent = currentPlayer === 'P1' ? 'P2' : 'P1';
    
    if (newState.board[index] === opponent) {
      newState.board[index] = currentPlayer;
      
      newState.log = [...newState.log, { 
        message: `${card.name}: Converted opponent's piece at ${index}`, 
        playerType: currentPlayer,
        timestamp: Date.now() 
      }];
    }
    
    return newState;
  },

  bomb: (state, card, target) => {
    if (target === null) return { ...state, _pendingTarget: card.id };
    
    const newState = { ...state };
    const index = parseInt(target);
    
    if (newState.board[index] && !newState.fortifiedSquares.includes(index)) {
      newState.board[index] = null;
      
      newState.log = [...newState.log, { 
        message: `${card.name}: Destroyed piece at ${index}!`, 
        playerType: newState.currentPlayer,
        timestamp: Date.now() 
      }];
    }
    
    return newState;
  },

  fortify: (state, card, target) => {
    if (target === null) return { ...state, _pendingTarget: card.id };
    
    const newState = { ...state };
    const index = parseInt(target);
    const currentPlayer = newState.currentPlayer;
    
    if (newState.board[index] === currentPlayer && !newState.fortifiedSquares.includes(index)) {
      newState.fortifiedSquares = [...newState.fortifiedSquares, index];
      
      newState.log = [...newState.log, { 
        message: `${card.name}: Piece at ${index} is now shielded!`, 
        playerType: currentPlayer,
        timestamp: Date.now() 
      }];
    }
    
    return newState;
  },

  doublePlay: (state, card, target) => {
    const newState = { ...state };
    const currentPlayer = newState.currentPlayer;
    
    newState.doubleTurn[currentPlayer] = true;
    
    newState.log = [...newState.log, { 
      message: `${card.name}: Extra turn earned!`, 
      playerType: currentPlayer,
      timestamp: Date.now() 
    }];
    
    return newState;
  },

  teleport: (state, card, target) => {
    if (target === null) return { ...state, _pendingTarget: card.id, _teleportMode: 'select' };
    
    const newState = { ...state };
    const [fromIdx, toIdx] = target.split(',').map(Number);
    const currentPlayer = newState.currentPlayer;
    
    if (newState.board[fromIdx] === currentPlayer && newState.board[toIdx] === null) {
      newState.board[fromIdx] = null;
      newState.board[toIdx] = currentPlayer;
      
      newState.log = [...newState.log, { 
        message: `${card.name}: Teleported piece from ${fromIdx} to ${toIdx}`, 
        playerType: currentPlayer,
        timestamp: Date.now() 
      }];
    }
    
    return newState;
  },

  overwrite: (state, card, target) => {
    if (target === null) return { ...state, _pendingTarget: card.id };
    
    const newState = { ...state };
    const index = parseInt(target);
    const currentPlayer = newState.currentPlayer;
    
    if (!newState.voidSquares.includes(index) && !newState.fortifiedSquares.includes(index)) {
      newState.board[index] = currentPlayer;
      
      newState.log = [...newState.log, { 
        message: `${card.name}: Placed piece at ${index}, overwriting!`, 
        playerType: currentPlayer,
        timestamp: Date.now() 
      }];
    }
    
    return newState;
  },

  nuke: (state, card, target) => {
    const newState = { ...state };
    
    for (let i = 0; i < newState.board.length; i++) {
      if (!newState.voidSquares.includes(i) && !newState.fortifiedSquares.includes(i)) {
        newState.board[i] = null;
      }
    }
    
    newState.log = [...newState.log, { 
      message: `${card.name}: NUKE! Board wiped clean!`, 
      playerType: newState.currentPlayer,
      timestamp: Date.now() 
    }];
    
    return newState;
  },

  timeWarp: (state, card, target) => {
    const newState = { ...state };
    
    if (newState.history.length >= 2) {
      const previousState = newState.history[newState.history.length - 2];
      newState.board = previousState.board.slice();
      newState.boardSize = { ...previousState.boardSize };
      newState.voidSquares = previousState.voidSquares.slice();
      newState.fortifiedSquares = previousState.fortifiedSquares.slice();
      newState.forbiddenSquares = { 
        P1: previousState.forbiddenSquares.P1.slice(), 
        P2: previousState.forbiddenSquares.P2.slice() 
      };
      newState.history = newState.history.slice(0, -2);
      
      newState.log = [...newState.log, { 
        message: `${card.name}: Time rewound 2 moves!`, 
        playerType: newState.currentPlayer,
        timestamp: Date.now() 
      }];
    } else if (newState.history.length === 1) {
      const previousState = newState.history[0];
      newState.board = previousState.board.slice();
      newState.boardSize = { ...previousState.boardSize };
      newState.voidSquares = previousState.voidSquares.slice();
      newState.fortifiedSquares = previousState.fortifiedSquares.slice();
      newState.history = [];
      
      newState.log = [...newState.log, { 
        message: `${card.name}: Time rewound 1 move!`, 
        playerType: newState.currentPlayer,
        timestamp: Date.now() 
      }];
    }
    
    return newState;
  }
};

Object.assign(CARD_EFFECTS, CARD_EFFECTS_PIECE);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CARD_EFFECTS_PIECE;
}