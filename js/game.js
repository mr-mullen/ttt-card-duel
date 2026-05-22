// TTT Card Duel — Main Game Logic
// Game state machine, turn management, win detection

const Game = {
  state: {
    currentPlayer: 'P1',
    currentPlayerIsP1: true,
    phase: 'SETUP', // SETUP, PLAYING, ENDING
    isPlayerTurn: true,
    board: null,
    hands: [[], []],
    matchLength: 5, // Best of 5
    roundWins: { P1: 0, P2: 0 },
    scores: { P1: 0, P2: 0 },
    matchNumber: 1,
    matchLengthReached: false,
    isDraw: false,
    skipTurn: false,
    doublePlayCount: 0,
    misereMode: false,
    diagonalOnly: false,
    forbiddenSquares: { P1: [], P2: [] }  // Track forbidden squares
  },

  // Game constants
  MATCH_WIN_THRESHOLD: 3,

  // Initialize game
  init() {
    this.state.board = new Array(9).fill(null); // 3x3 = 9 squares

    // Set up board
    Board.init();

    // Set up card system
    Cards.init();

    // Set up UI elements
    this.setupUI();

    // Log start
    this.log('=== TTT CARD DUEL ===');
    this.log('Welcome! First to 3 round wins takes the match.');
    this.log('Draw 5 cards to start each player');
    this.log('Each turn: Play a card OR place a piece on the board');

    // Draw initial cards for both players
    this.drawInitialCards();

    // Start first turn
    this.startTurn();
  },

  // Draw initial cards for all players (5 each)
  drawInitialCards() {
    this.drawCards(0, 5);
    this.drawCards(1, 5);
  },

  // Draw cards for player (alias)
  drawCards(playerIndex, count) {
    Cards.drawCards(playerIndex, count);
  },

  // Set up UI event handlers
  setupUI() {
    // End turn button
    document.getElementById('end-turn-btn').addEventListener('click', () => {
      this.endTurn();
    });

    // Restart round button
    const restartBtn = document.getElementById('restart-round-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.restartRound();
      });
    }

    // Next round button (victory overlay)
    const nextRoundBtn = document.getElementById('next-round-btn');
    if (nextRoundBtn) {
      nextRoundBtn.addEventListener('click', () => {
        this.restartRound();
      });
    }

    // Settings button
    document.getElementById('settings-btn').addEventListener('click', () => {
      Settings.toggleMenu(true);
    });

    // Set up card click handlers
    this.setupCardClickHandlers();
  },

  // Start a new turn
  startTurn() {
    const state = this.state;

    // Clear previous skip turn status
    state.skipTurn = false;
    state.doublePlayCount = 0;

    // Draw card for current player before their turn
    Cards.drawCardPerTurn(state.currentPlayerIsP1 ? 0 : 1);

    state.isPlayerTurn = state.currentPlayer === 'P1';
    this.log(`--- ${state.currentPlayer}'s Turn ---`);
    this.log(`Hand size: ${Cards.state.hands[state.currentPlayerIsP1 ? 0 : 1].length} cards`);

    // Clear board highlight
    document.querySelectorAll('.square').forEach(square => {
      square.classList.remove('turn-highlight', 'valid-move', 'selected-square');
    });

    // Clear previous highlights
    document.querySelectorAll('.card').forEach(card => {
      card.classList.remove('selected-square', 'card-hover');
    });

    this.updateTurnIndicator();

    // Update phase to PLAYING (player can play cards or board)
    state.phase = 'PLAYING';

    // Add/remove body class for click handling
    if (state.isPlayerTurn) {
      document.body.classList.add('is-player-turn');
    } else {
      document.body.classList.remove('is-player-turn');
    }
  },

  // End current turn
  endTurn() {
    const state = this.state;

    if (state.doublePlayCount > 0) {
      state.doublePlayCount--;
      this.log('Extra turn!');
      return;
    }

    // Switch players
    state.currentPlayerIsP1 ? state.currentPlayer = 'P2' : state.currentPlayer = 'P1';
    state.isPlayerTurn = state.currentPlayer === 'P1';
    state.phase = 'PLAYING';  // New player can play too

    this.log(`Switching to ${state.currentPlayer}...`);
    this.updateTurnIndicator();

    this.startTurn();
  },

  // Play a board piece instead of card
  playBoardPiece() {
    const state = this.state;

    // Clear any card selection highlight
    document.querySelectorAll('.card.selected-square').forEach(card => {
      card.classList.remove('selected-square');
    });

    // Check if there's a selected card and ask if user wants to play it or the board
    const selectedCard = document.querySelector('.card.selected-square');
    if (selectedCard) {
      // User clicked on a selected card - they want to play it instead
      const card = this.getCardFromElement(selectedCard);
      if (card) {
        // Play the card (remove from hand, apply effect, draw replacement)
        const hand = Cards.state.hands[0];
        const index = parseInt(selectedCard.dataset.index);
        const cardIndex = hand.findIndex(c => c.id === card.id);

        if (cardIndex !== -1) {
          hand.splice(cardIndex, 1);
          this.log(`Played ${card.name}!`);

          // Apply effect
          card.effect(Game);

          // Close modal if open
          const modal = document.getElementById('card-modal');
          if (modal) modal.close();

          // Render hands
          Cards.renderHands();

          // End turn after playing card
          this.endTurn();
        }
      }
    } else {
      // No card selected, play on board normally
      this.showMoveModal();
    }
  },

  // Get card data from card element
  getCardFromElement(cardEl) {
    const handIndex = cardEl.parentElement.id === 'p1-hand' ? 0 : 1;
    const hand = Cards.state.hands[handIndex];
    const index = parseInt(cardEl.dataset.index);
    return hand[index] || null;
  },

  // Update turn indicator
  updateTurnIndicator() {
    const indicator = document.getElementById('turn-indicator');
    indicator.textContent = `TURN: ${this.state.currentPlayer}`;
    indicator.className = `turn-indicator ${this.state.isPlayerTurn ? 'active' : ''}`;
  },

  // Check for win condition
  checkWin() {
    const board = this.state.board;

    // Winning lines
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]              // Diagonals
    ];

    const currentPlayer = this.state.currentPlayer;

    for (const line of lines) {
      if (line.every(cell => board[cell] === currentPlayer)) {
        // Win detected
        this.handleWin(currentPlayer);
        return true;
      }
    }

    // Check if board is full (draw)
    if (board.every(cell => cell !== null)) {
      this.log('Board is full! Draw!');
      this.endRound(true);
      return true;
    }

    return false;
  },

  // Handle win
  handleWin(winner) {
    const state = this.state;

    if (state.misereMode) {
      // In misere mode, winning = losing
      state.currentPlayerIsP1 ? state.roundWins.P2++ : state.roundWins.P1++;
      this.log('Misère mode! Winning means you lose!');
    } else {
      state.currentPlayerIsP1 ? state.roundWins.P1++ : state.roundWins.P2++;
      this.log(`${winner} wins this round!`);
    }

    // Check if match won
    if (state.roundWins.P1 >= this.MATCH_WIN_THRESHOLD || state.roundWins.P2 >= this.MATCH_WIN_THRESHOLD) {
      this.handleMatchEnd(winner);
    } else {
      this.endRound(false);
    }
  },

  // Handle round end
  endRound(showVictory = false) {
    const state = this.state;

    // Increment round counter
    state.roundWins.P1 = 0;
    state.roundWins.P2 = 0;

    this.log(`Round ${state.roundWins.P1} - ${state.roundWins.P2}`);

    // Show victory or continue
    if (showVictory) {
      this.showRoundVictory();
    } else {
      // Clear victory highlights
      document.querySelectorAll('.square.winning').forEach(square => {
        square.classList.remove('winning');
      });
    }

    this.endTurn();
  },

  // Show round victory
  showRoundVictory() {
    const state = this.state;
    const winner = state.roundWins.P1 >= 3 ? 'P1' : 'P2';

    const overlay = document.createElement('div');
    overlay.className = 'victory-overlay';
    overlay.innerHTML = `
      <div class="victory-message">
        <h2>PLAYER ${winner} WINS THE ROUND!</h2>
        <p>Score: ${state.roundWins.P1} - ${state.roundWins.P2}</p>
        <p>Total: P1 ${state.scores.P1} - P2 ${state.scores.P2}</p>
        <button id="continue-btn">Continue</button>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', () => {
      overlay.remove();
      this.endRound();
    });
  },

  // Restart current round
  restartRound() {
    // Clear board
    Board.clearBoard();

    // Reset round score
    this.state.roundWins.P1 = 0;
    this.state.roundWins.P2 = 0;

    // Reset board
    this.state.board = new Array(9).fill(null);
    Board.renderBoard();

    // Clear victory overlay
    const overlays = document.querySelectorAll('.victory-overlay');
    overlays.forEach(overlay => overlay.remove());

    this.log('New round started!');
    this.startTurn();
  },

  // Handle match end
  handleMatchEnd(winner) {
    document.body.style.cursor = 'wait';

    const modal = document.createElement('dialog');
    modal.className = 'victory-modal';
    modal.innerHTML = `
      <div class="modal-content victory-content">
        <h2>${winner === 'P1' ? 'PLAYER 1' : 'PLAYER 2'} WINS THE MATCH!</h2>
        <p>Final Score: ${this.state.roundWins.P1} - ${this.state.roundWins.P2}</p>
        <p>Total Score: P1 ${this.state.scores.P1} - P2 ${this.state.scores.P2}</p>
        <div class="modal-actions">
          <button id="play-again-btn">Play Again</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target.id === 'play-again-btn') {
        this.resetGame();
      }
    });
  },

  // Reset entire game
  resetGame() {
    document.body.style.cursor = 'default';

    // Reset state
    this.state.roundWins.P1 = 0;
    this.state.roundWins.P2 = 0;
    this.state.currentPlayer = 'P1';
    this.state.currentPlayerIsP1 = true;
    this.state.matchNumber = 1;
    this.state.isDraw = false;

    // Reset board
    this.state.board = new Array(9).fill(null);

    // Reset hands
    Cards.renderHands();

    // Reset UI
    document.getElementById('match-winner').textContent = 'None yet';
    document.getElementById('round-counter').textContent = `Round: 0`;

    // Remove victory modal
    const victoryModal = document.querySelector('.victory-modal');
    if (victoryModal) {
      victoryModal.remove();
    }

    this.log('=== MATCH RESET ===');
    this.log('Starting new match!');

    this.restartRound();
  },

  // Set up card click handlers
  setupCardClickHandlers() {
    const cards = document.querySelectorAll('.hand-container .card');

    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        const cardEl = e.target.closest('.card');
        if (!cardEl) return;

        const index = parseInt(cardEl.dataset.index);
        const playerIndex = cardEl.parentElement.id === 'p1-hand' ? 0 : 1;

        // Only allow clicking on non-played cards
        if (cardEl.classList.contains('played')) {
          return;
        }

        // Check if it's the current player's turn
        if (!Game.state.isPlayerTurn) {
          Game.log('Not your turn!');
          return;
        }

        // Get the card data
        const hand = Cards.state.hands[playerIndex];
        const cardData = hand[index];

        if (cardData) {
          // Show card modal
          Cards.showCardModal(cardData);

          // Add selection highlight
          cardEl.classList.add('selected-square');
        }
      });
    });
  },

  // Log message to event log
  log(message) {
    const log = document.getElementById('event-log');
    if (!log) return;

    const li = document.createElement('li');
    li.textContent = message;

    // Add styling based on message type
    if (message.includes('win') || message.includes('Win')) {
      li.className = 'event-win';
    } else if (message.includes('loss') || message.includes('Lose')) {
      li.className = 'event-loss';
    } else if (message.includes('card') || message.includes('Card')) {
      li.className = 'event-card-play';
    } else {
      li.className = 'event-system';
    }

    log.appendChild(li);
    log.scrollTop = log.scrollHeight;
  },

  // Get current turn number
  getTurnNumber() {
    return this.state.roundWins.P1 + this.state.roundWins.P2 + 1;
  },

  // Get round
  getRoundNumber() {
    return this.state.roundWins.P1 + this.state.roundWins.P2 + 1;
  },

  // Check if current player is P1
  getCurrentPlayerIsP1() {
    return this.state.currentPlayer === 'P1';
  },

  // Get state
  getState() {
    return this.state;
  }
};

// Initialize game when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Game.init());
} else {
  Game.init();
}
