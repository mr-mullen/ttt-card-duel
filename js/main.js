// TTT Card Duel — Main Entry Point
// Game initialization and global handlers

// Global game reference
const Game = window.Game || {};
const Board = window.Board || {};
const Cards = window.CardSystem || {};
const Renderer = window.Renderer || {};

// Initialize game
window.addEventListener('DOMContentLoaded', () => {
  Game.init();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Space or Enter to confirm card selection
  if (e.key === 'Enter' || e.key === ' ') {
    const modal = document.getElementById('card-modal');
    if (modal && modal.showModal) {
      e.preventDefault();
      const confirmBtn = document.getElementById('modal-confirm-btn');
      if (confirmBtn) {
        confirmBtn.click();
      }
    }
  }

  // Escape to close modals
  if (e.key === 'Escape') {
    const modal = document.getElementById('card-modal');
    if (modal) {
      modal.close();
    }
  }
});

// Handle board resize (for board effects)
document.addEventListener('mousedown', (e) => {
  // Double-click to resize board
  if (e.detail === 2) {
    const board = document.getElementById('game-board');
    const newRows = prompt('New row count:', '4');
    if (newRows) {
      Board.resize(parseInt(newRows), Board.size.cols);
    }
  }
});

// Sound effects (placeholder)
// Would use Howler.js or simple Audio objects here

// Update round counter
const roundCounter = document.getElementById('round-counter');
if (roundCounter) {
  setInterval(() => {
    roundCounter.textContent = `Round: ${Game.getRoundNumber()}`;
  }, 1000);
}

// Update turn indicator
const turnIndicator = document.getElementById('turn-indicator');
if (turnIndicator) {
  Game.updateTurnIndicator();
}

// Update score display
const p1Score = document.getElementById('p1-score');
const p2Score = document.getElementById('p2-score');
const p1Hp = document.getElementById('p1-hp');
const p2Hp = document.getElementById('p2-hp');

if (p1Score && p2Score) {
  setInterval(() => {
    p1Score.textContent = Game.state.roundWins.P1;
    p2Score.textContent = Game.state.roundWins.P2;
  }, 1000);
}

if (p1Hp && p2Hp) {
  const updateHp = () => {
    const p1Pct = Math.max(0, Game.state.roundWins.P1 / Game.MATCH_WIN_THRESHOLD);
    const p2Pct = Math.max(0, Game.state.roundWins.P2 / Game.MATCH_WIN_THRESHOLD);

    const p1Bars = '█'.repeat(Math.floor(p1Pct * 4)) + '░'.repeat(4 - Math.floor(p1Pct * 4));
    const p2Bars = '█'.repeat(Math.floor(p2Pct * 4)) + '░'.repeat(4 - Math.floor(p2Pct * 4));

    p1Hp.textContent = p1Bars;
    p2Hp.textContent = p2Bars;
  };

  updateHp();
}

// Match winner display
const matchWinner = document.getElementById('match-winner');
if (matchWinner) {
  Game.state.currentPlayerIsP1 ? Game.state.roundWins.P1++ : Game.state.roundWins.P2++;
  if (Game.state.roundWins.P1 >= 3 || Game.state.roundWins.P2 >= 3) {
    matchWinner.textContent = `P${Game.state.roundWins.P1 >= 3 ? '1' : '2'}`;
  }
}

// Global click handler (for cleanup)
document.addEventListener('click', (e) => {
  // Deselect cards when clicking outside
  if (!e.target.closest('.card')) {
    document.querySelectorAll('.card.selected').forEach(card => {
      card.classList.remove('selected');
    });
  }
});
