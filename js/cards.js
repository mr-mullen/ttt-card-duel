// TTT Card Duel — Card System
// Deck management, drawing, card effects

const Cards = {
  // All 38 cards
  allCards: [
    // BOARD (8 cards)
    {
      id: 'expansion',
      name: 'EXPANSION',
      category: 'BOARD',
      rarity: 'uncommon',
      desc: 'Add a new row to the bottom of the board (3x3 → 4x3)',
      effect: (game) => {
        Board.resize(4, 3);
        Game.log('Board expanded to 4 rows!');
      }
    },
    {
      id: 'collapse',
      name: 'COLLAPSE',
      category: 'BOARD',
      rarity: 'uncommon',
      desc: 'Remove the bottom row from the board (4x3 → 3x3)',
      effect: (game) => {
        Board.resize(3, 3);
        Game.log('Board collapsed back to 3x3!');
      }
    },
    {
      id: 'mirror-world',
      name: 'MIRROR WORLD',
      category: 'BOARD',
      rarity: 'rare',
      desc: 'Flip the entire board horizontally',
      effect: (game) => {
        Board.flipHorizontal();
        Game.log('Board flipped horizontally!');
      }
    },
    {
      id: 'earthquake',
      name: 'EARTHQUAKE',
      category: 'BOARD',
      rarity: 'rare',
      desc: 'Rotate the board 90° clockwise',
      effect: (game) => {
        Board.rotate();
        Game.log('Board rotated 90°!');
      }
    },
    {
      id: 'the-void',
      name: 'THE VOID',
      category: 'BOARD',
      rarity: 'rare',
      desc: 'Remove one cell from the board (permanent)',
      effect: (game) => {
        // Remove last cell if board is 4x4 or 4x3
        if (Board.size.rows === 4) {
          Board.resize(3, 3);
          Game.log('Void opened! Board reduced to 3x3.');
        } else {
          // Remove a specific square
          Game.log('The Void effect not available on current board size.');
        }
      }
    },
    {
      id: 'landslide',
      name: 'LANDSLIDE',
      category: 'BOARD',
      rarity: 'rare',
      desc: 'All pieces fall down (gravity effect)',
      effect: (game) => {
        // Shift all pieces down
        const newBoard = new Array(Board.size.rows * Board.size.cols).fill(null);
        const rows = 4; // Assuming max 4 rows
        const cols = 3;

        for (let r = 1; r < Board.size.rows; r++) {
          for (let c = 0; c < Board.size.cols; c++) {
            const fromIndex = (r - 1) * cols + c;
            const toIndex = r * cols + c;
            if (game.board[fromIndex] !== null) {
              game.board[toIndex] = game.board[fromIndex];
            }
          }
        }

        game.board = newBoard;
        Board.renderBoard();
        Game.log('Landslide! Pieces have fallen.');
      }
    },
    {
      id: 'wild-grid',
      name: 'WILD GRID',
      category: 'BOARD',
      rarity: 'rare',
      desc: 'Randomly shuffle piece positions',
      effect: (game) => {
        const pieces = game.board.filter(cell => cell !== null);
        const shuffled = [...pieces].sort(() => Math.random() - 0.5);
        let index = 0;

        for (const piece of shuffled) {
          if (piece !== null) {
            game.board[index] = piece;
            index++;
          } else {
            index++;
          }
        }

        Board.renderBoard();
        Game.log('Wild Grid! Pieces shuffled.');
      }
    },
    {
      id: 'side-column',
      name: 'SIDE COLUMN',
      category: 'BOARD',
      rarity: 'uncommon',
      desc: 'Add a new column to the right (3x3 → 3x4)',
      effect: (game) => {
        Board.resize(3, 4);
        Game.log('Board expanded to 4 columns!');
      }
    },

    // PIECE (9 cards)
    {
      id: 'steal',
      name: 'STEAL',
      category: 'PIECE',
      rarity: 'uncommon',
      desc: 'Convert an opponent\'s piece to your color',
      effect: (game) => {
        const opponent = game.currentPlayer === 'P1' ? 'P2' : 'P1';
        const opponentPieces = game.board.filter(cell => cell === opponent);

        if (opponentPieces.length > 0) {
          const randomPieceIndex = opponentPieces[0];
          game.board[randomPieceIndex] = game.currentPlayer;
          Board.renderBoard();
          Game.log('You stole a piece!');
        } else {
          Game.log('No opponent pieces to steal.');
        }
      }
    },
    {
      id: 'bomb',
      name: 'BOMB',
      category: 'PIECE',
      rarity: 'common',
      desc: 'Destroy any piece on the board',
      effect: (game) => {
        const targetPiece = game.board[Math.floor(Math.random() * game.board.length)];
        if (targetPiece) {
          game.board.fill(null).slice(0, game.board.length).fill(
            game.board[targetPiece]
          );
          Game.log('Boom! A piece was destroyed.');
        }
      }
    },
    {
      id: 'fortify',
      name: 'FORTIFY',
      category: 'PIECE',
      rarity: 'uncommon',
      desc: 'Place a shield on your own piece',
      effect: (game) => {
        const myPieces = game.board.filter(cell => cell === game.currentPlayer);

        if (myPieces.length > 0) {
          const pieceIndex = myPieces[0];
          game.board[pieceIndex] = game.currentPlayer + '-SHIELD';
          Board.renderBoard();
          Game.log('Piece fortified!');
        } else {
          Game.log('No pieces of yours to fortify.');
        }
      }
    },
    {
      id: 'double-play',
      name: 'DOUBLE PLAY',
      category: 'PIECE',
      rarity: 'rare',
      desc: 'Take an extra turn',
      effect: (game) => {
        game.state.doublePlayCount++;
        Game.log('Double play! You get another turn.');
      }
    },
    {
      id: 'teleport',
      name: 'TELEPORT',
      category: 'PIECE',
      rarity: 'rare',
      desc: 'Move one of your own pieces to any empty square',
      effect: (game) => {
        const myPieces = game.board.filter(cell => cell === game.currentPlayer);
        const emptySquares = game.board.filter(cell => cell === null);

        if (myPieces.length > 0 && emptySquares.length > 0) {
          const pieceToMove = myPieces[0];
          const pieceIndex = game.board.indexOf(pieceToMove);
          const emptyIndex = emptySquares[Math.floor(Math.random() * emptySquares.length)];

          game.board[emptyIndex] = game.currentPlayer;
          game.board[pieceIndex] = null;
          Board.renderBoard();
          Game.log('Teleport! Piece moved.');
        }
      }
    },
    {
      id: 'overwrite',
      name: 'OVERWRITE',
      category: 'PIECE',
      rarity: 'rare',
      desc: 'Place your piece on top of an opponent\'s piece',
      effect: (game) => {
        const opponentPieces = game.board.filter(cell => cell !== game.currentPlayer && cell !== null);

        if (opponentPieces.length > 0) {
          const opponentIndex = opponentPieces[0];
          game.board[opponentIndex] = game.currentPlayer;
          Board.renderBoard();
          Game.log('Overwrite! Piece replaced opponent\'s piece.');
        } else {
          Game.log('No opponent pieces to overwrite.');
        }
      }
    },
    {
      id: 'clone',
      name: 'CLONE',
      category: 'PIECE',
      rarity: 'rare',
      desc: 'Copy your piece to an adjacent empty square',
      effect: (game) => {
        const myPieces = game.board.filter(cell => cell === game.currentPlayer);
        const adjacentSquares = this.getAdjacentSquares();

        if (myPieces.length > 0) {
          const pieceIndex = myPieces[0];
          const adjacent = adjacentSquares[pieceIndex];

          if (adjacent && game.board[adjacent] === null) {
            game.board[adjacent] = game.currentPlayer;
            Board.renderBoard();
            Game.log('Clone! Piece duplicated.');
          } else {
            Game.log('No adjacent empty square.');
          }
        }
      }
    },
    {
      id: 'swap',
      name: 'SWAP',
      category: 'PIECE',
      rarity: 'common',
      desc: 'Exchange positions of two pieces (any two)',
      effect: (game) => {
        const piece1Index = Math.floor(Math.random() * game.board.length);
        const piece2Index = Math.floor(Math.random() * game.board.length);

        while (piece1Index === piece2Index) {
          piece2Index = Math.floor(Math.random() * game.board.length);
        }

        const temp = game.board[piece1Index];
        game.board[piece1Index] = game.board[piece2Index];
        game.board[piece2Index] = temp;

        Board.renderBoard();
        Game.log('Swap! Pieces exchanged.');
      }
    },

    // OPPONENT (8 cards)
    {
      id: 'skip',
      name: 'SKIP',
      category: 'OPPONENT',
      rarity: 'common',
      desc: 'Force opponent to lose their next turn',
      effect: (game) => {
        game.state.skipTurn = true;
        Game.log('Opponent skipped!');
      }
    },
    {
      id: 'discard',
      name: 'DISCARD',
      category: 'OPPONENT',
      rarity: 'uncommon',
      desc: 'Opponent discards a random card',
      effect: (game) => {
        const opponentHand = game.hands[!game.state.currentPlayerIsP1 ? 0 : 1];
        if (opponentHand && opponentHand.length > 0) {
          const randomCard = opponentHand.pop();
          Game.log(`Opponent discarded ${randomCard.name}!`);
        } else {
          Game.log('Opponent has no cards to discard.');
        }
      }
    },
    {
      id: 'blind',
      name: 'BLIND',
      category: 'OPPONENT',
      rarity: 'rare',
      desc: 'Opponent must play without seeing the board',
      effect: (game) => {
        Game.log('Blind effect! Opponent plays blindly.');
        // In a real game, you might hide the board temporarily
      }
    },
    {
      id: 'lockout',
      name: 'LOCKOUT',
      category: 'OPPONENT',
      rarity: 'rare',
      desc: 'Mark a square forbidden for the opponent',
      effect: (game) => {
        const forbiddenSquare = Math.floor(Math.random() * game.board.length);
        Board.addForbiddenSquare(game.currentPlayer, forbiddenSquare);
        Game.log(`Square ${forbiddenSquare} locked out!`);
      }
    },
    {
      id: 'hand-swap',
      name: 'HAND SWAP',
      category: 'OPPONENT',
      rarity: 'rare',
      desc: 'Swap hands with opponent',
      effect: (game) => {
        const tempHand = game.hands[game.state.currentPlayerIsP1 ? 0 : 1];
        game.hands[game.state.currentPlayerIsP1 ? 0 : 1] = game.hands[!game.state.currentPlayerIsP1 ? 0 : 1];
        game.hands[!game.state.currentPlayerIsP1 ? 0 : 1] = tempHand;

        Board.renderHands();
        Game.log('Hands swapped!');
      }
    },
    {
      id: 'copycat',
      name: 'COPYCAT',
      category: 'OPPONENT',
      rarity: 'rare',
      desc: 'Copy opponent\'s last played card',
      effect: (game) => {
        const opponentHand = game.hands[!game.state.currentPlayerIsP1 ? 0 : 1];
        if (opponentHand && opponentHand.length > 0) {
          const lastCard = opponentHand[opponentHand.length - 1];
          // Add a copy to current hand
          const copiedCard = { ...lastCard };
          game.hands[game.state.currentPlayerIsP1 ? 0 : 1].push(copiedCard);
          Game.log(`Copied ${lastCard.name}!`);
        }
      }
    },

    // WIN CONDITION (6 cards)
    {
      id: 'mire-mode',
      name: 'MISÈRE MODE',
      category: 'WIN',
      rarity: 'rare',
      desc: '3-in-a-row LOSES (2 turns to switch)',
      effect: (game) => {
        Game.log('Misère mode active! Winning = losing.');
        game.state.misereMode = true;
        setTimeout(() => {
          game.state.misereMode = false;
          Game.log('Misère mode deactivated.');
        }, 6000); // 2 turns ≈ 6 seconds
      }
    },
    {
      id: 'sudden-death',
      name: 'SUDDEN DEATH',
      category: 'WIN',
      rarity: 'legendary',
      desc: 'Place to win/lose immediately',
      effect: (game) => {
        // Find an empty square
        const emptyIndex = game.board.findIndex(cell => cell === null);
        if (emptyIndex !== -1) {
          game.board[emptyIndex] = game.currentPlayer;
          Game.checkWin(); // Will trigger instant win/loss
          Game.log('Sudden Death! Instant win/loss check.');
        }
      }
    },
    {
      id: 'overtime',
      name: 'OVERTIME',
      category: 'WIN',
      rarity: 'uncommon',
      desc: 'Extra round on draw',
      effect: (game) => {
        Game.log('Overtime! Playing another round.');
        Game.endRound(true);
      }
    },
    {
      id: 'diagonal-only',
      name: 'DIAGONAL ONLY',
      category: 'WIN',
      rarity: 'rare',
      desc: 'Only diagonal lines count (3 turns)',
      effect: (game) => {
        Game.log('Diagonal only mode active!');
        // Store current mode
        game.state.diagonalOnly = true;
        // Reset after 3 turns
        setTimeout(() => {
          game.state.diagonalOnly = false;
          Game.log('Diagonal mode deactivated.');
        }, 6000);
      }
    },
    {
      id: 'corners-rule',
      name: 'CORNERS RULE',
      category: 'WIN',
      rarity: 'rare',
      desc: 'Control all 4 corners to win',
      effect: (game) => {
        Game.log('Corners rule active! Need all 4 corners.');
        // Check corner control
        const corners = [0, 2, 6, 8];
        const myCorners = corners.filter(i => game.board[i] === game.currentPlayer);

        if (myCorners.length === 4) {
          // Auto-win
          Game.log('Victory! All corners controlled!');
          game.state.currentPlayerIsP1 ? game.state.roundWins.P1++ : game.state.roundWins.P2++;
          Game.endRound(true);
        }
      }
    },
    {
      id: 'edges-rule',
      name: 'EDGES RULE',
      category: 'WIN',
      rarity: 'uncommon',
      desc: 'Edge-only lines = double score',
      effect: (game) => {
        Game.log('Edges rule! Edge lines score double.');
      }
    },

    // DRAW/HAND (6 cards)
    {
      id: 'draw-two',
      name: 'DRAW TWO',
      category: 'DRAW',
      rarity: 'uncommon',
      desc: 'Draw 2 extra cards',
      effect: (game) => {
        game.drawCount += 2;
        Game.log('Drew 2 extra cards!');
      }
    },
    {
      id: 'reload',
      name: 'RELOAD',
      category: 'DRAW',
      rarity: 'rare',
      desc: 'Shuffle discard pile back to deck',
      effect: (game) => {
        Game.log('Discard pile reloaded!');
        // In a full implementation, would shuffle discard back
      }
    },
    {
      id: 'gift',
      name: 'GIFT',
      category: 'DRAW',
      rarity: 'uncommon',
      desc: 'Give a card to your opponent',
      effect: (game) => {
        const hand = game.hands[game.state.currentPlayerIsP1 ? 0 : 1];
        if (hand && hand.length > 0) {
          const cardToGift = hand[0];
          game.hands[!game.state.currentPlayerIsP1 ? 0 : 1].push(cardToGift);
          Game.log('Gifted a card!');
        }
      }
    },
    {
      id: 'peek',
      name: 'PEEK',
      category: 'DRAW',
      rarity: 'uncommon',
      desc: 'Look at top 3 deck cards',
      effect: (game) => {
        Game.log('Peeked at top 3 cards!');
        // In a full implementation, would show peeked cards
      }
    },
    {
      id: 'black-market',
      name: 'BLACK MARKET',
      category: 'DRAW',
      rarity: 'rare',
      desc: 'Both draw 1, play immediately',
      effect: (game) => {
        game.drawCount += 1;
        Game.log('Black Market! Both draw and play.');
      }
    },

    // LEGENDARY (5 cards)
    {
      id: 'nuke',
      name: 'NUKE',
      category: 'LEGENDARY',
      rarity: 'legendary',
      desc: 'Wipe the board clean (game-changing)',
      effect: (game) => {
        game.board.fill(null);
        Board.renderBoard();
        Game.log('NUKE! Board cleared!');
      }
    },
    {
      id: 'time-warp',
      name: 'TIME WARP',
      category: 'LEGENDARY',
      rarity: 'legendary',
      desc: 'Undo last 2 moves',
      effect: (game) => {
        Game.log('Time Warp! Moves undone.');
        // In a full implementation, would undo moves
      }
    },
    {
      id: 'architect',
      name: 'ARCHITECT',
      category: 'LEGENDARY',
      rarity: 'legendary',
      desc: 'Redesign board shape (random 3x3, 3x4, or 4x3)',
      effect: (game) => {
        const newRows = [3, 4, 3][Math.floor(Math.random() * 3)];
        const newCols = [3, 4, 3][Math.floor(Math.random() * 3)];
        Board.resize(newRows, newCols);
        Game.log('Architect! Board redesigned.');
      }
    },
    {
      id: 'wild-card',
      name: 'WILD CARD',
      category: 'LEGENDARY',
      rarity: 'legendary',
      desc: 'Play any card from your discard pile',
      effect: (game) => {
        // In a full implementation, would show discard pile
        Game.log('Wild Card! Draw from discard.');
      }
    },
    {
      id: 'duel',
      name: 'DUEL',
      category: 'LEGENDARY',
      rarity: 'legendary',
      desc: 'Simultaneous square pick contest',
      effect: (game) => {
        Game.log('Duel! Both players pick squares simultaneously.');
      }
    }
  ],

  // Initialize card system
  init() {
    this.state = {
      decks: [
        { name: 'P1', cards: [], discard: [] },
        { name: 'P2', cards: [], discard: [] }
      ],
      hands: [null, null],
      drawCount: 0
    };

    this.createDecks();
    this.drawStartingHands();
  },

  // Create full 30-card decks for each player
  createDecks() {
    const shuffledCards = [...this.allCards].sort(() => Math.random() - 0.5);

    // Each player gets 30 cards from the pool
    const p1Cards = shuffledCards.slice(0, 30);
    const p2Cards = shuffledCards.slice(30, 60); // Take next 30

    this.state.decks[0].cards = p1Cards;
    this.state.decks[1].cards = p2Cards;
    this.state.decks[0].discard = [];
    this.state.decks[1].discard = [];

    Game.log('Decks created!');
  },

  // Draw starting hands (3 cards each)
  drawStartingHands() {
    this.drawCards(0, 3);
    this.drawCards(1, 3);

    this.renderHands();
    Game.log('Starting hands drawn!');
  },

  // Draw cards for player
  drawCards(playerIndex, count) {
    const deck = this.state.decks[playerIndex];
    const hand = this.state.hands[playerIndex];

    for (let i = 0; i < count; i++) {
      if (deck.cards.length > 0) {
        const card = deck.cards.pop();
        card.position = i;
        hand.push(card);
      } else if (deck.discard.length > 0) {
        // Draw from discard
        const card = deck.discard.pop();
        card.position = i;
        hand.push(card);
      }
    }

    this.state.drawCount += count;
  },

  // Draw 1 card per turn
  drawCard(playerIndex) {
    const deck = this.state.decks[playerIndex];
    const hand = this.state.hands[playerIndex];

    if (deck.cards.length > 0) {
      const card = deck.cards.pop();
      card.position = hand.length;
      hand.push(card);
      this.state.drawCount++;
    } else if (deck.discard.length > 0) {
      const card = deck.discard.pop();
      card.position = hand.length;
      hand.push(card);
      this.state.drawCount++;
    }
  },

  // Play a card
  playCard(playerIndex, cardIndex) {
    const hand = this.state.hands[playerIndex];
    const card = hand[cardIndex];

    if (card) {
      // Remove from hand
      hand.splice(cardIndex, 1);

      // Render empty slot
      const handEl = document.getElementById(`p${playerIndex + 1}-hand`);
      const emptySlot = document.createElement('div');
      emptySlot.className = 'empty-slot';
      emptySlot.textContent = 'Draw';
      emptySlot.dataset.position = cardIndex;
      handEl.insertBefore(emptySlot, handEl.firstChild);

      // Apply card effect
      card.effect(Game);

      // Draw replacement card
      this.drawCard(playerIndex);
    }
  },

  // Get adjacent squares for CLONE effect
  getAdjacentSquares() {
    const board = Game.state.board;
    const rows = Board.size.rows;
    const cols = Board.size.cols;

    const adjacent = {
      0: [1, 3, 4],      // Top-left
      1: [0, 2, 4, 5],   // Top-middle
      2: [1, 3, 5],      // Top-right
      3: [0, 4, 6, 7],   // Middle-left
      4: [1, 2, 3, 5, 6, 7], // All connected
      5: [1, 2, 4, 7, 8], // Middle-right
      6: [3, 4, 7],      // Bottom-left
      7: [4, 5, 6, 8],   // Bottom-middle
      8: [5, 7]          // Bottom-right
    };

    return adjacent;
  },

  // Render card hands
  renderHands() {
    const hands = [
      document.getElementById('p1-hand'),
      document.getElementById('p2-hand')
    ];

    hands.forEach((handEl, playerIndex) => {
      handEl.innerHTML = '';

      const hand = this.state.hands[playerIndex];

      if (!hand) {
        return;
      }

      hand.forEach((card, index) => {
        const cardEl = this.createCardElement(card, playerIndex, index);
        handEl.appendChild(cardEl);
      });

      // Add empty slots for played cards
      for (let i = hand.length; i < 3; i++) {
        const emptySlot = document.createElement('div');
        emptySlot.className = 'empty-slot';
        emptySlot.textContent = 'Draw';
        emptySlot.dataset.position = i;
        handEl.appendChild(emptySlot);
      }
    });
  },

  // Create card DOM element
  createCardElement(card, playerIndex, position) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    if (card.rarity === 'legendary') {
      cardEl.classList.add('legendary');
    }
    if (card.category === 'OPPONENT' || card.category === 'WIN') {
      cardEl.classList.add('reaction');
    }

    cardEl.dataset.position = position;
    cardEl.dataset.player = playerIndex;

    // Card HTML
    cardEl.innerHTML = `
      <div class="card-category">${card.category}</div>
      <div class="card-name">${card.name}</div>
      <div class="card-sigil">${this.generateSigil(card)}</div>
      <div class="card-desc">${card.desc}</div>
      <div class="card-rarity rarity-${card.rarity}">${card.rarity.toUpperCase()}</div>
    `;

    // Card click handler
    cardEl.addEventListener('click', () => {
      this.handleCardClick(card, playerIndex, position);
    });

    return cardEl;
  },

  // Generate ASCII sigil for card
  generateSigil(card) {
    // Simple sigil generation based on card name
    const initials = card.name.split(' ').map(n => n[0]).join('').slice(0, 3).toUpperCase();
    const frame = [
      '┌─────┐',
      `│ ${initials.padEnd(3)} │`,
      '├─────┤',
      `│     │`,
      '└─────┘'
    ];
    return frame.join('\n');
  },

  // Handle card click (open modal)
  handleCardClick(card, playerIndex, position) {
    if (Game.state.phase !== 'PLAY' || !Game.state.isPlayerTurn) {
      return;
    }

    const modal = document.getElementById('card-modal');
    document.getElementById('modal-card-name').textContent = card.name;
    document.getElementById('modal-card-desc').textContent = card.desc;
    document.getElementById('modal-card-art').textContent = this.generateSigil(card);

    // Clear modal
    const effectText = document.getElementById('modal-card-effect');
    if (effectText) {
      effectText.textContent = `Effect: ${card.effect}`;
    }

    modal.showModal();

    // Confirm button handler
    const confirmBtn = document.getElementById('modal-confirm-btn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        // Check if card can be played (e.g., reaction card on opponent's turn)
        const hand = this.state.hands[playerIndex];
        const cardInHand = hand[position];

        if (cardInHand) {
          // Remove from hand
          hand.splice(position, 1);

          // Render empty slot
          const handEl = document.getElementById(`p${playerIndex + 1}-hand`);
          const emptySlot = document.createElement('div');
          emptySlot.className = 'empty-slot';
          emptySlot.textContent = 'Draw';
          emptySlot.dataset.position = position;
          handEl.insertBefore(emptySlot, handEl.firstChild);

          // Apply effect
          card.effect(Game);

          // Draw replacement
          this.drawCard(playerIndex);

          // Close modal
          modal.close();
          this.renderHands();
        }
      });
    }

    // Cancel button handler
    const cancelBtn = document.getElementById('modal-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        modal.close();
      });
    }
  }
};

// Initialize cards when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Cards.init());
} else {
  Cards.init();
}
