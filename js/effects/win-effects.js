const CARD_EFFECTS_WIN = {
  misere: (state, card, target) => {
    const newState = { ...state };
    
    newState.winCondition = 'MISERE';
    newState.misereTurnsLeft = 4;
    
    newState.log = [...newState.log, { 
      message: `${card.name}: MISÈRE MODE! 3-in-a-row now LOSES!`, 
      playerType: newState.currentPlayer,
      timestamp: Date.now() 
    }];
    
    return newState;
  },

  overtime: (state, card, target) => {
    const newState = { ...state };
    
    newState.overtimeActive = true;
    
    newState.log = [...newState.log, { 
      message: `${card.name}: Overtime enabled! Draw leads to extra round.`, 
      playerType: newState.currentPlayer,
      timestamp: Date.now() 
    }];
    
    return newState;
  },

  corners: (state, card, target) => {
    const newState = { ...state };
    
    newState.winCondition = 'CORNERS';
    
    newState.log = [...newState.log, { 
      message: `${card.name}: Corners Rule activated!`, 
      playerType: newState.currentPlayer,
      timestamp: Date.now() 
    }];
    
    return newState;
  },

  diagonalOnly: (state, card, target) => {
    const newState = { ...state };
    
    newState.winCondition = 'DIAGONAL_ONLY';
    newState.diagonalOnlyTurnsLeft = 6;
    
    newState.log = [...newState.log, { 
      message: `${card.name}: Diagonals only! Only diagonal wins count.`, 
      playerType: newState.currentPlayer,
      timestamp: Date.now() 
    }];
    
    return newState;
  },

  blackMarket: (state, card, target) => {
    const newState = { ...state };
    
    newState.blackMarketActive = true;
    newState.phase = 'BLACK_MARKET';
    
    newState = drawCards(newState, 'P1', 1);
    newState = drawCards(newState, 'P2', 1);
    
    newState.log = [...newState.log, { 
      message: `${card.name}: BLACK MARKET opens! Both players draw.`, 
      playerType: 'SYSTEM',
      timestamp: Date.now() 
    }];
    
    return newState;
  }
};

Object.assign(CARD_EFFECTS, CARD_EFFECTS_WIN);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CARD_EFFECTS_WIN;
}