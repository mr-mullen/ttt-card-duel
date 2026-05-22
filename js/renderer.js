const Renderer = {
  elements: {},
  
  init() {
    this.elements = {
      board: document.getElementById('board'),
      log: document.getElementById('log-entries'),
      turnIndicator: document.getElementById('turn-indicator'),
      phaseIndicator: document.getElementById('phase-indicator'),
      scoreP1: document.getElementById('score-p1'),
      scoreP2: document.getElementById('score-p2'),
      handP1: document.getElementById('hand-p1'),
      handP2: document.getElementById('hand-p2'),
      settingsPanel: document.getElementById('settings-panel'),
      overlay: document.getElementById('overlay'),
      winModal: document.getElementById('win-modal'),
      winText: document.getElementById('win-text'),
      settingsColor: document.getElementById('settings-color'),
      settingsFont: document.getElementById('settings-font'),
      settingsSound: document.getElementById('settings-sound')
    };
  },
  
  renderBoard(state) {
    const { board, boardSize, voidSquares, fortifiedSquares, forbiddenSquares, currentPlayer } = state;
    const { rows, cols } = boardSize;
    const boardEl = this.elements.board;
    
    if (!boardEl) return;
    
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = `repeat(${cols}, 120px)`;
    
    for (let i = 0; i < board.length; i++) {
      const cell = document.createElement('div');
      cell.className = 'board-cell';
      cell.dataset.index = i;
      
      if (voidSquares.includes(i)) {
        cell.classList.add('void');
      } else if (board[i]) {
        const piece = document.createElement('pre');
        piece.className = `piece ${board[i].toLowerCase()}`;
        piece.textContent = ASCII.pieces[board[i] === 'P1' ? 'X' : 'O'].join('\n');
        cell.appendChild(piece);
      }
      
      if (fortifiedSquares.includes(i)) {
        cell.classList.add('fortified');
      }
      
      if (!voidSquares.includes(i) && !board[i] && !forbiddenSquares[currentPlayer]?.includes(i)) {
        cell.addEventListener('click', () => handleCellClick(i));
      } else if (forbiddenSquares[currentPlayer]?.includes(i)) {
        cell.classList.add('forbidden');
      }
      
      boardEl.appendChild(cell);
    }
  },
  
  renderHands(state) {
    const { hands, currentPlayer, blindPlayers } = state;
    
    const renderHand = (player, handEl) => {
      if (!handEl) return;
      handEl.innerHTML = '';
      
      const displayHand = blindPlayers[player] ? 
        hands[player].map(c => ({ ...c, description: '???' })) : 
        hands[player];
      
      displayHand.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        if (card.rarity === 'LEGENDARY') cardEl.classList.add('legendary');
        if (card.isReaction) cardEl.classList.add('reaction-card');
        
        const sigil = ASCII.cards[card.id]?.sigil || '?';
        
        cardEl.innerHTML = `
          <span class="card-sigil">${sigil}</span>
          <span class="card-name">${card.name}</span>
        `;
        
        cardEl.addEventListener('click', (e) => {
          e.stopPropagation();
          if (state.phase === 'PLAY' || (card.isReaction && state.phase === 'OPPONENT_TURN')) {
            handleCardClick(player, index);
          }
        });
        
        handEl.appendChild(cardEl);
      });
    };
    
    renderHand('P1', this.elements.handP1);
    renderHand('P2', this.elements.handP2);
  },
  
  renderLog(state) {
    const logEl = this.elements.log;
    if (!logEl) return;
    
    logEl.innerHTML = '';
    
    const recentLogs = state.log.slice(-15);
    recentLogs.forEach(entry => {
      const logEntry = document.createElement('div');
      logEntry.className = `log-entry ${entry.playerType === 'P1' ? 'p1-event' : entry.playerType === 'P2' ? 'p2-event' : ''}`;
      logEntry.textContent = entry.message;
      logEl.appendChild(logEntry);
    });
    
    logEl.scrollTop = logEl.scrollHeight;
  },
  
  renderTurn(state) {
    const turnEl = this.elements.turnIndicator;
    if (turnEl) {
      turnEl.textContent = `TURN: ${state.currentPlayer}`;
      turnEl.className = `turn-indicator ${state.currentPlayer.toLowerCase()}`;
    }
    
    const phaseEl = this.elements.phaseIndicator;
    if (phaseEl) {
      let phaseText = state.phase;
      if (state._pendingTarget) {
        phaseText = `SELECT TARGET FOR ${state._pendingTarget}`;
      }
      phaseEl.textContent = phaseText;
    }
  },
  
  renderScores(state) {
    if (this.elements.scoreP1) {
      this.elements.scoreP1.textContent = `Wins: ${state.scores.P1}`;
    }
    if (this.elements.scoreP2) {
      this.elements.scoreP2.textContent = `Wins: ${state.scores.P2}`;
    }
  },
  
  renderWinModal(winner, scores) {
    const modal = this.elements.winModal;
    const text = this.elements.winText;
    
    if (modal && text) {
      text.textContent = `${winner} WINS THE MATCH!`;
      text.className = winner.toLowerCase();
      modal.classList.add('open');
    }
    this.elements.overlay?.classList.add('open');
  },
  
  closeWinModal() {
    this.elements.winModal?.classList.remove('open');
    this.elements.overlay?.classList.remove('open');
  },
  
  showSettings(state) {
    this.elements.settingsPanel?.classList.add('open');
    this.elements.overlay?.classList.add('open');
    
    if (this.elements.settingsColor) {
      this.elements.settingsColor.value = state.settings.color;
    }
    if (this.elements.settingsFont) {
      this.elements.settingsFont.value = state.settings.font;
    }
    if (this.elements.settingsSound) {
      this.elements.settingsSound.checked = state.settings.soundEnabled;
    }
  },
  
  hideSettings() {
    this.elements.settingsPanel?.classList.remove('open');
    this.elements.overlay?.classList.remove('open');
  },
  
  applySettings(state) {
    document.documentElement.style.setProperty('--text-color', state.settings.color);
    document.body.style.fontFamily = `'${state.settings.font}', monospace`;
    
    const crtElements = document.querySelectorAll('.crt');
    crtElements.forEach(el => {
      el.style.setProperty('--scanline-opacity', state.settings.scanlines ? '0.08' : '0');
    });
  },
  
  flash() {
    document.body.classList.add('flash');
    setTimeout(() => document.body.classList.remove('flash'), 150);
  },
  
  glitch() {
    const boardEl = this.elements.board;
    if (boardEl) {
      boardEl.classList.add('glitch');
      setTimeout(() => boardEl.classList.remove('glitch'), 200);
    }
  },
  
  render(state) {
    this.renderBoard(state);
    this.renderHands(state);
    this.renderLog(state);
    this.renderTurn(state);
    this.renderScores(state);
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Renderer;
}