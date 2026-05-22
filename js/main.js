let gameState;
let selectedCardIndex = null;
let targetMode = false;

function initGame() {
  gameState = createInitialState();
  gameState.board = initBoard(3, 3);
  gameState.deck = createDeck();
  
  gameState = drawCards(gameState, 'P1', CARDS_CONFIG.handSize);
  gameState = drawCards(gameState, 'P2', CARDS_CONFIG.handSize);
  
  gameState.log = [...gameState.log, { 
    message: 'Game initialized. P1 goes first.', 
    playerType: 'SYSTEM',
    timestamp: Date.now() 
  }];
  
  Renderer.init();
  Audio.init();
  setupEventListeners();
  
  Renderer.render(gameState);
}

function handleCellClick(index) {
  if (gameState.phase !== 'PLAY') return;
  
  const { currentPlayer, board, voidSquares, forbiddenSquares } = gameState;
  
  if (voidSquares.includes(index)) return;
  if (board[index]) return;
  if (forbiddenSquares[currentPlayer]?.includes(index)) return;
  
  if (gameState._pendingTarget) {
    resolvePendingTarget(index);
    return;
  }
  
  placePiece(index);
}

function handleCardClick(player, cardIndex) {
  const card = gameState.hands[player][cardIndex];
  
  if (!card.isReaction && gameState.currentPlayer !== player) return;
  
  if (card.isReaction && gameState.phase === 'OPPONENT_TURN') {
    playCardEffect(player, cardIndex);
    return;
  }
  
  if (gameState.phase === 'PLAY' && selectedCardIndex === null) {
    selectedCardIndex = cardIndex;
    highlightCard(player, cardIndex);
    
    if (card.effect === 'void' || card.effect === 'steal' || card.effect === 'bomb' || 
        card.effect === 'fortify' || card.effect === 'lockout' || card.effect === 'overwrite' ||
        card.effect === 'teleport') {
      targetMode = true;
    } else {
      playCardEffect(player, cardIndex);
      selectedCardIndex = null;
    }
  } else if (selectedCardIndex === cardIndex) {
    playCardEffect(player, cardIndex);
    selectedCardIndex = null;
    targetMode = false;
    clearCardHighlight();
  }
}

function playCardEffect(player, cardIndex) {
  Audio.play('cardPlay');
  Renderer.flash();
  
  gameState = playCard(gameState, player, cardIndex);
  
  const cardName = gameState.discardPile[gameState.discardPile.length - 1]?.name || 'CARD';
  gameState.log = [...gameState.log, { 
    message: `${player} played ${cardName}`, 
    playerType: player,
    timestamp: Date.now() 
  }];
  
  if (!gameState._pendingTarget) {
    Renderer.render(gameState);
  } else {
    Renderer.render(gameState);
  }
}

function resolvePendingTarget(index) {
  if (selectedCardIndex !== null) {
    const player = gameState.currentPlayer;
    const card = gameState.hands[player][selectedCardIndex];
    
    gameState = playCard(gameState, player, selectedCardIndex, index);
    
    const cardName = gameState.discardPile[gameState.discardPile.length - 1]?.name || 'CARD';
    gameState.log = [...gameState.log, { 
      message: `${player} played ${cardName} targeting ${index}`, 
      playerType: player,
      timestamp: Date.now() 
    }];
    
    selectedCardIndex = null;
    targetMode = false;
    clearCardHighlight();
    
    if (!gameState._pendingTarget) {
      Renderer.render(gameState);
    }
  } else {
    const pendingCard = gameState._pendingTarget;
    const player = gameState.currentPlayer;
    
    const cardObj = new Card(pendingCard);
    gameState = cardObj.play(gameState, index);
    
    gameState = drawCards(gameState, player, CARDS_CONFIG.drawPerTurn);
    
    gameState._pendingTarget = null;
    Renderer.render(gameState);
  }
}

function placePiece(index) {
  const { currentPlayer } = gameState;
  
  gameState.board[index] = currentPlayer;
  
  const moveHistoryEntry = {
    board: gameState.board.slice(),
    boardSize: { ...gameState.boardSize },
    voidSquares: [...gameState.voidSquares],
    fortifiedSquares: [...gameState.fortifiedSquares],
    forbiddenSquares: { P1: [...(gameState.forbiddenSquares.P1 || [])], P2: [...(gameState.forbiddenSquares.P2 || [])] },
    winCondition: gameState.winCondition,
    misereTurnsLeft: gameState.misereTurnsLeft || 0
  };
  gameState.history.push(moveHistoryEntry);
  
  Audio.play('place');
  Renderer.flash();
  
  gameState.log = [...gameState.log, { 
    message: `${currentPlayer} placed piece at ${index}`, 
    playerType: currentPlayer,
    timestamp: Date.now() 
  }];
  
  const winResult = checkWin(gameState, currentPlayer);
  
  if (winResult) {
    handleWin(winResult);
    return;
  }
  
  if (checkDraw(gameState)) {
    handleDraw();
    return;
  }
  
  endTurn();
}

