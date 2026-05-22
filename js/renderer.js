// TTT Card Duel — Renderer
// Renders game state to DOM

const Renderer = {
  // Render card hands
  renderHands() {
    const hands = [
      document.getElementById('p1-hand'),
      document.getElementById('p2-hand')
    ];

    hands.forEach((handEl, playerIndex) => {
      handEl.innerHTML = '';

      const hand = Cards.state.hands[playerIndex];

      if (!hand) {
        return;
      }

      hand.forEach((card, index) => {
        if (card) {
          const cardEl = this.createCardElement(card, playerIndex, index);
          handEl.appendChild(cardEl);
        } else {
          // Empty slot
          const emptySlot = document.createElement('div');
          emptySlot.className = 'empty-slot';
          emptySlot.textContent = 'Draw';
          emptySlot.dataset.position = index;
          handEl.appendChild(emptySlot);
        }
      });

      // Clear any existing empty slots beyond hand length
      const existingEmptySlots = Array.from(handEl.children)
        .filter(el => el.classList.contains('empty-slot'))
        .slice(hand.length);

      existingEmptySlots.forEach(slot => slot.remove());
    });
  },

  // Create card DOM element
  createCardElement(card, playerIndex, position) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.dataset.position = position;
    cardEl.dataset.player = playerIndex;

    // Add rarity class
    if (card.rarity === 'legendary') {
      cardEl.classList.add('legendary');
    }

    // Add reaction indicator for opponent/win cards
    if (card.category === 'OPPONENT' || card.category === 'WIN') {
      cardEl.classList.add('reaction');
    }

    // Card HTML
    cardEl.innerHTML = `
      <div class="card-category">${card.category}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-sigil">${this.generateSigil(card)}</div>
      <div class="card-desc">${card.desc}</div>
      <div class="card-rarity rarity-${card.rarity}">${card.rarity.toUpperCase()}</div>
    `;

    // Select card on click
    cardEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleCardSelection(card, playerIndex, position);
    });

    return cardEl;
  },

  // Generate ASCII sigil for card
  generateSigil(card) {
    const initials = card.name.split(' ').map(n => n[0]).join('').slice(0, 3).toUpperCase();
    const frame = [
      '┌────────┐',
      `│ ${initials.padEnd(8)} │`,
      '├────────┤',
      `│        │`,
      '└────────┘'
    ];
    return frame.join('\n');
  },

  // Toggle card selection
  toggleCardSelection(card, playerIndex, position) {
    const currentCard = Cards.state.hands[playerIndex][position];

    if (currentCard) {
      const handEl = document.getElementById(`p${playerIndex + 1}-hand`);
      const cardEl = handEl.querySelector(`[data-position="${position}"]`);

      if (cardEl) {
        if (cardEl.classList.contains('selected')) {
          cardEl.classList.remove('selected');
        } else {
          cardEl.classList.add('selected');
          this.showCardModal(card, playerIndex, position);
        }
      }
    }
  },

  // Show card modal
  showCardModal(card, playerIndex, position) {
    const modal = document.getElementById('card-modal');
    document.getElementById('modal-card-name').textContent = card.name;
    document.getElementById('modal-card-desc').textContent = card.desc;
    document.getElementById('modal-card-art').textContent = this.generateSigil(card);

    const effectText = document.getElementById('modal-card-effect');
    if (effectText) {
      effectText.textContent = `Effect: ${card.desc}`;
    }

    modal.showModal();

    // Set up confirm button
    const confirmBtn = document.getElementById('modal-confirm-btn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        Cards.playCard(playerIndex, position);
        modal.close();
      });
    }

    // Set up cancel button
    const cancelBtn = document.getElementById('modal-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        modal.close();
      });
    }
  },

  // Render board (called by Board.js, but here for completeness)
  renderBoard() {
    Board.renderBoard();
  },

  // Render victory overlay
  renderVictoryOverlay(winner) {
    const overlay = document.createElement('div');
    overlay.className = 'victory-overlay';
    overlay.innerHTML = `
      <div class="victory-message">
        <h2>PLAYER ${winner} WINS!</h2>
        <p>Score: P1 ${Game.state.roundWins.P1} - P2 ${Game.state.roundWins.P2}</p>
        <p>Total: P1 ${Game.state.scores.P1} - P2 ${Game.state.scores.P2}</p>
        <button id="continue-victory-btn">Continue</button>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', () => {
      overlay.remove();
      Game.endRound();
    });
  },

  // Render settings panel
  renderSettingsPanel() {
    const panel = document.querySelector('.settings-panel');
    panel.innerHTML = `
      <button id="settings-btn" class="settings-btn">⚙️ Settings</button>
      <div id="settings-menu" class="settings-menu hidden">
        <div class="setting-group">
          <label for="color-picker">Text Color:</label>
          <input type="color" id="color-picker" value="#00FF41">
        </div>
        <div class="setting-group">
          <label for="font-select">Font:</label>
          <select id="font-select">
            <option value="monospace">Courier New</option>
            <option value="Share Tech Mono" selected>Share Tech Mono</option>
            <option value="VT323">VT323</option>
            <option value="Fira Code">Fira Code</option>
            <option value="IBM Plex Mono">IBM Plex Mono</option>
            <option value="Inconsolata">Inconsolata</option>
          </select>
        </div>
        <div class="setting-group">
          <label>
            <input type="checkbox" id="scanlines-checkbox" checked>
            Scanlines
          </label>
        </div>
        <div class="setting-group">
          <label>
            <input type="checkbox" id="sound-checkbox" checked>
            Sound Effects
          </label>
        </div>
        <div class="setting-group">
          <label>
            <input type="checkbox" id="flicker-checkbox">
            Screen Flicker
          </label>
        </div>
        <button id="settings-close-btn" class="secondary-btn">Close</button>
      </div>
    `;

    Settings.init();
  }
};

// Initialize renderer
Renderer.renderHands();
Renderer.renderSettingsPanel();
