const CARD_EFFECTS_OPPONENT = {
  skip: (state, card, target) => {
    const newState = { ...state };
    const opponent = newState.currentPlayer === 'P1' ? 'P2' : 'P1';
    
    newState.skipNextTurn = newState.skipNextTurn || {};
    newState.skipNextTurn[opponent] = true;
    
    newState.log = [...newState.log, { 
      message: `${card.name}: ${opponent}'s next turn skipped!`, 
      playerType: newState.currentPlayer,
      timestamp: Date.now() 
    }];
    
    return newState;
  },

  discard: (state, card, target) => {
    const newState = { ...state };
    const opponent = newState.currentPlayer === 'P1' ? 'P2' : 'P1';
    
    if (newState.hands[opponent].length > 0) {
      const randomIndex = Math.floor(Math.random() * newState.hands[opponent].length);
      const discarded = newState.hands[opponent][randomIndex];
      const newHand = [...newState.hands[opponent]];
      newHand.splice(randomIndex, 1);
      
      newState.hands = { ...newState.hands, [opponent]: newHand };
      newState.discardPile = [...newState.discardPile, discarded];
      
      newState.log = [...newState.log, { 
        message: `${card.name}: ${opponent} forced to discard ${discarded.name}`, 
        playerType: newState.currentPlayer,
        timestamp: Date.now() 
      }];
    }
    
    return newState;
  },

  blind: (state, card, target) => {
    const newState = { ...state };
    const opponent = newState.currentPlayer === 'P1' ? 'P2' : 'P1';
    
    newState.blindPlayers[opponent] = true;
    setTimeout(() => {
      if (gameState.blindPlayers[opponent]) {
        gameState.blindPlayers[opponent] = false;
      }
    }, 15000);
    
    newState.log = [...newState.log, { 
      message: `${card.name}: ${opponent} is now playing blind!`, 
      playerType: newState.currentPlayer,
      timestamp: Date.now() 
    }];
    
    return newState;
  },

  lockout: (state, card, target) => {
    if (target === null) return { ...state, _pendingTarget: card.id, _lockoutMode: true };
    
    const newState = { ...state };
    const index = parseInt(target);
    const opponent = newState.currentPlayer === 'P1' ? 'P2' : 'P1';
    
    if (!newState.forbiddenSquares[opponent].includes(index)) {
      newState.forbiddenSquares[opponent] = [...newState.forbiddenSquares[opponent], index];
      
      newState.log = [...newState.log, { 
        message: `${card.name}: ${opponent} cannot play at ${index}`, 
        playerType: newState.currentPlayer,
        timestamp: Date.now() 
      }];
    }
    
    return newState;
  },

  handSwap: (state, card, target) => {
    const newState = { ...state };
    
    const tempHand = newState.hands.P1;
    newState.hands.P1 = newState.hands.P2;
    newState.hands.P2 = tempHand;
    
    newState.log = [...newState.log, { 
      message: `${card.name}: Hands swapped!`, 
      playerType: newState.currentPlayer,
      timestamp: Date.now() 
    }];
    
    return newState;
  }
};

Object.assign(CARD_EFFECTS, CARD_EFFECTS_OPPONENT);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CARD_EFFECTS_OPPONENT;
}