function endTurn() {
  const { currentPlayer, doubleTurn } = gameState;
  
  if (doubleTurn[currentPlayer]) {
    gameState.doubleTurn[currentPlayer] = false;
    gameState.log = [...gameState.log, { 
      message: `${currentPlayer} takes extra turn!`, 
      playerType: 'SYSTEM',
      timestamp: Date.now() 
    }];
    Renderer.render(gameState);
    return;
  }
  
  gameState.currentPlayer = currentPlayer === 'P1' ? 'P2' : 'P1';
  gameState.turn++;
  
  if (gameState.misereTurnsLeft > 0) {
    gameState.misereTurnsLeft--;
    if (gameState.misereTurnsLeft === 0) {
      gameState.winCondition = 'NORMAL';
      gameState.log = [...gameState.log, { 
        message: 'MISÈRE MODE ended. Normal rules resume.', 
        playerType: 'SYSTEM',
        timestamp: Date.now() 
      }];
    }
  }
  
  if (gameState.diagonalOnlyTurnsLeft > 0) {
    gameState.diagonalOnlyTurnsLeft--;
    if (gameState.diagonalOnlyTurnsLeft === 0) {
      gameState.winCondition = 'NORMAL';
      gameState.log = [...gameState.log, { 
        message: 'Diagonal-only mode ended.', 
        playerType: 'SYSTEM',
        timestamp: Date.now() 
      }];
    }
  }
  
  Renderer.render(gameState);
}

function handleWin(winResult) {
  const { winner } = winResult;
  
  gameState.scores[winner]++;
  
  Audio.play('win');
  Renderer.flash();
  Renderer.glitch();
  
  gameState.log = [...gameState.log, { 
    message: `${winner} WINS THE ROUND!`, 
    playerType: winner,
    timestamp: Date.now() 
  }];
  
  if (gameState.scores[winner] >= 3) {
    Renderer.renderWinModal(winner, gameState.scores);
  } else {
    setTimeout(() => startNewRound(), 2000);
  }
  
  Renderer.render(gameState);
}

function handleDraw() {
  gameState.log = [...gameState.log, { 
    message: 'DRAW!', 
    playerType: 'SYSTEM',
    timestamp: Date.now() 
  }];
  
  if (gameState.overtimeActive) {
    gameState.log = [...gameState.log, { 
      message: 'OVERTIME! Playing another round...', 
      playerType: 'SYSTEM',
      timestamp: Date.now() 
    }];
    gameState.overtimeActive = false;
    setTimeout(() => startNewRound(), 1500);
  } else {
    setTimeout(() => startNewRound(), 2000);
  }
  
  Renderer.render(gameState);
}

function startNewRound() {
  gameState.board = initBoard(gameState.boardSize.rows, gameState.boardSize.cols);
  gameState.history = [];
  gameState.voidSquares = [];
  gameState.fortifiedSquares = [];
  gameState.forbiddenSquares = { P1: [], P2: [] };
  gameState.winCondition = 'NORMAL';
  gameState.misereTurnsLeft = 0;
  gameState.diagonalOnlyTurnsLeft = 0;
  gameState.currentPlayer = 'P1';
  
  gameState = drawCards(gameState, 'P1', CARDS_CONFIG.handSize);
  gameState = drawCards(gameState, 'P2', CARDS_CONFIG.handSize);
  
  Renderer.render(gameState);
}

function highlightCard(player, index) {
  const handEl = player === 'P1' ? Renderer.elements.handP1 : Renderer.elements.handP2;
  if (handEl) {
    const cards = handEl.querySelectorAll('.card');
    cards.forEach((c, i) => {
      c.classList.toggle('selected', i === index);
    });
  }
}

function clearCardHighlight() {
  document.querySelectorAll('.card.selected').forEach(c => c.classList.remove('selected'));
}

function setupEventListeners() {
  document.getElementById('settings-btn')?.addEventListener('click', () => {
    Renderer.showSettings(gameState);
  });
  
  document.getElementById('close-settings')?.addEventListener('click', () => {
    Renderer.hideSettings();
  });
  
  document.getElementById('overlay')?.addEventListener('click', () => {
    Renderer.hideSettings();
    Renderer.closeWinModal();
  });
  
  document.getElementById('settings-color')?.addEventListener('change', (e) => {
    gameState.settings.color = e.target.value;
    Renderer.applySettings(gameState);
  });
  
  document.getElementById('settings-font')?.addEventListener('change', (e) => {
    gameState.settings.font = e.target.value;
    Renderer.applySettings(gameState);
  });
  
  document.getElementById('settings-sound')?.addEventListener('change', (e) => {
    gameState.settings.soundEnabled = e.target.checked;
    Audio.setEnabled(e.target.checked);
  });
  
  document.getElementById('new-game-btn')?.addEventListener('click', () => {
    Renderer.closeWinModal();
    initGame();
  });
  
  document.getElementById('play-again-btn')?.addEventListener('click', () => {
    Renderer.closeWinModal();
    startNewRound();
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (Renderer.elements.settingsPanel?.classList.contains('open')) {
        Renderer.hideSettings();
      }
      selectedCardIndex = null;
      targetMode = false;
      clearCardHighlight();
    }
  });
}

document.addEventListener('DOMContentLoaded', initGame);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initGame, handleCellClick, handleCardClick, placePiece };
}