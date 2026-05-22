const Card = function(id) {
  const def = CARD_DEFINITIONS[id];
  if (!def) throw new Error(`Unknown card: ${id}`);
  
  this.id = def.id;
  this.name = def.name;
  this.rarity = def.rarity;
  this.category = def.category;
  this.isReaction = def.isReaction;
  this.description = def.description;
  this.effect = def.effect;
};

Card.prototype.play = function(gameState, target = null) {
  const effectFn = CARD_EFFECTS[this.effect];
  if (!effectFn) {
    console.warn(`No effect found for: ${this.effect}`);
    return gameState;
  }
  return effectFn(gameState, this, target);
};

Card.prototype.toString = function() {
  return this.name;
};

function createDeck() {
  const deck = [];
  
  for (const cardId of ACTIVE_CARDS) {
    const card = new Card(cardId);
    deck.push(card);
  }
  
  const extraCommon = [];
  const commonCards = DECK_COMPOSITION.COMMON.filter(c => c !== 'WILD_GRID');
  for (let i = 0; i < 6; i++) {
    const randomCard = commonCards[Math.floor(Math.random() * commonCards.length)];
    extraCommon.push(new Card(randomCard));
  }
  
  deck.push(...extraCommon);
  
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  return deck;
}

function drawCards(state, player, count) {
  const newState = { ...state };
  const playerHand = [...newState.hands[player]];
  
  for (let i = 0; i < count; i++) {
    if (newState.deck.length === 0) {
      if (newState.discardPile.length === 0) break;
      newState.deck = [...newState.discardPile];
      newState.discardPile = [];
      for (let j = newState.deck.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [newState.deck[j], newState.deck[k]] = [newState.deck[k], newState.deck[j]];
      }
    }
    
    if (newState.deck.length > 0) {
      playerHand.push(newState.deck.pop());
    }
  }
  
  newState.hands = { ...newState.hands, [player]: playerHand };
  return newState;
}

function discardCard(state, player, cardIndex) {
  const newState = { ...state };
  const hand = [...newState.hands[player]];
  
  if (cardIndex >= 0 && cardIndex < hand.length) {
    const discarded = hand.splice(cardIndex, 1)[0];
    newState.discardPile = [...newState.discardPile, discarded];
    newState.hands = { ...newState.hands, [player]: hand };
  }
  
  return newState;
}

function discardRandomCard(state, player) {
  const hand = state.hands[player];
  if (hand.length === 0) return state;
  
  const randomIndex = Math.floor(Math.random() * hand.length);
  return discardCard(state, player, randomIndex);
}

function playCard(state, player, cardIndex, target = null) {
  const newState = JSON.parse(JSON.stringify(state));
  const hand = [...newState.hands[player]];
  
  if (cardIndex < 0 || cardIndex >= hand.length) {
    return state;
  }
  
  const card = hand[cardIndex];
  hand.splice(cardIndex, 1);
  newState.hands = { ...newState.hands, [player]: hand };
  newState.discardPile = [...newState.discardPile, card];
  
  let updatedState = card.play(newState, target);
  
  updatedState = drawCards(updatedState, player, CARDS_CONFIG.drawPerTurn);
  
  return updatedState;
}

function canPlayCard(state, player, cardIndex) {
  const hand = state.hands[player];
  if (cardIndex < 0 || cardIndex >= hand.length) return false;
  
  const card = hand[cardIndex];
  
  if (card.isReaction) {
    return true;
  }
  
  return state.currentPlayer === player;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Card, createDeck, drawCards, discardCard, discardRandomCard, playCard, canPlayCard };
}